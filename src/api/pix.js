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

const body = req.body;

if (!body) {
return res.status(400).json({
erro: "Body não enviado"
});
}

const response = await fetch("https://api.asaas.com/v3/payments", {
method: "POST",
headers: {
"Content-Type": "application/json",
"access_token": process.env.ASAAS_API_KEY
},
body: JSON.stringify(body)
});

const data = await response.json();

if (!response.ok) {
return res.status(response.status).json({
erro: "Erro retornado pelo Asaas",
detalhe: data
});
}

return res.status(200).json(data);

} catch (error) {

console.error("Erro ao gerar PIX:", error);

return res.status(500).json({
erro: "Erro interno ao gerar PIX",
detalhe: error.message
});

}

}