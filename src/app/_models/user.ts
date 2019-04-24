export class User {
    uid: string;
    username: string;
    email: string;
    mid: [];
    type: string


    constructor({uid, username, email, CourseList, type}){
        this.uid = uid;
        this.username = username;
        this.email = email;
        this.mid = CourseList;
        this.type = type;
    }
}