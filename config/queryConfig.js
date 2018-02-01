module.exports = {
    insertOriginDoc: '' +
    'INSERT INTO TBL_ORIGIN_DOC(' +
        'SHPPER_NAME,SHPPER_ADDRESS,SHPPER_TEL,SHPPER_FAX,' +
        'CONSIGNEE_NAME,CONSIGNEE_ADDRESS,CONSIGNEE_TEL,CONSIGNEE_FAX,' +
        'NOTIFY_PARTY,INVOICE_NO,DATE_OF_SHIPMENT,PORT_OF_LOADING,' +
        'PORT_OF_DISCHARGE,TON_CYLINDER_ORIGIN,TON_CYLINDER_NUMBER,' +
        'DESCRIPTION_OF_GOODS,TOTAL_QUANTITY,TOTAL_UNIT_PRICE,TOTAL_AMOUNT' +
    ') VALUES ('+
        '@shpperName,@shpperAddress,@shpperTel,@shpperFax,'+
        '@consigneeName,@consigneeAddress,@consigneeTel,@consigneeFax,'+
        '@notifyParty,@invoiceNo,@dateOfShipment,@portOfLoading,'+
        '@portOfDischarge,@tonCylinderOrigin,@tonCylinderNumber,'+
        '@descriptionOfGoods,@totalQuantity,@totalUnitPrice,@totalAmount'+
    ')'
    ,
    selectOriginDocNo: ''+
    'SELECT ' +
        'MAX(DOC_NO) AS docNo ' +
    'FROM ' +
        'TBL_ORIGIN_DOC '
    ,
    insertOriginItem: ''+
    'INSERT INTO TBL_ORIGIN_ITEM(' +
        'DOC_NO,ITEM_NAME,ITEM_QUANTITY,ITEM_UNIT_PRICE,ITEM_AMOUNT' +
    ') VALUES ('+
        '@docNo,@itemName,@itemQuantity,@itemUnitPrice,@itemAmount' +
    ')'
}