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
3. Server validates the story, scene count and Agnes-compatible clip durations.
4. Edge TTS creates Indonesian narration; Piper is fallback.
5. After explicit owner approval, GitHub Actions starts a temporary Docker instance of the MIT-licensed Agnes Video Generator.
6. Agnes creates each 4–12 second 720p scene clip; FFmpeg crops/upscales, burns subtitles, mixes Indonesian narration and joins the clips into a vertical MP4.
7. FFmpeg/ffprobe validates H.264, 1080x1920, 30 fps, audio and duration.
8. Owner downloads/reviews the artifact and separately approves any YouTube publishing.

### Agnes AI key (required for video rendering)

Create a free key at https://platform.agnes-ai.com. Add it to the GitHub repository (not Netlify) under Settings → Secrets and variables → Actions with the exact name `AGNES_API_KEY`. The render workflow injects it only into the temporary Agnes Docker container. Never commit the key or put it in a `NEXT_PUBLIC_` variable. The Agnes app is open-source MIT, but video generation depends on the provider's free shared queue; queue availability and free access can change. The temporary runner is destroyed after the render job. No Supabase or persistent Agnes server is used.

Groq, Agnes, GitHub Actions, Microsoft Edge TTS/Piper and FFmpeg are external dependencies; free quotas and service availability can change.
