'use strict';

const luwak = require('luwak');
const cheerio = require('cheerio');
const url = require('url');
const qs = require('querystring');
const sprintf = require("sprintf-js").sprintf;
const userAgent = require('luwak/middlewares/user-agent.js');
var jsonfile = require('jsonfile')
var kataListPath = 'assets/daftar-kata.json';
var kbbiListPath = 'assets/kbbi/';
let artiKataUrl = 'http://kbbi.co.id/arti-kata/';
let rowIndex = 31487;

try {

  jsonfile.readFile(kataListPath, function(err, daftarKataList) {

    let s = luwak(artiKataUrl + daftarKataList[rowIndex].uri)
    .use(userAgent('Googlebot/2.1 (+http://www.google.com/bot.html)'))
    .filter('sanitizeUrl', function (value) {
      return value.replace(artiKataUrl, '').replace('http://www.kbbi.co.id/arti-kata', '');
    })
    .select({
      $root: '#main',
      arti: ['p.arti@html'],
      similar: {
        $root: 'div[class="list-kata"]',
        uri: ['a@href|sanitizeUrl'],
        keyword: ['a']
      }
    })
    .next(function() {
      return artiKataUrl + daftarKataList[rowIndex].uri;
    })
    .limit(daftarKataList.length)
    .fetch(function(row) {
      console.log(artiKataUrl + daftarKataList[rowIndex].uri, rowIndex);
      let _smilar = [];
      for (var i in row['similar']['uri']) {
        _smilar.push({
          uri: row['similar']['uri'][i],
          keyword: row['similar']['keyword'][i]
        });
      }
      row.similar = _smilar;
      jsonfile.writeFile(kbbiListPath +daftarKataList[rowIndex].uri+'.json', row, function (err) {
        // console.error(err)
      });
      rowIndex++;
    })
    .then(data => {
      console.log('-------------- FINISHED');
    })
    .catch(err => console.error(err.stack));

  })

} catch(e) {
  console.error(e.stack);
}
