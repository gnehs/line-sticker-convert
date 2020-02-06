const sharp = require('sharp')
const PSD = require('psd')
const fs = require('fs')
const path = require('path'); // 引入路徑處理模組
const ProgressBar = require('progress');
//dirs
const inputDir = __dirname + "/input/"
const outputDir = __dirname + "/output/"
const tempDir = __dirname + "/temp/"
//
var bar
async function main() {
    fs.readdir(inputDir, async (err, files) => { //讀取資料夾
        if (err) throw err;
        bar = new ProgressBar('🕒 正在轉換 :file [:bar] :percent :etas', {
            complete: '=',
            incomplete: ' ',
            total: files.length,
            width: 20,
            clear: true
        });
        for (let fileName of files) {
            if (!/^(\.)/.test(fileName)) { // 跳過以「.」開頭的檔案   
                try {
                    bar.tick({
                        file: fileName
                    });
                    await parseFile(fileName)
                } catch (e) {
                    console.error(fileName, e)
                }
            }
        }
        console.log('\n')
        console.log('✅ 轉換完畢')
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

    bar.interrupt(`✅ 轉換完畢 ${fileName} (${metadata.width}x${metadata.height})`);
}
main()