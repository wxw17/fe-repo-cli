const path = require('path')
const inquirer = require('inquirer')
const fs = require('fs-extra')

const repoTemplates = require('../repos')
const Generator = require('./generator')

module.exports = async function (options) {
  const defaultQuestions = [
    {
      name: 'repo',
      type: 'list',
      choices: repoTemplates.map(item => item.name),
      message: '请选择项目模板'
    },
    {
      name: "projectName",
      type: "input",
      message: "请输入项目名称",
      default() {
        return 'my-app';
      },
    },
    /* {
      name: "description",
      type: "input",
      message: "请输入项目描述",
    },
    {
      name: "author",
      type: "input",
      message: "请输入作者名称",
    }, */
  ]
  const expressQuestions = [
    {
      name: 'cover',
      type: 'list',
      message: `该项目在当前目录已存在，是否覆盖？`,
      choices: [
        {
          name: '覆盖',
          value: 'overwrite'
        }, {
          name: `不覆盖，项目名后面追加__copy标识`,
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
        const targetDir = path.join(process.cwd(), answers.projectName)
        // 目录是否已经存在
        const isExist = fs.existsSync(targetDir)
        return isExist && !force
      }
    }
  ]

  const answers = await inquirer.prompt([...defaultQuestions, ...expressQuestions])
  if (answers.cover === false) return

  // 创建项目
  const generator = new Generator(answers, options)
  generator.create()
}
