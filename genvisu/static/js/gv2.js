
// -----------------------------------------------------------
// initialisation
// -----------------------------------------------------------
var rstyle = {};
var nozonefocus;
var fromToolbox;
var attrCss = {
  paddingleft:'padding-left',
  paddingright:'padding-right',
  paddingtop:'padding-top',
  paddingbottom:'padding-bottom',
  letterspacing:'letter-spacing',
  fontsize: 'font-size',
  padding: 'padding',
  fontweight: 'font-weight',
  fontfamily: 'font-family',
  color: 'color',
  bgcolor: 'background-color',
  marginleft: 'margin-left',
  margintop: 'margin-top',
  marginright: 'margin-right',
  marginbottom: 'margin-bottom',
  lineheight: 'line-height',
  align:'text-align',
  expind:'vertical-align',
  textdecoration:'text-decoration',
  fontstyle:'font-style',
  texttransform:'text-transform',
}

var attrRanges = { fontsize:[1,30],
                    fontweight:[1,9],
                    fontfamily:[1,3],
                    color:[1,6],
                    bgcolor:[0,6],
                    marginleft:[-20,20],
                    marginright:[-20,20],
                    margintop:[-5,20],
                    marginbottom:[-5,20],
                    padding:[0,20],
                    paddingleft:[0,20],
                    paddingright:[0,20],
                    paddingtop:[0,20],
                    paddingbottom:[0,20],
                    letterspacing:[0,10],
                    lineheight:[0,15]}
var attrValues = {
  align:['left','center','right'],
  expind:['exposant','indice']
}

var attrDefaults = {
  paddingleft:0,
  paddingright:0,
  paddingtop:0,
  paddingbottom:0,
  letterspacing:0,
  fontsize: 4,
  padding:0,
  fontweight: 4,
  fontfamily: 1,
  color:1,
  bgcolor:0,
  marginleft:0,
  margintop:0,
  marginright:0,
  marginbottom:0,
  lineheight:6,
  align:'left',
  expind:'',
  textdecoration:'none',
  fontstyle:'normal',
  texttransform:'none'
 };

var historyIndex = 0;
var actionHistory = Array();

var f = document.getElementById("f");
var frame = $('#f')[0];
var fwindow = frame.contentWindow;
var fdocument = fwindow.document;
var selectionactive = false;
var imageactive;

$(function() {
  // chargement iframe
  $('#f').on('load', iframeLoaded);
  $('#f').attr('src',visuel_path);





});
function reverseStyle() {

  var width = $('html').width();
  for (var k in attrRanges) {
    var range = attrRanges[k]
    for (i=range[0]; i<=range[1]; i++) {
      var div = document.createElement('div');
      div.setAttribute('id','rs');
      div.style='display:none';
      div.setAttribute(k,i);
      var textnode = document.createTextNode("rs");
      div.appendChild(textnode);

      document.body.appendChild(div);
      var rs = $('#rs').css(attrCss[k]);
      var fs = parseFloat($('#rs').css('font-size').match(/([0-9\.]+)px/)[1]);
      var ispx=  rs.match(/([0-9\.]+)px/);

      if (ispx!=null) {
        if (k==='lineheight') {
          console.log(Math.round(100*parseFloat(ispx[1])/fs)/100)
        } else {
          var value = Math.round(100*100*parseFloat(ispx[1])/width)/100;
          rs = value + 'vw';
        }
      }
      document.body.removeChild(div);
      rstyle[attrCss[k]+': '+rs] = [k,i]
    }
  }
  return rstyle

}
document.execCommand('insertBrOnReturn',false);

// -----------------------------------------------------------
// Historique
// -----------------------------------------------------------


function addHistory(type,item) {

  item.type = type;
  actionHistory = actionHistory.slice(0,historyIndex);
  actionHistory.push(item);
  historyIndex = actionHistory.length;
}
function backHistory() {
  if (historyIndex>0) {
    var item = actionHistory[historyIndex-1];
    $(item.zone).html(item.content);
    historyIndex--;
    nozonefocus = true;
  }
}
function forwardHistory() {
  if (historyIndex<actionHistory.length) {
    var item = actionHistory[historyIndex];
    $(item.zone).html(item.content);
    historyIndex++;
    nozonefocus = true;
  }
}

function getHistoryItem(node) {
  var zone = $(node).closest('div.zone');
  return { zone:zone, content:zone.html()}
}



