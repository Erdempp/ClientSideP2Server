import { Request, Response, NextFunction } from 'express';

const asyncHandler = fn => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  Promise.resolve(fn(req, res, next)).catch(err => {
    next(err);
  });
};

asyncHandler.asyncHandler = asyncHandler;

export default asyncHandler;
