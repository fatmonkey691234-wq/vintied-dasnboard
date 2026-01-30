import React, { useState } from 'react';
import { useData } from '../store';
import { generateId, getRemainingStock } from '../utils';
import { PLATFORM_OPTIONS } from '../constants';

interface Props {
  onComplete: () => void;
}

export const AddSaleForm: React.FC<Props> = ({ onComplete }) => {
  const { purchases, sales, addSale } = useData();
  
  // Filter purchases that actually have stock remaining
  const stockOptions = purchases.filter(p => getRemainingStock(p, sales) > 0);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    purchaseId: '',
    platform: PLATFORM_OPTIONS[0],
    quantitySold: 1,
    salePricePerUnit: 0,
    buyerPostagePaid: 0,
    actualPostageCost: 0,
    platformFees: 0
  });

  const selectedPurchase = purchases.find(p => p.id === formData.purchaseId);
  const maxQty = selectedPurchase ? getRemainingStock(selectedPurchase, sales) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.purchaseId) {
      alert("Please select an item.");
      return;
    }
    
    addSale({
      id: generateId(),
      purchaseId: formData.purchaseId,
      date: formData.date,
      platform: formData.platform,
      quantitySold: Number(formData.quantitySold),
      salePricePerUnit: Number(formData.salePricePerUnit),
      buyerPostagePaid: Number(formData.buyerPostagePaid),
      actualPostageCost: Number(formData.actualPostageCost),
      platformFees: Number(formData.platformFees)
    });
    onComplete();
  };

  const inputClass = "w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  if (stockOptions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">No Stock Available</h2>
        <p className="text-slate-600 mb-4">You need to add a purchase before you can record a sale.</p>
        <button 
          onClick={onComplete}
          className="text-blue-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Record New Sale</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Item Selection */}
        <div>
          <label className={labelClass}>Which item did you sell?</label>
          <select 
            required
            className={inputClass}
            value={formData.purchaseId}
            onChange={e => setFormData({...formData, purchaseId: e.target.value})}
          >
            <option value="">-- Select Item from Stock --</option>
            {stockOptions.map(p => (
              <option key={p.id} value={p.id}>
                {p.itemName} ({getRemainingStock(p, sales)} left) - Bought {p.date}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date Sold</label>
            <input 
              type="date" 
              required
              className={inputClass}
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div>
            <label className={labelClass}>Platform</label>
            <select 
              className={inputClass}
              value={formData.platform}
              onChange={e => setFormData({...formData, platform: e.target.value})}
            >
              {PLATFORM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Quantity Sold</label>
            <input 
              type="number" 
              min="1"
              max={maxQty}
              required
              className={inputClass}
              value={formData.quantitySold} 
              onChange={e => setFormData({...formData, quantitySold: Number(e.target.value)})}
            />
            {selectedPurchase && <p className="text-xs text-slate-500 mt-1">Max: {maxQty}</p>}
          </div>
          <div>
            <label className={labelClass}>Sale Price (per item) (£)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              required
              className={inputClass}
              value={formData.salePricePerUnit} 
              onChange={e => setFormData({...formData, salePricePerUnit: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className={labelClass}>Platform Fees (£)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              required
              className={inputClass}
              value={formData.platformFees} 
              onChange={e => setFormData({...formData, platformFees: Number(e.target.value)})}
            />
            <p className="text-xs text-slate-500 mt-1">Vinted fees, Depop fee, etc.</p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Postage Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Buyer Paid for Postage (£)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                required
                className={inputClass}
                value={formData.buyerPostagePaid} 
                onChange={e => setFormData({...formData, buyerPostagePaid: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className={labelClass}>Actual Postage Cost (£)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                required
                className={inputClass}
                value={formData.actualPostageCost} 
                onChange={e => setFormData({...formData, actualPostageCost: Number(e.target.value)})}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button 
            type="submit" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded transition-colors"
          >
            Record Sale
          </button>
          <button 
            type="button" 
            onClick={onComplete}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-6 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
