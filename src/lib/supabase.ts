import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project URL and anon key
const supabaseUrl = 'https://qechusulxjmwcxirygup.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlY2h1c3VseGptd2N4aXJ5Z3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjI4MjAsImV4cCI6MjA1ODU5ODgyMH0.m-O8jTVPtEWYpjSVVzhbK7_2ClINWTSCuiP6_MhRn10';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 