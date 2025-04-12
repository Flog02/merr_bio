// src/app/pipes/firestore-date.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';

@Pipe({
  name: 'firestoreDate',
  standalone: true
})
export class FirestoreDatePipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: any, format: string = 'medium'): string | null {
    if (!value) {
      return null;
    }
    
    // Handle Firestore Timestamp (has toDate method)
    if (value && typeof value.toDate === 'function') {
      return this.datePipe.transform(value.toDate(), format);
    }
    
    // Handle regular Date objects or strings
    return this.datePipe.transform(value, format);
  }
}