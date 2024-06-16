function clamp(x, min, max) {
    return Math.min(max, Math.max(x, min));
}

function mod(x, n) {
    return ((x % n) + n) % n;
}

function readIndex(width) {
    return (x, y) => 4 * (y * width + x);
}

function createKernelResample(read, write, filterSize, kernel) {
    const { width, height, data } = read;
    const getIndex = readIndex(width);

    const twoFilterSize = 2 * filterSize;
    const xMax = width - 1;
    const yMax = height - 1;
    const xKernel = new Array(twoFilterSize);
    const yKernel = new Array(twoFilterSize);

    return (xFrom, yFrom, to) => {
        const xl = Math.floor(xFrom);
        const yl = Math.floor(yFrom);
        const xStart = xl - filterSize + 1;
        const yStart = yl - filterSize + 1;

        for (let i = 0; i < twoFilterSize; i++) {
            xKernel[i] = kernel(xFrom - (xStart + i));
            yKernel[i] = kernel(yFrom - (yStart + i));
        }

        for (let channel = 0; channel < 3; channel++) {
            let q = 0;

            for (let i = 0; i < twoFilterSize; i++) {
                const y = yStart + i;
                const yClamped = clamp(y, 0, yMax);
                let p = 0;
                for (let j = 0; j < twoFilterSize; j++) {
                    const x = xStart + j;
                    const index = getIndex(clamp(x, 0, xMax), yClamped);
                    p += data[index + channel] * xKernel[j];
                }
                q += p * yKernel[i];
            }

            write.data[to + channel] = Math.round(q);
        }
    };
}

function createCopyPixelLanczos(read, write) {
    const filterSize = 5;
    const kernel = (x) => {
        if (x === 0) {
            return 1;
        } else {
            const xp = Math.PI * x;
            return (
                (filterSize * Math.sin(xp) * Math.sin(xp / filterSize)) /
                (xp * xp)
            );
        }
    };

    return createKernelResample(read, write, filterSize, kernel);
}

const orientations = {
    Rt: (out, x, y) => {
        out.x = -1;
        out.y = -x;
        out.z = -y;
    },
    Lf: (out, x, y) => {
        out.x = 1;
        out.y = x;
        out.z = -y;
    },
    Ft: (out, x, y) => {
        out.x = x;
        out.y = -1;
        out.z = -y;
    },
    Bk: (out, x, y) => {
        out.x = -x;
        out.y = 1;
        out.z = -y;
    },
    Up: (out, x, y) => {
        out.x = -y;
        out.y = -x;
        out.z = 1;
    },
    Dn: (out, x, y) => {
        out.x = y;
        out.y = -x;
        out.z = -1;
    },
};

function renderFace({
    data: readData,
    face,
    rotation,
    maxWidth = Infinity,
}) {
    const faceWidth = Math.min(maxWidth, readData.width / 4);
    const faceHeight = faceWidth;

    const cube = {};
    const orientation = orientations[face];

    const writeData = new ImageData(faceWidth, faceHeight);

    const copyPixel = createCopyPixelLanczos(readData, writeData);

    for (let x = 0; x < faceWidth; x++) {
        for (let y = 0; y < faceHeight; y++) {
            const to = 4 * (y * faceWidth + x);

            // fill alpha channel
            writeData.data[to + 3] = 255;

            // get position on cube face
            orientation(
                cube,
                (2 * (x + 0.5)) / faceWidth - 1,
                (2 * (y + 0.5)) / faceHeight - 1
            );

            // project cube face onto unit sphere by converting cartesian to spherical coordinates
            const r = Math.sqrt(cube.x * cube.x + cube.y * cube.y + cube.z * cube.z);
            const lon = mod(Math.atan2(cube.y, cube.x) + rotation, 2 * Math.PI);
            const lat = Math.acos(cube.z / r);

            copyPixel(
                (readData.width * lon) / Math.PI / 2 - 0.5,
                (readData.height * lat) / Math.PI - 0.5,
                to
            );
        }
    }

    postMessage(writeData);
}

onmessage = function ({ data }) {
    renderFace(data);
};



// function clamp(x, min, max) {
//     return Math.min(max, Math.max(x, min));
// }

// function mod(x, n) {
//     return ((x % n) + n) % n;
// }

// function readIndex(width) {
//     return (x, y) => 4 * (y * width + x);
// }

// function createCopyPixelNearest(read, write) {
//     const { width, height, data } = read;
//     const getIndex = readIndex(width);

