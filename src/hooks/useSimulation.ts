import { useReducer, useCallback, useRef, useEffect } from "react";

export type ActorState = "idle" | "active" | "waiting" | "blocked";

export interface Actor {
  id: number;
  type: "producer" | "consumer";
  state: ActorState;
  itemsProcessed: number;
}

export interface BufferItem {
  id: number;
  producerId: number;
  timestamp: number;
}

export interface LogEntry {
  id: number;
  timestamp: number;
  message: string;
  type: "produce" | "consume" | "wait" | "lock" | "unlock" | "info";
}

export interface SimState {
  running: boolean;
  paused: boolean;
  stepMode: boolean;
  synchronized: boolean;
  speed: number;
  bufferSize: number;
  buffer: BufferItem[];
  producers: Actor[];
  consumers: Actor[];
  semaphoreEmpty: number;
  semaphoreFull: number;
  mutexLocked: boolean;
  log: LogEntry[];
  nextItemId: number;
  nextLogId: number;
  tick: number;
}

type Action =
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESET" }
  | { type: "STEP" }
  | { type: "TICK" }
  | { type: "SET_SPEED"; speed: number }
  | { type: "SET_BUFFER_SIZE"; size: number }
  | { type: "SET_PRODUCERS"; count: number }
  | { type: "SET_CONSUMERS"; count: number }
  | { type: "TOGGLE_SYNC" }
  | { type: "TOGGLE_STEP_MODE" };

function createActors(count: number, type: "producer" | "consumer"): Actor[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    type,
    state: "idle" as ActorState,
    itemsProcessed: 0,
  }));
}

const initialState: SimState = {
  running: false,
  paused: false,
  stepMode: false,
  synchronized: true,
  speed: 50,
  bufferSize: 5,
  buffer: [],
  producers: createActors(2, "producer"),
  consumers: createActors(2, "consumer"),
  semaphoreEmpty: 5,
  semaphoreFull: 0,
  mutexLocked: false,
  log: [],
  nextItemId: 1,
  nextLogId: 1,
  tick: 0,
};

function addLog(state: SimState, message: string, type: LogEntry["type"]): { log: LogEntry[]; nextLogId: number } {
  const entry: LogEntry = { id: state.nextLogId, timestamp: Date.now(), message, type };
  return {
    log: [...state.log.slice(-99), entry],
    nextLogId: state.nextLogId + 1,
  };
}

function simulateTick(state: SimState): SimState {
  let s = { ...state, tick: state.tick + 1 };
  s.producers = s.producers.map((p) => ({ ...p }));
  s.consumers = s.consumers.map((c) => ({ ...c }));
  s.buffer = [...s.buffer];

  // Pick a random producer to try
  const pIdx = Math.floor(Math.random() * s.producers.length);
  const producer = s.producers[pIdx];

  if (s.synchronized) {
    // Synchronized mode
    if (s.semaphoreEmpty > 0 && !s.mutexLocked) {
      // Producer can produce
      s.mutexLocked = true;
      const lockLog = addLog(s, `Mutex locked by Producer ${producer.id}`, "lock");
      s.log = lockLog.log;
      s.nextLogId = lockLog.nextLogId;

      s.semaphoreEmpty--;
      const item: BufferItem = { id: s.nextItemId++, producerId: producer.id, timestamp: Date.now() };
      s.buffer.push(item);
      s.semaphoreFull++;

      producer.state = "active";
      producer.itemsProcessed++;

      const prodLog = addLog(s, `Producer ${producer.id} added item #${item.id} to buffer [${s.buffer.length}/${s.bufferSize}]`, "produce");
      s.log = prodLog.log;
      s.nextLogId = prodLog.nextLogId;

      s.mutexLocked = false;
      const unlockLog = addLog(s, `Mutex unlocked by Producer ${producer.id}`, "unlock");
      s.log = unlockLog.log;
      s.nextLogId = unlockLog.nextLogId;
    } else if (s.semaphoreEmpty <= 0) {
      producer.state = "blocked";
      const waitLog = addLog(s, `Producer ${producer.id} blocked — buffer full`, "wait");
      s.log = waitLog.log;
      s.nextLogId = waitLog.nextLogId;
    } else {
      producer.state = "waiting";
      const waitLog = addLog(s, `Producer ${producer.id} waiting for mutex`, "wait");
      s.log = waitLog.log;
      s.nextLogId = waitLog.nextLogId;
    }
  } else {
    // Unsynchronized - no checks, can overflow
    const item: BufferItem = { id: s.nextItemId++, producerId: producer.id, timestamp: Date.now() };
    s.buffer.push(item);
    producer.state = "active";
    producer.itemsProcessed++;
    if (s.buffer.length > s.bufferSize) {
      const log = addLog(s, `⚠️ RACE CONDITION! Producer ${producer.id} caused buffer overflow [${s.buffer.length}/${s.bufferSize}]`, "wait");
      s.log = log.log;
      s.nextLogId = log.nextLogId;
    } else {
      const log = addLog(s, `Producer ${producer.id} added item #${item.id} (no sync) [${s.buffer.length}/${s.bufferSize}]`, "produce");
      s.log = log.log;
      s.nextLogId = log.nextLogId;
    }
    s.semaphoreEmpty = Math.max(0, s.bufferSize - s.buffer.length);
    s.semaphoreFull = s.buffer.length;
  }

  // Reset other producers to idle
  s.producers.forEach((p, i) => {
    if (i !== pIdx && p.state === "active") p.state = "idle";
  });

  // Pick a random consumer to try
  const cIdx = Math.floor(Math.random() * s.consumers.length);
  const consumer = s.consumers[cIdx];

  if (s.synchronized) {
    if (s.semaphoreFull > 0 && !s.mutexLocked) {
      s.mutexLocked = true;
      const lockLog = addLog(s, `Mutex locked by Consumer ${consumer.id}`, "lock");
      s.log = lockLog.log;
      s.nextLogId = lockLog.nextLogId;

      s.semaphoreFull--;
      const item = s.buffer.shift();
      s.semaphoreEmpty++;

      consumer.state = "active";
      consumer.itemsProcessed++;

      const consLog = addLog(s, `Consumer ${consumer.id} consumed item #${item?.id} from buffer [${s.buffer.length}/${s.bufferSize}]`, "consume");
      s.log = consLog.log;
      s.nextLogId = consLog.nextLogId;

      s.mutexLocked = false;
      const unlockLog = addLog(s, `Mutex unlocked by Consumer ${consumer.id}`, "unlock");
      s.log = unlockLog.log;
      s.nextLogId = unlockLog.nextLogId;
    } else if (s.semaphoreFull <= 0) {
      consumer.state = "blocked";
      const waitLog = addLog(s, `Consumer ${consumer.id} blocked — buffer empty`, "wait");
      s.log = waitLog.log;
      s.nextLogId = waitLog.nextLogId;
    } else {
      consumer.state = "waiting";
      const waitLog = addLog(s, `Consumer ${consumer.id} waiting for mutex`, "wait");
      s.log = waitLog.log;
      s.nextLogId = waitLog.nextLogId;
    }
  } else {
    if (s.buffer.length > 0) {
      const item = s.buffer.shift();
      consumer.state = "active";
      consumer.itemsProcessed++;
      const log = addLog(s, `Consumer ${consumer.id} consumed item #${item?.id} (no sync) [${s.buffer.length}/${s.bufferSize}]`, "consume");
      s.log = log.log;
      s.nextLogId = log.nextLogId;
    } else {
      consumer.state = "blocked";
      const log = addLog(s, `⚠️ RACE CONDITION! Consumer ${consumer.id} tried to consume from empty buffer`, "wait");
      s.log = log.log;
      s.nextLogId = log.nextLogId;
    }
    s.semaphoreEmpty = Math.max(0, s.bufferSize - s.buffer.length);
    s.semaphoreFull = Math.max(0, s.buffer.length);
  }

  // Reset other consumers to idle
  s.consumers.forEach((c, i) => {
    if (i !== cIdx && c.state === "active") c.state = "idle";
  });

  return s;
}

