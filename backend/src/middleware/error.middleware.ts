import { type Request, type Response, type NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  console.error('[Backend Error]:', err.message, err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error occurred.'
  });
}
