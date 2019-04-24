import { LOCAL_STORAGE } from '@ng-toolkit/universal';
import { Injectable, Inject } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { switchMap, map } from 'rxjs/operators';
import {of} from 'rxjs/observable/of';
import { DatabaseService } from './database.service';
import { User } from '../_models';
import { UrlSerializer } from '@angular/router';
import * as firebase from 'firebase';
import 'rxjs/add/operator/map';
import {Answer} from '../_models/answer';
import { Message } from '../_models/message'
import { resolve } from 'q';
@Injectable({
  providedIn: 'root'
})
export class CourseRoomService {

  public courserooms: Observable<any>;
  public courseList: Promise<any>;
  public userCourses: Observable<any>;
  public changeCourseroom: BehaviorSubject<string | null> = new BehaviorSubject(null);
  public selectedCourseroom: Observable<any>;
  public selectedCourseroomMessages: Observable<any>;
  public selectedCourseAnswers: Observable<any>;
  public sender: User;
  public topAnswer: Promise<any>;

  constructor(
    @Inject(LOCAL_STORAGE) private localStorage: any,
    private db: AngularFirestore,
    private dataService: DatabaseService
  ) {
    var userEmail = JSON.parse(this.localStorage.getItem('user')).email;
    this.userCourses = this.db.collection('courses', ref => ref
      .where('ClassList', 'array-contains', userEmail)).valueChanges();


    this.selectedCourseroom = this.changeCourseroom.pipe(switchMap(courseID => {
      if (courseID !== "") {
        return db.doc(`courses/${courseID}`).valueChanges();
      }
      return of(null);
    }));


    this.selectedCourseroomMessages = this.changeCourseroom.pipe(switchMap(courseID => {
      if (courseID !== "") {
        return db.collection(`courses/${courseID}/messages`, ref => {
          return ref.orderBy('createdAt', 'desc').limit(150);
        })
          .snapshotChanges()
          .map(arr => arr.reverse());
      }
      return of(null);
    }));

    this.courserooms = db.collection('courses').valueChanges();

  }

  public createMessage(text: string): void {
    const courseID = this.changeCourseroom.value;
    const message: Message = {
      message: text,
      createdAt: new Date(),
      sender: this.dataService.currentUserSnapshot,
      likes: [],
      answers: [],
      likesCount: 0
    };

    this.db.collection(`courses/${courseID}/messages`).add(message);
  }

  /**
   * Adds an answer to a question
   * @param mid        Question the answer belongs to
   * @param answerText The answer by user
   */
  public createAnswer(mid, courseID ,answerText){
    //const courseID = this.changeCourseroom.value;
    const answer : Answer = {
      answer:answerText,
      createdAt: new Date(),
      sender: this.dataService.currentUserSnapshot,
      likes: [],
      likesCount: 0,
      dislikes: [],
      dislikesCount: 0
    };

    this.db.collection(`courses/${courseID}/messages`).doc(mid).update({
      answers: firebase.firestore.FieldValue.arrayUnion(answer)
    })

  }

  /**
   * Get top answers for all of the messages in the current course
   * @param mid     Question you want the top answer for
   * @returns       Promise of top answer
   */
  async getAllAnswers(mid, courseID){
    //const courseID = this.changeCourseroom.value;
    let dbCollection = this.db.collection(`courses/${courseID}/messages`).doc(mid).ref
    return await dbCollection.get().then(message => {
      if (message != null) {
        resolve(message.data());
        return {...message.data(), ...{courseId:courseID}};
      } else {
        resolve("")
        return "";
      }
    })

  }

