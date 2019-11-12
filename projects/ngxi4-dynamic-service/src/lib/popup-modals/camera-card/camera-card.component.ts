import { Component, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';
import { NavParams } from '@ionic/angular';
import { CommonsService } from 'src/app/services/commons.service';

@Component({
  selector: 'app-camera-card',
  templateUrl: './camera-card.component.html',
  styleUrls: ['./camera-card.component.scss'],
})
export class CameraCardComponent implements OnInit {

  width: number;
  height: number;

  @HostListener('window:resize', ['$event'])
  onResize(event?: Event) {
    const win = !!event ? (event.target as Window) : window;
    this.width = win.innerWidth;
    this.height = win.innerHeight;
  }



  // Hàm gọi lại để xử lý nếu có
  callback: any; 
  // Cho biết form này được gọi popup để đóng không bị lỗi
  parent: any;    

  @Output()
  public pictureTaken = new EventEmitter<WebcamImage>();

  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };
  public errors: WebcamInitError[] = [];

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();

  constructor(
    private navParams: NavParams
    , private apiCommons: CommonsService
  ) { }

  public ngOnInit(): void {
    
    this.onResize();
    
    // this.imageChangedEvent = this.navParams.get("event") ? this.navParams.get("event") : null;
    // this.item = this.navParams.get("item") ? this.navParams.get("item") : {};
    // this.croppieOptions = this.navParams.get("options") ? this.navParams.get("options") : this.croppieOptions;
    
    this.callback = this.navParams.get("callback");
    this.parent = this.navParams.get("parent");

    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean|string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    //console.info('Nhận được ảnh từ webcam: ', webcamImage);
    //this.pictureTaken.emit(webcamImage);
    this.onClickCapture(webcamImage);

  }

  public cameraWasSwitched(deviceId: string): void {
    //console.log('Chuyển camera sang id: ' + deviceId);
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }

  onClickClose(){
    this.next({next:'CLOSE'}); //không trả ảnh cắt về
  }
  /**
   * Chấp nhật ảnh cắt này
   */
  onClickCapture(webcamImage: WebcamImage){
    this.next({
              next:'CLOSE',
              //trả dữ liệu ảnh chụp được về dạng base64 đó
              next_data: webcamImage.imageAsDataUrl 
            });
  }

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