//     return (xFrom, yFrom, to) => {
//         const nearest = getIndex(
//             clamp(Math.round(xFrom), 0, width - 1),
//             clamp(Math.round(yFrom), 0, height - 1)
//         );

//         for (let channel = 0; channel < 3; channel++) {
//             write.data[to + channel] = data[nearest + channel];
//         }
//     };
// }

// function createCopyPixelBilinear(read, write) {
//     const { width, height, data } = read;
//     const getIndex = readIndex(width);

//     return (xFrom, yFrom, to) => {
//         const xl = clamp(Math.floor(xFrom), 0, width - 1);
//         const xr = clamp(Math.ceil(xFrom), 0, width - 1);
//         const xf = xFrom - xl;

//         const yl = clamp(Math.floor(yFrom), 0, height - 1);
//         const yr = clamp(Math.ceil(yFrom), 0, height - 1);
//         const yf = yFrom - yl;

//         const p00 = getIndex(xl, yl);
//         const p10 = getIndex(xr, yl);
//         const p01 = getIndex(xl, yr);
//         const p11 = getIndex(xr, yr);

//         for (let channel = 0; channel < 3; channel++) {
//             const p0 = data[p00 + channel] * (1 - xf) + data[p10 + channel] * xf;
//             const p1 = data[p01 + channel] * (1 - xf) + data[p11 + channel] * xf;
//             write.data[to + channel] = Math.ceil(p0 * (1 - yf) + p1 * yf);
//         }
//     };
// }

// function createKernelResample(read, write, filterSize, kernel) {
//     const { width, height, data } = read;
//     const getIndex = readIndex(width);

//     const twoFilterSize = 2 * filterSize;
//     const xMax = width - 1;
//     const yMax = height - 1;
//     const xKernel = new Array(twoFilterSize);
//     const yKernel = new Array(twoFilterSize);

//     return (xFrom, yFrom, to) => {
//         const xl = Math.floor(xFrom);
//         const yl = Math.floor(yFrom);
//         const xStart = xl - filterSize + 1;
//         const yStart = yl - filterSize + 1;

//         for (let i = 0; i < twoFilterSize; i++) {
//             xKernel[i] = kernel(xFrom - (xStart + i));
//             yKernel[i] = kernel(yFrom - (yStart + i));
//         }

//         for (let channel = 0; channel < 3; channel++) {
//             let q = 0;

//             for (let i = 0; i < twoFilterSize; i++) {
//                 const y = yStart + i;
//                 const yClamped = clamp(y, 0, yMax);
//                 let p = 0;
//                 for (let j = 0; j < twoFilterSize; j++) {
//                     const x = xStart + j;
//                     const index = getIndex(clamp(x, 0, xMax), yClamped);
//                     p += data[index + channel] * xKernel[j];
//                 }
//                 q += p * yKernel[i];
//             }

//             write.data[to + channel] = Math.round(q);
//         }
//     };
// }

// function createCopyPixelBicubic(read, write) {
//     const b = -0.5;
//     const kernel = (x) => {
//         x = Math.abs(x);
//         const x2 = x * x;
//         const x3 = x * x * x;
//         return x <= 1
//             ? (b + 2) * x3 - (b + 3) * x2 + 1
//             : b * x3 - 5 * b * x2 + 8 * b * x - 4 * b;
//     };

//     return createKernelResample(read, write, 2, kernel);
// }

// function createCopyPixelLanczos(read, write) {
//     const filterSize = 5;
//     const kernel = (x) => {
//         if (x === 0) {
//             return 1;
//         } else {
//             const xp = Math.PI * x;
//             return (
//                 (filterSize * Math.sin(xp) * Math.sin(xp / filterSize)) /
//                 (xp * xp)
//             );
//         }
//     };

//     return createKernelResample(read, write, filterSize, kernel);
// }

// const orientations = {
//     Rt: (out, x, y) => {
//         out.x = -1;
//         out.y = -x;
//         out.z = -y;
//     },
//     Lf: (out, x, y) => {
//         out.x = 1;
//         out.y = x;
//         out.z = -y;
//     },
//     Ft: (out, x, y) => {
//         out.x = x;
//         out.y = -1;
//         out.z = -y;
//     },
//     Bk: (out, x, y) => {
//         out.x = -x;
//         out.y = 1;
//         out.z = -y;
//     },
//     Up: (out, x, y) => {
//         out.x = -y;
//         out.y = -x;
//         out.z = 1;
//     },
//     Dn: (out, x, y) => {
//         out.x = y;
//         out.y = -x;
//         out.z = -1;
//     },
// };

