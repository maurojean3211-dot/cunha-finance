import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Financeiro(){

const [lancamentos,setLancamentos] = useState([]);
const [empresaId,setEmpresaId] = useState(null);

// ================= CARREGAR USUARIO

useEffect(()=>{
carregarUsuario();
},[]);

async function carregarUsuario(){

const { data:userData } = await supabase.auth.getUser();

if(!userData?.user) return;

const { data:usuario, error } = await supabase
.from("usuarios")
.select("empresa_id")
.eq("id",userData.user.id)
.single();

if(error){
console.log("Erro usuario:",error);
return;
}

const empId = usuario?.empresa_id;

if(!empId) return;

setEmpresaId(empId);

carregarLancamentos(empId);

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

// ================= GERAR PIX

async function gerarPix(l){

if(!empresaId){
alert("Empresa não carregada");
return;
}

try{

const response = await fetch("/api/pix",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
valor:l.valor,
descricao:l.descricao
})
});

const data = await response.json();

console.log("PIX criado:",data);

// ===== MOSTRAR ERRO REAL DO ASAAS

if(data.erro){
alert("Erro ASAAS:\n\n"+JSON.stringify(data.detalhe));
return;
}

if(data.pixCopiaECola){

alert("PIX gerado!\n\nCopie o código:\n\n"+data.pixCopiaECola);
return;

}

if(data.qrCode){

const img = window.open("");
img.document.write("<img src='data:image/png;base64,"+data.qrCode+"' />");
return;

}

alert("PIX gerado mas sem retorno esperado");

}catch(err){

console.log("Erro PIX:",err);
alert("Erro ao gerar PIX");

}

}

// ================= FORMATAR DATA

function formatarData(data){

if(!data) return "";

return new Date(data).toLocaleDateString("pt-BR");

}

// ================= TELA

return(

<div style={{padding:20}}>

<h1>💰 Financeiro</h1>

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

<button
onClick={()=>gerarPix(l)}
style={{
marginRight:10,
background:"#10b981",
color:"#fff",
border:"none",
padding:"6px 10px",
borderRadius:4,
cursor:"pointer"
}}
>
💳 Gerar PIX
</button>

<button onClick={()=>excluir(l.id)}>
🗑 Excluir
</button>

</div>

))}

</div>

);

}