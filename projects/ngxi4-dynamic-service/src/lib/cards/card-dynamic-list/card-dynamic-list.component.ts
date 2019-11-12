/**
 * Sử dụng để nhúng vào các trang - liệt kê danh sách
 * Card hiển thị danh sách cần chỉnh sửa, thêm đối tượng, 
 * Đối tượng cần thêm sẽ động hóa, bất kỳ đối tượng gì
 * Việc hiển thị chỉ thể hiện nội dung, hình ảnh/icon và text mô tả đối tượng đó
 * Mỗi đối tượng trong mỗi dòng, chúng ta có thể sửa, thêm, xóa
 * 
 * Kết quả trả về một danh sách = {title:value,[{key:value}]}
 * Ta dùng danh sách đó, đẩy lên csdl tập trung hoặc ghi xuống đĩa, tùy thích
 * 
 */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonsService } from '../../services/common.service';


@Component({
  selector: 'card-dynamic-list',
  templateUrl: './card-dynamic-list.component.html',
  styleUrls: ['./card-dynamic-list.component.scss'],
})
export class CardDynamicListComponent implements OnInit {

  @Input() dynamicFormInput: string;  // truyền vào là jsonstring
  @Input() dynamicFormValue: string;  // truyền vào là jsonstring

  @Input()  dynamicCallback: any; // ham goi lai khai bao o trang root gui (neu co)
  
  dynamicFormOrigin: any; // Là đối tượng chứa danh sách cần thêm dạng textjson string, sửa xóa, gốc
  dynamicForm: any; // Là đối tượng chứa danh sách cần thêm, sửa xóa,... cho phép thay đổi

  objectForm: string // Là chuỗi json form truyền cho form nhập liệu

  // Mỗi đối tượng sau khi thêm vào thì bổ sung trường $created_time và trường $updated_time
  // Để cho biết có tạo mới và có chỉnh sửa bảng ghi nào 

  @Output() onSelectedFinish = new EventEmitter(); // Trả kết quả danh sách về nơi gọi nó sau khi thay đổi xong


  isEditingObjects: boolean = false;

  constructor(
    private apiCommon: CommonsService
  ) { }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    // clone đối tượng để không bị thay đổi đối tượng gốc khi có chỉnh sửa mà không cần chấp nhận ghi nhận

    let listValues; // biến khởi tạo ban đầu của đổi tượng khác
    try {
      this.dynamicFormOrigin = JSON.parse(this.dynamicFormInput); //lấy biến vào kiểu stringJson chuyển thành đối tượng
      if (this.dynamicFormValue) listValues = JSON.parse(this.dynamicFormValue);
    } catch (e) { }

    if (!this.dynamicFormOrigin
      || !this.dynamicFormOrigin.items
      || !Array.isArray(this.dynamicFormOrigin.items)
      || !this.dynamicFormOrigin.$objectForm) {

      // đối tượng phải yêu cầu items là một array có sẵn, nếu không thì phải tự tạo luôn mảng mới này
      this.dynamicFormOrigin = {
        name: 'Danh sách mẫu',       // Tiêu đề của danh sách
        showEditTitle: true,          // Cho phép sửa title của danh sách
        $avatar: 'avatar',            // Trường lấy thông tin avatar
        $image: 'image',              // Trường lấy thông tin image
        $icon: 'icon',                // Trường lấy thông tin icon
        $name: 'name',                // Trường lấy thông tin để hiển thị ra tên list
        $objectForm: {                // Form mẫu hiển thị nhập liệu tạo đối tượng jon_data
          items: [
            // Danh sách các trường nhập liệu
            { type: "text", key: "name", value: 'giá trị mặt định', name: "Tên hiển thị(*)", hint: "Nhập tên hiển thị trên list", input_type: "text", icon: "information-circle", validators: [{ required: true }] }
            /* , { type: "text", key: "value", name: "giá trị", hint: "Nhập tên giá trị", input_type: "number", icon: "information-circle" }
            , { type: "image", key: "image", name: "Ảnh hiển thị", hint: "Chọn ảnh" } */
          ]
        },
        items: []                     // Danh sách trống cần thêm mới, tạo mới,...
        // Đối tượng trang mảng là {name:, value:, image:} // như trường key của $objectForm đó

      }
    }

    this.dynamicForm = this.apiCommon.cloneObject(this.dynamicFormOrigin);

    // gán danh sách ban đầu nếu được gán riêng
    this.dynamicForm.title = listValues && listValues.title ? listValues.title : this.dynamicForm.title;
    this.dynamicForm.items = listValues && listValues.items ? listValues.items : Array.isArray(listValues)? listValues: this.dynamicForm.items;

    this.objectForm = this.apiCommon.cloneObject(this.dynamicFormOrigin.$objectForm);

    // Chuyển đổi các trường hiển thị để view được trên danh sách
    this.dynamicForm.items.forEach(el => {
      el.$icon = el[this.dynamicForm.$icon];
      el.$name = el[this.dynamicForm.$name];
      el.$avatar = el[this.dynamicForm.$avatar];
      el.$image = el[this.dynamicForm.$image];

    });

