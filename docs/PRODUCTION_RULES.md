# LERRY ANIMASI — Owner-Authored Shorts Production Rules

## Owner input
The owner supplies the complete final story. The AI crew must not write, rewrite, shorten, reorder, embellish or change the plot, dialogue, facts or ending. If the story cannot fit 15–60 seconds without cutting or rewriting, stop and ask the owner what to prioritize.

## Automated production team
1. **Producer/orchestrator:** validates the owner story and starts the production workflow.
2. **Storyboard + metadata:** one Groq GPT-OSS 120B request creates 4–6 scenes, visual directions, timing, sound cues, title, description, hashtags and thumbnail prompt. Strict JSON Schema, low reasoning effort, maximum 3,200 completion tokens.
3. **Story integrity/QC:** deterministic code verifies the original story is preserved exactly and all narration, dialogue, subtitle and hook text are verbatim excerpts. It also checks scene count, duration and required visual prompts.
4. **Voice:** Edge TTS Indonesian Ardi voice generates narration per scene. Piper Indonesian voice is the fallback if Edge generation or audio conversion fails.
5. **Visual composition:** Remotion uses the generated visual directions with the existing vector backdrops and 2D character rig. Bespoke AI images per scene and full 3D acting are not yet implemented.
6. **Editor/render:** GitHub Actions runs Remotion and FFmpeg, validates H.264, 1080×1920, 30 fps, duration, audio and full decode, then uploads the MP4 artifact.
7. **Metadata:** title, description, hashtags and thumbnail prompt are returned in the same Groq call; no second LLM request.
8. **Research/fact verification:** not automatically performed in this free-first version. The model may identify claims needing verification and suggest search queries, but these are not evidence. Historical/scientific claims must be checked against primary sources before approval.
9. **Publisher:** manual owner action only. Never upload or schedule until the owner explicitly approves the final MP4 and metadata.

## Approval and publishing
- Do not ask the owner to write intermediate scripts or storyboards.
- Ask only when a real ambiguity, factual issue or safety issue blocks production.
- Do not publish, schedule, or make a video public until the owner explicitly approves the final rendered video and metadata.
- Upload target is YouTube only, profile @lerry_animasi, after approval.
- If any stage cannot be completed with available free resources, report the exact blocker and provide the closest working free alternative. Never claim a render, upload, integration, or test succeeded unless verified.

## Cost and security
- Free-first. Do not incur paid API, generation, hosting, stock-media, or subscription charges without the owner's explicit permission.
- One LLM API key: GROQ_API_KEY. Owner access uses OWNER_PASSWORD; GitHub render dispatch uses the existing GITHUB_ACTIONS_TOKEN.
- Never expose API keys or secrets in chat, logs, source files, or client-side code.
- No Supabase or cloud database in this first version; storyboard history is local to the browser/device.
- Do not purchase ads, boost posts, or spend account balances.
- YouTube only; do not publish to TikTok or Instagram.
