import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { HttpClient } from '@angular/common/http';
import { mergeMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-msngr',
  templateUrl: './msngr.component.html',
  styleUrls: ['./msngr.component.scss']
})
export class MsngrComponent implements OnInit {
  messages: any[] = [];
  username!: string;
  recipient!: string;
  message!: string;
  roomId!: string;
  notifications: string[] = [];
  unreadCount = 0;
  chatRooms: any[] = [];
  messageIdToEdit!: string | null;
  newContent!: string;
  typingUsers: string[] = [];

  constructor(public chatService: ChatService, private http: HttpClient) {}

  ngOnInit() {
    this.chatService.getMessages()
      .pipe(tap(message => this.messages.push(message)))
      .subscribe();

    this.chatService.getNotifications()
      .pipe(tap(notification => {
        this.notifications.push(notification);
        this.unreadCount++;
      }))
      .subscribe();

    this.chatService.getMessageEdited()
      .pipe(tap(editedMessage => this.updateEditedMessage(editedMessage)))
      .subscribe();

    this.chatService.receiveTyping()
      .pipe(tap(data => this.handleTypingEvent(data)))
      .subscribe();

    this.fetchOldMessages(this.roomId);
  }

  updateEditedMessage(editedMessage: any) {
    const index = this.messages.findIndex(msg => msg._id === editedMessage.messageId);
    if (index !== -1) {
      this.messages[index].message = editedMessage.newContent;
    }
  }

  joinChat() {
    this.chatService.joinChat(this.username, this.recipient);
    this.getUserChatRooms();
  }

  fetchOldMessages(chatRoomId: string) {
    this.http.get<any[]>(`http://localhost:3000/api/chatrooms/${chatRoomId}/messages`).subscribe(messages => {
      this.messages = messages;
    });
  }

  getUserChatRooms() {
    this.http.get<any[]>(`http://localhost:3000/api/chatrooms/${this.username}`).subscribe(chatRooms => {
      this.chatRooms = chatRooms;
    });
  }

  sendMessage() {
    this.chatService.sendMessage(this.message, this.username, this.recipient);
    this.message = '';
  }

  clearNotifications() {
    this.unreadCount = 0;
  }

  initiateEditMessage(messageId: string, messageContent: string) {
    this.messageIdToEdit = messageId;
    this.newContent = messageContent;
  }

  editMessage() {
    if (this.messageIdToEdit) {
      this.chatService.editMessage(this.messageIdToEdit, this.newContent, this.username);
      this.messageIdToEdit = null;
      this.newContent = '';
    }
  }



  handleTyping() {
    this.chatService.typing(this.username, this.recipient, true);
  }

  handleTypingEvent(data: any) {
    console.log("Handling typing event:", data); // Add log to check data
    if (data.recipient !== this.recipient) {
      if (data.isTyping) {
        if (!this.typingUsers.includes(data.sender)) {
          this.typingUsers.push(data.sender);
        }
      } else {
        const index = this.typingUsers.indexOf(data.sender);
        if (index !== -1) {
          this.typingUsers.splice(index, 1);
        }
      }
      console.log("Current typing users:", this.typingUsers); // Add log to verify typing users
    }
  }
}
