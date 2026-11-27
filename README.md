# LERRY ANIMASI — YouTube Shorts Production Studio

Lerry menyiapkan paket produksi Shorts dari cerita final yang diberikan owner. AI hanya membagi cerita menjadi 4–6 adegan, memberi arahan visual, durasi, subtitle kutipan, dan metadata. AI tidak boleh menulis ulang atau mengubah alur cerita owner.

## Alur produksi

1. Owner menempelkan cerita final (80–3.000 karakter).
2. Groq menyusun storyboard dan metadata; owner memeriksa hasilnya.
3. Owner menyetujui render secara terpisah.
4. GitHub Actions menjalankan Edge TTS (Piper fallback), Remotion, dan FFmpeg.
5. QC memeriksa MP4 H.264, 1080×1920, 30 fps, audio AAC, durasi, decode, thumbnail, frame adegan, dan metadata.
6. Owner mengunduh ZIP, menonton MP4, lalu upload sendiri melalui YouTube Studio.

## Mode publikasi: manual

Lerry tidak meminta izin akun Google, tidak menggunakan YouTube OAuth, dan tidak mengunggah video ke channel. Tidak diperlukan YouTube Client ID, Client Secret, callback URL, token enkripsi, atau YouTube API untuk mode ini. Login Google/MFA tetap dikelola langsung oleh Google.

Upload manual: buka https://studio.youtube.com/, pilih Create → Upload videos, lalu unggah `lerry-animasi-short.mp4`. Gunakan `thumbnail.jpg` dan `youtube-metadata.json` dari paket. Owner menentukan visibilitas dan waktu publikasi.

## Konfigurasi runtime

- `GROQ_API_KEY`: wajib untuk membuat storyboard; `GROQ_API_KEY2` dan `GROQ_API_KEY3` opsional.
- `GROQ_MODEL`: `openai/gpt-oss-120b`.
- `GITHUB_ACTIONS_TOKEN`: token server-side dengan akses Actions read/write untuk menjalankan render pada branch kerja.
- `YOUTUBE_API_KEY`: opsional; Google YouTube Data API v3 menyediakan kuota gratis untuk pencarian Shorts dan statistik video. Tanpa key, analis tren memakai penemuan topik web tanpa mengarang views.
- Tidak memakai Supabase atau database cloud. Riwayat storyboard disimpan lokal pada browser perangkat.
- Tidak diperlukan Agnes API key, layanan video berbayar, GPU, atau YouTube OAuth.

## Output paket

- `lerry-animasi-short.mp4`
- `thumbnail.jpg`
- `youtube-metadata.json`
- `mp4-metadata.json`
- `production-qc.json`
- Frame representatif dan contact sheet untuk inspeksi.

## Batasan yang harus diketahui

- Latar adegan dapat dibuat per scene dengan Cloudflare Workers AI FLUX.1 Schnell jika secrets tersedia; karakter Lerry tetap memakai rig vektor yang terkunci. Tanpa konfigurasi Cloudflare, renderer memakai latar vektor.
- Audio saat ini berisi narasi TTS; musik dan efek suara terpisah belum dirender.
- Fakta eksternal belum diverifikasi otomatis.
- CI fixture membuktikan jalur paket storyboard → MP4; jalur Studio live tetap memerlukan pengujian pada Preview dengan kredensial runtime yang valid.
- Jangan menyebut mesin sepenuhnya siap produksi sebelum cerita owner berhasil melewati Studio live, render, unduh, dan inspeksi visual.

## Branch kerja

`experiment/openmontage-video-engine`. Branch `main` dan deployment produksi tidak diubah.


## Cloudflare AI scene backgrounds

The render workflow can generate one background image per storyboard scene with Cloudflare Workers AI `@cf/black-forest-labs/flux-1-schnell`. Add these GitHub Actions repository secrets on the render branch: `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`. Create the token with Account > Workers AI > Read permission. The workflow generates background plates only; the locked Lerry mascot remains the existing Remotion vector rig composited above each background. If the secrets are absent, the renderer uses its existing vector backgrounds and does not call a paid image provider. Workers AI Free currently includes 10,000 Neurons/day; requests beyond the free allocation fail on Workers Free rather than automatically upgrading. Review Cloudflare's current pricing and model terms before use.
