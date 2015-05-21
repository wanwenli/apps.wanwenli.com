function ZhihuApi () {
	this.request = require('request');
	this.cheerio = require('cheerio');
	this.BASE_URL = 'http://www.zhihu.com';
	this.PEOPLE = '/people/';
	this.FOLLOWER_REL_PATH = '/people/endurance/followers';
	this.FOLLOWEE_REL_PATH = '/people/endurance/followees';
}

ZhihuApi.prototype.user = function(uid, callback) {
	var url = this.BASE_URL + this.PEOPLE + uid;
	var cheerio = this.cheerio;
	var baseUrl = this.BASE_URL;
	var followerRelUrl = this.FOLLOWER_REL_PATH;
	var followeeRelUrl = this.FOLLOWEE_REL_PATH;
	
	this.request(url, function(err, response, body) {
		var $ = cheerio.load(body);
		var user =  {
			id : uid,
			url : url,
			followers_url : baseUrl + followerRelUrl,
			followees_url : baseUrl + followeeRelUrl,
			followers : parseInt($('a.item[href="/people/endurance/followers"] strong').html(), 10),
			followees : parseInt($('a.item[href="/people/endurance/followees"] strong').html(), 10),
			agree : parseInt($('span.zm-profile-header-user-agree strong').html(), 10),
			thanks : parseInt($('span.zm-profile-header-user-thanks strong').html(), 10)
		};
		callback(user);
	});
};

module.exports = new ZhihuApi;
