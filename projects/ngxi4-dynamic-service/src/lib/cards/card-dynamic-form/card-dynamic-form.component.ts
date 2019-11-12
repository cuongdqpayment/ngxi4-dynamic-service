/**
 * Sử dụng để nhúng vào bất kỳ trang nào để tạo một đối tượng bất kỳ
 * Cấu trúc của một đối tượng là trường dữ liệu và giá trị của trường đó là gì
 * Kết quả trả về một json_data = đối tượng đó = {key:value}
 * 
 * ex:
 * Input: 
 * dynamicForm = { // Form mẫu hiển thị nhập liệu tạo đối tượng jon_data
        okButton = { icon:"save", name: "Thêm mới", color:"secondary", next: "CALLBACK", command: "ADD" }
        ,
        cancelButton = {  icon:"close", next: "CLOSE" }
        ,  
        items: [
            // Danh sách các trường nhập liệu
            { type: "text", key: "name", name: "Tên hiển thị(*)", hint: "Nhập tên hiển thị trên list", input_type: "text", icon: "information-circle", validators: [{ required: true}] }
            , { type: "text", key: "value", name: "giá trị", hint: "Nhập tên giá trị", input_type: "number", icon: "information-circle" }
            , { type: "image", key: "image", name: "Ảnh hiển thị", hint: "Chọn ảnh" }
          ]
        }
 * Output: 
 * json_data={
      name:'Nhập vào tên',
      value: 'chọn giá trị lấy được',
      image: 'Hình ảnh được chụp, upload, crop ra dưới dạng base64'
    }
 * 
 */
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { CameraCardComponent } from 'src/app/popup-modals/camera-card/camera-card.component';
import { Ionic4CroppieComponent } from 'src/app/popup-modals/ionic4-croppie/ionic4-croppie.component';
import { CommonsService } from 'src/app/services/commons.service';
import { AuthService } from 'src/app/services/auth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SqliteService } from 'src/app/services/sqlite.service';
import { ImageService } from 'src/app/services/image.service';
import { PopoverController } from '@ionic/angular';
import { PopoverCardComponent } from 'src/app/popovers/popover-card/popover-card.component';

@Component({
  selector: 'card-dynamic-form',
  templateUrl: './card-dynamic-form.component.html',
  styleUrls: ['./card-dynamic-form.component.scss'],
})
export class CardDynamicFormComponent implements OnInit {


  @Input() dynamicFormInput: string;  // truyền vào là jsonstring
  @Input() dynamicFormValue: string;  // truyền vào là jsonstring

  @Input() dynamicCallback: any; // ham goi lai khai bao o trang root gui (neu co)
  // @Input() onChangeSelected = new EventEmitter(); // trả về chọn giá trị
  @Output() onSelectedFinish = new EventEmitter(); // Trả kết quả danh sách về nơi gọi nó sau khi thay đổi xong

  dynamicForm: any;       // truyền vào là object

  initValues = [];
  parent: any;    // Noi goi this

  password_type: string = 'password';
  eye: string = "eye";


  //crop ảnh
  imageChangedEvent: any = ''; //ảnh nhận từ file
  croppedImage: any = '';      //ảnh nhận từ cropped
  //crop ảnh


  isEditingObjects: boolean = false;

