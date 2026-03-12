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

    // =========================
    // CRIAR COBRANÇA PIX ASAAS
    // =========================

    const createPayment = await fetch("https://api.asaas.com/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": process.env.ASAAS_API_KEY
      },
      body: JSON.stringify({
        billingType: "PIX",
        value: Number(req.body.valor),
        description: req.body.descricao,
        dueDate: new Date().toISOString().split("T")[0],

        // dados do cliente direto
        customer: {
          name: "Cliente Cunha Finance",
          cpfCnpj: "52998224725",
          email: "cliente@cunhafinance.com",
          phone: "11999999999"
        }

      })
    });

    const payment = await createPayment.json();

    if (payment.errors) {
      console.log("Erro ASAAS:", payment.errors);
      return res.status(400).json(payment);
    }

    // =========================
    // GERAR QR CODE PIX
    // =========================

    const pixQr = await fetch(`https://api.asaas.com/v3/payments/${payment.id}/pixQrCode`, {
      method: "GET",
      headers: {
        "access_token": process.env.ASAAS_API_KEY
      }
    });

    const qr = await pixQr.json();

    return res.status(200).json({
      pixCopiaECola: qr.payload,
      qrCode: qr.encodedImage
    });

  } catch (error) {

    console.error("Erro PIX:", error);

    return res.status(500).json({
      erro: "Erro ao gerar PIX",
      detalhe: error.message
    });

  }

}