
function writeFile(path:string, content:string){
  const fs = require('fs')

  fs.writeFile(path, content, (err: any) => {
    if (err) {
      console.error(err)
      return
    }
    //文件写入成功。
  })


  // fs.close()
}

function readFile(path:string){
  const fs = require('fs')

  try {
    const data = fs.readFileSync(path, 'utf8')
    return data
  } catch (err) {
    console.error(err)
  }
}

function readLines(path:string,split:string="\n"):string[]{
  let content = readFile(path)
  return content.split(split)
}

 function fileExsits(path:string){
  const fs = require('fs')

  return fs.existsSync(path);
}
 function appendFile(path:string, line:string){
  const fs = require('fs')

  fs.appendFile(path, line, (err: any) => {
    if (err) {
      console.error(err)
      return
    }})

}

export {
  readFile, writeFile, fileExsits, appendFile
}
const fileUtils = {
  readFile,
  writeFile,
  fileExsits,
  appendFile: appendFile, readLines
}
export default fileUtils