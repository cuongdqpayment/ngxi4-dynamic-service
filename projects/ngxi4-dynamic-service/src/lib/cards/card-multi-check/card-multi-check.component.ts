/**
 * Sử dụng để chọn:
 * + choice điểm danh: people-choice
 * + choice chọn món ăn: dish-choice
 * + choice chọn bàn ăn: table-choice
 * + choice chọn phòng : room-choice
 * 
 * Liệt kê danh sách và trả về danh sách được chọn theo card hình ảnh
 * Kết quả trả về là [{key:value selected}]
 * 
 */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'card-multi-check',
  templateUrl: './card-multi-check.component.html',
  styleUrls: ['./card-multi-check.component.scss'],
})
export class CardMultiCheckComponent implements OnInit {

  @Input() dynamicForm: any;

  @Output() onSelectedFinish = new EventEmitter();

  constructor() { }

  ngOnInit() {}

  /**
   * Lấy toàn bộ danh sách
   * @param items 
   */
  selectedMulti(items?: Array<any>) {

    if (!items) {
      this.onClickClose();
      return;
    }

    let selectedItems = items.filter(el=>el.isChecked);

    this.next({
      next: 'CALLBACK',
      next_data: selectedItems //trả dữ liệu menu đã chọn đượcÏ
    });

  }

  /**
   * Đóng lại
   */
  onClickClose() {
    this.next({ next: 'CLOSE' }); //không trả ảnh cắt về
  }

  /**
   * Trả kết quả cuối cùng
   * @param btn 
   */
  next(btn) {

    if (btn) {
      if (btn.next === 'CLOSE') {             //đóng cửa số popup
        this.onSelectedFinish.emit(); // không trả kết quả gì
      } else if (btn.next === 'CALLBACK') {   //gọi hàm gọi lại và chờ kết quả từ trang gốc gọi nó
        this.onSelectedFinish.emit(btn.next_data); // trả kết quả dữ liệu next
      }
    }

  }

}
