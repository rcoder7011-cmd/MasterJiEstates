/**
 * Common Application Types
 */

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface UserProfilePlaceholder {
  id: string;
  name: string;
  phone: string;
  role: 'buyer' | 'seller' | 'admin';
}

