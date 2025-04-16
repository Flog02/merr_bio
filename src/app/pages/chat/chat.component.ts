import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {  LoadingController, ToastController, ActionSheetController  } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Message } from '../../models/message.model';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { UserService } from 'src/app/services/user.service';
import { Timestamp } from '@angular/fire/firestore';
import {IonInput,IonFooter,IonBackButton,IonHeader,IonTitle,IonButton,IonButtons,IonIcon,IonContent,IonToolbar}from '@ionic/angular/standalone'
import { ModalController } from '@ionic/angular/standalone';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [IonInput,IonFooter, IonBackButton, IonHeader, IonTitle, IonButton, IonButtons, IonIcon, IonContent, IonToolbar, CommonModule, ReactiveFormsModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/chats"></ion-back-button>
        </ion-buttons>
        <ion-title *ngIf="otherUser">
          <div class="chat-title">
            <div *ngIf="otherUser.profileImage" class="user-avatar">
              <img [src]="otherUser.profileImage" alt="{{ otherUser.displayName }}">
            </div>
            <div *ngIf="!otherUser.profileImage" class="user-avatar placeholder">
              <ion-icon name="person"></ion-icon>
            </div>
            <div class="user-info">
              <div class="user-name">{{ otherUser.displayName || 'User' }}</div>
              <div class="user-status" *ngIf="isOnline">Online</div>
            </div>
          </div>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" #content>
      <div class="message-container">
        <div class="date-divider" *ngIf="(messages$ | async)?.length === 0">
          <span>Start a conversation</span>
        </div>
        
        <ng-container *ngFor="let message of messages$ | async; let i = index; let last = last">
          <!-- Date divider when date changes -->
          <div class="date-divider" *ngIf="shouldShowDateDivider(message, i, (messages$ | async))">
            <span>{{ message.timestamp.toDate() | date:'mediumDate' }}</span>
          </div>
          
          <div [ngClass]="{'message-group': true, 'my-message': message.senderId === currentUser?.uid, 
                           'other-message': message.senderId !== currentUser?.uid}">
            <div class="message-bubble">
            
              
              <!-- Text message -->
              <div *ngIf="message.content" class="message-text">
                {{ message.content }}
              </div>
            </div>
            
            <div class="message-info">
              <span class="message-time">{{ message.timestamp.toDate() | date:'shortTime' }}</span>
              
              <!-- Read status for my messages -->
              <span *ngIf="message.senderId === currentUser?.uid" class="message-status">
                <ion-icon *ngIf="message.read" name="checkmark-done-outline" class="read-icon"></ion-icon>
                <ion-icon *ngIf="!message.read" name="checkmark-outline" class="sent-icon"></ion-icon>
              </span>
            </div>
          </div>
        </ng-container>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border">
      <div class="attachment-preview" *ngIf="selectedImage">
        <div class="preview-image">
          <img [src]="selectedImage">
          <ion-button fill="clear" class="remove-attachment" (click)="removeSelectedImage()">
            <ion-icon name="close-circle"></ion-icon>
          </ion-button>
        </div>
      </div>
      
      <ion-toolbar>
        <div class="message-input-container">
        <ion-button fill="clear" class="attachment-button" (click)="openAttachmentOptions()">            <ion-icon name="attach"></ion-icon>
          </ion-button>
          
          <ion-input 
            [formControl]="messageControl" 
            placeholder="Type a message..." 
            class="message-input"
            (keyup.enter)="sendMessage()">
          </ion-input>
          
          <ion-button fill="clear" class="send-button" (click)="sendMessage()" [disabled]="!canSendMessage()">
            <ion-icon name="send"></ion-icon>
          </ion-button>
        </div>
      </ion-toolbar>
      
    </ion-footer>
  `,
  styles: [`
    .chat-title {
      display: flex;
      align-items: center;
    }
    
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 10px;
      background-color: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .user-avatar.placeholder ion-icon {
      font-size: 18px;
      color: white;
    }
    
    .user-info {
      display: flex;
      flex-direction: column;
    }
    
    .user-name {
      font-size: 16px;
      font-weight: 500;
    }
    
    .user-status {
      font-size: 12px;
      opacity: 0.8;
    }
    
    .message-container {
      display: flex;
      flex-direction: column;
      padding: 10px 0;
    }
    
    .date-divider {
      display: flex;
      justify-content: center;
      margin: 16px 0;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: 1px;
        background-color: rgba(var(--ion-color-medium-rgb), 0.3);
        z-index: 0;
      }
      
      span {
        background-color: var(--ion-background-color);
        padding: 0 12px;
        font-size: 12px;
        color: var(--ion-color-medium);
        z-index: 1;
        border-radius: 10px;
      }
    }
    
    .message-group {
      display: flex;
      flex-direction: column;
      max-width: 75%;
      margin-bottom: 8px;
    }
    
    .my-message {
      align-self: flex-end;
    }
    
    .other-message {
      align-self: flex-start;
    }
    
    .message-bubble {
      padding: 8px 12px;
      border-radius: 18px;
      position: relative;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    
    .my-message .message-bubble {
      background-color: var(--ion-color-primary);
      color: white;
      border-bottom-right-radius: 4px;
    }
    
    .other-message .message-bubble {
      background-color: var(--ion-color-light);
      color: var(--ion-color-dark);
      border-bottom-left-radius: 4px;
    }
    
    .message-text {
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .message-image {
      margin: -8px -12px;
      border-radius: 16px;
      overflow: hidden;
      
      img {
        width: 100%;
        max-width: 250px;
        display: block;
        cursor: pointer;
      }
    }
    
    .message-info {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-top: 4px;
      font-size: 11px;
      color: var(--ion-color-medium);
    }
    
    .message-time {
      margin-right: 4px;
    }
    
    .message-status {
      display: flex;
      align-items: center;
    }
    
    .sent-icon {
      color: var(--ion-color-medium);
    }
    
    .read-icon {
      color: var(--ion-color-primary);
    }
    
    .attachment-preview {
      background-color: rgba(var(--ion-color-light-rgb), 0.8);
      padding: 8px;
      
      .preview-image {
        position: relative;
        max-width: 120px;
        border-radius: 8px;
        overflow: hidden;
        
        img {
          width: 100%;
          display: block;
        }
        
        .remove-attachment {
          position: absolute;
          top: 0;
          right: 0;
          --padding-start: 4px;
          --padding-end: 4px;
          --padding-top: 4px;
          --padding-bottom: 4px;
          margin: 0;
          --color: var(--ion-color-danger);
        }
      }
    }
    
    .message-input-container {
      display: flex;
      align-items: center;
      padding: 4px 8px;
      background-color: var(--ion-color-light);
      border-radius: 24px;
      margin: 8px;
    }
    
    .message-input {
      --padding-start: 8px;
      --padding-end: 8px;
      --padding-top: 8px;
      --padding-bottom: 8px;
      --background: transparent;
    }
    
    .attachment-button, .send-button {
      --padding-start: 8px;
      --padding-end: 8px;
      --padding-top: 8px;
      --padding-bottom: 8px;
      margin: 0;
      height: 36px;
    }
    
    .attachment-button {
      --color: var(--ion-color-medium);
    }
    
    .send-button {
      --color: var(--ion-color-primary);
    }
  `]
})
export class ChatComponent implements OnInit {
  @ViewChild('content') content!: IonContent;
  @ViewChild('fileInput') fileInput!: ElementRef;

  messages$!: Observable<Message[]>;
  currentUser: User | null = null;
  otherUser: User | null = null;
  otherUserId: string = '';
  messageControl = new FormControl('');
  isOnline: boolean = false;
  selectedImage: string | null = null;
  selectedImageFile: File | null = null;
  isUploading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private authService: AuthService,
    private userService: UserService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private modalController:ModalController
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
        
        // Mark messages as read when conversation opens
        if (this.currentUser) {
          this.messageService.markMessagesAsRead(this.otherUserId, this.currentUser.uid).subscribe();
        }
      });
    }
  }

  loadMessages() {
    if (this.currentUser && this.otherUserId) {
      this.messages$ = this.messageService.getConversation(this.currentUser.uid, this.otherUserId).pipe(
        tap(messages => {
          // Mark as read if there are new messages
          const unreadMessages = messages.filter(msg => 
            !msg.read && msg.senderId === this.otherUserId
          );
          
          if (unreadMessages.length > 0 && this.currentUser) {
            this.messageService.markMessagesAsRead(this.otherUserId, this.currentUser.uid).subscribe();
          }
          
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        })
      );
    }
  }

  shouldShowDateDivider(message: Message, index: number, messages: Message[] | null): boolean {
    if (!messages || index === 0) return true;
    
    const previousMessage = messages[index - 1];
    const currentDate = message.timestamp.toDate().toDateString();
    const previousDate = previousMessage.timestamp.toDate().toDateString();
    
    return currentDate !== previousDate;
  }

  async sendMessage() {
    // Check if there's a valid message to send
    const content = this.messageControl.value?.trim();
    if (!content || !this.currentUser || !this.otherUserId) {
      return;
    }
    
    // Create text-only message object
    const message: Omit<Message, 'id'> = {
      senderId: this.currentUser.uid,
      receiverId: this.otherUserId,
      content: content,
      timestamp: Timestamp.fromDate(new Date()),
      read: false
    };
    
    // Send the message
    this.messageService.sendMessage(message).subscribe({
      next: () => {
        // Clear input and scroll to bottom on success
        this.messageControl.reset();
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error sending message', error);
        this.showErrorToast('Failed to send message');
      }
    });
  }

  scrollToBottom() {
    if (this.content) {
      this.content.scrollToBottom(300);
    }
  }
  
  canSendMessage(): boolean {
    return !!(this.messageControl.value && this.messageControl.value.trim());
  }
  
  async openAttachmentOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Attachments',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            // Handle camera (could open device camera if on mobile)
            this.fileInput.nativeElement.click();
          }
        },
        {
          text: 'Photo Library',
          icon: 'image',
          handler: () => {
            this.fileInput.nativeElement.click();
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    
    await actionSheet.present();
  }
  
  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.includes('image/')) {
      this.showErrorToast('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      this.showErrorToast('Image must be less than 5MB');
      return;
    }
    
    // Preview the selected image
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedImage = e.target.result;
    };
    reader.readAsDataURL(file);
    
    // Store the file for later upload
    this.selectedImageFile = file;
  }
  
  removeSelectedImage() {
    this.selectedImage = null;
    this.selectedImageFile = null;
    this.fileInput.nativeElement.value = '';
  }
  
  async viewImage(imageUrl: string) {
    // This could open a modal with a larger view of the image
    // For now, let's just log it
    console.log('Viewing image:', imageUrl);
  }
  
  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }
}