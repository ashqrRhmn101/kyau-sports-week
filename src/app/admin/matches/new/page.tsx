"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NewMatchPage() {
  const supabase = createClient();
  const [teams, setTeams] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [squad, setSquad] = useState<any[]>([]);

  const [form, setForm] = useState({
    season_id: "",
    team_a_id: "",
    team_b_id: "",
    date: "",
    referee_name: "",
    status: "completed",
  });

  const [event, setEvent] = useState({ player_id: "", event_type: "goal", minute: "" });
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("seasons").select("id, name").then(({ data }) => setSeasons(data ?? []));
    supabase.from("teams").select("id, department").then(({ data }) => setTeams(data ?? []));
  }, []);

  useEffect(() => {
    if (!form.team_a_id && !form.team_b_id) return;
    supabase
      .from("team_players")
      .select("player:player_id(id, name)")
      .in("team_id", [form.team_a_id, form.team_b_id].filter(Boolean))
      .then(({ data }) => setSquad((data ?? []).map((r: any) => r.player).filter(Boolean)));
  }, [form.team_a_id, form.team_b_id]);

  const createMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("matches")
      .insert({
        season_id: form.season_id,
        team_a_id: form.team_a_id,
        team_b_id: form.team_b_id,
        date: form.date,
        referee_name: form.referee_name || null,
        status: form.status,
      })
      .select()
      .single();
    if (!error && data) {
      setMatchId(data.id);
      setSavedMsg("ম্যাচ তৈরি হয়েছে। এখন নিচে ইভেন্ট যোগ করুন।");
    }
  };

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchId) return;

    await supabase.from("match_events").insert({
      match_id: matchId,
      player_id: event.player_id,
      event_type: event.event_type,
      minute: Number(event.minute) || 0,
    });

    // গোল হলে স্কোর অটো-আপডেট করার জন্য কোন টিমের প্লেয়ার তা বের করে সংশ্লিষ্ট স্কোর বাড়ানো হচ্ছে
    if (event.event_type === "goal") {
      const { data: teamPlayer } = await supabase
        .from("team_players")
        .select("team_id")
        .eq("player_id", event.player_id)
        .in("team_id", [form.team_a_id, form.team_b_id])
        .maybeSingle();

      if (teamPlayer) {
        const field = teamPlayer.team_id === form.team_a_id ? "score_a" : "score_b";
        const { data: current } = await supabase.from("matches").select(field).eq("id", matchId).single();
        if (current) {
          await supabase
            .from("matches")
            .update({ [field]: ((current as any)[field] ?? 0) + 1 })
            .eq("id", matchId);
        }
      }
    }

    setSavedMsg("ইভেন্ট যোগ হয়েছে।");
    setEvent({ player_id: "", event_type: "goal", minute: "" });
  };

  const inputClass = "w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100";

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-4xl text-chalk-100 mb-8">নতুন ম্যাচ এন্ট্রি</h1>

      <form onSubmit={createMatch} className="card p-6 space-y-4 mb-8">
        <div>
          <label className="text-sm text-chalk-300 block mb-1">সিজন</label>
          <select
            required
            value={form.season_id}
            onChange={(e) => setForm({ ...form, season_id: e.target.value })}
            className={inputClass}
          >
            <option value="">নির্বাচন করুন</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-chalk-300 block mb-1">টিম A</label>
            <select
              required
              value={form.team_a_id}
              onChange={(e) => setForm({ ...form, team_a_id: e.target.value })}
              className={inputClass}
            >
              <option value="">নির্বাচন করুন</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.department}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-chalk-300 block mb-1">টিম B</label>
            <select
              required
              value={form.team_b_id}
              onChange={(e) => setForm({ ...form, team_b_id: e.target.value })}
              className={inputClass}
            >
              <option value="">নির্বাচন করুন</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.department}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-chalk-300 block mb-1">তারিখ ও সময়</label>
            <input
              type="datetime-local"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm text-chalk-300 block mb-1">অবস্থা</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={inputClass}
            >
              <option value="scheduled">নির্ধারিত</option>
              <option value="live">লাইভ</option>
              <option value="completed">সম্পন্ন</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm text-chalk-300 block mb-1">রেফারি</label>
          <input
            value={form.referee_name}
            onChange={(e) => setForm({ ...form, referee_name: e.target.value })}
            className={inputClass}
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={!!matchId}>
          {matchId ? "ম্যাচ তৈরি হয়েছে ✓" : "ম্যাচ তৈরি করুন"}
        </button>
      </form>

      {matchId && (
        <form onSubmit={addEvent} className="card p-6 space-y-4">
          <h2 className="font-display text-xl text-chalk-100">ম্যাচ ইভেন্ট যোগ করুন</h2>
          <div>
            <label className="text-sm text-chalk-300 block mb-1">প্লেয়ার</label>
            <select
              required
              value={event.player_id}
              onChange={(e) => setEvent({ ...event, player_id: e.target.value })}
              className={inputClass}
            >
              <option value="">নির্বাচন করুন</option>
              {squad.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-chalk-300 block mb-1">ইভেন্ট টাইপ</label>
              <select
                value={event.event_type}
                onChange={(e) => setEvent({ ...event, event_type: e.target.value })}
                className={inputClass}
              >
                <option value="goal">গোল</option>
                <option value="assist">অ্যাসিস্ট</option>
                <option value="yellow_card">হলুদ কার্ড</option>
                <option value="red_card">লাল কার্ড</option>
                <option value="sub_in">সাব ইন</option>
                <option value="sub_out">সাব আউট</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-chalk-300 block mb-1">মিনিট</label>
              <input
                type="number"
                required
                value={event.minute}
                onChange={(e) => setEvent({ ...event, minute: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">
            ইভেন্ট যোগ করুন
          </button>
        </form>
      )}

      {savedMsg && <p className="text-floodlight-500 text-sm mt-4">{savedMsg}</p>}
    </div>
  );
}
