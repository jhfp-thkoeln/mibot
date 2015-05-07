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
          robot.messageRoom wiki_room, 'The wiki seems to be up again 😊!'
          wiki_status = 'up'
      else
        if wiki_status != 'down'
          robot.messageRoom wiki_room, 'The wiki seems to be down 😱!'
          wiki_status = 'down'

  ), 5 * 60000)
  robot.respond /wiki status/i, (msg) ->
    robot.http('https://www.medieninformatik.fh-koeln.de/w/').get() (err, res, body) ->
      if !err and res.statusCode == 200
        msg.reply 'wiki up and running 😊'
      else
        msg.replay 'wiki down 😱'