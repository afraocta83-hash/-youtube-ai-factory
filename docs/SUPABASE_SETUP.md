# Supabase setup — LERRY ANIMASI

Supabase is an optional persistence layer for owner-authenticated production history. It does not replace Vercel, Gemini, GitHub Actions or Remotion.

## 1. Create a free Supabase project

1. Open https://supabase.com/dashboard and create a project.
2. Choose the Free plan. Do not enable paid add-ons.
3. Wait until the project is ready.
4. Open Project Settings → API (or Connect) and copy the Project URL and Publishable key.
5. Never copy a secret/service-role key into the browser or GitHub.

## 2. Create the database and private asset bucket

1. Open SQL Editor in the Supabase project.
2. Open this repository file: `supabase/schema.sql`.
3. Copy the complete SQL into SQL Editor and run it once.
4. Confirm the `lerry_productions` table exists and Row Level Security is enabled.
5. The SQL also creates a private `lerry-assets` bucket. Asset upload is reserved for a later production step; the current dashboard saves storyboard JSON only.

The table policies restrict every row to the authenticated owner whose ID matches `auth.uid()`. Do not disable RLS and do not add public read/write policies.

## 3. Configure Vercel

In Vercel → youtube-ai-factory → Settings → Environment Variables, add these for Production (and Preview if needed):

- `NEXT_PUBLIC_SUPABASE_URL` = Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = Supabase Publishable key

The older `NEXT_PUBLIC_SUPABASE_ANON_KEY` name is also supported by the client helper, but prefer the Publishable key.

Save the variables and redeploy the project. Existing Gemini environment variables must remain unchanged.

## 4. Allow the login redirect

In Supabase → Authentication → URL Configuration:

- Set Site URL to the production dashboard domain.
- Add the exact production dashboard URL to Redirect URLs.
- If using a Vercel preview, add that exact preview URL too.

The studio uses passwordless email magic links. The owner opens the email link on the same browser/device where the dashboard is open.

## 5. Verify

1. Open the deployed LERRY ANIMASI studio.
2. The Supabase panel should show the email login form instead of the "not configured" message.
3. Enter the owner's email and open the magic link.
4. Generate a storyboard from the owner's own story.
5. Press **Simpan storyboard ini**.
6. Confirm the row appears in the Supabase table and in the dashboard history.

## Security and current scope

- The app uses only the public Publishable/anon key in the browser; RLS is the security boundary.
- Never add a Supabase service-role/secret key to any `NEXT_PUBLIC_*` variable.
- Never paste API keys into ChatGPT or commit them to GitHub.
- The current integration saves storyboard JSON and owner story. It does not yet upload MP4s or connect GitHub Actions artifacts to Supabase Storage.
- YouTube publishing remains manual and requires explicit owner approval.
