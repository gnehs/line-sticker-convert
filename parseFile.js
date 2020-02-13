const sharp = require('sharp')
const PSD = require('psd')
const fs = require('fs')
const path = require('path'); // 引入路徑處理模組
//dirs
const inputDir = __dirname + "/input/"
const outputDir = __dirname + "/output/"
const tempDir = __dirname + "/temp/"
async function parseFile(fileName) {
    let imgData, psdTempFile, fileSaveName = path.basename(fileName, path.extname(fileName)) + '.png'
    if (fileName.endsWith('.psd')) {
        let psd = PSD.fromFile(path.resolve(inputDir, fileName))
        psdTempFile = tempDir + Math.random().toString(36).substring(7) + '_temp.png'
        await psd.parse()
        await psd.image.saveAsPng(psdTempFile)
        imgData = sharp(psdTempFile)
    } else {
        imgData = sharp(path.resolve(inputDir, fileName))
    }
    // 縮放大小
    let metadata = await imgData.metadata()
    imgData = sharp(await imgData.trim().resize(370 - 10, 320 - 10, {
        fit: 'inside'
    }).toBuffer())

    // 擴張
    metadata = await imgData.metadata()
    imgData = sharp(await imgData.extend({
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
    }).toBuffer())
    metadata = await imgData.metadata()

    await imgData.toFile(outputDir + fileSaveName);
    if (fileName.endsWith('.psd')) {
        await fs.unlinkSync(psdTempFile);
    }
    console.log(`✅ 轉換完畢 ${fileName} (${metadata.width}x${metadata.height})`);
}
parseFile(process.argv[2])