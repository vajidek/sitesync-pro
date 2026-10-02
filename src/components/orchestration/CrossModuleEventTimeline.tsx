import React, { useState } from 'react';
import {
  Activity,
  Play,
  RotateCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Code2,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { DomainEventRecord, SourceModule, EventSeverity } from '../../api/orchestration/orchestration.types';

interface CrossModuleEventTimelineProps {
  events: DomainEventRecord[];
  onReplayEvent: (eventId: string) => Promise<void>;
  onRefresh: () => void;
  isLoading: boolean;
}

export const CrossModuleEventTimeline: React.FC<CrossModuleEventTimelineProps> = ({
  events,
  onReplayEvent,
  onRefresh,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [replayingId, setReplayingId] = useState<string | null>(null);

  const filteredEvents = events.filter((evt) => {
    if (selectedModule !== 'ALL' && evt.sourceModule !== selectedModule) return false;
    if (selectedSeverity !== 'ALL' && evt.severity !== selectedSeverity) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchType = evt.eventType.toLowerCase().includes(q);
      const matchId = evt.entityId.toLowerCase().includes(q);
      const matchCorr = evt.correlationId.toLowerCase().includes(q);
      if (!matchType && !matchId && !matchCorr) return false;
    }
    return true;
  });

  const handleReplay = async (id: string) => {
    setReplayingId(id);
    try {
      await onReplayEvent(id);
    } finally {
      setReplayingId(null);
    }
  };

  const getSeverityBadge = (sev: EventSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'MEDIUM':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'LOW':
      case 'INFO':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
  };

  const getModuleBadge = (mod: SourceModule) => {
    return 'bg-slate-800 text-slate-300 border border-slate-700/60 font-mono text-[11px]';
  };

  return (
    <div id="cross-module-event-timeline" className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="flex flex-1 items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event type, entity ID, correlation ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 text-sm text-slate-200 pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:border-indigo-500/50 transition"
            />
          </div>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500/50"
          >
            <option value="ALL">All Source Modules</option>
            <option value="PROJECTS">Projects & Sites</option>
            <option value="PROJECT_CONTROLS">Project Controls</option>
            <option value="PROCUREMENT">Strategic Procurement</option>
            <option value="INVENTORY">Inventory Store</option>
            <option value="FINANCE">Finance & Accounts</option>
            <option value="EAM">EAM & Machinery</option>
            <option value="SCADA">SCADA & Telemetry</option>
            <option value="QAQC">QA/QC Quality</option>
            <option value="HSE">HSE Safety</option>
            <option value="EDMS">Document System (EDMS)</option>
            <option value="HRMS">HRMS & Workforce</option>
            <option value="CRM">CRM & Client Portal</option>
          </select>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500/50"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="INFO">Info / Low</option>
          </select>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs rounded-lg transition border border-slate-700 shrink-0 disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Events</span>
        </button>
      </div>

      {/* Events Stream Feed */}
      <div className="space-y-2.5">
        {filteredEvents.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
            <Layers className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="font-medium text-slate-300">No domain events match current filters</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting the search query or module filters above</p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isExpanded = expandedEventId === evt.id;
            return (
              <div
                key={evt.id}
                className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/90 rounded-xl p-4 transition shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-1 shrink-0">
                      {evt.severity === 'CRITICAL' ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
                      ) : evt.severity === 'HIGH' ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-4 ring-sky-500/20" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-100 text-sm tracking-tight">{evt.eventType}</span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${getSeverityBadge(evt.severity)}`}>
                          {evt.severity}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-md ${getModuleBadge(evt.sourceModule)}`}>
                          {evt.sourceModule}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {evt.entityType}: <strong className="text-slate-200">{evt.entityId}</strong>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(evt.timestamp).toLocaleTimeString()} · {new Date(evt.timestamp).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">
                          Correlation ID: <span className="text-indigo-400">{evt.correlationId}</span>
                        </span>
                        {evt.projectId && (
                          <>
                            <span>•</span>
                            <span className="text-slate-300 font-medium">Project: {evt.projectId}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleReplay(evt.id)}
                      disabled={replayingId === evt.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition border border-slate-700 disabled:opacity-50"
                      title="Replay this domain event into the orchestration bus"
                    >
                      <RotateCw className={`w-3 h-3 ${replayingId === evt.id ? 'animate-spin' : ''}`} />
                      <span>{replayingId === evt.id ? 'Replaying...' : 'Replay'}</span>
                    </button>

                    <button
                      onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition border border-slate-700"
                    >
                      <Code2 className="w-3 h-3 text-indigo-400" />
                      <span>{isExpanded ? 'Hide Payload' : 'Payload'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Payload & Metadata Inspector */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto">
                      <div className="text-[11px] text-slate-400 font-sans uppercase font-bold mb-1.5 flex items-center justify-between">
                        <span>Event Payload</span>
                        <span className="text-indigo-400 text-[10px]">JSON Schema</span>
                      </div>
                      <pre className="text-indigo-300 leading-relaxed">
                        {typeof evt.payload === 'string'
                          ? evt.payload
                          : JSON.stringify(evt.payload, null, 2)}
                      </pre>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto space-y-2">
                      <div className="text-[11px] text-slate-400 font-sans uppercase font-bold mb-1.5">
                        <span>Orchestration Trace Metadata</span>
                      </div>
                      <div className="space-y-1 text-slate-300">
                        <div><span className="text-slate-500">Idempotency Key:</span> {evt.idempotencyKey}</div>
                        <div><span className="text-slate-500">Event UUID:</span> {evt.id}</div>
                        <div><span className="text-slate-500">Created By:</span> {evt.createdBy}</div>
                        <div><span className="text-slate-500">Processing Status:</span> <span className="text-emerald-400 font-bold">{evt.status}</span></div>
                        {evt.causationId && (
                          <div><span className="text-slate-500">Causation ID:</span> {evt.causationId}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
