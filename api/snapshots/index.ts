import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/mongodb.js';
import type { Asset } from '../_lib/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = (req.query.user as string) || 'kapeel';
  const collection = (await getDb()).collection(`snapshots_${user}`);

  if (req.method === 'GET') {
    const snapshots = await collection.find().sort({ date: 1 }).toArray();
    return res.json(snapshots);
  }

  if (req.method === 'POST') {
    const { date, assets } = req.body as { date: string; assets: Asset[] };
    if (!date || !assets?.length) {
      return res.status(400).json({ error: 'date and assets are required' });
    }
    const totalNetWorth = assets.reduce((sum, a) => sum + a.value, 0);
    const doc = { date, assets, totalNetWorth, createdAt: new Date(), updatedAt: new Date() };
    const result = await collection.insertOne(doc);
    return res.status(201).json({ ...doc, _id: result.insertedId });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
