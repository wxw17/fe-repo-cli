const chalk = require('chalk')
const figlet = require('figlet')
const ora = require('ora')
// const inquirer = require('inquirer')
const downloadGitRepo = require('download-git-repo')
const path = require('path')
const fs = require('fs-extra')

const repoTemplates = require('../repos')

class Generator {
  /* constructor(name, targetDir) {
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
  } */
  constructor(answers, options = {}) {
    // 用户输入信息
    this.answers = answers;
    // 命令参数
    this.options = options;
  }

  /**
   * 选择项目模版
   * @returns 模板名称
   */
  /* async chooseRepo() {
    // 获取可用模板名称
    const repos = repoTemplates.map(item => item.name);
    // 用户选择要下载的模板
    const { repo } = await inquirer.prompt({
      name: 'repo',
      type: 'list',
      choices: repos,
      message: '请选择你需要的项目模板'
    })
    return repo;
  } */

  /**
   * 校验目录有效性
   */
  async checkDirExist() {
    const { cover } = this.answers
    const { force } = this.options
    if (cover === 'overwrite' || force) {
      // 强制创建
      console.log(`\r\nRemoving...`)
      await fs.remove(targetAir)
    } else if (cover === 'rename') {
      // 重命名
      this.answers.projectName = `${this.answers.projectName}_copy`
    }
  }

  /**
   * 下载远程模板
   * @param {*} repo 模版名称
   * @returns 是否下载成功
   */
  async downloadRepo() {
    const preMsg = `正在构建项目${this.answers.projectName}...`
    const failMsg = '项目构建失败，请重试！'

    const spinner = ora(preMsg).start()

    return new Promise((resolve, reject) => {
      const targetDir = path.join(process.cwd(), this.answers.projectName)
      const { repositoryUrl } = repoTemplates.find(item => item.name === this.answers.repo)
      // 开始克隆代码
      downloadGitRepo(`direct:${repositoryUrl}`, targetDir, { clone: true }, (err) => {
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
   * 创建模板函数
   * @核心创建逻辑
   * 1）获取模板名称
   * 2）下载模板到模板目录
   * 3）安装成功后打印提示信息
   */
  async create(){
    // const repo = await this.chooseRepo()
    await this.checkDirExist()
    const isSuccess = await this.downloadRepo()
    isSuccess && this.showTipsLog()
  }
}

module.exports = Generator;