const { SettingsModel } = require("./dbModels");

let currentGames = [];

const getCurrentGames = _ => currentGames;

let roundDuration = 120;



function manageBet({ chatId, persId, type, value, amount }) {
  let isGame = currentGames.find(game => game.chatId == chatId);
  if (isGame) {
    if (isGame.bets.find(bet => bet.persId == persId)) {
      return [false, 'Вы уже сделали ставку в этой игре']
    }
    isGame.bets.push({
      persId,
      type,
      value,
      amount,
    })
    return [true]
  }

  currentGames.push({
    chatId,
    last: roundDuration * 1000

  })
}



setInterval(() => {
  SettingsModel.findOne({
    name: 'roundDuration'
  }).then(res => roundDuration = res.value)
}, 20000);


module.exports = {
  getCurrentGames
}