// -----------------------------------------------------------
// Gestion Toolbox
// -----------------------------------------------------------
function getCharteFonts() {
  var fonts = Array();
  var re = /([^",]+)/;
  for (i=1;i<4;i++) {
    var div = document.createElement('div');
    div.setAttribute('id','font1');
    div.style='display:none';
    div.setAttribute('fontfamily',i);
    var textnode = document.createTextNode("font");
    div.appendChild(textnode);
    $('#f').contents().find('body').append(div);
    var font = $(div).css('font-family');
    $(div).remove();
    fonts.push(font.match(re)[0]);
  }
  return fonts;
}
function getCharteColors() {
  var colors = Array();
  var i=1;
  var color;
  out = false;
  while ((i<100)&&(out == false)) {
    var div = document.createElement('div');
    div.setAttribute('id','color1');
    div.style='display:none';
    div.setAttribute('color',i);
    var textnode = document.createTextNode("color");
    div.appendChild(textnode);
    $('#f').contents().find('body').append(div);
    var color = $(div).css('color');

    $(div).remove();

    if (color===colors[i-2]) {
      out = true;
    } else {
      colors.push(color);
    }
    i++;
  }
  return colors.slice(0,colors.length-1);
}

function initToolbox() {

  // initialisation polices
  var fonts = getCharteFonts();
  for(var i=0;i<fonts.length;i++) {
    $('<option value="'+(i+1)+'">'+fonts[i]+'</option>').appendTo('#fontfamily');
  }
  var colors = getCharteColors();
  for (var i=1;i<=colors.length;i++) {
    $('<label><input type="radio" name="color" attr="color" action="set" focus="range" value="'+i+'"><div style="background-color: '+colors[i-1]+';"></div></label>').appendTo('.color.colorgroup');
    $('<label><input type="radio" name="bgcolor" attr="bgcolor" action="set" focus="range" value="'+i+'"><div style="background-color: '+colors[i-1]+';"></div></label>').appendTo('.bgcolor.colorgroup');
  }
  $('<label><input type="radio" name="bgcolor" attr="bgcolor" action="set" focus="range" value="0"><div bgcolor="0"></div></label>').appendTo('.bgcolor.colorgroup');


}

// -----------------------------------------------------------
// Editeur / iframe
// -----------------------------------------------------------

// niveau de zoom actuel
function getRatio(node) {
  re = /matrix\(([0-9\.]+)/;
  return parseFloat($(node).css('transform').match(re)[1]);
}

// centrage du visuel dans la zone d'édition
function centerVisuel() {
  var ratio = getRatio('#f');
  var areaWidth = $('.workarea').width();
  var areaHeight = $('.workarea').height();
  var fWidth = $('#f').contents().find('body').width()*ratio;
  var fHeight = $('#f').contents().find('body').height()*ratio;

  console.log(areaWidth,fWidth,areaHeight,fHeight);
  var top = Math.min(50,Math.max((areaHeight-fHeight)/2,0));
  var left = Math.max((areaWidth-fWidth)/2,0);
  $('#f').css('top',top+'px');
  $('#f').css('left',left+'px');
}

// une fois la iframe chargée
function iframeLoaded() {
  centerVisuel();
  initToolbox();
  rstyle = reverseStyle();
  fdocument.execCommand("styleWithCSS", false, null);
  // gestion du zoom sur le visuel avec la molette de la souris
  $("#f").contents().find('html').get(0).addEventListener('wheel', function(e) {

      var ratio = getRatio('#f');
      if (e.deltaY < 0) {
        $('#f').css('transform','scale('+(ratio+ratio/10)+')');
      }
      if (e.deltaY > 0) {
        $('#f').css('transform','scale('+(ratio-ratio/10)+')');

      }
      centerVisuel();
      //$('.workarea').css('overflow','scroll');
      e.preventDefault();
    });

  // detection nouvelle selection
  $('#f').contents().find('div.zone').mousedown(function(e) {
    selectionactive = this;
  });
  $('#f').contents().find('div.zone').mouseup(function(e) {
    if (selectionactive) { // selection effectuée dans une zone
      if ($('#f')[0].contentWindow.getSelection) {

        var selection = $('#f')[0].contentWindow.getSelection();
        updateToolbox(getCurrentAttrs(selection.getRangeAt(0).focusNode));
      }
    }

  });


  // visibilité toolbox / selections
  function selectActive() {
    if (selectionactive!=undefined && nozonefocus!=true) {
      nozonefocus=false;
      window.setTimeout( function() {
        $(selectionactive).removeClass('selected');
        selectionactive.focus();
      },0);
    }
  }
  $('#f').contents().find('div.image').click(function(e) {
    $('.toolbox-imageitems').addClass('active');
    $('.toolbox-zoneitems').removeClass('active');
    var istyle = fwindow.getComputedStyle(this);

    for (var i=0;i<istyle.length;i++) {
    //  $('#imagepreview').css(istyle[i],istyle.getPropertyValue(istyle[i]));
    }
    $('.imagepreview').css('background-image',$(this).css('background-image'));
    if (!$(this).hasClass('selected')) {
      imageactive = this;
      $('.imagepreviewzone').height($(this).height()/$(this).width() * $('.imagepreviewzone').width());
      selectionactive = undefined;
      $(this).addClass('selected');

    }
  });
  $('#f').contents().find('div.zone').click(function(e){
    $('.toolbox-zoneitems').addClass('active');
    $('.toolbox-imageitems').removeClass('active');
    if (imageactive!=undefined) {
      $(imageactive).removeClass('selected');
      imageactive = undefined;
    }
    e.stopPropagation();

  });
  $('.toolbox').click(function(e) {
    if (selectionactive!=undefined && $(e.target).attr('type')!='text' && e.target.tagName!='SELECT') {
      selectActive();
      e.stopPropagation();
    } else {

      $(selectionactive).addClass('selected');
      fromToolbox = true;
    }
  });
  $('body').click(function(e) {
    if (!fromToolbox) $('.toolbox-zoneitems').removeClass('active');
    fromToolbox = false;
  });
  $('.menuitem').click(function(e) {
    var action = $(this).attr('action');
    if (action=='export') {
      sendData(action);
    }
  })


  // gestion des suppressions d'éléments et des retours chariots dans les zones
  $('#f').contents().find('div.zone').keydown(function(e){
    if ((e.which==46)||(e.which==8)) {
      var his_item = getHistoryItem(e.target);
      addHistory('key',his_item);
    }
    if ((e.which>=33)&&(e.which<=40)) {
      window.setTimeout(updateToolbox,0);
    }

  });
  $('#f').contents().find('div.zone').keypress(function(e) {

    var frame = $('#f')[0];
    var fwindow = frame.contentWindow;
    var fdocument = fwindow.document;
    var fzone = e.target;
    var charcode = e.charCode;

    // Historique
    var changed = false;
    var his_item = getHistoryItem(fzone);
    addHistory('key',his_item);

    if (charcode==13) {
      return
    }

    var char = String.fromCharCode(charcode);

    if ($('#f')[0].contentWindow.getSelection) {
      var selection = $('#f')[0].contentWindow.getSelection();
      //range = selection.getRangeAt(0);
      var eNode = selection.focusNode;
      if ((eNode.nodeType==1) && (eNode.tagName!='SPAN')) {
        if ($(eNode).html() == '<br>') $(eNode).html('');
        var span = document.createElement('span');
        span.innerHTML = char;
        if ($(eNode).hasClass('zone')) {
          var div = document.createElement('div');
          div.appendChild(span);
          eNode.appendChild(div);
        } else {
          eNode.appendChild(span);
        }
        var range = fdocument.createRange();
        var sel = fwindow.getSelection();
        range.setStart(span.childNodes[0],1);
        sel.removeAllRanges();
        sel.addRange(range);
        e.preventDefault();
      }
    }
  });

  function loadFile(image,file) {
    var reader = new FileReader();

    reader.onload = function(e) {
      //image.src = reader.result;
      console.log('load');
      $(image).css('background-image','url('+reader.result+')')
      $('.imagepreview').css('background-image','url('+reader.result+')')
    }
    reader.readAsDataURL(file);

  }
  $('#uploadimage').change(function(e) {

    var file = this.files[0];
    console.log('upload',file);
    loadFile(imageactive,file);

  });

  var getDimensions = function (item) {
    var img = new Image();
    img.src = item.css('background-image').replace(/url\(|\)$|"/ig, '');
    return { o_w:img.width,o_h:img.height,v_w:item.width(),v_h:item.height()};
  };




  $('.toolbox input[attr][type="range"]').on("input",function(e) {
    var item = $(this).attr('item')
    var val = $(this).val();
    var attr = $(this).attr('attr');

    if (attr=='background-position-x' || attr=='background-position-y') {
      var ratio = getRatio(imageactive);
      var unit=$(this).attr('unit');
      $(imageactive).css(attr,val+unit);
      var width = $('.imagepreview').width();
      var height = $('.imagepreview').height();

      if (attr=='background-position-y') {
        $('.imagepreview').css(attr,(width/100)*val+'px');
      } else {
        $('.imagepreview').css(attr,(width/100)*val+'px');
      }
    } else if (attr=="transform") {
      $(imageactive).css('transform', 'scale(' + val + ')');
      $('.imagepreview').css('transform', 'scale(' + val + ')');

    } else {//if (attr=="filter") {

      var unit=$(this).attr('unit');
      var filters = $(imageactive).css(attr);

      if (filters!='none') {
        filters = filters.split(' ');
      } else {
        filters = Array();
      }
      var filter = item+'('+val+unit+')';
      if (item=='scale') {
        item = 'matrix';
      }
      var repl = false;
      for(var i=0;i<filters.length;i++) {
        if (filters[i].includes(item)) {
          filters[i] = filter;
          repl = true;
        }
      }

      if (!repl) {
        filters.push(filter);
      }

      filters = filters.join(' ');

      $('.imagepreview').css(attr,filters);
      $(imageactive).css(attr,filters);
    }



  });
  $(".toolbox input[attr], .toolbox select[attr]").change(function (e) {

    var val = $(this).val();
    var attr = $(this).attr('attr');
    if ($(this).attr('type')=='text') {
      val =parseInt(val);
      if (isNaN(val)) {
        $(this).val('');
        return;
      }
      if (val>attrRanges[attr][1]) {
        val = attrRanges[attr][1];
      }
      if (val<attrRanges[attr][0]) {
        val = attrRanges[attr][0];
      }
    }

    if ($(this).attr('focus')=='line') {
      lineAction(attr,$(this).attr('action'),val);
    } else if ($(this).attr('focus')=='range'){
      rangeFormat(attr,$(this).attr('action'),val);
    } else if ($(this).attr('focus')=='image') {
      console.log(imageactive);
    }
    if ($(this).attr('focus')!='image') {
      updateToolbox();
      selectActive();
    }

  });

  $(".toolbox button[attr]").click(function(e) {
    var focus = $(this).attr('focus');
    if (focus=='line') {
      lineAction($(this).attr('attr'),$(this).attr('action'),1);
    } else if (focus=='range') {
      rangeFormat($(this).attr('attr'),$(this).attr('action'),1);
    } else if (focus=='image') {

    }
    updateToolbox();
    if (focus != 'image') {
      selectActive();
    }



  });
  $("#f").contents().find("body").bind('paste', function(e) {
    var zone = $(e.target).closest('div.zone');
    var clipboardData = e.originalEvent.clipboardData || fwindow.originalEvent.clipboardData;
      window.setTimeout( function() {
        zone.find("div, span, img, i").each(function () {
          var styles = $(this).attr('style')
          if (styles) {
            styles = styles.split(/; ?/);
            for (var i=0;i<styles.length;i++) {
              var cv = rstyle[styles[i]];
              if (cv) {
                $(this).attr(cv[0],cv[1]).attr('style','');
              }
            }
          }
          if (this.parentNode.tagName=='SPAN') {
            $(this).siblings('span').prependTo(this.parentNode.parentNode);
          }
        });
      },0);

  });

}



function getCurrentAttrs(node) {
  var defaults = {};
  if (node==undefined) {
    if (!f.contentWindow.getSelection) {
      return;
    }
    node = f.contentWindow.getSelection().focusNode;

  }

  for (attr in attrDefaults) {
    var n = node;
    while (n && (defaults[attr]==undefined) ) {
      defaults[attr] = $(n).attr(attr);
      n = $(n).parent().get(0);

    }
    if (!n) {
      defaults[attr] = attrDefaults[attr];
    }
  }

  return defaults
}
// appliquer l'action / formatage à une node
function applyFormat(node,attr,fct,value)
{
  var nodeattr = getCurrentAttrs(node);

  if ((fct=='increase')||fct=='decrease') {
    var attrval = parseInt(nodeattr[attr]);
    var newval = attrval + (fct=='increase'?1:-1)
    if (newval<attrRanges[attr][0] || newval>attrRanges[attr][1]) return;
  } else if (fct=='set') {
    var newval = value;
  } else if (fct=='toggle') {
    if ($(node).attr(attr) == value) {
      var newval = "";
    } else {
      var newval = value;
    }
  }

  $(node).attr(attr,newval);
}


// appliquer l'action / formatage à une ligne
function lineAction(attr,fct,value) {
  var sel = f.contentWindow.getSelection();
  var changed = false;
  var his_item = getHistoryItem(sel.anchorNode);


  if ($(sel.anchorNode).closest('div').get(0) != $(sel.focusNode).closest('div').get(0)) {
    var nodes = getSelectedNodes();

    divs = Array();
    for (var i=0;i<nodes.length;i++) {
      var div = $(nodes[i]).closest('div').get(0);

      if (div&&(!divs.includes(div))&&($(div.parentNode).hasClass('zone'))) {
        divs.push(div);
        changed = true;
        applyFormat(div,attr,fct,value)
      }
    }
  } else {
    div = $(sel.anchorNode).closest('div');
    changed = true;
    applyFormat(div[0],attr,fct,value)
  }
  if (changed) addHistory('action',his_item);
}

// Appliquer le formatage/action à une selection (range)
function rangeFormat(attr,fct,value)
{

  var targets = Array('SPAN','IMG');
  var sel = f.contentWindow.getSelection();
  if (sel.focusNode==null) {
    return;
  }
  var range = sel.getRangeAt(0);

  var startOffset = sel.anchorOffset;
  var endOffset = sel.focusOffset;
  var nodes = getSelectedNodes();
  var startNode = (range.startContainer.nodeType==3)? range.startContainer : range.startContainer.childNodes[range.startOffset] ;
  var endNode = (range.endContainer.nodeType==3)? range.endContainer : range.endContainer.childNodes[range.endOffset] ;
  var started = false;

  // Historique
  var changed = false;
  var his_item = getHistoryItem(sel.anchorNode);



  if ((nodes.length == 1) && ((nodes[0].nodeType == 1)||(startOffset != endOffset))) {
    if (nodes[0].nodeType == 3) {
      if (startOffset>0) {
        var spanbefore = nodes[0].parentNode.cloneNode(false);
        $(spanbefore).html(nodes[0].nodeValue.substr(0,startOffset));
        $(spanbefore).insertBefore(nodes[0].parentNode);

      }

      if (endOffset<nodes[0].nodeValue.length) {
        var spanafter = nodes[0].parentNode.cloneNode(false);
        $(spanafter).html(nodes[0].nodeValue.substr(endOffset));
        $(spanafter).insertAfter(nodes[0].parentNode);

      }

      nodes[0].data = nodes[0].nodeValue.substr(range.startOffset,range.endOffset-range.startOffset);
      range.setEnd(nodes[0],endOffset-startOffset);
      range.setStart(nodes[0],0);
      var node = nodes[0].parentNode;
    } else {
      var node = startNode;
    }
    // faire une fonction
    if (targets.includes(node.tagName)) {
      changed = true;
      applyFormat(node,attr,fct,value)
    }
  } else if (nodes.length == 0) {
    var node = sel.focusNode;
    if (node.nodeType == 3) node = node.parentNode;

    if (targets.includes(node.tagName)) {
      changed = true;
      applyFormat(node,attr,fct,value)
    }
  } else {

    for (i=0;i<nodes.length;i++) {
      if (nodes[i] == startNode) {

        started = true;
        if ((nodes[i].nodeType==3)&&(nodes[i-1] != nodes[i])) {
          if (range.startOffset>0) {
            changed = true;
            var span = nodes[i].parentNode.cloneNode(false); //document.createElement('span');
            span.innerHTML = nodes[i].nodeValue.substr(0,range.startOffset);
            nodes[i].textContent = nodes[i].nodeValue.substr(range.startOffset);
            $(span).insertBefore(nodes[i].parentNode);
          }
        }
      }
      if (nodes[i] == endNode) {

        if (nodes[i].nodeType==3) {
          if ((range.endOffset<nodes[i].nodeValue.length) && (range.endOffset>0)) {
            changed = true;
            var span = nodes[i].parentNode.cloneNode(false); //document.createElement('span');

            span.innerHTML = nodes[i].nodeValue.substr(range.endOffset);
            nodes[i].nodeValue = nodes[i].nodeValue.substr(0,range.endOffset);
            $(span).insertAfter(nodes[i].parentNode);
            range.setEnd(nodes[i],endOffset);
          }
        }
      }
      if (started == true)  {
          if (nodes[i] == endNode) started = false;
          if (nodes[i].nodeType!=3)  {
            var node=nodes[i];
            if (targets.includes(node.tagName)) {
              changed = true;
              applyFormat(node,attr,fct,value)
            }
          }
      }
    }
  }
  if (changed) addHistory('action',his_item);
}


$("#annuler").click(function() {
  backHistory();
});
$("#refaire").click(function() {
  forwardHistory();
});

function updateToolbox(attrs) {
  if (attrs==undefined) {
    attrs = getCurrentAttrs();
  }
  for (k in attrs) {
    $('#'+k).val(attrs[k]);
    // radios
    $('input[type="radio"][name="'+k+'"][value="'+attrs[k]+'"]').prop("checked", true);
    // checkbox
    $('input[type="checkbox"][value="'+attrs[k]+'"][name="'+k+'"]').prop("checked", true);

    $('input[type="checkbox"][value!="'+attrs[k]+'"][name="'+k+'"]').prop("checked", false);
  }
}



// -----------------------------------------------------------
// Fonctions utilitaires (gestion des selections/ranges)
// -----------------------------------------------------------


function nextNode(node) {
    if (node.hasChildNodes()) {
        return node.firstChild;
    } else {
        while (node && !node.nextSibling && !$(node).hasClass('zone')) {
            node = node.parentNode;
        }
        if (!node) {
            return null;
        }
        return node.nextSibling;
    }
}

function getRangeSelectedNodes(range) {
    var node = range.startContainer;
    var endNode = range.endContainer;
    var parents = $(endNode).parents();
    // Special case for a range that is contained within a single node
    if (node == endNode) {
        return [node];
    }

    // Iterate nodes until we hit the end container
    var rangeNodes = [];
    while (node && node != endNode) {
        //if (((node.nodeType==3)&&(node.parentNode.tagName=='SPAN'))||((node.nodeType==1)&&(!$(node.parentNode).hasClass('zone'))))
        //if ($(node).find(endNode).length==0 || node==endNode)
        if (!rangeNodes.includes(node)) rangeNodes.push( node );
        node = nextNode(node);
    }
    if (node == endNode) {
      rangeNodes.push(node);
    }


    // Add partially selected nodes at the start of the range
    node = range.startContainer;
    while (node && node != range.commonAncestorContainer && !$(node.parentNode).hasClass('zone')) {
        if (!rangeNodes.includes(node)) rangeNodes.splice(1,0,node);
        node = node.parentNode;
    }

    return rangeNodes;
}

function getSelectedNodes() {
  var w = f.contentWindow;
  if (w.getSelection) {
        var sel = w.getSelection();
        if (!sel.isCollapsed) {
            return getRangeSelectedNodes(sel.getRangeAt(0));
        }
    }
    return [];
}

// -----------------------------------------------------------
// Sauvegardes / exports / chargements
// -----------------------------------------------------------
var exportencours = false;

function sendData() {
  //document.body.style.cursor = 'wait';
  var downloadToken = new Date().getTime();
  var attempts = 30;
  if (exportencours) return
  var data = {'path':visuel_path,'zones':{},'images':{}};

  // zones
  $('#f').contents().find('.zone').each(function() {
    data.zones[$(this).attr('id')] = $(this).html();
  });
  $('#f').contents().find('.image').each(function() {
    var style = $(this).attr('style');
    if (!style) style = ""
    data.images[$(this).attr('id')] = style;
  });
  $('.jauge').css('width','5%');
  $('#overlay').show();
  $.post( '/senddata', {'data':JSON.stringify(data)}, function(data) {
      window.location.replace('/export?key='+data);
      //document.body.style.cursor = 'wait';
      var downloadTimer = window.setInterval(function() {
        $.get('/check_status?key='+data, function(data) {
          data = JSON.parse(data);
          $('#etape').text(data.etat);
          $('.jauge').css('width',data.avancement+'%');

          if (data.avancement == 100) {
            clearInterval(downloadTimer);
            window.setTimeout(function() {
              $('#overlay').hide();
            },1000);

          }

        });
      }, 500);
  });
}
