import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { QRCodeCanvas } from "qrcode.react";

export default function Financeiro(){

const [lancamentos,setLancamentos] = useState([]);
const [empresaId,setEmpresaId] = useState(null);
const [carregando,setCarregando] = useState(true);
const [pixAtual,setPixAtual] = useState(null);
const [pixChave,setPixChave] = useState("");

useEffect(()=>{
carregarUsuario();
},[]);


// ================= USUARIO

async function carregarUsuario(){

const { data:{ user } } = await supabase.auth.getUser();

const { data:usuario } = await supabase
.from("usuarios")
.select("empresa_id")
.eq("id",user.id)
.single();

setEmpresaId(usuario.empresa_id);

await buscarPix(usuario.empresa_id);
await carregarLancamentos(usuario.empresa_id);

setCarregando(false);

}


// ================= BUSCAR PIX

async function buscarPix(empId){

const { data } = await supabase
.from("empresas")
.select("pix_chave")
.eq("id",empId)
.single();

setPixChave(data?.pix_chave || "");

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


// ================= CRC16

function crc16(payload){

let polinomio = 0x1021;
let resultado = 0xFFFF;

for(let i=0;i<payload.length;i++){

resultado ^= payload.charCodeAt(i) << 8;

for(let j=0;j<8;j++){

if((resultado <<= 1) & 0x10000){
resultado ^= polinomio;
}

resultado &= 0xFFFF;

}

}

return resultado.toString(16).toUpperCase().padStart(4,"0");

}


// ================= GERAR PIX OFICIAL

function gerarPayload(valor){

const chave = pixChave;
const valorFormatado = Number(valor).toFixed(2);

let payload =
"000201" +
"26360014BR.GOV.BCB.PIX01" +
String(chave.length).padStart(2,"0") +
chave +
"52040000" +
"5303986" +
"54" + String(valorFormatado.length).padStart(2,"0") + valorFormatado +
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
return <div style={{padding:20}}>Carregando...</div>
}


return(

<div style={{padding:20}}>

<h1>💰 Financeiro</h1>

{lancamentos.map(l=>{

const payloadPix = gerarPayload(l.valor);

return(

<div
key={l.id}
style={{
border:"1px solid #333",
padding:15,
marginBottom:20,
borderRadius:10,
background:"#111"
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


{pixAtual?.id === l.id && (

<div
style={{
marginTop:20,
padding:15,
background:"#0f172a",
borderRadius:10,
textAlign:"center"
}}
>

<h3>Pagamento PIX</h3>

<p>Valor: R$ {Number(l.valor).toFixed(2)}</p>

<br/>

<QRCodeCanvas
value={payloadPix}
size={180}
/>

<br/><br/>

<textarea
value={payloadPix}
readOnly
style={{
width:"100%",
height:70,
borderRadius:6
}}
/>

<br/><br/>

<button
onClick={()=>navigator.clipboard.writeText(payloadPix)}
style={{
background:"#22c55e",
color:"#fff",
border:"none",
padding:"10px 16px",
borderRadius:6
}}
>

📋 Copiar PIX

</button>

</div>

)}

</div>

)

})}

</div>

)

}