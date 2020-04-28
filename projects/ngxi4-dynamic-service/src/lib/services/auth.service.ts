import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RequestInterceptor } from '../interceptors/requestInterceptor';
import { Ngxi4Config, Ngxi4ConfigService } from '../ngxi4-dynamic-service.module';

import SimpleCrypto from "simple-crypto-js"; //cho web ES6
import CryptoJS from "crypto-js"; //cho web ES6 -- xem npm

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public token: string;

  /**
   * Biến toàn cục để lấy đường dẫn
   * Hoặc khai lại đường dẫn lấy từ csdl
   */
  public serviceUrls = {
    
    PUBLIC_SERVER: this.config ? this.config.PUBLIC_SERVER : '/public',
    NEWS_SERVER: this.config ? this.config.NEWS_SERVER : '/news',             // máy chủ tin tức (lưu trữ tin tức)

    AUTH_SERVER: this.config ? this.config.AUTH_SERVER : '/admin',            // api xác thực user, pass và token, api
    MEDIA_SERVER: this.config ? this.config.MEDIA_SERVER : '/media',          // Máy chủ đa phương tiện lưu file
    SOCKET_SERVER: this.config ? this.config.SOCKET_SERVER : '/socket',       // Máy chủ trao đổi socket chat, notify
    RESOURCE_SERVER: this.config ? this.config.RESOURCE_SERVER : '/resource', // máy chủ tài nguyên (ứng dụng chính)
    CHATBOT_SERVER: this.config ? this.config.CHATBOT_SERVER : '/chatbot',    // máy chủ chatbot ()
    NLP_SERVER: this.config ? this.config.NLP_SERVER : '/nlp',                // xử lý ngôn ngữ tự nhiên

    CRM_SERVER: this.config ? this.config.CRM_SERVER : '/crm',
    BIGDATA_SERVER: this.config ? this.config.BIGDATA_SERVER : '/bigdata',

    LOCATION_SERVER: this.config ? this.config.LOCATION_SERVER : '/crm',
    SITE_SERVER: this.config ? this.config.SITE_SERVER : '/site',
    REPORT_SERVER: this.config ? this.config.REPORT_SERVER : '/report',
    SMS_SERVER: this.config ? this.config.SMS_SERVER : '/sms',

    STAFFS_SERVER: this.config ? this.config.STAFFS_SERVER : '/staffs',       //  Quản lý nhân sự - cơ cấu tổ chức - chức danh - nhân sự
    PROCESS_SERVER: this.config ? this.config.PROCESS_SERVER : '/process',    //  Quản lý Quy trình
    WORK_SERVER: this.config ? this.config.WORK_SERVER : '/work',             //  Quản lý Công việc
    REQUEST_SERVER: this.config ? this.config.REQUEST_SERVER : '/request',    //  Quản lý yêu cầu
    ASSET_SERVER: this.config ? this.config.ASSET_SERVER : '/asset',          //  Quản lý tài sản                // xử lý ngôn ngữ tự nhiên
  }

  constructor(
    @Inject(Ngxi4ConfigService) private config: Ngxi4Config,
    private httpClient: HttpClient,
    private reqInterceptor: RequestInterceptor
  ) { }

  //-------- CÁC HÀM HỖ TRỢ BẢO MẬT -----------//

  /**
   * Mã hóa một chiều sha256
   * Cho chuỗi bất kỳ, kể cả unicode
   * 
   * Sử dụng để băm chuỗi mật khẩu lưu vào cơ sở dữ liệu
   * 
   * @param unicodeData 
   */
  sha256(unicodeData) {
    var words = CryptoJS.SHA256(unicodeData);
    var base64 = CryptoJS.enc.Base64.stringify(words);
    return base64;
  }
  /**
   * Hàm chuyển đổi utf8 --> Hex
   * @param str 
   */
  Utf8toHex(utf8: string) {
    var words = CryptoJS.enc.Utf8.parse(utf8);
    var hex = CryptoJS.enc.Hex.stringify(words);
    return hex;
  }


  /**
   * Chuyển đổi hex --> utf8
   * @param hex 
   */
  HextoUtf8(hex: string) {
    var words = CryptoJS.enc.Hex.parse(hex);
    var utf8 = CryptoJS.enc.Utf8.stringify(words);
    return utf8;
  }


  /**
   * Hàm chuyển đổi utf8 --> base64
   * @param str 
   */
  Utf8toBase64(utf8: string) {
    var words = CryptoJS.enc.Utf8.parse(utf8);
    var base64 = CryptoJS.enc.Base64.stringify(words);
    return base64;
  }

  /**
   * Chuyển đổi base64 --> utf8
   * @param base64 
   */
  Base64toUtf8(base64: string) {
    var words = CryptoJS.enc.Base64.parse(base64);
    var utf8 = CryptoJS.enc.Utf8.stringify(words);
    return utf8;
  }


  // Hai hàm mã hóa dữ liệu theo crypto như dưới máy chủ
  /**
     *  
     * Mã hóa dữ liệu bằng thuật toán cryto
     * Với mật khẩu mã hóa người dùng tự đặt,
     * 
     * 
     * @param textData 
     * @param password 
     */
  encryptTextCypto(textData: string, password: string) {
    var simpleCrypto = new SimpleCrypto(password);
    return simpleCrypto.encrypt(textData);
  }

  /**
   * 
   * giải mã dữ liệu bằng crypto
   * 
   * @param strEncrypted 
   * @param password 
   */
  decryptTextCrypto(strEncrypted: string, password: string) {
    try {
      let simpleCrypto = new SimpleCrypto(password);
      return simpleCrypto.decrypt(strEncrypted);
    } catch (e) { }
    //trường hợp giải mã bị lỗi thì trả về một số random nhé
    return "KX2TTPuf/WHdxeDeGSyFzpNQLRmnrkdWaF55XRfkYSUokJDR/PxHxIYswsjNYiD454rHScaEmBXszrYnou/eeQ=="; //số ngẫu nhiên
  }

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
      })
      .catch(err => {
        throw err && err.error ? err.error : err;
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
      })
      .catch(err => {
        throw err && err.error ? err.error : err;
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
      })
      .catch(err => {
        throw err && err.error ? err.error : err;
      });
  }

}
