import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [totalVendas, setTotalVendas] = useState(0);

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    // 🔥 pega usuário logado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("Usuário não autenticado");
      return;
    }

    // 🔥 busca somente vendas do usuário
    const { data, error } = await supabase
      .from("vendas")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.log(error);
      return;
    }

    // total faturamento
    const total = data.reduce(
      (acc, venda) => acc + Number(venda.valor_total),
      0
    );

    setTotalVendas(total);

    // agrupar por mês
    const meses = {};

    data.forEach((venda) => {
      const dataVenda = new Date(venda.created_at);

      const mes = dataVenda.toLocaleString("pt-BR", {
        month: "short",
      });

      if (!meses[mes]) {
        meses[mes] = 0;
      }

      meses[mes] += Number(venda.valor_total);
    });

    const grafico = Object.keys(meses).map((mes) => ({
      mes,
      valor: meses[mes],
    }));

    setDadosGrafico(grafico);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Dashboard Financeiro</h1>

      <div
        style={{
          background: "#4CAF50",
          color: "#fff",
          padding: 20,
          borderRadius: 10,
          width: 300,
          marginBottom: 30,
        }}
      >
        <h3>💰 Faturamento Total</h3>
        <h2>R$ {totalVendas.toFixed(2)}</h2>
      </div>

      <h3>📈 Faturamento por Mês</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dadosGrafico}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="valor" stroke="#4CAF50" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}