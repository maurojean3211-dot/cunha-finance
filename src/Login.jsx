import { useState } from "react";
import { supabase } from "./supabase";

export default function Login({ onLogin }) {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= LOGIN =================
  async function entrar() {

    if (!email || !senha) {
      alert("Preencha email e senha");
      return;
    }

    setLoading(true);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password: senha
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    onLogin(data.user);
  }

  // ================= CRIAR CONTA =================
  async function cadastrar() {

    if (!email || !senha) {
      alert("Preencha email e senha");
      return;
    }

    setLoading(true);

    // garante que não exista sessão ativa
    await supabase.auth.signOut();

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password: senha,
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("✅ Conta criada! Agora clique em Entrar.");
  }

  return (
    <div style={{
      maxWidth:320,
      margin:"120px auto",
      color:"white",
      textAlign:"center"
    }}>

      <h2>💜 Cunha Finance</h2>

      <input
        style={input}
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
      />

      <input
        style={input}
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e)=>setSenha(e.target.value)}
      />

      <button style={botao} onClick={entrar} disabled={loading}>
        {loading ? "Aguarde..." : "Entrar"}
      </button>

      <button style={botao} onClick={cadastrar} disabled={loading}>
        Criar Conta
      </button>

    </div>
  );
}

const botao={
  marginTop:10,
  padding:12,
  width:"100%",
  borderRadius:8,
  border:"none",
  background:"#8A05BE",
  color:"white",
  fontWeight:"bold",
  cursor:"pointer"
};

const input={
  width:"100%",
  padding:10,
  marginTop:10,
  borderRadius:8,
  border:"none"
};