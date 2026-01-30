import React, { useState } from 'react';
import { DataProvider, useData } from './store';
import { Dashboard } from './components/Dashboard';
import { AddPurchaseForm } from './components/AddPurchaseForm';
import { AddSaleForm } from './components/AddSaleForm';
import { ItemsTable } from './components/ItemsTable';
import { HMRCView } from './components/HMRCView';
import { ViewState } from './types';
import { LayoutDashboard, PlusCircle, ShoppingCart, Table2, FileText, Menu, X, Trash, Loader2, AlertTriangle, Database } from 'lucide-react';

const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resetData, isLoading, error } = useData();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add-purchase', label: 'Add Purchase', icon: PlusCircle },
    { id: 'add-sale', label: 'Add Sale', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory Items', icon: Table2 },
    { id: 'hmrc', label: 'HMRC & Tax', icon: FileText },
  ];

  const handleNav = (v: string) => {
    setView(v as ViewState);
    setIsMobileMenuOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading your data...</p>
        </div>
      </div>
    );
  }

  // --- CRITICAL ERROR STATE ---
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-lg shadow-lg border-l-4 border-rose-600">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-rose-600" />
            <h1 className="text-xl font-bold text-slate-800">Database Connection Error</h1>
          </div>
          <p className="text-slate-600 mb-6 font-medium">
             {error}
          </p>
          
          <div className="bg-slate-50 p-4 rounded text-sm text-slate-700 mb-6 border border-slate-200">
             <div className="flex items-center gap-2 font-bold mb-2">
               <Database className="w-4 h-4"/> How to fix:
             </div>
             <ol className="list-decimal list-inside space-y-2">
               <li>Open the file <code>db_setup.sql</code> in your project.</li>
               <li>Copy all the code from that file.</li>
               <li>Go to your Supabase Dashboard &gt; SQL Editor.</li>
               <li>Paste the code and click <strong>Run</strong>.</li>
             </ol>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded transition-colors"
          >
            I've run the SQL - Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
        <h1 className="font-bold">Resell Tracker UK</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-0 z-20 bg-slate-900 text-white w-64 p-6 transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <h1 className="text-2xl font-bold mb-8 hidden md:block">Resell Tracker</h1>
        <nav className="space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  view === item.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <button 
            onClick={resetData}
            className="w-full flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-white rounded-lg text-xs transition-colors"
          >
            <Trash className="w-3 h-3" /> Reset All Database
          </button>
          <div className="text-center text-xs text-slate-500">
            v1.3.1 • Supabase Connected
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-50 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto">
          {view === 'dashboard' && <Dashboard />}
          {view === 'add-purchase' && <AddPurchaseForm onComplete={() => setView('inventory')} />}
          {view === 'add-sale' && <AddSaleForm onComplete={() => setView('inventory')} />}
          {view === 'inventory' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
              <ItemsTable />
            </div>
          )}
          {view === 'hmrc' && <HMRCView />}
        </div>
      </main>

    </div>
  );
};

// Wrap main app in Data Provider
const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;