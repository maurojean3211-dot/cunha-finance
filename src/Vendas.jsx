import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Vendas(){

const [clientes,setClientes] = useState([]);
const [produtos,setProdutos] = useState([]);
const [vendas,setVendas] = useState([]);

const [clienteId,setClienteId] = useState("");
const [clienteWhatsapp,setClienteWhatsapp] = useState("");

const [produtoId,setProdutoId] = useState("");

const [quantidade,setQuantidade] = useState("");
const [precoUnitario,setPrecoUnitario] = useState("");

const [parcelas,setParcelas] = useState(1);
const [intervalo,setIntervalo] = useState(30);
const [dataInicial,setDataInicial] = useState("");

const [pixEmpresa,setPixEmpresa] = useState("");

const [dataVenda,setDataVenda] = useState(
new Date().toISOString().split("T")[0]
);

const [empresaId,setEmpresaId] = useState(null);

useEffect(()=>{
buscarEmpresa();
},[]);

// ================= GERAR PARCELAS

function gerarParcelas(valorTotal, quantidade, dataInicial, intervaloDias){

  const lista = [];
  const valorParcela = (valorTotal / quantidade).toFixed(2);

  let base = new Date(dataInicial);

  for(let i = 1; i <= quantidade; i++){

    let nova = new Date(base);
    nova.setDate(base.getDate() + (intervaloDias * (i - 1)));

    lista.push({
      parcela: i,
      total_parcelas: quantidade,
      valor: valorParcela,
      vencimento: nova.toISOString().split("T")[0]
    });

  }

  return lista;
}

// ================= SELECIONAR CLIENTE 🔥

function selecionarCliente(id){

  setClienteId(id);

  const cliente = clientes.find(c => c.id == id);

  if(cliente){
    setClienteWhatsapp(cliente.whatsapp || "");
  }

}

// ================= BUSCAR EMPRESA

async function buscarEmpresa(){

const { data:{ user } } = await supabase.auth.getUser();
if(!user) return;

const { data } = await supabase
.from("usuarios")
.select("empresa_id")
.eq("id",user.id)
.single();

setEmpresaId(data.empresa_id);

buscarPix(data.empresa_id);
buscarDados(data.empresa_id);

}

// ================= BUSCAR PIX

async function buscarPix(empresa_id){

const { data } = await supabase
.from("empresas")
.select("pix_chave")
.eq("id",empresa_id)
.single();

setPixEmpresa(data?.pix_chave || "");

}

// ================= BUSCAR DADOS

async function buscarDados(empresa_id){

const { data:clientesData } = await supabase
.from("clientes")
.select("*")
.eq("empresa_id",empresa_id);

const { data:produtosData } = await supabase
.from("produtos")
.select("*")
.eq("empresa_id",empresa_id);

const { data:vendasData } = await supabase
.from("vendas")
.select("*")
.eq("empresa_id",empresa_id);

setClientes(clientesData || []);
setProdutos(produtosData || []);
setVendas(vendasData || []);

}

// ================= CALCULOS

const qtd = Number(quantidade) || 0;
const preco = Number(precoUnitario) || 0;

const valorTotal = preco * qtd;
const valorParcela = parcelas > 0 ? valorTotal / parcelas : valorTotal;

// ================= SALVAR VENDA

async function salvarVenda(){

if(!empresaId) return alert("Empresa não carregada");
if(!clienteId) return alert("Selecione o cliente");
if(!dataInicial) return alert("Informe a data inicial");
if(valorTotal <= 0) return alert("Valor inválido");

const { data:{ user } } = await supabase.auth.getUser();

// salva venda
await supabase.from("vendas").insert([{
empresa_id:empresaId,
cliente_id:clienteId,
produto_id:produtoId || null,
kilos:qtd,
preco_unitario:preco,
valor_total:valorTotal,
data_venda:dataVenda,
user_id:user.id
}]);

// gera parcelas
const lista = gerarParcelas(
valorTotal,
Number(parcelas),
dataInicial,
Number(intervalo)
);

// salva financeiro
for(const p of lista){

await supabase.from("lancamentos").insert({
empresa_id: empresaId,
tipo: "RECEBER",
descricao: "Venda parcelada",
cliente: clienteId,
whatsapp: clienteWhatsapp,
valor: p.valor,
parcela: p.parcela,
total_parcelas: p.total_parcelas,
vencimento: p.vencimento
});

}

alert("Venda registrada com parcelas!");

setQuantidade("");
setPrecoUnitario("");
setParcelas(1);

}

// ================= UI

return(

<div style={{padding:20,maxWidth:500}}>

<h1>🛒 Registrar Venda</h1>

<input type="date" value={dataVenda} onChange={e=>setDataVenda(e.target.value)} />

<br/><br/>

<select value={clienteId} onChange={e=>selecionarCliente(e.target.value)}>
<option value="">Selecione o cliente</option>
{clientes.map(c=>(
<option key={c.id} value={c.id}>{c.nome}</option>
))}
</select>

<br/><br/>

<input placeholder="Quantidade" value={quantidade} onChange={e=>setQuantidade(e.target.value)} />

<br/><br/>

<input placeholder="Valor unitário" value={precoUnitario} onChange={e=>setPrecoUnitario(e.target.value)} />

<br/><br/>

<input placeholder="Parcelas" value={parcelas} onChange={e=>setParcelas(e.target.value)} />

<br/><br/>

<input placeholder="Intervalo (dias)" value={intervalo} onChange={e=>setIntervalo(e.target.value)} />

<br/><br/>

<input type="date" value={dataInicial} onChange={e=>setDataInicial(e.target.value)} />

<br/><br/>

<div>
<strong>Total:</strong> R$ {valorTotal.toFixed(2)}<br/>
<strong>Parcela:</strong> R$ {valorParcela.toFixed(2)}
</div>

<br/>

<button
onClick={salvarVenda}
style={{
background:"#16a34a",
color:"#fff",
padding:10,
border:"none",
borderRadius:6
}}
>

💾 Salvar Venda

</button>

</div>

);

}