import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorMiddleware';

const rolePermissions: { [key: string]: string[] } = {
  admin: [
    'manage_users', 'manage_games', 'manage_tournaments', 'view_reports', 
    'manage_platform_settings', 'manage_payments', 'view_analytics',
    'manage_wagers', 'manage_subscriptions', 'manage_roles'
  ],
  moderator: [
    'manage_games', 'manage_tournaments', 'view_reports', 
    'view_analytics', 'manage_wagers'
  ],
  support: [
    'view_users', 'view_games', 'view_tournaments', 'view_reports',
    'view_wagers', 'manage_support_tickets'
  ],
  player: [
    'participate_tournaments', 'view_own_profile', 'manage_own_wagers',
    'view_public_games', 'view_public_tournaments'
  ]
};

export const rbacMiddleware = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !rolePermissions[userRole]?.includes(requiredPermission)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

export const hasPermission = (userRole: string, permission: string): boolean => {
  return rolePermissions[userRole]?.includes(permission) || false;
};

export const getRolePermissions = (role: string): string[] => {
  return rolePermissions[role] || [];
};

export const getAllRoles = (): string[] => {
  return Object.keys(rolePermissions);
};

export const getAllPermissions = (): string[] => {
  return Array.from(new Set(Object.values(rolePermissions).flat()));
};