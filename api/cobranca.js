import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req,res){

const hoje = new Date().toISOString().split("T")[0];

const { data:lancamentos } = await supabase
.from("lancamentos")
.select("*")
.eq("status","pendente")
.eq("data_lancamento",hoje);

if(!lancamentos){
return res.status(200).json({ok:true});
}

for(const l of lancamentos){

const mensagem =
`Olá ${l.cliente}

Parcela da compra:
${l.descricao}

Valor: R$ ${l.valor}

Entre no sistema para pagar o PIX.`

const url =
`https://wa.me/55${l.whatsapp}?text=${encodeURIComponent(mensagem)}`;

console.log("Cobrança:",url);

}

res.status(200).json({ok:true});

}