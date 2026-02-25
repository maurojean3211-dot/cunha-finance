import { useState, useEffect } from "react";
import { supabase } from "./supabase";

import Login from "./Login";
import Clientes from "./Clientes";
import Admin from "./Admin";
import Produtos from "./Produtos";
import Vendas from "./Vendas"; // ✅ NOVO

export default function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [pagina, setPagina] = useState("dashboard");

  // ==============================
  // BUSCAR ROLE DO USUÁRIO
  // ==============================
  async function buscarRole(usuario) {
    try {
      const emailLogin = usuario.email.trim().toLowerCase();

      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", emailLogin)
        .single();

      if (error || !data) {
        setRole("cliente");
        return;
      }

      const roleUsuario = String(data.role || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

      if (roleUsuario.includes("admin")) {
        setRole("admin");
      } else {
        setRole("cliente");
      }
    } catch (err) {
      console.log("Erro ao buscar role:", err);
      setRole("cliente");
    }
  }

  // ==============================
  // LOGIN SESSION
  // ==============================
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        buscarRole(data.session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        buscarRole(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ==============================
  // SE NÃO ESTIVER LOGADO
  // ==============================
  if (!session) {
    return <Login />;
  }

  // ==============================
  // LAYOUT SISTEMA
  // ==============================
  return (
    <div style={{ display: "flex" }}>
      {/* MENU LATERAL */}
      <div
        style={{
          width: 220,
          background: "#111",
          color: "#fff",
          minHeight: "100vh",
          padding: 20,
        }}
      >
        <h2>Cunha Finance</h2>

        <p>✅ {role === "admin" ? "Administrador" : "Cliente"}</p>

        <button onClick={() => setPagina("dashboard")}>Dashboard</button>
        <br /><br />

        <button onClick={() => setPagina("clientes")}>Clientes</button>
        <br /><br />

        <button onClick={() => setPagina("produtos")}>Produtos</button>
        <br /><br />

        {/* ✅ NOVO BOTÃO */}
        <button onClick={() => setPagina("vendas")}>Vendas</button>
        <br /><br />

        {role === "admin" && (
          <>
            <button onClick={() => setPagina("admin")}>Admin</button>
          </>
        )}

        <br /><br />

        <button onClick={() => supabase.auth.signOut()}>
          Sair
        </button>
      </div>

      {/* CONTEÚDO */}
      <div style={{ flex: 1, padding: 20 }}>
        {pagina === "dashboard" && <h1>Dashboard</h1>}

        {pagina === "clientes" && <Clientes />}

        {pagina === "produtos" && <Produtos />}

        {/* ✅ NOVA TELA */}
        {pagina === "vendas" && <Vendas />}

        {pagina === "admin" && role === "admin" && <Admin />}
      </div>
    </div>
  );
}