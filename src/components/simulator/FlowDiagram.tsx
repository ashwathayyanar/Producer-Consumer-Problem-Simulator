import { ArrowRight, ArrowDown, ArrowUp, Lock, Shield } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SimState } from "@/hooks/useSimulation";

export function FlowDiagram({ state }: { state: SimState }) {
  const bufferFill = state.bufferSize > 0 ? state.buffer.length / state.bufferSize : 0;
  const anyProducerActive = state.producers.some((p) => p.state === "active");
  const anyConsumerActive = state.consumers.some((c) => c.state === "active");

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Data Flow
      </h2>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* Producers column */}
        <div className="flex flex-col items-center gap-1.5 min-w-[70px]">
          {state.producers.map((p) => (
            <Tooltip key={p.id}>
              <TooltipTrigger asChild>
                <div
                  className={`
                    rounded-md border-2 px-3 py-1.5 text-xs font-bold transition-all duration-300
                    ${p.state === "active"
                      ? "border-neon-green bg-neon-green/15 text-neon-green glow-green"
                      : p.state === "waiting" || p.state === "blocked"
                      ? "border-neon-yellow bg-neon-yellow/10 text-neon-yellow"
                      : "border-border bg-muted/20 text-muted-foreground"
                    }
                  `}
                >
                  <ArrowDown className="inline h-3 w-3 mr-1" />
                  P{p.id}
                </div>
              </TooltipTrigger>
              <TooltipContent>Producer {p.id} — {p.state}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Arrow: Producers → Semaphore */}
        <div className="flex flex-col items-center gap-0.5">
          <ArrowRight
            className={`h-5 w-5 transition-all duration-300 ${
              anyProducerActive ? "text-neon-green animate-pulse" : "text-muted-foreground"
            }`}
          />
          <span className="text-[9px] text-muted-foreground">produce</span>
        </div>

        {/* Semaphore Empty */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center gap-1 min-w-[56px]">
              <div
                className={`
                  rounded-full border-2 w-10 h-10 flex items-center justify-center text-xs font-mono font-bold transition-all duration-300
                  ${state.semaphoreEmpty > 0
                    ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                    : "border-neon-red bg-neon-red/10 text-neon-red glow-red"
                  }
                `}
              >
                {state.semaphoreEmpty}
              </div>
              <span className="text-[9px] text-muted-foreground leading-tight text-center">empty</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Semaphore "empty" — available slots for producers</TooltipContent>
        </Tooltip>

        {/* Arrow → Mutex */}
        <ArrowRight className="h-4 w-4 text-muted-foreground" />

        {/* Mutex */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`
                  rounded-lg border-2 w-10 h-10 flex items-center justify-center transition-all duration-300
                  ${state.mutexLocked
                    ? "border-neon-red bg-neon-red/15 glow-red"
                    : "border-neon-green bg-neon-green/10"
                  }
                `}
              >
                {state.mutexLocked
                  ? <Lock className="h-4 w-4 text-neon-red" />
                  : <Shield className="h-4 w-4 text-neon-green" />
                }
              </div>
              <span className="text-[9px] text-muted-foreground">mutex</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Mutex — ensures exclusive access to the buffer</TooltipContent>
        </Tooltip>

        {/* Arrow → Buffer */}
        <ArrowRight className="h-4 w-4 text-muted-foreground" />

        {/* Buffer */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-0.5">
                {Array.from({ length: state.bufferSize }, (_, i) => (
                  <div
                    key={i}
                    className={`
                      w-5 h-8 rounded-sm border transition-all duration-300
                      ${i < state.buffer.length
                        ? "border-neon-cyan bg-neon-cyan/20"
                        : "border-border bg-muted/20"
                      }
                    `}
                  />
                ))}
              </div>
              <span className="text-[9px] text-muted-foreground">
                buffer [{state.buffer.length}/{state.bufferSize}]
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Shared buffer — {state.buffer.length} of {state.bufferSize} slots filled</TooltipContent>
        </Tooltip>

        {/* Arrow → Semaphore Full */}
        <ArrowRight className="h-4 w-4 text-muted-foreground" />

        {/* Semaphore Full */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center gap-1 min-w-[56px]">
              <div
                className={`
                  rounded-full border-2 w-10 h-10 flex items-center justify-center text-xs font-mono font-bold transition-all duration-300
                  ${state.semaphoreFull > 0
                    ? "border-neon-purple bg-neon-purple/10 text-neon-purple"
                    : "border-neon-red bg-neon-red/10 text-neon-red glow-red"
                  }
                `}
              >
                {state.semaphoreFull}
              </div>
              <span className="text-[9px] text-muted-foreground leading-tight text-center">full</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Semaphore "full" — items available for consumers</TooltipContent>
        </Tooltip>

        {/* Arrow → Consumers */}
        <div className="flex flex-col items-center gap-0.5">
          <ArrowRight
            className={`h-5 w-5 transition-all duration-300 ${
              anyConsumerActive ? "text-neon-purple animate-pulse" : "text-muted-foreground"
            }`}
          />
          <span className="text-[9px] text-muted-foreground">consume</span>
        </div>

        {/* Consumers column */}
        <div className="flex flex-col items-center gap-1.5 min-w-[70px]">
          {state.consumers.map((c) => (
            <Tooltip key={c.id}>
              <TooltipTrigger asChild>
                <div
                  className={`
                    rounded-md border-2 px-3 py-1.5 text-xs font-bold transition-all duration-300
                    ${c.state === "active"
                      ? "border-neon-purple bg-neon-purple/15 text-neon-purple glow-purple"
                      : c.state === "waiting" || c.state === "blocked"
                      ? "border-neon-yellow bg-neon-yellow/10 text-neon-yellow"
                      : "border-border bg-muted/20 text-muted-foreground"
                    }
                  `}
                >
                  <ArrowUp className="inline h-3 w-3 mr-1" />
                  C{c.id}
                </div>
              </TooltipTrigger>
              <TooltipContent>Consumer {c.id} — {c.state}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Sync disabled warning */}
      {!state.synchronized && (
        <p className="text-[10px] text-neon-red text-center font-medium">
          ⚠️ Synchronization disabled — semaphores &amp; mutex bypassed
        </p>
      )}
    </div>
  );
}
