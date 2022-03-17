import Moment from "moment";
// const moment = require("moment");
class MyFunction {
  checkEmpty(data, dataOption = [], message = " is not empty!") {
    //   {name:"sad",detail:""} รูปแบบที่ส่งเข้ามา
    let returnData = [];
    for (let index in data) {
      if (typeof data[index] === "object") {
        for (let subIndex in data[index]) {
          if (typeof data[index][subIndex] === "object") {
            for (let subIndex2 in data[index][subIndex]) {
              if (
                !this.checkEmptyLogic(data[index][subIndex][subIndex2]) &&
                dataOption.indexOf(subIndex2) < 0
              ) {
                returnData.push(
                  { field: subIndex2, msg: `# ${parseInt(index) + 1} ${subIndex} '${data[index][subIndex][[subIndex2]]}' ${message}` }
                );
              }
            }
          } else {
            if (
              !this.checkEmptyLogic(data[index][subIndex]) &&
              dataOption.indexOf(subIndex) < 0
            ) {
              returnData.push(
                { field: subIndex, msg: `# ${parseInt(index) + 1} ${subIndex} '${data[index][subIndex]}' ${message}` }
              );
            }
          }

          // if (
          //   !this.checkEmptyLogic(data[index][subIndex]) &&
          //   dataOption.indexOf(subIndex) < 0
          // ) {
          //   returnData.push(
          //     { field: subIndex, msg: `# ${parseInt(index) + 1} ${subIndex} ${message}` }
          //   );
          // }
        }
      } else {
        if (
          !this.checkEmptyLogic(data[index]) &&
          dataOption.indexOf(index) < 0
        ) {
          // returnData.push(index + message);
          returnData.push(
            { field: index, msg: `${index} ${message}` }
          );
        }
      }
    }
    return returnData;
  }
  checkEmptyLogic(empData) {
    if (empData === "") {
      return false;
    }
    return true;
  }
  checkNumeric(data, dataOption = [], message = " need type number only!") {
    //   {name:"sad",detail:""} รูปแบบที่ส่งเข้ามา
    let returnData = [];
    const format = /^[0-9.]+$/;
    for (let index in data) {
      if (typeof data[index] === "object") {
        for (let subIndex in data[index]) {
          if (typeof data[index][subIndex] === "object") {
            for (let subIndex2 in data[index][subIndex]) {
              if (
                !this.checkNumericLogic(data[index][subIndex][subIndex2]) &&
                dataOption.indexOf(subIndex2) < 0 &&
                data[index][subIndex2] !== ""
              ) {
                returnData.push(
                  { field: subIndex2, msg: `# ${parseInt(index) + 1} ${subIndex} '${data[index][subIndex][[subIndex2]]}' ${message}` }
                );
              }
            }
          } else {
            if (
              !this.checkNumericLogic(data[index][subIndex]) &&
              dataOption.indexOf(subIndex) < 0 &&
              data[index][subIndex] !== ""
            ) {
              returnData.push(
                { field: subIndex, msg: `# ${parseInt(index) + 1} ${subIndex} '${data[index][subIndex]}' ${message}` }
              );
            }
          }
          // if (
          // !this.checkNumericLogic(data[index][subIndex]) &&
          // dataOption.indexOf(subIndex) < 0 &&
          // data[index][subIndex] != ""
          // ) {
          //   returnData.push(
          //     { field: subIndex, msg: `# ${parseInt(index) + 1} ${subIndex} "${data[index][subIndex]}" ${message}` }
          //   );
          // }
        }
      } else {
        if (
          !this.checkNumericLogic(data[index]) &&
          dataOption.indexOf(index) < 0 &&
          data[index] != ""
        ) {
          // returnData.push(index + " " + data[index] + message);
          returnData.push(
            { field: index, msg: `${index} '${data[index]}' ${message}` }
          );
        }
      }
    }

    return returnData;
  }
  checkNumericLogic(numberData) {
    // false = ไม่ใช่ตัวเลข
    const format = /^[0-9.]+$/;
    const checkNumber = format.test(numberData);
    // check ก่อนว่าเป็นตัวเลขไหมถ้าจริงไปดัก ตัวอย่าง 10.
    if (!checkNumber) {
      // returnData.push(index + message);
      return false;
    } else {
      const number = numberData.toString();
      const myArr = number.split(".");
      const firstIndex = myArr[0];
      const lastIndex = myArr[myArr.length - 1];
      if (
        firstIndex === "" || lastIndex === ""
        //   firstIndex == "" ||
        //   (lastIndex == "" && dataOption.indexOf(index) < 0)
      ) {
        // returnData.push(index + message);
        return false;
      }
    }
    return true;
  }
  checkSpecialCharacter(
    data,
    dataOption = [],
    formatCheck = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/,
    message = " can't use special character!"
  ) {
    //   /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
    let returnData = [];
    const format = formatCheck;
    for (let index in data) {
      if (typeof data[index] === "object") {
        for (let subIndex in data[index]) {
          if (typeof data[index][subIndex] === "object") {
            for (let subIndex2 in data[index][subIndex]) {
              if (
                !this.checkSpecialCharacterLogic(data[index][subIndex][subIndex2], format) &&
                dataOption.indexOf(subIndex2) < 0
              ) {
                returnData.push(
                  // "#" +
                  //   (parseInt(index) + 1) +
                  //   " " +
                  //   subIndex +
                  //   " " +
                  //   data[index][subIndex] +
                  //   message
                  { field: subIndex2, msg: `# ${parseInt(index) + 1} ${subIndex2} '${data[index][subIndex][[subIndex2]]}' ${message}` }
                );
              }
            }
          } else {
            if (
              !this.checkSpecialCharacterLogic(data[index][subIndex], format) &&
              dataOption.indexOf(subIndex) < 0
            ) {
              returnData.push(
                // "#" +
                //   (parseInt(index) + 1) +
                //   " " +
                //   subIndex +
                //   " " +
                //   data[index][subIndex] +
                //   message
                { field: subIndex, msg: `# ${parseInt(index) + 1} ${subIndex} '${data[index][subIndex]}' ${message}` }
              );
            }
          }
        }
      } else if (this.checkString(index).length === 0) {
        if (
          !this.checkSpecialCharacterLogic(data[index], format) &&
          dataOption.indexOf(index) < 0
        ) {
          // returnData.push(index + " " + data[index] + message);
          returnData.push(
            { field: index, msg: `${index} '${data[index]}' ${message}` }
          );
        }
      }
    }

    // for (let index in data) {
    // backup
    // let checkFormat = format.test(data[index]);
    // if (checkFormat && dataOption.indexOf(index) < 0) {
    //   // returnData.push(index + message);
    // }
    // }
    return returnData;
  }
  checkSpecialCharacterLogic(specialCharacter, format) {
    let checkFormat = format.test(specialCharacter);
    if (checkFormat) {
      return false;
    }
    return true;
  }
  checkString(data, dataOption = [], message = " need type string only!") {
    //   {name:"sad",detail:""} รูปแบบที่ส่งเข้ามา
    let returnData = [];
    for (let index in data) {
      if (typeof data[index] === "object") {
        for (let subIndex in data[index]) {

          if (typeof data[index][subIndex] === "object") {
            for (let subIndex2 in data[index][subIndex]) {
              if (
                !this.checkStringLogic(data[index][subIndex][subIndex2]) &&
                dataOption.indexOf(subIndex2) < 0
              ) {
                returnData.push(
                  { field: subIndex2, msg: `# ${parseInt(index) + 1} ${subIndex2} '${data[index][subIndex][[subIndex2]]}' ${message}` }
                );
              }
            }
          } else {
            if (
              !this.checkStringLogic(data[index][subIndex]) &&
              dataOption.indexOf(subIndex) < 0
            ) {
              returnData.push(
                { field: subIndex, msg: `# ${parseInt(index) + 1} ${subIndex} '${data[index][subIndex]}' ${message}` }
              );
            }
          }

          // if (
          // !this.checkStringLogic(data[index][subIndex]) &&
          // dataOption.indexOf(subIndex) < 0
          // ) {
          //   returnData.push(
          //     { field: subIndex, msg: `# ${parseInt(index) + 1} ${subIndex} '${data[index][subIndex]}' ${message}` }
          //   );
          // }
        }
      } else {
        if (
          !this.checkStringLogic(data[index]) &&
          dataOption.indexOf(index) < 0
        ) {
          // returnData.push(index + " " + data[index] + message);
          returnData.push(
            { field: index, msg: `${index} '${data[index]}' ${message}` }
          );
        }
      }

      // backup
      // if (typeof data[index] !== "string" && dataOption.indexOf(index) < 0) {
      //   // returnData.push(index + message);
      //   returnData.push(data[index] + message);
      // }
    }

    return returnData;
  }
  checkStringLogic(stringText) {
    if (typeof stringText !== "string") {
      return false;
    }
    return true;
  }

