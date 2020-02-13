const fs = require('fs')
const {
    exec
} = require('child_process');
const inputDir = __dirname + "/input/"
async function main() {
    fs.readdir(inputDir, async (err, files) => { //讀取資料夾
        console.time("🕒 轉換耗時")
        if (err) throw err;
        for (let fileName of files) {
            if (!/^(\.)/.test(fileName)) { // 跳過以「.」開頭的檔案   
                try {
                    exec(`node parseFile.js "${fileName}"`, (error, stdout, stderr) => {
                        console.log(stdout)
                    })
                } catch (e) {
                    console.error(fileName, e)
                }
            }
        }
    })
}
main()

process.on('exit', function () {
    console.timeEnd("🕒 轉換耗時")
    console.log('✅ 轉換完畢')
});