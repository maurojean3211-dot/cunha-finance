import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function MasterAdmin(){

const [clientes,setClientes]=useState([]);

const [nome,setNome]=useState("");
const [email,setEmail]=useState("");
const [cpf,setCpf]=useState("");
const [whatsapp,setWhatsapp]=useState("");
const [valorMensal,setValorMensal]=useState("");

const [editandoId,setEditandoId]=useState(null);

useEffect(()=>{
carregarClientes();
},[]);

// ================= CARREGAR
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

// ================= SALVAR
async function cadastrarCliente(){

if(!nome){
alert("Preencha o nome");
return;
}

const valorConvertido = valorMensal ? Number(valorMensal) : null;

if(editandoId){

await supabase
.from("empresas")
.update({
name:nome,
email,
cpf,
whatsapp,
valor_mensal:valorConvertido
})
.eq("id",editandoId);

setEditandoId(null);

}else{

await supabase
.from("empresas")
.insert([{
name:nome,
email,
cpf,
whatsapp,
tipo:"Empresa",
plano:"Básico",
status:"Ativo",
valor_mensal:valorConvertido
}]);

}

setNome("");
setEmail("");
setCpf("");
setWhatsapp("");
setValorMensal("");

await carregarClientes();
}

// ================= EDITAR
function editarCliente(c){
setEditandoId(c.id);
setNome(c.name || "");
setEmail(c.email || "");
setCpf(c.cpf || "");
setWhatsapp(c.whatsapp || "");
setValorMensal(c.valor_mensal || "");
window.scrollTo({ top:0, behavior:"smooth" });
}

// ================= EXCLUIR
async function excluirCliente(id){
if(!confirm("Excluir cliente?")) return;

await supabase.from("empresas").delete().eq("id",id);
await carregarClientes();
}

// ================= STATUS
async function alterarStatus(cliente){
const novo = cliente.status==="Ativo"?"Bloqueado":"Ativo";

await supabase
.from("empresas")
.update({status:novo})
.eq("id",cliente.id);

await carregarClientes();
}

// ================= ISENÇÃO
async function alternarIsencao(cliente){

const novo = !cliente.isento;

const { error } = await supabase
.from("empresas")
.update({ isento: novo })
.eq("id",cliente.id);

if(error){
console.log(error);
alert("Erro ao alterar isenção");
return;
}

await carregarClientes();
}

// ================= ESTILO

const thtd = {
padding:"12px",
borderBottom:"1px solid #1f2937",
fontSize:"13px",
whiteSpace:"nowrap"
};

const btn = (bg) => ({
padding:"6px 10px",
fontSize:12,
borderRadius:6,
border:"none",
cursor:"pointer",
background:bg,
color:"#fff"
});

// ================= UI

return(

<div style={{
width:"100%",
padding:20,
color:"#fff"
}}>

<h1 style={{marginBottom:20}}>👑 Painel de Clientes</h1>

{/* ===== FORM ===== */}
<div style={{
background:"#111827",
padding:20,
borderRadius:12,
marginBottom:25,

display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
gap:10
}}>

<input placeholder="Nome" value={nome} onChange={e=>setNome(e.target.value)} />
<input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
<input placeholder="CPF" value={cpf} onChange={e=>setCpf(e.target.value)} />
<input placeholder="WhatsApp" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} />

<input 
placeholder="Valor Mensal (R$)" 
value={valorMensal} 
onChange={e=>setValorMensal(e.target.value)} 
/>

<button
onClick={cadastrarCliente}
style={{
background:"#06b6d4",
padding:"10px",
borderRadius:8,
border:"none",
color:"#fff",
fontWeight:"bold",
width:"100%"
}}
>
{editandoId ? "Salvar" : "Cadastrar"}
</button>

</div>

{/* ===== TABELA ===== */}
<div style={{
width:"100%",
overflowX:"auto"
}}>

<table style={{
width:"100%",
minWidth:1100,
background:"#111827",
borderRadius:12
}}>

<thead style={{background:"#020617"}}>
<tr>
<th style={thtd}>Tipo</th>
<th style={thtd}>Nome</th>
<th style={thtd}>Email</th>
<th style={thtd}>CPF</th>
<th style={thtd}>WhatsApp</th>
<th style={thtd}>Plano</th>
<th style={thtd}>Valor</th>
<th style={thtd}>Status</th>
<th style={thtd}>Isento</th>
<th style={thtd}>Ações</th>
</tr>
</thead>

<tbody>

{clientes.map(c=>(
<tr key={c.id}>

<td style={thtd}>Empresa</td>
<td style={thtd}><strong>{c.name}</strong></td>
<td style={thtd}>{c.email}</td>
<td style={thtd}>{c.cpf}</td>
<td style={thtd}>{c.whatsapp}</td>
<td style={thtd}>{c.plano}</td>

<td style={thtd}>
{c.isento ? "Isento" : `R$ ${Number(c.valor_mensal || 49).toFixed(2)}`}
</td>

<td style={thtd}>{c.status}</td>
<td style={thtd}>{c.isento ? "Sim":"Não"}</td>

<td style={thtd}>
<div style={{
display:"flex",
gap:6,
flexWrap:"wrap"
}}>

<button style={btn("#06b6d4")} onClick={()=>editarCliente(c)}>Editar</button>
<button style={btn("#22c55e")}>PIX</button>

<button style={btn("#f59e0b")} onClick={()=>alterarStatus(c)}>
{c.status==="Ativo"?"Bloquear":"Ativar"}
</button>

<button style={btn("#9333ea")} onClick={()=>alternarIsencao(c)}>
{c.isento ? "Remover":"Isentar"}
</button>

<button style={btn("#ef4444")} onClick={()=>excluirCliente(c.id)}>
Excluir
</button>

</div>
</td>

</tr>
))}

</tbody>

</table>

</div>

</div>
);
}