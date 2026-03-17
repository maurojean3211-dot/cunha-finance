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

// ===============================
// CARREGAR SESSÃO
// ===============================

useEffect(()=>{

async function carregarSessao(){

const { data } = await supabase.auth.getSession();

const sess = data?.session || null;

setSession(sess);

if(sess?.user){

const { data:usuario } = await supabase
.from("usuarios")
.select("role")
.eq("id",sess.user.id)
.single();

setRole(usuario?.role || "cliente");

}

setLoadingSession(false);

}

carregarSessao();

const { data:{ subscription } } =
supabase.auth.onAuthStateChange(async (_event,newSession)=>{

setSession(newSession);

if(newSession?.user){

const { data:usuario } = await supabase
.from("usuarios")
.select("role")
.eq("id",newSession.user.id)
.single();

setRole(usuario?.role || "cliente");

}

});

return ()=>{
subscription?.unsubscribe();
};

},[]);

// ===============================
// SAIR
// ===============================

async function sair(){

await supabase.auth.signOut();
window.location.reload();

}

// ===============================
// LOADING
// ===============================

if(loadingSession){

return(

<div style={{
padding:40,
background:"#020617",
color:"#fff",
minHeight:"100vh"
}}>
Carregando sistema...
</div>

);

}

// ===============================
// LOGIN
// ===============================

if(!session){
return <Login />;
}

// ===============================
// SISTEMA
// ===============================

return(

<div style={{
display:"flex",
width:"100%",
minHeight:"100vh",
background:"#020617",
color:"#fff"
}}>

{/* MENU */}

<div style={{
width:220,
background:"#020617",
borderRight:"1px solid #1e293b",
padding:20,
display:"flex",
flexDirection:"column"
}}>

<div>

<h2 style={{marginBottom:20}}>Cunha Finance</h2>

<button
onClick={()=>setPagina("dashboard")}
style={pagina==="dashboard" ? botaoAtivo : botaoMenu}
>
📊 Dashboard
</button>

<button
onClick={()=>setPagina("financeiro")}
style={pagina==="financeiro" ? botaoAtivo : botaoMenu}
>
💰 Financeiro
</button>

{/* LUCRO SOMENTE PARA ADMIN */}

{role === "admin" && (

<button
onClick={()=>setPagina("lucro")}
style={pagina==="lucro" ? botaoAtivo : botaoMenu}
>
📈 Lucro
</button>

)}

<button
onClick={()=>setPagina("despesas")}
style={pagina==="despesas" ? botaoAtivo : botaoMenu}
>
💳 Pessoal
</button>

<button
onClick={()=>setPagina("admin")}
style={pagina==="admin" ? botaoAtivo : botaoMenu}
>
⚙ Sistema
</button>

{role === "admin" && (

<button
onClick={()=>setPagina("master")}
style={pagina==="master" ? botaoAtivo : botaoMenu}
>
👑 Master Admin
</button>

)}

<hr style={{border:"1px solid #334155",margin:"20px 0"}}/>

<button
onClick={sair}
style={{
...botaoMenu,
background:"#ef4444"
}}
>
🚪 Sair
</button>

</div>

</div>

{/* CONTEÚDO */}

<div style={{flex:1,padding:30}}>

{pagina==="dashboard" && <Dashboard />}

{pagina==="financeiro" && <Financeiro />}

{/* PROTEÇÃO EXTRA */}

{pagina==="lucro" && role==="admin" && <Lucro />}

{pagina==="despesas" && <DespesasPessoais />}

{pagina==="admin" && <Admin />}

{pagina==="master" && role==="admin" && <MasterAdmin />}

</div>

</div>

);

}

const botaoMenu={
display:"block",
width:"100%",
padding:10,
marginBottom:10,
background:"#111827",
color:"#fff",
border:"none",
borderRadius:6,
cursor:"pointer"
};

const botaoAtivo={
display:"block",
width:"100%",
padding:10,
marginBottom:10,
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:6,
cursor:"pointer"
};