# LERRY ANIMASI — Audit Bundle

## Scope
This package is a source snapshot of branch `experiment/openmontage-video-engine`, plus this audit note. It is intended for independent review by Freebuff and Claude.

## Project intent
The owner supplies a short topic/idea. The system drafts the story and storyboard for review. Rendering is permitted only after explicit owner approval. The owner reviews the finished MP4 before separately approving publication. No automatic YouTube upload is authorized or implemented.

## Review rules
- Review this branch only. Do not merge, push to, or modify `main`.
- Do not deploy to Production.
- Do not render or publish a video as part of the audit.
- Report findings with file path, severity, reproducible steps, and proposed minimal fix.
- Do not add paid services, incur usage charges, or request credentials.
- Never print, copy, or commit API keys, tokens, passwords, OAuth credentials, or environment values.

## Security exclusions
The bundle intentionally excludes `.env*` files (except `.env.example`), `.git`, `.vercel`, build outputs, dependency folders, and local secrets. Environment variable names and explanations should be documented in the example template or project docs; actual values must remain in the provider's secret store.

## Known issues / history
- Story generation previously failed strict validation because scene 0 omitted required `narration`. The producer prompt was revised to require all schema fields, including `narration`.
- A TypeScript prompt-array syntax regression caused a Vercel build error (`Unterminated string constant`); subsequent commits corrected the prompt syntax and comma/array termination.
- GitHub Actions render dispatch previously returned HTTP 403: `Resource not accessible by personal access token`. Verify the Preview environment variable `GITHUB_ACTIONS_TOKEN` is a fine-grained PAT with repository Actions: Read and write permission (or classic PAT with repo scope). Do not place the token in this bundle.
- Earlier CI run #95 passed TypeScript, Next build, QC tests, Remotion composition, smoke MP4 render, FFmpeg decode, H.264 1080x1920 at 30 FPS, and audio presence checks. That run used an offline fixture; live Groq credentials were not present, so live Groq generation was not verified by that CI run.
- The last known branch tip before packaging was `08681988eb8e43f38c46d4b0de5c2ba54f2234c2`. The packaging commit itself will advance the branch.

## Known limitations to validate
- Current visuals are deterministic vector backdrops and a basic 2D character rig, not bespoke AI-generated art per scene or full 3D.
- Subtitle timing is estimated; phoneme-aligned captions and reliable lip-sync are not implemented.
- Automated factual research/fact-checking is not implemented.
- YouTube OAuth upload is not implemented; publication remains manual.
- Storyboard history is local browser storage (last 10), not cloud-synced.
- There is no continuously running autonomous agent; work is orchestrated by explicit user actions.

## Audit checklist
1. Map the full request lifecycle: idea → story/schema validation → owner review → QC → explicit render approval → GitHub Actions → MP4 validation → owner review.
2. Confirm no render dispatch can occur before explicit approval.
3. Confirm no upload/publishing path can execute automatically.
4. Validate schema consistency between producer prompt, validation code, UI types, and renderer.
5. Check auth/session handling, owner-only routes, CSRF/origin protections, and secret handling.
6. Inspect workflow permissions and ensure least privilege.
7. Run static checks and tests without requiring paid API calls.
8. Return a prioritized report: Critical / High / Medium / Low, each with evidence and a safe patch proposal.
