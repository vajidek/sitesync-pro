import React, { useState } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
  className?: string;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  emptyMessage?: string;
}

export function VirtualizedTable<T extends { id: string | number }>({
  data,
  columns,
  pageSize = 10,
  emptyMessage = 'No records found.'
}: VirtualizedTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const visibleData = data.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`p-3.5 ${col.className || ''}`} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
            {visibleData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visibleData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                  {columns.map((col) => (
                    <td key={col.key} className={`p-3.5 ${col.className || ''}`}>
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-500">
          <span>
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, data.length)} of {data.length} entries
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium"
            >
              Previous
            </button>
            <span className="px-3 font-mono text-slate-700 dark:text-slate-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
