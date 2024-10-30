import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pllay_db';

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();

    // Clear existing data
    await db.collection('users').deleteMany({});
    await db.collection('games').deleteMany({});
    await db.collection('tournaments').deleteMany({});
    await db.collection('wagers').deleteMany({});
    await db.collection('transactions').deleteMany({});
    await db.collection('wallets').deleteMany({});

    // Seed Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = [
      { _id: new ObjectId(), name: 'Admin User', email: 'admin@example.com', password: hashedPassword, role: 'admin' },
      { _id: new ObjectId(), name: 'Regular User', email: 'user@example.com', password: hashedPassword, role: 'player' },
      { _id: new ObjectId(), name: 'Moderator User', email: 'mod@example.com', password: hashedPassword, role: 'moderator' },
    ];
    await db.collection('users').insertMany(users);
    console.log('Users seeded');

    // Seed Games
    const games = [
      { _id: new ObjectId(), name: 'Poker', description: 'Classic card game', apiEndpoint: '/api/games/poker', status: 'active', popularity: 100 },
      { _id: new ObjectId(), name: 'Blackjack', description: 'Casino card game', apiEndpoint: '/api/games/blackjack', status: 'active', popularity: 90 },
      { _id: new ObjectId(), name: 'Roulette', description: 'Wheel of fortune', apiEndpoint: '/api/games/roulette', status: 'active', popularity: 80 },
    ];
    await db.collection('games').insertMany(games);
    console.log('Games seeded');

    // Seed Tournaments
    const tournaments = [
      {
        _id: new ObjectId(),
        name: 'Poker Championship',
        gameId: games[0]._id,
        startDate: new Date('2023-07-01'),
        endDate: new Date('2023-07-07'),
        status: 'scheduled',
        maxParticipants: 100,
        currentParticipants: 0,
        entryFee: 50,
        prizePool: 4000,
      },
      {
        _id: new ObjectId(),
        name: 'Blackjack Bonanza',
        gameId: games[1]._id,
        startDate: new Date('2023-08-01'),
        endDate: new Date('2023-08-03'),
        status: 'scheduled',
        maxParticipants: 50,
        currentParticipants: 0,
        entryFee: 25,
        prizePool: 1000,
      },
    ];
    await db.collection('tournaments').insertMany(tournaments);
    console.log('Tournaments seeded');

    // Seed Wagers
    const wagers = [
      {
        _id: new ObjectId(),
        userId: users[1]._id,
        opponentId: users[2]._id,
        gameId: games[0]._id,
        amount: 100,
        status: 'pending',
        createdAt: new Date(),
      },
      {
        _id: new ObjectId(),
        userId: users[1]._id,
        opponentId: users[2]._id,
        gameId: games[1]._id,
        amount: 50,
        status: 'accepted',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    ];
    await db.collection('wagers').insertMany(wagers);
    console.log('Wagers seeded');

    // Seed Transactions
    const transactions = [
      {
        _id: new ObjectId(),
        userId: users[1]._id,
        type: 'deposit',
        amount: 1000,
        status: 'completed',
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
      },
      {
        _id: new ObjectId(),
        userId: users[2]._id,
        type: 'deposit',
        amount: 500,
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    ];
    await db.collection('transactions').insertMany(transactions);
    console.log('Transactions seeded');

    // Seed Wallets
    const wallets = [
      {
        userId: users[1]._id,
        balance: 900,
        tokenBalance: 0,
      },
      {
        userId: users[2]._id,
        balance: 500,
        tokenBalance: 0,
      },
    ];
    await db.collection('wallets').insertMany(wallets);
    console.log('Wallets seeded');

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();