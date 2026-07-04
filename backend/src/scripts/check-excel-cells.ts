import * as XLSX from 'xlsx';
import * as path from 'path';

async function main() {
  const filePath = path.join(__dirname, '../../../BBucks_Menu.xlsx');
  
  try {
    const workbook = XLSX.readFile(filePath);
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      console.log(`Checking sheet: ${sheetName}`);
      for (const cellAddress in sheet) {
        if (cellAddress.startsWith('!')) continue;
        const cell = sheet[cellAddress];
        if (cell && cell.v) {
          const valStr = String(cell.v);
          if (valStr.includes('451551') || valStr.toLowerCase().includes('address') || valStr.toLowerCase().includes('phone') || valStr.toLowerCase().includes('email') || valStr.includes('@')) {
            console.log(`Found cell ${cellAddress} in sheet "${sheetName}": ${valStr}`);
          }
        }
      }
    }
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

main();