// function renderFace({
//     data: readData,
//     face,
//     rotation,
//     interpolation,
//     maxWidth = Infinity,
// }) {
//     const faceWidth = Math.min(maxWidth, readData.width / 4);
//     const faceHeight = faceWidth;

//     const cube = {};
//     const orientation = orientations[face];

//     const writeData = new ImageData(faceWidth, faceHeight);

//     const copyPixel =
//         interpolation === "linear"
//             ? createCopyPixelBilinear(readData, writeData)
//             : interpolation === "cubic"
//             ? createCopyPixelBicubic(readData, writeData)
//             : interpolation === "lanczos"
//             ? createCopyPixelLanczos(readData, writeData)
//             : createCopyPixelNearest(readData, writeData);

//     for (let x = 0; x < faceWidth; x++) {
//         for (let y = 0; y < faceHeight; y++) {
//             const to = 4 * (y * faceWidth + x);

//             // fill alpha channel
//             writeData.data[to + 3] = 255;

//             // get position on cube face
//             orientation(
//                 cube,
//                 (2 * (x + 0.5)) / faceWidth - 1,
//                 (2 * (y + 0.5)) / faceHeight - 1
//             );

//             // project cube face onto unit sphere by converting cartesian to spherical coordinates
//             const r = Math.sqrt(cube.x * cube.x + cube.y * cube.y + cube.z * cube.z);
//             const lon = mod(Math.atan2(cube.y, cube.x) + rotation, 2 * Math.PI);
//             const lat = Math.acos(cube.z / r);

//             copyPixel(
//                 (readData.width * lon) / Math.PI / 2 - 0.5,
//                 (readData.height * lat) / Math.PI - 0.5,
//                 to
//             );
//         }
//     }

//     postMessage(writeData);
// }

// onmessage = function ({ data }) {
//     renderFace(data);
// };






// // function clamp(x, min, max) {
// //     return Math.min(max, Math.max(x, min));
// // }

// // function mod(x, n) {
// //     return ((x % n) + n) % n;
// // }

// // function copyPixelNearest(read, write) {
// //     const { width, height, data } = read;
// //     const readIndex = (x, y) => 4 * (y * width + x);

// //     return (xFrom, yFrom, to) => {
// //         const nearest = readIndex(
// //             clamp(Math.round(xFrom), 0, width - 1),
// //             clamp(Math.round(yFrom), 0, height - 1)
// //         );

// //         for (let channel = 0; channel < 3; channel++) {
// //             write.data[to + channel] = data[nearest + channel];
// //         }
// //     };
// // }

// // function copyPixelBilinear(read, write) {
// //     const { width, height, data } = read;
// //     const readIndex = (x, y) => 4 * (y * width + x);

// //     return (xFrom, yFrom, to) => {
// //         const xl = clamp(Math.floor(xFrom), 0, width - 1);
// //         const xr = clamp(Math.ceil(xFrom), 0, width - 1);
// //         const xf = xFrom - xl;

// //         const yl = clamp(Math.floor(yFrom), 0, height - 1);
// //         const yr = clamp(Math.ceil(yFrom), 0, height - 1);
// //         const yf = yFrom - yl;

// //         const p00 = readIndex(xl, yl);
// //         const p10 = readIndex(xr, yl);
// //         const p01 = readIndex(xl, yr);
// //         const p11 = readIndex(xr, yr);

// //         for (let channel = 0; channel < 3; channel++) {
// //             const p0 =
// //                 data[p00 + channel] * (1 - xf) + data[p10 + channel] * xf;
// //             const p1 =
// //                 data[p01 + channel] * (1 - xf) + data[p11 + channel] * xf;
// //             write.data[to + channel] = Math.ceil(p0 * (1 - yf) + p1 * yf);
// //         }
// //     };
// // }

// // // performs a discrete convolution with a provided kernel
// // function kernelResample(read, write, filterSize, kernel) {
// //     const { width, height, data } = read;
// //     const readIndex = (x, y) => 4 * (y * width + x);

// //     const twoFilterSize = 2 * filterSize;
// //     const xMax = width - 1;
// //     const yMax = height - 1;
// //     const xKernel = new Array(4);
// //     const yKernel = new Array(4);

// //     return (xFrom, yFrom, to) => {
// //         const xl = Math.floor(xFrom);
// //         const yl = Math.floor(yFrom);
// //         const xStart = xl - filterSize + 1;
// //         const yStart = yl - filterSize + 1;

// //         for (let i = 0; i < twoFilterSize; i++) {
// //             xKernel[i] = kernel(xFrom - (xStart + i));
// //             yKernel[i] = kernel(yFrom - (yStart + i));
// //         }

