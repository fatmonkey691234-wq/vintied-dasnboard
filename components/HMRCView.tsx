import React from 'react';
import { useData } from '../store';
import { TAX_YEAR_START, TAX_YEAR_END } from '../constants';
import { isInTaxYear, formatCurrency } from '../utils';
import { Download, ShieldCheck } from 'lucide-react';

export const HMRCView: React.FC = () => {
  const { purchases, sales } = useData();

  // Filter for Tax Year
  const yearPurchases = purchases.filter(p => isInTaxYear(p.date, TAX_YEAR_START, TAX_YEAR_END));
  const yearSales = sales.filter(s => isInTaxYear(s.date, TAX_YEAR_START, TAX_YEAR_END));

  // --- HMRC CASH BASIS CALCULATIONS ---
  
  // Income: Total money received (Sales + Postage charged to buyer)
  const totalIncome = yearSales.reduce((sum, s) => {
    return sum + (Number(s.salePricePerUnit) * Number(s.quantitySold)) + Number(s.buyerPostagePaid);
  }, 0);

  // Expenses: 
  // 1. All stock bought in this period (even if not sold yet, under simple cash basis)
  const stockExpenses = yearPurchases.reduce((sum, p) => {
    return sum + (Number(p.costPerUnit) * Number(p.quantity)) + Number(p.shippingFees);
  }, 0);
  
  // 2. Allowable expenses linked to sales (Platform fees, postage paid)
  const operationExpenses = yearSales.reduce((sum, s) => {
    return sum + Number(s.platformFees) + Number(s.actualPostageCost);
  }, 0);

  const totalExpenses = stockExpenses + operationExpenses;
  const netProfit = totalIncome - totalExpenses;

  // -------------------------------------------------------------
  // CSV EXPORT LOGIC FOR PARENT/ACCOUNTANT
  // -------------------------------------------------------------
  const downloadCSV = () => {
    // Headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Date,Description,Money In,Money Out\n";

    // Add Purchases (Money Out)
    yearPurchases.forEach(p => {
      const cost = (Number(p.costPerUnit) * Number(p.quantity)) + Number(p.shippingFees);
      csvContent += `Purchase,${p.date},"${p.itemName} (x${p.quantity}) from ${p.supplier}",,${cost.toFixed(2)}\n`;
    });

    // Add Sales (Money In & Fees Out)
    yearSales.forEach(s => {
      const revenue = (Number(s.salePricePerUnit) * Number(s.quantitySold)) + Number(s.buyerPostagePaid);
      const expenses = Number(s.platformFees) + Number(s.actualPostageCost);
      const itemName = purchases.find(p => p.id === s.purchaseId)?.itemName || "Unknown Item";
      
      // Row for the sale revenue
      csvContent += `Sale,${s.date},Sold: ${itemName} on ${s.platform},${revenue.toFixed(2)},\n`;
      // Row for the expense (Fees/Postage) linked to this sale
      csvContent += `Sale Expense,${s.date},Fees & Postage for ${itemName},,${expenses.toFixed(2)}\n`;
    });

    // Trigger Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tax_return_${TAX_YEAR_START}_${TAX_YEAR_END}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400"/> HMRC Summary
        </h2>
        <p className="text-slate-300 text-sm mt-1">
          Cash Basis Accounting: {TAX_YEAR_START} to {TAX_YEAR_END}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="p-4 font-medium text-slate-600">Total Income (Turnover)</td>
              <td className="p-4 text-right font-bold text-slate-800">{formatCurrency(totalIncome)}</td>
            </tr>
            <tr>
              <td className="p-4 font-medium text-slate-600">Total Allowable Expenses</td>
              <td className="p-4 text-right font-bold text-rose-600">-{formatCurrency(totalExpenses)}</td>
            </tr>
            <tr className="bg-slate-50">
              <td className="p-4 font-bold text-slate-800 text-lg">Net Profit / Loss</td>
              <td className={`p-4 text-right font-bold text-lg ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(netProfit)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Trading Allowance Note */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800">
        <strong>Information Note:</strong> If your Total Income (Turnover) is <strong>£1,000 or less</strong>, you generally do not need to register for Self Assessment due to the UK Trading Allowance. If it is over £1,000, you must register.
        <br/><br/>
        <em>This app is for record-keeping only and does not constitute legal or financial advice.</em>
      </div>

      <button 
        onClick={downloadCSV}
        className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-2 px-4 rounded transition-colors"
      >
        <Download className="w-4 h-4" /> Download CSV for Accountant
      </button>
    </div>
  );
};