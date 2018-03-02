var attrRanges = { fontsize:[1,30],
                    fontweight:[1,9],
                    fontfamily:[1,3],
                    color:[1,6],
                    bgcolor:[0,6],
                    marginleft:[-20,20],
                    margintop:[-5,20]}

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
function getDefaults(node) {
  return { fontsize: 4, fontweight: 4, color:1, bgcolor:0, marginleft:0, margintop:0 };
}
function applyFormat(node,attr,fct,value)
{
  var defaults = getDefaults(node);

  if ((fct=='increase')||fct=='decrease') {
    var attrval = parseInt($(node).attr(attr));
    if ((!attrval)||isNaN(attrval)) attrval = defaults[attr];

    var newval = attrval + (fct=='increase'?1:-1)
    if (newval<attrRanges[attr][0] || newval>attrRanges[attr][1]) return;
  } else if (fct=='set') {
    var newval = value;
  }
  $(node).attr(attr,newval);
}

function lineAction(attr,fct,value,multiline) {
  var sel = f.contentWindow.getSelection();
  if (!multiline && (!sel.anchorNode || (sel.anchorNode != sel.focusNode)||(sel.anchorOffset != sel.focusOffset))) {
    return
  }
  if (multiline && (!sel.anchorNode || (sel.anchorNode != sel.focusNode)||(sel.anchorOffset != sel.focusOffset))) {
    var nodes = getSelectedNodes();
    for (i=0;i<nodes.length;i++) {
      if (nodes[i].tagName=='DIV') {
        applyFormat(nodes[i],attr,fct,value)
      }
    }
  } else {
    div = $(sel.anchorNode).closest('div');
    applyFormat(div[0],attr,fct,value)
  }
}

function rangeFormat(attr,fct,value)
{

  var targets = Array('SPAN','IMG');
  var sel = f.contentWindow.getSelection();
  var range = sel.getRangeAt(0);

  var startOffset = sel.anchorOffset;
  var endOffset = sel.extentOffset;
  var nodes = getSelectedNodes();
  console.log(nodes);
  var startNode = (range.startContainer.nodeType==3)? range.startContainer : range.startContainer.childNodes[range.startOffset] ;
  var endNode = (range.endContainer.nodeType==3)? range.endContainer : range.endContainer.childNodes[range.endOffset] ;
  var started = false;

  if ((nodes.length == 1) && ((nodes[0].nodeType == 1)||(startOffset != endOffset))) {
    if (nodes[0].nodeType == 3) {
      if (startOffset>0) {
        var spanbefore = nodes[0].parentNode.cloneNode(false);
        spanbefore.innerHTML = nodes[0].nodeValue.substr(0,startOffset);
        $(spanbefore).insertBefore(nodes[0].parentNode);
      }
      if (endOffset<nodes[0].nodeValue.length) {
        var spanafter = nodes[0].parentNode.cloneNode(false);
        spanafter.innerHTML = nodes[0].nodeValue.substr(endOffset);
        $(spanafter).insertAfter(nodes[0].parentNode);
      }
      nodes[0].textContent = nodes[0].nodeValue.substr(range.startOffset,range.endOffset-range.startOffset);
      range.setEnd(nodes[0],endOffset-startOffset);
      range.setStart(nodes[0],0);
      var node = nodes[0].parentNode;
    } else {
      var node = startNode;
    }
    // faire une fonction
    if (targets.includes(node.tagName)) {
      applyFormat(node,attr,fct,value)
    }
  } else {
    for (i=0;i<nodes.length;i++) {
      if (nodes[i] == startNode) {
        started = true;
        if ((nodes[i].nodeType==3)&&(nodes[i-1] != nodes[i])) {
          if (range.startOffset>0) {
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
            var span = nodes[i].parentNode.cloneNode(false); //document.createElement('span');
            console.log('clone',span);
            span.innerHTML = nodes[i].nodeValue.substr(range.endOffset);
            nodes[i].nodeValue = nodes[i].nodeValue.substr(0,range.endOffset);
            $(span).insertAfter(nodes[i].parentNode);
            range.setEnd(nodes[i],endOffset);
          }
        }
      }
      if ((started == true) && (nodes[i-1] != nodes[i])) {
        if (nodes[i] == endNode) started = false;
        if (nodes[i].nodeType==3)  {
          var node=nodes[i].parentNode;
        } else {
          var node=nodes[i];
        }

        if (targets.includes(node.tagName)) {
          console.log(node);
          applyFormat(node,attr,fct,value)
        }
        //console.log(i,nodes[i]);
      }
    }
  }
}
$("#right").click(function() {
  lineAction('marginleft','increase',1);
});
$("#left").click(function() {
  lineAction('marginleft','decrease',1);
});
$("#down").click(function() {
  lineAction('margintop','increase',1);
});
$("#up").click(function() {
  lineAction('margintop','decrease',1);
});
$("#al").click(function() {
  lineAction('align','set','left',multiline=true);
});
$("#ar").click(function() {
  lineAction('align','set','right',multiline=true);
});
$("#ac").click(function() {
  lineAction('align','set','center',multiline=true);
});
$("#aj").click(function() {
  lineAction('align','set','justify',multiline=true);
});

$("#fm").click(function() {
  rangeFormat('fontsize','decrease',1);
});
$("#fp").click(function() {
  rangeFormat('fontsize','increase',1);
});
$("#gm").click(function() {
  rangeFormat('fontweight','decrease',1);
});
$("#gp").click(function() {
  rangeFormat('fontweight','increase',1);
});
$("#f1").click(function() {
  rangeFormat('fontfamily','set',1);
});
$("#f2").click(function() {
  rangeFormat('fontfamily','set',2);
});
$("#f3").click(function() {
  rangeFormat('fontfamily','set',3);
});
$("#cm").click(function() {
  rangeFormat('color','decrease',1);
});
$("#cp").click(function() {
  rangeFormat('color','increase',1);
});
$("#bcm").click(function() {
  rangeFormat('bgcolor','decrease',1);
});
$("#bcp").click(function() {
  rangeFormat('bgcolor','increase',1);
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
    var parents = $(endNode).parents();
    console.log(endNode,$(endNode).parents());
    // Special case for a range that is contained within a single node
    if (node == endNode) {
        return [node];
    }

    // Iterate nodes until we hit the end container
    var rangeNodes = [];
    while (node) {
        //if (((node.nodeType==3)&&(node.parentNode.tagName=='SPAN'))||((node.nodeType==1)&&(!$(node.parentNode).hasClass('zone'))))
        if ($(node).find(endNode).length==0 || node==endNode) rangeNodes.push( node );
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
