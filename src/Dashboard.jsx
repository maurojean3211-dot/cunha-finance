import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import {
PieChart,
Pie,
Cell,
Tooltip,
Legend,
LineChart,
Line,
XAxis,
YAxis,
CartesianGrid
} from "recharts";

export default function Dashboard(){

const [receitas,setReceitas] = useState(0);
const [despesas,setDespesas] = useState(0);
const [saldo,setSaldo] = useState(0);

const [dadosGrafico,setDadosGrafico] = useState([]);
const [dadosMes,setDadosMes] = useState([]);

const [carregando,setCarregando] = useState(true);

useEffect(()=>{
iniciar();
},[]);

async function iniciar(){

try{

const { data:{ user } } = await supabase.auth.getUser();

if(!user){
setCarregando(false);
return;
}

// buscar usuario
const { data:usuario,error } = await supabase
.from("usuarios")
.select("empresa_id, role")
.eq("id",user.id)
.single();

if(error){
console.log("Erro usuario:",error);
setCarregando(false);
return;
}

// ===== ADMIN NÃO VÊ FINANCEIRO

if(usuario?.role === "admin"){

setReceitas(0);
setDespesas(0);
setSaldo(0);

setDadosGrafico([
{ name:"Receitas", value:0 },
{ name:"Despesas", value:0 }
]);

setDadosMes([]);

setCarregando(false);
return;

}

const empresaId = usuario?.empresa_id;

if(!empresaId){
console.log("Empresa não encontrada");
setCarregando(false);
return;
}

await carregarDados(empresaId);

}catch(err){

console.log("Erro iniciar dashboard:",err);

}

setCarregando(false);

}

async function carregarDados(empresa_id){

try{

const {data,error} = await supabase
.from("lancamentos")
.select("*")
.eq("empresa_id",empresa_id);

if(error){
console.log("Erro lancamentos:",error);
return;
}

calcularDados(data || []);

}catch(err){

console.log("Erro carregar dados:",err);

}

}

function calcularDados(lista){

let totalReceita=0;
let totalDespesa=0;

lista.forEach(l=>{

const tipo = String(l.tipo || "").toLowerCase();
const valor = Number(l.valor || 0);

if(tipo==="receita"){
totalReceita += valor;
}

if(tipo==="despesa"){
totalDespesa += valor;
}

});

setReceitas(totalReceita);
setDespesas(totalDespesa);
setSaldo(totalReceita-totalDespesa);

setDadosGrafico([
{ name:"Receitas", value:totalReceita },
{ name:"Despesas", value:totalDespesa }
]);

// ===== GRÁFICO MENSAL

const meses={};

lista.forEach(l=>{

let mes = Number(l.mes);

if(!mes && l.data_lancamento){
mes = new Date(l.data_lancamento).getMonth()+1;
}

if(!mes) return;

if(!meses[mes]){
meses[mes]=0;
}

const tipo = String(l.tipo || "").toLowerCase();
const valor = Number(l.valor || 0);

if(tipo==="receita"){
meses[mes]+=valor;
}

if(tipo==="despesa"){
meses[mes]-=valor;
}

});

const nomesMes=[
"Jan","Fev","Mar","Abr","Mai","Jun",
"Jul","Ago","Set","Out","Nov","Dez"
];

const dadosLinha = Object.keys(meses)
.sort((a,b)=>a-b)
.map(m=>({
mes: nomesMes[m-1],
valor: meses[m]
}));

setDadosMes(dadosLinha);

}

const cores=["#22c55e","#ef4444"];

if(carregando){
return(
<div style={{padding:30,color:"#fff"}}>
<h2>Carregando Dashboard...</h2>
</div>
);
}

return(

<div style={{padding:30,color:"#fff"}}>

<h1>📊 Dashboard Financeiro</h1>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:20,
marginBottom:40
}}>

<Card titulo="💰 Receitas" valor={receitas}/>
<Card titulo="💸 Despesas" valor={despesas}/>
<Card titulo="🏦 Saldo" valor={saldo}/>

</div>

<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:40
}}>

<div style={{background:"#111827",padding:20,borderRadius:10}}>

<h3>Distribuição Financeira</h3>

<PieChart width={350} height={300}>

<Pie
data={dadosGrafico}
dataKey="value"
nameKey="name"
cx="50%"
cy="50%"
outerRadius={100}
label
>

{dadosGrafico.map((entry,index)=>(
<Cell key={index} fill={cores[index % cores.length]} />
))}

</Pie>

<Tooltip/>
<Legend/>

</PieChart>

</div>

<div style={{background:"#111827",padding:20,borderRadius:10}}>

<h3>Movimentação Mensal</h3>

<LineChart width={350} height={300} data={dadosMes}>

<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="mes"/>
<YAxis/>
<Tooltip/>

<Line
type="monotone"
dataKey="valor"
stroke="#22c55e"
strokeWidth={3}
/>

</LineChart>

</div>

</div>

</div>

);

}

function Card({titulo,valor}){

return(

<div style={{
background:"#111827",
padding:20,
borderRadius:10
}}>

<h3>{titulo}</h3>

<p style={{
fontSize:24,
fontWeight:"bold",
color:"#22c55e"
}}>
R$ {Number(valor||0).toFixed(2)}
</p>

</div>

);

}