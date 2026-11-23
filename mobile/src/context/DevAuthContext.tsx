/**
 * Development Role Context & Mock Auth Mechanism
 *
 * NOTE: DEVELOPMENT ONLY
 * This provider establishes a lightweight role state ('customer' | 'admin')
 * and founder preview state to preview role-based routing and guard behavior.
 * In production builds, this entire mechanism is inert and strictly relies on
 * backend-verified JWT session tokens.
 */

import React, { createContext, useContext, useState, useMemo } from 'react';

export type UserRole = 'customer' | 'admin';

export interface DevAuthContextType {
  userRole: UserRole;
  isAdmin: boolean;
  isFounder: boolean;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
  setFounder: (val: boolean) => void;
  toggleFounder: () => void;
}

const DevAuthContext = createContext<DevAuthContextType | undefined>(undefined);

export const DevAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [isFounder, setIsFounder] = useState<boolean>(false);

  const value = useMemo(
    () => ({
      userRole,
      isAdmin: userRole === 'admin',
      isFounder,
      setRole: (role: UserRole) => setUserRole(role),
      toggleRole: () => setUserRole((prev) => (prev === 'admin' ? 'customer' : 'admin')),
      setFounder: (val: boolean) => setIsFounder(val),
      toggleFounder: () => setIsFounder((prev) => !prev),
    }),
    [userRole, isFounder]
  );

  return <DevAuthContext.Provider value={value}>{children}</DevAuthContext.Provider>;
};

export function useDevAuth(): DevAuthContextType {
  const context = useContext(DevAuthContext);
  if (!context) {
    throw new Error('useDevAuth must be used within a DevAuthProvider');
  }
  return context;
}
