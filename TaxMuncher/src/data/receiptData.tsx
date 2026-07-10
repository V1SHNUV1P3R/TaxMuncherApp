export type Receipt = {
  id: string;

  profile_id: string;

  merchant: string;

  purchase_date: string;

  purchase_time: string;

  subtotal: number;

  tax: number;

  total: number;

  payment_method: string;

  category: string;

  image_url: string;

  created_at?: string;
};

export const INITIAL_RECEIPTS: Receipt[] = [];