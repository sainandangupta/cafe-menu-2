import React from 'react';
import { Order } from '../../types';

interface InvoiceModalProps {
  order: Order | null;
  visible: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, visible, onClose }) => {
  if (!order || !visible) return null;

  // Format Date (e.g. 18 May 2025)
  const placedDate = order.placed_at ? new Date(order.placed_at) : new Date(order.created_at);
  const formattedDate = placedDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Format Time (e.g. 01:24 PM)
  const formattedTime = placedDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Invoice Number (e.g. BC-T04A96 or BC2505187)
  const invoiceNo = `BC${order.order_token || order.id.substring(0, 6).toUpperCase()}`;

  // Table Number formatted as T-05
  const tableNo = `T-${String(order.table?.table_number || order.table_number || 5).padStart(2, '0')}`;

  const subtotal = order.subtotal;
  const cgst = subtotal * 0.025;
  const sgst = subtotal * 0.025;
  const grandTotal = subtotal + cgst + sgst;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-start justify-center z-50 p-4 overflow-y-auto print-invoice-modal-backdrop">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col my-8 border border-gray-150 print-invoice-modal-card">
        {/* Modal Controls */}
        <div className="flex justify-between items-center bg-gray-50 px-6 py-3.5 border-b border-gray-200 no-print">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Receipt Preview</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 border-none cursor-pointer shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              Print
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* The Printable Invoice Wrapper */}
        <div id="printable-invoice" className="flex-1 bg-[#faf8f5] p-8 text-[#3d2314] font-mono select-text flex flex-col items-center">
          {/* Print specific CSS */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              @page {
                size: auto;
                margin: 0mm;
              }
              body {
                background: white !important;
                color: black !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              /* Hide all main layout wrapper components to prevent multiple blank pages */
              .owner-sidebar,
              .flex-1.ml-\\[240px\\],
              header,
              aside,
              main,
              .no-print,
              .print-invoice-modal-backdrop > :not(.print-invoice-modal-card) {
                display: none !important;
                height: 0 !important;
                overflow: hidden !important;
              }
              /* Force print backdrop and card to occupy full viewport flatly */
              .print-invoice-modal-backdrop {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: auto !important;
                min-height: 100% !important;
                background: white !important;
                display: block !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .print-invoice-modal-card {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                box-shadow: none !important;
                border: none !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
              #printable-invoice {
                width: 100% !important;
                max-width: 100% !important;
                background: white !important;
                color: black !important;
                padding: 20mm !important; /* Safe padding since @page margin is 0 */
                box-shadow: none !important;
                border: none !important;
                margin: 0 !important;
              }
            }
          `}} />

          {/* Logo Section */}
          <div className="w-full text-center space-y-2 mb-4">
            <img src="/logo.jpeg" alt="Logo" className="w-32 h-32 mx-auto rounded-full object-cover border border-gray-200 shadow-sm" />
          </div>

          <div className="w-full border-t border-dashed border-[#3d2314]/30 my-2"></div>

          {/* Cafe Address */}
          <div className="w-full text-center text-xs space-y-0.5 leading-relaxed">
            <p className="font-bold">BUCKS CAFE</p>
            <p>Balaji colony near, Aims school,</p>
            <p>ashagram road barwani - 451551</p>
            <p>Ph: +91 89822 93906</p>
            <p>Email: jaymuvel1@gmail.com</p>
          </div>

          <div className="w-full border-t border-dashed border-[#3d2314]/30 my-2"></div>

          {/* Invoice Label */}
          <div className="w-full text-center text-sm font-bold tracking-widest uppercase my-1">
            INVOICE
          </div>

          {/* Metadata Grid */}
          <div className="w-full grid grid-cols-2 gap-y-1 text-[11px] leading-tight mt-1">
            <div className="flex gap-1.5">
              <span className="w-20 inline-block font-semibold">Invoice No</span>
              <span>: {invoiceNo}</span>
            </div>
            <div className="flex gap-1.5">
              <span className="w-12 inline-block font-semibold">Date</span>
              <span>: {formattedDate}</span>
            </div>
            <div className="flex gap-1.5">
              <span className="w-20 inline-block font-semibold">Time</span>
              <span>: {formattedTime}</span>
            </div>
            <div className="flex gap-1.5">
              <span className="w-12 inline-block font-semibold">Table No</span>
              <span>: {tableNo}</span>
            </div>
            <div className="flex gap-1.5">
              <span className="w-20 inline-block font-semibold">Bill By</span>
              <span>: Cashier</span>
            </div>
          </div>

          <div className="w-full border-t border-dashed border-[#3d2314]/30 my-3"></div>

          {/* Items Header */}
          <div className="w-full grid grid-cols-12 text-[11px] font-bold pb-1 border-b border-[#3d2314]/30">
            <span className="col-span-6">ITEM</span>
            <span className="col-span-2 text-center">QTY</span>
            <span className="col-span-2 text-right">PRICE (₹)</span>
            <span className="col-span-2 text-right">AMOUNT (₹)</span>
          </div>

          {/* Items List */}
          <div className="w-full text-[11px] py-2 space-y-2">
            {order.order_items?.map((item, idx) => {
              const itemPrice = item.price;
              const itemAmount = itemPrice * item.quantity;
              return (
                <div key={item.id || idx} className="grid grid-cols-12 leading-tight">
                  <span className="col-span-6 truncate font-medium">
                    {idx + 1}. {item.dish?.name || 'Dish Item'}
                  </span>
                  <span className="col-span-2 text-center">{item.quantity}</span>
                  <span className="col-span-2 text-right">{itemPrice.toFixed(2)}</span>
                  <span className="col-span-2 text-right">{itemAmount.toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <div className="w-full border-t border-[#3d2314]/30 my-2"></div>

          {/* Calculations Summary */}
          <div className="w-full text-right text-[11px] space-y-1.5 pr-1">
            <div className="flex justify-between pl-20">
              <span className="font-semibold text-right flex-grow">Subtotal</span>
              <span className="w-24 font-medium">₹ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pl-20">
              <span className="font-semibold text-right flex-grow">CGST (2.5%)</span>
              <span className="w-24 font-medium">₹ {cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pl-20">
              <span className="font-semibold text-right flex-grow">SGST (2.5%)</span>
              <span className="w-24 font-medium">₹ {sgst.toFixed(2)}</span>
            </div>

            <div className="w-full border-t border-dashed border-[#3d2314]/30 my-1"></div>

            <div className="flex justify-between pl-20 text-xs font-bold">
              <span className="text-right flex-grow uppercase tracking-wider">GRAND TOTAL</span>
              <span className="w-24 text-right">₹ {grandTotal.toFixed(2)}</span>
            </div>
            <p className="text-[9px] italic text-[#3d2314]/70 mt-0.5">(Inclusive of all taxes)</p>
          </div>

          <div className="w-full border-t border-dashed border-[#3d2314]/30 my-3"></div>

          {/* Footer message matching WhatsApp image */}
          <div className="w-full text-center space-y-1 my-1">
            <p className="text-sm font-semibold">Thank you! ♡</p>
            <p className="text-[10px]">We hope to see you again!</p>
          </div>


        </div>
      </div>
    </div>
  );
};
