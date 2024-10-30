module.exports = {
  async up(db) {
    await db.createCollection('complianceSettings');
    await db.createCollection('complianceReviews');

    await db.collection('complianceSettings').createIndex({ lastUpdated: -1 });
    await db.collection('complianceReviews').createIndex({ reviewDate: -1 });

    // Initialize default compliance settings
    await db.collection('complianceSettings').insertOne({
      minAge: 18,
      maxDailyWager: 1000,
      maxWeeklyWager: 5000,
      maxMonthlyWager: 20000,
      kycRequirements: ['government_id', 'proof_of_address'],
      restrictedCountries: ['US', 'CN', 'IR'],
      lastUpdated: new Date()
    });
  },

  async down(db) {
    await db.collection('complianceSettings').drop();
    await db.collection('complianceReviews').drop();
  }
};