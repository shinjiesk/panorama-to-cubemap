import { dom } from "../dom/dom.js";
import fileInfo from "../utilities/fileInfo.js";

// ------------------------------------------------------------
// キューブの各面を表現するクラス
// ------------------------------------------------------------

class CubeFace {
    constructor(faceName) {
        // キューブの各面の名前を表します（例: 'Front', 'Back', 'Left', 'Right', 'Top', 'Bottom'）
        this.faceName = faceName;
        // <a>要素を作成して、それをアンカー要素として保存
        this.anchor = document.createElement("a");
        this.anchor.style.position = "absolute";
        this.anchor.title = faceName;
        // <img>要素を作成して、それを画像要素として保存
        this.img = document.createElement("img");
        this.img.style.filter = "blur(4px)";
        this.anchor.appendChild(this.img);
    }

    // プレビュー画像のURLと位置を設定
    setPreview(url, x, y) {
        this.img.src = url;
        this.anchor.style.left = `${x}px`;
        this.anchor.style.top = `${y}px`;
    }

    // ダウンロードの準備
    setDownload(url) {
        // ダウンロードURLを設定
        this.anchor.href = url;
        // ダウンロードファイル名を生成
        this.anchor.download = `${this.faceName}_${fileInfo.getFileName()}.png`;
        // 画像のフィルターをクリア
        this.img.style.filter = "";
        // ダウンロードファイル名を更新
        this.updateDownloadLinks();
    }

    // ダウンロードファイル名を更新する関数
    updateDownloadLinks() {
        const faces = dom.faces.querySelectorAll("a");
        faces.forEach((face) => {
            const link = document.createElement("a");
            link.href = face.href;
            link.download = face.download;
            link.textContent = face.download;

            // ファイル名の先頭2文字を取得
            const fileId = face.download.slice(0, 2);

            // 対応するIDの子要素にリンクをアペンド
            appendLink(fileId, link);
        });
    }

    // 対応するIDの子要素にリンクをアペンドする関数
    appendLink(fileId, link) {
        const parentElement = document.getElementById(fileId);
        if (parentElement) {
            // 既存の子要素を削除
            parentElement.innerHTML = "";
            // 新しいリンクをアペンド
            parentElement.appendChild(link);
        }
    }
}
export default CubeFace;
