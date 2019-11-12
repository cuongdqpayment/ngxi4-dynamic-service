/**
 * Component này chỉ gọi popup không nhúng
 */
import { Component, OnInit } from '@angular/core';

import { ImageCroppedEvent } from 'ngx-image-cropper';
import { NavParams } from '@ionic/angular';
import { ImageService } from '../../services/image.service';
import { Ngxi4CommonsService } from '../../services/ngxi4-common.service';

@Component({
  selector: 'app-ionic4-croppie',
  templateUrl: './ionic4-croppie.component.html',
  styleUrls: ['./ionic4-croppie.component.scss'],
})
export class Ionic4CroppieComponent implements OnInit {

  // thiết lập quay ảnh
  isRotator: boolean = false;

  width: number = 0;
  height: number = 0;

  // Biến lấy từ input param
  item: any = {};
  imageChangedEvent: any = ''; //ảnh nhận từ file
  imageFile:any;
  imageBase64: string;

  croppieOptions:any;

  callback: any; // ham goi lai khai bao o trang root gui (neu co)
  parent: any;    // Noi goi this

  constructor(
    private navParams: NavParams
    , private apiCommons: Ngxi4CommonsService
    , private apiImage: ImageService
  ) { }

  ngOnInit() {
    this.imageChangedEvent = this.navParams.get("event") ? this.navParams.get("event") : null;
    this.imageBase64 = this.navParams.get("image") ? this.navParams.get("image") : null;
    this.imageFile = this.navParams.get("file") ? this.navParams.get("file") : null;
    this.item = this.navParams.get("item") ? this.navParams.get("item") : {};
    this.croppieOptions = this.navParams.get("options") ? this.navParams.get("options") : null;
    
    this.callback = this.navParams.get("callback");
    this.parent = this.navParams.get("parent");
  }

  //Các hàm crop ảnh
  imageCropped(event: ImageCroppedEvent) {

    // đọc lấy kích cỡ để hiển thị thật 
    this.apiImage.getImageSize(event.base64)
    .then(data=>{

      this.width = data.width;
      this.height = data.height;
      
      // giá trị ảnh là giá trị croppied rồi
      this.item.croppied = event.base64;
    })

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

  onClickRotate(direction){
		if (direction === 'LEFT'){
			//this.curDegree += 90;
		}else{
			//this.curDegree -= 90;
		}
		//this.rotate(this.curDegree);
  }


  onClickClose(){
    this.next({next:'CLOSE'}); //không trả ảnh cắt về
  }
  /**
   * Chấp nhật ảnh cắt này
   */
  onClickCroppied(){
    this.next({
              next:'CLOSE',
              next_data: this.item.croppied //trả dữ liệu ảnh cắt được về
            });
  }

  /**
   * Gọi trả về kết quả 
   * @param btn 
   */
  next(btn) {

    if (btn) {
      if (btn.next === 'CLOSE') {   //đóng cửa số popup
        if (this.parent) this.apiCommons.closeModal(btn.next_data)
      } else if (btn.next === 'CALLBACK') {   //gọi hàm gọi lại và chờ kết quả từ trang gốc gọi nó
        if (this.callback) {
          this.callback(btn.next_data)
            .then(nextButton => this.next(nextButton)); //hàm trả về là một promise chuyển tiếp bước tiếp theo
        } else {
          if (this.parent) this.apiCommons.closeModal(btn.next_data)
        }
      } 
    }

  }
  
}
