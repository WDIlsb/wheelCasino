const mongoose = require('mongoose');


const Schema = mongoose.Schema;

const UserModel = mongoose.model('User',new Schema({
  id: Number,
  name: String,
  balance: {type: Number,default: 0},
  totalWin: {type: Number,default: 0},
  isAdmin: {type: Boolean, default: false}
}));


const ChatModel = mongoose.model('Chat',new Schema({
  id: Number,
  type: {type: Number,default:0},
  isActive: {type: Number,default:0}
}))

const PaymentModel = mongoose.model('Payment',new Schema(
  {
    id: Number,
    from: Number,
    date: Number,
    summ: Number
  }
));

const DaysStatModel = mongoose.model('Stat',new Schema(
  {
    day: {type: Number,default: new Date(Date.now()).getDate()},
    stat: {type: Array, default: []}
  }
));

const SettingsModel = mongoose.model('Settings',new Schema(
  {
    name: String,
    value: Number
  }
));

module.exports = {
  UserModel,
  ChatModel,
  DaysStatModel,
  SettingsModel
}

