# Description:
#   Scripts für das Medieninformatik Wiki
#
# Dependencies:
#   None
#
# Configuration:
#   None
#
# Commands:
#   hubot wiki status  - shows the status of the Medieninformatik Wiki

WIKI_URL = 'https://www.medieninformatik.th-koeln.de/w/'

module.exports = (robot) ->
  wiki_room = 'wiki'
  wiki_status = null
  interval = setInterval((->
    robot.http(WIKI_URL).get() (err, res, body) ->
      if !err and res.statusCode == 200
        if wiki_status == 'down'
          robot.messageRoom wiki_room, 'Das Wiki scheint wieder zu funktionieren 😊!' if (new Date()).getHours() > 7 and (new Date()).getHours() < 20
          wiki_status = 'up'
      else
        setTimeout((->
          robot.http(WIKI_URL).get() (err, res, body) ->
            if err or res.statusCode != 200
              if wiki_status != 'down'
                robot.messageRoom wiki_room, 'Das Wiki scheint Probleme zu haben 😱!' if (new Date()).getHours() > 7 and (new Date()).getHours() < 20
                wiki_status = 'down'
        ), 2*60000)

  ), 30 * 60000)

  robot.respond /wiki status/i, (msg) ->
    robot.http(WIKI_URL).get() (err, res, body) ->
      if !err and res.statusCode == 200
        msg.reply 'Das Wiki läuft 😊'
      else
        msg.reply 'Das Wiki ist down 😱'
