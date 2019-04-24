import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthService } from '../core/auth.service';
import {DatabaseService} from '../_services/database.service';



@Component({ templateUrl: 'register.component.html',
            styleUrls: ['register.component.css'],
})
export class RegisterComponent implements OnInit {
    // Initialization
    registerForm: FormGroup;
    loading = false;
    submitted = false;
    loggedIn = false;
    nameDuplicate = false;
    emailDuplicate = false;
    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private auth: AuthService,
        private userData : DatabaseService

    ) { 
        // If user is logged in then take them to home page
        if(this.auth.isLoggedIn()){
            this.router.navigate(['/'])
        }
        // redirect to home if already logged in

    }

    // Creation of the registration form and add validators
    ngOnInit() {
        this.registerForm = this.formBuilder.group({
            username: ['', [Validators.required, Validators.pattern('^[A-z0-9]*$')]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
        
    }

    // Using getters will make your code look pretty
    get email() { return this.registerForm.get('email') }
    get password() { return this.registerForm.get('password') }
    get username() { return this.registerForm.get('username') }
    get f() {return this.registerForm.controls};

    // When submit button is pressed
    async onSubmit() {
        // Initialize the errors to be false
        this.emailDuplicate = false;
        this.emailDuplicate = false;
        this.submitted = true;
        this.loading = true;
        
        // Check validators
        if (this.registerForm.invalid) {
            this.loading = false;
            return;
        }

        // Check database for duplicates for both emails and password
        if((!await this.userData.verifyInfo('username', this.username.value, 'users'))){
            this.nameDuplicate = true;
        }
        if(!await this.userData.verifyInfo('email', this.email.value, 'users')){
            this.emailDuplicate = true;

        }
        // If any duplicates then return
        if(this.nameDuplicate || this.emailDuplicate){
            this.loading = false;
            return;
        }
        // Sign up and redirect to login
        else{
            if(this.auth.emailSignUp({username: this.username.value, email: this.email.value, password: this.password.value})){
                this.loading = false;
                this.router.navigate(['/login']);
            }
        }

    }
}
