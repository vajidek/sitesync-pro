import React, { useState } from 'react';
import { ERP_SCHEMA_TABLES, CREATOR_INFO } from '../../data/mockData';
import { SchemaTable } from '../../types';
import { 
  Database, 
  Table, 
  Code2, 
  FileCode, 
  Layers, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Server
} from 'lucide-react';

export const SchemaInspector: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<SchemaTable>(ERP_SCHEMA_TABLES[0]);
  const [activeTab, setActiveTab] = useState<'fields' | 'prisma' | 'sql'>('fields');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0B192C] text-white border border-slate-800 shadow-xl space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-900/80 text-blue-300 border border-blue-700/50">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>ERP Expansion Blueprint</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              PostgreSQL & Prisma Schema Inspector
            </h1>
            <p className="text-xs text-slate-300">
              Future-proof relational data schema designed by <strong className="text-blue-300 font-semibold">{CREATOR_INFO.name}</strong> to support full enterprise ERP expansion.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-center">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
              PostgreSQL 16 + Prisma v6
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Table List, Right Definition Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Table List */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            ERP Data Models ({ERP_SCHEMA_TABLES.length} Core Tables)
          </h2>
          <div className="space-y-2">
            {ERP_SCHEMA_TABLES.map((t) => {
              const isSelected = selectedTable.name === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => setSelectedTable(t)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20 font-semibold'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Table className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                    <div>
                      <div className="font-mono text-xs font-bold">{t.name}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {t.module} • {t.fields.length} Fields
                      </div>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Schema Inspector Detail */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            
            {/* Table Name Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {selectedTable.module} Module
                </span>
                <h3 className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                  table: {selectedTable.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedTable.description}
                </p>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-center">
                <button
                  onClick={() => setActiveTab('fields')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeTab === 'fields'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Fields ({selectedTable.fields.length})
                </button>
                <button
                  onClick={() => setActiveTab('prisma')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeTab === 'prisma'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Prisma Code
                </button>
                <button
                  onClick={() => setActiveTab('sql')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeTab === 'sql'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  SQL DDL
                </button>
              </div>
            </div>

            {/* TAB 1: Fields Table */}
            {activeTab === 'fields' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="px-3 py-2.5 rounded-l-lg">Field Name</th>
                      <th className="px-3 py-2.5">Data Type</th>
                      <th className="px-3 py-2.5">Key Type</th>
                      <th className="px-3 py-2.5 rounded-r-lg">Field Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedTable.fields.map((f) => (
                      <tr key={f.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="px-3 py-3 font-mono font-semibold text-slate-900 dark:text-slate-100">
                          {f.name}
                        </td>
                        <td className="px-3 py-3 font-mono text-blue-600 dark:text-blue-400 font-medium">
                          {f.type}
                        </td>
                        <td className="px-3 py-3">
                          {f.isPrimary && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
                              PRIMARY KEY
                            </span>
                          )}
                          {f.isForeign && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200">
                              FOREIGN KEY
                            </span>
                          )}
                          {!f.isPrimary && !f.isForeign && (
                            <span className="text-slate-400 text-[10px]">Standard</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-slate-500 dark:text-slate-400">
                          {f.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: Prisma Schema Model Code */}
            {activeTab === 'prisma' && (
              <div className="relative">
                <button
                  onClick={() => handleCopy(selectedTable.prismaModel)}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1 shadow-md z-10"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Prisma Schema'}</span>
                </button>
                <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                  <code>{selectedTable.prismaModel}</code>
                </pre>
              </div>
            )}

            {/* TAB 3: SQL DDL Statement */}
            {activeTab === 'sql' && (
              <div className="relative">
                <button
                  onClick={() => handleCopy(selectedTable.sqlDdl)}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1 shadow-md z-10"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy SQL DDL'}</span>
                </button>
                <pre className="p-4 rounded-xl bg-slate-950 text-blue-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                  <code>{selectedTable.sqlDdl}</code>
                </pre>
              </div>
            )}

          </div>

          {/* Architecture Readiness Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Server className="w-4 h-4 text-blue-500" /> Scalable ERP Migration Path
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              This schema is pre-configured to migrate seamlessly to Cloud SQL PostgreSQL or local Docker PostgreSQL instances. Execute <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-300">npx prisma db push</code> when deploying to production servers.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
