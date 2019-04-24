import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from './_services/database.service'
import { AuthService } from './core/auth.service';
import { User } from './_models';

@Component({ selector: 'app', templateUrl: 'app.component.html', styleUrls: ['./app.component.css'], })
export class AppComponent {
    currentUser: User;
    isLoggedIn : Promise<Boolean>;
    userType: string;
    constructor(
        private router: Router,
        private auth: AuthService,
        private dbs: DatabaseService  
    ) {
        this.dbs.currentUser.subscribe(user => {
            if(user){
                this.userType = user.type
            }
        })
    }
    ngOnInit(){
        this.isLoggedIn = Promise.resolve(this.auth.isLoggedIn());      
    }
    logout() {
        this.auth.signOut();
        this.isLoggedIn = Promise.resolve(false);
      }
}
