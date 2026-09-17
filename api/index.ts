import { Request, Response } from 'express';
import { createApp } from '../backend/src/app.js';

const app = createApp();

export default function handler(req: Request, res: Response) {
  return app(req, res);
}
