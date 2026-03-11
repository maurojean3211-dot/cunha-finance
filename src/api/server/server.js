import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/pix", async (req, res) => {

try{

const response = await fetch("https://api.asaas.com/v3/payments",{

method:"POST",

headers:{
"Content-Type":"application/json",
"access_token":process.env.ASAAS_KEY
},

body:JSON.stringify({
billingType:"PIX",
value:req.body.valor,
dueDate:new Date().toISOString().split("T")[0],
description:req.body.descricao
})

});

const data = await response.json();

res.json(data);

}catch(err){

console.log(err);
res.status(500).json({error:"Erro ao gerar PIX"});

}

});

app.listen(3001,()=>{

console.log("🚀 Servidor PIX rodando na porta 3001");

});