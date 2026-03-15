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

const API = "https://api-sandbox.asaas.com/v3";

const nome = "Cliente Teste";
const cpf = "12345678909"; // CPF válido de teste
const valor = 10;


// =========================
// CRIAR CLIENTE
// =========================

const clienteResponse = await fetch(`${API}/customers`, {
method: "POST",
headers: {
"Content-Type": "application/json",
"access_token": process.env.ASAAS_API_KEY
},
body: JSON.stringify({
name: nome,
cpfCnpj: cpf
})
});

const cliente = await clienteResponse.json();

if (!cliente.id) {
return res.status(400).json({
erro: "Erro ao criar cliente",
detalhe: cliente
});
}

const customerId = cliente.id;


// =========================
// CRIAR COBRANÇA PIX
// =========================

const pagamentoResponse = await fetch(`${API}/payments`, {
method: "POST",
headers: {
"Content-Type": "application/json",
"access_token": process.env.ASAAS_API_KEY
},
body: JSON.stringify({
customer: customerId,
billingType: "PIX",
value: valor,
dueDate: new Date().toISOString().split("T")[0]
})
});

const pagamento = await pagamentoResponse.json();

if (!pagamento.id) {
return res.status(400).json({
erro: "Erro ao criar pagamento",
detalhe: pagamento
});
}


// =========================
// PEGAR QR CODE
// =========================

const qrResponse = await fetch(`${API}/payments/${pagamento.id}/pixQrCode`, {
headers: {
"access_token": process.env.ASAAS_API_KEY
}
});

const qr = await qrResponse.json();

return res.status(200).json({
pixCopiaECola: qr.payload,
qrCode: qr.encodedImage,
pagamentoId: pagamento.id
});

} catch (error) {

return res.status(500).json({
erro: "Erro interno",
detalhe: error.message
});

}

}
