import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Clientes() {

  const [clientes, setClientes] = useState([]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [empresaId, setEmpresaId] = useState(null);

  useEffect(() => {
    iniciar();
  }, []);

  async function iniciar() {

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("usuarios")
      .select("empresa_id")
      .eq("id", user.id)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    if (data?.empresa_id) {
      setEmpresaId(data.empresa_id);
      carregarClientes(data.empresa_id);
    }

  }

  async function carregarClientes(empId) {

    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("empresa_id", empId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setClientes(data || []);
  }

  async function salvarCliente(){

    if(!empresaId){
      alert("Empresa ainda não carregou");
      return;
    }

    if(!nome){
      alert("Digite o nome do cliente");
      return;
    }

    const { data, error } = await supabase
      .from("clientes")
      .insert([
        {
          nome: nome.trim(),
          telefone: telefone,
          empresa_id: empresaId
        }
      ])
      .select();

    if(error){
      console.log(error);
      alert("Erro ao salvar cliente");
      return;
    }

    // adiciona cliente na lista imediatamente
    setClientes(prev => [data[0], ...prev]);

    setNome("");
    setTelefone("");

  }

  async function excluirCliente(id) {

    if (!window.confirm("Excluir cliente?")) return;

    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id", id);

    if (error) {
      console.log(error);
      alert("Erro ao excluir");
      return;
    }

    // remove da lista sem precisar buscar novamente
    setClientes(prev => prev.filter(c => c.id !== id));

  }

  return (
    <div style={{ padding: 20, color:"#fff" }}>

      <h1>👥 Clientes</h1>

      <input
        placeholder="Nome do cliente"
        value={nome}
        onChange={(e)=>setNome(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="Telefone"
        value={telefone}
        onChange={(e)=>setTelefone(e.target.value)}
        style={inputStyle}
      />

      <button
        type="button"
        onClick={salvarCliente}
        style={buttonStyle}
      >
        Salvar Cliente
      </button>

      <hr />

      {clientes.map(c => (
        <div key={c.id} style={cardStyle}>

          <div>
            <strong>{c.nome}</strong>
            <br />
            {c.telefone}
          </div>

          <button
            onClick={()=>excluirCliente(c.id)}
            style={deleteStyle}
          >
            Excluir
          </button>

        </div>
      ))}

    </div>
  );
}

const inputStyle = {
  display:"block",
  marginBottom:10,
  padding:8,
  width:"100%",
  borderRadius:6,
  border:"none"
};

const buttonStyle = {
  padding:10,
  borderRadius:6,
  border:"none",
  background:"#2563eb",
  color:"#fff",
  cursor:"pointer"
};

const deleteStyle = {
  padding:6,
  borderRadius:6,
  border:"none",
  background:"#dc2626",
  color:"#fff",
  cursor:"pointer"
};

const cardStyle = {
  background:"#1f2937",
  padding:10,
  borderRadius:6,
  marginBottom:10,
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center"
};