import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const services = [
  {
    name: "מניקור ג'ל",
    description: "ציפוי ג'ל איכותי בגוון לבחירה, כולל טיפוח מלא",
    durationMin: 60,
    priceAgorot: 18000,
    icon: "sparkles",
    category: "מניקור",
    colorTag: "#cf6a85",
    sortOrder: 1,
  },
  {
    name: "פדיקור ספא",
    description: "טיפול פינוק מלא לכפות הרגליים כולל פילינג ועיסוי",
    durationMin: 75,
    priceAgorot: 22000,
    icon: "footprints",
    category: "פדיקור",
    colorTag: "#a87f50",
    sortOrder: 2,
  },
  {
    name: "בניית ציפורניים בג'ל",
    description: "בנייה מלאה עם תבניות, עיצוב לפי בחירה",
    durationMin: 120,
    priceAgorot: 28000,
    icon: "gem",
    category: "בנייה",
    colorTag: "#c9a961",
    sortOrder: 3,
  },
  {
    name: "מילוי ציפורניים",
    description: "מילוי חודשי לבנייה קיימת",
    durationMin: 90,
    priceAgorot: 20000,
    icon: "refresh-cw",
    category: "בנייה",
    colorTag: "#c9a961",
    sortOrder: 4,
  },
  {
    name: "לק ג'ל ידיים",
    description: "החלפת לק ג'ל בלבד ללא טיפוח",
    durationMin: 45,
    priceAgorot: 12000,
    icon: "paintbrush",
    category: "מניקור",
    colorTag: "#cf6a85",
    sortOrder: 5,
  },
];

const businessHours = [
  { weekday: 0, openTime: "09:00", closeTime: "19:00", isClosed: false },
  { weekday: 1, openTime: "09:00", closeTime: "19:00", isClosed: false },
  { weekday: 2, openTime: "09:00", closeTime: "19:00", isClosed: false },
  { weekday: 3, openTime: "09:00", closeTime: "19:00", isClosed: false },
  { weekday: 4, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { weekday: 5, openTime: "09:00", closeTime: "14:00", isClosed: false },
  { weekday: 6, openTime: "00:00", closeTime: "00:00", isClosed: true },
];

const businessInfo = {
  id: "singleton",
  name: "מיטל ג'ל",
  address: "רחוב הדוגמה 12, תל אביב",
  phone: "050-0000000",
  instagram: "@mital.nails",
};

async function main() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.name },
      update: service,
      create: { id: service.name, ...service },
    });
  }

  for (const hours of businessHours) {
    await prisma.businessHours.upsert({
      where: { weekday: hours.weekday },
      update: hours,
      create: hours,
    });
  }

  await prisma.businessInfo.upsert({
    where: { id: businessInfo.id },
    update: businessInfo,
    create: businessInfo,
  });

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
