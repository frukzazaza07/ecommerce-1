import { useRef, useState, useEffect, createRef, Component } from "react";
import ServerUrl from './ServerUrl.js';
import Resizer from "react-image-file-resizer";
import { useSelector, useDispatch } from 'react-redux';
import MyFunction from './myLib/MyFunction';
import axios from "axios";
import { axiosConfig } from './axiosConfig.js';
import io from 'socket.io-client'
import "./mobileBankingInputFile.css"
import "./cssRoot.css"
var md5 = require('md5');

export default function MobileBankingInputFile({ totalPayments }) {
    const imageUploadWrap = useRef(null);
    const fileUploadImage = useRef(null);
    const fileUploadContent = useRef(null);
    const imageTitle = useRef(null);
    const fileUploadInput = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null)
    const [preview, setPreview] = useState(null)

    // create a preview as a side effect, whenever selected file is changed
    useEffect(() => {
        // if (!selectedFile) {
        //     setPreview(undefined)
        //     return
        // }

        // const objectUrl = URL.createObjectURL(selectedFile)
        // setPreview(objectUrl)

        // return () => URL.revokeObjectURL(objectUrl)
    }, [selectedFile])

    async function onSelectFile(e) {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedFile(null)
            return
        }
        // I've kept this example simple by using the first image instead of multiple
        const newImage = await resizeFile(e.target.files[0])
        setSelectedFile(newImage)
    }

    const resizeFile = (file) =>
        new Promise((resolve) => {
            Resizer.imageFileResizer(
                file,
                500,
                500,
                "PNG",
                100,
                0,
                (uri) => {
                    resolve(uri);
                },
                "base64"
            );
        });

    function handleDrop(e) {
        // e.preventDefault()
        // e.stopPropagation()
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onSelectFile(e);
            e.dataTransfer.clearData();
        }
    }
    return (
        <div className="file-upload">
            <div className={(selectedFile !== null ? "d-none" : "image-upload-wrap")} onDrop={(e) => { handleDrop(e) }}>
                <input className="file-upload-input" type='file' onChange={(e) => { onSelectFile(e) }} accept="image/*" />

                <div className="drag-text">
                    <h3>ลากไฟล์รูปภาพหรือคลิกที่นี่</h3>
                </div>
            </div>
            <div className={`${(selectedFile !== null ? "file-upload-container" : "d-none")}`}>
                <div className="preview-container">
                    {selectedFile != null
                        ?
                        <img src={selectedFile} alt="" className="file-upload-image" />
                        :
                        ""
                    }
                </div>
                <div className="image-title-wrap">
                    <button type="button" className="remove-image" onClick={(e) => { setSelectedFile(null) }}>ลบรูป</button>
                </div>
            </div>
        </div >
    )
}







