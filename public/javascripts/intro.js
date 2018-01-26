var angleCnt = 0; //이미지 돌리기 횟수
var resultArr; // select 선택 시 유효성 검사를 위한 text Array

$(document).ready(function () {

    jQuery.fn.center = function () {
        this.css("position","absolute");
        this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px");
        this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");
        return this;
    }
    showPopup = function() {
    
    $("#popLayer").show();
    $("#popLayer").center();
    $('#save_btn').attr("disabled","disabled");
    $('#save_btn').css("opacity","0.5");
    }
    
    //업로드 모달
    $('#upload_btn').click(function(){
        
        $('#formSelect').val("1").prop("selected", true);
        $("#uploadFile").val("");
        var createPopLayer = '<div id="popLayer">'
                             +'<div id="img_upload" class="modal_box w600" style="height: 65%;">'
                             +'<header><a href="#"  class="js-modal-close close popupclose">X</a><h3 style="margin: 10px;">Image upload</h3></header>'
                             +'<div class="modal-body" style=" height: 80%;"><div class="gallery_wrap"><div class="gallery"><div style=" height: 100%">'
                             +'<form id="uploadForm" enctype="multipart/form-data" action="/upload" method="post"><input type="hidden" name="rotation" id="rotation" />'
                             +'<div id="fileupload"><input type="file" name="uploadFile" id="uploadFile" style="display:inline;" /></div><p>'
                             +'<span style="width:60%;" class="fileName" id="uploadFileName">(선택된 파일 없음)</span>&nbsp;<label class="uploadBtn" for="uploadFile"></label>'
                             +'<input type="file" name="uploadFile" class="upload-hidden" id="uploadFile" accept="image/*" style="display:none;" /><a href="javascript://" class="uploadInit" ></a>'
                             +'</p></form><p> ※Size: 500*500kb 이내</p><img id="previewPic" url=""/ onerror="this.style.display="none;">'
                             +'<img id="previews"/><div id="formResultview"><div id="previewbtn"><center><input id="save_btn" class="btd_btn_result" type="image" src="/images/btd_05.png">'
                             +'<input  class="btd_btn_result popupclose" type="image" src="/images/btd_07.png"></center></div></div></div></div></div></div>'
                             +'<footer><a href="#" class="confirm" id="btn_fileupload"></a><a href="#" class="cancel js-modal-close"></a></footer></div>'; 
        $('#poplayerline').append(createPopLayer);
        $('#fileupload').hide();
       
        $('.popupclose').click(function(){
            
            $('#formSelect').val("1").prop("selected", true);
            $("#uploadFile").val("");
            $('#popLayer').remove();
        });  
        $('.uploadBtn').click(function(){
            $('#dataForm').css("background-color",'');
            $('#dataForm').css("background-image","URL('/images/box02.png')","background-size","100% 100%");
            $("#dataForm").children().remove();
        });

        $('#formSelect').change(function(){
            $('#dataForm').css("background-color",'white');
            $('#dataForm').css("background-image",'url("")');
            var option = $("#formSelect option:selected").val();
            if(option == '1')
            {
                $('#dataForm').css("background-color",'');
                $('#dataForm').css("background-image","URL('/images/box02.png')","background-size","100% 100%");
                $("#dataForm").children().remove();
            }
        });

        $('#uploadFile').change(function () {
            $('#rotation').val('');
            var extArr = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
            var uploadFile = $(this).val();
            var filename = uploadFile.split('/').pop().split('\\').pop();
            
            var lastDot = uploadFile.lastIndexOf('.');
            var fileExt = uploadFile.substring(lastDot + 1, uploadFile.length).toLowerCase();
            if ($.inArray(fileExt, extArr) != -1 && $(this).val() != '') {
                $('#uploadFileName').text(filename)
                $('#uploadForm').submit();
            } else {
                $(this).val('');            
                alert('파일 형식이 올바르지 않습니다.');
            }
        });
         //초기화
     $('.uploadInit').click(function(){
        $('#uploadFile').text('선택된 파일 없음');
        $('.upload-hidden').val("");
        $('input[name=uploadFile]').val("");
        $('#save_btn').css("opacity","0.5");
        $('#previews').removeAttr('src');
        $('#save_btn').attr("disabled","disabled");
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
                    $("#formSelect").val('');
                    $('#previews').attr('src', response);
                    
                    $('#save_btn').click(function(){
                        $('#img').attr('src', response);
                    });
                    $('#preview').attr('src', response);
                    processImage(response);                       

                    //if ($('#rotation').val().length > 0) {
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
        
        if (option != '1') {
            if (jQuery.inArray(option, resultArr) != -1) {
                var url = $('#img').attr('src');
                processImage(url);
            } else {              
                $('#dataForm').css("background-image","URL('/images/box02.png')","background-size","100% 100%");
                $('#dataForm').css("background-color","");
                $("#dataForm").children().remove();
                $("#formSelect").val('1');

                alert('해당 양식과 일치하지 않습니다.');
                
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
    //var sourceImageUrl = 'http://ocr-demo.azurewebsites.net/uploads/commercial_invoice.jpg';
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
                
                if ($('#previews').attr('src') != null) {
                $('#save_btn').removeAttr("disabled");
                $('#save_btn').css("opacity","1.0");
                }
               $('#save_btn').click(function(){
                    
                    $('#img').attr('src', sourceImageUrl);
                    $('#popLayer').remove();
                });
               
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
            '<textarea style="resize: none; width:95%; margin-left: 3%;">' + lineWordArr[3] + '\n' + lineWordArr[5] + '\n' + lineWordArr[6] + '\n' + lineWordArr[7] + '</textarea>' +
            '</td>' +
            '<td colspan="4">' +
            '<b>' + lineWordArr[1] + '</b><br />' +
            '<textarea style="resize: none; width:95%; margin-left: 3%;">' + lineWordArr[4] + '</textarea>' +
            '</td>' +
            '</tr>' +
            '<tr>' +
            '<td colspan="4">' +
            '<b>' + lineWordArr[8] + '</b><br />' +
            '<textarea style="resize: none; width:95%; margin-left: 3%;">' + lineWordArr[10] + '\n' + lineWordArr[12] + '\n' + lineWordArr[13] + '\n' + lineWordArr[14] + '</textarea>' +
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
    } else if (option == 'COMMERCIAL INVOICE') {
        appendHtml = '' +
            '<div style="width:90%; height: 3%; margin: 3% 5% 0 5%; border:1px solid black; font-size:18px; text-align:center;">' +
            '<b>' + lineWordArr[0] + '</b>' +
            '</div>' +
            '<div style="width:90%; height: 8%; margin: 4px 5% 0 5%; border:1px solid black;">' +
            '<b style="text-decoration: underline;">' + lineWordArr[1] + '</b>' +
            '<textarea style="resize:none; width:100%;">' + lineWordArr[2] + '\n' + lineWordArr[3] + '\n' + lineWordArr[4] + ' ' + lineWordArr[5] + ' ' + lineWordArr[7] +'</textarea>' +
            '</div>' +
            '<div style="width:90%; height: 8%; margin: 4px 5% 0 5%; border:1px solid black;">' +
            '<b style="text-decoration: underline;">' + lineWordArr[6] + '</b>' +
            '<textarea style="resize:none; width:100%;">' + lineWordArr[8] + '\n' + lineWordArr[9] + '\n' + lineWordArr[10] + lineWordArr[24] + '</textarea>' +
            '</div>' +
            '<div style="width:90%; height: 8%; margin: 4px 5% 0 5%; border:1px solid black;">' +
            '<b style="text-decoration: underline;">' + lineWordArr[11] + '</b>' +
            '<textarea style="resize:none; width:100%;">' + lineWordArr[12] + '</textarea>' +
            '</div>' +
            '<div style="width:90%; height: 5%; margin: 4px 5% 0 5%; border:1px solid black;">' +
            '<div style="float:left; width:50%; height:100%; border-right: 1px solid black;">' +
            '<b style="text-decoration: underline;">' + lineWordArr[13] + '</b>' +
            '<input type="text" style="width:100%;" value="' + lineWordArr[14] + '"/>' +
            '</div>' +
            '<div style="float:left; width:50%; height:100%;">' +
            '<b style="text-decoration: underline;">' + lineWordArr[25] + '</b>' +
            '<input type="text" style="width:100%;" />' +
            '</div>' +
            '</div>' +
            '<div style="width:90%; height: 5%; margin: 4px 5% 0 5%; border:1px solid black;">' +
            '<div style="float:left; width:50%; height:100%; border-right: 1px solid black;">' +
            '<b style="text-decoration: underline;">' + lineWordArr[15] + '</b>' +
            '<input type="text" style="width:100%;" value="' + lineWordArr[16] + '""/>' +
            '</div>' +
            '<div style="float:left; width:50%; height:100%;">' +
            '<b style="text-decoration: underline;">' + lineWordArr[26] + '</b>' +
            '<input type="text" style="width:100%;" value="' + lineWordArr[27] + '"/>' +
            '</div>' +
            '</div>' +
            '<div style="width:90%; height: 5%; margin: 4px 5% 0 5%; border:1px solid black;">' +
            '<div style="float:left; width:50%; height:100%; border-right: 1px solid black;">' +
            '<b style="text-decoration: underline;">' + lineWordArr[17] + '</b>' +
            '<input type="text" style="width:100%;" value="' + lineWordArr[18] + '""/>' +
            '</div>' +
            '<div style="float:left; width:50%; height:100%;">' +
            '<b style="text-decoration: underline;">' + lineWordArr[28] + '</b>' +
            '<input type="text" style="width:100%;" />' +
            '</div>' +
            '</div>' +
            '<div style="width:90%; height: 40%; margin: 4px 5% 0 5%; border:1px solid black;">' +
            '<b style="text-decoration: underline;">' + lineWordArr[19] + '</b>' +
            '<br /><br />' +
            '<table style="width:100%;">' +
            '<colgroup>' +
            '<col style="width:5%;" />' +
            '<col style="width:45%;" />' +
            '<col style="width:15%;" />' +
            '<col style="width:16%;" />' +
            '<col style="width:19%;" />' +
            '</colgroup>' +
            '<tr style="border-bottom:1px solid black;">' +
            '<th> </th>' +
            '<th style="text-align:center;">' + lineWordArr[20] + '</th>' +
            '<th style="text-align:center;">' + lineWordArr[29] + '</th>' +
            '<th style="text-align:center;">' + lineWordArr[30] + '</th>' +
            '<th style="text-align:center;">' + lineWordArr[36] + '</th>' +
            '</tr>' +
            '<tr>' +
            '<td>1</td>' +
            '<td style="text-align:center;"><textarea style="width:90%; height:70px; resize:none;">' + lineWordArr[21] + '\n' + lineWordArr[22] + '\n' + lineWordArr[23] + '\n' + lineWordArr[31] + ' ' + lineWordArr[33] +'</textarea></td>' +
            '<td style="text-align:center;"><input type="text" style="width:90%;" value="3EA" /></td>' +
            '<td style="text-align:center;"><input type="text" style="width:90%;" value="" /></td>' +
            '<td style="text-align:center;"><input type="text" style="width:90%;" value="' + lineWordArr[37] +'" /></td>' +
            '</tr>' +
            '<tr style="border-top:1px solid black;">' +
            '<th> </th>' +
            '<th style="text-align:center;">TOTAL</th>' +
            '<td style="text-align:center;"><input type="text" style="width:90%;" value="" /></td>' +
            '<td style="text-align:center;"><input type="text" style="width:90%;" value="" /></td>' +
            '<td style="text-align:center;"><input type="text" style="width:90%;" value="' + lineWordArr[38] +'" /></td>' +
            '</tr>' +
            '</table>' +
            '<br />' +
            '<div style="width:100%;">' +
            '<b style="margin-left: 35%;">' + lineWordArr[35] +'</b>' +
            '<br /><br />' +
            '<b style="margin-left: 5%;">' + lineWordArr[32] +'</b>' +
            '<b style="margin-left: 5%; text-decoration: underline; font-size:12px;">' + lineWordArr[40] +'</b>' +
            '</div>' +
            '<br />' +
            '<div style="float:right;">' +
            '<span>' + lineWordArr[41] +'</span>' +
            '<br /><br /><br />' +
            '<span>' + lineWordArr[42] + ' ' + lineWordArr[43] +'</span>' +
            '</div>' +
            '</div>';
    }

    return appendHtml;
}
    });
    
   
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

