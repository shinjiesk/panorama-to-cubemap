const CubeMapApp = (() => {
    // 画像データの描画と操作に使用されるHTML canvas要素とその2Dコンテキストを作成します。
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let loadedFileName = "";

    // 特定のIDを持つHTML要素をラップし、その要素が変更されたときに指定されたコールバック関数を呼び出します。
    class Input {
        constructor(id, onChange) {
            this.input = document.getElementById(id);
            this.input.addEventListener("change", onChange);
            this.valueAttrib =
                this.input.type === "checkbox" ? "checked" : "value";
        }

        get value() {
            return this.input[this.valueAttrib];
        }
    }

    function updateDownloadFileName() {
        removeChildren(dom.downloadFileName);  // Clear existing links
    
        const faces = dom.faces.querySelectorAll('a');
        faces.forEach(face => {
            // Get the last two characters from the filename (excluding the extension)
            const faceIndicator = face.download.slice(-6, -4);
            let positionText = "";
            switch(faceIndicator) {
                case "Rt":
                    positionText = "Right:";
                    break;
                case "Lf":
                    positionText = "Left:";
                    break;
                case "Ft":
                    positionText = "Front:";
                    break;
                case "Bk":
                    positionText = "Back:";
                    break;
                case "Up":
                    positionText = "Up:";
                    break;
                case "Dn":
                    positionText = "Down:";
                    break;
            }
    
            // Create a new div to hold the position text
            const positionDiv = document.createElement('div');
            positionDiv.textContent = positionText;
            dom.downloadFileName.appendChild(positionDiv);
    
            // Create the download link
            const link = document.createElement('a');
            link.href = face.href;
            link.download = face.download;
            link.textContent = face.download;
            link.className = 'downloadLinkButton';  
            link.style.display = 'block';  // Display links in a list
            dom.downloadFileName.appendChild(link);
        });
    }
    
    







    // キューブマップの各面を表現し、プレビューとダウンロードのリンクを作成します。
    class CubeFace {
        constructor(faceName) {
            this.faceName = faceName;
            this.anchor = document.createElement("a");
            this.anchor.style.position = "absolute";
            this.anchor.title = faceName;
            this.img = document.createElement("img");
            this.img.style.filter = "blur(4px)";
            this.anchor.appendChild(this.img);

            // マウスホバーイベントリスナーの追加
            this.anchor.addEventListener("mouseover", () => {
                this.img.style.border = "2px solid white";
                this.anchor.style.zIndex = "1";
                this.showFaceName(faceName);
            });
            this.anchor.addEventListener("mouseout", () => {
                this.img.style.border = "";
                this.anchor.style.zIndex = "";
                this.hideFaceName();
            });
            
        }

        setPreview(url, x, y) {
            this.img.src = url;
            this.anchor.style.left = `${x}px`;
            this.anchor.style.top = `${y}px`;
        }

        setDownload(url) {
            this.anchor.href = url;
            this.anchor.download = `${loadedFileName}_${this.faceName}.png`;
            this.img.style.filter = "";
            updateDownloadFileName();
        }

        
        showFaceName(faceName) {
            this.label = document.createElement("div");
            this.label.textContent = faceName;
            this.label.style.position = "absolute";
            this.label.style.background = "rgba(0, 0, 0, 0.5)";
            this.label.style.color = "white";
            this.label.style.padding = "2px 5px";
            this.label.style.borderRadius = "3px";
            this.label.style.top = "10px";
            this.label.style.left = "10px";
            this.label.style.zIndex = "2";
            this.anchor.appendChild(this.label);
        }

        // 新しいメソッドを追加してfaceNameを非表示にする
        hideFaceName() {
            if (this.label) {
                this.anchor.removeChild(this.label);
                this.label = null;
            }
        }
    }



    const mimeType = {
        png: "image/png",
    };

    // 画像データの処理
    async function getDataURL(imgData) {
        canvas.width = imgData.width;
        canvas.height = imgData.height;
        ctx.putImageData(imgData, 0, 0);
        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => resolve(URL.createObjectURL(blob)),
                mimeType["png"],
                0.92
            );
        });
    }

    // DOMの操作
    function removeChildren(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }

    // アプリケーションで使用される主要なDOM要素への参照を保持します。
    const dom = {
        imageInput: document.getElementById("imageInput"),
        dropzone: document.getElementById("dropzone"),
        faces: document.getElementById("faces"),
        generating: document.getElementById("generating"),
        fileNameDisplay: document.getElementById("fileNameDisplay"),
        fileWidthHeight: document.getElementById("fileWidthHeight"),
        errorMessage: document.getElementById("errorMessage"),
        downloadFileName: document.getElementById("downloadFileName"),
    };

    // キューブの回転を制御するInputインスタンスを保持します。
    const settings = {
        cubeRotation: new Input("cubeRotation", loadImage),
    };

    // キューブマップの各面の位置を定義します。
    const facePositions = {
        skyboxRt: { x: 1, y: 1 },
        skyboxLf: { x: 3, y: 1 },
        skyboxFt: { x: 2, y: 1 },
        skyboxBk: { x: 0, y: 1 },
        skyboxUp: { x: 1, y: 0 },
        skyboxDn: { x: 1, y: 2 },
    };

    // ファイル選択のイベントリスナー
    dom.imageInput.addEventListener("change", loadImage);

    // New drag and drop event listeners
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

        const files = event.dataTransfer.files;
        if (files.length > 1) {
            showError("error_multiple_files");
            clearFileName();
            return;
        }

        const file = files[0];
        if (file && file.type.startsWith("image/")) {
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

    function clearFileName() {
        dom.fileNameDisplay.textContent = "";
        dom.fileWidthHeight.textContent = ""; 
    }


    document.addEventListener("DOMContentLoaded", clearError);

    // アップロードされた画像を読み込み、processImage関数を呼び出して画像データを処理します。
    function loadImage() {
        const file = getFile();
        if (!file) return;
        displayFileName(file);

        const img = new Image();
        img.src = URL.createObjectURL(file);

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

    function getFile() {
        return dom.imageInput.files[0];
    }

    function displayFileName(file) {
        if (file) {
            dom.fileNameDisplay.textContent = file.name;
            dom.fileNameDisplay.className = 'fileNameDisplayClass'; 
            loadedFileName = file.name.split(".")[0];
            displayFileDimensions(file); 
        } else {
            clearFileName();
        }
    }
    

    function displayFileDimensions(file) {
        const img = new Image();
        img.onload = function() {
            dom.fileWidthHeight.textContent = `${this.width} x ${this.height} px`;
        };
        img.src = URL.createObjectURL(file);
    }

    let finished = 0;
    let workers = [];

    function processImage(data) {
        removeChildren(dom.faces);
        dom.generating.style.visibility = "visible";
        workers.forEach((worker) => worker.terminate());

        Object.entries(facePositions).forEach(([faceName, position]) => {
            renderFace(data, faceName, position);
        });
    }

    // 指定されたキューブ面をレンダリングし、プレビューとダウンロードリンクを作成します。
    // Web Workerを使用して、画像変換処理を非同期に実行します。
    function renderFace(data, faceName, position) {
        const face = new CubeFace(faceName);
        dom.faces.appendChild(face.anchor);

        const options = {
            data,
            face: faceName,
            rotation: (Math.PI * settings.cubeRotation.value) / 180,
            interpolation: "lanczos",
        };

        const worker = new Worker("js/convert.js");

        const setDownload = async ({ data: imageData }) => {
            const url = await getDataURL(imageData);
            face.setDownload(url);

            finished++;
            if (finished === 6) {
                dom.generating.style.visibility = "hidden";
                finished = 0;
                workers = [];
            }
        };

        const setPreview = async ({ data: imageData }) => {
            const x = imageData.width * position.x;
            const y = imageData.height * position.y;
            const url = await getDataURL(imageData);
            face.setPreview(url, x, y);

            worker.onmessage = setDownload;
            worker.postMessage(options);
        };

        worker.onmessage = setPreview;
        worker.postMessage({
            ...options,
            maxWidth: 200,
            interpolation: "linear",
        });

        workers.push(worker);
    }

    document
        .getElementById("downloadAllLink")
        .addEventListener("click", function (event) {
            event.preventDefault();
            downloadAllImagesAsZip();
        });

    return {
        loadImage,
    };
})();
