export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const nome = body?.nome || "Cliente Teste";
    const valor = Number(body?.valor || 10);

    const cpfCnpj = "11144477735";

    const API = "https://sandbox.asaas.com/api/v3";

    const headers = {
      "Content-Type": "application/json",
      "access_token": process.env.ASAAS_API_KEY
    };

    // ===============================
    // PASSO 1 - CRIAR CLIENTE
    // ===============================
    const clienteReq = await fetch(`${API}/customers`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: nome,
        cpfCnpj: cpfCnpj
      })
    });

    const cliente = await clienteReq.json();

    console.log("CLIENTE:", cliente);

    if (!cliente.id) {
      return res.status(400).json({
        erro: "Erro ao criar cliente",
        detalhes: cliente
      });
    }

    const customerId = cliente.id;

    // ===============================
    // PASSO 2 - CRIAR PAGAMENTO PIX
    // ===============================
    const pagamentoReq = await fetch(`${API}/payments`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        customer: customerId,
        billingType: "PIX",
        value: valor,
        dueDate: new Date().toISOString().split("T")[0]
      })
    });

    const pagamento = await pagamentoReq.json();

    console.log("PAGAMENTO:", pagamento);

    if (!pagamento.id) {
      return res.status(400).json({
        erro: "Erro ao criar pagamento",
        detalhes: pagamento
      });
    }

    // ===============================
    // AGUARDAR QR CODE SER GERADO
    // ===============================
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ===============================
    // PASSO 3 - PEGAR QR CODE
    // ===============================
    const qrReq = await fetch(`${API}/payments/${pagamento.id}/pixQrCode`, {
      method: "GET",
      headers
    });

    const qr = await qrReq.json();

    console.log("QR:", qr);

    return res.status(200).json({
      success: true,
      pixCopiaECola: qr.payload,
      qrCode: qr.encodedImage,
      pagamentoId: pagamento.id
    });

  } catch (error) {

    console.error("ERRO:", error);

    return res.status(500).json({
      erro: "Erro interno",
      mensagem: error.message
    });

  }

}