import { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector, useDispatch } from 'react-redux';
import ImageAddToCart from './ImageAddToCart';
import { fas } from '@fortawesome/fontawesome-free-solid'
import { HashRouter as Router, Route, Link, NavLink, BrowserRouter} from 'react-router-dom';
import UserIsLogin, {getDataInCookie} from './UserIsLogin.js';
import "./header.css"
function LiInline({children, text, myClass, linkTo, onMouseOver = "", onMouseOut = "" }){
    return(
        onMouseOver !== "" || onMouseOut !== "" ?
        <li className={`nav-menu-item ${myClass}`}  onMouseEnter={onMouseOver} onMouseLeave={onMouseOut}>
                <Link to={linkTo}>{text} {children}</Link>
        </li>
        :
        <li className={`nav-menu-item ${myClass}`}>
                <Link to={linkTo}>{text} {children}</Link>
        </li>
    )
}

function UlInline({children}){
    return(
        <ul className="nav-menu-list">
            {children}
        </ul>
    )
}

function HoverMenu({children, hoverStatus, styles, refs, onMouseOver, onMouseOut}){
    return(
        <div ref={refs} className={`hover-menu-container ${hoverStatus === true ? "showHoverMenu" : "hideHoverMenu"}`} style={styles} onMouseEnter={onMouseOver} onMouseLeave={onMouseOut}>
            <div className="hover-menu-wrap">
                {children}
            </div>
        </div>
    )
}

function HoverMenuItem({refs, styles, fakeData}){
    return(
        <div ref={refs} className="hover-menu-item-container" style={styles}>
             {
                fakeData.map((value, index) => 
                (
                    <div key={value.categoryId} className="hover-menuitem-wrap">
                        <div className="hover-menu-item-head">
                            <h1>{value.header}</h1>
                        </div>
                        <div className="hover-menu-item-body">
                            {
                                value.data.map((value, dataIndex) =>
                                (
                                    <Link to="/" key={dataIndex}>{value}</Link>
                                )
                                )
                                
                            }
                        </div>
                    </div>
                )
                )
            }
        </div>
    )
}

function ProMotion({styles, fakeData}){
    return (
        <div className="promotion-container" style={styles}>
            <div className="promotion-wrap">
                {
                    fakeData.map((value, index) =>
                        (
                            <div key={value.categoryId} className="promotion-list">
                                <img src={value.img} alt="" style={{width: "100%"}} />
                            </div>
                        ) 
                    )
                }
                
            </div>
        </div>
    )
}

function calHoverMenuHeight(navbarHeight){
    const windowSizes = updateWindowDimensions();
    const navHeight = navbarHeight;
    const currentHeight = windowSizes.height - navHeight + 12;
    let style = {
        height: `${currentHeight}`,
    }
    return style;
    // console.log(windowSizes);
}

function updateWindowDimensions() {
    const windowSizes = {
      width: window.innerWidth, 
      height: window.innerHeight
    };
    return windowSizes;
}

function hoverAnimation(animationName, from, to){
    let keyframes =`@keyframes ${animationName} { 0% { height: ${from}px; } 25% { height: ${(to / 3)}px;} 100% { height: ${to}px; } }`;
    let style = {
        animation: `${animationName} .4s linear forwards`,
      };
    let styleSheet = document.styleSheets[0];
      styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
      return style;
}

function StickyHeader({ children, sticky=false, className, ...rest }){
    const [isSticky, setIsSticky] = useState(false)
    const ref = useRef()
    
    // mount 
    useEffect(()=>{
      const cachedRef = ref.current,
            observer = new IntersectionObserver(
              ([e]) => setIsSticky(e.intersectionRatio < 1),
              {threshold: [1]}
            )
  
      observer.observe(cachedRef)
      console.log(observer)
      // unmount
      return function(){
        observer.unobserve(cachedRef)
      }
    }, [])
    
    return (
      <header className={className + (isSticky ? " isSticky" : "")} ref={ref} {...rest}>
        {children}
        {console.log(isSticky)}
      </header>
    )
  }

