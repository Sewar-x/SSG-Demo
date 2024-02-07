const fse = require('fs-extra')
const path = require('path')
const { country = 'my', env = 'test' } = require('yargs').argv

const srcDir = path.resolve(__dirname, `./${country}`)
const destDir = env === 'test' ? path.resolve(__dirname, `../html/${country}`) : `/app/carnetwork/web/demo-fe-webapp/html${country === 'my' ? '' : `/${country}`}`

try {
  fse.copySync(srcDir, destDir)
  console.log('success', srcDir, destDir)
} catch (error) {
  console.error(error, srcDir, destDir)
}
