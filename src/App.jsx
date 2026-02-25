import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Login from "./Login";
import Admin from "./Admin";

function App() {

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // ================= AUTH =================
  useEffect(() => {

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

  }, []);

  // ================= BUSCAR PAPEL (ADMIN) =================
  async function buscarRole(usuario) {

    try {

      const emailLogin = usuario.email.trim().toLowerCase();

      const { data } = await supabase
        .from("usuarios")
        .select("email, papel");

      const usuarioEncontrado = data?.find(
        u => u.email?.trim().toLowerCase() === emailLogin
      );

      // ✅ CORREÇÃO DEFINITIVA (aceita admin ou administrador)
      const papelUsuario =
        usuarioEncontrado?.papel?.trim().toLowerCase();

      if (papelUsuario === "administrador" || papelUsuario === "admin") {
        setRole("admin");
      } else {
        setRole("cliente");
      }

    } catch (err) {
      console.log("Erro ao buscar papel:", err);
      setRole("cliente");
    }
  }

  // ================= LOGOUT =================
  async function sair() {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  }

  // ================= TELAS =================

  if (loadingAuth)
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f0c29",
        color: "white"
      }}>
        Carregando...
      </div>
    );

  // LOGIN
  if (!user)
    return <Login onLogin={(u) => setUser(u)} />;

  // ADMIN / CLIENTE
  return <Admin user={user} role={role} sair={sair} />;
}

export default App;