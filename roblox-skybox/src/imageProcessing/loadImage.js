import { dom } from "../dom/dom.js";
import fileInfo from "../utilities/fileInfo.js";
import { processImage } from './processImage.js';

// ------------------------------------------------------------
// 画像をフォームから取得して、ファイル名を表示、画像を表示してから処理を実行する
// ------------------------------------------------------------

dom.imageInput.addEventListener("change", loadImage);

export function loadImage() {
    // フォームから選択されたファイルを取得
    const file = dom.imageInput.files[0];
    if (!file) return;

    // ファイル名と幅と高さを表示する
    displayFileName(file);

    const img = new Image();
    img.src = URL.createObjectURL(file);

    // 画像のロードが完了したら処理を実行する
    img.addEventListener("load", async () => {
        const { width, height } = img;
        dom.canvas.width = width;
        dom.canvas.height = height;
        dom.ctx.drawImage(img, 0, 0);
        const data = dom.ctx.getImageData(0, 0, width, height);
        dom.imagePreview.innerHTML = `<img src="${img.src}" alt="Uploaded Image" width="800" height="400">`;

        processImage(data);
    });
}

// ファイル名と幅と高さを表示する
function displayFileName(file) {
    if (file) {
        // ファイル名を表示する
        dom.fileNameDisplay.textContent = file.name;
        dom.fileNameDisplay.className = "fileNameDisplayClass";
        fileInfo.setFileName(file.name.split(".")[0]);

        // ファイルの幅と高さを表示する
        const img = new Image();
        img.onload = function () {
            dom.fileWidthHeight.textContent = `${this.width} x ${this.height} px`;
        };
        img.src = URL.createObjectURL(file);
    } else {
        // ファイル名と幅と高さをクリアする
        dom.fileNameDisplay.textContent = "";
        dom.fileWidthHeight.textContent = "";
    }
}
