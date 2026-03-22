import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function DespesasPessoais(){

const [lancamentos,setLancamentos] = useState([]);

const [tipo,setTipo] = useState("despesa");
const [categoria,setCategoria] = useState("Supermercado");
const [descricao,setDescricao] = useState("");
const [valor,setValor] = useState("");

const [dataLancamento,setDataLancamento] = useState(
new Date().toISOString().split("T")[0]
);

// ================= CARREGAR

useEffect(()=>{
carregar();
},[]);

async function carregar(){

const { data: lista, error } = await supabase
.from("despesas")
.select("*")
.order("data_lancamento",{ascending:false});

if(error){
console.log("Erro carregar:", error);
alert("Erro ao carregar dados");
return;
}

setLancamentos(lista || []);
}

// ================= SALVAR (VERSÃO FINAL ESTÁVEL)

async function salvar(){

if(!descricao || !valor){
alert("Preencha descrição e valor");
return;
}

// 🔥 GARANTE VALOR NUMÉRICO
const valorNumero = Number(valor);

if(isNaN(valorNumero)){
alert("Valor inválido");
return;
}

// 🔥 GARANTE DATA VÁLIDA
let dataFormatada;

try{
dataFormatada = new Date(dataLancamento)
.toISOString()
.split("T")[0];
}catch{
alert("Data inválida");
return;
}

// 🔥 INSERT LIMPO (SEM EMPRESA_ID / SEM UUID)
const { error } = await supabase
.from("despesas")
.insert([{
tipo: tipo || "despesa",
categoria: categoria || "Outros",
descricao: descricao.trim(),
valor: valorNumero,
data_lancamento: dataFormatada
}]);

if(error){
console.log("ERRO REAL:", error);
alert("Erro real: " + error.message);
return;
}

alert("Salvo com sucesso!");

setDescricao("");
setValor("");

await carregar();
}

// ================= EXCLUIR

async function excluir(id){

const { error } = await supabase
.from("despesas")
.delete()
.eq("id",id);

if(error){
console.log("Erro excluir:", error);
alert("Erro ao excluir");
return;
}

await carregar();
}

// ================= UI

return(

<div style={{padding:20,maxWidth:800,margin:"0 auto"}}>

<h1>💳 Finanças Pessoais</h1>

<h2>Novo Lançamento</h2>

<input
type="date"
value={dataLancamento}
onChange={e=>setDataLancamento(e.target.value)}
/>

<br/><br/>

<select value={tipo} onChange={e=>setTipo(e.target.value)}>
<option value="despesa">Despesa</option>
<option value="receita">Receita</option>
</select>

<br/><br/>

<select value={categoria} onChange={e=>setCategoria(e.target.value)}>
<option>Supermercado</option>
<option>Gasolina</option>
<option>Aluguel</option>
<option>Luz</option>
<option>Água</option>
<option>Internet</option>
<option>Farmácia</option>
<option>Outros</option>
</select>

<br/><br/>

<input
placeholder="Descrição"
value={descricao}
onChange={e=>setDescricao(e.target.value)}
/>

<br/><br/>

<input
type="number"
placeholder="Valor"
value={valor}
onChange={e=>setValor(e.target.value)}
/>

<br/><br/>

<button onClick={salvar}>Salvar</button>

<hr/>

<h2>Lançamentos</h2>

{lancamentos.map(l=>(
<div key={l.id} style={{
border:"1px solid #334155",
padding:12,
marginBottom:10,
borderRadius:6
}}>
<strong>{l.categoria}</strong>
<br/>
{l.descricao}
<br/>
📅 {l.data_lancamento}
<br/>
💰 R$ {Number(l.valor).toFixed(2)}

<br/>

<button onClick={()=>excluir(l.id)}>Excluir</button>

</div>
))}

</div>

);

}