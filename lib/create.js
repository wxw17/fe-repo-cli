const path = require('path')
const inquirer = require('inquirer')
const fs = require('fs-extra')

const repoTemplates = require('../repos')
const Generator = require('./generator')

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
];
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
      // 需要创建的目录地址
      const targetDir = path.join(process.cwd(), answers.projectName)
      // 目录是否已经存在
      const isExist = fs.existsSync(targetDir)
      return isExist
    }
  }
];

module.exports = async function (name, options) {
  const answers = await inquirer.prompt([...defaultQuestions, ...expressQuestions])
  if (answers.cover === false) return
  // 创建项目
  const generator = new Generator(answers, options)
  generator.create()


  /* // 当前命令行所在的目录
  const rootPath = process.cwd()
  // 需要创建的目录地址
  let targetDir = path.join(rootPath, name)

  // 目录是否已经存在
  if (fs.existsSync(targetDir)) {
    if (options.force) {
      // 强制创建
      await fs.remove(targetDir)
    } else {
      // 询问用户是否确定要覆盖或重命名
      const { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: `${name}目录已存在，请选择以下操作:`,
          choices: [
            {
              name: '覆盖',
              value: 'overwrite'
            }, {
              name: `不覆盖，使用${name}_copy命名`,
              value: 'rename'
            }, {
              name: '取消',
              value: false
            }
          ]
        }
      ])

      if (!action) {
        // 取消创建
        return;
      } else if (action === 'overwrite') {
        // 移除已存在的目录
        console.log(`\r\nRemoving...`)
        await fs.remove(targetDir)
      } else if (action === 'rename') {
        // 重命名目录路径
        name = `${name}_copy`
        targetDir = path.join(rootPath, name)
      }
    }
  } */

  // 创建项目
  /* const generator = new Generator(name, targetDir);
  generator.create() */
}
