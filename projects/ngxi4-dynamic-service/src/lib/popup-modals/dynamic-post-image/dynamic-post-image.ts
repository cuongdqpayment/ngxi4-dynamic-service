/**
 * ver 4.0 ionic4 ngày 22/09/2019
 * 
 * Yêu cầu sửa chi tiết tinh chỉnh về crop ảnh nhé
 * 
 * Component động post formData để gửi file
 * Xử lý form cho phép xử lý ảnh trước khi post
 * Và tương tác với xử lý form_data
 * 
 * 
 * 
 */
import { Component } from '@angular/core';
import { NavController, NavParams } from '@ionic/angular';

import { CroppieOptions } from 'croppie';


import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Ngxi4CommonsService } from '../../services/ngxi4-common.service';
import { ImageService } from '../../services/image.service';
import { Ngxi4AuthService } from '../../services/ngxi4-auth.service';

@Component({
  selector: 'page-dynamic-post-image',
  templateUrl: './dynamic-post-image.html',
  styleUrls: ['./dynamic-post-image.scss']
})
export class DynamicPostImagePage {

  statusIcon = {
    0: "ios-lock", //only me
    1: "md-globe", //public
    2: "ios-contacts", //friend
    3: "ios-people-outline", //friend of friend
  }

  statusOptions = [
    { name: "Chỉ mình tôi", value: 0 }
    , { name: "Công khai", value: 1 }
    , { name: "Bạn bè", value: 2 }
    , { name: "Bạn của bạn", value: 3 }
  ]

  postData: any;

  /**
   * Đây là đối tượng form cần mở form này lên để điều khiển post tin tức
   * Được khai báo ngay trên parent các tham số này
   */
  postDataOrigin: any = {
    options: {}, //tùy chọn các tham số gửi lên như nhóm, thư mục lưu trữ, cá nhân hóa...
    status: 0,   //hình thức chia sẻ công khai
    crop_area: {
      width: 200,
      height: 200,
      type: 'circle'
    }, //vùng cắt ảnh
    is_face: 1, //nhận diện khuông mặt để crop đúng ảnh mặt người thôi
    // image:undefined, //ảnh hiển thị khi load lên
    // croppied: undefined, //ảnh được crop để truyền lên máy chủ
    action: { name: "Đăng", next: "CALLBACK", url: "/site-manager/news/post-news" }
    //next là thực hiện công việc tiếp theo
    //url là link để thực hiện gọi theo phương thức
    //method = POST/FORM-DATA
  }

  //crop ảnh
  imageChangedEvent: any = ''; //ảnh nhận từ file
  croppedImage: any = '';      //ảnh nhận từ cropped
  //crop ảnh

  fileImages: any;
  owner: any = 1;

  userInfo: any;

  parent: any;
  callback: any;

  //tùy chọn vùng crop (cắt)
  croppieOptions: CroppieOptions;

  //các điểm hiển thị cắt
  croppiePoints: number[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apiCommons: Ngxi4CommonsService,
    private apiImage: ImageService,
    private apiAuth: Ngxi4AuthService
  ) { }

  ngOnInit() {

    this.postDataOrigin = this.navParams.get("form") ? this.navParams.get("form") : this.postDataOrigin;
    this.parent = this.navParams.get("parent");
    this.callback = this.navParams.get("callback");

    // this.userInfo = this.apiAuth.getUserInfo();

    this.resetForm();
  }


  /**
   * reset gán lại giá trị ban đầu
   */
  resetForm() {
    this.postData = this.apiCommons.cloneObject(this.postDataOrigin);
    //chuẩn bị croppie option và point để lấy theo kiểu lấy
    //xem tài liệu tại: https://foliotek.github.io/Croppie/

    //khung ảnh hiển thị trước
    //this.croppiePoints =  [100,100,200,200];

    this.croppieOptions = {

      //Báo cho croppie biết để sử dụng đọc hướng ảnh, 
      //Ko tự động xoay hướng ảnh trước khi hiển thị để crop
      enableExif: false,
      //Phần bên trong của croppie thành phần sẽ cắt lấy
      viewport: this.postData.crop_area ? this.postData.crop_area : {
        width: 200,
        height: 200,
        type: 'circle'
      },
      //biên ngoài của vùng cropper chiếm không gian màn hình bố trí
      boundary: {
        width: 320,
        height: 320
      },

      showZoomer: true,
      enableOrientation: true
    };

  }

