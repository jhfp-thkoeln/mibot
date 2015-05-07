# Description:
#   Scripts für die ADVM1
#
# Dependencies:
#   ssh2
#
# Configuration:
#   None
#
# Commands:
#   hubot who is x - fingers x on the advm1 and posts his real life name


module.exports = (robot) ->
  robot.respond /who is (.*)/i, (res) ->
    username = escape res.match[1]
    Client = require('ssh2').Client
    conn = new Client
    conn.on('ready', ->
      console.log "finger #{username}"
      conn.exec "finger #{username}", (err, stream) ->
        if err 
          throw err
        result = undefined
        stream.on('close', (code, signal) ->
          regex = /In real life:\s(.*)/g
          if result and result.length > 1
            realname = regex.exec(result)[1]
            res.reply "the real name of #{username} is #{realname}"
            conn.end()
          else
            res.reply "could not find #{username} on the advm1 server"
        ).on 'data', (data) ->
          result = result + data
    ).connect
      host: 'advm1.gm.fh-koeln.de'
      port: 22
      username: process.env.ADVM1_USER
      password: process.env.ADVM1_PASS