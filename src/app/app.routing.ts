import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { AuthGuard } from './_guards';
import { CourseAdminComponent } from './course-admin';
import { ModerateComponent } from './moderate';

const appRoutes: Routes = [
    { path: 'home', canActivate: [AuthGuard], 
    children: [
        {path: '', component: HomeComponent},
        {path: ':courseID', component: HomeComponent},
        {path: 'savedQuestions', component:HomeComponent},
    ]
},
    { path: 'courses', component: CourseAdminComponent, canActivate: [AuthGuard] },
    { path: 'moderate', component: ModerateComponent, canActivate: [AuthGuard]},

    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: 'home' }
];

export const routing = RouterModule.forRoot(appRoutes);