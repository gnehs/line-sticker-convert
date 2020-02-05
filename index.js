const sharp = require('sharp')
const PSD = require('psd')
const fs = require('fs')
const path = require('path'); // 引入路徑處理模組
const inputDir = __dirname + "/input/"
const outputDir = __dirname + "/output/"
const tempDir = __dirname + "/temp/"
async function main() {
    fs.readdir(inputDir, async (err, files) => { //讀取資料夾
        if (err) throw err;
        for (let fileName of files) {
            if (!/^(\.)/.test(fileName)) { // 跳過以「.」開頭的檔案   
                try {
                    await parseFile(fileName)
                } catch (e) {
                    console.error(fileName, e)
                }
            }
        }
    })
}
async function parseFile(fileName) {
    let imgData, psdTempFile, fileSaveName
    if (fileName.endsWith('.psd')) {
        let psd = PSD.fromFile(path.resolve(inputDir, fileName))
        psdTempFile = tempDir + Math.random().toString(36).substring(7) + '_temp.png'
        await psd.parse()
        await psd.image.saveAsPng(psdTempFile)
        imgData = sharp(psdTempFile)
    } else {
        imgData = sharp(path.resolve(inputDir, fileName))
    }
    fileSaveName = path.basename(fileName, path.extname(fileName)) + '.png'
    // 縮放大小
    let metadata = await imgData.metadata()
    console.log(`🚂 正在轉換 ${fileName} (${metadata.width}x${metadata.height})`)
    imgData = await imgData.trim().resize(310, 360, {
        fit: 'inside',
        background: {
            r: 0,
            g: 0,
            b: 0,
            alpha: 0
        }
    }).trim().toBuffer()
    imgData = sharp(imgData)

    // 擴張
    metadata = await imgData.metadata()
    imgData = await imgData.extend({
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
    }).toBuffer()
    imgData = sharp(imgData)
    metadata = await imgData.metadata()

    await imgData.toFile(outputDir + fileSaveName);
    if (fileName.endsWith('.psd')) {
        await fs.unlinkSync(psdTempFile);
    }
    console.log(`✅ 轉換完畢 ${fileName} (${metadata.width}x${metadata.height})`)
}
main()