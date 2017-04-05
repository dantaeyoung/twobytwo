var questionData = {};
var rensis;

var getUrlValue = function(VarSearch){
    var SearchString = window.location.search.substring(1);
    var VariableArray = SearchString.split('&');
    for(var i = 0; i < VariableArray.length; i++){
        var KeyValuePair = VariableArray[i].split('=');
        if(KeyValuePair[0] === VarSearch){
            return KeyValuePair[1];
        }
    }
}

function saveDataToUrl() {
	var savedata = {};
	$(".editableelem").each(function(i, el) {
		savedata[el.id] = el.innerHTML;
	});
	var url = location.protocol + '//' + location.host + location.pathname;
	history.replaceState('', '', url + "?" +  $.param(savedata));
}

//Creating dynamic link that automatically click
function downloadURI(uri, name) {
		var link = document.createElement("a");
		link.download = name;
		link.href = uri;
		link.click();
		//after creating link you should delete dynamic link
		//clearDynamicLink(link); 
}

//Your modified code.
function printToFile(div) {
		html2canvas(div, {
				dpi: 300,
				onrendered: function (canvas) {
						var myImage = canvas.toDataURL("image/png");
						//create your own dialog with warning before saving file
						//beforeDownloadReadMessage();
						//Then download file
						downloadURI("data:" + myImage, "yourImage.png");
				}
		});
}


$(function() {

	$(".editableelem").each(function(i, el) {
		if(getUrlValue(el.id) != undefined) {
			el.innerHTML = decodeURIComponent(getUrlValue(el.id));
		}
	});
	$(".editableelem").each(function(i, el) {
		$(el).editable({type: "textarea", action: "click"}, function(e){
		  saveDataToUrl()
		});
	});



  $("button#saveas").click(function() {
		printToFile($("#twobytwo_wrapper"));
  })	

});