function reducer(state: SimState, action: Action): SimState {
  switch (action.type) {
    case "START": {
      const log = addLog(state, "Simulation started", "info");
      return { ...state, running: true, paused: false, log: log.log, nextLogId: log.nextLogId };
    }
    case "PAUSE":
      return { ...state, paused: !state.paused };
    case "RESET":
      return {
        ...initialState,
        bufferSize: state.bufferSize,
        producers: createActors(state.producers.length, "producer"),
        consumers: createActors(state.consumers.length, "consumer"),
        semaphoreEmpty: state.bufferSize,
        speed: state.speed,
        synchronized: state.synchronized,
        stepMode: state.stepMode,
      };
    case "TICK":
      if (!state.running || state.paused) return state;
      return simulateTick(state);
    case "STEP":
      return simulateTick({ ...state, running: true });
    case "SET_SPEED":
      return { ...state, speed: action.speed };
    case "SET_BUFFER_SIZE": {
      const size = Math.max(1, Math.min(10, action.size));
      return { ...state, bufferSize: size, semaphoreEmpty: size - state.buffer.length };
    }
    case "SET_PRODUCERS":
      return { ...state, producers: createActors(Math.max(1, Math.min(5, action.count)), "producer") };
    case "SET_CONSUMERS":
      return { ...state, consumers: createActors(Math.max(1, Math.min(5, action.count)), "consumer") };
    case "TOGGLE_SYNC": {
      const log = addLog(state, state.synchronized ? "Synchronization DISABLED — race conditions possible!" : "Synchronization ENABLED", "info");
      return { ...state, synchronized: !state.synchronized, log: log.log, nextLogId: log.nextLogId };
    }
    case "TOGGLE_STEP_MODE":
      return { ...state, stepMode: !state.stepMode };
    default:
      return state;
  }
}

export function useSimulation() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.running && !state.paused && !state.stepMode) {
      const ms = Math.max(100, 2000 - state.speed * 19);
      intervalRef.current = setInterval(() => dispatch({ type: "TICK" }), ms);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.running, state.paused, state.stepMode, state.speed]);

  const start = useCallback(() => dispatch({ type: "START" }), []);
  const pause = useCallback(() => dispatch({ type: "PAUSE" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);
  const step = useCallback(() => dispatch({ type: "STEP" }), []);
  const setSpeed = useCallback((speed: number) => dispatch({ type: "SET_SPEED", speed }), []);
  const setBufferSize = useCallback((size: number) => dispatch({ type: "SET_BUFFER_SIZE", size }), []);
  const setProducerCount = useCallback((count: number) => dispatch({ type: "SET_PRODUCERS", count }), []);
  const setConsumerCount = useCallback((count: number) => dispatch({ type: "SET_CONSUMERS", count }), []);
  const toggleSync = useCallback(() => dispatch({ type: "TOGGLE_SYNC" }), []);
  const toggleStepMode = useCallback(() => dispatch({ type: "TOGGLE_STEP_MODE" }), []);

  return {
    state,
    start,
    pause,
    reset,
    step,
    setSpeed,
    setBufferSize,
    setProducerCount,
    setConsumerCount,
    toggleSync,
    toggleStepMode,
  };
}
