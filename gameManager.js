const { SettingsModel } = require("./dbModels");

let currentGames = [];

const getCurrentGames = _ => currentGames;

let currentLimit = 200;

setInterval(() => {
  SettingsModel.findOne({
    name:roundDuration
  }).then(res=>roundDuration=res.value)
}, 20000);


module.exports = {
  getCurrentGames
}