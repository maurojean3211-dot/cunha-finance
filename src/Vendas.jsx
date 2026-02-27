import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Vendas() {

  const [clientes,setClientes]=useState([]);
  const [produtos,setProdutos]=useState([]);
  const [vendas,setVendas]=useState([]);

  const [clienteId,setClienteId]=useState("");
  const [produtoId,setProdutoId]=useState("");
  const [quantidade,setQuantidade]=useState("");
  const [unidade,setUnidade]=useState("UN");
  const [precoUnitario,setPrecoUnitario]=useState("");

  // ==============================
  useEffect(()=>{ buscarDados(); },[]);

  async function buscarDados(){
    const {data:clientesData}=await supabase.from("clientes").select("*");
    const {data:produtosData}=await supabase.from("produtos").select("*");
    const {data:vendasData}=await supabase
      .from("vendas")
      .select("*")
      .order("created_at",{ascending:false});

    setClientes(clientesData||[]);
    setProdutos(produtosData||[]);
    setVendas(vendasData||[]);
  }

  // ==============================
  // AO ESCOLHER PRODUTO
  // ==============================
  function selecionarProduto(id){
    setProdutoId(id);

    const produto = produtos.find(p=>p.id===id);

    if(produto){
      setPrecoUnitario(produto.preco ?? 0);
    }
  }

  // ==============================
  // CONVERSÃO SEGURA (⭐ CORREÇÃO)
  // ==============================
  const qtd = parseFloat(quantidade) || 0;
  const preco = parseFloat(precoUnitario) || 0;

  const valorTotal = preco * qtd;
  const comissao = qtd * 0.05;
  const lucro = valorTotal - comissao;

  // ==============================
  async function salvarVenda(){

    if(!clienteId || !produtoId){
      alert("Selecione cliente e produto");
      return;
    }

    const {error}=await supabase.from("vendas").insert([{
      cliente_id:clienteId,
      produto_id:produtoId,
      quantidade:qtd,
      unidade,
      preco_unitario:preco,
      valor_total:valorTotal,
      comissao:comissao,
      lucro:lucro
    }]);

    if(error){
      console.log(error);
      alert("Erro ao salvar venda");
      return;
    }

    alert("✅ Venda registrada!");

    setQuantidade("");
    setPrecoUnitario("");
    setUnidade("UN");

    buscarDados();
  }

  // ==============================
  return(
    <div style={{padding:20}}>
      <h1>🛒 Registrar Venda</h1>

      {/* CLIENTE */}
      <select value={clienteId}
        onChange={e=>setClienteId(e.target.value)}>
        <option value="">Cliente</option>
        {clientes.map(c=>(
          <option key={c.id} value={c.id}>{c.nome}</option>
        ))}
      </select>

      <br/><br/>

      {/* PRODUTO */}
      <select value={produtoId}
        onChange={e=>selecionarProduto(e.target.value)}>
        <option value="">Produto</option>
        {produtos.map(p=>(
          <option key={p.id} value={p.id}>
            {p.nome} — Preço base R$ {p.preco}
          </option>
        ))}
      </select>

      <br/><br/>

      {/* QUANTIDADE */}
      <input
        type="number"
        step="0.001"
        placeholder="Quantidade"
        value={quantidade}
        onChange={e=>setQuantidade(e.target.value)}
      />

      {/* UNIDADE */}
      <select
        value={unidade}
        onChange={e=>setUnidade(e.target.value)}>
        <option value="UN">Unidade (UN)</option>
        <option value="KG">Peso (KG)</option>
      </select>

      <br/><br/>

      {/* PREÇO */}
      <input
        type="number"
        step="0.01"
        placeholder="Preço Unitário"
        value={precoUnitario}
        onChange={e=>setPrecoUnitario(e.target.value)}
      />

      <br/><br/>

      {/* RESUMO AUTOMÁTICO */}
      <div style={{
        background:"#111",
        color:"#fff",
        padding:15,
        borderRadius:8,
        marginBottom:15
      }}>
        <div>Total: R$ {valorTotal.toFixed(2)}</div>
        <div>Comissão: R$ {comissao.toFixed(2)}</div>
        <div>Lucro: R$ {lucro.toFixed(2)}</div>
      </div>

      <button onClick={salvarVenda}>
        Salvar Venda
      </button>

      <hr/>

      <h2>📋 Vendas</h2>

      {vendas.map(v=>(
        <div key={v.id}>
          {v.quantidade} {v.unidade}
          {" | "}R$ {Number(v.valor_total).toFixed(2)}
          {" | "}Comissão: R$ {Number(v.comissao||0).toFixed(2)}
          {" | "}Lucro: R$ {Number(v.lucro||0).toFixed(2)}
        </div>
      ))}

    </div>
  );
}