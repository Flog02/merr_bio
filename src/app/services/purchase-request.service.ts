import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, collectionData, where, query, orderBy, getDoc } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { PurchaseRequest } from '../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseRequestService {
  constructor(private firestore: Firestore) {}

  createRequest(request: Omit<PurchaseRequest, 'id'>): Observable<string> {
    const requestsRef = collection(this.firestore, 'requests');
    return from(addDoc(requestsRef, request)).pipe(
      map(docRef => docRef.id)
    );
  }

  getRequestById(id: string): Observable<PurchaseRequest> {
    const requestRef = doc(this.firestore, 'requests', id);
    return from(getDoc(requestRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as PurchaseRequest;
        } else {
          throw new Error('Request not found');
        }
      })
    );
  }

  getRequestsByCustomer(customerId: string): Observable<PurchaseRequest[]> {
    const requestsRef = collection(this.firestore, 'requests');
    const q = query(requestsRef, where('customerId', '==', customerId), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<PurchaseRequest[]>;
  }

  getRequestsByFarmer(farmerId: string): Observable<PurchaseRequest[]> {
    const requestsRef = collection(this.firestore, 'requests');
    const q = query(requestsRef, where('farmerId', '==', farmerId), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<PurchaseRequest[]>;
  }

  updateRequestStatus(id: string, status: 'accepted' | 'rejected'): Observable<void> {
    const requestRef = doc(this.firestore, 'requests', id);
    return from(updateDoc(requestRef, { status }));
  }

  deleteRequest(id: string): Observable<void> {
    const requestRef = doc(this.firestore, 'requests', id);
    return from(deleteDoc(requestRef));
  }
}