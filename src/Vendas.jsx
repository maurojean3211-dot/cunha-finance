import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Vendas() {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);

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

    const { data: vendasData } = await supabase
      .from("vendas")
      .select("*")
      .order("created_at", { ascending: false });

    setClientes(clientesData || []);
    setProdutos(produtosData || []);
    setVendas(vendasData || []);
  }

  async function salvarVenda() {
    if (!clienteId || !produtoId) {
      alert("Selecione cliente e produto");
      return;
    }

    const produto = produtos.find(p => p.id === produtoId);

    if (produto.estoque < quantidade) {
      alert("Estoque insuficiente!");
      return;
    }

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
      return;
    }

    // baixa estoque
    await supabase
      .from("produtos")
      .update({ estoque: produto.estoque - quantidade })
      .eq("id", produtoId);

    alert("Venda registrada!");
    setClienteId("");
    setProdutoId("");
    setQuantidade(1);

    buscarDados();
  }

  // 🔥 EXCLUIR VENDA E DEVOLVER ESTOQUE
  async function excluirVenda(venda) {
    if (!confirm("Excluir esta venda?")) return;

    const produto = produtos.find(p => p.id === venda.produto_id);

    // devolve estoque
    await supabase
      .from("produtos")
      .update({
        estoque: produto.estoque + venda.quantidade,
      })
      .eq("id", venda.produto_id);

    // remove venda
    await supabase
      .from("vendas")
      .delete()
      .eq("id", venda.id);

    buscarDados();
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🛒 Registrar Venda</h1>

      <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
        <option value="">Selecione Cliente</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>{c.nome}</option>
        ))}
      </select>

      <br /><br />

      <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
        <option value="">Selecione Produto</option>
        {produtos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome} - R$ {p.preco} (Estoque: {p.estoque})
          </option>
        ))}
      </select>

      <br /><br />

      <input
        type="number"
        min="1"
        value={quantidade}
        onChange={(e) => setQuantidade(Number(e.target.value))}
      />

      <br /><br />

      <button onClick={salvarVenda}>Salvar Venda</button>

      <hr style={{ margin: "30px 0" }} />

      <h2>📋 Vendas Registradas</h2>

      {vendas.map((v) => (
        <div key={v.id} style={{
          background:"#222",
          color:"#fff",
          padding:10,
          marginBottom:10,
          borderRadius:8
        }}>
          Quantidade: {v.quantidade} | Total: R$ {v.valor_total}

          <button
            style={{ marginLeft:20, background:"red", color:"#fff" }}
            onClick={() => excluirVenda(v)}
          >
            Excluir
          </button>
        </div>
      ))}
    </div>
  );
}