import { db } from '../config/database';

export async function setTokenValue(value: number) {
  await db.tokenConfig.updateOne(
    { key: 'tokenValue' },
    { $set: { value } },
    { upsert: true }
  );
}

export async function getTokenValue(): Promise<number> {
  const config = await db.tokenConfig.findOne({ key: 'tokenValue' });
  return config ? config.value : 1; // Default to 1 if not set
}