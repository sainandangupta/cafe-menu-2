import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tablesService } from '../../services/tables';
import { Table as CafeTable } from '../../types';

interface TableQRManagementPageProps {
  cafeId: string;
}

export const TableQRManagementPage: React.FC<TableQRManagementPageProps> = ({ cafeId }) => {
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState<CafeTable | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');

  // Queries & Mutations
  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables', cafeId],
    queryFn: () => tablesService.getTables(cafeId),
    enabled: !!cafeId,
  });

  const createMutation = useMutation({
    mutationFn: (tableNumber: number) => tablesService.createTable(tableNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', cafeId] });
      setIsAddOpen(false);
      setNewTableNumber('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tablesService.deleteTable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', cafeId] });
    },
  });

  const generateAllMutation = useMutation({
    mutationFn: () => tablesService.generateQrs(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', cafeId] });
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newTableNumber.trim(), 10);
    if (isNaN(num)) return;
    createMutation.mutate(num);
  };

  const handleDeleteConfirm = (id: string) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      deleteMutation.mutate(id);
    }
  };

  const handlePreview = (table: CafeTable) => {
    setSelectedTable(table);
    setIsPreviewOpen(true);
  };

  const handleDownload = (table: CafeTable) => {
    const scanUrl = `${window.location.origin}/menu?tableToken=${table.qr_code_token}`;
    const qrSrc = table.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(scanUrl)}`;
    
    const link = document.createElement('a');
    link.href = qrSrc;
    link.download = `table-${table.table_number}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = (table: CafeTable) => {
    const scanUrl = `${window.location.origin}/menu?tableToken=${table.qr_code_token}`;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR - Table #${table.table_number}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
            .container { border: 2px dashed #2563eb; display: inline-block; padding: 30px; border-radius: 20px; }
            img { width: 250px; height: 250px; }
            h1 { color: #2563eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>QuickCafe</h1>
            <h2>Table #${table.table_number}</h2>
            <img src="${table.qr_code_url || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(scanUrl)}" />
            <p>Scan to Browse Menu & Order</p>
          </div>
          <script>
            window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="bg-white border border-gray-250 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xs">
        <span className="text-xs font-semibold text-gray-500">
          Currently tracking <span className="text-blue-600 font-bold">{tables.length} Active Tables</span> in database.
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => generateAllMutation.mutate()}
            disabled={generateAllMutation.isPending}
            className="px-4 py-2 border border-blue-600 rounded-lg text-blue-600 font-bold text-xs bg-white hover:bg-blue-50 cursor-pointer active:scale-95 transition-all"
          >
            {generateAllMutation.isPending ? 'Generating...' : 'Generate All QRs'}
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="btn-primary-blue py-2 px-4"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add Table
          </button>
        </div>
      </div>

      {/* Grid listing & Sidebar details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Tables list (2/3 width) */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 font-semibold">Syncing physical tables inventory...</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-250 rounded-xl overflow-hidden shadow-xs">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Table #</th>
                    <th>QR Code Preview</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((record) => {
                    const scanUrl = `${window.location.origin}/menu?tableToken=${record.qr_code_token}`;
                    const qrSrc = record.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(scanUrl)}`;
                    return (
                      <tr key={record.id}>
                        <td className="font-bold text-sm text-gray-800">Table #{record.table_number}</td>
                        <td>
                          <div
                            onClick={() => handlePreview(record)}
                            className="w-12 h-12 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center p-1 bg-white cursor-pointer hover:border-blue-600 hover:shadow-xs transition-all"
                          >
                            <img src={qrSrc} alt={`Table ${record.table_number} QR`} className="w-full h-full object-contain" />
                          </div>
                        </td>
                        <td>
                          {record.is_active ? (
                            <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5 font-bold uppercase">Active</span>
                          ) : (
                            <span className="text-[10px] bg-gray-50 text-gray-400 border border-gray-200 rounded-full px-2.5 py-0.5 font-bold uppercase">Inactive</span>
                          )}
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePreview(record)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 bg-transparent border-none cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-base">visibility</span>
                            </button>
                            <button
                              onClick={() => handleDownload(record)}
                              className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-50 bg-transparent border-none cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-base">download</span>
                            </button>
                            <button
                              onClick={() => handlePrint(record)}
                              className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-50 bg-transparent border-none cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-base">print</span>
                            </button>
                            <button
                              onClick={() => handleDeleteConfirm(record.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 bg-transparent border-none cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Batch Printing Info Card (1/3 width) */}
        <div className="bg-white border border-gray-250 rounded-xl p-5 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl">print</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Batch Printing</h4>
            <p className="text-[10px] text-gray-400 mt-1">Ready to print labels for all {tables.length} tables.</p>
          </div>
          <button
            onClick={() => window.print()}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg border-none cursor-pointer active:scale-95 transition-transform"
          >
            Setup Print Job
          </button>
        </div>
      </div>

      {/* QR Code Preview Modal */}
      {isPreviewOpen && selectedTable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col">
            <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-sm font-bold">QR Preview: T-{selectedTable.table_number}</h2>
              <button
                onClick={() => {
                  setSelectedTable(null);
                  setIsPreviewOpen(false);
                }}
                className="text-white hover:bg-white/10 p-1 rounded-full bg-transparent border-none cursor-pointer flex items-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </header>

            <div className="p-6 flex flex-col items-center space-y-6">
              <div className="w-48 h-48 border border-gray-200 rounded-xl overflow-hidden p-2 bg-white flex items-center justify-center">
                <img
                  src={
                    selectedTable.qr_code_url ||
                    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                      `${window.location.origin}/menu?tableToken=${selectedTable.qr_code_token}`
                    )}`
                  }
                  alt={`Table ${selectedTable.table_number} QR`}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Dynamic URL Copy Area */}
              <div className="w-full text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Dynamic URL</label>
                <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-2 items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-mono truncate max-w-[240px]">
                    {window.location.origin}/menu?tableToken={selectedTable.qr_code_token}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/menu?tableToken=${selectedTable.qr_code_token}`);
                      alert('Link copied to clipboard!');
                    }}
                    className="text-gray-400 hover:text-blue-600 bg-transparent border-none cursor-pointer flex items-center"
                  >
                    <span className="material-symbols-outlined text-base">content_copy</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={() => handleDownload(selectedTable)}
                  className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs border-none cursor-pointer active:scale-95 transition-transform flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download PNG
                </button>
                <button
                  onClick={() => handlePrint(selectedTable)}
                  className="py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-bold text-xs cursor-pointer active:scale-95 transition-transform flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  Print Stand
                </button>
              </div>
            </div>

            <footer className="bg-gray-50 px-6 py-3 text-center border-t border-gray-150">
              <p className="text-[10px] text-gray-400">QR codes are dynamically linked and do not expire.</p>
            </footer>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-sm font-bold">Add New Table</h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-white hover:bg-white/10 p-1 rounded-full bg-transparent border-none cursor-pointer flex items-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </header>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Table Number
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 5"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary-blue py-2 px-5 text-xs flex items-center gap-1.5"
                >
                  {createMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm font-bold">save</span>
                      Create Table
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableQRManagementPage;
