

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Terminal as TerminalIcon, 
  Activity, 
  Settings, 
  FileJson, 
  Boxes,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export default function App() {
  const [config, setConfig] = useState<JobConfig>({
    seed: 42,
    epochs: 20,
    learningRate: 0.05,
    noiseLevel: 0.02
  });
  const [results, setResults] = useState<JobResult | null>(null);
  const [history, setHistory] = useState<JobResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'logs' | 'docker'>('metrics');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [results?.logs]);

  const runJob = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data: JobResult = await response.json();
      setResults(data);
      setHistory(prev => [data, ...prev].slice(0, 5));
    } catch (error) {
      console.error('Job execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const resetConfig = () => {
    setConfig({
      seed: 42,
      epochs: 20,
      learningRate: 0.05,
      noiseLevel: 0.02
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans p-6 space-x-6">
      {/* Navigation Sidebar */}
      <aside className="w-64 flex flex-col justify-between py-4 shrink-0">
        <div>
          <div className="flex items-center space-x-3 px-4 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">M</div>
            <h1 className="text-slate-900 font-bold text-xl tracking-tight leading-none">MLOps Pro</h1>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'metrics', icon: Activity, label: 'Analytics' },
              { id: 'logs', icon: TerminalIcon, label: 'Job Logs' },
              { id: 'docker', icon: FileJson, label: 'Deployment' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl flex items-center space-x-3 transition-all font-medium",
                  activeTab === tab.id 
                    ? "bg-white shadow-sm border border-slate-200 text-indigo-600" 
                    : "text-slate-500 hover:bg-slate-100"
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 text-white">
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2">System Health</p>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold">Local Cluster</p>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: isRunning ? '90%' : '10%' }}
              className="bg-indigo-500 h-full"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 italic">Status: {isRunning ? 'Processing...' : 'Standby'}</p>
        </div>
      </aside>

      {/* Main Bento Grid */}
      <main className="flex-1 grid grid-cols-6 grid-rows-6 gap-5">
        
        {/* Welcome Header */}
        <div className="col-span-4 row-span-1 bento-card-primary flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Batch Job Control</h2>
            <p className="text-indigo-100 text-sm opacity-90 font-medium">Reproducible ML assessment environment v0.1.0</p>
          </div>
          <button className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg text-sm">
            Quick Analysis
          </button>
        </div>

        {/* Quick Execution Task */}
        <div 
          onClick={runJob}
          className={cn(
            "col-span-2 row-span-1 bento-card p-6 flex flex-col items-center justify-center text-center cursor-pointer group transition-all",
            isRunning ? "bg-slate-50 opacity-60 pointer-events-none" : "hover:bg-indigo-50 hover:border-indigo-200"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center shadow-md mb-3 transition-colors",
            isRunning ? "bg-slate-200 text-slate-400" : "bg-white text-indigo-600 group-hover:scale-110"
          )}>
            <Play className="w-6 h-6 fill-current" />
          </div>
          <p className="text-slate-900 font-bold text-base">Run Batch Job</p>
          <p className="text-slate-500 text-[10px] mt-1 font-medium">Execute with current parameters</p>
        </div>

        {/* Configuration Block */}
        <div className="col-span-2 row-span-3 bento-card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Parameters</h3>
            <button onClick={resetConfig} className="text-slate-400 hover:text-indigo-600 transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-5 flex-1">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seeding Engine</label>
              <div className="relative">
                <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="number"
                  value={config.seed}
                  onChange={e => setConfig(prev => ({ ...prev, seed: parseInt(e.target.value) }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Epoch Cycle</label>
                <span className="text-indigo-600 font-black text-sm">{config.epochs}</span>
              </div>
              <input 
                type="range"
                min="5" max="100"
                value={config.epochs}
                onChange={e => setConfig(prev => ({ ...prev, epochs: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Momentum/LR</label>
              <input 
                type="number"
                step="0.01"
                value={config.learningRate}
                onChange={e => setConfig(prev => ({ ...prev, learningRate: parseFloat(e.target.value) }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50">
            <div className="flex items-center space-x-3">
              <div className="flex -space-x-2">
                {[1,2].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-400">AI</div>
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 italic">Active system agents</span>
            </div>
          </div>
        </div>

        {/* Dynamic Content Viewport */}
        <div className="col-span-4 row-span-5 bento-card flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'metrics' && (
              <motion.div 
                key="metrics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 p-8 flex flex-col"
              >
                {!results ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-500 mb-6">
                      <Activity className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Telemetry Standby</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">Results will populate here once a batch process is initiated.</p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="grid grid-cols-3 gap-5 mb-8">
                      {[
                        { label: 'MSE Loss', value: results.summary.finalLoss.toFixed(4), color: 'text-rose-600' },
                        { label: 'Accuracy', value: `${(results.summary.finalAccuracy * 100).toFixed(1)}%`, color: 'text-indigo-600' },
                        { label: 'Latency', value: `${results.summary.durationMs}ms`, color: 'text-slate-900' }
                      ].map((stat, i) => (
                        <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <p className="text-slate-500 text-xs font-bold uppercase mb-1">{stat.label}</p>
                          <p className={cn("text-2xl font-black tabular-nums", stat.color)}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex-1 min-h-[350px] bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={results.metrics}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="epoch" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                          <Legend />
                          <Line type="monotone" dataKey="loss" stroke="#e11d48" strokeWidth={3} dot={false} animationDuration={1000} />
                          <Line type="monotone" dataKey="accuracy" stroke="#4f46e5" strokeWidth={3} dot={false} animationDuration={1000} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'logs' && (
              <motion.div 
                key="logs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col p-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Live Execution Trace</h3>
                  <span className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Streaming
                  </span>
                </div>
                <div className="flex-1 bg-slate-900 rounded-3xl p-6 overflow-hidden flex flex-col shadow-2xl">
                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto space-y-2 font-mono scrollbar-hide text-xs"
                  >
                    {!results ? (
                      <div className="text-slate-600 font-bold italic">$ awaiting_input_...</div>
                    ) : (
                      results.logs.map((log, i) => (
                        <div key={i} className="flex space-x-4 opacity-0 animate-in fade-in slide-in-from-left-2 duration-300 fill-mode-forwards" style={{ animationDelay: `${i * 30}ms` }}>
                          <span className="text-slate-700 font-black shrink-0 w-8">{i.toString().padStart(2, '0')}</span>
                          <span className={cn(
                            "leading-relaxed",
                            log.includes('[TRAIN]') ? "text-indigo-400" : "text-slate-400"
                          )}>{log}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'docker' && (
              <motion.div 
                key="docker"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 p-8"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <span>Deployment Pipeline</span>
                </h3>
                
                <div className="grid grid-cols-1 gap-8">
                  <div className="bento-card-dark p-6 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black uppercase text-indigo-400">Production Dockerfile</span>
                      <div className="flex space-x-1">
                        {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-slate-700"></div>)}
                      </div>
                    </div>
                    <pre className="text-[11px] font-mono leading-relaxed text-slate-400">
{`FROM node:18-alpine-v0
LABEL org.opencontainers.image.source https://github.com/mlops/demo

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Deterministic build sequence
RUN npm run build
CMD ["node", "dist/server.js"]`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-slate-900 mb-4 uppercase tracking-widest">Compliance Checks</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Seed Determinism', desc: 'Validating RNG isolation' },
                        { label: 'JSON Telemetry', desc: 'Machine readable reports' },
                        { label: 'Env Immutability', desc: 'Stateless execution' },
                        { label: 'Audit Logging', desc: 'Full trace retention' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-start bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                          <div className="ml-3">
                            <p className="text-xs font-bold text-slate-900">{item.label}</p>
                            <p className="text-[10px] text-slate-500">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Execution History Panel */}
        <div className="col-span-2 row-span-2 bento-card-dark p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Archive Trace</h3>
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="text-slate-600 text-[10px] italic">Trace index empty...</div>
              ) : (
                history.map((h, i) => (
                  <div 
                    key={i} 
                    onClick={() => setResults(h)}
                    className="bg-slate-800 p-4 rounded-2xl flex items-center space-x-3 border border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors"
                  >
                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 flex items-center justify-center rounded-xl font-mono text-xs font-black">
                      #0{history.length - i}
                    </div>
                    <div className="truncate flex-1">
                      <p className="text-white text-xs font-bold truncate">RUN_SEED_{h.config.seed}</p>
                      <p className="text-slate-500 text-[10px]">ACCURACY: {(h.summary.finalAccuracy * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mt-8 flex justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
            <span>Log Version 2.4.1</span>
            <AlertCircle className="w-3 h-3" />
          </div>
        </div>

      </main>
    </div>
  );
}
