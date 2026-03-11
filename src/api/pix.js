export default async function handler(req, res) {

// ===== LIBERAR CORS =====

res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");

// ===== RESPOSTA PARA PREFLIGHT =====

if (req.method === "OPTIONS") {
return res.status(200).end();
}

// ===== BLOQUEAR OUTROS MÉTODOS =====

if (req.method !== "POST") {
return res.status(405).json({ erro: "Método não permitido" });
}

try {

// ===== CHAMADA PARA API ASAAS =====

const response = await fetch("https://api.asaas.com/v3/payments", {
method: "POST",
headers: {
"Content-Type": "application/json",
"access_token": process.env.ASAAS_API_KEY
},
body: JSON.stringify(req.body)
});

// ===== PEGAR RESPOSTA =====

const text = await response.text();

if (!text) {
return res.status(500).json({
erro: "Resposta vazia do Asaas"
});
}

const data = JSON.parse(text);

// ===== RETORNAR PIX =====

return res.status(200).json(data);

} catch (error) {

console.error("Erro PIX:", error);

return res.status(500).json({
erro: "Erro ao criar PIX",
detalhe: error.message
});

}

}