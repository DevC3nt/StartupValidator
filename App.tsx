
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Layout } from './components/Layout';
import { InputForm } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { IdeaInput, ValidationResult } from './types';
import { ApiError, validateIdea } from './services/apiService';

type HistoryItem = {
  id: string;
  createdAt: number;
  input: IdeaInput;
  result: ValidationResult;
};

const HISTORY_KEY = 'reality_check_history_v1';

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function uid(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const loaded = safeJsonParse<HistoryItem[]>(localStorage.getItem(HISTORY_KEY)) || [];
    setHistory(Array.isArray(loaded) ? loaded : []);
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
  }, [history]);

  const latestHistory = useMemo(() => history.slice(0, 6), [history]);

  const handleValidation = async (input: IdeaInput) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);
    try {
      const validationData = await validateIdea(input, controller.signal);
      setResult(validationData);
      setHistory((prev) => [{ id: uid(), createdAt: Date.now(), input, result: validationData }, ...prev].slice(0, 20));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if ((err as any)?.name === 'AbortError') {
        setError('Request cancelled.');
      } else if (err instanceof ApiError) {
        const msg = err.status === 429
          ? 'You are sending too many requests too quickly. Give it a minute and try again.'
          : err.status >= 500
            ? 'Server error. Try again in a moment.'
            : err.message || 'Request failed.';
        setError(msg);
      } else {
        setError('The analysis failed. Try refining your pitch and running it again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    setResult(null);
    setError(null);
  };

  const loadHistory = (item: HistoryItem) => {
    setResult(item.result);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <Layout>
      {error && (
        <div className="mb-8 p-4 bg-rose-900/30 border border-rose-500/50 text-rose-200 rounded-lg flex items-center gap-3">
          <i className="fas fa-circle-exclamation text-xl"></i>
          <p>{error}</p>
        </div>
      )}

      {!result ? (
        <div className="max-w-2xl mx-auto w-full">
          <InputForm onValidate={handleValidation} isLoading={isLoading} />

          {latestHistory.length > 0 && (
            <div className="mt-8 glass rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-200">Recent analyses</h3>
                <button
                  onClick={clearHistory}
                  className="text-xs text-slate-400 hover:text-slate-200 transition"
                  type="button"
                >
                  Clear
                </button>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2">
                {latestHistory.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => loadHistory(h)}
                    className="text-left p-3 rounded-lg bg-slate-900/40 border border-slate-700/40 hover:border-slate-500/60 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-100 truncate">{h.input.title || 'Untitled idea'}</p>
                        <p className="text-xs text-slate-400 truncate">{h.input.targetAudience || 'No audience specified'} • {h.input.revenueModel || 'No revenue model specified'}</p>
                      </div>
                      <div className="shrink-0">
                        <span className="text-xs px-2 py-1 rounded-md bg-rose-500/10 text-rose-200 border border-rose-500/30">
                          Score {Math.round(h.result.brutalHonestyScore)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 opacity-60">
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-magnifying-glass-chart text-rose-400"></i>
              </div>
              <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Cynical Logic</h4>
              <p className="text-xs text-slate-500">Stripping away the 'startup hype' to see unit economics.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-skull text-rose-400"></i>
              </div>
              <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Failure Detection</h4>
              <p className="text-xs text-slate-500">Mapping the fatal flaws before you hire your first dev.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-road text-rose-400"></i>
              </div>
              <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Survival Path</h4>
              <p className="text-xs text-slate-500">If there is a way to survive, we'll find the narrow gap.</p>
            </div>
          </div>
        </div>
      ) : (
        <ResultsDisplay result={result} onReset={reset} />
      )}
    </Layout>
  );
};

export default App;
