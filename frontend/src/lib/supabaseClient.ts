// Fichier conservé pour compatibilité (ancien mode SaaS).
// En mode open-source par défaut, l'app n'utilise pas Supabase.
// Ce stub évite d'introduire une dépendance “SaaS obligatoire” dans le runtime/tests.

export const supabase = {
  auth: {
    async getSession() {
      return { data: { session: null }, error: null };
    },
    onAuthStateChange() {
      return {
        data: { subscription: { unsubscribe() {} } },
      };
    },
    async signOut() {},
  },
} as any;

