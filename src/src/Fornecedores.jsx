import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Fornecedores() {

  const [fornecedores, setFornecedores] = useState([]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  // =============================
  // CARREGAR FORNECEDORES
  // =============================
  async function carregar() {
    const { data, error } = await supabase
      .from("fornecedores")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Erro ao carregar:", error);
      alert("Erro ao carregar fornecedores");
      return;
    }

    setFornecedores(data || []);
  }

  // =============================
  // SALVAR
  // =============================
  async function salvar(e) {
    e.preventDefault();

    if (!nome.trim()) {
      alert("Digite o nome");
      return;
    }

    const { error } = await supabase
      .from("fornecedores")
      .insert([
        {
          nome,
          telefone,
          cidade,
        },
      ]);

    if (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar fornecedor");
      return;
    }

    setNome("");
    setTelefone("");
    setCidade("");

    carregar();
  }

  // =============================
  // EXCLUIR
  // =============================
  async function excluir(id) {
    if (!window.confirm("Excluir fornecedor?")) return;

    const { error } = await supabase
      .from("fornecedores")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir");
      return;
    }

    carregar();
  }

  // =============================
  // TELA
  // =============================
  return (
    <div style={{ padding: 20 }}>
      <h1>🏭 Fornecedores</h1>

      <form onSubmit={salvar}>
        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />

        <input
          placeholder="Cidade"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
        />

        <button type="submit">Salvar</button>
      </form>

      <hr />

      {fornecedores.length === 0 && (
        <p>Nenhum fornecedor cadastrado</p>
      )}

      {fornecedores.map((f) => (
        <div key={f.id} style={{ marginBottom: 8 }}>
          <strong>{f.nome}</strong> — {f.cidade}

          <button
            onClick={() => excluir(f.id)}
            style={{ marginLeft: 10 }}
          >
            Excluir
          </button>
        </div>
      ))}
    </div>
  );
}