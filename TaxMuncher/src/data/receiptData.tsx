export type Receipt = {
  id: string;

  profile_id: string;

  merchant_name: string;

  purchase_date: string;

  subtotal: number;

  sales_tax: number;

  total: number;

  payment_method: string;

  category: string;

  notes?: string;

  image_url?: string;

  ai_processed?: boolean;

  created_at?: string;
};
