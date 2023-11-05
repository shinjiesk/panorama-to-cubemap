const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

export async function getDataURL(imgData) {
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
