module.exports = {
  async up(db) {
    // Users collection
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ 'wallet.balance': 1 });
    await db.collection('users').createIndex({ 'stats.totalWagered': -1 });

    // Games collection
    await db.collection('games').createIndex({ category: 1 });
    await db.collection('games').createIndex({ 'stats.totalPlayed': -1 });

    // Tournaments collection
    await db.collection('tournaments').createIndex({ startDate: 1, endDate: 1, status: 1 });
    await db.collection('tournaments').createIndex({ 'participants.userId': 1 });

    // Wagers collection
    await db.collection('wagers').createIndex({ userId: 1, gameId: 1, status: 1 });
    await db.collection('wagers').createIndex({ createdAt: -1, status: 1 });

    // Transactions collection
    await db.collection('transactions').createIndex({ userId: 1, type: 1, createdAt: -1 });
    await db.collection('transactions').createIndex({ status: 1, createdAt: -1 });

    // Subscriptions collection
    await db.collection('subscriptions').createIndex({ userId: 1, status: 1, nextBillingDate: 1 });

    // Support tickets collection (if not already created)
    if (await db.listCollections({ name: 'supportTickets' }).hasNext()) {
      await db.collection('supportTickets').createIndex({ userId: 1, status: 1, createdAt: -1 });
      await db.collection('supportTickets').createIndex({ assignedTo: 1, status: 1 });
    }
  },

  async down(db) {
    // Users collection
    await db.collection('users').dropIndex({ role: 1 });
    await db.collection('users').dropIndex({ 'wallet.balance': 1 });
    await db.collection('users').dropIndex({ 'stats.totalWagered': -1 });

    // Games collection
    await db.collection('games').dropIndex({ category: 1 });
    await db.collection('games').dropIndex({ 'stats.totalPlayed': -1 });

    // Tournaments collection
    await db.collection('tournaments').dropIndex({ startDate: 1, endDate: 1, status: 1 });
    await db.collection('tournaments').dropIndex({ 'participants.userId': 1 });

    // Wagers collection
    await db.collection('wagers').dropIndex({ userId: 1, gameId: 1, status: 1 });
    await db.collection('wagers').dropIndex({ createdAt: -1, status: 1 });

    // Transactions collection
    await db.collection('transactions').dropIndex({ userId: 1, type: 1, createdAt: -1 });
    await db.collection('transactions').dropIndex({ status: 1, createdAt: -1 });

    // Subscriptions collection
    await db.collection('subscriptions').dropIndex({ userId: 1, status: 1, nextBillingDate: 1 });

    // Support tickets collection
    if (await db.listCollections({ name: 'supportTickets' }).hasNext()) {
      await db.collection('supportTickets').dropIndex({ userId: 1, status: 1, createdAt: -1 });
      await db.collection('supportTickets').dropIndex({ assignedTo: 1, status: 1 });
    }
  }
};