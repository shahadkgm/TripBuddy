import React from 'react';
import { Loader2 } from 'lucide-react';

interface Column<T> {
  header: string;
  key: keyof T | string;
  // Change: Added index as a second optional parameter
  render?: (item: T, index: number) => React.ReactNode; 
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, loading, emptyMessage = "No records found." }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={`px-6 py-4 text-xs font-bold text-gray-500 uppercase ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item: any, rowIndex) => (
            <tr key={item._id || rowIndex} className="hover:bg-slate-50 transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  {/* Change: Pass rowIndex to the render function */}
                  {col.render 
                    ? col.render(item, rowIndex) 
                    : (item[col.key] as React.ReactNode)
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="p-10 text-center text-gray-400">{emptyMessage}</div>
      )}
    </div>
  );
}