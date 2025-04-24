import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  onSnapshot,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  collectionData,
  writeBatch
} from '@angular/fire/firestore';
import { Observable, from, of, combineLatest, throwError, BehaviorSubject, forkJoin } from 'rxjs';
import { Message } from '../models/message.model';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(private firestore: Firestore, private authService: AuthService) {}

  /**
   * Send a new message
   * @param message Message data
   * @returns Observable<string> - ID of the created message
   */
  sendMessage(message: Omit<Message, 'id'>): Observable<string> {
    if (!message || !message.senderId || !message.receiverId) {
      console.error('Invalid message data provided');
      return throwError(() => new Error('Invalid message data'));
    }
    
    const messagesRef = collection(this.firestore, 'messages');
    
    // Add timestamp if not provided
    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || serverTimestamp(),
      read: message.read || false
    };
    
    return from(addDoc(messagesRef, messageWithTimestamp)).pipe(
      map(docRef => {
        console.log(`Message sent successfully with ID: ${docRef.id}`);
        return docRef.id;
      }),
      catchError(error => {
        console.error('Error sending message:', error);
        return throwError(() => new Error(`Failed to send message: ${error.message}`));
      })
    );
  }

  /**
   * Get conversation between two users
   * @param userId1 First user ID
   * @param userId2 Second user ID
   * @returns Observable<Message[]>
   */
  getConversation(userId1: string, userId2: string): Observable<Message[]> {
    if (!userId1 || !userId2) {
      console.error('Invalid user IDs provided for conversation');
      return of([]);
    }
    
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(
      messagesRef,
      where('senderId', 'in', [userId1, userId2]),
      where('receiverId', 'in', [userId1, userId2]),
      orderBy('timestamp', 'asc')
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(messages => {
        return (messages as Message[])
          .filter(m => 
            (m.senderId === userId1 && m.receiverId === userId2) || 
            (m.senderId === userId2 && m.receiverId === userId1)
          );
      }),
      catchError(error => {
        console.error(`Error fetching conversation between ${userId1} and ${userId2}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Mark messages as read
   * @param senderId Sender user ID
   * @param receiverId Receiver user ID
   * @returns Observable<void>
   */
  markMessagesAsRead(senderId: string, receiverId: string): Observable<void> {
    if (!senderId || !receiverId) {
      console.error('Invalid sender or receiver ID provided');
      return throwError(() => new Error('Invalid user IDs'));
    }
    
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(
      messagesRef,
      where('senderId', '==', senderId),
      where('receiverId', '==', receiverId),
      where('read', '==', false)
    );
    
    return from(getDocs(q)).pipe(
      switchMap(querySnapshot => {
        if (querySnapshot.empty) {
          console.log('No unread messages to mark as read');
          return of(undefined);
        }
        
        console.log(`Marking ${querySnapshot.size} messages as read`);
        
        // Use a batch to update all messages at once for better performance and atomicity
        try {
          const batch = writeBatch(this.firestore);
          
          querySnapshot.docs.forEach(docSnapshot => {
            const messageRef = doc(this.firestore, 'messages', docSnapshot.id);
            batch.update(messageRef, { read: true });
          });
          
          return from(batch.commit()).pipe(
            map(() => {
              console.log(`Successfully marked ${querySnapshot.size} messages as read`);
              return undefined;
            }),
            catchError(error => {
              console.error('Error committing batch updates for read status:', error);
              return throwError(() => new Error(`Failed to mark messages as read: ${error.message}`));
            })
          );
        } catch (error) {
          console.error('Error setting up batch update:', error);
          return throwError(() => new Error(`Failed to mark messages as read: ${error}`));
        }
      }),
      catchError(error => {
        console.error('Error marking messages as read:', error);
        return throwError(() => new Error(`Failed to mark messages as read: ${error.message}`));
      })
    );
  }

  /**
   * Get count of unread messages for a user
   * @param userId User ID
   * @returns Observable<number>
   */
  getUnreadMessageCount(userId: string): Observable<number> {
    if (!userId) {
      console.error('Invalid user ID provided');
      return of(0);
    }
    
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(
      messagesRef,
      where('receiverId', '==', userId),
      where('read', '==', false)
    );
    
    return collectionData(q).pipe(
      map(messages => messages.length),
      catchError(error => {
        console.error(`Error fetching unread message count for user ${userId}:`, error);
        return of(0);
      })
    );
  }

  /**
   * Get user conversations with last message info
   * @param userId User ID
   * @returns Observable<any[]>
   */
  getUserConversations(userId: string): Observable<any[]> {
    if (!userId) {
      console.error('Invalid user ID provided');
      return of([]);
    }
    
    const messagesRef = collection(this.firestore, 'messages');
    
    // Get all messages where this user is either sender or receiver
    const sentQuery = query(
      messagesRef,
      where('senderId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const receivedQuery = query(
      messagesRef,
      where('receiverId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    // Combine both sets of messages
    return combineLatest([
      collectionData(sentQuery, { idField: 'id' }),
      collectionData(receivedQuery, { idField: 'id' })
    ]).pipe(
      map(([sentMessages, receivedMessages]) => {
        // Combine and deduplicate by conversation partner
        const allMessages = [...sentMessages, ...receivedMessages] as Message[];
        
        // Get unique conversation partners
        const conversationPartners = new Map<string, {
          userId: string,
          lastMessage: string,
          lastMessageTime: any,
          unreadCount: number
        }>();
        
        allMessages.forEach(msg => {
          if (!msg) return; // Skip any undefined messages
          
          const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
          if (!partnerId) return; // Skip invalid messages
          
          // If this partner isn't in our map yet, or this message is newer
          const existingPartner = conversationPartners.get(partnerId);
          if (!existingPartner || existingPartner.lastMessageTime < msg.timestamp) {
            conversationPartners.set(partnerId, {
              userId: partnerId,
              lastMessage: msg.content || 'Image',
              lastMessageTime: msg.timestamp,
              unreadCount: 0
            });
          }
          
          // Count unread messages
          if (msg.receiverId === userId && !msg.read) {
            const partner = conversationPartners.get(partnerId);
            if (partner) {
              partner.unreadCount++;
            }
          }
        });
        
        // Convert map to array and sort by most recent message
        return Array.from(conversationPartners.values())
          .sort((a, b) => {
            // Handle cases where timestamps might be missing or invalid
            if (!a.lastMessageTime) return 1;
            if (!b.lastMessageTime) return -1;
            return b.lastMessageTime - a.lastMessageTime;
          });
      }),
      catchError(error => {
        console.error(`Error fetching conversations for user ${userId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Delete a conversation between two users
   * Improved with better error handling and complete deletion
   * @param currentUserId Current user ID
   * @param otherUserId Other user ID
   * @returns Observable<void>
   */
  deleteConversation(currentUserId: string, otherUserId: string): Observable<void> {
    if (!currentUserId || !otherUserId) {
      console.error('Invalid user IDs for conversation deletion');
      return throwError(() => new Error('Invalid user IDs'));
    }
    
    // Find all messages between these two users
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(
      messagesRef,
      where('senderId', 'in', [currentUserId, otherUserId]),
      where('receiverId', 'in', [currentUserId, otherUserId])
    );
    
    return from(getDocs(q)).pipe(
      switchMap(querySnapshot => {
        if (querySnapshot.empty) {
          console.log(`No messages found between users ${currentUserId} and ${otherUserId}`);
          return of(undefined);
        }
        
        console.log(`Found ${querySnapshot.size} messages to delete between users ${currentUserId} and ${otherUserId}`);
        
        try {
          // Use batch for faster and atomic deletion
          const batch = writeBatch(this.firestore);
          
          // Add all message documents to the batch for deletion
          querySnapshot.forEach(doc => {
            batch.delete(doc.ref);
          });
          
          // Commit the batch deletion
          return from(batch.commit()).pipe(
            map(() => {
              console.log(`Successfully deleted conversation between ${currentUserId} and ${otherUserId}`);
              return undefined;
            }),
            catchError(error => {
              console.error('Error committing batch deletion of messages:', error);
              return throwError(() => new Error(`Failed to delete conversation: ${error.message}`));
            })
          );
        } catch (error) {
          console.error('Error setting up batch deletion:', error);
          return throwError(() => new Error(`Failed to delete conversation: ${error}`));
        }
      }),
      catchError(error => {
        console.error(`Error deleting conversation between ${currentUserId} and ${otherUserId}:`, error);
        return throwError(() => new Error(`Failed to delete conversation: ${error.message}`));
      })
    );
  }
  
  /**
   * Delete all messages for a user (sent and received)
   * @param userId User ID
   * @returns Observable<void>
   */
  deleteAllUserMessages(userId: string): Observable<void> {
    if (!userId) {
      console.error('Invalid user ID provided for message deletion');
      return throwError(() => new Error('Invalid user ID'));
    }
    
    // Get all messages where user is sender
    const sentMessagesQuery = query(
      collection(this.firestore, 'messages'),
      where('senderId', '==', userId)
    );
    
    // Get all messages where user is receiver
    const receivedMessagesQuery = query(
      collection(this.firestore, 'messages'),
      where('receiverId', '==', userId)
    );
    
    // Execute both queries
    return forkJoin([
      from(getDocs(sentMessagesQuery)),
      from(getDocs(receivedMessagesQuery))
    ]).pipe(
      switchMap(([sentSnapshot, receivedSnapshot]) => {
        const totalMessages = sentSnapshot.size + receivedSnapshot.size;
        
        if (totalMessages === 0) {
          console.log(`No messages found for user ${userId}`);
          return of(undefined);
        }
        
        console.log(`Found ${totalMessages} messages to delete for user ${userId}`);
        
        try {
          // Use batch for faster and atomic deletion
          // Firebase has a limit of 500 operations per batch, so we may need multiple batches
          const batches: Array<Promise<void>> = [];
          let batch = writeBatch(this.firestore);
          let operationCount = 0;
          const MAX_OPERATIONS = 450; // Keep below 500 to be safe
          
          // Process sent messages
          sentSnapshot.forEach(doc => {
            batch.delete(doc.ref);
            operationCount++;
            
            // If we're approaching the batch limit, commit and create a new batch
            if (operationCount >= MAX_OPERATIONS) {
              batches.push(batch.commit());
              batch = writeBatch(this.firestore);
              operationCount = 0;
            }
          });
          
          // Process received messages
          receivedSnapshot.forEach(doc => {
            batch.delete(doc.ref);
            operationCount++;
            
            // If we're approaching the batch limit, commit and create a new batch
            if (operationCount >= MAX_OPERATIONS) {
              batches.push(batch.commit());
              batch = writeBatch(this.firestore);
              operationCount = 0;
            }
          });
          
          // Commit the final batch if it has any operations
          if (operationCount > 0) {
            batches.push(batch.commit());
          }
          
          // Execute all batches
          return from(Promise.all(batches)).pipe(
            map(() => {
              console.log(`Successfully deleted all messages for user ${userId}`);
              return undefined;
            }),
            catchError(error => {
              console.error(`Error committing batch deletions for user ${userId}:`, error);
              return throwError(() => new Error(`Failed to delete all user messages: ${error.message}`));
            })
          );
        } catch (error) {
          console.error(`Error setting up batch deletion for user ${userId}:`, error);
          return throwError(() => new Error(`Failed to delete all user messages: ${error}`));
        }
      }),
      catchError(error => {
        console.error(`Error deleting all messages for user ${userId}:`, error);
        return throwError(() => new Error(`Failed to delete all user messages: ${error.message}`));
      })
    );
  }
}