// //         for (let channel = 0; channel < 3; channel++) {
// //             let q = 0;

// //             for (let i = 0; i < twoFilterSize; i++) {
// //                 const y = yStart + i;
// //                 const yClamped = clamp(y, 0, yMax);
// //                 let p = 0;
// //                 for (let j = 0; j < twoFilterSize; j++) {
// //                     const x = xStart + j;
// //                     const index = readIndex(clamp(x, 0, xMax), yClamped);
// //                     p += data[index + channel] * xKernel[j];
// //                 }
// //                 q += p * yKernel[i];
// //             }

// //             write.data[to + channel] = Math.round(q);
// //         }
// //     };
// // }

// // function copyPixelBicubic(read, write) {
// //     const b = -0.5;
// //     const kernel = (x) => {
// //         x = Math.abs(x);
// //         const x2 = x * x;
// //         const x3 = x * x * x;
// //         return x <= 1
// //             ? (b + 2) * x3 - (b + 3) * x2 + 1
// //             : b * x3 - 5 * b * x2 + 8 * b * x - 4 * b;
// //     };

// //     return kernelResample(read, write, 2, kernel);
// // }

// // function copyPixelLanczos(read, write) {
// //     const filterSize = 5;
// //     const kernel = (x) => {
// //         if (x === 0) {
// //             return 1;
// //         } else {
// //             const xp = Math.PI * x;
// //             return (
// //                 (filterSize * Math.sin(xp) * Math.sin(xp / filterSize)) /
// //                 (xp * xp)
// //             );
// //         }
// //     };

// //     return kernelResample(read, write, filterSize, kernel);
// // }

// // const orientations = {
// //     Rt: (out, x, y) => {
// //         out.x = -1;
// //         out.y = -x;
// //         out.z = -y;
// //     },
// //     Lf: (out, x, y) => {
// //         out.x = 1;
// //         out.y = x;
// //         out.z = -y;
// //     },
// //     Ft: (out, x, y) => {
// //         out.x = x;
// //         out.y = -1;
// //         out.z = -y;
// //     },
// //     Bk: (out, x, y) => {
// //         out.x = -x;
// //         out.y = 1;
// //         out.z = -y;
// //     },
// //     Up: (out, x, y) => {
// //         out.x = -y;
// //         out.y = -x;
// //         out.z = 1;
// //     },
// //     Dn: (out, x, y) => {
// //         out.x = y;
// //         out.y = -x;
// //         out.z = -1;
// //     },
// // };

// // function renderFace({
// //     data: readData,
// //     face,
// //     rotation,
// //     interpolation,
// //     maxWidth = Infinity,
// // }) {
// //     const faceWidth = Math.min(maxWidth, readData.width / 4);
// //     const faceHeight = faceWidth;

// //     const cube = {};
// //     const orientation = orientations[face];

// //     const writeData = new ImageData(faceWidth, faceHeight);

// //     const copyPixel =
// //         interpolation === "linear"
// //             ? copyPixelBilinear(readData, writeData)
// //             : interpolation === "cubic"
// //             ? copyPixelBicubic(readData, writeData)
// //             : interpolation === "lanczos"
// //             ? copyPixelLanczos(readData, writeData)
// //             : copyPixelNearest(readData, writeData);

// //     for (let x = 0; x < faceWidth; x++) {
// //         for (let y = 0; y < faceHeight; y++) {
// //             const to = 4 * (y * faceWidth + x);

// //             // fill alpha channel
// //             writeData.data[to + 3] = 255;

// //             // get position on cube face
// //             // cube is centered at the origin with a side length of 2
// //             orientation(
// //                 cube,
// //                 (2 * (x + 0.5)) / faceWidth - 1,
// //                 (2 * (y + 0.5)) / faceHeight - 1
// //             );

// //             // project cube face onto unit sphere by converting cartesian to spherical coordinates
// //             const r = Math.sqrt(
// //                 cube.x * cube.x + cube.y * cube.y + cube.z * cube.z
// //             );
// //             const lon = mod(Math.atan2(cube.y, cube.x) + rotation, 2 * Math.PI);
// //             const lat = Math.acos(cube.z / r);

// //             copyPixel(
// //                 (readData.width * lon) / Math.PI / 2 - 0.5,
// //                 (readData.height * lat) / Math.PI - 0.5,
// //                 to
// //             );
// //         }
// //     }

// //     postMessage(writeData);
// // }

// // onmessage = function ({ data }) {
// //     renderFace(data);
// // };
