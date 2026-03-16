import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { QRCodeCanvas } from "qrcode.react";

export default function Financeiro(){

const [lancamentos,setLancamentos] = useState([]);
const [empresaId,setEmpresaId] = useState(null);
const [carregando,setCarregando] = useState(true);
const [bloqueado,setBloqueado] = useState(false);

const [pixAtual,setPixAtual] = useState(null);
const [pixChave,setPixChave] = useState("");

// ================= CARREGAR USUARIO

useEffect(()=>{
carregarUsuario();
},[]);

async function carregarUsuario(){

try{

const { data:userData } = await supabase.auth.getUser();

if(!userData?.user){
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

if(role === "admin"){
setBloqueado(true);
setCarregando(false);
return;
}

if(!empId){
setCarregando(false);
return;
}

setEmpresaId(empId);

await buscarPix(empId);
await carregarLancamentos(empId);

}catch(err){

console.log(err);

}

setCarregando(false);

}

// ================= BUSCAR PIX DA EMPRESA

async function buscarPix(empId){

const { data } = await supabase
.from("empresas")
.select("pix_chave")
.eq("id",empId)
.single();

if(data?.pix_chave){
setPixChave(data.pix_chave);
}

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
console.log(error);
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

function gerarPix(l){

setPixAtual(l);

}

// ================= FORMATAR DATA

function formatarData(data){

if(!data) return "";

return new Date(data).toLocaleDateString("pt-BR");

}

// ================= TEXTO PIX

const textoPix = pixAtual
? `PIX\nChave:${pixChave}\nValor:${Number(pixAtual.valor).toFixed(2)}`
: "";

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

<button
onClick={()=>gerarPix(l)}
style={{
marginRight:10,
background:"#16a34a",
color:"#fff",
border:"none",
padding:"6px 10px",
borderRadius:6
}}

>

💳 Gerar PIX </button>

<button onClick={()=>excluir(l.id)}>
🗑 Excluir </button>

</div>

))}

{/* PIX */}

{pixAtual && (

<div style={{textAlign:"center",marginTop:30}}>

<h2>Pagamento PIX</h2>

<p><strong>Valor:</strong> R$ {Number(pixAtual.valor).toFixed(2)}</p>

<p><strong>Chave PIX:</strong> {pixChave}</p>

<br/>

<QRCodeCanvas
value={textoPix}
size={240}
/>

<br/><br/>

<button
onClick={()=>navigator.clipboard.writeText(pixChave)}
style={{
background:"#10b981",
color:"#fff",
border:"none",
padding:"8px 16px",
borderRadius:6
}}

>

Copiar chave PIX </button>

</div>

)}

</div>

);

}
