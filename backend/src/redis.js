import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL;
const pubClient = createClient({ url: REDIS_URL });
const subClient = pubClient.duplicate();

const connectRedis = async () => {
    await pubClient.connect();
    await subClient.connect();
    console.log('Connected to Redis');
}

export { pubClient, subClient, connectRedis };