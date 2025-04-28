export interface User {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: 'customer' | 'farmer' | 'admin';
  location?: string;
  createdAt?: Date;
  profileImage?: string | null;
  rating?: number;
  isVerified?: boolean;
  verificationSentAt?: Date; // New field to track when verification was sent
}