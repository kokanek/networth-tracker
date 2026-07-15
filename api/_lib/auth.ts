import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'crypto';

function safeEqual(a: string, b: string): boolean {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length) return false;
    return timingSafeEqual(ab, bb);
}

/**
 * Verifies the request carries a valid `Authorization: Bearer <token>` header
 * matching the API_TOKEN environment variable. Writes an error response and
 * returns false when the request is not authorized.
 */
export function requireAuth(req: VercelRequest, res: VercelResponse): boolean {
    const expected = process.env.API_TOKEN;
    if (!expected) {
        res.status(500).json({ error: 'API_TOKEN is not configured on the server' });
        return false;
    }

    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';

    if (!token || !safeEqual(token, expected)) {
        res.status(401).json({ error: 'Unauthorized' });
        return false;
    }

    return true;
}
