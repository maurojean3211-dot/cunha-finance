import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function PainelSistema(){

const [usuarios,setUsuarios] = useState([]);

useEffect(()=>{

carregarUsuarios();

},[]);

async function carregarUsuarios(){

const { data } = await supabase
.from("usuarios")
.select("*")
.order("created_at",{ascending:false});

setUsuarios(data || []);

}

return(

<div style={{padding:20}}>

<h1>👑 Usuários do Sistema</h1>

<table style={{width:"100%",marginTop:20}}>

<thead>

<tr>
<th>Email</th>
<th>Role</th>
<th>Status</th>
</tr>

</thead>

<tbody>

{usuarios.map(u=>(

<tr key={u.id}>

<td>{u.email}</td>
<td>{u.role}</td>
<td>{u.status}</td>

</tr>

))}

</tbody>

</table>

</div>

);

}