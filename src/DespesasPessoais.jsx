import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function DespesasPessoais() {
  const [lancamentos, setLancamentos] = useState([]);
  const [tipo, setTipo] = useState("despesa");
  const [categoria, setCategoria] = useState("Supermercado");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [empresaId, setEmpresaId] = useState(null);
  const [dataLancamento, setDataLancamento] = useState(new Date().toISOString().split("T")[0]);
  const [salvando, setSalvando] = useState(false); // 🔥 NOVO

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      alert("Usuário não logado");
      return;
    }

    console.log("USER LOGADO INIT:", user.id);

    let { data: perfil } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!perfil) {
      const { data: novoPerfil } = await supabase
        .from("usuarios")
        .insert([{ id: user.id, email: user.email, nome: user.email }])
        .select()
        .single();

      perfil = novoPerfil;
    }

    if (!perfil?.empresa_id) {
      const { data: novaEmpresa } = await supabase
        .from("empresas")
        .insert([{ name: "Pessoal", user_id: user.id }])
        .select()
        .single();

      await supabase
        .from("usuarios")
        .update({ empresa_id: novaEmpresa.id })
        .eq("id", user.id);

      setEmpresaId(novaEmpresa.id);
    } else {
      setEmpresaId(perfil.empresa_id);
    }

    carregar(user.id);
  }

  async function carregar(userId) {
    if (!userId) return;

    console.log("CARREGANDO USER:", userId);

    const { data, error } = await supabase
      .from("despesas")
      .select("*")
      .eq("user_id", userId)
      .order("data_lancamento", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setLancamentos(data || []);
  }

  async function salvar() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Sessão expirada");
      return;
    }

    console.log("USER LOGADO SALVAR:", user.id);

    if (!descricao || !valor) {
      alert("Preencha descrição e valor");
      return;
    }

    if (!empresaId) {
      alert("Empresa não carregada");
      return;
    }

    const valorNumero = parseFloat(valor);

    if (isNaN(valorNumero)) {
      alert("Valor inválido");
      return;
    }

    setSalvando(true); // 🔥 trava botão

    const { error } = await supabase
      .from("despesas")
      .insert([{
        tipo,
        categoria,
        descricao: descricao.trim(),
        valor: valorNumero,
        data_lancamento: dataLancamento,
        empresa_id: empresaId,
        user_id: user.id
      }]);

    setSalvando(false);

    if (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar: " + error.message);
      return;
    }

    setDescricao("");
    setValor("");

    await carregar(user.id);
  }

  async function excluir(id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("despesas")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      alert("Erro ao excluir");
      return;
    }

    await carregar(user.id);
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1>💳 Cunha Finance</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="date" value={dataLancamento} onChange={e => setDataLancamento(e.target.value)} />
        
        <select value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </select>

        <select value={categoria} onChange={e => setCategoria(e.target.value)}>
          <option>Supermercado</option>
          <option>Gasolina</option>
          <option>Aluguel</option>
          <option>Luz</option>
          <option>Água</option>
          <option>Internet</option>
          <option>Farmácia</option>
          <option>Outros</option>
        </select>

        <input placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} />
        <input type="number" placeholder="Valor" value={valor} onChange={e => setValor(e.target.value)} />
        
        <button 
          onClick={salvar} 
          className="botao-form"
          disabled={salvando}
        >
          {salvando ? "Salvando..." : "Salvar Lançamento"}
        </button>
      </div>

      <hr />

      <h2>Meus Lançamentos</h2>

      {lancamentos.length === 0 && <p>Nenhum registro encontrado.</p>}

      {lancamentos.map(l => (
        <div key={l.id} style={{ border: "1px solid #334155", padding: 12, marginBottom: 10, borderRadius: 6 }}>
          <strong>{l.categoria}</strong>
          <br />
          {l.descricao}
          <br />
          📅 {l.data_lancamento}
          <br />
          💰 R$ {Number(l.valor).toFixed(2)}
          <br />
          <button onClick={() => excluir(l.id)}>Excluir</button>
        </div>
      ))}
    </div>
  );
}