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
