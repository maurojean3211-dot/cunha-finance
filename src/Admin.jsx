import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./App.css";

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

  // ================= CARREGAR =================
  useEffect(() => {
    if (user?.id) carregarTudo();
  }, [user]);

  async function carregarTudo() {
    const { data, error } = await supabase
      .from("lancamentos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.log(error);

    setLancamentos(data || []);
  }

  // ================= ADICIONAR =================
  async function adicionarLancamento() {

    if (!descricao || !valor) {
      alert("Preencha os campos");
      return;
    }

    const { error } = await supabase.from("lancamentos").insert({
      descricao,
      valor: Number(valor),
      tipo,
      data: new Date().toISOString(),
      mes: new Date().getMonth() + 1,
      ano: new Date().getFullYear(),
      user_id: user.id
    });

    if (error) {
      alert("Erro ao salvar");
      return;
    }

    setDescricao("");
    setValor("");

    carregarTudo();
  }

  // ================= EXCLUIR =================
  async function excluirLancamento(id) {

    await supabase
      .from("lancamentos")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

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
    <div className="app-container">

      {/* MENU LATERAL */}
      <div className="menu-lateral">
        <h2>💼 Cunha Finance</h2>

        {menuSistema.map(item => (
          <button
            key={item.id}
            className="botao-primary"
            style={{ marginTop: 10, width: "100%" }}
            onClick={() => setAba(item.id)}
          >
            {item.nome}
          </button>
        ))}

        <hr />

        <p style={{ fontSize: 12 }}>{user.email}</p>

        <button
          onClick={sair}
          className="botao-primary"
          style={{ marginTop: 20, width: "100%" }}
        >
          🚪 Sair
        </button>
      </div>

      {/* CONTEÚDO */}
      <div className="conteudo">

        {/* DASHBOARD */}
        {aba === "dashboard" && (
          <>
            <h1>Painel Financeiro</h1>

            <div className="resumo-box">
              <p>💰 Receitas: R$ {receitas.toFixed(2)}</p>
              <p>💸 Despesas: R$ {despesas.toFixed(2)}</p>
              <p>📊 Saldo: R$ {saldo.toFixed(2)}</p>
            </div>
          </>
        )}

        {/* FINANCEIRO */}
        {aba === "financeiro" && (
          <>
            <h2>➕ Novo Lançamento</h2>

            <input
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />

            <input
              type="number"
              placeholder="Valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>

            <button
              onClick={adicionarLancamento}
              className="botao-primary"
              style={{ marginTop: 12 }}
            >
              ➕ Salvar Lançamento
            </button>

            <h2>Meus Lançamentos</h2>

            {lancamentos.map(l => (
              <div key={l.id} className="card">
                <strong>{l.descricao}</strong>
                <p>R$ {Number(l.valor).toFixed(2)}</p>

                <button
                  className="botao-danger"
                  onClick={() => excluirLancamento(l.id)}
                >
                  ❌ Excluir
                </button>
              </div>
            ))}
          </>
        )}

        {aba === "clientes" && <h2>👥 Clientes (em construção)</h2>}
        {aba === "produtos" && <h2>📦 Produtos (em construção)</h2>}
        {aba === "vendas" && <h2>🛒 Vendas (em construção)</h2>}
        {aba === "compras" && <h2>🧾 Compras (em construção)</h2>}
        {aba === "despesas" && <h2>💸 Despesas (em construção)</h2>}

      </div>
    </div>
  );
}