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
CartesianGrid,
ResponsiveContainer
} from "recharts";

export default function Dashboard(){

const [receitas,setReceitas] = useState(0);
const [despesas,setDespesas] = useState(0);
const [saldo,setSaldo] = useState(0);

const [dadosGrafico,setDadosGrafico] = useState([]);
const [dadosMes,setDadosMes] = useState([]);

const [empresaId,setEmpresaId] = useState(null);
const [carregando,setCarregando] = useState(true);

useEffect(()=>{
iniciar();
},[]);

async function iniciar(){

try{

setCarregando(true);

const { data:{ user } } = await supabase.auth.getUser();

if(!user){
alert("Usuário não logado");
return;
}

// 🔥 BUSCA USUARIO
let { data, error } = await supabase
.from("usuarios")
.select("empresa_id")
.eq("id",user.id)
.single();

// 🔥 SE NÃO EXISTIR EMPRESA → CRIA AUTOMATICO
if(!data || !data.empresa_id){

const { data: novaEmpresa } = await supabase
.from("empresas")
.insert([
{
nome: "Minha Empresa",
user_id: user.id
}
])
.select()
.single();

// atualiza usuario com empresa
await supabase
.from("usuarios")
.update({ empresa_id: novaEmpresa.id })
.eq("id", user.id);

data = { empresa_id: novaEmpresa.id };
}

setEmpresaId(data.empresa_id);

await carregarDados(data.empresa_id);

}catch(e){
console.log(e);
alert("Erro ao carregar dashboard");
}finally{
setCarregando(false);
}

}

async function carregarDados(empId){

const dataLimite = new Date();
dataLimite.setMonth(dataLimite.getMonth()-3);

const { data } = await supabase
.from("lancamentos")
.select("valor, tipo, mes, data_lancamento")
.eq("empresa_id", empId)
.gte("data_lancamento", dataLimite.toISOString())
.limit(200);

calcularDados(data || []);

}

function calcularDados(lista){

let totalReceita = 0;
let totalDespesa = 0;

lista.forEach(l=>{
const tipo = String(l.tipo || "").toLowerCase();
const valor = Number(l.valor || 0);

if(tipo === "receita" || tipo === "receber") totalReceita += valor;
if(tipo === "despesa") totalDespesa += valor;
});

setReceitas(totalReceita);
setDespesas(totalDespesa);
setSaldo(totalReceita - totalDespesa);

setDadosGrafico([
{ name:"Receitas", value: totalReceita },
{ name:"Despesas", value: totalDespesa }
]);

const meses = {};

lista.forEach(l=>{

let mes = Number(l.mes);

if(!mes && l.data_lancamento){
mes = new Date(l.data_lancamento).getMonth()+1;
}

if(!mes) return;

if(!meses[mes]) meses[mes] = 0;

const tipo = String(l.tipo || "").toLowerCase();
const valor = Number(l.valor || 0);

if(tipo === "receita" || tipo === "receber") meses[mes] += valor;
if(tipo === "despesa") meses[mes] -= valor;

});

const nomesMes = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

setDadosMes(
Object.keys(meses)
.sort((a,b)=>a-b)
.map(m=>({
mes: nomesMes[m-1],
valor: meses[m]
}))
);

}

const cores = ["#22c55e","#ef4444"];

if(carregando){
return <div style={{padding:20,color:"#fff"}}>Carregando dashboard...</div>;
}

return(

<div style={{padding:20,color:"#fff"}}>

<h2 style={{marginBottom:20}}>📊 Dashboard</h2>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",
gap:15,
marginBottom:25
}}>

<Card titulo="💰 Receitas" valor={receitas}/>
<Card titulo="💸 Despesas" valor={despesas}/>
<Card titulo="🏦 Saldo" valor={saldo}/>

</div>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",
gap:20
}}>

<div style={{background:"#111827",padding:20,borderRadius:12}}>
<h3>Distribuição</h3>

<ResponsiveContainer width="100%" height={250}>
<PieChart>
<Pie data={dadosGrafico} dataKey="value" outerRadius={90}>
{dadosGrafico.map((e,i)=>(
<Cell key={i} fill={cores[i]} />
))}
</Pie>
<Tooltip/>
<Legend/>
</PieChart>
</ResponsiveContainer>

</div>

<div style={{background:"#111827",padding:20,borderRadius:12}}>
<h3>Mensal</h3>

<ResponsiveContainer width="100%" height={250}>
<LineChart data={dadosMes}>
<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="mes"/>
<YAxis/>
<Tooltip/>
<Line type="monotone" dataKey="valor" stroke="#22c55e"/>
</LineChart>
</ResponsiveContainer>

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
borderRadius:12,
boxShadow:"0 4px 10px rgba(0,0,0,0.3)"
}}>
<h4 style={{marginBottom:10}}>{titulo}</h4>
<p style={{
fontSize:22,
fontWeight:"bold",
color:"#22c55e"
}}>
R$ {Number(valor||0).toFixed(2)}
</p>
</div>
);
}