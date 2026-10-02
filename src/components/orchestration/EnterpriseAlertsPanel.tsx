import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  Link,
  ChevronRight,
  RotateCw,
  Search,
  Check,
  Building,
} from 'lucide-react';
import { CorrelatedAlertItem, EventSeverity } from '../../api/orchestration/orchestration.types';

interface EnterpriseAlertsPanelProps {
  alerts: CorrelatedAlertItem[];
  onAcknowledgeAlert: (alertId: string) => Promise<void>;
  onResolveAlert: (alertId: string, summary: string) => Promise<void>;
  isLoading: boolean;
}

export const EnterpriseAlertsPanel: React.FC<EnterpriseAlertsPanelProps> = ({
  alerts,
  onAcknowledgeAlert,
  onResolveAlert,
  isLoading,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [resolutionSummary, setResolutionSummary] = useState('');

  const filteredAlerts = alerts.filter((a) => {
    if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) return false;
    return true;
  });

  const getSeverityBadge = (sev: EventSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 ring-1 ring-rose-500/20';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'LOW':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  const handleResolveSubmit = async (alertId: string) => {
    if (!resolutionSummary.trim()) return;
    await onResolveAlert(alertId, resolutionSummary);
    setResolvingAlertId(null);
    setResolutionSummary('');
  };

  return (
    <div id="enterprise-alerts-panel" className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Cross-Module Correlated Incidents</h3>
            <p className="text-xs text-slate-400">Multi-source event correlation grouped by operational risk</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500/50"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Incidents</option>
            <option value="HIGH">High Incidents</option>
            <option value="MEDIUM">Medium Incidents</option>
          </select>
        </div>
      </div>

      {/* Correlated Alerts Stream */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
            <CheckCircle className="w-10 h-10 mx-auto text-emerald-500/50 mb-3" />
            <p className="font-medium text-slate-300">No active correlated alerts</p>
            <p className="text-xs text-slate-500 mt-1">Cross-module correlation engine reports nominal operational conditions</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-slate-900/95 border rounded-xl p-5 shadow-sm transition space-y-3 ${
                alert.severity === 'CRITICAL' ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800/90'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="font-mono text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {alert.correlationGroup}
                  </span>
                  {alert.projectId && (
                    <span className="text-xs text-indigo-400 font-semibold bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-500/30">
                      {alert.projectId}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {alert.status === 'ACTIVE' && (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
                    >
                      Acknowledge
                    </button>
                  )}

                  {alert.status !== 'RESOLVED' ? (
                    <button
                      onClick={() => setResolvingAlertId(alert.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition"
                    >
                      Resolve Incident
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-bold px-2 py-0.5 bg-emerald-950/60 rounded border border-emerald-500/20">
                      RESOLVED
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-100">{alert.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.impactAssessment}</p>
              </div>

              {/* Related Entities Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-500 font-medium">Correlated Entities:</span>
                {alert.relatedEntities.map((ent, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 font-mono text-[11px]"
                  >
                    <Link className="w-3 h-3 text-indigo-400" />
                    <span className="text-slate-400">{ent.module}:</span> {ent.entityId}
                  </span>
                ))}
              </div>

              {/* Prescriptive Recommended Action & AI Insight */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-400">Prescriptive Action: </span>
                    <span className="text-slate-200">{alert.recommendedAction}</span>
                  </div>
                </div>

                {alert.aiInsightText && (
                  <div className="flex items-start gap-2 pt-1 border-t border-slate-900 text-slate-400">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-indigo-300 font-medium">AI Decision Support ({alert.aiClassification}): </span>
                      <span>{alert.aiInsightText}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Inline Resolution Form */}
              {resolvingAlertId === alert.id && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-200">Closeout Resolution Summary:</div>
                  <input
                    type="text"
                    value={resolutionSummary}
                    onChange={(e) => setResolutionSummary(e.target.value)}
                    placeholder="Enter final resolution details..."
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setResolvingAlertId(null)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleResolveSubmit(alert.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded"
                    >
                      Confirm Closeout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
