export default async function handler(req, res) {

res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");

if (req.method === "OPTIONS") {
return res.status(200).end();
}

try {

const createPayment = await fetch("https://api.asaas.com/v3/payments", {
method: "POST",
headers: {
"Content-Type": "application/json",
"access_token": process.env.ASAAS_API_KEY
},
body: JSON.stringify({
billingType: "PIX",
value: req.body.valor,
description: req.body.descricao,
dueDate: new Date().toISOString().split("T")[0]
})
});

const payment = await createPayment.json();

const pixQr = await fetch(`https://api.asaas.com/v3/payments/${payment.id}/pixQrCode`, {
headers: {
"access_token": process.env.ASAAS_API_KEY
}
});

const qr = await pixQr.json();

return res.status(200).json({
id: payment.id,
pixCopiaECola: qr.payload,
qrCode: qr.encodedImage
});

} catch (error) {

return res.status(500).json({
erro: "Erro ao gerar PIX",
detalhe: error.message
});

}

}