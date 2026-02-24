export default function Admin({ user, sair }) {
  return (
    <div style={{
      background: "#0a0a0a",
      minHeight: "100vh",
      color: "white",
      padding: 20,
      fontFamily: "sans-serif"
    }}>
      <h1>👑 Painel Administrador</h1>

      <p>Bem-vindo:</p>
      <strong>{user.email}</strong>

      <br /><br />

      <button
        onClick={sair}
        style={{
          padding: 12,
          background: "#8A05BE",
          border: "none",
          borderRadius: 10,
          color: "white",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        🚪 Sair
      </button>
    </div>
  );
}