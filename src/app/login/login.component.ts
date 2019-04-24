import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthService } from '../core/auth.service';

@Component({ templateUrl: 'login.component.html',
            styleUrls: ['login.component.css'],
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    errorMessage = "";
    returnUrl: string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private auth: AuthService,
    ) {
        if(this.auth.isLoggedIn()){
            this.router.navigate(['/']);
        }

    }
    ngOnInit() {
        //redirect to home if already logged in
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    }
    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }
    get email() {return this.loginForm.get('email')}
    get password() {return this.loginForm.get('password')}
    async onSubmit() {
        this.submitted = true;
        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }


        this.loading = true;
        if(await this.auth.login(this.email.value, this.password.value)){
            location.reload();
        }
        else{
            this.errorMessage = "Invalid Username and Password";
            this.loading = false;
            this.submitted = false;
        }
    }
}
