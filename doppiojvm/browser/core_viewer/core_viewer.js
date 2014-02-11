(function() {
  var all_objects, browser, cb, get, gotoHash, graph2map, object_refs, print_object, print_value, receive, record_object, stack_objects;

  get = {};

  document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function() {
    var decode;
    decode = function(s) {
      return decodeURIComponent(s.split('+').join(' '));
    };
    return get[decode(arguments[1])] = decode(arguments[2]);
  });

  browser = get.source === 'browser';

  location.origin = location.origin || ("" + location.protocol + "//" + location.host);

  object_refs = {};

  stack_objects = [];

  all_objects = [];

  graph2map = function(to_visit) {
    var array_obj, field_name, field_obj, k, obj, rv, v, visiting, _i, _j, _len, _len1;
    rv = {};
    while (to_visit.length > 0) {
      visiting = to_visit;
      to_visit = [];
      for (_i = 0, _len = visiting.length; _i < _len; _i++) {
        obj = visiting[_i];
        rv[obj.ref] = obj;
        for (k in obj) {
          v = obj[k];
          if (k === 'fields' || k === 'loaded') {
            for (field_name in v) {
              field_obj = v[field_name];
              if ((field_obj != null ? field_obj.ref : void 0) != null) {
                to_visit.push(field_obj);
              }
            }
          } else if (k === 'array') {
            for (_j = 0, _len1 = v.length; _j < _len1; _j++) {
              array_obj = v[_j];
              if ((array_obj != null ? array_obj.ref : void 0) != null) {
                to_visit.push(array_obj);
              }
            }
          }
        }
      }
    }
    return rv;
  };

  record_object = function(obj) {
    if ((obj != null ? obj.ref : void 0) == null) {
      return;
    }
    if (!(obj.ref in object_refs)) {
      object_refs[obj.ref] = true;
      return stack_objects.push(obj);
    }
  };

  print_value = function(obj) {
    var ref;
    if ((obj != null ? obj.ref : void 0) != null) {
      return "<a class='ref' href='#" + obj.ref + "'>*" + obj.ref + "</a>";
    } else if (typeof obj === 'string' && /<\*(?:\d+|bootstrapLoader)>/.test(obj)) {
      ref = obj.slice(2, -1);
      return "<a class='ref' href='#" + ref + "'>*" + ref + "</a>";
    } else {
      return obj + "";
    }
  };

  print_object = function(obj, div, depth) {
    var array_obj, c, field_name, field_obj, k, li, nested, ul, v, _i, _len, _results;
    if (depth == null) {
      depth = 1;
    }
    if (depth === -1 || ((obj != null ? obj.ref : void 0) == null)) {
      return;
    }
    div.append(ul = $('<ul>', {
      id: "object-" + obj.ref
    }));
    _results = [];
    for (k in obj) {
      v = obj[k];
      if (k === 'fields' || k === 'loaded') {
        ul.append(li = $('<li>', {
          html: "" + k + ": "
        }));
        li.append(nested = $('<ul>', {
          "class": 'fields'
        }));
        _results.push((function() {
          var _results1;
          _results1 = [];
          for (field_name in v) {
            field_obj = v[field_name];
            nested.append($('<li>', {
              html: "" + field_name + ": " + (print_value(field_obj))
            }));
            _results1.push(print_object(field_obj, div, depth - 1));
          }
          return _results1;
        })());
      } else if (k === 'array') {
        ul.append(li = $('<li>', {
          html: "" + k + ": "
        }));
        if (obj.type === '[C' || obj.type === '[B') {
          _results.push(li.append("\"" + (((function() {
            var _i, _len, _results1;
            _results1 = [];
            for (_i = 0, _len = v.length; _i < _len; _i++) {
              c = v[_i];
              _results1.push(String.fromCharCode(c));
            }
            return _results1;
          })()).join('')) + "\""));
        } else {
          li.append('[');
          for (_i = 0, _len = v.length; _i < _len; _i++) {
            array_obj = v[_i];
            li.append($('<span>', {
              "class": 'array-entry',
              html: print_value(array_obj)
            }));
            print_object(field_obj, div, depth - 1);
          }
          _results.push(li.append(']'));
        }
      } else {
        _results.push(ul.append($('<li>', {
          html: "" + k + ": " + v
        })));
      }
    }
    return _results;
  };

  cb = function(data) {
    var frame, frames_div, k, li, main, obj, objects_div, ul, v, _i, _j, _k, _len, _len1, _len2;
    main = $('#main');
    frames_div = $('<div>', {
      id: 'frames'
    });
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      frame = data[_i];
      frames_div.prepend(ul = $('<ul>'));
      for (k in frame) {
        v = frame[k];
        if (k === 'stack' || k === 'locals') {
          ul.append(li = $('<li>', {
            html: "" + k + ": "
          }));
          for (_j = 0, _len1 = v.length; _j < _len1; _j++) {
            obj = v[_j];
            record_object(obj);
            li.append($('<span>', {
              "class": 'array-entry',
              html: print_value(obj)
            }));
          }
        } else if (k === 'loader') {
          record_object(v);
          ul.append($('<li>', {
            html: "" + k + ": " + (print_value(v))
          }));
        } else if (k === 'name') {
          ul.append($('<li>', {
            html: "" + k + ": " + (v.replace(/;\)?(?!:)/g, '$& '))
          }));
        } else {
          ul.append($('<li>', {
            html: "" + k + ": " + v
          }));
        }
      }
    }
    frames_div.prepend($('<h1>', {
      html: 'Stack Frames'
    }));
    main.append(frames_div);
    all_objects = graph2map(stack_objects);
    objects_div = $('<div>', {
      id: 'stack-objects'
    });
    for (_k = 0, _len2 = stack_objects.length; _k < _len2; _k++) {
      obj = stack_objects[_k];
      print_object(obj, objects_div);
    }
    objects_div.prepend($('<h1>', {
      html: 'Objects'
    }));
    main.append(objects_div);
    return gotoHash();
  };

  if (browser) {
    receive = function(message) {
      if (message.origin.indexOf(location.origin) === -1) {
        console.error("Invalid message origin: " + message.origin + ". Only " + location.origin + " is allowed.");
        return;
      }
      return cb(JSON.parse(message.data));
    };
    window.addEventListener('message', receive, false);
  } else {
    $(document).ready(function() {
      var loadFile;
      $('#filepicker').show();
      loadFile = function() {
        var reader;
        reader = new FileReader();
        reader.onload = function(e) {
          return cb(JSON.parse(e.target.result));
        };
        return reader.readAsText(this.files[0]);
      };
      return $('#upload').on('change', loadFile);
    });
  }

  gotoHash = function() {
    var obj, object_div, objects_div, ref, _i, _len;
    ref = location.hash.slice(1);
    if (ref === '') {
      objects_div = $('#stack-objects');
      objects_div.html('');
      for (_i = 0, _len = stack_objects.length; _i < _len; _i++) {
        obj = stack_objects[_i];
        print_object(obj, objects_div);
      }
      objects_div.prepend($('<h1>', {
        html: 'Objects'
      }));
      return;
    }
    object_div = $("#object-" + ref);
    if (object_div[0] == null) {
      objects_div = $('#stack-objects');
      objects_div.html('<h1>Objects</h1>');
      print_object(all_objects[ref], objects_div);
      object_div = $("#object-" + ref);
    }
    object_div[0].scrollIntoView(true);
    object_div.css('backgroundColor', '#ffc');
    return setTimeout((function() {
      return object_div.css('backgroundColor', '');
    }), 400);
  };

  window.addEventListener('hashchange', gotoHash);

}).call(this);
