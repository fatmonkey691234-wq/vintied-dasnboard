import React from 'react';
import { useData } from '../store';
import { TAX_YEAR_START, TAX_YEAR_END, TRADING_ALLOWANCE_LIMIT } from '../constants';
import { isInTaxYear, formatCurrency } from '../utils';
import { TrendingUp, ShoppingBag, Package, AlertCircle, Info } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { purchases, sales } = useData();

  // Filter for current tax year
  const yearPurchases = purchases.filter(p => isInTaxYear(p.date, TAX_YEAR_START, TAX_YEAR_END));
  const yearSales = sales.filter(s => isInTaxYear(s.date, TAX_YEAR_START, TAX_YEAR_END));

  // --- CALCULATIONS (Cash Basis) ---
  // We use Number() casting to ensure safety against potential data type issues in storage

  // 1. Total Sales Revenue (Money In)
  // Revenue = (Sale Price * Qty) + Postage money received from buyer
  const totalRevenue = yearSales.reduce((sum, s) => {
    return sum + (Number(s.salePricePerUnit) * Number(s.quantitySold)) + Number(s.buyerPostagePaid);
  }, 0);

  // 2. Cost of Goods (Cash Basis: Money spent on stock THIS YEAR)
  // In Cash Basis accounting, you deduct the cost of stock when you buy it, not when you sell it.
  const totalStockCost = yearPurchases.reduce((sum, p) => {
    return sum + (Number(p.costPerUnit) * Number(p.quantity)) + Number(p.shippingFees);
  }, 0);

  // 3. Selling Expenses (Fees + Actual Postage Paid)
  const totalSellingExpenses = yearSales.reduce((sum, s) => {
    return sum + Number(s.platformFees) + Number(s.actualPostageCost);
  }, 0);

  // 4. Net Profit (Cash Basis)
  // Revenue - (Stock bought this year + Fees + Postage costs)
  const netProfit = totalRevenue - totalStockCost - totalSellingExpenses;

  // 5. Trading Allowance Progress
  const tradingAllowancePercent = Math.min((totalRevenue / TRADING_ALLOWANCE_LIMIT) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-sm text-slate-500">Tax Year: {TAX_YEAR_START} to {TAX_YEAR_END}</p>
        </div>
        <div className="bg-blue-50 text-blue-800 text-xs px-3 py-2 rounded-lg flex items-start gap-2 max-w-sm">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            This dashboard uses <strong>Cash Basis Accounting</strong>. 
            It compares money received vs. money spent <em>within these dates</em>. 
            If you just bought stock but haven't sold it yet, your profit may look low or negative. This is normal for tax purposes.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-emerald-500 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Total Revenue</h3>
            <TrendingUp className="text-emerald-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-slate-400 mt-1">Sales + Postage Received</p>
        </div>

        {/* Expenses Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-rose-500 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Total Costs</h3>
            <ShoppingBag className="text-rose-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalStockCost + totalSellingExpenses)}</p>
          <p className="text-xs text-slate-400 mt-1">Stock bought + Fees + Postage Paid</p>
        </div>

        {/* Profit Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-blue-500 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Est. Net Profit</h3>
            <Package className="text-blue-500 w-5 h-5" />
          </div>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(netProfit)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Revenue - All Costs</p>
        </div>
      </div>

      {/* Trading Allowance Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-800">Trading Allowance Tracker</h3>
          <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
            Limit: {formatCurrency(TRADING_ALLOWANCE_LIMIT)}
          </span>
        </div>
        
        <p className="text-sm text-slate-600 mb-4">
          UK Trading Allowance lets you earn up to £1,000 in revenue tax-free.
        </p>

        <div className="w-full bg-slate-100 rounded-full h-4 mb-2 overflow-hidden">
          <div 
            className={`h-4 rounded-full transition-all duration-500 ${tradingAllowancePercent >= 100 ? 'bg-rose-500' : 'bg-emerald-500'}`}
            style={{ width: `${tradingAllowancePercent}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-slate-500">
          <span>{formatCurrency(totalRevenue)} earned</span>
          <span>{tradingAllowancePercent >= 100 ? 'Limit Reached' : `${(100 - tradingAllowancePercent).toFixed(1)}% remaining`}</span>
        </div>

        {totalRevenue > TRADING_ALLOWANCE_LIMIT && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              You have exceeded the £1,000 trading allowance. You likely need to register for Self Assessment. 
              Please verify with a parent or accountant.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};