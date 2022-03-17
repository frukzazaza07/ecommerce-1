import { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";
import PriceCard from "./PriceCard";

let logo =
  "https://tradingplatforms.com/pt/wp-content/uploads/sites/27/2021/04/dogecoin-logo3.svg";

export default function App() {


  useEffect(() => { // เรียนกใช้ตอน component dismount หน้าจะแปลว่าโหลดหน้าเว็บเสร็จ
    async function getDogecoinPrice() {
      const { data } = await axios.get(
        "https://nitinr-cors.herokuapp.com/https://api.wazirx.com/api/v2/tickers/dogeusdt"
      );
      setTicker(data.ticker);
    }
    getDogecoinPrice();
    const interval = setInterval(() => getDogecoinPrice(), 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="App">
      <img src={logo} width="150" height="150" alt="dogecoin" />
      <h1 className="title">Live Dogecoin Price</h1>
      <h5 className="subtitle">Dogecoin to the moon</h5>
      <div className="prices-container">
        <PriceCard type="low" price={ticker.low} />
        <PriceCard type="high" price={ticker.high} />
        <PriceCard type="current" price={ticker.last} />
      </div>
    </div>
  );
}
