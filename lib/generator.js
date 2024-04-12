const chalk = require('chalk')
const figlet = require('figlet')
const ora = require('ora')
const inquirer = require('inquirer')
const downloadGitRepo = require('download-git-repo')

const repoTemplates = require('../repos')

class Generator {
  constructor(name, targetDir) {
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
  }

  /**
   * 选择项目模版
   * @returns 模板名称
   */
  async chooseRepo() {
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
  }

  /**
   * 下载远程模板
   * @param {*} repo 模版名称
   * @returns
   */
  async downloadRepo(repo) {
    const preMsg = `正在构建项目${this.name}...`
    const failMsg = '项目构建失败，请重试！'

    const spinner = ora(preMsg).start()

    return new Promise((resolve, reject) => {
      const { repositoryUrl } = repoTemplates.find(item => item.name === repo)
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
    console.log(`cd ${chalk.cyan(this.name)}`)
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
    const repo = await this.chooseRepo()
    const isSuccess = await this.downloadRepo(repo)
    isSuccess && this.showTipsLog()
  }
}

module.exports = Generator;