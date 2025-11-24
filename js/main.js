var jquery = $ = jQuery = require('jquery');
var html2canvas = require('html2canvas');
var FileSaver = require('FileSaver');
require('canvas-toBlob');
var Clipboard = require('clipboard');
require('./jquery.editable');
var Base64 = require('js-base64').Base64;


function getUrlValue(VarSearch){
    var SearchString = window.location.search.substring(1);
    var VariableArray = SearchString.split('&');
    for(var i = 0; i < VariableArray.length; i++){
        var KeyValuePair = VariableArray[i].split('=');
        if(KeyValuePair[0] === VarSearch){
            return KeyValuePair[1];
        }
    }
}

function updateUrlWithData() {
  var savedata = {};
  $(".editableelem").each(function(i, el) {
    savedata[el.id] = el.innerHTML;
  });
  var url = location.protocol + '//' + location.host + location.pathname;
//  var dataUrl = url + "?data=" +  Base64.encode($.param(savedata));
  var dataUrl = url + "?" +  $.param(savedata);
  history.replaceState('', '', dataUrl);
  return dataUrl;
}

function saveAsImage(div, filename) {
    html2canvas(div, {
        dpi: 300,
        onrendered: function (canvas) {
          canvas.toBlob(function(blob) {
            saveAs(blob, filename);
          });
        }
    });
}

function randRange(min , max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}

function randPastel() {
  var hue = Math.floor(Math.random() * 360);
  var pastel = 'hsl(' + hue + ', 100%, 85.5%)';
  return pastel;
}

function newGradient() {
  var s = "linear-gradient(" + Math.round(randRange(0, 180)) + "deg, " + randPastel() + " 0%, " + randPastel() + " 100%)";
  return s;
}

// Tab switching functionality
function setupTabs() {
  $(".tab-button").on("click", function() {
    const tabName = $(this).data("tab");

    // Update button states
    $(".tab-button").removeClass("active");
    $(this).addClass("active");

    // Update content visibility
    $(".tab-content").removeClass("active");
    $("#" + tabName + "-tab").addClass("active");

    // Apply gradient backgrounds
    if (tabName === "generator") {
      $("#wrapper").css('background', newGradient());
    } else if (tabName === "gallery") {
      $("#gallery-tab").css('background', newGradient());
      // Load gallery if switching to gallery tab
      if (!window.galleryLoaded) {
        loadGallery();
      }
    }
  });
}

// Fetch and display gallery from Are.na
function loadGallery() {
  const apiUrl = "https://api.are.na/v2/channels/two-by-twos/contents";
  const galleryGrid = $("#gallery-grid");

  $.ajax({
    url: apiUrl,
    method: "GET",
    success: function(data) {
      galleryGrid.empty();

      if (!data.contents || data.contents.length === 0) {
        galleryGrid.html('<div class="error">No images found in the gallery.</div>');
        return;
      }

      // Filter for image blocks only
      const images = data.contents.filter(block => block.class === "Image");

      images.forEach(function(block) {
        const imageUrl = block.image.display.url || block.image.large.url;
        const title = block.title || block.generated_title || "Untitled";

        const galleryItem = $('<div class="gallery-item"></div>');
        const img = $('<img>').attr('src', imageUrl).attr('alt', title);
        const titleDiv = $('<div class="item-title"></div>').text(title);

        galleryItem.append(img);
        galleryItem.append(titleDiv);

        // Open Are.na link on click
        if (block.source && block.source.url) {
          galleryItem.on('click', function() {
            window.open(block.source.url, '_blank');
          });
        }

        galleryGrid.append(galleryItem);
      });

      window.galleryLoaded = true;
    },
    error: function(xhr, status, error) {
      console.error("Error loading gallery:", error);
      galleryGrid.html('<div class="error">Failed to load gallery. Please try again later.</div>');
    }
  });
}

$(function() {

  setupTabs();

  $("#wrapper").css('background', newGradient());
  $("#gallery-tab").css('background', newGradient());

  $(".editableelem").each(function(i, el) {
    if(getUrlValue(el.id) != undefined) {
      el.innerHTML = decodeURIComponent(getUrlValue(el.id));
    }
  });

  $(".editableelem").each(function(i, el) {
    $(el).editable({type: "textarea", action: "click"}, function(e){
      updateUrlWithData()
    });
  });

  new Clipboard("#copyurl", {
    text: function(trigger) {
      return updateUrlWithData()
    }
  });

  $("#colortoggle").click(function() {
    var tw = $("#twobytwo_wrapper");
    if($(this).hasClass("pressed")) {
      $("#wrapper").css('background', newGradient());
      tw.css('background', tw.data("old-background"));
    } else {
      $("#wrapper").css('background', '');
      tw.data("old-background", tw.css('background'));
      tw.css('background', newGradient());
    }
    $(this).toggleClass("pressed");
  });


  $("button#saveas").click(function() {
    var filename = $("#quiz_title").html().replace(/[^a-z0-9]/gi, '_').toLowerCase();
    saveAsImage($("#twobytwo_wrapper"), filename);
    $("#wrapper").css('background', newGradient());
  })  

});
