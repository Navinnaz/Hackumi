import { supabase } from "@/supabaseClient";

export async function logoutAndClear() {
  try {
    // 1) Supabase session signOut (clears client and server session tokens)
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Supabase signOut error:", error.message);

    // 2) Clear any app-local user state you may have used (example)
    try { localStorage.removeItem("your-app-user"); } catch(e) { /* ignore */ }

    // 3) OPTIONAL: force a hard reload so any cached UI is gone
    window.location.href = "/"; // or window.location.reload();
  } catch (err) {
    console.error(err);
  }
}
