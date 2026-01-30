import React, { useState } from 'react';
import { useData } from '../store';
import { generateId } from '../utils';
import { DEFAULT_SUPPLIER } from '../constants';
import { ViewState } from '../types';

interface Props {
  onComplete: () => void;
}

export const AddPurchaseForm: React.FC<Props> = ({ onComplete }) => {
  const { addPurchase } = useData();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier: DEFAULT_SUPPLIER,
    itemName: '',
    quantity: 1,
    costPerUnit: 0,
    shippingFees: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPurchase({
      id: generateId(),
      date: formData.date,
      supplier: formData.supplier,
      itemName: formData.itemName,
      quantity: Number(formData.quantity),
      costPerUnit: Number(formData.costPerUnit),
      shippingFees: Number(formData.shippingFees)
    });
    onComplete();
  };

  const inputClass = "w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Add New Purchase</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date Bought</label>
            <input 
              type="date" 
              required
              className={inputClass}
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div>
            <label className={labelClass}>Supplier</label>
            <input 
              type="text" 
              required
              placeholder="e.g. AliExpress"
              className={inputClass}
              value={formData.supplier} 
              onChange={e => setFormData({...formData, supplier: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Item Name / Description</label>
          <input 
            type="text" 
            required
            placeholder="e.g. Vintage style sunglasses"
            className={inputClass}
            value={formData.itemName} 
            onChange={e => setFormData({...formData, itemName: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Quantity Bought</label>
            <input 
              type="number" 
              min="1"
              required
              className={inputClass}
              value={formData.quantity} 
              onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className={labelClass}>Cost Per Unit (£)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              required
              className={inputClass}
              value={formData.costPerUnit} 
              onChange={e => setFormData({...formData, costPerUnit: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className={labelClass}>Total Shipping/Fees (£)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              required
              className={inputClass}
              value={formData.shippingFees} 
              onChange={e => setFormData({...formData, shippingFees: Number(e.target.value)})}
            />
            <p className="text-xs text-slate-500 mt-1">Total postage paid to get these items to you.</p>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition-colors"
          >
            Save Purchase
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
