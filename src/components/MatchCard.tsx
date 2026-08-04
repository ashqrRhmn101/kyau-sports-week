import Link from "next/link";

interface MatchCardProps {
  id: string;
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  status: "scheduled" | "live" | "completed";
  date: string;
}

const statusStyle: Record<MatchCardProps["status"], string> = {
  live: "bg-crimson/20 text-crimson",
  scheduled: "bg-pitch-600/30 text-chalk-300",
  completed: "bg-floodlight-500/15 text-floodlight-500",
};

const statusLabel: Record<MatchCardProps["status"], string> = {
  live: "লাইভ",
  scheduled: "নির্ধারিত",
  completed: "সম্পন্ন",
};

export default function MatchCard(props: MatchCardProps) {
  const { id, teamAName, teamBName, scoreA, scoreB, status, date } = props;
  return (
    <Link href={`/matches/${id}`} className="card p-4 block hover:border-floodlight-500/60 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className={`status-pill ${statusStyle[status]}`}>
          {status === "live" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-crimson mr-1.5 animate-pulse" />}
          {statusLabel[status]}
        </span>
        <span className="text-xs text-chalk-300">
          {new Date(date).toLocaleDateString("bn-BD", { day: "numeric", month: "short" })}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-chalk-100 font-medium truncate flex-1">{teamAName}</span>
        <span className="scoreboard-digit text-2xl font-bold text-floodlight-500 shrink-0 px-2">
          {scoreA} – {scoreB}
        </span>
        <span className="text-chalk-100 font-medium truncate flex-1 text-right">{teamBName}</span>
      </div>
    </Link>
  );
}
