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

  useEffect(() => {
    init();
  }, []);

  async function init() {

    // 🔥 FORÇA LIMPAR SESSÃO ANTIGA (IMPORTANTE PRA TESTE)
    // (depois pode remover isso)
    // await supabase.auth.signOut();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      alert("Usuário não logado");
      return;
    }

    console.log("USER LOGADO INIT:", user.id); // 🔥 DEBUG

    let { data: perfil, error: errPerfil } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (errPerfil) {
      console.error("Erro ao buscar perfil:", errPerfil);
      return;
    }

    if (!perfil) {
      const { data: novoPerfil, error: errP } = await supabase
        .from("usuarios")
        .insert([{ id: user.id, email: user.email, nome: user.email }])
        .select()
        .single();

      if (errP) {
        console.error("Erro ao criar perfil:", errP);
        alert("Erro ao criar perfil");
        return;
      }

      perfil = novoPerfil;
    }

    if (!perfil?.empresa_id) {
      const { data: novaEmpresa, error: errE } = await supabase
        .from("empresas")
        .insert([{ name: "Pessoal", user_id: user.id }])
        .select()
        .single();

      if (errE) {
        console.error("Erro ao criar empresa:", errE);
        alert("Erro ao criar empresa");
        return;
      }

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

    console.log("CARREGANDO USER:", userId); // 🔥 DEBUG

    const { data, error } = await supabase
      .from("despesas")
      .select("*")
      .eq("user_id", userId)
      .order("data_lancamento", { ascending: false });

    if (error) {
      console.error("Erro ao carregar:", error);
      alert("Erro ao carregar: " + error.message);
      return;
    }

    setLancamentos(data || []);
  }

  async function salvar() {
    const { data: { user }, error: errUser } = await supabase.auth.getUser();

    if (errUser || !user) {
      alert("Sessão expirada");
      return;
    }

    console.log("USER LOGADO SALVAR:", user.id); // 🔥 DEBUG

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
    const { data: { user }, error: errUser } = await supabase.auth.getUser();

    if (errUser || !user) return;

    const { error } = await supabase
      .from("despesas")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir: " + error.message);
      return;
    }

    await carregar(user.id);
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto", fontFamily: 'sans-serif' }}>
      <h1>💳 Cunha Finance</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
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
        
        <button onClick={salvar} style={{ padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Salvar Lançamento
        </button>
      </div>

      <hr />
      <h2>Meus Lançamentos</h2>

      {lancamentos.length === 0 && <p>Nenhum registro encontrado.</p>}

      {lancamentos.map(l => (
        <div key={l.id} style={{ border: "1px solid #e2e8f0", padding: 12, marginBottom: 10, borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{l.categoria}</span>
            <br />
            <strong>{l.descricao}</strong>
            <br />
            <small>📅 {l.data_lancamento} | {l.tipo === 'despesa' ? '🔴' : '🟢'}</small>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>R$ {Number(l.valor).toFixed(2)}</div>
            <button onClick={() => excluir(l.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Excluir</button>
          </div>
        </div>
      ))}
    </div>
  );
}