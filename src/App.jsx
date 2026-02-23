import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Login from "./Login";

const ADMIN_EMAIL = "maurojean3211@gmail.com";

function App() {

  const hoje = new Date();

  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [assinatura, setAssinatura] = useState(null);
  const [loadingPlano, setLoadingPlano] = useState(true);

  const [lancamentos, setLancamentos] = useState([]);

  const mesSelecionado = hoje.getMonth() + 1;
  const anoSelecionado = hoje.getFullYear();

  // ================= AUTH =================
  useEffect(() => {

    async function iniciarAuth() {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoadingAuth(false);
    }

    iniciarAuth();

    const { data:{ subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

    return () => subscription.unsubscribe();

  }, []);

  // ================= LOGOUT =================
  async function sair(){
    await supabase.auth.signOut();
    setUser(null);
  }

  // ================= ASSINATURA =================
  async function carregarAssinatura(usuario) {

    const { data } = await supabase
      .from("assinaturas")
      .select("*")
      .eq("user_id", usuario.id)
      .single();

    setAssinatura(data);
    setLoadingPlano(false);
  }

  // ================= LANÇAMENTOS =================
  async function carregarLancamentos() {

    if (!user) return;

    const { data } = await supabase
      .from("lancamentos")
      .select("*")
      .eq("user_id", user.id)
      .eq("mes", mesSelecionado)
      .eq("ano", anoSelecionado)
      .order("created_at",{ascending:false});

    setLancamentos(data || []);
  }

  useEffect(() => {
    if(user){
      carregarLancamentos();
      carregarAssinatura(user);
    }
  }, [user]);

  // ================= TELAS =================

  if(loadingAuth)
    return <div style={container}>Carregando...</div>;

  if(!user)
    return <Login onLogin={(u)=>setUser(u)} />;

  // 👑 ADMIN
  if(user.email === ADMIN_EMAIL){
    return(
      <div style={container}>
        <div style={app}>
          <h2>👑 Painel Empresa</h2>

          <p>Você está logado como ADMIN</p>

          <button style={botao} onClick={sair}>
            🚪 Sair
          </button>
        </div>
      </div>
    );
  }

  if(loadingPlano)
    return <div style={container}>Verificando plano...</div>;

  // 🔒 BLOQUEIO
  if(assinatura && !assinatura.ativo && !assinatura.isento){
    return(
      <div style={container}>
        <div style={app}>
          <h2>💜 Cunha Finance</h2>
          <h3>Acesso bloqueado</h3>
          <p>Plano mensal: R$ 100,00</p>

          <button style={botao} onClick={sair}>
            🚪 Sair
          </button>
        </div>
      </div>
    );
  }

  // ================= APP NORMAL =================
  return(
    <div style={container}>
      <div style={app}>

        <h2>💜 Cunha Finance</h2>

        <h3>Bem vindo:</h3>
        <p>{user.email}</p>

        <button style={botao} onClick={sair}>
          🚪 Sair
        </button>

        <h3 style={{marginTop:20}}>
          Seus lançamentos: {lancamentos.length}
        </h3>

      </div>
    </div>
  );
}

const container={
  background:"#0a0a0a",
  minHeight:"100vh",
  display:"flex",
  justifyContent:"center",
  padding:20,
  color:"white",
  fontFamily:"sans-serif"
};

const app={width:"100%",maxWidth:420};

const botao={
  marginTop:15,
  padding:12,
  borderRadius:12,
  border:"none",
  background:"#8A05BE",
  color:"white",
  fontWeight:"bold",
  width:"100%",
  cursor:"pointer"
};

export default App;