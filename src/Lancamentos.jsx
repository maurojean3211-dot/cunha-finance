import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Lancamentos(){

const [lancamentos,setLancamentos] = useState([]);
const [descricao,setDescricao] = useState("");
const [valor,setValor] = useState("");
const [empresaId,setEmpresaId] = useState(null);

const [editandoId,setEditandoId] = useState(null);

const [dataLancamento,setDataLancamento] = useState(
new Date().toISOString().split("T")[0]
);

// ================= CARREGAR EMPRESA

useEffect(()=>{
carregarEmpresa();
},[]);

async function carregarEmpresa(){

const { data:{user} } = await supabase.auth.getUser();
if(!user) return;

let { data,error } = await supabase
.from("usuarios")
.select("empresa_id")
.eq("id",user.id)
.maybeSingle();

if(error){
console.log("Erro usuario:",error);
return;
}

// 🔥 SE NÃO EXISTIR USUARIO → CRIA
if(!data){
await supabase.from("usuarios").insert([
{
id:user.id,
email:user.email,
nome:user.email
}
]);
data = {};
}

// 🔥 SE NÃO EXISTIR EMPRESA → CRIA
if(!data?.empresa_id){

const { data: novaEmpresa } = await supabase
.from("empresas")
.insert([
{
name:"Minha Empresa",
user_id:user.id
}
])
.select()
.single();

await supabase
.from("usuarios")
.update({ empresa_id:novaEmpresa.id })
.eq("id",user.id);

data = { empresa_id:novaEmpresa.id };
}

if(data?.empresa_id){
setEmpresaId(data.empresa_id);

// 🔥 AGORA CARREGA PESSOAL (NÃO EMPRESA)
carregarLancamentos(user.id);
}

}

// ================= CARREGAR LANCAMENTOS

async function carregarLancamentos(userId){

if(!userId) return;

const { data,error } = await supabase
.from("lancamentos")
.select("*")
.eq("user_id",userId)
.is("empresa_id", null) // 🔥 GARANTE QUE É PESSOAL
.order("id",{ascending:false});

if(error){
console.log("Erro lancamentos:",error);
return;
}

setLancamentos(data || []);

}

// ================= SALVAR

async function salvarLancamento(){

const { data:{user} } = await supabase.auth.getUser();
if(!user){
alert("Usuário não logado");
return;
}

if(!descricao || !valor){
alert("Preencha descrição e valor");
return;
}

const valorNumero = Number(valor);
if(isNaN(valorNumero)){
alert("Valor inválido");
return;
}

let data = new Date(dataLancamento);
let mes = data.getMonth()+1;
let ano = data.getFullYear();

if(editandoId){

const { error } = await supabase
.from("lancamentos")
.update({
descricao,
valor:valorNumero,
mes,
ano,
data_lancamento:dataLancamento
})
.eq("id",editandoId)
.eq("user_id",user.id); // 🔥 SEGURANÇA

if(error){
console.log(error);
alert("Erro ao atualizar");
return;
}

setEditandoId(null);

}else{

const { error } = await supabase
.from("lancamentos")
.insert([
{
descricao,
valor:valorNumero,
mes,
ano,
empresa_id: null, // 🔥 PESSOAL
user_id:user.id, // 🔥 OBRIGATÓRIO
data_lancamento:dataLancamento,
tipo:"receita"
}
]);

if(error){
console.log(error);
alert("Erro ao salvar lançamento");
return;
}

}

setDescricao("");
setValor("");
setDataLancamento(new Date().toISOString().split("T")[0]);

carregarLancamentos(user.id);

}

// ================= EDITAR

function editarLancamento(l){

setDescricao(l.descricao);
setValor(l.valor);

let dataFake = `${l.ano}-${String(l.mes).padStart(2,"0")}-01`;
setDataLancamento(dataFake);

setEditandoId(l.id);

}

// ================= EXCLUIR

async function excluirLancamento(id){

if(!window.confirm("Excluir lançamento?")) return;

const { data:{user} } = await supabase.auth.getUser();
if(!user) return;

const { error: erroDelete } = await supabase
.from("lancamentos")
.delete()
.eq("id",id)
.eq("user_id",user.id); // 🔥 AGORA FUNCIONA

if(erroDelete){
console.log(erroDelete);
alert("Erro ao excluir");
return;
}

carregarLancamentos(user.id);

}

// ================= GERAR PIX (igual)

async function gerarPix(l){

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

if(data.invoiceUrl){
window.open(data.invoiceUrl);
}else{
alert("PIX gerado mas não retornou link");
}

}catch(err){

console.log(err);
alert("Erro ao gerar PIX");

}

}

// ================= TELA

return(

<div style={{padding:20}}>

<h1>💰 Lançamentos Financeiros (Pessoal)</h1>

<div style={{
background:"#f4f4f4",
padding:20,
borderRadius:8,
marginBottom:30
}}>

<label>Data</label><br/>

<input
type="date"
value={dataLancamento}
onChange={(e)=>setDataLancamento(e.target.value)}
/>

<br/><br/>

<input
placeholder="Descrição"
value={descricao}
onChange={(e)=>setDescricao(e.target.value)}
/>

<br/><br/>

<input
type="number"
placeholder="Valor"
value={valor}
onChange={(e)=>setValor(e.target.value)}
/>

<br/><br/>

<button onClick={salvarLancamento}>
{editandoId ? "Atualizar" : "Salvar"}
</button>

</div>

<h2>Lista de Lançamentos</h2>

{lancamentos.map(l=>(

<div key={l.id} style={{
border:"1px solid #ccc",
padding:12,
marginBottom:10,
borderRadius:6
}}>

<strong>{l.descricao}</strong>

<br/>

📅 {l.mes}/{l.ano}

<br/>

<span style={{
color:l.valor < 0 ? "red":"green",
fontWeight:"bold"
}}>
R$ {Number(l.valor).toFixed(2)}
</span>

<br/>

<button onClick={()=>editarLancamento(l)}>Editar</button>
<button onClick={()=>gerarPix(l)}>PIX</button>
<button onClick={()=>excluirLancamento(l.id)}>Excluir</button>

</div>

))}

</div>

);

}