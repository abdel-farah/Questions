import { LOCAL_STORAGE } from '@ng-toolkit/universal';
import { Injectable, Inject } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import * as firebase from 'firebase'
import { Observable } from 'rxjs';
import {User} from '../_models/user'
import { resolve } from 'q';
import {AngularFireAuth} from 'angularfire2/auth';
import "rxjs/add/observable/of";
import "rxjs/add/operator/switchMap";
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  user : Observable<User|null>
  public currentUser: Observable<User|null>
  public currentUserSnapshot: User | null;
  public allCourses: Observable<any>;

  userCollection : AngularFirestoreCollection<User>
  constructor(@Inject(LOCAL_STORAGE) private localStorage: any, private afs: AngularFirestore, private afAuth: AngularFireAuth) {
    this.currentUser=this.afAuth.authState
    .switchMap((user) => {
      if (user){
        return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
      }
      else{
        return Observable.of(null);
      }
    })
   
    this.setCurrentUserSnapshot();
  }
   /**
    * Get all the documents for the collection user data
    */
  async getUserData(){
    var userID = JSON.parse(this.localStorage.getItem('user')).uid;
    var returnData = null;
    await this.afs.collection('users').doc(userID).ref.get()
    .then(function(doc) {
        if (doc.exists) {
          returnData = doc.data();
        } else {
            // doc.data() will be undefined in this case
            alert("Error");
            returnData = null;
        }
    }).catch(function(error) {
      alert("Error");
        returnData = null;
    });
    return returnData;
   }

   getUserEmail(){
     return JSON.parse(this.localStorage.getItem('user')).email;
   }

/**
 * 
 * @param field The field you want to check
 * @param value The value you want to compare
 * 
 * @returns Promise<boolean> Then resolves the comparision returns true if not found, false if found 
 */
  async verifyInfo(field, value, name){
      let dbCollection = this.afs.collection(name).ref;
      return await dbCollection.where(field, '==', value).get().then(
        query => {
          if(query.docs.length === 0){

          resolve(true);
          return true;
          }
          else{
            resolve(false);
            return false;
          }
        },
        reject =>{
          reject(false);
          return false;
        }
      );
  }

  /**
   * Add message reference to the logged in user
   * @param messageId message id
   * @param courseId  course the message is for
   */
  questionRefToUser(messageId, courseId){
    var userID = JSON.parse(this.localStorage.getItem('user')).uid;
    let dbCollection = this.afs.collection("users").ref.doc(userID);
    let docRef = firebase.firestore().doc(`/courses/${courseId}/messages/${messageId}`);
    dbCollection.update({
      mid: firebase.firestore.FieldValue.arrayUnion(firebase.firestore().doc(`/courses/${courseId}/messages/${messageId}`))
    });

  }





  
/** Sends the course info if they are in the classlist 
 * 
 * @param email     Student email you want to check
 * @param courseId  Course ID the student want to add
 * 
 * @returns The Course Info
 */
  async checkCourseForUser(email, courseId){
    let dbCollection = this.afs.collection('courses').ref;
    return await dbCollection.where('ClassList', 'array-contains', email)
    .where('CourseId', '==', courseId).get().then(
      query => {
        if(query.docs.length === 0){
          return null;
          }
          else{
            return query.docs[0].data();
          }

      }
    );
    
  }
  /**
   * Get all of the data for param coll
   * 
   * @returns Promise with all of the courses
   */
  async getAllDocs(coll){
    var data = []
    return await this.afs.collection(coll).ref.get().then(result =>{
        if(result){
          result.docs.forEach(doc => 
            {
              data.push(doc.data());
            });
            resolve(data);
        }
        else{
          resolve([]);
          
        }
        return data;
      });
  }


  async deleteCourse(mid, cid){
    this.afs.collection(`courses/${cid}/messages`).doc(mid).delete().then( ref => {
      let dbCollection = this.afs.collection('users').ref;
      let query = dbCollection
      .where('mid', 'array-contains', firebase.firestore().doc(`/courses/${cid}/messages/${mid}`))
      .get().then(data => {
        data.docs.forEach(userRef => {
          userRef.ref.update({
            mid : userRef.data().mid.splice(userRef.data().mid.indexOf(firebase.firestore().doc(`/courses/${cid}/messages/${mid}`)), 1)
          })
        })
      })   
    })
  }

  getCourseForUser(){
  var userID = JSON.parse(this.localStorage.getItem('user')).uid;
    return this.afs.collection('users', ref => ref
    .where('uid', '==', userID)).valueChanges();
  }


  /**
   * Save the course to the database
   */
  saveCourse(emails, id, name, number, section, term, instructor){
    this.afs.collection("courses").doc(id).set({  
        ClassList : emails,
        CourseId: id,
        CourseName: name,
        CourseNumber: number,
        CourseSection: section,
        CourseTerm: term,
        Instructor: instructor
    })   
  }

  public setCurrentUserSnapshot():void{
    this.currentUser.subscribe(user => this.currentUserSnapshot = user);
  }
}
