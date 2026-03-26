import { useState } from "react";
import { supabase } from "./supabase";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 LOGIN
  async function handleLogin() {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (onLogin) onLogin(data.user);

    } catch (err) {
      alert("Erro no login");
    } finally {
      setLoading(false);
    }
  }

  // 🔥 CRIAR CONTA
  async function criarConta() {
    try {
      if (!email || !senha) {
        alert("Preencha email e senha");
        return;
      }

      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            cpf,
            whatsapp,
          },
        },
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (!data.user) {
        alert("Erro ao criar usuário");
        return;
      }

      // 👉 salva na tabela usuarios (opcional)
      const { error: erroTabela } = await supabase
        .from("usuarios")
        .insert([
          {
            id: data.user.id,
            email,
            cpf,
            whatsapp,
          },
        ]);

      if (erroTabela) {
        console.log("Erro ao salvar na tabela:", erroTabela.message);
      }

      alert("Conta criada! Verifique seu email.");

    } catch (err) {
      alert("Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  // 🔥 RECUPERAR SENHA
  async function recuperarSenha() {
    if (!email) {
      alert("Digite seu email primeiro");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      alert(error.message);
    } else {
      alert("Email de recuperação enviado!");
    }
  }

  return (
    <div style={styles.container}>

      <img src="/logo.png" style={styles.logo} />

      <h2>Cunha Finance</h2>

      <input
        style={styles.input}
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

      <input
        style={styles.input}
        placeholder="CPF"
        value={cpf}
        onChange={(e) => setCpf(e.target.value)}
      />

      <input
        style={styles.input}
        placeholder="WhatsApp"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
      />

      <button style={styles.button} onClick={handleLogin}>
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <button style={styles.buttonSec} onClick={criarConta}>
        {loading ? "Aguarde..." : "Criar Conta"}
      </button>

      <p onClick={recuperarSenha} style={styles.link}>
        🔑 Esqueci minha senha
      </p>

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
    width: 120,
    marginBottom: 20,
  },
  input: {
    margin: 5,
    padding: 10,
    width: 240,
    borderRadius: 6,
    border: "none",
  },
  button: {
    marginTop: 10,
    padding: 10,
    width: 240,
    borderRadius: 6,
    border: "none",
    background: "#22c55e",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  buttonSec: {
    marginTop: 5,
    padding: 10,
    width: 240,
    borderRadius: 6,
    border: "none",
    background: "#6366f1",
    color: "#fff",
    cursor: "pointer",
  },
  link: {
    marginTop: 10,
    cursor: "pointer",
    color: "#93c5fd",
  },
};