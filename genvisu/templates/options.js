doAction = document.getElementById('f').contentWindow.doAction;
  var paths = {};
  {% for id in options['_order'] %}
  {% set opt = options[id] %}
    {% if opt['type'] == 'time' %}
      $("#{{id}}").change(function() {
        var val=$(this).val();
        doAction($(this).attr('id'),val);
      });
    {% elif opt['type'] == 'date' %}
        $("#{{id}}").change(function() {
          var val=$(this).val();
          doAction($(this).attr('id'),val);
        });
    {% elif opt['type'] == 'checkbox' %}
    $("#{{id}}").change(function() {
      doAction($(this).attr('id'),$(this).prop('checked'));
    });
   {% elif opt['type'] == 'select' %}
      var {{id}}_lists = JSON.parse('{{ opt["lists"]|tojson }}');
      paths.{{id}} = JSON.parse('{{opt["paths"]|tojson}}');
      for (var i=1;i<={{ opt['maxdepth']}};i++) {
        $("#sel_{{id}}_"+i).change(function() {
          var depth = parseInt($(this).attr('depth'));
          var key = $(this).val();
          var items = {{id}}_lists[key];
          $('select[sel="{{id}}"]').filter(function() { return $(this).attr('depth') > depth}).hide();
          if (items != undefined) {
            var $sublist = $("#sel_{{id}}_"+(depth+1));
            $sublist.empty();
            $sublist.append('<option selected value="">Choisir</option>');
            $.each(items, function(index,value) {
                $sublist.append('<option path="'+value.path+'" value="'+value.id+'">' + value.label + "</option>");
            });
            $('select[sel="{{id}}"]').filter(function() { return $(this).attr('depth') == (depth+1)}).show();
          } else {
            $("#{{id}}").val(key);
            doAction("{{id}}",key);
          }
        });
      }
      $('select[sel="{{id}}"]').filter(function() { return $(this).attr('depth') > 1}).hide();
  {% endif %}
  {% endfor %}

initOptions = function() {
  var opt_order = JSON.parse('{{ options['_order']|tojson }}');
  var opts = document.getElementById('f').contentWindow.options;
  for (var j=0;j<opt_order.length;j++) {
    var opt = opt_order[j];
    var optelt = $('#'+opt)
    var type = optelt.attr('opttype');
    if (type=='select') {

      path = paths[opt][opts[opt]];
      if (path != undefined) {
        path = path.split(',');
        for (i=1;i<path.length;i++) {
          $('option[value="'+path[i]+'"]').parent().val(path[i]).trigger('change');
        }
      }

      optelt.val(opts[opt]);
    } else if (type=='date') {
      optelt.val(opts[opt]).trigger('change');
    } else if (type=='time') {
      optelt.val(opts[opt]).trigger('change');
    } else if (type=='checkbox') {
      optelt.prop('checked',opts[opt]).trigger('change');
    }

  }
}
