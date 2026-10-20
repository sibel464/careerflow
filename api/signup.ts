/// <reference types="node" />
import { createClient } from '@supabase/supabase-js';

const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;

/** Accounts are username + password; the email is internal and never receives mail. */
const emailFor = (username: string) => `${username}@users.sibilia.invalid`;

const json = (body: unknown, status = 200) => Response.json(body, { status });

export async function POST(request: Request) {
  const { username, password, display_name, avatar } = await request.json().catch(() => ({}));
  if (typeof username !== 'string' || !USERNAME_RE.test(username)) return json({ error: 'username' }, 400);
  if (typeof password !== 'string' || password.length < 6 || password.length > 72) return json({ error: 'password' }, 400);
  const name = typeof display_name === 'string' && display_name.trim() ? display_name.trim().slice(0, 40) : username;
  const face = typeof avatar === 'string' && avatar.length <= 8 ? avatar : '🦊';

  const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const { data: taken } = await admin.from('profiles').select('id').eq('username', username).maybeSingle();
  if (taken) return json({ error: 'taken' }, 409);

  const { error } = await admin.auth.admin.createUser({
    email: emailFor(username), password, email_confirm: true,
    user_metadata: { username, display_name: name, avatar: face },
  });
  if (error) return json({ error: /already|exists|duplicate|unique/i.test(error.message) ? 'taken' : 'failed' }, error.status === 422 ? 409 : 500);
  return json({ ok: true });
}
