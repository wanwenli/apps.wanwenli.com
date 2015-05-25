var crawler = require('../crawl/zhihuapi.js');

exports.userapi = function (req, res) {
	var uid = req.params.uid;
	var jsCbName = req.query.callback;
	crawler.user(uid, jsCbName, function(response) {
        res.setHeader('Content-Type', 'application/json');
		res.send(response);
	});
};