import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`  DecisionMate AI Backend Running`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health`);
  console.log(`  Default AI Provider: ${process.env.DEFAULT_AI_PROVIDER || 'Smart Engine (Offline Ready)'}`);
  console.log(`=============================================`);
});
