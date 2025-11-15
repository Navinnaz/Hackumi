// // src/hooks/useAuth.ts
// import { useEffect, useState } from "react";
// import { supabase } from "@/supabaseClient";

// export function useAuth() {
//   const [user, setUser] = useState<any>(null);

//   useEffect(() => {
//     // Get the current session user
//     const fetchUser = async () => {
//       const { data } = await supabase.auth.getUser();
//       setUser(data.user);
//     };
//     fetchUser();

//     // Listen for sign-in/sign-out events
//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user || null);
//     });

//     return () => {
//       listener.subscription.unsubscribe();
//     };
//   }, []);

//   return { user };
// }

// src/hooks/useAuth.ts
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/supabaseClient";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // get initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null);
    });

    // subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user };
}
