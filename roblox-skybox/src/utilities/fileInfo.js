// fileInfo.js
class FileInfo {
    constructor() {
        this.loadedFileName = "";
    }

    setFileName(fileName) {
        this.loadedFileName = fileName;
    }

    getFileName() {
        return this.loadedFileName;
    }
}

// シングルトンインスタンスを作成
const fileInfo = new FileInfo();

// このインスタンスをエクスポート
export default fileInfo;
