var crawler = require('../crawl/zhihuapi.js');

exports.userapi = function (req, res) {
	var uid = req.params.uid;
	crawler.user('endurance', function(user) {
        res.json(user);
	});
};