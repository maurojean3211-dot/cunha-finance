import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Login from "./Login";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function App() {

  const hoje = new Date();

  const EMPRESA_ID = "d99b2aa4-a8ba-4c5f-b594-efa2d0d713cb";

  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [lancamentos, setLancamentos] = useState([]);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("receita");
  const [categoria, setCategoria] = useState("");

  const [pixLink, setPixLink] = useState(null);
  const [loadingPix, setLoadingPix] = useState(false);

  const mesSelecionado = hoje.getMonth() + 1;
  const anoSelecionado = hoje.getFullYear();

  // ================= AUTH =================
  useEffect(() => {
    async function iniciarAuth() {

      const { data: { session } } =
        await supabase.auth.getSession();

      setUser(session?.user ?? null);
      setLoadingAuth(false);

      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
    }

    iniciarAuth();
  }, []);

  // ================= CARREGAR =================
  async function carregarLancamentos() {

    const { data } = await supabase
      .from("lancamentos")
      .select("*")
      .eq("empresa_id", EMPRESA_ID)
      .eq("mes", mesSelecionado)
      .eq("ano", anoSelecionado)
      .order("created_at", { ascending: false });

    setLancamentos(data || []);
  }

  useEffect(() => {
    if (user) carregarLancamentos();
  }, [user]);

  // ================= ADICIONAR =================
  async function adicionarLancamento() {

    if (!descricao || !valor || !categoria) {
      alert("Preencha todos os campos");
      return;
    }

    const { error } = await supabase
      .from("lancamentos")
      .insert([
        {
          descricao,
          valor: Number(valor),
          tipo,
          categoria,
          data: new Date(),
          mes: mesSelecionado,
          ano: anoSelecionado,
          empresa_id: EMPRESA_ID
        }
      ]);

    if (error) {
      alert("Erro ao salvar");
      console.log(error);
      return;
    }

    setDescricao("");
    setValor("");
    setTipo("receita");
    setCategoria("");

    carregarLancamentos();
  }

  // ================= PIX =================
  async function assinarPlano() {

    if (loadingPix) return;

    setLoadingPix(true);

    const result =
      await supabase.functions.invoke("pix-worker");

    if (result.error) {
      alert("Erro ao gerar PIX");
      setLoadingPix(false);
      return;
    }

    setPixLink(result?.data?.pixLink);
    setLoadingPix(false);
  }

  // ================= SALDO =================
  const saldo = lancamentos.reduce(
    (t, i) =>
      i.tipo === "receita"
        ? t + Number(i.valor)
        : t - Number(i.valor),
    0
  );

  // ================= RESUMO POR CATEGORIA =================
  const resumoCategorias = lancamentos.reduce((acc, item) => {

    const categoriaNome = item.categoria || "Sem categoria";

    if (!acc[categoriaNome]) {
      acc[categoriaNome] = 0;
    }

    acc[categoriaNome] +=
      item.tipo === "receita"
        ? Number(item.valor)
        : -Number(item.valor);

    return acc;

  }, {});

  // ================= DADOS DO GRÁFICO =================
  const dadosGrafico = Object.entries(resumoCategorias)
    .map(([name, value]) => ({
      name,
      value: Math.abs(value)
    }))
    .filter(item => item.value > 0);

  // ===== CARREGANDO =====
  if (loadingAuth)
    return <div style={container}>Carregando...</div>;

  // ===== LOGIN =====
  if (!user)
    return <Login onLogin={(u)=>setUser(u)} />;

  // ===== APP =====
  return (
    <div style={container}>
      <div style={app}>

        <h2 style={{ textAlign: "center" }}>💜 Cunha Finance</h2>

        <button style={botao} onClick={assinarPlano}>
          {loadingPix ? "Gerando PIX..." : "💜 Assinar Plano"}
        </button>

        {pixLink && (
          <a href={pixLink} target="_blank" rel="noreferrer">
            <button style={botao}>💜 Pagar com PIX</button>
          </a>
        )}

        <div style={saldoCard}>
          <p>Saldo do mês</p>
          <h1>R$ {saldo.toFixed(2)}</h1>
        </div>

        {/* RESUMO */}
        <h3 style={{marginTop:20}}>📊 Resumo por Categoria</h3>

        {Object.entries(resumoCategorias).map(([cat, total]) => (
          <div key={cat} style={itemCard}>
            <span>{cat}</span>
            <span style={{
              color: total >= 0 ? "#22c55e" : "#ef4444",
              fontWeight:"bold"
            }}>
              R$ {total.toFixed(2)}
            </span>
          </div>
        ))}

        {/* GRÁFICO */}
        <h3 style={{marginTop:20}}>📊 Gastos por Categoria</h3>

        <div style={{width:"100%", height:250}}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={dadosGrafico}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {dadosGrafico.map((_, index) => (
                  <Cell key={index} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ marginTop: 20 }}>
          <h3>Novo Lançamento</h3>

          <input style={input} placeholder="Descrição"
            value={descricao}
            onChange={(e)=>setDescricao(e.target.value)}
          />

          <input style={input} type="number"
            placeholder="Valor"
            value={valor}
            onChange={(e)=>setValor(e.target.value)}
          />

          <select style={input}
            value={tipo}
            onChange={(e)=>setTipo(e.target.value)}
          >
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>

          <select style={input}
            value={categoria}
            onChange={(e)=>setCategoria(e.target.value)}
          >
            <option value="">Categoria</option>
            <option value="Casa">Casa</option>
            <option value="Gasolina">Gasolina</option>
            <option value="Viagem">Viagem</option>
            <option value="Compras">Compras</option>
            <option value="Comissão">Comissão</option>
            <option value="Empresa">Empresa</option>
          </select>

          <button style={botao} onClick={adicionarLancamento}>
            ➕ Adicionar
          </button>
        </div>

        <div style={{ marginTop: 20 }}>
          <h3>Lançamentos</h3>

          {lancamentos.map((item) => (
            <div key={item.id} style={itemCard}>
              <span>
                {item.descricao} — {item.categoria || "Sem categoria"}
              </span>

              <span style={{
                color: item.tipo === "receita" ? "#22c55e" : "#ef4444",
                fontWeight:"bold"
              }}>
                R$ {Number(item.valor).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

const container={
  background:"#0a0a0a",
  minHeight:"100vh",
  display:"flex",
  justifyContent:"center",
  padding:15,
  color:"white",
  fontFamily:"sans-serif"
};

const app={width:"100%",maxWidth:420};

const saldoCard={
  background:"linear-gradient(135deg,#8A05BE,#5F259F)",
  padding:25,
  borderRadius:20,
  marginTop:15
};

const itemCard={
  background:"#1a1a1a",
  padding:12,
  borderRadius:10,
  marginBottom:8,
  display:"flex",
  justifyContent:"space-between",
};

const botao={
  marginTop:10,
  padding:12,
  borderRadius:12,
  border:"none",
  background:"#8A05BE",
  color:"white",
  fontWeight:"bold",
  width:"100%",
  cursor:"pointer"
};

const input={
  width:"100%",
  padding:10,
  marginTop:8,
  borderRadius:8,
  border:"none"
};

export default App;