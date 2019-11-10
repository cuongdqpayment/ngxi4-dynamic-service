import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RequestInterceptor } from '../interceptors/requestInterceptor';
import { Ngxi4Config, Ngxi4ConfigService } from '../ngxi4-dynamic-service.module';

@Injectable({
  providedIn: 'root'
})
export class Ngxi4AuthService {

  public token: string;

  /**
   * Biến toàn cục để lấy đường dẫn
   * Hoặc khai lại đường dẫn lấy từ csdl
   */
  public serviceUrls: any = {
    AUTH_SERVER: this.config?this.config.authServerUrl:'/'  // api xác thực user, pass và token, api
  }

  constructor(
    @Inject(Ngxi4ConfigService) private config: Ngxi4Config,
    private httpClient: HttpClient,
    private reqInterceptor: RequestInterceptor,
  ) { }

  //------- Các hàm tương tác dữ liệu API resful với server ----//
  /**
   * get url => req.paramS
   * @param url 
   * @param token 
   * @param options 
   */
  getDynamicUrl(url: string, token?: any, options?: any) {

    this.reqInterceptor.setRequestToken(token && token.length ? token : token && this.token ? this.token : '');

    return this.httpClient.get(url, options)
      .toPromise<any>()
      .then(data => {
        let rtn: any;
        rtn = data;
        return rtn;
      });
  }

  /**
   * post json_data => req.json_data
   * @param url 
   * @param json_data 
   * @param token 
   */
  postDynamicJson(url: string, json_data: Object, token?: any) {

    this.reqInterceptor.setRequestToken(token && token.length ? token : token && this.token ? this.token : '');

    return this.httpClient.post(url, JSON.stringify(
      json_data,
      (key, value) => {
        if (value === null) { return undefined; } // Không chuyển các giá trị null lên
        return value;
      }
      , 2))
      .toPromise<any>()
      .then(data => {
        let rtn: any;
        rtn = data;
        return rtn;
      });
  }

  /**
   * post FormData => req.form_data
   * @param url 
   * @param form_data FormData
   * @param token 
   */
  postDynamicFormData(url: string, form_data: any, token?: any) {

    this.reqInterceptor.setRequestToken(token && token.length ? token : token && this.token ? this.token : '');

    return this.httpClient.post(url, form_data)
      .toPromise<any>()
      .then(data => {
        let rtn: any;
        rtn = data;
        return rtn;
      });
  }

}
