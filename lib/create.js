const path = require('path')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const Generator = require('./generator')

module.exports = async function (name, options) {
  // 当前命令行所在的目录
  const rootPath = process.cwd()
  // 需要创建的目录地址
  let targetAir = path.join(rootPath, name)

  // 目录是否已经存在
  if (fs.existsSync(targetAir)) {
    if (options.force) {
      // 强制创建
      await fs.remove(targetAir)
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
        await fs.remove(targetAir)
      } else if (action === 'rename') {
        // 重命名目录路径
        name = `${name}_copy`
        targetAir = path.join(rootPath, name)
      }
    }
  }

  // 创建项目
  const generator = new Generator(name, targetAir);
  generator.create()
}
