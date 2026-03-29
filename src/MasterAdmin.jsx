import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function MasterAdmin(){

console.log("MASTER CERTO AGORA");

const [clientes,setClientes]=useState([]);

const [tipo,setTipo]=useState("Empresa");
const [nome,setNome]=useState("");
const [email,setEmail]=useState("");
const [cpf,setCpf]=useState("");
const [whatsapp,setWhatsapp]=useState("");

const [plano,setPlano]=useState("Básico");
const [status,setStatus]=useState("Ativo");

const [valorMensal,setValorMensal]=useState("");

const [editandoId,setEditandoId]=useState(null);

const [pixQr,setPixQr]=useState("");
const [pixCode,setPixCode]=useState("");

useEffect(()=>{
carregarClientes();
},[]);

// ================= PIX

async function gerarPix(cliente){

if(cliente.isento === true){
alert("Cliente isento");
return;
}

let valor = Number(cliente.valor_mensal) || 49;

const response = await fetch("/api/pix",{
method:"POST",
headers:{ "Content-Type":"application/json" },
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

// ================= CARREGAR

async function carregarClientes(){

const { data } = await supabase
.from("empresas")
.select("*")
.order("created_at",{ascending:false});

setClientes(data || []);

}

// ================= CADASTRAR

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
valor_mensal: valorConvertido
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
plano,
status,
tipo,
tipo_sistema:"financeiro",
valor_mensal: valorConvertido
}]);

}

setNome("");
setEmail("");
setCpf("");
setWhatsapp("");
setValorMensal("");

await carregarClientes(); // 🔥 força atualização

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

// ================= ISENÇÃO (CORRIGIDO DE VERDADE)

async function alternarIsencao(cliente){

const novoValor = cliente.isento === true ? false : true;

const { error } = await supabase
.from("empresas")
.update({ isento: novoValor })
.eq("id",cliente.id);

if(error){
console.log(error);
alert("Erro ao alterar isenção");
return;
}

// 🔥 ATUALIZA LOCAL NA HORA (SEM DEPENDER DO BANCO)
setClientes(prev =>
prev.map(c =>
c.id === cliente.id ? { ...c, isento: novoValor } : c
)
);

// 🔥 GARANTE SINCRONIZAÇÃO
await carregarClientes();

}

// ================= ESTILO

const td = {
padding:"10px",
borderBottom:"1px solid #1f2937",
fontSize:"13px"
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

return(

<div style={{padding:30,color:"#fff"}}>

<h1>👑 Painel de Clientes</h1>

{/* FORM */}
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

<input 
placeholder="Valor Mensal (R$)" 
value={valorMensal} 
onChange={e=>setValorMensal(e.target.value)} 
/>

<button style={btn("#2563eb")} onClick={cadastrarCliente}>
{editandoId ? "Salvar" : "Cadastrar"}
</button>

</div>

{/* TABELA */}

<table style={{width:"100%",background:"#111827"}}>

<thead>
<tr>
<th style={td}>Tipo</th>
<th style={td}>Nome</th>
<th style={td}>Email</th>
<th style={td}>CPF</th>
<th style={td}>WhatsApp</th>
<th style={td}>Plano</th>
<th style={td}>Valor</th>
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

<td style={td}>
{c.isento === true ? "Isento" : `R$ ${Number(c.valor_mensal || 49).toFixed(2)}`}
</td>

<td style={td}>{c.status}</td>
<td style={td}>{c.isento === true ? "Sim":"Não"}</td>

<td style={td}>

<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>

<button style={btn("#2563eb")} onClick={()=>editarCliente(c)}>Editar</button>
<button style={btn("#22c55e")} onClick={()=>gerarPix(c)}>PIX</button>

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

);
}