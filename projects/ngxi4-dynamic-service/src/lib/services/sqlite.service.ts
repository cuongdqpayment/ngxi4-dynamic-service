/**
 * Dịch vụ lưu trữ cơ sở dữ liệu sqlite (chỉ sử dụng trên ứng dụng di động)
 * Tương đương sqlite-dao.js -- nhúng dịch vụ này vào khai là:
 * private db: SqliteService
 * 
 * //sau đó khởi tạo 
 * this.db.init(tên file csdl lưu trên máy)
 * .then (db=> database openned! )
 * .catch (err=> Lỗi không mở được db - tên file không hợp lệ...)
 * 
 * Khi có được db mở, ta sử dụng các việc khác như tạo bảng, chèn, update, select như thường lệ
 * 
 */
import { Injectable } from '@angular/core';

import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  //tên database mặt định của ứng dụng
  dbName: string = 'default-ionic4-cuongdq.db';
  db: SQLiteObject = null;

  constructor(
    private sqlite: SQLite
  ) { }

  /**
   * Khởi tạo database, có được kết nối this.db sau khi khởi tạo
   * @param fileName 
   */
  init(fileName?: string) {

    this.dbName = fileName ? fileName : this.dbName;

    return this.sqlite.create({
      name: this.dbName,
      location: 'default'
    }).then((db: SQLiteObject) => {
      console.log('Database start OK!', this.dbName);
      this.db = db;
      return db;
    })
      .catch(e => {
        console.log('Error when Init database...', e)
        this.db = null;
        throw (e); //trả về nơi gọi là reject nhé
      });
  }

  /**
   * Hàm chuyển đổi câu lệnh sql insert, update, delete từ json
   * @param tablename 
   * @param json 
   * @param idWheres 
   */
  convertSqlFromJson(tablename: string, json: any, idWheres = []) {
    let jsonInsert = { name: tablename, cols: [], wheres: [] }
    let whereFields = idWheres ? idWheres : ['id'];
    for (let key in json) {
      let value = json[key];
      //chuyển đổi tất cả các giá trị kiểu object sang stringify trước khi chèn vào
      if (typeof value === 'object') value = JSON.stringify(value, null, 2);

      jsonInsert.cols.push({ name: key, value: value });
      if (whereFields.find(x => x === key)) jsonInsert.wheres.push({ name: key, value: value })
    }
    return jsonInsert;
  }

  /**
   * Tạo các bảng dữ liệu từ sheet tables trong file excel
   * @param {*} tables [{table_name: value, field_name: value, ...}]
   */
  createTables(tables) {

    return new Promise<any>(resolve => {

      let tables_created = [];
      let countFinish = 0;

      // Khai báo mảng chứa tên bảng duy nhất
      let valueArr = tables.map((o) => { return o['table_name'] });
      let distinct_table_name = valueArr.filter((value, index, self) => { return self.indexOf(value) === index; });

      distinct_table_name.forEach(
        async el => { //để cho các lệnh dưới thực hiện tuần tự xong thì mới qua bước kia

          // Lọc lấy các dòng có cùng tên bảng
          let table = tables.filter(x => x.table_name === el);

          // Nếu có dữ liệu được lọc
          if (table && table.length > 0) {

            //thì chuyển đổi thành chuỗi json chèn dữ liệu vào csdl
            let tableJson = {
              name: el,
              cols: []
            };


            let createIndexs = [];
            let idx = 0;

            table.forEach(e => {

              let col = {
                name: e.field_name,
                type: e.data_type,
                option_key: e.options,
                description: e.description
              };

              tableJson.cols.push(col);

              // Kiểm tra nếu yêu cầu tạo index thì tạo câu lệnh tạo index độc lập riêng
              if (e.option_index === 'UNIQUE' || e.option_index === 'INDEX') {
                createIndexs.push("CREATE " + (e.option_index === "UNIQUE" ? "UNIQUE" : "") + "\
                                          INDEX idx_"+ el + "_" + (++idx) + "\
                                          ON "+ el + "(" + e.field_name + ")"
                );
              }
            })

            // Thực hiện tạo bảng bằng dữ liệu json đã chuyển đổi ở trên
            try {
              await this.createTable(tableJson);
              // thông báo tạo xong bảng
              console.log('Create table ok: ', el);

              for (let i = 0; i < createIndexs.length; i++) {
                //thực hiện tạo index sau khi tạo bảng thành công
                await this.runSql(createIndexs[i]);
                console.log('index created: ', "idx_" + el + "_" + i);
              }
              // ghi nhận bảng đã tạo xong
              tables_created.push(el);
              countFinish++;
            } catch (err) {
              console.log('Lỗi create table: ', JSON.stringify(err, null, 2));
              countFinish++;
            }
          } else {
            countFinish++;
          }

          if (countFinish === distinct_table_name.length) {
            resolve(tables_created);
          }

        })
    })


  }

  /**
   * Tạo dũ liệu cho bảng, từ một mảng dữ liệu json chứa từng bảng ghi
   * @param {*} tableName 
   * @param {*} jsonRows {col_name:value,...}
   */
  insertTableData(tableName, jsonRows) {

    return new Promise<any>(async resovle => {
      let returnFinish = { count_sccess: 0, count_fail: 0 }

      for (let i = 0; i < jsonRows.length; i++) {

        let row = jsonRows[i];
        let jsonInsert = { name: tableName, cols: [] }

        for (let key in row) {
          let col = { name: key, value: row[key] };
          jsonInsert.cols.push(col);
        }

        if (jsonInsert.cols.length > 0) {
          try {
            await this.insert(jsonInsert);
            returnFinish.count_sccess++;
          } catch (err) {
            console.log('err: ', err);
            returnFinish.count_fail++;
          };
        }
      }

      resovle(returnFinish);
    })
  }

  /**
   * 
   * @param {*} table 
   * var table ={
   *              name: 'LOGIN',
   *              cols: [
   *                      {
   *                        name: 'ID',
   *                        type: dataType.integer,
   *                        option_key: 'PRIMARY KEY AUTOINCREMENT',
   *                        description: 'Key duy nhat quan ly'
   *                        }
   *                      ]
   *            }
   */
  createTable(table) {
    let sql = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (';
    let i = 0;
    for (var col of table.cols) {
      if (i++ == 0) {
        sql += col.name + ' ' + col.type + ' ' + col.option_key;
      } else {
        sql += ', ' + col.name + ' ' + col.type + ' ' + col.option_key;
      }
    }
    sql += ')';
    return this.runSql(sql);
  }


  //insert
  /**
   * 
   * @param {*} insertTable 
   * var insertTable={
   *                  name:'tablename',
   *                  cols:[{
   *                        name:'ID',
   *                        value:'1'
   *                        }]
   *                  }
   * 
   */
  insert(insertTable) {
    let sql = 'INSERT INTO ' + insertTable.name
      + ' ('
    let i = 0;
    let sqlNames = '';
    let sqlValues = '';
    let params = [];
    for (let col of insertTable.cols) {
      if (col.value != undefined && col.value != null) {
        params.push(col.value);
        if (i++ == 0) {
          sqlNames += col.name;
          sqlValues += '?';
        } else {
          sqlNames += ', ' + col.name;
          sqlValues += ', ?';
        }
      }
    }

    sql += sqlNames + ') VALUES (';
    sql += sqlValues + ')';

    return this.runSql(sql, params);
  }

  //update 
  /**
   * 
   * @param {*} updateTable
   *  var updateTable={
   *                  name:'tablename',
   *                  cols:[{
   *                        name:'ID',
   *                        value:'1'
   *                        }]
   *                  wheres:[{
   *                         name:'ID',
   *                         value:'1'
   *                         }]
   *                  }
   */
  update(updateTable) {
    let sql = 'UPDATE ' + updateTable.name + ' SET ';

    let i = 0;
    let params = [];
    for (let col of updateTable.cols) {
      if (col.value != undefined && col.value != null) {
        //neu gia tri khong phai undefined moi duoc thuc thi
        params.push(col.value);
        if (i++ == 0) {
          sql += col.name + '= ?';
        } else {
          sql += ', ' + col.name + '= ?';
        }
      }
    }

    i = 0;
    for (let col of updateTable.wheres) {
      if (col.value != undefined && col.value != null) {
        params.push(col.value);
        if (i++ == 0) {
          sql += ' WHERE ' + col.name + '= ?';
        } else {
          sql += ' AND ' + col.name + '= ?';
        }
      } else {
        sql += ' WHERE 1=2'; //menh de where sai thi khong cho update Bao toan du lieu
      }
    }
    return this.runSql(sql, params)
  }

  //delete
  /**
   * Ham xoa bang ghi
   * @param {*} id 
   */
  delete(deleteTable) {
    let sql = 'DELETE FROM ' + deleteTable.name;
    let i = 0;
    let params = [];
    for (let col of deleteTable.wheres) {
      if (col.value != undefined && col.value != null) {
        params.push(col.value);
        if (i++ == 0) {
          sql += ' WHERE ' + col.name + '= ?';
        } else {
          sql += ' AND ' + col.name + '= ?';
        }
      } else {
        sql += ' WHERE 1=2'; //dam bao khong bi xoa toan bo so lieu khi khai bao sai
      }
    }
    return this.runSql(sql, params)
  }

  //
  /**
   *lenh select, update, delete su dung keu json 
   * @param {*} selectTable 
   */
  select(selectTable) {
    let sql = 'SELECT * FROM ' + selectTable.name;
    let i = 0;
    let params = [];
    let sqlNames = '';
    for (let col of selectTable.cols) {
      if (i++ == 0) {
        sqlNames += col.name;
      } else {
        sqlNames += ', ' + col.name;
      }
    }
    sql = 'SELECT ' + sqlNames + ' FROM ' + selectTable.name;
    i = 0;
    if (selectTable.wheres) {
      for (let col of selectTable.wheres) {
        if (col.value != undefined && col.value != null) {
          params.push(col.value);
          if (i++ == 0) {
            sql += ' WHERE ' + col.name + '= ?';
          } else {
            sql += ' AND ' + col.name + '= ?';
          }
        }
      }
    }
    //console.log(sql);
    //console.log(params);
    return this.getRst(sql, params)
  }
  //lay 1 bang ghi dau tien cua select
  /**
   * lay 1 bang ghi
   * @param {*} sql 
   * @param {*} params 
   */
  getRst(sql, params = []) {
    return this.runSql(sql, params)
      .then(data => {
        if (data.rows.length>0){
          //chuyển đổi các trường dữ liệu jsonString sang json thuần
          let retunData = JSON.stringify(
            data.rows.item(0),
            (key, value) => {
              if (value === null) { return undefined; }
              if (value 
                && (
                key ==='form_data'
                || key ==='class_list'
                || key ==='staff_list'
                || key ==='room_list'
                || key ==='organization_list'
                || key ==='teacher_list'
                || key ==='subject_list'
                || key ==='documents'
                || key ==='signature'
                || key ==='materials'
                || key ==='options'
                || key ==='absent_student_list'
                || key ==='private_id_list'
                )
                ) { return JSON.parse(value) }
              return value;
            })

          return JSON.parse(retunData);
        }else{
          return null;
        }
      })
  }

  /**
   * Lay tat ca cac bang ghi
   * @param {*} sql 
   * @param {*} params 
   */
  getRsts(sql, params = []) {
    return this.runSql(sql, params)
      .then(data => {
        //console.log('Data: ', data);
        let results = [];
        for (let i = 0; i < data.rows.length; i++) {
          let item = data.rows.item(i);
          // do something with it
          results.push(item);
        }

        let retunData = JSON.stringify(
          results,
          (key, value) => {
            if (value === null) { return undefined; }
            if (value 
              && (
              key ==='form_data'
              || key ==='class_list'
              || key ==='staff_list'
              || key ==='room_list'
              || key ==='organization_list'
              || key ==='teacher_list'
              || key ==='subject_list'
              || key ==='documents'
              || key ==='signature'
              || key ==='materials'
              || key ==='absent_student_list'
              || key ==='private_id_list'
              )
              ) { return JSON.parse(value) }
            return value;
          })

        return JSON.parse(retunData);
      })
      
  }

  //cac ham va thu tuc duoc viet duoi nay
  /**
   * Ham thuc thi lenh sql va cac tham so
   * @param {*} sql 
   * @param {*} params 
   */
  runSql(sql, params = []) {  //Hàm do ta tự đặt tên gồm 2 tham số truyền vào.
    if (this.db) return this.db.executeSql(sql, params);
    return new Promise<any>((resolve, reject) => {
      reject('Database not Open!');
    })
  }


  /**
   * Kiểm tra trạng thái db đã mở chưa?
   */
  isOpen(){
    return (this.db!==null)
  }

}
