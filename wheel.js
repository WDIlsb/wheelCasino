const { VK, Keyboard } = require('vk-io');
const { groupToken, groupId } = require('./config');

const { QuestionManager } = require('vk-io-question');
const { createUser } = require('./dbManager');
const keyboardManager = require('./keyboardManager');
const { UserModel, ChatModel } = require('./dbModels');
const lsManager = require('./lsManager');
const chatManager = require('./chatManager');


const botVk = new VK({
  token: groupToken,
  pollingGroupId: groupId
})
const { updates } = botVk;
const questionManager = new QuestionManager();

botVk.updates.use(questionManager.middleware);


updates.startPolling()


updates.on(['chat_invite_user'], async (context, next) => {
  console.log(context);
  if (context.eventMemberId == -groupId) {
    let isChat = await ChatModel.findOne({
      id: context.peerId,
    })
    if (!isChat) {
      new ChatModel({
        id: context.peerId

      }).save()
    }
    context.send(`Привет!
      Ты можешь активировать бесплатную беседу, либо купить VIP - 50 р.
      Преимущество VIP: 2% со всех ставок идёт на твой баланс.\n\nВЫДАЙТЕ МНЕ АДМИНКУ ДЛЯ КОРРЕКТНОЙ РАБОТЫ`, {
      keyboard: Keyboard.keyboard([
        [Keyboard.textButton({
          label: 'Бесплатная беседа',
          payload: {
            command: 'activeFree'
          },
        })],
        [Keyboard.textButton({
          label: 'VIP Беседа',
          payload: {
            command: 'activePay'
          },
        })]
      ])
    })
    console.log('new chat');
    return
  }



})


updates.use(async (context, next) => {

  console.log(context);

  let isUser = await UserModel.findOne({
    id: context.senderId
  })

  if (!isUser) {
    if (context.peerType == 'user') {
      context.send(`Приветствую!
          Это классическая рулетка на VKC.
          Смотри на кнопки ниже, чтобы получить больше информации.`, {
        keyboard: keyboardManager('ls')
      })
    }


    createUser(context.senderId)
    return;
  }


  if (context.text && context.text.toLowerCase() == 'админка' && isUser.isAdmin) {
    context.send('Админка', {
      keyboard: keyboardManager('admin')
    })
    return;
  }

  if(context.messagePayload && context.messagePayload.command =='back'){
    return context.reply('Меню',{
      keyboard: keyboardManager(context.peerType == 'user' ? 'ls' : 'chat')
    })
  }


  context.dbUser = isUser;
  next()
})


updates.on('message', async (message) => {
  if (message.peerType == 'user') return lsManager(message);
  chatManager(message)
})


module.exports = {
  botVk
}
