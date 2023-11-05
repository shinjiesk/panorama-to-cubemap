const CubeMapApp = (() => {
    // DOM要素の参照を保持するオブジェクト
    const dom = {
        imageInput: document.getElementById("imageInput"),
        dropzone: document.getElementById("dropzone"),
        faces: document.getElementById("faces"),
        generating: document.getElementById("generating"),
        fileNameDisplay: document.getElementById("fileNameDisplay"),
        fileWidthHeight: document.getElementById("fileWidthHeight"),
        errorMessage: document.getElementById("errorMessage"),
    };

    // キャンバスと2Dコンテキストの作成
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // ロードされたファイル名を保持する変数
    let loadedFileName = "";

    // ------------------------------------------------------------
    // 画像をフォームから取得して、ファイル名を表示、画像を表示してから処理を実行する
    // ------------------------------------------------------------
    dom.imageInput.addEventListener("change", loadImage);

    function loadImage() {
        // フォームから選択されたファイルを取得
        const file = dom.imageInput.files[0];
        if (!file) return;

        // ファイル名と幅と高さを表示する
        displayFileName(file);

        const img = new Image();

        img.src = URL.createObjectURL(file);

        // 画像のロードが完了したら処理を実行する
        img.addEventListener("load", () => {
            const { width, height } = img;
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, width, height);

            const imagePreview = document.getElementById("imagePreview");
            imagePreview.innerHTML = `<img src="${img.src}" alt="Uploaded Image" width="800" height="400">`;

            processImage(data);
        });
    }

    // ファイル名と幅と高さを表示する
    function displayFileName(file) {
        if (file) {
            // ファイル名を表示する
            dom.fileNameDisplay.textContent = file.name;
            dom.fileNameDisplay.className = "fileNameDisplayClass";
            loadedFileName = file.name.split(".")[0];
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
    function processImage(data) {
        // 6面を消す
        dom.faces.innerHTML = '';

        // 処理中の表示を表示する
        dom.generating.style.visibility = "visible";

        // 既存のワーカーを全て終了させる
        workers.forEach((worker) => worker.terminate());

        // 各面をレンダリングする
        Object.entries(facePositions).forEach(([faceName, position]) => {
            renderFace(data, faceName, position);
        });
    }

    // -------------------------
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

    // 画像データをDataURLに変換する非同期関数
    function getDataURL(imgData) {
        canvas.width = imgData.width;
        canvas.height = imgData.height;
        ctx.putImageData(imgData, 0, 0);
        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => resolve(URL.createObjectURL(blob)),
                "image/png",
                0.92
            );
        });
    }


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
            this.anchor.download = `${this.faceName}_${loadedFileName}.png`;
            // 画像のフィルターをクリア
            this.img.style.filter = "";

            // ダウンロードファイル名を更新
            const faces = dom.faces.querySelectorAll("a");
            faces.forEach((face) => {
                const link = document.createElement("a");
                link.href = face.href;
                link.download = face.download;
                link.textContent = face.download;

                // ファイル名の先頭2文字を取得
                const fileId = face.download.slice(0, 2);

                // 対応するIDの子要素にリンクをアペンド
                const parentElement = document.getElementById(fileId);
                if (parentElement) {
                    // 既存の子要素を削除
                    while (parentElement.firstChild) {
                        parentElement.removeChild(parentElement.firstChild);
                    }
                    // 新しいリンクをアペンド
                    parentElement.appendChild(link);
                }
            });
        }
    }


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

    function showError(messageKey) {
        dom.errorMessage.textContent = lang[currentLanguage][messageKey];
    }

    function clearError() {
        dom.errorMessage.textContent = "";
    }

    document.addEventListener("DOMContentLoaded", clearError);

    // ------------------------------------------------------------


    return {
        loadImage,
    };
})();
