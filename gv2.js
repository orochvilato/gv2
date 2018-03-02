$(function() {
  $('#f').on('load', iframeLoaded);
  $('#f').attr('src','view.html');
});
var f = document.getElementById("f");

document.execCommand('insertBrOnReturn',false);
function iframeLoaded() {
  $('#f').contents().find('div.zone').keypress(function(e) {
    var frame = $('#f')[0];
    var fwindow = frame.contentWindow;
    var fdocument = fwindow.document;
    var fzone = e.target;
    var charcode = e.charCode;

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
          console.log('add');
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

}

$("#fm").click(function() {
  var sel = f.contentWindow.getSelection();
  var range = sel.getRangeAt(0);
  console.log(range);
  var startOffset = sel.anchorOffset;
  var endOffset = sel.extentOffset;
  var nodes = getSelectedNodes();
  var startNode = (range.startContainer.nodeType==3)? range.startContainer : range.startContainer.childNodes[range.startOffset] ;
  var endNode = (range.endContainer.nodeType==3)? range.endContainer : range.endContainer.childNodes[range.endOffset] ;
  var started = false;
  for (i=0;i<nodes.length;i++) {
    if (nodes[i] == startNode) {
      started = true;
      if ((nodes[i].nodeType==3)&&(nodes[i-1] != nodes[i])) {
        if (range.startOffset>0) {
          var span = document.createElement('span');
          span.innerHTML = nodes[i].nodeValue.substr(0,range.startOffset);
          nodes[i].textContent = nodes[i].nodeValue.substr(range.startOffset);
          $(span).insertBefore(nodes[i].parentNode);

        }
      }
    }
    if (nodes[i] == endNode) {
      started = false;
      if (nodes[i].nodeType==3) {
        if (range.endOffset<nodes[i].nodeValue.length) {
          var span = document.createElement('span');
          span.innerHTML = nodes[i].nodeValue.substr(range.endOffset);
          nodes[i].nodeValue = nodes[i].nodeValue.substr(0,range.endOffset);
          $(span).insertAfter(nodes[i].parentNode);
          range.setEnd(span,0);

        }
      }
    }
    if ((started == true) && (nodes[i-1] != nodes[i])) {

      console.log(i,nodes[i]);
    }
  }
  console.log(nodes);
  return
  defaults = { fontsize: 4};
  if (nodes.length>1) {

    // 1ere node
    if (startOffset>0) {


      var startnode = 1;
    } else {
      var startnode = 0;
    }
    // derniere node
    if ($(nodes[nodes.length-1]).text().length == endOffset) {
      var nbnodes = nodes.length;
      console.log('bingo');
    } else {
      var nbnodes = nodes.length-1;
    }

    for(i=startnode;i<nbnodes;i++) {
      var fontsize = parseInt($(nodes[i]).attr('fontsize'));
      if (!fontsize) fontsize = defaults.fontsize;
      $(nodes[i]).attr('fontsize',fontsize+1)
    }
  }

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
    while (node) {
        //if (((node.nodeType==3)&&(node.parentNode.tagName=='SPAN'))||((node.nodeType==1)&&(!$(node.parentNode).hasClass('zone'))))
        rangeNodes.push( node );
        node = nextNode(node);
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
