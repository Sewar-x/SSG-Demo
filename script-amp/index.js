
const COMMON = ['headerGuidanceScript']
const NEWS_FOLDER_SCRIPT = 'newsFolderScript'
const COMPARE = 'compare'
const DELETE_CAR = 'deleteCar'
const POST_READ_MORE = 'postReadMore'
const { lang = 'my-en' } = require('yargs').argv

module.exports = {
  ModelAmp: [...COMMON, COMPARE, DELETE_CAR],
  ModelYearAmp: [...COMMON, COMPARE, DELETE_CAR],
  MotorModelAmp: [...COMMON, COMPARE, DELETE_CAR],
  Nodel2021Amp: [...COMMON, COMPARE, DELETE_CAR],
  MotorNewsAmp: [...COMMON, NEWS_FOLDER_SCRIPT],
  NewsAmp: [...COMMON, NEWS_FOLDER_SCRIPT],
  MsNewsAmp: [...COMMON, NEWS_FOLDER_SCRIPT],
  ZhNewsAmp: [...COMMON, NEWS_FOLDER_SCRIPT],
  PostAmp: [...COMMON, POST_READ_MORE],
  get BrandsAmp() {
    const langScriptMap = {
      'my-en': [...COMMON]
    }
    return langScriptMap[lang] || []
  },
  MotorBrandsAmp: []
}
