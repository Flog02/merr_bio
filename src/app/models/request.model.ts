import { Timestamp } from '@angular/fire/firestore';

export interface PurchaseRequest {
  id?: string;
  productId: string;
  customerId: string;
  farmerId: string;
  quantity: number;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: Timestamp;
  message?: string;
  images?: string[];

}