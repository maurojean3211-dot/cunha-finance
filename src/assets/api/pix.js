export default async function handler(req, res) {

// Permitir chamadas da aplicação
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");

// Responder preflight do navegador
if (req.method === "OPTIONS") {
return res.status(200).end();
}

try {

```
// Aqui você define a chave PIX padrão do sistema
// Depois podemos buscar isso do Supabase
const pixChave = "11999999999";

// Resposta da API
return res.status(200).json({
  success: true,
  pix: pixChave,
  mensagem: "PIX retornado com sucesso"
});
```

} catch (error) {

```
console.error("ERRO:", error);

return res.status(500).json({
  success: false,
  erro: "Erro interno do servidor",
  detalhe: error.message
});
```

}

}
