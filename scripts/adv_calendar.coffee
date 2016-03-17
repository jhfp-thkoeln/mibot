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
#   hubot events morgen - events for tomorrow
#   hubot events aktuell|gerade|jetzt - current events
#   hubot events diese|momentane|aktuelle woche - events for this week
#   hubot events diesen|momentanen|aktuellen monat - events for this month
#   hubot events in den nächsten x wochen|monaten - events for the next x weeks/months
#   hubot events [vom] <dd>.<mm>.<yyyy> bis [zum] <dd>.<mm>.<yyyy> - events between two given dates
#   hubot events zu x - events with summaries similiar to x; can be used in combination with other commands


adv_calendar = require './adv_calendar/index'

module.exports = (robot) ->
  robot.respond /events (.*)/i, (res) ->
    subcommand = res.match[1]

    adv_calendar subcommand, (events_str) -> res.reply events_str

  robot.respond /events$/i, (res) ->
    adv_calendar "", (events_str) -> res.reply events_str

  robot.respond /events help/i, (res) ->
    res.reply """
*events morgen* - events for tomorrow
*events aktuell|gerade|jetzt* - current events
*events diese|momentane|aktuelle woche* - events for this week
*events diesen|momentanen|aktuellen monat* - events for this month
*events in den nächsten x wochen|monaten* - events for the next x weeks/months
*events [vom] <dd>.<mm>.<yyyy> bis [zum] <dd>.<mm>.<yyyy>* - events between two given dates
*events zu x* - events with summaries similiar to x; can be used in combination with other commands
"""
