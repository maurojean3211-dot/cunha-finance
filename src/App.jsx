async function buscarRole(usuario) {

  try {

    const emailLogin = usuario.email.trim().toLowerCase();

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", emailLogin)
      .single();

    console.log("DADOS DO USUARIO:", data);

    if (error || !data) {
      console.log("Usuário não encontrado:", error);
      setRole("cliente");
      return;
    }

    // 🔥 pega qualquer variação possível
    const roleUsuario =
      String(data.role || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove acentos
        .trim()
        .toLowerCase();

    console.log("ROLE NORMALIZADO:", roleUsuario);

    if (
      roleUsuario.includes("admin")
    ) {
      setRole("admin");
    } else {
      setRole("cliente");
    }

  } catch (err) {
    console.log("Erro ao buscar role:", err);
    setRole("cliente");
  }
}