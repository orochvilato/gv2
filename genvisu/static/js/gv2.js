
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
                    margintop:[-10,20],
                    marginbottom:[-10,20],
                    padding:[0,20],
                    paddingleft:[0,20],
                    paddingright:[0,20],
                    paddingtop:[0,20],
                    paddingbottom:[0,20],
                    letterspacing:[0,10],
                    lineheight:[0,15],
                    }
var attrValues = {
  align:['left','center','right'],
  expind:['exposant','indice']
}
var rangeUnits = {};

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

          //console.log(Math.round(100*parseFloat(ispx[1])/fs)/100)
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
  var i=1;
  out = false;
  while ((i<100)&&(out == false)) {
    var div = document.createElement('div');
    div.setAttribute('id','font1');
    div.style='display:none';
    div.setAttribute('fontfamily',i);
    var textnode = document.createTextNode("font");
    div.appendChild(textnode);
    $('#f').contents().find('body').append(div);
    var font = $(div).css('font-family');
    $(div).remove();
    var _font = font.match(re)[0]
    if (_font === fonts[i-2]) {
      fonts.pop();
      out = true
    } else {
      fonts.push(_font);
    }
    i++;

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

function insertNodeAtCursor(node) {
    var sel, range, html;
    if ($('#f')[0].contentWindow.getSelection()) {
        sel = $('#f')[0].contentWindow.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            var focus = sel.focusNode;
            range = sel.getRangeAt(0);
            range.deleteContents();
            //var textnode =  document.createTextNode(text)
            //range.insertNode(textnode);
            range.insertNode(node);
            var range = fdocument.createRange();
            range.setStart(node,0);
            range.setEnd(node,0);
            sel.removeAllRanges();
            sel.addRange(range);


        }
    } else if (document.selection && document.selection.createRange) {

        //document.selection.createRange().text = text;
    }
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




  $('#f').contents().find('[option]').each(function() {

    var checked = $(this).attr('visible')=='yes'?"checked":"";

    var check = $('<div><input type="checkbox" '+checked+' mode="visibility" name="'+$(this).attr('option')+'"><span>'+$(this).attr('option')+'</span></div>');
    $('.toolbox-optionitems').append(check);
  });
  $('#f').contents().find('[optiontoggle]').each(function() {
    var value = $(this).attr('value');
    var checked = $(this).hasClass(value)?"checked":"";

    var check = $('<div><input type="checkbox" '+checked+' mode="toggle" clval="'+value+'" name="'+$(this).attr('optiontoggle')+'"><span>'+$(this).attr('optiontoggle')+'</span></div>');
    $('.toolbox-optionitems').append(check);



  });


  $('.toolbox input[attr][type="range"]').each(function() {
    var item = $(this).attr('item');
    if (!item) {
      item = $(this).attr('attr');
    }
    rangeUnits[item] = $(this).attr('unit');
  });

  $('#f').contents().find('[optionlist]').each(function() {
    var name = $(this).attr('optionlist');
    var html = '<div><label>'+name+'</label><select name="'+name+'">';
    $(this).children('[item]').each(function() {
      var visible = $(this).attr('visible');
      var item = $(this).attr('item');
      html += '<option value="'+item+'"'+(visible=='yes'?' selected':'')+'>'+item+'</option>';
    });
    $('.toolbox-optionitems').append($(html));
  });
  $('.toolbox-optionitems select').change(function() {

    var item = $(this).val();
    var name = $(this).attr('name');

    $('#f').contents().find('[optionlist="'+name+'"]').children('[item]').each(function() {
      if ($(this).attr('item')===item) {
        $(this).attr('visible','yes');
      } else {
        $(this).attr('visible','no');
      }
    });
  });
  $('.toolbox-optionitems input[type="checkbox"]').change(function() {
    var name = $(this).attr('name');
    var mode = $(this).attr('mode');

    if (mode=='toggle') {

      var clval = $(this).attr('clval');

      $('#f').contents().find('[optiontoggle="'+name+'"]').toggleClass(clval);
    } else {
      if ($(this).prop('checked')==false) {
        var visible = 'no';
      } else {
        var visible = 'yes';
      }
      $('#f').contents().find('[option="'+name+'"]').attr('visible',visible);
    }



  });

  $('#emoji').click(function() {
    $('#emojiselect').toggleClass('active');

  });
  $('#emojiselect').load("/static/emojis.html", function() {
    twemoji.parse($('.emoji-list').get(0), {"size":72});
    $('#emojiselect img').click(function() {
        var code = $(this).attr('alt');
        var span = $('<span>'+code+'</span>');
        twemoji.parse(span.get(0),{'folder':'svg','ext':'.svg'});
        //var img = span.children().get(0).cloneNode();
        insertNodeAtCursor(span.get(0));

        //if (selectionactive)
        //console.log(img);
    });
  });


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


  var top = Math.min(50,Math.max((areaHeight-fHeight)/2,0));
  var left = Math.max((areaWidth-fWidth)/2,0);
  $('#f').css('top',top+'px');
  $('#f').css('left',left+'px');
}

