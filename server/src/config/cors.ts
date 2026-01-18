import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
    optionsSuccessStatus: 200,
};
