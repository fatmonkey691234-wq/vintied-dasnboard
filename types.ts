// Defines the structure of a single batch of items bought
export interface Purchase {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  supplier: string;
  itemName: string;
  quantity: number;
  costPerUnit: number;
  shippingFees: number; // Total postage/import fees for this batch
}

// Defines a sale of an item
export interface Sale {
  id: string;
  purchaseId: string; // Links back to the original purchase to track stock
  date: string;
  platform: string; // e.g., Vinted, Depop
  quantitySold: number;
  salePricePerUnit: number;
  buyerPostagePaid: number; // How much the buyer paid for shipping
  actualPostageCost: number; // How much you actually paid to ship it
  platformFees: number; // Vinted/Depop fees
}

export interface AppData {
  purchases: Purchase[];
  sales: Sale[];
}

export type ViewState = 'dashboard' | 'inventory' | 'add-purchase' | 'add-sale' | 'hmrc';
