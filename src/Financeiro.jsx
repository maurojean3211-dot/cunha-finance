import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { QRCodeCanvas } from "qrcode.react";

// 🔥 PIX
function gerarPixBR(chave, nome, cidade, valor) {

  chave = String(chave).replace(/\D/g, "");

  function format(id, value) {
    const size = value.length.toString().padStart(2, "0");
    return id + size + value;
  }

  function limparTexto(txt, max) {
    return txt
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .substring(0, max);
  }

  let pix = "";

  pix += format("00", "01");

  pix += format("26",
    format("00", "br.gov.bcb.pix") +
    format("01", chave)
  );

  pix += format("52", "0000");
  pix += format("53", "986");
  pix += format("54", Number(valor).toFixed(2));
  pix += format("58", "BR");
  pix += format("59", limparTexto(nome, 25));
  pix += format("60", limparTexto(cidade, 15));
  pix += format("62", format("05", String(Date.now()).slice(-10)));

  function crc16(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
      }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
  }

  pix += "6304";
  pix += crc16(pix);

  return pix;
}

export default function Financeiro(){

const [lancamentos,setLancamentos] = useState([]);
const [carregando,setCarregando] = useState(true);
const [pixAtual,setPixAtual] = useState(null);
const [pixChave,setPixChave] = useState("");
const [empresaId,setEmpresaId] = useState(null);

// INIT
useEffect(()=>{
iniciar();
},[]);

async function iniciar(){

try{

setCarregando(true);

const { data: { user } } = await supabase.auth.getUser();

if(!user){
alert("Usuário não logado");
return;
}

const { data } = await supabase
.from("usuarios")
.select("empresa_id")
.eq("id", user.id)
.maybeSingle();

if(!data?.empresa_id){
alert("Empresa não encontrada");
return;
}

setEmpresaId(data.empresa_id);

await buscarPix(data.empresa_id);
await carregarLancamentos(data.empresa_id);

}catch(e){
console.log(e);
alert("Erro ao iniciar sistema");
}finally{
setCarregando(false);
}

}

// PIX
async function buscarPix(empId){
const { data } = await supabase
.from("empresas")
.select("pix_chave")
.eq("id",empId)
.maybeSingle();

setPixChave(String(data?.pix_chave || ""));
}

// LANCAMENTOS
async function carregarLancamentos(empId){
const { data } = await supabase
.from("lancamentos")
.select("*")
.eq("empresa_id",empId)
.order("data_lancamento",{ascending:false})
.limit(50);

setLancamentos(data || []);
}

// 🔥 EXCLUIR (CORRIGIDO COM SEGURANÇA)
async function excluirLancamento(id){

try{

if(!id){
alert("Erro: ID não encontrado");
return;
}

const confirmar = confirm("Deseja excluir esse lançamento?");
if(!confirmar) return;

const { error } = await supabase
.from("lancamentos")
.delete()
.eq("id", id)
.eq("empresa_id", empresaId); // 🔥 CORREÇÃO

if(error){
console.log(error);
alert("Erro ao excluir");
return;
}

alert("Excluído com sucesso!");
await carregarLancamentos(empresaId);

}catch(e){
console.log(e);
alert("Erro inesperado ao excluir");
}

}

// PIX UI
function gerarPix(l){
setPixAtual(l.id === pixAtual?.id ? null : l);
}

// 🔥 SIMPLES
function gerarCodigoPix(){
return String(pixChave).replace(/\D/g,"");
}

// COPIAR
function copiarPix(codigo){
navigator.clipboard.writeText(codigo);
alert("PIX copiado!");
}

// 🔥 WHATSAPP
function cobrarWhatsApp(l){

let numero = (l.whatsapp || "").replace(/\D/g,"");
if(numero.length === 11) numero = "55" + numero;

const mensagem = `Olá 😊

📱 ${l.descricao || "Produto"}
💰 Valor: R$ ${Number(l.valor).toFixed(2).replace(".",",")}

PIX: ${String(pixChave).replace(/\D/g,"")}

Pode realizar o pagamento hoje?
Fico no aguardo do comprovante 👍

Cunha Finance`;

window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`);
}

// UI
if(carregando){
return <div style={{padding:20,color:"#fff"}}>Carregando...</div>;
}

return(

<div style={{padding:20}}>

<h1>💰 CUNHA FINANCE</h1>

{lancamentos.map(l=>{

const codigoPix = gerarCodigoPix();

return(

<div key={l.id} style={{
border:"1px solid #333",
padding:15,
marginBottom:15,
borderRadius:8
}}>

<strong>{l.tipo}</strong><br/>
{l.descricao}<br/>
💰 R$ {Number(l.valor).toFixed(2).replace(".",",")}

<br/>

📦 Parcela {l.parcela || 1}/{l.total_parcelas || 1}<br/>
📅 {l.vencimento ? new Date(l.vencimento).toLocaleDateString("pt-BR") : "-"}

<br/><br/>

<div style={{display:"flex",gap:10}}>

<button onClick={()=>gerarPix(l)}>PIX</button>
<button onClick={()=>cobrarWhatsApp(l)}>📲 WhatsApp</button>

<button 
onClick={()=>excluirLancamento(l.id)}
style={{background:"#dc2626",color:"#fff"}}
>
🗑 Excluir
</button>

</div>

{pixAtual?.id === l.id && (

<div style={{marginTop:10}}>

<div style={{background:"#111",padding:10,borderRadius:6}}>
<strong>Chave PIX:</strong>
<div style={{marginTop:5,color:"#00ff88"}}>{codigoPix}</div>
</div>

<button onClick={()=>copiarPix(codigoPix)} style={{marginTop:10}}>
📋 Copiar PIX
</button>

</div>

)}

</div>

)

})}

</div>

);

}