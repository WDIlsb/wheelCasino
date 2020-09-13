const { VK, Keyboard } = require('vk-io');
const { groupToken, groupId } = require('./config');

const { QuestionManager } = require('vk-io-question');
const { createUser, changeChatType } = require('./dbManager');
const keyboardManager = require('./keyboardManager');
const { UserModel, ChatModel, SettingsModel } = require('./dbModels');
const lsManager = require('./lsManager');
const chatManager = require('./chatManager');
const { DELAY } = require('./tools')

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

  if (context.messagePayload && context.messagePayload.command == 'back') {
    return context.reply('Меню', {
      keyboard: keyboardManager(context.peerType == 'user' ? 'ls' : 'chat')
    })
  }


  if (context.messagePayload && context.messagePayload.command.startsWith('adm')) {
    if (!isUser.isAdmin) return;
    const { command } = context.messagePayload;
    if (command == 'admBalance') {
      let link = await context.question('Ссылку на человека');
      link = (await botVk.api.utils.resolveScreenName({
        screen_name: link.text.split('vk.com/')[1]
      })).object_id;

      if (!link) {
        return context.send('Некорректная ссылка')

      }
      console.log(link);
      const newBalance = await context.question('Теперь введите новый баланс');

      UserModel.findOneAndUpdate({
        id: Number(link)
      }, {
        $set: { balance: Number(newBalance.text) }
      }).then(res => console.log(res))

    }

    if (command == 'admChatType') {
      changeChatType(context.peerId)
      context.send('Изменён')
    }

    if (command == 'admMailing') {
      const allUsers = (await UserModel.find()).map(u => u.id);
      const messageTosend = await context.question(`Следующее ваше сообщение увидит ${allUsers.length} чел.`, {
        keyboard: Keyboard.keyboard([[Keyboard.textButton({
          label: 'Отмена',
          payload: {
            command: 'back'
          }
        })]])
      });
      if (messageTosend.text.includes('Отмена')) {
        return msg.send('Рассылка отменена', {
          keyboard: keyboardManager('admin')
        })
      }

      context.reply('Начинаю рассылку....', {
        keyboard: keyboardManager('admin')

      });
      let attAdd = [];

      if (messageTosend.attachments) {
        messageTosend.attachments.forEach(att => {
          attAdd.push(String(att))
        })
      }

      for (const peer_id of allUsers) {
        botVk.api.messages.send({
          peer_id,
          message: messageTosend.text ? messageTosend.text : '/',
          attachment: attAdd.join(','),
          random_id: 0
        })
        await DELAY(50)
      }
    }

    if (command == 'admRoundDuration') {
      const newTime = await context.question('Введите новую длительность раунда в секундах')
      SettingsModel.findOneAndUpdate({
        name: 'roundDuration'
      }, {
        $set: {
          value: Number(newTime.text)
        }
      }).then(_ => context.send('Теперь раунд будет длиться ' + newTime.text + ' сек'))

    }

    if (command == 'admSetVKC') {
      let limitNow = await SettingsModel.findOne({
        name: 'VKC'
      })
      const newLimit = await context.question(`На балансе доступно ${limitNow.value} VKC, введите новый лимит`)
      SettingsModel.findOneAndUpdate({
        name: 'VKC'
      }, {
        $set: {
          value: Number(newLimit.text)
        }
      }).then(_ => context.send(`Теперь лимит составлят ${newLimit.text} VKC`))

    }





    return

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
