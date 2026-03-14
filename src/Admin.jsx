import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Admin(){

const [usuario,setUsuario] = useState(null);
const [empresaId,setEmpresaId] = useState(null);

// VENDA
const [cliente,setCliente] = useState("");
const [whatsapp,setWhatsapp] = useState("");
const [descricao,setDescricao] = useState("");
const [quantidade,setQuantidade] = useState("");
const [valorUnitario,setValorUnitario] = useState("");
const [parcelas,setParcelas] = useState(1);

// COMPRA
const [fornecedor,setFornecedor] = useState("");
const [material,setMaterial] = useState("");
const [kilosCompra,setKilosCompra] = useState("");
const [valorCompra,setValorCompra] = useState("");

// ================= CARREGAR USUARIO

useEffect(()=>{

async function carregar(){

const { data } = await supabase.auth.getUser();
if(!data?.user) return;

setUsuario(data.user);

const userId = data.user.id;

const { data:usuarioDB, error } = await supabase
.from("usuarios")
.select("empresa_id")
.eq("id",userId)
.single();

if(error){
console.log("Erro ao buscar usuario:",error);
return;
}

setEmpresaId(usuarioDB?.empresa_id);

}

carregar();

},[]);

// ================= CALCULOS

const totalVenda =
(Number(quantidade || 0) * Number(valorUnitario || 0)).toFixed(2);

const totalCompra =
(Number(kilosCompra || 0) * Number(valorCompra || 0)).toFixed(2);

// ================= SALVAR VENDA

async function salvarVenda(){

if(!empresaId){
alert("Empresa não carregada");
return;
}

if(!descricao || !quantidade || !valorUnitario){
alert("Preencha produto, quantidade e valor");
return;
}

const valorTotal = Number(totalVenda);
const valorParcela = valorTotal / parcelas;

for(let i=0;i<parcelas;i++){

let data = new Date();
data.setMonth(data.getMonth()+i);

const { error } = await supabase
.from("lancamentos")
.insert([{

descricao: descricao + (parcelas>1 ? ` (${i+1}/${parcelas})` : ""),
produto: descricao,
kilos:Number(quantidade),

valor:Number(valorParcela),

tipo:"receita",
categoria:"venda",

status:"pendente",

cliente:cliente,
whatsapp:whatsapp,

data_lancamento:data.toISOString().split("T")[0],
ano:data.getFullYear(),
mes:data.getMonth()+1,

usuario_id:usuario?.id,
empresa_id:empresaId

}]);

if(error){
console.log("Erro ao salvar venda:",error);
alert("Erro ao salvar venda");
return;
}

}

alert("Venda registrada");
window.location.reload();

}

// ================= SALVAR COMPRA

async function salvarCompra(){

if(!empresaId){
alert("Empresa não carregada");
return;
}

if(!fornecedor || !kilosCompra || !valorCompra){
alert("Preencha fornecedor, quantidade e valor");
return;
}

const { error } = await supabase
.from("compras")
.insert([{

fornecedor:fornecedor,
material:material,

kilos:Number(kilosCompra),
preco_compra:Number(valorCompra),

valor_total:Number(totalCompra),

empresa_id:empresaId,
user_id:usuario?.id

}]);

if(error){
console.log("Erro compra:",error);
alert("Erro ao salvar compra");
return;
}

alert("Compra registrada");
window.location.reload();

}

// ================= ENVIAR WHATSAPP

function enviarWhatsapp(){

if(!whatsapp){
alert("Informe o WhatsApp");
return;
}

const mensagem =
`Olá ${cliente}
Sua compra de ${descricao}
Total: R$ ${totalVenda}
Parcelas: ${parcelas}`;

const url =
`https://wa.me/55${whatsapp}?text=${encodeURIComponent(mensagem)}`;

window.open(url);

}

// ================= GERAR PIX

async function gerarPix(){

if(!descricao || !valorUnitario){
alert("Preencha produto e valor");
return;
}

try{

const response = await fetch("/api/pix",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
valor:Number(totalVenda),
descricao:descricao
})

});

const data = await response.json();

console.log("PIX criado:",data);

if(data.qrCode){

const novaJanela = window.open("");
novaJanela.document.write(`
<h2>Pagamento PIX</h2>
<img src="${data.qrCode}" width="250"/>
<p>PIX Copia e Cola:</p>
<textarea rows="5" cols="40">${data.pixCopiaECola}</textarea>
`);

}else{

alert("PIX gerado mas QR Code não retornou");

}

}catch(error){

console.log("Erro PIX:",error);
alert("Erro ao gerar PIX");

}

}

// ================= INPUT STYLE

const input={
width:"100%",
maxWidth:420,
padding:12,
marginBottom:12,
borderRadius:6,
border:"1px solid #475569",
background:"#111827",
color:"#fff"
};

// ================= TELA

return(

<div style={{padding:30,color:"#fff"}}>

<h1>Cunha Finance</h1>

<h2>📦 Registrar Venda</h2>

<input style={input} placeholder="Cliente"
value={cliente}
onChange={(e)=>setCliente(e.target.value)}/>

<input style={input} placeholder="WhatsApp"
value={whatsapp}
onChange={(e)=>setWhatsapp(e.target.value)}/>

<input style={input} placeholder="Produto / Descrição"
value={descricao}
onChange={(e)=>setDescricao(e.target.value)}/>

<input style={input} type="number"
placeholder="Quantidade"
value={quantidade}
onChange={(e)=>setQuantidade(e.target.value)}/>

<input style={input} type="number"
placeholder="Valor unitário"
value={valorUnitario}
onChange={(e)=>setValorUnitario(e.target.value)}/>

<input style={input} type="number"
placeholder="Parcelas"
value={parcelas}
min="1"
onChange={(e)=>setParcelas(Number(e.target.value))}/>

<h3>Total: R$ {totalVenda}</h3>

<button onClick={salvarVenda}>
Salvar Venda
</button>

<button onClick={gerarPix} style={{marginLeft:10}}>
Gerar PIX
</button>

<button onClick={enviarWhatsapp} style={{marginLeft:10}}>
Enviar WhatsApp
</button>

<hr style={{margin:"40px 0"}}/>

<h2>🏭 Registrar Compra</h2>

<input style={input} placeholder="Fornecedor"
value={fornecedor}
onChange={(e)=>setFornecedor(e.target.value)}/>

<input style={input} placeholder="Material"
value={material}
onChange={(e)=>setMaterial(e.target.value)}/>

<input style={input} type="number"
placeholder="Quantidade"
value={kilosCompra}
onChange={(e)=>setKilosCompra(e.target.value)}/>

<input style={input} type="number"
placeholder="Valor unitário"
value={valorCompra}
onChange={(e)=>setValorCompra(e.target.value)}/>

<h3>Total: R$ {totalCompra}</h3>

<button onClick={salvarCompra}>
Salvar Compra
</button>

</div>

);

}