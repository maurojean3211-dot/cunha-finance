import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Admin({ user, sair }) {

  // ================= MENU =================
  const menuSistema = [
    { id: "dashboard", nome: "👑 Dashboard" },
    { id: "financeiro", nome: "💰 Financeiro" },
    { id: "clientes", nome: "👥 Clientes" },
    { id: "produtos", nome: "📦 Produtos" },
    { id: "vendas", nome: "🛒 Vendas" },
    { id: "compras", nome: "🧾 Compras" },
    { id: "despesas", nome: "💸 Despesas" },
  ];

  const [aba, setAba] = useState("dashboard");

  // ================= DADOS =================
  const [lancamentos, setLancamentos] = useState([]);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("despesa");

  useEffect(() => {
    carregarTudo();
  }, []);

  // ================= CARREGAR =================
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
    <div style={container}>

      {/* ===== MENU LATERAL ===== */}
      <div style={menu}>
        <h2>👑 Admin</h2>

        {menuSistema.map(item => (
          <button
            key={item.id}
            style={botaoMenu}
            onClick={() => setAba(item.id)}
          >
            {item.nome}
          </button>
        ))}

        <hr />

        <p>{user.email}</p>

        <button onClick={sair} style={botaoSair}>
          🚪 Sair
        </button>
      </div>

      {/* ===== CONTEÚDO ===== */}
      <div style={conteudo}>

        {/* DASHBOARD */}
        {aba === "dashboard" && (
          <>
            <h1>Painel Administrador</h1>

            <h2>Resumo Geral</h2>

            <p>💰 Receitas: R$ {receitas.toFixed(2)}</p>
            <p>💸 Despesas: R$ {despesas.toFixed(2)}</p>
            <p>📊 Saldo: R$ {saldo.toFixed(2)}</p>
          </>
        )}

        {/* FINANCEIRO */}
        {aba === "financeiro" && (
          <>
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
          </>
        )}

        {/* TELAS FUTURAS */}
        {aba === "clientes" && <h2>👥 Clientes (em construção)</h2>}
        {aba === "produtos" && <h2>📦 Produtos (em construção)</h2>}
        {aba === "vendas" && <h2>🛒 Vendas (em construção)</h2>}
        {aba === "compras" && <h2>🧾 Compras (em construção)</h2>}
        {aba === "despesas" && <h2>💸 Despesas (em construção)</h2>}

      </div>
    </div>
  );
}

// ================= ESTILOS =================

const container = {
  display: "flex",
  minHeight: "100vh",
  background: "#0a0a0a",
  color: "white",
  fontFamily: "sans-serif"
};

const menu = {
  width: 220,
  background: "#111",
  padding: 20
};

const conteudo = {
  flex: 1,
  padding: 30
};

const botaoMenu = {
  display: "block",
  width: "100%",
  marginTop: 10,
  padding: 10,
  borderRadius: 8,
  border: "none",
  background: "#1f1f1f",
  color: "white",
  cursor: "pointer"
};

const botaoSair = {
  marginTop: 20,
  padding: 10,
  width: "100%",
  background: "#8A05BE",
  border: "none",
  borderRadius: 8,
  color: "white",
  cursor: "pointer"
};

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