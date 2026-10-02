import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { MapPin, Plus, ExternalLink, HardHat, User, CheckCircle2, Clock, Navigation } from 'lucide-react';

interface ProjectSitesViewProps {
  projectId: string;
}

export const ProjectSitesView: React.FC<ProjectSitesViewProps> = ({ projectId }) => {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    siteCode: '',
    siteName: '',
    address: '',
    latitude: 24.498,
    longitude: 54.407,
    googleMapUrl: '',
    status: 'ACTIVE',
  });

  const fetchSites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/projects/${projectId}/sites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setSites(json.data || []);
      }
    } catch (err) {
      console.error('Failed fetching sites', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchSites();
  }, [projectId]);

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/projects/sites', {
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
        fetchSites();
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
            <MapPin className="w-4 h-4 text-blue-500" /> Site Locations & GPS Coordinates
          </h3>
          <p className="text-xs text-slate-500">
            Active execution sub-zones, field yards, and physical work boundaries
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              siteCode: `SITE-SEC-${Math.floor(10 + Math.random() * 90)}`,
              siteName: '',
              address: 'Al Reem Island Extension Area, Abu Dhabi',
              latitude: 24.498,
              longitude: 54.407,
              googleMapUrl: 'https://maps.google.com/?q=24.498,54.407',
              status: 'ACTIVE',
            });
            setShowModal(true);
          }}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Site</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading site locations...</div>
      ) : sites.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
          No sites configured for this project yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sites.map((site) => (
            <div
              key={site.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                      {site.siteCode}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {site.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{site.siteName}</h4>
                </div>
                {site.googleMapUrl && (
                  <a
                    href={site.googleMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 transition"
                    title="Open in Google Maps"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{site.address}</span>
                </div>
                {site.latitude && site.longitude && (
                  <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-400">
                    <Navigation className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Lat: {site.latitude}, Long: {site.longitude}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-400">
                  <HardHat className="w-3.5 h-3.5 text-amber-500" />
                  <span>Engineer: Tariq Al-Farsi</span>
                </div>
                <div className="font-bold text-blue-600 dark:text-blue-400">
                  {site.progressPercentage || 0}% Progress
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Add Construction Site Sub-Zone</h4>
            <form onSubmit={handleCreateSite} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Site Code</label>
                <input
                  type="text"
                  required
                  value={formData.siteCode}
                  onChange={(e) => setFormData({ ...formData, siteCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Site Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 4 North Jetty Yard"
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Address / Zone Description</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
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
                  Save Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
