import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://leissgrymkxakjvurric.supabase.co'
const supabaseKey = 'sb_publishable_0AiFHRXe64yIolMcRqcACw_hM27e_fP'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)