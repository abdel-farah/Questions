import { NgtUniversalModule } from '@ng-toolkit/universal';
import { CommonModule } from '@angular/common';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AppComponent }  from './app.component';
import { routing }        from './app.routing';
import { HomeComponent } from './home';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { environment } from '../environments/environment';
import { CoreModule } from './core/core.module';
import { AngularFireModule } from 'angularfire2';;
import { CourseAdminComponent, AddNewCourseDialogComponent } from './course-admin/course-admin.component';
import { MatModule } from './material-module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';;
import { ChatMessageComponent } from './chat-message/chat-message.component'
import { CourseRoomService } from './_services/course-room.service';;
import { ModerateComponent } from './moderate/moderate.component'




export const firebaseConfig = environment.firebaseConfig;

@NgModule({
    imports:[
        CommonModule,
        NgtUniversalModule,
        TransferHttpCacheModule,
        HttpClientModule,
        ReactiveFormsModule,
        HttpClientModule,
        routing,
        AngularFireModule.initializeApp(firebaseConfig),
        CoreModule,
        MatModule,
        BrowserAnimationsModule,
        NoopAnimationsModule,
        FormsModule
    ],
    entryComponents:[
        AddNewCourseDialogComponent
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        RegisterComponent,
        CourseAdminComponent,
        AddNewCourseDialogComponent,
        ChatMessageComponent
,
        ModerateComponent         ],
    providers: [
        CourseRoomService
    ],
})



export class AppModule {
}
