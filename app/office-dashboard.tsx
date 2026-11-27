"use client";

import { useEffect, useMemo, useState } from "react";
import Studio from "@/app/studio";

type Worker = {
  id: string;
  name: string;
  role: string;
  department: string;
  responsibility: string;
  runtime: string;
  taskRoute: string;
  capability: "ready" | "optional" | "blocked";
  activity: "standby" | "working" | "review" | "done" | "error";
  connectedToProject: boolean;
  liveActivity: boolean;
};

type OfficeData = {
  connected: boolean;
  activityFeedConnected: boolean;
  summary: { staff: number; assigned: number; ready: number; optional: number; blocked: number; active: number };
  workers: Worker[];
  note: string;
};

const capabilityLabel = (value: Worker["capability"]) =>
  value === "ready" ? "SIAP" : value === "optional" ? "OPSIONAL" : "BELUM AKTIF";

const initials = (name: string) =>
  name.split("—")[0].trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

export default function OfficeDashboard() {
  const [office, setOffice] = useState<OfficeData | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activityMessage, setActivityMessage] = useState("Belum ada pekerjaan aktif di sesi ini.");

  useEffect(() => {
    const handleActivity = (event: Event) => {
      const detail = (event as CustomEvent<{workerIds:string[];activity:Worker["activity"];message:string}>).detail;
      if (!detail) return;
      setOffice((current) => current ? {
        ...current,
        activityFeedConnected: true,
        workers: current.workers.map((worker) => detail.workerIds.includes(worker.id) ? { ...worker, activity: detail.activity } : worker),
        summary: { ...current.summary, active: current.workers.filter((worker) => detail.workerIds.includes(worker.id) ? detail.activity === "working" || detail.activity === "review" : worker.activity === "working" || worker.activity === "review").length },
      } : current);
      setActivityMessage(detail.message);
    };
    window.addEventListener("lerry:office-activity", handleActivity);
    return () => window.removeEventListener("lerry:office-activity", handleActivity);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/office/agents", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Data kantor tidak dapat dimuat.");
        setOffice(data);
        setSelectedId((current) => current || data.workers?.[0]?.id || "");
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Gagal memuat kantor.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const selected = useMemo(
    () => office?.workers.find((worker) => worker.id === selectedId) || office?.workers[0] || null,
    [office, selectedId]
  );

  function openProduction() {
    document.getElementById("production-studio")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="office-shell">
      <header className="office-header">
        <a className="office-brand" href="#top" aria-label="Lerry Animasi beranda">
          <span className="office-brand-mark">L</span>
          <span><strong>LERRY ANIMASI</strong><small>PRODUCTION OFFICE</small></span>
        </a>
        <nav className="office-nav" aria-label="Navigasi utama">
          <a className="active" href="#office-floor">Kantor</a>
          <a href="#team">Tim</a>
          <a href="#production-studio">Produksi</a>
        </nav>
        <span className="office-connection"><i /> PROJECT TERHUBUNG</span>
      </header>

      <section className="office-welcome" id="top">
        <div>
          <span className="office-eyebrow">RUANG KERJA DIGITAL • YOUTUBE SHORTS</span>
          <h1>Kantor Produksi Lerry</h1>
          <p>Satu kantor untuk seluruh tim riset, kreatif, produksi, quality control, dan publikasi. Setiap staff diarahkan ke tugas yang benar-benar tersedia di project.</p>
        </div>
        <button className="office-primary" onClick={openProduction}>Buka meja produksi <span>↗</span></button>
      </section>

      <section className="office-metrics" aria-label="Ringkasan project">
        <article><span>STAFF TERDAFTAR</span><strong>{office?.summary.staff ?? (loading ? "…" : "—")}</strong><small>Tim project Lerry</small></article>
        <article><span>TUGAS TERHUBUNG</span><strong>{office?.summary.assigned ?? (loading ? "…" : "—")}</strong><small>Dipetakan ke alur kerja</small></article>
        <article><span>KEMAMPUAN SIAP</span><strong>{office?.summary.ready ?? (loading ? "…" : "—")}</strong><small>Konfigurasi tersedia</small></article>
        <article><span>AKTIVITAS SEKARANG</span><strong>{office?.summary.active ?? "0"}</strong><small>{office?.activityFeedConnected ? "Event produksi live" : "Belum ada event live"}</small></article>
      </section>

      <section className="office-section" id="office-floor">
        <div className="office-section-heading">
          <div><span className="office-eyebrow">01 / RUANG KANTOR</span><h2>Lantai kerja tim</h2></div>
          <span className="office-live-note"><i /> {office?.activityFeedConnected ? "LIVE ACTIVITY" : "MODE SIAGA"}</span>
        </div>
        <div className="office-layout">
          <div className="office-room">
            <div className="office-room-back"><span className="office-window window-one" /><span className="office-window window-two" /><span className="office-wall-sign">LERRY<br/>STUDIO</span></div>
            <div className="office-room-floor">
              <div className="office-room-rug" />
              <div className="office-staff-grid" id="team">
                {office?.workers.map((worker, index) => (
                  <button
                    type="button"
                    className={`office-workstation ${selectedId === worker.id ? "selected" : ""}`}
                    key={worker.id}
                    onClick={() => setSelectedId(worker.id)}
                    aria-pressed={selectedId === worker.id}
                  >
                    <span className={`office-avatar avatar-${index % 5}`}><b>{initials(worker.name)}</b></span>
                    <span className="office-desk" />
                    <strong>{worker.name.split("—")[0].trim()}</strong>
                    <small>{worker.department}</small>
                    <em className={worker.capability}>{capabilityLabel(worker.capability)}</em>
                  </button>
                ))}
                {!office && loading && <div className="office-loading">Menyiapkan kantor dan menghubungkan daftar staff…</div>}
                {!office && error && <div className="office-loading office-error">{error}</div>}
              </div>
              <div className="office-room-plant plant-left">✿</div>
              <div className="office-room-plant plant-right">✿</div>
            </div>
          </div>

          <aside className="office-staff-detail">
            {selected ? <>
              <div className="office-detail-top"><span className="office-eyebrow">PROFIL STAFF</span><span className={`office-capability ${selected.capability}`}>{capabilityLabel(selected.capability)}</span></div>
              <div className="office-detail-person"><span className="office-detail-avatar">{initials(selected.name)}</span><div><h3>{selected.name}</h3><p>{selected.role}</p></div></div>
              <div className="office-detail-block"><small>DEPARTEMEN</small><strong>{selected.department}</strong></div>
              <div className="office-detail-block"><small>TUGAS PROJECT</small><p>{selected.responsibility}</p></div>
              <div className="office-detail-block"><small>JALUR KERJA</small><code>{selected.taskRoute}</code></div>
              <div className="office-detail-block"><small>MESIN / RUNTIME</small><p>{selected.runtime}</p></div>
              <div className="office-detail-status"><span className="office-status-dot" /><div><strong>{selected.activity === "working" ? "Sedang bekerja" : selected.activity === "review" ? "Memeriksa hasil" : selected.activity === "done" ? "Selesai" : selected.activity === "error" ? "Ada kendala" : "Standby"}</strong><small>{activityMessage}</small></div></div>
            </> : <p className="office-muted">{loading ? "Memuat profil staff…" : "Pilih staff untuk melihat tugasnya."}</p>}
          </aside>
        </div>
        <p className="office-footnote">{office?.activityFeedConnected ? "Aktivitas diperbarui dari pekerjaan yang benar-benar dijalankan di sesi browser ini. Status kembali standby saat halaman dimuat ulang." : "Kantor siap menerima event pekerjaan dari riset, storyboard, QC, dan render. Status tidak dibuat-buat."}</p>
      </section>

      <section className="office-section office-workflow">
        <div className="office-section-heading"><div><span className="office-eyebrow">02 / ALUR PROJECT</span><h2>Jalur kerja Shorts</h2></div><span className="office-muted">Satu project • satu pipeline</span></div>
        <div className="office-pipeline">
          <article><b>01</b><strong>Riset & peluang</strong><p>Niko · Sinta · Dika</p><small>Tren, verifikasi, peluang viral</small></article>
          <span className="office-pipeline-arrow">→</span>
          <article><b>02</b><strong>Cerita & storyboard</strong><p>Lerry · Maya</p><small>Ide, narasi, dialog, metadata</small></article>
          <span className="office-pipeline-arrow">→</span>
          <article><b>03</b><strong>Visual & render</strong><p>Bimo · Raka</p><small>Remotion, TTS, MP4 vertikal</small></article>
          <span className="office-pipeline-arrow">→</span>
          <article><b>04</b><strong>QC & publikasi</strong><p>Tara · Oki · Lina</p><small>Validasi, monitoring, paket upload</small></article>
        </div>
        <div className="office-approval-note"><strong>Persetujuan owner tetap wajib.</strong><span>Staff menyiapkan hasil. Render dimulai setelah owner menyetujui storyboard; upload tetap manual setelah MP4 diperiksa.</span></div>
      </section>

      <section className="office-production" id="production-studio">
        <div className="office-section-heading"><div><span className="office-eyebrow">03 / MEJA PRODUKSI</span><h2>Studio YouTube Shorts</h2><p className="office-muted">Mesin produksi yang sudah ada tetap dipakai; kantor ini menjadi dashboard dan pusat kendali tim.</p></div></div>
        <Studio />
      </section>

      <footer className="office-footer"><strong>LERRY ANIMASI</strong><span>Production Office · YouTube Shorts · Owner approval required</span></footer>
    </main>
  );
}
