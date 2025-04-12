import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, collectionData, limit, doc, updateDoc, Timestamp } from '@angular/fire/firestore';
import { Observable, combineLatest, from, map } from 'rxjs';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(private firestore: Firestore) {}

  sendMessage(message: Omit<Message, 'id'>): Observable<string> {
    const messagesRef = collection(this.firestore, 'messages');
    return from(addDoc(messagesRef, message)).pipe(
      map(docRef => docRef.id)
    );
  }

  getConversation(userId1: string, userId2: string): Observable<Message[]> {
    const messagesRef = collection(this.firestore, 'messages');
    
    const q1 = query(
      messagesRef,
      where('senderId', '==', userId1),
      where('receiverId', '==', userId2),
      orderBy('timestamp', 'asc')
    );
    
    const q2 = query(
      messagesRef,
      where('senderId', '==', userId2),
      where('receiverId', '==', userId1),
      orderBy('timestamp', 'asc')
    );
    
    const messages1$ = collectionData(q1, { idField: 'id' }) as Observable<Message[]>;
    const messages2$ = collectionData(q2, { idField: 'id' }) as Observable<Message[]>;
    
    return combineLatest([messages1$, messages2$]).pipe(
      map(([messages1, messages2]) => {
        return [...messages1, ...messages2].sort((a, b) => {
          // Convert both timestamps to milliseconds for comparison
          let timeA: number;
          let timeB: number;
          
          if (a.timestamp instanceof Timestamp) {
            timeA = a.timestamp.toMillis();
          } else {
            // Assume it's a Date or number
            timeA = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp).getTime();
          }
          
          if (b.timestamp instanceof Timestamp) {
            timeB = b.timestamp.toMillis();
          } else {
            // Assume it's a Date or number
            timeB = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp).getTime();
          }
          
          return timeA - timeB;
        });
      })
    );
  }

  getRecentConversations(userId: string): Observable<any[]> {
    const messagesRef = collection(this.firestore, 'messages');
    
    const sentQ = query(
      messagesRef,
      where('senderId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const receivedQ = query(
      messagesRef,
      where('receiverId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const sent$ = collectionData(sentQ, { idField: 'id' }) as Observable<Message[]>;
    const received$ = collectionData(receivedQ, { idField: 'id' }) as Observable<Message[]>;
    
    return combineLatest([sent$, received$]).pipe(
      map(([sent, received]) => {
        const allMessages = [...sent, ...received].sort((a, b) => {
          // Convert both timestamps to milliseconds for comparison
          let timeA: number;
          let timeB: number;
          
          if (a.timestamp instanceof Timestamp) {
            timeA = a.timestamp.toMillis();
          } else {
            // Assume it's a Date or number
            timeA = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp).getTime();
          }
          
          if (b.timestamp instanceof Timestamp) {
            timeB = b.timestamp.toMillis();
          } else {
            // Assume it's a Date or number
            timeB = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp).getTime();
          }
          
          return timeB - timeA;  // Note: reversed for descending order
        });
        
        // Get unique conversations (by user)
        const conversations = new Map();
        allMessages.forEach(message => {
          const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
          if (!conversations.has(otherUserId)) {
            conversations.set(otherUserId, {
              userId: otherUserId,
              lastMessage: message.content,
              timestamp: message.timestamp
            });
          }
        });
        
        return Array.from(conversations.values());
      })
    );
  }

  markAsRead(messageIds: string[]): Observable<void[]> {
    const updates = messageIds.map(id => {
      const messageRef = doc(this.firestore, 'messages', id);
      return from(updateDoc(messageRef, { read: true }));
    });
    
    return combineLatest(updates);
  }
}