import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");

  // ==============================
  // BUSCAR PRODUTOS (SOMENTE DO USUÁRIO)
  // ==============================
  async function carregarProdutos() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("Usuário não encontrado");
      return;
    }

    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Erro ao buscar:", error);
    } else {
      setProdutos(data);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  // ==============================
  // SALVAR PRODUTO (COM USER_ID)
  // ==============================
  async function salvarProduto(e) {
    e.preventDefault();

    if (!nome || !preco) {
      alert("Preencha todos os campos");
      return;
    }

    // pega usuário logado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("Usuário não autenticado");
      return;
    }

    const { error } = await supabase.from("produtos").insert([
      {
        nome: nome,
        preco: Number(preco),
        user_id: user.id, // ⭐ dono do produto
      },
    ]);

    if (error) {
      console.log(error);
      alert("Erro ao salvar");
      return;
    }

    setNome("");
    setPreco("");

    await carregarProdutos();
  }

  // ==============================
  // EXCLUIR PRODUTO
  // ==============================
  async function excluirProduto(id) {
    const confirmar = window.confirm(
      "Deseja excluir este produto?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", id);

    if (error) {
      console.log(error);
      alert("Erro ao excluir produto");
      return;
    }

    carregarProdutos();
  }

  // ==============================
  // TELA
  // ==============================
  return (
    <div style={{ padding: 20 }}>
      <h2>Produtos - Cunha Finance</h2>

      <form onSubmit={salvarProduto}>
        <input
          placeholder="Nome do produto"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          placeholder="Preço"
          type="number"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />

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
          <strong>{p.nome}</strong> — R$ {p.preco}

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