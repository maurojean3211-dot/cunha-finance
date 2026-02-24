import { useState, useEffect } from "react";
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

const [mesSelecionado, setMesSelecionado] = useState(hoje.getMonth() + 1);
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

```
async function iniciar() {

  const { data } = await supabase.auth.getSession();
  const usuario = data.session?.user ?? null;

  setUser(usuario);

  if (usuario) {
    await buscarRole(usuario);
  }

  setLoadingAuth(false);
}

iniciar();

const { data: listener } =
  supabase.auth.onAuthStateChange(async (_event, session) => {

    const usuario = session?.user ?? null;
    setUser(usuario);

    if (usuario) {
      await buscarRole(usuario);
    } else {
      setRole(null);
    }
  });

return () => listener.subscription.unsubscribe();
```

}, []);

// ================= BUSCAR ROLE =================
async function buscarRole(usuario) {

```
const emailLogin = usuario.email.trim().toLowerCase();

const { data } = await supabase
  .from("usuarios")
  .select("email, role");

const usuarioEncontrado = data?.find(
  u => u.email?.trim().toLowerCase() === emailLogin
);

if (usuarioEncontrado?.role === "admin") {
  setRole("admin");
} else {
  setRole("cliente");
}
```

}

// ================= LOGOUT =================
async function sair() {
await supabase.auth.signOut();
setUser(null);
setRole(null);
}

// ================= CARREGAR CLIENTE =================
useEffect(() => {
if (user && role === "cliente") {
carregarLancamentos(user);
}
}, [user, role, mesSelecionado, anoSelecionado]);

async function carregarLancamentos(usuario) {

```
const { data } = await supabase
  .from("lancamentos")
  .select("*")
  .eq("user_id", usuario.id)
  .eq("mes", mesSelecionado)
  .eq("ano", anoSelecionado)
  .order("created_at", { ascending: false });

setLancamentos(data || []);
```

}

// ================= ADICIONAR =================
async function adicionarLancamento() {

```
if (!descricao || !valor) {
  alert("Preencha os campos");
  return;
}

await supabase.from("lancamentos").insert({
  descricao,
  valor: Number(valor),
  tipo,
  data: new Date().toISOString(),
  mes: mesSelecionado,
  ano: anoSelecionado,
  user_id: user.id
});

setDescricao("");
setValor("");

carregarLancamentos(user);
```

}

// ================= CALCULOS =================
const receitas = lancamentos
.filter(l => l.tipo === "receita")
.reduce((s, l) => s + Number(l.valor), 0);

const despesas = lancamentos
.filter(l => l.tipo !== "receita")
.reduce((s, l) => s + Number(l.valor), 0);

const saldo = receitas - despesas;

const dadosGrafico = [
{ name: "Receitas", value: receitas },
{ name: "Despesas", value: despesas }
];

const cores = ["#00C49F", "#FF4D4D"];

// ================= TELAS =================

if (loadingAuth)
return <div style={container}>Carregando...</div>;

if (!user)
return <Login onLogin={(u) => setUser(u)} />;

// 👑 ADMIN (PAINEL NOVO)
if (role === "a
