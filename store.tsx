import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppData, Purchase, Sale } from './types';

interface DataContextType {
  purchases: Purchase[];
  sales: Sale[];
  addPurchase: (purchase: Purchase) => void;
  addSale: (sale: Sale) => void;
  deletePurchase: (id: string) => void;
  deleteSale: (id: string) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'resell_tracker_data_v1';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with default empty arrays
  const [data, setData] = useState<AppData>({
    purchases: [],
    sales: []
  });
  
  // Track if we have attempted to load data yet. 
  // This prevents the app from saving the initial empty state over existing data.
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure arrays exist even if local storage is malformed
        setData({
          purchases: Array.isArray(parsed.purchases) ? parsed.purchases : [],
          sales: Array.isArray(parsed.sales) ? parsed.sales : []
        });
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage whenever data changes, but ONLY after initial load
  useEffect(() => {
    if (!isLoaded) return;
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data, isLoaded]);

  const addPurchase = (purchase: Purchase) => {
    setData(prev => ({ ...prev, purchases: [purchase, ...(prev.purchases || [])] }));
  };

  const addSale = (sale: Sale) => {
    setData(prev => ({ ...prev, sales: [sale, ...(prev.sales || [])] }));
  };

  const deletePurchase = (id: string) => {
    if (window.confirm("Are you sure? This will delete the purchase record.")) {
      setData(prev => ({
        ...prev,
        purchases: (prev.purchases || []).filter(p => p.id !== id)
      }));
    }
  };

  const deleteSale = (id: string) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      setData(prev => ({
        ...prev,
        sales: (prev.sales || []).filter(s => s.id !== id)
      }));
    }
  };

  // Helper for developers to clear data while testing
  const resetData = () => {
    if (window.confirm("WARNING: This will delete all data. Continue?")) {
      setData({ purchases: [], sales: [] });
    }
  };

  return (
    <DataContext.Provider value={{ ...data, addPurchase, addSale, deletePurchase, deleteSale, resetData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};