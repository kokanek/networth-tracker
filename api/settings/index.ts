import type { VercelRequest, VercelResponse } from '@vercel/node';
import { redis, settingsKey } from '../_lib/redis.js';
import { requireAuth } from '../_lib/auth.js';
import type { GrowthRates, Settings } from '../_lib/types.js';

const DEFAULT_GROWTH_RATES: GrowthRates = {
  real_estate: 8,
  gold: 10,
  stocks: 12,
  mutual_funds: 12,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  const user = (req.query.user as string) || 'kapeel';
  const key = settingsKey(user);

  if (req.method === 'GET') {
    const settings = await redis.get<Settings>(key);
    return res.json(settings || { userId: user, growthRates: DEFAULT_GROWTH_RATES });
  }

  if (req.method === 'PUT') {
    const { growthRates } = req.body as { growthRates: GrowthRates };
    const settings: Settings = {
      userId: user,
      growthRates,
      updatedAt: new Date().toISOString(),
    };
    await redis.set(key, settings);
    return res.json(settings);
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Method not allowed' });
}
