'use strict'
let jsonfile = require('jsonfile');
let async = require('async');
let kataListPath = 'assets/daftar-kata.json';
let bundlingFile = [];
var bundlingFilePath = 'assets/kbbi-bundle.json';
let daftarKataList = [];

function readFileJSON(daftarKataList, index) {
  if(daftarKataList[index]) {
    console.log('./assets/kbbi/'+daftarKataList[index].uri+'.json');
    jsonfile.readFile('./assets/kbbi/'+daftarKataList[index].uri+'.json', function(err, kbbi){
      // bundlingFile.push({uri: daftarKataList[index].uri, arti: kbbi.arti});
      bundlingFile.push([`UPDATE kbbi SET arti=? WHERE uri=?`, [JSON.stringify(kbbi.arti), daftarKataList[index].uri]]);
      readFileJSON(daftarKataList, ++index);
    });
  } else {
    jsonfile.writeFile(bundlingFilePath, bundlingFile, function (err) {
      console.log('bundlingFile is written as JSON file');
      console.error(err);
    })
  }
}


jsonfile.readFile(kataListPath, function(err, _daftarKataList) {
  daftarKataList = _daftarKataList;
  readFileJSON(daftarKataList, 0);
});
