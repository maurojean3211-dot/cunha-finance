import { useState } from "react";
import { supabase } from "./supabase";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [nome, setNome] = useState("");
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

  // 🔥 CRIAR CONTA COMPLETA (CORRIGIDO)
  async function criarConta() {
    try {
      if (!nome || !email || !senha) {
        alert("Preencha nome, email e senha");
        return;
      }

      setLoading(true);

      // 🔹 1. cria login COM nome no metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome,
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

      // 🔹 2. verifica se já existe empresa
      let { data: empresa } = await supabase
        .from("empresas")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      // 🔹 se não existir, cria
      if (!empresa) {
        const { data: novaEmpresa, error: erroEmpresa } = await supabase
          .from("empresas")
          .insert([
            {
              name: nome,
              email: email,
              tipo: "Empresa",
              plano: "Básico",
              status: "Ativo"
            },
          ])
          .select()
          .single();

        if (erroEmpresa || !novaEmpresa) {
          console.log(erroEmpresa);
          alert("Erro ao criar empresa");
          return;
        }

        empresa = novaEmpresa;
      }

      // 🔹 3. salva usuario
      const { error: erroUsuario } = await supabase
        .from("usuarios")
        .insert([
          {
            id: data.user.id,
            nome: nome,
            email: email,
            cpf: cpf,
            whatsapp: whatsapp,
            empresa_id: empresa.id,
            tipo_usuario: "ADMIN",
          },
        ]);

      if (erroUsuario) {
        console.log(erroUsuario);
        alert("Erro ao salvar usuário");
        return;
      }

      alert("Conta criada com sucesso! 🎉");

    } catch (err) {
      console.log(err);
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
        placeholder="Nome completo"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

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