  //Các hàm crop ảnh
  imageCropped(event: ImageCroppedEvent) {
    //this.croppedImage = event.base64;
    this.postData.croppied = event.base64;
    //base64 lấy được để hiển thị xem trước
    //chuyển đổi base64 thành blob để truyền đi
    this.postData.file.file = this.postData.croppied ? this.apiImage.croppiedImage(this.postData.croppied) : this.postData.file.file;
    this.postData.file.size = this.postData.file.file.size
    this.postData.file.type = this.postData.file.file.type
  }

  imageLoaded() {
      // show cropper
  }
  cropperReady() {
      // cropper ready
  }
  loadImageFailed() {
      // show message
  }

  /**
   * Upload file lên để crop
   * Lấy các tham số về file
   */
  imageUploadEvent(evt: any) {
    
    this.imageChangedEvent = evt;

    if (!evt.target) { return; }
    if (!evt.target.files) { return; }
    if (evt.target.files.length !== 1) { return; }
    const file = evt.target.files[0];
    if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif' && file.type !== 'image/jpg') { return; }

    //console.log('file name',file.name);

    this.postData.file = {
      origin: file.name, //ten file gốc không chỉnh sửa
      alt: file.name, //tên file có thể chỉnh sửa nội dung của ảnh
      file: file, //không biến đổi ảnh để gửi ảnh gốc lên nếu cần
      filename: this.apiImage.encodeFilename(file.name), //được biến đổi tên để gửi lên máy chủ
      file_date: file.lastModified ? file.lastModified : file.lastModifiedDate ? file.lastModifiedDate.getTime() : Date.now(),
      size: file.size, //kích cỡ file
      type: file.type  //kiểu file gì
    };

    const fr = new FileReader();
    fr.onloadend = (loadEvent) => {
      this.postData.image = fr.result;
    };
    fr.readAsDataURL(file);
  }

  /**
   * Hàm callback sẽ tự động update kết quả crop ảnh bởi container
   * Kết quả trả về là base64 chứa ảnh
   * @param base64OrBlob 
   */
  newImageResultFromCroppie(base64OrBlob: any) {
    //base64 lấy được để hiển thị xem trước
    this.postData.croppied = base64OrBlob;
    //chuyển đổi base64 thành blob để truyền đi
    this.postData.file.file = this.postData.croppied ? this.apiImage.croppiedImage(this.postData.croppied) : this.postData.file.file;
    this.postData.file.size = this.postData.file.file.size
    this.postData.file.type = this.postData.file.file.type
  }

  /**
   * Bỏ qua không post tin này nữa
   */
  onClickCancel() {
    if (this.parent) this.apiCommons.closeModal()
  }

  /**
   * Chọn ảnh có mặt người
   * @param event 
   */
  fileChangeFace(event) {
    if (event.target && event.target.files) {
      const files: any = event.target.files;
      for (let key in files) { //index, length, item
        if (!isNaN(parseInt(key))) {
          //console.log('file chọn',files[key]);
          this.apiImage.getFaceDetected(files[key])
            .then(imageData => {
              console.log("Kết quả xử lý", imageData);
            })
            .catch(err => {
              console.log("Lỗi", err);
            });

        }
      }
    }
  }

  /**
   * Xóa file chi tiết
   * @param idx 
   */
  onClickRemoveFile(idx) {
    this.postData.files.splice(idx, 1);
  }

  /**
   * Xóa ảnh chi tiết
   * @param event 
   */
  onClickRemoveImage(event) {
    this.postData.medias.splice(event.id, 1);
  }

