import { createBrowserClient } from "@supabase/ssr"
import { Database } from "@/types/supabase"

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url || !key) {
    console.error('Missing Supabase environment variables:', { url: !!url, key: !!key });
    throw new Error('Missing Supabase configuration');
  }

  return createBrowserClient<Database>(url, key);
}
