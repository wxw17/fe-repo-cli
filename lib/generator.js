const chalk = require('chalk')
const figlet = require('figlet')
const ora = require('ora')
const path = require('path')
const fs = require('fs-extra')

class Generator {
  constructor(answers, options = {}) {
    // 用户输入信息
    this.answers = answers
    // 命令参数
    this.options = options
    // 创建位置
    this.setTargetDir()
  }

  /**
   * 设置创建目录
   */
  setTargetDir() {
    this.answers.path = this.answers.path.trim().replace(/^\/|\/$/g, '')
    this.targetViewsDir = path.join(process.cwd(), `/apps/${this.answers.app}/src/views`, this.answers.path)
    this.targetApiDir = path.join(process.cwd(), `/apps/${this.answers.app}/src/http/api`, this.answers.path)
  }

  /**
   * 校验目录有效性
   */
  async checkDirExist() {
    const { cover } = this.answers
    const { force } = this.options
    if (cover === 'overwrite' || force) {
      // 强制创建
      await fs.remove(this.targetViewsDir)
      await fs.remove(this.targetApiDir)
    } else if (cover === 'rename') {
      // 重命名
      this.answers.path = `${this.answers.path}__copy`
      this.setTargetDir()
      // 重命名后的目录是否也存在
      fs.existsSync(this.targetViewsDir) && await fs.remove(this.targetViewsDir)
      fs.existsSync(this.targetApiDir) && await fs.remove(this.targetApiDir)
    }
  }

  /**
   * 输出代码块模板
   * @returns 是否下载成功
   */
  async downloadRepo() {
    const preMsg = `正在构建目录${this.answers.path}`
    const failMsg = '项目构建失败，请重试！'

    const spinner = ora(preMsg).start()
    return new Promise(async (resolve, reject) => {
      try {
        // 获取所选项目的所有模板文件
        const fileList = await this.getFileList(path.join(__dirname, `../repos/${this.answers.app}`))
        fileList?.forEach((path) => {
          const fileName = path.split('/').pop()
          const outputPath = path.includes(`/${this.answers.app}/api`) ? this.targetApiDir
            : path.includes(`/${this.answers.app}/views`) ? this.targetViewsDir
            : ''
          // 替换模板并输出文件
          this.replaceTemplate(path, `${outputPath}/${fileName}`)
        })

        spinner.succeed()
        resolve(true)
      } catch (err) {
        spinner.fail(failMsg)
        reject(err)
      }
    })
  }

  /**
   * 获取指定目录的所有文件列表
   * @param {*} dirPath 指定目录
   * @returns 文件列表
   */
  async getFileList(dirPath) {
    let entries
    let fileList = []
    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true })
    } catch (err) {
      throw Error('Error reading directory:', err)
    }

    for (let entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      if (entry.isDirectory()) {
        const res = await this.getFileList(fullPath)
        fileList.push(...res)
      } else {
        // 打印文件的目录路径和文件名
        fileList.push(fullPath)
      }
    }
    return fileList
  }

  /**
   * 替换模板文件
   * @param {string} templatePath 模板文件路径
   * @param {string} outputPath 输出文件路径
   */
  replaceTemplate(templatePath, outputPath) {
    // 中划线命名转下划线
    const toSnakeCase = (str) => {
      return str.replace(/-/g, '_')
    }
    // 中划线命名转大驼峰
    const toPascalCase = (str) => {
      return str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')
    }
    // 中划线命名转小驼峰
    const toCamelCase = (str) => {
      const words = str.split('-')
      const capitalizedWords = words.map((word, index) => {
        if (index === 0) {
          return word
        }
        const capitalized = word.charAt(0).toUpperCase() + word.slice(1)
        return capitalized
      })
      return capitalizedWords.join('')
    }

    const dirname = outputPath.split('/')[outputPath.split('/').length - 2]
    const snakeCaseStr = toSnakeCase(dirname)
    const pascalCaseStr = toPascalCase(dirname)
    const camelCaseStr = toCamelCase(dirname)

    this.createDirPath(outputPath)
    const content = fs.readFileSync(templatePath, 'utf8')
    const newContent = content.replace(/api\/xxx/g, `api/${this.answers.path}`)
      .replace(/api_xxx/g, 'api_' + snakeCaseStr)
      .replace(/xxx/g, camelCaseStr)
      .replace(/Xxx/g, pascalCaseStr)
    fs.writeFileSync(outputPath, newContent, 'utf8')
  }

  /**
   * 生成指定目录
   * @param {string} filePath 文件路径
   */
  createDirPath(filePath) {
    const dirname = path.dirname(filePath)
    if (fs.existsSync(dirname)) {
      return true
    }
    this.createDirPath(dirname)
    fs.mkdirSync(dirname)
  }

  /**
   * 打印提示信息
   */
  showTipsLog() {
    console.log('\r\n' + figlet.textSync('success', {
      font: 'Ghost',
      width: 150,
      whitespaceBreak: true
    }))
    console.log(`\r\n ${chalk.green('Successfully created project!')} \r\n`)
  }

  /**
   * 创建模板函数：
   * 1）判断目录是否存在
   * 2）下载模板到对应目录
   * 3）成功后打印提示信息
   */
  async create(){
    await this.checkDirExist()
    const isSuccess = await this.downloadRepo()
    isSuccess && this.showTipsLog()
  }
}

module.exports = Generator