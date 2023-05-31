import React, { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

//adding tool bars for our docs editor
const toolbar = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["blockquote", "code-block"],
  ["clean"],
];

const TextEditor = () => {
  const { id: documentId } = useParams(); //getting uuid from url using params
  const [skt, setSkt] = useState(); // manageing socket connenctions using usestate
  const [quill, setQuill] = useState(); //its to manage contnents of our editor

  //this useeffect is used for connect with our backend to socketserver when page was opened
  useEffect(() => {
    const s = io("http://localhost:3030");
    setSkt(s);
    return () => {
      s.disconnect();
    };
  }, []);

  //
  useEffect(() => {
    if (skt == null || quill == null) return; // returnig directly if c=socket and quill have no datas

    //loading document once using socket
    skt.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });
    skt.emit("get-document", documentId);
  }, [skt, quill, documentId]); //thes are triggers

  //sending datas to backed to store on mongodb the editor contents in a 2s intervel
  useEffect(() => {
    if (skt == null || quill == null) return;
    const interval = setInterval(() => {
      skt.emit("save-document", quill.getContents());
      return () => {
        clearInterval(interval);
      };
    }, 2000);
  }, [skt, quill]);

  //sending all the datas which are changing only of the editor
  useEffect(() => {
    if (skt == null || quill == null) return;
    const handler = (delta, oldDelta, source) => {
      console.log(source);
      if (source !== "user") return; //this condition is to ensure that content wont get in infinite loop or dcause sideeffects from programital conflicts
      skt.emit("send-changes", delta);
    };
    quill.on("text-change", handler);
    return () => {
      quill.off("text-change");
    };
  }, [skt, quill]);

  //it update the quill contents to all editors
  useEffect(() => {
    if (skt == null || quill == null) return;
    const handler = (delta) => {
      quill.updateContents(delta);
    };
    skt.on("receive-changes", handler);
    return () => {
      skt.off("receive-changes");
    };
  }, [skt, quill]);

  //configuring Quill Component here we use callback because it do the cleanup and also the work of useRef
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, { theme: "snow", modules: { toolbar } });
    q.disable();
    q.setText("Loading...");
    setQuill(q);
  }, []);
  return <div ref={wrapperRef} className="container"></div>;
};

export default TextEditor;
