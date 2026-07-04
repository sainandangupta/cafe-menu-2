import React from 'react';
import { Modal, Button, Space, message, Divider } from 'antd';
import { CopyOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { Table } from '../../types';

interface QRPreviewModalProps {
  table: Table | null;
  visible: boolean;
  onClose: () => void;
}

export const QRPreviewModal: React.FC<QRPreviewModalProps> = ({
  table,
  visible,
  onClose,
}) => {
  if (!table) return null;

  const scanUrl = `${window.location.origin}/menu?tableToken=${table.qr_code_token}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(scanUrl);
    message.success('QR Code Table URL copied to clipboard!');
  };

  const handleDownload = () => {
    if (!table.qr_code_url) {
      message.error('QR code image is not available for download.');
      return;
    }
    // Create a temporary anchor to download the image file
    const link = document.createElement('a');
    link.href = table.qr_code_url;
    link.download = `table-${table.table_number}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    // Open a new print-friendly page with just the QR code
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      message.error('Popup blocker prevented opening print window.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - Table #${table.table_number}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 40px;
            }
            .qr-container {
              border: 2px dashed #ccc;
              display: inline-block;
              padding: 30px;
              border-radius: 20px;
              background-color: #fff;
            }
            .qr-image {
              width: 300px;
              height: 300px;
            }
            h1 {
              color: #006e2f;
              margin-bottom: 5px;
            }
            h2 {
              color: #555;
              margin-top: 0;
            }
            .instructions {
              margin-top: 20px;
              font-size: 14px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>QuickCafe</h1>
            <h2>Table #${table.table_number}</h2>
            <img class="qr-image" src="${table.qr_code_url || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(scanUrl)}" alt="QR Code" />
            <p class="instructions">Scan to browse our menu and place your order!</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const qrSrc = table.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(scanUrl)}`;

  return (
    <Modal
      title={<span className="text-lg font-bold text-gray-900">Table #{table.table_number} QR Code Details</span>}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      centered
      width={400}
    >
      <div className="flex flex-col items-center py-6 text-center">
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm mb-4">
          <img
            src={qrSrc}
            alt={`Table ${table.table_number} QR`}
            className="w-56 h-56 object-contain rounded-lg"
          />
        </div>
        
        <p className="text-sm font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-150 mb-4">
          Table #{table.table_number} Active QR Link
        </p>

        <p className="text-xs text-gray-500 font-medium break-all px-4 max-w-sm mb-6 select-all border border-gray-100 bg-gray-50/50 p-2 rounded">
          {scanUrl}
        </p>

        <Divider style={{ margin: '0 0 16px 0' }} />

        <Space size="middle" className="w-full justify-center">
          <Button icon={<CopyOutlined />} onClick={handleCopyLink} className="font-semibold text-gray-600">
            Copy Link
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleDownload} type="dashed" className="font-semibold text-gray-600">
            Download
          </Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrint} type="primary" className="bg-emerald-700 hover:bg-emerald-800 font-semibold">
            Print
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default QRPreviewModal;
