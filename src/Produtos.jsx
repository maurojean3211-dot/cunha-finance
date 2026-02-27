import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");

  // ==============================
  // BUSCAR PRODUTOS
  // ==============================
  async function carregarProdutos() {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("id", { ascending: false });

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
  // SALVAR PRODUTO
  // ==============================
  async function salvarProduto(e) {
    e.preventDefault();

    if (!nome || !preco) {
      alert("Preencha todos os campos");
      return;
    }

    const { error } = await supabase.from("produtos").insert([
      {
        nome: nome,
        preco: Number(preco),
      },
    ]);

    if (error) {
      console.log(error);
      alert("Erro ao salvar");
      return;
    }

    // limpa campos
    setNome("");
    setPreco("");

    // 🔥 ATUALIZA LISTA (isso faltava no Vercel)
    await carregarProdutos();
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
        <div key={p.id}>
          {p.nome} - R$ {p.preco}
        </div>
      ))}
    </div>
  );
}