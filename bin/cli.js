#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const figlet = require('figlet')

const packageData = require('../package.json')
const repoTemplates = require('../repos')
const createTemplate = require('../lib/create')

program
  // 定义创建命令和参数
  .command('create')
  .description('create a new project')
  .option('-f, --force', 'overwrite target directory if it exist') // 是否强制创建，如果创建的目录存在则直接覆盖
  .action((options) => {
    // 在 create.js 中执行创建任务
    createTemplate(options)
  })

program
  // 定义查看模版列表命令
  .command('list')
  .alias('ls')
  .description('show the list of all templates')
  .action(() => {
    for (let temp of repoTemplates) {
      console.log(chalk.green(temp.name))
    }
  })

program
  // 配置版本号信息
  .version('v' + packageData.version)
  .usage('<command> [option]')

program
  // 监听 --help 执行
  .on('--help', () => {
    // 使用 figlet 绘制 Logo
    console.log('\r\n' + figlet.textSync('fe-repo', {
      font: 'Ghost',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true
    }))
    // 新增说明信息
    console.log(`\r\nRun ${chalk.cyan(`fe <command> --help`)} for detailed usage of given command\r\n`)
  })

// 解析用户执行命令传入参数
program.parse(process.argv);