// une fois la iframe chargée
function iframeLoaded() {
  centerVisuel();
  initToolbox();
  doAction = document.getElementById('f').contentWindow.doAction;
  initOptions();

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
    if (selectionactive!=undefined && nozonefocus!=true && selectionactive!=false) {
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
    $('.toolbox-optionitems').removeClass('active');
    $('.imagepreview').css('background-image',$(this).css('background-image'));
    if (!$(this).hasClass('selected')) {
      var width = $('.imagepreview').width();
      var height = $('.imagepreview').height();

      if ($(this).attr('style')) {
        var items = $(this).attr('style').split('; ');
        var re_bp = /(-?[\.0-9]+)vw (-?[\.0-9]+)vw/;
        var re_fct = /([a-zA-Z]+)\((-?[\.0-9]+)[a-zA-Z%]*\)/;
        var filter = '';
        var transform = '';

        for(i=0;i<items.length;i++) {
          var style = items[i].split(': ');
          if (style[0] == 'background-position') {
            var res = re_bp.exec(style[1]);
            var px = parseFloat(res[1]);
            var py = parseFloat(res[2]);
            $('.toolbox-imageitems input[attr="background-position-x"]').val(px);
            $('.toolbox-imageitems input[attr="background-position-y"]').val(py);
            $('.imagepreview').css('background-position-x',(width/100)*px+'px').css('background-position-y',(width/100)*py+'px');
          } else {
            var fct = style[0];
            var ops = style[1].split(' ');
            for(j=0;j<ops.length;j++) {
              var res = re_fct.exec(ops[j]);
              if (res) {
                var op = res[1];
                var value = parseFloat(res[2]);
                if (fct=='transform') {
                  var tbelt = $('.toolbox-imageitems input[attr="transform"][item="'+op+'"]');
                  if (op=='scaleX') {
                    tbelt.prop('checked',(value==-1));
                  } else {
                    tbelt.val(value);
                  }
                  transform += ' '+op+'('+value+')';
                } else if (fct=='filter') {
                  var unit = op=='blur'?'px':'';
                  $('.toolbox-imageitems input[attr="filter"][item="'+op+'"]').val(value);
                  filter += ' '+op+'('+value+unit+')';
                }
              }

            }
          }
        }
        $('.imagepreview').css('filter',filter);
        $('.imagepreview').css('transform',transform);

                  //console.log();

        //console.log(rangeUnits);
      }

      imageactive = this;
      $('.imagepreviewzone').height($(this).height()/$(this).width() * $('.imagepreviewzone').width());
      selectionactive = undefined;
      $(this).addClass('selected');
    }
  });
  $('#f').contents().find('div.zone').click(function(e){
    $('.toolbox-zoneitems').addClass('active');
    $('.toolbox-imageitems').removeClass('active');
    $('.toolbox-optionitems').removeClass('active');
    if (imageactive!=undefined) {
      $(imageactive).removeClass('selected');
      imageactive = undefined;
    }
    e.stopPropagation();

  });
  $('button[id="options"]').click(function(e) {
    $('.toolbox-optionitems').toggleClass('active');
    $('.toolbox-zoneitems').removeClass('active');
    $('.toolbox-imageitems').removeClass('active');
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
    if (!fromToolbox) {
    $('.toolbox-zoneitems').removeClass('active');
    $('.toolbox-imageitems').removeClass('active');
    }
    fromToolbox = false;
  });



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
      $(image).css('background-image','url('+reader.result+')')
      $('.imagepreview').css('background-image','url('+reader.result+')')
    }
    reader.readAsDataURL(file);

  }
  $('#uploadimage').change(function(e) {

    var file = this.files[0];
    loadFile(imageactive,file);

  });

  var getDimensions = function (item) {
    var img = new Image();
    img.src = item.css('background-image').replace(/url\(|\)$|"/ig, '');
    return { o_w:img.width,o_h:img.height,v_w:item.width(),v_h:item.height()};
  };


  $('.toolbox-imageitems input[type="checkbox"]').change(function() {
    var attr = $(this).attr('attr');
    var item = $(this).attr('item');
    var checked = $(this).prop('checked');
    var val = (checked?-1:1);
    var transform = updateStyleItem(imageactive,'transform','scaleX',val);
    $(imageactive).css('transform',transform);
    $('.imagepreview').css('transform', transform);

  });

  function updateStyleItem(elt,attr,item,newvalue) {
    if ($(elt).attr('style')) {
      var elts = $(elt).attr('style').split('; ');
    } else {
      var elts = [];
    }
    var valuestr ="";
    var re = /([a-zA-Z]+): ([^;]+);?/;
    for (i=0;i<elts.length;i++) {
      var style = re.exec(elts[i]);
      if (style[1]==attr) {
        var telts = style[2].split(' ');
        for (j=0;j<telts.length;j++) {
          var op = telts[j].split('(')[0];
          if (op!=item) {
            valuestr += ' '+telts[j];
          }
        }

      }
    }
    valuestr += ' '+item+'(' + newvalue + ')';
    return valuestr;
  }
  $('.toolbox input[attr][type="range"]').on("input",function(e) {
    var item = $(this).attr('item')
    var val = $(this).val();
    var attr = $(this).attr('attr');

    if (attr=='background-position-x' || attr=='background-position-y') {
      //var ratio = getRatio(imageactive);
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
      var transform = updateStyleItem(imageactive,'transform','scale',val);
      $(imageactive).css('transform',transform);
      $('.imagepreview').css('transform', transform);

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
      //console.log(imageactive);
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
          if (this.tagName=='DIV') {
            $(this).contents().filter(function() { if (this.nodeType==3) return true;}).each(function() {
              var span = $(e.target).clone();
              $(span).text(this.textContent);
              $(this).replaceWith(span);
            });
          }
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
  if ($(sel.focusNode).hasClass('zone')) {
    var range = fdocument.createRange();
    var spans = $(sel.focusNode).find('span')
    var start = spans[0].childNodes[0];
    var end = spans[spans.length-1].childNodes[0];

    range.setStart(start,0);
    range.setEnd(end,end.length);

    sel.removeAllRanges();
    sel.addRange(range);
  }

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

  var targets = Array('SPAN'); //,'IMG');
  var sel = f.contentWindow.getSelection();
  if (sel.focusNode==null) {
    return;
  }
  var his_item = getHistoryItem(sel.anchorNode);


  if ($(sel.focusNode).hasClass('zone')) {
    var range = fdocument.createRange();
    var spans = $(sel.focusNode).find('span')
    var start = spans[0].childNodes[0];
    var end = spans[spans.length-1].childNodes[0];
    range.setStart(start,0);
    range.setEnd(end,end.length);

    sel.removeAllRanges();
    sel.addRange(range);

  } else {
    var range = sel.getRangeAt(0);
  }
  var startOffset = sel.anchorOffset;
  var endOffset = sel.focusOffset;

  var nodes = getSelectedNodes();

  var startNode = (range.startContainer.nodeType==3)? range.startContainer : range.startContainer.childNodes[range.startOffset] ;
  var endNode = (range.endContainer.nodeType==3)? range.endContainer : range.endContainer.childNodes[range.endOffset] ;
  var started = false;

  // Historique
  var changed = false;




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
    var endspan = $(endNode).closest('span').get(0).cloneNode(false);
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
            //var span = nodes[i].parentNode.cloneNode(false); //document.createElement('span');
            var span = endspan;
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

function sendData(action,slot,w,h) {
  //document.body.style.cursor = 'wait';
  var downloadToken = new Date().getTime();
  var attempts = 30;

  var data = {'path':visuel_path,'zones':{},'images':{},'options':{},'optionstoggle':{}};

  // options
  /*
  $('#f').contents().find('[option]').each(function() {
    var option = $(this).attr('option');
    var value = $(this).attr('visible');
    data.options[option] = value;
  });
  $('#f').contents().find('[optionlist] > [item][visible="yes"]').each(function() {
    var option = $(this).parent().attr('optionlist');
    var value = $(this).attr('item');
    data.options[option] = value;
  });
  $('#f').contents().find('[optiontoggle]').each(function() {
    var option = $(this).attr('optiontoggle');
    var value = $(this).attr('value');
    data.optionstoggle[option] = $(this).hasClass(value);
  });*/
  $('input[opttype]').each(function() {
    if ($(this).attr('type')=='checkbox') {
      data.options[$(this).attr('id')] = $(this).prop('checked');
    } else {
      data.options[$(this).attr('id')] = $(this).val();
    }
    
  })
  // zones
  $('#f').contents().find('.zone').each(function() {
    data.zones[$(this).attr('id')] = $(this).html();
  });
  $('#f').contents().find('.image').each(function() {
    var style = $(this).attr('style');
    if (!style) style = ""
    data.images[$(this).attr('id')] = style;
  });
  var avc = 0;


  $('#etape').text('Envoi des données');
  var sendTimer = window.setInterval(function() {
    avc++;
    $('.jauge').css('width',avc+'%');
  },500)
  $('#overlay').show();
  $.post( '/senddata', {'visuel':visuel,'slot':slot,'data':JSON.stringify(data)}, function(data) {
      clearInterval(sendTimer);
      if (action=='export') {
        $.get('/export?key='+data+'&w='+w+'&h='+h, function(data) {
          var key = data;
          var downloadTimer = window.setInterval(function() {
            $.get('/check_status?key='+key, function(data) {
              data = JSON.parse(data);
              if (data.position>1) data.etat = data.etat + ' ('+data.position+')';
              $('#etape').text(data.etat);
              $('.jauge').css('width',data.avancement+'%');

              if ((data.avancement == 100)||(data.avancement==-1)) {
                clearInterval(downloadTimer);
                window.setTimeout(function() {
                  if (data.avancement == 100) window.open('/retrieve_image?key='+key,'_blank');
                  $('#overlay').hide();
                  $('.jauge').css('width','0%');
                  if (window.location.href.indexOf('publicaccess')==-1) window.location.replace('/load/autosave');
                },1000);
              }
              });
          }, 500);
        })
      } else {
        $('#overlay').hide();
        $('.jauge').css('width','0%');
        window.location.replace('/load/'+slot);
      }

      //document.body.style.cursor = 'wait';

  });
}
