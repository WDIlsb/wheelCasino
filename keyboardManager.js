const { Keyboard } = require('vk-io');

function keyboardManager(name) {
  const makeButton = (label, command, color = Keyboard.SECONDARY_COLOR) => Keyboard.textButton({
    label,
    payload: {
      command
    },
    color
  })


  const kbList = {
    'admin': Keyboard.keyboard([
      [makeButton('Установить баланс', 'admBalance')],
      [makeButton('Рассылка', 'admMailing')],
      [makeButton('Тип беседы', 'admChatType')],
      [makeButton('Время раунда', 'admRoundDuration')],
      [makeButton('Назад', 'back')],


    ]),

    'ls': Keyboard.keyboard([
      [makeButton('Профиль', 'profile', Keyboard.POSITIVE_COLOR)],
      [makeButton('Топ дня', 'topDay', Keyboard.NEGATIVE_COLOR), makeButton('Топ 10 игроков', 'top10')],
      [Keyboard.urlButton({
        label: 'Магазин',
        url: 'https://vk.com/buy_sell_vkc'
      })],
      [makeButton('Беседы', 'chatList'), makeButton('О игре', 'about', Keyboard.NEGATIVE_COLOR)],

    ]),

    'chat': Keyboard.keyboard([
      [makeButton('Банк', 'bank', Keyboard.NEGATIVE_COLOR), makeButton('Баланс', 'balance', Keyboard.NEGATIVE_COLOR)],
      [makeButton('1-9', '1-9'), makeButton('10-19', '10-19'), makeButton('20-29', '20-29')],
      [makeButton('Фиолетовое', 'purple', Keyboard.PRIMARY_COLOR), makeButton('На число', 'onNumber', Keyboard.NEGATIVE_COLOR), makeButton('Зелёное', 'green', Keyboard.PRIMARY_COLOR)],
      [makeButton('Чётное', 'even', Keyboard.PRIMARY_COLOR), makeButton('Нечётное', 'odd', Keyboard.PRIMARY_COLOR)],
      [Keyboard.urlButton({
        label: 'Пополнить',
        url: `https://vk.com/coin#x297789589_1000000_888_1`
      }), makeButton('Вывести', 'vivod', Keyboard.POSITIVE_COLOR)],

    ]
    )
  }



  return kbList[name];

}

module.exports = keyboardManager;