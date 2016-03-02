# Description:
#   Scripts für den ADV-Cloud Kalender
#
# Dependencies:
#   string-similarity
#
# Configuration:
#   None
#
# Commands:
#   hubot termine morgen - events for tomorrow
#   hubot termine aktuell|gerade|jetzt - current events
#   hubot termine diese|momentane|aktuelle woche - events for this week
#   hubot termine diesen|momentanen|aktuellen monat - events for this month
#   hubot termine in den nächsten x wochen|monaten - events for the next x weeks/months
#   hubot termine [vom] <dd>.<mm>.<yyyy> bis [zum] <dd>.<mm>.<yyyy> - events between two given dates
#   hubot termine zu x - events with summaries similiar to x; can be used in combination with the other commands


adv_calendar = require './adv_calendar'

module.exports = (robot) ->
  robot.respond /termine (.*)/i, (res) ->
    subcommand = escape res.match[1]
    
    adv_calendar subcommand, (events_str) -> res.reply events_str
