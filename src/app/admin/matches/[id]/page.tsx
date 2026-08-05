"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ClipLoader } from "react-spinners";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import Swal from "sweetalert2";

const eventLabel: Record<string, string> = {
  goal: "⚽ গোল",
  assist: "🎯 অ্যাসিস্ট",
  yellow_card: "🟨 হলুদ কার্ড",
  red_card: "🟥 লাল কার্ড",
  sub_in: "🔄 সাব ইন",
  sub_out: "🔄 সাব আউট",
};

export default function MatchManagePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [match, setMatch] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [statRows, setStatRows] = useState<any[]>([]);
  const [squad, setSquad] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingMatch, setSavingMatch] = useState(false);

  const [eventForm, setEventForm] = useState({ player_id: "", event_type: "goal", minute: "" });
  const [statForm, setStatForm] = useState({ player_id: "", rating: "", goals: "", assists: "", fouls: "", minutes_played: "" });

  const load = async () => {
    setLoading(true);
    const { data: m } = await supabase
      .from("matches")
      .select("*, team_a:team_a_id(id, department), team_b:team_b_id(id, department)")
      .eq("id", params.id)
      .single();
    setMatch(m);

    const { data: ev } = await supabase
      .from("match_events")
      .select("id, event_type, minute, player:player_id(id, name)")
      .eq("match_id", params.id)
      .order("minute");
    setEvents(ev ?? []);

    const { data: st } = await supabase
      .from("player_match_stats")
      .select("id, rating, goals, assists, fouls, minutes_played, player:player_id(id, name)")
      .eq("match_id", params.id);
    setStatRows(st ?? []);

    if (m) {
      const { data: sq } = await supabase
        .from("team_players")
        .select("player:player_id(id, name)")
        .in("team_id", [m.team_a_id, m.team_b_id]);
      setSquad((sq ?? []).map((r: any) => r.player).filter(Boolean));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const saveMatchInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMatch(true);
    const { error } = await supabase
      .from("matches")
      .update({
        date: match.date,
        referee_name: match.referee_name || null,
        status: match.status,
        score_a: Number(match.score_a),
        score_b: Number(match.score_b),
      })
      .eq("id", params.id);
    setSavingMatch(false);
    if (error) {
      Swal.fire({ icon: "error", title: "সমস্যা হয়েছে", text: error.message, background: "#0B1F17", color: "#F5F3EA" });
      return;
    }
    Swal.fire({ icon: "success", title: "সেভ হয়েছে", timer: 1100, showConfirmButton: false, background: "#0B1F17", color: "#F5F3EA" });
    load();
  };

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.player_id || !eventForm.minute) return;

    await supabase.from("match_events").insert({
      match_id: params.id,
      player_id: eventForm.player_id,
      event_type: eventForm.event_type,
      minute: Number(eventForm.minute),
    });

    // গোল হলে সংশ্লিষ্ট টিমের স্কোর অটো-আপডেট
    if (eventForm.event_type === "goal" && match) {
      const { data: tp } = await supabase
        .from("team_players")
        .select("team_id")
        .eq("player_id", eventForm.player_id)
        .in("team_id", [match.team_a_id, match.team_b_id])
        .maybeSingle();
      if (tp) {
        const field = tp.team_id === match.team_a_id ? "score_a" : "score_b";
        await supabase
          .from("matches")
          .update({ [field]: (match[field] ?? 0) + 1 })
          .eq("id", params.id);
      }
    }

    setEventForm({ player_id: "", event_type: "goal", minute: "" });
    load();
  };

  const deleteEvent = async (id: string) => {
    await supabase.from("match_events").delete().eq("id", id);
    load();
  };

  const saveStat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statForm.player_id) return;
    const { error } = await supabase.from("player_match_stats").upsert(
      {
        match_id: params.id,
        player_id: statForm.player_id,
        rating: statForm.rating ? Number(statForm.rating) : null,
        goals: statForm.goals ? Number(statForm.goals) : 0,
        assists: statForm.assists ? Number(statForm.assists) : 0,
        fouls: statForm.fouls ? Number(statForm.fouls) : 0,
        minutes_played: statForm.minutes_played ? Number(statForm.minutes_played) : 0,
      },
      { onConflict: "match_id,player_id" }
    );
    if (error) {
      Swal.fire({ icon: "error", title: "সমস্যা হয়েছে", text: error.message, background: "#0B1F17", color: "#F5F3EA" });
      return;
    }
    setStatForm({ player_id: "", rating: "", goals: "", assists: "", fouls: "", minutes_played: "" });
    load();
  };

  const inputClass = "w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100 text-sm";

  if (loading || !match) {
    return (
      <div className="flex justify-center py-24">
        <ClipLoader color="#FFC94A" size={36} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/matches" className="inline-flex items-center gap-1.5 text-sm text-chalk-300 hover:text-floodlight-500 mb-4">
        <ArrowLeft size={14} /> সব ম্যাচ
      </Link>
      <h1 className="font-display text-4xl text-chalk-100 mb-8">
        {match.team_a?.department} <span className="scoreboard-digit text-floodlight-500">{match.score_a}–{match.score_b}</span> {match.team_b?.department}
      </h1>

      {/* ম্যাচের তথ্য */}
      <form onSubmit={saveMatchInfo} className="card p-5 space-y-4 mb-8">
        <h2 className="font-display text-xl text-chalk-100">ম্যাচের তথ্য</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-chalk-300 block mb-1">তারিখ ও সময়</label>
            <input
              type="datetime-local"
              value={match.date?.slice(0, 16)}
              onChange={(e) => setMatch({ ...match, date: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-chalk-300 block mb-1">অবস্থা</label>
            <select value={match.status} onChange={(e) => setMatch({ ...match, status: e.target.value })} className={inputClass}>
              <option value="scheduled">নির্ধারিত</option>
              <option value="live">লাইভ</option>
              <option value="completed">সম্পন্ন</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-chalk-300 block mb-1">স্কোর A ({match.team_a?.department})</label>
            <input
              type="number"
              value={match.score_a}
              onChange={(e) => setMatch({ ...match, score_a: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-chalk-300 block mb-1">স্কোর B ({match.team_b?.department})</label>
            <input
              type="number"
              value={match.score_b}
              onChange={(e) => setMatch({ ...match, score_b: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-chalk-300 block mb-1">রেফারি</label>
            <input
              value={match.referee_name ?? ""}
              onChange={(e) => setMatch({ ...match, referee_name: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <button type="submit" disabled={savingMatch} className="btn-primary flex items-center gap-1.5">
          {savingMatch ? <ClipLoader color="#0B1F17" size={14} /> : <Save size={14} />} সেভ করুন
        </button>
      </form>

      {/* ইভেন্ট */}
      <div className="card p-5 mb-8">
        <h2 className="font-display text-xl text-chalk-100 mb-4">ম্যাচ ইভেন্ট</h2>
        <form onSubmit={addEvent} className="grid sm:grid-cols-4 gap-2 mb-4">
          <select
            value={eventForm.player_id}
            onChange={(e) => setEventForm({ ...eventForm, player_id: e.target.value })}
            className={inputClass}
            required
          >
            <option value="">প্লেয়ার</option>
            {squad.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={eventForm.event_type}
            onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
            className={inputClass}
          >
            {Object.entries(eventLabel).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="মিনিট"
            required
            value={eventForm.minute}
            onChange={(e) => setEventForm({ ...eventForm, minute: e.target.value })}
            className={inputClass}
          />
          <button type="submit" className="btn-primary flex items-center justify-center gap-1.5">
            <Plus size={14} /> যোগ করুন
          </button>
        </form>

        {events.length === 0 ? (
          <p className="text-chalk-300 text-sm">এখনো কোনো ইভেন্ট নেই।</p>
        ) : (
          <div className="divide-y divide-cardline">
            {events.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-chalk-100">
                  <span className="scoreboard-digit text-floodlight-500">{e.minute}'</span> {eventLabel[e.event_type]} — {e.player?.name}
                </span>
                <button onClick={() => deleteEvent(e.id)} className="text-crimson hover:bg-crimson/10 p-1.5 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* প্লেয়ার রেটিং/পারফরম্যান্স */}
      <div className="card p-5">
        <h2 className="font-display text-xl text-chalk-100 mb-1">প্লেয়ার রেটিং ও পারফরম্যান্স</h2>
        <p className="text-xs text-chalk-300 mb-4">একই প্লেয়ারের জন্য আবার সাবমিট করলে আগেরটা আপডেট হয়ে যাবে।</p>
        <form onSubmit={saveStat} className="grid sm:grid-cols-6 gap-2 mb-4">
          <select
            value={statForm.player_id}
            onChange={(e) => setStatForm({ ...statForm, player_id: e.target.value })}
            className={`${inputClass} sm:col-span-2`}
            required
          >
            <option value="">প্লেয়ার</option>
            {squad.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            placeholder="রেটিং"
            value={statForm.rating}
            onChange={(e) => setStatForm({ ...statForm, rating: e.target.value })}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="ফাউল"
            value={statForm.fouls}
            onChange={(e) => setStatForm({ ...statForm, fouls: e.target.value })}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="মিনিট খেলেছে"
            value={statForm.minutes_played}
            onChange={(e) => setStatForm({ ...statForm, minutes_played: e.target.value })}
            className={inputClass}
          />
          <button type="submit" className="btn-primary flex items-center justify-center gap-1.5">
            <Plus size={14} /> সেভ
          </button>
        </form>

        {statRows.length === 0 ? (
          <p className="text-chalk-300 text-sm">এখনো কোনো রেটিং যোগ করা হয়নি।</p>
        ) : (
          <div className="divide-y divide-cardline">
            {statRows.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-chalk-100">{s.player?.name}</span>
                <span className="text-chalk-300 scoreboard-digit">
                  রেটিং {s.rating ?? "—"} · {s.minutes_played}' · ফাউল {s.fouls}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
