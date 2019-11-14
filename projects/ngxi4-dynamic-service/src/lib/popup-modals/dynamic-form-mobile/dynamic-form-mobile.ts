/**
 * ver 6.0 thêm đối tượng object, element, list
 * Định nghĩa để trả về value = string: {key,value} | {name:object:{key,value} | {name:,items:[{key,value}]}
 * Biến isEditingObjects sẽ ẩn các nút lệnh không cho thực thi form nếu đang sửa chữa các phần tử con
 * 
 * ver 5.0 Ngày 05/10/2019
 * Bổ sung crop ảnh, chụp luôn hình ảnh ngay trên form
 * dữ liệu ảnh trả về là một chuỗi base64 của ảnh, giảm kích thước...
 * 
 * Hành động lưu csdl save:
 * 
 * // thực thi lệnh lưu csdl client (dành cho app mobile)
 * btn = {next:'CALLBACK', table:'table_name', wheres:['column_name']}
 * // sau 1 giây thực thi luôn form
 * auto_hidden = {next:'CALLBACK', table:'table_name', wheres:['column_name']}
 * 
 * // thực thi lệnh post lên cloud
 * btn = {next:'CALLBACK', url:'https://...', token:true}
 * 
 * // đóng luôn
 * btn = {next:'CLOSE'} 
 * 
 * 
 * ver 4.0 ngày 10/09/2019
 * Chuyển đổi ionic 4
 * 
 * ver 3.1 29/08/2019
 * Tính năng ajax thay đổi một array các item trong form
 * bỏ thuộc tính mặt định có nút home, mà phải khai cho nó là true
 * 
 * ver 3.0 16/08/2019
 * Thêm tính năng gọi ajax thay đổi giá trị khi chọn lựa
 * Xem form administrators cho biến gọi lại là ajax
 * Truyền lên cả giá trị value = 0 hoặc false 
 *
 * 
 * 
 * ver 2.0
 * 11/06/2019
 * chi con lai key,value valid for select
 * 
 */
import { Component, } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NavController, NavParams, PopoverController } from '@ionic/angular';

import { DomSanitizer } from '@angular/platform-browser';
import { CommonsService } from '../../services/common.service';
import { AuthService } from '../../services/auth.service';
import { SqliteService } from '../../services/sqlite.service';
import { ImageService } from '../../services/image.service';
import { Ionic4CroppieComponent } from '../ionic4-croppie/ionic4-croppie.component';
import { CameraCardComponent } from '../camera-card/camera-card.component';
import { PopoverCardComponent } from '../../popovers/popover-card/popover-card.component';

@Component({
  selector: 'page-dynamic-form-mobile',
  templateUrl: './dynamic-form-mobile.html',
  styleUrls: ['./dynamic-form-mobile.scss']
})
export class DynamicFormMobilePage {

