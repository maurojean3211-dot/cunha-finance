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

const response = await fetch("https://api.asaas.com/v3/payments", {
method: "POST",
headers: {
"Content-Type": "application/json",
"access_token": process.env.ASAAS_API_KEY
},
body: JSON.stringify(req.body)
});

const data = await response.json();

return res.status(200).json(data);

} catch (error) {

console.error("Erro PIX:", error);

return res.status(500).json({
erro: "Erro ao criar PIX",
detalhe: error.message
});

}

}