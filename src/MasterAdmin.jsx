import { useEffect, useState } from "react";
import { supabase } from "./supabase";

import {
LineChart,
Line,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
BarChart,
Bar,
PieChart,
Pie,
Cell,
Legend
} from "recharts";

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

const [ativos,setAtivos]=useState(0);
const [bloqueados,setBloqueados]=useState(0);
const [faturamento,setFaturamento]=useState(0);

const [dadosDiarios,setDadosDiarios]=useState([]);
const [dadosMensais,setDadosMensais]=useState([]);

useEffect(()=>{
carregarClientes();
},[]);



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

const lista = data || [];

setClientes(lista);

let ativosCount=0;
let bloqueadosCount=0;
let faturamentoTotal=0;

const dias={};
const meses={};

lista.forEach(c=>{

const statusCliente = c.status || "Ativo";

if(statusCliente==="Ativo") ativosCount++;
if(statusCliente==="Bloqueado") bloqueadosCount++;

if(!c.isento){

if(c.plano==="Básico") faturamentoTotal+=49;
if(c.plano==="Premium") faturamentoTotal+=99;
if(c.plano==="Enterprise") faturamentoTotal+=199;

}

if(c.created_at){

const dataCriacao = new Date(c.created_at);

const dia = dataCriacao.toISOString().split("T")[0];
const mes = dataCriacao.getMonth()+1;

if(!dias[dia]) dias[dia]=0;
if(!meses[mes]) meses[mes]=0;

dias[dia]++;
meses[mes]++;

}

});

setAtivos(ativosCount);
setBloqueados(bloqueadosCount);
setFaturamento(faturamentoTotal);

let graficoDia = Object.keys(dias).map(d=>({
dia:d,
clientes:dias[d]
}));

if(graficoDia.length===0){
graficoDia=[{dia:"Sem dados",clientes:0}]
}

const nomesMes=[
"Jan","Fev","Mar","Abr","Mai","Jun",
"Jul","Ago","Set","Out","Nov","Dez"
];

let graficoMes = Object.keys(meses).map(m=>({
mes:nomesMes[m-1],
clientes:meses[m]
}));

if(graficoMes.length===0){
graficoMes=[{mes:"Sem dados",clientes:0}]
}

setDadosDiarios(graficoDia);
setDadosMensais(graficoMes);

}



// ================= CADASTRAR OU EDITAR CLIENTE

async function cadastrarCliente(){

if(!nome){
alert("Preencha o nome da empresa");
return;
}

if(editandoId){

const { error } = await supabase
.from("empresas")
.update({
name:nome,
email:email,
cpf:cpf,
whatsapp:whatsapp
})
.eq("id",editandoId);

if(error){
alert(error.message);
return;
}

setEditandoId(null);

}else{

const { error } = await supabase
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

if(error){
alert(error.message);
return;
}

}

setNome("");
setEmail("");
setCpf("");
setWhatsapp("");

carregarClientes();

}



// ================= EDITAR CLIENTE

function editarCliente(c){

setEditandoId(c.id);

setNome(c.name || "");
setEmail(c.email || "");
setCpf(c.cpf || "");
setWhatsapp(c.whatsapp || "");

window.scrollTo({ top: 0, behavior: "smooth" });

}



// ================= EXCLUIR CLIENTE

async function excluirCliente(id){

await supabase
.from("empresas")
.delete()
.eq("id",id);

carregarClientes();

}



// ================= ALTERAR STATUS

async function alterarStatus(cliente){

const novoStatus = cliente.status === "Ativo" ? "Bloqueado" : "Ativo";

await supabase
.from("empresas")
.update({status:novoStatus})
.eq("id",cliente.id);

carregarClientes();

}



// ================= ISENTAR CLIENTE

async function alternarIsencao(cliente){

await supabase
.from("empresas")
.update({isento:!cliente.isento})
.eq("id",cliente.id);

carregarClientes();

}



const dadosPizza = [
{ name:"Ativos", value: ativos },
{ name:"Bloqueados", value: bloqueados }
];

const cores = ["#22c55e","#ef4444"];



