import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';
import {NgModule} from '@angular/core';
import { MatTableModule, MatPaginatorModule } from '@angular/material';
import { MatDialogModule } from '@angular/material';
import {MatFormFieldModule, MatInputModule} from '@angular/material';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {MatGridListModule} from '@angular/material/grid-list';




@NgModule({
    exports:[
        MatButtonModule,
        MatSidenavModule,
        MatTableModule,
        MatPaginatorModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        MatTreeModule,
        MatIconModule,
        MatGridListModule
    ]
})
export class MatModule{}
