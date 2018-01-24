﻿var angleCnt = 0; //이미지 돌리기 횟수
var resultArr; // select 선택 시 유효성 검사를 위한 text Array

$(document).ready(function () {
    //$('#formResult').hide();

    $('#uploadFile').change(function () {
        $('#rotation').val('');
        var extArr = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
        var uploadFile = $(this).val();
        var lastDot = uploadFile.lastIndexOf('.');
        var fileExt = uploadFile.substring(lastDot + 1, uploadFile.length).toLowerCase();
        if ($.inArray(fileExt, extArr) != -1 && $(this).val() != '') {
            $('#uploadForm').submit();
        } else {
            $(this).val('');            
            alert('파일 형식이 올바르지 않습니다.');
        }
    });

    /*$('#rotateBtn').click(function () {
        $('#formResult').hide();
        $('#result > tbody').html('<tr><td colspan= "2" align= "center" > 대기중..</td ></tr >');
        $('#uploadForm').submit();
    });*/

    /*$('#formBtn').click(function () {
        if ($('#formResult').css('display') == 'none') {
            $('#formResult').show();
        } else {
            $('#formResult').hide();
        }        
    });*/

    $('#uploadForm').submit(function () {
        if ($('#uploadFile').val() != '') {
            $(this).ajaxSubmit({
                error: function (xhr) {
                    console.log(xhr);
                    console.log('local에서 확인용으로');
                    //status('Error: ' + xhr.status);
                },
                success: function (response) {
                    $('#img').attr('src', response);
                    $('#preview').attr('src', response);
                    //if ($('#rotation').val().length > 0) {
                    processImage(response);                       
                    //}
                }
            });
        } else {
            alert('파일이 비어 있습니다.');
        }        
        return false;
    });
    /*
    $('#test1').click(function(){
        $('#dataForm').css('height','800px');
        processImage('http://hyjocr.azurewebsites.net/uploads/ocr01.jpg');
    });
    $('#test2').click(function(){
        $('#dataForm').css('height','900px');
        processImage('http://hyjocr.azurewebsites.net/uploads/ocr02.jpg');
    });
    */
    $('#insertBtn').click(function () {
        var resultJson = new Array();
        for (var i = 0; i < $('.location').length; i++) {
            var item = new Object();
            item.location = $('.location')[i].firstChild.nodeValue;
            item.word = $('.text')[i].value;
            resultJson.push(item);
        }
        
        if (resultJson != null && resultJson != '') {
            $.ajax({
                url: '/db/insert',
                type: 'post',
                data: JSON.stringify(resultJson),
                contentType: 'application/json',
                success: function (data) {
                    //console.log(data);
                },
                error: function (err) {
                    console.log(err);
                }
            });
        } else {
            alert('결과가 완료되면 저장할 수 있어요');
        }
        
    });

    //image rotation
    $('.floatLeft').mouseover(function () {
        if ($('#img').attr('src') != null) {
            $('#rotBtn').show();
        }
    }).mouseout(function () {
        $('#rotBtn').hide();
    });
    $('#rotBtn').click(function (e) {
        angleCnt++;
        var angle = 90 * (angleCnt % 4);
        $('#img').rotate(angle);
        $('#rotation').val(angle);

    });

    $('#formSelect').change(function (e) {
        var option = $("#formSelect option:selected").val();
        if (option != '') {
            if (jQuery.inArray(option, resultArr) != -1) {
                var url = $('#img').attr('src');
                processImage(url);
            } else {              
                alert('해당 양식과 일치하지 않습니다.');
                $("#formSelect").val('');
            }    
        }

    })
});

function processImage(url) {
    $('#dataForm').html('');
    var subscriptionKey = "fedbc6bb74714bd78270dc8f70593122";
    var uriBase = "https://westus.api.cognitive.microsoft.com/vision/v1.0/ocr";


    // Request parameters.
    var params = {
        "language": "unk",
        "detectOrientation": "true",
    };

    // image url
    var sourceImageUrl = url;
    //var sourceImageUrl = 'http://ocr-demo.azurewebsites.net/uploads/packing_List.jpg';

    // Perform the REST API call.
    $.ajax({
        url: uriBase + "?" + $.param(params),

        // Request headers.
        beforeSend: function (jqXHR) {
            jqXHR.setRequestHeader("Content-Type", "application/json");
            jqXHR.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },

        type: "POST",

        // Request body.
        data: '{"url": ' + '"' + sourceImageUrl + '"}',
    })

        .done(function (data) {
            //appendTable(data.regions);
            //appendForm(data.regions)
            //console.log(data);
            //$("#responseTextArea").val(JSON.stringify(data, null, 2));
            if ($('#rotation').val() == '') {
                addTextOfLine(data.regions);
                $('#rotation').val('0');
                $('#img').attr('src', sourceImageUrl);
            } else {
                $('#rotation').val('');
                appendDataForm(data.regions);
            }           
        })

        .fail(function (jqXHR, textStatus, errorThrown) {
            var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
            errorString += (jqXHR.responseText === "") ? "" : (jQuery.parseJSON(jqXHR.responseText).message) ?
                jQuery.parseJSON(jqXHR.responseText).message : jQuery.parseJSON(jqXHR.responseText).error.message;
            alert(errorString);
        });
};

