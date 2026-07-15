import { config } from 'dotenv';
import { Redis } from '@upstash/redis';

config({ path: '.env.local' });

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const APP_PREFIX = 'networth';

/** Redis key holding the array of snapshots for a user, e.g. `networth:kapeel`. */
export const snapshotsKey = (user: string): string => `${APP_PREFIX}:${user}`;
