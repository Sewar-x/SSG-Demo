const fs = require('fs')
const url = require('../../src/config/url')
const { nowFormatFn, commonXMLGenerator } = require('../utils')
const { getForumGroupList, getGroupPostList } = require('../api/common')
const nowFormat = nowFormatFn()

async function postAmp({ lang = 'my-en', forumOutput = '', config = {} }) {
  if (lang !== 'my-en') return console.log('******** 论坛暂时 ********')
  const allGroup = await getForumGroupList().then(res => res.data.data.allGroups).catch(err => console.group(err))
  for (let i = 0; i < allGroup.length; i++) {
    const { groupId } = allGroup[i]
    const { posts: { records } } = await getGroupPostList({
      groupId,
      pageNo: 1,
      pageSize: 9999
    }).then(res => res.data.data).catch(err => console.log(err))
    const groupName = (records && records[0] && records[0].group && (records[0].group.group || '')).toLocaleLowerCase().replace(/\s+/g, '-')
    const postXML = commonXMLGenerator(records.map(post => {
      const { type, uuid, title, summary } = post
      return `
        <url>
        <loc>${config.forumHost}${url[lang].ampPost({ title: type === 1 ? summary : title, id: uuid, type })}/amp</loc>
        <lastmod>${nowFormat}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
        </url>
      `
    }).join(''))
    fs.writeFile(`${forumOutput}/${groupName}-discussion-amp-0.xml`, postXML, function (err) {
      if (err) {
        return console.error(err)
      }
      console.log(`论坛版块${groupName} 帖子列表 第 0 站点地图生成成功!`)
    })
  }
}
module.exports = postAmp
