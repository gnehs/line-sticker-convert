const sharp = require('sharp')
const PSD = require('psd')
const fs = require('fs')
const path = require('path'); // 引入路徑處理模組
const inputDir = __dirname + "/input/"
const outputDir = __dirname + "/output/"
async function main() {
    fs.readdir(inputDir, async (err, files) => { //讀取資料夾
        if (err) throw err;
        let tasklist = []
        for (let fileName of files) {
            if (!/^(\.)/.test(fileName)) { // 跳過以「.」開頭的檔案   
                tasklist.push(parseFile(fileName))
            }

        }
        Promise.all(tasklist);
    })
}
async function parseFile(fileName) {
    let imgData, psdTempFile, fileSaveName
    if (fileName.endsWith('.psd')) {
        let psd = PSD.fromFile(path.resolve(inputDir, fileName))
        psdTempFile = inputDir + Math.random().toString(36).substring(7); + '_temp.png'
        await psd.parse();
        await psd.image.saveAsPng(psdTempFile)
        imgData = sharp(psdTempFile)
    } else {
        imgData = sharp(path.resolve(inputDir, fileName))
    }
    fileSaveName = path.basename(fileName, path.extname(fileName)) + '.png'
    // 縮放大小
    let metadata = await imgData.metadata()
    console.log(`🚂 正在轉換 ${fileName} (${metadata.width}x${metadata.height})`)
    let resizeOptions = {
        height: 310
    }
    if (metadata.width > metadata.height)
        resizeOptions = {
            width: 360
        }
    imgData = await imgData.trim().resize(resizeOptions).toBuffer()
    imgData = sharp(imgData)

    // 擴張
    metadata = await imgData.metadata()
    await imgData
        .extend({
            top: 5,
            bottom: metadata.height % 2 == 0 ? 5 : 4,
            left: metadata.width % 2 == 0 ? 5 : 4,
            right: 5,
            background: {
                r: 0,
                g: 0,
                b: 0,
                alpha: 0
            }
        })
        .toFile(outputDir + fileSaveName);
    if (fileName.endsWith('.psd')) {
        await fs.unlinkSync(psdTempFile);
    }
    console.log(`✅ 轉換完畢 ${fileName}`)
}
main()