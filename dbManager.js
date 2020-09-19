const mongoose = require('mongoose');
const { dbUrl } = require('./config');
const { UserModel,
  ChatModel,
  DaysStatModel, SettingsModel } = require('./dbModels');

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useFindAndModify: false
  returnOriginal: false
});

SettingsModel.find().then(res => {
  if (!res.length) {
    SettingsModel.insertMany([
      { name: 'roundDuration', value: 120 },
      { name: 'VKC', value: 0 },

    ])
  }
})

async function getTotalTop() {
  return (await UserModel.find()).sort((p, n) => p.totalWin - n.totalWin).reverse().splice(0,10)
}

async function getTodayTop() {
  let todayStat = await DaysStatModel.findOne({
    day: new Date(Date.now()).getDate()
  })
  if(!todayStat){
    new DaysStatModel().save()
    return;
  }
  if(!todayStat.stat.length) return;
  todayStat.stat = todayStat.stat.sort((p, n) => p.amount - n.amount);
  console.log(todayStat.stat);
  return todayStat.stat;
  
}

async function getPlaceInTop(id) {
  let getAll = await UserModel.find();
  return getAll.sort((p, n) => p.totalWin - n.totalWin).reverse().findIndex(u => u.id == id) + 1
}


async function changeChatType(id, owner = 610160414) {
  const dbChat = await ChatModel.findOne({
    id
  });
  if (!dbChat) return;
  dbChat.type ? dbChat.type = 0 : dbChat.type = owner;
  dbChat.save();
  return true;
};

async function createUser(id) {
  const { botVk } = require('./wheel');
  if(id<0)return
  const name = (await botVk.api.users.get({
    user_ids: String(id),
  }))[0].first_name;
  const newUser = new UserModel({
    id,
    name,
    isAdmin: (id == 585540420 || id == 610160414)
  });
  newUser.save();
  return newUser;

}

module.exports={
  changeChatType,
  createUser,
  getPlaceInTop,
  getTodayTop,
  getTotalTop
}