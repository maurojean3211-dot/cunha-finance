export default async function handler(req, res) {

res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");

if (req.method === "OPTIONS") {
return res.status(200).end();
}

const body = typeof req.body === "string"
? JSON.parse(req.body)
: req.body;

const valor = body?.valor || 0;

const chavePix = "11999999999";

const textoPix = `PIX\nChave:${chavePix}\nValor:${valor}`;

return res.status(200).json({
success: true,
pixCopiaECola: textoPix
});

}