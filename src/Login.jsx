import { useState } from "react";
import { supabase } from "./supabase";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {

      if (!email || !senha) {
        alert("Preencha email e senha");
        return;
      }

      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha.trim(),
      });

      if (error) {
        alert("Erro: " + error.message);
        setLoading(false);
        return;
      }

      if (!data?.user) {
        alert("Usuário não encontrado");
        setLoading(false);
        return;
      }

      if (onLogin) {
        onLogin(data.user);
      }

    } catch (err) {
      console.log("Erro inesperado:", err);
      alert("Erro inesperado no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>

      {/* 🔥 LOGO FUNCIONANDO */}
      <img 
        src="/logo.png" 
        alt="Cunha Finance"
        style={styles.logo}
      />

      <h2>Cunha Finance</h2>

      <input
        style={styles.input}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        style={styles.input}
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />

      <button 
        style={styles.button} 
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "#0f172a",
    color: "#fff",
  },
  logo: {
    width: 140,
    marginBottom: 20,
  },
  input: {
    margin: 5,
    padding: 10,
    width: 220,
    borderRadius: 5,
    border: "none",
  },
  button: {
    marginTop: 10,
    padding: 10,
    width: 220,
    borderRadius: 5,
    border: "none",
    background: "#22c55e",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
};