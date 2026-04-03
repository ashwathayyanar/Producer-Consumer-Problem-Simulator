import { useEffect, useRef } from "react";
import type { LogEntry } from "@/hooks/useSimulation";

function logColor(type: LogEntry["type"]) {
  switch (type) {
    case "produce": return "text-neon-green";
    case "consume": return "text-neon-purple";
    case "wait": return "text-neon-yellow";
    case "lock": return "text-neon-red";
    case "unlock": return "text-neon-cyan";
    default: return "text-muted-foreground";
  }
}

export function EventLog({ log }: { log: LogEntry[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log.length]);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Event Log</h2>
      <div className="h-40 overflow-y-auto scrollbar-thin font-mono text-xs space-y-0.5">
        {log.length === 0 && (
          <p className="text-muted-foreground italic">No events yet. Start the simulation.</p>
        )}
        {log.map((entry) => (
          <div key={entry.id} className="flex gap-2 py-0.5">
            <span className="text-muted-foreground shrink-0">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
            <span className={logColor(entry.type)}>{entry.message}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
