import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { QRCodeCanvas } from "qrcode.react";

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
const [intervalo,setIntervalo] = useState(30); // 🔥 NOVO
const [dataInicial,setDataInicial] = useState(""); // 🔥 NOVO

const [pixEmpresa,setPixEmpresa] = useState("");

const [dataVenda,setDataVenda] = useState(
new Date().toISOString().split("T")[0]
);

const [empresaId,setEmpresaId] = useState(null);

useEffect(()=>{
buscarEmpresa();
},[]);

// ================= GERAR PARCELAS 🔥

function gerarParcelas(valorTotal, quantidade, dataInicial, intervaloDias){

  const parcelas = [];
  const valorParcela = (valorTotal / quantidade).toFixed(2);

  let data = new Date(dataInicial);

  for(let i = 1; i <= quantidade; i++){

    let novaData = new Date(data);
    novaData.setDate(data.getDate() + (intervaloDias * (i - 1)));

    parcelas.push({
      parcela: i,
      total_parcelas: quantidade,
      valor: valorParcela,
      vencimento: novaData.toISOString().split("T")[0]
    });

  }

  return parcelas;
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

const qtd = parseFloat(quantidade) || 0;
const preco = parseFloat(precoUnitario) || 0;

const valorTotal = preco * qtd;
const valorParcela = parcelas > 0 ? valorTotal / parcelas : valorTotal;

// ================= SALVAR VENDA 🔥🔥🔥

async function salvarVenda(){

if(!dataInicial){
alert("Informe a data inicial das parcelas");
return;
}

const { data:{ user } } = await supabase.auth.getUser();

// salva venda normal
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

// 🔥 gera parcelas
const parcelasGeradas = gerarParcelas(
  valorTotal,
  Number(parcelas),
  dataInicial,
  Number(intervalo)
);

// 🔥 salva no financeiro
for(const p of parcelasGeradas){

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

alert("Venda e parcelas criadas!");

setQuantidade("");
setPrecoUnitario("");
setParcelas(1);

}

// ================= TELA

return(

<div style={{padding:20}}>

<h1>🛒 Registrar Venda</h1>

<input type="date" value={dataVenda} onChange={e=>setDataVenda(e.target.value)} />

<br/><br/>

<select value={clienteId} onChange={e=>setClienteId(e.target.value)}>
<option value="">Cliente</option>
{clientes.map(c=>(<option key={c.id} value={c.id}>{c.nome}</option>))}
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

<strong>Total: R$ {valorTotal.toFixed(2)}</strong>
<br/>
<strong>Parcela: R$ {valorParcela.toFixed(2)}</strong>

<br/><br/>

<button onClick={salvarVenda}>
Salvar Venda
</button>

</div>

);

}