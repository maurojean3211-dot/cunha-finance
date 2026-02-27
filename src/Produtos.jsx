import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [tipoUnidade, setTipoUnidade] = useState("UN");

  // ==============================
  // BUSCAR PRODUTOS
  // ==============================
  async function carregarProdutos() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("produtos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setProdutos(data || []);
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  // ==============================
  // SALVAR PRODUTO
  // ==============================
  async function salvarProduto(e) {
    e.preventDefault();

    if (!nome || !preco || !quantidade) {
      alert("Preencha todos os campos");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("produtos").insert([
      {
        nome,
        preco: Number(preco),
        estoque: Number(quantidade), // continua estoque no banco
        tipo_unidade: tipoUnidade,
        user_id: user.id,
      },
    ]);

    if (error) {
      alert("Erro ao salvar");
      return;
    }

    setNome("");
    setPreco("");
    setQuantidade("");
    setTipoUnidade("UN");

    carregarProdutos();
  }

  // ==============================
  // EXCLUIR PRODUTO
  // ==============================
  async function excluirProduto(id) {
    if (!window.confirm("Excluir produto?")) return;

    await supabase
      .from("produtos")
      .delete()
      .eq("id", id);

    carregarProdutos();
  }

  // ==============================
  // TELA
  // ==============================
  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Produtos - Cunha Finance</h2>

      <form onSubmit={salvarProduto}>
        <input
          placeholder="Nome do produto"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          type="number"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />

        {/* ⭐ AGORA É QUANTIDADE */}
        <input
          type="number"
          placeholder="Quantidade inicial"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
        />

        <select
          value={tipoUnidade}
          onChange={(e) => setTipoUnidade(e.target.value)}
        >
          <option value="UN">Peça (UN)</option>
          <option value="KG">Peso (KG)</option>
        </select>

        <button type="submit">Salvar</button>
      </form>

      <hr />

      <h3>Lista de Produtos</h3>

      {produtos.map((p) => (
        <div
          key={p.id}
          style={{
            marginBottom: 10,
            padding: 10,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        >
          <strong>{p.nome}</strong> — R$ {p.preco} / {p.tipo_unidade}
          <br />
          Quantidade: {p.estoque}

          <button
            onClick={() => excluirProduto(p.id)}
            style={{
              marginLeft: 15,
              backgroundColor: "#ff4d4d",
              color: "#fff",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer",
              borderRadius: 4,
            }}
          >
            Excluir
          </button>
        </div>
      ))}
    </div>
  );
}