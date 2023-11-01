const CubeMapApp = (() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let loadedFileName = "";

    const mimeType = {
        png: "image/png",
    };

    const dom = {
        imageInput: document.getElementById("imageInput"),
        dropzone: document.getElementById("dropzone"),
        faces: document.getElementById("faces"),
        generating: document.getElementById("generating"),
        fileNameDisplay: document.getElementById("fileNameDisplay"),
        fileWidthHeight: document.getElementById("fileWidthHeight"),
        errorMessage: document.getElementById("errorMessage"),
    };

    const facePositions = {
        Rt: { x: 1, y: 1 },
        Lf: { x: 3, y: 1 },
        Ft: { x: 2, y: 1 },
        Bk: { x: 0, y: 1 },
        Up: { x: 1, y: 0 },
        Dn: { x: 1, y: 2 },
    };

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
        const faces = dom.faces.querySelectorAll("a");
        faces.forEach((face) => {
            const link = document.createElement("a");
            link.href = face.href;
            link.download = face.download;
            link.textContent = face.download;
            // link.style.display = "block";
    
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
    


    class CubeFace {
        constructor(faceName) {
            this.faceName = faceName;
            this.anchor = document.createElement("a");
            this.anchor.style.position = "absolute";
            this.anchor.title = faceName;
            this.img = document.createElement("img");
            this.img.style.filter = "blur(4px)";
            this.anchor.appendChild(this.img);

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
            this.anchor.download = `${this.faceName}_${loadedFileName}.png`;
            this.img.style.filter = "";
            updateDownloadFileName();
        }

        showFaceName(faceName) {
            this.label = document.createElement("div");
            this.label.textContent = faceName;
            this.label.classList.add("cube-face-label");
            this.label.style.zIndex = "2";
            this.anchor.appendChild(this.label);
        }

        hideFaceName() {
            if (this.label) {
                this.anchor.removeChild(this.label);
                this.label = null;
            }
        }
    }

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

    function removeChildren(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }

    const settings = {
        cubeRotation: new Input("cubeRotation", loadImage),
    };

    dom.imageInput.addEventListener("change", loadImage);

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
        const file = files?.[0];
        if (file?.type.startsWith("image/")) {
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
            dom.fileNameDisplay.className = "fileNameDisplayClass";
            loadedFileName = file.name.split(".")[0];
            displayFileDimensions(file);
        } else {
            clearFileName();
        }
    }

    function displayFileDimensions(file) {
        const img = new Image();
        img.onload = function () {
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
