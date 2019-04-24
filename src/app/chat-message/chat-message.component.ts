import { Component, OnInit, Input } from '@angular/core';
import { Message } from "../_models/message";
@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css']
})
export class ChatMessageComponent implements OnInit {

  @Input() message;
  constructor() {
   }

  ngOnInit() {
  }
  answer(){

  }

}
