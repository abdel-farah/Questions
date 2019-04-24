import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { DatabaseService } from '../_services/database.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private auth: AuthService,
        private dbs: DatabaseService
    ) {}

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let toLoad : Promise<boolean>;
        toLoad = new Promise((resolve =>{
            this.dbs.currentUser.subscribe(user =>{
                if(user){
                    if(user.type === "student" && route.routeConfig.path === "home"){
                        resolve(true)
                        return true;
                    }
                    else if (user.type === "admin" && route.routeConfig.path === "courses"){
                        resolve(true)
                        return true;
                    }
                    else if(user.type === "instructor" && route.routeConfig.path === "moderate"){
                        resolve(true)
                        return true;
    
                    }
                    else{
                        if(user.type === "student"){
                            this.router.navigate(['/home']);
                        }
                        else if(user.type === "admin"){
                            this.router.navigate(['/courses']);
                        }
                        else if(user.type === "instructor"){
                            this.router.navigate(['/moderate']);
                        }
                        else{
                            resolve(false);
                        }
                    }
                }
            })
        } ))
         

        let redir = await toLoad.then(toRedir => {return toRedir});
        if(redir === false){
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
            return false;
        }
        else{
            return redir;
        }
    }
}