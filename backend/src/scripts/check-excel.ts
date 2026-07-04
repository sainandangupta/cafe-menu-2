import * as XLSX from 'xlsx';
import * as path from 'path';

async function main() {
  const filePath = path.join(__dirname, '../../../BBucks_Menu.xlsx');
  console.log('Loading Excel file from:', filePath);
  
  try {
    const workbook = XLSX.readFile(filePath);
    console.log('Sheet names:', workbook.SheetNames);
    
    // Look at each sheet to see if there is any address/contact information
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet) as any[];
      console.log(`Sheet "${sheetName}" has ${rows.length} rows.`);
      
      // Print first 5 rows to see what is there
      if (rows.length > 0) {
        console.log('Sample rows:', rows.slice(0, 3));
      }
      
      // Search for any columns or cells containing "451551" or "address" or "phone" or "email"
      for (const row of rows) {
        const rowStr = JSON.stringify(row);
        if (rowStr.includes('451551') || rowStr.toLowerCase().includes('address') || rowStr.toLowerCase().includes('phone') || rowStr.toLowerCase().includes('email')) {
          console.log(`Found match in sheet "${sheetName}":`, row);
        }
      }
    }
  } catch (err: any) {
    console.error('Error reading Excel:', err.message);
  }
}

main();
