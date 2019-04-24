import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { DatabaseService } from '../_services/database.service'
import {MatPaginator, MatTableDataSource, MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA} from '@angular/material';
import { Courses } from '../_models/courses';
import {FormBuilder, FormControl, FormGroupDirective, NgForm, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {CourseRoomService} from '../_services/course-room.service'
import { DataSource } from '@angular/cdk/table';
import {  ChangeDetectorRef } from '@angular/core';



@Component({
  selector: 'app-course-admin',
  templateUrl: './course-admin.component.html',
  styleUrls: ['./course-admin.component.css']
})

export class CourseAdminComponent implements OnInit {
  isDataLoaded : Promise<Boolean>;
  courseList : Courses[] = [];
  displayedColumns: string[] = ['CourseId', 'CourseName', 'CourseNumber', 'CourseTerm', 'CourseSection', 'Instructor', 'ClassSize', 'EditClass'];
  dataSource = new MatTableDataSource<Courses>(this.courseList); 
   @ViewChild(MatPaginator) paginator: MatPaginator;

  // ngOnInit() {
  //   this.dataSource.paginator = this.paginator;
  // }

  /**
   * Gets the course list on page load
   */

     /**
   * 
   * @param dbs DataBaseService
   * @param dialog MatDialog
   */
  constructor(private dbs : DatabaseService, private crs: CourseRoomService,
    private dialog: MatDialog, private cd: ChangeDetectorRef){

      this.crs.courserooms.subscribe(courses => {
        this.dataSource.data = courses;
        this.courseList = courses;
        this.dataSource.paginator = this.paginator;
      });

  }

  async ngOnInit() {
    this.dataSource.data = await this.dbs.getAllDocs('courses').then(courses => {return courses});

  }
  /**
   * Opens dialog
   */
  openDialog() {
    const dialogRef = this.dialog.open(AddNewCourseDialogComponent,{
      panelClass:'custom-dialog-container',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  editDialog(course) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = course;
    dialogConfig.data['panelClass'] ='custom-dialog-container';
    dialogConfig.data['disableClose'] = true;
    const dialogRef = this.dialog.open(AddNewCourseDialogComponent, dialogConfig);



  }
}





@Component({
  selector: 'add-course',
  templateUrl: 'add-new-course-dialog.html',
  styleUrls: ['./course-admin.component.css']
})
/**
 * Custom Html component
 */
export class AddNewCourseDialogComponent {
  emails = [];
  title = "Add New Course";
  newCourse: FormGroup;
  submitted = false;
  matcher = new MyErrorStateMatcher(false, false);
  clMatcher = new MyErrorStateMatcher(false, false);

  /**
   * Constuctor
   * @param dialogRef Custom Dialog Html
   * @param fb FormBuilder
   */
  constructor(private dbs : DatabaseService, private dialogRef: MatDialogRef<AddNewCourseDialogComponent>,
    fb: FormBuilder, @Inject(MAT_DIALOG_DATA) data
    ){
      if(data === null){
      this.newCourse = fb.group({
        ClassList: ["",[Validators.email, Validators.required]],
        CourseId: [{value :"", disabled:'true'}],
        CourseName: ["", [Validators.required, Validators.pattern("^[A-Za-z]*$"), Validators.minLength(4), Validators.maxLength(4)]],
        CourseNumber: ["", [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(3), Validators.maxLength(3)]],
        CourseSection: ["", Validators.required],
        CourseTerm: ["", Validators.required],
        Instructor: ["", Validators.required]
      })
    }
    else{
      this.emails = data.ClassList;
      this.title = "Edit " + data.CourseName + " " + data.CourseNumber; 
      this.newCourse = fb.group({
        ClassList: ["",[Validators.email, Validators.required]],
        CourseId: [{value :data.CourseId, disabled:'true'}],
        CourseName: [data.CourseName, [Validators.required, Validators.pattern("^[A-Za-z]*$"), Validators.minLength(4), Validators.maxLength(4)]],
        CourseNumber: [data.CourseNumber, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(3), Validators.maxLength(3)]],
        CourseSection: [data.CourseSection, Validators.required],
        CourseTerm: [data.CourseTerm, Validators.required],
        Instructor: [data.Instructor, Validators.required]
      })
      
    }
    }
    async ngOnInit(){
      if(this.id === ""){
        let courseId = Math.floor(Math.random() * 999999) + 100000; 
        while(!await this.dbs.verifyInfo('CourseId', "" + courseId ,'Courses')){
          courseId = Math.floor(Math.random() * 999999) + 100000;
        }
        this.newCourse.get("CourseId").setValue("" + courseId);
    }
    }
  /**
   * Getting funtion for the controls
   */
  get f() {return this.newCourse.controls};

  /**
   * Getter functions
   */
  get email() {return this.newCourse.get("ClassList").value};
  get id() {return this.newCourse.get("CourseId").value};
  get name() {return this.newCourse.get("CourseName").value};
  get number() {return this.newCourse.get("CourseNumber").value};
  get section() {return this.newCourse.get("CourseSection").value};
  get term() {return this.newCourse.get("CourseTerm").value};
  get instructor() {return this.newCourse.get("Instructor").value};


  /**
   * Close dialog without any actions
   */
  onNoClick(): void {
    this.dialogRef.close();
  }

  /**
   * Save Course to the database and close the dialog
   */
  saveCourse(){
    // Must have for this to work
    this.newCourse.get("ClassList").setValue("hacking@test.com");
    this.newCourse.get("ClassList").updateValueAndValidity;
    this.submitted = true;
    this.matcher = new MyErrorStateMatcher(true, false);
    if(this.newCourse.valid){
      this.newCourse.get("ClassList").setValue("");

      this.dbs.saveCourse(this.emails, this.id, this.name, this.number, this.section, this.term, this.instructor);
      this.dialogRef.close();
    }
    this.newCourse.get("ClassList").setValue("");
  }

  /**
   * Add Email
   */
  addEmail(){
    this.clMatcher = new MyErrorStateMatcher(true, false);
    if(this.f.ClassList.valid){
      this.emails.push(this.email);
      this.newCourse.get("ClassList").setValue("");
      this.clMatcher = new MyErrorStateMatcher(false, true);
    }
    return;
  }
  /**
   * Delete Email then allow editing
   * @param i Index to delete
   */
  deleteEmail(i){
    this.newCourse.get("ClassList").setValue(this.emails[i]);
    this.emails.splice(i, 1);
  }


}

/**
 * For custom errors
 */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isSubmitted;
  override;
  /**
   * 
   * @param isSubmitted Custom is submitted
   * @param override Override the settings to return false
   */
  constructor(isSubmitted, override){
    this.isSubmitted = isSubmitted;
    this.override = override;

  }
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    if(this.override){
      return !!(false);
    }
    return !!(control && control.invalid && (control.dirty || control.touched || this.isSubmitted));
  }
}