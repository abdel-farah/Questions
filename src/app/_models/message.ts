import {User} from './user'
import {Answer} from './answer'
export class Message {
    message: string;
    createdAt: Date;
    sender: User;
    likes: User[];
    answers: Answer[];
    likesCount: Number;


    constructor({message, createdAt, sender}){
        this.message = message;
        this.createdAt = createdAt;
        this.sender = new User(sender);
    }
}
