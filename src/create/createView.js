const prompts = require('prompts')
const path = require('path')
const fs = require('fs-extra')
const ejs = require('ejs')
const { red, blue } = require('picocolors')
const parser = require('@babel/parser')
const generate = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const types = require('@babel/types')
const { toLowerCase, toUpperCase } = require('../utils')

const cwd = process.cwd()
const componentDirPath = path.resolve(cwd, 'src/views')
const templatePath = path.resolve(__dirname, '../templates/view.ejs')
const routerFilePath = path.resolve(cwd, 'src/router/index.js')

const genView = async () => {
  const { routerPath, dirname, filename } = await prompts([
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
    {
      type: 'text',
      message: '请输入路由路径',
      name: 'routerPath',
    },
  ])
  if (!filename) {
    console.log(red('文件名称不能为空!'))
    return
  }
  if (!routerPath) {
    console.log(red('路由路径不能为空!'))
    return
  }
  const componentPath = dirname
    ? `${componentDirPath}/${dirname}/${filename}.vue`
    : `${componentDirPath}/${filename}.vue`

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
      await createComponent(dirname, filename, routerPath)
      return
    } else {
      console.log(blue('已取消操作'))
      process.exit(1)
    }
  } else {
    await createComponent(dirname, filename, routerPath)
    return
  }
  await createComponent(dirname, filename, routerPath)
}

async function createComponent(dirname, filename, routerPath) {
  const dirPath = `${componentDirPath}/${dirname}`
  const filePath = dirname
    ? `${componentDirPath}/${dirname}/${toUpperCase(filename)}.vue`
    : `${componentDirPath}/${toUpperCase(filename)}.vue`
  const routerContent = fs.readFileSync(routerFilePath, 'utf-8')
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
  const ast = parser.parse(routerContent, {
    sourceType: 'unambiguous',
  })
  let count = 0
  traverse(ast, {
    VariableDeclarator(node) {
      node.container.map((container) => {
        if (container.id.name === 'routes') {
          const newRoute = types.objectExpression([
            types.objectProperty(types.identifier('path'), types.stringLiteral(routerPath)),
            types.objectProperty(types.identifier('name'), types.stringLiteral(toLowerCase(filename))),
            types.objectProperty(types.identifier('component'), types.identifier(toUpperCase(filename))),
            types.objectProperty(
              types.identifier('meta'),
              types.objectExpression([
                types.objectProperty(types.identifier('key'), types.stringLiteral(toLowerCase(filename))),
              ])
            ),
          ])
          container.init.elements.push(newRoute)
        }
      })
    },
    ImportDeclaration() {
      count++
    },
  })
  const componentFilename = dirname ? `${dirname}/${toUpperCase(filename)}.vue` : `${toUpperCase(filename)}.vue`
  const newRoute = types.importDeclaration(
    [types.importDefaultSpecifier(types.identifier(toUpperCase(filename)))],
    types.stringLiteral(`@/views/${componentFilename}`)
  )
  ast.program.body.splice(count, 0, newRoute)
  const result = generate(ast).code
  fs.writeFileSync(routerFilePath, result)
}

module.exports = {
  genView,
}
