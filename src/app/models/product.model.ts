// src/app/models/product.model.ts
import { Timestamp } from '@angular/fire/firestore';

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
  unit: string; // kg, piece, etc.
  farmerId: string;
  timestamp: Timestamp;
  approved: boolean;
  images?: string[];
}