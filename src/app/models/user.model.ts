export interface User {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: 'customer' | 'farmer' | 'admin';
  location?: string;
  createdAt?: Date;
  profileImage?: string | null; // Updated to allow null value
  // phoneVerified:any;
}