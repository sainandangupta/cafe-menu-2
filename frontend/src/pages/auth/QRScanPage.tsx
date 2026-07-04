import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { tablesService } from '../../services/tables';
import { useCart } from '../../hooks/useCart';

// Mock parser for demo/dev
const parseMockToken = (token: string): { table_id: string; cafe_id: string; table_number: number; cafe_name: string } | null => {
  const match = token.match(/(\d+)/);
  if (match) {
    const tableNumber = parseInt(match[1], 10);
    return {
      table_id: `mock-table-${tableNumber}`,
      cafe_id: 'mock-cafe-id',
      table_number: tableNumber,
      cafe_name: 'Bucks Cafe',
    };
  }
  return null;
};

export const QRScanPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTableContext, tableContext } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [isValidated, setIsValidated] = useState(false);

  const tokenParam = searchParams.get('tableToken') || searchParams.get('token');

  const validateToken = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await tablesService.validateToken(token);
      setTableContext({
        tableId: data.table_id,
        tableNumber: data.table_number,
        cafeId: data.cafe_id,
        cafeName: data.cafe_name,
        tableToken: token,
      });
      setIsValidated(true);
    } catch (err: any) {
      console.warn('API validation failed, trying offline mock mode:', err.message);
      const mockData = parseMockToken(token);
      if (mockData) {
        setTableContext({
          tableId: mockData.table_id,
          tableNumber: mockData.table_number,
          cafeId: mockData.cafe_id,
          cafeName: mockData.cafe_name,
          tableToken: token,
        });
        setIsValidated(true);
      } else {
        setError('Invalid or expired QR code. Please scan again or ask for assistance.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenParam) {
      validateToken(tokenParam);
    } else if (tableContext.tableToken && tableContext.tableNumber) {
      setIsValidated(true);
    }
  }, [tokenParam]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    validateToken(manualToken.trim());
  };

  const handleBrowseMenu = () => {
    const token = tokenParam || tableContext.tableToken;
    navigate(token ? `/menu?tableToken=${token}` : '/menu');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9ff]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#006e2f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Verifying table context...</p>
        </div>
      </div>
    );
  }

  // Render the beautiful welcome screen once table token is verified
  if (isValidated) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex flex-col max-w-[480px] mx-auto relative pb-8">
        <header className="flex justify-between items-center px-4 h-12 bg-white border-b border-gray-150">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006e2f]">restaurant</span>
            <span className="text-lg font-bold text-[#006e2f]">Bucks Cafe</span>
          </div>
          <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 rounded-full object-cover border border-gray-100" />
        </header>

        <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 text-center">
          {/* Hero Image */}
          <div className="relative z-0 w-full max-w-sm mb-6">
            <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-10">
              <img
                className="w-full h-full object-cover"
                alt="Cafe wood table with QR stand mockup"
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"
              />
              <div className="absolute top-4 right-4 bg-[#006e2f] text-white px-3.5 py-1 rounded-full font-bold text-xs shadow-md">
                Table #{tableContext.tableNumber}
              </div>
            </div>
            {/* Depth shadow element */}
            <div className="absolute -bottom-2 -right-2 w-full h-full bg-gray-200 border border-gray-300 rounded-2xl -z-10"></div>
          </div>

          {/* Typography */}
          <div className="max-w-xs space-y-2 mb-8">
            <h2 className="text-xl font-bold text-gray-900">Welcome to {tableContext.cafeName || 'Bucks Cafe'}</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              You're checked in at <span className="font-bold text-gray-800">Table #{tableContext.tableNumber}</span>. Browse our curated selection and order directly from your device.
            </p>
          </div>

          {/* Actions */}
          <div className="w-full max-w-xs space-y-3">
            <button
              onClick={handleBrowseMenu}
              className="w-full h-12 bg-[#006e2f] hover:bg-[#006e2f]/95 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-95 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-lg">menu_book</span>
              Browse Menu
            </button>
            <button
              onClick={handleBrowseMenu}
              className="w-full h-12 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-lg">receipt_long</span>
              Quick Reorder
            </button>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-sm">
            <div className="p-3.5 bg-white border border-gray-200 rounded-xl text-left">
              <span className="material-symbols-outlined text-[#006e2f] mb-1">speed</span>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Estimated Prep</p>
              <p className="text-xs font-bold text-gray-800 mt-0.5">8-12 mins</p>
            </div>
            <div className="p-3.5 bg-white border border-gray-200 rounded-xl text-left">
              <span className="material-symbols-outlined text-[#fea619] mb-1">stars</span>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Member Perks</p>
              <p className="text-xs font-bold text-gray-800 mt-0.5">2x Points</p>
            </div>
          </div>
        </main>

        <footer className="mt-auto px-4 py-4 flex flex-col items-center gap-1.5 border-t border-gray-200 bg-white">
          <p className="text-[10px] text-gray-400 font-semibold">Need assistance? Contact us</p>
          <div className="flex flex-col items-center gap-1.5 mt-0.5">
            <a className="flex items-center gap-1 text-[#006e2f] font-bold text-xs hover:underline" href="tel:+918982293906">
              <span className="material-symbols-outlined text-sm font-bold">call</span>
              +91 89822 93906
            </a>
            <a className="flex items-center gap-1 text-[#006e2f] font-bold text-xs hover:underline" href="mailto:jaymuvel1@gmail.com">
              <span className="material-symbols-outlined text-sm font-bold">mail</span>
              jaymuvel1@gmail.com
            </a>
          </div>
        </footer>
      </div>
    );
  }

  // Pre-validated QR scan page
  return (
    <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm max-w-sm w-full p-8 text-center space-y-6">
        <div>
          <div className="w-16 h-16 bg-[#006e2f]/5 text-[#006e2f] flex items-center justify-center rounded-full mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl font-bold">qr_code_scanner</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800">Scan Table QR Code</h2>
          <p className="text-xs text-gray-400 mt-1">Please scan the QR code located on your table to start ordering.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-150 text-red-700 text-xs px-4 py-2.5 rounded-xl text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleManualSubmit} className="pt-4 border-t border-gray-100 space-y-4">
          <div className="text-left">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Or Enter Table Number/Token manually
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 4 or table_token_4"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="input-field py-2 text-xs"
              />
              <button type="submit" className="btn-primary-green w-auto py-2 px-4 text-xs h-10">
                Go
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QRScanPage;
