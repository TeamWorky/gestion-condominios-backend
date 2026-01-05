import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CryptoUtil } from '../utils/crypto.util';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] || CryptoUtil.generateUUID();
    req.headers['x-request-id'] = requestId as string;
    res.setHeader('X-Request-Id', requestId);
    next();
  }
}
