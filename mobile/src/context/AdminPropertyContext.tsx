/**
 * Admin Property Context & Provider — src/context/AdminPropertyContext.tsx
 * Manages live administrative inventory state across dashboard, catalog, and edit workflows.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  PropertyItem,
  PropertyStatus,
  CreatePropertyInput,
} from '../types/property';
import {
  getAdminProperties,
  createProperty as serviceCreateProperty,
  updateProperty as serviceUpdateProperty,
  deleteProperty as serviceDeleteProperty,
  updatePropertyStatus as serviceUpdateStatus,
} from '../services/adminPropertyService';

export interface AdminPropertyContextType {
  properties: PropertyItem[];
  metrics: {
    total: number;
    available: number;
    sold: number;
    rented: number;
  };
  isLoading: boolean;
  refresh: () => Promise<void>;
  addProperty: (input: CreatePropertyInput) => Promise<PropertyItem>;
  editProperty: (id: string, updates: Partial<PropertyItem>) => Promise<PropertyItem | null>;
  removeProperty: (id: string) => Promise<boolean>;
  changeStatus: (id: string, status: PropertyStatus) => Promise<PropertyItem | null>;
  getPropertyById: (id: string) => PropertyItem | null;
}

const AdminPropertyContext = createContext<AdminPropertyContextType | undefined>(undefined);

export function AdminPropertyProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load properties on mount
  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      try {
        const items = await getAdminProperties();
        if (isMounted) {
          setProperties(items);
        }
      } catch (err) {
        if (__DEV__) {
          console.warn('[AdminPropertyContext] Error loading properties:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await getAdminProperties();
      setProperties(items);
    } catch (err) {
      if (__DEV__) {
        console.warn('[AdminPropertyContext] Error loading properties:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addProperty = useCallback(async (input: CreatePropertyInput): Promise<PropertyItem> => {
    const created = await serviceCreateProperty(input);
    setProperties((prev) => [created, ...prev]);
    return created;
  }, []);

  const editProperty = useCallback(
    async (id: string, updates: Partial<PropertyItem>): Promise<PropertyItem | null> => {
      const updated = await serviceUpdateProperty(id, updates);
      if (updated) {
        setProperties((prev) =>
          prev.map((item) => (item.id === id ? updated : item))
        );
      }
      return updated;
    },
    []
  );

  const removeProperty = useCallback(async (id: string): Promise<boolean> => {
    const success = await serviceDeleteProperty(id);
    if (success) {
      setProperties((prev) => prev.filter((item) => item.id !== id));
    }
    return success;
  }, []);

  const changeStatus = useCallback(
    async (id: string, status: PropertyStatus): Promise<PropertyItem | null> => {
      const updated = await serviceUpdateStatus(id, status);
      if (updated) {
        setProperties((prev) =>
          prev.map((item) => (item.id === id ? updated : item))
        );
      }
      return updated;
    },
    []
  );

  const getPropertyById = useCallback(
    (id: string): PropertyItem | null => {
      return properties.find((item) => item.id === id) || null;
    },
    [properties]
  );

  const metrics = useMemo(() => {
    return {
      total: properties.length,
      available: properties.filter((p) => p.status === 'available').length,
      sold: properties.filter((p) => p.status === 'sold').length,
      rented: properties.filter((p) => p.status === 'rented').length,
    };
  }, [properties]);

  const value = useMemo(
    () => ({
      properties,
      metrics,
      isLoading,
      refresh,
      addProperty,
      editProperty,
      removeProperty,
      changeStatus,
      getPropertyById,
    }),
    [
      properties,
      metrics,
      isLoading,
      refresh,
      addProperty,
      editProperty,
      removeProperty,
      changeStatus,
      getPropertyById,
    ]
  );

  return (
    <AdminPropertyContext.Provider value={value}>
      {children}
    </AdminPropertyContext.Provider>
  );
}

export function useAdminProperties() {
  const context = useContext(AdminPropertyContext);
  if (!context) {
    throw new Error('useAdminProperties must be used within an AdminPropertyProvider');
  }
  return context;
}
