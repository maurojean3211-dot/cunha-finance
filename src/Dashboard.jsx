import { useEffect, useState } from "react";
import { supabase } from "./supabase";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Dashboard() {

  const [dadosGrafico,setDadosGrafico]=useState([]);
  const [faturamento,setFaturamento]=useState(0);
  const [comissaoTotal,setComissaoTotal]=useState(0);
  const [lucroTotal,setLucroTotal]=useState(0);

  useEffect(()=>{
    carregarDashboard();
  },[]);

  async function carregarDashboard(){

    const {data,error}=await supabase
      .from("vendas")
      .select("*");

    if(error){
      console.log(error);
      return;
    }

    // ======================
    // TOTAIS
    // ======================
    let totalFat=0;
    let totalCom=0;
    let totalLuc=0;

    const meses={};

    data.forEach(venda=>{

      const valor = Number(venda.valor_total||0);
      const comissao = Number(venda.comissao||0);
      const lucro = Number(venda.lucro||0);

      totalFat += valor;
      totalCom += comissao;
      totalLuc += lucro;

      // AGRUPAR POR MÊS
      const dataVenda = new Date(venda.created_at);

      const mes = dataVenda.toLocaleString("pt-BR",{
        month:"short"
      });

      if(!meses[mes]){
        meses[mes]={
          mes,
          faturamento:0,
          lucro:0
        };
      }

      meses[mes].faturamento += valor;
      meses[mes].lucro += lucro;

    });

    setFaturamento(totalFat);
    setComissaoTotal(totalCom);
    setLucroTotal(totalLuc);

    setDadosGrafico(Object.values(meses));
  }

  // ======================
  return(
    <div style={{padding:20}}>

      <h1>📊 Dashboard Financeiro</h1>

      {/* CARDS */}
      <div style={{
        display:"flex",
        gap:20,
        flexWrap:"wrap",
        marginBottom:30
      }}>

        <Card titulo="💰 Faturamento"
              valor={faturamento} cor="#4CAF50"/>

        <Card titulo="🪙 Comissão"
              valor={comissaoTotal} cor="#FF9800"/>

        <Card titulo="📈 Lucro"
              valor={lucroTotal} cor="#2196F3"/>

      </div>

      <h3>📊 Faturamento x Lucro por Mês</h3>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={dadosGrafico}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="mes"/>
          <YAxis/>
          <Tooltip/>
          <Legend/>

          <Line
            type="monotone"
            dataKey="faturamento"
            stroke="#4CAF50"
            strokeWidth={3}
          />

          <Line
            type="monotone"
            dataKey="lucro"
            stroke="#2196F3"
            strokeWidth={3}
          />

        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}

// ======================
// CARD COMPONENTE
// ======================
function Card({titulo,valor,cor}){

  return(
    <div style={{
      background:cor,
      color:"#fff",
      padding:20,
      borderRadius:12,
      minWidth:220
    }}>
      <h3>{titulo}</h3>
      <h2>
        R$ {Number(valor).toLocaleString("pt-BR",{
          minimumFractionDigits:2
        })}
      </h2>
    </div>
  );
}