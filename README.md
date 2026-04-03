Producer-Consumer Problem Simulator
Overview

The Producer-Consumer Problem Simulator is an interactive web application that visualizes process synchronization using semaphores and mutex locks. It demonstrates how multiple producers and consumers safely interact with a shared buffer while avoiding race conditions, buffer overflow, and underflow.

Objective

This project helps users understand core concepts of operating systems and concurrent programming through real-time visualization and simulation.

Features
Real-time simulation of producer and consumer processes
Visualization of shared buffer (queue)
Adjustable buffer size, number of producers, and consumers
Semaphore-based synchronization (empty & full counters)
Mutex lock for critical section protection
Animated actions (produce, consume, waiting, blocked)
Event log displaying step-by-step operations
Step-by-step execution mode for learning
Responsive and user-friendly interface
UI Components
Control Panel: Start, Pause, Reset, Speed Control
Buffer Visualization: Graphical representation of queue slots
Actors Section: Producers and Consumers with state indicators
Synchronization Panel: Semaphore values and mutex status
Event Log: Real-time activity tracking
Tech Stack
Frontend: React, Tailwind CSS
Animations: Framer Motion / CSS Transitions
State Management: React Hooks / Zustand
Optional Backend: Node.js
