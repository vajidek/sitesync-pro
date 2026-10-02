import React, { useEffect, useState } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  Zap, Bell, FileText, Activity, Plus, RefreshCw, CheckCircle2, 
  AlertCircle, ShieldCheck, Mail, MessageSquare, Send, Clock, 
  Play, RotateCcw, Filter, Sliders, ChevronRight, Layers, ArrowUpRight
} from 'lucide-react';
import {
  DSSectionHeader,
  DSCard,
  DSButton,
  DSTabs,
  DSAlert,
  DSModal,
  DSField
} from '../ui/design-system';

export const AutomationEngineView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'rules' | 'templates' | 'logs' | 'notifications'>('rules');
  const [rulesList, setRulesList] = useState<any[]>([]);
  const [templatesList, setTemplatesList] = useState<any[]>([]);
  const [logsList, setLogsList] = useState<any[]>([]);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEventSource, setSelectedEventSource] = useState('ALL');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [newRule, setNewRule] = useState({
    code: '',
    name: '',
    description: '',
    eventSource: 'PROJECTS',
    triggerType: 'THRESHOLD_EXCEEDED',
    priority: 'HIGH',
    escalationEnabled: true,
    conditionField: 'totalAmount',
    conditionOp: 'GREATER_THAN',
    conditionValue: '50000',
    actionType: 'IN_APP_NOTIFICATION',
    templateId: '',
  });

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    code: '',
    name: '',
    channel: 'IN_APP',
    eventSource: 'PROJECTS',
    subjectTemplate: 'System Alert: {{title}}',
    bodyTemplate: 'Event {{event}} triggered for record {{id}}.',
    variables: 'title, event, id',
  });

  const fetchRules = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/automations/rules?eventSource=${selectedEventSource}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success && Array.isArray(json.data)) {
        setRulesList(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch automation rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/automations/templates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success && Array.isArray(json.data)) {
        setTemplatesList(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch notification templates:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/automations/logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success && Array.isArray(json.data)) {
        setLogsList(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch execution logs:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/automations/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success && Array.isArray(json.data)) {
        setNotificationsList(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch user notifications:', err);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'rules') fetchRules();
    if (activeSubTab === 'templates') fetchTemplates();
    if (activeSubTab === 'logs') fetchLogs();
    if (activeSubTab === 'notifications') fetchNotifications();
  }, [activeSubTab, selectedEventSource]);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const payload = {
        code: newRule.code,
        name: newRule.name,
        description: newRule.description,
        eventSource: newRule.eventSource,
        triggerType: newRule.triggerType,
        conditionsJson: {
          field: newRule.conditionField,
          operator: newRule.conditionOp,
          value: newRule.conditionValue,
        },
        priority: newRule.priority,
        escalationEnabled: newRule.escalationEnabled,
        escalationPolicyJson: newRule.escalationEnabled ? { delayHours: 24, escalateToRole: 'MANAGER' } : null,
        actions: [
          {
            actionType: newRule.actionType,
            templateId: newRule.templateId || null,
            configJson: { autoDispatch: true },
            sequenceOrder: 1,
          },
        ],
      };

      const res = await fetch('/api/automations/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowRuleModal(false);
        setActionMessage({ type: 'success', text: 'Automation Rule created successfully' });
        fetchRules();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to create automation rule' });
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const payload = {
        code: newTemplate.code,
        name: newTemplate.name,
        channel: newTemplate.channel,
        eventSource: newTemplate.eventSource,
        subjectTemplate: newTemplate.subjectTemplate,
        bodyTemplate: newTemplate.bodyTemplate,
        variablesJson: newTemplate.variables.split(',').map((v) => v.trim()),
      };

      const res = await fetch('/api/automations/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowTemplateModal(false);
        setActionMessage({ type: 'success', text: 'Notification Template created successfully' });
        fetchTemplates();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to create template' });
    }
  };

  const handleToggleRule = async (id: string) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/automations/rules/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: 'Rule active state toggled' });
        fetchRules();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to toggle rule' });
    }
  };

  const handleTestTrigger = async (rule: any) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/automations/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventSource: rule.eventSource,
          triggerType: rule.triggerType,
          payload: { testRecordId: 'REC-2026-99', totalAmount: 75000 },
        }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: `Event evaluated. Executed ${json.data?.triggeredCount || 0} automation rules.` });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Trigger test failed' });
    }
  };

  const handleRetryLog = async (logId: string) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/automations/logs/${logId}/retry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: 'Execution action retried successfully' });
        fetchLogs();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Retry failed' });
    }
  };

  return (
    <div className="space-y-6 text-xs">
      
      <DSSectionHeader
        title="Enterprise Notification & Automation Engine"
        subtitle="Zero-code trigger rules, multi-channel dispatch (In-App, Email, SMS, Webhook), escalation policies, and execution log monitors."
        action={
          <div className="flex items-center space-x-2">
            {activeSubTab === 'rules' && (
              <DSButton
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setNewRule({
                    code: `RULE_${Date.now().toString().slice(-4)}`,
                    name: 'Custom ERP Event Trigger',
                    description: 'Triggered upon threshold check',
                    eventSource: 'PROJECTS',
                    triggerType: 'THRESHOLD_EXCEEDED',
                    priority: 'HIGH',
                    escalationEnabled: true,
                    conditionField: 'totalAmount',
                    conditionOp: 'GREATER_THAN',
                    conditionValue: '50000',
                    actionType: 'IN_APP_NOTIFICATION',
                    templateId: templatesList[0]?.id || '',
                  });
                  setShowRuleModal(true);
                }}
              >
                Create Rule
              </DSButton>
            )}

            {activeSubTab === 'templates' && (
              <DSButton
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setNewTemplate({
                    code: `TPL_${Date.now().toString().slice(-4)}`,
                    name: 'Custom ERP Alert Template',
                    channel: 'IN_APP',
                    eventSource: 'PROJECTS',
                    subjectTemplate: 'Notice: {{title}}',
                    bodyTemplate: 'Detailed message body for {{recordId}}.',
                    variables: 'title, recordId',
                  });
                  setShowTemplateModal(true);
                }}
              >
                Create Template
              </DSButton>
            )}
          </div>
        }
      />

      {/* Notification Banner */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('rules')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeSubTab === 'rules'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Automation Rules</span>
        </button>

        <button
          onClick={() => setActiveSubTab('templates')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeSubTab === 'templates'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Notification Templates</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeSubTab === 'notifications'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>In-App Feed</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeSubTab === 'logs'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Execution Logs & Retry</span>
        </button>
      </div>

      {/* Sub-Tab 1: Automation Rules Builder */}
      {activeSubTab === 'rules' && (
        <div className="space-y-4">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-slate-700 dark:text-slate-300">Filter Event Source:</span>
              <select
                value={selectedEventSource}
                onChange={(e) => setSelectedEventSource(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
              >
                <option value="ALL">All Event Sources</option>
                <option value="PROJECTS">Projects</option>
                <option value="PROCUREMENT">Procurement</option>
                <option value="INVENTORY">Inventory</option>
                <option value="WORKFLOW">Workflow</option>
                <option value="HR">HR & Attendance</option>
                <option value="FLEET">Fleet</option>
              </select>
            </div>
            <button onClick={() => fetchRules()} className="p-1 text-slate-400 hover:text-slate-600">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rulesList.map((rule) => (
              <div
                key={rule.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded text-[10px]">
                        {rule.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        rule.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {rule.isActive ? 'ACTIVE' : 'PAUSED'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className="text-[10px] text-indigo-600 hover:underline font-bold"
                    >
                      {rule.isActive ? 'Pause' : 'Activate'}
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-xs mt-2">{rule.name}</h3>
                  <p className="text-slate-500 text-[11px] mt-1">{rule.description}</p>

                  <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block text-[10px] uppercase tracking-wider">IF Condition:</span>
                    <div className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                      {rule.conditionsJson?.field} {rule.conditionsJson?.operator} {rule.conditionsJson?.value}
                    </div>
                  </div>

                  <div className="mt-2 space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block text-[10px] uppercase tracking-wider">Configured Actions ({rule.actions?.length || 0}):</span>
                    {rule.actions?.map((act: any) => (
                      <div key={act.id} className="flex items-center space-x-2 text-[10px] text-slate-600 dark:text-slate-400">
                        <ChevronRight className="w-3 h-3 text-indigo-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{act.actionType}</span>
                        {act.templateId && <span className="text-slate-400 font-mono">({act.templateId})</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">Escalation: {rule.escalationEnabled ? 'ENABLED (24h SLA)' : 'NONE'}</span>
                  <button
                    onClick={() => handleTestTrigger(rule)}
                    className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold rounded-lg hover:bg-amber-100 flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Test Trigger</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Notification Templates */}
      {activeSubTab === 'templates' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templatesList.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded text-[10px]">
                    {tpl.code}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[9px] font-mono">
                    {tpl.channel}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs">{tpl.name}</h3>
                  <p className="text-slate-500 text-[10px] font-mono mt-1">Subject: {tpl.subjectTemplate || 'N/A'}</p>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                  {tpl.bodyTemplate}
                </div>

                <div className="text-[9px] text-slate-400 font-mono flex items-center space-x-1">
                  <span>Variables:</span>
                  <span className="text-indigo-600 font-bold">{JSON.stringify(tpl.variablesJson)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: In-App Feed */}
      {activeSubTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
              Active User Notification Inbox
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Total: {notificationsList.length}</span>
          </div>

          <div className="space-y-2">
            {notificationsList.map((ntf) => (
              <div
                key={ntf.id}
                className={`p-3 rounded-xl border transition flex items-start justify-between ${
                  ntf.isRead
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500'
                    : 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-white font-semibold'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 bg-indigo-600 text-white rounded text-[9px] font-mono">{ntf.channel}</span>
                    <span className="font-bold text-xs">{ntf.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{ntf.message}</p>
                  <span className="text-[9px] text-slate-400 font-mono block">{ntf.createdAt}</span>
                </div>

                {!ntf.isRead && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded text-[9px] font-bold">
                    UNREAD
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Execution Logs */}
      {activeSubTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
              Automation Execution History & Retry Monitor
            </span>
            <button onClick={() => fetchLogs()} className="p-1 text-slate-400 hover:text-slate-600">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2 px-3">Log ID</th>
                  <th className="py-2 px-3">Source & Trigger</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Executed At</th>
                  <th className="py-2 px-3">Result / Payload</th>
                  <th className="py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {logsList.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2 px-3 font-mono text-[10px] text-indigo-600 font-bold">{log.id}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {log.eventSource} / {log.triggerType}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-[10px] text-slate-400">{log.executedAt}</td>
                    <td className="py-2 px-3 font-mono text-[10px] text-slate-500 max-w-xs truncate">
                      {JSON.stringify(log.resultJson || log.payloadJson)}
                    </td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => handleRetryLog(log.id)}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded font-bold text-[10px] flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Automation Rule */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Configure Zero-Code Automation Rule</span>
              </h3>
              <button onClick={() => setShowRuleModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rule Code</label>
                <input
                  type="text"
                  required
                  value={newRule.code}
                  onChange={(e) => setNewRule({ ...newRule, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Event Source</label>
                  <select
                    value={newRule.eventSource}
                    onChange={(e) => setNewRule({ ...newRule, eventSource: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="PROJECTS">Projects</option>
                    <option value="PROCUREMENT">Procurement</option>
                    <option value="INVENTORY">Inventory</option>
                    <option value="WORKFLOW">Workflow</option>
                    <option value="HR">HR & Payroll</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Trigger Type</label>
                  <select
                    value={newRule.triggerType}
                    onChange={(e) => setNewRule({ ...newRule, triggerType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="THRESHOLD_EXCEEDED">Threshold Exceeded</option>
                    <option value="OVERDUE">Milestone Overdue</option>
                    <option value="RECORD_CREATED">Record Created</option>
                    <option value="WORKFLOW_TRANSITION">Workflow Transition</option>
                    <option value="CRON">Scheduled Cron</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block text-[10px] uppercase tracking-wider">IF Condition Rule</span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="field"
                    value={newRule.conditionField}
                    onChange={(e) => setNewRule({ ...newRule, conditionField: e.target.value })}
                    className="px-2 py-1 bg-white dark:bg-slate-900 border rounded font-mono text-[10px]"
                  />
                  <select
                    value={newRule.conditionOp}
                    onChange={(e) => setNewRule({ ...newRule, conditionOp: e.target.value })}
                    className="px-2 py-1 bg-white dark:bg-slate-900 border rounded font-mono text-[10px]"
                  >
                    <option value="GREATER_THAN">&gt;</option>
                    <option value="LESS_THAN">&lt;</option>
                    <option value="EQUALS">=</option>
                  </select>
                  <input
                    type="text"
                    placeholder="value"
                    value={newRule.conditionValue}
                    onChange={(e) => setNewRule({ ...newRule, conditionValue: e.target.value })}
                    className="px-2 py-1 bg-white dark:bg-slate-900 border rounded font-mono text-[10px]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Automation Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Notification Template */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Create Notification Template</span>
              </h3>
              <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Template Code</label>
                <input
                  type="text"
                  required
                  value={newTemplate.code}
                  onChange={(e) => setNewTemplate({ ...newTemplate, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dispatch Channel</label>
                  <select
                    value={newTemplate.channel}
                    onChange={(e) => setNewTemplate({ ...newTemplate, channel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="IN_APP">In-App</option>
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="PUSH">Push</option>
                    <option value="WEBHOOK">Webhook</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Event Source</label>
                  <select
                    value={newTemplate.eventSource}
                    onChange={(e) => setNewTemplate({ ...newTemplate, eventSource: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="PROJECTS">Projects</option>
                    <option value="PROCUREMENT">Procurement</option>
                    <option value="INVENTORY">Inventory</option>
                    <option value="WORKFLOW">Workflow</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Body Template</label>
                <textarea
                  rows={3}
                  required
                  value={newTemplate.bodyTemplate}
                  onChange={(e) => setNewTemplate({ ...newTemplate, bodyTemplate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
