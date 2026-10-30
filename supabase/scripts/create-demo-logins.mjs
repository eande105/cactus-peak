// Creates a Supabase Auth login for each demo member who can sign in (not children), and links it to the member row.
// Safe to run again: existing logins get the password from .env.local and stay linked.
//
//   node supabase/scripts/create-demo-logins.mjs
//
// Reads DEMO_PASSWORD from cactus-peak-build/.env.local. The password never goes into a tracked file.

import { execFileSync } from "node:child_process"
import * as fs from "node:fs"
import * as path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, ".env.local"), "utf8")
    .split("\n")
    .filter((l) => /^\w+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()])
)
const password = env.DEMO_PASSWORD
if (!password) throw new Error("Set DEMO_PASSWORD in cactus-peak-build/.env.local")

const lit = (s) => `'${s.replace(/'/g, "''")}'`
const sql = `
do $$
declare
  m record;
  uid uuid;
begin
  for m in
    select id, email, first_name, last_name from public.members
    where role <> 'child' and status = 'active' and email <> ''
  loop
    select u.id into uid from auth.users u where u.email = m.email;
    if uid is null then
      uid := gen_random_uuid();
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) values (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', m.email,
        extensions.crypt(${lit(password)}, extensions.gen_salt('bf')), now(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('member_id', m.id, 'first_name', m.first_name, 'last_name', m.last_name),
        now(), now(), '', '', '', ''
      );
      insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (
        gen_random_uuid(), uid, uid::text,
        jsonb_build_object('sub', uid::text, 'email', m.email, 'email_verified', true),
        'email', now(), now(), now()
      );
    else
      update auth.users
      set encrypted_password = extensions.crypt(${lit(password)}, extensions.gen_salt('bf')), updated_at = now()
      where id = uid;
    end if;
    update public.members set auth_user_id = uid where id = m.id;
  end loop;
end;
$$;
select m.email, m.first_name || ' ' || m.last_name as name, m.role, m.household_id
from public.members m where m.auth_user_id is not null order by m.household_id, m.role;
`
const res = execFileSync("supabase", ["db", "query", "--linked", sql], { cwd: root, encoding: "utf8" })
const json = JSON.parse(res.slice(res.indexOf("{")))
console.table(json.rows)
