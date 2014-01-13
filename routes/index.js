
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'Express' })
};

exports.tycrawler = function(req, res){
    res.render('tycrawler', {title: 'Crawler'});
};

exports.tycrawler_result = function(req, res){
    var request = require('request')
    , fs = require('fs')
    , cheerio = require('cheerio')
    , async = require('async')
    , format = require('util').format;

    var init_url = req.body.url,
        delimiter = '|',
        pages = [],
        comments_info = [],
        concurrency = 1;

    console.log(init_url);

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

    // write comments info into a file
    var comments_info_tostring = function(ci) {
        var result = '\nFloor';
        for(var i = 0; i < ci.length; i++) {
            result = result + (delimiter + ci[i][0]);
        }
        var result = result + '\nContent';
        for(var i = 0; i < ci.length; i++) {
            result = result + (delimiter + ci[i][1]);
        }
        var result = result + '\nAuthor';
        for(var i = 0; i < ci.length; i++) {
            result = result + (delimiter + ci[i][2]);
        }
        var result = result + '\nDevice';
        for(var i = 0; i < ci.length; i++) {
            result = result + (delimiter + ci[i][3]);
        }
        var result = result + '\nTime';
        for(var i = 0; i < ci.length; i++) {
            result = result + (delimiter + ci[i][4]);
        }

        return result;
    };

    // crawl from each page stored in pages[]
    request(init_url, function(e, re, bd) {
        var $$ = cheerio.load(bd);
        var last_page_num = parseInt($$(".atl-pages form a:nth-last-child(4)").html());

        // get the page title
        var page_title = $$("#post_head span.s_title span").html();
        // get the author of the main post
        var main_author = $$("#post_head .atl-info a").html();
        console.log(page_title);
        console.log(main_author);

        for(var i = 1; i <= last_page_num; i++){
            var url = init_url.substring(0, init_url.length-7) + i + '.shtml';
            console.log(url);
            pages.push(url);
        }

        async.eachLimit(pages, concurrency, function (page, next) {
            request(page, function (err, response, body) {
                if (err) throw err;
                var $ = cheerio.load(body);

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
                var page_num = pages.indexOf(page) + 1;
                console.log('Page ' + page_num + ' complete');
                if (page_num == last_page_num){
                    var str = 'Page title' + delimiter + page_title;
                    str = str + '\nMain author' + delimiter + main_author;
                    str = str + comments_info_tostring(comments_info);
                    res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
                    res.end(str);
                    console.log('Complete');
                }
                next();
            });
        });
    });
};
