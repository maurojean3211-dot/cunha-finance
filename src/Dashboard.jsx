import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Dashboard() {
  const [totalVendas, setTotalVendas] = useState(0);
  const [quantidadeVendas, setQuantidadeVendas] = useState(0);

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    const { data, error } = await supabase
      .from("vendas")
      .select("*");

    if (error) {
      console.log(error);
      return;
    }

    const total = data.reduce(
      (acc, venda) => acc + Number(venda.valor_total),
      0
    );

    setTotalVendas(total);
    setQuantidadeVendas(data.length);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Dashboard Financeiro</h1>

      <div style={{
        display: "flex",
        gap: 20,
        marginTop: 20
      }}>
        <div style={{
          background: "#4CAF50",
          color: "#fff",
          padding: 20,
          borderRadius: 10,
          width: 250
        }}>
          <h3>💰 Faturamento Total</h3>
          <h2>R$ {totalVendas.toFixed(2)}</h2>
        </div>

        <div style={{
          background: "#2196F3",
          color: "#fff",
          padding: 20,
          borderRadius: 10,
          width: 250
        }}>
          <h3>🛒 Quantidade de Vendas</h3>
          <h2>{quantidadeVendas}</h2>
        </div>
      </div>
    </div>
  );
}