export default function MyHeader(...rest) {
    const countProductInCart = useSelector((state) => state.counter.countProductInCart); 
    let [userData, setUserData] = useState(getDataInCookie("userData"));
    let [hover,setHover] = useState(false);
    let [checkHoverSuccess,setCheckHoverSuccess] = useState();
    let [hoverMenuLeftWidth,setHoverMenuLeftWidth] = useState(100);
    let [hoverMenuRightWidth,setHoverMenuRightWidth] = useState(100);
    let [promotionFakeData,setPromotionFakeData] = useState([]);
    let [hoverMunuFakeData,setHoverMunuFakeData] = useState([]);
    const navbarRef = useRef(null);
    const hoverMenuRef = useRef(null);
    const hoverMenuItemRef = useRef(null);
    let hoverMenuItemHeight;
    const [NavbarHeight, setNavbarHeight] = useState(0);
    useEffect(() => {
        window.removeEventListener('resize', updateWindowDimensions);
        updateWindowDimensions(); 
        
        setNavbarHeight(navbarRef.current.offsetHeight);
        
    }, [])
    // useEffect(() => {
    //     setUserData(userDatas);
    // })

    const setHeight = calHoverMenuHeight(NavbarHeight); // height ของ window
    const menuHeight = (setHeight.height); 
    if(hoverMenuItemRef.current !== null){
        hoverMenuItemHeight = (hoverMenuItemRef.current.offsetHeight + 20) + "px" ;
    }
    

    function handleMenuHover(animationName, heightCal, hoverMenuRef){
        let from, to = "";
        let currentHoverMenuHeight = "";

        if(hoverMenuRef.current !== null){
            currentHoverMenuHeight = hoverMenuRef.current.offsetHeight;
            // currentHoverMenuHeight = hoverMenuRef.current.offsetHeight + "px";
        }
        
        // setCheckHoverSuccess(false);
        if(animationName === "hide"){
            from = currentHoverMenuHeight;
            to = 0;
            // to = "0px";
            setCheckHoverSuccess(hoverAnimation(animationName, from, to))
        }
        if(animationName === "show"){
            from = currentHoverMenuHeight;
            to = heightCal;
            setCheckHoverSuccess(hoverAnimation(animationName, from, to))
        }
    }

    const promotionFakeDataF = [
        {
            header: "ห้องครัว",
            categoryId: 1,
            img: "https://i.pinimg.com/564x/27/6b/45/276b456d79c9326f69fdaeedcfa93d7d.jpg",
        },
        {
            header: "ของใช้",
            categoryId: 2,
            img: "https://i.pinimg.com/564x/27/6b/45/276b456d79c9326f69fdaeedcfa93d7d.jpg",
        },
    ];

    const hoverMunuFakeDataF = [
        {
            header: "ห้องครัว",
            categoryId: 1,
            data: [
                "ห้องครัว1",
                "ห้องครัว2",
                "ห้องครัว3",
                "ห้องครัว4",
                "ห้องครัว5",
            ]
        },
        {
            header: "ของใช้",
            categoryId: 2,
            data: [
                "ของใช้1",
                "ของใช้2",
                "ของใช้3",
            ]
        },
        {
            header: "ห้องนั่งเล่น",
            categoryId: 3,
            data: [
                "ห้องนั่งเล่น1",
                "ห้องนั่งเล่น2",
                "ห้องนั่งเล่น3",
                "ห้องนั่งเล่น4",
            ]
        },
        {
            header: "ห้องนอน",
            categoryId: 4,
            data: [
                "ห้องนอน1",
                "ห้องนอน2",
                "ห้องนอน3",
                "ห้องนอน4",
                "ห้องนอน5",
            ]
        },
        {
            header: "ห้องน้ำ",
            categoryId: 5,
            data: [
                "ห้องน้ำ1",
                "ห้องน้ำ2",
            ]
        },
        {
            header: "ห้องเชือด",
            categoryId: 6,
            data: [
                "ห้องเชือด1",
                "ห้องเชือด2",
            ]
        },
    ]

    const giftFakeData = [
        {
            header: "คูปองเงินสด",
            categoryId: 1,
            data: [
                "คูปองเงินสด1",
                "คูปองเงินสด2",
            ]
        },
        {
            header: "บัตรกำนัน",
            categoryId: 2,
            data: [
                "บัตรกำนัน1",
                "บัตรกำนัน2",
            ]
        },
        {
            header: "ส่วนลดสมาชิก",
            categoryId: 3,
            data: [
                "ส่วนลดสมาชิก1",
                "ส่วนลดสมาชิก2",
                "ส่วนลดสมาชิก3",
            ]
        },
        {
            header: "ส่วนลดวันพิเศษ",
            categoryId: 4,
            data: [
                "ส่วนลดวันพิเศษ1",
            ]
        },
];

    const [stickyMenuStyle, setStickyMenuStyle] = useState({})
    const stickyMenuRef = useRef()
    const navbarSecond = useRef()
    // mount 
    useEffect(()=>{
        const navbarSecondHeight = navbarSecond.current.offsetHeight;
        let returnStyle = {top: `${navbarSecondHeight}px`}
        setStickyMenuStyle(returnStyle)
    }, [])

    return(
        <>
         {/* <header ref={navbarRef} className="navbar-container"> */}
            {/* <div className="navbar-wrap"> */}
                <div ref={navbarRef} className="navbar-flex navbar-first-container navbar-padding ">
                    <div className="navbar-first-left text-align-left">
                        <UlInline>
                            <LiInline linkTo="/home" text="FAQ"  />
                            <LiInline linkTo="/home" text="Services" />
                            <LiInline linkTo="/home" text="Careers" />
                            <LiInline linkTo="/home" text="Affiliate" />
                        </UlInline>
                    </div>
                    <div className="navbar-first-right text-align-right">
                        <UlInline>
                            <LiInline linkTo="/home" text="ICON" />
                            <LiInline linkTo="/home" text="Language" />
                        </UlInline>
                    </div>
                </div>
                <div ref={navbarSecond} className="navbar-flex navbar-second-container navbar-padding ">
                    <div className="navbar-second-left text-align-left">
                        <UlInline>
                            <LiInline linkTo="/home" text="LOGO" />
                            <LiInline linkTo="/home" text="Search" />
                            <LiInline linkTo="/home" text="Expert Support" />
                        </UlInline>
                    </div>
                    <div className="navbar-second-right text-align-right">
                        <UlInline>
                            { userData !== null && userData.isLogin === true ? <UserIsLogin /> : <LiInline linkTo="/login" text="Login" />}
                            
                            <LiInline linkTo="/my-cart" text="" myClass="shopping-cart-icon">
                                <span>{ countProductInCart }</span>
                                <FontAwesomeIcon icon={['fa', 'shopping-cart']} />
                                <ImageAddToCart />
                            </LiInline>
                        </UlInline>
                    </div>
                </div>
                <div ref={stickyMenuRef} className="navbar-flex navbar-third-container navbar-padding" style={stickyMenuStyle}>
                    <div className="navbar-third-left text-align-left">
                        <UlInline>
                            <LiInline linkTo="/home" text={`Categories`} onMouseOver={() => {handleMenuHover("show", menuHeight, hoverMenuRef); setHoverMenuLeftWidth(55); setHoverMenuRightWidth(45); setHoverMunuFakeData(hoverMunuFakeDataF); setPromotionFakeData(promotionFakeDataF)}} onMouseOut={() => {handleMenuHover("hide", menuHeight, hoverMenuRef);}}>
                                <FontAwesomeIcon icon={['fas', 'angle-down']} />
                            </LiInline>
                            <LiInline linkTo="/home" text="Gifts" onMouseOver={() => { handleMenuHover("show", menuHeight, hoverMenuRef); setHoverMenuLeftWidth(70); setHoverMenuRightWidth(30); setHoverMunuFakeData(giftFakeData); }} onMouseOut={() => {handleMenuHover("hide", menuHeight, hoverMenuRef);}}>
                                <FontAwesomeIcon icon={['fas', 'angle-down']} />
                            </LiInline>
                            <LiInline linkTo="/home" text="Sale" />
                            <LiInline linkTo="/home" text="About" onMouseOver={() => {handleMenuHover("show", menuHeight, hoverMenuRef); setHoverMenuLeftWidth(55); setHoverMenuRightWidth(45)}} onMouseOut={() => {handleMenuHover("hide", menuHeight, hoverMenuRef);}}>
                                <FontAwesomeIcon icon={['fas', 'angle-down']} />
                            </LiInline>
                            <LiInline linkTo="/home" text="Contact" />
                        </UlInline>
                    </div>
                    <div className="navbar-third-right text-align-right">
                        <UlInline>
                            <LiInline linkTo="/home" text="Help" />
                            <LiInline linkTo="/home" text="Shipping & Returns" />
                            <LiInline linkTo="/home" text="Gift Card" />
                        </UlInline>
                    </div>
                    <HoverMenu refs={hoverMenuRef} hoverStatus={hover} styles={checkHoverSuccess} onMouseOver={() => {handleMenuHover("show", menuHeight, hoverMenuRef)}} onMouseOut={() => {handleMenuHover("hide", menuHeight, hoverMenuRef)}}>
                        <HoverMenuItem refs={hoverMenuItemRef} styles={{width: `${hoverMenuLeftWidth}%`}} fakeData={hoverMunuFakeData} />
                        <ProMotion styles={{width: `${hoverMenuRightWidth}%`}} fakeData={promotionFakeData} />
                    </HoverMenu>
                </div>
            {/* </div> */}
         {/* </header> */}
        </>
    )
}