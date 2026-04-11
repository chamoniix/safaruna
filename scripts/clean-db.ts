import prisma from '../src/lib/prisma';

async function main() {
  console.log('🧹 Nettoyage de la base de données...\n');

  // Garde le user et le guideProfile de naim-laamari
  const keepUser = await prisma.user.findFirst({ where: { email: 'naim@safaruma.com' }, select: { id: true } });
  const keepGuide = await prisma.guideProfile.findFirst({ where: { slug: 'naim-laamari' }, select: { id: true } });

  if (!keepUser) console.warn('⚠️  User naim@safaruma.com introuvable — tous les users seront supprimés');
  if (!keepGuide) console.warn('⚠️  GuideProfile naim-laamari introuvable — tous les guides seront supprimés');

  // 1. Messages
  const messages = await prisma.message.deleteMany({});
  console.log(`✓ Message         : ${messages.count} supprimés`);

  // 2. Conversations
  const conversations = await prisma.conversation.deleteMany({});
  console.log(`✓ Conversation     : ${conversations.count} supprimées`);

  // 3. Notifications
  const notifications = await prisma.notification.deleteMany({});
  console.log(`✓ Notification     : ${notifications.count} supprimées`);

  // 4. Reviews
  const reviews = await prisma.review.deleteMany({});
  console.log(`✓ Review           : ${reviews.count} supprimés`);

  // 5. Reservations
  const reservations = await prisma.reservation.deleteMany({});
  console.log(`✓ Reservation      : ${reservations.count} supprimées`);

  // 6. Transfers
  const transfers = await prisma.transfer.deleteMany({});
  console.log(`✓ Transfer         : ${transfers.count} supprimés`);

  // 7. CourseProgress
  const courseProgress = await prisma.courseProgress.deleteMany({});
  console.log(`✓ CourseProgress   : ${courseProgress.count} supprimés`);

  // 8. SavedDuas
  const savedDuas = await prisma.savedDua.deleteMany({});
  console.log(`✓ SavedDua         : ${savedDuas.count} supprimés`);

  // 9. PasswordResetTokens
  const passwordResetTokens = await prisma.passwordResetToken.deleteMany({});
  console.log(`✓ PasswordResetToken: ${passwordResetTokens.count} supprimés`);

  // 10. Accounts (NextAuth) — sauf ceux liés au user gardé
  const accounts = await prisma.account.deleteMany({
    where: keepUser ? { userId: { not: keepUser.id } } : {},
  });
  console.log(`✓ Account          : ${accounts.count} supprimés`);

  // 11. Sessions (NextAuth) — sauf celles liées au user gardé
  const sessions = await prisma.session.deleteMany({
    where: keepUser ? { userId: { not: keepUser.id } } : {},
  });
  console.log(`✓ Session          : ${sessions.count} supprimées`);

  // 12. GuideProfiles sauf naim-laamari
  const guideProfiles = await prisma.guideProfile.deleteMany({
    where: keepGuide ? { id: { not: keepGuide.id } } : {},
  });
  console.log(`✓ GuideProfile     : ${guideProfiles.count} supprimés`);

  // 13. Users sauf naim@safaruma.com
  const users = await prisma.user.deleteMany({
    where: keepUser ? { id: { not: keepUser.id } } : {},
  });
  console.log(`✓ User             : ${users.count} supprimés`);

  console.log('\n✅ Nettoyage terminé.');
  if (keepUser)  console.log(`   → User conservé  : naim@safaruma.com (id: ${keepUser.id})`);
  if (keepGuide) console.log(`   → Guide conservé : naim-laamari (id: ${keepGuide.id})`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
