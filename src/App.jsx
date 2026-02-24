tem como voce adicionar para mim para eu copiar e colar   import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Login from "./Login";
import Clientes from "./Clientes";
import Admin from "./Admin";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function App() {

  const hoje = new Date();

  const [mesSelecionado, setMesSelecionado] = useState(hoje.getMonth()+1);
  const [anoSelecionado, setAnoSelecionado] = useState(hoje.getFullYear());

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [lancamentos, setLancamentos] = useState([]);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("despesa");

  // ================= AUTH =================
  useEffect(() => {

    async function iniciarAuth() {

      const { data:{ session } } =
        await supabase.auth.getSession();

      const usuario = session?.user ?? null;

      setUser(usuario);

      if(usuario){
        await buscarRole(usuario);
        carregarLancamentos(usuario);
      }

      setLoadingAuth(false);
    }

    iniciarAuth();

    const { data:{ subscription } } =
      supabase.auth.onAuthStateChange(async (_e, session)=>{
        const usuario = session?.user ?? null;
        setUser(usuario);

        if(usuario){
          await buscarRole(usuario);
          carregarLancamentos(usuario);
        }
      });

    return ()=>subscription.unsubscribe();

  }, []);

  async function buscarRole(usuario){

    const { data } = await supabase
      .from("usuarios")
      .select("role")
      .eq("email", usuario.email)
      .single();

    setRole(data?.role || "cliente");
  }

  useEffect(()=>{
    if(user && role !== "admin")
      carregarLancamentos(user);
  },[mesSelecionado,anoSelecionado]);

  async function sair(){
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  }

  // ================= CARREGAR =================
  async function carregarLancamentos(usuario){

    const { data } = await supabase
      .from("lancamentos")
      .select("*")
      .eq("user_id", usuario.id)
      .eq("mes", mesSelecionado)
      .eq("ano", anoSelecionado)
      .order("created_at",{ascending:false});

    setLancamentos(data || []);
  }

  // ================= ADICIONAR =================
  async function adicionarLancamento(){

    if(!descricao || !valor){
      alert("Preencha os campos");
      return;
    }

    const { data:{ user } } =
      await supabase.auth.getUser();

    await supabase.from("lancamentos").insert({
      descricao,
      valor:Number(valor),
      tipo,
      data:new Date().toISOString(),
      mes:mesSelecionado,
      ano:anoSelecionado,
      user_id:user.id
    });

    setDescricao("");
    setValor("");

    carregarLancamentos(user);
  }

  // ================= EXCLUIR =================
  async function excluirLancamento(id){

    await supabase
      .from("lancamentos")
      .delete()
      .eq("id",id);

    const { data:{ user } } =
      await supabase.auth.getUser();

    carregarLancamentos(user);
  }

  // ================= CALCULOS =================
  const receitas = lancamentos
    .filter(l=>l.tipo==="receita")
    .reduce((s,l)=>s+Number(l.valor),0);

  const despesas = lancamentos
    .filter(l=>l.tipo!=="receita")
    .reduce((s,l)=>s+Number(l.valor),0);

  const saldo = receitas - despesas;

  const dadosGrafico=[
    {name:"Receitas",value:receitas},
    {name:"Despesas",value:despesas}
  ];

  const cores=["#00C49F","#FF4D4D"];

  const nomesMeses=[
    "Jan","Fev","Mar","Abr","Mai","Jun",
    "Jul","Ago","Set","Out","Nov","Dez"
  ];

  function mesAnterior(){
    if(mesSelecionado===1){
      setMesSelecionado(12);
      setAnoSelecionado(a=>a-1);
    }else{
      setMesSelecionado(m=>m-1);
    }
  }

  function proximoMes(){
    if(mesSelecionado===12){
      setMesSelecionado(1);
      setAnoSelecionado(a=>a+1);
    }else{
      setMesSelecionado(m=>m+1);
    }
  }

  // ================= TELAS =================

  if(loadingAuth)
    return <div style={container}>Carregando...</div>;

  if(!user)
    return <Login onLogin={(u)=>setUser(u)} />;

  // 👑 ADMIN
  if(role === "admin")
    return <Admin user={user} sair={sair} />;

  // 👤 CLIENTE
  return(
    <div style={container}>
      <div style={app}>

        <h2>💜 Cunha Finance</h2>
        <strong>{user.email}</strong>

        <button style={botao} onClick={sair}>🚪 Sair</button>

        <Clientes user={user} />

        <h3>Adicionar Lançamento</h3>

        <input style={botao} placeholder="Descrição"
          value={descricao}
          onChange={(e)=>setDescricao(e.target.value)}
        />

        <input style={botao} type="number"
          placeholder="Valor"
          value={valor}
          onChange={(e)=>setValor(e.target.value)}
        />

        <select style={botao}
          value={tipo}
          onChange={(e)=>setTipo(e.target.value)}
        >
          <option value="receita">Receita</option>
          <option value="despesa">Despesa</option>
        </select>

        <button style={botao} onClick={adicionarLancamento}>
          ➕ Salvar Lançamento
        </button>

        <h3>Lançamentos</h3>

        {lancamentos.map((l)=>(
          <div key={l.id} style={{
            background:"#1a1a1a",
            padding:12,
            marginTop:8,
            borderRadius:10,
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center"
          }}>
            <div>
              <strong>{l.descricao}</strong><br/>
              R$ {Number(l.valor).toFixed(2)} — {l.tipo}
            </div>

            <button
              onClick={()=>excluirLancamento(l.id)}
              style={{
                background:"#FF4D4D",
                border:"none",
                color:"white",
                padding:"8px 14px",
                borderRadius:8,
                cursor:"pointer",
                fontWeight:"bold"
              }}
            >
              🗑 Excluir
            </button>
          </div>
        ))}

        <div style={mesBox}>
          <button onClick={mesAnterior}>⬅</button>

          <select
            value={mesSelecionado}
            onChange={(e)=>setMesSelecionado(Number(e.target.value))}
          >
            {nomesMeses.map((m,i)=>(
              <option key={i} value={i+1}>{m}</option>
            ))}
          </select>

          <span>{anoSelecionado}</span>

          <button onClick={proximoMes}>➡</button>
        </div>

        <h3>Saldo: R$ {saldo.toFixed(2)}</h3>

        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={dadosGrafico} dataKey="value" outerRadius={90}>
              {dadosGrafico.map((_,i)=>(
                <Cell key={i} fill={cores[i]} />
              ))}
            </Pie>
            <Tooltip/>
          </PieChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
}

const container={
  background:"#0a0a0a",
  minHeight:"100vh",
  display:"flex",
  justifyContent:"center",
  padding:20,
  color:"white",
  fontFamily:"sans-serif"
};

const app={width:"100%",maxWidth:"1200px"};

const botao={
  marginTop:12,
  padding:14,
  borderRadius:12,
  border:"none",
  background:"#8A05BE",
  color:"white",
  fontWeight:"bold",
  width:"100%",
  cursor:"pointer"
};

const mesBox={
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  marginTop:15,
  gap:10
};

export default App;