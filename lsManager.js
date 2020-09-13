const { numberWithSpace, formClick } = require("./tools");
const { getPlaceInTop, getTodayTop, getTotalTop } = require("./dbManager");


async function lsManager(msg) {
  console.log('lsManager', msg);
  if (msg.messagePayload) return payloadManager(msg)

}


async function payloadManager(msg) {
  const { command } = msg.messagePayload;
  const commands = {
    'profile': async () => {
      msg.send(`Выиграно: ${numberWithSpace(msg.dbUser.totalWin)} коинов.\nВаше место в топе: ${await getPlaceInTop(msg.senderId)}`)
    },
    'topDay': async () => {
      let dbStat = await getTodayTop();
      if (!dbStat) return msg.send('Сегодня ещё никто не выигрывал');
      let statText = 'Топ 10 за сегодня:\n';
      dbStat.forEach((pers, index) => {
        statText += `${index + 1}. ${formClick(pers[0],pers[2])} - ${numberWithSpace(pers[1])} VKC\n`

      });
      msg.send(statText)
    },
    'top10': async () => {
      const totalTop = await getTotalTop();
      let statText = 'Топ 10 за всё время:\n';
      totalTop.forEach(({ name, id, totalWin }, index) => {
        statText += `${index + 1}. ${formClick(id, name)} - ${numberWithSpace(totalWin)} VKC\n`

      });
      msg.send(statText)
    },

    'about': () => msg.send(`Классическая рулетка на VKC.\nКоэффициенты ставок:\n\nФиолетовое/зелёное: 2X\nЧетное/нечётное: 2X\nПромежутки: 3X\nНа числа: 10X`),

    'chatList': ()=>msg.send('Заходи в беседы:\n\n#1\nhttps://vk.me/join/AJQ1dypH7BiuvGKGb2hyzDa8')
  }
  if (commands[command]) {
    commands[command]()
  }
}


module.exports = lsManager;