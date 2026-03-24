import { useState } from "react";
import { supabase } from "./supabase";

export default function Login({ onLogin }) {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= LOGIN =================
  async function entrar() {

    if (!email || !senha) {
      alert("Preencha email e senha");
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password: senha
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    const { data: { user } } =
      await supabase.auth.getUser();

    if (typeof onLogin === "function") {
      onLogin(user);
    } else {
      // 🔹 evitar reload completo que quebra no celular
      window.location.href = "/";
    }
  }

  // ================= CRIAR CONTA =================
  async function cadastrar() {

    if (!email || !senha || !cpf || !whatsapp) {
      alert("Preencha email, senha, CPF e WhatsApp");
      return;
    }

    setLoading(true);

    await supabase.auth.signOut();

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password: senha,
      });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    // 🔹 CRIAR EMPRESA AUTOMATICAMENTE
    if (data?.user) {

      const userId = data.user.id;

      const { data:empresaExistente } =
        await supabase
        .from("empresas")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      let empresaId = null;

      if(!empresaExistente){

        const { data:empresaCriada } =
          await supabase
          .from("empresas")
          .insert([
            {
              user_id: userId,
              name: email,
              email: email,
              cpf: cpf,
              whatsapp: whatsapp,
              plano: "Básico",
              status: "Ativo",
              tipo: "Empresa",
              tipo_sistema: "financeiro"
            }
          ])
          .select()
          .single();

        empresaId = empresaCriada?.id;

      }else{
        empresaId = empresaExistente.id;
      }

      await supabase
      .from("usuarios")
      .insert([
        {
          id: userId,
          email: email,
          nome: email,
          role: "cliente",
          empresa_id: empresaId
        }
      ]);

    }

    setLoading(false);

    alert("✅ Conta criada! Agora clique em Entrar.");
  }

  // ================= RECUPERAR SENHA =================
  async function recuperarSenha(){

    if(!email){
      alert("Digite seu email primeiro");
      return;
    }

    const { error } =
      await supabase.auth.resetPasswordForEmail(email,{
        redirectTo: window.location.origin + "/reset"
      });

    if(error){
      alert("Erro ao enviar email");
    }else{
      alert("📧 Email de recuperação enviado!");
    }
  }

  return (
    <div style={container}>

      <div style={box}>

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

        <input
          style={input}
          placeholder="CPF"
          value={cpf}
          onChange={(e)=>setCpf(e.target.value)}
        />

        <input
          style={input}
          placeholder="WhatsApp"
          value={whatsapp}
          onChange={(e)=>setWhatsapp(e.target.value)}
        />

        <button style={botao} onClick={entrar} disabled={loading}>
          {loading ? "Aguarde..." : "Entrar"}
        </button>

        <button style={botao} onClick={cadastrar} disabled={loading}>
          Criar Conta
        </button>

        <p
          style={esqueci}
          onClick={recuperarSenha}
        >
          🔑 Esqueci minha senha
        </p>

      </div>

    </div>
  );
}

// ===== ESTILO =====

const container={
  background:"#0a0a0a",
  minHeight:"100vh",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  color:"white",
  fontFamily:"sans-serif"
};

const box={
  width:"100%",
  maxWidth:350,
  textAlign:"center"
};

const botao={
  marginTop:12,
  padding:14,
  width:"100%",
  borderRadius:10,
  border:"none",
  background:"#8A05BE",
  color:"white",
  fontWeight:"bold",
  cursor:"pointer",
  fontSize:"15px"
};

const input={
  width:"100%",
  padding:12,
  marginTop:10,
  borderRadius:8,
  border:"none",
  fontSize:"14px"
};

const esqueci={
  marginTop:15,
  cursor:"pointer",
  color:"#8A05BE",
  fontWeight:"bold"
};