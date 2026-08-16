// Migration script: add Arabic translations to existing services
// Run with: bun run /home/z/my-project/scripts/migrate-arabic-services.ts

import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

const ARABIC_TRANSLATIONS: Record<string, { nameAr: string; descriptionAr: string }> = {
  "Underarm Laser Waxing": {
    nameAr: "إزالة الشعر بالليزر للإبط",
    descriptionAr: "تقليل دائم للشعر بالليزر لمنطقة الإبط. مناسب لجميع أنواع البشرة.",
  },
  "Full Leg Laser Waxing": {
    nameAr: "إزالة الشعر بالليزر للساقين",
    descriptionAr: "علاج كامل لإزالة شعر الساقين بالليزر. يشمل الساقين معاً.",
  },
  "Bikini Laser Waxing": {
    nameAr: "إزالة الشعر بالليزر لخط البكيني",
    descriptionAr: "إزالة شعر خط البكيني بالليزر بتقنية آمنة للبشرة الحساسة.",
  },
  "Upper Lip Waxing": {
    nameAr: "إزالة شعر الشفة العليا",
    descriptionAr: "إزالة شعر بالشمع التقليدي اللطيف لمنطقة الشفة العليا.",
  },
  "Eyebrow Shaping": {
    nameAr: "تشكيل الحواجب",
    descriptionAr: "تشكيل وصبغة الحواجب الاحترافية.",
  },
  "Hydrafacial Treatment": {
    nameAr: "علاج هيدرافيشل",
    descriptionAr: "تنظيف عميق وترطيب للبشرة للحصول على بشرة مشرقة.",
  },
  "Chemical Peel": {
    nameAr: "التقشير الكيميائي",
    descriptionAr: "تقشير كيميائي احترافي لتجديد البشرة وتحسين لونها.",
  },
  "Back Laser Waxing": {
    nameAr: "إزالة الشعر بالليزر للظهر",
    descriptionAr: "علاج كامل لإزالة شعر الظهر بالليزر.",
  },
}

async function main() {
  console.log("🌐 Adding Arabic translations to existing services...")

  const services = await db.service.findMany()
  let updated = 0

  for (const svc of services) {
    const translations = ARABIC_TRANSLATIONS[svc.name]
    if (translations && !svc.nameAr) {
      await db.service.update({
        where: { id: svc.id },
        data: {
          nameAr: translations.nameAr,
          descriptionAr: translations.descriptionAr,
        },
      })
      console.log(`  ✓ ${svc.name} → ${translations.nameAr}`)
      updated++
    }
  }

  console.log(`\n✅ Done! Updated ${updated} service(s) with Arabic translations.`)
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
