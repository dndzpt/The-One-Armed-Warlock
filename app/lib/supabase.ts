import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ekzhfpwclclkiyhhnvvl.supabase.co";
const supabasePublishableKey = "sb_publishable_o-P5mObSMAd0UUUrlMFCxg_jSkvFGtw";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
