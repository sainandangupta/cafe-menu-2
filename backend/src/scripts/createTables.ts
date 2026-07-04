import prisma from '../config/database';

async function main() {
  const cafe = await prisma.cafe.findFirst();
  if (!cafe) {
    console.error('No cafe found');
    process.exit(1);
  }
  const existing = await prisma.table.count({ where: { cafe_id: cafe.id } });
  if (existing >= 8) {
    console.log('Tables already exist');
    return;
  }
  const tables = [];
  for (let i = 1; i <= 8; i++) {
    tables.push({
      table_number: i,
      is_active: true,
      cafe_id: cafe.id,
      qr_code_token: `mock-table-${i}`,
      qr_code_url: null,
    });
  }
  await prisma.table.createMany({ data: tables });
  console.log('Created 8 tables');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
