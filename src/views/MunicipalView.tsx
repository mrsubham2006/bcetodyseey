import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task, Department } from '../types';
import { KonarkWheelIcon } from '../components/OdishaMotifs';
import {
  Building2,
  CheckCircle2,
  Clock,
  HardHat,
  Filter,
  RefreshCw,
  XCircle,
  AlertCircle,
  UserCheck,
  FileCheck
} from 'lucide-react';

export const MunicipalView: React.FC = () => {
  const { language, showToast } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [supervisorFeedback, setSupervisorFeedback] = useState('');

  const fetchTasksData = async () => {
    setLoading(true);
    try {
      const [tRes, dRes] = await Promise.all([
        fetch('/api/v1/tasks'),
        fetch('/api/v1/departments')
      ]);
      if (tRes.ok) setTasks(await tRes.json());
      if (dRes.ok) setDepartments(await dRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, []);

  const handleSupervisorVerification = async (approved: boolean) => {
    if (!selectedTask) return;
    try {
      const res = await fetch(`/api/v1/tasks/${selectedTask.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved,
          supervisor_feedback: supervisorFeedback || (approved ? "Work verified on site and approved." : "Defect remaining. Corrective re-work required.")
        })
      });
      if (res.ok) {
        showToast(approved ? "Task approved & Incident resolved successfully!" : "Task returned for rework", approved ? "success" : "alert");
        setSelectedTask(null);
        setSupervisorFeedback('');
        fetchTasksData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (selectedDeptId !== 'ALL' && t.department_id !== parseInt(selectedDeptId)) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-heritage-stone dark:border-heritage-charcoal pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <KonarkWheelIcon size={26} className="text-heritage-maroon dark:text-heritage-gold" />
            <h1 className="font-serif font-bold text-2xl text-heritage-maroon dark:text-heritage-gold">
              {language === 'en' ? "Municipal Department Operations" : "ପୌର ବିଭାଗ କାର୍ଯ୍ୟ ପରିଚାଳନା"}
            </h1>
          </div>
          <p className="text-xs text-heritage-aged dark:text-heritage-stone/80 mt-1 font-sans">
            Work order lifecycle orchestration across Drainage, Roads, Sanitation, and Public Infrastructure.
          </p>
        </div>

        <button
          onClick={fetchTasksData}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-heritage-stone bg-white dark:bg-heritage-charcoal text-xs font-semibold hover:border-heritage-gold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Tasks</span>
        </button>
      </div>

      {/* Department Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white/70 dark:bg-heritage-charcoal/70 p-3 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal text-xs">
        <span className="font-semibold text-heritage-charcoal dark:text-heritage-ivory mr-2">Filter Department:</span>
        <button
          onClick={() => setSelectedDeptId('ALL')}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            selectedDeptId === 'ALL'
              ? 'bg-heritage-maroon text-heritage-gold font-bold shadow-sm'
              : 'bg-white dark:bg-heritage-charcoal-dark border border-heritage-stone'
          }`}
        >
          All Departments ({tasks.length})
        </button>
        {departments.map(d => (
          <button
            key={d.id}
            onClick={() => setSelectedDeptId(d.id.toString())}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              selectedDeptId === d.id.toString()
                ? 'bg-heritage-maroon text-heritage-gold font-bold shadow-sm'
                : 'bg-white dark:bg-heritage-charcoal-dark border border-heritage-stone'
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {/* Task Management Pipeline Table */}
      <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-5 shadow-sm">
        <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory mb-3">
          Department Tasks ({filteredTasks.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-heritage-stone text-heritage-aged">
                <th className="py-2.5 px-3 font-semibold">Task ID</th>
                <th className="py-2.5 px-3 font-semibold">Title & Work Instructions</th>
                <th className="py-2.5 px-3 font-semibold">Priority</th>
                <th className="py-2.5 px-3 font-semibold">Current State</th>
                <th className="py-2.5 px-3 font-semibold">Completion Proof</th>
                <th className="py-2.5 px-3 font-semibold text-right">Supervisor Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-heritage-stone/40 dark:divide-heritage-charcoal">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-heritage-aged">
                    No active tasks found for the selected department.
                  </td>
                </tr>
              ) : (
                filteredTasks.map(t => {
                  let statusColor = "bg-heritage-stone text-heritage-charcoal";
                  if (t.status === 'COMPLETED') statusColor = "bg-heritage-green/20 text-heritage-green border-heritage-green/40";
                  else if (t.status === 'PENDING_VERIFICATION') statusColor = "bg-heritage-gold/20 text-heritage-gold border-heritage-gold/40 animate-pulse";
                  else if (t.status === 'IN_PROGRESS' || t.status === 'ACCEPTED') statusColor = "bg-heritage-blue/20 text-heritage-blue border-heritage-blue/40";
                  else if (t.status === 'ASSIGNED') statusColor = "bg-heritage-orange/20 text-heritage-orange border-heritage-orange/40";

                  return (
                    <tr key={t.id} className="hover:bg-heritage-ivory/50 dark:hover:bg-heritage-charcoal-dark">
                      <td className="py-3 px-3 font-mono font-bold text-heritage-maroon dark:text-heritage-gold">
                        TSK-{t.id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-heritage-charcoal dark:text-heritage-ivory">{t.title}</div>
                        <div className="text-[11px] text-heritage-aged">{t.instructions}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-[10px] uppercase text-heritage-maroon dark:text-heritage-gold">
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor}`}>
                          {t.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {t.completion_proof_url ? (
                          <span className="text-[11px] text-heritage-green font-semibold flex items-center space-x-1">
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Photo Uploaded</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-heritage-aged">Pending Worker</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {t.status === 'PENDING_VERIFICATION' ? (
                          <button
                            onClick={() => setSelectedTask(t)}
                            className="px-3 py-1 rounded bg-heritage-green text-white font-bold text-[11px] shadow-sm hover:brightness-110"
                          >
                            Review & Verify
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedTask(t)}
                            className="px-2.5 py-1 rounded border border-heritage-stone text-[11px] font-medium text-heritage-aged hover:text-heritage-charcoal"
                          >
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supervisor Verification Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-heritage-ivory dark:bg-heritage-charcoal-dark border border-heritage-stone rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-heritage-stone">
              <h4 className="font-serif font-bold text-base text-heritage-maroon dark:text-heritage-gold">
                Supervisor Task Inspection (TSK-{selectedTask.id})
              </h4>
              <button onClick={() => setSelectedTask(null)} className="text-heritage-aged hover:text-heritage-charcoal">
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2">
              <p><b>Task:</b> {selectedTask.title}</p>
              <p><b>Field Worker Notes:</b> {selectedTask.worker_notes || "Culvert grate cleared. Water level drained to 0cm."}</p>
              
              {selectedTask.completion_proof_url && (
                <div className="p-2 rounded-xl bg-white dark:bg-heritage-charcoal border border-heritage-stone">
                  <span className="text-[10px] font-bold text-heritage-aged block mb-1">Uploaded Resolution Evidence</span>
                  <img
                    src={selectedTask.completion_proof_url}
                    alt="Proof"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Supervisor Inspection Feedback</label>
                <textarea
                  rows={2}
                  value={supervisorFeedback}
                  onChange={e => setSupervisorFeedback(e.target.value)}
                  placeholder="Enter engineering inspection notes..."
                  className="w-full p-2 rounded-lg border border-heritage-stone bg-white dark:bg-heritage-charcoal text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-heritage-stone">
              <button
                onClick={() => handleSupervisorVerification(false)}
                className="px-3.5 py-1.5 rounded-lg border border-heritage-red text-heritage-red font-semibold text-xs hover:bg-heritage-red/10"
              >
                Reject / Require Rework
              </button>
              <button
                onClick={() => handleSupervisorVerification(true)}
                className="px-4 py-1.5 rounded-lg bg-heritage-green text-white font-bold text-xs shadow-md hover:brightness-110"
              >
                Approve & Resolve Incident
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
