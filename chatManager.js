const keyboardManager = require("./keyboardManager");
const { ChatModel } = require("./dbModels");
const { numberWithSpace, formClick } = require("./tools");
const { createVkPay } = require("./vkCoinManager");
const { getCurrentGames } = require("./gameManager");

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
    return commands[command]()
  }

  let betAmount=0;

  const gameCommands = {
    'bank': () => {
      let currGames = getCurrentGames();
      if (!currGames.length || !currGames.find(g => g.id == msg.peerId)) return msg.reply('Сделайте ставку, чтобы начать игру')
    },

    'color': (color) => {
      console.log(color);
    },

    'interval': (interval) => {
      console.log(interval);

    },

    'onNumber': () => {
      let number = msg.question('Выбери число от 1 до 29');
      if (!number.text || !/^\d+$/.test(number.text)) {
        return msg.reply('Вы ввели некорректное значение.')
      }
      number = Number(number.text);


    },

    'even': () => {

    },

    'odd': () => {

    },
  }

  if (command != 'bank') {
    if (!msg.dbUser.balance) {
      return msg.reply('На твоём балансе нет коинов для ставки')
    }
  }

  let askBet = msg.question('Введите сумму для ставки');
  if (!askBet.text || !/^\d+$/.test(askBet.text)) {
    return msg.reply('Вы ввели некорректное значение.')
  }
  askBet=Number(askBet.text);
  if(askBet>msg.dbUser.balance){
    return msg.reply('На твоём балансе нет такой суммы')
  }
  betAmount=askBet;

  if (command.includes('-')) return gameCommands['interval'](command);
  if (command == 'purple' || command == 'green') return gameCommands['color'](command);
  return gameCommands[command]();
}


module.exports = chatManager;