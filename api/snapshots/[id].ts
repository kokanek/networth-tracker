import type { VercelRequest, VercelResponse } from '@vercel/node';
import { redis, snapshotsKey } from '../_lib/redis.js';
import { requireAuth } from '../_lib/auth.js';
import type { Asset, Snapshot } from '../_lib/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  const user = (req.query.user as string) || 'Kapeel';
  const id = req.query.id as string;
  const key = snapshotsKey(user);

  const snapshots = (await redis.get<Snapshot[]>(key)) ?? [];

  if (req.method === 'PUT') {
    const { date, assets } = req.body as { date: string; assets: Asset[] };
    const index = snapshots.findIndex((s) => s._id === id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });

    const totalNetWorth = assets.reduce((sum, a) => sum + a.value, 0);
    const updated: Snapshot = {
      ...snapshots[index],
      date,
      assets,
      totalNetWorth,
      updatedAt: new Date().toISOString(),
    };
    snapshots[index] = updated;
    await redis.set(key, snapshots);
    return res.json(updated);
  }

  if (req.method === 'DELETE') {
    const next = snapshots.filter((s) => s._id !== id);
    if (next.length === snapshots.length) return res.status(404).json({ error: 'Not found' });
    await redis.set(key, next);
    return res.json({ success: true });
  }

  res.setHeader('Allow', 'PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}
