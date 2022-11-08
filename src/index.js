const { program } = require('commander')
const { cyan } = require('picocolors')
const pkg = require('../package.json')
const { genComponent } = require('./create/createComponent')
const { createProject } = require('./create/createProject')
const { genView } = require('./create/createView')

program
  .command('init')
  .description('创建一个新的项目')
  .action(async () => {
    await createProject()
  })

program
  .command('view')
  .alias('page')
  .description('创建一个路由组件')
  .action(async () => {
    await genView()
  })

program
  .command('component')
  .alias('com')
  .description('创建一个一般组件')
  .action(async () => {
    await genComponent()
  })

program.on('--help', () => {
  console.log(`输入 ${cyan('kte <command>')} -h 查看单个命令详情 `)
})

program.version(pkg.version)
program.parse()
