import { createClient } from "@supabase/supabase-js";

/* le indicamos que tnemos autorizacion para tocar el backend */
export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL, 
    import.meta.env.VITE_SUPABASE_ANON_KEY
);