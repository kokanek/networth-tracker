import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/mongodb.js';
import { requireAuth } from '../_lib/auth.js';
import type { GrowthRates } from '../_lib/types.js';

const DEFAULT_GROWTH_RATES: GrowthRates = {
  real_estate: 8,
  gold: 10,
  stocks: 12,
  mutual_funds: 12,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  const user = (req.query.user as string) || 'kapeel';
  const collection = (await getDb()).collection('settings');

  if (req.method === 'GET') {
    const settings = await collection.findOne({ userId: user });
    return res.json(settings || { userId: user, growthRates: DEFAULT_GROWTH_RATES });
  }

  if (req.method === 'PUT') {
    const { growthRates } = req.body as { growthRates: GrowthRates };
    const result = await collection.findOneAndUpdate(
      { userId: user },
      { $set: { growthRates, updatedAt: new Date() } },
      { upsert: true, returnDocument: 'after' }
    );
    return res.json(result);
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Method not allowed' });
}
