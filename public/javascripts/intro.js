//var angleCnt = 0; //이미지 돌리기 횟수
var resultArr; // select 선택 시 유효성 검사를 위한 text Array
var fieldArr; // 수정 유무 확인 (필드 단위 배열)
var fieldCount; // 입력란 개수
var modifyWord; // 수정된 단어 배열

$(function () {
    
    uploadModal();
    insertCompleteData();
});

//업로드 modal 및 이벤트 핸들러
function uploadModal(){
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
                            $('#formSelect').val('COMMERCIAL INVOICE').trigger('change');
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
    
        });
    });
}

//수정된 데이터 저장
function insertCompleteData(){
    $('#insertData').click(function(e){
        if($(e.target).attr('src') == '/images/btd_insert.png'){
            var params = $('#data').serializeArray();
            var modifyJson = new Array();
            for(var i = 0 ; i < modifyWord.length; i++){
                var itemArr = modifyWord[i].split('::');
                modifyJson.push({
                    'name' : itemArr[0],
                    'value' : itemArr[1],
                });
            }
            params[params.length] = {
                'name' : 'modify',
                'value' : modifyJson
            };
            
            $.ajax({
                url: '/db/insertComplete',
                type: 'post',
                data: JSON.stringify({'params' : params}),
                contentType: 'application/json; charset=UTF-8',
                success: function (data) {
                    if(data.status != 200){
                        alert('Complete Data insert Fail!');
                    }else{
                        alert('수정 완료!');
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            });
            
        }
    });
}
//OCR API 호출
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

//수정 유무 판단
function isWordModify(){
    var isModify = false;
    modifyWord = new Array();
    for(var i = 0 ; i < fieldArr.length; i ++){
        var contentsArr = $('#contents-' + (i+1)).val().replace( /\n/g, ' ').split(' ');
        var originArr = fieldArr[i].replace( /\n/g, ' ').split(' ');
        for(var j = 0 ; j < originArr.length; j++){
            if(originArr[j] != contentsArr[j]){
                var item = originArr[j] + "::" + contentsArr[j];
                modifyWord.push(item);
            }
        }
    }

    if(modifyWord.length > 0 ){
        isModify = true;
    }

    return isModify;
}

//전역변수에 결과값 라인 단위로 저장
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

//ocr 결과 데이터 가공 및 html append
function appendDataForm(data) {
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

    // 입력란 배열 저장
    fieldArr = new Array();
    $('textarea, input[type=text]').each(function(index, item){       
        fieldArr.push($(item).val());
        fieldCount = index + 1;
    });
    $('#paramCnt').val(fieldCount);

    $.ajax({
        url: '/db/insertOrigin',
        type: 'post',
        data: $('#data').serializeArray(),
        success: function (data) {
            if(data.status != 200){
                alert('Origin Data insert Fail!');
            }
        },
        error: function (err) {
            console.log(err);
        }
    });

    // 입력란 수정 유무 판단
    $('textarea, input[type=text]').keyup(function(e){
        if(isWordModify()){
            $('#insertData').attr('src','/images/btd_insert.png');
            $('#insertData').addClass('clicked');
        }else{
            $('#insertData').attr('src','/images/btd_insert_disable.png');
            $('#insertData').removeClass('clicked');
        }
    });
}

//html 만들기
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
            '<textarea id="contents-1" style="resize: none; width:95%; margin-left: 3%;">' + lineWordArr[3] + '\n' + lineWordArr[5] + '\n' + lineWordArr[6] + '\n' + lineWordArr[7] + '</textarea>' +
            '</td>' +
            '<td colspan="4">' +
            '<b>' + lineWordArr[1] + '</b><br />' +
            '<textarea id="contents-2" style="resize: none; width:95%; margin-left: 3%;">' + lineWordArr[4] + '</textarea>' +
            '</td>' +
            '</tr>' +
            '<tr>' +
            '<td colspan="4">' +
            '<b>' + lineWordArr[8] + '</b><br />' +
            '<textarea id="contents-3" style="resize: none; width:95%; margin-left: 3%;">' + lineWordArr[10] + '\n' + lineWordArr[12] + '\n' + lineWordArr[13] + '\n' + lineWordArr[14] + '</textarea>' +
            '</td>' +
            '<td colspan="4">' +
            '<b>' + lineWordArr[9] + '</b><br />' +
            '<textarea id="contents-4" style="resize: none; width:95%; margin-left: 3%;">' + lineWordArr[11] + '\n' + lineWordArr[42] + '</textarea>' +
            '</td>' +
            '</tr>' +
            '<tr>' +
            '<td colspan="4">' +
            '<b>' + lineWordArr[15] + '</b><br />' +
            '<input id="contents-5" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[16] + '"/>' +
            '</td>' +
            '<td colspan="4">' +
            '<b>' + lineWordArr[43] + '</b><br />' +
            '</td>' +
            '</tr>' +
            '<tr>' +
            '<td colspan="2">' +
            '<b>' + lineWordArr[17] + '</b><br />' +
            '<input id="contents-6" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[18] + '"/>' +
            '</td>' +
            '<td colspan="2">' +
            '<b>' + lineWordArr[36] + '</b><br />' +
            '<input id="contents-7" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[37] + '"/>' +
            '</td>' +
            '<td colspan="4" rowspan="2"></td>' +
            '</tr>' +
            '<tr>' +
            '<td colspan="2">' +
            '<b>' + lineWordArr[19] + '</b><br />' +
            '<input id="contents-8" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[20] + '"/>' +
            '</td>' +
            '<td colspan="2">' +
            '<b>' + lineWordArr[38] + '</b><br />' +
            '<input id="contents-9" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[39] + '"/>' +
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
            '<td><input id="contents-10" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[22] + '"></td>' +
            '<td><input id="contents-11" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[41] + '"></td>' +
            '<td><input id="contents-12" type="text" style="width:95%; margin-left: 3%;" value=""></td>' +
            '<td><input id="contents-13" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[46] + '"></td>' +
            '<td><input id="contents-14" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[60] + '"></td>' +
            '<td><input id="contents-15" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[62] + '"></td>' +
            '</tr>' +
            '<tr>' +
            '<td><input id="contents-16" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[23] + '"></td>' +
            '<td><input id="contents-17" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[63] + '"></td>' +
            '<td><input id="contents-18" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '<td><input id="contents-19" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '<td><input id="contents-20" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '<td><input id="contents-21" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '</tr>' +
            '<tr>' +
            '<td><input id="contents-22" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[24] + '"></td>' +
            '<td><input id="contents-23" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[64] + '"></td>' +
            '<td><input id="contents-24" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[76] + '"></td>' +
            '<td><input id="contents-25" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[47] + '"></td>' +
            '<td><input id="contents-26" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '<td><input id="contents-27" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '</tr>' +
            '<tr>' +
            '<td><input id="contents-28" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[25] + '"></td>' +
            '<td><input id="contents-29" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[65] + '"></td>' +
            '<td><input id="contents-30" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[77] + '"></td>' +
            '<td><input id="contents-31" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[48] + '"></td>' +
            '<td><input id="contents-32" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '<td><input id="contents-33" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '</tr>' +
            '<tr>' +
            '<td><input id="contents-34" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[26] + '"></td>' +
            '<td><input id="contents-35" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[66] + '"></td>' +
            '<td><input id="contents-36" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[78] + '"></td>' +
            '<td><input id="contents-37" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[49] + '"></td>' +
            '<td><input id="contents-38" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '<td><input id="contents-39" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '</tr>' +

            '<tr>' +
            '<td><input id="contents-40" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[27] + '"></td>' +
            '<td><input id="contents-41" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[67] + '"></td>' +
            '<td><input id="contents-42" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[79] + '"></td>' +
            '<td><input id="contents-43" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[50] + '"></td>' +
            '<td><input id="contents-44" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '<td><input id="contents-45" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '</tr>' +
            '<tr>' +
            '<td><input id="contents-46" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[28] + '"></td>' +
            '<td><input id="contents-47" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[68] + '"></td>' +
            '<td><input id="contents-48" type="text" style="width:95%; margin-left: 3%;" value=""></td>' +
            '<td><input id="contents-49" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[51] + '"></td>' +
            '<td><input id="contents-50" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '<td><input id="contents-51" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '</tr>' +
            '<tr>' +
            '<td><input id="contents-52" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[29] + '"></td>' +
            '<td><input id="contents-53" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[69] + '"></td>' +
            '<td><input id="contents-54" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[80] + '"></td>' +
            '<td><input id="contents-55" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[52] + '"></td>' +
            '<td><input id="contents-56" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '<td><input id="contents-57" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '</tr>' +
            '<tr>' +
            '<td><input id="contents-58" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[30] + '"></td>' +
            '<td><input id="contents-59" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[70] + '"></td>' +
            '<td><input id="contents-60" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[81] + '"></td>' +
            '<td><input id="contents-61" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[53] + '"></td>' +
            '<td><input id="contents-62" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '<td><input id="contents-63" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '</tr>' +
            '<tr>' +
            '<td><input id="contents-64" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[31] + '"></td>' +
            '<td><input id="contents-65" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[71] + '"></td>' +
            '<td><input id="contents-66" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[82] + '"></td>' +
            '<td><input id="contents-67" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[54] + '"></td>' +
            '<td><input id="contents-68" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '<td><input id="contents-69" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '</tr>' +
            '<tr>' +
            '<td><input id="contents-70" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[32] + '"></td>' +
            '<td><input id="contents-71" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[72] + '"></td>' +
            '<td><input id="contents-72" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[83] + '"></td>' +
            '<td><input id="contents-73" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[55] + '"></td>' +
            '<td><input id="contents-74" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '<td><input id="contents-75" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '</tr>' +
            '<tr>' +
            '<td><input id="contents-76" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[33] + '"></td>' +
            '<td><input id="contents-77" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[73] + '"></td>' +
            '<td><input id="contents-78" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[84] + '"></td>' +
            '<td><input id="contents-79" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[56] + '"></td>' +
            '<td><input id="contents-80" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '<td><input id="contents-81" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '</tr>' +
            '<tr>' +
            '<td><input id="contents-82" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[34] + '"></td>' +
            '<td><input id="contents-83" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[74] + '"></td>' +
            '<td><input id="contents-84" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[85] + '"></td>' +
            '<td><input id="contents-85" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[57] + '"></td>' +
            '<td><input id="contents-86" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '<td><input id="contents-87" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '</tr>' +
            '<tr>' +
            '<td><input id="contents-88" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[35] + '"></td>' +
            '<td><input id="contents-89" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[75] + '"></td>' +
            '<td><input id="contents-90" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[86] + '"></td>' +
            '<td><input id="contents-91" type="text" style="width:95%; margin-left: 3%;" value="' + lineWordArr[58] + '"></td>' +
            '<td><input id="contents-92" type="text" style="width:95%; margin-left: 3%;"></td>' +
            '<td><input id="contents-93" type="text" style="width:95%; margin-left: 3%;"></td>' +
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
            '<textarea name="contents1" id="contents-1" style="resize:none; width:100%;">' + lineWordArr[2] + '\n' + lineWordArr[3] + '\n' + lineWordArr[4] + ' ' + lineWordArr[5] + ' ' + lineWordArr[7] +'</textarea>' +
            '</div>' +
            '<div style="width:90%; height: 8%; margin: 4px 5% 0 5%; border:1px solid black;">' +
            '<b style="text-decoration: underline;">' + lineWordArr[6] + '</b>' +
            '<textarea name="contents2" id="contents-2" style="resize:none; width:100%;">' + lineWordArr[8] + '\n' + lineWordArr[9] + '\n' + lineWordArr[10] + lineWordArr[24] + '</textarea>' +
            '</div>' +
            '<div style="width:90%; height: 8%; margin: 4px 5% 0 5%; border:1px solid black;">' +
            '<b style="text-decoration: underline;">' + lineWordArr[11] + '</b>' +
            '<textarea name="contents3" id="contents-3" style="resize:none; width:100%;">' + lineWordArr[12] + '</textarea>' +
            '</div>' +
            '<div style="width:90%; height: 5%; margin: 4px 5% 0 5%; border:1px solid black;">' +
            '<div style="float:left; width:50%; height:100%; border-right: 1px solid black;">' +
            '<b style="text-decoration: underline;">' + lineWordArr[13] + '</b>' +
            '<input name="contents4" id="contents-4" type="text" style="width:100%;" value="' + lineWordArr[14] + '"/>' +
            '</div>' +
            '<div style="float:left; width:50%; height:100%;">' +
            '<b style="text-decoration: underline;">' + lineWordArr[25] + '</b>' +
            '<input name="contents5" id="contents-5" type="text" style="width:100%;" />' +
            '</div>' +
            '</div>' +
            '<div style="width:90%; height: 5%; margin: 4px 5% 0 5%; border:1px solid black;">' +
            '<div style="float:left; width:50%; height:100%; border-right: 1px solid black;">' +
            '<b style="text-decoration: underline;">' + lineWordArr[15] + '</b>' +
            '<input name="contents6" id="contents-6" type="text" style="width:100%;" value="' + lineWordArr[16] + '""/>' +
            '</div>' +
            '<div style="float:left; width:50%; height:100%;">' +
            '<b style="text-decoration: underline;">' + lineWordArr[26] + '</b>' +
            '<input name="contents7" id="contents-7" type="text" style="width:100%;" value="' + lineWordArr[27] + '"/>' +
            '</div>' +
            '</div>' +
            '<div style="width:90%; height: 5%; margin: 4px 5% 0 5%; border:1px solid black;">' +
            '<div style="float:left; width:50%; height:100%; border-right: 1px solid black;">' +
            '<b style="text-decoration: underline;">' + lineWordArr[17] + '</b>' +
            '<input name="contents8" id="contents-8" type="text" style="width:100%;" value="' + lineWordArr[18] + '""/>' +
            '</div>' +
            '<div style="float:left; width:50%; height:100%;">' +
            '<b style="text-decoration: underline;">' + lineWordArr[28] + '</b>' +
            '<input name="contents9" id="contents-9" type="text" style="width:100%;" />' +
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
            '<td style="text-align:center;"><textarea name="contents10" id="contents-10" style="width:90%; height:70px; resize:none;">' + lineWordArr[21] + '\n' + lineWordArr[22] + '\n' + lineWordArr[23] + '\n' + lineWordArr[31] + ' ' + lineWordArr[33] +'</textarea></td>' +
            '<td style="text-align:center;"><input name="contents11" id="contents-11" type="text" style="width:90%;" value="3EA" /></td>' +
            '<td style="text-align:center;"><input name="contents12" id="contents-12" type="text" style="width:90%;" value="" /></td>' +
            '<td style="text-align:center;"><input name="contents13" id="contents-13" type="text" style="width:90%;" value="' + lineWordArr[37] +'" /></td>' +
            '</tr>' +
            '<tr id="totalTr" style="border-top:1px solid black;">' +
            '<th> </th>' +
            '<th style="text-align:center;">TOTAL</th>' +
            '<td style="text-align:center;"><input name="contents14" id="contents-14" type="text" style="width:90%;" value="" /></td>' +
            '<td style="text-align:center;"><input name="contents15" id="contents-15" type="text" style="width:90%;" value="" /></td>' +
            '<td style="text-align:center;"><input name="contents16" id="contents-16" type="text" style="width:90%;" value="' + lineWordArr[38] +'" /></td>' +
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

