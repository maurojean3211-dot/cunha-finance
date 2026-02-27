import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Vendas() {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState(1);

  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  useEffect(() => {
    buscarDados();
  }, []);

  // ==============================
  // BUSCAR DADOS
  // ==============================
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

  // ==============================
  // SELECIONAR PRODUTO
  // ==============================
  function selecionarProduto(id) {
    setProdutoId(id);

    const produto = produtos.find((p) => p.id === id);
    setProdutoSelecionado(produto);

    setQuantidade(1);
  }

  // ==============================
  // SALVAR VENDA (COMISSÃO + LUCRO)
  // ==============================
  async function salvarVenda() {
    if (!clienteId || !produtoSelecionado) {
      alert("Selecione cliente e produto");
      return;
    }

    const qtd = Number(quantidade);
    const quantidadeAtual = Number(produtoSelecionado.estoque);

    if (quantidadeAtual < qtd) {
      alert("Quantidade insuficiente!");
      return;
    }

    const valor_total =
      Number(produtoSelecionado.preco) * qtd;

    // comissão fixa (R$0,05)
    const comissao = qtd * 0.05;

    // lucro automático
    const lucro = valor_total - comissao;

    const { error } = await supabase.from("vendas").insert([
      {
        cliente_id: clienteId,
        produto_id: produtoSelecionado.id,
        quantidade: qtd,
        valor_total,
        comissao,
        lucro,
      },
    ]);

    if (error) {
      console.log(error);
      alert("Erro ao salvar venda");
      return;
    }

    // atualizar quantidade (estoque interno)
    await supabase
      .from("produtos")
      .update({
        estoque: quantidadeAtual - qtd,
      })
      .eq("id", produtoSelecionado.id);

    alert("✅ Venda registrada!");

    setClienteId("");
    setProdutoId("");
    setProdutoSelecionado(null);
    setQuantidade(1);

    buscarDados();
  }

  // ==============================
  // EXCLUIR VENDA
  // ==============================
  async function excluirVenda(venda) {
    if (!window.confirm("Excluir venda?")) return;

    const produto = produtos.find(
      (p) => p.id === venda.produto_id
    );

    if (produto) {
      await supabase
        .from("produtos")
        .update({
          estoque:
            Number(produto.estoque) +
            Number(venda.quantidade),
        })
        .eq("id", produto.id);
    }

    await supabase
      .from("vendas")
      .delete()
      .eq("id", venda.id);

    buscarDados();
  }

  // ==============================
  // TELA
  // ==============================
  return (
    <div style={{ padding: 20 }}>
      <h1>🛒 Registrar Venda</h1>

      {/* CLIENTE */}
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

      {/* PRODUTO */}
      <select
        value={produtoId}
        onChange={(e) => selecionarProduto(e.target.value)}
      >
        <option value="">Selecione Produto</option>
        {produtos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome} — R$ {p.preco} ({p.tipo_unidade})
            {" | "}Quantidade: {p.estoque}
          </option>
        ))}
      </select>

      <br /><br />

      {/* QUANTIDADE INTELIGENTE */}
      {produtoSelecionado && (
        <>
          <input
            type="number"
            step={
              produtoSelecionado.tipo_unidade === "KG"
                ? "0.001"
                : "1"
            }
            min="0"
            value={quantidade}
            onChange={(e) =>
              setQuantidade(e.target.value)
            }
          />

          <span style={{ marginLeft: 10 }}>
            {produtoSelecionado.tipo_unidade}
          </span>
        </>
      )}

      <br /><br />

      <button onClick={salvarVenda}>
        Salvar Venda
      </button>

      <hr style={{ margin: "30px 0" }} />

      <h2>📋 Vendas Registradas</h2>

      {vendas.map((v) => (
        <div
          key={v.id}
          style={{
            background: "#222",
            color: "#fff",
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          Quantidade: {v.quantidade}
          {" | "}Total: R$ {Number(v.valor_total).toFixed(2)}
          {" | "}Comissão: R$ {Number(v.comissao || 0).toFixed(2)}
          {" | "}Lucro: R$ {Number(v.lucro || 0).toFixed(2)}

          <button
            style={{
              marginLeft: 20,
              background: "red",
              color: "#fff",
            }}
            onClick={() => excluirVenda(v)}
          >
            Excluir
          </button>
        </div>
      ))}
    </div>
  );
}