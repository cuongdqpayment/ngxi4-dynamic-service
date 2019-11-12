/**
 * Sử dụng cấu trúc hình cây kiểu menu, cho phép đóng mở menu bằng click
 * 
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'tree-menu',
    templateUrl: 'tree-menu.html',
    styleUrls: ['tree-menu.scss'],
})
export class TreeMenu {
    @Input() treeData: any[];
    @Input() level: number = 0;

    @Output() onClickItem = new EventEmitter();

    constructor() { }

    /**
     * Khi bấm vào nút mở cây và đóng cây nó sẽ ẩn và hiện lá cây dưới nó ra
     * @param node 
     */
    hideAndShowChildrent(node: any) {
        node.visible = !node.visible;
    }

    /**
     * Khi bấm vào item của một lá cây thì truyền thông tin cây đó cho cấp trên của nó
     * @param node 
     * @param idx 
     * @param parent 
     */
    onClickLeaf(node, idx, parent){
        this.onClickItem.emit({item:node,index:idx,parent:parent});
    }

    /**
     * Sự kiện xảy ra khi bấm click trên subItem, 
     * Nó sẽ emit một đối tượng data {item:node,index:idx,tree:parent}
     * Vậy ta sẽ chuyển trả cho gốc cây nhúng nó nguyên trạng dữ liệu này
     * 
     * Xem như bấm ở gốc cây vậy
     * @param event 
     */
    onClickSubItem(event){
        this.onClickItem.emit(event);
    }
}