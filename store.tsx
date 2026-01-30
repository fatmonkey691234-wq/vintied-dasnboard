import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppData, Purchase, Sale } from './types';
import { supabase } from './supabaseClient';

interface DataContextType {
  purchases: Purchase[];
  sales: Sale[];
  isLoading: boolean;
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

  // Fetch data from Supabase on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (purchasesError) throw purchasesError;
      if (salesError) throw salesError;

      setData({
        purchases: purchasesData as Purchase[] || [],
        sales: salesData as Sale[] || []
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error connecting to the database. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const addPurchase = async (purchase: Purchase) => {
    try {
      // Optimistic update (update UI immediately)
      setData(prev => ({ ...prev, purchases: [purchase, ...prev.purchases] }));

      const { error } = await supabase.from('purchases').insert([purchase]);
      if (error) throw error;
    } catch (error) {
      console.error('Error adding purchase:', error);
      alert('Failed to save purchase to database.');
      fetchData(); // Revert to server state on error
    }
  };

  const addSale = async (sale: Sale) => {
    try {
      setData(prev => ({ ...prev, sales: [sale, ...prev.sales] }));
      
      const { error } = await supabase.from('sales').insert([sale]);
      if (error) throw error;
    } catch (error) {
      console.error('Error adding sale:', error);
      alert('Failed to save sale to database.');
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
      } catch (error) {
        console.error('Error deleting purchase:', error);
        alert('Failed to delete purchase.');
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
      } catch (error) {
        console.error('Error deleting sale:', error);
        alert('Failed to delete sale.');
        fetchData();
      }
    }
  };

  const resetData = async () => {
    if (window.confirm("WARNING: This will delete ALL data from the database. Continue?")) {
      try {
        setData({ purchases: [], sales: [] });

        // Delete all rows where id is not null (effectively all rows)
        const { error: pError } = await supabase.from('purchases').delete().neq('id', '0');
        const { error: sError } = await supabase.from('sales').delete().neq('id', '0');

        if (pError || sError) throw new Error('Failed to reset database');
      } catch (error) {
        console.error('Error resetting data:', error);
        fetchData();
      }
    }
  };

  return (
    <DataContext.Provider value={{ ...data, isLoading, addPurchase, addSale, deletePurchase, deleteSale, resetData }}>
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