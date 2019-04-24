import {User} from './user'
export class Answer{
    answer: string;
    createdAt: Date;
    sender: User;
    likes: [];
    likesCount : number;
    dislikes: [];
    dislikesCount : number;
}
