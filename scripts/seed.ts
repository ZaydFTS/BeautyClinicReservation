// Seed script - populate DB with demo data for the beauty clinic
// Run with: bun run /home/z/my-project/scripts/seed.ts

import { PrismaClient } from "@prisma/client"
import { hashPassword } from "../src/lib/auth"
import { DEFAULT_ADMIN, SLOT_STATUS, APPOINTMENT_STATUS, ORDER_STATUS } from "../src/lib/constants"

const db = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // 1. Admin user
  const admin = await db.adminUser.upsert({
    where: { email: DEFAULT_ADMIN.email },
    update: {},
    create: {
      email: DEFAULT_ADMIN.email,
      passwordHash: hashPassword(DEFAULT_ADMIN.password),
      name: DEFAULT_ADMIN.name,
      role: "SUPER_ADMIN",
    },
  })
  console.log("  ✓ Admin user:", admin.email)

  // 2. Services
  const services = await Promise.all([
    db.service.create({
      data: {
        name: "Underarm Laser Waxing",
        description: "Permanent laser hair reduction for underarm area. Suitable for all skin types.",
        price: 80,
        durationMin: 30,
        category: "Laser",
      },
    }),
    db.service.create({
      data: {
        name: "Full Leg Laser Waxing",
        description: "Complete leg laser hair removal treatment. Includes both legs.",
        price: 250,
        durationMin: 90,
        category: "Laser",
      },
    }),
    db.service.create({
      data: {
        name: "Bikini Laser Waxing",
        description: "Bikini line laser hair removal with sensitive-skin-safe technology.",
        price: 150,
        durationMin: 45,
        category: "Laser",
      },
    }),
    db.service.create({
      data: {
        name: "Upper Lip Waxing",
        description: "Gentle traditional waxing for the upper lip area.",
        price: 25,
        durationMin: 15,
        category: "Waxing",
      },
    }),
    db.service.create({
      data: {
        name: "Eyebrow Shaping",
        description: "Professional eyebrow shaping and tinting.",
        price: 35,
        durationMin: 30,
        category: "Waxing",
      },
    }),
    db.service.create({
      data: {
        name: "Hydrafacial Treatment",
        description: "Deep cleansing and hydration facial for glowing skin.",
        price: 180,
        durationMin: 60,
        category: "Skincare",
      },
    }),
    db.service.create({
      data: {
        name: "Chemical Peel",
        description: "Professional chemical peel for skin renewal and tone improvement.",
        price: 220,
        durationMin: 75,
        category: "Skincare",
      },
    }),
    db.service.create({
      data: {
        name: "Back Laser Waxing",
        description: "Full back laser hair removal treatment.",
        price: 200,
        durationMin: 60,
        category: "Laser",
      },
    }),
  ])
  console.log(`  ✓ ${services.length} services`)

  // 3. Time slots - generate 14 days of slots for each service
  const now = new Date()
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date(now)
    date.setDate(date.getDate() + dayOffset)
    date.setHours(0, 0, 0, 0)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0) continue // skip Sundays

    for (const service of services) {
      const slotTimes = [9, 12, 15, 17]
      for (const hour of slotTimes) {
        const start = new Date(date)
        start.setHours(hour, 0, 0, 0)
        const end = new Date(start)
        end.setMinutes(end.getMinutes() + service.durationMin)

        if (end.getHours() > 19) continue

        const isBlocked = Math.random() < 0.1 && dayOffset > 0

        await db.slot.create({
          data: {
            serviceId: service.id,
            startTime: start,
            endTime: end,
            capacity: 1,
            status: isBlocked ? SLOT_STATUS.BLOCKED : SLOT_STATUS.AVAILABLE,
            note: isBlocked ? "Practitioner unavailable" : null,
          },
        })
      }
    }
  }
  console.log("  ✓ Time slots (14 days)")

  // 4. Product categories
  const categories = await Promise.all([
    db.productCategory.create({ data: { name: "Skincare" } }),
    db.productCategory.create({ data: { name: "Aftercare" } }),
    db.productCategory.create({ data: { name: "Tools" } }),
    db.productCategory.create({ data: { name: "Bundles" } }),
  ])
  console.log(`  ✓ ${categories.length} product categories`)

  // 5. Products
  const products = await Promise.all([
    db.product.create({
      data: {
        name: "Soothing Aloe Gel",
        description: "Post-waxing soothing gel with pure aloe vera and chamomile extract.",
        price: 28,
        cost: 9,
        stock: 45,
        lowStockAt: 10,
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
        categoryId: categories[1].id,
      },
    }),
    db.product.create({
      data: {
        name: "Vitamin C Serum",
        description: "Brightening serum with 15% vitamin C and hyaluronic acid.",
        price: 65,
        cost: 22,
        stock: 28,
        lowStockAt: 8,
        imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
        categoryId: categories[0].id,
      },
    }),
    db.product.create({
      data: {
        name: "Exfoliating Mitt",
        description: "Premium exfoliating mitt for preventing ingrown hairs.",
        price: 18,
        cost: 5,
        stock: 4,
        lowStockAt: 5,
        imageUrl: "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=400&q=80",
        categoryId: categories[2].id,
      },
    }),
    db.product.create({
      data: {
        name: "Numbing Cream 5%",
        description: "Topical numbing cream to reduce discomfort during treatments.",
        price: 42,
        cost: 14,
        stock: 60,
        lowStockAt: 15,
        imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&q=80",
        categoryId: categories[1].id,
      },
    }),
    db.product.create({
      data: {
        name: "Sunscreen SPF 50+",
        description: "Mineral sunscreen designed for sensitive post-treatment skin.",
        price: 38,
        cost: 12,
        stock: 3,
        lowStockAt: 8,
        imageUrl: "https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=400&q=80",
        categoryId: categories[0].id,
      },
    }),
    db.product.create({
      data: {
        name: "Complete Aftercare Bundle",
        description: "Bundle: Aloe Gel + Exfoliating Mitt + Sunscreen. Save 15%.",
        price: 75,
        cost: 26,
        stock: 20,
        lowStockAt: 5,
        imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80",
        categoryId: categories[3].id,
      },
    }),
    db.product.create({
      data: {
        name: "LED Facial Mask",
        description: "At-home LED light therapy mask for collagen boost.",
        price: 220,
        cost: 95,
        stock: 12,
        lowStockAt: 3,
        imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80",
        categoryId: categories[2].id,
      },
    }),
    db.product.create({
      data: {
        name: "Gentle Cleanser",
        description: "pH-balanced cleanser for post-treatment sensitive skin.",
        price: 32,
        cost: 10,
        stock: 50,
        lowStockAt: 10,
        imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80",
        categoryId: categories[0].id,
      },
    }),
  ])
  console.log(`  ✓ ${products.length} products`)

  // 6. Customers
  const customers = await Promise.all([
    db.customer.create({ data: { name: "Sarah Johnson", phone: "+1 (555) 234-5678", email: "sarah.j@example.com" } }),
    db.customer.create({ data: { name: "Emily Davis", phone: "+1 (555) 345-6789", email: "emily.d@example.com" } }),
    db.customer.create({ data: { name: "Olivia Martinez", phone: "+1 (555) 456-7890", email: "olivia.m@example.com" } }),
    db.customer.create({ data: { name: "Sophia Wilson", phone: "+1 (555) 567-8901" } }),
    db.customer.create({ data: { name: "Isabella Brown", phone: "+1 (555) 678-9012", email: "isabella.b@example.com" } }),
  ])
  console.log(`  ✓ ${customers.length} customers`)

  // 7. Some appointments
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const availableSlots = await db.slot.findMany({
    where: {
      status: SLOT_STATUS.AVAILABLE,
      startTime: { gte: today },
    },
    include: { service: true },
    take: 8,
  })

  let custIdx = 0
  for (const slot of availableSlots.slice(0, 5)) {
    const customer = customers[custIdx % customers.length]
    custIdx++

    const appt = await db.appointment.create({
      data: {
        customerId: customer.id,
        serviceId: slot.serviceId,
        slotId: slot.id,
        status: APPOINTMENT_STATUS.BOOKED,
        price: slot.service.price,
        note: "First-time customer",
      },
    })

    await db.transaction.create({
      data: {
        type: "APPOINTMENT",
        amount: slot.service.price,
        status: "PENDING",
        refId: appt.id,
        refKind: "Appointment",
        description: `Appointment: ${slot.service.name}`,
        customerId: customer.id,
      },
    })
  }
  console.log("  ✓ Sample appointments + transactions")

  // 8. Sample orders
  for (let i = 0; i < 3; i++) {
    const customer = customers[i]
    const product = products[i]
    const qty = 1 + i
    const total = product.price * qty

    const order = await db.order.create({
      data: {
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        status: i === 2 ? ORDER_STATUS.COMPLETED : ORDER_STATUS.PENDING,
        paymentMethod: "CASH_IN_CLINIC",
        subtotal: total,
        total,
        items: {
          create: {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: qty,
            total,
          },
        },
      },
    })

    await db.transaction.create({
      data: {
        type: "ORDER",
        amount: total,
        status: order.status === ORDER_STATUS.COMPLETED ? "COMPLETED" : "PENDING",
        refId: order.id,
        refKind: "Order",
        description: `Order: ${product.name} x${qty}`,
        customerId: customer.id,
      },
    })

    if (order.status === ORDER_STATUS.COMPLETED) {
      await db.product.update({
        where: { id: product.id },
        data: { stock: { decrement: qty } },
      })
    }
  }
  console.log("  ✓ Sample orders + transactions")

  // 9. Past completed appointments for revenue history
  for (let dayAgo = 1; dayAgo <= 7; dayAgo++) {
    const date = new Date()
    date.setDate(date.getDate() - dayAgo)
    date.setHours(0, 0, 0, 0)

    const svc = services[dayAgo % services.length]
    const customer = customers[dayAgo % customers.length]

    const start = new Date(date)
    start.setHours(10 + dayAgo, 0, 0, 0)
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + svc.durationMin)

    const slot = await db.slot.create({
      data: {
        serviceId: svc.id,
        startTime: start,
        endTime: end,
        status: SLOT_STATUS.AVAILABLE,
      },
    })

    const appt = await db.appointment.create({
      data: {
        customerId: customer.id,
        serviceId: svc.id,
        slotId: slot.id,
        status: APPOINTMENT_STATUS.COMPLETED,
        price: svc.price,
      },
    })

    await db.transaction.create({
      data: {
        type: "APPOINTMENT",
        amount: svc.price,
        status: "COMPLETED",
        refId: appt.id,
        refKind: "Appointment",
        description: `Past appointment: ${svc.name}`,
        customerId: customer.id,
        createdAt: date,
      },
    })
  }
  console.log("  ✓ Past completed appointments (revenue history)")

  // 10. Settings
  await db.clinicSetting.upsert({
    where: { key: "workingHoursStart" },
    update: {},
    create: { key: "workingHoursStart", value: "9" },
  })
  await db.clinicSetting.upsert({
    where: { key: "workingHoursEnd" },
    update: {},
    create: { key: "workingHoursEnd", value: "19" },
  })
  await db.clinicSetting.upsert({
    where: { key: "workingDays" },
    update: {},
    create: { key: "workingDays", value: "1,2,3,4,5,6" },
  })
  console.log("  ✓ Clinic settings")

  console.log("\n✅ Seed complete!")
  console.log(`   Admin login: ${DEFAULT_ADMIN.email} / ${DEFAULT_ADMIN.password}`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
