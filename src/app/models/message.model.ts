import { Timestamp } from '@angular/fire/firestore';

export interface Message {
    id?: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: Timestamp;
    read: boolean;
  }