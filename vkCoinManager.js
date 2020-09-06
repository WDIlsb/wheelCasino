const axios = require('axios');
const vkCoinToken = 'IyQEafOZJESjlw*yv;Xf[45Yo-mYUi-J6IAJX;OWU=sXi_N8C,';



function createVkPay(summ) {
    return `vk.com/coin#x297789589_${summ}_888`
}

async function vkCoinHistory() {
    let {data} = await axios.post('https://coin-without-bugs.vkforms.ru/merchant/tx/',{
        merchantId:297789589,
        key:vkCoinToken,
        tx:[1]
    })
    return data.response;
};

async function getVkBalance() {
    let {data} = await axios.post('https://coin-without-bugs.vkforms.ru/merchant/score/',{
        merchantId:297789589,
        key:vkCoinToken,
        userIds: [297789589]
    })
    return Math.floor(data.response[297789589]/1000);
}

async function sendVk(toId,amount) {
    axios.post('https://coin-without-bugs.vkforms.ru/merchant/send/',{
        merchantId:297789589,
        key:vkCoinToken,
        toId,
        amount
    }).then(res=>console.log(res.data))
}


module.exports={
    getVkBalance,
    vkCoinHistory,
    createVkPay,
    sendVk
}