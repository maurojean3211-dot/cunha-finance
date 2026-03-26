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

if(data){
setEmpresaId(data.empresa_id);
carregarLancamentos(data.empresa_id);
}

}

// ================= CARREGAR LANCAMENTOS

async function carregarLancamentos(empId){

const { data,error } = await supabase
.from("lancamentos")
.select("*")
.eq("empresa_id",empId)
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

// 🔥 BUSCA EMPRESA NA HORA
const { data: usuario } = await supabase
.from("usuarios")
.select("empresa_id")
.eq("id", user.id)
.single();

if(!usuario?.empresa_id){
alert("Empresa não encontrada");
return;
}

const empId = usuario.empresa_id;

if(!descricao || !valor){
alert("Preencha descrição e valor");
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
valor:Number(valor),
mes,
ano,
data_lancamento:dataLancamento
})
.eq("id",editandoId)
.eq("empresa_id",empId);

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
valor:Number(valor),
mes,
ano,
empresa_id: empId,
user_id:user.id,
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

carregarLancamentos(empId);

}

// ================= EDITAR

function editarLancamento(l){

setDescricao(l.descricao);
setValor(l.valor);

let dataFake = `${l.ano}-${String(l.mes).padStart(2,"0")}-01`;
setDataLancamento(dataFake);

setEditandoId(l.id);

}

// ================= EXCLUIR (🔥 CORRIGIDO)

async function excluirLancamento(id){

if(!window.confirm("Excluir lançamento?")) return;

// 🔥 BUSCA EMPRESA NA HORA
const { data:{user} } = await supabase.auth.getUser();

const { data: usuario } = await supabase
.from("usuarios")
.select("empresa_id")
.eq("id", user.id)
.single();

const empId = usuario?.empresa_id;

const { error } = await supabase
.from("lancamentos")
.delete()
.eq("id",id)
.eq("empresa_id",empId);

if(error){
console.log(error);
alert("Erro ao excluir");
return;
}

carregarLancamentos(empId);

}

// ================= GERAR PIX

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

console.log("PIX:",data);

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

<h1>💰 Lançamentos Financeiros</h1>

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

<button
onClick={salvarLancamento}
style={{
background:"#22c55e",
color:"#fff",
border:"none",
padding:"8px 15px",
borderRadius:6,
cursor:"pointer"
}}
>

{editandoId ? "Atualizar" : "Salvar"}

</button>

</div>

<h2>Lista de Lançamentos</h2>

{lancamentos.map(l=>(

<div
key={l.id}
style={{
border:"1px solid #ccc",
padding:12,
marginBottom:10,
borderRadius:6
}}
>

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

<button
onClick={()=>editarLancamento(l)}
style={{
background:"#3b82f6",
color:"#fff",
border:"none",
padding:"6px 12px",
marginTop:8,
marginRight:5,
borderRadius:6,
cursor:"pointer"
}}
>
Editar
</button>

<button
onClick={()=>gerarPix(l)}
style={{
background:"#10b981",
color:"#fff",
border:"none",
padding:"6px 12px",
marginTop:8,
marginRight:5,
borderRadius:6,
cursor:"pointer"
}}
>
Gerar PIX
</button>

<button
onClick={()=>excluirLancamento(l.id)}
style={{
background:"#ef4444",
color:"#fff",
border:"none",
padding:"6px 12px",
marginTop:8,
borderRadius:6,
cursor:"pointer"
}}
>
Excluir
</button>

</div>

))}

</div>

);

}