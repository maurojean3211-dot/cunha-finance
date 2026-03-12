export default async function handler(req, res) {

res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");

if (req.method === "OPTIONS") {
return res.status(200).end();
}

if (req.method !== "POST") {
return res.status(405).json({ erro: "Método não permitido" });
}

try {

// ============================
// BUSCAR CLIENTE PELO CPF
// ============================

const buscarCliente = await fetch("https://api.asaas.com/v3/customers?cpfCnpj=00307549682", {
method: "GET",
headers: {
"access_token": process.env.ASAAS_API_KEY
}
});

const cliente = await buscarCliente.json();

if(!cliente.data || cliente.data.length === 0){
return res.status(400).json({
erro: "Cliente não encontrado no Asaas"
});
}

const customerId = cliente.data[0].id;


// ============================
// CRIAR COBRANÇA PIX
// ============================

const criarPagamento = await fetch("https://api.asaas.com/v3/payments", {
method: "POST",
headers: {
"Content-Type": "application/json",
"access_token": process.env.ASAAS_API_KEY
},
body: JSON.stringify({
customer: customerId,
billingType: "PIX",
value: Number(req.body.valor),
description: req.body.descricao,
dueDate: new Date().toISOString().split("T")[0]
})
});

const pagamento = await criarPagamento.json();

if(pagamento.errors){
return res.status(400).json(pagamento);
}


// ============================
// GERAR QR CODE
// ============================

const pixQr = await fetch(`https://api.asaas.com/v3/payments/${pagamento.id}/pixQrCode`, {
headers: {
"access_token": process.env.ASAAS_API_KEY
}
});

const qr = await pixQr.json();

return res.status(200).json({
pixCopiaECola: qr.payload,
qrCode: qr.encodedImage
});

} catch(error){

return res.status(500).json({
erro: "Erro ao gerar PIX",
detalhe: error.message
});

}

}