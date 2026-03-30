import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Clientes() {

  const [clientes, setClientes] = useState([]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [empresaId, setEmpresaId] = useState(null);

  useEffect(() => {
    iniciar();
  }, []);

  async function iniciar() {

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Usuário não logado");
      return;
    }

    const { data, error } = await supabase
      .from("usuarios")
      .select("empresa_id")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      alert("Usuário não encontrado");
      return;
    }

    if (!data.empresa_id) {
      alert("Usuário sem empresa");
      return;
    }

    setEmpresaId(data.empresa_id);
    carregarClientes(data.empresa_id);
  }

  async function carregarClientes(empId) {

    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("empresa_id", empId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      alert("Erro ao carregar clientes");
      return;
    }

    setClientes(data || []);
  }

  function limparNumero(valor) {
    return valor.replace(/\D/g, "");
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

    if(!telefone){
      alert("Digite o WhatsApp do cliente");
      return;
    }

    const telefoneLimpo = limparNumero(telefone);
    const cpfLimpo = limparNumero(cpf);

    const { data, error } = await supabase
      .from("clientes")
      .insert([
        {
          nome: nome.trim(),
          telefone: telefoneLimpo,
          email: email || null,
          cpf: cpfLimpo || null,
          empresa_id: empresaId
        }
      ])
      .select();

    if(error){
      console.log(error);
      alert("Erro ao salvar cliente");
      return;
    }

    setClientes(prev => [data[0], ...prev]);

    setNome("");
    setTelefone("");
    setEmail("");
    setCpf("");
  }

  async function excluirCliente(id) {

    if (!window.confirm("Excluir cliente?")) return;

    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id", id)
      .eq("empresa_id", empresaId);

    if (error) {
      console.log(error);
      alert("Erro ao excluir");
      return;
    }

    setClientes(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div style={{ padding: 20, color:"#fff" }}>

      <h1>👥 Clientes</h1>

      {!empresaId && (
        <p>Carregando empresa... (aguarde)</p>
      )}

      <input
        placeholder="Nome do cliente"
        value={nome}
        onChange={(e)=>setNome(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="WhatsApp"
        value={telefone}
        onChange={(e)=>setTelefone(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="Email (opcional)"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="CPF (opcional)"
        value={cpf}
        onChange={(e)=>setCpf(e.target.value)}
        style={inputStyle}
      />

      <button onClick={salvarCliente} style={buttonStyle}>
        Salvar Cliente
      </button>

      <hr />

      {clientes.map(c => (
        <div key={c.id} style={cardStyle}>

          <div>
            <strong>{c.nome}</strong>
            <br />
            📱 {c.telefone}
            <br />
            {c.email && <>📧 {c.email}<br /></>}
            {c.cpf && <>🧾 {c.cpf}</>}
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
  padding:10,
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
  cursor:"pointer",
  marginBottom:10
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
  padding:12,
  borderRadius:8,
  marginBottom:10,
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center"
};