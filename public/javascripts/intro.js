var angleCnt = 0; //이미지 돌리기 횟수
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
    var uriBase = "https://westus.api.cognitive.microsoft.com/vision/v1.0";


    // Request parameters.
    var params = {
        "language": "unk",
        "detectOrientation": "true",
    };

    // image url
    //var sourceImageUrl = url;
    var sourceImageUrl = 'http://ocr-demo.azurewebsites.net/uploads/test.jpg';

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

function makeForm(option, lineWordArr, lineLctArr){
    var HtmlCode = '';
    if(option == 'DEBIT NOTE'){
        HtmlCode = ''+
        '<div class="formTop">' +
            '<br/>' +
           lineWordArr[0] +
            '<p style="float:right;">'+lineWordArr[1]+'</p>' +
            '<hr style="clear:both; border-color:gray; margin: 0;"/>' +
        '</div>' +
        '<div class="formBody">' +
            '<p style="float:right;">'+lineWordArr[2]+'</p>' +
            '<div style="clear:both; text-align:center; font-weight:bold;">'+lineWordArr[3]+'</div> ' +         
            '<div style="padding: 0 20px 0 20px;">' +
                '<p style="float:left;"><br/>'+lineWordArr[4]+'<br/>'+lineWordArr[5]+'</p>' +
                '<table border="1" style="float:right;">' +
                   '<tr>' +
                        '<th width="80px;">'+lineWordArr[6]+'</th>' +
                        '<td>'+lineWordArr[10]+'</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<th width="80px;">'+lineWordArr[7]+'</th>' +
                        '<td>'+lineWordArr[11]+'</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<th width="80px;">'+lineWordArr[8]+'</th>' +
                        '<td>'+lineWordArr[12]+'</td>' +
                    '</tr>' +
                '</table>' +
                '<p style="clear:both;">'+lineWordArr[13]+'</p>' +
                '<hr style="border-color:gray; margin: 0;"/>' +
                '<div style="float:left; width:50%; line-height:1.6;">' +
                    lineWordArr[14]+'<br/>' +
                    lineWordArr[15]+'<br/>' +
                    lineWordArr[16]+'<br/>' +
                    lineWordArr[17]+'<br/>' +
                    lineWordArr[18]+'<br/>' +
                    lineWordArr[19]+'<br/>' +
                    lineWordArr[20]+'<br/>' +
                    lineWordArr[21]+'<br/>' +
                    lineWordArr[22]+'<br/>' +
                    lineWordArr[23]+'<br/>' +
                    lineWordArr[24]+'<br/>' +
                    lineWordArr[25]+'<br/>' +
                    lineWordArr[26]+'<br/>' +
                    lineWordArr[27]+
                '</div>' +
                '<div style="float:left; width:50%;">' +
                    '<input type="text" value="" style="width:100%;" />' +
                    '<input type="text" value="'+lineWordArr[28]+'" style="width:100%;"/>' +
                    '<input type="text" value="'+lineWordArr[29]+'" style="width:100%;" />' +
                    '<input type="text" value="'+lineWordArr[30]+'" style="width:100%;" />' +
                    '<input type="text" value="'+lineWordArr[31]+'" style="width:100%;" />' +
                    '<input type="text" value="'+lineWordArr[32]+'" style="width:100%;" />' +
                    '<input type="text" value="'+lineWordArr[33]+'" style="width:100%;" />' +
                    '<input type="text" value="" style="width:100%;" />' +
                    '<input type="text" value="'+lineWordArr[34]+'" style="width:100%;" />' +
                    '<input type="text" value="'+lineWordArr[35]+'" style="width:100%;" />' +
                    '<input type="text" value="'+lineWordArr[36]+'" style="width:100%;" />' +
                    '<input type="text" value="'+lineWordArr[37]+'" style="width:100%;" />' +
                '</div>' +
                '<p>'+lineWordArr[39]+'</p>' +
                lineWordArr[40]+' '+lineWordArr[41]+'<br/>' +
                lineWordArr[42]+'<br/>' +
                lineWordArr[43]+' '+ lineWordArr[45] +'<br/>' +
                lineWordArr[44]+' '+ lineWordArr[46] +'<br/>' +
                lineWordArr[47]+'<br/> ' +              
            '</div>' +      
        '</div>' +
        '<div class="formBottom">' +
            '<br/>' +
            '<div style="float:left;">'+lineWordArr[49]+'<br/>'+lineWordArr[50]+' '+lineWordArr[51]+'</div>' +
            '<div style="float:right; font-size:11px;">' +
                lineWordArr[52]+'<br />' +
                lineWordArr[53]+'<br/>' +
                lineWordArr[54]+'<br />' +
                lineWordArr[55]+'<br />' +
            '</div>' +   
        '</div>';
        return HtmlCode;
    } else if (option == ') 재보험통지서') {
        /*
        좌표 sort (기준 위에서 아래로 왼쪽에서 오른쪽으로), 순서로 정렬해도 그림의 각도에 따라 좌표가 제각각.. , 정적 코딩보단 위험부담 낮음
        */
        for (var i = 0; i < lineLctArr.length; i++) {
            for (var j = 0; j < lineLctArr.length - 1 - i; j++) {
                if (Number(lineLctArr[j].split(',')[1]) > Number(lineLctArr[j + 1].split(',')[1])) {
                    var lctTemp = lineLctArr[j];
                    var wordTemp = lineWordArr[j];

                    lineLctArr[j] = lineLctArr[j + 1];
                    lineLctArr[j + 1] = lctTemp;
                    lineWordArr[j] = lineWordArr[j + 1];
                    lineWordArr[j + 1] = wordTemp;
                } else if (Number(lineLctArr[j].split(',')[1]) == Number(lineLctArr[j + 1].split(',')[1])) {
                    if (Number(lineLctArr[j].split(',')[0]) > Number(lineLctArr[j + 1].split(',')[0])) {
                        var lctTemp = lineLctArr[j];
                        var wordTemp = lineWordArr[j];

                        lineLctArr[j] = lineLctArr[j + 1];
                        lineLctArr[j + 1] = lctTemp;
                        lineWordArr[j] = lineWordArr[j + 1];
                        lineWordArr[j + 1] = wordTemp;
                    }
                }
            }          
        }

        HtmlCode = ''
            +'<div style="padding:5px;">'
            + '<br/><p>'+lineWordArr[0]+'</p>'
            + '<h4 style="text-align:center;">' + lineWordArr[2] + lineWordArr[1] +'</h4>'
            + '<h5 style="text-align:center;">' + lineWordArr[4] + lineWordArr[3] +'</h5>'
            + '<table class="table table-bordered">'
            + '<tr>'
            + '<th>' + lineWordArr[5] +'</th>'
            + '<td colspan="3">' + lineWordArr[6] +'</td>'
            + '</tr>'
            + '<tr>'
            + '<th>' + lineWordArr[8] +'</th>'
            + '<td>' + lineWordArr[7] +' </td>'
            + '<th>' + lineWordArr[9] +'</th>'
            + '<td>' + lineWordArr[10] +'</td>'
            + '</tr>'
            + '<tr>'
            + '<th>' + lineWordArr[12] +'</th>'
            + '<td>' + lineWordArr[11] +'</td>'
            + '<th>' + lineWordArr[13] +'</th>'
            + '<td></td>'
            + '</tr>'
            + '</table>'
            + '<br/>'
            + '<p>'+ lineWordArr[15] + lineWordArr[14] +'</p>'
            + '<table class="table table-bordered">'
            + '<tr>'
            + '<th>' + lineWordArr[16] +'</th>'
            + '<td>' + lineWordArr[18] +'</td>'
            + '<th>' + lineWordArr[17] +'</th>'
            + '<td>' + lineWordArr[19] +'</td>'
            + '<th>' + lineWordArr[20] +'</th>'
            + '<td>' + lineWordArr[21] +'</td>'
            + '</tr>'
            + '<tr>'
            + '<th>' + lineWordArr[22] +'</th>'
            + '<td>' + lineWordArr[23] +'</td>'
            + '<th>' + lineWordArr[24] +'</th>'
            + '<td colspan="4">' + lineWordArr[26] + lineWordArr[25] +'</td>'
            + '</tr>'
            + '<tr>'
            + '<th>' + lineWordArr[27] +'</th>'
            + '<td>' + lineWordArr[29] +'</td>'
            + '<th>' + lineWordArr[30] +'</th>'
            + '<td>' + lineWordArr[31] +'</td>'
            + '<th>' + lineWordArr[28] +'</th>'
            + '<td></td>'
            + '</tr>'
            + '<tr>'
            + '<th>' + lineWordArr[32] +'</th>'
            + '<td>' + lineWordArr[33] +'</td>'
            + '<th>' + lineWordArr[34] +'</th>'
            + '<td>' + lineWordArr[35] +'</td>'
            + '<th>' + lineWordArr[36] +'</th>'
            + '<td></td>'
            + '</tr>'
            + '</table>'
            + '<p>' + lineWordArr[38] + lineWordArr[37] +'</p>'
            + '<textarea style="width:100%; height:100px; resize:none;">' + lineWordArr[40]+ lineWordArr[41] + lineWordArr[42] + lineWordArr[43]+'</textarea>'
            + '<p>' + lineWordArr[44] + lineWordArr[45] +'</p>'
            + '<table class="table table-bordered" style="font-size: 11px; text-align:center;">'
            + '<tr>'
            + '<th rowspan="2" style="width: 60px;">' + lineWordArr[50] +'</th>'
            + '<th rowspan="2">' + lineWordArr[49] +'(%) </th>'
            + '<th rowspan="2">' + lineWordArr[51] +'</th>'
            + '<th colspan="2">' + lineWordArr[46] +'</th>'
            + '<th colspan="3">' + lineWordArr[47] +'</th>'
            + '<th colspan="3">' + lineWordArr[48] +'</th>'
            + '</tr>'
            + '<tr>'
            + '<th>' + lineWordArr[52] +'</th>'
            + '<th>' + lineWordArr[53] +'</th>'
            + '<th>%</th>'
            + '<th>' + lineWordArr[54] +'</th>'
            + '<th>' + lineWordArr[56] +'</th>'
            + '<th>%</th>'
            + '<th>' + lineWordArr[55] +'</th>'
            + '<th>' + lineWordArr[58] +'</th>'
            + '</tr>'
            + '<tr>'
            + '<td>' + lineWordArr[59] +'</td>'
            + '<td>' + lineWordArr[60] +'</td>'
            + '<td>' + lineWordArr[61] +'</td>'
            + '<td>' + lineWordArr[62] +'</td>'
            + '<td>' + lineWordArr[63] +'</td>'
            + '<td>' + lineWordArr[64] +'</td>'
            + '<td>' + lineWordArr[65] +'</td>'
            + '<td>' + lineWordArr[66] +'</td>'
            + '<td></td>'
            + '<td></td>'
            + '<td></td>'
            + '</tr>'
            + '<tr>'
            + '<td>' + lineWordArr[67] +'</td>'
            + '<td>' + lineWordArr[68] +'</td>'
            + '<td>' + lineWordArr[69] +'</td>'
            + '<td>' + lineWordArr[70] +'</td>'
            + '<td>' + lineWordArr[71] +'</td>'
            + '<td>' + lineWordArr[73] +'</td>'
            + '<td>' + lineWordArr[72] +'</td>'
            + '<td>' + lineWordArr[74] +'</td>'
            + '<td>' + lineWordArr[76] +'</td>'
            + '<td>' + lineWordArr[75] +'</td>'
            + '<td>' + lineWordArr[77] +'</td>'
            + '</tr>'
            + '<tr>'
            + '<td>' + lineWordArr[78] +'</td>'
            + '<td>' + lineWordArr[79] +'</td>'
            + '<td>' + lineWordArr[80] +'</td>'
            + '<td>' + lineWordArr[81] +'</td>'
            + '<td>' + lineWordArr[82] +'</td>'
            + '<td>' + lineWordArr[83] +'</td>'
            + '<td>' + lineWordArr[84] +'</td>'
            + '<td>' + lineWordArr[85] +'</td>'
            + '<td>' + lineWordArr[86] +'</td>'
            + '<td>' + lineWordArr[87] +'</td>'
            + '<td>' + lineWordArr[88] +'</td>'
            + '</tr>'
            + '</table>'
            + '</div>';
            
            return HtmlCode;
    }else{
        return '';
    }
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