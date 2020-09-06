const numberWithSpace = number => number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, " ");

const formClick = (id, text = id) => `@id${id}(${text})`;



module.exports = {
  numberWithSpace,
  formClick
}
