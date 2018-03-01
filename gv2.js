var f = document.getElementById("f");
function makeStyleProp(styles) {
  prop = "";
  for (var s in styles) {
    if (s!="") prop += s+': '+styles[s]+'; ';
  }
  return prop;
}
function getStyles(obj) {
  if ($(obj).attr('style')==undefined) {
    return {};
  }
var stylestemp = $(obj).attr('style').split(';');
   var styles = {};
   var c = '';
   for (var x = 0, l = stylestemp.length; x < l; x++) {
     c = stylestemp[x].split(':');
     styles[$.trim(c[0])] = $.trim(c[1]);
   }
  return styles
}
function updateStyle(value,n,unit) {
  return  (parseInt(value)+n)+unit;
}
$("#fm").click(function() {
  var sel = f.contentWindow.getSelection();
  console.log(getSelectedNodes(),sel.anchorNode.parentNode,sel.focusNode.parentNode);
  return


  var zone = $(start).closest('div.zone');
  var zoneStyles = getStyles(zone);
  var parentStyles;

  //var end = f.focusNode;
  var current = start;
  while (current) {
    var parent = sel.anchorNode.parentNode;
    if ($(parent).attr('style') == undefined) {
      parentStyles = zoneStyles;
    } else {
      parentStyles = getStyles(parent);
    }
    if (current.nodeType == 3) { // #text
        span = document.createElement('span');
        if (current == start) {
          $(span).text(current.nodeValue.substr(sel.anchorOffset))
                 .css('font-size', updateStyle(parentStyles['font-size'],1,'vw'));
          var partxt = sel.anchorNode.data;

          sel.anchorNode.data =  partxt.substr(0,sel.anchorOffset);
          if (parent.tagName == 'DIV') {
             $(sel.anchorNode.nextSibling).before(span);
          } else {
             $(sel.anchorNode.parentNode).after(span);
          }
          var range = sel.getRangeAt(0);
          range.setStart(span,0);
        }
    } else if ( current.nodeType == 1) {
      if (current==end) {
          var partxt = sel.focusNode.data;
          console.log(partxt);

          $(span).text(partxt.substr(0,sel.focusOffset))
                 .css('font-size', updateStyle(parentStyles['font-size'],1,'vw'));


          sel.focusNode.data =  partxt.substr(sel.focusOffset);
          if (parent.tagName == 'DIV') {
             $(sel.focusNode.previousSibling).after(span);
          } else {
             $(sel.focusNode.parentNode).before(span);
          }
          //var range = sel.getRangeAt(0);
          //range.setEnd(span,0);
        } else {
      var nodeStyles = getStyles(current);
      var size = (nodeStyles['font-size'] != undefined)?nodeStyles['font-size']:parentStyles['font-size'];
      $(current).css('font-size',updateStyle(size,1,'vw'));
        }
    }
    console.log(current,end,current.nodeType,current.nodeValue,current.innerText);
    current = current.nextSibling;
  }

});
$("#fp").click(function() {
  $.each(getSelectedNodes(),function () { if (this.tagName == 'SPAN') {

   var styles = getStyles(this);
    styles['font-size'] = (parseInt(styles['font-size'])+1)+'vw';
   console.log(makeStyleProp(styles)); $(this).attr('style',makeStyleProp(styles));
  }

  });
  });
  var execFontSize = function (size, unit) {
    var spanString = $('<span/>', {
        'text': f.contentWindow.getSelection()
    }).css('font-size', size + unit).prop('outerHTML');

console.log(f.contentWindow.document);   f.contentWindow.document.execCommand('insertHTML', false, spanString);
};
$('#test').click(function () {


  execFontSize('10','vw');
});


function nextNode(node) {
    if (node.hasChildNodes()) {
        return node.firstChild;
    } else {
        while (node && !node.nextSibling) {
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

    // Special case for a range that is contained within a single node
    if (node == endNode) {
        return [node];
    }

    // Iterate nodes until we hit the end container
    var rangeNodes = [];
    while (node && node != endNode) {
        rangeNodes.push( node = nextNode(node) );
    }

    // Add partially selected nodes at the start of the range
    node = range.startContainer;
    while (node && node != range.commonAncestorContainer) {
        rangeNodes.unshift(node);
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
