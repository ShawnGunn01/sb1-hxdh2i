module.exports = {
  async up(db) {
    await db.createCollection('users');
    await db.createCollection('games');
    await db.createCollection('tournaments');
    await db.createCollection('wagers');
    await db.createCollection('transactions');
    await db.createCollection('subscriptions');

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });

    await db.collection('games').createIndex({ name: 1 });
    await db.collection('games').createIndex({ status: 1 });

    await db.collection('tournaments').createIndex({ startDate: 1, endDate: 1 });
    await db.collection('tournaments').createIndex({ status: 1 });

    await db.collection('wagers').createIndex({ userId: 1, status: 1 });
    await db.collection('wagers').createIndex({ gameId: 1 });
    await db.collection('wagers').createIndex({ createdAt: -1 });

    await db.collection('transactions').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('transactions').createIndex({ type: 1 });

    await db.collection('subscriptions').createIndex({ userId: 1 });
    await db.collection('subscriptions').createIndex({ nextBillingDate: 1 });
  },

  async down(db) {
    await db.dropCollection('users');
    await db.dropCollection('games');
    await db.dropCollection('tournaments');
    await db.dropCollection('wagers');
    await db.dropCollection('transactions');
    await db.dropCollection('subscriptions');
  }
};