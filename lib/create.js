const path = require('path')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const chalk = require('chalk')

const Generator = require('./generator')

module.exports = async function (options) {
  const defaultQuestions = [
    {
      name: 'app',
      type: 'list',
      choices: ['ProjectA', 'ProjectB'],
      message: '请选择项目模板:'
    },
    {
      name: "path",
      type: "input",
      message: "请输入目录路径（使用中划线命名规范，.vue文件自动添加至 /src/views/ 路径下）:",
      default() {
        return 'new-page';
      }
    },
    {
      name: "pathName",
      type: "input",
      message: "请输入路由中文标题:"
    }
  ]
  const expressQuestions = [
    {
      name: 'cover',
      type: 'list',
      message: `该目录已存在，是否覆盖？`,
      choices: [
        {
          name: '覆盖',
          value: 'overwrite'
        }, {
          name: `不覆盖，模块名后面追加__copy标识`,
          value: 'rename'
        }, {
          name: '取消',
          value: false
        }
      ],
      when(answers) {
        // 强制创建命令参数
        const { force } = options
        // 需要创建的目录地址
        const targetViewsDir = path.join(process.cwd(), `/apps/${answers.app}/src/views`, answers.path.trim())
        const targetApiDir = path.join(process.cwd(), `/apps/${answers.app}/src/http/api`, answers.path.trim())
        // 目录是否已经存在
        const isExist = fs.existsSync(targetViewsDir) || fs.existsSync(targetApiDir)
        return isExist && !force
      }
    }
  ]

  const answers = await inquirer.prompt([...defaultQuestions, ...expressQuestions])
  if (answers.app !== 'ProjectA') {
    console.log(chalk.red('❌ 暂不支持该项目模板\r\n'))
    return
  }
  if (answers.cover === false) return

  // 创建项目
  const generator = new Generator(answers, options)
  generator.create()
}