  constructor(
    private apiCommons: CommonsService
    , private apiAuth: AuthService
    , private sanitizer: DomSanitizer
    , private apiSqlite: SqliteService
    , private apiImage: ImageService
    , private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {
    let objectValues; // biến khởi tạo ban đầu của đổi tượng khác
    try {
      this.dynamicForm = JSON.parse(this.dynamicFormInput); //lấy biến vào chuyển thành đối tượng
      if (this.dynamicFormValue) objectValues = JSON.parse(this.dynamicFormValue);
    } catch (e) { }

    /**
     * Lưu trữ dữ liệu ban đầu lại để reset form sau này
     */
    if (this.dynamicForm.items) {

      this.dynamicForm.items.forEach((el, idx) => {

        // gán giá trị ban đầu truyền riêng nếu có
        // nếu ko thì lấy giá trị của form
        el.value = objectValues ? objectValues[el.key] : el.value;

        this.initValues.push({
          idx: idx,
          value: el.value
        });

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
          //console.log('giá trị elements',el.value);
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

      })
    }

    if (this.dynamicForm.auto_hidden) {
      // nếu đặt thời gian tự động đóng thì sau thời gian mấy giây thì tự đóng
      setTimeout(() => {
        if (typeof this.dynamicForm.auto_hidden === 'object') {
          // đây là nút cần xử lý sau thời gian này
          // sau 1 giây thì gọi thực thi ngay lệnh này luôn
          this.onClickFormSubmit(this.dynamicForm.auto_hidden);
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
      // thay một thuộc tính
      itemReplace[returnObj.property_name] = returnObj.new_data;
    } // nếu không tìm thấy thì bổ sung một item mới trên form bởi returnObj này
    else {
      //console.log('Xóa, hoặc thêm một object $del_key, $new_key', returnObj);
      let idxDel = this.dynamicForm.items.findIndex(x => x.key === returnObj.$del_key);
      if (idxDel >= 0) {
        // thực hiện xóa đối tượng trong mảng
        this.dynamicForm.items.splice(idxDel, 1);

      } else if (returnObj.$edit_key) {

        let idxEdit = this.dynamicForm.items.findIndex(x => x.key === returnObj.$edit_key);
        returnObj.key = returnObj.$edit_key; // khai báo key mới bằng $idxEdit
        this.dynamicForm.items.splice(idxEdit, 1, returnObj);

      } else if (returnObj.$new_key) {

        returnObj.key = returnObj.$new_key; // khai báo key mới bằng $new_key
        this.dynamicForm.items.splice(this.dynamicForm.items.length, 0, returnObj);
      }
      //console.log('Kết quả mới', this.dynamicForm.items);

    }

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

  /**
   * Xóa giá trị đã chọn
   * @param item 
   * @param value 
   */
  onClickDeleteSelected(itemOrValues, valueOrIndex) {
    if (Array.isArray(itemOrValues)) {
      itemOrValues.splice(valueOrIndex, 1); //cắt đi giá trị tại vị trí này 1
    } else {
      if (itemOrValues.value === valueOrIndex) itemOrValues.value = undefined; //xóa nó đi rồi
    }

  }
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
        //console.log('ảnh nhận được: ', data ? data.length : undefined);
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
    //this.onChangeSelected.emit({ ajax: item });

    if (this.dynamicCallback) {
      this.dynamicCallback({ ajax: item })
        .then(ajaxReturn => {
          if (this.dynamicForm.items) {

            if (Array.isArray(ajaxReturn)) {
              //nếu trả về là mãng thì duyệt mảng, 
              ajaxReturn.forEach(el => {
                // thay thế giá trị của các thuộc tính như trả về
                this.replaceValueForm(el);
              })
            } else {
              // thay thế giá trị thuộc tính cần thay đổi theo
              this.replaceValueForm(ajaxReturn);
            }
          }
        });
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

    // giá trị vẫn giữ nguyên không thay đổi
    // đưa stringJson vào sẽ gán giá trị nhận được trước đó

    /*  let newItem: any;
     let newValue: any;
 
     try {
       newItem = JSON.parse(item.dynamicForm);
       newValue = JSON.parse(item.value);
     } catch (e) { }
 
     if (newItem && newItem.items) {
       newItem.items.forEach(el => {
         el.value = newValue[el.key]
       });
     }
 
     item.dynamicForm = JSON.stringify(newItem
       , (key, value) => {
         // chuyển đổi hoặc bỏ bớt các trường giả có dấu $ để gán kết quả
         if (key.indexOf('$') === 0) return undefined;
         return value
       }
       , 2
       ); // form đối tượng là form gốc
  */
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
   * Bỏ qua không thực thi, xem như đóng form lại
   */
  cancelClick() {
    this.onClickFormSubmit(this.dynamicForm.cancelButton ? this.dynamicForm.cancelButton : { next: "CLOSE" })
  }

  /**
   * Thực thi click submit toàn bộ form này
   */
  submitClick() {
    this.onClickFormSubmit(this.dynamicForm.okButton ? this.dynamicForm.okButton : { next: "CALLBACK" })
  }

  // Xử lý sự kiện click button theo id
  /**
   * Hàm chính xử lý form dữ liệu, 
   * validate, 
   * tạo ra json_data để post lên máy chủ bất kỳ qua url được khai báo
   * Chỉ phù hợp các lệnh CACKBACK và lệnh NEXT mới thực hiện form này
   * @param btn 
   */
  onClickFormSubmit(btn) {

    //console.log('command', btn.url, btn.command);

    let valid = false;
    let json_data = {}; //{key:value}

    //Chỉ những action (next) cho phép duyệt form thì mới duyệt form này
    if (
      btn.next === 'CALLBACK' //cho phép gọi trả về, 
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

      } else if (btn.next === 'CLOSE') {             //đóng cửa số popup

        this.onSelectedFinish.emit(); // không trả kết quả gì

      } else if (btn.next === 'CALLBACK') {   //gọi hàm gọi lại và chờ kết quả từ trang gốc gọi nó

        this.onSelectedFinish.emit(btn.next_data); // trả kết quả dữ liệu next

      }
    }

  }

}
