export interface PartResult {
    partNumber: string;
    manufacturer: string;
    dataProvider: string;
    volume: number;
    unitPrice?: number;
    totalPrice?: number;
  }
  
  export interface CartItem extends PartResult {
    id: string;
  }