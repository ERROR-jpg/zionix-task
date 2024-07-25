export interface PriceBreak {
  Quantity?: number;
  quantity?: number;
  Price?: string;
  price?: string;
  from?: number;
  to?: number;
  cost?: number;
}
export interface PartResult {
  partNumber: string;
  manufacturer: string;
  dataProvider: string;
  volume: number;
  unitPrice: number;
  totalPrice: number;
  priceBreaks: PriceBreak[];
}

export interface CartItem extends PartResult {
  id: string;
}