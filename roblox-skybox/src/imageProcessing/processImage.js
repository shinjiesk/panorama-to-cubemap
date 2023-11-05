import { dom } from "../dom/dom.js";
import CubeFace from "../cubeMapProcessing/CubeFace.js";
import { getDataURL } from "../utilities/utilities.js";

// ------------------------------------------------------------
// 新しい画像がロードされるたびにキューブマップの各面をクリーンアップし、処理を開始し、レンダリングする
// ------------------------------------------------------------

let finished = 0;
let workers = [];

// キューブマップの各面の位置を定義するオブジェクト
const facePositions = {
    Rt: { x: 1, y: 1 },
    Lf: { x: 3, y: 1 },
    Ft: { x: 2, y: 1 },
    Bk: { x: 0, y: 1 },
    Up: { x: 1, y: 0 },
    Dn: { x: 1, y: 2 },
};

// 画像データを処理する関数
export function processImage(data) {
    // 6面を消す
    dom.faces.innerHTML = "";

    // 処理中の表示を表示する
    dom.generating.style.visibility = "visible";

    // 既存のワーカーを全て終了させる
    workers.forEach((worker) => worker.terminate());

    // 各面をレンダリングする
    Object.entries(facePositions).forEach(([faceName, position]) => {
        renderFace(data, faceName, position);
    });
}

// 各面をレンダリングする
function renderFace(data, faceName, position) {
    // CubeFaceクラスの新しいインスタンスを作成
    const face = new CubeFace(faceName);

    // dom.faces要素の子としてface.anchor要素を追加
    dom.faces.appendChild(face.anchor);

    // Web Workerに渡すオプションを定義
    // 画像データ、面の名前、回転、および補間方法を指定
    const options = {
        data,
        face: faceName,
        rotation: 0, // (Math.PI * settings.cubeRotation.value) / 180,
        interpolation: "lanczos",
    };

    // Web Workerインスタンスを作成し、js/convert.jsをロード
    const worker = new Worker("js/convert.js");

    // Web Workerからの応答を処理し、ダウンロードリンクを設定
    const setDownload = async ({ data: imageData }) => {
        const url = await getDataURL(imageData);

        // ダウンロードリンクを設定
        face.setDownload(url);

        // すべての面がレンダリングされたことを確認し、処理中の表示を消す
        finished++;
        if (finished === 6) {
            dom.generating.style.visibility = "hidden";
            finished = 0;
            workers = [];
        }
    };

    // Web Workerからの最初の応答を処理し、プレビュー画像を設定
    const setPreview = async ({ data: imageData }) => {
        const x = imageData.width * position.x;
        const y = imageData.height * position.y;
        const url = await getDataURL(imageData);

        // プレビュー画像を設定
        face.setPreview(url, x, y);

        worker.onmessage = setDownload;
        worker.postMessage(options);
    };

    // Web Workerにメッセージを送信し、setPreview関数を応答ハンドラとして設定
    worker.onmessage = setPreview;
    worker.postMessage({
        ...options,
        maxWidth: 200,
        interpolation: "linear",
    });

    // 新しいWeb Workerインスタンスをworkers配列に追加
    // (後で全てのWeb Workerインスタンスを終了できるように)
    workers.push(worker);
}
