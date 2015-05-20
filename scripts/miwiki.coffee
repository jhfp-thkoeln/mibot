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

module.exports = (robot) ->
  wiki_room = 'wiki'
  wiki_status = null
  interval = setInterval((->
    robot.http('https://www.medieninformatik.fh-koeln.de/w/').get() (err, res, body) ->
      if !err and res.statusCode == 200
        if wiki_status == 'down'
          robot.messageRoom wiki_room, 'Das Wiki scheint wieder zu funktionieren 😊!'
          wiki_status = 'up'
      else
        setTimeout((->
          robot.http('https://www.medieninformatik.fh-koeln.de/w/').get() (err, res, body) ->
            if err or res.statusCode != 200
              if wiki_status != 'down'
                robot.messageRoom wiki_room, 'Das Wiki scheint Probleme zu haben 😱!'
                wiki_status = 'down'
        ), 1*60000)

  ), 10 * 60000)

  robot.respond /wiki status/i, (msg) ->
    robot.http('https://www.medieninformatik.fh-koeln.de/w/').get() (err, res, body) ->
      if !err and res.statusCode == 200
        msg.reply 'Das Wiki läuft 😊'
      else
        msg.reply 'Das Wiki ist down 😱'