  dynamicForm: any = {
    title: "Form mẫu"
    //, auto_hidden: false //|| 3000 || true
    , color: { header:"medium", background:"#2d96de"}
    , buttons: [
      { color: "danger", icon: "close", next: "CLOSE" }
    ]
    , items: [
      { type: "avatar", name: "Thông tin cá nhân avatar", hint: "Avatar", url: "https://www.w3schools.com/howto/img_forest.jpg" }
      , { type: "title", name: "Tiêu đề form" }
      , { type: "qrcode", name: "Mã QrCode", value:"https://c3.mobifone.vn" }
      , { type: "barcode", name: "Mã BarCode", value:"0903500888" }
      , { type: "hidden", key: "id", value: "abc" } //truyen gia tri 
      , { type: "check", key: "check_ok", name: "Check hay không chọn?", value: true }
      , { type: "range", key: "range_number", name: "", icon: "contrast", value: 50, min: 0, max: 100 }
      , { type: "range-text", key: "range_text", name: "Kéo chọn", icon: "contrast", value: 50, min: 0, max: 100 }
      , { type: "toggle", key: "check_toggle", name: "Chọn hay không chọn Toggle?", icon: "call" }
      , { type: "radio", key: "select_radio", name: "Chọn radio cái nào", icon: "call", value: 2, options: [{ name: "Tùy chọn 1", value: 1 }, { name: "Tùy chọn 2", value: 2 }] }
      , { type: "select", key: "select_1", name: "Chọn 1 cái nào", value: 2, options: [{ name: "Tùy chọn 1", value: 1 }, { name: "Tùy chọn 2", value: 2 }] }
      , { type: "select_multiple", key: "select_n", name: "Chọn nhiều cái nào", value: 2, options: [{ name: "Tùy chọn 1", value: 1 }, { name: "Tùy chọn 2", value: 2 }] }
      , { type: "image", name: "Ảnh cá nhân", hint: "image viewer", url: "https://www.w3schools.com/howto/img_forest.jpg" }
      , { type: "text", key: "username", disabled: true, name: "username", hint: "Số điện thoại di động 9 số bỏ số 0 ở đầu", input_type: "userName", icon: "information-circle", validators: [{ required: true, min: 9, max: 9, pattern: "^[0-9]*$" }] }
      , { type: "password", key: "password", name: "password", hint: "Mật khẩu phải có chữ hoa, chữ thường, ký tự đặc biệt, số", input_type: "password", icon: "information-circle", validators: [{ required: true, min: 6, max: 20 }] }
      , { type: "text", key: "name", name: "Họ và tên", input_type: "text", icon: "person" }
      , { type: "text", key: "phone", name: "Điện thoại", hint: "Yêu cầu định dạng số điện thoại nhé", input_type: "tel", icon: "call", validators: [{ pattern: "^[0-9]*$" }] }
      , { type: "text", key: "email", name: "email", hint: "Yêu cầu định dạng email nhé", input_type: "email", icon: "mail", validators: [{ pattern: "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" }] }
      , { type: "datetime", key: "start_date", name: "Ngày bắt đầu", hint: "Chọn ngày", display: "DD/MM/YYYY", picker: "DD MM YYYY" }
      , { type: "datetime", key: "start_time", name: "Thời gian bắt đầu", hint: "Chọn thời gian", display: "HH:mm:ss", picker: "HH:mm:ss" }
      , { type: "text_area", key: "text_area", name: "Nội dung nhập", hint: "Nhập nhiều dòng" }

      // version 6.0 dùng thêm đối tượng
      , { type: "object", key: "new_object", name: "Tên đối tượng cố định không sửa", hint: "là dynamicForm" }
      , { type: "element", key: "new_element", name: "Tên phần tử", hint: "là dynamicForm" }
      , { type: "list", key: "new_list", name: "Tên của danh sách", hint: "là dynamicForm" }
      , { type: "elements", key: "new_elements", name: "Tên của danh sách phần tử", hint: "là dynamicForm" }


      , {
        type: "svg", name: "Nhập đúng captcha", hint: "Vui lòng nhập đúng captcha hình bên", validators: [{ required: true, min: 4, max: 4 }],
        data: "<svg xmlns='http://www.w3.org/2000/svg' width='150' height='50' viewBox='0,0,150,50'>\
                <rect width='100%' height='100%' fill='#e0f0f1' />\
                <path d='M20 9 C84 36,65 2,144 29' stroke='#ddb640' fill='none' />\
                <path d='M9 17 C72 39,94 24,144 38' stroke='#e6e688' fill='none' />\
                <path fill='#687087'\
                  d='M87.93 30.00L87.84 29.90L87.87 29.93Q85.29 29.75 83.95 30.97L83.97 30.98L83.92 30.93Q82.64 32.20 82.94 34.71L82.90 34.67L82.96 34.73Q83.23 37.21 84.45 38.47L84.56 38.58L84.56 38.57Q85.48 39.76 87.61 39.68L87.63 39.71L87.75 39.82Q88.32 39.83 88.51 39.83L88.41 39.73L88.38 39.70Q91.87 39.03 91.99 34.43L92.06 34.50L91.98 34.43Q92.21 32.21 91.52 31.41L91.40 31.30L91.48 31.37Q90.50 30.16 87.94 30.01ZM91.13 41.61L91.10 41.58L91.25 41.73Q89.88 42.26 88.32 42.19L88.33 42.19L88.34 42.20Q84.47 42.37 83.17 39.78L83.18 39.78L83.25 39.85Q83.00 45.12 81.67 49.39L81.60 49.32L81.71 49.43Q79.77 49.78 78.13 50.50L78.26 50.63L78.15 50.51Q80.68 44.51 80.41 37.55L80.50 37.63L80.56 37.70Q80.19 30.74 77.29 24.69L77.33 24.72L77.44 24.83Q79.23 25.86 80.94 26.32L81.09 26.47L81.43 27.76L81.46 27.79Q81.66 28.22 81.93 29.32L81.91 29.30L81.81 29.20Q83.01 27.32 86.59 27.13L86.53 27.07L86.56 27.10Q87.39 27.01 88.26 27.01L88.17 26.92L88.85 27.11L88.84 27.10Q88.95 27.09 89.14 27.13L88.97 26.96L89.30 26.98L89.34 27.02Q91.47 27.37 92.20 27.60L92.10 27.50L92.13 27.53Q93.59 27.96 94.46 28.91L94.57 29.02L94.45 28.90Q95.38 30.17 95.34 31.58L95.40 31.64L95.36 31.60Q95.30 34.39 94.50 37.06L94.50 37.06L94.48 37.04Q93.59 40.68 91.23 41.71ZM95.46 42.28L95.50 42.29L95.40 42.18Q96.52 40.21 96.82 36.10L96.81 36.10L96.87 36.16Q96.91 34.29 96.91 33.03L97.03 33.15L96.97 33.09Q97.06 31.66 96.30 30.25L96.33 30.28L96.30 30.25Q95.73 29.65 95.23 29.26L95.40 29.43L95.10 29.01L94.94 28.74L94.84 28.53L94.86 28.54Q93.22 26.60 88.88 26.60L88.82 26.55L88.31 26.64L88.30 26.63Q83.55 26.53 81.92 28.13L81.89 28.11L82.07 28.29Q81.76 27.63 81.60 27.13L81.57 27.10L81.32 26.05L81.31 26.04Q78.96 25.55 76.75 24.07L76.60 23.92L76.67 23.99Q79.94 30.30 80.25 37.54L80.19 37.48L80.18 37.47Q80.60 44.86 77.74 51.33L77.61 51.19L79.63 50.36L79.72 50.45Q79.32 51.03 78.63 52.60L78.78 52.75L78.74 52.70Q81.44 51.64 83.76 51.30L83.70 51.23L83.76 51.29Q84.94 46.53 85.09 42.80L84.95 42.66L84.89 42.60Q86.39 44.18 90.01 44.41L89.92 44.32L90.10 44.50Q94.04 44.74 95.49 42.31L95.50 42.32ZM89.67 32.07L89.67 32.07L89.74 32.15Q90.34 32.02 91.45 32.37L91.44 32.36L91.41 32.33Q91.72 33.36 91.68 34.54L91.82 34.68L91.70 34.57Q91.63 35.41 91.44 36.05L91.60 36.22L91.59 36.20Q90.83 39.06 88.32 39.37L88.24 39.29L88.46 39.39L88.35 39.28Q88.43 39.44 88.32 39.48L88.20 39.36L87.63 39.32L87.65 39.35Q86.48 39.36 85.49 38.86L85.56 38.92L85.14 36.80L85.07 36.73Q85.03 34.51 86.32 33.49L86.23 33.39L86.35 33.52Q87.25 32.32 89.65 32.06Z' />\
                <path fill='#873bd2'\
                  d='M62.04 40.94L61.97 40.87L62.07 40.96Q60.66 39.17 59.36 36.09L59.51 36.24L57.24 30.96L57.25 30.97Q55.64 34.95 55.03 36.24L55.08 36.29L55.04 36.26Q53.73 39.33 52.14 41.23L52.09 41.19L52.05 41.15Q51.71 41.19 50.95 41.30L50.98 41.34L50.85 41.20Q51.04 33.97 45.21 28.03L45.02 27.84L45.08 27.90Q43.38 26.12 41.36 24.64L41.29 24.57L41.41 24.68Q43.26 25.23 45.12 25.54L45.03 25.45L45.03 25.45Q51.09 30.40 52.53 36.65L52.51 36.62L52.67 36.78Q53.57 34.94 54.75 31.74L54.74 31.74L54.63 31.63Q55.95 27.84 56.52 26.55L56.53 26.56L58.00 26.61L57.94 26.56Q58.83 28.28 60.01 31.56L60.08 31.63L60.07 31.62Q61.35 35.22 62.00 36.63L62.03 36.67L62.02 36.66Q63.82 30.34 69.30 25.77L69.23 25.71L69.19 25.67Q70.51 25.69 73.25 25.12L73.23 25.10L73.20 25.07Q64.50 31.02 63.32 41.00L63.40 41.08L62.67 40.88L62.83 41.04Q62.37 40.88 62.02 40.92ZM64.99 43.36L67.17 43.67L67.07 43.57Q66.75 42.03 66.75 40.51L66.86 40.62L66.87 40.62Q66.86 37.38 68.26 34.14L68.13 34.00L68.10 33.98Q70.15 29.52 74.26 26.44L74.35 26.52L74.20 26.37Q73.09 26.75 71.23 27.09L71.18 27.05L71.26 27.13Q73.24 25.49 74.54 24.57L74.40 24.44L71.99 25.00L72.00 25.00Q70.67 25.13 69.34 25.28L69.44 25.38L69.47 25.41Q64.26 29.61 62.32 34.63L62.28 34.59L62.35 34.66Q61.71 32.50 60.34 28.24L60.26 28.15L60.22 28.12Q60.00 28.23 59.73 28.23L59.77 28.27L59.24 28.27L59.20 28.23Q59.09 27.94 58.29 26.19L58.30 26.20L56.18 26.13L56.16 26.11Q55.26 28.98 53.16 34.61L53.08 34.52L53.07 34.52Q51.82 30.90 48.73 27.63L48.64 27.54L48.82 27.72Q48.41 27.57 48.11 27.54L48.15 27.58L47.65 27.54L47.64 27.52Q46.80 26.73 45.02 25.13L44.88 24.99L45.05 25.17Q41.79 24.41 40.11 23.92L40.14 23.94L40.04 23.85Q50.94 31.47 50.56 41.79L50.53 41.76L50.58 41.81Q50.64 41.68 51.00 41.64L51.11 41.75L50.98 41.62Q51.33 41.57 51.52 41.57L51.52 41.57L51.50 41.55Q51.68 41.57 51.87 43.67L51.70 43.50L53.74 43.45L53.78 43.49Q56.32 40.62 58.57 34.87L58.47 34.78L58.53 34.83Q60.04 38.71 61.90 41.37L61.85 41.31L61.87 41.33Q62.12 41.25 62.39 41.26L62.43 41.31L62.45 41.33Q62.74 41.37 63.01 41.37L62.92 41.28L65.09 43.46Z' />\
                <path fill='#e95c7f'\
                  d='M26.79 40.16L26.84 40.21L24.44 33.35L24.33 33.24Q19.98 20.67 14.04 14.28L14.08 14.31L14.02 14.26Q16.04 15.33 18.63 15.93L18.66 15.96L18.70 16.01Q23.83 22.28 28.17 35.03L28.18 35.04L28.26 35.12Q31.19 26.90 31.88 25.30L31.87 25.29L31.89 25.31Q34.31 19.74 37.13 16.42L37.14 16.44L37.15 16.45Q39.12 15.98 41.75 15.11L41.86 15.22L41.87 15.23Q37.34 19.88 34.30 27.11L34.14 26.96L34.30 27.11Q32.72 30.59 29.03 40.11L29.16 40.25L29.12 40.21Q28.60 40.25 28.03 40.21L27.99 40.18L27.90 40.09Q27.46 40.22 26.89 40.26ZM31.75 42.53L31.80 42.58L31.91 42.69Q34.57 32.56 36.13 28.53L36.24 28.63L36.13 28.52Q39.16 20.85 43.57 15.98L43.63 16.04L43.51 15.92Q42.51 16.33 40.42 17.05L40.55 17.19L41.60 15.76L41.54 15.70Q42.10 15.01 42.71 14.36L42.77 14.42L42.82 14.46Q39.91 15.37 36.91 15.94L37.04 16.07L36.95 15.98Q32.67 21.41 28.79 32.87L28.68 32.76L28.65 32.73Q25.01 22.62 21.81 18.24L21.92 18.35L21.95 18.38Q21.54 18.27 20.66 18.12L20.65 18.11L20.54 18.00Q20.39 17.69 18.79 15.64L18.86 15.70L18.84 15.69Q15.84 14.94 13.14 13.53L13.21 13.59L13.17 13.55Q19.72 20.56 24.10 33.35L24.08 33.34L24.20 33.45Q25.31 37.00 26.49 40.58L26.45 40.54L26.61 40.70Q26.99 40.78 27.83 40.66L27.76 40.59L27.78 40.61Q28.02 41.20 28.71 42.53L28.75 42.58L28.82 42.64Q29.58 42.49 30.30 42.57L30.40 42.67L30.27 42.53Q31.14 42.68 31.90 42.68Z' />\
                <path fill='#8224df'\
                  d='M123.50 38.00L123.37 37.87L123.41 37.91Q123.64 38.83 124.17 40.84L124.27 40.94L124.23 40.90Q119.95 39.51 115.34 39.78L115.32 39.76L115.36 39.80Q110.87 40.14 106.87 42.12L106.85 42.09L106.86 42.11Q107.03 41.37 107.07 41.44L107.07 41.44L107.20 41.57Q110.81 37.49 114.73 33.08L114.80 33.15L114.86 33.20Q119.12 28.06 120.30 23.38L120.34 23.42L120.31 23.39Q120.91 21.78 119.64 20.60L119.63 20.60L119.50 20.47Q118.24 19.30 116.45 19.46L116.47 19.47L116.50 19.50Q116.20 19.51 115.86 19.51L115.69 19.34L115.81 19.46Q114.30 19.48 113.05 20.39L113.02 20.36L112.98 20.33Q111.74 21.75 111.97 24.41L112.00 24.44L111.96 24.40Q110.22 24.11 109.00 23.65L108.97 23.62L108.96 23.61Q108.68 22.11 108.60 20.66L108.68 20.74L108.73 20.79Q108.58 19.08 109.19 17.94L109.29 18.04L109.27 18.02Q110.93 16.53 114.28 16.53L114.32 16.56L116.08 16.57L116.10 16.59Q118.35 16.60 119.30 16.71L119.36 16.77L119.28 16.68Q123.69 17.17 123.96 19.61L124.00 19.66L124.02 19.67Q124.06 20.21 123.98 21.00L123.94 20.96L124.03 21.06Q123.88 21.59 123.73 22.28L123.73 22.28L123.78 22.32Q122.12 30.41 114.54 37.26L114.44 37.16L114.54 37.26Q116.02 37.18 117.39 37.18L117.30 37.09L117.31 37.10Q120.48 37.04 123.34 37.84ZM122.76 17.01L122.89 17.13L122.82 17.07Q121.23 16.43 119.52 16.35L119.51 16.35L116.02 16.09L116.15 16.22Q111.60 15.86 109.39 16.97L109.46 17.03L109.36 16.93Q108.32 18.33 108.32 20.38L108.30 20.37L108.30 20.36Q108.44 21.19 108.74 24.01L108.67 23.93L108.62 23.88Q109.26 24.21 110.44 24.52L110.36 24.44L110.42 25.53L110.36 25.47Q110.38 25.98 110.45 26.51L110.47 26.53L110.38 26.44Q111.68 26.60 114.16 26.83L114.15 26.82L114.20 26.88Q114.12 26.45 114.12 26.11L114.19 26.18L114.21 26.20Q114.16 24.32 115.38 22.97L115.42 23.01L115.36 22.95Q116.60 21.62 118.39 21.73L118.47 21.81L118.36 21.70Q119.06 21.68 119.82 21.83L119.86 21.87L119.91 21.92Q120.11 22.39 120.18 22.80L120.18 22.80L120.15 22.77Q120.18 23.18 120.11 23.53L120.01 23.43L120.03 23.45Q118.79 28.22 114.37 33.06L114.45 33.13L114.29 32.97Q112.28 35.35 106.84 41.40L106.87 41.43L106.74 41.30Q106.72 42.31 106.37 42.88L106.24 42.74L106.20 42.70Q107.79 41.81 109.31 41.28L109.31 41.28L109.41 41.38Q108.62 41.89 107.67 43.37L107.82 43.52L107.78 43.48Q107.57 43.74 107.46 44.08L107.43 44.05L107.45 44.07Q112.31 42.00 117.79 42.19L117.87 42.27L117.86 42.26Q123.51 42.39 128.08 44.75L128.07 44.74L127.12 42.65L127.20 42.72Q126.48 41.33 126.22 40.53L126.26 40.57L126.26 40.57Q125.50 40.11 124.28 39.69L124.27 39.69L124.20 39.61Q124.00 38.84 123.62 37.47L123.69 37.54L123.62 37.47Q121.48 36.97 119.19 36.78L119.23 36.81L119.31 36.90Q123.94 32.27 125.46 24.01L125.36 23.91L125.64 21.11L125.58 21.04Q125.53 19.28 124.31 18.60L124.39 18.68L124.21 18.54L124.33 18.65Q124.16 18.45 124.09 18.45L124.14 18.50L124.14 18.50Q124.03 17.78 122.92 17.17Z' />\
                <path d='M1 29 C83 34,91 48,148 28' stroke='#7ced98' fill='none' /></svg>"}
      , {
        type: "details",
        details: [
          {
            name: "Mã khách hàng",
            value: "R012234949883"
          },
          {
            name: "Tên khách hàng",
            value: "Nguyễn Văn B"
          },
          {
            name: "Địa chỉ",
            value: "263 Nguyễn Văn Linh, Đà nẵng, Việt Nam"
          },
          {
            name: "Hình thức thanh toán",
            value: "Tiền mặt"
          },
        ]
      }
      ,
      {
        type: "button"
        , options: [
          { name: "Reset", next: "RESET" }
          , { name: "Exit", next: "EXIT" }
          , { name: "Close", next: "CLOSE" }
          , { name: "Home", next: "HOME" }
          , { name: "Back", next: "CALLBACK" }
          , { name: "Continue", next: "CONTINUE" }
          , { name: "Register", next: "CALLBACK", url: "./ionic/", command: "USER_LOGIN_REDIRECT" }
          , { name: "LOGIN", next: "NEXT", url: "./ionic/", command: "USER_CHECK_EXISTS", token: true }
        ]
      }
    ]
  };

