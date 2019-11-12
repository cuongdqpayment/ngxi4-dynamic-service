/**
 * Đây là menu popup để chọn,
 * cuong.dq licence version 2.0
 * 08/10/2019
 * 
 * single-choice: Trả về 1 selectedItem được chọn hoặc null nếu không chọn
 * multi-choice: Trả về danh sách items được chọn [selectedItems]
 * people-choice 
 * card-choice
 * seat-choice
 * table-choice
 * 
 * Áp dụng menu này để sử dụng trong các ứng dụng
 * Lựa chọn theo menu
 * Chọn món ăn
 * Chọn bàn
 * Chọn điểm danh người
 * Chọn chỗ ngồi trong phòng, trong xe...
 * 
 */

import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-popover-card',
  templateUrl: './popover-card.component.html',
  styleUrls: ['./popover-card.component.scss'],
})
export class PopoverCardComponent implements OnInit {

  dynamicForm: any = {
    type: "single-choice", // single-choice | multi-choice | people-choice | card-choice | seat-choice | table-choice
    title: "Chọn biểu tượng",
    color: "secondary",
    menu: [
      {
        icon: 'flask', value: 'flask', name: 'flask'
      }, {
        icon: 'wifi', value: 'wifi', name: 'wifi'
      }, {
        icon: 'beer', value: 'beer', name: 'beer'
      }, {
        icon: 'football', value: 'football', name: 'football'
      }, {
        icon: 'basketball', value: 'basketball', name: 'basketball'
      }, {
        icon: 'paper-plane', value: 'paper-plane', name: 'paper-plane'
      }, {
        icon: 'american-football', value: 'american-football', name: 'american-football'
      }, {
        icon: 'boat', value: 'boat', name: 'boat'
      }, {
        icon: 'bluetooth', value: 'bluetooth', name: 'bluetooth'
      }, { icon: 'build', value: 'build', name: 'build' }

    ]
  }

  /* {
    type: "single-choice", // single-choice | multi-choice | people-choice | card-choice | seat-choice | table-choice
    title: "Settings",
    color: "primary",
    menu: [
      {
        icon: {
          name: "star"
          //, color:"primary"
        }
        //, color:"primary"
        , name: "Đoàn Văn A"
        , description: "Kỹ sư công nghệ thông tin"
        , value: "1"   // mã trả về (duy nhất)
        , image: "/assets/imgs/avatar.jpg" //đường dẫn ảnh để hiển thị ảnh
      }
      ,
      {
        icon: {
          name: "mail-open"
          //, color:"primary"
        }
        //, color:"primary"
        , name: "Nguyễn Thị B"
        , value: "2" // mã trả về (duy nhất cho một giá trị trong này)
        , image: "/assets/imgs/background.jpg" //đường dẫn ảnh để hiển thị ảnh
      }
      ,
      {
        icon: {
          name: "mail-open"
          //, color:"primary"
        }
        , color: "primary"
        , name: "Trần Thị C"
        , value: "3"
      }
    ]
  } */

  constructor(private navParams: NavParams, private popoverCtrl: PopoverController) { }

  ngOnInit() {
    //console.log(this.navParams.data);
    this.dynamicForm = this.navParams.data ? this.navParams.data : this.dynamicForm;
  }

  selectedSingle(item) {
    this.popoverCtrl.dismiss(item)
      .then(ok => {
        if (ok) {

        }
      })
      .catch(err => {
        console.log('Lỗi: ', err);
      });
  }


  /**
   * Lấy toàn bộ danh sách
   * @param items 
   */
  selectedMulti(items) {

    if (!items) {
      this.popoverCtrl.dismiss();
      return;
    }

    let selectedItems = [];
    // chọn danh sách được nhiều
    items.forEach(el => {
      if (el.isChecked) {
        selectedItems.push(el);
      }
    })

    this.popoverCtrl.dismiss(selectedItems)
      .then(ok => {

      })
      .catch(err => {
        console.log('Lỗi: ', err);
      });
  }

}
