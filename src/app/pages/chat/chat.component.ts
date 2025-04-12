import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, IonContent } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Message } from '../../models/message.model';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { UserService } from 'src/app/services/user.service';
import { Timestamp } from '@angular/fire/firestore';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/chats"></ion-back-button>
        </ion-buttons>
        <ion-title *ngIf="otherUser">{{ otherUser.displayName }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" #content>
      <div class="message-container">
        <div *ngFor="let message of messages$ | async" 
             [ngClass]="{'my-message': message.senderId === currentUser?.uid, 
                         'other-message': message.senderId !== currentUser?.uid}">
          <div class="message-bubble">
            {{ message.content }}
          </div>
          <div class="message-info">
  {{ message.timestamp.toDate() | date:'short' }}
</div>
        </div>
      </div>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-item>
          <ion-input [formControl]="messageControl" placeholder="Type a message..."></ion-input>
          <ion-button slot="end" (click)="sendMessage()" [disabled]="!messageControl.value">
            <ion-icon name="send"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .message-container {
      display: flex;
      flex-direction: column;
      padding: 10px;
    }
    
    .my-message {
      align-self: flex-end;
      margin-left: 20%;
      margin-bottom: 10px;
    }
    
    .other-message {
      align-self: flex-start;
      margin-right: 20%;
      margin-bottom: 10px;
    }
    
    .message-bubble {
      padding: 10px;
      border-radius: 10px;
      background-color: var(--ion-color-primary);
      color: white;
      max-width: 100%;
      word-wrap: break-word;
    }
    
    .my-message .message-bubble {
      background-color: var(--ion-color-primary);
    }
    
    .other-message .message-bubble {
      background-color: var(--ion-color-medium);
    }
    
    .message-info {
      font-size: 0.7em;
      margin-top: 2px;
      color: var(--ion-color-medium);
      text-align: right;
    }
  `]
})
export class ChatComponent implements OnInit {
  @ViewChild('content') content!: IonContent;
  
  messages$!: Observable<Message[]>;
  currentUser: User | null = null;
  otherUser: User | null = null;
  otherUserId: string = '';
  messageControl = new FormControl('');

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.otherUserId = this.route.snapshot.paramMap.get('userId') || '';
    
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.loadMessages();
      }
    });
    
    if (this.otherUserId) {
      this.userService.getUserById(this.otherUserId).subscribe(user => {
        this.otherUser = user;
      });
    }
  }

  loadMessages() {
    if (this.currentUser && this.otherUserId) {
      this.messages$ = this.messageService.getConversation(this.currentUser.uid, this.otherUserId);
      this.messages$.subscribe(() => {
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
      });
    }
  }

  sendMessage() {
    if (!this.currentUser || !this.otherUserId || !this.messageControl.value) {
      return;
    }
    
    const message: Omit<Message, 'id'> = {
      senderId: this.currentUser.uid,
      receiverId: this.otherUserId,
      content: this.messageControl.value,
      timestamp: Timestamp.fromDate(new Date()),
      read: false
    };
    
    this.messageService.sendMessage(message).subscribe({
      next: () => {
        this.messageControl.reset();
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error sending message', error);
      }
    });
  }

  scrollToBottom() {
    if (this.content) {
      this.content.scrollToBottom(300);
    }
  }
}