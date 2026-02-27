import { useState, useEffect } from "react";
import { supabase } from "./supabase";

import Login from "./Login";
import Clientes from "./Clientes";
import Produtos from "./Produtos";
import Vendas from "./Vendas";
import Admin from "./Admin";

export default function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [pagina, setPagina] = useState("dashboard");

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [receita, setReceita] = useState(false);

  // ================================
  // BUSCAR ROLE
  // ================================
  async function buscarRole(usuario) {
    try {
      if (!usuario?.email) {
        setRole("cliente");
        setLoadingRole(false);
        return;
      }

      const emailLogin = usuario.email.trim();

      console.log("EMAIL LOGIN:", emailLogin);

      const { data } = await supabase
        .from("usuarios")
        .select("role,email")
        .ilike("email", emailLogin)
        .maybeSingle();

      console.log("USUARIO ENCONTRADO:", data);

      if (!data) {
        setRole("cliente");
      } else {
        const roleUsuario = String(data.role || "")
          .trim()
          .toLowerCase();

        setRole(roleUsuario === "admin" ? "admin" : "cliente");
      }
    } catch (err) {
      console.log(err);
      setRole("cliente");
    }

    setLoadingRole(false);
  }

  // ================================
  // SESSION LOGIN
  // ================================
  useEffect(() => {
    async function iniciar() {
      const { data } = await supabase.auth.getSession();

      setSession(data.session);

      if (data.session?.user) {
        await buscarRole(data.session.user);
      } else {
        setLoadingRole(false);
      }
    }

    iniciar();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      if (session?.user) {
        setLoadingRole(true);
        await buscarRole(session.user);
      } else {
        setRole(null);
        setLoadingRole(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ================================
  // SALVAR LANÇAMENTO
  // ================================
  async function salvarLancamento() {
    if (!descricao || !valor) {
      alert("Preencha os campos");
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    if (!user) {
      alert("Usuário não identificado.");
      return;
    }

    const { data: usuarioDB } = await supabase
      .from("usuarios")
      .select("empresa_id")
      .ilike("email", user.email)
      .single();

    const { error } = await supabase.from("lancamentos").insert([
      {
        descricao,
        valor: Number(valor),
        tipo: receita ? "receita" : "despesa",
        usuario_id: user.id,
        empresa_id: usuarioDB?.empresa_id,
      },
    ]);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    alert("✅ Lançamento salvo!");

    setDescricao("");
    setValor("");
    setReceita(false);
  }

  // ================================
  // NÃO LOGADO (🔥 CORREÇÃO DO onLogin)
  // ================================
  if (!session)
    return <Login onLogin={() => window.location.reload()} />;

  // ================================
  // AGUARDAR ROLE
  // ================================
  if (loadingRole) {
    return (
      <div style={{ color: "#fff", padding: 40 }}>
        Carregando usuário...
      </div>
    );
  }

  // ================================
  // LAYOUT
  // ================================
  return (
    <div style={{ display: "flex", background: "#020617" }}>
      {/* MENU */}
      <div
        style={{
          width: 220,
          background: "#111827",
          color: "#fff",
          minHeight: "100vh",
          padding: 20,
        }}
      >
        <h2>Cunha Finance</h2>

        <p>✅ {role === "admin" ? "Administrador" : "Usuário"}</p>

        <button onClick={() => setPagina("dashboard")}>Dashboard</button>
        <br /><br />

        <button onClick={() => setPagina("financeiro")}>Financeiro</button>
        <br /><br />

        <button onClick={() => setPagina("clientes")}>Clientes</button>
        <br /><br />

        <button onClick={() => setPagina("produtos")}>Produtos</button>
        <br /><br />

        <button onClick={() => setPagina("vendas")}>Vendas</button>
        <br /><br />

        {role === "admin" && (
          <>
            <button onClick={() => setPagina("admin")}>Admin</button>
            <br /><br />
          </>
        )}

        <button onClick={() => supabase.auth.signOut()}>
          Sair
        </button>
      </div>

      {/* CONTEÚDO */}
      <div style={{ flex: 1, padding: 20 }}>
        {pagina === "dashboard" && (
          <h1>📊 Bem-vindo ao Cunha Finance</h1>
        )}

        {pagina === "financeiro" && (
          <>
            <h2>➕ Novo Lançamento</h2>

            <input
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
            <br /><br />

            <input
              type="number"
              placeholder="Valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
            <br /><br />

            <label>
              <input
                type="checkbox"
                checked={receita}
                onChange={(e) => setReceita(e.target.checked)}
              />
              Receita
            </label>

            <br /><br />

            <button onClick={salvarLancamento}>
              Salvar Lançamento
            </button>
          </>
        )}

        {pagina === "clientes" && <Clientes />}
        {pagina === "produtos" && <Produtos />}
        {pagina === "vendas" && <Vendas />}
        {pagina === "admin" && role === "admin" && <Admin />}
      </div>
    </div>
  );
}