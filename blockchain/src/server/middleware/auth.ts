import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../util';
import env from '../../env';

export default function(req: Request, res: Response, next: NextFunction) {
  if (!req.headers['authorization']) {
    res.status(403).json({ error: 'Authorization header is required' });
    return;
  }
  if (!authenticate(req.headers['authorization'])) {
    res.status(403).json({ error: 'Authorization header is invalid' });
    return;
  }
  next();
}
