import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");

  useEffect(() => {
    buscarClientes();
  }, []);

  // ==============================
  // BUSCAR CLIENTES
  // ==============================
  async function buscarClientes() {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setClientes(data || []);
  }

  // ==============================
  // SALVAR CLIENTE
  // ==============================
  async function salvarCliente() {
    if (!nome.trim()) {
      alert("Digite o nome do cliente");
      return;
    }

    const { error } = await supabase.from("clientes").insert([
      {
        nome: nome.trim(),
        cpf: cpf || null,
        telefone: telefone || null,
        endereco: endereco || null,
      },
    ]);

    if (error) {
      console.log(error);
      alert("Erro ao salvar cliente");
      return;
    }

    alert("✅ Cliente salvo!");

    setNome("");
    setCpf("");
    setTelefone("");
    setEndereco("");

    buscarClientes();
  }

  // ==============================
  // EXCLUIR CLIENTE
  // ==============================
  async function excluirCliente(id) {
    const confirmar = window.confirm("Deseja excluir este cliente?");
    if (!confirmar) return;

    await supabase.from("clientes").delete().eq("id", id);

    buscarClientes();
  }

  // ==============================
  // TELA
  // ==============================
  return (
    <div style={{ padding: 20 }}>
      <h1>👥 Cadastro de Clientes</h1>

      <input
        placeholder="Nome do cliente"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="CPF"
        value={cpf}
        onChange={(e) => setCpf(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Endereço"
        value={endereco}
        onChange={(e) => setEndereco(e.target.value)}
      />
      <br /><br />

      <button onClick={salvarCliente}>
        Salvar Cliente
      </button>

      <hr />

      <h3>Clientes cadastrados</h3>

      {clientes.map((c) => (
        <div key={c.id} style={{ marginBottom: 10 }}>
          <b>{c.nome}</b><br />
          CPF: {c.cpf || "-"}<br />
          Telefone: {c.telefone || "-"}<br />
          Endereço: {c.endereco || "-"}
          <br />

          <button
            onClick={() => excluirCliente(c.id)}
            style={{
              marginTop: 5,
              background: "red",
              color: "#fff",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Excluir
          </button>
        </div>
      ))}
    </div>
  );
}