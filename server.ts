import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- MLOps Logic ---

class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  // Simple LCG
  next() {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
}

interface JobConfig {
  seed: number;
  epochs: number;
  learningRate: number;
  noiseLevel: number;
}

interface JobResult {
  config: JobConfig;
  logs: string[];
  metrics: {
    epoch: number;
    loss: number;
    accuracy: number;
  }[];
  summary: {
    finalLoss: number;
    finalAccuracy: number;
    durationMs: number;
  };
  timestamp: string;
}

function runMLJob(config: JobConfig): JobResult {
  const startTime = Date.now();
  const rng = new SeededRandom(config.seed);
  const logs: string[] = [];
  const metrics: JobResult['metrics'] = [];

  logs.push(`[INFO] Starting reproducible batch job with seed: ${config.seed}`);
  logs.push(`[INFO] Config: epochs=${config.epochs}, lr=${config.learningRate}, noise=${config.noiseLevel}`);

  // Simulate training a simple model (e.g., trying to find a target value)
  let currentLoss = 1.0;
  let currentAccuracy = 0.0;
  const target = rng.next(); // Determined by seed

  for (let i = 1; i <= config.epochs; i++) {
    // Simulated training logic
    const step = (rng.next() - 0.5) * config.learningRate;
    const noise = (rng.next() - 0.5) * config.noiseLevel;
    
    currentLoss = Math.max(0, currentLoss - Math.abs(step) + noise * 0.1);
    currentAccuracy = Math.min(1, currentAccuracy + Math.abs(step) * 0.8 - noise * 0.05);

    metrics.push({
      epoch: i,
      loss: Number(currentLoss.toFixed(4)),
      accuracy: Number(currentAccuracy.toFixed(4))
    });

    if (i % Math.max(1, Math.floor(config.epochs / 5)) === 0 || i === config.epochs) {
      logs.push(`[TRAIN] Epoch ${i}/${config.epochs}: loss=${currentLoss.toFixed(4)}, accuracy=${currentAccuracy.toFixed(4)}`);
    }
  }

  const durationMs = Date.now() - startTime;
  logs.push(`[INFO] Job completed in ${durationMs}ms`);

  return {
    config,
    logs,
    metrics,
    summary: {
      finalLoss: currentLoss,
      finalAccuracy: currentAccuracy,
      durationMs
    },
    timestamp: new Date().toISOString()
  };
}

// --- Express Server ---

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/run', (req, res) => {
    const config: JobConfig = {
      seed: Number(req.body.seed) || 42,
      epochs: Number(req.body.epochs) || 10,
      learningRate: Number(req.body.learningRate) || 0.1,
      noiseLevel: Number(req.body.noiseLevel) || 0.01
    };

    const result = runMLJob(config);
    res.json(result);
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MLOps Dashboard Server running at http://localhost:${PORT}`);
  });
}

startServer();
