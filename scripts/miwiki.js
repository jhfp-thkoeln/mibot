// Description:
//   Scripts für das Medieninformatik WiMa Team
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//   hubot wiki status  - shows the status of the Medieninformatik Wiki
module.exports = function(robot) {

	var wiki_room = 'wiki';
	var wiki_status = null;
	var interval = setInterval(function(){
		
		robot.http('https://www.medieninformatik.fh-koeln.de/w/').get()(function(err, res, body){
			if (!err && res.statusCode == 200) {
				if (wiki_status == 'down') {
					robot.messageRoom(wiki_room, 'The wiki is up again 😊!');
					wiki_status = 'up';
				}
			}
			else {
				if (wiki_status != 'down') {
					robot.messageRoom(wiki_room, 'The wiki is down 😱!');
					wiki_status = 'down';
				}	
			}
		});


	}, 5*60000);

	
    robot.respond(/wiki status/i, function(msg){
		robot.http('https://www.medieninformatik.fh-koeln.de/w/').get()(function(err, res, body){
			if (!err && res.statusCode == 200) {
				msg.reply('wiki up and running 😊');
			}
			else {
				msg.replay('wiki down 😱');
			}
		});
    });
}
