/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'Salmon Apps', subtitle: "Let's go fishing"})
};

exports.tycrawler = function(req, res){
    res.render('tycrawler', {
        title: 'Salmon Apps',
        subtitle: 'Tianya Crawler'
    });
};

exports.zodiac = function(req, res) {
    res.render('zodiac', {
        title: 'Salmon Apps',
        subtitle: 'Zodiac'
    });
};

exports.zodiac_result = function(req, res) {
    var request = require('request')
    , fs = require('fs')
    , async = require('async')
    , cheerio = require('cheerio');

    var base_url = 'http://www.baidu.com/s?word=';
    var option = req.body.option;
    var zodiac = [
          '白羊'
        , '金牛'
        , '双子'
        , '巨蟹'
        , '狮子'
        , '处女'
        , '天秤'
        , '天蝎'
        , '射手'
        , '摩羯'
        , '水瓶'
        , '双鱼'
    ];
    var zuo = '座';
    var concurrency = 12;
    var result_json = {
        title: "Salmon Apps",
        subtitle: "Zodiac",
        option: option,
        results: []
    };

    try {
        async.eachLimit(zodiac, concurrency, function (zod, next) {
            var search_url = base_url + option + zod + zuo;
            request(search_url, function(err, response, body){
                if(err) {
                    throw err;
                }
                var $ = cheerio.load(body);
                var result = $("div.nums").html();
                // parse the string to an integer
                var num = parseInt(result.substr(11,result.length-2).split(',').join(''));
                result_json.results.push({
                    zodiac: zod + zuo,
                    stats: num
                });
                // when response is ready
                if(result_json.results.length == 12) {
                    res.render('zodiac_result_display', result_json);
                }
            });
        });
    } catch (e) {
        console.log(e);
    }
};

exports.tycrawler_result = function(req, res){
    var request = require('request')
    , fs = require('fs')
    , cheerio = require('cheerio')
    , format = require('util').format;

    // check the validity of URL
    var url_validator = function(url){
        if(url.indexOf('http://') == -1) {
            res.end('Your URL must contain "http://"');
            return false;
        }
        else if(url.indexOf('tianya.cn') == -1) {
            res.end('Your URL is not from tianya.');
            return false;
        }
        else if(url.indexOf('post') == -1) {
            res.end('Your URL is not a post.');
            return false;
        }
        else
            return true;
    }

    var init_url = req.body.url,
        delimiter = '|',
        pages = [],
        comments_info = [],
        concurrency = 1;

    console.log(init_url);
    is_valid_url = url_validator(init_url);

    // debugging purpose
    var log_comments_info = function (c_i) {
        for(var j = 0; j < c_i.length; j++){
            console.log('Floor no.: ' + c_i[j][0]);
            console.log('Content: ' + c_i[j][1]);
            console.log('Author: ' + c_i[j][2]);
            console.log('Device: ' + c_i[j][3]);
            console.log('Time: ' + c_i[j][4]);
        }
    };

    // parse comments info into a string 
    var comments_info_tostring = function(ci) {
        var result = '\nFloor' + delimiter + 'Content' + delimiter +
            'Author' + delimiter + 'Device' + delimiter + 'Time';
        for (var i = 0; i < ci.length; i++){
            result = result + '\n';
            for (var j = 0; j < 5; j++){
                result = result + ci[i][j] + delimiter;
            }
        }
        return result;
    };
    
    // crawl from each page stored in pages[]
    if (is_valid_url) {
        try {
            request(init_url, function(e, re, bd) {
                if (e) {
                    res.end('Your URL ' + init_url + ' is not valid.');
                    throw e;
                }
                var $ = cheerio.load(bd);

                // get the page title
                var page_title = $("#post_head span.s_title span").html();
                // get the author of the main post
                var main_author = $("#post_head .atl-info a").html();
                console.log(page_title);
                console.log(main_author);

                // get content of each post on the page
                var first_post = parseInt($("div.atl-item").first().attr('id'));
                // if first_post does not exist
                if (!first_post){
                    first_post = 1;
                }
                var last_post = parseInt($("div.atl-item").last().attr('id'));
                for(var id = first_post; id <= last_post; id++) {
                    var content = $("#"+id+" .bbs-content").
                        text().trim();
                    var author = $("#"+id+" .atl-head .atl-info").
                        children('span').eq(0).children().eq(0).text();
                    var device;
                    // in case device is empty
                    if(device == null){
                        device = 'N.A.';
                    }
                    var raw_time = $("#"+id+" .atl-head .atl-info").
                        children('span:last-child').text();
                    var time = raw_time.substr(3);
                    comments_info.push([
                        id,
                        content,
                        author,
                        device,
                        time
                    ]);
                }

                var str = 'Page title' + delimiter + page_title;
                str = str + '\nMain author' + delimiter + main_author;
                str = str + comments_info_tostring(comments_info);
                res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end(str);
                console.log('Complete');
            });
        } catch (err) {
            console.log(err);
        }
    }
};
