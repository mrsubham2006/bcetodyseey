import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Department } from '../types';
import { KonarkWheelIcon } from '../components/OdishaMotifs';
import {
  ShieldAlert,
  Users,
  Building,
  Activity,
  RotateCcw,
  RefreshCw,
  Search,
  CheckCircle2,
  Lock,
  Cpu,
  Database,
  Radio
} from 'lucide-react';

export const SuperAdminView: React.FC = () => {
  const { language, showToast } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchAudit, setSearchAudit] = useState('');
  const [resetting, setResetting] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, dRes, aRes] = await Promise.all([
        fetch('/api/v1/users'),
        fetch('/api/v1/departments'),
        fetch('/api/v1/audit-logs')
      ]);
      if (uRes.ok) setUsers(await uRes.json());
      if (dRes.ok) setDepartments(await dRes.json());
      if (aRes.ok) setAuditLogs(await aRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResetEntireDemo = async () => {
    if (!window.confirm("Are you sure you want to reset the demonstration database back to initial seed data?")) return;
    setResetting(true);
    try {
      const res = await fetch('/api/v1/demo/reset', { method: 'POST' });
      if (res.ok) {
        showToast("Demonstration database reset to pristine seed state", "success");
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const filteredLogs = auditLogs.filter(l => {
    if (!l) return false;
    const searchLower = (searchAudit || '').toLowerCase();
    const actionMatch = l.action ? String(l.action).toLowerCase().includes(searchLower) : false;
    const userMatch = (l as any).user ? String((l as any).user).toLowerCase().includes(searchLower) : false;
    const detailsMatch = l.details ? String(l.details).toLowerCase().includes(searchLower) : false;
    return actionMatch || userMatch || detailsMatch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-heritage-stone dark:border-heritage-charcoal pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-7 h-7 text-heritage-maroon dark:text-heritage-gold" />
            <h1 className="font-serif font-bold text-2xl text-heritage-maroon dark:text-heritage-gold">
              {language === 'en' ? "Super Administrator Governance & Audits" : "ସର୍ବୋଚ୍ଚ ପ୍ରଶାସନ ଓ ସୁରକ୍ଷା ଅଡିଟ"}
            </h1>
          </div>
          <p className="text-xs text-heritage-aged dark:text-heritage-stone/80 mt-1 font-sans">
            User RBAC permissions, departmental SLA policies, immutable tamper-evident logs, and system health.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetEntireDemo}
            disabled={resetting}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg border border-heritage-red bg-white dark:bg-heritage-charcoal text-heritage-red font-semibold text-xs hover:bg-heritage-red/10 transition-all"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Database to Pristine</span>
          </button>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="p-2 rounded-lg border border-heritage-stone bg-white dark:bg-heritage-charcoal text-xs hover:border-heritage-gold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* System Engine Health Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
          <span className="text-[10px] font-bold text-heritage-aged uppercase flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-heritage-gold" />
            <span>AI Provider</span>
          </span>
          <p className="text-sm font-bold text-heritage-green mt-1">Gemini 2.0 Flash</p>
          <span className="text-[10px] text-heritage-aged">NLP Extraction Active</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
          <span className="text-[10px] font-bold text-heritage-aged uppercase flex items-center space-x-1">
            <Database className="w-3.5 h-3.5 text-heritage-blue" />
            <span>Operational DB</span>
          </span>
          <p className="text-sm font-bold text-heritage-green mt-1">SQLite / SQLAlchemy</p>
          <span className="text-[10px] text-heritage-aged">WAL Mode & PostGIS Ready</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
          <span className="text-[10px] font-bold text-heritage-aged uppercase flex items-center space-x-1">
            <Radio className="w-3.5 h-3.5 text-heritage-orange" />
            <span>Real-Time Sync</span>
          </span>
          <p className="text-sm font-bold text-heritage-green mt-1">WebSockets Active</p>
          <span className="text-[10px] text-heritage-aged">Multi-Client Broadcast</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
          <span className="text-[10px] font-bold text-heritage-aged uppercase flex items-center space-x-1">
            <Lock className="w-3.5 h-3.5 text-heritage-maroon" />
            <span>Authentication</span>
          </span>
          <p className="text-sm font-bold text-heritage-green mt-1">JWT + Native Bcrypt</p>
          <span className="text-[10px] text-heritage-aged">11 RBAC Stakeholder Roles</span>
        </div>
      </div>

      {/* Two-Column Layout: Users & Roles + Immutable Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Authorized Stakeholder Accounts (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-4 shadow-sm space-y-3">
          <h4 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory pb-2 border-b border-heritage-stone">
            Authorized Platform Stakeholders ({users.length})
          </h4>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {users.map(u => (
              <div
                key={u.id}
                className="p-3 rounded-xl bg-heritage-ivory/50 dark:bg-heritage-charcoal-dark border border-heritage-stone/60 text-xs flex items-center justify-between"
              >
                <div>
                  <h5 className="font-bold text-heritage-charcoal dark:text-heritage-ivory">{u.full_name}</h5>
                  <p className="text-[11px] text-heritage-aged font-mono">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-heritage-maroon/20 text-heritage-maroon dark:text-heritage-gold border border-heritage-maroon/30">
                    {u.role}
                  </span>
                  <span className="text-[10px] text-heritage-green block mt-1">✔ ACTIVE</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Immutable Audit History (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-heritage-stone">
            <h4 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">
              Security & Action Audit Trail ({filteredLogs.length})
            </h4>
            <div className="relative w-44">
              <input
                type="text"
                placeholder="Filter logs..."
                value={searchAudit}
                onChange={e => setSearchAudit(e.target.value)}
                className="w-full pl-6 pr-2 py-1 rounded-md border border-heritage-stone text-[11px] bg-heritage-ivory/60 dark:bg-heritage-charcoal-dark"
              />
              <Search className="w-3 h-3 text-heritage-aged absolute left-2 top-2" />
            </div>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-heritage-ivory/50 dark:bg-heritage-charcoal-dark border border-heritage-stone/60 text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono font-bold text-heritage-maroon dark:text-heritage-gold">
                    {log.action}
                  </span>
                  <span className="text-heritage-aged">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-[11px] text-heritage-aged font-mono truncate">
                  User: {log.user} | Entity: {log.entity_type} #{log.entity_id}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
