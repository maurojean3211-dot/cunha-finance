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

useEffect(()=>{
carregarUsuario();
},[]);


// ================= CARREGAR USUARIO

async function carregarUsuario(){

try{

const { data:userData } = await supabase.auth.getUser();

if(!userData?.user){
setCarregando(false);
return;
}

const { data:usuario } = await supabase
.from("usuarios")
.select("empresa_id, role")
.eq("id",userData.user.id)
.single();

const empId = usuario?.empresa_id;
const role = usuario?.role;

if(role === "admin"){
setBloqueado(true);
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


// ================= BUSCAR PIX

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

const { data } = await supabase
.from("lancamentos")
.select("*")
.eq("empresa_id",empId)
.order("data_lancamento",{ascending:false});

setLancamentos(data || []);

}


// ================= EXCLUIR

async function excluir(id){

await supabase
.from("lancamentos")
.delete()
.eq("id",id);

carregarLancamentos(empresaId);

}


// ================= GERAR PIX

function gerarPix(l){
setPixAtual(l.id === pixAtual?.id ? null : l);
}


// ================= FORMATAR DATA

function formatarData(data){
return new Date(data).toLocaleDateString("pt-BR");
}


// ================= CRC16 (OBRIGATÓRIO NO PIX)

function crc16(str){

let crc = 0xFFFF;

for (let c = 0; c < str.length; c++){

crc ^= str.charCodeAt(c) << 8;

for (let i = 0; i < 8; i++){

if ((crc & 0x8000) !== 0){
crc = (crc << 1) ^ 0x1021;
}else{
crc <<= 1;
}

crc &= 0xFFFF;

}

}

return crc.toString(16).toUpperCase().padStart(4,"0");

}


// ================= GERAR PIX PADRÃO BACEN

function gerarPayloadPix(valor){

const valorFormatado = Number(valor).toFixed(2);

let payload =
"000201" +
"26" +
(14 + pixChave.length).toString().padStart(2,"0") +
"0014BR.GOV.BCB.PIX" +
"01" +
pixChave.length.toString().padStart(2,"0") +
pixChave +
"52040000" +
"5303986" +
"54" +
valorFormatado.length.toString().padStart(2,"0") +
valorFormatado +
"5802BR" +
"5913CUNHA FINANCE" +
"6009SAO PAULO" +
"62070503***" +
"6304";

payload += crc16(payload);

return payload;

}


// ================= TELA

if(carregando){
return(
<div style={{padding:20}}>
<h2>Carregando...</h2>
</div>
);
}

if(bloqueado){
return(
<div style={{padding:20}}>
<h2>Painel financeiro apenas para empresas.</h2>
</div>
);
}


return(

<div style={{padding:20}}>

<h1>💰 Financeiro</h1>

{lancamentos.map(l=>{

const payloadPix = gerarPayloadPix(l.valor);

return(

<div
key={l.id}
style={{
border:"1px solid #2c2c2c",
background:"#111",
padding:15,
marginBottom:20,
borderRadius:10
}}
>

<strong>{l.tipo}</strong>

<br/>

{l.descricao || "-"}

<br/>

📅 {formatarData(l.data_lancamento)}

<br/>

💰 R$ {Number(l.valor).toFixed(2)}

<br/><br/>

<button
onClick={()=>gerarPix(l)}
style={{
marginRight:10,
background:"#16a34a",
color:"#fff",
border:"none",
padding:"8px 14px",
borderRadius:6
}}
>

💳 Gerar PIX

</button>


<button
onClick={()=>excluir(l.id)}
style={{
background:"#2563eb",
color:"#fff",
border:"none",
padding:"8px 14px",
borderRadius:6
}}
>

🗑 Excluir

</button>


{/* QR PIX */}

{pixAtual?.id === l.id && (

<div
style={{
marginTop:15,
padding:15,
background:"#0f172a",
borderRadius:12,
textAlign:"center",
maxWidth:260,
margin:"15px auto"
}}
>

<h3>Pagamento PIX</h3>

<p><b>Valor:</b> R$ {Number(l.valor).toFixed(2)}</p>

<br/>

<QRCodeCanvas
value={payloadPix}
size={180}
/>

<br/><br/>

<button
onClick={()=>navigator.clipboard.writeText(payloadPix)}
style={{
background:"#22c55e",
color:"#fff",
border:"none",
padding:"10px 18px",
borderRadius:8
}}
>

📋 Copiar PIX

</button>

</div>

)}

</div>

);

})}

</div>

);

}