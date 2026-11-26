# FreeLLM integration

LERRY ANIMASI can use a self-hosted FreeLLM gateway as its preferred storyboard provider.

Upstream project: https://github.com/Devansh-365/freellm
License: MIT (upstream repository)
API compatibility: OpenAI-style `POST /v1/chat/completions`
Default model alias: `free-smart`

## Important: this does not provide a public free API key

FreeLLM is gateway software, not a hosted universal key. Deploy the gateway separately (for example on a free-tier host or a machine you control), then configure one or more provider keys that you own. Free-tier quotas, availability, provider terms, and hosting limits apply. Never copy exposed keys from public GitHub repositories.

## LERRY environment variables

Set these on the Vercel Preview environment for branch `experiment/openmontage-video-engine`:

- `FREELLM_BASE_URL`: the deployed gateway origin, without a trailing slash, e.g. `https://your-gateway.example`
- `FREELLM_API_KEY`: optional gateway master key, if gateway authentication is enabled. Store as Sensitive/Secret.
- `FREELLM_MODEL`: optional model alias; defaults to `free-smart`.

The storyboard endpoint calls `/v1/chat/completions` and requests JSON mode. When `FREELLM_BASE_URL` is configured, FreeLLM is used first. If it is not configured, the endpoint falls back to Gemini when `GEMINI_API_KEY` exists.

## Current integration boundary

The application adapter is implemented in `app/api/produce/route.ts`. The gateway itself is not deployed or connected by this code change. A successful connection still requires a reachable gateway URL and at least one valid upstream provider credential (or a configured local Ollama provider). After configuration, verify with a small owner-provided story and inspect the returned storyboard before accepting it.

The video-render GitHub Actions workflow still has a separate Gemini TTS dependency. Connecting FreeLLM for storyboard generation does not automatically replace the speech-generation provider.
