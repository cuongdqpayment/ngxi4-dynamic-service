/**
 * 
 * ver 5.0 ngày 03/05/2020 bổ sung hàm mảng, và fix bug delay
 * 
 * ver 4.0 ngày 20/09/2019
 * 
 * Dịch vụ này sử dụng để gọi các hàm dùng chung ionic4 như:
 * popup cửa sổ, alert, modal, ...
 * 
 * + Thay cho events 
 * 
 * + các hàm chuyển đổi cây
 * 
 * + Clone đối tượng
 * 
 * + Kiểm tra đường dẫn để thêm biến bằng dấu ? hay &
 * 
 */
import { Injectable } from '@angular/core';
import { ModalController, AlertController, LoadingController, ToastController, PopoverController, Platform } from '@ionic/angular';
import { EventHandler } from '@ionic/angular/dist/providers/events';


@Injectable({
  providedIn: 'root'
})
export class CommonsService {

  private c = new Map<string, EventHandler[]>();

  constructor(
    private modalCtrl: ModalController
    , private alertCtrl: AlertController
    , private loadingCtrl: LoadingController
    , private toastCtrl: ToastController
    , private popoverCtrl: PopoverController
    , private platform: Platform
  ) { }


  //-- quản lý sự kiện trao đổi dữ liệu giữa các form --//
  /**
  * Subscribe to an event topic. Events that get posted to that topic will trigger the provided handler.
  *
  * @param topic the topic to subscribe to
  * @param handler the event handler
  */
  subscribe(topic: string, ...handlers: EventHandler[]) {
    let topics = this.c.get(topic);
    if (!topics) {
      this.c.set(topic, topics = []);
    }
    topics.push(...handlers);
  }

  /**
   * Unsubscribe from the given topic. Your handler will no longer receive events published to this topic.
   *
   * @param topic the topic to unsubscribe from
   * @param handler the event handler
   */
  unsubscribe(topic: string, handler?: EventHandler): boolean {
    if (!handler) {
      return this.c.delete(topic);
    }

    const topics = this.c.get(topic);
    if (!topics) {
      return false;
    }

    // We need to find and remove a specific handler
    const index = topics.indexOf(handler);

    if (index < 0) {
      // Wasn't found, wasn't removed
      return false;
    }
    topics.splice(index, 1);
    if (topics.length === 0) {
      this.c.delete(topic);
    }
    return true;
  }

  /**
   * Publish an event to the given topic.
   *
   * @param topic the topic to publish to
   * @param eventData the data to send as the event
   */
  publish(topic: string, ...args: any[]): any[] | null {
    const topics = this.c.get(topic);
    if (!topics) {
      return null;
    }
    return topics.map(handler => {
      try {
        return handler(...args);
      } catch (e) {
        console.error(e);
        return null;
      }
    });
  }


  // hàm chuyển đổi ký tự sang số cột trong bảng tính excel để cấu hình cột cho dễ nhớ
  // console.log(['A', 'AA', 'AB', 'ZZ'].map(convertColExcel2Number)); // [1, 27, 28, 702]
  convertColExcel2Number = (val: string): number => {
    var base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', i, j, result = 0;
    for (i = 0, j = val.length - 1; i < val.length; i += 1, j -= 1) {
      result += Math.pow(base.length, j) * (base.indexOf(val[i]) + 1);
    }
    return result;
  };

