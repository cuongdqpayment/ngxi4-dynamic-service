import { NgModule, InjectionToken, ModuleWithProviders } from '@angular/core';
import { Ngxi4AuthService } from './services/ngxi4-auth.service';
import { Ngxi4CommonsService } from './services/ngxi4-common.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { RequestInterceptor } from './interceptors/requestInterceptor';
import { CardDynamicFormComponent } from './cards/card-dynamic-form/card-dynamic-form.component';
import { SQLite } from '@ionic-native/sqlite/ngx';

// Cấu hình tham số đầu vào, người dùng khai báo
export interface Ngxi4Config {
  authServerUrl: string;  // ví dụ: đường dẫn cơ sở của dịch vụ xác thực
}
// Dịch vụ tiêm tham số xuống cho các dịch vụ bên dưới
export const Ngxi4ConfigService = new InjectionToken<Ngxi4Config>('Ngxi4Config');
 
@NgModule({
  declarations: [
    // khai báo thành phần
    CardDynamicFormComponent
  ],
  imports: [
    HttpClientModule, // để giao tiếp api
    IonicModule.forRoot()
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
    CardDynamicFormComponent
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
        Ngxi4AuthService,
        Ngxi4CommonsService,
        // xuất bản tham số ???...
        {
          provide: Ngxi4ConfigService,
          useValue: config
        }
      ]
    };
  }
}
