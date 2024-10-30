module.exports = {
  async up(db) {
    // Users collection
    await db.collection('users').createIndex({ lastLoginDate: -1 });
    await db.collection('users').createIndex({ createdAt: -1 });

    // Games collection
    await db.collection('games').createIndex({ createdAt: -1 });
    await db.collection('games').createIndex({ popularity: -1 });

    // Tournaments collection
    await db.collection('tournaments').createIndex({ gameId: 1 });
    await db.collection('tournaments').createIndex({ createdAt: -1 });

    // Wagers collection
    await db.collection('wagers').createIndex({ tournamentId: 1 });
    await db.collection('wagers').createIndex({ createdAt: -1 });

    // Transactions collection
    await db.collection('transactions').createIndex({ createdAt: -1 });
  },

  async down(db) {
    // Users collection
    await db.collection('users').dropIndex({ lastLoginDate: -1 });
    await db.collection('users').dropIndex({ createdAt: -1 });

    // Games collection
    await db.collection('games').dropIndex({ createdAt: -1 });
    await db.collection('games').dropIndex({ popularity: -1 });

    // Tournaments collection
    await db.collection('tournaments').dropIndex({ gameId: 1 });
    await db.collection('tournaments').dropIndex({ createdAt: -1 });

    // Wagers collection
    await db.collection('wagers').dropIndex({ tournamentId: 1 });
    await db.collection('wagers').dropIndex({ createdAt: -1 });

    // Transactions collection
    await db.collection('transactions').dropIndex({ createdAt: -1 });
  }
};