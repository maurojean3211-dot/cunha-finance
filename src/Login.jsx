import { useState } from "react";
import { supabase } from "./supabase";

export default function Login({ onLogin }) {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function entrar() {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password: senha
      });

    if (error) {
      alert(error.message);
      return;
    }

    onLogin(data.user);
  }

  async function cadastrar() {
    const { error } =
      await supabase.auth.signUp({
        email,
        password: senha
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Conta criada! Faça login.");
  }

  return (
    <div style={{maxWidth:300,margin:"120px auto",color:"white"}}>
      <h2>💜 Cunha Finance</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={e=>setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={e=>setSenha(e.target.value)}
      />

      <button onClick={entrar}>Entrar</button>
      <button onClick={cadastrar}>Criar Conta</button>
    </div>
  );
}