  /**
   * Thực hiện post tin lên theo tham số url cho trước
   * trả kết quả về hoặc trả nội dung cho hàm callback như dynamic-web
   */
  onClickPost(btn) {
    //console.log('data nhập được', btn, this.postData);
    if (btn) {
      if (btn.url) {
        this.apiCommons.showLoader('Đang xử lý dữ liệu trên máy chủ....')

        let form_data: FormData = new FormData();

        form_data.append("status", this.postData.status);
        if (this.postData.options) form_data.append("options", JSON.stringify(this.postData.options));

        if (this.postData.croppied) {

          let key = "image_0";
          //lấy file ảnh đã crop để gửi lên, các thông tin gốc của file vẫn không đổi
          //console.log('dulieu', this.postData.file.filename, this.postData.file.file);
          form_data.append(key, this.postData.file.file, this.postData.file.filename);

          form_data.append("options_" + key, JSON.stringify({
            origin: this.postData.file.origin, //tên file gốc của nó
            alt: this.postData.file.alt, //nội dung của file này được truyền lên
            type: this.postData.file.type,
            size: this.postData.file.size,
            file_date: this.postData.file.file_date
          }));
        }

        //group_id, content, title
        //this.apiAuth.postDynamicFormData("http://localhost:9234/media/db/upload-image",form_data,true)
        this.apiAuth.postDynamicFormData(btn.url, form_data, btn.token)
          .then(resp => {
            //console.log('data',data);

            this.apiCommons.hideLoader();

            btn.next_data = {
              button: btn, //chuyen dieu khien nut cho ben ngoai
              response_data: resp?resp:{}   //dữ liệu data từ máy chủ trả về là json hoặc gì đó
              //, nếu không thì giả một đối tượng
            }

            this.next(btn);

          })
          .catch(err => {
            //Có 2 loại lỗi xãy ra,
              //1. Do máy chủ không tồn tại hoặc máy chủ bị sự cố, thì trả về bản tin Không thể post
              //2. Do lập trình trả về code không phải là 200, 
              // đọc message sẽ biết người lập trình máy chủ muốn nhắn gì
              btn.next_data = {
                button: btn, //chuyen dieu khien nut cho ben ngoai
                error: err&&err.error?err.error:err,  //lỗi trả nguyên trạng
                message: err&&err.error&&err.error.message?err.error.message:('Không thể POST đến ' + btn.url), //message thông báo
                form_data: form_data //chuỗi json gửi lên máy chủ
              }
              
              this.next(btn);

            this.apiCommons.hideLoader();

          });
      } else {
        //nếu không có đường dẫn url, thì trả dữ liệu về cho form cha gọi nó
        //tức khi đó mọi việc xử lý dữ liệu phụ thuộc vào form cha của nó thôi
        btn.next_data = {
          button: btn, //chuyen dieu khien nut cho ben ngoai
          json_data: this.postData //trường hợp không có link thì json_data sẽ trả về cho form chủ gọi nó
        }
        this.next(btn);
      }
    } else {
      if (this.parent) this.navCtrl.pop()
    }
  }


  next(btn) {

    if (btn) {
      if (btn.next == 'RESET') {
        this.resetForm();
      } else if (btn.next == 'CLOSE') {
        if (this.parent) this.apiCommons.closeModal(btn.next_data)
      } else if (btn.next == 'HOME') {
        if (this.parent) this.navCtrl.setDirection('root');
      } else if (btn.next == 'BACK') {
        if (this.parent) this.navCtrl.pop()
      } else if (btn.next == 'CALLBACK') {
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
        this.apiCommons.openModal(DynamicPostImagePage, {
          parent: this,  //chính là trang này, nếu quay về là quay về chính nó form trước
          callback: this.callback, //sử dụng hàm callback của gốc gọi nó
          form: btn.next_data ? btn.next_data.response_data : undefined //định nghĩa form mới để hiển thị
        })
      }
    }

  }

}
