export interface User {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: 'customer' | 'farmer' | 'admin';
  location?: string;
  createdAt?: Date;
  profileImage?: string; // URL to profile image
  // phoneVerified:any;
}