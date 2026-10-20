import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const key = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

/** Null until the Supabase keys are available — the chat page then shows setup steps. */
export const supabase = url && key ? createClient(url, key) : null;

/** Accounts are username + password; this internal address never receives mail (see api/signup.ts). */
export const emailFor = (username: string) => `${username}@users.sibilia.invalid`;