  // hàm chuyển đổi ngược lại từ mã cột sang ký tự
  convertColExcel2String = (num: number): string => {
    for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
      ret = String.fromCharCode(Math.floor((num % b) / a) + 65) + ret;
    }
    return ret;
  };

  // lấy giá trị thật nếu là công thức của excel
  getValueFormula(obj) {
    if (obj === null || obj === undefined) return null
    if (typeof obj === 'object') {
      // xử lý chuyển đổi chỉ lấy text thôi
      if (obj.richText) return obj.richText.map(o => o["text"]).join("")
      // lấy giá trị bằng biểu thức function
      return obj.result
    }
    return obj
  }


  // các hàm chuyển đổi mảng và đối tượng
  /**
 * Chuyển đổi một mảng sang một đối tượng
 * Sử dụng để unique theo key và gán vào html một cách nhanh nhất
 * ex: arr = [{id:1,value:223},{id:2,value:433}]
 * => {1:{id:1,value:223},2:{id:2,value:433}}
*/
  convertArrayToObject(arrOfObj: any, distinctKey: string | number) {
    if (!arrOfObj) return {};
    return arrOfObj.reduce((obj, item) => (obj[distinctKey ? item[distinctKey] : item] = item, obj), {});
  }

  /**
  * Chuyển đổi một mảng sang mảng đối tượng nếu id dùng chung
  * Sử dụng để unique theo key và gán vào html một cách nhanh nhất
  *  * ex: arr = [{map:15, id:1, value:223},{map:15, id:2, value:433}]
 * => {"15":[{map:15, id:1, value:223},{map:15, id:2, value:433}]}
  */
  convertArrayToObjects(array: any[], key: string | number) {
    if (!array && !Array.isArray(array)) return {};
    return array.reduce((obj, item) => {
      let items = obj[item[key]] ? obj[item[key]].concat([item]) : [item];
      obj[item[key]] = items
      return obj
    }, {})
  };





  //----- Các hàm chuyển đổi cây có cấu trúc như oracle... --//
  /**
   * Sắp xếp thứ tự theo alphabe tiếng việt, quốc tế
   * @param arr 
   * @param key 
   */
  orderArrayObjects = (arr: Array<any>, keys: Array<string> | string) => {
    return arr.sort(
      function (a, b) {
        if (Array.isArray(keys)) {
          // Nếu có nhiều key thì duyệt và so sánh từng key
          let idx = 0;
          // Lấy key đầu tiên, nếu == thì xét tiếp key tiếp theo
          let orderReturn = Intl.Collator().compare(a[keys[idx]], b[keys[idx]]);
          while (orderReturn === 0 && idx <= keys.length) { //bug fix 08/11/2019 Lỗi vòng lặp vô hạn
            idx++;
            orderReturn = Intl.Collator().compare(a[keys[idx]], b[keys[idx]]);
            console.log('orderReturn', orderReturn);
          }
          // trường hợp > hoặc < thì nhảy ra ko cần so sánh tiếp làm gì
          return orderReturn;
        } else {
          // Nếu chỉ có một keys thì so sánh ngay
          return Intl.Collator().compare(a[keys], b[keys]);
        }
      })
  }

  /**
  * Tự tính trọng số thành phần, gán trọng số cha, trọng số con, và trọng số so với root
  * 
  * @param arrIn        // mảng dữ liệu đầu vào
  * @param idKey        // tên trường đánh mã duy nhất
  * @param parentKey    // tên trường liên hệ mã cấp trên
  * @param weightKey    // tên trường chứa trọng số
  * @param startWith    // lấy giá trị ban đầu (nếu có)
  * @param level        // lấy độ sâu (nếu có)
  * @param rootWeight   // Lấy trọng số cấp trên (nếu có)
  * @param arrOut       // biến dữ liệu ra (nếu có)
  * @param parentIndex  // Biến cấu trúc cây (nếu có)
  */
  createTreeWeight = (arrIn: Array<any>, idKey: any, parentKey: any, weightKey: any, startWith: any, level?: number, rootWeight?: number, arrOut?: Array<any>, parentIndex?: number) => {

    let arrReturns = arrOut ? arrOut : []; //sắp xếp lại

    let myLevel = level ? level : 1;

    if (arrIn && arrIn.length >= arrReturns.length) {
      let parents = arrIn.filter(obj => (obj[parentKey] === startWith)
        || (startWith == null && obj[parentKey] == undefined)
        || (startWith == undefined && obj[parentKey] == null)
        || (startWith == undefined && obj[parentKey] == "")
      )
      if (parents && parents.length > 0) {
        //đã có một mãng cùng cấp, hãy tính toán trọng số cho nó
        //Tính tổng thành phần của cùng cấp này
        let sumWeight = parents.map((o) => { return o[weightKey] }).reduce((a, b) => a + b, 0)

        parents.forEach((el, idx) => {

          //Tỷ trọng % thành phần
          el.$weight_percent = el[weightKey] / sumWeight;
          //khi tạo con, trọng số cấp cha phải được ghi xuống cấp con bằng trọng số 
          el.$parent_weight_percent = rootWeight ? rootWeight : 1;
          //giá trị có thể lấy trước đó
          //(el.$parent_weight_percent===undefined||el.$parent_weight_percent===null)?1:el.$parent_weight_percent;
          //root_weight_percent cấp trên xuống cấp dưới = 
          //Tỷ trọng % so với gốc
          el.$root_weight_percent = el.$parent_weight_percent * el.$weight_percent;

          el.$level = myLevel;
          el.$index = idx + 1; //ghi số thứ tự trong cùng cấp
          el.$tree_index = (parentIndex ? parentIndex + '.' : '') + el.$index; //Ghi số thứ tự theo hình cây

          arrReturns.push(el); //gán gốc cây
          //tìm tiếp lá cây nếu có thì gán vào
          return this.createTreeWeight(arrIn, idKey, parentKey, weightKey, el[idKey], myLevel + 1, el.$root_weight_percent, arrReturns, el.$tree_index)
        });
      } else { //đây là lá cây
        let objCur = arrReturns.find(obj => (obj[idKey] === startWith));
        if (objCur) objCur.$is_leaf = 1;
      }
    }

    return arrReturns;
  }

  /**
   * Tạo cây để sắp xếp trật tự gốc, nhánh, lá
   * như mệnh đề trong oracle
   * Mục đích để hiển thị thứ tự cây từ trên xuống đúng vị trí của nó
   * thêm trường $level để biết độ sâu của lá
   * thêm trường $root để biết giá trị root là đâu
   */
  createTreeOrder = (arrIn: Array<any>, idKey: any, parentKey: any, startWith?: any, level?: number, arrOut?: Array<any>, parentIndex?: any, rootId?: any) => {
    let arrReturns = arrOut ? arrOut : []; //sắp xếp lại

    let myLevel = level ? level : 1;
    //bug thêm dấu = để gán $is_leaf bản ghi cuối
    if (arrIn && arrIn.length >= arrReturns.length) {
      let parents = arrIn.filter(obj => (obj[parentKey] === startWith)
        || (startWith == null && obj[parentKey] == undefined)
        || (startWith == undefined && obj[parentKey] == null)
        || (startWith == undefined && obj[parentKey] == "")
      )
      if (parents && parents.length > 0) {
        parents.forEach((el, idx) => {

          //gán giá trị root khi mới khởi tạo
          el.$root = rootId ? rootId : el[idKey];
          //hoặc sẽ gán luôn $root cho đến lá cây

          el.$level = myLevel;
          el.$index = idx + 1; //ghi số thứ tự trong cùng cấp
          el.$tree_index = (parentIndex ? parentIndex + '.' : '') + el.$index; //ghi số thứ tự trong cùng cấp
          arrReturns.push(el); //gán gốc cây

          //tìm tiếp lá cây nếu có thì gán vào
          return this.createTreeOrder(arrIn, idKey, parentKey, el[idKey], myLevel + 1, arrReturns, el.$tree_index, el.$root)
        });
      } else { //đây là lá cây
        let objCur = arrReturns.find(obj => (obj[idKey] === startWith));
        if (objCur) objCur.$is_leaf = 1;
      }
    }

    return arrReturns;
  }

  /**
   * Tạo cây có item.subs=[]
   * Sử dụng trong hiển thị cấu trúc cây có đệ quy
   */
  createTreeMenu = (arrIn: any, idKey: string, parentKey: string, startWith?: any, level?: number) => {
    let myLevel = level ? level : 1;
    var roots = arrIn.filter(x =>
      (x[parentKey] === startWith)
      || (startWith == null && x[parentKey] == undefined)
      || (startWith == undefined && x[parentKey] == null)
      || (startWith == undefined && x[parentKey] == "")
    );
    if (roots && roots.length > 0) {
      roots.forEach(el => {
        el.$level = myLevel;
        //thay đổi gán subs nếu đã có subs trước đó thì không cần tìm nữa
        //Phục vụ cho gán các cây con nhiều bảng với nhau
        el.subs = el.subs !== undefined ? el.subs : this.createTreeMenu(arrIn, idKey, parentKey, el[idKey], myLevel + 1)
      })
      return roots;
    } else {
      let leafChildren = arrIn.find(x => x[idKey] === startWith);
      if (leafChildren) {
        leafChildren.$is_leaf = 1;
      }
      return undefined; //trả về array không có gì
    }
  }



  //----- Các hàm chuyển đổi dữ liệu như utils của javascript --//
  /**
     * Tạo thuộc tính cho đối tượng {}
     * Đồng thời đếm thuộc tính của đối tượng theo trường length
  */
  createObjectKey = (obj, key, value) => {
    Object.defineProperty(obj, key, { value: value, writable: true, enumerable: true, configurable: true });
    // obj.length = Object.keys(obj).length; //obj.length ? obj.length + 1 : 1;
    return obj;
  }

  /**
   * Xóa một thuộc tính của đối tượng,
   * Yêu cầu thuộc tính của đối tượng khi tạo có  
   * writable: true, enumerable: true, configurable: true
   */
  deleteObjectKey = (obj, key) => {
    let del = delete obj[key];
    // if (del) obj.length = Object.keys(obj).length;
    return obj;
  }

  /**
   * clone đối tượng thành đối tượng mới (sử dụng để gán đối tượng mới)
   * @param obj 
   */
  cloneObject = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Trả về dấu ? hoặc dấu & sau khi kiểm tra url có chứa ? chưa
   * @param url 
   */
  getUrlSeparateParameter(url) { return url.match(/\?/) ? '&' : '?'; }



  //----- các hàm dùng chung thông báo -----//
  /**
   * Hàm hiển thị trạng thái loading
   * Do nó được tạo kiểu promise nên phải đợi một thời gian mới tạo ra và mới đóng được
   * @param message 
   */
  showLoader(message) {
    this.loadingCtrl.create({
      message: message
    }).then((res) => {
      res.present();

      res.onDidDismiss().then((dis) => {
        //console.log('Loading dismissed!', dis);
      });
    });
  }

  /**
   * Hàm gọi ẩn loading nếu trước đó có gọi nó
   */
  hideLoader() {
    //console.log('close',this.loadingCtrl);
    if (this.loadingCtrl) {
      //console.log('closed call');
      setTimeout(() => {
        //Đợi 1 giây sau khi load xong mới đóng
        //Nếu không, chưa load xong (promise) mà đóng là bị lỗi
        //và không bao giờ đóng được
        this.loadingCtrl.dismiss();
        //console.log('called close');
      }, 2000);
    }
  }

  /**
   * Mở popup cửa sổ là các trang component hoặc trang lẻ
   * @param componentPage //Là trang cần popup lên 
   * @param navParams     //là bộ tham số truyền cho form
   */
  openModal(componentPage, navParams, callback?: any) {

    return new Promise<any>(async resolve => {

      const modal = await this.modalCtrl.create({
        component: componentPage,
        componentProps: navParams
      });

      modal.onDidDismiss().then((dataReturned) => {

        if (dataReturned && dataReturned.data) {
          //dữ liệu sau khi đóng form sẽ lấy được dữ liệu này
          //nó trả về mặt định là {data: = dữ liệu trả về, role: undefined}
          //console.log('Data return when close popup', dataReturned);
          if (callback) callback(dataReturned.data); //trả dữ liệu cho hàm callback
          resolve(dataReturned.data); //đóng lại và trả kết quả

          return;
        }

        resolve(); //Đóng lại nhưng không trả kết quả
      });

      await modal.present();

    })
  }

  /**
   * Đóng cửa sổ popup lại và gửi dữ liệu cho nơi gọi nó
   * @param data //dữ liệu cần trả lại cho nơi gọi trước đó, 
   */
  async closeModal(data?: any) {
    await this.modalCtrl.dismiss(data);
  }

  /**
   * Gọi cảnh báo hoặc yêu cầu xác nhận một việc gì đó
   * @param msg là nội dung tin thông báo dạng html (<br>)
   */
  presentAlert(msg: string, okText?: string) {
    return new Promise<any>(async resolve => {

      let buttonsReturn = [
        {
          text: okText ? okText
            : 'Đóng lại',
          handler: () => { resolve("CLOSE"); } //Đã xác nhận đóng lại
        }
      ]

      const alert = await this.alertCtrl.create({
        header: 'CHÚ Ý!',
        subHeader: 'Đọc kỹ thông tin sau',
        message: msg,
        buttons: buttonsReturn
      });

      await alert.present();
    });
  }


  /**
   * Xác nhận đồng ý hay không đồng ý
   * Trả về OK hoặc null cho promise
   * @param msg 
   * @param okText 
   * @param cancelText 
   */
  presentConfirm(msg: string, okText?: string, cancelText?: string) {
    return new Promise<any>(async resolve => {

      let buttonsReturn = [
        {
          text: cancelText ? cancelText
            : 'Bỏ qua',
          handler: () => { resolve(); } //Đã xác nhận không đồng ý
        }
        ,
        {
          text: okText ? okText
            : 'Đồng ý',
          handler: () => { resolve("OK"); } //Đã xác nhận đồng ý
        }
      ]

      const alert = await this.alertCtrl.create({
        header: 'XÁC NHẬN',
        subHeader: 'Đọc kỹ thông tin sau:',
        message: msg,
        buttons: buttonsReturn
      });

      await alert.present();
    });
  }



  /**
   * Hiển thị câu thông báo toast 
   * 
   */
  showToast(msg: string, duration?: number | 0 | 1000 | 2000 | 3000 | 5000, color?: string | 'danger' | 'primary' | 'secondary' | 'success' | 'warning', position?: 'middle' | 'bottom' | 'top') {
    return new Promise<any>(resolve => {
      this.toastCtrl.create({
        message: msg,
        duration: duration ? duration : 0,
        showCloseButton: duration ? false : true,
        position: position ? position : 'middle',
        closeButtonText: 'ok',
        animated: true,
        color: color ? color : 'primary'
      }).then((toastData) => {

        toastData.present();

        toastData.onDidDismiss()
          .then((dataReturned) => {
            //console.log('dataReturned:',dataReturned);
            //{data: undefined, role: "cancel"} // or timeout 
            resolve(dataReturned);
          });

      });
    })
  }


  /**
   * Đóng cửa sổ toast hiển thị bằng tay lại
   */
  hideToast() {
    //console.log('close',this.loadingCtrl);
    if (this.toastCtrl) {
      //console.log('closed call');
      setTimeout(() => {
        //Đợi 1 giây sau khi load xong mới đóng
        //Nếu không, chưa load xong (promise) mà đóng là bị lỗi
        //và không bao giờ đóng được
        this.toastCtrl.dismiss();
        //console.log('called close');
      }, 2000);
    }
  }


  /**
   * show popover menu
   * 
   * @param ev 
   * @param formMenu 
   * @param componentProps 
   * {
        type: 'single-choice',
        title: "Setting",
        color: "secondary",
        menu: settingsMenu
      }
   */
  presentPopover(ev: any
    , formMenu: any
    , componentProps:
      {
        type: string,
        title: string,
        color: string,
        menu: any[]
      }
  ) {
    return new Promise(async (resolve, reject) => {

      const popover = await this.popoverCtrl.create({
        component: formMenu,
        componentProps: componentProps,
        event: ev,
        animated: true,
        showBackdrop: true
      });

      // after select menu return with value
      popover.onDidDismiss()
        .then(rtnData => {
          if (rtnData && rtnData.data) {
            // data return with value
            resolve(rtnData.data);
          }
        })
        .catch(err => {
          reject(err)
        });

      return await popover.present();
    })
  }


  // Đóng cửa sổ popup menu popover
  async dismissPopover() {
    try {
      await this.popoverCtrl.dismiss();
    } catch{ }
  }


  /**
   * Hàm đợi số giây để tiếp tục thực thi bước tiếp theo
   * @param milisecond  số milligiây đợi thì thoát xong
   * @param data  là biến tham chiếu (dạng object đợi thời gian có dữ liệu thì sẽ thoát sớm hơn số giây trễ đó)
   */
  delay(milisecond, data?) {
    return new Promise<any>((resolve, reject) => {
      let startTime = Date.now();
      let intervalObj = setInterval(() => {
        if ((data && data.length) || (Date.now() - startTime > milisecond)) {
          resolve()
          clearInterval(intervalObj);
          intervalObj = null;
        }
      }, 1000)
    })
  }

  /**
   * Trả về môi trường di động là độ rộng của màn hình <576
   */
  isMobile() {
    // return this.platform.is('mobile');
    return this.platform.width() < 576
  }

  /**
   * Kiểm tra đây là môi trường thiết bị (không phải web)
   */
  isDevice() {
    return this.platform.is('cordova') && this.platform.is('mobile');
  }

}
