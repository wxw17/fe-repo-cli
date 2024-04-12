const chalk = require('chalk')
const figlet = require('figlet')
const ora = require('ora')
const path = require('path')
const fs = require('fs-extra')
const downloadGitRepo = require('download-git-repo')

const repoTemplates = require('../repos')

class Generator {
  constructor(answers, options = {}) {
    // 用户输入信息
    this.answers = answers;
    // 命令参数
    this.options = options;
    // 创建位置
    this.targetDir = path.join(process.cwd(), this.answers.projectName)
  }

  /**
   * 校验目录有效性
   */
  async checkDirExist() {
    const { cover } = this.answers
    const { force } = this.options
    if (cover === 'overwrite' || force) {
      // 强制创建
      await fs.remove(this.targetDir)
    } else if (cover === 'rename') {
      // 重命名
      this.answers.projectName = `${this.answers.projectName}_copy`
      this.targetDir = path.join(process.cwd(), this.answers.projectName)
      // 重命名后的目录是否也存在
      const isExist = fs.existsSync(this.targetDir)
      isExist && await fs.remove(this.targetDir)
    }
  }

  /**
   * 下载远程模板
   * @returns 是否下载成功
   */
  async downloadRepo() {
    const preMsg = `正在构建项目${this.answers.projectName}...`
    const failMsg = '项目构建失败，请重试！'

    const spinner = ora(preMsg).start()

    return new Promise((resolve, reject) => {
      const { repositoryUrl } = repoTemplates.find(item => item.name === this.answers.repo)
      // 开始克隆代码
      downloadGitRepo(`direct:${repositoryUrl}`, this.targetDir, { clone: true }, (err) => {
        if (err) {
          spinner.fail(failMsg)
          reject(err)
          return false
        }
        spinner.succeed()
        resolve(true)
      })
    })
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
    console.log(`cd ${chalk.cyan(this.answers.projectName)}`)
    console.log('npm install')
    console.log('npm run dev')
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