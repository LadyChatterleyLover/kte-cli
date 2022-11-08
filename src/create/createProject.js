const prompts = require('prompts')
const path = require('path')
const fs = require('fs-extra')
const { blue, red, green } = require('picocolors')
const downloadGitRepo = require('download-git-repo')
const ora = require('ora')
const util = require('util')

const cwd = process.cwd()
const spinner = ora()

const createProject = async () => {
  const downloadProject = util.promisify(download)
  const { projectName } = await prompts([
    {
      type: 'text',
      message: '请输入文件夹名称',
      name: 'projectName',
      initial: 'vue-project',
    },
  ])
  const projectPath = path.join(cwd, projectName)
  if (fs.existsSync(projectPath)) {
    const { overwrite } = await prompts([
      {
        type: 'confirm',
        message: '该目录已经存在,是否要覆盖?',
        name: 'overwrite',
      },
    ])
    if (overwrite) {
      fs.removeSync(projectPath)
      fs.mkdirSync(projectPath)
      await downloadProject(projectName)
      return
    } else {
      console.log(blue('已取消操作'))
      process.exit(1)
    }
  } else {
    fs.mkdirSync(projectPath)
    await downloadProject(projectName)
  }
}

async function download(projectName) {
  spinner.text = '拉取代码中...'
  spinner.start()
  // 拼接下载路径
  let requestUrl = `LadyChatterleyLover/vue-template#main`
  downloadGitRepo(requestUrl, projectName, (err) => {
    if (err) {
      console.log()
      console.log(red('拉取失败', err))
      fs.removeSync(path.join(cwd, projectName))
      process.exit(1)
    } else {
      spinner.succeed('创建项目成功')
      console.log(green(`cd ${projectName} && npm i`))
      console.log()
      console.log(green('npm run dev 启动项目'))
    }
  })
}

module.exports = {
  createProject,
}
