import React from 'react';
import { Loader2 } from 'lucide-react';

interface Column<T> {
  header: string;
  key: keyof T | string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id?: string; _id?: string }>({
  columns,
  data,
  loading,
  emptyMessage = 'No records found.',
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className={`px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item, rowIndex) => (
            <tr
              key={item.id || item._id || rowIndex}
              className="hover:bg-slate-50 transition-colors"
            >
              {columns.map((col, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-6 py-4 align-top text-sm text-gray-700 ${col.className || ''}`}
                >
                  {col.render
                    ? col.render(item, rowIndex)
                    : (item[col.key as keyof T] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="p-10 text-center text-gray-400 text-sm">{emptyMessage}</div>
      )}
    </div>
  );
}