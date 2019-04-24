import { LOCAL_STORAGE } from '@ng-toolkit/universal';
import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { NotifyService } from './notify.service';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: firebase.User;
  loggedIn : Promise<boolean>;
  constructor(@Inject(LOCAL_STORAGE) private localStorage: any, private afAuth: AngularFireAuth,
              private afs: AngularFirestore,
              private router: Router,
              private notify: NotifyService) {
  this.afAuth.authState.subscribe(user => {
      if (user){
        this.user = user;
        localStorage.setItem('user', JSON.stringify(this.user));

      } else {
        localStorage.setItem('user', null);
      }
    })
  }
  //// Email/Password Auth ////
  
  async emailSignUp(userInfo) {
    try {
      const afUser = await this.afAuth.auth.createUserWithEmailAndPassword(userInfo.email, userInfo.password);
      this.setUserDoc(afUser, userInfo); // create initial user document
      return true;
    }
    catch (error) {
      this.handleError(error);
      return false;
    }
  }
  
   async login(email: string, password: string) {
    try{
    var result = await this.afAuth.auth.signInWithEmailAndPassword(email, password);
    this.loggedIn = Promise.resolve(true);
    return true;
  }
    catch(error){
      return false;
    }
  }

 // If error, console log and notify user
 private handleError(error) {
  this.notify.update(error.message, 'error')
}
  // Update properties on the user document
  updateUser(user: User, data: any) { 
    return this.afs.doc(`users/${user.uid}`).update(data)
  }


isLoggedIn() {
  const  user  =  JSON.parse(this.localStorage.getItem('user'));
  return  user  !==  null;
}
signOut() {
  this.afAuth.auth.signOut().then(() => {
    this.localStorage.removeItem('user');
    this.router.navigate(['/login']);
  });
}

// Sets user data to firestore after succesful login
private setUserDoc(afUser, userInfo) {

  const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${afUser.user.uid}`);

  const data: User = {
    uid: afUser.user.uid,
    email: afUser.user.email,
    username: userInfo.username,
    mid : [],
    type : "student"
  }

  return (userRef.set(data));
 

}

}

