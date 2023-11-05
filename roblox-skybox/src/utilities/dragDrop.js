import { showError, clearError } from '../errorHandling/errorHandling.js';
import { dom } from "../dom/dom.js";
import { loadImage } from '../imageProcessing/loadImage.js';
import fileInfo from "../utilities/fileInfo.js";


// ------------------------------------------------------------
// ドラッグアンドドロップのサポート
// ------------------------------------------------------------
dom.dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dom.dropzone.classList.add("dragging");
});

dom.dropzone.addEventListener("dragleave", () => {
    dom.dropzone.classList.remove("dragging");
});

dom.dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dom.dropzone.classList.remove("dragging");

    // ドロップされたファイルのリストを取得し、最初のファイルをfile変数に格納
    const files = event.dataTransfer.files;
    const file = files?.[0];

    // ドロップされたファイルが画像ファイルであることを確認
    if (file?.type.startsWith("image/")) {
        //ドロップされたファイルを設定
        dom.imageInput.files = event.dataTransfer.files;
        loadImage();
        clearError();
    } else {
        showError("error_not_image");
        displayFileName(file);
    }
});