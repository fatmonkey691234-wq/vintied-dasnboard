import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppData, Purchase, Sale } from './types';
import { supabase } from './supabaseClient';

interface DataContextType {
  purchases: Purchase[];
  sales: Sale[];
  isLoading: boolean;
  error: string | null;
  addPurchase: (purchase: Purchase) => Promise<void>;
  addSale: (sale: Sale) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  resetData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>({
    purchases: [],
    sales: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Supabase on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch Purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (purchasesError) throw purchasesError;

      // Fetch Sales
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (salesError) throw salesError;

      // Sanitize Data: Ensure all numeric fields are actually numbers (Supabase can return strings for numeric types)
      const sanitizedPurchases = (purchasesData || []).map((p: any) => ({
        ...p,
        quantity: Number(p.quantity) || 0,
        costPerUnit: Number(p.costPerUnit) || 0,
        shippingFees: Number(p.shippingFees) || 0
      }));

      const sanitizedSales = (salesData || []).map((s: any) => ({
        ...s,
        quantitySold: Number(s.quantitySold) || 0,
        salePricePerUnit: Number(s.salePricePerUnit) || 0,
        buyerPostagePaid: Number(s.buyerPostagePaid) || 0,
        actualPostageCost: Number(s.actualPostageCost) || 0,
        platformFees: Number(s.platformFees) || 0
      }));

      setData({
        purchases: sanitizedPurchases as Purchase[],
        sales: sanitizedSales as Sale[]
      });

    } catch (err: any) {
      console.error('Error fetching data:', err);
      // specific check for missing table error (Postgres code 42P01)
      if (err.code === '42P01') {
        setError("Database tables not found. Please run the db_setup.sql script.");
      } else if (err.message === 'Failed to fetch') {
         setError("Connection failed. Check internet or Supabase URL.");
      } else {
        setError(err.message || 'Unknown error loading data.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addPurchase = async (purchase: Purchase) => {
    try {
      // Optimistic update
      setData(prev => ({ ...prev, purchases: [purchase, ...prev.purchases] }));

      const { error } = await supabase.from('purchases').insert([purchase]);
      if (error) throw error;
    } catch (err: any) {
      console.error('Error adding purchase:', err);
      alert(`Failed to save: ${err.message}`);
      fetchData(); // Revert to server state
    }
  };

  const addSale = async (sale: Sale) => {
    try {
      setData(prev => ({ ...prev, sales: [sale, ...prev.sales] }));
      
      const { error } = await supabase.from('sales').insert([sale]);
      if (error) throw error;
    } catch (err: any) {
      console.error('Error adding sale:', err);
      alert(`Failed to save: ${err.message}`);
      fetchData();
    }
  };

  const deletePurchase = async (id: string) => {
    if (window.confirm("Are you sure? This will delete the purchase record.")) {
      try {
        setData(prev => ({
          ...prev,
          purchases: prev.purchases.filter(p => p.id !== id)
        }));

        const { error } = await supabase.from('purchases').delete().eq('id', id);
        if (error) throw error;
      } catch (err: any) {
        console.error('Error deleting purchase:', err);
        alert('Failed to delete.');
        fetchData();
      }
    }
  };

  const deleteSale = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        setData(prev => ({
          ...prev,
          sales: prev.sales.filter(s => s.id !== id)
        }));

        const { error } = await supabase.from('sales').delete().eq('id', id);
        if (error) throw error;
      } catch (err: any) {
        console.error('Error deleting sale:', err);
        alert('Failed to delete.');
        fetchData();
      }
    }
  };

  const resetData = async () => {
    if (window.confirm("WARNING: This will delete ALL data from the database. Continue?")) {
      try {
        setData({ purchases: [], sales: [] });

        const { error: pError } = await supabase.from('purchases').delete().neq('id', '0');
        const { error: sError } = await supabase.from('sales').delete().neq('id', '0');

        if (pError) throw pError;
        if (sError) throw sError;
      } catch (err: any) {
        console.error('Error resetting data:', err);
        alert('Failed to reset database: ' + err.message);
        fetchData();
      }
    }
  };

  return (
    <DataContext.Provider value={{ ...data, isLoading, error, addPurchase, addSale, deletePurchase, deleteSale, resetData }}>
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