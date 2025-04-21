import { Timestamp } from '@angular/fire/firestore';

export interface Message {
  id?: string;
  senderId: string;
  receiverId: string;
  content?: string;
  imageUrl?: string;
  timestamp: Timestamp;
  read: boolean;
  // isAdminMessage?: boolean; // Add this optional property

}