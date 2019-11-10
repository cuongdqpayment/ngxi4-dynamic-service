import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';


import { HttpResponse, HttpErrorResponse } from '@angular/common/http/';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

var token:string;

@Injectable({
  providedIn: 'root'
})

export class RequestInterceptor implements HttpInterceptor {
  
  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
   if (token){
     request = request.clone(
       {
         setHeaders: {
           Authorization: 'Bearer ' + token
         }
       });
   }
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
          }
          return event;
      })
      ,
      catchError((error: HttpErrorResponse) => {
          return throwError(error);
      })
    );
  }
  
  /**
   * Gán token để truyền trước
   * @param tk 
   */
  setRequestToken(tk?:string){
      token = tk?tk:'';
  }

}