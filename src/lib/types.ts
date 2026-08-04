export type UserRole = "admin" | "player" | "viewer";

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  department: string | null;
  email: string | null;
}

export type PlayerStatus = "approved" | "pending";

export interface Player {
  id: string;
  profile_id: string | null;
  name: string;
  department: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  jersey_no: number | null;
  photo_url: string | null;
  bio: string | null;
  status: PlayerStatus;
  submitted_by: string | null;
  created_at: string;
}

export interface Season {
  id: string;
  year: number;
  term: string; // e.g. "Spring 2026"
  name: string;
}

export interface Coach {
  id: string;
  name: string;
  department: string;
  playing_style_notes: string | null;
}

export interface Team {
  id: string;
  department: string;
  season_id: string;
  coach_id: string | null;
  formation: string | null;
}

export type MatchStatus = "scheduled" | "live" | "completed";

export interface Match {
  id: string;
  season_id: string;
  team_a_id: string;
  team_b_id: string;
  date: string;
  referee_name: string | null;
  score_a: number;
  score_b: number;
  status: MatchStatus;
}

export type MatchEventType =
  | "goal"
  | "assist"
  | "yellow_card"
  | "red_card"
  | "sub_in"
  | "sub_out";

export interface MatchEvent {
  id: string;
  match_id: string;
  player_id: string;
  event_type: MatchEventType;
  minute: number;
}

export interface PlayerMatchStat {
  id: string;
  match_id: string;
  player_id: string;
  rating: number | null;
  goals: number;
  assists: number;
  fouls: number;
  minutes_played: number;
}

export interface PendingEdit {
  id: string;
  table_name: string;
  record_id: string | null;
  submitted_by: string;
  changes: Record<string, unknown>;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  created_at: string;
}
