import { useState, useEffect } from "react";
import { supabase } from "./supabase";

import Login from "./Login";
import Clientes from "./Clientes";
import Admin from "./Admin";
import Produtos from "./Produtos";
import Vendas from "./Vendas";

export default function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState("cliente");
  const [pagina, setPagina] = useState("dashboard");

  // ==============================
  // BUSCAR ROLE DO USUÁRIO
  // ==============================
  async function buscarRole(usuario) {
    try {
      if (!usuario?.email) return;

      const emailLogin = usuario.email.trim().toLowerCase();

      const { data } = await supabase
        .from("usuarios")
        .select("role")
        .eq("email", emailLogin)
        .single();

      const roleUsuario = String(data?.role || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      setRole(roleUsuario.includes("admin") ? "admin" : "cliente");
    } catch (err) {
      console.log("Erro ao buscar role:", err);
      setRole("cliente");
    }
  }

  // ==============================
  // SESSION LOGIN
  // ==============================
  useEffect(() => {
    async function carregarSessao() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session?.user) {
        buscarRole(data.session.user);
      }
    }

    carregarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, novaSession) => {
      setSession(novaSession);

      if (novaSession?.user) {
        buscarRole(novaSession.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ==============================
  // NÃO LOGADO
  // ==============================
  if (!session) {
    return <Login />;
  }

  // ==============================
  // LAYOUT PRINCIPAL
  // ==============================
  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#020617",
        color: "#ffffff",
        minHeight: "100vh",
        opacity: 1,
        filter: "none",
      }}
    >
      {/* ================= MENU ================= */}
      <div
        style={{
          width: 220,
          backgroundColor: "#111827",
          color: "#ffffff",
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

      {/* ================= CONTEÚDO ================= */}
      <div
        style={{
          flex: 1,
          padding: 20,
          backgroundColor: "#0f172a",
          color: "#ffffff",
          minHeight: "100vh",
          opacity: 1,
          filter: "none",
        }}
      >
        {pagina === "dashboard" && (
          <h1>📊 Dashboard Cunha Finance</h1>
        )}

        {pagina === "clientes" && <Clientes />}

        {pagina === "produtos" && <Produtos />}

        {pagina === "vendas" && <Vendas />}

        {pagina === "admin" && role === "admin" && <Admin />}
      </div>
    </div>
  );
}