var crawler = require('../crawl/zhihuapi.js');

exports.userapi = function (req, res) {
	var uid = req.params.uid;
	crawler.user(uid, function(user) {
        res.json(user);
	});
};