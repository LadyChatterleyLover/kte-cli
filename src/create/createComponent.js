const prompts = require('prompts')
const path = require('path')
const fs = require('fs-extra')
const ejs = require('ejs')
const { red, blue } = require('picocolors')
const { toUpperCase } = require('../utils')

const cwd = process.cwd()
const componentDirPath = path.resolve(cwd, 'src/components')
const templatePath = path.resolve(__dirname, '../templates/component.ejs')

const genComponent = async () => {
  const { dirname, filename } = await prompts([
    {
      type: 'text',
      message: '请输入文件夹名称',
      name: 'dirname',
    },
    {
      type: 'text',
      message: '请输入文件名称',
      name: 'filename',
    },
  ])
  if (!filename) {
    console.log(red('文件名称不能为空!'))
    return
  }
  const componentPath = dirname
    ? `${componentDirPath}/${dirname}/${toUpperCase(filename)}.vue`
    : `${componentDirPath}/${toUpperCase(filename)}.vue`

  if (fs.existsSync(componentPath)) {
    const { overwrite } = await prompts([
      {
        type: 'confirm',
        message: '该文件已经存在,是否要覆盖?',
        name: 'overwrite',
      },
    ])
    if (overwrite) {
      fs.unlinkSync(componentPath)
      await createComponent(dirname, filename)
    } else {
      console.log(blue('已取消操作'))
      process.exit(1)
    }
  } else {
    await createComponent(dirname, filename)
  }
}

async function createComponent(dirname, filename) {
  const dirPath = `${componentDirPath}/${dirname}`
  const filePath = dirname
    ? `${componentDirPath}/${dirname}/${toUpperCase(filename)}.vue`
    : `${componentDirPath}/${toUpperCase(filename)}.vue`
  const content = await ejs.renderFile(templatePath, { data: { name: filename } })
  if (dirname) {
    if (fs.existsSync(dirPath)) {
      fs.writeFileSync(filePath, content)
    } else {
      fs.mkdirSync(dirPath)
      fs.writeFileSync(filePath, content)
    }
  } else {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      fs.writeFileSync(filePath, content)
    } else {
      fs.writeFileSync(filePath, content)
    }
  }
}

module.exports = {
  genComponent,
}
