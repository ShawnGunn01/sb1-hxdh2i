module.exports = {
  async up(db) {
    await db.createCollection('notifications');
    await db.collection('notifications').createIndex({ userId: 1 });
    await db.collection('notifications').createIndex({ createdAt: -1 });
    await db.collection('notifications').createIndex({ read: 1 });
  },

  async down(db) {
    await db.collection('notifications').drop();
  }
};