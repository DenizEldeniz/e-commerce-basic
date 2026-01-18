import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';

/**
 * Global error handling middleware
 */
export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error('Error:', err);

    const apiError: ApiError = {
        error: err.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    };

    res.status(500).json(apiError);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (_req: Request, res: Response) => {
    res.status(404).json({
        error: 'Route not found',
    } as ApiError);
};
