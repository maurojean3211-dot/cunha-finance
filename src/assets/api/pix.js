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

const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

const nome = body?.nome || "Cliente Teste";
const valor = Number(body?.valor || 10);
const descricao = body?.descricao || "Pagamento PIX";

if (valor <= 0) {
return res.status(400).json({ erro: "Valor inválido" });
}

const cpf = "00307549682";
let customerId = null;

// ENDPOINT ASAAS
const API = "https://api.asaas.com/v3";

const buscaReq = await fetch(`${API}/customers?cpfCnpj=${cpf}`, {
method: "GET",
headers: {
accept: "application/json",
access_token: process.env.ASAAS_API_KEY
}
});

const buscaCliente = await buscaReq.json();

if (buscaCliente?.data?.length > 0) {
customerId = buscaCliente.data[0].id;
} else {

const clienteReq = await fetch(`${API}/customers`, {
method: "POST",
headers: {
"Content-Type": "application/json",
access_token: process.env.ASAAS_API_KEY
},
body: JSON.stringify({
name: nome,
cpfCnpj: cpf,
email: "teste@email.com"
})
});

const cliente = await clienteReq.json();

if (cliente.errors) {
return res.status(400).json(cliente);
}

customerId = cliente.id;
}

const pagamentoReq = await fetch(`${API}/payments`, {
method: "POST",
headers: {
"Content-Type": "application/json",
access_token: process.env.ASAAS_API_KEY
},
body: JSON.stringify({
customer: customerId,
billingType: "PIX",
value: valor,
dueDate: new Date().toISOString().split("T")[0],
description: descricao
})
});

const pagamento = await pagamentoReq.json();

if (!pagamento.id) {
return res.status(400).json(pagamento);
}

const qrReq = await fetch(`${API}/payments/${pagamento.id}/pixQrCode`, {
headers: {
access_token: process.env.ASAAS_API_KEY
}
});

const qr = await qrReq.json();

return res.status(200).json({
pixCopiaECola: qr.payload,
qrCode: qr.encodedImage,
pagamentoId: pagamento.id
});

} catch (error) {

return res.status(500).json({
erro: "Erro ao gerar PIX",
detalhe: error.message
});

}

}
