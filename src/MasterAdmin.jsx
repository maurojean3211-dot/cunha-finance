import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function MasterAdmin(){

const [clientes,setClientes]=useState([]);

const [tipo,setTipo]=useState("Empresa");
const [nome,setNome]=useState("");
const [email,setEmail]=useState("");
const [cpf,setCpf]=useState("");
const [whatsapp,setWhatsapp]=useState("");

const [plano,setPlano]=useState("Básico");
const [status,setStatus]=useState("Ativo");

const [editandoId,setEditandoId]=useState(null);

const [pixQr,setPixQr]=useState("");
const [pixCode,setPixCode]=useState("");

useEffect(()=>{
carregarClientes();
},[]);

// ================= GERAR PIX

async function gerarPix(cliente){

let valor=49;

if(cliente.plano==="Premium") valor=99;
if(cliente.plano==="Enterprise") valor=199;

const response = await fetch("/api/pix",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
nome:cliente.name,
email:cliente.email,
valor:valor,
descricao:"Mensalidade Cunha Finance"
})
});

const data = await response.json();

if(data){
setPixQr(data.encodedImage || data.qrCode || "");
setPixCode(data.payload || data.copyPaste || "");
}else{
alert("Erro ao gerar PIX");
}

}

// ================= CARREGAR CLIENTES

async function carregarClientes(){

const { data, error } = await supabase
.from("empresas")
.select("*")
.order("created_at",{ascending:false});

if(error){
console.log(error);
return;
}

setClientes(data || []);

}

// ================= CADASTRAR

async function cadastrarCliente(){

if(!nome){
alert("Preencha o nome da empresa");
return;
}

if(editandoId){

await supabase
.from("empresas")
.update({
name:nome,
email:email,
cpf:cpf,
whatsapp:whatsapp
})
.eq("id",editandoId);

setEditandoId(null);

}else{

await supabase
.from("empresas")
.insert([
{
name:nome,
email:email,
cpf:cpf,
whatsapp:whatsapp,
plano:plano,
status:status,
tipo:tipo,
tipo_sistema:"financeiro"
}
]);

}

setNome("");
setEmail("");
setCpf("");
setWhatsapp("");

carregarClientes();

}

// ================= EDITAR

function editarCliente(c){

setEditandoId(c.id);

setNome(c.name || "");
setEmail(c.email || "");
setCpf(c.cpf || "");
setWhatsapp(c.whatsapp || "");

window.scrollTo({ top:0, behavior:"smooth" });

}

// ================= EXCLUIR

async function excluirCliente(id){

const confirmar = confirm("Deseja excluir esse cliente?");
if(!confirmar) return;

await supabase
.from("empresas")
.delete()
.eq("id",id);

carregarClientes();

}

// ================= STATUS

async function alterarStatus(cliente){

const novoStatus = cliente.status==="Ativo"?"Bloqueado":"Ativo";

await supabase
.from("empresas")
.update({status:novoStatus})
.eq("id",cliente.id);

carregarClientes();

}

// ================= ISENÇÃO

async function alternarIsencao(cliente){

await supabase
.from("empresas")
.update({isento:!cliente.isento})
.eq("id",cliente.id);

carregarClientes();

}

// ================= ESTILO TD (🔥 CORRIGIDO)

const td = {
padding:"10px",
borderBottom:"1px solid #1f2937",
textAlign:"left",
whiteSpace:"nowrap",
overflow:"hidden",
textOverflow:"ellipsis",
maxWidth:"180px"
};

return(

<div style={{padding:30,color:"#fff"}}>

<h1>👑 Painel de Clientes do Sistema</h1>

{pixCode && (

<div style={{
background:"#111827",
padding:20,
borderRadius:10,
marginBottom:30
}}>

<h3>💰 PIX Mensalidade</h3>

{pixQr && <img src={pixQr} width={200}/>}

<textarea
value={pixCode}
readOnly
style={{width:"100%",height:80,marginTop:10}}
/>

<button
onClick={()=>navigator.clipboard.writeText(pixCode)}
style={{
marginTop:10,
padding:10,
background:"#22c55e",
border:"none",
borderRadius:6,
color:"#fff"
}}
>
Copiar PIX
</button>

</div>

)}

<div style={{
background:"#111827",
padding:20,
borderRadius:10,
marginBottom:30,
display:"flex",
gap:10,
flexWrap:"wrap"
}}>

<input placeholder="Nome" value={nome} onChange={e=>setNome(e.target.value)} />
<input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
<input placeholder="CPF" value={cpf} onChange={e=>setCpf(e.target.value)} />
<input placeholder="WhatsApp" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} />

<button onClick={cadastrarCliente}>
{editandoId ? "Salvar Alteração" : "Cadastrar Cliente"}
</button>

</div>

{/* 🔥 TABELA CORRIGIDA */}
<table style={{
width:"100%",
background:"#111827",
borderCollapse:"collapse",
tableLayout:"fixed"
}}>

<thead>
<tr style={{borderBottom:"2px solid #374151"}}>
<th style={td}>Tipo</th>
<th style={td}>Nome</th>
<th style={td}>Email</th>
<th style={td}>CPF</th>
<th style={td}>WhatsApp</th>
<th style={td}>Plano</th>
<th style={td}>Status</th>
<th style={td}>Isento</th>
<th style={td}>Ações</th>
</tr>
</thead>

<tbody>

{clientes.map(c=>(

<tr key={c.id}>

<td style={td}>{c.tipo}</td>
<td style={td}>{c.name}</td>
<td style={td}>{c.email}</td>
<td style={td}>{c.cpf}</td>
<td style={td}>{c.whatsapp}</td>
<td style={td}>{c.plano}</td>
<td style={td}>{c.status}</td>
<td style={td}>{c.isento ? "Sim":"Não"}</td>

<td style={td}>

<div style={{display:"flex",flexDirection:"column",gap:5}}>

<button onClick={()=>editarCliente(c)}>Editar</button>
<button onClick={()=>gerarPix(c)}>PIX</button>

<button onClick={()=>alterarStatus(c)}>
{c.status==="Ativo"?"Bloquear":"Ativar"}
</button>

<button onClick={()=>alternarIsencao(c)}>
{c.isento?"Remover Isenção":"Isentar"}
</button>

<button onClick={()=>excluirCliente(c.id)}>
Excluir
</button>

</div>

</td>

</tr>

))}

</tbody>

</table>

</div>

);

}