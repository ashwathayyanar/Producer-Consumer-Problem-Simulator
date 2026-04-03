import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SimState } from "@/hooks/useSimulation";

interface ControlPanelProps {
  state: SimState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
  onSetSpeed: (v: number) => void;
  onSetBufferSize: (v: number) => void;
  onSetProducerCount: (v: number) => void;
  onSetConsumerCount: (v: number) => void;
  onToggleSync: () => void;
  onToggleStepMode: () => void;
}

export function ControlPanel({
  state, onStart, onPause, onReset, onStep,
  onSetSpeed, onSetBufferSize, onSetProducerCount, onSetConsumerCount,
  onToggleSync, onToggleStepMode,
}: ControlPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Controls</h2>

      {/* Playback */}
      <div className="flex gap-2">
        {!state.running || state.paused ? (
          <Button onClick={state.running ? onPause : onStart} className="flex-1 bg-neon-cyan text-primary-foreground hover:bg-neon-cyan/80 glow-cyan">
            <Play className="mr-1 h-4 w-4" /> {state.paused ? "Resume" : "Start"}
          </Button>
        ) : (
          <Button onClick={onPause} variant="secondary" className="flex-1">
            <Pause className="mr-1 h-4 w-4" /> Pause
          </Button>
        )}
        <Button onClick={onReset} variant="outline" size="icon"><RotateCcw className="h-4 w-4" /></Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onStep} variant="outline" size="icon" disabled={state.running && !state.paused && !state.stepMode}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Step forward one tick</TooltipContent>
        </Tooltip>
      </div>

      {/* Speed */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Speed: {state.speed}%</label>
        <Slider value={[state.speed]} min={1} max={100} step={1} onValueChange={([v]) => onSetSpeed(v)} />
      </div>

      {/* Buffer Size */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Buffer Size: {state.bufferSize}</label>
        <Slider value={[state.bufferSize]} min={1} max={10} step={1} onValueChange={([v]) => onSetBufferSize(v)} disabled={state.running} />
      </div>

      {/* Producers */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Producers: {state.producers.length}</label>
        <Slider value={[state.producers.length]} min={1} max={5} step={1} onValueChange={([v]) => onSetProducerCount(v)} disabled={state.running} />
      </div>

      {/* Consumers */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Consumers: {state.consumers.length}</label>
        <Slider value={[state.consumers.length]} min={1} max={5} step={1} onValueChange={([v]) => onSetConsumerCount(v)} disabled={state.running} />
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-2 border-t border-border">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Synchronized</span>
              <Switch checked={state.synchronized} onCheckedChange={onToggleSync} />
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">Toggle synchronization (semaphores + mutex). Disable to see race conditions.</TooltipContent>
        </Tooltip>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Step Mode</span>
          <Switch checked={state.stepMode} onCheckedChange={onToggleStepMode} />
        </div>
      </div>
    </div>
  );
}
