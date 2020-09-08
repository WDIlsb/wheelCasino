const numberWithSpace = number => number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, " ");

const formClick = (id, text = id) => `@id${id}(${text})`;

const DELAY = (ms) => new Promise(res => setTimeout(res, ms));




module.exports = {
  numberWithSpace,
  formClick,
  DELAY
}
