import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  Timestamp
} from '@angular/fire/firestore';
import { Auth, deleteUser } from '@angular/fire/auth';
import { firstValueFrom, interval } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class UserCleanupService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private userService = inject(UserService);
  
  // Time limit in milliseconds (20 minutes)
  private readonly TIME_LIMIT = 20 * 60 * 1000;
  
  constructor() {
    // Run cleanup check every 5 minutes
    interval(5 * 60 * 1000).subscribe(() => {
      this.cleanupUnverifiedUsers();
    });
  }
  
  /**
   * Clean up unverified users that have passed the time limit
   */
  async cleanupUnverifiedUsers() {
    try {
      console.log('Running unverified user cleanup');
      
      // Get current timestamp
      const now = new Date();
      
      // Calculate the cutoff time (now - 20 minutes)
      const cutoffTime = new Date(now.getTime() - this.TIME_LIMIT);
      
      // Query for unverified users created before the cutoff time
      const usersRef = collection(this.firestore, 'users');
      const q = query(
        usersRef,
        where('isVerified', '==', false),
        where('verificationSentAt', '<', cutoffTime)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Log how many users are being deleted
      console.log(`Found ${querySnapshot.size} unverified users to clean up`);
      
      // Process each expired unverified user
      const deletionPromises = querySnapshot.docs.map(async docSnapshot => {
        const userData = docSnapshot.data();
        const userId = docSnapshot.id;
        
        console.log(`Deleting unverified user: ${userId}`);
        
        try {
          // Use the UserService to properly delete the user
          await firstValueFrom(this.userService.deleteUser(userId));
          console.log(`Successfully deleted user ${userId}`);
        } catch (error) {
          console.error(`Error deleting user ${userId}:`, error);
        }
      });
      
      // Wait for all deletions to complete
      await Promise.all(deletionPromises);
      
      console.log('User cleanup completed');
    } catch (error) {
      console.error('Error in user cleanup process:', error);
    }
  }
}