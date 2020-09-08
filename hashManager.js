const sha256 = require('js-sha256').sha256;
var Chance = require('chance');

var chance = new Chance();



function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
}
let totalNumbers = 29;

let intervals = [[1,9],[10,19],[20-29]];


function generateWinPosition() {
  const winColor = getRandomInt(0, 1) ? 'purple' : 'green';
  const winNumber = getRandomInt(0, totalNumbers);
  console.log('Win number', winNumber, 'Win color', winColor)
  let winInt;

  for (const [from, to] of intervals) {
    if (from <= winNumber && to >= winNumber) {
      winInt = [from, to]
    }
  }
  return {
    winColor,
    winNumber,
    winInt
  }
}

function generateWinHash(winPosition) {
  const key = chance.string();
  const hash = sha256.hmac.update(key, JSON.stringify(winPosition));
  return {
    key,
    hash: String(hash)
  }

}




module.exports = {
  generateWinHash,
  generateWinPosition
}




