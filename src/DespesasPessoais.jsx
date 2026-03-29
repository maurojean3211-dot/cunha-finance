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
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      alert("Usuário não logado");
      return;
    }

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

    setSalvando(true);

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
      console.error(error);
      alert("Erro ao salvar");
      return;
    }

    setDescricao("");
    setValor("");

    await carregar(user.id);
  }

  async function excluir(id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("despesas")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    await carregar(user.id);
  }

  return (
    <div style={{
      width: "100%",
      maxWidth: "320px",   // 🔥 AQUI RESOLVE O PROBLEMA
      margin: "0 auto",
      padding: 20
    }}>
      
      <h2 style={{ marginBottom: 15 }}>💳 Cunha Finance</h2>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        
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

        <input
          placeholder="Descrição"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
        />

        <input
          type="number"
          placeholder="Valor"
          value={valor}
          onChange={e => setValor(e.target.value)}
        />

        {/* 🔥 BOTÃO DEFINITIVO */}
        <button
          onClick={salvar}
          disabled={salvando}
          style={{
            width: "160px",
            margin: "12px auto",
            display: "block",
            padding: "8px",
            borderRadius: "8px",
            background: "linear-gradient(90deg, #00c6ff, #0072ff)",
            border: "none",
            color: "#fff",
            fontSize: "13px",
            cursor: "pointer"
          }}
        >
          {salvando ? "Salvando..." : "💾 Salvar"}
        </button>

      </div>

      <hr />

      <h3>Meus Lançamentos</h3>

      {lancamentos.length === 0 && <p>Nenhum registro encontrado.</p>}

      {lancamentos.map(l => (
        <div key={l.id} style={{
          border: "1px solid #334155",
          padding: 10,
          marginBottom: 10,
          borderRadius: 8,
          background: "#020617"
        }}>
          <strong>{l.categoria}</strong>
          <br />
          {l.descricao}
          <br />
          📅 {l.data_lancamento}
          <br />
          💰 R$ {Number(l.valor).toFixed(2)}

          <br />

          <button
            style={{
              marginTop: 8,
              padding: "5px 10px",
              fontSize: 12,
              background: "#ef4444",
              borderRadius: 6,
              border: "none",
              color: "#fff",
              cursor: "pointer"
            }}
            onClick={() => excluir(l.id)}
          >
            Excluir
          </button>
        </div>
      ))}

    </div>
  );
}