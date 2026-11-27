# Lerry Production Office

## Current implementation

The home dashboard now opens the Lerry Production Office. Its visual language is an original, lightweight CSS isometric office inspired by the spatial office concept selected by the owner. It does not embed the upstream site, use upstream banners, logos, trademarks, characters, or third-party assets.

The office is designed to remain light on Android: no Three.js scene, remote iframe, external image requests, extra runtime, database, or paid service is required for the office view.

## Single source of truth for staff

`lib/agents/registry.ts` remains the source of truth for the nine project staff. `lib/office-agents.ts` maps those same IDs to departments, responsibilities and existing project routes. The office API is `GET /api/office/agents`; the dashboard reads it without exposing secrets.

| Staff | Existing project task | Route / integration |
| --- | --- | --- |
| Niko — Analis Tren | Shorts trend research and views/day signals | `POST /api/research` |
| Sinta — Pemeriksa Fakta | Claim and source comparison | `POST /api/research` |
| Dika — Analis Peluang Viral | Opportunity scoring from research evidence | `POST /api/research` |
| Maya — Pengarah Narasi | Indonesian narration per scene | `POST /api/produce` → GitHub Actions TTS |
| Bimo — Perancang Visual | Scene composition and 2D character animation | `POST /api/produce` → Remotion |
| Raka — Editor Video | Vertical MP4 render dispatch | `POST /api/render` → `render-short.yml` |
| Tara — Pemeriksa Kualitas | Storyboard QC and media QC | `POST /api/quality-check` → FFmpeg QA |
| Oki — Pemantau Produksi | OpenTelemetry spans and optional Langfuse traces | `instrumentation.ts` / `lib/agents/telemetry.ts` |
| Lina — Penyiap Publikasi | Metadata and owner-reviewed publishing package | Production metadata and render artifact |

The original studio, research desk, review gate and manual YouTube publishing flow remain in the same application below the office dashboard. No production engine was replaced.

## Activity truthfulness

All nine staff are assigned to existing project tasks. The office API marks that assignment as connected, but reports activity as `standby` and `activityFeedConnected: false` until authenticated, real production events are wired to the UI. Capability readiness (`ready`, `optional`, `blocked`) is not a claim that a worker is currently running.

The office must not animate workers as working, reviewing, completed or failed based only on a static roster. Future live activity needs authenticated server-side events from research, produce, QC and render stages. Secrets must never be sent to browser code.

## Hosting and release constraints

- Work only on `experiment/openmontage-video-engine`.
- Keep the existing Vercel hosting and GitHub Actions render pipeline.
- No paid hosting, card details, external agent service, or new API key.
- Do not merge to `main` or deploy Production without separate owner approval.
- Render and YouTube upload remain behind the existing owner approval gates.
