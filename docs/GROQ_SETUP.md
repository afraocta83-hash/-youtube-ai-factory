# Konfigurasi Groq untuk LERRY ANIMASI

## Model

- Provider: Groq
- Model: `openai/gpt-oss-120b`
- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- Output: JSON terstruktur untuk 4–6 adegan.
- Satu permintaan model per storyboard; tidak ada loop retry AI.

Groq hanya membagi cerita final owner menjadi adegan, arahan visual, durasi, subtitle kutipan, dan metadata. Cerita/narasi owner harus dipertahankan. Validasi server menolak paket yang mengubah cerita atau memparafrase narasi.

## Environment variables

Buat API key di https://console.groq.com/keys lalu simpan sebagai secret di hosting Preview:

- `GROQ_API_KEY`: wajib.
- `GROQ_API_KEY2`: opsional.
- `GROQ_API_KEY3`: opsional.
- `GROQ_MODEL`: `openai/gpt-oss-120b`.
- `GITHUB_ACTIONS_TOKEN`: secret server-side dengan izin Actions read/write untuk repo dan branch `experiment/openmontage-video-engine`.

Jangan menaruh key di browser, chat, atau repository. Setelah mengubah environment variables, deploy ulang Preview agar nilai baru digunakan.

## Penyimpanan dan biaya

- Tidak menggunakan Supabase atau database cloud.
- Riwayat maksimal 10 storyboard tersimpan di localStorage browser perangkat.
- Groq, GitHub Actions, Edge TTS/Piper, Remotion, dan FFmpeg adalah komponen pipeline.
- Render memakai GitHub-hosted CPU runner; tidak membutuhkan GPU atau Agnes API.
- Kuota gratis penyedia dapat berubah.

## Pipeline produksi

1. Owner menempelkan cerita final (80–3.000 karakter).
2. Groq menghasilkan paket storyboard/metadata sesuai schema.
3. Owner memeriksa cerita, adegan, subtitle, dan metadata.
4. Setelah owner menekan persetujuan render, GitHub Actions menjalankan Edge TTS (Piper fallback).
5. Remotion membuat animasi vertikal dan FFmpeg menghasilkan MP4.
6. QC memeriksa H.264, 1080×1920, 30 fps, AAC, durasi, full decode, thumbnail, dan frame representatif.
7. Owner mengunduh ZIP, memeriksa MP4, lalu mengunggahnya sendiri ke https://studio.youtube.com/.

## Upload YouTube manual

Mode publikasi Lerry adalah manual. Tidak diperlukan OAuth Client ID, Client Secret, Redirect URI, token enkripsi, YouTube Data API, atau kredensial Google di hosting. MFA tetap dikelola langsung di akun Google. Owner menentukan visibilitas dan waktu publikasi di YouTube Studio.

## Batasan

- Visual menggunakan komposisi vektor 2D berbasis template, bukan footage AI khusus per adegan.
- Audio saat ini berisi narasi TTS; musik dan efek suara terpisah belum dirender.
- Pemeriksaan fakta eksternal belum otomatis.
- Jalur Studio live tetap perlu dites pada Preview menggunakan environment secrets yang valid.
