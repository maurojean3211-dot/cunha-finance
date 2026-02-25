import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Vendas() {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    buscarDados();
  }, []);

  async function buscarDados() {
    const { data: clientesData } = await supabase
      .from("clientes")
      .select("*");

    const { data: produtosData } = await supabase
      .from("produtos")
      .select("*");

    setClientes(clientesData || []);
    setProdutos(produtosData || []);
  }

  async function salvarVenda() {
    const produto = produtos.find(p => p.id === produtoId);

    const valor_total = produto.preco * quantidade;

    const { error } = await supabase.from("vendas").insert([
      {
        cliente_id: clienteId,
        produto_id: produtoId,
        quantidade,
        valor_total,
      },
    ]);

    if (error) {
      alert("Erro ao salvar venda");
      console.log(error);
    } else {
      alert("Venda registrada!");
      setClienteId("");
      setProdutoId("");
      setQuantidade(1);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🛒 Registrar Venda</h1>

      <select
        value={clienteId}
        onChange={(e) => setClienteId(e.target.value)}
      >
        <option value="">Selecione Cliente</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </select>

      <br /><br />

      <select
        value={produtoId}
        onChange={(e) => setProdutoId(e.target.value)}
      >
        <option value="">Selecione Produto</option>
        {produtos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome} - R$ {p.preco}
          </option>
        ))}
      </select>

      <br /><br />

      <input
        type="number"
        value={quantidade}
        onChange={(e) => setQuantidade(Number(e.target.value))}
      />

      <br /><br />

      <button onClick={salvarVenda}>
        Salvar Venda
      </button>
    </div>
  );
}