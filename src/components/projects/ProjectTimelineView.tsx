import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { Calendar, Plus, Clock, CheckCircle2, AlertTriangle, ChevronRight, Flag } from 'lucide-react';

interface ProjectTimelineViewProps {
  projectId: string;
}

export const ProjectTimelineView: React.FC<ProjectTimelineViewProps> = ({ projectId }) => {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    targetDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    status: 'UPCOMING',
    delayDays: 0,
    description: '',
  });

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/projects/${projectId}/milestones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setMilestones(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchMilestones();
  }, [projectId]);

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/projects/milestones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, projectId }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowModal(false);
        fetchMilestones();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" /> Project Execution Schedule & Milestone Timeline
          </h3>
          <p className="text-xs text-slate-500">
            Target phase dates, delay days tracking, critical path milestones & completion records
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Milestone</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading timeline...</div>
      ) : milestones.length === 0 ? (
        <div className="p-8 text-center border border-dashed rounded-2xl text-xs text-slate-400">
          No milestones defined for this project yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {milestones.map((m) => (
            <div key={m.id} className="relative group">
              <div
                className={`absolute -left-[23px] top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white dark:bg-slate-900 ${
                  m.status === 'COMPLETED'
                    ? 'border-emerald-500 text-emerald-500'
                    : m.status === 'IN_PROGRESS'
                    ? 'border-blue-500 text-blue-500 ring-4 ring-blue-500/20'
                    : m.delayDays > 0
                    ? 'border-rose-500 text-rose-500'
                    : 'border-slate-300 text-slate-400'
                }`}
              >
                <Flag className="w-2.5 h-2.5" />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.title}</h4>
                  <div className="flex items-center space-x-2">
                    {m.delayDays > 0 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {m.delayDays} Days Delayed
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        m.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : m.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>

                {m.description && <p className="text-xs text-slate-500">{m.description}</p>}

                <div className="flex items-center space-x-4 text-xs text-slate-400 font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Target: <strong>{m.targetDate}</strong></span>
                  {m.actualDate && <span>Actual Finish: <strong className="text-emerald-600">{m.actualDate}</strong></span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Add Project Milestone</h4>
            <form onSubmit={handleCreateMilestone} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phase 2: 12-inch CS Piping Hydrotest Completion"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="DELAYED">DELAYED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Deliverables & Scope</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl shadow"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