  initValues = [];
  callback: any; // ham goi lai khai bao o trang root gui (neu co)
  parent: any;    // Noi goi this

  password_type: string = 'password';
  eye: string = "eye";


  // crop ảnh
  imageChangedEvent: any = ''; //ảnh nhận từ file
  croppedImage: any = '';      //ảnh nhận từ cropped
  // crop ảnh


  isEditingObjects: boolean = false;


  // sử dụng để load excel
  excelDataSource: any;
  excelPreviewer: any;

  // Biến ghi mảng ds kết quả load vào trước khi gọi thực thi từng lệnh
  jsonImportList: any;


  constructor(
    private apiCommons: CommonsService
    , private apiAuth: AuthService
    , private navCtrl: NavController
    , private navParams: NavParams
    , private sanitizer: DomSanitizer
    , private apiSqlite: SqliteService
    , private apiImage: ImageService
    , private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {

    //console.log(this.navParams);
    /**
     * Lấy dữ liệu form của nó
     */
    this.dynamicForm = this.navParams.get("form") ? this.navParams.get("form") : this.dynamicForm;

    // duyệt tất cả các trường dữ liệu của $objectForm 
    // tạo $object
    this.dynamicForm.$object = {};
    // Lọc lấy các trường yêu cầu unique
    this.dynamicForm.$uniques = this.dynamicForm.items.filter(x => x['unique']).map(o => o['key']);
    this.dynamicForm.$validators = this.dynamicForm.items.filter(x => x['validators']);


    /**
     * Lưu trữ dữ liệu ban đầu lại để reset form sau này
     */
    if (this.dynamicForm.items) {
      this.dynamicForm.items.forEach((el, idx) => {


        if (el.key) {

          // định nghĩa các key
          if (!this.dynamicForm.$object[el.key]) {
            Object.defineProperty(
              this.dynamicForm.$object
              , el.key
              , {
                value: el.value // giá trị default
                , writable: true, enumerable: true, configurable: true
              })
          }
          // nếu trùng key??
        }

        // ghi lại giá trị ban đầu để sử dụng nút reset
        this.initValues.push({
          idx: idx,
          value: el.value
        });

        // chuyển đổi kiểu dữ liệu svg để hiển thị ảnh kiểu text html lấy được
        if (el.type === 'svg') {
          el.svg = this.sanitizer.bypassSecurityTrustHtml(el.data);
        }

        // thêm trường nhận diện độ dài của list và object là giá trị nhận được
        if (el.type === 'object') {
          // thêm trường length 
          if (el.value) {
            try {
              let objectValue = JSON.parse(el.value);
              el.length = objectValue ? Object.keys(objectValue).length : 0;
            } catch (error) { }
          }
        }

        if (el.type === 'list') {
          // thêm trường length
          if (el.value) {
            try {
              let objectValue = JSON.parse(el.value);
              el.length = objectValue && objectValue.items ? objectValue.items.length : 0;
            } catch (error) { }
          }
        }

        // Về tương lai sẽ thay thế list bằng elements
        // thêm một phần tử giá trị của nó ghi là {name:object:{}}
        if (el.type === 'element') {
          // thêm  
          if (el.value) {
            try {
              let elementValue = JSON.parse(el.value);
              let objectValue = elementValue && elementValue.object ? elementValue.object : {};
              el.length = Object.keys(objectValue).length;
              // gán giá trị ban đầu cho object
              el.objectValues = JSON.stringify(objectValue);
              // gán tên phần tử từ elementValue
              el.name = elementValue && elementValue.name ? elementValue.name : el.name;
              // tìm kiếm độ dài của đối tượng, trường dữ liệu có giá trị
            } catch (error) { }
          }
        }

        // thêm một danh sách phần tử
        if (el.type === 'elements') {
          // thêm  
          if (el.value) {
            try {
              let elementsValue = JSON.parse(el.value);
              // gán tên phần tử từ elementValue
              el.name = elementsValue && elementsValue.name ? elementsValue.name : el.name;

              let listValue = elementsValue && elementsValue.items ? elementsValue.items : [];
              //console.log('giá trị elements',el.value);
              el.length = listValue.length;
              el.listValues = JSON.stringify(listValue); // là một mãng dữ liệu
            } catch (error) { }
          }
        }

      });


    }

    /**
     * Lấy hàm gọi lại và form gốc mà nó gọi nó
     */
    this.callback = this.navParams.get("callback");
    this.parent = this.navParams.get("parent");


    //console.log(this.dynamicForm.auto_hidden,!isNaN(this.dynamicForm.auto_hidden));

    if (this.dynamicForm.auto_hidden) {
      // nếu đặt thời gian tự động đóng thì sau thời gian mấy giây thì tự đóng
      setTimeout(() => {
        if (typeof this.dynamicForm.auto_hidden === 'object') {
          // đây là nút cần xử lý sau thời gian này
          // sau 1 giây thì gọi thực thi ngay lệnh này luôn
          this.onClick(this.dynamicForm.auto_hidden);
          // Ví dụ tự post lên máy chủ, 
          // tự ghi xuống csdl sau khi scan...
        } else {
          this.next({
            next: 'CLOSE'
          });
        }
      }, !isNaN(this.dynamicForm.auto_hidden) ? parseInt(this.dynamicForm.auto_hidden) : 1000)
    }

  }

  /**
   * Thực hiện reset form về giá trị ban đầu
   */
  resetForm() {
    if (this.dynamicForm.items) {
      this.dynamicForm.items.forEach((el, idx) => {
        if (el.value !== undefined) {
          if (this.initValues.find(x => x.idx == idx).value === undefined) {
            el.value = '';
          } else {
            el.value = this.initValues.find(x => x.idx == idx).value;
          }
        }
      })
    }
  }

  /**
   * Đối tượng call_back từ form chính trả cho form động là :
   * Array hoặc Object
   * 
   * resolve(  [
                      {   key:"job_id" //tìm item có key là trường này
                        , property_name: "options"   //nếu tìm thấy thì thay thuộc tính có tên ở đây
                        , new_data:  jobOptions //bằng giá trị mới cập nhập do chọn lựa từ form này
                      } 
                      ,
                      {   key:"job_list" //tìm item có key là trường này
                        , property_name: "options"   //nếu tìm thấy thì thay thuộc tính có tên ở đây
                        , new_data:  jobListOptions //bằng giá trị mới cập nhập do chọn lựa từ form này
                      } 
                    ] 
                  ) 
   * 
   * tìm item có key rồi thay giá trị của thuộc tính của đối tượng đó
   * ví dụ: tìm thấy key="job_id" và thay property_name = options
   * với giá trị mới được đưa vào là new_data
   * @param returnObj 
   */
  replaceValueForm(returnObj) {
    //tìm item có key rồi thay options nhé
    let itemReplace = this.dynamicForm.items.find(x => x.key === returnObj.key);
    if (itemReplace) {
      //console.log('ajax return', ajaxReturn, itemReplace);
      //thay thế giá trị thuộc tính của đổi tượng tìm thấy
      //bằng giá trị mới lấy được của ajax nhé
      itemReplace[returnObj.property_name] = returnObj.new_data;
    }
  }

  // ----- Thực thi các hàm danh sách và đối tượng ----//
  /**
   * Bấm nút sửa form để hiển thị form nhập liệu danh sách ra
   * @param item 
   */
  onClickEditObject(item: any) {

    item.visible = !item.visible;
    this.isEditingObjects = item.visible;

  }
  /**
   * Sự kiện sau khi thực thi xong Đối tượng
   * @param event 
   */
  onSelectedObjectFinish(responseForm: any, item: any) {

    // ghi lại giá trị item bằng form này value = JSON.stringify(formlist);
    // ghi các thông tin cho item hiển thị ra nơi danh sách
    if (responseForm && responseForm.json_data //kết quả trả về của form nhập liệu
    ) {
      item.length = Object.keys(responseForm.json_data).length;

      item.value = JSON.stringify(responseForm.json_data
        , (key, value) => {
          // chuyển đổi hoặc bỏ bớt các trường giả có dấu $ để gán kết quả
          if (key.indexOf('$') === 0) return undefined;
          return value
        }
        , 2
      ); //gán kết quả trả lại form đã thay đổi
    }

    item.visible = false;
    this.isEditingObjects = item.visible;

  }



  /**
   * Bấm chỉnh sửa phần tử
   * Phải gán lại giá trị cho đối tượng
   * @param item 
   */
  onClickEditElement(item: any) {

    item.visible = !item.visible;
    this.isEditingObjects = item.visible;

    let elementValue = JSON.parse(item.value);
    let objectValue = elementValue && elementValue.object ? elementValue.object : {};
    item.objectValues = JSON.stringify(objectValue);
    // gán tên phần tử từ elementValue
    item.name = elementValue && elementValue.name ? elementValue.name : item.name;

  }
  /**
   * Sự kiện sau khi thực thi xong Phần tử
   * @param event 
   */
  onSelectedElementFinish(responseForm: any, item: any) {

    // ghi lại giá trị item bằng form này value = JSON.stringify(formlist);
    // ghi các thông tin cho item hiển thị ra nơi danh sách
    if (responseForm && responseForm.json_data //kết quả trả về của form nhập liệu
    ) {
      item.length = Object.keys(responseForm.json_data).length;

      item.value = JSON.stringify(
        {
          name: item.name,
          object: responseForm.json_data
        }
        , (key, value) => {
          // chuyển đổi hoặc bỏ bớt các trường giả có dấu $ để gán kết quả
          if (key.indexOf('$') === 0) return undefined;
          return value
        }
        , 2
      ); //gán kết quả trả lại form đã thay đổi
    }

    item.visible = false;
    this.isEditingObjects = item.visible;

  }

  /**
   * Bấm chỉnh sửa phần tử danh sách đối tượng 
   * Phải gán lại giá trị cho danh sách
   * @param item là phần tử của form này
   * value = {name,items:[]}
   */
  onClickEditElements(item: any) {

    item.visible = !item.visible;
    this.isEditingObjects = item.visible;

    /* let elementsValue = JSON.parse(item.value);
    let listValue = elementsValue && elementsValue.object ? elementsValue.items : [];
    item.listValues = JSON.stringify(listValue); // là một mãng dữ liệu
    // gán tên phần tử từ elementValue
    item.name = listValue && listValue.name ? listValue.name : item.name; */

  }
  /**
   * Sự kiện sau khi thực thi xong Phần tử
   * @param event 
   */
  onSelectedElementsFinish(formList: any, item: any) {
    //console.log('form list trả về', formList);
    // ghi lại giá trị item bằng form này value = JSON.stringify(formlist);
    // ghi các thông tin cho item hiển thị ra nơi danh sách
    if (formList) {
      item.length = formList.items.length;
      //gán kết quả trả lại form đã thay đổi
      item.value = JSON.stringify({
        name: item.name,
        items: formList.items // danh sách trả về
      }
        , (key, value) => {
          // chuyển đổi hoặc bỏ bớt các trường giả có dấu $ để gán kết quả
          if (key.indexOf('$') === 0) return undefined;
          return value
        }
        , 2
      ); // {name,items:[]}
    }
    item.visible = false;
    this.isEditingObjects = item.visible;
  }



  /**
   * Bấm nút sửa form để hiển thị form nhập liệu danh sách ra
   * @param item 
   */
  onClickEditList(item: any) {
    item.visible = !item.visible;
    this.isEditingObjects = item.visible;
    //item.value = JSON.stringify({name,items:[]})
  }
  /**
   * Sự kiện sau khi thực thi xong danh sách bấm nút save
   * @param formList {name,items:[]}
   * @param item 
   */
  onSelectedListFinish(formList: any, item: any) {
    //console.log('form list trả về', formList);
    // ghi lại giá trị item bằng form này value = JSON.stringify(formlist);
    // ghi các thông tin cho item hiển thị ra nơi danh sách
    if (formList) {
      item.name = formList.name;
      item.length = formList.items.length;
      //gán kết quả trả lại form đã thay đổi
      item.value = JSON.stringify(formList); // {name,items:[]}
    }
    item.visible = false;
    this.isEditingObjects = item.visible;
  }
  // ----- END Thực thi các hàm danh sách ----//




  /**
   * Upload file lên để crop
   * Lấy các tham số về file
   */
  imageUploadEvent(evt: any, item: any) {

    //console.log(evt);

    if (!evt.target) { return; }
    if (!evt.target.files) { return; }
    if (evt.target.files.length !== 1) { return; }
    const file = evt.target.files[0];
    if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif' && file.type !== 'image/jpg') { return; }

    //gán sự kiện chọn ảnh
    //this.imageChangedEvent = evt;

    //gán sự kiện chọn ảnh crop
    // = evt;
    this.apiCommons.openModal(Ionic4CroppieComponent, {
      parent: this, // để gọi cắt
      item: item,
      event: evt,
      options: item.options
    })
      .then(data => {
        item.value = data ? data : item.value;
      })

  }

  /**
   * Cắt ảnh theo kích cỡ yêu cầu
   */
  async cropImage(item) {
    //gán sự kiện chọn ảnh crop

    let imageBase64 = await this.apiImage.createBase64Image(item.value, 600);

    this.apiCommons.openModal(Ionic4CroppieComponent, {
      parent: this, // để gọi cắt
      item: item,
      // nếu giá trị là url thì chuyển thành base64 để crop
      // giảm kích thước xuống còn 600x600 là tối đa nhé
      image: imageBase64,
      options: item.options
    })
      .then(data => {
        item.value = data ? data : item.value;
      })
  }

  /**
   * Mở camera bằng webcam thử xem và cắt ảnh này
   * @param item 
   */
  openCamera(item) {
    this.apiCommons.openModal(CameraCardComponent, {
      parent: this, // để gọi tắt cửa sổ
    })
      .then(data => {
        console.log('ảnh nhận được: ', data ? data.length : undefined);
        item.value = data ? data : item.value;
      })

  }

  /**
   * Khi người dùng chọn giá trị trong select
   * bẩy trigger về cho form chính lọc lấy dữ liệu
   * Như là ajax lấy dữ liệu theo form đó
   * @param item 
   */
  onChangeSelect(item) {
    //console.log('chon thay doi',item);
    if (this.callback) {
      this.callback({ ajax: item })
        .then(ajaxReturn => {
          if (this.dynamicForm.items) {

            if (Array.isArray(ajaxReturn)) {
              //nếu trả về là mãng thì duyệt mãng, 
              ajaxReturn.forEach(el => {
                //còn trả về là object thì như cũ
                this.replaceValueForm(el);
              })
            } else {
              this.replaceValueForm(ajaxReturn);
            }
          }
        });
    }
  }

  /**
   * View hình ảnh ra kích cỡ bên dưới
   */
  showImage(item) {
    item.visible = !item.visible;
  }


  /**
   * Hàm ẩn và hiện mật khẩu
   */
  togglePasswordMode() {
    this.eye = this.eye === 'eye' ? 'eye-off' : 'eye';
    this.password_type = this.password_type === 'text' ? 'password' : 'text';
  }

  /**
   * Hàm gọi từ các nút ở header, 
   * nó sẽ không làm gì mà chỉ chuyển đến bước tiếp theo 
   * khai báo dữ liệu chuyển tiếp sau nó cũng chính nó
   * Nút này thường có chức năng - đóng lại, quay về, pop, home, reset,...
   * @param btn 
   */
  onClickHeader(btn) {
    this.onClick(btn);
  }

  /**
   * Nút quay về trang chủ - nếu có - hiện không phù hợp chưa dùng đến
   */
  onClickGoHome() {
    if (this.parent) this.navCtrl.setDirection('root');
  }



  /**
   * 
   * @param event 
   * @param item 
   */
  async onClickPopover(event: any, item: any) {

    let menuChoice = this.apiCommons.cloneObject(item.popover_menu); // là menu truyền vào {type:'single-choice',menu:[]}

    if (menuChoice && menuChoice.menu) {
      if (item.values && Array.isArray(item.values)) {
        item.values.forEach(value => {
          // có giá trị được chọn trước đó rồi
          let el = menuChoice.menu.find(x => x.value === value);
          // thì tô đậm ô được chọn vào
          if (el) el.isChecked = true;
        })

      } else if (item.value) {
        // có giá trị được chọn trước đó rồi
        let el = menuChoice.menu.find(x => x.value === item.value);
        // thì tô đậm ô được chọn vào
        if (el) el.isChecked = true;
      }

    }

    const popover = await this.popoverCtrl.create({
      component: PopoverCardComponent,
      componentProps: menuChoice, // là menu truyền vào {type:'single-choice',menu:[]}
      event: event,
      animated: true,
      showBackdrop: true
    });

    //Sau khi người dùng lựa chọn một item thì sẽ trả về dữ liệu data sau
    popover.onDidDismiss()
      .then(rtnData => {
        if (rtnData && rtnData.data) {
          // console.log('Dữ liệu được chọn: ', rtnData.data);
          this.processDetails(rtnData.data, item);
        }
      })
      .catch(err => {
        //console.log('Lỗi: ',err);
      });

    return await popover.present();
  }

  /**
   * Xử lý kết quả popover trả về
   * Kiểm tra loại dữ liệu trả về
   * https://webbjocke.com/javascript-check-data-types/
   * @param itemOrItems 
   */
  processDetails(itemOrItems: any, item: any) {

    if (Array.isArray(itemOrItems)) {
      // Kết quả trả về là một array tức là chọn nhiều
      //console.log('items', itemOrItems);
      // là mảng giá trị là kết quả chọn được, lấy riêng mảng chứa giá trị thôi
      item.values = itemOrItems.map(el => el.value); // lọc trích xuất lấy mảng giá trị ra thôi

    } else if (itemOrItems && typeof itemOrItems === 'object' && itemOrItems.constructor === Object) {
      // kết quả trả về là một đối tượng thuần không phải array chính là item đã được chọn
      //console.log('item', itemOrItems);
      // lấy value của nó itemOrItems.value là giá trị được chọn
      item.value = itemOrItems.value; // lấy giá trị value (bất kỳ thứ gì)
      // cụ thể giá trị chọn được là icon thì thay icon phía trước

      // nếu giá trị đó là icon thì thay giá trị bằng icon
      item.icon = item.isIcon ? itemOrItems.value : item.icon;

    }

  }


  // Xử lý sự kiện click button theo id
  /**
   * Hàm chính xử lý form dữ liệu, 
   * validate, 
   * tạo ra json_data để post lên máy chủ bất kỳ qua url được khai báo
   * Chỉ phù hợp các lệnh CACKBACK và lệnh NEXT mới thực hiện form này
   * @param btn 
   */
  onClick(btn) {

    //console.log('command', btn.url, btn.command);

    let valid = false;
    let json_data = {}; //{key:value}

    //Chỉ những action (next) cho phép duyệt form thì mới duyệt form này
    if (
      btn.next === 'CALLBACK' //cho phép gọi trả về, 
      || btn.next === 'NEXT'  //hoặc chuyển tiếp form tiếp theo
    ) {
      //Duyệt tất cả các giá trị trong form này
      //kiểm tra validate không
      //và tạo giá trị cho object json_data
      this.dynamicForm.items.some(el => {
        let validatorFns = [];
        if (el.validators) {
          el.validators.forEach(req => {
            if (req.required) validatorFns.push(Validators.required);
            if (req.min) validatorFns.push(Validators.minLength(req.min));
            if (req.max) validatorFns.push(Validators.maxLength(req.max));
            if (req.pattern) validatorFns.push(Validators.pattern(req.pattern));
          })
        }
        let control = new FormControl(el.value, validatorFns);
        el.invalid = control.invalid;
        valid = !el.invalid;

        //Nếu có valid và có thuộc tính và giá trị được gán (trừ không định nghĩa)
        if (valid
          && el.key
          && el.value !== undefined //phải truyền lên cả giá trị false và 0
        ) {
          Object.defineProperty(json_data, el.key, { value: el.value, writable: false, enumerable: true });
        }
        return el.invalid; //nếu như chưa valid được thì thoát ra yêu cầu nhập giá trị
      });

    } else { //trường hợp các nút lệnh khác thì chuyển tiếp đến bước xử lý không xác thực form này
      this.next(btn);
      return;  //thoát luôn, không xử lý tiếp theo
    }

    //trường hợp đã valid toàn bộ dữ liệu trên form thì
    if (valid) {

      //Nếu có đường dẫn url thì thực hiện post dữ liệu lên luôn
      if (btn.url) { // post lên cloud

        this.apiCommons.showLoader('Đang xử lý dữ liệu trên cloud....')

        //console.log('kq',json_data);
        this.apiAuth.postDynamicJson(btn.url, json_data, btn.token)
          .then(resp => {


            btn.next_data = {
              button: btn, //chuyen dieu khien nut cho ben ngoai
              response_data: resp ? resp : {}   //dữ liệu data từ máy chủ trả về là json hoặc gì đó
              //, nếu không thì giả một đối tượng
            }
            //console.log('data token --> next btn', btn);
            this.next(btn);

            this.apiCommons.hideLoader();

          })
          .catch(err => {
            //Có 2 loại lỗi xãy ra,
            //1. Do máy chủ không tồn tại hoặc máy chủ bị sự cố, thì trả về bản tin Không thể post
            //2. Do lập trình trả về code không phải là 200, 
            // đọc message sẽ biết người lập trình máy chủ muốn nhắn gì
            btn.next_data = {
              button: btn, //chuyen dieu khien nut cho ben ngoai
              error: err && err.error ? err.error : err,  //lỗi trả nguyên trạng
              message: err && err.error && err.error.message ? err.error.message : ('Không thể POST đến ' + btn.url), //message thông báo
              json_data: json_data //chuỗi json gửi lên máy chủ
            }

            this.next(btn);

            this.apiCommons.hideLoader();

          });

      } else if (btn.table) {
        // Lưu xuống đĩa -- mobile app (thêm ver 5.0)
        // btn = {next:'CALLBACK', table:'table_name', wheres: ['col_name']},
        // Nếu có mệnh đề wheres thì thực hiện update, nếu không có thì insert
        this.apiCommons.showLoader('Đợi lưu trữ xuống đĩa nhé....')

        if (btn.wheres && btn.wheres.length > 0) {
          // Có mệnh đề wheres có độ dài ít nhất là 1  
          this.apiSqlite.update(this.apiSqlite.convertSqlFromJson(btn.table, json_data, btn.wheres))
            .then(resp => {

              btn.next_data = {
                button: btn, //chuyen dieu khien nut cho ben ngoai
                response_data: resp ? resp : {}   //dữ liệu data từ máy chủ trả về là json hoặc gì đó
                //, nếu không thì giả một đối tượng
              }
              //console.log('data token --> next btn', btn);
              this.next(btn);

              this.apiCommons.hideLoader();

              this.apiCommons.showToast('Cập nhập csdl thành công!'
                , 1000, 'secondary');

            })
            .catch(err => {
              //Có 2 loại lỗi xãy ra,
              //1. Do máy chủ không tồn tại hoặc máy chủ bị sự cố, thì trả về bản tin Không thể post
              //2. Do lập trình trả về code không phải là 200, 
              // đọc message sẽ biết người lập trình máy chủ muốn nhắn gì
              btn.next_data = {
                button: btn, //chuyen dieu khien nut cho ben ngoai
                error: err && err.error ? err.error : err,  //lỗi trả nguyên trạng
                message: err && err.error && err.error.message ? err.error.message : ('Không thể POST đến ' + btn.url), //message thông báo
                json_data: json_data //chuỗi json gửi lên máy chủ
              }

              this.next(btn);

              this.apiCommons.hideLoader();

              this.apiCommons.showToast('Lỗi cập nhập csdl<br>'
                + (err && err.error && err.error.message ? err.error.message : JSON.stringify(err, null, 2))
                , null, 'danger');

            });

        } else {

          // không có mệnh đề where thì chèn dữ liệu vào thôi
          this.apiSqlite.insert(this.apiSqlite.convertSqlFromJson(btn.table, json_data))
            .then(resp => {

              btn.next_data = {
                button: btn, //chuyen dieu khien nut cho ben ngoai
                response_data: resp ? resp : {}   //dữ liệu data từ máy chủ trả về là json hoặc gì đó
                //, nếu không thì giả một đối tượng
              }
              //console.log('data token --> next btn', btn);
              this.next(btn);

              this.apiCommons.hideLoader();

              this.apiCommons.showToast('Chèn mới csdl thành công!'
                , 1000, 'secondary');

            })
            .catch(err => {

              btn.next_data = {
                button: btn, //chuyen dieu khien nut cho ben ngoai
                error: err && err.error ? err.error : err,  //lỗi trả nguyên trạng
                message: err && err.error && err.error.message ? err.error.message : ('Không thể POST đến ' + btn.url), //message thông báo
                json_data: json_data //chuỗi json gửi lên máy chủ
              }

              this.next(btn);

              this.apiCommons.hideLoader();

              this.apiCommons.showToast('Lỗi chèn dữ liệu<br>'
                + (err && err.error && err.error.message ? err.error.message : JSON.stringify(err, null, 2))
                , null, 'danger');

            });
        }

      } else {
        //nếu không có đường dẫn url, thì trả dữ liệu về cho form cha gọi nó
        //tức khi đó mọi việc xử lý dữ liệu phụ thuộc vào form cha của nó thôi
        btn.next_data = {
          button: btn, //chuyen dieu khien nut cho ben ngoai
          json_data: json_data //trường hợp không có link thì json_data sẽ trả về cho form chủ gọi nó
        }
        this.next(btn);

      }

    }
    //nếu như chưa validate thì vẫn ở form này, không làm gì tiếp nữa 

  }

  /**
   * Dữ liệu button gồm các thành phần cơ bản như sau:
   * {
   *   next:"RESET | EXIT | CLOSE | HOME | BACK | CALLBACK | NEXT" //chứa lệnh xử lý tiếp theo là gì
   * , url: "https://..." //chứa đường dẫn cần post dữ liệu json_data sinh ra từ form này (nếu có sẽ tự post)
   * , token: boolean | string // chứa token nếu cần xác thực hoặc tự lấy token lưu trữ trước đó để post
   * , next_data:  {button,json_data,error,message,response_data}
   * //chứa toàn bộ dữ liệu bất kỳ để truyền cho bước tiếp theo 
   * Thường thì nó là một object:
   *  {button,json_data,error,message,response_data}:
   *  chứa button (dữ liệu nút kế tiếp)
   * , chứa json_data (dữ liệu của form)
   * , chứa error (nếu có lỗi xãy ra khi post dữ liệu lên)
   * , chứa message (nếu muốn thông báo lỗi, hoặc muốn thông báo gì đó)
   * , chứa response_data (là kết quả từ máy chủ trả về thành công)
   * }
   * @param btn 
   */
  next(btn) {

    if (btn) {
      if (btn.next === 'RESET') { //reset lại giá trị ban đầu của form mặt định
        this.resetForm();
      } else if (btn.next === 'EXIT') {   //đóng tất cả các cửa sổ popup từ parent 
        if (this.parent) this.apiCommons.closeModal(this.parent)
      } else if (btn.next === 'CLOSE') {   //đóng cửa số popup
        if (this.parent) this.apiCommons.closeModal(btn.next_data)
      } else if (btn.next === 'HOME') {                          //quay về trang chủ
        if (this.parent) this.navCtrl.setDirection('root');
      } else if (btn.next === 'BACK') { // Trở lại một cấp trước đó
        if (this.parent) this.navCtrl.pop()
      } else if (btn.next === 'CALLBACK') {   //gọi hàm gọi lại và chờ kết quả từ trang gốc gọi nó
        if (this.callback) {
          this.callback(btn.next_data)
            .then(nextButton => this.next(nextButton)); //hàm trả về là một promise chuyển tiếp bước tiếp theo
        } else {
          if (this.parent) this.navCtrl.pop() //trở lại cấp trước đó néu không khai hàm callback
        }
      } else if (btn.next === 'NEXT') {   //Chuyển tiếp response_data, 
        //trường hợp dữ liệu sau khi post lên máy chủ, máy chủ sẽ trả về một response_data mới
        //và gán response_data đó vào next_data.response_data = 
        //Yêu cầu dữ liệu máy chủ trả về phải là một json kiểu dynamic_form như mẫu định nghĩa
        //kết quả cuối cùng là form đó xử lý làm sao trả next là CLOSE hoặc CALLBACK cuối cùng để form gốc đóng lại
        this.apiCommons.openModal(DynamicFormMobilePage, {
          parent: this,  //chính là trang này, nếu quay về là quay về chính nó form trước
          callback: this.callback, //sử dụng hàm callback của gốc gọi nó
          form: btn.next_data ? btn.next_data.response_data : undefined //định nghĩa form mới để hiển thị
        })
      }
    }

  }

}
