import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");

  useEffect(() => {
    buscarProdutos();
  }, []);

  async function buscarProdutos() {
    const { data } = await supabase
      .from("produtos")
      .select("*")
      .order("created_at", { ascending: false });

    setProdutos(data || []);
  }

  async function salvarProduto() {
    if (!nome || !preco) {
      alert("Preencha nome e preço");
      return;
    }

    await supabase.from("produtos").insert([
      {
        nome,
        preco,
        estoque,
      },
    ]);

    setNome("");
    setPreco("");
    setEstoque("");

    buscarProdutos();
  }

  // 🔥 EXCLUIR PRODUTO COM SEGURANÇA
  async function excluirProduto(produto) {
    if (!confirm("Deseja excluir este produto?")) return;

    // verifica se possui vendas
    const { data: vendas } = await supabase
      .from("vendas")
      .select("*")
      .eq("produto_id", produto.id);

    if (vendas.length > 0) {
      alert("Não é possível excluir. Produto possui vendas registradas.");
      return;
    }

    await supabase
      .from("produtos")
      .delete()
      .eq("id", produto.id);

    buscarProdutos();
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>📦 Cadastro de Produtos</h1>

      <input
        placeholder="Nome do produto"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <br /><br />

      <input
        type="number"
        placeholder="Preço"
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
      />
      <br /><br />

      <input
        type="number"
        placeholder="Estoque"
        value={estoque}
        onChange={(e) => setEstoque(e.target.value)}
      />
      <br /><br />

      <button onClick={salvarProduto}>
        Salvar Produto
      </button>

      <hr style={{ margin: "30px 0" }} />

      <h2>Produtos cadastrados</h2>

      {produtos.map((p) => (
        <div
          key={p.id}
          style={{
            background: "#222",
            color: "#fff",
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          {p.nome} | R$ {p.preco} | Estoque: {p.estoque}

          <button
            style={{
              marginLeft: 20,
              background: "red",
              color: "#fff",
            }}
            onClick={() => excluirProduto(p)}
          >
            Excluir
          </button>
        </div>
      ))}
    </div>
  );
}