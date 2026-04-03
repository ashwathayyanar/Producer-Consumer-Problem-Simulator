import { useSimulation } from "@/hooks/useSimulation";
import { ControlPanel } from "@/components/simulator/ControlPanel";
import { BufferVisualization } from "@/components/simulator/BufferVisualization";
import { FlowDiagram } from "@/components/simulator/FlowDiagram";
import { ActorsSection } from "@/components/simulator/ActorsSection";
import { SyncPanel } from "@/components/simulator/SyncPanel";
import { EventLog } from "@/components/simulator/EventLog";

const Index = () => {
  const {
    state, start, pause, reset, step,
    setSpeed, setBufferSize, setProducerCount, setConsumerCount,
    toggleSync, toggleStepMode,
  } = useSimulation();

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-bold neon-text-cyan">
          Producer-Consumer Problem Simulator
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visualizing process synchronization with semaphores &amp; mutex locks
        </p>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_260px] gap-4">
        {/* Left: Controls */}
        <aside>
          <ControlPanel
            state={state}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onStep={step}
            onSetSpeed={setSpeed}
            onSetBufferSize={setBufferSize}
            onSetProducerCount={setProducerCount}
            onSetConsumerCount={setConsumerCount}
            onToggleSync={toggleSync}
            onToggleStepMode={toggleStepMode}
          />
        </aside>

        {/* Center: Visualization */}
        <main className="space-y-4">
          <BufferVisualization state={state} />
          <FlowDiagram state={state} />
          <ActorsSection producers={state.producers} consumers={state.consumers} />
          <EventLog log={state.log} />
        </main>

        {/* Right: Sync Panel */}
        <aside>
          <SyncPanel state={state} />
        </aside>
      </div>
    </div>
  );
};

export default Index;
