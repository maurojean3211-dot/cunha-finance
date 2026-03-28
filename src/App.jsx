import { useEffect, useState } from "react";
import { supabase } from "./supabase";

import Login from "./Login";
import Admin from "./Admin";
import Dashboard from "./Dashboard";
import MasterAdmin from "./MasterAdmin";
import Financeiro from "./Financeiro.jsx";
import Lucro from "./Lucro.jsx";
import DespesasPessoais from "./DespesasPessoais.jsx";

export default function App(){

const [session,setSession] = useState(null);
const [loadingSession,setLoadingSession] = useState(true);
const [pagina,setPagina] = useState("dashboard");
const [role,setRole] = useState(null);
const [empresaId,setEmpresaId] = useState(null);
const [isMobile,setIsMobile] = useState(window.innerWidth < 768);

// RESPONSIVO
useEffect(()=>{
function handleResize(){
setIsMobile(window.innerWidth < 768);
}
window.addEventListener("resize",handleResize);
return ()=> window.removeEventListener("resize",handleResize);
},[]);

// ================= SESSÃO
useEffect(()=>{

async function carregarSessao(){

try{

const { data } = await supabase.auth.getSession();
const user = data?.session?.user || null;

setSession(user ? { user } : null);

if(user){

let { data:usuario } = await supabase
.from("usuarios")
.select("tipo_usuario,empresa_id")
.eq("id",user.id)
.maybeSingle();

setEmpresaId(usuario?.empresa_id || null);
setRole(usuario?.tipo_usuario || "usuario");

}

}catch(err){
console.log("Erro sessão:",err);
} finally {
setLoadingSession(false);
}

}

carregarSessao();

const { data:{ subscription } } =
supabase.auth.onAuthStateChange(async (_event,newSession)=>{

setSession(newSession ? { user: newSession.user } : null);

if(newSession?.user){

let { data:usuario } = await supabase
.from("usuarios")
.select("tipo_usuario,empresa_id")
.eq("id",newSession.user.id)
.maybeSingle();

setEmpresaId(usuario?.empresa_id || null);
setRole(usuario?.tipo_usuario || "usuario");

}

});

return ()=>{
subscription?.unsubscribe();
};

},[]);

// ================= LOGOUT
async function sair(){
try{
setSession(null);
setEmpresaId(null);
setRole(null);
setPagina("dashboard");
supabase.auth.signOut();
}catch(err){
console.log("Erro ao sair:", err);
}
}

// ================= LOADING
if(loadingSession){
return <div style={{color:"#fff",padding:20}}>Iniciando sistema...</div>;
}

// ================= LOGIN
if(!session?.user){
return <Login onLogin={(user) => setSession({ user })} />;
}

// ================= APP
return(

<div style={{
display:"flex",
flexDirection: isMobile ? "column" : "row",
width:"100%",
minHeight:"100vh",
background:"#020617",
color:"#fff",
fontFamily:"Arial, sans-serif"
}}>

{/* MENU */}

<div style={{
width: isMobile ? "100%" : 220,
background:"#020617",
borderRight: isMobile ? "none" : "1px solid #1e293b",
borderBottom: isMobile ? "1px solid #1e293b" : "none",
padding:15,
display:"flex",
flexDirection: isMobile ? "row" : "column",
flexWrap: isMobile ? "wrap" : "nowrap",
gap:10,
overflowX: isMobile ? "auto" : "visible"
}}>

<h2 style={{whiteSpace:"nowrap", width:"100%", marginBottom:10}}>
Cunha Finance
</h2>

<button onClick={()=>setPagina("dashboard")} style={pagina==="dashboard" ? botaoAtivo : botaoMenu}>
📊 Dashboard </button>

<button onClick={()=>setPagina("financeiro")} style={pagina==="financeiro" ? botaoAtivo : botaoMenu}>
💰 Financeiro </button>

{role === "ADMIN" && (
<button onClick={()=>setPagina("lucro")} style={pagina==="lucro" ? botaoAtivo : botaoMenu}>
📈 Lucro </button>
)}

<button onClick={()=>setPagina("despesas")} style={pagina==="despesas" ? botaoAtivo : botaoMenu}>
💳 Pessoal </button>

<button onClick={()=>setPagina("admin")} style={pagina==="admin" ? botaoAtivo : botaoMenu}>
⚙ Sistema </button>

{role === "ADMIN" && (
<button onClick={()=>setPagina("master")} style={pagina==="master" ? botaoAtivo : botaoMenu}>
👑 Master Admin </button>
)}

<button onClick={sair} style={{...botaoMenu, background:"#ef4444"}}>
🚪 Sair </button>

</div>

{/* CONTEÚDO */}

<div style={{
flex:1,
display:"flex",
justifyContent:"center",
padding: isMobile ? 10 : 30
}}>

<div style={{
width:"100%",
maxWidth:"100%", // 🔥 CORREÇÃO AQUI (ANTES ERA 1200px)
margin:"0 auto",
padding:20,
borderRadius:12
}}>

{pagina==="dashboard" && <Dashboard />}
{pagina==="financeiro" && <Financeiro empresaId={empresaId} />}
{pagina==="lucro" && role==="ADMIN" && <Lucro />}
{pagina==="despesas" && <DespesasPessoais />}
{pagina==="admin" && <Admin />}
{pagina==="master" && role==="ADMIN" && <MasterAdmin />}

</div>

</div>

</div>

);

}

// ================= ESTILOS

const botaoMenu={
display:"block",
width:"100%",
padding:"10px",
background:"#111827",
color:"#cbd5f5",
border:"none",
borderRadius:8,
cursor:"pointer",
transition:"0.2s"
};

const botaoAtivo={
display:"block",
width:"100%",
padding:"10px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:8,
cursor:"pointer"
};