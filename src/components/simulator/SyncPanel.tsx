import { Lock, Unlock, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SimState } from "@/hooks/useSimulation";

function SemaphoreGauge({ label, value, max, tooltip }: { label: string; value: number; max: number; tooltip: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              {label} <Info className="h-3 w-3" />
            </span>
            <span className="text-sm font-mono font-bold text-neon-cyan">{value}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-neon-cyan transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function SyncPanel({ state }: { state: SimState }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Synchronization</h2>

      {!state.synchronized && (
        <div className="rounded-lg border border-neon-red/50 bg-neon-red/10 p-2 text-xs text-neon-red text-center font-medium glow-red">
          ⚠️ Sync Disabled — Race Conditions Active
        </div>
      )}

      <SemaphoreGauge
        label="Empty (slots available)"
        value={state.semaphoreEmpty}
        max={state.bufferSize}
        tooltip="Semaphore 'empty' counts available buffer slots. Producers wait when this is 0."
      />

      <SemaphoreGauge
        label="Full (items in buffer)"
        value={state.semaphoreFull}
        max={state.bufferSize}
        tooltip="Semaphore 'full' counts filled buffer slots. Consumers wait when this is 0."
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              Mutex <Info className="h-3 w-3" />
            </span>
            <div className={`flex items-center gap-1.5 text-sm font-mono font-bold ${state.mutexLocked ? "text-neon-red" : "text-neon-green"}`}>
              {state.mutexLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              {state.mutexLocked ? "Locked" : "Unlocked"}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          Mutex ensures only one process accesses the critical section (buffer) at a time.
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
