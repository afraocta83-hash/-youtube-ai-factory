# Groq setup for LERRY ANIMASI

## Selected model

- Provider: Groq
- Model: `openai/gpt-oss-120b`
- API: OpenAI-compatible Chat Completions
- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- Output: strict JSON Schema
- Reasoning: low effort, reasoning output excluded
- Calls per story: one request; no AI retry loop

The model supports strict JSON Schema output. This makes storyboard objects predictable for the render pipeline; it does not guarantee that the story interpretation is factually or creatively correct. Server-side validation checks the owner story, exact spoken-text excerpts, scene count, duration, and visual prompt fields.

## Free tier and limits

Groq publishes per-model rate limits. The currently documented baseline for GPT-OSS 120B is 30 requests/minute, 1,000 requests/day, 8,000 tokens/minute, and 200,000 tokens/day. Actual account limits may vary and should be checked in the Groq Console. Free availability and quotas can change.

## Configure hosting Preview (Netlify or Vercel)

Create one or more API keys at https://console.groq.com/keys and add these variables to the hosting project's environment-variable settings. For Netlify, use Site configuration → Environment variables and scope them to the deploy context/branch used for Preview. For Vercel, use Project → Settings → Environment Variables, target Preview, branch `experiment/openmontage-video-engine`:

- `GROQ_API_KEY`: Sensitive/Secret, primary key, required.
- `GROQ_API_KEY2`: Sensitive/Secret, optional backup.
- `GROQ_API_KEY3`: Sensitive/Secret, optional second backup.

The producer tries keys in order. It switches to the next configured key only when Groq rejects the current key with HTTP 401 or 403. It does not multiply requests when the provider is rate-limited or unavailable.
- `GROQ_MODEL`: `openai/gpt-oss-120b`, plain configuration value.
- `OWNER_PASSWORD`: Sensitive/Secret, unique random password at least 24 characters.
- `GITHUB_ACTIONS_TOKEN`: existing Sensitive/Secret with Actions: write permission.

Redeploy the Preview after adding variables. Netlify and Vercel both require a new deploy for changed environment variables to take effect. Never paste API keys or owner passwords into chat or commit them to GitHub.

## Supabase removal

The first version no longer requires Supabase. Owner login uses a signed, HttpOnly, SameSite cookie; the signing key is the owner password. Recent storyboards are stored locally in the browser on the current device (maximum 10). This removes database setup, email OTP and Supabase API keys. Local history does not sync across devices and can be lost if browser data is cleared.

## Token controls

- One model call per submitted story.
- 4–6 scenes only.
- Strict JSON Schema.
- Low reasoning effort and reasoning output disabled.
- Maximum completion budget: 3,200 tokens.
- Deterministic server-side QC; no second LLM judge call.
- Token usage is returned to the dashboard.

## Free production pipeline

1. Owner login.
2. Groq creates storyboard + YouTube metadata.
3. Server validates owner story and all spoken/subtitle excerpts.
4. Edge TTS creates Indonesian narration; Piper is fallback.
5. Remotion renders vertical MP4 on GitHub Actions.
6. FFmpeg validates the MP4.
7. Owner downloads/reviews the artifact and manually approves YouTube publishing.

GitHub Actions on public repositories can be used without a separate video-render API. Groq, GitHub and Microsoft Edge TTS/Piper availability and free quotas are external dependencies and may change.
