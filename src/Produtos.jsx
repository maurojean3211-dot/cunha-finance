import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");
  const [tipoUnidade, setTipoUnidade] = useState("UN");

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ==============================
  // CARREGAR USUÁRIO
  // ==============================
  useEffect(() => {
    async function carregarUsuario() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoadingUser(false);
    }

    carregarUsuario();
  }, []);

  // ==============================
  // BUSCAR PRODUTOS
  // ==============================
  async function carregarProdutos(usuario) {
    if (!usuario) return;

    const { data } = await supabase
      .from("produtos")
      .select("*")
      .eq("user_id", usuario.id)
      .order("created_at", { ascending: false });

    setProdutos(data || []);
  }

  useEffect(() => {
    if (!loadingUser && user) {
      carregarProdutos(user);
    }
  }, [loadingUser, user]);

  // ==============================
  // SALVAR PRODUTO
  // ==============================
  async function salvarProduto(e) {
    e.preventDefault();

    if (!nome || !preco || estoque === "") {
      alert("Preencha todos os campos");
      return;
    }

    const { error } = await supabase.from("produtos").insert([
      {
        nome,
        preco: Number(preco),
        estoque: Number(estoque),
        tipo_unidade: tipoUnidade,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.log(error);
      alert("Erro ao salvar");
      return;
    }

    setNome("");
    setPreco("");
    setEstoque("");
    setTipoUnidade("UN");

    carregarProdutos(user);
  }

  // ==============================
  // EXCLUIR
  // ==============================
  async function excluirProduto(id) {
    if (!confirm("Deseja excluir?")) return;

    await supabase.from("produtos").delete().eq("id", id);
    carregarProdutos(user);
  }

  if (loadingUser) {
    return <div style={{ padding: 20 }}>Carregando...</div>;
  }

  // ==============================
  // TELA
  // ==============================
  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Produtos - Cunha Finance</h2>

      <form onSubmit={salvarProduto}>
        <input
          placeholder="Nome do produto"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          type="number"
          step="0.01"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />

        <input
          type="number"
          step="0.01"
          placeholder="Estoque inicial"
          value={estoque}
          onChange={(e) => setEstoque(e.target.value)}
        />

        <select
          value={tipoUnidade}
          onChange={(e) => setTipoUnidade(e.target.value)}
        >
          <option value="UN">Peça (UN)</option>
          <option value="KG">Peso (KG)</option>
        </select>

        <button type="submit">Salvar</button>
      </form>

      <hr />

      <h3>Lista de Produtos</h3>

      {produtos.map((p) => (
        <div
          key={p.id}
          style={{
            marginBottom: 10,
            padding: 10,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        >
          <strong>{p.nome}</strong> — R$ {p.preco} / {p.tipo_unidade}
          <br />
          Estoque: {p.estoque}

          <button
            onClick={() => excluirProduto(p.id)}
            style={{
              marginLeft: 15,
              background: "#ff4d4d",
              color: "#fff",
              border: "none",
              padding: "5px 10px",
              borderRadius: 4,
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