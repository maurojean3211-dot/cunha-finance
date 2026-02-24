import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function Clientes({ user }) {

  const [clientes,setClientes]=useState([]);

  const [nome,setNome]=useState("");
  const [email,setEmail]=useState("");
  const [telefone,setTelefone]=useState("");
  const [cpf,setCpf]=useState("");
  const [valor,setValor]=useState("");
  const [vencimento,setVencimento]=useState("");

  useEffect(()=>{
    carregarClientes();
  },[]);

  async function carregarClientes(){

    const { data } = await supabase
      .from("clientes")
      .select("*")
      .eq("user_id",user.id)
      .order("created_at",{ascending:false});

    setClientes(data || []);
  }

  async function salvarCliente(){

    if(!nome || !valor || !vencimento){
      alert("Preencha nome, valor e vencimento");
      return;
    }

    const { error } = await supabase
      .from("clientes")
      .insert({
        nome,
        email,
        telefone,
        cpf,
        valor_mensal:Number(valor),
        vencimento:Number(vencimento),
        user_id:user.id
      });

    if(error){
      alert(error.message);
      return;
    }

    setNome("");
    setEmail("");
    setTelefone("");
    setCpf("");
    setValor("");
    setVencimento("");

    carregarClientes();
  }

  async function excluir(id){
    await supabase.from("clientes").delete().eq("id",id);
    carregarClientes();
  }

  return(
    <div>

      <h3>👥 Clientes</h3>

      <input placeholder="Nome"
        value={nome}
        onChange={e=>setNome(e.target.value)} />

      <input placeholder="Email"
        value={email}
        onChange={e=>setEmail(e.target.value)} />

      <input placeholder="Telefone"
        value={telefone}
        onChange={e=>setTelefone(e.target.value)} />

      <input placeholder="CPF"
        value={cpf}
        onChange={e=>setCpf(e.target.value)} />

      <input placeholder="Valor mensal"
        type="number"
        value={valor}
        onChange={e=>setValor(e.target.value)} />

      <input placeholder="Dia vencimento (1-31)"
        type="number"
        value={vencimento}
        onChange={e=>setVencimento(e.target.value)} />

      <button onClick={salvarCliente}>
        ➕ Salvar Cliente
      </button>

      {clientes.map(c=>(
        <div key={c.id}>
          <strong>{c.nome}</strong>
          <p>R$ {c.valor_mensal}</p>
          <p>Vence dia {c.vencimento}</p>

          <button onClick={()=>excluir(c.id)}>
            🗑 Excluir
          </button>
        </div>
      ))}

    </div>
  );
}