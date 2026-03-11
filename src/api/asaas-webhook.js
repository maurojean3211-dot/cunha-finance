export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const evento = req.body;

  console.log("Evento recebido do Asaas:", evento.event);

  if (evento.event === "PAYMENT_CONFIRMED" || evento.event === "PAYMENT_RECEIVED") {
    const payment = evento.payment;

    console.log("Pagamento confirmado:", payment.id);

    // Aqui você poderá atualizar o status da empresa no Supabase
    // Exemplo (pseudo):
    // status_empresa = "ativo"
  }

  if (evento.event === "PAYMENT_OVERDUE") {
    const payment = evento.payment;

    console.log("Pagamento vencido:", payment.id);

    // Aqui você poderá bloquear o cliente
    // status_empresa = "bloqueado"
  }

  res.status(200).json({ received: true });
}