  setValidationErrorData() {
    let returnData = [];
    for (let i = 0; i < arguments.length; ++i) {
      for (let index in arguments[i]) {
        returnData.push(arguments[i][index]);
      }
    }
    return returnData;
  }
  checkFile(file, maxSize = 0, allowFileType = []) {
    let returnData = [];
    if (file == "") {
      returnData.push("Picture can't empty.");
      return false;
    }
    const checkFileTypeArray = file.name.split(".");
    if (
      allowFileType.indexOf(
        checkFileTypeArray[checkFileTypeArray.length - 1]
      ) <= 0
    ) {
      returnData.push("Picture type fail. Please upload type 'jpeg', 'png'!");
    }
    if (file.size > maxSize) {
      returnData.push("Picture type fail. Please upload size less 4mb.");
    }
    return returnData;
  }
  calculateDays(startDate, endDate) {
    const start_date = Moment(startDate, 'YYYY-MM-DD HH:mm:ss');
    const end_date = Moment(endDate, 'YYYY-MM-DD HH:mm:ss');
    const duration = Moment.duration(end_date.diff(start_date));
    const years = duration.years();
    const months = duration.months();
    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    const asSeconds = duration.asSeconds();

    return {
      years: years,
      months: months,
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      asSeconds: asSeconds,
    };
  }

