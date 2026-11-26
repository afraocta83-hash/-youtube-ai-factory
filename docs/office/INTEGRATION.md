# 3D Office Integration — LERRY ANIMASI

## Locked visual source
Use **The Roving Office** from https://github.com/atlassian-labs/roving-office as the visual source. The owner previously locked this office design. Do not substitute Agent Hive, Tiny Office, Hermes3D, or another visual office.

Upstream licence: Apache-2.0. Preserve its LICENSE and NOTICE files when redistributing source. The upstream README explicitly excludes certain third-party brand marks/logos from the Apache licence grant; remove those marks or replace them with LERRY ANIMASI-neutral marks before redistributing a modified build. Source: upstream README and NOTICE.

## Existing project reality (checked 2026-11-27)
The current branch `experiment/openmontage-video-engine` contains the LERRY ANIMASI Next.js app, but its current tree does **not** contain the previously described 3D office files. Earlier descriptions of a Canopy House–Spring integration and `yf:worker-event` listener were not accompanied by a repository commit or file paths. Do not claim that office was installed or that live worker events are connected.

The actual pipeline has these five technical workers:
1. Lerry — Groq story producer and metadata.
2. Nara — deterministic story/schema QC.
3. Ari — Indonesian voice (Edge TTS, Piper fallback).
4. Mika — Remotion animation.
5. Bima — GitHub Actions render and FFmpeg media QA.

The owner remains the publisher and final reviewer. There is no automatic YouTube publishing.

## Current code added
- `lib/office-agents.ts`: canonical five-worker roster and status contract.
- `app/api/office/agents/route.ts`: read-only JSON endpoint for the office UI at `/api/office/agents`.
- All workers correctly report `standby` and `connected: false` until actual production events are wired. This avoids fake activity.

## Hosting investigation
The Roving Office upstream is a Node HTTP server (`server.cjs`) that serves its Three.js client and its Agent Office Protocol (AOP) event receiver. It is not a static-only frontend. The main LERRY app is deployed on Vercel, which does not provide a persistent Node process for this upstream server.

A free Render web-service deployment was attempted in the Singapore region, but Render returned HTTP 402 requiring billing/payment information before service creation. No Render service was created and no payment was made. Do not ask for card details or enable a paid plan.

## Next implementation gates
1. Host a self-contained Roving Office-compatible server using a genuinely no-cost runtime; keep the visual source self-hosted, not on therovingoffice.com.
2. Preserve the selected building, interior, furniture, monitors and character assets; brighten the existing palette and optimize for Android.
3. Connect the five workers to actual pipeline events through the upstream AOP receiver. Use an owner-only server-side token; never expose it in browser code or repository.
4. Emit status transitions only when the corresponding real work starts, waits for review, completes or fails.
5. Verify office on Android, verify AOP event delivery, and ensure no third-party logo/trademark assets are redistributed without permission.

## Security and approval
- No API keys, write tokens, owner passwords or secrets in source.
- No paid service or payment method without explicit approval.
- No merge to `main` or Production deployment.
- No render or YouTube upload without the owner's separate approval.
