import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Produtos() {

  const [produtos,setProdutos]=useState([]);
  const [nome,setNome]=useState("");

  useEffect(()=>{
    carregarProdutos();
  },[]);

  // =============================
  async function carregarProdutos(){

    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("created_at",{ascending:false});

    if(!error){
      setProdutos(data || []);
    }
  }

  // =============================
  async function salvarProduto(e){
    e.preventDefault();

    if(!nome){
      alert("Digite o nome do produto");
      return;
    }

    const { error } = await supabase
      .from("produtos")
      .insert([{ nome }]);

    if(error){
      alert("Erro ao salvar");
      return;
    }

    setNome("");
    carregarProdutos();
  }

  // =============================
  async function excluirProduto(id){

    if(!window.confirm("Excluir produto?")) return;

    await supabase
      .from("produtos")
      .delete()
      .eq("id",id);

    carregarProdutos();
  }

  // =============================
  return(
    <div style={{padding:20}}>

      <h1>📦 Cadastro de Produtos</h1>

      <form onSubmit={salvarProduto}>

        <input
          placeholder="Nome do produto"
          value={nome}
          onChange={e=>setNome(e.target.value)}
          style={{
            padding:10,
            width:300,
            marginRight:10
          }}
        />

        <button type="submit">
          Salvar
        </button>

      </form>

      <hr/>

      <h3>Produtos cadastrados</h3>

      {produtos.map(p=>(
        <div key={p.id}
          style={{
            background:"#222",
            color:"#fff",
            padding:12,
            marginBottom:10,
            borderRadius:8
          }}
        >
          {p.nome}

          <button
            onClick={()=>excluirProduto(p.id)}
            style={{
              marginLeft:20,
              background:"red",
              color:"#fff",
              border:"none",
              padding:"5px 10px",
              borderRadius:6,
              cursor:"pointer"
            }}
          >
            Excluir
          </button>

        </div>
      ))}

    </div>
  );
}