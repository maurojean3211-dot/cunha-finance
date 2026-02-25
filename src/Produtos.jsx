import { useState } from "react";
import { supabase } from "./supabase";

export default function Produtos() {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");

  async function salvarProduto() {
    const { error } = await supabase
      .from("produtos")
      .insert([
        {
          nome,
          preco,
          estoque,
        },
      ]);

    if (error) {
      alert("Erro ao salvar produto");
      console.log(error);
    } else {
      alert("Produto salvo com sucesso!");
      setNome("");
      setPreco("");
      setEstoque("");
    }
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
    </div>
  );
}