return(

<div style={{padding:30,color:"#fff"}}>

<h1>👑 Painel de Clientes do Sistema</h1>



{/* FORMULÁRIO */}

<div style={{
background:"#111827",
padding:20,
borderRadius:10,
marginTop:20,
marginBottom:30,
display:"flex",
gap:10,
flexWrap:"wrap"
}}>

<input
placeholder="Nome"
value={nome}
onChange={e=>setNome(e.target.value)}
style={{padding:8,borderRadius:6,border:"none"}}
/>

<input
placeholder="Email"
value={email}
onChange={e=>setEmail(e.target.value)}
style={{padding:8,borderRadius:6,border:"none"}}
/>

<input
placeholder="CPF"
value={cpf}
onChange={e=>setCpf(e.target.value)}
style={{padding:8,borderRadius:6,border:"none"}}
/>

<input
placeholder="WhatsApp"
value={whatsapp}
onChange={e=>setWhatsapp(e.target.value)}
style={{padding:8,borderRadius:6,border:"none"}}
/>

<button
onClick={cadastrarCliente}
style={{
padding:"8px 15px",
background:"#22c55e",
border:"none",
borderRadius:6,
color:"#fff",
cursor:"pointer"
}}
>
{editandoId ? "Salvar Alteração" : "Cadastrar Cliente"}
</button>

</div>



{/* CARDS */}

<div style={{display:"flex",gap:20,marginTop:20,marginBottom:30}}>

<Card titulo="Clientes Ativos" valor={ativos}/>
<Card titulo="Clientes Bloqueados" valor={bloqueados}/>
<Card titulo="Faturamento Mensal" valor={`R$ ${faturamento}`}/>

</div>



{/* GRÁFICOS */}

<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,marginBottom:40}}>

<div>

<h3>📊 Clientes por dia</h3>

<LineChart width={400} height={250} data={dadosDiarios}>
<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="dia"/>
<YAxis/>
<Tooltip/>
<Line type="monotone" dataKey="clientes" stroke="#22c55e" strokeWidth={3}/>
</LineChart>

</div>

<div>

<h3>📈 Crescimento mensal</h3>

<BarChart width={400} height={250} data={dadosMensais}>
<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="mes"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="clientes" fill="#3b82f6"/>
</BarChart>

</div>

</div>



{/* PIZZA */}

<div style={{marginBottom:40}}>

<h3>🍕 Distribuição de Clientes</h3>

<PieChart width={400} height={300}>
<Pie data={dadosPizza} dataKey="value" nameKey="name" outerRadius={100} label>
{dadosPizza.map((entry,index)=>(
<Cell key={index} fill={cores[index]} />
))}
</Pie>
<Legend/>
</PieChart>

</div>



{/* TABELA */}

<table style={{width:"100%",background:"#111827",borderRadius:10}}>

<thead>
<tr>
<th style={th}>Tipo</th>
<th style={th}>Nome</th>
<th style={th}>Email</th>
<th style={th}>CPF</th>
<th style={th}>WhatsApp</th>
<th style={th}>Plano</th>
<th style={th}>Status</th>
<th style={th}>Isento</th>
<th style={th}>Ações</th>
</tr>
</thead>

<tbody>

{clientes.map(c=>(

<tr key={c.id}>

<td style={td}>{c.tipo || "-"}</td>
<td style={td}>{c.name || "-"}</td>
<td style={td}>{c.email || "-"}</td>
<td style={td}>{c.cpf || "-"}</td>
<td style={td}>{c.whatsapp || "-"}</td>
<td style={td}>{c.plano || "-"}</td>
<td style={td}>{c.status || "Ativo"}</td>
<td style={td}>{c.isento ? "Sim" : "Não"}</td>

<td style={td}>

<button onClick={()=>editarCliente(c)} style={botaoEditar}>Editar</button>

<button onClick={()=>alterarStatus(c)} style={botaoStatus}>
{c.status==="Ativo" ? "Bloquear" : "Ativar"}
</button>

<button onClick={()=>alternarIsencao(c)} style={botaoIsento}>
{c.isento ? "Remover Isenção" : "Isentar"}
</button>

<button onClick={()=>excluirCliente(c.id)} style={botaoExcluir}>
Excluir
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

);

}



// COMPONENTE CARD

function Card({titulo,valor}){
return(
<div style={{background:"#111827",padding:20,borderRadius:10,minWidth:180}}>
<h4>{titulo}</h4>
<p style={{fontSize:22,fontWeight:"bold",color:"#22c55e"}}>
{valor}
</p>
</div>
);
}



const botaoEditar={
marginRight:10,
padding:8,
background:"#6366f1",
border:"none",
borderRadius:6,
color:"#fff",
cursor:"pointer"
};

const botaoStatus={
marginRight:10,
padding:8,
background:"#f59e0b",
border:"none",
borderRadius:6,
color:"#fff",
cursor:"pointer"
};

const botaoIsento={
marginRight:10,
padding:8,
background:"#3b82f6",
border:"none",
borderRadius:6,
color:"#fff",
cursor:"pointer"
};

const botaoExcluir={
padding:8,
background:"#ef4444",
border:"none",
borderRadius:6,
color:"#fff",
cursor:"pointer"
};

const th={
padding:10,
borderBottom:"1px solid #333"
};

const td={
padding:10,
textAlign:"center"
};