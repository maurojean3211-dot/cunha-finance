import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function PixVenda({ cliente }){

const chavePix = cliente?.chave_pix || "";
const numero = cliente?.telefone || "";

const [valor,setValor] = useState("");
const [codigoPix,setCodigoPix] = useState("");

// ================= GERAR PIX

function gerarCodigoPix(valor){

if(!chavePix){
alert("Cliente sem chave PIX");
return "";
}

const nome = cliente?.nome || "CLIENTE";
const cidade = "SAOPAULO";

const valorFormatado = Number(valor).toFixed(2);

function campo(id,valor){
return id + valor.length.toString().padStart(2,"0") + valor;
}

let payload =
"000201010212" +
campo("26",
campo("00","BR.GOV.BCB.PIX") +
campo("01",chavePix)
) +
campo("52","0000") +
campo("53","986") +
campo("54",valorFormatado) +
campo("58","BR") +
campo("59",nome.substring(0,25)) +
campo("60",cidade) +
campo("62",campo("05","***"));

function crc16(str){
let crc = 0xFFFF;
for(let c=0;c<str.length;c++){
crc ^= str.charCodeAt(c) << 8;
for(let i=0;i<8;i++){
crc = crc & 0x8000 ? (crc<<1)^0x1021 : crc<<1;
}
}
crc &= 0xFFFF;
return crc.toString(16).toUpperCase().padStart(4,"0");
}

payload += "6304" + crc16(payload + "6304");

return payload;
}

// ================= GERAR

function gerarPix(){

if(!valor){
alert("Digite o valor");
return;
}

const codigo = gerarCodigoPix(valor);

if(!codigo) return;

setCodigoPix(codigo);

}

// ================= COPIAR

function copiarPix(){

if(!codigoPix){
alert("Gere o PIX primeiro");
return;
}

navigator.clipboard.writeText(codigoPix);
alert("PIX copiado");

}

// ================= WHATSAPP

function calcularVencimento(dias){
const data = new Date();
data.setDate(data.getDate() + dias);
return data.toLocaleDateString("pt-BR");
}

function enviarWhatsApp(dias){

if(!codigoPix){
alert("Gere o PIX primeiro");
return;
}

if(!numero){
alert("Cliente sem telefone");
return;
}

const numeroFormatado = numero.replace(/\D/g,"");

const vencimento = calcularVencimento(dias);

const mensagem = `
Olá ${cliente?.nome || ""}! Segue o PIX para pagamento:

💰 Valor: R$ ${Number(valor).toFixed(2)}
📅 Vencimento: ${vencimento}

📌 Código PIX:
${codigoPix}

Obrigado!
`;

const url = `https://wa.me/55${numeroFormatado}?text=${encodeURIComponent(mensagem)}`;

window.open(url, "_blank");

}

// ================= UI

return(

<div style={{padding:"20px"}}>

<h2>Gerar PIX</h2>

<p><strong>Cliente:</strong> {cliente?.nome || "-"}</p>

<input
type="number"
placeholder="Valor da venda"
value={valor}
onChange={(e)=>setValor(e.target.value)}
/>

<br/><br/>

<button onClick={gerarPix}>
Gerar QR Code PIX
</button>

<br/><br/>

{codigoPix && (

<div>

<h3>Pague com PIX</h3>

<QRCodeCanvas value={codigoPix} size={250} />

<br/><br/>

<textarea
value={codigoPix}
readOnly
rows={4}
cols={40}
/>

<br/><br/>

<button onClick={copiarPix}>
📋 Copiar PIX
</button>

<br/><br/>

<div style={{display:"flex",gap:10}}>

<button onClick={()=>enviarWhatsApp(7)}>
📲 Enviar 7 dias
</button>

<button onClick={()=>enviarWhatsApp(15)}>
📲 Enviar 15 dias
</button>

</div>

</div>

)}

</div>

);

}