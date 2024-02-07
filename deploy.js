const Client = require('ssh2').Client
const path = require('path')
const { exec } = require('child_process')
const moment = require('moment')

console.log(path.resolve(__dirname, 'prod.pem'))

const servers = [
  {
      host: 'xxxxx',
      port: 22,
      username: 'ec2-user',
      privateKey: require('fs').readFileSync(path.resolve(__dirname, 'prod-master.pem'))
  },
  {
      host: 'xxxxx',
      port: 22,
      username: 'ec2-user',
      privateKey: require('fs').readFileSync(path.resolve(__dirname, 'prod-slave.pem'))
  }
]

function connection (server) {
  return new Promise((reslove) => {
    const conn = new Client()
    conn.on('ready', function () {
      console.log('Client :: ready')
      reslove(conn)
    }).on('close', function () {
      conn.end()
    }).connect(server)
  })
}

async function cmd (server, cmd) {
  const conn = await connection(server)
  conn.exec(cmd, function (err, stream) {
    if (err) throw err
    stream.on('close', function (code, signal) {
      conn.end()
    }).on('data', function (data) {
      console.log(server.host + ' STDOUT: ' + data)
    }).stderr.on('data', function (data) {
      console.log(server.host + ' STDERR: ' + data)
    })
  })
}

async function ftp (server, localPath, remotePath, ck) {
  const conn = await connection(server)
  conn.sftp(function (err, sftp) {
    if (err) {
      console.log(err)
      ck && ck(err)
    } else {
      sftp.fastPut(localPath, remotePath, function (err, result) {
        console.log(err, result)
        conn.end()
        ck && ck()
      })
    }
  })
}

async function ftpDir (server, localPath, remotePath, ck) {
  const path = localPath.split('/')
  exec(`zip -q -r ${path[path.length - 1]}.zip ${path[path.length - 1]}`, () => {
    ftp(server, localPath + '.zip', remotePath + '/' + path[path.length - 1] + '.zip', () => {
      cmd(server, `
                cd ${remotePath} && 
                unzip -o ${path[path.length - 1] + '.zip'} && 
                git pull &&
                pm2 restart app-ssr &&
                pm2 restart app-ssr-id &&
                pm2 restart app-ssr-th &&
                mv ${path[path.length - 1] + '.zip'} ./bak/${moment(new Date()).format('YYYY-M-D-HH:mm:ss')}.zip
            `)
      ck && ck()
    })
  })
}


servers.forEach((server) => {
  ftpDir(server, path.resolve(__dirname, 'dist-ssr'), '/app/carnetwork/web/demo-fe-webapp-ssr')
})
