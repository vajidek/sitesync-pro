import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown, ArrowUp, ArrowDown, Search, Download, Columns, 
  ChevronLeft, ChevronRight, CheckSquare, Square, RefreshCw
} from 'lucide-react';
import { DSButton } from './DSButton';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor?: (row: T) => any;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  sticky?: boolean;
}

export interface DSEnterpriseDataGridProps<T extends Record<string, any>> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  onRefresh?: () => void;
  bulkActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedRows: T[]) => void;
    danger?: boolean;
  }[];
  title?: string;
  exportFilename?: string;
  className?: string;
}

export function DSEnterpriseDataGrid<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  onRefresh,
  bulkActions,
  title,
  exportFilename = 'export_data',
  className = '',
}: DSEnterpriseDataGridProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<Set<string>>(
    () => new Set(columns.map((c) => c.key))
  );
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 1. Filtered Data
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) =>
        val !== null && val !== undefined && String(val).toLowerCase().includes(query)
      )
    );
  }, [data, searchQuery]);

  // 2. Sorted Data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const { key, direction } = sortConfig;
    const colDef = columns.find((c) => c.key === key);

    return [...filteredData].sort((a, b) => {
      const valA = colDef?.accessor ? colDef.accessor(a) : a[key];
      const valB = colDef?.accessor ? colDef.accessor(b) : b[key];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }

      return direction === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortConfig, columns]);

  // 3. Paginated Data
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Bulk Selection Logic
  const allCurrentKeys = paginatedData.map(keyExtractor);
  const isAllSelected = allCurrentKeys.length > 0 && allCurrentKeys.every((k) => selectedKeys.has(k));

  const toggleSelectAll = () => {
    const next = new Set(selectedKeys);
    if (isAllSelected) {
      allCurrentKeys.forEach((k) => next.delete(k));
    } else {
      allCurrentKeys.forEach((k) => next.add(k));
    }
    setSelectedKeys(next);
  };

  const toggleSelectRow = (key: string) => {
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedKeys(next);
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return null;
      }
      return { key, direction: 'asc' };
    });
  };

  // CSV Export
  const handleExportCSV = () => {
    const activeCols = columns.filter((c) => visibleColumnKeys.has(c.key));
    const headers = activeCols.map((c) => c.header).join(',');
    const rows = sortedData.map((row) =>
      activeCols
        .map((c) => {
          const val = c.accessor ? c.accessor(row) : row[c.key];
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${exportFilename}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeColumns = columns.filter((c) => visibleColumnKeys.has(c.key));
  const selectedRowsList = data.filter((row) => selectedKeys.has(keyExtractor(row)));

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden ${className}`}>
      
      {/* Top Toolbar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {title && <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">{title}</h3>}
          
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search data grid..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {selectedKeys.size > 0 && bulkActions && (
            <div className="flex items-center space-x-2 pr-2 border-r border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {selectedKeys.size} selected
              </span>
              {bulkActions.map((act, i) => (
                <DSButton
                  key={i}
                  variant={act.danger ? 'danger' : 'secondary'}
                  size="xs"
                  leftIcon={act.icon}
                  onClick={() => act.onClick(selectedRowsList)}
                >
                  {act.label}
                </DSButton>
              ))}
            </div>
          )}

          {/* Column Toggle */}
          <div className="relative">
            <button
              onClick={() => setColumnMenuOpen(!columnMenuOpen)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center space-x-1"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Columns</span>
            </button>

            {columnMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-2 z-50 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 py-1">
                  Visible Columns
                </span>
                {columns.map((col) => (
                  <label key={col.key} className="flex items-center space-x-2 px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumnKeys.has(col.key)}
                      onChange={() => {
                        const next = new Set(visibleColumnKeys);
                        if (next.has(col.key)) {
                          if (next.size > 1) next.delete(col.key);
                        } else {
                          next.add(col.key);
                        }
                        setVisibleColumnKeys(next);
                      }}
                    />
                    <span className="truncate text-slate-700 dark:text-slate-200 font-medium">{col.header}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <DSButton variant="outline" size="xs" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleExportCSV}>
            Export CSV
          </DSButton>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto relative min-h-[250px]">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/90 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-3 w-10 text-center sticky left-0 z-20 bg-slate-50 dark:bg-slate-800">
                <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600">
                  {isAllSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                </button>
              </th>
              {activeColumns.map((col, idx) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${
                    idx === 0 ? 'sticky left-10 z-20 bg-slate-50 dark:bg-slate-800' : ''
                  }`}
                >
                  <div className="flex items-center space-x-1.5 cursor-pointer" onClick={() => col.sortable !== false && handleSort(col.key)}>
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <span className="text-slate-400">
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={activeColumns.length + 1} className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                  <span>Loading data grid records...</span>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={activeColumns.length + 1} className="py-12 text-center text-slate-400 font-medium">
                  No records found matching current view criteria.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIdx) => {
                const key = keyExtractor(row);
                const isSelected = selectedKeys.has(key);

                return (
                  <tr
                    key={key}
                    className={`transition ${
                      isSelected
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/40'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-3 text-center sticky left-0 z-10 bg-white dark:bg-slate-900">
                      <button onClick={() => toggleSelectRow(key)} className="text-slate-400">
                        {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    {activeColumns.map((col, cIdx) => (
                      <td
                        key={col.key}
                        className={`py-3 px-3 font-medium text-slate-700 dark:text-slate-200 ${
                          cIdx === 0 ? 'sticky left-10 z-10 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white' : ''
                        }`}
                      >
                        {col.render ? col.render(row, rIdx) : col.accessor ? col.accessor(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500">
        <div className="flex items-center space-x-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="font-mono text-[11px] text-slate-400">
            Showing {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} - {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <DSButton
            variant="secondary"
            size="xs"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
          >
            Previous
          </DSButton>

          <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
            Page {currentPage} of {totalPages}
          </span>

          <DSButton
            variant="secondary"
            size="xs"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
          >
            Next
          </DSButton>
        </div>
      </div>
    </div>
  );
}
