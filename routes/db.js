var express = require('express');
var router = express.Router();
var sql = require('mssql');

var config = {
    user: 'faxtime',
    password: 'test2016!',
    server: 'faxtimedb.database.windows.net',
    database: 'taihoML2',
    options: {
        encrypt: true,
        database: 'taihoML2'
    }
}

var connection = sql.connect(config);

router.post('/insert', function (req, res) {
    var result = req.body;
    //console.log(result);
    
    for (var i = 0; i < result.length; i++) {
        insertInfo(result[i].location, result[i].word);
    }
    
});

//좌표, 텍스트 INSERT
function insertInfo(location, word) {
    connection.then(function () {
        var request = new sql.Request();
        request.query("insert into TBL_OCR (location, word) values ('" + location + "', '" + word.replace(/'/gi, "''") + "')")
            .then(function (recordset) {
                //console.log(recordset);
                //console.log('Affected: ' + request.rowsAffected);
            }).catch(function (err) {
                console.log('Request error: ' + err);
            });
    }).catch(function (err) {
        if (err) {
            console.log('SQL Connection Error: ' + err);
        }
    });
}

module.exports = router;