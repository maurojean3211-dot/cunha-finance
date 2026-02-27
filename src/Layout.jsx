import { useState } from "react";
import Dashboard from "./Dashboard";
import Produtos from "./Produtos";
import Clientes from "./Clientes";
import Vendas from "./Vendas";
import { supabase } from "./supabase";

export default function Layout() {
  const [pagina, setPagina] = useState("dashboard");

  async function sair() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  function renderPagina() {
    switch (pagina) {
      case "produtos":
        return <Produtos />;
      case "clientes":
        return <Clientes />;
      case "vendas":
        return <Vendas />;
      default:
        return <Dashboard />;
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* MENU LATERAL */}
      <div
        style={{
          width: 220,
          background: "#111",
          color: "#fff",
          padding: 20,
        }}
      >
        <h2>Cunha Finance</h2>

        <MenuItem texto="🏠 Dashboard" onClick={() => setPagina("dashboard")} />
        <MenuItem texto="📦 Produtos" onClick={() => setPagina("produtos")} />
        <MenuItem texto="👥 Clientes" onClick={() => setPagina("clientes")} />
        <MenuItem texto="🛒 Vendas" onClick={() => setPagina("vendas")} />

        <hr />

        <MenuItem texto="🚪 Sair" onClick={sair} />
      </div>

      {/* CONTEÚDO */}
      <div
        style={{
          flex: 1,
          background: "#f4f6f8",
          overflow: "auto",
        }}
      >
        {renderPagina()}
      </div>
    </div>
  );
}

function MenuItem({ texto, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 10,
        cursor: "pointer",
        marginTop: 10,
        borderRadius: 6,
      }}
      onMouseEnter={(e) =>
        (e.target.style.background = "#333")
      }
      onMouseLeave={(e) =>
        (e.target.style.background = "transparent")
      }
    >
      {texto}
    </div>
  );
}