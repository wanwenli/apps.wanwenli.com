function ZhihuApi () {
	this.request = require('request');
	this.cheerio = require('cheerio');
	this.BASE_URL = 'http://www.zhihu.com';
	this.PEOPLE_URL = '/people/';
	this.USER_NOT_FOUND_OBJ = {
		message : "Not found",
		documentation_url : "https://github.com/swwl1992/apps.wanwenli.com"
	};
}

ZhihuApi.prototype.user = function(uid, jsCbName, callback) {
	var baseUrl = this.BASE_URL;
	var peopleUrl = this.PEOPLE_URL;
	var url = baseUrl + peopleUrl + uid;
	var cheerio = this.cheerio;
	var userNotFoundObj = this.USER_NOT_FOUND_OBJ;
	
	this.request(url, function(err, response, body) {
		var $ = cheerio.load(body);
		var resObj = {};
		if ($('div.error').length === 0) {
			var id = $('a.zm-profile-header-user-detail').attr('href').split('/')[2];
			resObj =  {
				id : id,
				url : baseUrl + peopleUrl + id,
				avatar_url : $('div.zm-profile-header-avatar-container img').attr('src'),
				name : $('div.title-section span.name').html(),
				followees : parseInt($('div.zm-profile-side-following a:nth-child(1) strong').html(), 10),
				followers : parseInt($('div.zm-profile-side-following a:nth-child(2) strong').html(), 10),
				agree : parseInt($('span.zm-profile-header-user-agree strong').html(), 10),
				thanks : parseInt($('span.zm-profile-header-user-thanks strong').html(), 10)
			};
		} else {
			// 404 not found
			resObj = userNotFoundObj;
		}
		var resStr = JSON.stringify(resObj);
		if (typeof jsCbName != 'undefined') {
			resStr = jsCbName + '(' + resStr + ')';
		}
		callback(resStr);
	});
};

module.exports = new ZhihuApi;