function addTextOfLine(data) {
    resultArr = new Array();
    for (var i = 0; i < data.length; i++) {
        var lines = data[i].lines;
        for (var j = 0; j < lines.length; j++) {
            var words = lines[j].words;
            var textTmp = '';
            for (var k = 0; k < words.length; k++) {
                textTmp += words[k].text + (k == data[i].lines[j].words.length - 1 ? '' : ' ');
            }
            resultArr.push(textTmp);
        }
    }
}

function appendDataForm(data) {
    // id : dataForm , tag : div
    var formHTML = '';
    var option = $("#formSelect option:selected").val();
    var lineWordArr = new Array();
    var lineLctArr = new Array();
    for (var i = 0; i < data.length; i++) {
        var lines = data[i].lines;       
        for (var j = 0; j < lines.length; j++) {
            var location = lines[j].boundingBox;
            var words = lines[j].words;
            var lineWord = '';
            lineLctArr.push(location);
            for (var k = 0; k < words.length; k++) {
                var text = words[k].text;
                lineWord += text + (k == words.length - 1 ? '' : ' ');
            }
            lineWordArr.push(lineWord);
        }      
    }

    $('#dataForm').html('');
    formHTML = makeForm(option, lineWordArr, lineLctArr);
    $('#dataForm').append(formHTML);
}

