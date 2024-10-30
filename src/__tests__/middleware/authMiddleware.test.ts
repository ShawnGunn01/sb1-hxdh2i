import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, adminMiddleware } from '../../middleware/authMiddleware';
import { UserService } from '../../services/userService';

jest.mock('jsonwebtoken');
jest.mock('../../services/userService');

describe('AuthMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      cookies: {},
      userId: undefined,
      user: undefined,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test('authMiddleware passes for valid token', async () => {
    const mockUser = { id: 'user_123', role: 'user' };
    mockRequest.cookies = { token: 'valid_token' };
    (jwt.verify as jest.Mock).mockReturnValue({ id: 'user_123' });
    (UserService.getUserById as jest.Mock).mockResolvedValue(mockUser);

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.userId).toBe('user_123');
    expect(mockRequest.user).toEqual(mockUser);
    expect(nextFunction).toHaveBeenCalled();
  });

  test('authMiddleware fails for invalid token', async () => {
    mockRequest.cookies = { token: 'invalid_token' };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('adminMiddleware passes for admin user', async () => {
    mockRequest.user = { role: 'admin' };

    adminMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  test('adminMiddleware fails for non-admin user', async () => {
    mockRequest.user = { role: 'user' };

    adminMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Access denied. Admin privileges required.' });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});