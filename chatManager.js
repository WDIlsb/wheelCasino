const keyboardManager = require("./keyboardManager");
const { ChatModel } = require("./dbModels");
const { numberWithSpace, formClick } = require("./tools");
const { createVkPay } = require("./vkCoinManager");

async function chatManager(msg) {

  if (msg.messagePayload) return payloadManager(msg);
  if (msg?.text?.includes('меню')) msg.send('Меню', {
    keyboard: keyboardManager('chat')
  })

}


async function payloadManager(msg) {
  const { command } = msg.messagePayload;
  const commands = {
    'profile': async () => {
      msg.reply(`Выиграно: ${numberWithSpace(msg.dbUser.totalWin)} коинов.\nВаше место в топе: ${await getPlaceInTop(msg.senderId)}`)
    },

    'balance': () => msg.reply(`${formClick(msg.senderId, msg.dbUser.name)}, твой баланс: ${numberWithSpace(msg.dbUser.balance)} коинов`),


    'vivod': () => {
      // Id, выведено 000 000 000 коинов.
      msg.reply(`тут типо Id, выведено ${msg.dbUser.balance} коинов.`)
    },

    'fill': async () => {
      const amountFill = await msg.question('Ввведите сумму для пополнения');
      console.log(amountFill);
      if (!amountFill.text || !/^\d+$/.test(amountFill.text)) {
        return msg.reply('Вы ввели некорректное значение.')
      }
      return msg.reply(`Переходите для оплаты: ${createVkPay(Number(amountFill.text) * 1000)}`)

    },


    'activeFree': () => {
      ChatModel.findOneAndUpdate({
        id: msg.peerId
      }, {
        $set: {
          isActive: 1
        }
      })
      msg.send('✅ Беседа успешно активирована.\nДля удобной игры назначь бота администратором.\nУдачной игры!', {
        keyboard: keyboardManager('chat')
      })
    },
    'activePay': async () => {
      const { botVk } = require("./wheel");
      const { makePayment } = require('./qiwiManager');
      const shortLink = await botVk.api.utils.getShortLink({
        url: makePayment(50, msg.peerId)
      })
      msg.reply(shortLink.short_url)
    },
    



  }

  if (commands[command]) {
    commands[command]()
  }
}


module.exports = chatManager;