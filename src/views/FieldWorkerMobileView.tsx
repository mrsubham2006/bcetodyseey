import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { KonarkWheelIcon } from '../components/OdishaMotifs';
import {
  HardHat,
  MapPin,
  Camera,
  CheckCircle2,
  Play,
  FileCheck,
  Send,
  RefreshCw,
  Navigation,
  Clock
} from 'lucide-react';

export const FieldWorkerMobileView: React.FC = () => {
  const { language, showToast } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Completion Form
  const [notes, setNotes] = useState('');
  const [proofUrl, setProofUrl] = useState('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800');
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkerTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
        if (data.length > 0 && !selectedTask) {
          setSelectedTask(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerTasks();
  }, []);

  const handleUpdateStatus = async (taskId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Task status updated to ${newStatus}`, "success");
        fetchWorkerTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/tasks/${selectedTask.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PENDING_VERIFICATION',
          worker_notes: notes || "Work executed according to technical specifications. Site cleared.",
          completion_proof_url: proofUrl
        })
      });
      if (res.ok) {
        showToast("Work proof submitted! Awaiting supervisor inspection.", "success");
        fetchWorkerTasks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      
      {/* Mobile Terminal Header */}
      <div className="p-4 rounded-2xl bg-heritage-maroon text-white flex items-center justify-between shadow-heritage">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-heritage-maroon-dark text-heritage-gold">
            <HardHat className="w-6 h-6 text-heritage-gold" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-heritage-gold uppercase tracking-wider">
              FIELD WORKER MOBILE TERMINAL
            </span>
            <h2 className="font-serif font-bold text-lg text-white">
              Bikash Mohapatra (Drainage Crew #4)
            </h2>
          </div>
        </div>

        <button
          onClick={fetchWorkerTasks}
          className="p-2 rounded-lg bg-heritage-maroon-dark text-heritage-gold hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Task Queue List */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory flex items-center justify-between">
          <span>Assigned Tasks ({tasks.length})</span>
          <span className="text-xs text-heritage-aged font-normal">Updated live</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map(t => {
            const isSelected = selectedTask?.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTask(t)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-3 ${
                  isSelected
                    ? 'border-heritage-gold bg-white dark:bg-heritage-charcoal shadow-heritage ring-2 ring-heritage-gold'
                    : 'border-heritage-stone dark:border-heritage-charcoal bg-white/70 dark:bg-heritage-charcoal-dark hover:border-heritage-gold'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-heritage-maroon dark:text-heritage-gold">
                    TSK-{t.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-heritage-gold/20 text-heritage-charcoal dark:text-heritage-gold">
                    {t.priority}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">
                    {t.title}
                  </h4>
                  <p className="text-xs text-heritage-aged dark:text-heritage-stone/80 mt-1 line-clamp-2">
                    {t.instructions}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-heritage-stone/50">
                  <span className="font-semibold text-heritage-maroon dark:text-heritage-gold">
                    State: {t.status}
                  </span>
                  <div className="flex items-center space-x-2">
                    {t.status === 'ASSIGNED' && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleUpdateStatus(t.id, 'ACCEPTED');
                        }}
                        className="px-3 py-1 rounded-md bg-heritage-blue text-white text-xs font-bold"
                      >
                        Accept Task
                      </button>
                    )}
                    {t.status === 'ACCEPTED' && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleUpdateStatus(t.id, 'IN_PROGRESS');
                        }}
                        className="px-3 py-1 rounded-md bg-heritage-orange text-white text-xs font-bold flex items-center space-x-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Start Work</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Task Details & Completion Upload Card */}
      {selectedTask && (
        <div className="p-5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-gold shadow-heritage space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-heritage-stone">
            <div>
              <span className="text-[10px] font-mono font-bold text-heritage-gold">ACTIVE WORK ORDER</span>
              <h3 className="font-serif font-bold text-base text-heritage-maroon dark:text-heritage-ivory">
                {selectedTask.title}
              </h3>
            </div>
            <a
              href="https://maps.google.com/?q=20.2961,85.8645"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-heritage-blue text-white text-xs font-semibold flex items-center space-x-1 shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>GPS Navigate</span>
            </a>
          </div>

          <form onSubmit={handleSubmitProof} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block font-semibold mb-1 text-heritage-charcoal dark:text-heritage-ivory">
                Field Completion Notes *
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Explain what steps were taken (e.g. submersible pump operated, culvert cleared)..."
                className="w-full p-2.5 rounded-lg border border-heritage-stone bg-heritage-ivory/50 dark:bg-heritage-charcoal-dark text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-heritage-charcoal dark:text-heritage-ivory">
                Before / After Photographic Proof Link *
              </label>
              <input
                type="url"
                value={proofUrl}
                onChange={e => setProofUrl(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-heritage-stone bg-heritage-ivory/50 dark:bg-heritage-charcoal-dark text-xs"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-heritage-green hover:brightness-110 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit for Supervisor Verification</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
