import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { Building2, Search, Filter, Calendar, Users, Truck, ChevronRight, Plus, MapPin, Archive, Edit3, ShieldAlert, RefreshCw, Download, RotateCcw } from 'lucide-react';
import { DSPageHeader, DSCard, DSButton, DSStatusChip, DSSearchBox, DSTabs } from '../ui/design-system';
import { ProjectCreateEditModal } from './ProjectCreateEditModal';
import { ProjectDetailView } from './ProjectDetailView';

export const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sitesync_access_token');
      const query = new URLSearchParams();
      if (searchTerm) query.append('search', searchTerm);
      if (statusFilter !== 'ALL') query.append('status', statusFilter);

      const res = await fetch(`/api/projects?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setProjects(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, statusFilter]);

  const handleArchive = async (projectId: string) => {
    if (!confirm('Are you sure you want to archive this project?')) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      await fetch(`/api/projects/${projectId}/archive`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProjects();
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = () => {
    const rows = ["Code,Name,Location,Status,Progress,Budget"]
      .concat(projects.map(p => `"${p.projectCode || ''}","${p.projectName || ''}","${p.location || ''}","${p.status || ''}","${p.progressPercentage || 0}%","${p.budget || ''}"`));
    const blob = new Blob([rows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `projects_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (selectedProject) {
    return (
      <ProjectDetailView
        projectId={selectedProject.id}
        onBack={() => {
          setSelectedProject(null);
          fetchProjects();
        }}
        onEdit={(proj) => {
          setEditingProject(proj);
          setShowModal(true);
        }}
        onArchive={handleArchive}
      />
    );
  }

  const statuses = [
    { id: 'ALL', label: 'ALL' },
    { id: 'PLANNING', label: 'PLANNING' },
    { id: 'IN_PROGRESS', label: 'IN PROGRESS' },
    { id: 'ON_HOLD', label: 'ON HOLD' },
    { id: 'COMPLETED', label: 'COMPLETED' },
    { id: 'CANCELLED', label: 'CANCELLED' },
  ];

  return (
    <div className="space-y-6">
      {/* DS Page Header */}
      <DSPageHeader
        title="Projects & Construction Sites Execution Engine"
        description="Real-time mechanical, piping, and structural project management & field ops"
        breadcrumbs={[{ label: 'ERP' }, { label: 'Projects Engine' }]}
        actions={
          <>
            <DSButton
              variant="outline"
              size="sm"
              isLoading={loading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={fetchProjects}
            >
              Refresh
            </DSButton>

            <DSButton
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={handleExport}
            >
              Export
            </DSButton>

            <DSButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setEditingProject(null);
                setShowModal(true);
              }}
            >
              New Project Entry
            </DSButton>
          </>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="w-full sm:w-80">
          <DSSearchBox
            placeholder="Search projects, client, code, location..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <DSTabs
            tabs={statuses}
            activeTab={statusFilter}
            onChange={(id) => setStatusFilter(id)}
            variant="pills"
          />
          {(searchTerm || statusFilter !== 'ALL') && (
            <DSButton
              variant="ghost"
              size="xs"
              leftIcon={<RotateCcw className="w-3 h-3 text-rose-500" />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
            >
              Reset
            </DSButton>
          )}
        </div>
      </div>

      {/* Projects List Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading project database...</div>
      ) : projects.length === 0 ? (
        <DSCard className="p-12 text-center text-xs text-slate-400">
          No projects found matching criteria.
        </DSCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <DSCard
              key={proj.id}
              className="hover:shadow-lg hover:border-indigo-500/50 transition duration-200 flex flex-col justify-between cursor-pointer group"
              header={
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {proj.projectCode}
                  </span>
                  <DSStatusChip status={proj.status} />
                </div>
              }
              footer={
                <div className="flex items-center justify-between text-xs w-full">
                  <div className="text-slate-500">
                    Budget: <strong className="text-slate-900 dark:text-white">AED {(proj.budget / 1000000).toFixed(2)}M</strong>
                  </div>
                  <button
                    onClick={() => setSelectedProject(proj)}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center"
                  >
                    Execution Hub <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
              }
            >
              <div className="space-y-3" onClick={() => setSelectedProject(proj)}>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                    {proj.projectName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {proj.location}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Overall Site Execution</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{proj.progressPercentage || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${proj.progressPercentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </DSCard>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <ProjectCreateEditModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        projectToEdit={editingProject}
        onSuccess={() => {
          fetchProjects();
        }}
      />
    </div>
  );
};

