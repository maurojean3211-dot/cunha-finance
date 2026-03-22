import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { QRCodeCanvas } from "qrcode.react";

export default function Financeiro(){

const [lancamentos,setLancamentos] = useState([]);
const [carregando,setCarregando] = useState(true);
const [pixAtual,setPixAtual] = useState(null);
const [pixChave,setPixChave] = useState("");
const [empresaId,setEmpresaId] = useState(null);

// ================= INIT

useEffect(()=>{
iniciar();
},[]);

async function iniciar(){

try{

setCarregando(true);

const { data: { user } } = await supabase.auth.getUser();

if(!user){
alert("Usuário não logado");
setCarregando(false);
return;
}

const { data } = await supabase
.from("usuarios")
.select("empresa_id")
.eq("id", user.id)
.maybeSingle();

if(!data){
alert("Usuário sem empresa vinculada");
setCarregando(false);
return;
}

setEmpresaId(data.empresa_id);

await buscarPix(data.empresa_id);
await carregarLancamentos(data.empresa_id);

}catch(err){
console.error("ERRO GERAL:", err);
alert("Erro ao iniciar sistema");
}finally{
setCarregando(false);
}

}

// ================= BUSCAR PIX

async function buscarPix(empId){

const { data } = await supabase
.from("empresas")
.select("pix_chave")
.eq("id",empId)
.maybeSingle();

setPixChave(String(data?.pix_chave || ""));

}

// ================= LANCAMENTOS

async function carregarLancamentos(empId){

const { data } = await supabase
.from("lancamentos")
.select("*")
.eq("empresa_id",empId)
.order("data_lancamento",{ascending:false});

setLancamentos(data || []);

}

// ================= EXCLUIR

async function excluir(id){

setLancamentos(prev => prev.filter(l => l.id !== id));

const { error } = await supabase
.from("lancamentos")
.delete()
.eq("id",id);

if(error){
alert("Erro ao excluir");
carregarLancamentos(empresaId);
}

}

// ================= PIX

function gerarPix(l){
setPixAtual(l.id === pixAtual?.id ? null : l);
}

function gerarCodigoPix(valor){

if(!pixChave) return "";

const valorFormatado = Number(valor || 0).toFixed(2);

return `PIX:${pixChave}:${valorFormatado}`;
}

// ================= WHATSAPP

function cobrarWhatsApp(l){

let numero = (l.whatsapp || "").replace(/\D/g,"");

if(numero.length === 11){
numero = "55" + numero;
}

if(!numero){
alert("Cliente sem WhatsApp");
return;
}

const mensagem = `Olá ${l.cliente || ""} 👋

🧾 ${l.descricao || ""}
💰 Valor: R$ ${Number(l.valor).toFixed(2)}

📲 PIX: ${pixChave || "Não cadastrado"}

Cunha Finance`;

const link = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

window.open(link,"_blank");

}

// ================= TELA

if(carregando){
return <div style={{padding:20,color:"#fff"}}>Iniciando sistema...</div>;
}

return(

<div style={{padding:20}}>

<h1>💰 Financeiro</h1>

{lancamentos.map(l=>{

const codigoPix = gerarCodigoPix(l.valor);

return(

<div key={l.id} style={{
border:"1px solid #333",
padding:15,
marginBottom:15,
borderRadius:8
}}>

<strong>{l.tipo}</strong>
<br/>
{l.descricao}
<br/>
💰 R$ {Number(l.valor).toFixed(2)}

<br/><br/>

{/* 🔥 BOTÕES BONITOS */}
<div style={{display:"flex",gap:10,flexWrap:"wrap"}}>

<button style={{background:"#2563eb",color:"#fff",padding:10,borderRadius:6}}
onClick={()=>gerarPix(l)}>
PIX
</button>

<button style={{background:"#22c55e",color:"#fff",padding:10,borderRadius:6}}
onClick={()=>cobrarWhatsApp(l)}>
📲 WhatsApp
</button>

<button style={{background:"#16a34a",color:"#fff",padding:10,borderRadius:6}}>
📅 7 dias
</button>

<button style={{background:"#4ade80",color:"#fff",padding:10,borderRadius:6}}>
📅 15 dias
</button>

<button style={{background:"#ef4444",color:"#fff",padding:10,borderRadius:6}}
onClick={()=>excluir(l.id)}>
🗑 Excluir
</button>

</div>

{pixAtual?.id === l.id && (

<div style={{marginTop:10}}>

<QRCodeCanvas value={codigoPix} size={150} />

<textarea value={codigoPix} readOnly style={{width:"100%"}} />

</div>

)}

</div>

)

})}

</div>

);

}