  // Increments the likes, not very smart, can do the same question multiple times
  public incrementLikes(message) {
    let likeArr = [];
    var uid = JSON.parse(this.localStorage.getItem('user')).uid;
    const courseID = message.courseId;
    const current = this.db.collection('courses').doc(courseID).collection('messages').doc(message.mid).ref;

    // Since this was later development, I have this check incase a document don't have this field or have it as int
    if (typeof message.likes === 'object') {
      likeArr = message.likes;
      let likeIndex = likeArr.indexOf(uid);
      if (likeIndex != -1) {
        likeArr.splice(likeIndex, 1);
        current.update({
          likes: likeArr,
          likesCount: likeArr.length
        })
      } else {
        likeArr.push(uid);
        current.update({
          likes: likeArr,
          likesCount: likeArr.length
        })

      }
    }
    // Incase the database fields are wrong
    else{
      likeArr.push(uid);
      current.update({
        likes: likeArr,
        likesCount: likeArr.length
      })
    }
  }


  public getCourses() {
    this.courserooms = this.db.collection('courses').valueChanges();

  }
  public async getSavedQuestions(mid){
    let courseId = mid.path.split("/")[1]
    let dbRef = this.db.doc(mid).ref;
      return dbRef.get().then(doc =>{
        if(doc.data() !== null){

          resolve({...doc.data(), ...{mid:doc.id}});
          return {...doc.data(), ...{mid:doc.id}, ...{courseId: courseId}};
        }
        else{
          resolve([]);
          return [];
        }    
    });
  }


  public incrementVotes(message, answer) {
    let likeArr = [];
    var uid = JSON.parse(this.localStorage.getItem('user')).uid;
    const courseID = message.courseId;
    const current = this.db.collection('courses').doc(courseID).collection('messages').doc(message.mid).ref;
    let answerArray = message.answers;
      let arrayIndex=-1;
    for( let i=0; i<answerArray.length; i++ ){          //Need to find the answer in the array
      if(answerArray[i].createdAt === answer.createdAt && answerArray[i].answer === answer.answer) {
        arrayIndex=i;
        break;
      }
    }
     
    if(typeof answerArray[arrayIndex].likes === 'object'){
      likeArr = answerArray[arrayIndex].likes;
      let likeIndex = likeArr.indexOf(uid);
      if(likeIndex===-1){
        likeArr.push(uid);
        answerArray[arrayIndex].likes = likeArr;
        answerArray[arrayIndex].likesCount = likeArr.length;
        current.update({
          answers: answerArray,
        });
      }
    }
    else{
      likeArr.push(uid);
      answerArray[arrayIndex].likes = likeArr;
      answerArray[arrayIndex].likesCount = likeArr.length;
      current.update({
        answers: answerArray,
      });

    }
  }

  public incrementDislikes(message, answer) {
    let dislikeArr = [];
    var uid = JSON.parse(this.localStorage.getItem('user')).uid;
    const courseID = message.courseId;
    const current = this.db.collection('courses').doc(courseID).collection('messages').doc(message.mid).ref;
    let answerArray = message.answers;
    let arrayIndex=-1;
    for( let i=0; i<answerArray.length; i++ ){          //Need to find the answer in the array
      if(answerArray[i].createdAt === answer.createdAt && answerArray[i].answer === answer.answer) {
        arrayIndex=i;
        break;
      }
    }
    if(typeof answerArray[arrayIndex].dislikes === 'object'){
      dislikeArr = answerArray[arrayIndex].dislikes;
      if (dislikeArr.length >=1) {
      let dislikeIndex = dislikeArr.indexOf(uid);
      if(dislikeIndex===-1){
        dislikeArr.push(uid);
        answerArray[arrayIndex].dislikes = dislikeArr;
        answerArray[arrayIndex].dislikesCount = dislikeArr.length;
        current.update({
          answers: answerArray,
        });
      }
    } else{
        dislikeArr.push(uid);
        answerArray[arrayIndex].dislikes = dislikeArr;
        answerArray[arrayIndex].dislikesCount = dislikeArr.length;
        current.update({
          answers: answerArray,
        });
      }
    }
    else{
      dislikeArr.push(uid);
        answerArray[arrayIndex].dislikes = dislikeArr;
        answerArray[arrayIndex].dislikesCount = dislikeArr.length;
        current.update({
          answers: answerArray,
        });
    }

  }

}
