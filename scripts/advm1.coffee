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
#   hubot wer ist x - fingers x on the advm1 and posts his real life name


module.exports = (robot) ->
  robot.respond /wer ist (.*)/i, (res) ->
    username = escape res.match[1]
    Client = require('ssh2').Client
    conn = new Client
    conn.on('ready', ->
      conn.exec "finger #{username}", (err, stream) ->
        if err
          throw err
        result = undefined
        stream.on('close', (code, signal) ->
          regex = /In real life:\s(.*)/g
          array = regex.exec(result)
          if array and array.length > 1
            realname = array[1]
            res.reply "#{username} heißt im echten Leben: #{realname}"
            conn.end()
          else
            res.reply "Ich konnte #{username} auf dem advm1-Server leider nicht finden"
        ).on 'data', (data) ->
          result = result + data
    ).connect
      host: 'advm1.gm.fh-koeln.de'
      port: 22
      username: process.env.ADVM1_USER
      password: process.env.ADVM1_PASS
