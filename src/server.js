import express from 'express';
import { config } from './config/index.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';
import insightRoutes from './routes/insightRoutes.js';

const app = express();

app.use(express.json());
app.use(requestIdMiddleware);

app.use('/api', insightRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});