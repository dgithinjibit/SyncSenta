import { supabase } from '../supabase/client';
import type { School } from '../types';

export const getSchoolsByCounty = async (county: string): Promise<School[]> => {
    const { data, error } = await supabase
        .from('schools')
        .select('id, name, county')
        .eq('county', county)
        .order('name', { ascending: true });
    
    if (error) {
        console.error('Error fetching schools:', error.message);
        throw error;
    }
    return data || [];
};

/**
 * Finds a school by name in a county, or creates it if it doesn't exist.
 * This prevents duplicate school entries.
 * 
 * @important
 * HOW TO FIX THE "new row violates row-level security policy" ERROR:
 * This error occurs because this function can be called by unauthenticated users during sign-up,
 * but your Supabase Row-Level Security (RLS) policy prevents anonymous inserts by default.
 *
 * You must create a new policy to allow this specific action.
 *
 * --- STEPS TO FIX IN YOUR SUPABASE DASHBOARD ---
 * 1. Go to your Supabase Project.
 * 2. In the left sidebar, go to `Database` -> `Tables`.
 * 3. Find and select the `schools` table.
 * 4. In the table view, find the tab that says `Row Level Security` and click on it.
 * 5. Click `New Policy`.
 * 6. Select `Create a new policy from scratch`.
 * 7. Configure the policy as follows:
 *    - Policy Name: `Allow public inserts for new schools`
 *    - Allowed operation: `INSERT`
 *    - Target roles: `anon` (this is the key role for unauthenticated visitors)
 *    - WITH CHECK expression: `true` (this allows the insert operation)
 * 8. Click "Review" and then "Save policy".
 *
 * This will resolve the error by explicitly allowing anyone to add a new school,
 * which is necessary for your current sign-up process.
 */
export const addSchool = async (name: string, county: string): Promise<School> => {
    const trimmedName = name.trim();
    // 1. Check if school already exists (case-insensitive)
    const { data: existingSchool, error: existingError } = await supabase
        .from('schools')
        .select('id, name, county')
        .ilike('name', trimmedName)
        .eq('county', county)
        .limit(1)
        .single();

    if (existingError && existingError.code !== 'PGRST116') { // Ignore 'exact one row' error
        console.error('Error checking for existing school:', existingError.message);
        throw existingError;
    }

    // 2. If it exists, return it
    if (existingSchool) {
        return existingSchool;
    }

    // 3. If it doesn't exist, create it
    const { data, error } = await supabase
        .from('schools')
        .insert([{ name: trimmedName, county }])
        .select('id, name, county')
        .single();

    if (error) {
        console.error('Error adding school:', error.message);
        // Provide a more user-friendly error for the common RLS issue.
        if (error.message.includes('violates row-level security policy')) {
            throw new Error(
                'Failed to add school due to a security policy. Please follow the setup instructions in services/schoolService.ts to correctly configure Supabase permissions.'
            );
        }
        throw error;
    }

    if (!data) {
        throw new Error('Could not create school.');
    }

    return data;
};