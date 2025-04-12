export interface User {
rating: any;
    uid: string;
    email: string;
    displayName?: string;
    phoneNumber?: string;
    role: 'customer' | 'farmer' | 'admin';
    location?: string;
    createdAt?:Date;
  }
  