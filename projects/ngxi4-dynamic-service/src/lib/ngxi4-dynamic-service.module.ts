import { NgModule, InjectionToken, ModuleWithProviders } from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { AuthService } from './services/auth.service';
import { CommonsService } from './services/common.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestInterceptor } from './interceptors/requestInterceptor';
import { ApiStorageService } from './services/api-storage.service';
import { ImageService } from './services/image.service';

import { SQLite } from '@ionic-native/sqlite/ngx';
import { SqliteService } from './services/sqlite.service';
import { ImageCropperModule } from 'ngx-image-cropper';
import { WebcamModule } from 'ngx-webcam';

import { NgxQRCodeModule } from 'ngx-qrcode2';
import { NgxBarcodeModule } from 'ngx-barcode';
import { FormsModule } from '@angular/forms';
import { StorageServiceModule } from 'angular-webstorage-service';
import { CardDynamicFormComponent } from './cards/card-dynamic-form/card-dynamic-form.component';
import { CardDynamicListComponent } from './cards/card-dynamic-list/card-dynamic-list.component';
import { CardMultiCheckComponent } from './cards/card-multi-check/card-multi-check.component';
import { MultiChoiceComponent } from './popovers/multi-choice/multi-choice.component';
import { PopoverCardComponent } from './popovers/popover-card/popover-card.component';
import { CameraCardComponent } from './popup-modals/camera-card/camera-card.component';
import { DynamicFormMobilePage } from './popup-modals/dynamic-form-mobile/dynamic-form-mobile';
import { DynamicPostImagePage } from './popup-modals/dynamic-post-image/dynamic-post-image';
import { Ionic4CroppieComponent } from './popup-modals/ionic4-croppie/ionic4-croppie.component';
import { NewlinePipe } from './pipes/new-line';
import { ArrayPipe } from './pipes/array-pipe';
import { SafePipe } from './pipes/safe-pipe';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

// Cấu hình tham số đầu vào, người dùng khai báo
export interface Ngxi4Config {
  AUTH_SERVER: string;       //  Máy chủ xác thực
  MEDIA_SERVER: string;      //  Máy chủ đa phương tiện
  RESOURCE_SERVER: string;   //  Máy chủ tài nguyên ứng dụng
  SOCKET_SERVER: string;     //  Máy chủ socket
  NEWS_SERVER: string;       //  Máy chủ tin tức mạng xã hội 
  CHATBOT_SERVER: string;    //  máy chủ chatbot ()
  NLP_SERVER: string;        //  xử lý ngôn ngữ tự nhiên

  CRM_SERVER: string;
  BIGDATA_SERVER: string;

  LOCATION_SERVER: string;
  SITE_SERVER: string;
  REPORT_SERVER: string;
  SMS_SERVER: string;
  PUBLIC_SERVER: string;
  
  STAFFS_SERVER: string;     //  Quản lý nhân sự - cơ cấu tổ chức - chức danh - nhân sự
  PROCESS_SERVER: string;    //  Quản lý Quy trình
  WORK_SERVER: string;       //  Quản lý Công việc
  REQUEST_SERVER: string;    //  Quản lý yêu cầu
  ASSET_SERVER: string;      //  Quản lý tài sản
}
// Dịch vụ tiêm tham số xuống cho các dịch vụ bên dưới
export const Ngxi4ConfigService = new InjectionToken<Ngxi4Config>('Ngxi4Config');
 
@NgModule({
  declarations: [
    
    // Các pipe dữ liệu không chèn ở entry
    NewlinePipe,
    ArrayPipe,
    SafePipe,

    // khai báo thành phần
    // Các components Card chèn vào các trang
    CardDynamicFormComponent,
    CardDynamicListComponent,
    CardMultiCheckComponent,

    // popover
    MultiChoiceComponent,
    PopoverCardComponent,     // menu chọn 1 (lựa chọn setting)

    // Các trang gọi riêng gọi theo kiểu popup hoặc modal
    // popupModal
    CameraCardComponent,      // chụp ảnh bằng webcam
    DynamicFormMobilePage,    // trang form nhập liệu
    DynamicPostImagePage,      // Trang post ảnh & file & text
    Ionic4CroppieComponent   // cắt ảnh bằng angular

  ],
  entryComponents: [
    
    // Các components Card chèn vào các trang
    CardDynamicFormComponent,
    CardDynamicListComponent,
    CardMultiCheckComponent,

    // popover
    MultiChoiceComponent,
    PopoverCardComponent,     // menu chọn 1 (lựa chọn setting)
    
    // popupModal
    CameraCardComponent,      // chụp ảnh bằng webcam
    DynamicFormMobilePage,    // trang form nhập liệu
    DynamicPostImagePage,      // Trang post ảnh & file & text
    Ionic4CroppieComponent   // cắt ảnh bằng angular
  ],
  imports: [
    ImageCropperModule, // Đối tượng cắt ảnh cropper

    WebcamModule,       // Dùng để mở webcame lên

    NgxBarcodeModule,  // đói tượng dùng ngx-barcode
    NgxQRCodeModule,   // dùng ngx-qrcode
 
    StorageServiceModule, // module dành cho dịch vụ lưu trữ xuống đĩa

    HttpClientModule, // để giao tiếp api

    NgMultiSelectDropDownModule.forRoot(),

    // 3 module chỉ import 1 lần ở cấp cao nhất
    // , không import lần thứ 2 nếu không sẽ báo lỗi
    // BrowserModule, BrowserAnimationsModule, HttpClientModule,

    FormsModule,     // thêm thành phần của ngModel
    CommonModule,    // Thêm thành phần cơ bản dùng chung cho ionic và angular các lệnh pipe cơ bản...
    IonicModule      // thành phần của ionic
  ],
  providers: [
    SQLite,
    // Nhúng bảo mật interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true
    }
  ],
  exports: [
    // xuất bản thành phần

    // Các pipe dữ liệu không chèn ở entry
    NewlinePipe,
    ArrayPipe,
    SafePipe,
    
    // Các components Card chèn vào các trang
    CardDynamicFormComponent,
    CardDynamicListComponent,
    CardMultiCheckComponent,
    
    // popover
    MultiChoiceComponent,
    PopoverCardComponent,     // menu chọn 1 (lựa chọn setting)

    // Các trang gọi riêng gọi theo kiểu popup hoặc modal
    // popupModal
    CameraCardComponent,      // chụp ảnh bằng webcam
    DynamicFormMobilePage,    // trang form nhập liệu
    DynamicPostImagePage,      // Trang post ảnh & file & text
    Ionic4CroppieComponent,   // cắt ảnh bằng angular

    // Xuất bản các module để sử tái sử dụng riêng lẻ
    ImageCropperModule, // Đối tượng cắt ảnh cropper
    WebcamModule,       // Dùng để mở webcame lên
    NgxBarcodeModule,  // đói tượng dùng ngx-barcode
    NgxQRCodeModule   // dùng ngx-qrcode

  ]
})
export class Ngxi4DynamicServiceModule { 
  // Cấu hình khởi tạo dịch vụ
  static forRoot(config?: Ngxi4Config): ModuleWithProviders {
    return {
      // xuất bản module
      ngModule: Ngxi4DynamicServiceModule,
      providers: [
        // xuất bản dịch vụ
        ApiStorageService,
        AuthService,
        CommonsService,
        ImageService,
        SqliteService,
        // xuất bản tham số ???...
        {
          provide: Ngxi4ConfigService,
          useValue: config
        }
      ]
    };
  }
}
