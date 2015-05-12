# Description:
#   Scripts für die Mensa am Campus Gummersbach
#
# Dependencies:
#   None
#
# Configuration:
#   None
#
# Commands:
#   hubot hunger  - shows menu for today

xmldoc = require 'xmldoc'
he = require 'he'
jsdom = require 'node-jsdom'

emojilist = [
  {word: 'Reis', emoji: '🍚'}
  {word: 'Mais', emoji: '🌽'}
  {word: 'Pizza', emoji: '🍕'}
  {word: ' Wein', emoji: '🍷'}
  {word: 'Rotwein', emoji: '🍷'}
  {word: 'Hähnchen', emoji: '🐓'}
  {word: 'Hühner', emoji: '🐓'}
  {word: 'Schwein', emoji: '🐷'}
  {word: 'Pute', emoji: '🐓'}
  {word: 'Fisch', emoji: '🐟'}
  {word: 'Rind', emoji: '🐮'}
  {word: 'Pilz', emoji: '🍄'}
  {word: 'Lasagne', emoji: '🐎'}
  {word: 'Pommes', emoji: '🍟'}
  {word: 'Spaghetti', emoji: '🍝'}
  {word: 'Brot', emoji: '🍞'}
  {word: 'Tomate', emoji: '🍅'}
  {word: 'Tasche', emoji: '👜'}
  {word: 'Kuchen', emoji: '🍰'}
  {word: 'Pudding', emoji: '🍮'}
  {word: 'Banane', emoji: '🍌'}
  {word: 'Ananas', emoji: '🍍'}
  {word: 'Apfel', emoji: '🍎'}
  {word: 'Äpfel', emoji: '🍎'}
  {word: 'Erdbeer', emoji: '🍓'}
  {word: 'Kirsch', emoji: '🍒'}
  {word: 'Orange', emoji: '🍊'}
  {word: 'Kräuter', emoji: '🌿'}
  {word: 'vegetari', emoji: '🌱'}
  {word: 'vegetari', emoji: '🐌'}

]

module.exports = (robot) ->
  robot.respond /(.*[H|h]unger.*|.*[M|m]ensa.*|.*[E|e]ssen.*)/i , (res) ->
    robot.http('https://kstw.de/KStW/RSS/rssSPP.php?id=25').get() (err, resp, body) ->
      if not err
        data = new xmldoc.XmlDocument(body);
        html = data.childNamed('channel').childNamed('item').childNamed('description')
        html = he.decode(html.val, {wordwrap: 100})

        meals = []
        jsdom.env html, (err, window) ->
          artikel = window.document.querySelectorAll 'span.artikel'
          descr = window.document.querySelectorAll 'span.descr'
          for a, i in artikel
            art = a.childNodes[0].nodeValue.replace(/\*/g,'')
            desc = ''
            
            for node in descr[i].childNodes
              desc += node.nodeValue.replace(/\*/g,'') if node.nodeType == 3

            if (art == 'Beilagen')
              meals.push "Und als Beilagen: #{desc}"
            else
              meals.push "• #{art} #{desc}"

          if meals.length == 0
            res.reply "Heute gibt es nichts zu essen 😕"
          else
            text = "Heute gibt es in der Mensa:"
            for meal, i  in meals
              text += "\n#{meal}"
              for o in emojilist
                text += " #{o.emoji}" if meal.toLowerCase().indexOf(o.word.toLowerCase()) != -1
            res.reply text




