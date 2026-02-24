import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Admin({ user, sair }) {

  const [lancamentos, setLancamentos] = useState([]);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("despesa");

  useEffect(() => {
    carregarTudo();
  }, []);

  // ================= CARREGAR TODOS =================
  async function carregarTudo() {

    const { data, error } = await supabase
      .from("lancamentos")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("LANCAMENTOS ADMIN:", data, error);

    setLancamentos(data || []);
  }

  // ================= ADICIONAR =================
  async function adicionarLancamento() {

    if (!descricao || !valor) {
      alert("Preencha os campos");
      return;
    }

    await supabase.from("lancamentos").insert({
      descricao,
      valor: Number(valor),
      tipo,
      data: new Date().toISOString(),
      mes: new Date().getMonth() + 1,
      ano: new Date().getFullYear(),
      user_id: user.id
    });

    setDescricao("");
    setValor("");

    carregarTudo();
  }

  // ================= EXCLUIR =================
  async function excluirLancamento(id) {

    await supabase
      .from("lancamentos")
      .delete()
      .eq("id", id);

    carregarTudo();
  }

  // ================= CALCULOS =================
  const receitas = lancamentos
    .filter(l => l.tipo === "receita")
    .reduce((s, l) => s + Number(l.valor), 0);

  const despesas = lancamentos
    .filter(l => l.tipo !== "receita")
    .reduce((s, l) => s + Number(l.valor), 0);

  const saldo = receitas - despesas;

  // ================= TELA =================
  return (
    <div style={{ padding: 30, color: "white" }}>

      <h1>👑 Painel Administrador</h1>

      <p>Bem-vindo: {user.email}</p>

      <button onClick={sair}>🚪 Sair</button>

      {/* ===== RESUMO ===== */}
      <h2>Resumo Geral</h2>

      <p>💰 Receitas: R$ {receitas.toFixed(2)}</p>
      <p>💸 Despesas: R$ {despesas.toFixed(2)}</p>
      <p>📊 Saldo: R$ {saldo.toFixed(2)}</p>

      {/* ===== NOVO LANÇAMENTO ===== */}
      <h2>➕ Meu Lançamento Pessoal</h2>

      <input
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        style={input}
      />

      <input
        type="number"
        placeholder="Valor"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        style={input}
      />

      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        style={input}
      >
        <option value="receita">Receita</option>
        <option value="despesa">Despesa</option>
      </select>

      <button onClick={adicionarLancamento} style={botao}>
        ➕ Salvar Lançamento
      </button>

      {/* ===== LISTA ===== */}
      <h2>Todos os Lançamentos</h2>

      {lancamentos.map(l => (
        <div key={l.id} style={card}>
          <strong>{l.descricao}</strong>
          <p>R$ {Number(l.valor).toFixed(2)}</p>

          <button onClick={() => excluirLancamento(l.id)}>
            ❌ Excluir
          </button>
        </div>
      ))}

    </div>
  );
}

// ===== ESTILOS =====
const input = {
  display: "block",
  marginTop: 10,
  padding: 10,
  borderRadius: 8,
  border: "none",
  width: "100%",
  maxWidth: 400
};

const botao = {
  marginTop: 12,
  padding: 12,
  borderRadius: 10,
  border: "none",
  background: "#8A05BE",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer"
};

const card = {
  marginTop: 10,
  padding: 12,
  background: "#1a1a1a",
  borderRadius: 10
};