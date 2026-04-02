import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // --- Demo users ---
  const pelerinHash = await bcrypt.hash("Demo2025!", 12)
  const guideHash = await bcrypt.hash("Demo2025!", 12)

  const pelerin = await prisma.user.upsert({
    where: { email: "demo@pelerin.com" },
    update: {},
    create: {
      email: "demo@pelerin.com",
      name: "Karim Lamrani",
      firstName: "Karim",
      lastName: "Lamrani",
      passwordHash: pelerinHash,
      role: "PELERIN",
    },
  })

  const guideUser = await prisma.user.upsert({
    where: { email: "demo@guide.com" },
    update: {},
    create: {
      email: "demo@guide.com",
      name: "Rachid Al-Madani",
      firstName: "Rachid",
      lastName: "Al-Madani",
      passwordHash: guideHash,
      role: "GUIDE",
    },
  })

  // --- Places ---
  const places = [
    { slug: "masjid-al-haram", nameFr: "Masjid Al-Haram", nameAr: "المسجد الحرام", city: "Makkah", category: "Mosquée", description: "La mosquée la plus sacrée de l'Islam, entourant la Kaaba." },
    { slug: "jabal-al-nour", nameFr: "Jabal Al-Nour / Hira", nameAr: "جبل النور", city: "Makkah", category: "Site historique", description: "La montagne où le Prophète reçut la première révélation." },
    { slug: "zamzam", nameFr: "Puits de Zamzam", nameAr: "زمزم", city: "Makkah", category: "Site sacré", description: "Le puits sacré aux vertus spirituelles inestimables." },
    { slug: "masjid-al-nabawi", nameFr: "Masjid Al-Nabawi", nameAr: "المسجد النبوي", city: "Madinah", category: "Mosquée", description: "La mosquée du Prophète, deuxième lieu saint de l'Islam." },
    { slug: "jabal-uhud", nameFr: "Jabal Uhud", nameAr: "جبل أحد", city: "Madinah", category: "Site historique", description: "La montagne témoin de la bataille d'Uhud." },
  ]

  for (const place of places) {
    await prisma.place.upsert({
      where: { slug: place.slug },
      update: {},
      create: place,
    })
  }

  const allPlaces = await prisma.place.findMany()

  // --- Guide 1: Rachid Al-Madani (Makkah) ---
  const guide1Profile = await prisma.guideProfile.upsert({
    where: { userId: guideUser.id },
    update: {},
    create: {
      userId: guideUser.id,
      slug: "rachid-al-madani",
      bio: "Né à La Mecque, diplômé de l'Université Islamique de Madinah. 12 ans d'expérience en guidage spirituel pour des familles francophones. Mon approche allie rigueur scientifique et bienveillance humaine.",
      city: "Makkah",
      nationality: "Saoudienne",
      experienceYears: 12,
      university: "Université Islamique de Madinah",
      status: "ACTIVE",
      responseTimeAvg: "< 2h",
      completionRate: 99,
    },
  })

  await prisma.guideLanguage.createMany({
    data: [
      { guideProfileId: guide1Profile.id, languageCode: "fr", level: "C2" },
      { guideProfileId: guide1Profile.id, languageCode: "ar", level: "NATIVE" },
      { guideProfileId: guide1Profile.id, languageCode: "en", level: "B2" },
    ],
  })

  for (const place of allPlaces.filter(p => p.city === "Makkah")) {
    await prisma.guidePlace.createMany({
      data: [{ guideProfileId: guide1Profile.id, placeId: place.id }],
    })
  }

  await prisma.package.createMany({
    data: [
      { guideProfileId: guide1Profile.id, name: "Omra Essentielle", durationDays: 1, pricePerPerson: 120, priceGroup: 400, minPeople: 1, maxPeople: 8 },
      { guideProfileId: guide1Profile.id, name: "Ziyara Histoire", durationDays: 1, pricePerPerson: 200, priceGroup: 600, minPeople: 1, maxPeople: 6 },
      { guideProfileId: guide1Profile.id, name: "Séjour Complet 5 jours", durationDays: 5, pricePerPerson: 850, minPeople: 1, maxPeople: 4 },
    ],
  })

  // --- Guide 2: Fatima Al-Omari ---
  const fatima = await prisma.user.upsert({
    where: { email: "fatima@safaruma.com" },
    update: {},
    create: {
      email: "fatima@safaruma.com",
      name: "Fatima Al-Omari",
      firstName: "Fatima",
      lastName: "Al-Omari",
      role: "GUIDE",
    },
  })

  const guide2Profile = await prisma.guideProfile.upsert({
    where: { userId: fatima.id },
    update: {},
    create: {
      userId: fatima.id,
      slug: "fatima-al-omari",
      bio: "Guide femme agréée, spécialiste de l'accompagnement des familles et groupes féminins. Née à Casablanca, je parle le français et le darija avec le cœur. Votre confort et votre sécurité sont ma priorité.",
      city: "Makkah",
      nationality: "Marocaine",
      experienceYears: 8,
      status: "ACTIVE",
      responseTimeAvg: "< 1h",
      completionRate: 98,
    },
  })

  await prisma.guideLanguage.createMany({
    data: [
      { guideProfileId: guide2Profile.id, languageCode: "fr", level: "C2" },
      { guideProfileId: guide2Profile.id, languageCode: "ar-ma", level: "NATIVE" },
    ],
  })

  await prisma.package.createMany({
    data: [
      { guideProfileId: guide2Profile.id, name: "Omra Essentielle (Femmes)", durationDays: 1, pricePerPerson: 130, priceGroup: 420, minPeople: 1, maxPeople: 8 },
      { guideProfileId: guide2Profile.id, name: "Ziyara Spirituelle", durationDays: 1, pricePerPerson: 190, minPeople: 1, maxPeople: 6 },
    ],
  })

  // --- Guide 3: Youssouf Konaté ---
  const youssouf = await prisma.user.upsert({
    where: { email: "youssouf@safaruma.com" },
    update: {},
    create: {
      email: "youssouf@safaruma.com",
      name: "Youssouf Konaté",
      firstName: "Youssouf",
      lastName: "Konaté",
      role: "GUIDE",
    },
  })

  const guide3Profile = await prisma.guideProfile.upsert({
    where: { userId: youssouf.id },
    update: {},
    create: {
      userId: youssouf.id,
      slug: "youssouf-konate",
      bio: "Originaire de Dakar, je suis l'intermédiaire entre les communautés d'Afrique de l'Ouest et les Lieux Saints. Spécialiste de la Sira et de l'histoire islamique en Wolof et en français.",
      city: "Makkah",
      nationality: "Sénégalaise",
      experienceYears: 6,
      status: "ACTIVE",
      responseTimeAvg: "< 3h",
      completionRate: 96,
    },
  })

  await prisma.guideLanguage.createMany({
    data: [
      { guideProfileId: guide3Profile.id, languageCode: "fr", level: "C1" },
      { guideProfileId: guide3Profile.id, languageCode: "wo", level: "NATIVE" },
    ],
  })

  await prisma.package.createMany({
    data: [
      { guideProfileId: guide3Profile.id, name: "Omra Essentielle", durationDays: 1, pricePerPerson: 110, priceGroup: 380, minPeople: 1, maxPeople: 10 },
      { guideProfileId: guide3Profile.id, name: "Ziyara Histoire", durationDays: 1, pricePerPerson: 180, minPeople: 1, maxPeople: 8 },
    ],
  })

  // --- Guide 4: Abdullah Ben Yusuf (Madinah) ---
  const abdullah = await prisma.user.upsert({
    where: { email: "abdullah@safaruma.com" },
    update: {},
    create: {
      email: "abdullah@safaruma.com",
      name: "Abdullah Ben Yusuf",
      firstName: "Abdullah",
      lastName: "Ben Yusuf",
      role: "GUIDE",
    },
  })

  const guide4Profile = await prisma.guideProfile.upsert({
    where: { userId: abdullah.id },
    update: {},
    create: {
      userId: abdullah.id,
      slug: "abdullah-ben-yusuf",
      bio: "Diplômé en Sciences islamiques de l'Université de Madinah, je suis spécialiste de la Sira du Prophète et des lieux historiques de Madinah. Référence pour les visites académiques.",
      city: "Madinah",
      nationality: "Marocaine",
      experienceYears: 10,
      university: "Université Islamique de Madinah",
      status: "ACTIVE",
      responseTimeAvg: "< 2h",
      completionRate: 99,
    },
  })

  await prisma.guideLanguage.createMany({
    data: [
      { guideProfileId: guide4Profile.id, languageCode: "fr", level: "C2" },
      { guideProfileId: guide4Profile.id, languageCode: "ar", level: "C2" },
    ],
  })

  for (const place of allPlaces.filter(p => p.city === "Madinah")) {
    await prisma.guidePlace.createMany({
      data: [{ guideProfileId: guide4Profile.id, placeId: place.id }],
    })
  }

  await prisma.package.createMany({
    data: [
      { guideProfileId: guide4Profile.id, name: "Ziyara Madinah", durationDays: 1, pricePerPerson: 150, priceGroup: 500, minPeople: 1, maxPeople: 8 },
      { guideProfileId: guide4Profile.id, name: "Séjour Madinah 3 jours", durationDays: 3, pricePerPerson: 450, minPeople: 1, maxPeople: 4 },
    ],
  })

  // --- Guide 5: Samira Al-Rashidi (Madinah, PMR) ---
  const samira = await prisma.user.upsert({
    where: { email: "samira@safaruma.com" },
    update: {},
    create: {
      email: "samira@safaruma.com",
      name: "Samira Al-Rashidi",
      firstName: "Samira",
      lastName: "Al-Rashidi",
      role: "GUIDE",
    },
  })

  const guide5Profile = await prisma.guideProfile.upsert({
    where: { userId: samira.id },
    update: {},
    create: {
      userId: samira.id,
      slug: "samira-al-rashidi",
      bio: "Spécialiste de l'accueil des pèlerins à mobilité réduite (PMR). Fauteuils roulants adaptés, véhicules équipés, accompagnement bienveillant à Madinah. Tunisienne de cœur, au service de vos parents et grands-parents.",
      city: "Madinah",
      nationality: "Tunisienne",
      experienceYears: 7,
      status: "ACTIVE",
      responseTimeAvg: "< 2h",
      completionRate: 97,
    },
  })

  await prisma.guideLanguage.createMany({
    data: [
      { guideProfileId: guide5Profile.id, languageCode: "fr", level: "C2" },
      { guideProfileId: guide5Profile.id, languageCode: "ar-tn", level: "NATIVE" },
    ],
  })

  await prisma.package.createMany({
    data: [
      { guideProfileId: guide5Profile.id, name: "Ziyara PMR Madinah", durationDays: 1, pricePerPerson: 180, priceGroup: 550, minPeople: 1, maxPeople: 4 },
      { guideProfileId: guide5Profile.id, name: "Séjour PMR 3 jours", durationDays: 3, pricePerPerson: 520, minPeople: 1, maxPeople: 2 },
    ],
  })

  // --- Demo reservation for the pelerin ---
  const rachidPackage = await prisma.package.findFirst({ where: { guideProfileId: guide1Profile.id } })
  if (rachidPackage) {
    await prisma.reservation.upsert({
      where: { refNumber: "SAF-2025-012" },
      update: {},
      create: {
        refNumber: "SAF-2025-012",
        pelerinId: pelerin.id,
        guideProfileId: guide1Profile.id,
        packageId: rachidPackage.id,
        startDate: new Date("2025-06-10"),
        endDate: new Date("2025-06-11"),
        nbPeople: 2,
        basePrice: 240,
        commissionAmount: 36,
        totalPrice: 276,
        status: "CONFIRMED",
      },
    })
  }

  // --- Sample Duas ---
  await prisma.dua.createMany({
    data: [
      { category: "voyage", arabicText: "اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ", transliteration: "Allahumma hawwin 'alayna safarana hadha watwi 'anna bu'dahu", translationFr: "Ô Allah, facilite-nous ce voyage et raccourcis la distance pour nous.", source: "Sahih Muslim" },
      { category: "entree_masjid", arabicText: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ", transliteration: "Allahumma iftah li abwaba rahmatika", translationFr: "Ô Allah, ouvre pour moi les portes de Ta miséricorde.", source: "Sahih Muslim" },
      { category: "tawaf", arabicText: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ", transliteration: "SubhanAllah wal-hamdulillah wa la ilaha illa Allah wallahu Akbar", translationFr: "Gloire à Allah, louange à Allah, pas de divinité sauf Allah, Allah est le Plus Grand.", source: "Sunnah" },
    ],
  })

  console.log("✅ Seed terminé !")
  console.log("📧 Comptes démo :")
  console.log("   Pèlerin : demo@pelerin.com / Demo2025!")
  console.log("   Guide   : demo@guide.com   / Demo2025!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
