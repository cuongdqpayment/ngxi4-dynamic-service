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
import { BrowserModule } from '@angular/platform-browser';
import { CardDynamicFormComponent } from './cards/card-dynamic-form/card-dynamic-form.component';
import { CardDynamicListComponent } from './cards/card-dynamic-list/card-dynamic-list.component';
import { CardMultiCheckComponent } from './cards/card-multi-check/card-multi-check.component';
import { MultiChoiceComponent } from './popovers/multi-choice/multi-choice.component';
import { PopoverCardComponent } from './popovers/popover-card/popover-card.component';
import { CameraCardComponent } from './popup-modals/camera-card/camera-card.component';
import { DynamicFormMobilePage } from './popup-modals/dynamic-form-mobile/dynamic-form-mobile';
import { DynamicPostImagePage } from './popup-modals/dynamic-post-image/dynamic-post-image';
import { Ionic4CroppieComponent } from './popup-modals/ionic4-croppie/ionic4-croppie.component';

// Cấu hình tham số đầu vào, người dùng khai báo
export interface Ngxi4Config {
  authServerUrl: string;  // ví dụ: đường dẫn cơ sở của dịch vụ xác thực
}
// Dịch vụ tiêm tham số xuống cho các dịch vụ bên dưới
export const Ngxi4ConfigService = new InjectionToken<Ngxi4Config>('Ngxi4Config');
 
@NgModule({
  declarations: [
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

    BrowserModule,   // thành phần cơ bản của web angular
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

    // Xuất bản các module
    ImageCropperModule, // Đối tượng cắt ảnh cropper
    WebcamModule,       // Dùng để mở webcame lên
    NgxBarcodeModule,  // đói tượng dùng ngx-barcode
    NgxQRCodeModule,   // dùng ngx-qrcode

    StorageServiceModule, // module dành cho dịch vụ lưu trữ xuống đĩa
    
    HttpClientModule, // để giao tiếp api

    BrowserModule,   // thành phần cơ bản của web angular
    FormsModule,     // thêm thành phần của ngModel
    CommonModule,    // Thêm thành phần cơ bản dùng chung cho ionic và angular các lệnh pipe cơ bản...
    IonicModule      // thành phần của ionic

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
