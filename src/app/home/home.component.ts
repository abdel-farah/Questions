import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { DatabaseService } from '../_services/database.service';
import { CourseRoomService } from '../_services/course-room.service';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { resolve } from 'q';
import { LOCAL_STORAGE } from '@ng-toolkit/universal';
import { pipe } from '@angular/core/src/render3';



@Component({ templateUrl: 'home.component.html',
            styleUrls: ['home.component.css'],
})
 

export class HomeComponent {
    answers = [];
    param = "";
    toAnswer = "";
    hasAnswers = false;
    pageTitle = "";
    isSavedLoaded = false;
    showSaved = true;
    switchForm = false;
    showSavedQuestions = false;
    public chatroom: Observable<any>;
    messages = [];
    courseId = "";
    courses = [];
    answerText = "";
    showAllQuestions = true;
    allAnswersInfo;
    likesCount = 0;
    newUpdate = false;
    allAnswersLoaded = Promise.resolve(false);
    private subscriptions: Subscription[] = [];
    //TODO Replace with Firebase data

    public newMessageText: string = '';
    constructor( 
        @Inject(LOCAL_STORAGE) private localStorage: any,
        public courseRoomService: CourseRoomService,
        private route: ActivatedRoute,
        private dbs: DatabaseService
    ) {
        this.subscriptions.push(
            this.courseRoomService.selectedCourseroom.subscribe(chatroom => {
                this.messages = [];
                if(chatroom !== undefined){
                    this.chatroom = chatroom;
                    if(chatroom !== null){
                        this.pageTitle = chatroom.CourseName + " " + chatroom.CourseNumber;
                        this.courseId = chatroom.CourseId;
                    }
                }
                else{
                    if(this.param === "savedQuestions"){
                        this.pageTitle = "Saved Questions" 
                    }
                    if(this.param === ""){
                        this.pageTitle = "Home"
                    }
                }
            
            })
        );

        this.subscriptions.push(
            this.courseRoomService.selectedCourseroomMessages.subscribe(messages => {                
                if(messages !== null){
                    this.messages = [];
                    messages.forEach(element => {
                        let message = element.payload.doc.data();
                        let answers = message.answers;
                        let topAnswer  = ""
                        if(answers !== undefined){
                            if(answers.length > 0){
                                topAnswer = answers.sort((a, b) => Number(b.likesCount) - Number(a.likesCount))[0];
                            }
                        }
                        message['topAnswer'] = topAnswer;
                        message['mid'] = element.payload.doc.id;
                        message['courseId'] = this.courseId;
                        this.messages.push(message);
                    });
                }
            })
        );
    }
    async ngOnInit(){
        // await this.courseRoomService.courseList.then(data => {
        //     this.courses = data
        //     this.isDataLoaded = true;
        // });
        this.subscriptions.push(
            this.route.paramMap.subscribe(async params => {
                this.param = params.get('courseID');
                if(this.param === "" || this.param === "savedQuestions"){
                    if(this.param === "savedQuestions"){
                        let savedArr = [];
                        this.showAllQuestions = true;
                        this.showSaved = true;
                        this.pageTitle = "Saved Questions";
                        this.dbs.currentUser.subscribe(async user =>{
                            if(user.mid != undefined){
                                user.mid.forEach(async docRef => {
                                    let promise = this.courseRoomService.getSavedQuestions(docRef);
                                    savedArr.push(promise);
                                })
                            
                                await Promise.all(savedArr).then(data =>  { 
                                    this.messages = [];
                                    data.forEach(element => {
                                        let message = element;
                                        let topAnswer = '';
                                        let answers = element.answers;
                                        if(answers !== undefined){
                                            if(answers.length > 0){
                                                topAnswer = answers.sort((a, b) => Number(b.likesCount) - Number(a.likesCount))[0];
                                            }
                                        }
                                        message['topAnswer'] = topAnswer;
                                        this.messages.push(message)

                                    });
                                    this.isSavedLoaded = true;
                                })
                            }
                        })

                        this.courseRoomService.changeCourseroom.next("");
                    }
                }   
                else{
                    this.showAllQuestions = true;
                    this.showSaved = true;
                    this.courseRoomService.changeCourseroom.next(this.param);
                }



        })
        )

    }
    hasLiked(likeArr){
        // Code change incase we missed changing anything in the database
        if(typeof likeArr === "object"){
            if(likeArr.indexOf(JSON.parse(this.localStorage.getItem('user')).uid) !== -1){   
                return "red";
            }
        }
        return "black";
    }
    answer(mid){
        this.answerText = "";
        this.toAnswer = mid;
        
    }
    submitAnswer(message){
        if(this.answerText === ""){
            console.log("You must enter an answer");
            return;
        }
        this.courseRoomService.createAnswer(message.mid, message.courseId, this.answerText)
        this.answerText = "";
        this.toAnswer = "";     // Hide the answer box once user submits answer
    }

    ngOnDestroy(){
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
    toggleForm():void{
        if(this.switchForm==false){
            this.switchForm=true;
        }
        else if(this.switchForm==true){
            this.switchForm=false;
        }
    }
    public submit(message: string): void{
        this.courseRoomService.createMessage(message);
        //reset input
        this.newMessageText='';
        this.toggleForm();
    }

    public upVoteAnswer(message, answer): void{
      this.courseRoomService.incrementVotes(message,answer);
    }


  public downVoteAnswer(message, answer): void{
    this.courseRoomService.incrementDislikes(message, answer);
  }


    async seeAllAnswers(message){
        this.courseRoomService.getAllAnswers(message.mid, message.courseId).then(msg => {
            if(message !== ""){
                // this.pageTitle = "All Answers";
                this.showAllQuestions = false;
                this.showSaved = false;
                this.allAnswersInfo = msg;
                this.allAnswersInfo['mid'] = message.mid;
                this.allAnswersInfo['courseId'] = message.courseId;
                this.allAnswersLoaded = Promise.resolve(true);
            }
        });
    }

    public goBackFromSeeAllAnswers(){
      this.showAllQuestions = true;
      this.showSaved = true;
    }
    
}
