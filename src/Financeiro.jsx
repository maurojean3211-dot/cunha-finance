import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Financeiro(){

const [lancamentos,setLancamentos] = useState([]);
const [empresaId,setEmpresaId] = useState(null);
const [carregando,setCarregando] = useState(true);
const [bloqueado,setBloqueado] = useState(false);

// ================= CARREGAR USUARIO

useEffect(()=>{
carregarUsuario();
},[]);

async function carregarUsuario(){

try{

const { data:userData } = await supabase.auth.getUser();

if(!userData?.user){
console.warn("Usuário não logado");
setCarregando(false);
return;
}

const { data:usuario, error } = await supabase
.from("usuarios")
.select("empresa_id, role")
.eq("id",userData.user.id)
.single();

if(error){
console.log("Erro usuario:",error);
setCarregando(false);
return;
}

const empId = usuario?.empresa_id;
const role = usuario?.role;

// ===== BLOQUEAR ADMIN

if(role === "admin"){
console.warn("Admin não acessa financeiro");
setBloqueado(true);
setCarregando(false);
return;
}

if(!empId){
console.warn("Empresa não vinculada ao usuário");
setCarregando(false);
return;
}

setEmpresaId(empId);

await carregarLancamentos(empId);

}catch(err){

console.log("Erro carregar usuario:",err);

}

setCarregando(false);

}

// ================= CARREGAR LANCAMENTOS

async function carregarLancamentos(empId){

if(!empId) return;

const { data, error } = await supabase
.from("lancamentos")
.select("*")
.eq("empresa_id",empId)
.order("data_lancamento",{ascending:false});

if(error){
console.log("Erro lancamentos:",error);
return;
}

setLancamentos(data || []);

}

// ================= EXCLUIR

async function excluir(id){

if(!empresaId) return;

const { error } = await supabase
.from("lancamentos")
.delete()
.eq("id",id)
.eq("empresa_id",empresaId);

if(error){
console.log(error);
alert("Erro ao excluir");
return;
}

carregarLancamentos(empresaId);

}

// ================= FORMATAR DATA

function formatarData(data){

if(!data) return "";

return new Date(data).toLocaleDateString("pt-BR");

}

// ================= TELA CARREGANDO

if(carregando){
return(

<div style={{padding:20}}>
<h2>Carregando dados da empresa...</h2>
</div>
);
}

// ================= BLOQUEIO ADMIN

if(bloqueado){
return(

<div style={{padding:20}}>
<h2>Painel financeiro disponível apenas para empresas.</h2>
</div>
);
}

// ================= TELA

return(

<div style={{padding:20}}>

<h1>💰 Financeiro</h1>

{lancamentos.length === 0 && (

<p>Nenhum lançamento encontrado.</p>
)}

{lancamentos.map(l=>(

<div
key={l.id}
style={{
border:"1px solid #ccc",
padding:10,
marginBottom:10,
borderRadius:6
}}
>

<strong>{l.tipo}</strong>

<br/>

{l.descricao || "-"}

<br/>

📅 {formatarData(l.data_lancamento)}

<br/>

💰 R$ {Number(l.valor || 0).toFixed(2)}

<br/><br/>

<button onClick={()=>excluir(l.id)}>
🗑 Excluir </button>

</div>

))}

</div>

);

}
