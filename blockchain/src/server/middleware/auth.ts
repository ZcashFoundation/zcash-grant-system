import { Request, Response, NextFunction } from 'express';
import env from '../../env';

export default function(req: Request, res: Response, next: NextFunction) {
  if (!req.headers['authorization']) {
    res.status(403).json({ error: 'Authorization header is required' });
    return;
  }
  if (req.headers['authorization'] !== env.API_SECRET_KEY) {
    res.status(403).json({ error: 'Authorization header is invalid' });
    return;
  }
  next();
}
