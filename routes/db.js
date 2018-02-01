var express = require('express');
var router = express.Router();

var sql = require('mssql');
var dbConfig = require('../config/dbConfig');
var queryConfig = require('../config/queryConfig');

router.post('/insertOrigin', function (req, res) {
    var result = req.body;
    
    var contents1 = result.contents1.split('\r\n');
    var contents2 = result.contents2.split('\r\n');;
    var contents3 = result.contents3;
    var contents4 = result.contents4;
    var contents5 = result.contents5;
    var contents6 = result.contents6;
    var contents7 = result.contents7;
    var contents8 = result.contents8;
    var contents9 = result.contents9;
    var contents10 = result.contents10;
    var contents11 = result.contents11;
    var contents12 = result.contents12;
    var contents13 = result.contents13;
    var contents14 = result.contents14;
    var contents15 = result.contents15;
    var contents16 = result.contents16;
    
    var shpperTelNum = contents1[2].substring(contents1[2].indexOf('TEL')+3, contents1[2].indexOf('FAX')-1);
    var shpperFaxNum = contents1[2].substring(contents1[2].indexOf('FAX')+3);
    var consigneeTelNum = contents2[2].substring(contents2[2].indexOf('TEL')+3, contents2[2].indexOf('FAX')-1);
    var consigneeFaxNum = contents2[2].substring(contents2[2].indexOf('FAX')+3);

    (async () => {
        try {
            let pool = await sql.connect(dbConfig);
            let sqlResult = await pool.request()
            .input('shpperName', sql.NVarChar, contents1[0].trim())
            .input('shpperAddress', sql.NVarChar, contents1[1].trim())
            .input('shpperTel', sql.NVarChar, shpperTelNum.trim())
            .input('shpperFax', sql.NVarChar, shpperFaxNum.trim())
            .input('consigneeName', sql.NVarChar, contents2[0].trim())
            .input('consigneeAddress', sql.NVarChar, contents2[1].trim())
            .input('consigneeTel', sql.NVarChar, consigneeTelNum.trim())
            .input('consigneeFax', sql.NVarChar, consigneeFaxNum.trim())
            .input('notifyParty', sql.NVarChar, contents3.trim())
            .input('invoiceNo', sql.NVarChar, contents4.trim())
            .input('dateOfShipment', sql.NVarChar, contents5.trim())
            .input('portOfLoading', sql.NVarChar, contents6.trim())
            .input('portOfDischarge', sql.NVarChar, contents7.trim())
            .input('tonCylinderOrigin', sql.NVarChar, contents8.trim())
            .input('tonCylinderNumber', sql.NVarChar, contents9.trim())
            .input('descriptionOfGoods', sql.NVarChar, '')
            .input('totalQuantity', sql.NVarChar, contents14.split('EA')[0].trim())
            .input('totalUnitPrice', sql.NVarChar, contents15.trim())
            .input('totalAmount', sql.NVarChar, contents16.trim())
            .query(queryConfig.insertOriginDoc);

            let rows = sqlResult.recordset;

            sqlResult = await pool.request()
            .query(queryConfig.selectOriginDocNo);
            rows = sqlResult.recordset;
            let docNo = rows[0].docNo;

            sqlResult = await pool.request()
            .input('docNo', sql.Int, docNo)
            .input('itemName', sql.NVarChar, contents10.trim())
            .input('itemQuantity', sql.NVarChar, contents11.split('EA')[0].trim())
            .input('itemUnitPrice', sql.NVarChar, contents12.trim())
            .input('itemAmount', sql.NVarChar, contents13.trim())
            .query(queryConfig.insertOriginItem);           
            rows = sqlResult.recordset;

            res.send({'status' : 200});
        } catch (err) {
            console.log(err)
            res.send({'status' : 500});
        } finally {
            sql.close();
        }
    })()

    sql.on('error', err => {
    })
});

module.exports = router;