    // Khởi tạo biến ghi kết quả xóa bảng ghi
    this.dynamicForm.$deleteCount = 0;               // Số bảng ghi bị xóa
    this.dynamicForm.$countTotal = 0;               // Số lần tác động thay đổi

  }


  /**
   * Reset toàn bộ form về trạng thái ban đầu
   */
  onClickReset() {
    this.apiCommon.presentConfirm('Bạn muốn reset toàn bộ danh sách về giá trị ban đầu phải không?')
      .then(ok => {
        if (ok) {
          this.refresh()
        }
      })
  }

  /**
   * Thực hiện thêm, sửa, xóa một item
   * @param item 
   * @param type 
   */
  onClickItem(item: any, type: string, idx?: number) {

    item.visible = type !== "DELETE" ? !item.visible : item.visible;
    this.isEditingObjects = item.visible;

    if (type === "ADD") {
      // soan form va hien thi 
      let objectFormTmp = this.apiCommon.cloneObject(this.dynamicFormOrigin.$objectForm);
      // soạn value theo item
      objectFormTmp.okButton = { name: "Thêm mới", color: "secondary", next: "CALLBACK", command: type }

      this.objectForm = JSON.stringify(objectFormTmp); //
    }

    if (type === "EDIT") {
      // soan form va hien thi 
      let objectFormTmp = this.apiCommon.cloneObject(this.dynamicFormOrigin.$objectForm);
      objectFormTmp.okButton = { name: "Chỉnh sửa", color: "warning", next: "CALLBACK", command: type }
      // soạn value theo item
      for (let key in item) {
        // key là từ khóa tìm trong mảng 
        let el = objectFormTmp.items.find(x => x.key === key);
        if (el) {
          // nếu giá trị là icon thì gán nó cho icon nhé
          el.value = item[key];
          if (el.isIcon) { // là trường icon mang giá trị là icon
            // lấy item[key] là object icon
            el.value = item[key].name ? item[key].name : item[key];
          }
        }
      }

      this.objectForm = JSON.stringify(objectFormTmp); //
    }

    if (type === "DELETE") {
      // xóa đi một bản ghi khi hỏi xóa không?
      this.apiCommon.presentConfirm('Bạn muốn xóa bảng ghi này phải không?')
        .then(ok => {
          //console.log(ok,idx);
          if (ok) {
            this.dynamicForm.items.splice(idx, 1);
            this.dynamicForm.$deleteCount++;
          }
        })

    }

  }


  /**
   * Đối tượng đã nhập liệu xong
   * @param event 
   */
  onSelectedObjectFinish(event: any, item?: any, idx?: number) {
    
    this.isEditingObjects = false;
    if (item) {
      item.visible = false;
    } else {
      this.dynamicForm.visible = false;
    }


    // lấy dữ liệu này sửa hoặc chèn vào bảng
    if (event && event.json_data && event.button) {

      let newItem = event.json_data;
      newItem.$icon = newItem[this.dynamicForm.$icon];
      newItem.$name = newItem[this.dynamicForm.$name];
      newItem.$avatar = newItem[this.dynamicForm.$avatar];
      newItem.$image = newItem[this.dynamicForm.$image];

      let isEdit = event.button.command === 'EDIT';

      if (isEdit) {
        newItem.$created_time = item ? item.$created_time : undefined; // ghi lại thời gian tạo trước đó
        newItem.$updated_time = Date.now();
      } else {
        newItem.$created_time = Date.now();
      }

      // console.log('nhập liệu xong button??', this.dynamicForm.items.length, newItem);
      this.dynamicForm.items.splice(idx !== undefined && idx !== null ? isEdit ? idx : (idx + 1) : this.dynamicForm.items.length, isEdit ? 1 : 0, newItem);
      // console.log('nhập liệu xong button??', this.dynamicForm.items.length, newItem);

      // Có dữ liệu mới vừa cập nhập (insert or update)
      // Thì cho phép hiển thị nút lệnh thực thi cuối cùng ở phía dưới
      // Nếu sửa bảng ghi của bảng ghi đã sửa trước đó cũng tăng lên giá trị này
      this.dynamicForm.$countTotal++;


    }
  }

  /**
   * Không chấp nhận thay đổi trên form và emit trả về
   */
  cancelClick() {
    this.onSelectedFinish.emit(); // Không trả gì về cả
  }

  /**
   * Chấp nhận lấy kết quả trên form đã được thay đổi
   */
  selectedAll() {
    // Có thể thống kê được
    // Có bao nhiêu bảng ghi cập nhập mới và bao nhiêu bảng ghi sửa 
    let createdArr = this.dynamicForm.items.filter(x => x.$created_time);                   // chỉ những bảng ghi mới chèn vào
    let updatedArr = this.dynamicForm.items.filter(x => x.$updated_time && !x.$created_time); // chỉ những bảng ghi cũ bị update

    this.apiCommon.presentConfirm(
      'Số bản ghi tạo mới: <b>' + createdArr.length + '</b>'
      + '<br>Số bản ghi chỉnh sửa: <b>' + updatedArr.length + '</b>'
      + '<br>Số bản ghi xóa: <b>' + this.dynamicForm.$deleteCount + '</b>'
      + '<br>Bạn đồng ý không?', 'Đồng ý', 'Bỏ qua')
      .then(ok => {
        if (ok) {
          // Chỉ lấy trường name và items thôi
          //console.log('goc', this.dynamicForm);

          let returnForm = JSON.stringify(this.dynamicForm
            ,
            (key, value) => {
              if (key.indexOf('$') === 0) return undefined
              return value;
            }
            , 2);

          //console.log('tra ve', returnForm);

          // trả form đã sửa và thay đổi về dạng forrm
          this.onSelectedFinish.emit(JSON.parse(returnForm));
        }
      })
  }

}
