const axios = require('axios');



// 670ea7dfefe289795c89f4530c0d7547



const token = 'db1dd951fbcfb4b0efc8a3d0d71fa43b';
const number = 79858113768;

async function getQiwi() {
    let res = await axios({
        method: 'GET',
        url: `https://edge.qiwi.com/payment-history/v2/persons/${number}/payments?rows=10&operation=IN`,
        // url: `https://edge.qiwi.com/funding-sources/v2/persons/79858113768/accounts`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    // console.log(res.data.accounts);
    const lastTrans = res.data.data;
    let transactions = lastTrans.map(trans => `id: ${trans.txnId} | Date: ${trans.date} | Status: ${trans.status} | Summ: ${trans.total.amount} | Comm: ${trans.comment} | From: ${trans.account}`);
    let sysTrans = lastTrans.map(({
        txnId,
        date,
        status,
        total,
        comment,
        account
    }) => ({
        id: txnId,
        from: account,
        summ: total.amount,
        date,
        status,
        comment
    }))
    return sysTrans

}

// getQiwi().then(console.log)

module.exports = {
    getQiwi
}

const makePayment = (summ, comm) => `https://qiwi.com/payment/form/99?extra%5B%27account%27%5D=${number}&amountInteger=${summ}&amountFraction=0&extra%5B%27comment%27%5D=${comm}&currency=643&blocked[0]=account&blocked[1]=sum&blocked[2]=comment`

module.exports ={
  makePayment,
  getQiwi
}