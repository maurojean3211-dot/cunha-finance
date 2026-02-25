import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [nome, setNome] = useState("");

  useEffect(() => {
    buscarClientes();
  }, []);

  async function buscarClientes() {
    const { data } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });

    setClientes(data || []);
  }

  async function salvarCliente() {
    if (!nome) {
      alert("Digite o nome");
      return;
    }

    await supabase.from("clientes").insert([{ nome }]);

    setNome("");
    buscarClientes();
  }

  // 🔥 EXCLUIR CLIENTE COM SEGURANÇA
  async function excluirCliente(cliente) {
    if (!confirm("Deseja excluir este cliente?")) return;

    // verifica se possui vendas
    const { data: vendas } = await supabase
      .from("vendas")
      .select("*")
      .eq("cliente_id", cliente.id);

    if (vendas.length > 0) {
      alert("Não é possível excluir. Cliente possui vendas registradas.");
      return;
    }

    await supabase
      .from("clientes")
      .delete()
      .eq("id", cliente.id);

    buscarClientes();
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>👥 Cadastro de Clientes</h1>

      <input
        placeholder="Nome do cliente"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <br /><br />

      <button onClick={salvarCliente}>
        Salvar Cliente
      </button>

      <hr style={{ margin: "30px 0" }} />

      <h2>Clientes cadastrados</h2>

      {clientes.map((c) => (
        <div key={c.id} style={{
          background:"#222",
          color:"#fff",
          padding:10,
          marginBottom:10,
          borderRadius:8
        }}>
          {c.nome}

          <button
            style={{
              marginLeft:20,
              background:"red",
              color:"#fff"
            }}
            onClick={() => excluirCliente(c)}
          >
            Excluir
          </button>
        </div>
      ))}
    </div>
  );
}