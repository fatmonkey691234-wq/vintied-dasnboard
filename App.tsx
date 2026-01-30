import React, { useState } from 'react';
import { DataProvider } from './store';
import { Dashboard } from './components/Dashboard';
import { AddPurchaseForm } from './components/AddPurchaseForm';
import { AddSaleForm } from './components/AddSaleForm';
import { ItemsTable } from './components/ItemsTable';
import { HMRCView } from './components/HMRCView';
import { ViewState } from './types';
import { LayoutDashboard, PlusCircle, ShoppingCart, Table2, FileText, Menu, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-slate-800 p-4 rounded-lg text-xs text-slate-400">
            <p>Data saved to browser.</p>
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
