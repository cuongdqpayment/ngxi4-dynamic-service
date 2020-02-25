# Ngxi4DynamicService

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.18.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).



## 1. Cài đặt cho lệnh ng:
npm install -g @angular/cli

## 2. Tạo thư viện:
ng new ngxi4-dynamic-service --createApplication=false

## 3. Vào thư mục của dự án:
cd ./ngxi4-dynamic-service

# 4. Tạo một thư viện dự án (projects) ngxi4-dynamic-service:
ng g library ngxi4-dynamic-service --prefix=ngxi4 --entryFile=ngx-i4

# Thêm một service cho dự án lib:
ng g service services/Ngxi4Auth --project ngxi4-dynamic-service
ng g service services/Ngxi4Common --project ngxi4-dynamic-service

# Phải khai thêm một dòng ở file ngx-i4.ts
export * from './lib/services/ngxi4-common.service';

## Chỉnh sửa thư viện để khai báo các thành phần của ionic4:
npm i @ionic/angular

# Thêm một thành phần cho dự án lib:
ng g component cards/Ngxi4CardDynamicForm --project ngxi4-dynamic-service

## 5. Xây dựng thư viện
```sh
# Để xuất bản một phiên bản mới, phải sửa chuỗi `"version": "2.0.0"` tăng lên 1 version
#  trong package.json của thư viện
ng build
```

# Thay đổi thư mục của thư viện để xuất bản thư viện hoặc tạo liên kết npm
```sh
cd dist/ngxi4-dynamic-service
```

# publish lên npm - login với user - namedq(xxxyq.payment@g)
```sh
npm publish
```

# Tạo liên kết với npm để cài đặt cho máy nôi bộ 
npm link


# Để sử dụng:
npm i ngxi4-dynamic-service --save

## Lệnh npm link sẽ tạo liên kết lệnh trong máy này thôi.
## Và sẽ cho phép các dự án khác dùng lệnh:
npm link ngxi4-dynamic-service
# kết quả như lệnh npm i ngxi4-dynamic-service
# do thư viện chưa publish


# Sửa ngxi4-dynamic-service.module.ts thêm các import và export cho thư viện

# Sửa các component, service, module để thực thi ok


## Tạo một dự án mới, import thư viện này như sau:
npm link ngxi4-dynamic-service

# Mở file : angular.json bổ sung dòng cuối để có thể import được thư viện:

  "projects": {
    "app": {
      "architect": {
        "build": {
          "options": {
            "preserveSymlinks": true,


# Thêm bộ tham số cấu hình đồng nhất ở thư viện trùng với các thành phần của dự án này
Tìm trong file: ./tsconfig.json và thêm dòng sau vào
{
  "compilerOptions": {
    // ...
    // paths are relative to `baseUrl` path.
    "paths": {
      "@angular/*": [
        "./node_modules/@angular/*"
      ],
      "@ionic/*": [
        "./node_modules/@ionic/*"
      ]
    }
  }
}

## -- Xuất bản npm publish
```sh
npm login
# user - namedq@Shorthand login với user - namedq(nameshort.payment@g)
ng build
cd dist/ngxi4-dynamic-service
npm publish
cd ../../
```