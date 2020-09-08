const keyboardManager = require("./keyboardManager");
const { ChatModel, SettingsModel } = require("./dbModels");
const { numberWithSpace, formClick } = require("./tools");
const { createVkPay } = require("./vkCoinManager");
const { getCurrentGames, manageBet } = require("./gameManager");

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


    'vivod': async() => {
      // Id, выведено 000 000 000 коинов.
      const VKCLimit = await SettingsModel.findOne({
        name: 'VKC'
      })
      if(msg.dbUser.balance>VKCLimit.value) return msg.send(`${formClick(msg.senderId,msg.dbUser.name)}, резерв бота недостаточный! Ожидайте пополнения.`);
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
      if (!currGames.length || !currGames.find(g => g.chatId == msg.peerId)) return msg.reply('Сделайте ставку, чтобы начать игру');
      let thisGame = currGames.find(g => g.chatId == msg.peerId);
      let f = [...thisGame.bets]
      const totalSumm = f.map(b=>b.amount).reduce((p,n)=>p+n);
      let readyInfo = `Всего поставлено: ${numberWithSpace(totalSumm)} коинов.\n\n`;
      const typeNames = {
        'even': 'Чётное',
        'odd': 'нечётное',
        'purple': 'фиолетовое',
        'green': 'зелёное',
        'interval': 'промежуток',
        'onNumber': 'число',
        'color': 'цвет'
      }
      let groups = [];
      thisGame.bets.forEach(bet => {
        if(groups.find(n=>n[0]==bet.type)){
          groups.find(n=>n[0]==bet.type)[1].push(bet)
        }else{
          groups.push([bet.type,[bet]])
        }
        
      });
      groups.forEach(group=>{
        readyInfo+=`Ставки на ${typeNames[group[0]]}:\n`
        group[1].forEach(bet=>{
          readyInfo+=`${formClick(bet.persId)} - ${numberWithSpace(bet.amount)}\n`
        })
      })
      readyInfo+=`\nХэш игры: ${thisGame.winHash.hash}\n\nДо конца ${Math.round(thisGame.last/1000)} сек`;
      console.log(readyInfo);
      msg.send(readyInfo)
    },

    'color': (color) => {
      console.log(color);
      return msg.send(manageBet({
        chatId: msg.peerId,
        persId: msg.senderId,
        type: 'color',
        value: color,
        amount: betAmount
      }))
    },

    'interval': (interval) => {
      console.log(interval);
      return msg.send(manageBet({
        chatId: msg.peerId,
        persId: msg.senderId,
        type: 'intervals',
        value: interval,
        amount: betAmount
      }))

    },

    'onNumber': async() => {
      let number = await msg.question('Выбери число от 1 до 29');
      if (!number.text || !/^\d+$/.test(number.text)) {
        return msg.reply('Вы ввели некорректное значение.')
      }
      number = Number(number.text);
      return msg.send(manageBet({
        chatId: msg.peerId,
        persId: msg.senderId,
        type: 'onNumber',
        value: number,
        amount: betAmount
      }))


    },

    'even': () => {

      return msg.send(manageBet({
        chatId: msg.peerId,
        persId: msg.senderId,
        type: 'even',
        amount: betAmount
      }))


    },

    'odd': () => {
      return msg.send(manageBet({
        chatId: msg.peerId,
        persId: msg.senderId,
        type: 'odd',
        amount: betAmount
      }))
    },
  }

  if (command != 'bank') {
    if (!msg.dbUser.balance) {
      return msg.reply('На твоём балансе нет коинов для ставки')
    }

    let askBet = await msg.question('Введите сумму для ставки');
    if (!askBet.text || !/^\d+$/.test(askBet.text)) {
      return msg.reply('Вы ввели некорректное значение.')
    }
    askBet=Number(askBet.text);
    if(askBet>msg.dbUser.balance){
      return msg.reply('На твоём балансе нет такой суммы')
    }
    betAmount=askBet;
  }



  if (command.includes('-')) return gameCommands['interval'](command);
  if (command == 'purple' || command == 'green') return gameCommands['color'](command);
  return gameCommands[command]();
}


module.exports = chatManager;