function makeForm(option, lineWordArr, lineLctArr) {
    var appendHtml;
    for (var i = 0; i < lineWordArr.length; i++) {
        console.log(i + ' / ' +lineWordArr[i]);
    }
    if (option == 'PACKING LIST') {
        appendHtml = '' +
        '<div style="width:90%; height: 90%; margin: 5%; border:2px solid black;">' +
        '<table border="1" style="width:100%;">' +
        '<colgroup>' +
        '<col style="width: 12.5%" />' +
        '<col style="width: 12.5%" />' +
        '<col style="width: 12.5%" />' +
        '<col style="width: 12.5%" />' +
        '<col style="width: 12.5%" />' +
        '<col style="width: 12.5%" />' +
        '<col style="width: 12.5%" />' +
        '<col style="width: 12.5%" />' +
        '</colgroup>' +
        '<tr>' +
        '<th colspan="8" style="text-align:center; font-size:18px;">' + lineWordArr[0] + '</th>' +
        '</tr>' +
        '<tr>' +
        '<td colspan="4">' +
        '<b>' + lineWordArr[2] + '</b><br />' +
        '<textarea style="resize: none; width:95%; margin-left: 3%;">' + lineWordArr[3] + '\n' + lineWordArr[5] + '\n' + lineWordArr[6] + '\n'+ lineWordArr[7] +'</textarea>' +
        '</td>' +
        '<td colspan="4">' +
        '<b>' + lineWordArr[1] + '</b><br />' +
        '<textarea style="resize: none; width:95%; margin-left: 3%;">' + lineWordArr[4] + '</textarea>' +
        '</td>' +
        '</tr>' +
        '<tr>' +
        '<td colspan="4">' +
        '<b>' + lineWordArr[8] + '</b><br />' +
        '<textarea style="resize: none; width:95%; margin-left: 3%;">' + lineWordArr[10] + '\n' + lineWordArr[12] + '\n' + lineWordArr[13] + '\n' + lineWordArr[14] +'</textarea>' +
        '</td>' +
        '<td colspan="4">' +
        '<b>' + lineWordArr[9] + '</b><br />' +
        '<textarea style="resize: none; width:95%; margin-left: 3%;">' + lineWordArr[11] + '\n' + lineWordArr[42] + '</textarea>' +
        '</td>' +
        '</tr>' +
        '<tr>' +
        '<td colspan="4">' +
        '<b>' + lineWordArr[15] + '</b><br />' +
        '<input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[16] + '"/>' +
        '</td>' +
        '<td colspan="4">' +
        '<b>' + lineWordArr[43] + '</b><br />' +
        '</td>' +
        '</tr>' +
        '<tr>' +
        '<td colspan="2">' +
        '<b>' + lineWordArr[17] + '</b><br />' +
        '<input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[18] + '"/>' +
        '</td>' +
        '<td colspan="2">' +
        '<b>' + lineWordArr[36] + '</b><br />' +
        '<input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[37] + '"/>' +
        '</td>' +
        '<td colspan="4" rowspan="2"></td>' +
        '</tr>' +
        '<tr>' +
        '<td colspan="2">' +
        '<b>' + lineWordArr[19] + '</b><br />' +
        '<input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[20] + '"/>' +
        '</td>' +
        '<td colspan="2">' +
        '<b>' + lineWordArr[38] + '</b><br />' +
        '<input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[39] + '"/>' +
        '</td>' +
        '</tr>' +
        '<tr>' +
        '<td colspan="2" style="text-align:center;">' + lineWordArr[21] + '</td>' +
        '<td colspan="2" style="text-align:center;">' + lineWordArr[40] + '</td>' +
        '<td style="text-align:center;">' + lineWordArr[44] + '</td>' +
        '<td style="text-align:center;">' + lineWordArr[45] + '</td>' +
        '<td style="text-align:center;">' + lineWordArr[59] + '</td>' +
        '<td style="text-align:center;">' + lineWordArr[61] + '</td>' +
        '</tr>' +
        '</table>' +
        '<table style="width:100%;">' +
        '<colgroup>' +
        '<col style="width: 25%" />' +
        '<col style="width: 25%" />' +
        '<col style="width: 12.5%" />' +
        '<col style="width: 12.5%" />' +
        '<col style="width: 12.5%" />' +
        '<col style="width: 12.5%" />' +
        '</colgroup>' +
        '<tr>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[22] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[41] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value=""></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[46] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[60] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[22] + '"></td>' +
        '</tr>' +
        '<tr>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[23] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[63] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '</tr>' +
        '<tr>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[24] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[64] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[76] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[47] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '</tr>' +
        '<tr>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[25] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[65] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[77] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[48] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '</tr>' +
        '<tr>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[26] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[66] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[78] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[49] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '</tr>' +

        '<tr>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[27] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[67] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[79] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[50] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '</tr>' +
        '<tr>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[28] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[68] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value=""></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[51] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '</tr>' +
        '<tr>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[29] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[69] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[80] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[52] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '</tr>' +
        '<tr>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[30] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[70] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[81] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[53] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '</tr>' +
        '<tr>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[31] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[71] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[82] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[54] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '</tr>' +
        '<tr>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[32] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[72] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[83] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[55] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '</tr>' +
        '<tr>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[33] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[73] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[84] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[56] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '</tr>' +
        '<tr>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[34] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[74] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[85] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[57] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '</tr>' +
        '<tr>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[35] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[75] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[86] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[58] + '"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '<td><input type="text" style="width:95%; margin-left: 3%;"></td>' +
        '</tr>' +
        '</table>' +
        '<br />' +
        '<div style="margin-left: 60%;">' +
        '<span>' + lineWordArr[87] + '</span><br /><br />' +
        '<span>' + lineWordArr[88] + '</span>' +
        '</div>' +
        '</div>';
    }

    return appendHtml;
}
/*
function appendTable(data) {
    $('#result > tbody').html('');
    //resultJson = data;
    var htmlText = '';
    for (var i = 0; i < data.length; i++) { // 지역 단위
        var lines = data[i].lines;
        for (var j = 0; j < lines.length; j++) { // 라인 단위
            htmlText += '<tr>';
            var location = lines[j].boundingBox;
            var words = lines[j].words;
            htmlText += '<td class="location">' + location + '</td><td>';
            htmlText += '<input type="text" class="text" value="';
            for (var k = 0; k < words.length; k++) { // 각 단어
                var text = words[k].text;
                htmlText += text + (k == words.length-1 ? '' : ' ');
            }
            htmlText += '"/></td></tr>';
        }
    }
    $('#result > tbody').append(htmlText);
}
*/
/*
function appendForm(data) {
    $('#formResult').html('');
    var htmlText = '';
    for (var i = 0; i < data.length; i++) { // 지역 단위
        var lines = data[i].lines;
        for (var j = 0; j < lines.length; j++) { // 라인 단위
            htmlText += '<p>';
            var location = lines[j].boundingBox.split(',');
            var words = lines[j].words;
            htmlText += '<input type="text" class="formText" style="position: absolute; left:' + location[0] + 'px; top: ' + location[1]+'px;" value="';
            for (var k = 0; k < words.length; k++) { // 각 단어
                var text = words[k].text;
                htmlText += text + (k == words.length - 1 ? '' : ' ');
            }
            htmlText += '"/></td></p>';
        }
    }
    $('#formResult').css('width', $('#preview').width() + 'px');
    $('#formResult').css('height', $('#preview').height() + 'px');
    $('#formResult').append(htmlText);
}
*/