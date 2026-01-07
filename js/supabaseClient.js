
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://hrvdtlbayqynavcjwjzh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydmR0bGJheXF5bmF2Y2p3anpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NTY5OTMsImV4cCI6MjA4MzMzMjk5M30.civPEUm5-1LwDfXbwuURZ0e9wxf0k4Tzi3Vd5jwLj3s";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Development sanity check
window.supabase = supabase;
console.log("Supabase ready", supabase);

export default supabase;
