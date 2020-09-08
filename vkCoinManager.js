const axios = require('axios');
const vkCoinToken = 'IyQEafOZJESjlw*yv;Xf[45Yo-mYUi-J6IAJX;OWU=sXi_N8C,';

const { PaymentModel, UserModel } = require('./dbModels');
const { numberWithSpace } = require('./tools');



function createVkPay(summ) {
    return `vk.com/coin#x297789589_${summ}_888`
}

async function vkCoinHistory() {
    let { data } = await axios.post('https://coin-without-bugs.vkforms.ru/merchant/tx/', {
        merchantId: 297789589,
        key: vkCoinToken,
        tx: [1]
    })
    return data.response;
};

async function getVkBalance() {
    let { data } = await axios.post('https://coin-without-bugs.vkforms.ru/merchant/score/', {
        merchantId: 297789589,
        key: vkCoinToken,
        userIds: [297789589]
    })
    return Math.floor(data.response[297789589] / 1000);
}


setInterval(async () => {


    let [paymentsList, vkCoinTrans] = await Promise.all([PaymentModel.find({}), vkCoinHistory()]);
    if (paymentsList.length) {
        paymentsList = paymentsList.map(trans => trans.id)
    }

    vkCoinTrans.forEach(async (trans) => {
        if (trans.type == 4 && trans.payload && trans.payload == 888 && !paymentsList.includes(trans.id)) {
            if (!paymentsList.includes(trans.id)) {
                console.log(trans);
                const { botVk } = require('./wheel');

                console.log('Новый перевод!');


                UserModel.find({
                    idAdmin: true
                }).then(res => {
                    res.forEach(p => {
                        botVk.api.messages.send({
                            peer_id: p.id,
                            message: `@id${trans.from_id}(${trans.from_id}) закинул ${trans.amount} vkCoin`,
                            random_id: 0

                        })
                    })
                })

                UserModel.findOneAndUpdate({
                    id: trans.from_id,
                }, {
                    $inc: {
                        balance: Math.round(trans.amount / 1000)

                    }
                }).then(res=>{
                    console.log(res);
                })
                new PaymentModel({
                    id: trans.id,
                    from: trans.from_id,
                    date: trans.created_at,
                    summ: trans.amount

                }).save()

                botVk.api.messages.send({
                    peer_id: trans.from_id,
                    message: `✅ Баланс пополнен на ${numberWithSpace(trans.amount / 1000)} коинов.`,
                    random_id: 0

                })

      

      


            }
        }
    })


},10000)

async function sendVk(toId, amount) {
    axios.post('https://coin-without-bugs.vkforms.ru/merchant/send/', {
        merchantId: 297789589,
        key: vkCoinToken,
        toId,
        amount
    }).then(res => console.log(res.data))
}


module.exports = {
    getVkBalance,
    vkCoinHistory,
    createVkPay,
    sendVk
}