export default async function handler(req, res) {

const response = await fetch("https://api.asaas.com/v3/payments", {

method: "POST",

headers: {
"Content-Type": "application/json",
"access_token": process.env.ASAAS_KEY
},

body: JSON.stringify({
billingType: "PIX",
value: req.body.valor,
dueDate: new Date().toISOString().split("T")[0],
description: req.body.descricao
})

});

const data = await response.json();

res.status(200).json(data);

}