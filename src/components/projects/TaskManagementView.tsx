import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { CheckSquare, Plus, Clock, MessageSquare, AlertCircle, Send, User, Paperclip } from 'lucide-react';

interface TaskManagementViewProps {
  projectId: string;
}

export const TaskManagementView: React.FC<TaskManagementViewProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedToId: 'emp-003',
    assignedToName: 'Tariq Al-Farsi',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    status: 'TODO',
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setTasks(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchTasks();
  }, [projectId]);

  const fetchComments = async (taskId: string) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/projects/tasks/${taskId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) setComments(json.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/projects/tasks', {
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
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      await fetch(`/api/projects/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newComment.trim()) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/projects/tasks/${selectedTask.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: newComment }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setNewComment('');
        fetchComments(selectedTask.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const priorityColors: Record<string, string> = {
    LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    HIGH: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    CRITICAL: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-black animate-pulse',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-500" /> Site Task Assignments & Activity Tracker
          </h3>
          <p className="text-xs text-slate-500">
            Assigned tasks, priority tracking, due date reminders & task discussion log
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Assign New Task</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading site tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="p-8 text-center border border-dashed rounded-2xl text-xs text-slate-400">
          No active tasks created for this project.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Cards Column */}
          <div className="lg:col-span-2 space-y-3">
            {tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedTask(t);
                  fetchComments(t.id);
                }}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition cursor-pointer space-y-3 ${
                  selectedTask?.id === t.id
                    ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityColors[t.priority] || ''}`}>
                        {t.priority}
                      </span>
                      <select
                        value={t.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(t.id, e.target.value);
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none outline-none"
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="BLOCKED">BLOCKED</option>
                      </select>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.title}</h4>
                  </div>
                </div>

                {t.description && <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>}

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span>Assignee: <strong>{t.assignedToName || 'Tariq Al-Farsi'}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-400 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Due: {t.dueDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Task Comments Sidebar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            {selectedTask ? (
              <>
                <div className="space-y-3">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Task Discussion & Activity</h4>
                    <p className="text-[11px] text-slate-500 truncate">{selectedTask.title}</p>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {comments.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No comments yet. Start the conversation!</p>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1 text-xs">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{c.userName}</span>
                            <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-slate-800 dark:text-slate-200 text-xs">{c.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <form onSubmit={handlePostComment} className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <input
                    type="text"
                    placeholder="Type a comment or status update..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post Comment</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-12 text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Select a task on the left to view discussions & activity log</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Create & Assign Site Task</h4>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hydro-testing 12 inch CS Line Header"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Specific work instruction..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
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
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
