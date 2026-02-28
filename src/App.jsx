import { useState, useEffect } from "react";
import { supabase } from "./supabase";

import Login from "./Login";
import Dashboard from "./Dashboard";
import Clientes from "./Clientes";
import Produtos from "./Produtos";
import Vendas from "./Vendas";
import Fornecedores from "./Fornecedores";
import Compras from "./Compras";
import Admin from "./Admin";

export default function App() {

  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [pagina, setPagina] = useState("dashboard");

  // =============================
  // SESSÃO
  // =============================
  useEffect(() => {

    async function carregarSessao() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoadingSession(false);
    }

    carregarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();

  }, []);

  // =============================
  // LOADING
  // =============================
  if (loadingSession) {
    return <div style={{ padding: 40 }}>Carregando sistema...</div>;
  }

  // =============================
  // LOGIN
  // =============================
  if (!session) {
    return <Login />;
  }

  // =============================
  // RENDER PÁGINAS (COM PROTEÇÃO)
  // =============================
  function renderPagina() {
    try {

      switch (pagina) {
        case "clientes":
          return <Clientes />;

        case "produtos":
          return <Produtos />;

        case "fornecedores":
          return <Fornecedores />;

        case "compras":
          return <Compras />;

        case "vendas":
          return <Vendas />;

        case "admin":
          return <Admin />;

        default:
          return <Dashboard />;
      }

    } catch (erro) {
      console.error("Erro ao renderizar página:", erro);

      return (
        <div>
          <h2>Erro ao abrir página</h2>
          <p>Veja o console (F12)</p>
        </div>
      );
    }
  }

  // =============================
  // LAYOUT
  // =============================
  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* MENU */}
      <div
        style={{
          width: 220,
          background: "#111827",
          color: "#fff",
          padding: 20,
        }}
      >
        <h2>Cunha Finance</h2>

        <Menu texto="📊 Dashboard" acao={() => setPagina("dashboard")} />
        <Menu texto="👥 Clientes" acao={() => setPagina("clientes")} />
        <Menu texto="📦 Produtos" acao={() => setPagina("produtos")} />
        <Menu texto="🏭 Fornecedores" acao={() => setPagina("fornecedores")} />
        <Menu texto="♻️ Compras" acao={() => setPagina("compras")} />
        <Menu texto="🛒 Vendas" acao={() => setPagina("vendas")} />
        <Menu texto="⚙️ Admin" acao={() => setPagina("admin")} />

        <hr style={{ marginTop: 20 }} />

        <Menu
          texto="🚪 Sair"
          acao={() => supabase.auth.signOut()}
        />
      </div>

      {/* CONTEÚDO */}
      <div
        style={{
          flex: 1,
          padding: 25,
          background: "#020617",
          color: "#fff",
          overflow: "auto",
        }}
      >
        {renderPagina()}
      </div>

    </div>
  );
}

// =============================
// MENU
// =============================
function Menu({ texto, acao }) {
  return (
    <div
      onClick={acao}
      style={{
        padding: 10,
        cursor: "pointer",
        marginTop: 10,
        borderRadius: 6,
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "#1f2937")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "transparent")
      }
    >
      {texto}
    </div>
  );
}