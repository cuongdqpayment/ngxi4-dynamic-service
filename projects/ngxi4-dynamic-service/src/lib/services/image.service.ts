/**
 * 
 * ver 4.0 cho ionic 4
 * 
 * Dịch vụ xử lý ảnh, đọc thuộc tính ảnh, quay chiều ảnh, ...
 * Chuyển đổi tên thành base64 để lưu id ảnh
 * 
 * 
 * ver 2.1
 * Chuyển đổi ảnh image sang blob và file
 * 11/7/2019
 * 
 * ver 2.0
 * Get facedetected
 * 
 */
import { Injectable } from '@angular/core';
import * as exif from 'exif-js';
import { Ngxi4AuthService } from './ngxi4-auth.service';

const orientation_standard = {
  1: 0,
  3: 180,
  6: 90,
  8: 270
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(
    private apiAuth: Ngxi4AuthService
  ) { }

  /**
   * Chuyển đổi tên file dạng unicode hoặc dạng có ký tự trống, thành base64
   * @param filename 
   */
  encodeFilename(filename: string) {
    return filename;
    /* if (filename.lastIndexOf('.') > 0) {
      return this.apiAuth.Utf8toHex(filename.slice(0, filename.lastIndexOf('.'))) + '.' + filename.replace(/^.*\./, '')
    } else {
      return this.apiAuth.Utf8toHex(filename)
    } */
  }


  /**
   * Lấy kích thước của ảnh
   * @param urlOrBase64 
   * @param resize 
   */
  getImageSize(urlOrBase64: string, resize?: number) {

    return new Promise<any>(resolve => {
      try {
        let newSize = resize ? resize : 0;
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        let img = document.createElement('img');
        let maxW = newSize;
        let maxH = newSize;
        img.crossOrigin = "anonymous"; //quan trong de load image from url
        // Hàm khai trước, load ảnh vào sau
        img.onload = () => {
          let iw = img.width;
          let ih = img.height;
          let scale = Math.min((maxW / iw), (maxH / ih));
          let iwScaled = (scale <= 0 || scale > 1) ? iw : iw * scale;
          let ihScaled = (scale <= 0 || scale > 1) ? ih : ih * scale;
          //giam kich thuoc
          canvas.width = iwScaled;
          canvas.height = ihScaled;
          context.drawImage(img, 0, 0, iwScaled, ihScaled);
          
          resolve({width: img.width,height: img.height}) // độ rộng và độ cao
        }

        // Load ảnh vào sau, để hàm thực hiện được
        img.src = urlOrBase64;

      } catch (err) {
        resolve({width: 0,height: 0});
      }
    })
  }

  /**
   * 
   * Chuyển đổi ảnh thành base64 (dạng text) 
   * 
   * -- có thể lưu bất kỳ ở đâu, file text, csdl, memory,..
   * 
   * Có thể giảm kích cỡ ảnh xuống tỷ lệ mong muốn
   * ví dụ: 300, 200, ....
   * @param url Lấy một ảnh từ url hoặc base64 (có thể từ internet)
   * @param resize thay đổi kích thước tỷ lệ giảm xuống (nếu có)
   * Chỉ giảm chứ không cho tăng kích cỡ ảnh (nếu ảnh nhỏ)
   * return base64 image
   */
  createBase64Image(url: string, resize?: number) {

    return new Promise<any>(resolve => {
      try {
        let newSize = resize ? resize : 0;
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        let img = document.createElement('img');
        let maxW = newSize;
        let maxH = newSize;
        img.crossOrigin = "anonymous"; //quan trong de load image from url
        
        img.onload = () => {
          let iw = img.width;
          let ih = img.height;
          let scale = Math.min((maxW / iw), (maxH / ih));
          let iwScaled = (scale <= 0 || scale > 1) ? iw : iw * scale;
          let ihScaled = (scale <= 0 || scale > 1) ? ih : ih * scale;
          //giam kich thuoc
          canvas.width = iwScaled;
          canvas.height = ihScaled;
          context.drawImage(img, 0, 0, iwScaled, ihScaled);
          
          resolve(canvas.toDataURL()) //base64
          
        }
        // load ảnh vào sau khi hàm đã khai trước
        img.src = url;

      } catch (err) {
        resolve(url); //trả về nguyên trạng của url gốc
      }
    })
  }


  /**
     * Kiểm tra thuộc tính của file ảnh
     * Load file ảnh vào dạng blob file
     * @param filename 
     * @param file 
     * @param newSize 
     * Thực hiện quay ảnh tự động, lấy ra các thuộc tính về file
     * và tạo lại file ảnh kích thước nhỏ hơn (nếu có)
     */
  resizeImageNew(filename: string, file: any, newSize?: number) {
    return new Promise<any>((resolve, reject) => {
      if (file) {
        let allMetaData;
        let originOrientation;
        exif.getData(file, function () {
          allMetaData = exif.getAllTags(this);
          originOrientation = allMetaData.Orientation;
          //console.log("get Tags Orientation",allMetaData);
        });
        try {
          let canvas = document.createElement('canvas');
          let context = canvas.getContext('2d');
          let img = document.createElement('img');
          let maxW = newSize;
          let maxH = newSize;
          img.src = URL.createObjectURL(file);

          img.onload = () => {
            let iw = img.width;
            let ih = img.height;
            let scale = Math.min((maxW / iw), (maxH / ih));
            let iwScaled = (scale <= 0 || scale > 1) ? iw : iw * scale;
            let ihScaled = (scale <= 0 || scale > 1) ? ih : ih * scale;

            //giam kich thuoc
            canvas.width = iwScaled;
            canvas.height = ihScaled;
            context.drawImage(img, 0, 0, iwScaled, ihScaled);

            //quay
            let imageNew = document.createElement('img');
            imageNew.src = canvas.toDataURL();

            imageNew.onload = () => {

              if (originOrientation > 2 && originOrientation <= 4) {
                //console.log('rotate 180');
                canvas.width = imageNew.width;
                canvas.height = imageNew.height;
                context.rotate(180 * Math.PI / 180);
                context.drawImage(imageNew, -imageNew.width, -imageNew.height);

              } else if (originOrientation > 4 && originOrientation <= 7) {
                //rotate 90
                //console.log('rotate 90');
                canvas.width = imageNew.height;
                canvas.height = imageNew.width;
                context.rotate(90 * Math.PI / 180);
                context.drawImage(imageNew, 0, -imageNew.height);

              } else if (originOrientation > 7 && originOrientation <= 9) {
                //rotate 270
                //console.log('rotate 270');
                canvas.width = imageNew.height;
                canvas.height = imageNew.width;
                context.rotate(270 * Math.PI / 180);
                context.drawImage(imageNew, -imageNew.width, 0);

              }

              canvas.toBlob((blob) => {
                let reader = new FileReader();
                reader.readAsArrayBuffer(blob);
                reader.onload = () => {
                  let newFile = new Blob([reader.result], { type: 'image/jpeg' });

                  console.log('newfile??', newFile);

                  resolve({
                    src: canvas.toDataURL(), //base64 cho hiển thị ảnh
                    origin: filename, //ten file gốc không chỉnh sửa
                    alt: filename, //tên file có thể chỉnh sửa nội dung của ảnh
                    file: (newSize === 0 ? file : newFile), //không biến đổi ảnh để gửi ảnh gốc lên nếu cần
                    filename: this.encodeFilename(filename), //được biến đổi tên để gửi lên máy chủ
                    file_date: file.lastModified ? file.lastModified : file.lastModifiedDate ? file.lastModifiedDate.getTime() : Date.now(),
                    size: (newSize === 0 ? file.size : newFile.size), //kích cỡ file
                    type: (newSize === 0 ? file.type : newFile.type)  //kiểu file gì
                  });
                }
              });
            }

          }
        } catch (err) { reject(err); }
      } else {
        reject("No file!");
      }

    });

  }

  //dua vao doi tuong file image
  //tra ve doi tuong file image co kich co nho hon

  /**
   * ham nay thuc hien giam kich co anh de tiet kiem dung luong truyen
   * 
   * @param filename Tên file đưa lên
   * @param file là đối tượng file lấy được dạng file
   * @param newSize kích cỡ cần điều chỉnh tối đa (chiều rộng hoặc chiều cao)
   */
  resizeImage(filename: string, file: any, newSize?: number) {

    if (newSize) {
      return new Promise<any>((resolve, reject) => {

        if (file) {

          let allMetaData;
          let originOrientation;

          exif.getData(file, function () {

            //try{
            allMetaData = exif.getAllTags(this);
            //}catch(e){}
            originOrientation = allMetaData ? allMetaData.Orientation : 0;
            //console.log("get Tags Orientation",allMetaData);
          });

          try {
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');
            let img = document.createElement('img');
            let maxW = newSize;
            let maxH = newSize;
            img.src = URL.createObjectURL(file);

            img.onload = () => {
              let iw = img.width;
              let ih = img.height;
              let scale = Math.min((maxW / iw), (maxH / ih));
              let iwScaled = (scale <= 0 || scale > 1) ? iw : iw * scale;
              let ihScaled = (scale <= 0 || scale > 1) ? ih : ih * scale;

              //giam kich thuoc
              canvas.width = iwScaled;
              canvas.height = ihScaled;
              context.drawImage(img, 0, 0, iwScaled, ihScaled);

              //quay
              let imageNew = document.createElement('img');
              imageNew.src = canvas.toDataURL();

              imageNew.onload = () => {

                if (originOrientation > 2 && originOrientation <= 4) {
                  //console.log('rotate 180');
                  canvas.width = imageNew.width;
                  canvas.height = imageNew.height;
                  context.rotate(180 * Math.PI / 180);
                  context.drawImage(imageNew, -imageNew.width, -imageNew.height);

                } else if (originOrientation > 4 && originOrientation <= 7) {
                  //rotate 90
                  //console.log('rotate 90');
                  canvas.width = imageNew.height;
                  canvas.height = imageNew.width;
                  context.rotate(90 * Math.PI / 180);
                  context.drawImage(imageNew, 0, -imageNew.height);

                } else if (originOrientation > 7 && originOrientation <= 9) {
                  //rotate 270
                  //console.log('rotate 270');
                  canvas.width = imageNew.height;
                  canvas.height = imageNew.width;
                  context.rotate(270 * Math.PI / 180);
                  context.drawImage(imageNew, -imageNew.width, 0);

                }

                canvas.toBlob((blob) => {
                  let reader = new FileReader();
                  reader.readAsArrayBuffer(blob);
                  reader.onload = () => {
                    let newFile = new Blob([reader.result], { type: 'image/jpeg' });
                    resolve({
                      image: canvas.toDataURL(), //base64 for view and json post
                      file: (newSize === 0 ? file : newFile) //formData post size=0 get Origin
                      , filename: this.encodeFilename(filename)
                      , h1: this.encodeFilename(filename)
                      , p: " ***Kích cỡ cũ: " + file.size
                        + "(" + img.width + "x" + img.height + ")"
                        + " * Kiểu file cũ: " + file.type
                        + " * Hướng ảnh chụp: " + orientation_standard[(originOrientation ? originOrientation : 1)]
                        + "(" + (originOrientation ? "(" + originOrientation + ")" : "1") + ")"
                        + " ***Kích cỡ mới: BIN=" + newFile.size
                        + "(" + canvas.width + "x" + canvas.height + ") Base64=" + canvas.toDataURL().length + ""
                        + " * Kiểu file mới: " + newFile.type
                        + " ***Các tham số tạo ảnh: "
                        + (allMetaData && allMetaData.Make ? " * Hãng sx máy ảnh: " + allMetaData.Make : "")
                        + (allMetaData && allMetaData.Make ? " * Đời máy ảnh: " + allMetaData.Model : "")
                        + (allMetaData && allMetaData.Software ? " * Phần mềm: " + allMetaData.Software : "")
                        + (allMetaData && allMetaData.DateTime ? " * Ngày giờ: " + allMetaData.DateTime : "")
                        + (allMetaData && allMetaData.DateTimeOriginal ? " * Ngày giờ gốc: " + allMetaData.DateTimeOriginal : "")
                        + (allMetaData && allMetaData.DateTimeDigitized ? " * Ngày giờ số hóa: " + allMetaData.DateTimeDigitized : "")
                        + (allMetaData && allMetaData.GPSLatitude ? " * Vĩ Độ: " + allMetaData.GPSLatitude + allMetaData.GPSLatitudeRef : "")
                        + (allMetaData && allMetaData.GPSLongitude ? " * Kinh Độ: " + allMetaData.GPSLongitude + allMetaData.GPSLongitudeRef : "")
                        + (allMetaData && allMetaData.GPSDateStamp ? " * Ngày giờ tọa độ: " + allMetaData.GPSDateStamp + allMetaData.GPSTimeStamp : "")

                      , h3: (file.lastModified ? new Date(file.lastModified).toISOString() : file.lastModifiedDate)
                      , note: JSON.stringify(allMetaData, null, 2)
                      , last_modified: file.lastModified ? file.lastModified : file.lastModifiedDate ? file.lastModifiedDate.getTime() : Date.now()
                      , subtitle: (file.lastModified ? new Date(file.lastModified).toLocaleDateString() : file.lastModifiedDate) + (originOrientation ? "(" + originOrientation + ")" : "")
                      , width: canvas.width //cho biet anh nam doc hay nam ngang
                      , height: canvas.height
                      , orientation_old: originOrientation
                      , size_old: file.size
                      , type_old: file.type
                      , size: newFile.size
                      , type: newFile.type
                    });
                  }
                });
              }

            }
          } catch (err) { reject(err); }
        } else {
          reject("No file!");
        }

      });
    } else {
      return this.noResizeImage(filename, file);
    }
  }

  /**
   * Chỉ quay ảnh tự động không giảm kích cỡ
   * @param filename 
   * @param file 
   */
  noResizeImage(filename: string, file: any) {
    return new Promise<any>((resolve, reject) => {

      if (file) {

        let allMetaData;
        let originOrientation;
        exif.getData(file, function () {
          allMetaData = exif.getAllTags(this);
          originOrientation = allMetaData.Orientation;
        });


        try {
          let canvas = document.createElement('canvas');
          let context = canvas.getContext('2d');
          let img = document.createElement('img');
          img.src = URL.createObjectURL(file);

          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0, img.width, img.height);

            //quay
            let imageNew = document.createElement('img');
            imageNew.src = canvas.toDataURL();

            imageNew.onload = () => {

              if (originOrientation > 2 && originOrientation <= 4) {
                //console.log('rotate 180');
                canvas.width = imageNew.width;
                canvas.height = imageNew.height;
                context.rotate(180 * Math.PI / 180);
                context.drawImage(imageNew, -imageNew.width, -imageNew.height);

              } else if (originOrientation > 4 && originOrientation <= 7) {
                //rotate 90
                //console.log('rotate 90');
                canvas.width = imageNew.height;
                canvas.height = imageNew.width;
                context.rotate(90 * Math.PI / 180);
                context.drawImage(imageNew, 0, -imageNew.height);

              } else if (originOrientation > 7 && originOrientation <= 9) {
                //rotate 270
                //console.log('rotate 270');
                canvas.width = imageNew.height;
                canvas.height = imageNew.width;
                context.rotate(270 * Math.PI / 180);
                context.drawImage(imageNew, -imageNew.width, 0);

              }

              canvas.toBlob((blob) => {
                let reader = new FileReader();
                reader.readAsArrayBuffer(blob);
                reader.onload = () => {
                  let newFile = new Blob([reader.result], { type: 'image/jpeg' });
                  resolve({
                    image: canvas.toDataURL() //base64 for view and json post
                    , file: newFile //formData post size=0 get Origin
                    , filename: this.encodeFilename(filename)
                    , h1: this.encodeFilename(filename)
                    , p: " ***Kích cỡ cũ: " + file.size
                      + "(" + img.width + "x" + img.height + ")"
                      + " * Kiểu file cũ: " + file.type
                      + " * Hướng ảnh chụp: " + orientation_standard[(originOrientation ? originOrientation : 1)]
                      + "(" + (originOrientation ? "(" + originOrientation + ")" : "1") + ")"
                      + " ***Kích cỡ mới: BIN=" + newFile.size
                      + "(" + canvas.width + "x" + canvas.height + ") Base64=" + canvas.toDataURL().length + ""
                      + " * Kiểu file mới: " + newFile.type
                      + " ***Các tham số tạo ảnh: "
                      + (allMetaData && allMetaData.Make ? " * Hãng sx máy ảnh: " + allMetaData.Make : "")
                      + (allMetaData && allMetaData.Make ? " * Đời máy ảnh: " + allMetaData.Model : "")
                      + (allMetaData && allMetaData.Software ? " * Phần mềm: " + allMetaData.Software : "")
                      + (allMetaData && allMetaData.DateTime ? " * Ngày giờ: " + allMetaData.DateTime : "")
                      + (allMetaData && allMetaData.DateTimeOriginal ? " * Ngày giờ gốc: " + allMetaData.DateTimeOriginal : "")
                      + (allMetaData && allMetaData.DateTimeDigitized ? " * Ngày giờ số hóa: " + allMetaData.DateTimeDigitized : "")
                      + (allMetaData && allMetaData.GPSLatitude ? " * Vĩ Độ: " + allMetaData.GPSLatitude + allMetaData.GPSLatitudeRef : "")
                      + (allMetaData && allMetaData.GPSLongitude ? " * Kinh Độ: " + allMetaData.GPSLongitude + allMetaData.GPSLongitudeRef : "")
                      + (allMetaData && allMetaData.GPSDateStamp ? " * Ngày giờ tọa độ: " + allMetaData.GPSDateStamp + allMetaData.GPSTimeStamp : "")

                    , h3: (file.lastModified ? new Date(file.lastModified).toISOString() : file.lastModifiedDate)
                    , note: JSON.stringify(allMetaData, null, 2)
                    , last_modified: file.lastModified ? file.lastModified : file.lastModifiedDate ? file.lastModifiedDate.getTime() : Date.now()
                    , subtitle: (file.lastModified ? new Date(file.lastModified).toLocaleDateString() : file.lastModifiedDate) + (originOrientation ? "(" + originOrientation + ")" : "")
                    , width: canvas.width //cho biet anh nam doc hay nam ngang
                    , height: canvas.height
                    , orientation_old: originOrientation
                    , size_old: file.size
                    , type_old: file.type
                    , size: newFile.size
                    , type: newFile.type
                  });
                }
              });
            }

          }
        } catch (err) { reject(err); }
      } else {
        reject("No file!");
      }

    });
  }

  /**
   * Giảm kích thức file ảnh xuống còn nhỏ hơn 2M
   * @param file 
   */
  resize2M(file) {

    return new Promise<any>(resolve => {

      if (file) {

        let allMetaData;
        let originOrientation;
        exif.getData(file, function () {
          allMetaData = exif.getAllTags(this);
          originOrientation = allMetaData.Orientation;
        });


        try {
          let canvas = document.createElement('canvas');
          let context = canvas.getContext('2d');
          let img = document.createElement('img');
          img.src = URL.createObjectURL(file);

          img.onload = () => {

            let maxW = img.width;
            let maxH = img.height;

            if (file.size > 2000000) {
              maxW = 1200;
              maxH = 1200;
            }

            let iw = img.width;
            let ih = img.height;
            let scale = Math.min((maxW / iw), (maxH / ih));
            let iwScaled = (scale <= 0 || scale > 1) ? iw : iw * scale;
            let ihScaled = (scale <= 0 || scale > 1) ? ih : ih * scale;

            //giam kich thuoc
            canvas.width = iwScaled;
            canvas.height = ihScaled;
            context.drawImage(img, 0, 0, iwScaled, ihScaled);


            //quay
            let imageNew = document.createElement('img');
            imageNew.src = canvas.toDataURL();

            imageNew.onload = () => {

              if (originOrientation > 2 && originOrientation <= 4) {
                //console.log('rotate 180');
                canvas.width = imageNew.width;
                canvas.height = imageNew.height;
                context.rotate(180 * Math.PI / 180);
                context.drawImage(imageNew, -imageNew.width, -imageNew.height);

              } else if (originOrientation > 4 && originOrientation <= 7) {
                //rotate 90
                //console.log('rotate 90');
                canvas.width = imageNew.height;
                canvas.height = imageNew.width;
                context.rotate(90 * Math.PI / 180);
                context.drawImage(imageNew, 0, -imageNew.height);

              } else if (originOrientation > 7 && originOrientation <= 9) {
                //rotate 270
                //console.log('rotate 270');
                canvas.width = imageNew.height;
                canvas.height = imageNew.width;
                context.rotate(270 * Math.PI / 180);
                context.drawImage(imageNew, -imageNew.width, 0);

              }

              canvas.toBlob((blob) => {
                let reader = new FileReader();
                reader.readAsArrayBuffer(blob);
                reader.onload = () => {
                  let newFile = new Blob([reader.result], { type: 'image/jpeg' });
                  resolve({ image: canvas.toDataURL(), file: newFile });
                }
              });
            }

          }
        } catch (err) { resolve(); }
      } else {
        resolve();
      }

    });
  }


  /**
   * Chuyển đổi base64 image thành blob/file để truyền đi
   * @param base64Image 
   */
  croppiedImage(base64Image: string) {
    if (base64Image) {
      //cắt bỏ phần header của ảnh chỉ còn lại base64 thôi
      let base64 = base64Image.substring(base64Image.lastIndexOf(",") + 1);
      //Chuyển đổi chuổi base64 thành blob image = file
      return this.b64toBlob(base64, 'image/jpeg');//'image/png');
    } else {
      return null;
    }

  }

  /**
   * Chuyển đổi base64 thành kiểu blob để ghi ra file
   * @param b64Data  //Đây là chuổi base64 đơn thuần không chứa header
   * @param contentType 
   */
  b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }


  /**
   * Chuyển đổi kiểu blob sang kiểu file cho đầy đủ
   */
  blobToFile(theBlob: Blob, fileName: string): File {

    return new File([theBlob], fileName);

    /* var b: any = theBlob;
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModified = Date.now();
    b.lastModifiedDate = new Date();
    b.name = fileName;
 
    //Cast to a File() type
    return <File>theBlob; */
  }

  /**
   * Detect mat nguoi
   * @param file 
   */
  async getFaceDetected(file) {
    //bị cors
    //curl -X POST "https://api-us.faceplusplus.com/facepp/v3/detect" -F "api_key=zdZJG4mWl487lLqLSRigGXQt52i2jKK9" -F "api_secret=LVz1f55TF1QrKrFr96-3REiqTZn-A2nS" -F "image_file=@Y:\picture_cuongdq\cuongdq\P1040501.JPG" -F "return_landmark=1" -F "return_attributes=gender,age"
    //chế lại mạng riêng
    //curl -X POST "http://localhost:9234/media/public/your-face" -F "image_face=@Y:\picture_cuongdq\cuongdq\P1040501.JPG"

    let form_data: FormData = new FormData();

    //giam kich co file nay xuong con <2M
    //console.log("Kich co",file.size);
    let newFile = await this.resize2M(file);

    //console.log("Kich co sau", newFile.file.size);

    form_data.append("image_face", newFile && newFile.file ? newFile.file : file, this.encodeFilename(file.name));


    return this.apiAuth.postDynamicFormData("https://c3.mobifone.vn/media/public/your-face", form_data)
      .then(
        data => {
          let rtn: any;
          rtn = data;
          rtn.image = newFile && newFile.image ? newFile.image : undefined;
          //console.log("result",rtn);
          return rtn;
        }
      )

  }



}