  createDate(value = "", key = "") {
    let dateObject = new Date();
    // if(value !== "" && key !== ""){
    //   let oldDateObject = new Date();
    //   dateObject = Moment(oldDateObject).add(value, key).toDate();
    //   return dateObject;
    // }
    // current date
    // adjust 0 before single digit date
    const date = ("0" + dateObject.getDate()).slice(-2);

    // current month
    const month = ("0" + (dateObject.getMonth() + 1)).slice(-2);

    // current year
    const year = dateObject.getFullYear();

    // current hours
    const hours = dateObject.getHours();

    // current minutes
    const minutes = dateObject.getMinutes();

    // current seconds
    const seconds = dateObject.getSeconds();

    // current milliseconds
    const milliseconds = dateObject.getMilliseconds();

    return {
      dateFormat: year + "-" + month + "-" + date,
      fullFormat: year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds,
      thaiFormat: date + "-" + month + "-" + (year - 543) + " " + hours + ":" + minutes + ":" + seconds,
      year: year.toString(),
      month: month,
      day: date,
      hours: hours.toString(),
      minutes: minutes.toString(),
      seconds: seconds.toString(),
      milliseconds: milliseconds.toString(),
    };
  }
  addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);

    const day = ("0" + result.getDate()).slice(-2);

    // current month
    const month = ("0" + (result.getMonth() + 1)).slice(-2);

    // current year
    const year = result.getFullYear();
    return day + "/" + month + "/" + year;
  }

  addMinutes(min) {
    var result = new Date();
    result.setMinutes(result.getMinutes() + min);

    const day = ("0" + result.getDate()).slice(-2);

    // current month
    const month = ("0" + (result.getMonth() + 1)).slice(-2);

    // current year
    const year = result.getFullYear();

    // current hours
    const hours = result.getHours();

    // current minutes
    const minutes = result.getMinutes();

    // current seconds
    const seconds = result.getSeconds();
    return day + "-" + month + "-" + year + " " + (hours.toString().length === 1 ? "0" + hours : hours) + ":" + (minutes.toString().length === 1 ? "0" + minutes : minutes) + ":" + (seconds.toString().length === 1 ? "0" + seconds : seconds);
  }
}
export default MyFunction;
