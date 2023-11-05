export const dom = {
    imageInput: document.getElementById("imageInput"),
    dropzone: document.getElementById("dropzone"),
    faces: document.getElementById("faces"),
    generating: document.getElementById("generating"),
    fileNameDisplay: document.getElementById("fileNameDisplay"),
    fileWidthHeight: document.getElementById("fileWidthHeight"),
    errorMessage: document.getElementById("errorMessage"),
    canvas: document.createElement("canvas"),
    imagePreview: document.getElementById("imagePreview"),
};

dom.canvas.willReadFrequently = true;
dom.ctx = dom.canvas.getContext("2d");