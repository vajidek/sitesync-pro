import React, { useState, useEffect } from 'react';
import {
  Key,
  Webhook,
  Plus,
  Send,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  Shield,
  Radio,
  ExternalLink,
  Code2,
} from 'lucide-react';

export const ApiClientsWebhooksTab: React.FC = () => {
  const [apiClients, setApiClients] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'clients' | 'webhooks'>('clients');

  // Modal / Form state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [newClientSecret, setNewClientSecret] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Client form
  const [clientName, setClientName] = useState('');
  const [clientDesc, setClientDesc] = useState('');
  const [clientType, setClientType] = useState('SERVICE_ACCOUNT');
  const [clientRpm, setClientRpm] = useState(120);

  // Webhook form
  const [webhookName, setWebhookName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [subscribedEvents, setSubscribedEvents] = useState('project.updated, procurement.created');

  // Test webhook trigger
  const [testingCode, setTestingCode] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      const [cRes, wRes, eRes] = await Promise.all([
        fetch('/api/ai-gateway/api-clients'),
        fetch('/api/ai-gateway/webhooks'),
        fetch('/api/ai-gateway/webhook-events'),
      ]);
      const cJson = await cRes.json();
      const wJson = await wRes.json();
      const eJson = await eRes.json();

      if (cJson.success) setApiClients(cJson.data);
      if (wJson.success) setWebhooks(wJson.data);
      if (eJson.success) setWebhookEvents(eJson.data);
    } catch (e) {
      console.error('Failed to load API clients and webhooks:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/ai-gateway/api-clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          description: clientDesc,
          clientType,
          rateLimitRpm: Number(clientRpm),
          scopes: ['ai:read', 'ai:execute'],
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNewClientSecret(json.data.secretKeyPlaintext);
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to create API client:', err);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/ai-gateway/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: webhookName,
          targetUrl,
          subscribedEvents: subscribedEvents.split(',').map(s => s.trim()),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsWebhookModalOpen(false);
        setWebhookName('');
        setTargetUrl('');
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to create webhook:', err);
    }
  };

  const handleTestWebhook = async (webhookCode: string) => {
    setTestingCode(webhookCode);
    try {
      const res = await fetch(`/api/ai-gateway/webhooks/${webhookCode}/test`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setTestResult(json.data);
        await fetchData();
        setTimeout(() => setTestResult(null), 4000);
      }
    } catch (e) {
      console.error('Test webhook dispatch failed:', e);
    } finally {
      setTestingCode(null);
    }
  };

  const handleRevokeClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to revoke this API Client secret?')) return;
    try {
      await fetch(`/api/ai-gateway/api-clients/${clientId}`, { method: 'DELETE' });
      await fetchData();
    } catch (e) {
      console.error('Revoke client failed:', e);
    }
  };

  return (
    <div className="space-y-6" id="ai-api-clients-webhooks">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-400" />
              API Client Credential Manager & Event Webhook Pipes
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Provision machine-to-machine API keys with granular scopes and configure HMAC-SHA256 authenticated outbound webhooks for SCADA and ERP integrations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setNewClientSecret(null);
                setIsClientModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate API Key</span>
            </button>
            <button
              onClick={() => setIsWebhookModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Webhook className="w-3.5 h-3.5 text-cyan-400" />
              <span>Add Webhook</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('clients')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'clients' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Active API Clients ({apiClients.length})
        </button>
        <button
          onClick={() => setActiveSubTab('webhooks')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'webhooks' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Outbound Webhook Endpoints ({webhooks.length})
        </button>
      </div>

      {/* Clients View */}
      {activeSubTab === 'clients' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Client Identifier</th>
                  <th className="py-2.5 px-3">Application Name</th>
                  <th className="py-2.5 px-3">Archetype</th>
                  <th className="py-2.5 px-3">Key Prefix</th>
                  <th className="py-2.5 px-3">Rate Limit</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {apiClients.map(client => (
                  <tr key={client.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-200">{client.clientId}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white">{client.clientName}</div>
                      <div className="text-[11px] text-slate-400">{client.description}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {client.clientType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-indigo-400">{client.secretPrefix}</td>
                    <td className="py-2.5 px-3 text-slate-300">{client.rateLimitRpm} req/min</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        client.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {client.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleRevokeClient(client.clientId)}
                          className="px-2 py-1 rounded text-[11px] font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Webhooks View */}
      {activeSubTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Webhook Code</th>
                    <th className="py-2.5 px-3">Endpoint Name & URL</th>
                    <th className="py-2.5 px-3">Subscribed Topics</th>
                    <th className="py-2.5 px-3 text-right">Dispatches</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Test Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {webhooks.map(wh => (
                    <tr key={wh.webhookCode} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-200">{wh.webhookCode}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white">{wh.name}</div>
                        <div className="text-[11px] font-mono text-cyan-400 truncate max-w-sm">{wh.targetUrl}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {wh.subscribedEvents?.map((evt: string) => (
                            <span key={evt} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                              {evt}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                        {wh.successfulDispatches} / {wh.totalDispatches}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {wh.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleTestWebhook(wh.webhookCode)}
                          disabled={testingCode === wh.webhookCode}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition ml-auto"
                        >
                          <Send className="w-3 h-3" />
                          <span>{testingCode === wh.webhookCode ? 'Pinging...' : 'Send Test Ping'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Dispatched Webhook Events */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Webhook Dispatch Telemetry</h3>
            <div className="space-y-2.5">
              {webhookEvents.slice(0, 5).map(evt => (
                <div key={evt.eventId} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-white">{evt.eventId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {evt.eventType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">Source Module: {evt.sourceModule}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3 h-3" /> 200 OK
                    </span>
                    <span className="text-[10px] text-slate-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Client */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Generate Service API Client Key</h3>
              <button onClick={() => setIsClientModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {newClientSecret ? (
              <div className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-xs">
                  <span className="font-bold block">Important Security Notice:</span>
                  Please copy this API Key secret immediately. You will not be able to view it again.
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1">Generated Secret Key</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={newClientSecret}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(newClientSecret);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                      className="p-2 bg-indigo-600 rounded-lg text-white"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsClientModalOpen(false);
                    setNewClientSecret(null);
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-lg text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="e.g. SCADA RTU Bridge"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Description</label>
                  <input
                    type="text"
                    required
                    value={clientDesc}
                    onChange={e => setClientDesc(e.target.value)}
                    placeholder="e.g. High frequency site telemetry stream"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Rate Limit (Requests/min)</label>
                  <input
                    type="number"
                    value={clientRpm}
                    onChange={e => setClientRpm(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsClientModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs"
                  >
                    Generate Key
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create Webhook */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Register Outbound Webhook</h3>
              <button onClick={() => setIsWebhookModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateWebhook} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Endpoint Name</label>
                <input
                  type="text"
                  required
                  value={webhookName}
                  onChange={e => setWebhookName(e.target.value)}
                  placeholder="e.g. Water Utility Integration Dispatcher"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target HTTPS URL</label>
                <input
                  type="url"
                  required
                  value={targetUrl}
                  onChange={e => setTargetUrl(e.target.value)}
                  placeholder="https://api.external.com/events"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Subscribed Event Topics (comma separated)</label>
                <input
                  type="text"
                  value={subscribedEvents}
                  onChange={e => setSubscribedEvents(e.target.value)}
                  placeholder="alarm.critical, project.updated"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWebhookModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs"
                >
                  Save Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
