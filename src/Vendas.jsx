import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Vendas(){

const [clientes,setClientes] = useState([]);
const [produtos,setProdutos] = useState([]);
const [vendas,setVendas] = useState([]);

const [clienteId,setClienteId] = useState("");
const [clienteWhatsapp,setClienteWhatsapp] = useState("");

const [produtoId,setProdutoId] = useState("");
const [descricao,setDescricao] = useState("");

const [quantidade,setQuantidade] = useState("");
const [precoUnitario,setPrecoUnitario] = useState("");

const [parcelas,setParcelas] = useState(1);

const [comissaoProduto,setComissaoProduto] = useState(0);

const [dataVenda,setDataVenda] = useState(
new Date().toISOString().split("T")[0]
);

const [empresaId,setEmpresaId] = useState(null);
const [role,setRole] = useState("cliente");

useEffect(()=>{
buscarEmpresa();
},[]);


async function buscarEmpresa(){

const { data:{ user } } = await supabase.auth.getUser();
if(!user) return;

const { data } = await supabase
.from("usuarios")
.select("empresa_id, role")
.eq("id",user.id)
.single();

if(data){
setEmpresaId(data.empresa_id);
setRole(data.role || "cliente");
buscarDados(data.empresa_id);
}

}


async function buscarDados(empresa_id){

const { data:clientesData } = await supabase
.from("clientes")
.select("*")
.eq("empresa_id",empresa_id)
.order("nome");

const { data:produtosData } = await supabase
.from("produtos")
.select("*")
.eq("empresa_id",empresa_id);

const { data:vendasData } = await supabase
.from("vendas")
.select("*")
.eq("empresa_id",empresa_id)
.order("data_venda",{ascending:false});

setClientes(clientesData || []);
setProdutos(produtosData || []);
setVendas(vendasData || []);

}


function selecionarProduto(id){

setProdutoId(id);

const produto = produtos.find(p=>p.id == id);

if(produto){
setComissaoProduto(Number(produto.comissao || 0));
}

}


function selecionarCliente(id){

setClienteId(id);

const cliente = clientes.find(c=>c.id == id);

if(cliente){
setClienteWhatsapp(cliente.whatsapp || "");
}

}


const qtd = parseFloat(quantidade) || 0;
const preco = parseFloat(precoUnitario) || 0;

const valorTotal = preco * qtd;

const valorParcela = parcelas > 0 ? valorTotal / parcelas : valorTotal;

const comissao = qtd * comissaoProduto;



async function salvarVenda(){

if(!empresaId){
alert("Empresa não carregada");
return;
}

if(qtd <= 0){
alert("Quantidade inválida");
return;
}

const produto = produtos.find(p=>p.id == produtoId);

const { data:{ user } } = await supabase.auth.getUser();

const material = role==="admin"
? produto?.nome
: descricao;


const { data:vendaSalva , error } = await supabase
.from("vendas")
.insert([{
empresa_id:empresaId,
cliente_id:clienteId,
produto_id:produtoId || null,
kilos:qtd,
preco_unitario:preco,
valor_total:valorTotal,
comissao: role==="admin" ? comissao : 0,
data_venda:dataVenda,
material,
user_id:user.id
}])
.select()
.single();


if(error){
console.log(error);
alert("Erro ao salvar venda");
return;
}


// GERAR PARCELAS

for(let i=0;i<parcelas;i++){

let dataParcela = new Date(dataVenda);

dataParcela.setMonth(dataParcela.getMonth()+i);

let mes = dataParcela.getMonth()+1;
let ano = dataParcela.getFullYear();

await supabase
.from("lancamentos")
.insert([{
empresa_id:empresaId,
tipo:"receita",
descricao: material + (parcelas>1 ? ` (${i+1}/${parcelas})` : ""),
valor:valorParcela,
venda_id:vendaSalva.id,
mes,
ano,
status:"pendente"
}]);

}


alert("Venda registrada!");

setQuantidade("");
setPrecoUnitario("");
setDescricao("");
setParcelas(1);

buscarDados(empresaId);

}



function enviarWhatsapp(venda){

if(!clienteWhatsapp){
alert("Cliente não possui WhatsApp cadastrado");
return;
}

const mensagem = encodeURIComponent(
`Olá!

Parcela referente a compra:

${venda.material}

Valor: R$ ${Number(venda.valor_total).toFixed(2)}

Sistema Cunha Finance`
);

window.open(`https://wa.me/55${clienteWhatsapp}?text=${mensagem}`);

}



function formatarData(data){

if(!data) return "";

return new Date(data).toLocaleDateString("pt-BR");

}



return(

<div style={{padding:20}}>

<h1>🛒 Registrar Venda</h1>

<label>Data</label><br/>

<input
type="date"
value={dataVenda}
onChange={e=>setDataVenda(e.target.value)}
/>

<br/><br/>

<select
value={clienteId}
onChange={e=>selecionarCliente(e.target.value)}
>

<option value="">Cliente</option>

{clientes.map(c=>(

<option key={c.id} value={c.id}>
{c.nome}
</option>

))}

</select>

<br/><br/>

<select
value={produtoId}
onChange={e=>selecionarProduto(e.target.value)}
>

<option value="">Produto</option>

{produtos.map(p=>(

<option key={p.id} value={p.id}>
{p.nome}
</option>

))}

</select>

<br/><br/>

<input
type="number"
placeholder="Quantidade"
value={quantidade}
onChange={e=>setQuantidade(e.target.value)}
/>

<br/><br/>

<input
type="number"
placeholder="Valor unitário"
value={precoUnitario}
onChange={e=>setPrecoUnitario(e.target.value)}
/>

<br/><br/>

<input
type="number"
placeholder="Parcelas"
value={parcelas}
onChange={e=>setParcelas(Number(e.target.value))}
min="1"
/>

<br/><br/>

<div style={{marginBottom:15}}>

<strong>Total:</strong> R$ {valorTotal.toFixed(2)}

<br/>

<strong>Valor da parcela:</strong> R$ {valorParcela.toFixed(2)}

</div>


<button onClick={salvarVenda}>
Salvar Venda
</button>

<hr/>

<h2>📋 Vendas</h2>

{vendas.map(v=>(

<div
key={v.id}
style={{
border:"1px solid #ccc",
padding:10,
borderRadius:6,
marginBottom:10
}}
>

📅 {formatarData(v.data_venda)}

<br/>

{v.material}

<br/>

R$ {Number(v.valor_total).toFixed(2)}

<br/>

<button
onClick={()=>enviarWhatsapp(v)}
style={{
marginTop:6,
background:"#22c55e",
color:"#fff",
border:"none",
padding:"6px 12px"
}}
>

📲 Enviar WhatsApp

</button>

</div>

))}

</div>

);

}