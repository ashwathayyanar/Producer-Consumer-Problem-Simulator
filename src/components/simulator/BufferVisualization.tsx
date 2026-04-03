import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SimState } from "@/hooks/useSimulation";

export function BufferVisualization({ state }: { state: SimState }) {
  const slots = Array.from({ length: state.bufferSize }, (_, i) => state.buffer[i] || null);

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Shared Buffer</h2>
        <span className="text-xs font-mono text-neon-cyan">
          {state.buffer.length}/{state.bufferSize}
        </span>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        {slots.map((item, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <div
                className={`
                  w-14 h-14 rounded-lg border-2 flex items-center justify-center
                  transition-all duration-300 text-xs font-mono font-bold
                  ${item
                    ? "border-neon-cyan bg-neon-cyan/10 neon-text-cyan glow-cyan scale-100"
                    : "border-border bg-muted/30 text-muted-foreground scale-95 opacity-50"
                  }
                `}
              >
                {item ? `#${item.id}` : "—"}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {item ? `Item #${item.id} by Producer ${item.producerId}` : `Slot ${i + 1} — empty`}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${(state.buffer.length / state.bufferSize) * 100}%`,
            background: state.buffer.length >= state.bufferSize
              ? "hsl(var(--neon-red))"
              : state.buffer.length > state.bufferSize * 0.7
              ? "hsl(var(--neon-yellow))"
              : "hsl(var(--neon-cyan))",
          }}
        />
      </div>
    </div>
  );
}
