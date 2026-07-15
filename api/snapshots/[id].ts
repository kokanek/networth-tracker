import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_lib/mongodb.js';
import { requireAuth } from '../_lib/auth.js';
import type { Asset } from '../_lib/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  const user = (req.query.user as string) || 'kapeel';
  const id = req.query.id as string;
  const collection = (await getDb()).collection(`snapshots_${user}`);

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  if (req.method === 'PUT') {
    const { date, assets } = req.body as { date: string; assets: Asset[] };
    const totalNetWorth = assets.reduce((sum, a) => sum + a.value, 0);
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { date, assets, totalNetWorth, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Not found' });
    return res.json(result);
  }

  if (req.method === 'DELETE') {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    return res.json({ success: true });
  }

  res.setHeader('Allow', 'PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}
