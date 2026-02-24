import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Admin({ user, sair }) {

  const [lancamentos, setLancamentos] = useState([]);

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {

    const { data, error } = await supabase
      .from("lancamentos")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("LANCAMENTOS ADMIN:", data, error);

    setLancamentos(data || []);
  }

  const receitas = lancamentos
    .filter(l => l.tipo === "receita")
    .reduce((s, l) => s + Number(l.valor), 0);

  const despesas = lancamentos
    .filter(l => l.tipo !== "receita")
    .reduce((s, l) => s + Number(l.valor), 0);

  const saldo = receitas - despesas;

  return (
    <div style={{ padding: 30, color: "white" }}>
      <h1>👑 Painel Administrador</h1>

      <p>Bem-vindo: {user.email}</p>

      <button onClick={sair}>Sair</button>

      <h2>Resumo Geral</h2>

      <p>💰 Receitas: R$ {receitas.toFixed(2)}</p>
      <p>💸 Despesas: R$ {despesas.toFixed(2)}</p>
      <p>📊 Saldo: R$ {saldo.toFixed(2)}</p>

      <h2>Todos os Lançamentos</h2>

      {lancamentos.map(l => (
        <div key={l.id}>
          {l.descricao} — R$ {l.valor}
        </div>
      ))}
    </div>
  );
}