import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import prisma from '../config/database';
import logger from '../utils/logger';
import { getIngredients } from '../utils/ingredientGenerator';

async function main() {
  const excelPath = path.join(__dirname, '../../../BBucks_Menu.xlsx');
  const unzippedDir = path.join(__dirname, '../../../temp_excel_unzipped');
  const uploadsDir = path.join(__dirname, '../../uploads');

  logger.info(`Loading menu from Excel file: ${excelPath}`);

  try {
    // 1. Check if we have at least one cafe
    let cafe = await prisma.cafe.findFirst();
    if (!cafe) {
      logger.info('No cafe found in database. Creating default "Bucks Cafe"...');
      cafe = await prisma.cafe.create({
        data: {
          id: '00000000-0000-0000-0000-000000000000',
          name: 'Bucks Cafe',
          email: 'info@buckscafe.com',
          phone: '123-456-7890',
          address: '123 Coffee Lane, Seattle, WA',
        }
      });
    }

    const cafeId = cafe.id;
    logger.info(`Target Cafe: "${cafe.name}" (ID: ${cafeId})`);

    // Clear existing dishes and categories for this cafe first to ensure a clean re-import
    logger.info('Clearing existing categories and dishes for a clean import...');
    await prisma.dish.deleteMany({ where: { cafe_id: cafeId } });
    await prisma.category.deleteMany({ where: { cafe_id: cafeId } });
    logger.info('Existing categories and dishes cleared successfully.');

    // 2. Parse drawing XML to build Row -> Image mapping
    const rowImageMap = new Map<number, string>(); // 0-indexed row number -> image filename
    const drawingXmlPath = path.join(unzippedDir, 'xl/drawings/drawing1.xml');
    const relsPath = path.join(unzippedDir, 'xl/drawings/_rels/drawing1.xml.rels');

    if (fs.existsSync(drawingXmlPath) && fs.existsSync(relsPath)) {
      logger.info('Excel drawing files found. Extracting image mappings...');
      
      // Read relationships
      const relsContent = fs.readFileSync(relsPath, 'utf8');
      const relMap = new Map<string, string>(); // rId -> filename
      const relRegex = /Relationship\s+Id="([^"]+)"\s+Type="[^"]+"\s+Target="\.\.\/media\/([^"]+)"/g;
      let relMatch;
      while ((relMatch = relRegex.exec(relsContent)) !== null) {
        relMap.set(relMatch[1], relMatch[2]);
      }

      // Read drawings XML
      const xmlContent = fs.readFileSync(drawingXmlPath, 'utf8');
      const anchorRegex = /<xdr:(oneCellAnchor|twoCellAnchor)[^>]*>([\s\S]*?)<\/xdr:\1>/g;
      let anchorMatch;

      // Ensure uploads directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      while ((anchorMatch = anchorRegex.exec(xmlContent)) !== null) {
        const anchorXml = anchorMatch[2];
        const colMatch = anchorXml.match(/<xdr:col>(\d+)<\/xdr:col>/);
        const rowMatch = anchorXml.match(/<xdr:row>(\d+)<\/xdr:row>/);
        const embedMatch = anchorXml.match(/r:embed="([^"]+)"/);

        if (colMatch && rowMatch && embedMatch) {
          const row = parseInt(rowMatch[1]);
          const rId = embedMatch[1];
          const filename = relMap.get(rId);
          if (filename) {
            rowImageMap.set(row, filename);

            // Copy image file from unzipped media folder to backend uploads directory
            const srcPath = path.join(unzippedDir, 'xl/media', filename);
            const destPath = path.join(uploadsDir, filename);
            if (fs.existsSync(srcPath)) {
              fs.copyFileSync(srcPath, destPath);
            }
          }
        }
      }
      logger.info(`Successfully mapped and copied ${rowImageMap.size} image files.`);
    } else {
      logger.warn('Excel drawing files not found. Continuing without images.');
    }

    // 3. Read the workbook
    const workbook = XLSX.readFile(excelPath);
    const sheetName = 'Menu';
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error(`Sheet named "${sheetName}" not found in workbook.`);
    }

    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    logger.info(`Found ${data.length} rows`);

    const categoryCache = new Map<string, string>(); // categoryName -> categoryId

    let dishesImported = 0;
    let categoriesImported = 0;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row) continue;

      const categoryName = row[0] ? String(row[0]).trim() : '';
      const dishName = row[1] ? String(row[1]).trim() : '';
      const priceStr = row[2] ? String(row[2]).trim() : '';

      if (!categoryName || !dishName || !priceStr) {
        continue;
      }

      const cleanPriceStr = priceStr.replace(/Rs\.?/i, '').replace(/[^0-9.]/g, '');
      const cleanPrice = parseFloat(cleanPriceStr);
      if (isNaN(cleanPrice)) {
        logger.warn(`Row ${i + 1}: Skipping dish "${dishName}" due to invalid price "${priceStr}"`);
        continue;
      }

      // Find or create Category
      let categoryId = categoryCache.get(categoryName);
      if (!categoryId) {
        let category = await prisma.category.findFirst({
          where: {
            cafe_id: cafeId,
            name: {
              equals: categoryName,
              mode: 'insensitive',
            }
          }
        });

        if (!category) {
          category = await prisma.category.create({
            data: {
              cafe_id: cafeId,
              name: categoryName,
              display_order: categoryCache.size + 1,
            }
          });
          categoriesImported++;
        }
        categoryId = category.id;
        categoryCache.set(categoryName, categoryId);
      }

      // Check if image exists for this row
      let imageUrl: string | undefined = undefined;
      const mappedImage = rowImageMap.get(i);
      if (mappedImage) {
        // Points to our static file server URL (uses process.env.BACKEND_URL in production, otherwise defaults to local)
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        imageUrl = `${baseUrl}/uploads/${mappedImage}`;
      }

      // Create Dish
      await prisma.dish.create({
        data: {
          cafe_id: cafeId,
          category_id: categoryId,
          name: dishName,
          price: cleanPrice,
          ingredients: getIngredients(dishName, categoryName),
          image_url: imageUrl,
          is_available: true,
          is_veg: true,
        }
      });
      dishesImported++;
    }

    logger.info('--- Import Summary ---');
    logger.info(`Successfully created ${categoriesImported} new categories.`);
    logger.info(`Successfully imported ${dishesImported} new dishes with mapped images.`);
    logger.info(`Active categories in system: ${categoryCache.size}`);
  } catch (error) {
    logger.error('Failed to import Excel menu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
