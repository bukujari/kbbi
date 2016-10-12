'use strict';

const luwak = require('luwak');
const cheerio = require('cheerio');
const url = require('url');
const qs = require('querystring');
const sprintf = require("sprintf-js").sprintf;
const userAgent = require('luwak/middlewares/user-agent.js');
var jsonfile = require('jsonfile');
var path = 'assets/daftar-kata.json';

try {
  let daftarKata = 'http://kbbi.co.id/daftar-kata';
  let daftarKataList = [];
  let artiKata = 'http://kbbi.co.id/arti-kata/';

  var scraper = new luwak.Scraper(daftarKata);
  let pagesCount = 0;

  scraper
  .select(function ($root) {
    // find sum of pages
    return $root.find('ul.pagination:first-child li:last-child a').map(function(i, el) {
      return cheerio(el).attr('href');
    }).get();
  })
  .fetch()
  .then((data) => {
    // pagesCount found
    pagesCount = parseInt(data[0].split('?page=')[1]);

    let counter = pagesCount;
    let rowIndex = 0;
    let s = luwak(daftarKata)
    .use(userAgent('Googlebot/2.1 (+http://www.google.com/bot.html)'))
    .filter('sanitizeUrl', function (value) {
      return value.replace(artiKata, '').replace('http://www.kbbi.co.id/arti-kata', '');
    })
    .select([{
      $root: 'div.row ul li',
      uri: 'a@href|sanitizeUrl',
      keyword: 'a'
    }])
    .next('ul.pagination:first-child li:nth-last-child(2) a@href')
    .limit(pagesCount)
    .fetch(function(row) {
      row.uri = row.uri.replace(artiKata, '');
      daftarKataList.push(row);
      console.log(sprintf('%3d. %s', rowIndex++, row.keyword));
    })
    .then(data => {
      // console.log(daftarKataList);
      console.log('-------------- len', data);
      jsonfile.writeFile(path, daftarKataList, function (err) {
        console.error(err)
      })
    })
    .catch(err => console.error(err.stack));

  })
  .catch((e) => {
    console.error(e.stack);
  });

} catch(e) {
  console.error(e.stack);
}
