import { createClient } from '@supabase/supabase-js';

// It's recommended to store these in environment variables
const supabaseUrl = 'https://rjsxaptwznwmjgyoqiul.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqc3hhcHR3em53bWpneW9xaXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NDEzNTcsImV4cCI6MjA3MjIxNzM1N30.kBwHppj2afcon_BDTSSE4Ta69TBJLAUNg-y8fuCHJGQ';

// Extend the Supabase types to include our custom user_metadata
// FIX: Changed interface to type to resolve 'never' type inference issue in insert calls.
export type Database = {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string
          created_at: string
          name: string
          county: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          county: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          county?: string
        }
      }
    }
    // FIX: The types for empty Views, Functions, Enums, and CompositeTypes were incorrect.
    // Using `{}` caused Supabase's type inference for `insert` to fail, resulting in a `never` type.
    // The correct type for an empty database object collection is `{ [key: string]: never }`.
    Views: { [key: string]: never }
    Functions: { [key: string]: never }
    Enums: { [key: string]: never }
    CompositeTypes: { [key: string]: never }
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);