import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { redis, snapshotsKey } from '../_lib/redis.js';
import { requireAuth } from '../_lib/auth.js';
import type { Asset, Snapshot } from '../_lib/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  const user = (req.query.user as string) || 'Kapeel';
  const key = snapshotsKey(user);

  if (req.method === 'GET') {
    const snapshots = (await redis.get<Snapshot[]>(key)) ?? [];
    snapshots.sort((a, b) => a.date.localeCompare(b.date));
    return res.json(snapshots);
  }

  if (req.method === 'POST') {
    const { date, assets } = req.body as { date: string; assets: Asset[] };
    if (!date || !assets?.length) {
      return res.status(400).json({ error: 'date and assets are required' });
    }
    const totalNetWorth = assets.reduce((sum, a) => sum + a.value, 0);
    const now = new Date().toISOString();
    const snapshot: Snapshot = {
      _id: randomUUID(),
      date,
      assets,
      totalNetWorth,
      createdAt: now,
      updatedAt: now,
    };

    const snapshots = (await redis.get<Snapshot[]>(key)) ?? [];
    snapshots.push(snapshot);
    await redis.set(key, snapshots);

    return res.status(201).json(snapshot);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
