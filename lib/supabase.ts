import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qbugsnnbmubokhczxmdo.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_aGla_Ydsy84jHpisyDShrA_DW6tbpaz";

export const supabase = createClient(supabaseUrl, supabaseKey);
