import express from 'express';
import { config } from "dotenv";

import appRouter from './routes/';
import errorHandler from './middleware/errorHandler';

config();

export const createApp = (): express.Application => {
    const app: express.Application = express();

    app.use(express.json());

    app.use('/api', appRouter);

    app.use(errorHandler);

    return app;
};