import React from 'react';
import { useData } from '../store';
import { formatCurrency } from '../utils';
import { Trash2 } from 'lucide-react';

export const ItemsTable: React.FC = () => {
  const { purchases, sales, deletePurchase } = useData();

  // Helper to calculate profit for a specific purchase batch
  const getBatchStats = (purchaseId: string, quantityBought: number, unitCost: number, shipping: number) => {
    const linkedSales = sales.filter(s => s.purchaseId === purchaseId);
    
    const quantitySold = linkedSales.reduce((sum, s) => sum + Number(s.quantitySold), 0);
    const quantityLeft = quantityBought - quantitySold;
    
    // Revenue from these items
    const revenue = linkedSales.reduce((sum, s) => {
      return sum + (Number(s.salePricePerUnit) * Number(s.quantitySold)) + Number(s.buyerPostagePaid);
    }, 0);
    
    // Expenses directly linked to these sales (platform fees + postage out)
    const saleExpenses = linkedSales.reduce((sum, s) => {
      return sum + Number(s.platformFees) + Number(s.actualPostageCost);
    }, 0);
    
    // Cost of goods for the WHOLE batch (Cash Basis approach for simplicity here)
    const totalBatchCost = (Number(unitCost) * Number(quantityBought)) + Number(shipping);
    
    const profit = revenue - totalBatchCost - saleExpenses;

    return { quantitySold, quantityLeft, profit };
  };

  if (purchases.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <p className="text-slate-500">No purchases recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-xs">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Item</th>
              <th className="p-4">Bought</th>
              <th className="p-4">Cost/Unit</th>
              <th className="p-4">Sold</th>
              <th className="p-4">Remaining</th>
              <th className="p-4">Profit (Batch)</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchases.map(p => {
              const stats = getBatchStats(p.id, p.quantity, p.costPerUnit, p.shippingFees);
              return (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 whitespace-nowrap">{p.date}</td>
                  <td className="p-4 font-medium text-slate-900">{p.itemName}</td>
                  <td className="p-4">{p.quantity}</td>
                  <td className="p-4">{formatCurrency(p.costPerUnit)}</td>
                  <td className="p-4">{stats.quantitySold}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${stats.quantityLeft > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {stats.quantityLeft}
                    </span>
                  </td>
                  <td className={`p-4 font-bold ${stats.profit >= 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {formatCurrency(stats.profit)}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePurchase(p.id);
                      }}
                      className="p-2 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Purchase"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};