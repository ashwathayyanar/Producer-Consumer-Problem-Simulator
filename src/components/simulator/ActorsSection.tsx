import { ArrowDown, ArrowUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Actor } from "@/hooks/useSimulation";

function stateColor(state: Actor["state"]) {
  switch (state) {
    case "active": return { border: "border-neon-green", bg: "bg-neon-green/10", glow: "glow-green", text: "text-neon-green" };
    case "waiting": return { border: "border-neon-yellow", bg: "bg-neon-yellow/10", glow: "glow-yellow", text: "text-neon-yellow" };
    case "blocked": return { border: "border-neon-red", bg: "bg-neon-red/10", glow: "glow-red", text: "text-neon-red" };
    default: return { border: "border-border", bg: "bg-muted/20", glow: "", text: "text-muted-foreground" };
  }
}

function stateLabel(state: Actor["state"]) {
  switch (state) {
    case "active": return "Active";
    case "waiting": return "Waiting";
    case "blocked": return "Blocked";
    default: return "Idle";
  }
}

function ActorCard({ actor }: { actor: Actor }) {
  const colors = stateColor(actor.state);
  const isProducer = actor.type === "producer";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`
          rounded-lg border-2 ${colors.border} ${colors.bg} ${colors.glow}
          p-3 flex flex-col items-center gap-1 transition-all duration-300 min-w-[80px]
        `}>
          <div className={`rounded-full p-1.5 ${colors.bg}`}>
            {isProducer
              ? <ArrowDown className={`h-4 w-4 ${colors.text}`} />
              : <ArrowUp className={`h-4 w-4 ${colors.text}`} />
            }
          </div>
          <span className="text-xs font-semibold text-foreground">
            {isProducer ? "P" : "C"}{actor.id}
          </span>
          <span className={`text-[10px] font-medium ${colors.text}`}>
            {stateLabel(actor.state)}
          </span>
          <span className="text-[10px] text-muted-foreground">×{actor.itemsProcessed}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {isProducer ? "Producer" : "Consumer"} {actor.id} — {stateLabel(actor.state)} — {actor.itemsProcessed} items processed
      </TooltipContent>
    </Tooltip>
  );
}

export function ActorsSection({ producers, consumers }: { producers: Actor[]; consumers: Actor[] }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <ArrowDown className="h-3 w-3 text-neon-green" /> Producers
        </h3>
        <div className="flex flex-wrap gap-2">
          {producers.map((p) => <ActorCard key={p.id} actor={p} />)}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <ArrowUp className="h-3 w-3 text-neon-purple" /> Consumers
        </h3>
        <div className="flex flex-wrap gap-2">
          {consumers.map((c) => <ActorCard key={c.id} actor={c} />)}
        </div>
      </div>
    </div>
  );
}
