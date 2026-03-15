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

const API = "https://api-sandbox.asaas.com/v3";


// ==========================
// CRIAR CLIENTE
// ==========================

const clienteReq = await fetch(`${API}/customers`, {
method:"POST",
headers:{
"Content-Type":"application/json",
"access_token":process.env.ASAAS_API_KEY
},
body:JSON.stringify({
name:nome,
cpfCnpj:"12345678909"
})
});

const cliente = await clienteReq.json();

if(!cliente.id){
return res.status(400).json({
erro:"Erro ao criar cliente",
cliente
});
}

const customerId = cliente.id;


// ==========================
// CRIAR PAGAMENTO PIX
// ==========================

const pagamentoReq = await fetch(`${API}/payments`,{
method:"POST",
headers:{
"Content-Type":"application/json",
"access_token":process.env.ASAAS_API_KEY
},
body:JSON.stringify({
customer:customerId,
billingType:"PIX",
value:valor,
dueDate:new Date().toISOString().split("T")[0],
description:descricao
})
});

const pagamento = await pagamentoReq.json();

if(!pagamento.id){
return res.status(400).json({
erro:"Erro ao criar pagamento",
pagamento
});
}


// ==========================
// BUSCAR QR CODE
// ==========================

let qr = null;

for(let i=0;i<5;i++){

const qrReq = await fetch(`${API}/payments/${pagamento.id}/pixQrCode`,{
headers:{
"access_token":process.env.ASAAS_API_KEY
}
});

qr = await qrReq.json();

if(qr?.payload){
break;
}

await new Promise(r=>setTimeout(r,800));

}

return res.status(200).json({
pixCopiaECola:qr.payload,
qrCode:qr.encodedImage,
pagamentoId:pagamento.id
});

}catch(error){

return res.status(500).json({
erro:"Erro ao gerar PIX",
detalhe:error.message
});

}

}
