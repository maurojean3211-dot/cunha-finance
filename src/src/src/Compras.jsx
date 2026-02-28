import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Compras(){

  const [fornecedores,setFornecedores]=useState([]);
  const [produtos,setProdutos]=useState([]);
  const [compras,setCompras]=useState([]);

  const [fornecedorId,setFornecedorId]=useState("");
  const [produtoId,setProdutoId]=useState("");
  const [quantidade,setQuantidade]=useState("");
  const [precoCompra,setPrecoCompra]=useState("");
  const [unidade,setUnidade]=useState("KG");

  useEffect(()=>{
    carregar();
  },[]);

  async function carregar(){

    const {data:f}=await supabase.from("fornecedores").select("*");
    const {data:p}=await supabase.from("produtos").select("*");
    const {data:c}=await supabase
      .from("compras")
      .select("*")
      .order("created_at",{ascending:false});

    setFornecedores(f||[]);
    setProdutos(p||[]);
    setCompras(c||[]);
  }

  // =============================
  const total =
    (parseFloat(quantidade)||0) *
    (parseFloat(precoCompra)||0);

  // =============================
  async function salvar(){

    if(!fornecedorId || !produtoId){
      alert("Selecione fornecedor e produto");
      return;
    }

    const {error}=await supabase.from("compras").insert([{
      fornecedor_id:fornecedorId,
      produto_id:produtoId,
      quantidade:Number(quantidade),
      unidade,
      preco_compra:Number(precoCompra),
      valor_total:total
    }]);

    if(error){
      console.log(error);
      alert("Erro ao salvar compra");
      return;
    }

    alert("✅ Compra registrada");

    setQuantidade("");
    setPrecoCompra("");

    carregar();
  }

  return(
    <div style={{padding:20}}>

      <h1>♻️ Compras / Sucata</h1>

      <select
        value={fornecedorId}
        onChange={e=>setFornecedorId(e.target.value)}
      >
        <option value="">Fornecedor</option>
        {fornecedores.map(f=>(
          <option key={f.id} value={f.id}>{f.nome}</option>
        ))}
      </select>

      <br/><br/>

      <select
        value={produtoId}
        onChange={e=>setProdutoId(e.target.value)}
      >
        <option value="">Produto</option>
        {produtos.map(p=>(
          <option key={p.id} value={p.id}>{p.nome}</option>
        ))}
      </select>

      <br/><br/>

      <input
        type="number"
        step="0.001"
        placeholder="Quantidade"
        value={quantidade}
        onChange={e=>setQuantidade(e.target.value)}
      />

      <select
        value={unidade}
        onChange={e=>setUnidade(e.target.value)}
      >
        <option value="KG">KG</option>
        <option value="UN">UN</option>
      </select>

      <br/><br/>

      <input
        type="number"
        step="0.01"
        placeholder="Preço da Compra"
        value={precoCompra}
        onChange={e=>setPrecoCompra(e.target.value)}
      />

      <h3>Total: R$ {total.toFixed(2)}</h3>

      <button onClick={salvar}>
        Salvar Compra
      </button>

      <hr/>

      <h2>Compras Registradas</h2>

      {compras.map(c=>(
        <div key={c.id}>
          {c.quantidade} {c.unidade}
          {" | "}R$ {Number(c.valor_total).toFixed(2)}
        </div>
      ))}

    </div>
  );
}