class Css {
  constructor () {
    this._css = null

    this.cssData = ''
  }

  static run (options = {}) {
    return Css.from(options).run()
  }

  static from (options = {}) {
    if (this._css instanceof Css) {
      return this._css
    }
    this._css = new Css(options)
    return this._css
  }

  async run () {
    this._getCss()
    console.log('Css', this.options)
  }

  _getCss (html = '') {
    this.cssData = html
      .match(/(\<style([\s\S]*?)<\/style\>)/g)
      .reduce((cur, prev) => `${prev} ${cur}`, '')
      .replace(/([\n\t]+)|(\s{2,})/g, '')
      .replace(/\<style[\s\S]*?\>/g, '')
      .replace(/\<\/style[\s\S]*?\>/g, '')

    return this.cssData
  }
}
