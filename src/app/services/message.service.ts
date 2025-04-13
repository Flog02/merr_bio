// src/app/services/message.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, collectionData, doc, updateDoc, getDocs, documentId, Timestamp } from '@angular/fire/firestore';
import { Observable, from, map, switchMap, of, combineLatest } from 'rxjs';
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
      })
    );
  }

  

  markMessagesAsRead(senderId: string, receiverId: string): Observable<void> {
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(
      messagesRef,
      where('senderId', '==', senderId),
      where('receiverId', '==', receiverId),
      where('read', '==', false)
    );
    
    return from(getDocs(q)).pipe(
      switchMap(querySnapshot => {
        const updatePromises = querySnapshot.docs.map(docSnapshot => {
          const messageRef = doc(this.firestore, 'messages', docSnapshot.id);
          return updateDoc(messageRef, { read: true });
        });
        
        if (updatePromises.length === 0) {
          return of(undefined);
        }
        
        return from(Promise.all(updatePromises)).pipe(
          map(() => undefined)
        );
      })
    );
  }

  getUnreadMessageCount(userId: string): Observable<number> {
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(
      messagesRef,
      where('receiverId', '==', userId),
      where('read', '==', false)
    );
    
    return collectionData(q).pipe(
      map(messages => messages.length)
    );
  }
  // Add this method to your MessageService

getUserConversations(userId: string): Observable<any[]> {
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
        const partnerId = msg['senderId'] === userId ? msg['receiverId'] : msg['senderId'];
        
        // If this partner isn't in our map yet, or this message is newer
        const existingPartner = conversationPartners.get(partnerId);
        if (!existingPartner || existingPartner.lastMessageTime < msg['timestamp']) {
          conversationPartners.set(partnerId, {
            userId: partnerId,
            lastMessage: msg['content'] || 'Image',
            lastMessageTime: msg['timestamp'],
            unreadCount: 0
          });
        }
        
        // Count unread messages
        if (msg['receiverId'] === userId && !msg['read']) {
          const partner = conversationPartners.get(partnerId);
          if (partner) {
            partner.unreadCount++;
          }
        }
      });
      
      // Convert map to array and sort by most recent message
      return Array.from(conversationPartners.values())
        .sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    })
  );
}
}