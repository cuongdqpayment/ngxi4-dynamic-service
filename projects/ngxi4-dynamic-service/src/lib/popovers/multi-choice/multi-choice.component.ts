import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { NavigationOptions } from '@ionic/angular/dist/providers/nav-controller';
import { CommonsService } from '../../services/common.service';

@Component({
  selector: 'app-multi-choice',
  templateUrl: './multi-choice.component.html',
  styleUrls: ['./multi-choice.component.scss'],
})
export class MultiChoiceComponent implements OnInit {

  callback: any; // ham goi lai khai bao o trang root gui (neu co)
  parent: any;    // Noi goi this

  dynamicForm: any = {
    type: "people-choice", // single-choice | multi-choice | people-choice | card-choice | seat-choice | table-choice
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
  }

  constructor(
    private apiCommons: CommonsService,
    private navCtrl: NavController,
    private route: ActivatedRoute     //lấy tham số truyền qua bằng route.navigate()..
  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(data => {
      //this.dynamicForm = JSON.parse(data);
      //console.log('Data chuyển kiểu queryParams', data);
      this.parent = data && data.parent ? data.parent : this.parent;
      try {
        this.dynamicForm = data && data.form ? JSON.parse(data.form) : this.dynamicForm;
      } catch (e) { }
    })

    /* this.route.params.subscribe(data => {
      //console.log('Data chuyển kiểu params', data);
    }) */

  }

  /**
   * Lấy toàn bộ danh sách
   * @param items 
   */
  selectedMulti(items) {

    //console.log('chọn');

    if (!items) {
      this.onClickClose();
      return;
    }

    /* let selectedItems = [];
    // chọn danh sách được nhiều
    items.forEach(el => {
      if (el.isChecked) {
        selectedItems.push(el);
      }
    }) */

    let selectedItems = items.filter(el=>el.isChecked);

    /* this.next({
      next: 'CLOSE',
      next_data: selectedItems //trả dữ liệu menu đã chọn đượcÏ
    }); */

    console.log('pop return with data', selectedItems);
    
    let options: NavigationOptions = {
      
    }
    this.navCtrl.navigateBack('/home',options)

  }

  /**
   * Đóng lại
   */
  onClickClose() {
    //this.next({ next: 'CLOSE' }); //không trả ảnh cắt về
    // Thực hiện quay về bằng lệnh
    console.log('pop return with data');
  }

  /**
   * Trả kết quả cuối cùng
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
