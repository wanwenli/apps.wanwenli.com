function ZhihuApi () {
	this.request = require('request');
	this.cheerio = require('cheerio');
	this.BASE_URL = 'http://www.zhihu.com';
	this.PEOPLE = '/people/';
	this.FOLLOWER_REL_PATH = '/followers';
	this.FOLLOWEE_REL_PATH = '/followees';
}

ZhihuApi.prototype.user = function(uid, callback) {
	var url = this.BASE_URL + this.PEOPLE + uid;
	var cheerio = this.cheerio;
	var baseUrl = this.BASE_URL;
	var peopleUrl = this.PEOPLE;
	var followerRelUrl = peopleUrl + uid + this.FOLLOWER_REL_PATH;
	var followeeRelUrl = peopleUrl + uid + this.FOLLOWEE_REL_PATH;
	
	this.request(url, function(err, response, body) {
		var $ = cheerio.load(body);
		var user =  {
			id : uid,
			url : url,
			followers : parseInt($('a.item[href="' + followerRelUrl + '"] strong').html(), 10),
			followees : parseInt($('a.item[href="' + followeeRelUrl + '"] strong').html(), 10),
			agree : parseInt($('span.zm-profile-header-user-agree strong').html(), 10),
			thanks : parseInt($('span.zm-profile-header-user-thanks strong').html(), 10)
		};
		callback(user);
	});
};

module.exports = new ZhihuApi;
