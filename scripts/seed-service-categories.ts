// One-off migration script: create default ServiceCategory rows
// and link existing services to them based on their legacy `category` string.
//
// Run with: bun run /home/z/my-project/scripts/seed-service-categories.ts

import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

const DEFAULT_CATEGORIES = [
  { name: "Waxing", color: "oklch(0.72 0.15 50)" },
  { name: "Laser", color: "oklch(0.65 0.20 350)" },
  { name: "Skincare", color: "oklch(0.55 0.13 160)" },
  { name: "Other", color: "oklch(0.55 0.02 350)" },
]

async function main() {
  console.log("🌱 Seeding service categories...")

  for (const c of DEFAULT_CATEGORIES) {
    const cat = await db.serviceCategory.upsert({
      where: { name: c.name },
      update: { color: c.color },
      create: c,
    })
    console.log(`  ✓ Category: ${cat.name} (${cat.id})`)

    // Link existing services with matching legacy category string
    const services = await db.service.findMany({
      where: { category: c.name, categoryId: null },
    })
    for (const svc of services) {
      await db.service.update({
        where: { id: svc.id },
        data: { categoryId: cat.id },
      })
    }
    if (services.length > 0) {
      console.log(`    → Linked ${services.length} service(s)`)
    }
  }

  // Also create categories for any legacy labels that don't match defaults
  const allLegacyCats = await db.service.findMany({
    where: { categoryId: null },
    select: { category: true },
    distinct: ["category"],
  })
  for (const { category } of allLegacyCats) {
    if (!category) continue
    const cat = await db.serviceCategory.upsert({
      where: { name: category },
      update: {},
      create: { name: category },
    })
    await db.service.updateMany({
      where: { category, categoryId: null },
      data: { categoryId: cat.id },
    })
    console.log(`  ✓ Migrated legacy category: ${category}`)
  }

  console.log("\n✅ Done!")
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
