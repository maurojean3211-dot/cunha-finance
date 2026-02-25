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

  async function buscarClientes() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setClientes(data || []);
  }

  async function salvarCliente() {
    if (!nome) {
      alert("Digite o nome do cliente");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("clientes").insert([
      {
        nome,
        cpf,
        telefone,
        endereco,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.log(error);
      alert("Erro ao salvar cliente");
      return;
    }

    setNome("");
    setCpf("");
    setTelefone("");
    setEndereco("");

    buscarClientes();
  }

  async function excluirCliente(id) {
    await supabase.from("clientes").delete().eq("id", id);
    buscarClientes();
  }

  return (
    <div style={{ padding: 20, color: "#fff" }}>
      <h1>👥 Cadastro de Clientes</h1>

      <input
        style={{ padding: 8, width: 300 }}
        placeholder="Nome do cliente"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <br /><br />

      <input
        style={{ padding: 8, width: 300 }}
        placeholder="CPF"
        value={cpf}
        onChange={(e) => setCpf(e.target.value)}
      />
      <br /><br />

      <input
        style={{ padding: 8, width: 300 }}
        placeholder="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
      />
      <br /><br />

      <input
        style={{ padding: 8, width: 300 }}
        placeholder="Endereço"
        value={endereco}
        onChange={(e) => setEndereco(e.target.value)}
      />
      <br /><br />

      <button
        onClick={salvarCliente}
        style={{
          padding: 10,
          background: "#22c55e",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Salvar Cliente
      </button>

      <hr />

      <h3>Clientes cadastrados</h3>

      {clientes.map((c) => (
        <div
          key={c.id}
          style={{
            marginBottom: 12,
            padding: 12,
            background: "#1f2937",
            borderRadius: 8,
          }}
        >
          <b>{c.nome}</b><br />
          CPF: {c.cpf || "-"}<br />
          Telefone: {c.telefone || "-"}<br />
          Endereço: {c.endereco || "-"}<br />

          <button
            onClick={() => excluirCliente(c.id)}
            style={{
              marginTop: 8,
              background: "red",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
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