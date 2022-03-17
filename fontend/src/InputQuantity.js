import { useRef, useState, useEffect, createRef, Component } from "react";

function Option({ quantity }) {
  let option = [];
  if (quantity > 10) quantity = 10;
  for (let i = 1; i <= quantity; i++) {
    if (i === 10) {
      option.push({ value: i, label: `${i}+` });
    } else {
      option.push({ value: i, label: `${i}` });
    }
  }
  return (
    option.map((val, index) => (
      <option key={index} value={val.value}>{val.label}</option>
    ))
  )
}

export default function InputQuantity({ quantityInput, handleQuantity, setQuantityInput, subCartId, inventoryId }) {
  /*
    setQuantityInput={(value, test) => {console.log(test); handleQuantityInput(index, value)}}
    setQuantityInput("1", "test"); <<< ตัวนี้ที่ถูกส่ง Prob จากหน้า mycart มา จะมาทั้ง function บรรทัดบน (22) เลย 
    ถ้าเราเรียกใช้มันก็จะทำงานตั้งแต่ตรง (value, test) แล้วไปเรีกใช้ => {console.log(test); handleQuantityInput(index, value)}}
    หน้า Mycart จะเหมือน call back function ตรง tag InputQuantity
  */
  let [quantityInputShow, setQuantityInputShow] = useState(false);
  const quantityInputRef = useRef();
  function handleQuantityValue(value) {
    const re = /^[0-9\b]+$/;
    if (re.test(value)) setQuantityInput(value, subCartId, inventoryId);
    if (parseInt(value) >= 10) {
      setQuantityInputShow(true);
    } else {
      setQuantityInputShow(false);
    }
    if (parseInt(value) <= 0) setQuantityInput("1", subCartId, inventoryId);
  }
  useEffect(() => {
    // handleQuantityValue(quantityInput);
    if (parseInt(quantityInput) >= 10) {
      setQuantityInputShow(true);
    } else {
      setQuantityInputShow(false);
    }
  });
  return (
    <>
      <label>Quantity</label>
      <input autoFocus ref={quantityInputRef} type="text" className={`${quantityInputShow === true ? "d-block" : "d-none"}`} value={quantityInput} onChange={(e) => { handleQuantityValue(e.target.value); }} />
      <select value={quantityInput} className={`${quantityInputShow === false ? "d-block" : "d-none"}`} onChange={(e) => { handleQuantityValue(e.target.value); }}>
        <Option quantity={10} />
      </select>
    </>
  )
}