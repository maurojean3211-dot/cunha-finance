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


// ================= GERAR PIX OFICIAL

function gerarCodigoPix(valor){

if(!pixChave) return "";

const nome = "CUNHA";
const cidade = "ITATIBA";

const valorFormatado = Number(valor).toFixed(2);

function campo(id,valor){
return id + valor.length.toString().padStart(2,"0") + valor;
}

let payload =
"000201" +
"010212" +
campo("26",
campo("00","BR.GOV.BCB.PIX") +
campo("01",pixChave)
) +
campo("52","0000") +
campo("53","986") +
campo("54",valorFormatado) +
campo("58","BR") +
campo("59",nome) +
campo("60",cidade) +
campo("62",campo("05","***"));

function crc16(str){

let crc = 0xFFFF;

for(let c=0;c<str.length;c++){

crc ^= str.charCodeAt(c) << 8;

for(let i=0;i<8;i++){

crc = crc & 0x8000
? (crc<<1)^0x1021
: crc<<1;

}

}

crc &= 0xFFFF;

return crc.toString(16).toUpperCase().padStart(4,"0");

}

payload += "6304" + crc16(payload + "6304");

return payload;

}


// ================= COPIAR PIX

function copiarPix(valor){

const codigo = gerarCodigoPix(valor);

if(!codigo){
alert("Erro ao gerar PIX");
return;
}

if(navigator.clipboard && window.isSecureContext){

navigator.clipboard.writeText(codigo)
.then(()=>{

alert("PIX copia e cola copiado!");

})
.catch(()=>{

copiarFallback(codigo);

});

}else{

copiarFallback(codigo);

}

}


// ================= FALLBACK COPIAR

function copiarFallback(texto){

const area = document.createElement("textarea");

area.value = texto;

area.style.position = "fixed";
area.style.left = "-999999px";

document.body.appendChild(area);

area.focus();
area.select();

document.execCommand("copy");

document.body.removeChild(area);

alert("PIX copia e cola copiado!");

}


// ================= TELA

if(carregando){

return <div style={{padding:20}}>Carregando...</div>

}

return(

<div style={{padding:20}}>

<h1>💰 Financeiro</h1>

{lancamentos.map(l=>{

const codigoPix = gerarCodigoPix(Number(l.valor));

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

<p><b>Chave PIX:</b> {pixChave}</p>

<br/>

<QRCodeCanvas
value={codigoPix || "PIX"}
size={220}
bgColor="#ffffff"
fgColor="#000000"
level="H"
includeMargin={true}
/>

<br/><br/>

<textarea
value={codigoPix}
readOnly
style={{
width:"100%",
maxWidth:400,
height:80
}}
/>

<br/><br/>

<button
onClick={()=>copiarPix(Number(l.valor))}
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