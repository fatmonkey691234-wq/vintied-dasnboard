/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const PROJECT_URL = "https://bhvdsbvcderidsszuhnh.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJodmRzYnZjZGVyaWRzc3p1aG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODYwNzMsImV4cCI6MjA4NTM2MjA3M30.Nr86W3FW6cpvOa7ewjnL9F-wDBcQ1mrFSgkKMl6yAnM";

// Safely try to get env vars, but default to hardcoded values if import.meta.env is missing
// The (import.meta.env && ...) check prevents "Cannot read properties of undefined" errors
const supabaseUrl = (import.meta.env && import.meta.env.VITE_SUPABASE_URL) || PROJECT_URL;
const supabaseAnonKey = (import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase credentials. Please check your .env file or hardcoded values.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);