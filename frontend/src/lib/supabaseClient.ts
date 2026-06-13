import { createClient } from '@supabase/supabase-js';

// Remplacer ces valeurs par les vraies URL et clés de projet Supabase,
// idéalement via les variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://votre-projet.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'votre-cle-anon';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
