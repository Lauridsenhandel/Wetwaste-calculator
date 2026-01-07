
// Konfiguration
const SUPABASE_URL = "https://hrvdtlbayqynavcjwjzh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydmR0bGJheXF5bmF2Y2p3anpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NTY5OTMsImV4cCI6MjA4MzMzMjk5M30.civPEUm5-1LwDfXbwuURZ0e9wxf0k4Tzi3Vd5jwLj3s";

// Tjek om Supabase biblioteket er loadet
if (typeof supabase !== 'undefined') {
    // Initialiser klienten
    const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Gør den tilgængelig globalt (så vi kan bruge den i konsollen og andre scripts)
    window.supabaseClient = _supabase;
    window.supabase = _supabase;

    console.log("Supabase (UMD) ready", window.supabase);
} else {
    console.error("Supabase biblioteket kunne ikke findes!");
}
