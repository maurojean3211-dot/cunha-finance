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
return res.status(400).json({
erro: "Valor inválido"
});
}

const cpf = "00307549682";
let customerId = null;

// ==========================
// API HOMOLOGAÇÃO ASAAS
// ==========================

const API = "https://api-sandbox.asaas.com/v3";

// ==========================
// BUSCAR CLIENTE EXISTENTE
// ==========================

const buscaReq = await fetch(`${API}/customers?cpfCnpj=${cpf}`, {
method: "GET",
headers: {
"accept": "application/json",
"access_token": process.env.ASAAS_API_KEY
}
});

const buscaCliente = await buscaReq.json();

if (buscaCliente?.data && buscaCliente.data.length > 0) {

customerId = buscaCliente.data[0].id;

} else {

// ==========================
// CRIAR CLIENTE
// ==========================

const clienteReq = await fetch(`${API}/customers`, {
method: "POST",
headers: {
"Content-Type": "application/json",
"access_token": process.env.ASAAS_API_KEY
},
body: JSON.stringify({
name: nome,
cpfCnpj: cpf,
email: "teste@email.com"
})
});

const cliente = await clienteReq.json();

console.log("CLIENTE CRIADO:", cliente);

if (cliente.errors) {
return res.status(400).json({
erro: "Erro ao criar cliente",
detalhe: cliente.errors
});
}

customerId = cliente?.id;

}

if (!customerId) {
return res.status(400).json({
erro: "Customer não encontrado ou criado"
});
}

// ==========================
// CRIAR COBRANÇA PIX
// ==========================

const pagamentoReq = await fetch(`${API}/payments`, {
method: "POST",
headers: {
"Content-Type": "application/json",
"access_token": process.env.ASAAS_API_KEY
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

console.log("PAGAMENTO:", pagamento);

if (pagamento.errors) {
return res.status(400).json({
erro: "Erro ao criar cobrança PIX",
detalhe: pagamento.errors
});
}

if (!pagamento.id) {
return res.status(400).json({
erro: "Pagamento não retornou ID",
pagamento
});
}

// ==========================
// BUSCAR QR CODE PIX
// ==========================

let qr = null;

for (let i = 0; i < 5; i++) {

const qrReq = await fetch(`${API}/payments/${pagamento.id}/pixQrCode`, {
method: "GET",
headers: {
"accept": "application/json",
"access_token": process.env.ASAAS_API_KEY
}
});

qr = await qrReq.json();

console.log("TENTATIVA QR:", i + 1, qr);

if (qr?.payload || qr?.encodedImage) {
break;
}

await new Promise(r => setTimeout(r, 800));

}

const pixCopiaECola = qr?.payload || null;
const qrCode = qr?.encodedImage || null;

if (!pixCopiaECola && !qrCode) {
return res.status(400).json({
erro: "PIX gerado mas QR não retornado",
qr
});
}

return res.status(200).json({
pixCopiaECola,
qrCode,
pagamentoId: pagamento.id
});

} catch (error) {

console.log("ERRO PIX:", error);

return res.status(500).json({
erro: "Erro ao gerar PIX",
detalhe: error.message
});

}

}
