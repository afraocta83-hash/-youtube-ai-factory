"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

type SavedProduction = {
  id: string;
  working_title: string;
  status: string;
  created_at: string;
};

type Props = { production: Record<string, unknown> | null };

export default function SupabasePanel({ production }: Props) {
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<SavedProduction[]>([]);
  const [configured, setConfigured] = useState(false);

  const loadHistory = useCallback(async (userId: string) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("lerry_productions")
      .select("id,working_title,status,created_at")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) {
      setMessage(error.message.includes("does not exist")
        ? "Tabel belum dibuat. Jalankan supabase/schema.sql di SQL Editor."
        : error.message);
      return;
    }
    setHistory((data || []) as SavedProduction[]);
  }, [supabase]);

  useEffect(() => {
    setConfigured(Boolean(supabase));
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) void loadHistory(data.user.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) void loadHistory(session.user.id);
      else setHistory([]);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase, loadHistory]);

  async function signIn() {
    if (!supabase || !email.trim()) return;
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin }
    });
    setMessage(error ? error.message : "Link masuk sudah dikirim ke email. Buka email yang sama di HP ini.");
    setBusy(false);
  }

  async function save() {
    if (!supabase || !user || !production) return;
    setBusy(true); setMessage("");
    const payload = production as { workingTitle?: string; script?: string };
    const { error } = await supabase.from("lerry_productions").insert({
      owner_id: user.id,
      working_title: payload.workingTitle || "Lerry Short",
      original_story: payload.script || "",
      production,
      status: "storyboard"
    });
    if (error) setMessage(error.message);
    else {
      setMessage("Storyboard tersimpan di Supabase.");
      await loadHistory(user.id);
    }
    setBusy(false);
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setMessage("Sudah keluar dari akun Supabase.");
  }

  return <section className="card" style={{ marginTop: 18 }}>
    <span className="status">DATABASE • SUPABASE</span>
    <h2 style={{ marginTop: 12 }}>Penyimpanan produksi</h2>
    {!configured ? <>
      <p className="muted">Integrasi sudah disiapkan di kode, tetapi belum aktif. Tambahkan URL dan publishable key Supabase ke environment Vercel.</p>
      <p className="muted">Variabel: NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.</p>
    </> : user ? <>
      <p className="muted">Login: {user.email}</p>
      <div className="studioActions">
        <button onClick={save} disabled={!production || busy}>Simpan storyboard ini</button>
        <button className="secondary" onClick={signOut} disabled={busy}>Keluar</button>
      </div>
      <h3 style={{ marginTop: 18 }}>Riwayat tersimpan</h3>
      {history.length ? <ul>{history.map(item => <li key={item.id}>{item.working_title} — {new Date(item.created_at).toLocaleString("id-ID")} ({item.status})</li>)}</ul> : <p className="muted">Belum ada produksi tersimpan.</p>}
    </> : <>
      <p className="muted">Masuk dengan email untuk menyimpan storyboard dan melihat riwayat produksi pribadi.</p>
      <label htmlFor="supabaseEmail">Email owner</label>
      <input id="supabaseEmail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email lo" autoComplete="email" />
      <div className="studioActions"><button onClick={signIn} disabled={busy || !email.includes("@")}>{busy ? "Mengirim..." : "Kirim link login"}</button></div>
    </>}
    {message && <p className="muted" role="status">{message}</p>}
    <p className="muted" style={{ fontSize: 12 }}>Akses database dibatasi RLS berdasarkan akun login. Tidak ada service-role key di browser.</p>
  </section>;
}
