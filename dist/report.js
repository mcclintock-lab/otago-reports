require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
module.exports = function(el) {
  var $el, $toggler, app, e, node, nodeid, toc, toggler, togglers, view, _i, _len, _ref;
  $el = $(el);
  app = window.app;
  toc = app.getToc();
  if (!toc) {
    console.log('No table of contents found');
    return;
  }
  togglers = $el.find('a[data-toggle-node]');
  _ref = togglers.toArray();
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    toggler = _ref[_i];
    $toggler = $(toggler);
    nodeid = $toggler.data('toggle-node');
    try {
      view = toc.getChildViewById(nodeid);
      node = view.model;
      $toggler.attr('data-visible', !!node.get('visible'));
      $toggler.data('tocItem', view);
    } catch (_error) {
      e = _error;
      $toggler.attr('data-not-found', 'true');
    }
  }
  return togglers.on('click', function(e) {
    e.preventDefault();
    $el = $(e.target);
    view = $el.data('tocItem');
    if (view) {
      view.toggleVisibility(e);
      return $el.attr('data-visible', !!view.model.get('visible'));
    } else {
      return alert("Layer not found in the current Table of Contents. \nExpected nodeid " + ($el.data('toggle-node')));
    }
  });
};


},{}],3:[function(require,module,exports){
module.exports = function(el, rasterLayersList) {
  var $el, $toggler, app, extent, height, layer, mapImage, rasterLayer, seasketch_layer_id, toc, toggled, toggler, togglers, url, width, _i, _j, _len, _len1, _ref, _ref1, _ref2, _results,
    _this = this;
  $el = $(el);
  app = window.app;
  if (((_ref = this.rasterLayers) != null ? _ref.length : void 0) > 0) {
    _ref1 = this.rasterLayers;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      rasterLayer = _ref1[_i];
      window.app.projecthomepage.map.removeLayer(rasterLayer);
    }
    this.rasterLayers = [];
  }
  togglers = $el.find('a[data-raster-url]');
  _ref2 = togglers.toArray();
  _results = [];
  for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
    toggler = _ref2[_j];
    $toggler = $(toggler);
    url = $toggler.data('raster-url');
    width = $toggler.data('width');
    height = $toggler.data('height');
    extent = $toggler.data('extent').split(',');
    toggled = $toggler.data('toggled');
    seasketch_layer_id = $toggler.data('seasketch-layer-id');
    if (!url || !width || !height || !extent) {
      throw new Error("Raster links must include data-raster-url, data-width, data-height, and data-extent attributes");
    }
    layer = new esri.layers.MapImageLayer({
      visible: toggled
    });
    mapImage = new esri.layers.MapImage({
      'extent': {
        'xmin': extent[0],
        'ymin': extent[1],
        'xmax': extent[2],
        'ymax': extent[3],
        'spatialReference': {
          'wkid': 3857
        }
      },
      'href': url
    });
    toc = $("<div class=\"tableOfContents\">\n<div class=\"tableOfContentsItem\" data-dp-status=\"\" data-type=\"sketch\" data-loading=\"false\">\n  <div unselectable=\"on\" class=\"item\" data-visibility=\"" + toggled + "\" data-checkoffonly=\"\" data-hidechildren=\"no\" data-selected=\"false\">\n    <span unselectable=\"on\" class=\"loading\">&nbsp;</span>\n    <span unselectable=\"on\" class=\"expander\"></span>\n    <span unselectable=\"on\" class=\"visibility\"></span>\n    <span unselectable=\"on\" class=\"icon\" style=\"\"></span>\n    <span unselectable=\"on\" class=\"name\">" + ($toggler.text()) + "</span>\n    <span unselectable=\"on\" class=\"context\"></span>\n    <span unselectable=\"on\" class=\"description\" style=\"display: none;\"></span>\n  </div>\n</div>\n</div>");
    $toggler.replaceWith(toc);
    $toggler = toc.find('.tableOfContentsItem');
    layer.addImage(mapImage);
    layer.seasketch_layer_id = seasketch_layer_id;
    rasterLayersList.push(layer);
    window.app.projecthomepage.map.addLayer(layer);
    $toggler.data('layer', layer);
    _results.push($toggler.on('click', function(e) {
      var item;
      item = $(e.target).closest('.tableOfContentsItem');
      layer = item.data('layer');
      item.find('.item').attr('data-visibility', !layer.visible);
      layer.setVisibility(!layer.visible);
      return e.preventDefault();
    }));
  }
  return _results;
};


},{}],4:[function(require,module,exports){
var JobItem,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JobItem = (function(_super) {
  __extends(JobItem, _super);

  JobItem.prototype.className = 'reportResult';

  JobItem.prototype.events = {};

  JobItem.prototype.bindings = {
    "h6 a": {
      observe: "serviceName",
      updateView: true,
      attributes: [
        {
          name: 'href',
          observe: 'serviceUrl'
        }
      ]
    },
    ".startedAt": {
      observe: ["startedAt", "status"],
      visible: function() {
        var _ref;
        return (_ref = this.model.get('status')) !== 'complete' && _ref !== 'error';
      },
      updateView: true,
      onGet: function() {
        if (this.model.get('startedAt')) {
          return "Started " + moment(this.model.get('startedAt')).fromNow() + ". ";
        } else {
          return "";
        }
      }
    },
    ".status": {
      observe: "status",
      onGet: function(s) {
        switch (s) {
          case 'pending':
            return "waiting in line";
          case 'running':
            return "running analytical service";
          case 'complete':
            return "completed";
          case 'error':
            return "an error occurred";
          default:
            return s;
        }
      }
    },
    ".queueLength": {
      observe: "queueLength",
      onGet: function(v) {
        var s;
        s = "Waiting behind " + v + " job";
        if (v.length > 1) {
          s += 's';
        }
        return s + ". ";
      },
      visible: function(v) {
        return (v != null) && parseInt(v) > 0;
      }
    },
    ".errors": {
      observe: 'error',
      updateView: true,
      visible: function(v) {
        return (v != null ? v.length : void 0) > 2;
      },
      onGet: function(v) {
        if (v != null) {
          return JSON.stringify(v, null, '  ');
        } else {
          return null;
        }
      }
    }
  };

  function JobItem(model) {
    this.model = model;
    JobItem.__super__.constructor.call(this);
  }

  JobItem.prototype.render = function() {
    this.$el.html("<h6><a href=\"#\" target=\"_blank\"></a><span class=\"status\"></span></h6>\n<div>\n  <span class=\"startedAt\"></span>\n  <span class=\"queueLength\"></span>\n  <pre class=\"errors\"></pre>\n</div>");
    return this.stickit();
  };

  return JobItem;

})(Backbone.View);

module.exports = JobItem;


},{}],5:[function(require,module,exports){
var ReportResults,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ReportResults = (function(_super) {
  __extends(ReportResults, _super);

  ReportResults.prototype.defaultPollingInterval = 3000;

  function ReportResults(sketch, deps) {
    var url;
    this.sketch = sketch;
    this.deps = deps;
    this.poll = __bind(this.poll, this);
    this.url = url = "/reports/" + this.sketch.id + "/" + (this.deps.join(','));
    ReportResults.__super__.constructor.call(this);
  }

  ReportResults.prototype.poll = function() {
    var _this = this;
    return this.fetch({
      success: function() {
        var payloadSize, problem, result, _i, _len, _ref, _ref1;
        _this.trigger('jobs');
        _ref = _this.models;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          result = _ref[_i];
          if ((_ref1 = result.get('status')) !== 'complete' && _ref1 !== 'error') {
            if (!_this.interval) {
              _this.interval = setInterval(_this.poll, _this.defaultPollingInterval);
            }
            return;
          }
          console.log(_this.models[0].get('payloadSizeBytes'));
          payloadSize = Math.round(((_this.models[0].get('payloadSizeBytes') || 0) / 1024) * 100) / 100;
          console.log("FeatureSet sent to GP weighed in at " + payloadSize + "kb");
        }
        if (_this.interval) {
          window.clearInterval(_this.interval);
        }
        if (problem = _.find(_this.models, function(r) {
          return r.get('error') != null;
        })) {
          return _this.trigger('error', "Problem with " + (problem.get('serviceName')) + " job");
        } else {
          return _this.trigger('finished');
        }
      },
      error: function(e, res, a, b) {
        var json, _ref, _ref1;
        if (res.status !== 0) {
          if ((_ref = res.responseText) != null ? _ref.length : void 0) {
            try {
              json = JSON.parse(res.responseText);
            } catch (_error) {

            }
          }
          if (_this.interval) {
            window.clearInterval(_this.interval);
          }
          return _this.trigger('error', (json != null ? (_ref1 = json.error) != null ? _ref1.message : void 0 : void 0) || 'Problem contacting the SeaSketch server');
        }
      }
    });
  };

  return ReportResults;

})(Backbone.Collection);

module.exports = ReportResults;


},{}],"a21iR2":[function(require,module,exports){
var CollectionView, JobItem, RecordSet, ReportResults, ReportTab, enableLayerTogglers, enableRasterLayers, round, t, templates, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

enableLayerTogglers = require('./enableLayerTogglers.coffee');

enableRasterLayers = require('./enableRasterLayers.coffee');

round = require('./utils.coffee').round;

ReportResults = require('./reportResults.coffee');

t = require('../templates/templates.js');

templates = {
  reportLoading: t['node_modules/seasketch-reporting-api/reportLoading']
};

JobItem = require('./jobItem.coffee');

CollectionView = require('views/collectionView');

RecordSet = (function() {
  function RecordSet(data, tab, sketchClassId) {
    this.data = data;
    this.tab = tab;
    this.sketchClassId = sketchClassId;
  }

  RecordSet.prototype.toArray = function() {
    var data,
      _this = this;
    if (this.sketchClassId) {
      data = _.find(this.data.value, function(v) {
        var _ref, _ref1, _ref2;
        return ((_ref = v.features) != null ? (_ref1 = _ref[0]) != null ? (_ref2 = _ref1.attributes) != null ? _ref2['SC_ID'] : void 0 : void 0 : void 0) === _this.sketchClassId;
      });
      if (!data) {
        throw "Could not find data for sketchClass " + this.sketchClassId;
      }
    } else {
      if (_.isArray(this.data.value)) {
        data = this.data.value[0];
      } else {
        data = this.data.value;
      }
    }
    return _.map(data.features, function(feature) {
      return feature.attributes;
    });
  };

  RecordSet.prototype.raw = function(attr) {
    var attrs;
    attrs = _.map(this.toArray(), function(row) {
      return row[attr];
    });
    attrs = _.filter(attrs, function(attr) {
      return attr !== void 0;
    });
    if (attrs.length === 0) {
      this.tab.reportError("Could not get attribute " + attr + " from results");
      throw "Could not get attribute " + attr;
    } else if (attrs.length === 1) {
      return attrs[0];
    } else {
      return attrs;
    }
  };

  RecordSet.prototype.int = function(attr) {
    var raw;
    raw = this.raw(attr);
    if (_.isArray(raw)) {
      return _.map(raw, parseInt);
    } else {
      return parseInt(raw);
    }
  };

  RecordSet.prototype.float = function(attr, decimalPlaces) {
    var raw;
    if (decimalPlaces == null) {
      decimalPlaces = 2;
    }
    raw = this.raw(attr);
    if (_.isArray(raw)) {
      return _.map(raw, function(val) {
        return round(val, decimalPlaces);
      });
    } else {
      return round(raw, decimalPlaces);
    }
  };

  RecordSet.prototype.bool = function(attr) {
    var raw;
    raw = this.raw(attr);
    if (_.isArray(raw)) {
      return _.map(raw, function(val) {
        return val.toString().toLowerCase() === 'true';
      });
    } else {
      return raw.toString().toLowerCase() === 'true';
    }
  };

  return RecordSet;

})();

ReportTab = (function(_super) {
  __extends(ReportTab, _super);

  function ReportTab() {
    this.enableRasterLayers = __bind(this.enableRasterLayers, this);
    this.renderJobDetails = __bind(this.renderJobDetails, this);
    this.startEtaCountdown = __bind(this.startEtaCountdown, this);
    this.reportJobs = __bind(this.reportJobs, this);
    this.showError = __bind(this.showError, this);
    this.reportError = __bind(this.reportError, this);
    this.reportRequested = __bind(this.reportRequested, this);
    this.remove = __bind(this.remove, this);
    _ref = ReportTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ReportTab.prototype.name = 'Information';

  ReportTab.prototype.dependencies = [];

  ReportTab.prototype.initialize = function(model, options) {
    this.model = model;
    this.options = options;
    this.app = window.app;
    this.rasterLayers = [];
    _.extend(this, this.options);
    this.reportResults = new ReportResults(this.model, this.dependencies);
    this.listenToOnce(this.reportResults, 'error', this.reportError);
    this.listenToOnce(this.reportResults, 'jobs', this.renderJobDetails);
    this.listenToOnce(this.reportResults, 'jobs', this.reportJobs);
    this.listenTo(this.reportResults, 'finished', _.bind(this.render, this));
    return this.listenToOnce(this.reportResults, 'request', this.reportRequested);
  };

  ReportTab.prototype.render = function() {
    throw 'render method must be overidden';
  };

  ReportTab.prototype.show = function() {
    var _ref1, _ref2;
    this.$el.show();
    this.visible = true;
    if (((_ref1 = this.dependencies) != null ? _ref1.length : void 0) && !this.reportResults.models.length) {
      return this.reportResults.poll();
    } else if (!((_ref2 = this.dependencies) != null ? _ref2.length : void 0)) {
      this.render();
      return this.$('[data-attribute-type=UrlField] .value, [data-attribute-type=UploadField] .value').each(function() {
        var html, name, text, url, _i, _len, _ref3;
        text = $(this).text();
        html = [];
        _ref3 = text.split(',');
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          url = _ref3[_i];
          if (url.length) {
            name = _.last(url.split('/'));
            html.push("<a target=\"_blank\" href=\"" + url + "\">" + name + "</a>");
          }
        }
        return $(this).html(html.join(', '));
      });
    }
  };

  ReportTab.prototype.hide = function() {
    this.$el.hide();
    return this.visible = false;
  };

  ReportTab.prototype.remove = function() {
    var layer, _i, _len, _ref1;
    window.clearInterval(this.etaInterval);
    this.stopListening();
    _ref1 = this.rasterLayers;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      layer = _ref1[_i];
      this.app.projecthomepage.map.removeLayer(layer);
    }
    return ReportTab.__super__.remove.call(this);
  };

  ReportTab.prototype.reportRequested = function() {
    return this.$el.html(templates.reportLoading.render({}));
  };

  ReportTab.prototype.reportError = function(msg, cancelledRequest) {
    if (!cancelledRequest) {
      if (msg === 'JOB_ERROR') {
        return this.showError('Error with specific job');
      } else {
        return this.showError(msg);
      }
    }
  };

  ReportTab.prototype.showError = function(msg) {
    this.$('.progress').remove();
    this.$('p.error').remove();
    return this.$('h4').text("An Error Occurred").after("<p class=\"error\" style=\"text-align:center;\">" + msg + "</p>");
  };

  ReportTab.prototype.reportJobs = function() {
    if (!this.maxEta) {
      this.$('.progress .bar').width('100%');
    }
    return this.$('h4').text("Analyzing Designs");
  };

  ReportTab.prototype.startEtaCountdown = function() {
    var _this = this;
    if (this.maxEta) {
      _.delay(function() {
        return _this.reportResults.poll();
      }, (this.maxEta + 1) * 1000);
      return _.delay(function() {
        _this.$('.progress .bar').css('transition-timing-function', 'linear');
        _this.$('.progress .bar').css('transition-duration', "" + (_this.maxEta + 1) + "s");
        return _this.$('.progress .bar').width('100%');
      }, 500);
    }
  };

  ReportTab.prototype.renderJobDetails = function() {
    var item, job, maxEta, _i, _j, _len, _len1, _ref1, _ref2, _results,
      _this = this;
    maxEta = null;
    _ref1 = this.reportResults.models;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      job = _ref1[_i];
      if (job.get('etaSeconds')) {
        if (!maxEta || job.get('etaSeconds') > maxEta) {
          maxEta = job.get('etaSeconds');
        }
      }
    }
    if (maxEta) {
      this.maxEta = maxEta;
      this.$('.progress .bar').width('5%');
      this.startEtaCountdown();
    }
    this.$('[rel=details]').css('display', 'block');
    this.$('[rel=details]').click(function(e) {
      e.preventDefault();
      _this.$('[rel=details]').hide();
      return _this.$('.details').show();
    });
    _ref2 = this.reportResults.models;
    _results = [];
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      job = _ref2[_j];
      item = new JobItem(job);
      item.render();
      _results.push(this.$('.details').append(item.el));
    }
    return _results;
  };

  ReportTab.prototype.getResult = function(id) {
    var result, results;
    results = this.getResults();
    result = _.find(results, function(r) {
      return r.paramName === id;
    });
    if (result == null) {
      throw new Error('No result with id ' + id);
    }
    return result.value;
  };

  ReportTab.prototype.getFirstResult = function(param, id) {
    var e, result;
    result = this.getResult(param);
    try {
      return result[0].features[0].attributes[id];
    } catch (_error) {
      e = _error;
      throw "Error finding " + param + ":" + id + " in gp results";
    }
  };

  ReportTab.prototype.getResults = function() {
    var results;
    results = this.reportResults.map(function(result) {
      return result.get('result').results;
    });
    if (!(results != null ? results.length : void 0)) {
      throw new Error('No gp results');
    }
    return _.filter(results, function(result) {
      var _ref1;
      return (_ref1 = result.paramName) !== 'ResultCode' && _ref1 !== 'ResultMsg';
    });
  };

  ReportTab.prototype.recordSet = function(dependency, paramName, sketchClassId) {
    var dep, param;
    if (sketchClassId == null) {
      sketchClassId = false;
    }
    if (__indexOf.call(this.dependencies, dependency) < 0) {
      throw new Error("Unknown dependency " + dependency);
    }
    dep = this.reportResults.find(function(r) {
      return r.get('serviceName') === dependency;
    });
    if (!dep) {
      console.log(this.reportResults.models);
      throw new Error("Could not find results for " + dependency + ".");
    }
    param = _.find(dep.get('result').results, function(param) {
      return param.paramName === paramName;
    });
    if (!param) {
      console.log(dep.get('data').results);
      throw new Error("Could not find param " + paramName + " in " + dependency);
    }
    return new RecordSet(param, this, sketchClassId);
  };

  ReportTab.prototype.enableTablePaging = function() {
    return this.$('[data-paging]').each(function() {
      var $table, i, noRowsMessage, pageSize, pages, parent, rows, ul, _i, _len, _ref1;
      $table = $(this);
      pageSize = $table.data('paging');
      rows = $table.find('tbody tr').length;
      pages = Math.ceil(rows / pageSize);
      if (pages > 1) {
        $table.append("<tfoot>\n  <tr>\n    <td colspan=\"" + ($table.find('thead th').length) + "\">\n      <div class=\"pagination\">\n        <ul>\n          <li><a href=\"#\">Prev</a></li>\n        </ul>\n      </div>\n    </td>\n  </tr>\n</tfoot>");
        ul = $table.find('tfoot ul');
        _ref1 = _.range(1, pages + 1);
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          i = _ref1[_i];
          ul.append("<li><a href=\"#\">" + i + "</a></li>");
        }
        ul.append("<li><a href=\"#\">Next</a></li>");
        $table.find('li a').click(function(e) {
          var $a, a, n, offset, text;
          e.preventDefault();
          $a = $(this);
          text = $a.text();
          if (text === 'Next') {
            a = $a.parent().parent().find('.active').next().find('a');
            if (a.text() !== 'Next') {
              return a.click();
            }
          } else if (text === 'Prev') {
            a = $a.parent().parent().find('.active').prev().find('a');
            if (a.text() !== 'Prev') {
              return a.click();
            }
          } else {
            $a.parent().parent().find('.active').removeClass('active');
            $a.parent().addClass('active');
            n = parseInt(text);
            $table.find('tbody tr').hide();
            offset = pageSize * (n - 1);
            return $table.find("tbody tr").slice(offset, n * pageSize).show();
          }
        });
        $($table.find('li a')[1]).click();
      }
      if (noRowsMessage = $table.data('no-rows')) {
        if (rows === 0) {
          parent = $table.parent();
          $table.remove();
          parent.removeClass('tableContainer');
          return parent.append("<p>" + noRowsMessage + "</p>");
        }
      }
    });
  };

  ReportTab.prototype.enableLayerTogglers = function() {
    return enableLayerTogglers(this.$el);
  };

  ReportTab.prototype.enableRasterLayers = function() {
    return enableRasterLayers(this.$el, this.rasterLayers);
  };

  ReportTab.prototype.getChildren = function(sketchClassId) {
    return _.filter(this.children, function(child) {
      return child.getSketchClass().id === sketchClassId;
    });
  };

  return ReportTab;

})(Backbone.View);

module.exports = ReportTab;


},{"../templates/templates.js":"CNqB+b","./enableLayerTogglers.coffee":2,"./enableRasterLayers.coffee":3,"./jobItem.coffee":4,"./reportResults.coffee":5,"./utils.coffee":"+VosKh","views/collectionView":1}],"reportTab":[function(require,module,exports){
module.exports=require('a21iR2');
},{}],"+VosKh":[function(require,module,exports){
module.exports = {
  round: function(number, decimalPlaces) {
    var multiplier;
    if (!_.isNumber(number)) {
      number = parseFloat(number);
    }
    multiplier = Math.pow(10, decimalPlaces);
    return Math.round(number * multiplier) / multiplier;
  }
};


},{}],"api/utils":[function(require,module,exports){
module.exports=require('+VosKh');
},{}],"CNqB+b":[function(require,module,exports){
this["Templates"] = this["Templates"] || {};
this["Templates"]["node_modules/seasketch-reporting-api/attributes/attributeItem"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<tr data-attribute-id=\"");_.b(_.v(_.f("id",c,p,0)));_.b("\" data-attribute-exportid=\"");_.b(_.v(_.f("exportid",c,p,0)));_.b("\" data-attribute-type=\"");_.b(_.v(_.f("type",c,p,0)));_.b("\">");_.b("\n" + i);_.b("  <td class=\"name\">");_.b(_.v(_.f("name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("  <td class=\"value\">");_.b(_.v(_.f("formattedValue",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("</tr>");_.b("\n");return _.fl();;});
this["Templates"]["node_modules/seasketch-reporting-api/attributes/attributesTable"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<table class=\"attributes\">");_.b("\n" + i);if(_.s(_.f("attributes",c,p,1),c,p,0,44,123,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("doNotExport",c,p,1),c,p,1,0,0,"")){_.b(_.rp("attributes/attributeItem",c,p,"    "));};});c.pop();}_.b("</table>");_.b("\n");return _.fl();;});
this["Templates"]["node_modules/seasketch-reporting-api/genericAttributes"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b(" Attributes</h4>");_.b("\n" + i);_.b(_.rp("attributes/attributesTable",c,p,"    "));_.b("  </table>");_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});
this["Templates"]["node_modules/seasketch-reporting-api/reportLoading"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div class=\"reportLoading\">");_.b("\n" + i);_.b("  <!-- <div class=\"spinner\">3</div> -->");_.b("\n" + i);_.b("  <h4>Requesting Report from Server</h4>");_.b("\n" + i);_.b("  <div class=\"progress progress-striped active\">");_.b("\n" + i);_.b("    <div class=\"bar\" style=\"width: 100%;\"></div>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <a href=\"#\" rel=\"details\">details</a>");_.b("\n" + i);_.b("    <div class=\"details\">");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = this["Templates"];
}
},{}],"api/templates":[function(require,module,exports){
module.exports=require('CNqB+b');
},{}],12:[function(require,module,exports){
var EnvironmentTab, ReportTab, ids, key, partials, templates, val, value, _partials, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ReportTab = require('reportTab');

templates = require('../templates/templates.js');

_partials = require('../node_modules/seasketch-reporting-api/templates/templates.js');

partials = [];

for (key in _partials) {
  val = _partials[key];
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val;
}

ids = require('./ids.coffee');

for (key in ids) {
  value = ids[key];
  window[key] = value;
}

EnvironmentTab = (function(_super) {
  __extends(EnvironmentTab, _super);

  function EnvironmentTab() {
    this.firePagination = __bind(this.firePagination, this);
    this.setNewSortDir = __bind(this.setNewSortDir, this);
    this.hasNoReserveTypes = __bind(this.hasNoReserveTypes, this);
    this.getSelectedColumn = __bind(this.getSelectedColumn, this);
    this.getSortDir = __bind(this.getSortDir, this);
    this.setSortingColor = __bind(this.setSortingColor, this);
    this.getHabitatRowString = __bind(this.getHabitatRowString, this);
    this.getFloat = __bind(this.getFloat, this);
    this.renderSort = __bind(this.renderSort, this);
    this.setupEstuarineHabitatSorting = __bind(this.setupEstuarineHabitatSorting, this);
    this.setupCoastalHabitatSorting = __bind(this.setupCoastalHabitatSorting, this);
    this.setupSigHabitatSorting = __bind(this.setupSigHabitatSorting, this);
    this.roundData = __bind(this.roundData, this);
    this.processHabitats = __bind(this.processHabitats, this);
    _ref = EnvironmentTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  EnvironmentTab.prototype.name = 'Habitats';

  EnvironmentTab.prototype.className = 'environment';

  EnvironmentTab.prototype.timeout = 120000;

  EnvironmentTab.prototype.template = templates.environment;

  EnvironmentTab.prototype.dependencies = ['HabitatsOverview', 'NewHabRepsToolbox'];

  EnvironmentTab.prototype.render = function() {
    var REP_NAME, all_habs, attributes, coastal_hab_types, context, d3IsPresent, estuarine_hab_types, hab_sizes, habitats_represented, habs_in_sketch, habs_plural, hasCoastalHabTypes, hasEstuarineHabTypes, hasSigHabs, isCollection, isConfid, isGeneric, isMPA, noReserveTypes, scid, sig_habs;
    if (window.d3) {
      d3IsPresent = true;
    } else {
      d3IsPresent = false;
    }
    isCollection = this.model.isCollection();
    scid = this.sketchClass.id;
    if (scid === GENERIC_ID || scid === GENERIC_COLLECTION_ID) {
      isGeneric = true;
    } else {
      isGeneric = false;
    }
    isMPA = scid === MPA_ID || scid === MPA_COLLECTION_ID || scid === MPA_CONFID_COLLECTION_ID;
    hab_sizes = this.recordSet('NewHabRepsToolbox', 'HabSizes').toArray();
    habs_in_sketch = hab_sizes != null ? hab_sizes.length : void 0;
    habs_plural = habs_in_sketch !== 1;
    REP_NAME = "Patch Size (Type-1)";
    isConfid = false;
    habitats_represented = this.recordSet('NewHabRepsToolbox', 'RepresentedHabs').toArray();
    console.log("habs::::", habitats_represented);
    this.roundData(habitats_represented);
    noReserveTypes = this.hasNoReserveTypes(this.model.getChildren());
    all_habs = this.processHabitats(habitats_represented, noReserveTypes);
    coastal_hab_types = all_habs[0];
    hasCoastalHabTypes = (coastal_hab_types != null ? coastal_hab_types.length : void 0) > 0;
    estuarine_hab_types = all_habs[1];
    hasEstuarineHabTypes = (estuarine_hab_types != null ? estuarine_hab_types.length : void 0) > 0;
    sig_habs = all_habs[2];
    hasSigHabs = (sig_habs != null ? sig_habs.length : void 0) > 0;
    attributes = this.model.getAttributes();
    context = {
      sketch: this.model.forTemplate(),
      sketchClass: this.sketchClass.forTemplate(),
      attributes: this.model.getAttributes(),
      anyAttributes: this.model.getAttributes().length > 0,
      admin: this.project.isAdmin(window.user),
      d3IsPresent: d3IsPresent,
      isGeneric: isGeneric,
      isCollection: isCollection,
      isMPA: isMPA,
      coastal_hab_types: coastal_hab_types,
      hasCoastalHabTypes: hasCoastalHabTypes,
      estuarine_hab_types: estuarine_hab_types,
      hasEstuarineHabTypes: hasEstuarineHabTypes,
      sig_habs: sig_habs,
      hasSigHabs: hasSigHabs,
      habs_plural: habs_plural,
      habitats_represented: habitats_represented,
      REP_NAME: REP_NAME,
      isConfid: isConfid
    };
    this.$el.html(this.template.render(context, partials));
    this.enableLayerTogglers();
    this.roundData(hab_sizes);
    this.setupCoastalHabitatSorting(coastal_hab_types, isMPA, isCollection);
    this.setupEstuarineHabitatSorting(estuarine_hab_types, isMPA, isCollection);
    this.setupSigHabitatSorting(sig_habs, isMPA, isCollection);
    return this.enableTablePaging();
  };

  EnvironmentTab.prototype.processHabitats = function(habs_represented, noReserves) {
    var Error, coastal_hab_types, critical_habitats, estuarine_hab_types, hab, _i, _len;
    coastal_hab_types = [];
    estuarine_hab_types = [];
    critical_habitats = [];
    for (_i = 0, _len = habs_represented.length; _i < _len; _i++) {
      hab = habs_represented[_i];
      if (noReserves) {
        try {
          if (Number.parseFloat(hab.REPRESENT) === 0.0) {
            hab.REPRESENT = "NA";
          }
        } catch (_error) {
          Error = _error;
        }
      }
      if (hab.HAB_TYPE === "Bryozoan reef" || hab.HAB_TYPE === "Macrocystis bed" || hab.HAB_TYPE === "Seagrass bed") {
        'June 2019 changes\n“Sensitive Marine Habitats” table: \n only keep seagrass bed, Bryozoans (but call “Bryozoan Thicket”) \n and Macrocystis bed (but call “Giant Kelp Forest”); ';
        if (hab.HAB_TYPE === "Bryozoan reef") {
          hab.HAB_TYPE = "Bryozoan Thicket";
        }
        if (hab.HAB_TYPE === "Macrocystis bed") {
          hab.HAB_TYPE = "Giant Kelp Forest";
        }
        if (hab.HAB_TYPE === "Seagrass bed") {
          hab.HAB_TYPE = "Seagrass Bed";
        }
        critical_habitats.push(hab);
      } else {
        if (hab.HAB_TYPE.indexOf("Estuarine") === 0 || hab.HAB_TYPE === "Mud Flat") {
          estuarine_hab_types.push(hab);
        } else {
          if (hab.HAB_TYPE !== "Deep Water Gravel") {
            coastal_hab_types.push(hab);
          }
        }
      }
    }
    ' #June 2019 - removed\nna_habs = ["Brachiopod beds", "Calcareous tube worm thickets", "Chaetopteridae worm fields",\n           "Rhodolith beds", "Sea pen fields", "Sponge gardens", "Stony coral thickets"]\nfor nh in na_habs\n  new_hab = {"HAB_TYPE": nh, "SIZE_SQKM":"NA", "PERC":"NA", "REPRESENT":"NA", "REPLIC":"NA", "CONN":"NA"}\n  critical_habitats.push(new_hab)';
    return [coastal_hab_types, estuarine_hab_types, critical_habitats];
  };

  EnvironmentTab.prototype.roundData = function(habitats) {
    var hab, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = habitats.length; _i < _len; _i++) {
      hab = habitats[_i];
      hab.SIZE_SQKM = Number(hab.SIZE_SQKM).toFixed(1);
      _results.push(hab.PERC = Number(hab.PERC).toFixed(1));
    }
    return _results;
  };

  EnvironmentTab.prototype.setupSigHabitatSorting = function(habitats, isMPA, isCollection) {
    var tableName, tbodyName,
      _this = this;
    tbodyName = '.sig_hab_values';
    tableName = '.sig_hab_table';
    this.$('.sig_hab_type').click(function(event) {
      return _this.renderSort('sig_hab_type', tableName, habitats, event, "HAB_TYPE", tbodyName, false, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.sig_hab_new_area').click(function(event) {
      return _this.renderSort('sig_hab_new_area', tableName, habitats, event, "SIZE_SQKM", tbodyName, true, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.sig_hab_new_perc').click(function(event) {
      return _this.renderSort('sig_hab_new_perc', tableName, habitats, event, "PERC", tbodyName, true, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.sig_hab_represent').click(function(event) {
      return _this.renderSort('sig_hab_represent', tableName, habitats, event, "REPRESENT", tbodyName, false, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.sig_hab_replicate').click(function(event) {
      return _this.renderSort('sig_hab_replicate', tableName, habitats, event, "REPLIC", tbodyName, false, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.sig_hab_connected').click(function(event) {
      return _this.renderSort('sig_hab_connected', tableName, habitats, event, "CONN", tbodyName, true, _this.getHabitatRowString, isMPA, isCollection);
    });
    return this.renderSort('sig_hab_new_area', tableName, habitats, void 0, "SIZE_SQKM", tbodyName, true, this.getHabitatRowString, isMPA, isCollection);
  };

  EnvironmentTab.prototype.setupCoastalHabitatSorting = function(habitats, isMPA, isCollection) {
    var tableName, tbodyName,
      _this = this;
    tbodyName = '.coastal_hab_values';
    tableName = '.coastal_hab_table';
    this.$('.coastal_hab_type').click(function(event) {
      return _this.renderSort('coastal_hab_type', tableName, habitats, event, "HAB_TYPE", tbodyName, false, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.coastal_hab_new_area').click(function(event) {
      return _this.renderSort('coastal_hab_new_area', tableName, habitats, event, "SIZE_SQKM", tbodyName, true, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.coastal_hab_new_perc').click(function(event) {
      return _this.renderSort('coastal_hab_new_perc', tableName, habitats, event, "PERC", tbodyName, true, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.coastal_hab_represent').click(function(event) {
      return _this.renderSort('coastal_hab_represent', tableName, habitats, event, "REPRESENT", tbodyName, false, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.coastal_hab_replicate').click(function(event) {
      return _this.renderSort('coastal_hab_replicate', tableName, habitats, event, "REPLIC", tbodyName, false, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.coastal_hab_connected').click(function(event) {
      return _this.renderSort('coastal_hab_connected', tableName, habitats, event, "CONN", tbodyName, true, _this.getHabitatRowString, isMPA, isCollection);
    });
    return this.renderSort('coastal_hab_new_area', tableName, habitats, void 0, "SIZE_SQKM", tbodyName, true, this.getHabitatRowString, isMPA, isCollection);
  };

  EnvironmentTab.prototype.setupEstuarineHabitatSorting = function(habitats, isMPA, isCollection) {
    var tableName, tbodyName,
      _this = this;
    tbodyName = '.estuarine_hab_values';
    tableName = '.estuarine_hab_table';
    this.$('.estuarine_hab_type').click(function(event) {
      return _this.renderSort('estuarine_hab_type', tableName, habitats, event, "HAB_TYPE", tbodyName, false, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.estuarine_hab_new_area').click(function(event) {
      return _this.renderSort('estuarine_hab_new_area', tableName, habitats, event, "SIZE_SQKM", tbodyName, true, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.estuarine_hab_new_perc').click(function(event) {
      return _this.renderSort('estuarine_hab_new_perc', tableName, habitats, event, "PERC", tbodyName, true, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.estuarine_hab_represent').click(function(event) {
      return _this.renderSort('estuarine_hab_represent', tableName, habitats, event, "REPRESENT", tbodyName, false, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.estuarine_hab_replicate').click(function(event) {
      return _this.renderSort('estuarine_hab_replicate', tableName, habitats, event, "REPLIC", tbodyName, false, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.estuarine_hab_connected').click(function(event) {
      return _this.renderSort('estuarine_hab_connected', tableName, habitats, event, "CONN", tbodyName, true, _this.getHabitatRowString, isMPA, isCollection);
    });
    return this.renderSort('estuarinehab_new_area', tableName, habitats, void 0, "SIZE_SQKM", tbodyName, true, this.getHabitatRowString, isMPA, isCollection);
  };

  EnvironmentTab.prototype.renderSort = function(name, tableName, pdata, event, sortBy, tbodyName, isFloat, getRowStringValue, isMPA, isCollection) {
    var cells, columns, data, el, hab_body, rows, sortUp, targetColumn;
    if (event) {
      event.preventDefault();
    }
    if (window.d3) {
      targetColumn = this.getSelectedColumn(event, name);
      sortUp = this.getSortDir(targetColumn);
      if (isFloat) {
        data = _.sortBy(pdata, function(row) {
          if (isNaN(row[sortBy])) {
            val = -1.0;
          } else {
            val = parseFloat(row[sortBy]);
          }
          return val;
        });
      } else {
        data = _.sortBy(pdata, function(row) {
          return row[sortBy];
        });
      }
      if (sortUp) {
        data.reverse();
      }
      el = this.$(tbodyName)[0];
      hab_body = d3.select(el);
      hab_body.selectAll("tr.hab_rows").remove();
      rows = hab_body.selectAll("tr").data(data).enter().insert("tr", ":first-child").attr("class", "hab_rows");
      if (isMPA) {
        if (isCollection) {
          columns = ["HAB_TYPE", "SIZE_SQKM", "PERC", "REPLIC", "CONN"];
        } else {
          columns = ["HAB_TYPE", "SIZE_SQKM", "PERC"];
        }
      } else {
        columns = ["HAB_TYPE", "SIZE_SQKM", "PERC"];
      }
      cells = rows.selectAll("td").data(function(row, i) {
        return columns.map(function(column) {
          return {
            column: column,
            value: row[column]
          };
        });
      }).enter().append("td").text(function(d, i) {
        return d.value;
      });
      this.setNewSortDir(targetColumn, sortUp);
      this.setSortingColor(event, tableName);
      this.firePagination(tableName);
      if (event) {
        return event.stopPropagation();
      }
    }
  };

  EnvironmentTab.prototype.getFloat = function(val) {
    var error;
    try {
      return parseFloat(val);
    } catch (_error) {
      error = _error;
      return 0.0;
    }
  };

  EnvironmentTab.prototype.getHabitatRowString = function(d, isMPA, isCollection) {
    var connected_str, replicated_str, represented_str;
    if (d === void 0) {
      return "";
    }
    represented_str = "";
    replicated_str = "";
    connected_str = "";
    if (isMPA) {
      represented_str = '';
      if (isCollection) {
        replicated_str = "<td>" + d.REPLIC + "</td>";
        connected_str = "<td>" + d.CONN + "</td>";
        represented_str = "<td" > +d.REPRESENT + "</td>";
      }
    }
    return "<td>" + d.HAB_TYPE + "</td>" + "<td>" + d.SIZE_SQKM + "</td>" + "<td>" + d.PERC + "</td>" + represented_str + replicated_str;
  };

  EnvironmentTab.prototype.setSortingColor = function(event, tableName) {
    var headerName, newTargetName, oldTargetName, parent, sortingClass, targetStr;
    sortingClass = "sorting_col";
    if (event) {
      parent = $(event.currentTarget).parent();
      newTargetName = event.currentTarget.className;
      targetStr = tableName + " th.sorting_col a";
      if (this.$(targetStr) && this.$(targetStr)[0]) {
        oldTargetName = this.$(targetStr)[0].className;
        if (newTargetName !== oldTargetName) {
          headerName = tableName + " th.sorting_col";
          this.$(headerName).removeClass(sortingClass);
          return parent.addClass(sortingClass);
        }
      }
    }
  };

  EnvironmentTab.prototype.getSortDir = function(targetColumn) {
    var sortup;
    sortup = this.$('.' + targetColumn).hasClass("sort_up");
    return sortup;
  };

  EnvironmentTab.prototype.getSelectedColumn = function(event, name) {
    var habClassName, multiClasses, targetColumn;
    if (event) {
      targetColumn = event.currentTarget.className;
      multiClasses = targetColumn.split(' ');
      habClassName = _.find(multiClasses, function(classname) {
        return classname.lastIndexOf('coastal_hab', 0) === 0 || classname.lastIndexOf('estuarine_hab', 0) === 0;
      });
      if (habClassName === void 0) {
        habClassName = _.find(multiClasses, function(classname) {
          return classname.lastIndexOf('sig', 0) === 0;
        });
      }
      targetColumn = habClassName;
    } else {
      targetColumn = name;
    }
    return targetColumn;
  };

  EnvironmentTab.prototype.hasNoReserveTypes = function(reserves) {
    var Error, att, attrs, mr_str, numreserves, other_str, res, res_type, t2_str, _i, _j, _len, _len1;
    try {
      t2_str = "Type2";
      mr_str = "MR";
      other_str = "Other";
      numreserves = 0;
      for (_i = 0, _len = reserves.length; _i < _len; _i++) {
        res = reserves[_i];
        attrs = res.getAttributes();
        for (_j = 0, _len1 = attrs.length; _j < _len1; _j++) {
          att = attrs[_j];
          if (att.exportid === "MANAGEMENT") {
            res_type = att.value;
            if (res_type === mr_str || res_type.indexOf(mr_str) >= 0) {
              numreserves += 1;
            }
          }
        }
      }
      return numreserves === 0;
    } catch (_error) {
      Error = _error;
      console.log("something went wrong looking for reserve attribute...");
      return false;
    }
  };

  EnvironmentTab.prototype.setNewSortDir = function(targetColumn, sortUp) {
    if (sortUp) {
      this.$('.' + targetColumn).removeClass('sort_up');
      return this.$('.' + targetColumn).addClass('sort_down');
    } else {
      this.$('.' + targetColumn).addClass('sort_up');
      return this.$('.' + targetColumn).removeClass('sort_down');
    }
  };

  EnvironmentTab.prototype.firePagination = function(tableName) {
    var active_page, el, hab_table;
    el = this.$(tableName)[0];
    hab_table = d3.select(el);
    active_page = hab_table.selectAll(".active a");
    if (active_page && active_page[0] && active_page[0][0]) {
      return active_page[0][0].click();
    }
  };

  return EnvironmentTab;

})(ReportTab);

module.exports = EnvironmentTab;


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":18,"./ids.coffee":14,"reportTab":"a21iR2"}],13:[function(require,module,exports){
var FishingTab, ReportTab, ids, key, partials, templates, val, value, _partials, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ReportTab = require('reportTab');

templates = require('../templates/templates.js');

_partials = require('../node_modules/seasketch-reporting-api/templates/templates.js');

partials = [];

for (key in _partials) {
  val = _partials[key];
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val;
}

ids = require('./ids.coffee');

for (key in ids) {
  value = ids[key];
  window[key] = value;
}

FishingTab = (function(_super) {
  __extends(FishingTab, _super);

  function FishingTab() {
    this.firePagination = __bind(this.firePagination, this);
    this.setNewSortDir = __bind(this.setNewSortDir, this);
    this.getSortDir = __bind(this.getSortDir, this);
    this.getSelectedColumn = __bind(this.getSelectedColumn, this);
    this.renderSort = __bind(this.renderSort, this);
    this.getFloat = __bind(this.getFloat, this);
    this.getFisheryRowString = __bind(this.getFisheryRowString, this);
    this.setupFisherySorting = __bind(this.setupFisherySorting, this);
    this.roundData = __bind(this.roundData, this);
    _ref = FishingTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  FishingTab.prototype.name = 'Fishing';

  FishingTab.prototype.className = 'fishing';

  FishingTab.prototype.timeout = 120000;

  FishingTab.prototype.template = templates.fishing;

  FishingTab.prototype.dependencies = ['FishingAreas', 'FisheryIntensity'];

  FishingTab.prototype.render = function() {
    var attributes, context, d3IsPresent, existing_customary_fishing, existing_fishing_areas, fishery_intensity, hasAnyFishing, hasCustomary, hasExistingCustomary, hasExistingFishing, hasProposedCustomary, isCollection, isConfidentialMPANetwork, isMPA, proposed_customary_fishing, scid;
    if (window.d3) {
      d3IsPresent = true;
    } else {
      d3IsPresent = false;
    }
    isCollection = this.model.isCollection();
    scid = this.sketchClass.id;
    if (scid === MPA_ID || scid === MPA_COLLECTION_ID || scid === MPA_CONFID_COLLECTION_ID) {
      isMPA = true;
      isConfidentialMPANetwork = true;
    } else {
      isMPA = false;
      isConfidentialMPANetwork = false;
    }
    if (isMPA) {
      fishery_intensity = this.recordSet('FisheryIntensity', 'FisheryIntensity').toArray();
    }
    existing_customary_fishing = this.recordSet('FishingAreas', 'ExistingCustomaryArea').toArray();
    hasExistingCustomary = (existing_customary_fishing != null ? existing_customary_fishing.length : void 0) > 0;
    proposed_customary_fishing = this.recordSet('FishingAreas', 'ProposedCustomaryArea').toArray();
    hasProposedCustomary = (proposed_customary_fishing != null ? proposed_customary_fishing.length : void 0) > 0;
    hasCustomary = hasExistingCustomary || hasProposedCustomary;
    existing_fishing_areas = this.recordSet('FishingAreas', 'FishingExistingArea').toArray();
    hasExistingFishing = (existing_fishing_areas != null ? existing_fishing_areas.length : void 0) > 0;
    hasAnyFishing = hasExistingFishing || hasCustomary;
    attributes = this.model.getAttributes();
    if (isMPA) {
      context = {
        sketch: this.model.forTemplate(),
        sketchClass: this.sketchClass.forTemplate(),
        attributes: this.model.getAttributes(),
        anyAttributes: this.model.getAttributes().length > 0,
        admin: this.project.isAdmin(window.user),
        d3IsPresent: d3IsPresent,
        isCollection: isCollection,
        isMPA: isMPA,
        existing_customary_fishing: existing_customary_fishing,
        hasExistingCustomary: hasExistingCustomary,
        proposed_customary_fishing: proposed_customary_fishing,
        hasProposedCustomary: hasProposedCustomary,
        existing_fishing_areas: existing_fishing_areas,
        hasExistingFishing: hasExistingFishing,
        hasAnyFishing: hasAnyFishing,
        hasCustomary: hasCustomary,
        fishery_intensity: fishery_intensity,
        isConfidentialMPANetwork: isConfidentialMPANetwork
      };
    } else {
      context = {
        sketch: this.model.forTemplate(),
        sketchClass: this.sketchClass.forTemplate(),
        attributes: this.model.getAttributes(),
        anyAttributes: this.model.getAttributes().length > 0,
        admin: this.project.isAdmin(window.user),
        d3IsPresent: d3IsPresent,
        isCollection: isCollection,
        existing_customary_fishing: existing_customary_fishing,
        hasExistingCustomary: hasExistingCustomary,
        proposed_customary_fishing: proposed_customary_fishing,
        hasProposedCustomary: hasProposedCustomary,
        existing_fishing_areas: existing_fishing_areas,
        hasExistingFishing: hasExistingFishing,
        hasAnyFishing: hasAnyFishing,
        hasCustomary: hasCustomary,
        isMPA: isMPA,
        isConfidentialMPANetwork: isConfidentialMPANetwork
      };
    }
    this.$el.html(this.template.render(context, partials));
    this.enableLayerTogglers();
    return this.setupFisherySorting(fishery_intensity);
  };

  FishingTab.prototype.roundData = function(rec_set) {
    var high_total, low_total, rs, tot_row, _i, _len;
    low_total = 0.0;
    high_total = 0.0;
    for (_i = 0, _len = rec_set.length; _i < _len; _i++) {
      rs = rec_set[_i];
      rs.LOW = Number(rs.LOW).toFixed(1);
      low_total += Number(rs.LOW);
      rs.HIGH = Number(rs.HIGH).toFixed(1);
      high_total += Number(rs.HIGH);
      rs.TOTAL = Number(rs.TOTAL).toFixed(1);
    }
    if ((rec_set != null ? rec_set.length : void 0) > 0) {
      tot_row = {
        "NAME": "Total",
        "LOW": low_total,
        "HIGH": high_total
      };
      return rec_set.push(tot_row);
    }
  };

  FishingTab.prototype.setupFisherySorting = function(fishery_intensity) {
    var tableName, tbodyName,
      _this = this;
    tbodyName = '.fishery_values';
    tableName = '.fishery_table';
    this.$('.fishery_type').click(function(event) {
      return _this.renderSort('fishery_type', tableName, fishery_intensity, event, "FISH_TYPE", tbodyName, false, _this.getFisheryRowString);
    });
    this.$('.fishery_high').click(function(event) {
      return _this.renderSort('fishery_high', tableName, fishery_intensity, event, "HIGH", tbodyName, true, _this.getFisheryRowString);
    });
    this.$('.fishery_moderate').click(function(event) {
      return _this.renderSort('fishery_moderate', tableName, fishery_intensity, event, "MODERATE", tbodyName, true, _this.getFisheryRowString);
    });
    this.$('.fishery_low').click(function(event) {
      return _this.renderSort('fishery_low', tableName, fishery_intensity, event, "LOW", tbodyName, true, _this.getFisheryRowString);
    });
    this.$('.fishery_disp').click(function(event) {
      return _this.renderSort('fishery_disp', tableName, fishery_intensity, event, "DISP", tbodyName, true, _this.getFisheryRowString);
    });
    return this.renderSort('fishery_type', tableName, fishery_intensity, void 0, "FISH_TYPE", tbodyName, false, this.getFisheryRowString);
  };

  FishingTab.prototype.getFisheryRowString = function(d) {
    if (d === void 0) {
      return "";
    }
    return "<td>" + d.FISH_TYPE + "</td>" + "<td>" + d.HIGH + "</td>" + "<td>" + d.MODERATE + "</td>" + "<td>" + d.LOW + "</td>" + "<td>" + d.DISP + "</td>";
  };

  FishingTab.prototype.getFloat = function(val) {
    var error;
    try {
      return parseFloat(val);
    } catch (_error) {
      error = _error;
      return 0.0;
    }
  };

  FishingTab.prototype.renderSort = function(name, tableName, pdata, event, sortBy, tbodyName, isFloat, getRowStringValue) {
    var cells, columns, data, el, hab_body, rows, sortUp, targetColumn;
    if (event) {
      event.preventDefault();
    }
    if (window.d3) {
      targetColumn = this.getSelectedColumn(event, name);
      sortUp = this.getSortDir(targetColumn);
      if (isFloat) {
        data = _.sortBy(pdata, function(row) {
          if (isNaN(row[sortBy])) {
            val = -1.0;
          } else {
            val = parseFloat(row[sortBy]);
          }
          return val;
        });
      } else {
        data = _.sortBy(pdata, function(row) {
          return row[sortBy];
        });
      }
      if (sortUp) {
        data.reverse();
      }
      el = this.$(tbodyName)[0];
      hab_body = d3.select(el);
      hab_body.selectAll("tr.fishery_rows").remove();
      rows = hab_body.selectAll("tr").data(data).enter().insert("tr", ":first-child").attr("class", "fishery_rows");
      columns = ["FISH_TYPE", "HIGH", "MODERATE", "LOW", "DISP"];
      cells = rows.selectAll("td").data(function(row, i) {
        return columns.map(function(column) {
          return {
            column: column,
            value: row[column]
          };
        });
      }).enter().append("td").text(function(d, i) {
        return d.value;
      });
      this.setNewSortDir(targetColumn, sortUp);
      this.firePagination(tableName);
      if (event) {
        return event.stopPropagation();
      }
    }
  };

  FishingTab.prototype.getSelectedColumn = function(event, name) {
    var multiClasses, targetColumn;
    if (event) {
      targetColumn = event.currentTarget.className;
      multiClasses = targetColumn.split(' ');
      targetColumn = multiClasses[0];
    } else {
      targetColumn = name;
    }
    return targetColumn;
  };

  FishingTab.prototype.getSortDir = function(targetColumn) {
    var sortup;
    sortup = this.$('.' + targetColumn).hasClass("sort_up");
    return sortup;
  };

  FishingTab.prototype.setNewSortDir = function(targetColumn, sortUp) {
    if (sortUp) {
      this.$('.' + targetColumn).removeClass('sort_up');
      return this.$('.' + targetColumn).addClass('sort_down');
    } else {
      this.$('.' + targetColumn).addClass('sort_up');
      return this.$('.' + targetColumn).removeClass('sort_down');
    }
  };

  FishingTab.prototype.firePagination = function(tableName) {
    var active_page, el, hab_table;
    el = this.$(tableName)[0];
    hab_table = d3.select(el);
    active_page = hab_table.selectAll(".active a");
    if (active_page && active_page[0] && active_page[0][0]) {
      return active_page[0][0].click();
    }
  };

  return FishingTab;

})(ReportTab);

module.exports = FishingTab;


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":18,"./ids.coffee":14,"reportTab":"a21iR2"}],14:[function(require,module,exports){
module.exports = {
  GENERIC_ID: '539f5ec68d10926c29fe7762',
  GENERIC_COLLECTION_ID: '53fd19550406de684c118969',
  MPA_ID: '54d81290fa94e697759ce771',
  MPA_CONFID_COLLECTION_ID: '5582e605ac2dddd42976f41b',
  MPA_COLLECTION_ID: '56312abce837f22f06b6d272'
};


},{}],15:[function(require,module,exports){
var OverviewTab, ReportTab, ids, key, partials, templates, val, value, _partials, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ReportTab = require('reportTab');

templates = require('../templates/templates.js');

_partials = require('../node_modules/seasketch-reporting-api/templates/templates.js');

partials = [];

for (key in _partials) {
  val = _partials[key];
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val;
}

ids = require('./ids.coffee');

for (key in ids) {
  value = ids[key];
  window[key] = value;
}

OverviewTab = (function(_super) {
  __extends(OverviewTab, _super);

  function OverviewTab() {
    this.addCommas = __bind(this.addCommas, this);
    this.getMinDimCount = __bind(this.getMinDimCount, this);
    this.cleanupData = __bind(this.cleanupData, this);
    this.getAverageMinDim = __bind(this.getAverageMinDim, this);
    this.getTotalAreaPercent = __bind(this.getTotalAreaPercent, this);
    this.drawPie = __bind(this.drawPie, this);
    this.getDataValue = __bind(this.getDataValue, this);
    this.getReserveValues = __bind(this.getReserveValues, this);
    this.isType2Only = __bind(this.isType2Only, this);
    this.isCoastalHab = __bind(this.isCoastalHab, this);
    this.getNumHabs = __bind(this.getNumHabs, this);
    this.getNumberReplicatedHabs = __bind(this.getNumberReplicatedHabs, this);
    this.build_values = __bind(this.build_values, this);
    _ref = OverviewTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  OverviewTab.prototype.name = 'Overview';

  OverviewTab.prototype.className = 'overview';

  OverviewTab.prototype.timeout = 120000;

  OverviewTab.prototype.template = templates.overview;

  OverviewTab.prototype.dependencies = ['HabitatsOverview', 'ProposalSize', 'ProposalConnectivity', 'NewHabRepsToolbox'];

  OverviewTab.prototype.render = function() {
    var Error, TOTAL_COASTLINE_LENGTH, TOTAL_HABS, TOT_SIZE_SQKM, area_percent, attributes, bad_color, coastline_length, coastline_length_percent, conn_pie_values, connected_mpa_count, context, d3IsPresent, good_color, hab_sizes, isCollection, isGeneric, isMPA, max_distance, mean_distance, min_distance, mpa_avg_min_dim, mpa_avg_size_guideline, mpa_count, new_habs, not_replicated, not_represented, numSketches, num_habs, num_other, num_replicated_habs, num_represented_habs, num_reserves, num_type2, pluralSketches, plural_connected_mpa_count, plural_mpa_count, plural_other, plural_type1, plural_type2, prop_sizes, ratio, replicated_habs_pie_values, represented_habs, represented_habs_pie_values, reserve_types, scid, size, total_habs, total_mpa_count, total_percent, total_sizes;
    TOTAL_COASTLINE_LENGTH = 766.466917;
    TOT_SIZE_SQKM = 8930.662893;
    TOTAL_HABS = 22;
    scid = this.sketchClass.id;
    isCollection = this.model.isCollection();
    isMPA = scid === MPA_ID || scid === MPA_COLLECTION_ID || scid === MPA_CONFID_COLLECTION_ID;
    num_reserves = 0;
    num_type2 = 0;
    num_other = 0;
    plural_type1 = true;
    plural_type2 = true;
    plural_other = true;
    if (isCollection) {
      numSketches = this.model.getChildren().length;
      if (isMPA) {
        reserve_types = this.getReserveValues(this.model.getChildren());
        num_reserves = reserve_types[0];
        plural_type1 = num_reserves !== 1;
        num_type2 = reserve_types[1];
        plural_type2 = num_type2 !== 1;
        num_other = reserve_types[2];
        plural_other = num_other !== 1;
      }
    } else {
      numSketches = 1;
    }
    pluralSketches = numSketches > 1;
    isGeneric = scid === GENERIC_ID || scid === GENERIC_COLLECTION_ID;
    total_sizes = this.recordSet('ProposalSize', 'SizeTotals').toArray();
    prop_sizes = this.recordSet('ProposalSize', 'Sizes').toArray();
    represented_habs = this.recordSet('NewHabRepsToolbox', 'RepresentedHabs').toArray();
    hab_sizes = this.recordSet('NewHabRepsToolbox', 'HabSizes').toArray();
    num_habs = hab_sizes != null ? hab_sizes.length : void 0;
    num_represented_habs = this.getNumHabs("REPYES", represented_habs, "Yes");
    num_replicated_habs = this.getNumberReplicatedHabs("REPLIC", represented_habs);
    mpa_avg_min_dim = this.getAverageMinDim(prop_sizes);
    total_percent = this.getTotalAreaPercent(prop_sizes);
    prop_sizes = this.cleanupData(prop_sizes);
    mpa_count = this.getMinDimCount(prop_sizes);
    total_mpa_count = numSketches;
    plural_mpa_count = mpa_count !== 1;
    if (mpa_avg_min_dim < 10) {
      mpa_avg_size_guideline = "below";
    } else {
      mpa_avg_size_guideline = "above";
    }
    if ((total_sizes != null ? total_sizes.length : void 0) > 0) {
      coastline_length = total_sizes[0].COAST;
      coastline_length_percent = (coastline_length / TOTAL_COASTLINE_LENGTH) * 100.0;
      if (coastline_length_percent > 0 && coastline_length_percent < 1) {
        coastline_length_percent = "< 1";
      } else {
        coastline_length_percent = parseFloat(coastline_length_percent).toFixed(1);
        if (coastline_length_percent > 100) {
          coastline_length_percent = 100;
        }
      }
      size = total_sizes[0].SIZE_SQKM;
      coastline_length = parseFloat(coastline_length).toFixed(1);
      area_percent = parseFloat((size / TOT_SIZE_SQKM) * 100).toFixed(2);
      if (area_percent > 100) {
        area_percent = 100.0;
      }
      if (area_percent < 0.1) {
        area_percent = "< 1";
      }
    }
    new_habs = this.recordSet('HabitatsOverview', 'HabitatSize').float('NEW_HABS');
    total_habs = this.recordSet('HabitatsOverview', 'HabitatSize').float('TOT_HABS');
    ratio = (coastline_length / size).toFixed(1);
    if (isCollection) {
      good_color = "#b3cfa7";
      bad_color = "#e5cace";
      if (numSketches > 1) {
        try {
          connected_mpa_count = this.recordSet('ProposalConnectivity', 'Conn').float('NUMBER');
          plural_connected_mpa_count = true;
          min_distance = this.recordSet('ProposalConnectivity', 'Conn').float('MIN');
          max_distance = this.recordSet('ProposalConnectivity', 'Conn').float('MAX');
          mean_distance = this.recordSet('ProposalConnectivity', 'Conn').float('MEAN');
          conn_pie_values = this.build_values("MPAs Within Connectivity Range", connected_mpa_count, good_color, "MPAs Outside Connectivity Range", total_mpa_count - connected_mpa_count, bad_color);
        } catch (_error) {
          Error = _error;
          console.log("error reading connectivity...");
        }
      }
      not_represented = TOTAL_HABS - num_represented_habs;
      represented_habs_pie_values = this.build_values("Habitat-types Included", num_represented_habs, good_color, "Habitat-types Not Included", not_represented, bad_color);
      not_replicated = TOTAL_HABS - num_replicated_habs;
      replicated_habs_pie_values = this.build_values("Habitat-types Replicated", num_replicated_habs, good_color, "Habitat-types Not Replicated", not_replicated, bad_color);
    }
    if (window.d3) {
      d3IsPresent = true;
    } else {
      d3IsPresent = false;
    }
    attributes = this.model.getAttributes();
    context = {
      d3IsPresent: d3IsPresent,
      sketch: this.model.forTemplate(),
      sketchClass: this.sketchClass.forTemplate(),
      attributes: this.model.getAttributes(),
      anyAttributes: this.model.getAttributes().length > 0,
      admin: this.project.isAdmin(window.user),
      size: size,
      coastline_length: coastline_length,
      coastline_length_percent: coastline_length_percent,
      new_habs: new_habs,
      total_habs: total_habs,
      ratio: ratio,
      area_percent: area_percent,
      isCollection: isCollection,
      numSketches: numSketches,
      pluralSketches: pluralSketches,
      prop_sizes: prop_sizes,
      total_mpa_count: total_mpa_count,
      mpa_count: mpa_count,
      mpa_avg_size_guideline: mpa_avg_size_guideline,
      plural_mpa_count: plural_mpa_count,
      connected_mpa_count: connected_mpa_count,
      plural_connected_mpa_count: plural_connected_mpa_count,
      min_distance: min_distance,
      max_distance: max_distance,
      mean_distance: mean_distance,
      singleSketch: numSketches === 1,
      isMPA: isMPA,
      num_habs: num_habs,
      total_habs: TOTAL_HABS,
      num_represented_habs: num_represented_habs,
      num_replicated_habs: num_replicated_habs,
      isGeneric: isGeneric,
      isMPA: isMPA,
      num_reserves: num_reserves,
      plural_type1: plural_type1,
      num_type2: num_type2,
      plural_type2: plural_type2,
      num_other: num_other,
      plural_other: plural_other
    };
    this.$el.html(this.template.render(context, partials));
    this.enableLayerTogglers();
    this.drawPie(represented_habs_pie_values, "#represented_habs_pie");
    this.drawPie(replicated_habs_pie_values, "#replicated_habs_pie");
    return this.drawPie(conn_pie_values, "#connectivity_pie");
  };

  OverviewTab.prototype.build_values = function(yes_label, yes_count, yes_color, no_label, no_count, no_color) {
    var no_val, yes_val;
    yes_val = {
      "label": yes_label + " (" + yes_count + ")",
      "value": yes_count,
      "color": yes_color,
      "yval": 25
    };
    no_val = {
      "label": no_label + " (" + no_count + ")",
      "value": no_count,
      "color": no_color,
      "yval": 50
    };
    return [yes_val, no_val];
  };

  OverviewTab.prototype.getNumberReplicatedHabs = function(attr_name, habitats) {
    var count, e, hab, num_reps, _i, _len;
    if ((habitats != null ? habitats.length : void 0) === 0) {
      return 0;
    }
    count = 0;
    for (_i = 0, _len = habitats.length; _i < _len; _i++) {
      hab = habitats[_i];
      try {
        num_reps = Number.parseInt(hab[attr_name]);
        if (num_reps > 1) {
          if (this.isCoastalHab(hab)) {
            count += 1;
          }
        }
      } catch (_error) {
        e = _error;
      }
    }
    return count;
  };

  OverviewTab.prototype.getNumHabs = function(attr_name, habitats, tgt) {
    var count, hab, _i, _len;
    if ((habitats != null ? habitats.length : void 0) === 0) {
      return 0;
    }
    count = 0;
    for (_i = 0, _len = habitats.length; _i < _len; _i++) {
      hab = habitats[_i];
      if (hab[attr_name] === tgt) {
        if (this.isCoastalHab(hab)) {
          count += 1;
        }
      }
    }
    return count;
  };

  OverviewTab.prototype.isCoastalHab = function(hab) {
    if (hab.HAB_TYPE === "Bryozoan reef" || hab.HAB_TYPE === "Macrocystis bed" || hab.HAB_TYPE === "Seagrass bed") {
      return false;
    }
    if (hab.HAB_TYPE.indexOf("Estuarine") === 0) {
      return false;
    }
    if (hab.HAB_TYPE === "Mud Flat") {
      return false;
    }
    return true;
  };

  OverviewTab.prototype.isType2Only = function(reserves) {
    var rescounts;
    rescounts = this.getReserveValues(reserves);
    if (rescounts[0] === 0) {
      return true;
    } else {
      return false;
    }
  };

  OverviewTab.prototype.getReserveValues = function(reserves) {
    var Error, att, attrs, mr_str, num_other, num_reserves, num_type2, other_str, res, res_type, t2_str, _i, _j, _len, _len1;
    num_reserves = 0;
    num_type2 = 0;
    num_other = 0;
    t2_str = "Type2";
    mr_str = "MR";
    other_str = "Other";
    try {
      for (_i = 0, _len = reserves.length; _i < _len; _i++) {
        res = reserves[_i];
        attrs = res.getAttributes();
        for (_j = 0, _len1 = attrs.length; _j < _len1; _j++) {
          att = attrs[_j];
          if (att.exportid === "MANAGEMENT") {
            res_type = att.value;
            if (res_type === t2_str || res_type.indexOf(t2_str) >= 0) {
              num_type2 += 1;
            } else if (res_type === mr_str || res_type.indexOf(mr_str) >= 0) {
              num_reserves += 1;
            } else if (res_type === other_str || res_type.indexOf(other_str) >= 0) {
              num_other += 1;
            }
          }
        }
      }
    } catch (_error) {
      Error = _error;
      console.log('ran into problem getting mpa types');
    }
    return [num_reserves, num_type2, num_other];
  };

  OverviewTab.prototype.getDataValue = function(data) {
    return data.value;
  };

  OverviewTab.prototype.drawPie = function(data, pie_name) {
    var arc, arcs, chart, el, h, legends, pie, r, vis, vis_el, w;
    if (window.d3) {
      w = 90;
      h = 75;
      r = 25;
      vis_el = this.$(pie_name)[0];
      vis = d3.select(vis_el).append("svg:svg").data([data]).attr("width", w).attr("height", h).append("svg:g").attr("transform", "translate(" + (r * 2) + "," + (r + 5) + ")");
      pie = d3.layout.pie().value(function(d) {
        return d.value;
      });
      arc = d3.svg.arc().outerRadius(r);
      arcs = vis.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
      arcs.append("svg:path").attr("fill", function(d) {
        return d.data.color;
      }).attr("stroke", function(d) {
        if (d.data.value === 0) {
          return "none";
        } else {
          return "#545454";
        }
      }).attr("stroke-width", 0.25).attr("d", function(d) {
        return arc(d);
      });
      'el = @$(\'.viz\')[index]\nx = d3.scale.linear()\n  .domain([0, max_value])\n  .range([0, 400])\nchart = d3.select(el)\nchart.selectAll("div.range")\n  .data(t2ranges)';
      el = this.$(pie_name + "_legend")[0];
      chart = d3.select(el);
      legends = chart.selectAll(pie_name + "_legend").data(data).enter().insert("div").attr("class", "legend-row");
      legends.append("span").attr("class", "pie-label-swatch").style('background-color', function(d, i) {
        return d.color;
      });
      return legends.append("span").text(function(d, i) {
        return data[i].label;
      }).attr("class", "pie-label");
    }
  };

  OverviewTab.prototype.getTotalAreaPercent = function(prop_sizes) {
    var ps, _i, _len;
    for (_i = 0, _len = prop_sizes.length; _i < _len; _i++) {
      ps = prop_sizes[_i];
      if (ps.NAME === "Percent of Total Area") {
        return ps.SIZE_SQKM;
      }
    }
    return 0.0;
  };

  OverviewTab.prototype.getAverageMinDim = function(prop_sizes) {
    var ps, _i, _len;
    for (_i = 0, _len = prop_sizes.length; _i < _len; _i++) {
      ps = prop_sizes[_i];
      if (ps.NAME === "Average") {
        return ps.MIN_DIM;
      }
    }
  };

  OverviewTab.prototype.cleanupData = function(prop_sizes, isCollection) {
    var cleaned_props, num_sketches, ps, _i, _len;
    cleaned_props = [];
    num_sketches = prop_sizes != null ? prop_sizes.length : void 0;
    for (_i = 0, _len = prop_sizes.length; _i < _len; _i++) {
      ps = prop_sizes[_i];
      if (ps.NAME !== "Percent of Total Area") {
        ps.MIN_DIM = parseFloat(ps.MIN_DIM).toFixed(1);
        ps.SIZE_SQKM = parseFloat(ps.SIZE_SQKM).toFixed(2);
        if (ps.SIZE_SQKM < 0.1) {
          ps.SIZE_SQKM = "< 0.1";
        }
        ps.COAST = Number(ps.COAST).toFixed(1);
        if (ps.COAST === 0) {
          ps.COAST = "--";
        }
        if (num_sketches === 3) {
          if (ps.NAME !== "Average") {
            cleaned_props.push(ps);
          }
        } else {
          cleaned_props.push(ps);
        }
      }
      if (ps.NAME === "Average") {
        ps.CSS_CLASS = "is_avg";
      } else {
        ps.CSS_CLASS = "not_avg";
      }
    }
    return cleaned_props;
  };

  OverviewTab.prototype.getMinDimCount = function(prop_sizes) {
    var num_meet_criteria, ps, total_min_size, _i, _len;
    num_meet_criteria = 0;
    total_min_size = 0;
    for (_i = 0, _len = prop_sizes.length; _i < _len; _i++) {
      ps = prop_sizes[_i];
      if (ps.NAME !== "Average" && ps.MIN_DIM > 5) {
        num_meet_criteria += 1;
      }
    }
    return num_meet_criteria;
  };

  OverviewTab.prototype.addCommas = function(num_str) {
    var rgx, x, x1, x2;
    num_str += '';
    x = num_str.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  };

  return OverviewTab;

})(ReportTab);

module.exports = OverviewTab;


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":18,"./ids.coffee":14,"reportTab":"a21iR2"}],16:[function(require,module,exports){
var EnvironmentTab, FishingTab, OverviewTab, UsesTab;

OverviewTab = require('./overview.coffee');

UsesTab = require('./uses.coffee');

EnvironmentTab = require('./environment.coffee');

FishingTab = require('./fishing.coffee');

window.app.registerReport(function(report) {
  report.tabs([OverviewTab, EnvironmentTab, FishingTab, UsesTab]);
  return report.stylesheets(['./report.css']);
});


},{"./environment.coffee":12,"./fishing.coffee":13,"./overview.coffee":15,"./uses.coffee":17}],17:[function(require,module,exports){
var ReportTab, UsesTab, ids, key, partials, templates, val, value, _partials, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ReportTab = require('reportTab');

templates = require('../templates/templates.js');

_partials = require('../node_modules/seasketch-reporting-api/templates/templates.js');

partials = [];

for (key in _partials) {
  val = _partials[key];
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val;
}

ids = require('./ids.coffee');

for (key in ids) {
  value = ids[key];
  window[key] = value;
}

UsesTab = (function(_super) {
  __extends(UsesTab, _super);

  function UsesTab() {
    _ref = UsesTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  UsesTab.prototype.name = 'Other';

  UsesTab.prototype.className = 'uses';

  UsesTab.prototype.timeout = 120000;

  UsesTab.prototype.template = templates.uses;

  UsesTab.prototype.dependencies = ['OverlapWithRecreationalUses', 'SpeciesInformation', 'AdjacentTerrestrial'];

  UsesTab.prototype.render = function() {
    var Error, attributes, coastal_consents, context, d3IsPresent, hasCoastal, hasCovenants, hasHeritage, hasInfrastructure, hasMammals, hasMarineSpecies, hasNapalisCovenants, hasProtected, hasQE2covenants, hasRecUses, hasSeabirdAreas, hasSeabirdColonies, hasSeabirds, hasSeals, hasSmaro, hasUses, heritage, inHighDiversityReefFishArea, infrastructure, isCollection, isGeneric, isMPA, mammals, napalis_covenants, non_smaro_rec_uses, protected_areas, qe2_covenants, rec_uses, reef_fish, scid, seabird_colonies, seabirds, seals, showAdjacent, smaro;
    if (window.d3) {
      d3IsPresent = true;
    } else {
      d3IsPresent = false;
    }
    scid = this.sketchClass.id;
    if (scid === GENERIC_ID || scid === GENERIC_COLLECTION_ID) {
      isGeneric = true;
    } else {
      isGeneric = false;
    }
    isMPA = scid === MPA_ID || scid === MPA_COLLECTION_ID || scid === MPA_CONFID_COLLECTION_ID;
    try {
      seabirds = this.recordSet('SpeciesInformation', 'Seabirds').toArray();
      hasSeabirdAreas = (seabirds != null ? seabirds.length : void 0) > 0;
    } catch (_error) {
      Error = _error;
      hasSeabirdAreas = false;
    }
    try {
      seabird_colonies = this.recordSet('SpeciesInformation', 'SeabirdColonies').toArray();
      hasSeabirdColonies = (seabird_colonies != null ? seabird_colonies.length : void 0) > 0;
    } catch (_error) {
      Error = _error;
      hasSeabirdColonies = false;
    }
    hasSeabirds = (seabirds != null ? seabirds.length : void 0) > 0 || (seabird_colonies != null ? seabird_colonies.length : void 0) > 0;
    mammals = this.recordSet('SpeciesInformation', 'Mammals').toArray();
    hasMammals = (mammals != null ? mammals.length : void 0) > 0;
    try {
      seals = this.recordSet('SpeciesInformation', 'Seals').toArray();
      hasSeals = (seals != null ? seals.length : void 0) > 0;
    } catch (_error) {
      Error = _error;
      hasSeals = false;
    }
    reef_fish = this.recordSet('SpeciesInformation', 'ReefFish').toArray();
    inHighDiversityReefFishArea = (reef_fish != null ? reef_fish.length : void 0) > 0;
    smaro = "SMARO";
    rec_uses = this.recordSet('OverlapWithRecreationalUses', 'RecreationalUse').toArray();
    hasSmaro = false;
    non_smaro_rec_uses = rec_uses.filter(function(rec) {
      return rec.FEAT_TYPE !== smaro;
    });
    hasRecUses = false;
    heritage = this.recordSet('OverlapWithRecreationalUses', 'Heritage').toArray();
    hasHeritage = (heritage != null ? heritage.length : void 0) > 0;
    coastal_consents = this.recordSet('OverlapWithRecreationalUses', 'CoastalConsents').toArray();
    hasCoastal = (coastal_consents != null ? coastal_consents.length : void 0) > 0;
    infrastructure = this.recordSet('OverlapWithRecreationalUses', 'Infrastructure').toArray();
    hasInfrastructure = (infrastructure != null ? infrastructure.length : void 0) > 0;
    attributes = this.model.getAttributes();
    hasUses = hasRecUses || hasHeritage || hasInfrastructure || hasCoastal;
    hasMarineSpecies = false;
    protected_areas = this.recordSet('AdjacentTerrestrial', 'PublicConservationLand').toArray();
    hasProtected = (protected_areas != null ? protected_areas.length : void 0) > 0;
    qe2_covenants = this.recordSet('AdjacentTerrestrial', 'CoastalProtection').toArray();
    hasQE2covenants = (qe2_covenants != null ? qe2_covenants.length : void 0) > 0;
    napalis_covenants = this.recordSet('AdjacentTerrestrial', 'AdjacentLandCover').toArray();
    hasNapalisCovenants = (napalis_covenants != null ? napalis_covenants.length : void 0) > 0;
    hasCovenants = hasQE2covenants || hasNapalisCovenants;
    if (isGeneric || (!isCollection && isMPA)) {
      showAdjacent = true;
    } else {
      showAdjacent = false;
    }
    isCollection = this.model.isCollection();
    context = {
      sketch: this.model.forTemplate(),
      sketchClass: this.sketchClass.forTemplate(),
      attributes: this.model.getAttributes(),
      anyAttributes: this.model.getAttributes().length > 0,
      admin: this.project.isAdmin(window.user),
      d3IsPresent: d3IsPresent,
      rec_uses: non_smaro_rec_uses,
      hasSmaro: hasSmaro,
      hasRecUses: hasRecUses,
      heritage: heritage,
      hasHeritage: hasHeritage,
      coastal_consents: coastal_consents,
      hasCoastal: hasCoastal,
      infrastructure: infrastructure,
      hasInfrastructure: hasInfrastructure,
      hasUses: hasUses,
      isCollection: isCollection,
      seabirds: seabirds,
      seabird_colonies: seabird_colonies,
      hasSeabirds: hasSeabirds,
      hasSeabirdAreas: hasSeabirdAreas,
      hasSeabirdColonies: hasSeabirdColonies,
      mammals: mammals,
      hasMammals: hasMammals,
      reef_fish: reef_fish,
      seals: seals,
      hasSeals: hasSeals,
      inHighDiversityReefFishArea: inHighDiversityReefFishArea,
      hasMarineSpecies: hasMarineSpecies,
      protected_areas: protected_areas,
      hasProtected: hasProtected,
      qe2_covenants: qe2_covenants,
      hasQE2covenants: hasQE2covenants,
      napalis_covenants: napalis_covenants,
      hasNapalisCovenants: hasNapalisCovenants,
      hasCovenants: hasCovenants,
      showAdjacent: showAdjacent
    };
    this.$el.html(this.template.render(context, partials));
    return this.enableLayerTogglers();
  };

  return UsesTab;

})(ReportTab);

module.exports = UsesTab;


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":18,"./ids.coffee":14,"reportTab":"a21iR2"}],18:[function(require,module,exports){
this["Templates"] = this["Templates"] || {};
this["Templates"]["demo"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>Report Sections</h4>");_.b("\n" + i);_.b("  <p>Use report sections to group information into meaningful categories</p>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>D3 Visualizations</h4>");_.b("\n" + i);_.b("  <ul class=\"nav nav-pills\" id=\"tabs2\">");_.b("\n" + i);_.b("    <li class=\"active\"><a href=\"#chart\">Chart</a></li>");_.b("\n" + i);_.b("    <li><a href=\"#dataTable\">Table</a></li>");_.b("\n" + i);_.b("  </ul>");_.b("\n" + i);_.b("  <div class=\"tab-content\">");_.b("\n" + i);_.b("    <div class=\"tab-pane active\" id=\"chart\">");_.b("\n" + i);_.b("      <!--[if IE 8]>");_.b("\n" + i);_.b("      <p class=\"unsupported\">");_.b("\n" + i);_.b("      This visualization is not compatible with Internet Explorer 8. ");_.b("\n" + i);_.b("      Please upgrade your browser, or view results in the table tab.");_.b("\n" + i);_.b("      </p>      ");_.b("\n" + i);_.b("      <![endif]-->");_.b("\n" + i);_.b("      <p>");_.b("\n" + i);_.b("        See <code>src/scripts/demo.coffee</code> for an example of how to ");_.b("\n" + i);_.b("        use d3.js to render visualizations. Provide a table-based view");_.b("\n" + i);_.b("        and use conditional comments to provide a fallback for IE8 users.");_.b("\n" + i);_.b("        <br>");_.b("\n" + i);_.b("        <a href=\"http://twitter.github.io/bootstrap/2.3.2/\">Bootstrap 2.x</a>");_.b("\n" + i);_.b("        is loaded within SeaSketch so you can use it to create tabs and other ");_.b("\n" + i);_.b("        interface components. jQuery and underscore are also available.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("    <div class=\"tab-pane\" id=\"dataTable\">");_.b("\n" + i);_.b("      <table>");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>index</th>");_.b("\n" + i);_.b("            <th>value</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("chartData",c,p,1),c,p,0,1351,1418,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr><td>");_.b(_.v(_.f("index",c,p,0)));_.b("</td><td>");_.b(_.v(_.f("value",c,p,0)));_.b("</td></tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection emphasis\">");_.b("\n" + i);_.b("  <h4>Emphasis</h4>");_.b("\n" + i);_.b("  <p>Give report sections an <code>emphasis</code> class to highlight important information.</p>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection warning\">");_.b("\n" + i);_.b("  <h4>Warning</h4>");_.b("\n" + i);_.b("  <p>Or <code>warn</code> of potential problems.</p>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection danger\">");_.b("\n" + i);_.b("  <h4>Danger</h4>");_.b("\n" + i);_.b("  <p><code>danger</code> can also be used... sparingly.</p>");_.b("\n" + i);_.b("</div>");return _.fl();;});
this["Templates"]["environment"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Habitats Present in ");if(_.s(_.f("isCollection",c,p,1),c,p,0,382,392,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" <a href=\"#\" data-toggle-node=\"5536dbb48c5b43eb0facbc5a\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);_.b("    <p>");_.b("\n" + i);_.b("      <i>");_.b("\n" + i);_.b("        Area (%) refers to the percentage of the habitat contained within the ");if(_.s(_.f("isGeneric",c,p,1),c,p,0,657,667,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isGeneric",c,p,1),c,p,1,0,0,"")){_.b("network");};_.b("\n" + i);_.b("        <!--June 2019 removed: ");if(!_.s(_.f("isConfid",c,p,1),c,p,1,0,0,"")){_.b("‘Patch size’ for subtidal habitats refers to the width of the largest patch included in a Type-1 MPA. For intertidal habitats this refers to the maximum length. -->");_.b("\n" + i);_.b("        ");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" as a proportion of the total area of habitat within the South-East Marine region. Whether a habitat is considered ‘Representative’ under the Policy will need to be assessed on a case by case basis, taking into account such things as individual patch size and proportion of habitat. ’Replicates’ refers to there being 2 examples of the habitat type included in at least two Type-2 MPA.");};_.b("\n" + i);_.b("        ");if(_.s(_.f("isConfid",c,p,1),c,p,0,1394,1866,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Area (%) refers to the percentage of the habitat contained within the network as a proportion of the total area of habitat within the South-East Marine region. A habitat-type listed as ”Included” does not necessarily mean that it meets the requirement of being viable and therefore representative of that habitat type in the network. This will need to be assessed on a case by case basis, taking into account such things as individual patch size and proportion of habitat.");});c.pop();}_.b("\n" + i);_.b("      </i>");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <p class=\"in-report-header\">Coastal Habitat Types</p>");_.b("\n" + i);if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,1981,2935,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <table data-paging=\"22\" class=\"coastal_hab_table\"> ");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th class=\"sorting_col\" style=\"width:150px;\"><a class=\"coastal_hab_type sort_up\" href=\"#\">Habitat</a></th>");_.b("\n" + i);_.b("              <th><a  class=\"coastal_hab_new_area sort_down\" href=\"#\" >Area (km<sup>2</sup>)</a></th>");_.b("\n" + i);_.b("              <th><a class=\"coastal_hab_new_perc sort_down\" href=\"#\">Area (%)</a></th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,2411,2813,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                ");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,2462,2781,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  <!--<th><a class=\"coastal_hab_represent sort_down\" href=\"#\" >");_.b(_.v(_.f("REP_NAME",c,p,0)));_.b("</th>-->");_.b("\n" + i);_.b("                  <th><a class=\"coastal_hab_replicate sort_down\" href=\"#\">Replicates</th>");_.b("\n" + i);_.b("                  <th><a class=\"coastal_hab_connected sort_down\" href=\"#\">Connectivity (in km)<sup>*</sup></th>");_.b("\n");});c.pop();}});c.pop();}_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("         <tbody class=\"coastal_hab_values\"></tbody>");_.b("\n" + i);_.b("       </table>");_.b("\n");});c.pop();}if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:180px;\">Habitat</th>");_.b("\n" + i);_.b("              <th>Area (km<sup>2</sup>)</th>");_.b("\n" + i);_.b("              <th>Area (%)</th>");_.b("\n" + i);_.b("              ");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,3211,3451,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                ");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,3262,3419,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  <!--<th>Patch Size (Type-1)</th>-->");_.b("\n" + i);_.b("                  <th>Replicates</th>");_.b("\n" + i);_.b("                  <th>Connectivity (in km)</th>");_.b("\n");});c.pop();}});c.pop();}_.b("             ");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasCoastalHabTypes",c,p,1),c,p,0,3566,3994,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("coastal_hab_types",c,p,1),c,p,0,3603,3959,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("PERC",c,p,0)));_.b("</td>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,3760,3914,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                 ");_.b("\n" + i);_.b("                  ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3814,3880,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(" <!--<td>");_.b(_.v(_.f("REPRESENT",c,p,0)));_.b("</td>--><td>");_.b(_.v(_.f("REPLIC",c,p,0)));_.b("</td><td>");_.b(_.v(_.f("CONN",c,p,0)));_.b("</td>");});c.pop();}_.b("\n");});c.pop();}_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasCoastalHabTypes",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td colspan=\"");if(_.s(_.f("isCollection",c,p,1),c,p,0,4119,4120,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("5");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("4");};_.b("\">");_.b("\n" + i);_.b("                  <i>There are no coastal habitat types.</i>");_.b("\n" + i);_.b("                </td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n");};_.b("\n" + i);_.b("    <p class=\"in-report-header\">Estuarine Habitat Types</p>");_.b("\n" + i);if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,4454,5433,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <table data-paging=\"20\" class=\"estuarine_hab_table\"> ");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th class=\"sorting_col\" style=\"width:150px;\"><a class=\"estuarine_hab_type sort_up\" href=\"#\">Habitat</a></th>");_.b("\n" + i);_.b("              <th><a  class=\"estuarine_hab_new_area sort_down\" href=\"#\" >Area (km<sup>2</sup>)</a></th>");_.b("\n" + i);_.b("              <th><a class=\"estuarine_hab_new_perc sort_down\" href=\"#\">Area (%)</a></th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,4892,5309,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                ");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,4943,5277,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  <!--<th><a class=\"estuarine_hab_represent sort_down\" style=\"width:80px;\" href=\"#\" >");_.b(_.v(_.f("REP_NAME",c,p,0)));_.b("</th>-->");_.b("\n" + i);_.b("                  <th><a class=\"estuarine_hab_replicate sort_down\" href=\"#\" >Replicates</th>");_.b("\n" + i);_.b("                  <th><a class=\"estuarine_hab_connected sort_down\" href=\"#\">Connectivity (in km)</th>");_.b("\n");});c.pop();}});c.pop();}_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("         <tbody class=\"estuarine_hab_values\"></tbody>");_.b("\n" + i);_.b("       </table>");_.b("\n");});c.pop();}if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:150px;\">Habitat</th>");_.b("\n" + i);_.b("              <th>Area (km<sup>2</sup>)</th>");_.b("\n" + i);_.b("              <th>Area (%)</th>");_.b("\n" + i);_.b("              ");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,5709,5932,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,5743,5900,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  <!--<th>Patch Size (Type-1)</th>-->");_.b("\n" + i);_.b("                  <th>Replicates</th>");_.b("\n" + i);_.b("                  <th>Connectivity (in km)</th>");_.b("\n");});c.pop();}});c.pop();}_.b("              ");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasEstuarineHabTypes",c,p,1),c,p,0,6050,6482,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("estuarine_hab_types",c,p,1),c,p,0,6089,6445,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("PERC",c,p,0)));_.b("</td>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,6246,6400,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  ");_.b("\n" + i);_.b("                  ");if(_.s(_.f("isCollection",c,p,1),c,p,0,6301,6366,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<!--<td>");_.b(_.v(_.f("REPRESENT",c,p,0)));_.b("</td>--><td>");_.b(_.v(_.f("REPLIC",c,p,0)));_.b("</td><td>");_.b(_.v(_.f("CONN",c,p,0)));_.b("</td>");});c.pop();}_.b("\n");});c.pop();}_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasEstuarineHabTypes",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td colspan=\"");if(_.s(_.f("isCollection",c,p,1),c,p,0,6611,6612,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("5");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("4");};_.b("\">");_.b("\n" + i);_.b("                  <i>There are no estuarine habitat types.</i>");_.b("\n" + i);_.b("                </td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n");};_.b("    <p class=\"in-report-header\">Sensitive Marine Habitats</p>");_.b("\n" + i);if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,6951,7843,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <table data-paging=\"20\" class=\"sig_hab_table\"> ");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th class=\"sorting_col\" style=\"width:150px;\"><a class=\"sig_hab_type sort_down\" href=\"#\">Habitat</a></th>");_.b("\n" + i);_.b("            <th><a  class=\"sig_hab_new_area sort_up\" href=\"#\" >Area (km<sup>2</sup>)</a></th>");_.b("\n" + i);_.b("            <th><a class=\"sig_hab_new_perc sort_down\" href=\"#\">Area (%)</a></th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,7351,7735,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              ");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,7398,7705,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <!--<th><a class=\"sig_hab_represent sort_down\" style=\"width:80px;\" href=\"#\">");_.b(_.v(_.f("REP_NAME",c,p,0)));_.b("</th>-->");_.b("\n" + i);_.b("                <th><a class=\"sig_hab_replicate sort_down\" href=\"#\">Replicates</th>");_.b("\n" + i);_.b("                <th><a class=\"sig_hab_connected sort_down\" href=\"#\">Connectivity (in km) </th>");_.b("\n");});c.pop();}});c.pop();}_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("       <tbody class=\"sig_hab_values\"></tbody>");_.b("\n" + i);_.b("     </table>");_.b("\n");});c.pop();}if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th style=\"width:175px;\">Habitat</th>");_.b("\n" + i);_.b("            <th>Area (km<sup>2</sup>)</th>");_.b("\n" + i);_.b("            <th>Area (%)</th>");_.b("\n" + i);_.b("            ");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,8103,8334,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                ");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,8154,8302,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  <!--<th>Patch Size</th>-->");_.b("\n" + i);_.b("                  <th>Replicates</th>");_.b("\n" + i);_.b("                  <th>Connectivity (in km)</th>");_.b("\n");});c.pop();}});c.pop();}_.b("          ");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("hasSigHabs",c,p,1),c,p,0,8428,8808,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("sig_habs",c,p,1),c,p,0,8452,8786,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("PERC",c,p,0)));_.b("</td>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,8599,8747,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                ");_.b("\n" + i);_.b("                ");if(_.s(_.f("isCollection",c,p,1),c,p,0,8650,8715,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<!--<td>");_.b(_.v(_.f("REPRESENT",c,p,0)));_.b("</td>--><td>");_.b(_.v(_.f("REPLIC",c,p,0)));_.b("</td><td>");_.b(_.v(_.f("CONN",c,p,0)));_.b("</td>");});c.pop();}_.b("\n");});c.pop();}_.b("            </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasSigHabs",c,p,1),c,p,1,0,0,"")){_.b("          <tr>");_.b("\n" + i);_.b("              <td colspan=\"");if(_.s(_.f("isCollection",c,p,1),c,p,0,8907,8908,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("5");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("4");};_.b("\">");_.b("\n" + i);_.b("                <i>There are no habitats of significance.</i>");_.b("\n" + i);_.b("              </td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");};_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("\n");};_.b("    <p>");_.b("\n" + i);_.b("      <em>Sensitive habitats are defined in the report '<a href=\"https://www.mfe.govt.nz/sites/default/files/sensitive-marine-benthic-habitats-defined.pdf\" target=\"_blank\">Sensitive marine benthic habitats defined</a>.'</em>");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("\n" + i);_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["fishing"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("\n" + i);if(_.s(_.f("hasAnyFishing",c,p,1),c,p,0,317,2526,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hasExistingFishing",c,p,1),c,p,0,345,1382,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("      <h4>Existing Fisheries Management</h4>");_.b("\n" + i);_.b("          <p><em>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,476,483,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" includes the following existing fisheries restrictions. ");_.b("\n" + i);_.b("          Also shown is the extent that the fisheries restrictions apply to the ");if(_.s(_.f("isCollection",c,p,1),c,p,0,695,703,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketches");});c.pop();}_.b("\n" + i);_.b("          ");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" as a percentage of total sketch area. For example, 100% means no fishing of that type is currently allowed within the sketch.</em></p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <thead>");_.b("\n" + i);_.b("              <tr>");_.b("\n" + i);_.b("                <th style=\"width:250px;\">Name</th>");_.b("\n" + i);_.b("                <th>Percent</th>");_.b("\n" + i);_.b("              </tr>");_.b("\n" + i);_.b("            </thead>");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("existing_fishing_areas",c,p,1),c,p,0,1167,1299,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("PERC_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}if(_.s(_.f("hasCustomary",c,p,1),c,p,0,1427,2507,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Customary Areas</h4>");_.b("\n" + i);if(_.s(_.f("hasExistingCustomary",c,p,1),c,p,0,1543,1987,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <p> The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1579,1586,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes the following <strong>existing</strong> Customary Areas:</p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("existing_customary_fishing",c,p,1),c,p,0,1814,1907,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n");});c.pop();}if(_.s(_.f("hasProposedCustomary",c,p,1),c,p,0,2046,2464,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <p> The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,2082,2089,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes the following Customary Areas:</p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("proposed_customary_fishing",c,p,1),c,p,0,2291,2384,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n");});c.pop();}_.b("      </div>");_.b("\n");});c.pop();}_.b("\n");});c.pop();}if(!_.s(_.f("hasAnyFishing",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Existing or Customary Areas</h4>");_.b("\n" + i);_.b("        <p>No information on existing fishing areas or customary use is available for this area.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};_.b("\n" + i);if(_.s(_.f("isConfidentialMPANetwork",c,p,1),c,p,0,2809,5055,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("      <h4>Fishing Intensity</h4>");_.b("\n" + i);_.b("          <p>");_.b("\n" + i);_.b("            <em>");_.b("\n" + i);_.b("            Your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,2955,2962,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes areas identified as having high, moderate or low intensity fishing grounds for the following fisheries. The percentage of the regions high, moderate and low intensity fishing grounds covered by your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3245,3252,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" is given below. Fishery displacement shows the percentage of the regions fishery that would be displaced by your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3440,3447,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(".");_.b("\n" + i);_.b("            </em>");_.b("\n" + i);_.b("          </p>");_.b("\n" + i);if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,3565,4302,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <table data-paging=\"20\" class=\"fishery_table\"> ");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th class=\"sorting_col\" style=\"width:150px;\"><a class=\"fishery_type sort_up\" href=\"#\">Fishery</a></th>");_.b("\n" + i);_.b("                  <th><a class=\"fishery_high sort_down\" href=\"#\" >High (%)</th>");_.b("\n" + i);_.b("                  <th><a class=\"fishery_moderate sort_down\" href=\"#\">Moderate (%)</a></th>");_.b("\n" + i);_.b("                  <th><a class=\"fishery_low sort_down\" style=\"width:80px;\" href=\"#\" >Low (%)</th>");_.b("\n" + i);_.b("                  <th><a class=\"fishery_disp sort_down\" style=\"width:80px;\" href=\"#\" >Fishery displacement (%)</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("             <tbody class=\"fishery_values\"></tbody>");_.b("\n" + i);_.b("           </table>");_.b("\n");});c.pop();}if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <thead>");_.b("\n" + i);_.b("              <tr>");_.b("\n" + i);_.b("                <th style=\"width:125px;\">Fishery</th>");_.b("\n" + i);_.b("                <th>High (%)</th>");_.b("\n" + i);_.b("                <th>Moderate (%)</th>");_.b("\n" + i);_.b("                <th>Low (%)</th>");_.b("\n" + i);_.b("                <th>Fishery displacement (%)</th>");_.b("\n" + i);_.b("              </tr>");_.b("\n" + i);_.b("            </thead>");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("fishery_intensity",c,p,1),c,p,0,4726,4958,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FISH_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("MODERATE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("DISP",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n");};_.b("    </div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("<!--");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,5101,6982,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Fishing Intensity</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        The following tables contains the percent of the total SEMPF low intensity and high intensity fishing that may be displaced by the sketch. <strong>High intensity</strong> is greater than an average of 5 events per annum, <strong>Low</strong> is 5 or less events per annum.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("      <p class=\"in-report-header\">Trawl Fishing Intensity</p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>Sketch Name</th>");_.b("\n" + i);_.b("            <th>% Low Intensity</th>");_.b("\n" + i);_.b("            <th>% High Intensity</th>");_.b("\n" + i);_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("trawl",c,p,1),c,p,0,5796,5927,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("\n" + i);_.b("      <p class=\"in-report-header\">Set Net Fishing Intensity</p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>Sketch Name</th>");_.b("\n" + i);_.b("              <th>% Low Intensity</th>");_.b("\n" + i);_.b("              <th>% High Intensity</th>");_.b("\n" + i);_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("setnet",c,p,1),c,p,0,6296,6439,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("      <p class=\"in-report-header\">Long Line Fishing Intensity</p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>Sketch Name</th>");_.b("\n" + i);_.b("            <th>% Low Intensity</th>");_.b("\n" + i);_.b("            <th>% High Intensity</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("longline",c,p,1),c,p,0,6795,6926,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("-->");_.b("\n" + i);_.b("\n" + i);_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["overview"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,313,748,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isMPA",c,p,1),c,p,0,326,737,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>MPA Network</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This Collection has: <strong>");_.b(_.v(_.f("num_reserves",c,p,0)));_.b(" Type-1 MPA");if(_.s(_.f("plural_type1",c,p,1),c,p,0,496,497,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}_.b(", ");_.b(_.v(_.f("num_type2",c,p,0)));_.b(" Type-2 MPA");if(_.s(_.f("plural_type2",c,p,1),c,p,0,557,558,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}_.b(", and ");_.b(_.v(_.f("num_other",c,p,0)));_.b(" Other MPA");if(_.s(_.f("plural_other",c,p,1),c,p,0,621,622,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}_.b("</strong> .");_.b("\n" + i);_.b("        <em>Only Type-1 and Type-2 MPAs are reported on.</em>");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){if(_.s(_.f("anyAttributes",c,p,1),c,p,0,807,1125,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div class=\"reportSection\">");_.b("\n" + i);_.b("        <h4>");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("</h4>");_.b("\n" + i);_.b(_.rp("attributes/attributesTable",c,p,"        "));if(_.s(_.f("isCollection",c,p,1),c,p,0,945,1075,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <tr><td>");if(_.s(_.f("isMPA",c,p,1),c,p,0,972,986,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Number of MPAs");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,1010,1028,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Number of Sketches");});c.pop();}_.b("</td>");_.b(_.v(_.f("numSketches",c,p,0)));_.b("<td>");_.b("\n");});c.pop();}_.b("        </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");});c.pop();}};if(_.s(_.f("isGeneric",c,p,1),c,p,0,1178,1465,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,1200,1445,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection\">");_.b("\n" + i);_.b("      <h4>Number of Sketches in Collection</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This collection contains <strong>");_.b(_.v(_.f("numSketches",c,p,0)));_.b("</strong> sketch");if(_.s(_.f("pluralSketches",c,p,1),c,p,0,1396,1398,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("es");});c.pop();}_.b(".");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);_.b("  <!--");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,1500,3822,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,1522,3802,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Coastal Habitats Included in Type-1 MPA");_.b("\n" + i);_.b("        <a href=\"#\" data-toggle-node=\"5536dbb48c5b43eb0facbc5a\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("      <strong>Number of Habitat Classes</strong></br>");_.b("\n" + i);_.b("      <p style=\"margin-top:0px;\" class=\"large\">");_.b("\n" + i);_.b("        There are <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> habitat classes in the planning region, and your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1956,1966,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("\n" + i);_.b("        includes <strong>");_.b(_.v(_.f("new_habs",c,p,0)));_.b("</strong>. For more information on the Habitat Classification, see");_.b("\n" + i);_.b("        the <a href=\"http://www.doc.govt.nz/Documents/conservation/marine-and-coastal/marine-protected-areas/mpa-classification-protection-standard.pdf\" target=\"_blank\">");_.b("\n" + i);_.b("        Marine Protected Areas Classification and Protection Standard</a>");_.b("\n" + i);_.b("      </p>");_.b("\n");};if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,2428,2632,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <div>");_.b("\n" + i);_.b("          <div class=\"represented_habs_pie\" id=\"represented_habs_pie\"></div>");_.b("\n" + i);_.b("          <div class=\"represented_habs_pie_legend\" id=\"represented_habs_pie_legend\"></div>");_.b("\n" + i);_.b("        </div>");_.b("\n");});c.pop();}_.b("    </div>");_.b("\n" + i);_.b("    ");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Coastal Habitats Replicated");_.b("\n" + i);_.b("        <a href=\"#\" data-toggle-node=\"5536dbb48c5b43eb0facbc5a\" data-visible=\"false\">show layer</a>");_.b("\n" + i);_.b("      </h4>");_.b("\n" + i);if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("        <strong>Number of Habitat Classes</strong></br>");_.b("\n" + i);_.b("        <p style=\"margin-top:0px;\" class=\"large\">");_.b("\n" + i);_.b("          There are <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> habitat classes in the planning region, and your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3100,3110,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("\n" + i);_.b("          includes <strong>");_.b(_.v(_.f("new_habs",c,p,0)));_.b("</strong>. For more information on the Habitat Classification, see");_.b("\n" + i);_.b("          the <a href=\"http://www.doc.govt.nz/Documents/conservation/marine-and-coastal/marine-protected-areas/mpa-classification-protection-standard.pdf\" target=\"_blank\">");_.b("\n" + i);_.b("          Marine Protected Areas Classification and Protection Standard</a>");_.b("\n" + i);_.b("        </p>");_.b("\n");};if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,3580,3770,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div>");_.b("\n" + i);_.b("        <div class=\"replicated_habs_pie\" id=\"replicated_habs_pie\"></div>");_.b("\n" + i);_.b("        <div class=\"replicated_habs_pie_legend\" id=\"replicated_habs_pie_legend\"></div>");_.b("\n" + i);_.b("      </div>");_.b("\n");});c.pop();}_.b("    </div>");_.b("\n");});c.pop();}});c.pop();}_.b("-->");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,3854,5322,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection size tableContainer\">");_.b("\n" + i);_.b("    <h4>");if(_.s(_.f("isMPA",c,p,1),c,p,0,3923,3932,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("MPA Sizes");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,3956,3968,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Sketch Sizes");});c.pop();}_.b("</h4>");_.b("\n" + i);_.b("    <!--");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,4011,4338,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        Of the <strong>");_.b(_.v(_.f("total_mpa_count",c,p,0)));_.b("</strong> MPAs in the network, <strong>");_.b(_.v(_.f("mpa_count",c,p,0)));_.b("</strong> meet");if(!_.s(_.f("plural_mpa_count",c,p,1),c,p,1,0,0,"")){_.b("s");};_.b(" the minimum size dimension of 5km. The average minimum dimension is <strong>");_.b(_.v(_.f("mpa_avg_size_guideline",c,p,0)));_.b("</strong> the 10-20km guideline.");_.b("\n" + i);_.b("      </p>");_.b("\n");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,4367,4434,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p>The size of the sketches in this collection are:</p>");_.b("\n");});c.pop();}_.b("    -->");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>");if(_.s(_.f("isMPA",c,p,1),c,p,0,4545,4553,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("MPA Name");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,4577,4588,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Sketch Name");});c.pop();}_.b("</th>");_.b("\n" + i);_.b("            <th>Area </br>(sq. km.)</th>");_.b("\n" + i);_.b("            <th style=\"width:100px;\">Width (km)</th>");_.b("\n" + i);_.b("            <th style=\"width:100px;\">Coastline Length (km)</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("prop_sizes",c,p,1),c,p,0,4840,5031,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr class=");_.b(_.v(_.f("CSS_CLASS",c,p,0)));_.b(">");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("MIN_DIM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("COAST",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("    <p class=\"large\">");_.b("\n" + i);_.b("      This combined area within the network accounts for <strong>");_.b(_.v(_.f("area_percent",c,p,0)));_.b("%</strong> of the South-East Marine area, and <strong>");_.b(_.v(_.f("coastline_length_percent",c,p,0)));_.b("%</strong> of the South-East coastline.");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){if(_.s(_.f("isMPA",c,p,1),c,p,0,5370,6265,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size tableContainer\">");_.b("\n" + i);_.b("      <h4>MPA Size</h4>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>MPA Name</th>");_.b("\n" + i);_.b("              <th>Area </br>(sq. km.)</th>");_.b("\n" + i);_.b("              <th style=\"width:100px;\">Width (km)</th>");_.b("\n" + i);_.b("              <th style=\"width:100px;\">Coastline Length (km)</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("prop_sizes",c,p,1),c,p,0,5793,5973,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("MIN_DIM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("COAST",c,p,0)));_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This area within the MPA accounts for <strong>");_.b(_.v(_.f("area_percent",c,p,0)));_.b("%</strong> of the South-East Marine area, and <strong>");_.b(_.v(_.f("coastline_length_percent",c,p,0)));_.b("%</strong> of the South-East coastline.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}};_.b("<!--");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,6309,7376,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,6329,7358,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div class=\"reportSection\">");_.b("\n" + i);_.b("        <h4>Connectivity</h4>");_.b("\n" + i);if(_.s(_.f("singleSketch",c,p,1),c,p,0,6419,6596,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <p style=\"font-style:italic;color:gray;\" class=\"large\">");_.b("\n" + i);_.b("                No connectivity information for a collection with one sketch. ");_.b("\n" + i);_.b("              </p>");_.b("\n");});c.pop();}if(!_.s(_.f("singleSketch",c,p,1),c,p,1,0,0,"")){_.b("          <p class=\"large\">Of the <strong>");_.b(_.v(_.f("total_mpa_count",c,p,0)));_.b("</strong> MPAs in the network, <strong>");_.b(_.v(_.f("connected_mpa_count",c,p,0)));_.b("</strong>");if(_.s(_.f("plural_connected_mpa_count",c,p,1),c,p,0,6803,6807,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(" are");});c.pop();}if(!_.s(_.f("plural_connected_mpa_count",c,p,1),c,p,1,0,0,"")){_.b(" is");};_.b(" within 100 km of each other. ");_.b("\n" + i);_.b("          </p>");_.b("\n" + i);_.b("          <span class=\"conn_values\">The minimum distance between the MPAs is <strong>");_.b(_.v(_.f("min_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("          <span class=\"conn_values\">The maximum distance between the MPAs is <strong>");_.b(_.v(_.f("max_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("          <span class=\"conn_values\">The average distance between the MPAs is <strong>");_.b(_.v(_.f("mean_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n");};_.b("\n" + i);_.b("      </div>");_.b("\n");});c.pop();}});c.pop();}_.b("-->");_.b("\n" + i);if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){if(_.s(_.f("isGeneric",c,p,1),c,p,0,7425,7831,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Size</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This sketch area is <strong>");_.b(_.v(_.f("size",c,p,0)));_.b(" square kilometers</strong>, and it includes <strong>");_.b(_.v(_.f("coastline_length_percent",c,p,0)));_.b("%</strong> of the South-East Planning Region.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This sketch includes <strong>");_.b(_.v(_.f("coastline_length",c,p,0)));_.b(" kilometers</strong> of coastline.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}};_.b("\n" + i);_.b("\n" + i);_.b("<!--");_.b("\n" + i);_.b("<div class=\"reportSection size\">");_.b("\n" + i);_.b("  <h4>Number of Habitats</h4>");_.b("\n" + i);_.b("  <p class=\"large\">");_.b("\n" + i);_.b("    The ");if(_.s(_.f("isMPA",c,p,1),c,p,0,7972,8029,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(" Marine Protected Area");if(_.s(_.f("isCollection",c,p,1),c,p,0,8011,8012,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,8053,8095,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketch");if(_.s(_.f("isCollection",c,p,1),c,p,0,8076,8078,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("es");});c.pop();}});c.pop();}_.b(" include");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("s");};_.b(" <strong>");_.b(_.v(_.f("num_habs",c,p,0)));_.b("</strong> of the <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> classified habitats.");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("-->");_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["uses"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("hasCoastal",c,p,1),c,p,0,310,1045,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Existing Coastal Consents <a href=\"#\" data-toggle-node=\"53d719a49380174a7766dd85\" data-visible=\"false\">");_.b("\n" + i);_.b("      show layer</a></h4>");_.b("\n" + i);_.b("        <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,524,554,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites with Resource Consents.</p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:250px;\">Consent Type</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("coastal_consents",c,p,1),c,p,0,893,978,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("hasUses",c,p,1),c,p,0,1074,4145,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hasRecUses",c,p,1),c,p,0,1092,2356,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Recreational Uses </h4>");_.b("\n" + i);_.b("      <!--");_.b("\n" + i);if(_.s(_.f("hasSmaro",c,p,1),c,p,0,1200,1688,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("        <p><strong>Spectrum of MArine Recreational Opportunity (SMARO)</strong></p>");_.b("\n" + i);_.b("          <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,1339,1349,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" includes area(s) identified as having <strong> medium or high </strong> recreational opportunity.");_.b("\n" + i);_.b("          <em>You can find more information on SMARO in the \"data description\" by right clicking on the layer name.</em>");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("        </br></br>");_.b("\n");};});c.pop();}_.b("      -->");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:250px;\">Activity Type</th>");_.b("\n" + i);_.b("              <th>Number of Sites</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasRecUses",c,p,1),c,p,0,1959,2141,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("rec_uses",c,p,1),c,p,0,1987,2115,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("COUNT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasRecUses",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td colspan=2><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("hasHeritage",c,p,1),c,p,0,2391,3346,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Archeological Information ");_.b("\n" + i);_.b("          <a href=\"#\" data-toggle-node=\"5578f14cff39059a583646c9\" data-visible=\"false\">show layer</a>");_.b("\n" + i);_.b("        </h4>");_.b("\n" + i);_.b("            <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,2650,2680,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites identified as having significant heritage values.</p>");_.b("\n" + i);_.b("            <table data-paging=\"10\">");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th style=\"width:250px;\">Heritage Type</th>");_.b("\n" + i);_.b("                  <th>Number of Sites</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("              <tbody>");_.b("\n" + i);if(_.s(_.f("heritage",c,p,1),c,p,0,3113,3251,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <tr>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("COUNT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                </tr>");_.b("\n");});c.pop();}_.b("              </tbody>");_.b("\n" + i);_.b("            </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");};});c.pop();}if(_.s(_.f("hasInfrastructure",c,p,1),c,p,0,3387,4122,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Infrastructure</h4>");_.b("\n" + i);_.b("            <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,3523,3553,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites with existing infrastructure.</p>");_.b("\n" + i);_.b("            <table data-paging=\"10\">");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th style=\"width:250px;\">Type</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("              <tbody>");_.b("\n" + i);if(_.s(_.f("infrastructure",c,p,1),c,p,0,3920,4021,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <tr>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                </tr>");_.b("\n");});c.pop();}_.b("              </tbody>");_.b("\n" + i);_.b("            </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");};});c.pop();}});c.pop();}if(!_.s(_.f("hasUses",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Activities and Uses</h4>");_.b("\n" + i);_.b("        <p>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,4281,4291,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("  does <strong>not</strong> include any <strong>activities or uses</strong>.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};_.b("\n" + i);if(_.s(_.f("hasSeabirds",c,p,1),c,p,0,4468,5194,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Birds </h4>");_.b("\n" + i);if(_.s(_.f("hasSeabirdAreas",c,p,1),c,p,0,4556,4840,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <p class=\"large\"><strong>Important Seabird Areas</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("seabirds",c,p,1),c,p,0,4703,4783,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n");});c.pop();}_.b("    ");_.b("\n" + i);if(_.s(_.f("hasSeabirdColonies",c,p,1),c,p,0,4893,5163,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p class=\"large\"><strong>Seabird Colonies</strong></p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("seabird_colonies",c,p,1),c,p,0,5033,5105,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n");});c.pop();}_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("hasMarineSpecies",c,p,1),c,p,0,5232,5694,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Marine Mammals</h4>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>Species</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("mammals",c,p,1),c,p,0,5480,5560,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}if(_.s(_.f("seals",c,p,1),c,p,0,5595,5640,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("<!--");_.b("\n" + i);if(!_.s(_.f("hasMarineSpecies",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Species Information</h4>");_.b("\n" + i);_.b("        <p>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,5853,5887,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketches within the collection do ");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch does");};_.b(" <strong>not</strong> include any <strong>important marine mammal areas</strong>.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};_.b("-->");_.b("\n" + i);if(_.s(_.f("showAdjacent",c,p,1),c,p,0,6087,7502,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Adjacent Terrestrial Information</h4>");_.b("\n" + i);_.b("        <p><em>Areas shown below are within 100m of ");if(_.s(_.f("isCollection",c,p,1),c,p,0,6248,6274,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("a sketch in the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b(" the sketch ");};_.b("</em></p>");_.b("\n" + i);_.b("        <p class=\"large\"><strong>Protected Areas</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"20\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasProtected",c,p,1),c,p,0,6489,6645,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("protected_areas",c,p,1),c,p,0,6524,6612,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasProtected",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("        <p class=\"large\"><strong>Conservation Covenants</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasCovenants",c,p,1),c,p,0,6994,7293,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("qe2_covenants",c,p,1),c,p,0,7027,7115,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}if(_.s(_.f("napalis_covenants",c,p,1),c,p,0,7170,7258,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasCovenants",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}return _.fl();;});

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = this["Templates"];
}
},{}]},{},[16])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9vdGFnby1yZXBvcnRzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvZW5hYmxlTGF5ZXJUb2dnbGVycy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvZW5hYmxlUmFzdGVyTGF5ZXJzLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvc2NyaXB0cy9qb2JJdGVtLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvc2NyaXB0cy9yZXBvcnRSZXN1bHRzLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvc2NyaXB0cy9yZXBvcnRUYWIuY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9vdGFnby1yZXBvcnRzL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9zY3JpcHRzL3V0aWxzLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcyIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9zY3JpcHRzL2Vudmlyb25tZW50LmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9zY3JpcHRzL2Zpc2hpbmcuY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9vdGFnby1yZXBvcnRzL3NjcmlwdHMvaWRzLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9zY3JpcHRzL292ZXJ2aWV3LmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9zY3JpcHRzL3JlcG9ydC5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy91c2VzLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0FDQUEsQ0FBTyxDQUFVLENBQUEsR0FBWCxDQUFOLEVBQWtCO0NBQ2hCLEtBQUEsMkVBQUE7Q0FBQSxDQUFBLENBQUE7Q0FBQSxDQUNBLENBQUEsR0FBWTtDQURaLENBRUEsQ0FBQSxHQUFNO0FBQ0MsQ0FBUCxDQUFBLENBQUEsQ0FBQTtDQUNFLEVBQUEsQ0FBQSxHQUFPLHFCQUFQO0NBQ0EsU0FBQTtJQUxGO0NBQUEsQ0FNQSxDQUFXLENBQUEsSUFBWCxhQUFXO0NBRVg7Q0FBQSxNQUFBLG9DQUFBO3dCQUFBO0NBQ0UsRUFBVyxDQUFYLEdBQVcsQ0FBWDtDQUFBLEVBQ1MsQ0FBVCxFQUFBLEVBQWlCLEtBQVI7Q0FD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ZEEsQ0FlUyxJQUFULENBQUE7Q0FmQSxDQWdCYyxJQUFkLE1BQUE7Q0FoQkEsQ0FtQlUsSUFBVixFQUFBO0NBbkJBLENBb0JrQixJQUFsQixVQUFBO0NBcEJBLENBcUJhLElBQWIsS0FBQTtDQXJCQSxDQXNCaUIsSUFBakIsU0FBQTtDQXRCQSxDQXVCb0IsSUFBcEIsWUFBQTtDQXZCQSxDQXlCUyxJQUFULENBQUE7Q0F6QkEsQ0EwQlksSUFBWixJQUFBO0NBMUJBLENBMkJXLElBQVgsR0FBQTtDQTNCQSxDQTRCTyxHQUFQLENBQUE7Q0E1QkEsQ0E2QlUsSUFBVixFQUFBO0NBN0JBLENBK0I2QixJQUE3QixxQkFBQTtDQS9CQSxDQWdDa0IsSUFBbEIsVUFBQTtDQWhDQSxDQWtDaUIsSUFBakIsU0FBQTtDQWxDQSxDQW1DYyxJQUFkLE1BQUE7Q0FuQ0EsQ0FxQ2UsSUFBZixPQUFBO0NBckNBLENBc0NpQixJQUFqQixTQUFBO0NBdENBLENBd0NtQixJQUFuQixXQUFBO0NBeENBLENBeUNxQixJQUFyQixhQUFBO0NBekNBLENBMkNjLElBQWQsTUFBQTtDQTNDQSxDQTRDYyxJQUFkLE1BQUE7Q0ExSEYsS0FBQTtDQUFBLENBNEhvQyxDQUFoQyxDQUFKLEVBQVUsQ0FBQSxDQUFTO0NBQ2xCLEdBQUEsT0FBRCxRQUFBO0NBNUlGLEVBV1E7O0NBWFI7O0NBRm9COztBQWtKdEIsQ0FoS0EsRUFnS2lCLEdBQVgsQ0FBTjs7OztBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLG51bGwsIm1vZHVsZS5leHBvcnRzID0gKGVsKSAtPlxuICAkZWwgPSAkIGVsXG4gIGFwcCA9IHdpbmRvdy5hcHBcbiAgdG9jID0gYXBwLmdldFRvYygpXG4gIHVubGVzcyB0b2NcbiAgICBjb25zb2xlLmxvZyAnTm8gdGFibGUgb2YgY29udGVudHMgZm91bmQnXG4gICAgcmV0dXJuXG4gIHRvZ2dsZXJzID0gJGVsLmZpbmQoJ2FbZGF0YS10b2dnbGUtbm9kZV0nKVxuICAjIFNldCBpbml0aWFsIHN0YXRlXG4gIGZvciB0b2dnbGVyIGluIHRvZ2dsZXJzLnRvQXJyYXkoKVxuICAgICR0b2dnbGVyID0gJCh0b2dnbGVyKVxuICAgIG5vZGVpZCA9ICR0b2dnbGVyLmRhdGEoJ3RvZ2dsZS1ub2RlJylcbiAgICB0cnlcbiAgICAgIHZpZXcgPSB0b2MuZ2V0Q2hpbGRWaWV3QnlJZCBub2RlaWRcbiAgICAgIG5vZGUgPSB2aWV3Lm1vZGVsXG4gICAgICAkdG9nZ2xlci5hdHRyICdkYXRhLXZpc2libGUnLCAhIW5vZGUuZ2V0KCd2aXNpYmxlJylcbiAgICAgICR0b2dnbGVyLmRhdGEgJ3RvY0l0ZW0nLCB2aWV3XG4gICAgY2F0Y2ggZVxuICAgICAgJHRvZ2dsZXIuYXR0ciAnZGF0YS1ub3QtZm91bmQnLCAndHJ1ZSdcblxuICB0b2dnbGVycy5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAkZWwgPSAkKGUudGFyZ2V0KVxuICAgIHZpZXcgPSAkZWwuZGF0YSgndG9jSXRlbScpXG4gICAgaWYgdmlld1xuICAgICAgdmlldy50b2dnbGVWaXNpYmlsaXR5KGUpXG4gICAgICAkZWwuYXR0ciAnZGF0YS12aXNpYmxlJywgISF2aWV3Lm1vZGVsLmdldCgndmlzaWJsZScpXG4gICAgZWxzZVxuICAgICAgYWxlcnQgXCJMYXllciBub3QgZm91bmQgaW4gdGhlIGN1cnJlbnQgVGFibGUgb2YgQ29udGVudHMuIFxcbkV4cGVjdGVkIG5vZGVpZCAjeyRlbC5kYXRhKCd0b2dnbGUtbm9kZScpfVwiXG4iLCJtb2R1bGUuZXhwb3J0cyA9IChlbCwgcmFzdGVyTGF5ZXJzTGlzdCkgLT5cbiAgJGVsID0gJCBlbFxuICBhcHAgPSB3aW5kb3cuYXBwXG5cbiAgaWYgQHJhc3RlckxheWVycz8ubGVuZ3RoID4gMFxuICAgIGZvciByYXN0ZXJMYXllciBpbiBAcmFzdGVyTGF5ZXJzXG4gICAgICB3aW5kb3cuYXBwLnByb2plY3Rob21lcGFnZS5tYXAucmVtb3ZlTGF5ZXIocmFzdGVyTGF5ZXIpXG4gICAgQHJhc3RlckxheWVycyA9IFtdXG5cbiAgdG9nZ2xlcnMgPSAkZWwuZmluZCgnYVtkYXRhLXJhc3Rlci11cmxdJylcbiAgIyBTZXQgaW5pdGlhbCBzdGF0ZVxuICBmb3IgdG9nZ2xlciBpbiB0b2dnbGVycy50b0FycmF5KClcbiAgICAkdG9nZ2xlciA9ICQodG9nZ2xlcilcbiAgICB1cmwgPSAkdG9nZ2xlci5kYXRhKCdyYXN0ZXItdXJsJylcbiAgICB3aWR0aCA9ICR0b2dnbGVyLmRhdGEoJ3dpZHRoJylcbiAgICBoZWlnaHQgPSAkdG9nZ2xlci5kYXRhKCdoZWlnaHQnKVxuICAgIGV4dGVudCA9ICR0b2dnbGVyLmRhdGEoJ2V4dGVudCcpLnNwbGl0KCcsJylcbiAgICB0b2dnbGVkID0gJHRvZ2dsZXIuZGF0YSgndG9nZ2xlZCcpXG4gICAgc2Vhc2tldGNoX2xheWVyX2lkID0gJHRvZ2dsZXIuZGF0YSgnc2Vhc2tldGNoLWxheWVyLWlkJylcbiAgICBpZiAhdXJsIG9yICF3aWR0aCBvciAhaGVpZ2h0IG9yICFleHRlbnRcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlJhc3RlciBsaW5rcyBtdXN0IGluY2x1ZGUgZGF0YS1yYXN0ZXItdXJsLCBkYXRhLXdpZHRoLCBkYXRhLWhlaWdodCwgYW5kIGRhdGEtZXh0ZW50IGF0dHJpYnV0ZXNcIilcbiAgICBsYXllciA9IG5ldyBlc3JpLmxheWVycy5NYXBJbWFnZUxheWVyKHt2aXNpYmxlOiB0b2dnbGVkfSlcbiAgICBtYXBJbWFnZSA9IG5ldyBlc3JpLmxheWVycy5NYXBJbWFnZSgnZXh0ZW50JzogeyAneG1pbic6IGV4dGVudFswXSwgJ3ltaW4nOiBleHRlbnRbMV0sICd4bWF4JzogZXh0ZW50WzJdLCAneW1heCc6IGV4dGVudFszXSwgJ3NwYXRpYWxSZWZlcmVuY2UnOiB7ICd3a2lkJzogMzg1NyB9fSxcbiAgICAnaHJlZic6IHVybClcbiAgICB0b2MgPSAkIFwiXCJcIlxuICAgICAgPGRpdiBjbGFzcz1cInRhYmxlT2ZDb250ZW50c1wiPlxuICAgICAgPGRpdiBjbGFzcz1cInRhYmxlT2ZDb250ZW50c0l0ZW1cIiBkYXRhLWRwLXN0YXR1cz1cIlwiIGRhdGEtdHlwZT1cInNrZXRjaFwiIGRhdGEtbG9hZGluZz1cImZhbHNlXCI+XG4gICAgICAgIDxkaXYgdW5zZWxlY3RhYmxlPVwib25cIiBjbGFzcz1cIml0ZW1cIiBkYXRhLXZpc2liaWxpdHk9XCIje3RvZ2dsZWR9XCIgZGF0YS1jaGVja29mZm9ubHk9XCJcIiBkYXRhLWhpZGVjaGlsZHJlbj1cIm5vXCIgZGF0YS1zZWxlY3RlZD1cImZhbHNlXCI+XG4gICAgICAgICAgPHNwYW4gdW5zZWxlY3RhYmxlPVwib25cIiBjbGFzcz1cImxvYWRpbmdcIj4mbmJzcDs8L3NwYW4+XG4gICAgICAgICAgPHNwYW4gdW5zZWxlY3RhYmxlPVwib25cIiBjbGFzcz1cImV4cGFuZGVyXCI+PC9zcGFuPlxuICAgICAgICAgIDxzcGFuIHVuc2VsZWN0YWJsZT1cIm9uXCIgY2xhc3M9XCJ2aXNpYmlsaXR5XCI+PC9zcGFuPlxuICAgICAgICAgIDxzcGFuIHVuc2VsZWN0YWJsZT1cIm9uXCIgY2xhc3M9XCJpY29uXCIgc3R5bGU9XCJcIj48L3NwYW4+XG4gICAgICAgICAgPHNwYW4gdW5zZWxlY3RhYmxlPVwib25cIiBjbGFzcz1cIm5hbWVcIj4jeyR0b2dnbGVyLnRleHQoKX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gdW5zZWxlY3RhYmxlPVwib25cIiBjbGFzcz1cImNvbnRleHRcIj48L3NwYW4+XG4gICAgICAgICAgPHNwYW4gdW5zZWxlY3RhYmxlPVwib25cIiBjbGFzcz1cImRlc2NyaXB0aW9uXCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiPjwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgXCJcIlwiXG4gICAgJHRvZ2dsZXIucmVwbGFjZVdpdGgodG9jKVxuICAgICR0b2dnbGVyID0gdG9jLmZpbmQoJy50YWJsZU9mQ29udGVudHNJdGVtJyk7XG4gICAgbGF5ZXIuYWRkSW1hZ2UobWFwSW1hZ2UpO1xuICAgIGxheWVyLnNlYXNrZXRjaF9sYXllcl9pZCA9IHNlYXNrZXRjaF9sYXllcl9pZFxuICAgIHJhc3RlckxheWVyc0xpc3QucHVzaCBsYXllclxuICAgIHdpbmRvdy5hcHAucHJvamVjdGhvbWVwYWdlLm1hcC5hZGRMYXllcihsYXllcilcbiAgICAkdG9nZ2xlci5kYXRhKCdsYXllcicsIGxheWVyKVxuICAgICR0b2dnbGVyLm9uICdjbGljaycsIChlKSA9PlxuICAgICAgaXRlbSA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy50YWJsZU9mQ29udGVudHNJdGVtJylcbiAgICAgIGxheWVyID0gaXRlbS5kYXRhKCdsYXllcicpXG4gICAgICBpdGVtLmZpbmQoJy5pdGVtJykuYXR0cignZGF0YS12aXNpYmlsaXR5JywgIWxheWVyLnZpc2libGUpXG4gICAgICBsYXllci5zZXRWaXNpYmlsaXR5KCFsYXllci52aXNpYmxlKVxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4iLCJjbGFzcyBKb2JJdGVtIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuICBjbGFzc05hbWU6ICdyZXBvcnRSZXN1bHQnXG4gIGV2ZW50czoge31cbiAgYmluZGluZ3M6XG4gICAgXCJoNiBhXCI6XG4gICAgICBvYnNlcnZlOiBcInNlcnZpY2VOYW1lXCJcbiAgICAgIHVwZGF0ZVZpZXc6IHRydWVcbiAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgIG5hbWU6ICdocmVmJ1xuICAgICAgICBvYnNlcnZlOiAnc2VydmljZVVybCdcbiAgICAgIH1dXG4gICAgXCIuc3RhcnRlZEF0XCI6XG4gICAgICBvYnNlcnZlOiBbXCJzdGFydGVkQXRcIiwgXCJzdGF0dXNcIl1cbiAgICAgIHZpc2libGU6ICgpIC0+XG4gICAgICAgIEBtb2RlbC5nZXQoJ3N0YXR1cycpIG5vdCBpbiBbJ2NvbXBsZXRlJywgJ2Vycm9yJ11cbiAgICAgIHVwZGF0ZVZpZXc6IHRydWVcbiAgICAgIG9uR2V0OiAoKSAtPlxuICAgICAgICBpZiBAbW9kZWwuZ2V0KCdzdGFydGVkQXQnKVxuICAgICAgICAgIHJldHVybiBcIlN0YXJ0ZWQgXCIgKyBtb21lbnQoQG1vZGVsLmdldCgnc3RhcnRlZEF0JykpLmZyb21Ob3coKSArIFwiLiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgXCJcIlxuICAgIFwiLnN0YXR1c1wiOiAgICAgIFxuICAgICAgb2JzZXJ2ZTogXCJzdGF0dXNcIlxuICAgICAgb25HZXQ6IChzKSAtPlxuICAgICAgICBzd2l0Y2ggc1xuICAgICAgICAgIHdoZW4gJ3BlbmRpbmcnXG4gICAgICAgICAgICBcIndhaXRpbmcgaW4gbGluZVwiXG4gICAgICAgICAgd2hlbiAncnVubmluZydcbiAgICAgICAgICAgIFwicnVubmluZyBhbmFseXRpY2FsIHNlcnZpY2VcIlxuICAgICAgICAgIHdoZW4gJ2NvbXBsZXRlJ1xuICAgICAgICAgICAgXCJjb21wbGV0ZWRcIlxuICAgICAgICAgIHdoZW4gJ2Vycm9yJ1xuICAgICAgICAgICAgXCJhbiBlcnJvciBvY2N1cnJlZFwiXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgc1xuICAgIFwiLnF1ZXVlTGVuZ3RoXCI6IFxuICAgICAgb2JzZXJ2ZTogXCJxdWV1ZUxlbmd0aFwiXG4gICAgICBvbkdldDogKHYpIC0+XG4gICAgICAgIHMgPSBcIldhaXRpbmcgYmVoaW5kICN7dn0gam9iXCJcbiAgICAgICAgaWYgdi5sZW5ndGggPiAxXG4gICAgICAgICAgcyArPSAncydcbiAgICAgICAgcmV0dXJuIHMgKyBcIi4gXCJcbiAgICAgIHZpc2libGU6ICh2KSAtPlxuICAgICAgICB2PyBhbmQgcGFyc2VJbnQodikgPiAwXG4gICAgXCIuZXJyb3JzXCI6XG4gICAgICBvYnNlcnZlOiAnZXJyb3InXG4gICAgICB1cGRhdGVWaWV3OiB0cnVlXG4gICAgICB2aXNpYmxlOiAodikgLT5cbiAgICAgICAgdj8ubGVuZ3RoID4gMlxuICAgICAgb25HZXQ6ICh2KSAtPlxuICAgICAgICBpZiB2P1xuICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHYsIG51bGwsICcgICcpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBudWxsXG5cbiAgY29uc3RydWN0b3I6IChAbW9kZWwpIC0+XG4gICAgc3VwZXIoKVxuXG4gIHJlbmRlcjogKCkgLT5cbiAgICBAJGVsLmh0bWwgXCJcIlwiXG4gICAgICA8aDY+PGEgaHJlZj1cIiNcIiB0YXJnZXQ9XCJfYmxhbmtcIj48L2E+PHNwYW4gY2xhc3M9XCJzdGF0dXNcIj48L3NwYW4+PC9oNj5cbiAgICAgIDxkaXY+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwic3RhcnRlZEF0XCI+PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cInF1ZXVlTGVuZ3RoXCI+PC9zcGFuPlxuICAgICAgICA8cHJlIGNsYXNzPVwiZXJyb3JzXCI+PC9wcmU+XG4gICAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgICBAc3RpY2tpdCgpXG5cbm1vZHVsZS5leHBvcnRzID0gSm9iSXRlbSIsImNsYXNzIFJlcG9ydFJlc3VsdHMgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cbiAgZGVmYXVsdFBvbGxpbmdJbnRlcnZhbDogMzAwMFxuXG4gIGNvbnN0cnVjdG9yOiAoQHNrZXRjaCwgQGRlcHMpIC0+XG4gICAgQHVybCA9IHVybCA9IFwiL3JlcG9ydHMvI3tAc2tldGNoLmlkfS8je0BkZXBzLmpvaW4oJywnKX1cIlxuICAgIHN1cGVyKClcblxuICBwb2xsOiAoKSA9PlxuICAgIEBmZXRjaCB7XG4gICAgICBzdWNjZXNzOiAoKSA9PlxuICAgICAgICBAdHJpZ2dlciAnam9icydcbiAgICAgICAgZm9yIHJlc3VsdCBpbiBAbW9kZWxzXG4gICAgICAgICAgaWYgcmVzdWx0LmdldCgnc3RhdHVzJykgbm90IGluIFsnY29tcGxldGUnLCAnZXJyb3InXVxuICAgICAgICAgICAgdW5sZXNzIEBpbnRlcnZhbFxuICAgICAgICAgICAgICBAaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCBAcG9sbCwgQGRlZmF1bHRQb2xsaW5nSW50ZXJ2YWxcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIGNvbnNvbGUubG9nIEBtb2RlbHNbMF0uZ2V0KCdwYXlsb2FkU2l6ZUJ5dGVzJylcbiAgICAgICAgICBwYXlsb2FkU2l6ZSA9IE1hdGgucm91bmQoKChAbW9kZWxzWzBdLmdldCgncGF5bG9hZFNpemVCeXRlcycpIG9yIDApIC8gMTAyNCkgKiAxMDApIC8gMTAwXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJGZWF0dXJlU2V0IHNlbnQgdG8gR1Agd2VpZ2hlZCBpbiBhdCAje3BheWxvYWRTaXplfWtiXCJcbiAgICAgICAgIyBhbGwgY29tcGxldGUgdGhlblxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAaW50ZXJ2YWwpIGlmIEBpbnRlcnZhbFxuICAgICAgICBpZiBwcm9ibGVtID0gXy5maW5kKEBtb2RlbHMsIChyKSAtPiByLmdldCgnZXJyb3InKT8pXG4gICAgICAgICAgQHRyaWdnZXIgJ2Vycm9yJywgXCJQcm9ibGVtIHdpdGggI3twcm9ibGVtLmdldCgnc2VydmljZU5hbWUnKX0gam9iXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEB0cmlnZ2VyICdmaW5pc2hlZCdcbiAgICAgIGVycm9yOiAoZSwgcmVzLCBhLCBiKSA9PlxuICAgICAgICB1bmxlc3MgcmVzLnN0YXR1cyBpcyAwXG4gICAgICAgICAgaWYgcmVzLnJlc3BvbnNlVGV4dD8ubGVuZ3RoXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAganNvbiA9IEpTT04ucGFyc2UocmVzLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgICMgZG8gbm90aGluZ1xuICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBpbnRlcnZhbCkgaWYgQGludGVydmFsXG4gICAgICAgICAgQHRyaWdnZXIgJ2Vycm9yJywganNvbj8uZXJyb3I/Lm1lc3NhZ2Ugb3JcbiAgICAgICAgICAgICdQcm9ibGVtIGNvbnRhY3RpbmcgdGhlIFNlYVNrZXRjaCBzZXJ2ZXInXG4gICAgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlcG9ydFJlc3VsdHNcbiIsImVuYWJsZUxheWVyVG9nZ2xlcnMgPSByZXF1aXJlICcuL2VuYWJsZUxheWVyVG9nZ2xlcnMuY29mZmVlJ1xuZW5hYmxlUmFzdGVyTGF5ZXJzID0gcmVxdWlyZSAnLi9lbmFibGVSYXN0ZXJMYXllcnMuY29mZmVlJ1xucm91bmQgPSByZXF1aXJlKCcuL3V0aWxzLmNvZmZlZScpLnJvdW5kXG5SZXBvcnRSZXN1bHRzID0gcmVxdWlyZSAnLi9yZXBvcnRSZXN1bHRzLmNvZmZlZSdcbnQgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJylcbnRlbXBsYXRlcyA9XG4gIHJlcG9ydExvYWRpbmc6IHRbJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9yZXBvcnRMb2FkaW5nJ11cbkpvYkl0ZW0gPSByZXF1aXJlICcuL2pvYkl0ZW0uY29mZmVlJ1xuQ29sbGVjdGlvblZpZXcgPSByZXF1aXJlKCd2aWV3cy9jb2xsZWN0aW9uVmlldycpXG5cbmNsYXNzIFJlY29yZFNldFxuXG4gIGNvbnN0cnVjdG9yOiAoQGRhdGEsIEB0YWIsIEBza2V0Y2hDbGFzc0lkKSAtPlxuXG4gIHRvQXJyYXk6ICgpIC0+XG4gICAgaWYgQHNrZXRjaENsYXNzSWRcbiAgICAgIGRhdGEgPSBfLmZpbmQgQGRhdGEudmFsdWUsICh2KSA9PlxuICAgICAgICB2LmZlYXR1cmVzP1swXT8uYXR0cmlidXRlcz9bJ1NDX0lEJ10gaXMgQHNrZXRjaENsYXNzSWRcbiAgICAgIHVubGVzcyBkYXRhXG4gICAgICAgIHRocm93IFwiQ291bGQgbm90IGZpbmQgZGF0YSBmb3Igc2tldGNoQ2xhc3MgI3tAc2tldGNoQ2xhc3NJZH1cIlxuICAgIGVsc2VcbiAgICAgIGlmIF8uaXNBcnJheSBAZGF0YS52YWx1ZVxuICAgICAgICBkYXRhID0gQGRhdGEudmFsdWVbMF1cbiAgICAgIGVsc2VcbiAgICAgICAgZGF0YSA9IEBkYXRhLnZhbHVlXG4gICAgXy5tYXAgZGF0YS5mZWF0dXJlcywgKGZlYXR1cmUpIC0+XG4gICAgICBmZWF0dXJlLmF0dHJpYnV0ZXNcblxuICByYXc6IChhdHRyKSAtPlxuICAgIGF0dHJzID0gXy5tYXAgQHRvQXJyYXkoKSwgKHJvdykgLT5cbiAgICAgIHJvd1thdHRyXVxuICAgIGF0dHJzID0gXy5maWx0ZXIgYXR0cnMsIChhdHRyKSAtPiBhdHRyICE9IHVuZGVmaW5lZFxuICAgIGlmIGF0dHJzLmxlbmd0aCBpcyAwXG4gICAgICBAdGFiLnJlcG9ydEVycm9yIFwiQ291bGQgbm90IGdldCBhdHRyaWJ1dGUgI3thdHRyfSBmcm9tIHJlc3VsdHNcIlxuICAgICAgdGhyb3cgXCJDb3VsZCBub3QgZ2V0IGF0dHJpYnV0ZSAje2F0dHJ9XCJcbiAgICBlbHNlIGlmIGF0dHJzLmxlbmd0aCBpcyAxXG4gICAgICByZXR1cm4gYXR0cnNbMF1cbiAgICBlbHNlXG4gICAgICByZXR1cm4gYXR0cnNcblxuICBpbnQ6IChhdHRyKSAtPlxuICAgIHJhdyA9IEByYXcoYXR0cilcbiAgICBpZiBfLmlzQXJyYXkocmF3KVxuICAgICAgXy5tYXAgcmF3LCBwYXJzZUludFxuICAgIGVsc2VcbiAgICAgIHBhcnNlSW50KHJhdylcblxuICBmbG9hdDogKGF0dHIsIGRlY2ltYWxQbGFjZXM9MikgLT5cbiAgICByYXcgPSBAcmF3KGF0dHIpXG4gICAgaWYgXy5pc0FycmF5KHJhdylcbiAgICAgIF8ubWFwIHJhdywgKHZhbCkgLT4gcm91bmQodmFsLCBkZWNpbWFsUGxhY2VzKVxuICAgIGVsc2VcbiAgICAgIHJvdW5kKHJhdywgZGVjaW1hbFBsYWNlcylcblxuICBib29sOiAoYXR0cikgLT5cbiAgICByYXcgPSBAcmF3KGF0dHIpXG4gICAgaWYgXy5pc0FycmF5KHJhdylcbiAgICAgIF8ubWFwIHJhdywgKHZhbCkgLT4gdmFsLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSBpcyAndHJ1ZSdcbiAgICBlbHNlXG4gICAgICByYXcudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpIGlzICd0cnVlJ1xuXG5jbGFzcyBSZXBvcnRUYWIgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG4gIG5hbWU6ICdJbmZvcm1hdGlvbidcbiAgZGVwZW5kZW5jaWVzOiBbXVxuXG4gIGluaXRpYWxpemU6IChAbW9kZWwsIEBvcHRpb25zKSAtPlxuICAgICMgV2lsbCBiZSBpbml0aWFsaXplZCBieSBTZWFTa2V0Y2ggd2l0aCB0aGUgZm9sbG93aW5nIGFyZ3VtZW50czpcbiAgICAjICAgKiBtb2RlbCAtIFRoZSBza2V0Y2ggYmVpbmcgcmVwb3J0ZWQgb25cbiAgICAjICAgKiBvcHRpb25zXG4gICAgIyAgICAgLSAucGFyZW50IC0gdGhlIHBhcmVudCByZXBvcnQgdmlld1xuICAgICMgICAgICAgIGNhbGwgQG9wdGlvbnMucGFyZW50LmRlc3Ryb3koKSB0byBjbG9zZSB0aGUgd2hvbGUgcmVwb3J0IHdpbmRvd1xuICAgIEBhcHAgPSB3aW5kb3cuYXBwXG4gICAgQHJhc3RlckxheWVycyA9IFtdXG4gICAgXy5leHRlbmQgQCwgQG9wdGlvbnNcbiAgICBAcmVwb3J0UmVzdWx0cyA9IG5ldyBSZXBvcnRSZXN1bHRzKEBtb2RlbCwgQGRlcGVuZGVuY2llcylcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAnZXJyb3InLCBAcmVwb3J0RXJyb3JcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAnam9icycsIEByZW5kZXJKb2JEZXRhaWxzXG4gICAgQGxpc3RlblRvT25jZSBAcmVwb3J0UmVzdWx0cywgJ2pvYnMnLCBAcmVwb3J0Sm9ic1xuICAgIEBsaXN0ZW5UbyBAcmVwb3J0UmVzdWx0cywgJ2ZpbmlzaGVkJywgXy5iaW5kIEByZW5kZXIsIEBcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAncmVxdWVzdCcsIEByZXBvcnRSZXF1ZXN0ZWRcblxuICByZW5kZXI6ICgpIC0+XG4gICAgdGhyb3cgJ3JlbmRlciBtZXRob2QgbXVzdCBiZSBvdmVyaWRkZW4nXG5cbiAgc2hvdzogKCkgLT5cbiAgICBAJGVsLnNob3coKVxuICAgIEB2aXNpYmxlID0gdHJ1ZVxuICAgIGlmIEBkZXBlbmRlbmNpZXM/Lmxlbmd0aCBhbmQgIUByZXBvcnRSZXN1bHRzLm1vZGVscy5sZW5ndGhcbiAgICAgIEByZXBvcnRSZXN1bHRzLnBvbGwoKVxuICAgIGVsc2UgaWYgIUBkZXBlbmRlbmNpZXM/Lmxlbmd0aFxuICAgICAgQHJlbmRlcigpXG4gICAgICBAJCgnW2RhdGEtYXR0cmlidXRlLXR5cGU9VXJsRmllbGRdIC52YWx1ZSwgW2RhdGEtYXR0cmlidXRlLXR5cGU9VXBsb2FkRmllbGRdIC52YWx1ZScpLmVhY2ggKCkgLT5cbiAgICAgICAgdGV4dCA9ICQoQCkudGV4dCgpXG4gICAgICAgIGh0bWwgPSBbXVxuICAgICAgICBmb3IgdXJsIGluIHRleHQuc3BsaXQoJywnKVxuICAgICAgICAgIGlmIHVybC5sZW5ndGhcbiAgICAgICAgICAgIG5hbWUgPSBfLmxhc3QodXJsLnNwbGl0KCcvJykpXG4gICAgICAgICAgICBodG1sLnB1c2ggXCJcIlwiPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPiN7bmFtZX08L2E+XCJcIlwiXG4gICAgICAgICQoQCkuaHRtbCBodG1sLmpvaW4oJywgJylcblxuXG4gIGhpZGU6ICgpIC0+XG4gICAgQCRlbC5oaWRlKClcbiAgICBAdmlzaWJsZSA9IGZhbHNlXG5cbiAgcmVtb3ZlOiAoKSA9PlxuICAgIHdpbmRvdy5jbGVhckludGVydmFsIEBldGFJbnRlcnZhbFxuICAgIEBzdG9wTGlzdGVuaW5nKClcbiAgICBmb3IgbGF5ZXIgaW4gQHJhc3RlckxheWVyc1xuICAgICAgQGFwcC5wcm9qZWN0aG9tZXBhZ2UubWFwLnJlbW92ZUxheWVyKGxheWVyKVxuICAgIHN1cGVyKClcblxuICByZXBvcnRSZXF1ZXN0ZWQ6ICgpID0+XG4gICAgQCRlbC5odG1sIHRlbXBsYXRlcy5yZXBvcnRMb2FkaW5nLnJlbmRlcih7fSlcblxuICByZXBvcnRFcnJvcjogKG1zZywgY2FuY2VsbGVkUmVxdWVzdCkgPT5cbiAgICB1bmxlc3MgY2FuY2VsbGVkUmVxdWVzdFxuICAgICAgaWYgbXNnIGlzICdKT0JfRVJST1InXG4gICAgICAgIEBzaG93RXJyb3IgJ0Vycm9yIHdpdGggc3BlY2lmaWMgam9iJ1xuICAgICAgZWxzZVxuICAgICAgICBAc2hvd0Vycm9yIG1zZ1xuXG4gIHNob3dFcnJvcjogKG1zZykgPT5cbiAgICBAJCgnLnByb2dyZXNzJykucmVtb3ZlKClcbiAgICBAJCgncC5lcnJvcicpLnJlbW92ZSgpXG4gICAgQCQoJ2g0JykudGV4dChcIkFuIEVycm9yIE9jY3VycmVkXCIpLmFmdGVyIFwiXCJcIlxuICAgICAgPHAgY2xhc3M9XCJlcnJvclwiIHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+I3ttc2d9PC9wPlxuICAgIFwiXCJcIlxuXG4gIHJlcG9ydEpvYnM6ICgpID0+XG4gICAgdW5sZXNzIEBtYXhFdGFcbiAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLndpZHRoKCcxMDAlJylcbiAgICBAJCgnaDQnKS50ZXh0IFwiQW5hbHl6aW5nIERlc2lnbnNcIlxuXG4gIHN0YXJ0RXRhQ291bnRkb3duOiAoKSA9PlxuICAgIGlmIEBtYXhFdGFcbiAgICAgIF8uZGVsYXkgKCkgPT5cbiAgICAgICAgQHJlcG9ydFJlc3VsdHMucG9sbCgpXG4gICAgICAsIChAbWF4RXRhICsgMSkgKiAxMDAwXG4gICAgICBfLmRlbGF5ICgpID0+XG4gICAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLmNzcyAndHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb24nLCAnbGluZWFyJ1xuICAgICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS5jc3MgJ3RyYW5zaXRpb24tZHVyYXRpb24nLCBcIiN7QG1heEV0YSArIDF9c1wiXG4gICAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLndpZHRoKCcxMDAlJylcbiAgICAgICwgNTAwXG5cbiAgcmVuZGVySm9iRGV0YWlsczogKCkgPT5cbiAgICBtYXhFdGEgPSBudWxsXG4gICAgZm9yIGpvYiBpbiBAcmVwb3J0UmVzdWx0cy5tb2RlbHNcbiAgICAgIGlmIGpvYi5nZXQoJ2V0YVNlY29uZHMnKVxuICAgICAgICBpZiAhbWF4RXRhIG9yIGpvYi5nZXQoJ2V0YVNlY29uZHMnKSA+IG1heEV0YVxuICAgICAgICAgIG1heEV0YSA9IGpvYi5nZXQoJ2V0YVNlY29uZHMnKVxuICAgIGlmIG1heEV0YVxuICAgICAgQG1heEV0YSA9IG1heEV0YVxuICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykud2lkdGgoJzUlJylcbiAgICAgIEBzdGFydEV0YUNvdW50ZG93bigpXG5cbiAgICBAJCgnW3JlbD1kZXRhaWxzXScpLmNzcygnZGlzcGxheScsICdibG9jaycpXG4gICAgQCQoJ1tyZWw9ZGV0YWlsc10nKS5jbGljayAoZSkgPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgQCQoJ1tyZWw9ZGV0YWlsc10nKS5oaWRlKClcbiAgICAgIEAkKCcuZGV0YWlscycpLnNob3coKVxuICAgIGZvciBqb2IgaW4gQHJlcG9ydFJlc3VsdHMubW9kZWxzXG4gICAgICBpdGVtID0gbmV3IEpvYkl0ZW0oam9iKVxuICAgICAgaXRlbS5yZW5kZXIoKVxuICAgICAgQCQoJy5kZXRhaWxzJykuYXBwZW5kIGl0ZW0uZWxcblxuICBnZXRSZXN1bHQ6IChpZCkgLT5cbiAgICByZXN1bHRzID0gQGdldFJlc3VsdHMoKVxuICAgIHJlc3VsdCA9IF8uZmluZCByZXN1bHRzLCAocikgLT4gci5wYXJhbU5hbWUgaXMgaWRcbiAgICB1bmxlc3MgcmVzdWx0P1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyByZXN1bHQgd2l0aCBpZCAnICsgaWQpXG4gICAgcmVzdWx0LnZhbHVlXG5cbiAgZ2V0Rmlyc3RSZXN1bHQ6IChwYXJhbSwgaWQpIC0+XG4gICAgcmVzdWx0ID0gQGdldFJlc3VsdChwYXJhbSlcbiAgICB0cnlcbiAgICAgIHJldHVybiByZXN1bHRbMF0uZmVhdHVyZXNbMF0uYXR0cmlidXRlc1tpZF1cbiAgICBjYXRjaCBlXG4gICAgICB0aHJvdyBcIkVycm9yIGZpbmRpbmcgI3twYXJhbX06I3tpZH0gaW4gZ3AgcmVzdWx0c1wiXG5cbiAgZ2V0UmVzdWx0czogKCkgLT5cbiAgICByZXN1bHRzID0gQHJlcG9ydFJlc3VsdHMubWFwKChyZXN1bHQpIC0+IHJlc3VsdC5nZXQoJ3Jlc3VsdCcpLnJlc3VsdHMpXG4gICAgdW5sZXNzIHJlc3VsdHM/Lmxlbmd0aFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBncCByZXN1bHRzJylcbiAgICBfLmZpbHRlciByZXN1bHRzLCAocmVzdWx0KSAtPlxuICAgICAgcmVzdWx0LnBhcmFtTmFtZSBub3QgaW4gWydSZXN1bHRDb2RlJywgJ1Jlc3VsdE1zZyddXG5cbiAgcmVjb3JkU2V0OiAoZGVwZW5kZW5jeSwgcGFyYW1OYW1lLCBza2V0Y2hDbGFzc0lkPWZhbHNlKSAtPlxuICAgIHVubGVzcyBkZXBlbmRlbmN5IGluIEBkZXBlbmRlbmNpZXNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlVua25vd24gZGVwZW5kZW5jeSAje2RlcGVuZGVuY3l9XCJcbiAgICBkZXAgPSBAcmVwb3J0UmVzdWx0cy5maW5kIChyKSAtPiByLmdldCgnc2VydmljZU5hbWUnKSBpcyBkZXBlbmRlbmN5XG4gICAgdW5sZXNzIGRlcFxuICAgICAgY29uc29sZS5sb2cgQHJlcG9ydFJlc3VsdHMubW9kZWxzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDb3VsZCBub3QgZmluZCByZXN1bHRzIGZvciAje2RlcGVuZGVuY3l9LlwiXG4gICAgcGFyYW0gPSBfLmZpbmQgZGVwLmdldCgncmVzdWx0JykucmVzdWx0cywgKHBhcmFtKSAtPlxuICAgICAgcGFyYW0ucGFyYW1OYW1lIGlzIHBhcmFtTmFtZVxuICAgIHVubGVzcyBwYXJhbVxuICAgICAgY29uc29sZS5sb2cgZGVwLmdldCgnZGF0YScpLnJlc3VsdHNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIkNvdWxkIG5vdCBmaW5kIHBhcmFtICN7cGFyYW1OYW1lfSBpbiAje2RlcGVuZGVuY3l9XCJcbiAgICBuZXcgUmVjb3JkU2V0KHBhcmFtLCBALCBza2V0Y2hDbGFzc0lkKVxuXG4gIGVuYWJsZVRhYmxlUGFnaW5nOiAoKSAtPlxuICAgIEAkKCdbZGF0YS1wYWdpbmddJykuZWFjaCAoKSAtPlxuICAgICAgJHRhYmxlID0gJChAKVxuICAgICAgcGFnZVNpemUgPSAkdGFibGUuZGF0YSgncGFnaW5nJylcbiAgICAgIHJvd3MgPSAkdGFibGUuZmluZCgndGJvZHkgdHInKS5sZW5ndGhcbiAgICAgIHBhZ2VzID0gTWF0aC5jZWlsKHJvd3MgLyBwYWdlU2l6ZSlcbiAgICAgIGlmIHBhZ2VzID4gMVxuICAgICAgICAkdGFibGUuYXBwZW5kIFwiXCJcIlxuICAgICAgICAgIDx0Zm9vdD5cbiAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgPHRkIGNvbHNwYW49XCIjeyR0YWJsZS5maW5kKCd0aGVhZCB0aCcpLmxlbmd0aH1cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGFnaW5hdGlvblwiPlxuICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj5QcmV2PC9hPjwvbGk+XG4gICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICA8L3Rmb290PlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgdWwgPSAkdGFibGUuZmluZCgndGZvb3QgdWwnKVxuICAgICAgICBmb3IgaSBpbiBfLnJhbmdlKDEsIHBhZ2VzICsgMSlcbiAgICAgICAgICB1bC5hcHBlbmQgXCJcIlwiXG4gICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj4je2l9PC9hPjwvbGk+XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHVsLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj5OZXh0PC9hPjwvbGk+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICAkdGFibGUuZmluZCgnbGkgYScpLmNsaWNrIChlKSAtPlxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICRhID0gJCh0aGlzKVxuICAgICAgICAgIHRleHQgPSAkYS50ZXh0KClcbiAgICAgICAgICBpZiB0ZXh0IGlzICdOZXh0J1xuICAgICAgICAgICAgYSA9ICRhLnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJy5hY3RpdmUnKS5uZXh0KCkuZmluZCgnYScpXG4gICAgICAgICAgICB1bmxlc3MgYS50ZXh0KCkgaXMgJ05leHQnXG4gICAgICAgICAgICAgIGEuY2xpY2soKVxuICAgICAgICAgIGVsc2UgaWYgdGV4dCBpcyAnUHJldidcbiAgICAgICAgICAgIGEgPSAkYS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuYWN0aXZlJykucHJldigpLmZpbmQoJ2EnKVxuICAgICAgICAgICAgdW5sZXNzIGEudGV4dCgpIGlzICdQcmV2J1xuICAgICAgICAgICAgICBhLmNsaWNrKClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAkYS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgICRhLnBhcmVudCgpLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICBuID0gcGFyc2VJbnQodGV4dClcbiAgICAgICAgICAgICR0YWJsZS5maW5kKCd0Ym9keSB0cicpLmhpZGUoKVxuICAgICAgICAgICAgb2Zmc2V0ID0gcGFnZVNpemUgKiAobiAtIDEpXG4gICAgICAgICAgICAkdGFibGUuZmluZChcInRib2R5IHRyXCIpLnNsaWNlKG9mZnNldCwgbipwYWdlU2l6ZSkuc2hvdygpXG4gICAgICAgICQoJHRhYmxlLmZpbmQoJ2xpIGEnKVsxXSkuY2xpY2soKVxuXG4gICAgICBpZiBub1Jvd3NNZXNzYWdlID0gJHRhYmxlLmRhdGEoJ25vLXJvd3MnKVxuICAgICAgICBpZiByb3dzIGlzIDBcbiAgICAgICAgICBwYXJlbnQgPSAkdGFibGUucGFyZW50KClcbiAgICAgICAgICAkdGFibGUucmVtb3ZlKClcbiAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2xhc3MgJ3RhYmxlQ29udGFpbmVyJ1xuICAgICAgICAgIHBhcmVudC5hcHBlbmQgXCI8cD4je25vUm93c01lc3NhZ2V9PC9wPlwiXG5cbiAgZW5hYmxlTGF5ZXJUb2dnbGVyczogKCkgLT5cbiAgICBlbmFibGVMYXllclRvZ2dsZXJzKEAkZWwpXG5cbiAgZW5hYmxlUmFzdGVyTGF5ZXJzOiAoKSA9PlxuICAgIGVuYWJsZVJhc3RlckxheWVycyhAJGVsLCBAcmFzdGVyTGF5ZXJzKVxuXG4gIGdldENoaWxkcmVuOiAoc2tldGNoQ2xhc3NJZCkgLT5cbiAgICBfLmZpbHRlciBAY2hpbGRyZW4sIChjaGlsZCkgLT4gY2hpbGQuZ2V0U2tldGNoQ2xhc3MoKS5pZCBpcyBza2V0Y2hDbGFzc0lkXG5cblxubW9kdWxlLmV4cG9ydHMgPSBSZXBvcnRUYWJcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgXG4gIHJvdW5kOiAobnVtYmVyLCBkZWNpbWFsUGxhY2VzKSAtPlxuICAgIHVubGVzcyBfLmlzTnVtYmVyIG51bWJlclxuICAgICAgbnVtYmVyID0gcGFyc2VGbG9hdChudW1iZXIpXG4gICAgbXVsdGlwbGllciA9IE1hdGgucG93IDEwLCBkZWNpbWFsUGxhY2VzXG4gICAgTWF0aC5yb3VuZChudW1iZXIgKiBtdWx0aXBsaWVyKSAvIG11bHRpcGxpZXIiLCJ0aGlzW1wiVGVtcGxhdGVzXCJdID0gdGhpc1tcIlRlbXBsYXRlc1wiXSB8fCB7fTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvYXR0cmlidXRlcy9hdHRyaWJ1dGVJdGVtXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjx0ciBkYXRhLWF0dHJpYnV0ZS1pZD1cXFwiXCIpO18uYihfLnYoXy5mKFwiaWRcIixjLHAsMCkpKTtfLmIoXCJcXFwiIGRhdGEtYXR0cmlidXRlLWV4cG9ydGlkPVxcXCJcIik7Xy5iKF8udihfLmYoXCJleHBvcnRpZFwiLGMscCwwKSkpO18uYihcIlxcXCIgZGF0YS1hdHRyaWJ1dGUtdHlwZT1cXFwiXCIpO18uYihfLnYoXy5mKFwidHlwZVwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8dGQgY2xhc3M9XFxcIm5hbWVcXFwiPlwiKTtfLmIoXy52KF8uZihcIm5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHRkIGNsYXNzPVxcXCJ2YWx1ZVxcXCI+XCIpO18uYihfLnYoXy5mKFwiZm9ybWF0dGVkVmFsdWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvdHI+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvYXR0cmlidXRlcy9hdHRyaWJ1dGVzVGFibGVcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPHRhYmxlIGNsYXNzPVxcXCJhdHRyaWJ1dGVzXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiYXR0cmlidXRlc1wiLGMscCwxKSxjLHAsMCw0NCwxMjMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKCFfLnMoXy5mKFwiZG9Ob3RFeHBvcnRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXy5ycChcImF0dHJpYnV0ZXMvYXR0cmlidXRlSXRlbVwiLGMscCxcIiAgICBcIikpO307fSk7Yy5wb3AoKTt9Xy5iKFwiPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9nZW5lcmljQXR0cmlidXRlc1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtpZihfLnMoXy5kKFwic2tldGNoQ2xhc3MuZGVsZXRlZFwiLGMscCwxKSxjLHAsMCwyNCwyNzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LXdhcm5cXFwiIHN0eWxlPVxcXCJtYXJnaW4tYm90dG9tOjEwcHg7XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFRoaXMgc2tldGNoIHdhcyBjcmVhdGVkIHVzaW5nIHRoZSBcXFwiXCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIlxcXCIgdGVtcGxhdGUsIHdoaWNoIGlzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBubyBsb25nZXIgYXZhaWxhYmxlLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byBjb3B5IHRoaXMgc2tldGNoIG9yIG1ha2UgbmV3XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBza2V0Y2hlcyBvZiB0aGlzIHR5cGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5cIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiIEF0dHJpYnV0ZXM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihfLnJwKFwiYXR0cmlidXRlcy9hdHRyaWJ1dGVzVGFibGVcIixjLHAsXCIgICAgXCIpKTtfLmIoXCIgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvcmVwb3J0TG9hZGluZ1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRMb2FkaW5nXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwhLS0gPGRpdiBjbGFzcz1cXFwic3Bpbm5lclxcXCI+MzwvZGl2PiAtLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5SZXF1ZXN0aW5nIFJlcG9ydCBmcm9tIFNlcnZlcjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJwcm9ncmVzcyBwcm9ncmVzcy1zdHJpcGVkIGFjdGl2ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcImJhclxcXCIgc3R5bGU9XFxcIndpZHRoOiAxMDAlO1xcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxhIGhyZWY9XFxcIiNcXFwiIHJlbD1cXFwiZGV0YWlsc1xcXCI+ZGV0YWlsczwvYT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwiZGV0YWlsc1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG5cbmlmKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSB0aGlzW1wiVGVtcGxhdGVzXCJdO1xufSIsIlJlcG9ydFRhYiA9IHJlcXVpcmUgJ3JlcG9ydFRhYidcbnRlbXBsYXRlcyA9IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbl9wYXJ0aWFscyA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5wYXJ0aWFscyA9IFtdXG5mb3Iga2V5LCB2YWwgb2YgX3BhcnRpYWxzXG4gIHBhcnRpYWxzW2tleS5yZXBsYWNlKCdub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvJywgJycpXSA9IHZhbFxuXG5pZHMgPSByZXF1aXJlICcuL2lkcy5jb2ZmZWUnXG5mb3Iga2V5LCB2YWx1ZSBvZiBpZHNcbiAgd2luZG93W2tleV0gPSB2YWx1ZVxuXG5cbmNsYXNzIEVudmlyb25tZW50VGFiIGV4dGVuZHMgUmVwb3J0VGFiXG4gICMgdGhpcyBpcyB0aGUgbmFtZSB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBUYWJcbiAgbmFtZTogJ0hhYml0YXRzJ1xuICBjbGFzc05hbWU6ICdlbnZpcm9ubWVudCdcbiAgdGltZW91dDogMTIwMDAwXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZXMuZW52aXJvbm1lbnRcbiAgZGVwZW5kZW5jaWVzOiBbXG4gICAgJ0hhYml0YXRzT3ZlcnZpZXcnXG4gICAgJ05ld0hhYlJlcHNUb29sYm94J1xuICBdXG5cbiAgcmVuZGVyOiAoKSAtPlxuXG4gICAgI3Nob3cgdGFibGVzIGluc3RlYWQgb2YgZ3JhcGggZm9yIElFXG4gICAgaWYgd2luZG93LmQzXG4gICAgICBkM0lzUHJlc2VudCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBkM0lzUHJlc2VudCA9IGZhbHNlXG5cbiAgICBpc0NvbGxlY3Rpb24gPSBAbW9kZWwuaXNDb2xsZWN0aW9uKClcbiAgICBzY2lkID0gQHNrZXRjaENsYXNzLmlkXG5cbiAgICBpZiBzY2lkID09IEdFTkVSSUNfSUQgb3Igc2NpZCA9PSBHRU5FUklDX0NPTExFQ1RJT05fSURcbiAgICAgIGlzR2VuZXJpYyA9IHRydWVcbiAgICBlbHNlXG4gICAgICBpc0dlbmVyaWMgPSBmYWxzZVxuXG4gICAgaXNNUEEgPSAoc2NpZCA9PSBNUEFfSUQgb3Igc2NpZCA9PSBNUEFfQ09MTEVDVElPTl9JRCBvciBzY2lkID09IE1QQV9DT05GSURfQ09MTEVDVElPTl9JRClcbiAgICBcbiAgICBoYWJfc2l6ZXMgPSBAcmVjb3JkU2V0KCdOZXdIYWJSZXBzVG9vbGJveCcsICdIYWJTaXplcycpLnRvQXJyYXkoKVxuXG4gICAgaGFic19pbl9za2V0Y2ggPSBoYWJfc2l6ZXM/Lmxlbmd0aFxuICAgIGhhYnNfcGx1cmFsID0gaGFic19pbl9za2V0Y2ggIT0gMVxuXG5cbiAgICBSRVBfTkFNRSA9IFwiUGF0Y2ggU2l6ZSAoVHlwZS0xKVwiXG4gICAgaXNDb25maWQgPSBmYWxzZVxuICAgIGhhYml0YXRzX3JlcHJlc2VudGVkID0gQHJlY29yZFNldCgnTmV3SGFiUmVwc1Rvb2xib3gnLCAnUmVwcmVzZW50ZWRIYWJzJykudG9BcnJheSgpXG4gICAgY29uc29sZS5sb2coXCJoYWJzOjo6OlwiLCBoYWJpdGF0c19yZXByZXNlbnRlZClcbiAgICBAcm91bmREYXRhIGhhYml0YXRzX3JlcHJlc2VudGVkXG4gICAgbm9SZXNlcnZlVHlwZXMgPSBAaGFzTm9SZXNlcnZlVHlwZXMgQG1vZGVsLmdldENoaWxkcmVuKClcbiAgICBcbiAgICBhbGxfaGFicyA9IEBwcm9jZXNzSGFiaXRhdHMoaGFiaXRhdHNfcmVwcmVzZW50ZWQsIG5vUmVzZXJ2ZVR5cGVzKVxuIFxuICAgIGNvYXN0YWxfaGFiX3R5cGVzID0gYWxsX2hhYnNbMF1cbiAgICBoYXNDb2FzdGFsSGFiVHlwZXMgPSBjb2FzdGFsX2hhYl90eXBlcz8ubGVuZ3RoID4gMFxuICAgIGVzdHVhcmluZV9oYWJfdHlwZXMgPSBhbGxfaGFic1sxXVxuICAgIGhhc0VzdHVhcmluZUhhYlR5cGVzID0gZXN0dWFyaW5lX2hhYl90eXBlcz8ubGVuZ3RoID4gMFxuICAgIHNpZ19oYWJzID0gYWxsX2hhYnNbMl1cbiAgICBoYXNTaWdIYWJzID0gc2lnX2hhYnM/Lmxlbmd0aCA+IDBcbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuIFxuICAgIGNvbnRleHQgPVxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcbiAgICAgIGlzR2VuZXJpYzogaXNHZW5lcmljXG4gICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuICAgICAgaXNNUEE6IGlzTVBBXG5cbiAgICAgIGNvYXN0YWxfaGFiX3R5cGVzOiBjb2FzdGFsX2hhYl90eXBlc1xuICAgICAgaGFzQ29hc3RhbEhhYlR5cGVzOiBoYXNDb2FzdGFsSGFiVHlwZXNcbiAgICAgIGVzdHVhcmluZV9oYWJfdHlwZXM6IGVzdHVhcmluZV9oYWJfdHlwZXNcbiAgICAgIGhhc0VzdHVhcmluZUhhYlR5cGVzOiBoYXNFc3R1YXJpbmVIYWJUeXBlc1xuXG4gICAgICBzaWdfaGFiczogc2lnX2hhYnNcbiAgICAgIGhhc1NpZ0hhYnM6IGhhc1NpZ0hhYnNcblxuICAgICAgaGFic19wbHVyYWw6IGhhYnNfcGx1cmFsXG4gICAgICBoYWJpdGF0c19yZXByZXNlbnRlZDogaGFiaXRhdHNfcmVwcmVzZW50ZWRcblxuICAgICAgXG4gICAgICAjb25seSBuZWVkZWQgd2hpbGUgd2UgaGF2ZSBJbmNsdWRlZC9QYXRjaCBTaXplIGJlaGF2aW5nIGRpZmZlcmVudGx5IGZvciBNUEEgKGNvbmZpZCkgYW5kIE1QQVxuICAgICAgUkVQX05BTUU6IFJFUF9OQU1FXG4gICAgICBpc0NvbmZpZDogaXNDb25maWRcblxuICAgIEAkZWwuaHRtbCBAdGVtcGxhdGUucmVuZGVyKGNvbnRleHQsIHBhcnRpYWxzKVxuICAgIEBlbmFibGVMYXllclRvZ2dsZXJzKClcbiAgICBAcm91bmREYXRhKGhhYl9zaXplcylcbiAgICBAc2V0dXBDb2FzdGFsSGFiaXRhdFNvcnRpbmcoY29hc3RhbF9oYWJfdHlwZXMsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQHNldHVwRXN0dWFyaW5lSGFiaXRhdFNvcnRpbmcoZXN0dWFyaW5lX2hhYl90eXBlcywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBAc2V0dXBTaWdIYWJpdGF0U29ydGluZyhzaWdfaGFicywgaXNNUEEsIGlzQ29sbGVjdGlvbilcblxuICAgIEBlbmFibGVUYWJsZVBhZ2luZygpXG4gICAgXG4gIHByb2Nlc3NIYWJpdGF0czogKGhhYnNfcmVwcmVzZW50ZWQsIG5vUmVzZXJ2ZXMpID0+XG4gICAgY29hc3RhbF9oYWJfdHlwZXMgPSBbXVxuICAgIGVzdHVhcmluZV9oYWJfdHlwZXMgPSBbXVxuICAgIGNyaXRpY2FsX2hhYml0YXRzID0gW11cbiAgICBmb3IgaGFiIGluIGhhYnNfcmVwcmVzZW50ZWRcbiAgICAgICNpZiB0aGVyZSBhcmUgb25seSB0eXBlIDIgYW5kIG90aGVyIHJlc2VydmVzLCBzaG93IHBhdGNoIHNpemUgYXMgTkEgaWYgaXRzIDBcbiAgICAgIGlmIG5vUmVzZXJ2ZXNcbiAgICAgICAgdHJ5XG4gICAgICAgICAgaWYgTnVtYmVyLnBhcnNlRmxvYXQoaGFiLlJFUFJFU0VOVCkgPT0gMC4wXG4gICAgICAgICAgICBoYWIuUkVQUkVTRU5UPVwiTkFcIlxuICAgICAgICBjYXRjaCBFcnJvclxuXG4gICAgICBpZiBoYWIuSEFCX1RZUEUgPT0gXCJCcnlvem9hbiByZWVmXCIgb3IgaGFiLkhBQl9UWVBFID09IFwiTWFjcm9jeXN0aXMgYmVkXCIgb3IgaGFiLkhBQl9UWVBFID09IFwiU2VhZ3Jhc3MgYmVkXCJcbiAgICAgICAgJycnXG4gICAgICAgIEp1bmUgMjAxOSBjaGFuZ2VzXG4gICAgICAgIOKAnFNlbnNpdGl2ZSBNYXJpbmUgSGFiaXRhdHPigJ0gdGFibGU6IFxuICAgICAgICAgb25seSBrZWVwIHNlYWdyYXNzIGJlZCwgQnJ5b3pvYW5zIChidXQgY2FsbCDigJxCcnlvem9hbiBUaGlja2V04oCdKSBcbiAgICAgICAgIGFuZCBNYWNyb2N5c3RpcyBiZWQgKGJ1dCBjYWxsIOKAnEdpYW50IEtlbHAgRm9yZXN04oCdKTsgXG4gICAgICAgICcnJ1xuICAgICAgICBpZiBoYWIuSEFCX1RZUEUgPT0gXCJCcnlvem9hbiByZWVmXCJcbiAgICAgICAgICBoYWIuSEFCX1RZUEUgPSBcIkJyeW96b2FuIFRoaWNrZXRcIlxuICAgICAgICBpZiAgaGFiLkhBQl9UWVBFID09IFwiTWFjcm9jeXN0aXMgYmVkXCJcbiAgICAgICAgICBoYWIuSEFCX1RZUEUgPSBcIkdpYW50IEtlbHAgRm9yZXN0XCJcbiAgICAgICAgaWYgaGFiLkhBQl9UWVBFID09IFwiU2VhZ3Jhc3MgYmVkXCJcbiAgICAgICAgICBoYWIuSEFCX1RZUEUgPSAgXCJTZWFncmFzcyBCZWRcIlxuICAgICAgICBjcml0aWNhbF9oYWJpdGF0cy5wdXNoKGhhYilcbiAgICAgIGVsc2VcblxuICAgICAgICBpZiBoYWIuSEFCX1RZUEUuaW5kZXhPZihcIkVzdHVhcmluZVwiKSA9PSAwIG9yIGhhYi5IQUJfVFlQRSA9PSBcIk11ZCBGbGF0XCJcbiAgICAgICAgICBlc3R1YXJpbmVfaGFiX3R5cGVzLnB1c2goaGFiKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgI3NraXBwaW5nIHRoaXMgb25lIGJlY2F1c2UgaXRzIHNvIHNtYWxsXG4gICAgICAgICAgaWYgaGFiLkhBQl9UWVBFICE9IFwiRGVlcCBXYXRlciBHcmF2ZWxcIlxuICAgICAgICAgICAgY29hc3RhbF9oYWJfdHlwZXMucHVzaChoYWIpXG5cbiAgIFxuICAgICcnJ1xuICAgICAjSnVuZSAyMDE5IC0gcmVtb3ZlZFxuICAgIG5hX2hhYnMgPSBbXCJCcmFjaGlvcG9kIGJlZHNcIiwgXCJDYWxjYXJlb3VzIHR1YmUgd29ybSB0aGlja2V0c1wiLCBcIkNoYWV0b3B0ZXJpZGFlIHdvcm0gZmllbGRzXCIsXG4gICAgICAgICAgICAgICBcIlJob2RvbGl0aCBiZWRzXCIsIFwiU2VhIHBlbiBmaWVsZHNcIiwgXCJTcG9uZ2UgZ2FyZGVuc1wiLCBcIlN0b255IGNvcmFsIHRoaWNrZXRzXCJdXG4gICAgZm9yIG5oIGluIG5hX2hhYnNcbiAgICAgIG5ld19oYWIgPSB7XCJIQUJfVFlQRVwiOiBuaCwgXCJTSVpFX1NRS01cIjpcIk5BXCIsIFwiUEVSQ1wiOlwiTkFcIiwgXCJSRVBSRVNFTlRcIjpcIk5BXCIsIFwiUkVQTElDXCI6XCJOQVwiLCBcIkNPTk5cIjpcIk5BXCJ9XG4gICAgICBjcml0aWNhbF9oYWJpdGF0cy5wdXNoKG5ld19oYWIpXG4gICAgJycnXG4gICAgcmV0dXJuIFtjb2FzdGFsX2hhYl90eXBlcywgZXN0dWFyaW5lX2hhYl90eXBlcywgY3JpdGljYWxfaGFiaXRhdHNdXG5cbiAgcm91bmREYXRhOiAoaGFiaXRhdHMpID0+ICBcbiAgICBmb3IgaGFiIGluIGhhYml0YXRzXG4gICAgICBoYWIuU0laRV9TUUtNID0gTnVtYmVyKGhhYi5TSVpFX1NRS00pLnRvRml4ZWQoMSlcbiAgICAgIGhhYi5QRVJDID0gTnVtYmVyKGhhYi5QRVJDKS50b0ZpeGVkKDEpXG5cbiAgc2V0dXBTaWdIYWJpdGF0U29ydGluZzogKGhhYml0YXRzLCBpc01QQSwgaXNDb2xsZWN0aW9uKSA9PlxuICAgIHRib2R5TmFtZSA9ICcuc2lnX2hhYl92YWx1ZXMnXG4gICAgdGFibGVOYW1lID0gJy5zaWdfaGFiX3RhYmxlJ1xuICAgIEAkKCcuc2lnX2hhYl90eXBlJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ3NpZ19oYWJfdHlwZScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIkhBQl9UWVBFXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuc2lnX2hhYl9uZXdfYXJlYScpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdzaWdfaGFiX25ld19hcmVhJywgdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiU0laRV9TUUtNXCIsIHRib2R5TmFtZSwgdHJ1ZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQCQoJy5zaWdfaGFiX25ld19wZXJjJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ3NpZ19oYWJfbmV3X3BlcmMnLHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlBFUkNcIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBcbiAgICBAJCgnLnNpZ19oYWJfcmVwcmVzZW50JykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ3NpZ19oYWJfcmVwcmVzZW50Jyx0YWJsZU5hbWUsIGhhYml0YXRzLCBldmVudCwgXCJSRVBSRVNFTlRcIiwgdGJvZHlOYW1lLCBmYWxzZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQCQoJy5zaWdfaGFiX3JlcGxpY2F0ZScpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdzaWdfaGFiX3JlcGxpY2F0ZScsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiUkVQTElDXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuc2lnX2hhYl9jb25uZWN0ZWQnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnc2lnX2hhYl9jb25uZWN0ZWQnLHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIkNPTk5cIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBcbiAgICBAcmVuZGVyU29ydCgnc2lnX2hhYl9uZXdfYXJlYScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIHVuZGVmaW5lZCwgXCJTSVpFX1NRS01cIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcblxuICBzZXR1cENvYXN0YWxIYWJpdGF0U29ydGluZzogKGhhYml0YXRzLCBpc01QQSwgaXNDb2xsZWN0aW9uKSA9PlxuICAgIHRib2R5TmFtZSA9ICcuY29hc3RhbF9oYWJfdmFsdWVzJ1xuICAgIHRhYmxlTmFtZSA9ICcuY29hc3RhbF9oYWJfdGFibGUnXG4gICAgQCQoJy5jb2FzdGFsX2hhYl90eXBlJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2NvYXN0YWxfaGFiX3R5cGUnLCB0YWJsZU5hbWUsIGhhYml0YXRzLCBldmVudCwgXCJIQUJfVFlQRVwiLCB0Ym9keU5hbWUsIGZhbHNlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBAJCgnLmNvYXN0YWxfaGFiX25ld19hcmVhJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2NvYXN0YWxfaGFiX25ld19hcmVhJywgdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiU0laRV9TUUtNXCIsIHRib2R5TmFtZSwgdHJ1ZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQCQoJy5jb2FzdGFsX2hhYl9uZXdfcGVyYycpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdjb2FzdGFsX2hhYl9uZXdfcGVyYycsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiUEVSQ1wiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIFxuICAgIEAkKCcuY29hc3RhbF9oYWJfcmVwcmVzZW50JykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2NvYXN0YWxfaGFiX3JlcHJlc2VudCcsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiUkVQUkVTRU5UXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuY29hc3RhbF9oYWJfcmVwbGljYXRlJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2NvYXN0YWxfaGFiX3JlcGxpY2F0ZScsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiUkVQTElDXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuY29hc3RhbF9oYWJfY29ubmVjdGVkJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2NvYXN0YWxfaGFiX2Nvbm5lY3RlZCcsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiQ09OTlwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEByZW5kZXJTb3J0KCdjb2FzdGFsX2hhYl9uZXdfYXJlYScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIHVuZGVmaW5lZCwgXCJTSVpFX1NRS01cIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcblxuICBzZXR1cEVzdHVhcmluZUhhYml0YXRTb3J0aW5nOiAoaGFiaXRhdHMsIGlzTVBBLCBpc0NvbGxlY3Rpb24pID0+XG4gICAgdGJvZHlOYW1lID0gJy5lc3R1YXJpbmVfaGFiX3ZhbHVlcydcbiAgICB0YWJsZU5hbWUgPSAnLmVzdHVhcmluZV9oYWJfdGFibGUnXG4gICAgQCQoJy5lc3R1YXJpbmVfaGFiX3R5cGUnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnZXN0dWFyaW5lX2hhYl90eXBlJywgdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiSEFCX1RZUEVcIiwgdGJvZHlOYW1lLCBmYWxzZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQCQoJy5lc3R1YXJpbmVfaGFiX25ld19hcmVhJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2VzdHVhcmluZV9oYWJfbmV3X2FyZWEnLCB0YWJsZU5hbWUsIGhhYml0YXRzLCBldmVudCwgXCJTSVpFX1NRS01cIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBAJCgnLmVzdHVhcmluZV9oYWJfbmV3X3BlcmMnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnZXN0dWFyaW5lX2hhYl9uZXdfcGVyYycsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiUEVSQ1wiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIFxuICAgIEAkKCcuZXN0dWFyaW5lX2hhYl9yZXByZXNlbnQnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnZXN0dWFyaW5lX2hhYl9yZXByZXNlbnQnLHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlJFUFJFU0VOVFwiLCB0Ym9keU5hbWUsIGZhbHNlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBAJCgnLmVzdHVhcmluZV9oYWJfcmVwbGljYXRlJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2VzdHVhcmluZV9oYWJfcmVwbGljYXRlJyx0YWJsZU5hbWUsIGhhYml0YXRzLCBldmVudCwgXCJSRVBMSUNcIiwgdGJvZHlOYW1lLCBmYWxzZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQCQoJy5lc3R1YXJpbmVfaGFiX2Nvbm5lY3RlZCcpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdlc3R1YXJpbmVfaGFiX2Nvbm5lY3RlZCcsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiQ09OTlwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEByZW5kZXJTb3J0KCdlc3R1YXJpbmVoYWJfbmV3X2FyZWEnLCB0YWJsZU5hbWUsIGhhYml0YXRzLCB1bmRlZmluZWQsIFwiU0laRV9TUUtNXCIsIHRib2R5TmFtZSwgdHJ1ZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG5cblxuXG4gICNkbyB0aGUgc29ydGluZyAtIHNob3VsZCBiZSB0YWJsZSBpbmRlcGVuZGVudFxuICAjc2tpcCBhbnkgdGhhdCBhcmUgbGVzcyB0aGFuIDAuMDBcbiAgcmVuZGVyU29ydDogKG5hbWUsIHRhYmxlTmFtZSwgcGRhdGEsIGV2ZW50LCBzb3J0QnksIHRib2R5TmFtZSwgaXNGbG9hdCwgZ2V0Um93U3RyaW5nVmFsdWUsIGlzTVBBLCBpc0NvbGxlY3Rpb24pID0+XG4gICAgaWYgZXZlbnRcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuXG4gICAgaWYgd2luZG93LmQzXG4gICAgICB0YXJnZXRDb2x1bW4gPSBAZ2V0U2VsZWN0ZWRDb2x1bW4oZXZlbnQsIG5hbWUpXG4gICAgICBzb3J0VXAgPSBAZ2V0U29ydERpcih0YXJnZXRDb2x1bW4pXG5cbiAgICAgIGlmIGlzRmxvYXRcbiAgICAgICAgZGF0YSA9IF8uc29ydEJ5IHBkYXRhLCAocm93KSAtPiBcbiAgICAgICAgICAgIGlmIGlzTmFOKHJvd1tzb3J0QnldKVxuICAgICAgICAgICAgICB2YWwgPSAtMS4wXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHZhbCA9IHBhcnNlRmxvYXQocm93W3NvcnRCeV0pXG4gICAgICAgICAgICByZXR1cm4gdmFsXG4gICAgICBlbHNlXG4gICAgICAgIGRhdGEgPSBfLnNvcnRCeSBwZGF0YSwgKHJvdykgLT4gcm93W3NvcnRCeV1cblxuICAgICAgI2ZsaXAgc29ydGluZyBpZiBuZWVkZWRcbiAgICAgIGlmIHNvcnRVcFxuICAgICAgICBkYXRhLnJldmVyc2UoKVxuXG4gICAgICBlbCA9IEAkKHRib2R5TmFtZSlbMF1cbiAgICAgIGhhYl9ib2R5ID0gZDMuc2VsZWN0KGVsKVxuXG4gICAgICAjcmVtb3ZlIG9sZCByb3dzXG4gICAgICBoYWJfYm9keS5zZWxlY3RBbGwoXCJ0ci5oYWJfcm93c1wiKVxuICAgICAgICAucmVtb3ZlKClcblxuICAgICAgI2FkZCBuZXcgcm93cyAoYW5kIGRhdGEpXG4gICAgICByb3dzID0gaGFiX2JvZHkuc2VsZWN0QWxsKFwidHJcIilcbiAgICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgICAuZW50ZXIoKS5pbnNlcnQoXCJ0clwiLCBcIjpmaXJzdC1jaGlsZFwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiaGFiX3Jvd3NcIilcblxuICAgICAgaWYgaXNNUEFcbiAgICAgICAgI0p1bmUgMjAxOXJlbW92ZWQgIFwiUkVQUkVTRU5UXCIgZnJvbSAzcmQgcG9zaXRpb25cbiAgICAgICAgaWYgaXNDb2xsZWN0aW9uXG4gICAgICAgICAgY29sdW1ucyA9IFtcIkhBQl9UWVBFXCIsIFwiU0laRV9TUUtNXCIsIFwiUEVSQ1wiLCBcIlJFUExJQ1wiLCBcIkNPTk5cIl1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNvbHVtbnMgPSBbXCJIQUJfVFlQRVwiLCBcIlNJWkVfU1FLTVwiLCBcIlBFUkNcIl1cbiAgICAgIGVsc2VcbiAgICAgICAgY29sdW1ucyA9IFtcIkhBQl9UWVBFXCIsIFwiU0laRV9TUUtNXCIsIFwiUEVSQ1wiXVxuXG4gICAgICBjZWxscyA9IHJvd3Muc2VsZWN0QWxsKFwidGRcIilcbiAgICAgICAgICAuZGF0YSgocm93LCBpKSAtPmNvbHVtbnMubWFwIChjb2x1bW4pIC0+IChjb2x1bW46IGNvbHVtbiwgdmFsdWU6IHJvd1tjb2x1bW5dKSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZChcInRkXCIpLnRleHQoKGQsIGkpIC0+IFxuICAgICAgICAgIGQudmFsdWVcbiAgICAgICAgKSAgICBcblxuICAgICAgQHNldE5ld1NvcnREaXIodGFyZ2V0Q29sdW1uLCBzb3J0VXApXG4gICAgICBAc2V0U29ydGluZ0NvbG9yKGV2ZW50LCB0YWJsZU5hbWUpXG5cbiAgICAgICNmaXJlIHRoZSBldmVudCBmb3IgdGhlIGFjdGl2ZSBwYWdlIGlmIHBhZ2luYXRpb24gaXMgcHJlc2VudFxuICAgICAgQGZpcmVQYWdpbmF0aW9uKHRhYmxlTmFtZSlcbiAgICAgIGlmIGV2ZW50XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgZ2V0RmxvYXQ6ICh2YWwpID0+XG4gICAgdHJ5XG4gICAgICByZXR1cm4gcGFyc2VGbG9hdCh2YWwpXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIHJldHVybiAwLjBcblxuICAjdGFibGUgcm93IGZvciBoYWJpdGF0IHJlcHJlc2VudGF0aW9uXG4gIGdldEhhYml0YXRSb3dTdHJpbmc6IChkLCBpc01QQSwgaXNDb2xsZWN0aW9uKSA9PlxuICAgIGlmIGQgaXMgdW5kZWZpbmVkXG4gICAgICByZXR1cm4gXCJcIlxuICAgIHJlcHJlc2VudGVkX3N0ciA9IFwiXCJcbiAgICByZXBsaWNhdGVkX3N0ciA9IFwiXCJcbiAgICBjb25uZWN0ZWRfc3RyID0gXCJcIlxuICAgIGlmIGlzTVBBXG4gICAgICBcbiAgICAgIHJlcHJlc2VudGVkX3N0ciA9ICcnXG4gICAgICBpZiBpc0NvbGxlY3Rpb25cbiAgICAgICAgcmVwbGljYXRlZF9zdHIgPSBcIjx0ZD5cIitkLlJFUExJQytcIjwvdGQ+XCJcbiAgICAgICAgY29ubmVjdGVkX3N0ciA9IFwiPHRkPlwiK2QuQ09OTitcIjwvdGQ+XCJcbiAgICAgICAgcmVwcmVzZW50ZWRfc3RyID0gXCI8dGRcIj4rZC5SRVBSRVNFTlQrXCI8L3RkPlwiXG5cbiAgICByZXR1cm4gXCI8dGQ+XCIrZC5IQUJfVFlQRStcIjwvdGQ+XCIrXCI8dGQ+XCIrZC5TSVpFX1NRS00rXCI8L3RkPlwiK1wiPHRkPlwiK2QuUEVSQytcIjwvdGQ+XCIrcmVwcmVzZW50ZWRfc3RyK3JlcGxpY2F0ZWRfc3RyXG5cbiAgc2V0U29ydGluZ0NvbG9yOiAoZXZlbnQsIHRhYmxlTmFtZSkgPT5cbiAgICBzb3J0aW5nQ2xhc3MgPSBcInNvcnRpbmdfY29sXCJcbiAgICBpZiBldmVudFxuICAgICAgcGFyZW50ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoKVxuICAgICAgbmV3VGFyZ2V0TmFtZSA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuY2xhc3NOYW1lXG4gICAgICB0YXJnZXRTdHIgPSB0YWJsZU5hbWUrXCIgdGguc29ydGluZ19jb2wgYVwiICAgXG4gICAgICBpZiBAJCh0YXJnZXRTdHIpIGFuZCBAJCh0YXJnZXRTdHIpWzBdXG4gICAgICAgIG9sZFRhcmdldE5hbWUgPSBAJCh0YXJnZXRTdHIpWzBdLmNsYXNzTmFtZVxuICAgICAgICBpZiBuZXdUYXJnZXROYW1lICE9IG9sZFRhcmdldE5hbWVcbiAgICAgICAgICAjcmVtb3ZlIGl0IGZyb20gb2xkIFxuICAgICAgICAgIGhlYWRlck5hbWUgPSB0YWJsZU5hbWUrXCIgdGguc29ydGluZ19jb2xcIlxuICAgICAgICAgIEAkKGhlYWRlck5hbWUpLnJlbW92ZUNsYXNzKHNvcnRpbmdDbGFzcylcbiAgICAgICAgICAjYW5kIGFkZCBpdCB0byBuZXdcbiAgICAgICAgICBwYXJlbnQuYWRkQ2xhc3Moc29ydGluZ0NsYXNzKVxuICAgICBcbiAgZ2V0U29ydERpcjogKHRhcmdldENvbHVtbikgPT5cbiAgICAgc29ydHVwID0gQCQoJy4nK3RhcmdldENvbHVtbikuaGFzQ2xhc3MoXCJzb3J0X3VwXCIpXG4gICAgIHJldHVybiBzb3J0dXBcblxuICBnZXRTZWxlY3RlZENvbHVtbjogKGV2ZW50LCBuYW1lKSA9PlxuICAgIGlmIGV2ZW50XG4gICAgICAjZ2V0IHNvcnQgb3JkZXJcbiAgICAgIHRhcmdldENvbHVtbiA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuY2xhc3NOYW1lXG5cbiAgICAgIG11bHRpQ2xhc3NlcyA9IHRhcmdldENvbHVtbi5zcGxpdCgnICcpXG4gICAgICAjcHJvdGVjdGVkTWFtbWFscyA9IF8uc29ydEJ5IHByb3RlY3RlZE1hbW1hbHMsIChyb3cpIC0+IHBhcnNlSW50KHJvdy5Db3VudClcbiAgICAgIGhhYkNsYXNzTmFtZSA9Xy5maW5kIG11bHRpQ2xhc3NlcywgKGNsYXNzbmFtZSkgLT4gXG4gICAgICAgIGNsYXNzbmFtZS5sYXN0SW5kZXhPZignY29hc3RhbF9oYWInLDApID09IDAgb3IgY2xhc3NuYW1lLmxhc3RJbmRleE9mKCdlc3R1YXJpbmVfaGFiJywwKSA9PSAwXG4gICAgICBcbiAgICAgIGlmIGhhYkNsYXNzTmFtZSBpcyB1bmRlZmluZWRcbiAgICAgICAgaGFiQ2xhc3NOYW1lID1fLmZpbmQgbXVsdGlDbGFzc2VzLCAoY2xhc3NuYW1lKSAtPiBcbiAgICAgICAgICBjbGFzc25hbWUubGFzdEluZGV4T2YoJ3NpZycsMCkgPT0gMCBcblxuICAgICAgdGFyZ2V0Q29sdW1uID0gaGFiQ2xhc3NOYW1lXG4gICAgZWxzZVxuICAgICAgI3doZW4gdGhlcmUgaXMgbm8gZXZlbnQsIGZpcnN0IHRpbWUgdGFibGUgaXMgZmlsbGVkXG4gICAgICB0YXJnZXRDb2x1bW4gPSBuYW1lXG5cbiAgICByZXR1cm4gdGFyZ2V0Q29sdW1uXG5cbiAgaGFzTm9SZXNlcnZlVHlwZXM6IChyZXNlcnZlcykgPT5cbiAgICB0cnlcbiAgICAgIHQyX3N0ciA9IFwiVHlwZTJcIlxuICAgICAgbXJfc3RyID0gXCJNUlwiXG4gICAgICBvdGhlcl9zdHIgPSBcIk90aGVyXCJcbiAgICAgIG51bXJlc2VydmVzID0gMFxuXG4gICAgICBmb3IgcmVzIGluIHJlc2VydmVzXG4gICAgICAgIGF0dHJzID0gcmVzLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgICBmb3IgYXR0IGluIGF0dHJzXG4gICAgICAgICAgaWYgYXR0LmV4cG9ydGlkID09IFwiTUFOQUdFTUVOVFwiIFxuICAgICAgICAgICAgcmVzX3R5cGUgPSBhdHQudmFsdWVcbiAgICAgICAgICAgIGlmIHJlc190eXBlID09IG1yX3N0ciBvciByZXNfdHlwZS5pbmRleE9mKG1yX3N0cikgPj0wXG4gICAgICAgICAgICAgICAgbnVtcmVzZXJ2ZXMrPTFcblxuICAgICAgcmV0dXJuIChudW1yZXNlcnZlcyA9PSAwKVxuXG4gICAgY2F0Y2ggRXJyb3JcbiAgICAgIGNvbnNvbGUubG9nKFwic29tZXRoaW5nIHdlbnQgd3JvbmcgbG9va2luZyBmb3IgcmVzZXJ2ZSBhdHRyaWJ1dGUuLi5cIilcbiAgICAgIHJldHVybiBmYWxzZSAgICBcblxuICBzZXROZXdTb3J0RGlyOiAodGFyZ2V0Q29sdW1uLCBzb3J0VXApID0+XG4gICAgI2FuZCBzd2l0Y2ggaXRcbiAgICBpZiBzb3J0VXBcbiAgICAgIEAkKCcuJyt0YXJnZXRDb2x1bW4pLnJlbW92ZUNsYXNzKCdzb3J0X3VwJylcbiAgICAgIEAkKCcuJyt0YXJnZXRDb2x1bW4pLmFkZENsYXNzKCdzb3J0X2Rvd24nKVxuICAgIGVsc2VcbiAgICAgIEAkKCcuJyt0YXJnZXRDb2x1bW4pLmFkZENsYXNzKCdzb3J0X3VwJylcbiAgICAgIEAkKCcuJyt0YXJnZXRDb2x1bW4pLnJlbW92ZUNsYXNzKCdzb3J0X2Rvd24nKVxuXG4gIGZpcmVQYWdpbmF0aW9uOiAodGFibGVOYW1lKSA9PlxuICAgIGVsID0gQCQodGFibGVOYW1lKVswXVxuICAgIGhhYl90YWJsZSA9IGQzLnNlbGVjdChlbClcbiAgICBhY3RpdmVfcGFnZSA9IGhhYl90YWJsZS5zZWxlY3RBbGwoXCIuYWN0aXZlIGFcIilcbiAgICBpZiBhY3RpdmVfcGFnZSBhbmQgYWN0aXZlX3BhZ2VbMF0gYW5kIGFjdGl2ZV9wYWdlWzBdWzBdXG4gICAgICBhY3RpdmVfcGFnZVswXVswXS5jbGljaygpXG5cbm1vZHVsZS5leHBvcnRzID0gRW52aXJvbm1lbnRUYWIiLCJSZXBvcnRUYWIgPSByZXF1aXJlICdyZXBvcnRUYWInXG50ZW1wbGF0ZXMgPSByZXF1aXJlICcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5fcGFydGlhbHMgPSByZXF1aXJlICcuLi9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxucGFydGlhbHMgPSBbXVxuZm9yIGtleSwgdmFsIG9mIF9wYXJ0aWFsc1xuICBwYXJ0aWFsc1trZXkucmVwbGFjZSgnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpLycsICcnKV0gPSB2YWxcblxuaWRzID0gcmVxdWlyZSAnLi9pZHMuY29mZmVlJ1xuZm9yIGtleSwgdmFsdWUgb2YgaWRzXG4gIHdpbmRvd1trZXldID0gdmFsdWVcblxuXG5jbGFzcyBGaXNoaW5nVGFiIGV4dGVuZHMgUmVwb3J0VGFiXG4gICMgdGhpcyBpcyB0aGUgbmFtZSB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBUYWJcbiAgbmFtZTogJ0Zpc2hpbmcnXG4gIGNsYXNzTmFtZTogJ2Zpc2hpbmcnXG4gIHRpbWVvdXQ6IDEyMDAwMFxuICB0ZW1wbGF0ZTogdGVtcGxhdGVzLmZpc2hpbmdcbiAgZGVwZW5kZW5jaWVzOiBbXG4gICAgJ0Zpc2hpbmdBcmVhcycsICdGaXNoZXJ5SW50ZW5zaXR5J1xuICBdXG5cbiAgcmVuZGVyOiAoKSAtPlxuXG4gICAgI3Nob3cgdGFibGVzIGluc3RlYWQgb2YgZ3JhcGggZm9yIElFXG4gICAgaWYgd2luZG93LmQzXG4gICAgICBkM0lzUHJlc2VudCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBkM0lzUHJlc2VudCA9IGZhbHNlXG5cbiAgICBpc0NvbGxlY3Rpb24gPSBAbW9kZWwuaXNDb2xsZWN0aW9uKClcbiAgICBzY2lkID0gQHNrZXRjaENsYXNzLmlkXG4gICBcbiAgICBpZiAoc2NpZCA9PSBNUEFfSUQgb3Igc2NpZCA9PSBNUEFfQ09MTEVDVElPTl9JRCBvciBzY2lkID09IE1QQV9DT05GSURfQ09MTEVDVElPTl9JRClcbiAgICAgIGlzTVBBID0gdHJ1ZVxuICAgICAgaXNDb25maWRlbnRpYWxNUEFOZXR3b3JrID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGlzTVBBID0gZmFsc2VcbiAgICAgIGlzQ29uZmlkZW50aWFsTVBBTmV0d29yayA9IGZhbHNlXG5cbiAgICBcbiAgICBpZiBpc01QQVxuICAgICAgZmlzaGVyeV9pbnRlbnNpdHkgPSBAcmVjb3JkU2V0KCdGaXNoZXJ5SW50ZW5zaXR5JywgJ0Zpc2hlcnlJbnRlbnNpdHknKS50b0FycmF5KClcblxuXG4gICAgZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmcgPSBAcmVjb3JkU2V0KCdGaXNoaW5nQXJlYXMnLCAnRXhpc3RpbmdDdXN0b21hcnlBcmVhJykudG9BcnJheSgpXG4gICAgaGFzRXhpc3RpbmdDdXN0b21hcnkgPSBleGlzdGluZ19jdXN0b21hcnlfZmlzaGluZz8ubGVuZ3RoID4gMFxuICAgIHByb3Bvc2VkX2N1c3RvbWFyeV9maXNoaW5nID0gQHJlY29yZFNldCgnRmlzaGluZ0FyZWFzJywgJ1Byb3Bvc2VkQ3VzdG9tYXJ5QXJlYScpLnRvQXJyYXkoKVxuICAgIGhhc1Byb3Bvc2VkQ3VzdG9tYXJ5ID0gcHJvcG9zZWRfY3VzdG9tYXJ5X2Zpc2hpbmc/Lmxlbmd0aCA+IDBcblxuICAgIGhhc0N1c3RvbWFyeSA9IGhhc0V4aXN0aW5nQ3VzdG9tYXJ5IG9yIGhhc1Byb3Bvc2VkQ3VzdG9tYXJ5XG5cbiAgICBleGlzdGluZ19maXNoaW5nX2FyZWFzID0gQHJlY29yZFNldCgnRmlzaGluZ0FyZWFzJywgJ0Zpc2hpbmdFeGlzdGluZ0FyZWEnKS50b0FycmF5KClcbiAgICBoYXNFeGlzdGluZ0Zpc2hpbmcgPSBleGlzdGluZ19maXNoaW5nX2FyZWFzPy5sZW5ndGggPiAwXG4gICAgaGFzQW55RmlzaGluZyA9IGhhc0V4aXN0aW5nRmlzaGluZyBvciBoYXNDdXN0b21hcnlcbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgIFxuICAgIGlmIGlzTVBBXG4gICAgICBjb250ZXh0ID1cbiAgICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgICBza2V0Y2hDbGFzczogQHNrZXRjaENsYXNzLmZvclRlbXBsYXRlKClcbiAgICAgICAgYXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgICAgYWRtaW46IEBwcm9qZWN0LmlzQWRtaW4gd2luZG93LnVzZXJcbiAgICAgICAgZDNJc1ByZXNlbnQ6IGQzSXNQcmVzZW50XG4gICAgICAgIGlzQ29sbGVjdGlvbjogaXNDb2xsZWN0aW9uXG4gICAgICAgIGlzTVBBOiBpc01QQVxuICAgICAgICBleGlzdGluZ19jdXN0b21hcnlfZmlzaGluZzogZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmdcbiAgICAgICAgaGFzRXhpc3RpbmdDdXN0b21hcnk6IGhhc0V4aXN0aW5nQ3VzdG9tYXJ5XG4gICAgICAgIHByb3Bvc2VkX2N1c3RvbWFyeV9maXNoaW5nOiBwcm9wb3NlZF9jdXN0b21hcnlfZmlzaGluZ1xuICAgICAgICBoYXNQcm9wb3NlZEN1c3RvbWFyeTogaGFzUHJvcG9zZWRDdXN0b21hcnlcbiAgICAgICAgZXhpc3RpbmdfZmlzaGluZ19hcmVhczogZXhpc3RpbmdfZmlzaGluZ19hcmVhc1xuICAgICAgICBoYXNFeGlzdGluZ0Zpc2hpbmc6IGhhc0V4aXN0aW5nRmlzaGluZ1xuICAgICAgICBoYXNBbnlGaXNoaW5nOiBoYXNBbnlGaXNoaW5nXG4gICAgICAgIGhhc0N1c3RvbWFyeTogaGFzQ3VzdG9tYXJ5XG4gICAgICAgIGZpc2hlcnlfaW50ZW5zaXR5OiBmaXNoZXJ5X2ludGVuc2l0eVxuICAgICAgICBpc0NvbmZpZGVudGlhbE1QQU5ldHdvcms6IGlzQ29uZmlkZW50aWFsTVBBTmV0d29ya1xuICAgIGVsc2VcbiAgICAgIGNvbnRleHQgPVxuICAgICAgICBza2V0Y2g6IEBtb2RlbC5mb3JUZW1wbGF0ZSgpXG4gICAgICAgIHNrZXRjaENsYXNzOiBAc2tldGNoQ2xhc3MuZm9yVGVtcGxhdGUoKVxuICAgICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICAgIGFueUF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKCkubGVuZ3RoID4gMFxuICAgICAgICBhZG1pbjogQHByb2plY3QuaXNBZG1pbiB3aW5kb3cudXNlclxuICAgICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcbiAgICAgICAgaXNDb2xsZWN0aW9uOiBpc0NvbGxlY3Rpb25cbiAgICAgICAgZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmc6IGV4aXN0aW5nX2N1c3RvbWFyeV9maXNoaW5nXG4gICAgICAgIGhhc0V4aXN0aW5nQ3VzdG9tYXJ5OiBoYXNFeGlzdGluZ0N1c3RvbWFyeVxuICAgICAgICBwcm9wb3NlZF9jdXN0b21hcnlfZmlzaGluZzogcHJvcG9zZWRfY3VzdG9tYXJ5X2Zpc2hpbmdcbiAgICAgICAgaGFzUHJvcG9zZWRDdXN0b21hcnk6IGhhc1Byb3Bvc2VkQ3VzdG9tYXJ5XG4gICAgICAgIGV4aXN0aW5nX2Zpc2hpbmdfYXJlYXM6IGV4aXN0aW5nX2Zpc2hpbmdfYXJlYXNcbiAgICAgICAgaGFzRXhpc3RpbmdGaXNoaW5nOiBoYXNFeGlzdGluZ0Zpc2hpbmdcbiAgICAgICAgaGFzQW55RmlzaGluZzogaGFzQW55RmlzaGluZ1xuICAgICAgICBoYXNDdXN0b21hcnk6IGhhc0N1c3RvbWFyeVxuICAgICAgICBpc01QQTogaXNNUEFcbiAgICAgICAgaXNDb25maWRlbnRpYWxNUEFOZXR3b3JrOiBpc0NvbmZpZGVudGlhbE1QQU5ldHdvcmtcblxuICAgIEAkZWwuaHRtbCBAdGVtcGxhdGUucmVuZGVyKGNvbnRleHQsIHBhcnRpYWxzKVxuICAgIEBlbmFibGVMYXllclRvZ2dsZXJzKClcbiAgICBAc2V0dXBGaXNoZXJ5U29ydGluZyhmaXNoZXJ5X2ludGVuc2l0eSlcblxuICByb3VuZERhdGE6IChyZWNfc2V0KSA9PlxuICAgIGxvd190b3RhbCA9IDAuMFxuICAgIGhpZ2hfdG90YWwgPSAwLjBcbiAgICBmb3IgcnMgaW4gcmVjX3NldFxuICAgICAgcnMuTE9XID0gTnVtYmVyKHJzLkxPVykudG9GaXhlZCgxKVxuICAgICAgbG93X3RvdGFsKz1OdW1iZXIocnMuTE9XKVxuICAgICAgcnMuSElHSCA9IE51bWJlcihycy5ISUdIKS50b0ZpeGVkKDEpXG4gICAgICBoaWdoX3RvdGFsKz1OdW1iZXIocnMuSElHSClcbiAgICAgIHJzLlRPVEFMID0gTnVtYmVyKHJzLlRPVEFMKS50b0ZpeGVkKDEpXG4gICAgaWYgcmVjX3NldD8ubGVuZ3RoID4gMFxuICAgICAgdG90X3JvdyA9IHtcIk5BTUVcIjpcIlRvdGFsXCIsIFwiTE9XXCI6bG93X3RvdGFsLCBcIkhJR0hcIjpoaWdoX3RvdGFsfVxuICAgICAgcmVjX3NldC5wdXNoKHRvdF9yb3cpXG5cbiAgc2V0dXBGaXNoZXJ5U29ydGluZzogKGZpc2hlcnlfaW50ZW5zaXR5KSA9PlxuICAgIHRib2R5TmFtZSA9ICcuZmlzaGVyeV92YWx1ZXMnXG4gICAgdGFibGVOYW1lID0gJy5maXNoZXJ5X3RhYmxlJ1xuXG4gICAgQCQoJy5maXNoZXJ5X3R5cGUnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnZmlzaGVyeV90eXBlJywgdGFibGVOYW1lLCBmaXNoZXJ5X2ludGVuc2l0eSwgZXZlbnQsIFwiRklTSF9UWVBFXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRGaXNoZXJ5Um93U3RyaW5nKVxuICAgIFxuICAgIEAkKCcuZmlzaGVyeV9oaWdoJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2Zpc2hlcnlfaGlnaCcsIHRhYmxlTmFtZSwgZmlzaGVyeV9pbnRlbnNpdHksIGV2ZW50LCBcIkhJR0hcIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0RmlzaGVyeVJvd1N0cmluZylcblxuICAgIEAkKCcuZmlzaGVyeV9tb2RlcmF0ZScpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdmaXNoZXJ5X21vZGVyYXRlJyx0YWJsZU5hbWUsIGZpc2hlcnlfaW50ZW5zaXR5LCBldmVudCwgXCJNT0RFUkFURVwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRGaXNoZXJ5Um93U3RyaW5nKVxuICAgIFxuICAgIEAkKCcuZmlzaGVyeV9sb3cnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnZmlzaGVyeV9sb3cnLHRhYmxlTmFtZSwgZmlzaGVyeV9pbnRlbnNpdHksIGV2ZW50LCBcIkxPV1wiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRGaXNoZXJ5Um93U3RyaW5nKVxuXG4gICAgQCQoJy5maXNoZXJ5X2Rpc3AnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnZmlzaGVyeV9kaXNwJyx0YWJsZU5hbWUsIGZpc2hlcnlfaW50ZW5zaXR5LCBldmVudCwgXCJESVNQXCIsIHRib2R5TmFtZSwgdHJ1ZSwgQGdldEZpc2hlcnlSb3dTdHJpbmcpXG5cblxuICAgIEByZW5kZXJTb3J0KCdmaXNoZXJ5X3R5cGUnLCB0YWJsZU5hbWUsIGZpc2hlcnlfaW50ZW5zaXR5LCB1bmRlZmluZWQsIFwiRklTSF9UWVBFXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRGaXNoZXJ5Um93U3RyaW5nKVxuICBcbiAgI3RhYmxlIHJvdyBmb3IgaGFiaXRhdCByZXByZXNlbnRhdGlvblxuICBnZXRGaXNoZXJ5Um93U3RyaW5nOiAoZCkgPT5cbiAgICBpZiBkIGlzIHVuZGVmaW5lZFxuICAgICAgcmV0dXJuIFwiXCJcblxuICAgIHJldHVybiBcIjx0ZD5cIitkLkZJU0hfVFlQRStcIjwvdGQ+XCIrXCI8dGQ+XCIrZC5ISUdIK1wiPC90ZD5cIitcIjx0ZD5cIitkLk1PREVSQVRFK1wiPC90ZD5cIitcIjx0ZD5cIitkLkxPVytcIjwvdGQ+XCIrXCI8dGQ+XCIrZC5ESVNQK1wiPC90ZD5cIlxuICBcbiAgZ2V0RmxvYXQ6ICh2YWwpID0+XG4gICAgdHJ5XG4gICAgICByZXR1cm4gcGFyc2VGbG9hdCh2YWwpXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIHJldHVybiAwLjBcblxuICByZW5kZXJTb3J0OiAobmFtZSwgdGFibGVOYW1lLCBwZGF0YSwgZXZlbnQsIHNvcnRCeSwgdGJvZHlOYW1lLCBpc0Zsb2F0LCBnZXRSb3dTdHJpbmdWYWx1ZSApID0+XG4gICAgaWYgZXZlbnRcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgdGFyZ2V0Q29sdW1uID0gQGdldFNlbGVjdGVkQ29sdW1uKGV2ZW50LCBuYW1lKVxuXG4gICAgICBzb3J0VXAgPSBAZ2V0U29ydERpcih0YXJnZXRDb2x1bW4pXG5cbiAgICAgIGlmIGlzRmxvYXRcbiAgICAgICAgZGF0YSA9IF8uc29ydEJ5IHBkYXRhLCAocm93KSAtPiBcbiAgICAgICAgICAgIGlmIGlzTmFOKHJvd1tzb3J0QnldKVxuICAgICAgICAgICAgICB2YWwgPSAtMS4wXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHZhbCA9IHBhcnNlRmxvYXQocm93W3NvcnRCeV0pXG4gICAgICAgICAgICByZXR1cm4gdmFsXG4gICAgICBlbHNlXG4gICAgICAgIGRhdGEgPSBfLnNvcnRCeSBwZGF0YSwgKHJvdykgLT4gcm93W3NvcnRCeV1cblxuICAgICAgI2ZsaXAgc29ydGluZyBpZiBuZWVkZWRcbiAgICAgIGlmIHNvcnRVcFxuICAgICAgICBkYXRhLnJldmVyc2UoKVxuXG4gICAgICBlbCA9IEAkKHRib2R5TmFtZSlbMF1cbiAgICAgIGhhYl9ib2R5ID0gZDMuc2VsZWN0KGVsKVxuXG4gICAgICAjcmVtb3ZlIG9sZCByb3dzXG4gICAgICBoYWJfYm9keS5zZWxlY3RBbGwoXCJ0ci5maXNoZXJ5X3Jvd3NcIilcbiAgICAgICAgLnJlbW92ZSgpXG5cbiAgICAgICNhZGQgbmV3IHJvd3MgKGFuZCBkYXRhKVxuICAgICAgcm93cyA9IGhhYl9ib2R5LnNlbGVjdEFsbChcInRyXCIpXG4gICAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgICAgLmVudGVyKCkuaW5zZXJ0KFwidHJcIiwgXCI6Zmlyc3QtY2hpbGRcIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImZpc2hlcnlfcm93c1wiKVxuXG4gICAgICBjb2x1bW5zID0gW1wiRklTSF9UWVBFXCIsIFwiSElHSFwiLCBcIk1PREVSQVRFXCIsIFwiTE9XXCIsIFwiRElTUFwiXVxuXG4gICAgICBjZWxscyA9IHJvd3Muc2VsZWN0QWxsKFwidGRcIilcbiAgICAgICAgICAuZGF0YSgocm93LCBpKSAtPmNvbHVtbnMubWFwIChjb2x1bW4pIC0+IChjb2x1bW46IGNvbHVtbiwgdmFsdWU6IHJvd1tjb2x1bW5dKSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZChcInRkXCIpLnRleHQoKGQsIGkpIC0+IFxuICAgICAgICAgIGQudmFsdWVcbiAgICAgICAgKSAgICBcblxuICAgICAgQHNldE5ld1NvcnREaXIodGFyZ2V0Q29sdW1uLCBzb3J0VXApXG5cbiAgICAgICNmaXJlIHRoZSBldmVudCBmb3IgdGhlIGFjdGl2ZSBwYWdlIGlmIHBhZ2luYXRpb24gaXMgcHJlc2VudFxuICAgICAgQGZpcmVQYWdpbmF0aW9uKHRhYmxlTmFtZSlcbiAgICAgIGlmIGV2ZW50XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgXG4gIGdldFNlbGVjdGVkQ29sdW1uOiAoZXZlbnQsIG5hbWUpID0+XG4gICAgaWYgZXZlbnRcbiAgICAgICNnZXQgc29ydCBvcmRlclxuICAgICAgdGFyZ2V0Q29sdW1uID0gZXZlbnQuY3VycmVudFRhcmdldC5jbGFzc05hbWVcbiAgICAgIG11bHRpQ2xhc3NlcyA9IHRhcmdldENvbHVtbi5zcGxpdCgnICcpXG4gICAgICB0YXJnZXRDb2x1bW4gPSBtdWx0aUNsYXNzZXNbMF1cbiAgICBlbHNlXG4gICAgICAjd2hlbiB0aGVyZSBpcyBubyBldmVudCwgZmlyc3QgdGltZSB0YWJsZSBpcyBmaWxsZWRcbiAgICAgIHRhcmdldENvbHVtbiA9IG5hbWVcblxuICAgIHJldHVybiB0YXJnZXRDb2x1bW5cblxuICBnZXRTb3J0RGlyOiAodGFyZ2V0Q29sdW1uKSA9PlxuICAgICBzb3J0dXAgPSBAJCgnLicrdGFyZ2V0Q29sdW1uKS5oYXNDbGFzcyhcInNvcnRfdXBcIilcbiAgICAgcmV0dXJuIHNvcnR1cFxuXG4gIHNldE5ld1NvcnREaXI6ICh0YXJnZXRDb2x1bW4sIHNvcnRVcCkgPT5cbiAgICAjYW5kIHN3aXRjaCBpdFxuICAgIGlmIHNvcnRVcFxuICAgICAgQCQoJy4nK3RhcmdldENvbHVtbikucmVtb3ZlQ2xhc3MoJ3NvcnRfdXAnKVxuICAgICAgQCQoJy4nK3RhcmdldENvbHVtbikuYWRkQ2xhc3MoJ3NvcnRfZG93bicpXG4gICAgZWxzZVxuICAgICAgQCQoJy4nK3RhcmdldENvbHVtbikuYWRkQ2xhc3MoJ3NvcnRfdXAnKVxuICAgICAgQCQoJy4nK3RhcmdldENvbHVtbikucmVtb3ZlQ2xhc3MoJ3NvcnRfZG93bicpXG5cbiAgZmlyZVBhZ2luYXRpb246ICh0YWJsZU5hbWUpID0+XG4gICAgZWwgPSBAJCh0YWJsZU5hbWUpWzBdXG4gICAgaGFiX3RhYmxlID0gZDMuc2VsZWN0KGVsKVxuICAgIGFjdGl2ZV9wYWdlID0gaGFiX3RhYmxlLnNlbGVjdEFsbChcIi5hY3RpdmUgYVwiKVxuICAgIGlmIGFjdGl2ZV9wYWdlIGFuZCBhY3RpdmVfcGFnZVswXSBhbmQgYWN0aXZlX3BhZ2VbMF1bMF1cbiAgICAgIGFjdGl2ZV9wYWdlWzBdWzBdLmNsaWNrKClcblxubW9kdWxlLmV4cG9ydHMgPSBGaXNoaW5nVGFiIiwibW9kdWxlLmV4cG9ydHMgPSBcbiAgR0VORVJJQ19JRDogJzUzOWY1ZWM2OGQxMDkyNmMyOWZlNzc2MidcbiAgR0VORVJJQ19DT0xMRUNUSU9OX0lEOiAnNTNmZDE5NTUwNDA2ZGU2ODRjMTE4OTY5J1xuICBNUEFfSUQ6ICc1NGQ4MTI5MGZhOTRlNjk3NzU5Y2U3NzEnXG4gIE1QQV9DT05GSURfQ09MTEVDVElPTl9JRDogJzU1ODJlNjA1YWMyZGRkZDQyOTc2ZjQxYidcbiAgTVBBX0NPTExFQ1RJT05fSUQ6ICc1NjMxMmFiY2U4MzdmMjJmMDZiNmQyNzInIiwiUmVwb3J0VGFiID0gcmVxdWlyZSAncmVwb3J0VGFiJ1xudGVtcGxhdGVzID0gcmVxdWlyZSAnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxuX3BhcnRpYWxzID0gcmVxdWlyZSAnLi4vbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cbmlkcyA9IHJlcXVpcmUgJy4vaWRzLmNvZmZlZSdcbmZvciBrZXksIHZhbHVlIG9mIGlkc1xuICB3aW5kb3dba2V5XSA9IHZhbHVlXG5cbmNsYXNzIE92ZXJ2aWV3VGFiIGV4dGVuZHMgUmVwb3J0VGFiXG4gICMgdGhpcyBpcyB0aGUgbmFtZSB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBUYWJcbiAgbmFtZTogJ092ZXJ2aWV3J1xuICBjbGFzc05hbWU6ICdvdmVydmlldydcbiAgdGltZW91dDogMTIwMDAwXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZXMub3ZlcnZpZXdcbiAgZGVwZW5kZW5jaWVzOiBbXG4gICAgJ0hhYml0YXRzT3ZlcnZpZXcnXG4gICAgJ1Byb3Bvc2FsU2l6ZSdcbiAgICAnUHJvcG9zYWxDb25uZWN0aXZpdHknXG4gICAgJ05ld0hhYlJlcHNUb29sYm94J1xuICBdXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgICMgVGhlIEByZWNvcmRTZXQgbWV0aG9kIGNvbnRhaW5zIHNvbWUgdXNlZnVsIG1lYW5zIHRvIGdldCBkYXRhIG91dCBvZiBcbiAgICAjIHRoZSBtb25zdGVyb3VzIFJlY29yZFNldCBqc29uLiBDaGVja291dCB0aGUgc2Vhc2tldGNoLXJlcG9ydGluZy10ZW1wbGF0ZVxuICAgICMgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBpbmZvLlxuICAgIFRPVEFMX0NPQVNUTElORV9MRU5HVEggPSA3NjYuNDY2OTE3XG4gICAgVE9UX1NJWkVfU1FLTSA9IDg5MzAuNjYyODkzXG5cbiAgICBcbiAgICBUT1RBTF9IQUJTID0yMlxuXG4gICAgc2NpZCA9IEBza2V0Y2hDbGFzcy5pZFxuICAgIGlzQ29sbGVjdGlvbiA9IEBtb2RlbC5pc0NvbGxlY3Rpb24oKVxuXG4gICAgaXNNUEEgPSAoc2NpZCA9PSBNUEFfSUQgb3Igc2NpZCA9PSBNUEFfQ09MTEVDVElPTl9JRCBvciBzY2lkID09IE1QQV9DT05GSURfQ09MTEVDVElPTl9JRClcblxuICAgIG51bV9yZXNlcnZlcyA9IDBcbiAgICBudW1fdHlwZTIgPSAwXG4gICAgbnVtX290aGVyID0gMFxuICAgIHBsdXJhbF90eXBlMSA9IHRydWVcbiAgICBwbHVyYWxfdHlwZTIgPSB0cnVlXG4gICAgcGx1cmFsX290aGVyID0gdHJ1ZVxuXG4gICAgaWYgaXNDb2xsZWN0aW9uXG4gICAgICBudW1Ta2V0Y2hlcyA9IEBtb2RlbC5nZXRDaGlsZHJlbigpLmxlbmd0aFxuICAgICAgaWYgaXNNUEFcbiAgICAgICAgcmVzZXJ2ZV90eXBlcyA9IEBnZXRSZXNlcnZlVmFsdWVzIEBtb2RlbC5nZXRDaGlsZHJlbigpXG4gICAgICAgIG51bV9yZXNlcnZlcyA9IHJlc2VydmVfdHlwZXNbMF1cbiAgICAgICAgcGx1cmFsX3R5cGUxID0gbnVtX3Jlc2VydmVzICE9IDFcbiAgICAgICAgbnVtX3R5cGUyID0gcmVzZXJ2ZV90eXBlc1sxXVxuICAgICAgICBwbHVyYWxfdHlwZTIgPSBudW1fdHlwZTIgIT0gMVxuICAgICAgICBudW1fb3RoZXIgPSByZXNlcnZlX3R5cGVzWzJdXG4gICAgICAgIHBsdXJhbF9vdGhlciA9IG51bV9vdGhlciAhPSAxXG4gICAgZWxzZVxuICAgICAgbnVtU2tldGNoZXMgPSAxXG5cbiAgICBwbHVyYWxTa2V0Y2hlcyA9IG51bVNrZXRjaGVzID4gMVxuXG4gICAgaXNHZW5lcmljID0gKHNjaWQgPT0gR0VORVJJQ19JRCBvciBzY2lkID09IEdFTkVSSUNfQ09MTEVDVElPTl9JRClcblxuICAgIHRvdGFsX3NpemVzID0gQHJlY29yZFNldCgnUHJvcG9zYWxTaXplJywgJ1NpemVUb3RhbHMnKS50b0FycmF5KClcbiAgICBwcm9wX3NpemVzID0gQHJlY29yZFNldCgnUHJvcG9zYWxTaXplJywgJ1NpemVzJykudG9BcnJheSgpXG4gICAgXG4gICAgcmVwcmVzZW50ZWRfaGFicyA9IEByZWNvcmRTZXQoJ05ld0hhYlJlcHNUb29sYm94JywgJ1JlcHJlc2VudGVkSGFicycpLnRvQXJyYXkoKVxuICAgIGhhYl9zaXplcyA9IEByZWNvcmRTZXQoJ05ld0hhYlJlcHNUb29sYm94JywgJ0hhYlNpemVzJykudG9BcnJheSgpXG4gICAgbnVtX2hhYnMgPSBoYWJfc2l6ZXM/Lmxlbmd0aFxuXG4gICAgbnVtX3JlcHJlc2VudGVkX2hhYnMgPSBAZ2V0TnVtSGFicyhcIlJFUFlFU1wiLCByZXByZXNlbnRlZF9oYWJzLCBcIlllc1wiKVxuICAgIG51bV9yZXBsaWNhdGVkX2hhYnMgPSBAZ2V0TnVtYmVyUmVwbGljYXRlZEhhYnMoXCJSRVBMSUNcIiwgcmVwcmVzZW50ZWRfaGFicylcblxuICAgIG1wYV9hdmdfbWluX2RpbSA9IEBnZXRBdmVyYWdlTWluRGltKHByb3Bfc2l6ZXMpXG4gICAgdG90YWxfcGVyY2VudCA9IEBnZXRUb3RhbEFyZWFQZXJjZW50KHByb3Bfc2l6ZXMpXG4gICAgcHJvcF9zaXplcyA9IEBjbGVhbnVwRGF0YShwcm9wX3NpemVzKVxuICAgIFxuICAgIG1wYV9jb3VudCA9IEBnZXRNaW5EaW1Db3VudChwcm9wX3NpemVzKVxuICAgIHRvdGFsX21wYV9jb3VudCA9IG51bVNrZXRjaGVzXG4gICAgcGx1cmFsX21wYV9jb3VudCA9IG1wYV9jb3VudCAhPSAxXG5cbiAgICBcbiAgICBpZiBtcGFfYXZnX21pbl9kaW0gPCAxMFxuICAgICAgbXBhX2F2Z19zaXplX2d1aWRlbGluZSA9IFwiYmVsb3dcIlxuICAgIGVsc2VcbiAgICAgIG1wYV9hdmdfc2l6ZV9ndWlkZWxpbmUgPSBcImFib3ZlXCJcblxuXG4gICAgaWYgdG90YWxfc2l6ZXM/Lmxlbmd0aCA+IDBcbiAgICAgIGNvYXN0bGluZV9sZW5ndGggPSB0b3RhbF9zaXplc1swXS5DT0FTVFxuICAgICAgY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50ID0gKGNvYXN0bGluZV9sZW5ndGgvVE9UQUxfQ09BU1RMSU5FX0xFTkdUSCkqMTAwLjBcbiAgICAgIGlmIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA+IDAgJiYgY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50IDwgMVxuICAgICAgICBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQgPSBcIjwgMVwiXG4gICAgICBlbHNlXG4gICAgICAgIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA9IHBhcnNlRmxvYXQoY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50KS50b0ZpeGVkKDEpXG4gICAgICAgIGlmIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA+IDEwMFxuICAgICAgICAgIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA9IDEwMFxuICAgICAgc2l6ZSA9IHRvdGFsX3NpemVzWzBdLlNJWkVfU1FLTVxuXG4gICAgICBjb2FzdGxpbmVfbGVuZ3RoID0gcGFyc2VGbG9hdChjb2FzdGxpbmVfbGVuZ3RoKS50b0ZpeGVkKDEpXG4gICAgICBhcmVhX3BlcmNlbnQgPSBwYXJzZUZsb2F0KChzaXplL1RPVF9TSVpFX1NRS00pKjEwMCkudG9GaXhlZCgyKVxuICAgICAgaWYgYXJlYV9wZXJjZW50ID4gMTAwXG4gICAgICAgIGFyZWFfcGVyY2VudCA9IDEwMC4wXG5cbiAgICAgIGlmIGFyZWFfcGVyY2VudCA8IDAuMVxuICAgICAgICBhcmVhX3BlcmNlbnQgPSBcIjwgMVwiXG5cbiAgICBuZXdfaGFicyA9IEByZWNvcmRTZXQoJ0hhYml0YXRzT3ZlcnZpZXcnLCAnSGFiaXRhdFNpemUnKS5mbG9hdCgnTkVXX0hBQlMnKVxuICAgIHRvdGFsX2hhYnMgPSBAcmVjb3JkU2V0KCdIYWJpdGF0c092ZXJ2aWV3JywgJ0hhYml0YXRTaXplJykuZmxvYXQoJ1RPVF9IQUJTJylcbiAgICBcbiAgICByYXRpbyA9IChjb2FzdGxpbmVfbGVuZ3RoL3NpemUpLnRvRml4ZWQoMSlcblxuICAgICNzZXR1cCBjb25uZWN0aXZpdHkgZGF0YVxuICAgIGlmIGlzQ29sbGVjdGlvblxuICAgICAgZ29vZF9jb2xvciA9IFwiI2IzY2ZhN1wiXG4gICAgICBiYWRfY29sb3IgPSBcIiNlNWNhY2VcIlxuICAgICAgaWYgbnVtU2tldGNoZXMgPiAxXG4gICAgICAgIHRyeVxuICAgICAgICAgIGNvbm5lY3RlZF9tcGFfY291bnQgPSBAcmVjb3JkU2V0KCdQcm9wb3NhbENvbm5lY3Rpdml0eScsICdDb25uJykuZmxvYXQoJ05VTUJFUicpXG4gICAgICAgICAgcGx1cmFsX2Nvbm5lY3RlZF9tcGFfY291bnQgPSB0cnVlXG5cbiAgICAgICAgICBtaW5fZGlzdGFuY2UgPSBAcmVjb3JkU2V0KCdQcm9wb3NhbENvbm5lY3Rpdml0eScsICdDb25uJykuZmxvYXQoJ01JTicpXG4gICAgICAgICAgbWF4X2Rpc3RhbmNlID0gQHJlY29yZFNldCgnUHJvcG9zYWxDb25uZWN0aXZpdHknLCAnQ29ubicpLmZsb2F0KCdNQVgnKVxuICAgICAgICAgIG1lYW5fZGlzdGFuY2UgPSBAcmVjb3JkU2V0KCdQcm9wb3NhbENvbm5lY3Rpdml0eScsICdDb25uJykuZmxvYXQoJ01FQU4nKVxuICAgICAgICAgIGNvbm5fcGllX3ZhbHVlcyA9IEBidWlsZF92YWx1ZXMoXCJNUEFzIFdpdGhpbiBDb25uZWN0aXZpdHkgUmFuZ2VcIiwgY29ubmVjdGVkX21wYV9jb3VudCxnb29kX2NvbG9yLCBcIk1QQXMgT3V0c2lkZSBDb25uZWN0aXZpdHkgUmFuZ2VcIiwgXG4gICAgICAgICAgICB0b3RhbF9tcGFfY291bnQtY29ubmVjdGVkX21wYV9jb3VudCwgYmFkX2NvbG9yKVxuICAgICAgICBjYXRjaCBFcnJvclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3IgcmVhZGluZyBjb25uZWN0aXZpdHkuLi5cIilcbiAgICAgICAgICBcbiAgICAgIG5vdF9yZXByZXNlbnRlZCA9IFRPVEFMX0hBQlMgLSBudW1fcmVwcmVzZW50ZWRfaGFic1xuICAgICAgcmVwcmVzZW50ZWRfaGFic19waWVfdmFsdWVzID0gQGJ1aWxkX3ZhbHVlcyhcIkhhYml0YXQtdHlwZXMgSW5jbHVkZWRcIiwgbnVtX3JlcHJlc2VudGVkX2hhYnMsIGdvb2RfY29sb3IsIFwiSGFiaXRhdC10eXBlcyBOb3QgSW5jbHVkZWRcIixcbiAgICAgICAgbm90X3JlcHJlc2VudGVkLCBiYWRfY29sb3IpXG5cbiAgICAgIG5vdF9yZXBsaWNhdGVkID0gVE9UQUxfSEFCUyAtIG51bV9yZXBsaWNhdGVkX2hhYnNcbiAgICAgIHJlcGxpY2F0ZWRfaGFic19waWVfdmFsdWVzID0gQGJ1aWxkX3ZhbHVlcyhcIkhhYml0YXQtdHlwZXMgUmVwbGljYXRlZFwiLCBudW1fcmVwbGljYXRlZF9oYWJzLCBnb29kX2NvbG9yLCBcIkhhYml0YXQtdHlwZXMgTm90IFJlcGxpY2F0ZWRcIixcbiAgICAgICAgbm90X3JlcGxpY2F0ZWQsIGJhZF9jb2xvcilcblxuICAgICNzaG93IHRhYmxlcyBpbnN0ZWFkIG9mIGdyYXBoIGZvciBJRVxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgZDNJc1ByZXNlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgZDNJc1ByZXNlbnQgPSBmYWxzZVxuXG4gICAgXG4gICAgYXR0cmlidXRlcyA9IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICBcbiAgICBjb250ZXh0ID1cbiAgICAgIGQzSXNQcmVzZW50OiBkM0lzUHJlc2VudFxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICBzaXplOiBzaXplXG4gICAgICBjb2FzdGxpbmVfbGVuZ3RoOiBjb2FzdGxpbmVfbGVuZ3RoXG4gICAgICBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQ6Y29hc3RsaW5lX2xlbmd0aF9wZXJjZW50XG4gICAgICBuZXdfaGFiczogbmV3X2hhYnNcbiAgICAgIHRvdGFsX2hhYnM6IHRvdGFsX2hhYnNcbiAgICAgIHJhdGlvOiByYXRpb1xuICAgICAgYXJlYV9wZXJjZW50OiBhcmVhX3BlcmNlbnRcbiAgICAgIGlzQ29sbGVjdGlvbjogaXNDb2xsZWN0aW9uXG4gICAgICBudW1Ta2V0Y2hlczogbnVtU2tldGNoZXNcbiAgICAgIHBsdXJhbFNrZXRjaGVzOiBwbHVyYWxTa2V0Y2hlc1xuICAgICAgcHJvcF9zaXplczogcHJvcF9zaXplc1xuICAgICAgdG90YWxfbXBhX2NvdW50OiB0b3RhbF9tcGFfY291bnRcbiAgICAgIG1wYV9jb3VudDogbXBhX2NvdW50XG4gICAgICBtcGFfYXZnX3NpemVfZ3VpZGVsaW5lOm1wYV9hdmdfc2l6ZV9ndWlkZWxpbmVcbiAgICAgIHBsdXJhbF9tcGFfY291bnQ6IHBsdXJhbF9tcGFfY291bnRcbiAgICAgIGNvbm5lY3RlZF9tcGFfY291bnQ6IGNvbm5lY3RlZF9tcGFfY291bnRcblxuICAgICAgcGx1cmFsX2Nvbm5lY3RlZF9tcGFfY291bnQ6IHBsdXJhbF9jb25uZWN0ZWRfbXBhX2NvdW50XG4gICAgICBtaW5fZGlzdGFuY2U6IG1pbl9kaXN0YW5jZVxuICAgICAgbWF4X2Rpc3RhbmNlOiBtYXhfZGlzdGFuY2VcbiAgICAgIG1lYW5fZGlzdGFuY2U6IG1lYW5fZGlzdGFuY2VcbiAgICAgIHNpbmdsZVNrZXRjaDogbnVtU2tldGNoZXMgPT0gMVxuICAgICAgaXNNUEE6IGlzTVBBXG4gICAgICBudW1faGFiczogbnVtX2hhYnNcbiAgICAgIHRvdGFsX2hhYnM6IFRPVEFMX0hBQlNcbiAgICAgIG51bV9yZXByZXNlbnRlZF9oYWJzOiBudW1fcmVwcmVzZW50ZWRfaGFic1xuICAgICAgbnVtX3JlcGxpY2F0ZWRfaGFiczogbnVtX3JlcGxpY2F0ZWRfaGFic1xuICAgICAgaXNHZW5lcmljOiBpc0dlbmVyaWNcbiAgICAgIGlzTVBBOiBpc01QQVxuICAgICAgbnVtX3Jlc2VydmVzOiBudW1fcmVzZXJ2ZXNcbiAgICAgIHBsdXJhbF90eXBlMTogcGx1cmFsX3R5cGUxXG4gICAgICBudW1fdHlwZTI6IG51bV90eXBlMlxuICAgICAgcGx1cmFsX3R5cGUyOiBwbHVyYWxfdHlwZTJcbiAgICAgIG51bV9vdGhlcjogbnVtX290aGVyXG4gICAgICBwbHVyYWxfb3RoZXI6IHBsdXJhbF9vdGhlclxuXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgcGFydGlhbHMpXG4gICAgQGVuYWJsZUxheWVyVG9nZ2xlcnMoKVxuXG4gICAgI3NpemVfcGllX3ZhbHVlcyA9IEBidWlsZF92YWx1ZXMoXCJNZWV0cyBNaW4uIFNpemVcIiwgbXBhX2NvdW50LFwiI2IzY2ZhN1wiLCBcIkRvZXMgbm90IE1lZXQgU2l6ZSBNaW4uXCIsIFxuICAgICMgIHRvdGFsX21wYV9jb3VudC1tcGFfY291bnQsIFwiI2U1Y2FjZVwiKVxuXG4gICAgQGRyYXdQaWUocmVwcmVzZW50ZWRfaGFic19waWVfdmFsdWVzLCBcIiNyZXByZXNlbnRlZF9oYWJzX3BpZVwiKVxuICAgIEBkcmF3UGllKHJlcGxpY2F0ZWRfaGFic19waWVfdmFsdWVzLCBcIiNyZXBsaWNhdGVkX2hhYnNfcGllXCIpXG4gICAgQGRyYXdQaWUoY29ubl9waWVfdmFsdWVzLCBcIiNjb25uZWN0aXZpdHlfcGllXCIpXG4gIFxuXG4gIGJ1aWxkX3ZhbHVlczogKHllc19sYWJlbCwgeWVzX2NvdW50LCB5ZXNfY29sb3IsIG5vX2xhYmVsLCBub19jb3VudCwgbm9fY29sb3IpID0+XG4gICAgeWVzX3ZhbCA9IHtcImxhYmVsXCI6eWVzX2xhYmVsK1wiIChcIit5ZXNfY291bnQrXCIpXCIsIFwidmFsdWVcIjp5ZXNfY291bnQsIFwiY29sb3JcIjp5ZXNfY29sb3IsIFwieXZhbFwiOjI1fVxuICAgIG5vX3ZhbCA9IHtcImxhYmVsXCI6bm9fbGFiZWwrXCIgKFwiK25vX2NvdW50K1wiKVwiLCBcInZhbHVlXCI6bm9fY291bnQsIFwiY29sb3JcIjpub19jb2xvciwgXCJ5dmFsXCI6NTB9XG5cbiAgICByZXR1cm4gW3llc192YWwsIG5vX3ZhbF1cblxuICBnZXROdW1iZXJSZXBsaWNhdGVkSGFiczogKGF0dHJfbmFtZSwgaGFiaXRhdHMpID0+XG4gICAgaWYgaGFiaXRhdHM/Lmxlbmd0aCA9PSAwXG4gICAgICByZXR1cm4gMFxuXG4gICAgY291bnQgPSAwXG4gICAgZm9yIGhhYiBpbiBoYWJpdGF0c1xuICAgICAgdHJ5XG4gICAgICAgIG51bV9yZXBzID0gTnVtYmVyLnBhcnNlSW50KGhhYlthdHRyX25hbWVdKVxuICAgICAgICBpZiBudW1fcmVwcyA+IDFcbiAgICAgICAgICBpZiBAaXNDb2FzdGFsSGFiKGhhYilcbiAgICAgICAgICAgIGNvdW50Kz0xXG4gICAgICBjYXRjaCBlXG4gICAgICAgICNkbyBub3RoaW5nIC0gZ3VhcmQgaW4gY2FzZSBhIG5vbi1udW1iZXIgY29tZXMgYmFjayAgXG4gICAgICBcbiAgICByZXR1cm4gY291bnRcblxuICBnZXROdW1IYWJzOiAoYXR0cl9uYW1lLCBoYWJpdGF0cywgdGd0KSA9PlxuICAgIGlmIGhhYml0YXRzPy5sZW5ndGggPT0gMFxuICAgICAgcmV0dXJuIDBcbiAgICBjb3VudCA9IDBcbiAgICBmb3IgaGFiIGluIGhhYml0YXRzXG4gICAgICBpZiBoYWJbYXR0cl9uYW1lXSA9PSB0Z3RcbiAgICAgICAgaWYgQGlzQ29hc3RhbEhhYihoYWIpXG4gICAgICAgICAgY291bnQrPTFcblxuICAgIHJldHVybiBjb3VudFxuXG4gIGlzQ29hc3RhbEhhYjogKGhhYikgPT5cbiAgICBpZiBoYWIuSEFCX1RZUEUgPT0gXCJCcnlvem9hbiByZWVmXCIgb3IgaGFiLkhBQl9UWVBFID09IFwiTWFjcm9jeXN0aXMgYmVkXCIgb3IgaGFiLkhBQl9UWVBFID09IFwiU2VhZ3Jhc3MgYmVkXCJcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIGlmIGhhYi5IQUJfVFlQRS5pbmRleE9mKFwiRXN0dWFyaW5lXCIpID09IDBcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIGlmIGhhYi5IQUJfVFlQRSA9PSBcIk11ZCBGbGF0XCJcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG5cbiAgaXNUeXBlMk9ubHk6IChyZXNlcnZlcykgPT5cbiAgICByZXNjb3VudHMgPSBAZ2V0UmVzZXJ2ZVZhbHVlcyhyZXNlcnZlcylcbiAgICBpZiByZXNjb3VudHNbMF0gPT0gMFxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICAgIFxuICBnZXRSZXNlcnZlVmFsdWVzOiAocmVzZXJ2ZXMpID0+XG4gICAgbnVtX3Jlc2VydmVzID0gMFxuICAgIG51bV90eXBlMiA9IDBcbiAgICBudW1fb3RoZXIgPSAwXG4gICAgdDJfc3RyID0gXCJUeXBlMlwiXG4gICAgbXJfc3RyID0gXCJNUlwiXG4gICAgb3RoZXJfc3RyID0gXCJPdGhlclwiXG4gICAgdHJ5XG4gICAgICBmb3IgcmVzIGluIHJlc2VydmVzXG4gICAgICAgIGF0dHJzID0gcmVzLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgICBmb3IgYXR0IGluIGF0dHJzXG4gICAgICAgICAgaWYgYXR0LmV4cG9ydGlkID09IFwiTUFOQUdFTUVOVFwiIFxuICAgICAgICAgICAgcmVzX3R5cGUgPSBhdHQudmFsdWVcbiAgICAgICAgICAgIGlmIHJlc190eXBlID09IHQyX3N0ciBvciByZXNfdHlwZS5pbmRleE9mKHQyX3N0cikgPj0wXG4gICAgICAgICAgICAgIG51bV90eXBlMis9MVxuICAgICAgICAgICAgZWxzZSBpZiByZXNfdHlwZSA9PSBtcl9zdHIgb3IgcmVzX3R5cGUuaW5kZXhPZihtcl9zdHIpID49MFxuICAgICAgICAgICAgICBudW1fcmVzZXJ2ZXMrPTFcbiAgICAgICAgICAgIGVsc2UgaWYgcmVzX3R5cGUgPT0gb3RoZXJfc3RyIG9yIHJlc190eXBlLmluZGV4T2Yob3RoZXJfc3RyKSA+PSAwXG4gICAgICAgICAgICAgIG51bV9vdGhlcis9MVxuICAgIGNhdGNoIEVycm9yXG4gICAgICBjb25zb2xlLmxvZygncmFuIGludG8gcHJvYmxlbSBnZXR0aW5nIG1wYSB0eXBlcycpXG5cbiAgICByZXR1cm4gW251bV9yZXNlcnZlcywgbnVtX3R5cGUyLCBudW1fb3RoZXJdXG5cbiAgZ2V0RGF0YVZhbHVlOiAoZGF0YSkgPT5cbiAgICByZXR1cm4gZGF0YS52YWx1ZVxuXG4gIGRyYXdQaWU6IChkYXRhLCBwaWVfbmFtZSkgPT5cbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIHcgPSA5MFxuICAgICAgaCA9IDc1XG4gICAgICByID0gMjVcbiAgICAgXG4gICAgICB2aXNfZWwgPSBAJChwaWVfbmFtZSlbMF1cbiAgICAgICN2aXMgPSBkMy5zZWxlY3QodmlzX2VsKVxuICAgICAgdmlzID0gZDMuc2VsZWN0KHZpc19lbCkuYXBwZW5kKFwic3ZnOnN2Z1wiKS5kYXRhKFtkYXRhXSkuYXR0cihcIndpZHRoXCIsIHcpLmF0dHIoXCJoZWlnaHRcIiwgaCkuYXBwZW5kKFwic3ZnOmdcIikuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIChyKjIpICsgXCIsXCIgKyAocis1KSArIFwiKVwiKVxuICAgICAgXG4gICAgICAjdmlzID0gZDMuc2VsZWN0KHBpZV9uYW1lKS5hcHBlbmQoXCJzdmc6c3ZnXCIpLmRhdGEoW2RhdGFdKS5hdHRyKFwid2lkdGhcIiwgdykuYXR0cihcImhlaWdodFwiLCBoKS5hcHBlbmQoXCJzdmc6Z1wiKS5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgKHIqMikgKyBcIixcIiArIChyKzUpICsgXCIpXCIpXG4gICAgICBcbiAgICAgIHBpZSA9IGQzLmxheW91dC5waWUoKS52YWx1ZSgoZCkgLT4gcmV0dXJuIGQudmFsdWUpXG5cbiAgICAgICNkZWNsYXJlIGFuIGFyYyBnZW5lcmF0b3IgZnVuY3Rpb25cbiAgICAgIGFyYyA9IGQzLnN2Zy5hcmMoKS5vdXRlclJhZGl1cyhyKVxuXG4gICAgICAjc2VsZWN0IHBhdGhzLCB1c2UgYXJjIGdlbmVyYXRvciB0byBkcmF3XG4gICAgICBhcmNzID0gdmlzLnNlbGVjdEFsbChcImcuc2xpY2VcIikuZGF0YShwaWUpLmVudGVyKCkuYXBwZW5kKFwic3ZnOmdcIikuYXR0cihcImNsYXNzXCIsIFwic2xpY2VcIilcbiAgICAgIGFyY3MuYXBwZW5kKFwic3ZnOnBhdGhcIilcbiAgICAgICAgLmF0dHIoXCJmaWxsXCIsIChkKSAtPiByZXR1cm4gZC5kYXRhLmNvbG9yKVxuICAgICAgICAuYXR0cihcInN0cm9rZVwiLCAoZCkgLT4gcmV0dXJuIGlmIGQuZGF0YS52YWx1ZSA9PSAwIHRoZW4gXCJub25lXCIgZWxzZSBcIiM1NDU0NTRcIilcbiAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMC4yNSlcbiAgICAgICAgLmF0dHIoXCJkXCIsIChkKSAtPiAgXG4gICAgICAgICAgYXJjKGQpXG4gICAgICAgIClcbiAgICAgICAgXG4gICAgICAnJydcbiAgICAgIGVsID0gQCQoJy52aXonKVtpbmRleF1cbiAgICAgIHggPSBkMy5zY2FsZS5saW5lYXIoKVxuICAgICAgICAuZG9tYWluKFswLCBtYXhfdmFsdWVdKVxuICAgICAgICAucmFuZ2UoWzAsIDQwMF0pXG4gICAgICBjaGFydCA9IGQzLnNlbGVjdChlbClcbiAgICAgIGNoYXJ0LnNlbGVjdEFsbChcImRpdi5yYW5nZVwiKVxuICAgICAgICAuZGF0YSh0MnJhbmdlcylcbiAgICAgICcnJ1xuICAgICAgZWwgPSBAJChwaWVfbmFtZStcIl9sZWdlbmRcIilbMF1cbiAgICAgIGNoYXJ0ID0gZDMuc2VsZWN0KGVsKVxuICAgICAgbGVnZW5kcyA9IGNoYXJ0LnNlbGVjdEFsbChwaWVfbmFtZStcIl9sZWdlbmRcIilcbiAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgIC5lbnRlcigpLmluc2VydChcImRpdlwiKVxuICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJsZWdlbmQtcm93XCIpXG5cbiAgICAgIGxlZ2VuZHMuYXBwZW5kKFwic3BhblwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwicGllLWxhYmVsLXN3YXRjaFwiKVxuICAgICAgICAuc3R5bGUoJ2JhY2tncm91bmQtY29sb3InLCAoZCxpKSAtPiBkLmNvbG9yKVxuICAgICAgXG4gICAgICBsZWdlbmRzLmFwcGVuZChcInNwYW5cIilcbiAgICAgICAgLnRleHQoKGQsaSkgLT4gcmV0dXJuIGRhdGFbaV0ubGFiZWwpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJwaWUtbGFiZWxcIilcblxuICAgICAgXG5cbiAgZ2V0VG90YWxBcmVhUGVyY2VudDogKHByb3Bfc2l6ZXMpID0+XG5cbiAgICBmb3IgcHMgaW4gcHJvcF9zaXplc1xuICAgICAgaWYgcHMuTkFNRSA9PSBcIlBlcmNlbnQgb2YgVG90YWwgQXJlYVwiXG4gICAgICAgIHJldHVybiBwcy5TSVpFX1NRS01cbiAgICByZXR1cm4gMC4wXG5cbiAgZ2V0QXZlcmFnZU1pbkRpbTogKHByb3Bfc2l6ZXMpID0+XG4gICAgZm9yIHBzIGluIHByb3Bfc2l6ZXNcbiAgICAgIGlmIHBzLk5BTUUgPT0gXCJBdmVyYWdlXCJcbiAgICAgICAgcmV0dXJuIHBzLk1JTl9ESU1cblxuICBjbGVhbnVwRGF0YTogKHByb3Bfc2l6ZXMsIGlzQ29sbGVjdGlvbikgPT5cbiAgICBjbGVhbmVkX3Byb3BzID0gW11cbiAgICBudW1fc2tldGNoZXMgPSBwcm9wX3NpemVzPy5sZW5ndGhcbiAgICBmb3IgcHMgaW4gcHJvcF9zaXplc1xuICAgICAgaWYgcHMuTkFNRSAhPSBcIlBlcmNlbnQgb2YgVG90YWwgQXJlYVwiXG4gICAgICAgIHBzLk1JTl9ESU0gPSBwYXJzZUZsb2F0KHBzLk1JTl9ESU0pLnRvRml4ZWQoMSlcbiAgICAgICAgcHMuU0laRV9TUUtNID0gcGFyc2VGbG9hdChwcy5TSVpFX1NRS00pLnRvRml4ZWQoMilcbiAgICAgICAgaWYgcHMuU0laRV9TUUtNIDwgMC4xXG4gICAgICAgICAgcHMuU0laRV9TUUtNID0gXCI8IDAuMVwiXG4gICAgICAgIHBzLkNPQVNUID0gTnVtYmVyKHBzLkNPQVNUKS50b0ZpeGVkKDEpXG4gICAgICAgIGlmIHBzLkNPQVNUID09IDAgXG4gICAgICAgICAgcHMuQ09BU1QgPSBcIi0tXCJcbiAgICAgICAgI2Rvbid0IGluY2x1ZGUgYXZlcmFnZSBmb3Igc2luZ2Ugc2tldGNoXG4gICAgICAgIGlmIG51bV9za2V0Y2hlcyA9PSAzIFxuICAgICAgICAgIGlmIHBzLk5BTUUgIT0gXCJBdmVyYWdlXCJcbiAgICAgICAgICAgIGNsZWFuZWRfcHJvcHMucHVzaChwcylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNsZWFuZWRfcHJvcHMucHVzaChwcylcbiAgICAgIGlmIHBzLk5BTUUgPT0gXCJBdmVyYWdlXCJcbiAgICAgICAgcHMuQ1NTX0NMQVNTID0gXCJpc19hdmdcIlxuICAgICAgZWxzZVxuICAgICAgICBwcy5DU1NfQ0xBU1MgPSBcIm5vdF9hdmdcIlxuXG4gICAgcmV0dXJuIGNsZWFuZWRfcHJvcHNcblxuICBnZXRNaW5EaW1Db3VudDogKHByb3Bfc2l6ZXMpID0+XG4gICAgbnVtX21lZXRfY3JpdGVyaWEgPSAwXG4gICAgdG90YWxfbWluX3NpemUgPSAwXG5cbiAgICBmb3IgcHMgaW4gcHJvcF9zaXplc1xuICAgICAgaWYgcHMuTkFNRSAhPSBcIkF2ZXJhZ2VcIiAmJiBwcy5NSU5fRElNID4gNSBcbiAgICAgICAgbnVtX21lZXRfY3JpdGVyaWErPTFcblxuICAgIHJldHVybiBudW1fbWVldF9jcml0ZXJpYVxuXG4gIGFkZENvbW1hczogKG51bV9zdHIpID0+XG4gICAgbnVtX3N0ciArPSAnJ1xuICAgIHggPSBudW1fc3RyLnNwbGl0KCcuJylcbiAgICB4MSA9IHhbMF1cbiAgICB4MiA9IGlmIHgubGVuZ3RoID4gMSB0aGVuICcuJyArIHhbMV0gZWxzZSAnJ1xuICAgIHJneCA9IC8oXFxkKykoXFxkezN9KS9cbiAgICB3aGlsZSByZ3gudGVzdCh4MSlcbiAgICAgIHgxID0geDEucmVwbGFjZShyZ3gsICckMScgKyAnLCcgKyAnJDInKVxuICAgIHJldHVybiB4MSArIHgyXG5cbm1vZHVsZS5leHBvcnRzID0gT3ZlcnZpZXdUYWIiLCJPdmVydmlld1RhYiA9IHJlcXVpcmUgJy4vb3ZlcnZpZXcuY29mZmVlJ1xuVXNlc1RhYiA9IHJlcXVpcmUgJy4vdXNlcy5jb2ZmZWUnXG5FbnZpcm9ubWVudFRhYiA9IHJlcXVpcmUgJy4vZW52aXJvbm1lbnQuY29mZmVlJ1xuRmlzaGluZ1RhYiA9IHJlcXVpcmUgJy4vZmlzaGluZy5jb2ZmZWUnXG5cbndpbmRvdy5hcHAucmVnaXN0ZXJSZXBvcnQgKHJlcG9ydCkgLT5cbiAgcmVwb3J0LnRhYnMgW092ZXJ2aWV3VGFiLCBFbnZpcm9ubWVudFRhYiwgRmlzaGluZ1RhYixVc2VzVGFiXVxuICAjIHBhdGggbXVzdCBiZSByZWxhdGl2ZSB0byBkaXN0L1xuICByZXBvcnQuc3R5bGVzaGVldHMgWycuL3JlcG9ydC5jc3MnXVxuIiwiUmVwb3J0VGFiID0gcmVxdWlyZSAncmVwb3J0VGFiJ1xudGVtcGxhdGVzID0gcmVxdWlyZSAnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxuX3BhcnRpYWxzID0gcmVxdWlyZSAnLi4vbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cbmlkcyA9IHJlcXVpcmUgJy4vaWRzLmNvZmZlZSdcbmZvciBrZXksIHZhbHVlIG9mIGlkc1xuICB3aW5kb3dba2V5XSA9IHZhbHVlXG5cblxuY2xhc3MgVXNlc1RhYiBleHRlbmRzIFJlcG9ydFRhYlxuICAjIHRoaXMgaXMgdGhlIG5hbWUgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgVGFiXG4gIG5hbWU6ICdPdGhlcidcbiAgY2xhc3NOYW1lOiAndXNlcydcbiAgdGltZW91dDogMTIwMDAwXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZXMudXNlc1xuICBkZXBlbmRlbmNpZXM6IFtcbiAgICAnT3ZlcmxhcFdpdGhSZWNyZWF0aW9uYWxVc2VzJ1xuICAgICdTcGVjaWVzSW5mb3JtYXRpb24nXG4gICAgJ0FkamFjZW50VGVycmVzdHJpYWwnXG4gIF1cblxuXG4gIHJlbmRlcjogKCkgLT5cblxuXG4gICAgI3Nob3cgdGFibGVzIGluc3RlYWQgb2YgZ3JhcGggZm9yIElFXG4gICAgaWYgd2luZG93LmQzXG4gICAgICBkM0lzUHJlc2VudCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBkM0lzUHJlc2VudCA9IGZhbHNlXG4gICAgXG4gICAgc2NpZCA9IEBza2V0Y2hDbGFzcy5pZFxuICAgIGlmIHNjaWQgPT0gR0VORVJJQ19JRCBvciBzY2lkID09IEdFTkVSSUNfQ09MTEVDVElPTl9JRFxuICAgICAgaXNHZW5lcmljID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGlzR2VuZXJpYyA9IGZhbHNlXG4gICAgaXNNUEEgPSAoc2NpZCA9PSBNUEFfSUQgb3Igc2NpZCA9PSBNUEFfQ09MTEVDVElPTl9JRCBvciBzY2lkID09IE1QQV9DT05GSURfQ09MTEVDVElPTl9JRClcbiAgICAjc3BlY2llcyBpbmZvXG4gICAgdHJ5XG4gICAgICBzZWFiaXJkcyA9IEByZWNvcmRTZXQoJ1NwZWNpZXNJbmZvcm1hdGlvbicsICdTZWFiaXJkcycpLnRvQXJyYXkoKVxuICAgICAgaGFzU2VhYmlyZEFyZWFzID0gc2VhYmlyZHM/Lmxlbmd0aCA+IDBcbiAgICBjYXRjaCBFcnJvclxuICAgICAgaGFzU2VhYmlyZEFyZWFzID0gZmFsc2VcblxuICAgIHRyeVxuICAgICAgc2VhYmlyZF9jb2xvbmllcyA9IEByZWNvcmRTZXQoJ1NwZWNpZXNJbmZvcm1hdGlvbicsICdTZWFiaXJkQ29sb25pZXMnKS50b0FycmF5KClcbiAgICAgIGhhc1NlYWJpcmRDb2xvbmllcyA9IHNlYWJpcmRfY29sb25pZXM/Lmxlbmd0aCA+IDBcbiAgICBjYXRjaCBFcnJvclxuICAgICAgaGFzU2VhYmlyZENvbG9uaWVzID0gZmFsc2VcblxuICAgIFxuICAgIGhhc1NlYWJpcmRzID0gKHNlYWJpcmRzPy5sZW5ndGg+IDAgb3Igc2VhYmlyZF9jb2xvbmllcz8ubGVuZ3RoID4gMClcbiAgICBtYW1tYWxzID0gQHJlY29yZFNldCgnU3BlY2llc0luZm9ybWF0aW9uJywgJ01hbW1hbHMnKS50b0FycmF5KClcbiAgICBoYXNNYW1tYWxzID0gbWFtbWFscz8ubGVuZ3RoID4gMFxuICAgIHRyeVxuICAgICAgc2VhbHMgPSBAcmVjb3JkU2V0KCdTcGVjaWVzSW5mb3JtYXRpb24nLCAnU2VhbHMnKS50b0FycmF5KClcbiAgICAgIGhhc1NlYWxzID0gc2VhbHM/Lmxlbmd0aCA+IDBcbiAgICBjYXRjaCBFcnJvclxuICAgICAgaGFzU2VhbHMgPSBmYWxzZVxuXG4gICAgXG4gICAgcmVlZl9maXNoID0gQHJlY29yZFNldCgnU3BlY2llc0luZm9ybWF0aW9uJywgJ1JlZWZGaXNoJykudG9BcnJheSgpXG4gICAgaW5IaWdoRGl2ZXJzaXR5UmVlZkZpc2hBcmVhID0gcmVlZl9maXNoPy5sZW5ndGggPiAwXG5cbiAgICBzbWFybyA9IFwiU01BUk9cIlxuICAgIHJlY191c2VzID0gQHJlY29yZFNldCgnT3ZlcmxhcFdpdGhSZWNyZWF0aW9uYWxVc2VzJywgJ1JlY3JlYXRpb25hbFVzZScpLnRvQXJyYXkoKVxuICAgIGhhc1NtYXJvID0gZmFsc2VcblxuXG4gICAgbm9uX3NtYXJvX3JlY191c2VzID0gcmVjX3VzZXMuZmlsdGVyIChyZWMpIC0+IHJlYy5GRUFUX1RZUEUgIT0gc21hcm9cbiAgICAjSnVuZSAyMDE5LCBkaXNhYmxlIHJlYyB1c2VzXG4gICAgaGFzUmVjVXNlcyA9IGZhbHNlXG4gICAgXG4gICAgaGVyaXRhZ2UgPSBAcmVjb3JkU2V0KCdPdmVybGFwV2l0aFJlY3JlYXRpb25hbFVzZXMnLCAnSGVyaXRhZ2UnKS50b0FycmF5KClcbiAgICBoYXNIZXJpdGFnZSA9IGhlcml0YWdlPy5sZW5ndGggPiAwXG4gICAgY29hc3RhbF9jb25zZW50cyA9IEByZWNvcmRTZXQoJ092ZXJsYXBXaXRoUmVjcmVhdGlvbmFsVXNlcycsICdDb2FzdGFsQ29uc2VudHMnKS50b0FycmF5KClcbiAgICBoYXNDb2FzdGFsID0gY29hc3RhbF9jb25zZW50cz8ubGVuZ3RoID4gMFxuICAgIGluZnJhc3RydWN0dXJlID0gIEByZWNvcmRTZXQoJ092ZXJsYXBXaXRoUmVjcmVhdGlvbmFsVXNlcycsICdJbmZyYXN0cnVjdHVyZScpLnRvQXJyYXkoKVxuICAgIGhhc0luZnJhc3RydWN0dXJlID0gaW5mcmFzdHJ1Y3R1cmU/Lmxlbmd0aCA+IDBcbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgIFxuICAgIGhhc1VzZXMgPSBoYXNSZWNVc2VzIG9yIGhhc0hlcml0YWdlIG9yIGhhc0luZnJhc3RydWN0dXJlIG9yIGhhc0NvYXN0YWxcbiAgICBoYXNNYXJpbmVTcGVjaWVzID0gZmFsc2VcblxuICAgICNhZGphY2VudCB0ZXJyZXN0cmlhbFxuICAgIHByb3RlY3RlZF9hcmVhcyA9IEByZWNvcmRTZXQoJ0FkamFjZW50VGVycmVzdHJpYWwnLCAnUHVibGljQ29uc2VydmF0aW9uTGFuZCcpLnRvQXJyYXkoKVxuICAgIGhhc1Byb3RlY3RlZCA9IHByb3RlY3RlZF9hcmVhcz8ubGVuZ3RoID4gMFxuXG4gICAgcWUyX2NvdmVuYW50cyA9IEByZWNvcmRTZXQoJ0FkamFjZW50VGVycmVzdHJpYWwnLCAnQ29hc3RhbFByb3RlY3Rpb24nKS50b0FycmF5KClcbiAgICBoYXNRRTJjb3ZlbmFudHMgPSBxZTJfY292ZW5hbnRzPy5sZW5ndGggPiAwXG5cbiAgICBuYXBhbGlzX2NvdmVuYW50cyA9IEByZWNvcmRTZXQoJ0FkamFjZW50VGVycmVzdHJpYWwnLCAnQWRqYWNlbnRMYW5kQ292ZXInKS50b0FycmF5KClcbiAgICBoYXNOYXBhbGlzQ292ZW5hbnRzID0gbmFwYWxpc19jb3ZlbmFudHM/Lmxlbmd0aCA+IDBcblxuICAgIGhhc0NvdmVuYW50cyA9IChoYXNRRTJjb3ZlbmFudHMgb3IgaGFzTmFwYWxpc0NvdmVuYW50cylcblxuICAgIGlmIGlzR2VuZXJpYyBvciAoIWlzQ29sbGVjdGlvbiBhbmQgaXNNUEEpXG4gICAgICBzaG93QWRqYWNlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgc2hvd0FkamFjZW50ID0gZmFsc2VcbiAgICBcblxuICAgIGlzQ29sbGVjdGlvbiA9IEBtb2RlbC5pc0NvbGxlY3Rpb24oKVxuICAgIGNvbnRleHQgPVxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcbiAgICAgIHJlY191c2VzOiBub25fc21hcm9fcmVjX3VzZXNcbiAgICAgIGhhc1NtYXJvOiBoYXNTbWFyb1xuICAgICAgaGFzUmVjVXNlczogaGFzUmVjVXNlc1xuICAgICAgaGVyaXRhZ2U6IGhlcml0YWdlXG4gICAgICBoYXNIZXJpdGFnZTogaGFzSGVyaXRhZ2VcbiAgICAgIGNvYXN0YWxfY29uc2VudHM6IGNvYXN0YWxfY29uc2VudHNcbiAgICAgIGhhc0NvYXN0YWw6IGhhc0NvYXN0YWxcbiAgICAgIGluZnJhc3RydWN0dXJlOiBpbmZyYXN0cnVjdHVyZVxuICAgICAgaGFzSW5mcmFzdHJ1Y3R1cmU6IGhhc0luZnJhc3RydWN0dXJlXG4gICAgICBoYXNVc2VzOiBoYXNVc2VzXG4gICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuXG4gICAgICAjc3BlY2llcyBpbmZvXG4gICAgICBzZWFiaXJkczogc2VhYmlyZHNcbiAgICAgIHNlYWJpcmRfY29sb25pZXM6IHNlYWJpcmRfY29sb25pZXNcbiAgICAgIGhhc1NlYWJpcmRzOiBoYXNTZWFiaXJkc1xuICAgICAgaGFzU2VhYmlyZEFyZWFzOiBoYXNTZWFiaXJkQXJlYXNcbiAgICAgIGhhc1NlYWJpcmRDb2xvbmllczogaGFzU2VhYmlyZENvbG9uaWVzXG4gICAgICBcbiAgICAgIG1hbW1hbHM6IG1hbW1hbHNcbiAgICAgIGhhc01hbW1hbHM6IGhhc01hbW1hbHNcbiAgICAgIHJlZWZfZmlzaDogcmVlZl9maXNoXG4gICAgICBzZWFsczogc2VhbHNcbiAgICAgIGhhc1NlYWxzOiBoYXNTZWFsc1xuXG4gICAgICBpbkhpZ2hEaXZlcnNpdHlSZWVmRmlzaEFyZWE6IGluSGlnaERpdmVyc2l0eVJlZWZGaXNoQXJlYVxuICAgICAgaGFzTWFyaW5lU3BlY2llczogaGFzTWFyaW5lU3BlY2llc1xuICAgICAgXG4gICAgICBwcm90ZWN0ZWRfYXJlYXM6IHByb3RlY3RlZF9hcmVhc1xuICAgICAgaGFzUHJvdGVjdGVkOiBoYXNQcm90ZWN0ZWRcblxuICAgICAgcWUyX2NvdmVuYW50czogcWUyX2NvdmVuYW50c1xuICAgICAgaGFzUUUyY292ZW5hbnRzOiBoYXNRRTJjb3ZlbmFudHNcblxuICAgICAgbmFwYWxpc19jb3ZlbmFudHM6IG5hcGFsaXNfY292ZW5hbnRzXG4gICAgICBoYXNOYXBhbGlzQ292ZW5hbnRzOiBoYXNOYXBhbGlzQ292ZW5hbnRzXG5cbiAgICAgIGhhc0NvdmVuYW50czogaGFzQ292ZW5hbnRzXG4gICAgICBzaG93QWRqYWNlbnQ6IHNob3dBZGphY2VudFxuXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgcGFydGlhbHMpXG4gICAgQGVuYWJsZUxheWVyVG9nZ2xlcnMoKVxuXG4gICAgXG5cbm1vZHVsZS5leHBvcnRzID0gVXNlc1RhYiIsInRoaXNbXCJUZW1wbGF0ZXNcIl0gPSB0aGlzW1wiVGVtcGxhdGVzXCJdIHx8IHt9O1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcImRlbW9cIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+UmVwb3J0IFNlY3Rpb25zPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwPlVzZSByZXBvcnQgc2VjdGlvbnMgdG8gZ3JvdXAgaW5mb3JtYXRpb24gaW50byBtZWFuaW5nZnVsIGNhdGVnb3JpZXM8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5EMyBWaXN1YWxpemF0aW9uczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8dWwgY2xhc3M9XFxcIm5hdiBuYXYtcGlsbHNcXFwiIGlkPVxcXCJ0YWJzMlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxsaSBjbGFzcz1cXFwiYWN0aXZlXFxcIj48YSBocmVmPVxcXCIjY2hhcnRcXFwiPkNoYXJ0PC9hPjwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxsaT48YSBocmVmPVxcXCIjZGF0YVRhYmxlXFxcIj5UYWJsZTwvYT48L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC91bD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInRhYi1jb250ZW50XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwidGFiLXBhbmUgYWN0aXZlXFxcIiBpZD1cXFwiY2hhcnRcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwhLS1baWYgSUUgOF0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcInVuc3VwcG9ydGVkXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICBUaGlzIHZpc3VhbGl6YXRpb24gaXMgbm90IGNvbXBhdGlibGUgd2l0aCBJbnRlcm5ldCBFeHBsb3JlciA4LiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICBQbGVhc2UgdXBncmFkZSB5b3VyIGJyb3dzZXIsIG9yIHZpZXcgcmVzdWx0cyBpbiB0aGUgdGFibGUgdGFiLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD4gICAgICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8IVtlbmRpZl0tLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIFNlZSA8Y29kZT5zcmMvc2NyaXB0cy9kZW1vLmNvZmZlZTwvY29kZT4gZm9yIGFuIGV4YW1wbGUgb2YgaG93IHRvIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgdXNlIGQzLmpzIHRvIHJlbmRlciB2aXN1YWxpemF0aW9ucy4gUHJvdmlkZSBhIHRhYmxlLWJhc2VkIHZpZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIGFuZCB1c2UgY29uZGl0aW9uYWwgY29tbWVudHMgdG8gcHJvdmlkZSBhIGZhbGxiYWNrIGZvciBJRTggdXNlcnMuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8YnI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8YSBocmVmPVxcXCJodHRwOi8vdHdpdHRlci5naXRodWIuaW8vYm9vdHN0cmFwLzIuMy4yL1xcXCI+Qm9vdHN0cmFwIDIueDwvYT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIGlzIGxvYWRlZCB3aXRoaW4gU2VhU2tldGNoIHNvIHlvdSBjYW4gdXNlIGl0IHRvIGNyZWF0ZSB0YWJzIGFuZCBvdGhlciBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIGludGVyZmFjZSBjb21wb25lbnRzLiBqUXVlcnkgYW5kIHVuZGVyc2NvcmUgYXJlIGFsc28gYXZhaWxhYmxlLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInRhYi1wYW5lXFxcIiBpZD1cXFwiZGF0YVRhYmxlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+aW5kZXg8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD52YWx1ZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJjaGFydERhdGFcIixjLHAsMSksYyxwLDAsMTM1MSwxNDE4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgPHRyPjx0ZD5cIik7Xy5iKF8udihfLmYoXCJpbmRleFwiLGMscCwwKSkpO18uYihcIjwvdGQ+PHRkPlwiKTtfLmIoXy52KF8uZihcInZhbHVlXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD48L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIGVtcGhhc2lzXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5FbXBoYXNpczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cD5HaXZlIHJlcG9ydCBzZWN0aW9ucyBhbiA8Y29kZT5lbXBoYXNpczwvY29kZT4gY2xhc3MgdG8gaGlnaGxpZ2h0IGltcG9ydGFudCBpbmZvcm1hdGlvbi48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHdhcm5pbmdcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0Pldhcm5pbmc8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHA+T3IgPGNvZGU+d2FybjwvY29kZT4gb2YgcG90ZW50aWFsIHByb2JsZW1zLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gZGFuZ2VyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5EYW5nZXI8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHA+PGNvZGU+ZGFuZ2VyPC9jb2RlPiBjYW4gYWxzbyBiZSB1c2VkLi4uIHNwYXJpbmdseS48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcImVudmlyb25tZW50XCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO2lmKF8ucyhfLmQoXCJza2V0Y2hDbGFzcy5kZWxldGVkXCIsYyxwLDEpLGMscCwwLDI0LDI3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtd2FyblxcXCIgc3R5bGU9XFxcIm1hcmdpbi1ib3R0b206MTBweDtcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgVGhpcyBza2V0Y2ggd2FzIGNyZWF0ZWQgdXNpbmcgdGhlIFxcXCJcIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiB0ZW1wbGF0ZSwgd2hpY2ggaXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIG5vIGxvbmdlciBhdmFpbGFibGUuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIGNvcHkgdGhpcyBza2V0Y2ggb3IgbWFrZSBuZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIHNrZXRjaGVzIG9mIHRoaXMgdHlwZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+SGFiaXRhdHMgUHJlc2VudCBpbiBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzODIsMzkyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJDb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiU2tldGNoXCIpO307Xy5iKFwiIDxhIGhyZWY9XFxcIiNcXFwiIGRhdGEtdG9nZ2xlLW5vZGU9XFxcIjU1MzZkYmI0OGM1YjQzZWIwZmFjYmM1YVxcXCIgZGF0YS12aXNpYmxlPVxcXCJmYWxzZVxcXCI+c2hvdyBsYXllcjwvYT48L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIEFyZWEgKCUpIHJlZmVycyB0byB0aGUgcGVyY2VudGFnZSBvZiB0aGUgaGFiaXRhdCBjb250YWluZWQgd2l0aGluIHRoZSBcIik7aWYoXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMCw2NTcsNjY3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwibmV0d29ya1wiKTt9O18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8IS0tSnVuZSAyMDE5IHJlbW92ZWQ6IFwiKTtpZighXy5zKF8uZihcImlzQ29uZmlkXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwi4oCYUGF0Y2ggc2l6ZeKAmSBmb3Igc3VidGlkYWwgaGFiaXRhdHMgcmVmZXJzIHRvIHRoZSB3aWR0aCBvZiB0aGUgbGFyZ2VzdCBwYXRjaCBpbmNsdWRlZCBpbiBhIFR5cGUtMSBNUEEuIEZvciBpbnRlcnRpZGFsIGhhYml0YXRzIHRoaXMgcmVmZXJzIHRvIHRoZSBtYXhpbXVtIGxlbmd0aC4gLS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBcIik7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgYXMgYSBwcm9wb3J0aW9uIG9mIHRoZSB0b3RhbCBhcmVhIG9mIGhhYml0YXQgd2l0aGluIHRoZSBTb3V0aC1FYXN0IE1hcmluZSByZWdpb24uIFdoZXRoZXIgYSBoYWJpdGF0IGlzIGNvbnNpZGVyZWQg4oCYUmVwcmVzZW50YXRpdmXigJkgdW5kZXIgdGhlIFBvbGljeSB3aWxsIG5lZWQgdG8gYmUgYXNzZXNzZWQgb24gYSBjYXNlIGJ5IGNhc2UgYmFzaXMsIHRha2luZyBpbnRvIGFjY291bnQgc3VjaCB0aGluZ3MgYXMgaW5kaXZpZHVhbCBwYXRjaCBzaXplIGFuZCBwcm9wb3J0aW9uIG9mIGhhYml0YXQuIOKAmVJlcGxpY2F0ZXPigJkgcmVmZXJzIHRvIHRoZXJlIGJlaW5nIDIgZXhhbXBsZXMgb2YgdGhlIGhhYml0YXQgdHlwZSBpbmNsdWRlZCBpbiBhdCBsZWFzdCB0d28gVHlwZS0yIE1QQS5cIik7fTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbmZpZFwiLGMscCwxKSxjLHAsMCwxMzk0LDE4NjYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkFyZWEgKCUpIHJlZmVycyB0byB0aGUgcGVyY2VudGFnZSBvZiB0aGUgaGFiaXRhdCBjb250YWluZWQgd2l0aGluIHRoZSBuZXR3b3JrIGFzIGEgcHJvcG9ydGlvbiBvZiB0aGUgdG90YWwgYXJlYSBvZiBoYWJpdGF0IHdpdGhpbiB0aGUgU291dGgtRWFzdCBNYXJpbmUgcmVnaW9uLiBBIGhhYml0YXQtdHlwZSBsaXN0ZWQgYXMg4oCdSW5jbHVkZWTigJ0gZG9lcyBub3QgbmVjZXNzYXJpbHkgbWVhbiB0aGF0IGl0IG1lZXRzIHRoZSByZXF1aXJlbWVudCBvZiBiZWluZyB2aWFibGUgYW5kIHRoZXJlZm9yZSByZXByZXNlbnRhdGl2ZSBvZiB0aGF0IGhhYml0YXQgdHlwZSBpbiB0aGUgbmV0d29yay4gVGhpcyB3aWxsIG5lZWQgdG8gYmUgYXNzZXNzZWQgb24gYSBjYXNlIGJ5IGNhc2UgYmFzaXMsIHRha2luZyBpbnRvIGFjY291bnQgc3VjaCB0aGluZ3MgYXMgaW5kaXZpZHVhbCBwYXRjaCBzaXplIGFuZCBwcm9wb3J0aW9uIG9mIGhhYml0YXQuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9pPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHAgY2xhc3M9XFxcImluLXJlcG9ydC1oZWFkZXJcXFwiPkNvYXN0YWwgSGFiaXRhdCBUeXBlczwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDAsMTk4MSwyOTM1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMjJcXFwiIGNsYXNzPVxcXCJjb2FzdGFsX2hhYl90YWJsZVxcXCI+IFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoIGNsYXNzPVxcXCJzb3J0aW5nX2NvbFxcXCIgc3R5bGU9XFxcIndpZHRoOjE1MHB4O1xcXCI+PGEgY2xhc3M9XFxcImNvYXN0YWxfaGFiX3R5cGUgc29ydF91cFxcXCIgaHJlZj1cXFwiI1xcXCI+SGFiaXRhdDwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPjxhICBjbGFzcz1cXFwiY29hc3RhbF9oYWJfbmV3X2FyZWEgc29ydF9kb3duXFxcIiBocmVmPVxcXCIjXFxcIiA+QXJlYSAoa208c3VwPjI8L3N1cD4pPC9hPjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcImNvYXN0YWxfaGFiX25ld19wZXJjIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCI+QXJlYSAoJSk8L2E+PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsMjQxMSwyODEzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgXCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwyNDYyLDI3ODEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICAgIDwhLS08dGg+PGEgY2xhc3M9XFxcImNvYXN0YWxfaGFiX3JlcHJlc2VudCBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiID5cIik7Xy5iKF8udihfLmYoXCJSRVBfTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGg+LS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJjb2FzdGFsX2hhYl9yZXBsaWNhdGUgc29ydF9kb3duXFxcIiBocmVmPVxcXCIjXFxcIj5SZXBsaWNhdGVzPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcImNvYXN0YWxfaGFiX2Nvbm5lY3RlZCBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiPkNvbm5lY3Rpdml0eSAoaW4ga20pPHN1cD4qPC9zdXA+PC90aD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgPHRib2R5IGNsYXNzPVxcXCJjb2FzdGFsX2hhYl92YWx1ZXNcXFwiPjwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MTgwcHg7XFxcIj5IYWJpdGF0PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5BcmVhIChrbTxzdXA+Mjwvc3VwPik8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPkFyZWEgKCUpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIFwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCwzMjExLDM0NTEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDMyNjIsMzQxOSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgICAgPCEtLTx0aD5QYXRjaCBTaXplIChUeXBlLTEpPC90aD4tLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGg+UmVwbGljYXRlczwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRoPkNvbm5lY3Rpdml0eSAoaW4ga20pPC90aD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc0NvYXN0YWxIYWJUeXBlc1wiLGMscCwxKSxjLHAsMCwzNTY2LDM5OTQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJjb2FzdGFsX2hhYl90eXBlc1wiLGMscCwxKSxjLHAsMCwzNjAzLDM5NTksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiSEFCX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiU0laRV9TUUtNXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlBFUkNcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCwzNzYwLDM5MTQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICAgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMzgxNCwzODgwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgPCEtLTx0ZD5cIik7Xy5iKF8udihfLmYoXCJSRVBSRVNFTlRcIixjLHAsMCkpKTtfLmIoXCI8L3RkPi0tPjx0ZD5cIik7Xy5iKF8udihfLmYoXCJSRVBMSUNcIixjLHAsMCkpKTtfLmIoXCI8L3RkPjx0ZD5cIik7Xy5iKF8udihfLmYoXCJDT05OXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzQ29hc3RhbEhhYlR5cGVzXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZCBjb2xzcGFuPVxcXCJcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw0MTE5LDQxMjAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjVcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCI0XCIpO307Xy5iKFwiXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8aT5UaGVyZSBhcmUgbm8gY29hc3RhbCBoYWJpdGF0IHR5cGVzLjwvaT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9O18uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHAgY2xhc3M9XFxcImluLXJlcG9ydC1oZWFkZXJcXFwiPkVzdHVhcmluZSBIYWJpdGF0IFR5cGVzPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJkM0lzUHJlc2VudFwiLGMscCwxKSxjLHAsMCw0NDU0LDU0MzMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIyMFxcXCIgY2xhc3M9XFxcImVzdHVhcmluZV9oYWJfdGFibGVcXFwiPiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aCBjbGFzcz1cXFwic29ydGluZ19jb2xcXFwiIHN0eWxlPVxcXCJ3aWR0aDoxNTBweDtcXFwiPjxhIGNsYXNzPVxcXCJlc3R1YXJpbmVfaGFiX3R5cGUgc29ydF91cFxcXCIgaHJlZj1cXFwiI1xcXCI+SGFiaXRhdDwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPjxhICBjbGFzcz1cXFwiZXN0dWFyaW5lX2hhYl9uZXdfYXJlYSBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiID5BcmVhIChrbTxzdXA+Mjwvc3VwPik8L2E+PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD48YSBjbGFzcz1cXFwiZXN0dWFyaW5lX2hhYl9uZXdfcGVyYyBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiPkFyZWEgKCUpPC9hPjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDQ4OTIsNTMwOSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgIFwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNDk0Myw1Mjc3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgICA8IS0tPHRoPjxhIGNsYXNzPVxcXCJlc3R1YXJpbmVfaGFiX3JlcHJlc2VudCBzb3J0X2Rvd25cXFwiIHN0eWxlPVxcXCJ3aWR0aDo4MHB4O1xcXCIgaHJlZj1cXFwiI1xcXCIgPlwiKTtfLmIoXy52KF8uZihcIlJFUF9OQU1FXCIsYyxwLDApKSk7Xy5iKFwiPC90aD4tLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcImVzdHVhcmluZV9oYWJfcmVwbGljYXRlIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCIgPlJlcGxpY2F0ZXM8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aD48YSBjbGFzcz1cXFwiZXN0dWFyaW5lX2hhYl9jb25uZWN0ZWQgc29ydF9kb3duXFxcIiBocmVmPVxcXCIjXFxcIj5Db25uZWN0aXZpdHkgKGluIGttKTwvdGg+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgIDx0Ym9keSBjbGFzcz1cXFwiZXN0dWFyaW5lX2hhYl92YWx1ZXNcXFwiPjwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MTUwcHg7XFxcIj5IYWJpdGF0PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5BcmVhIChrbTxzdXA+Mjwvc3VwPik8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPkFyZWEgKCUpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIFwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw1NzA5LDU5MzIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNTc0Myw1OTAwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgICA8IS0tPHRoPlBhdGNoIFNpemUgKFR5cGUtMSk8L3RoPi0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aD5SZXBsaWNhdGVzPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGg+Q29ubmVjdGl2aXR5IChpbiBrbSk8L3RoPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc0VzdHVhcmluZUhhYlR5cGVzXCIsYyxwLDEpLGMscCwwLDYwNTAsNjQ4MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImVzdHVhcmluZV9oYWJfdHlwZXNcIixjLHAsMSksYyxwLDAsNjA4OSw2NDQ1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkhBQl9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlNJWkVfU1FLTVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJQRVJDXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsNjI0Niw2NDAwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw2MzAxLDYzNjYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjwhLS08dGQ+XCIpO18uYihfLnYoXy5mKFwiUkVQUkVTRU5UXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD4tLT48dGQ+XCIpO18uYihfLnYoXy5mKFwiUkVQTElDXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD48dGQ+XCIpO18uYihfLnYoXy5mKFwiQ09OTlwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc0VzdHVhcmluZUhhYlR5cGVzXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZCBjb2xzcGFuPVxcXCJcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw2NjExLDY2MTIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjVcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCI0XCIpO307Xy5iKFwiXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8aT5UaGVyZSBhcmUgbm8gZXN0dWFyaW5lIGhhYml0YXQgdHlwZXMuPC9pPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCIgICAgPHAgY2xhc3M9XFxcImluLXJlcG9ydC1oZWFkZXJcXFwiPlNlbnNpdGl2ZSBNYXJpbmUgSGFiaXRhdHM8L3A+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwwLDY5NTEsNzg0MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIyMFxcXCIgY2xhc3M9XFxcInNpZ19oYWJfdGFibGVcXFwiPiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aCBjbGFzcz1cXFwic29ydGluZ19jb2xcXFwiIHN0eWxlPVxcXCJ3aWR0aDoxNTBweDtcXFwiPjxhIGNsYXNzPVxcXCJzaWdfaGFiX3R5cGUgc29ydF9kb3duXFxcIiBocmVmPVxcXCIjXFxcIj5IYWJpdGF0PC9hPjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPjxhICBjbGFzcz1cXFwic2lnX2hhYl9uZXdfYXJlYSBzb3J0X3VwXFxcIiBocmVmPVxcXCIjXFxcIiA+QXJlYSAoa208c3VwPjI8L3N1cD4pPC9hPjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJzaWdfaGFiX25ld19wZXJjIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCI+QXJlYSAoJSk8L2E+PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsNzM1MSw3NzM1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIFwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNzM5OCw3NzA1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgPCEtLTx0aD48YSBjbGFzcz1cXFwic2lnX2hhYl9yZXByZXNlbnQgc29ydF9kb3duXFxcIiBzdHlsZT1cXFwid2lkdGg6ODBweDtcXFwiIGhyZWY9XFxcIiNcXFwiPlwiKTtfLmIoXy52KF8uZihcIlJFUF9OQU1FXCIsYyxwLDApKSk7Xy5iKFwiPC90aD4tLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJzaWdfaGFiX3JlcGxpY2F0ZSBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiPlJlcGxpY2F0ZXM8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcInNpZ19oYWJfY29ubmVjdGVkIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCI+Q29ubmVjdGl2aXR5IChpbiBrbSkgPC90aD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgPHRib2R5IGNsYXNzPVxcXCJzaWdfaGFiX3ZhbHVlc1xcXCI+PC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjE3NXB4O1xcXCI+SGFiaXRhdDwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPkFyZWEgKGttPHN1cD4yPC9zdXA+KTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPkFyZWEgKCUpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsODEwMyw4MzM0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgXCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw4MTU0LDgzMDIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICAgIDwhLS08dGg+UGF0Y2ggU2l6ZTwvdGg+LS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRoPlJlcGxpY2F0ZXM8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aD5Db25uZWN0aXZpdHkgKGluIGttKTwvdGg+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNTaWdIYWJzXCIsYyxwLDEpLGMscCwwLDg0MjgsODgwOCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcInNpZ19oYWJzXCIsYyxwLDEpLGMscCwwLDg0NTIsODc4NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkhBQl9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJTSVpFX1NRS01cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlBFUkNcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw4NTk5LDg3NDcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsODY1MCw4NzE1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8IS0tPHRkPlwiKTtfLmIoXy52KF8uZihcIlJFUFJFU0VOVFwiLGMscCwwKSkpO18uYihcIjwvdGQ+LS0+PHRkPlwiKTtfLmIoXy52KF8uZihcIlJFUExJQ1wiLGMscCwwKSkpO18uYihcIjwvdGQ+PHRkPlwiKTtfLmIoXy52KF8uZihcIkNPTk5cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzU2lnSGFic1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQgY29sc3Bhbj1cXFwiXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsODkwNyw4OTA4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI1XCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiNFwiKTt9O18uYihcIlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDxpPlRoZXJlIGFyZSBubyBoYWJpdGF0cyBvZiBzaWduaWZpY2FuY2UuPC9pPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgIDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxlbT5TZW5zaXRpdmUgaGFiaXRhdHMgYXJlIGRlZmluZWQgaW4gdGhlIHJlcG9ydCAnPGEgaHJlZj1cXFwiaHR0cHM6Ly93d3cubWZlLmdvdnQubnovc2l0ZXMvZGVmYXVsdC9maWxlcy9zZW5zaXRpdmUtbWFyaW5lLWJlbnRoaWMtaGFiaXRhdHMtZGVmaW5lZC5wZGZcXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj5TZW5zaXRpdmUgbWFyaW5lIGJlbnRoaWMgaGFiaXRhdHMgZGVmaW5lZDwvYT4uJzwvZW0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJmaXNoaW5nXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO2lmKF8ucyhfLmQoXCJza2V0Y2hDbGFzcy5kZWxldGVkXCIsYyxwLDEpLGMscCwwLDI0LDI3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtd2FyblxcXCIgc3R5bGU9XFxcIm1hcmdpbi1ib3R0b206MTBweDtcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgVGhpcyBza2V0Y2ggd2FzIGNyZWF0ZWQgdXNpbmcgdGhlIFxcXCJcIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiB0ZW1wbGF0ZSwgd2hpY2ggaXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIG5vIGxvbmdlciBhdmFpbGFibGUuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIGNvcHkgdGhpcyBza2V0Y2ggb3IgbWFrZSBuZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIHNrZXRjaGVzIG9mIHRoaXMgdHlwZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzQW55RmlzaGluZ1wiLGMscCwxKSxjLHAsMCwzMTcsMjUyNixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImhhc0V4aXN0aW5nRmlzaGluZ1wiLGMscCwxKSxjLHAsMCwzNDUsMTM4MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxoND5FeGlzdGluZyBGaXNoZXJpZXMgTWFuYWdlbWVudDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxwPjxlbT5UaGUgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNDc2LDQ4MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwibmV0d29ya1wiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlNrZXRjaFwiKTt9O18uYihcIiBpbmNsdWRlcyB0aGUgZm9sbG93aW5nIGV4aXN0aW5nIGZpc2hlcmllcyByZXN0cmljdGlvbnMuIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBBbHNvIHNob3duIGlzIHRoZSBleHRlbnQgdGhhdCB0aGUgZmlzaGVyaWVzIHJlc3RyaWN0aW9ucyBhcHBseSB0byB0aGUgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNjk1LDcwMyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwic2tldGNoZXNcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgXCIpO2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic2tldGNoXCIpO307Xy5iKFwiIGFzIGEgcGVyY2VudGFnZSBvZiB0b3RhbCBza2V0Y2ggYXJlYS4gRm9yIGV4YW1wbGUsIDEwMCUgbWVhbnMgbm8gZmlzaGluZyBvZiB0aGF0IHR5cGUgaXMgY3VycmVudGx5IGFsbG93ZWQgd2l0aGluIHRoZSBza2V0Y2guPC9lbT48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoyNTBweDtcXFwiPk5hbWU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGg+UGVyY2VudDwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJleGlzdGluZ19maXNoaW5nX2FyZWFzXCIsYyxwLDEpLGMscCwwLDExNjcsMTI5OSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJGRUFUX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiUEVSQ19BUkVBXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJoYXNDdXN0b21hcnlcIixjLHAsMSksYyxwLDAsMTQyNywyNTA3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxoND5DdXN0b21hcnkgQXJlYXM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNFeGlzdGluZ0N1c3RvbWFyeVwiLGMscCwxKSxjLHAsMCwxNTQzLDE5ODcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8cD4gVGhlIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDE1NzksMTU4NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwibmV0d29ya1wiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaFwiKTt9O18uYihcIiBpbmNsdWRlcyB0aGUgZm9sbG93aW5nIDxzdHJvbmc+ZXhpc3Rpbmc8L3N0cm9uZz4gQ3VzdG9tYXJ5IEFyZWFzOjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJleGlzdGluZ19jdXN0b21hcnlfZmlzaGluZ1wiLGMscCwxKSxjLHAsMCwxODE0LDE5MDcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImhhc1Byb3Bvc2VkQ3VzdG9tYXJ5XCIsYyxwLDEpLGMscCwwLDIwNDYsMjQ2NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDxwPiBUaGUgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMjA4MiwyMDg5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJuZXR3b3JrXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic2tldGNoXCIpO307Xy5iKFwiIGluY2x1ZGVzIHRoZSBmb2xsb3dpbmcgQ3VzdG9tYXJ5IEFyZWFzOjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJwcm9wb3NlZF9jdXN0b21hcnlfZmlzaGluZ1wiLGMscCwxKSxjLHAsMCwyMjkxLDIzODQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJoYXNBbnlGaXNoaW5nXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PkV4aXN0aW5nIG9yIEN1c3RvbWFyeSBBcmVhczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cD5ObyBpbmZvcm1hdGlvbiBvbiBleGlzdGluZyBmaXNoaW5nIGFyZWFzIG9yIGN1c3RvbWFyeSB1c2UgaXMgYXZhaWxhYmxlIGZvciB0aGlzIGFyZWEuPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9O18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29uZmlkZW50aWFsTVBBTmV0d29ya1wiLGMscCwxKSxjLHAsMCwyODA5LDUwNTUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+RmlzaGluZyBJbnRlbnNpdHk8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8ZW0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgWW91ciBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwyOTU1LDI5NjIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIm5ldHdvcmtcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgaW5jbHVkZXMgYXJlYXMgaWRlbnRpZmllZCBhcyBoYXZpbmcgaGlnaCwgbW9kZXJhdGUgb3IgbG93IGludGVuc2l0eSBmaXNoaW5nIGdyb3VuZHMgZm9yIHRoZSBmb2xsb3dpbmcgZmlzaGVyaWVzLiBUaGUgcGVyY2VudGFnZSBvZiB0aGUgcmVnaW9ucyBoaWdoLCBtb2RlcmF0ZSBhbmQgbG93IGludGVuc2l0eSBmaXNoaW5nIGdyb3VuZHMgY292ZXJlZCBieSB5b3VyIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDMyNDUsMzI1MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwibmV0d29ya1wiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaFwiKTt9O18uYihcIiBpcyBnaXZlbiBiZWxvdy4gRmlzaGVyeSBkaXNwbGFjZW1lbnQgc2hvd3MgdGhlIHBlcmNlbnRhZ2Ugb2YgdGhlIHJlZ2lvbnMgZmlzaGVyeSB0aGF0IHdvdWxkIGJlIGRpc3BsYWNlZCBieSB5b3VyIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDM0NDAsMzQ0NyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwibmV0d29ya1wiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaFwiKTt9O18uYihcIi5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L2VtPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwwLDM1NjUsNDMwMixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIyMFxcXCIgY2xhc3M9XFxcImZpc2hlcnlfdGFibGVcXFwiPiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cXFwic29ydGluZ19jb2xcXFwiIHN0eWxlPVxcXCJ3aWR0aDoxNTBweDtcXFwiPjxhIGNsYXNzPVxcXCJmaXNoZXJ5X3R5cGUgc29ydF91cFxcXCIgaHJlZj1cXFwiI1xcXCI+RmlzaGVyeTwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aD48YSBjbGFzcz1cXFwiZmlzaGVyeV9oaWdoIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCIgPkhpZ2ggKCUpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcImZpc2hlcnlfbW9kZXJhdGUgc29ydF9kb3duXFxcIiBocmVmPVxcXCIjXFxcIj5Nb2RlcmF0ZSAoJSk8L2E+PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcImZpc2hlcnlfbG93IHNvcnRfZG93blxcXCIgc3R5bGU9XFxcIndpZHRoOjgwcHg7XFxcIiBocmVmPVxcXCIjXFxcIiA+TG93ICglKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJmaXNoZXJ5X2Rpc3Agc29ydF9kb3duXFxcIiBzdHlsZT1cXFwid2lkdGg6ODBweDtcXFwiIGhyZWY9XFxcIiNcXFwiID5GaXNoZXJ5IGRpc3BsYWNlbWVudCAoJSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgPHRib2R5IGNsYXNzPVxcXCJmaXNoZXJ5X3ZhbHVlc1xcXCI+PC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoxMjVweDtcXFwiPkZpc2hlcnk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGg+SGlnaCAoJSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGg+TW9kZXJhdGUgKCUpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRoPkxvdyAoJSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGg+RmlzaGVyeSBkaXNwbGFjZW1lbnQgKCUpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImZpc2hlcnlfaW50ZW5zaXR5XCIsYyxwLDEpLGMscCwwLDQ3MjYsNDk1OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJGSVNIX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiSElHSFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJNT0RFUkFURVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJMT1dcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRElTUFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8IS0tXCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDUxMDEsNjk4MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PkZpc2hpbmcgSW50ZW5zaXR5PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgVGhlIGZvbGxvd2luZyB0YWJsZXMgY29udGFpbnMgdGhlIHBlcmNlbnQgb2YgdGhlIHRvdGFsIFNFTVBGIGxvdyBpbnRlbnNpdHkgYW5kIGhpZ2ggaW50ZW5zaXR5IGZpc2hpbmcgdGhhdCBtYXkgYmUgZGlzcGxhY2VkIGJ5IHRoZSBza2V0Y2guIDxzdHJvbmc+SGlnaCBpbnRlbnNpdHk8L3N0cm9uZz4gaXMgZ3JlYXRlciB0aGFuIGFuIGF2ZXJhZ2Ugb2YgNSBldmVudHMgcGVyIGFubnVtLCA8c3Ryb25nPkxvdzwvc3Ryb25nPiBpcyA1IG9yIGxlc3MgZXZlbnRzIHBlciBhbm51bS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImluLXJlcG9ydC1oZWFkZXJcXFwiPlRyYXdsIEZpc2hpbmcgSW50ZW5zaXR5PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPlNrZXRjaCBOYW1lPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+JSBMb3cgSW50ZW5zaXR5PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+JSBIaWdoIEludGVuc2l0eTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInRyYXdsXCIsYyxwLDEpLGMscCwwLDU3OTYsNTkyNyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkxPV1wiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkhJR0hcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwiaW4tcmVwb3J0LWhlYWRlclxcXCI+U2V0IE5ldCBGaXNoaW5nIEludGVuc2l0eTwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPlNrZXRjaCBOYW1lPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD4lIExvdyBJbnRlbnNpdHk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPiUgSGlnaCBJbnRlbnNpdHk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzZXRuZXRcIixjLHAsMSksYyxwLDAsNjI5Niw2NDM5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTE9XXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJISUdIXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJpbi1yZXBvcnQtaGVhZGVyXFxcIj5Mb25nIExpbmUgRmlzaGluZyBJbnRlbnNpdHk8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+U2tldGNoIE5hbWU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD4lIExvdyBJbnRlbnNpdHk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD4lIEhpZ2ggSW50ZW5zaXR5PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImxvbmdsaW5lXCIsYyxwLDEpLGMscCwwLDY3OTUsNjkyNixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkxPV1wiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkhJR0hcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiLS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJvdmVydmlld1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtpZihfLnMoXy5kKFwic2tldGNoQ2xhc3MuZGVsZXRlZFwiLGMscCwxKSxjLHAsMCwyNCwyNzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LXdhcm5cXFwiIHN0eWxlPVxcXCJtYXJnaW4tYm90dG9tOjEwcHg7XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFRoaXMgc2tldGNoIHdhcyBjcmVhdGVkIHVzaW5nIHRoZSBcXFwiXCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIlxcXCIgdGVtcGxhdGUsIHdoaWNoIGlzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBubyBsb25nZXIgYXZhaWxhYmxlLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byBjb3B5IHRoaXMgc2tldGNoIG9yIG1ha2UgbmV3XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBza2V0Y2hlcyBvZiB0aGlzIHR5cGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMzEzLDc0OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDMyNiw3MzcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHNpemVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxoND5NUEEgTmV0d29yazwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIFRoaXMgQ29sbGVjdGlvbiBoYXM6IDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibnVtX3Jlc2VydmVzXCIsYyxwLDApKSk7Xy5iKFwiIFR5cGUtMSBNUEFcIik7aWYoXy5zKF8uZihcInBsdXJhbF90eXBlMVwiLGMscCwxKSxjLHAsMCw0OTYsNDk3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJzXCIpO30pO2MucG9wKCk7fV8uYihcIiwgXCIpO18uYihfLnYoXy5mKFwibnVtX3R5cGUyXCIsYyxwLDApKSk7Xy5iKFwiIFR5cGUtMiBNUEFcIik7aWYoXy5zKF8uZihcInBsdXJhbF90eXBlMlwiLGMscCwxKSxjLHAsMCw1NTcsNTU4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJzXCIpO30pO2MucG9wKCk7fV8uYihcIiwgYW5kIFwiKTtfLmIoXy52KF8uZihcIm51bV9vdGhlclwiLGMscCwwKSkpO18uYihcIiBPdGhlciBNUEFcIik7aWYoXy5zKF8uZihcInBsdXJhbF9vdGhlclwiLGMscCwxKSxjLHAsMCw2MjEsNjIyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJzXCIpO30pO2MucG9wKCk7fV8uYihcIjwvc3Ryb25nPiAuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZW0+T25seSBUeXBlLTEgYW5kIFR5cGUtMiBNUEFzIGFyZSByZXBvcnRlZCBvbi48L2VtPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7aWYoXy5zKF8uZihcImFueUF0dHJpYnV0ZXNcIixjLHAsMSksYyxwLDAsODA3LDExMjUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGg0PlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihfLnJwKFwiYXR0cmlidXRlcy9hdHRyaWJ1dGVzVGFibGVcIixjLHAsXCIgICAgICAgIFwiKSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw5NDUsMTA3NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICA8dHI+PHRkPlwiKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsOTcyLDk4NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiTnVtYmVyIG9mIE1QQXNcIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMCwxMDEwLDEwMjgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIk51bWJlciBvZiBTa2V0Y2hlc1wiKTt9KTtjLnBvcCgpO31fLmIoXCI8L3RkPlwiKTtfLmIoXy52KF8uZihcIm51bVNrZXRjaGVzXCIsYyxwLDApKSk7Xy5iKFwiPHRkPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fTtpZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDExNzgsMTQ2NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxMjAwLDE0NDUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+TnVtYmVyIG9mIFNrZXRjaGVzIGluIENvbGxlY3Rpb248L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBUaGlzIGNvbGxlY3Rpb24gY29udGFpbnMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJudW1Ta2V0Y2hlc1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBza2V0Y2hcIik7aWYoXy5zKF8uZihcInBsdXJhbFNrZXRjaGVzXCIsYyxwLDEpLGMscCwwLDEzOTYsMTM5OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiZXNcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPCEtLVwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCwxNTAwLDM4MjIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMTUyMiwzODAyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBzaXplXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+Q29hc3RhbCBIYWJpdGF0cyBJbmNsdWRlZCBpbiBUeXBlLTEgTVBBXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXRvZ2dsZS1ub2RlPVxcXCI1NTM2ZGJiNDhjNWI0M2ViMGZhY2JjNWFcXFwiIGRhdGEtdmlzaWJsZT1cXFwiZmFsc2VcXFwiPnNob3cgbGF5ZXI8L2E+PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZighXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgPHN0cm9uZz5OdW1iZXIgb2YgSGFiaXRhdCBDbGFzc2VzPC9zdHJvbmc+PC9icj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBzdHlsZT1cXFwibWFyZ2luLXRvcDowcHg7XFxcIiBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgVGhlcmUgYXJlIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwidG90YWxfaGFic1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBoYWJpdGF0IGNsYXNzZXMgaW4gdGhlIHBsYW5uaW5nIHJlZ2lvbiwgYW5kIHlvdXIgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMTk1NiwxOTY2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic2tldGNoXCIpO307Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIGluY2x1ZGVzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibmV3X2hhYnNcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4uIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHRoZSBIYWJpdGF0IENsYXNzaWZpY2F0aW9uLCBzZWVcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmRvYy5nb3Z0Lm56L0RvY3VtZW50cy9jb25zZXJ2YXRpb24vbWFyaW5lLWFuZC1jb2FzdGFsL21hcmluZS1wcm90ZWN0ZWQtYXJlYXMvbXBhLWNsYXNzaWZpY2F0aW9uLXByb3RlY3Rpb24tc3RhbmRhcmQucGRmXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBNYXJpbmUgUHJvdGVjdGVkIEFyZWFzIENsYXNzaWZpY2F0aW9uIGFuZCBQcm90ZWN0aW9uIFN0YW5kYXJkPC9hPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIpO307aWYoXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwwLDI0MjgsMjYzMixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICA8ZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXByZXNlbnRlZF9oYWJzX3BpZVxcXCIgaWQ9XFxcInJlcHJlc2VudGVkX2hhYnNfcGllXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGRpdiBjbGFzcz1cXFwicmVwcmVzZW50ZWRfaGFic19waWVfbGVnZW5kXFxcIiBpZD1cXFwicmVwcmVzZW50ZWRfaGFic19waWVfbGVnZW5kXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHNpemVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxoND5Db2FzdGFsIEhhYml0YXRzIFJlcGxpY2F0ZWRcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxhIGhyZWY9XFxcIiNcXFwiIGRhdGEtdG9nZ2xlLW5vZGU9XFxcIjU1MzZkYmI0OGM1YjQzZWIwZmFjYmM1YVxcXCIgZGF0YS12aXNpYmxlPVxcXCJmYWxzZVxcXCI+c2hvdyBsYXllcjwvYT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKCFfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgIDxzdHJvbmc+TnVtYmVyIG9mIEhhYml0YXQgQ2xhc3Nlczwvc3Ryb25nPjwvYnI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cCBzdHlsZT1cXFwibWFyZ2luLXRvcDowcHg7XFxcIiBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBUaGVyZSBhcmUgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJ0b3RhbF9oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IGhhYml0YXQgY2xhc3NlcyBpbiB0aGUgcGxhbm5pbmcgcmVnaW9uLCBhbmQgeW91ciBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzMTAwLDMxMTAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBpbmNsdWRlcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm5ld19oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+LiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiB0aGUgSGFiaXRhdCBDbGFzc2lmaWNhdGlvbiwgc2VlXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmRvYy5nb3Z0Lm56L0RvY3VtZW50cy9jb25zZXJ2YXRpb24vbWFyaW5lLWFuZC1jb2FzdGFsL21hcmluZS1wcm90ZWN0ZWQtYXJlYXMvbXBhLWNsYXNzaWZpY2F0aW9uLXByb3RlY3Rpb24tc3RhbmRhcmQucGRmXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIE1hcmluZSBQcm90ZWN0ZWQgQXJlYXMgQ2xhc3NpZmljYXRpb24gYW5kIFByb3RlY3Rpb24gU3RhbmRhcmQ8L2E+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3A+XCIpO18uYihcIlxcblwiKTt9O2lmKF8ucyhfLmYoXCJkM0lzUHJlc2VudFwiLGMscCwxKSxjLHAsMCwzNTgwLDM3NzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxkaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBsaWNhdGVkX2hhYnNfcGllXFxcIiBpZD1cXFwicmVwbGljYXRlZF9oYWJzX3BpZVxcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBsaWNhdGVkX2hhYnNfcGllX2xlZ2VuZFxcXCIgaWQ9XFxcInJlcGxpY2F0ZWRfaGFic19waWVfbGVnZW5kXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIi0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMzg1NCw1MzIyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gc2l6ZSB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5cIik7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDM5MjMsMzkzMixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiTVBBIFNpemVzXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsMzk1NiwzOTY4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJTa2V0Y2ggU2l6ZXNcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPCEtLVwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw0MDExLDQzMzgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBPZiB0aGUgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJ0b3RhbF9tcGFfY291bnRcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gTVBBcyBpbiB0aGUgbmV0d29yaywgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJtcGFfY291bnRcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gbWVldFwiKTtpZighXy5zKF8uZihcInBsdXJhbF9tcGFfY291bnRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJzXCIpO307Xy5iKFwiIHRoZSBtaW5pbXVtIHNpemUgZGltZW5zaW9uIG9mIDVrbS4gVGhlIGF2ZXJhZ2UgbWluaW11bSBkaW1lbnNpb24gaXMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJtcGFfYXZnX3NpemVfZ3VpZGVsaW5lXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IHRoZSAxMC0yMGttIGd1aWRlbGluZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3A+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDQzNjcsNDQzNCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPHA+VGhlIHNpemUgb2YgdGhlIHNrZXRjaGVzIGluIHRoaXMgY29sbGVjdGlvbiBhcmU6PC9wPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgIC0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPlwiKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsNDU0NSw0NTUzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJNUEEgTmFtZVwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDQ1NzcsNDU4OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiU2tldGNoIE5hbWVcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+QXJlYSA8L2JyPihzcS4ga20uKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoxMDBweDtcXFwiPldpZHRoIChrbSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MTAwcHg7XFxcIj5Db2FzdGxpbmUgTGVuZ3RoIChrbSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwicHJvcF9zaXplc1wiLGMscCwxKSxjLHAsMCw0ODQwLDUwMzEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8dHIgY2xhc3M9XCIpO18uYihfLnYoXy5mKFwiQ1NTX0NMQVNTXCIsYyxwLDApKSk7Xy5iKFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJOQU1FXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiU0laRV9TUUtNXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTUlOX0RJTVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkNPQVNUXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIFRoaXMgY29tYmluZWQgYXJlYSB3aXRoaW4gdGhlIG5ldHdvcmsgYWNjb3VudHMgZm9yIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwiYXJlYV9wZXJjZW50XCIsYyxwLDApKSk7Xy5iKFwiJTwvc3Ryb25nPiBvZiB0aGUgU291dGgtRWFzdCBNYXJpbmUgYXJlYSwgYW5kIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwiY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50XCIsYyxwLDApKSk7Xy5iKFwiJTwvc3Ryb25nPiBvZiB0aGUgU291dGgtRWFzdCBjb2FzdGxpbmUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsNTM3MCw2MjY1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBzaXplIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+TVBBIFNpemU8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+TVBBIE5hbWU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPkFyZWEgPC9icj4oc3EuIGttLik8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoxMDBweDtcXFwiPldpZHRoIChrbSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoxMDBweDtcXFwiPkNvYXN0bGluZSBMZW5ndGggKGttKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJwcm9wX3NpemVzXCIsYyxwLDEpLGMscCwwLDU3OTMsNTk3MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlNJWkVfU1FLTVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTUlOX0RJTVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiQ09BU1RcIixjLHAsMCkpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIFRoaXMgYXJlYSB3aXRoaW4gdGhlIE1QQSBhY2NvdW50cyBmb3IgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJhcmVhX3BlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IE1hcmluZSBhcmVhLCBhbmQgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IGNvYXN0bGluZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fTtfLmIoXCI8IS0tXCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDYzMDksNzM3NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw2MzI5LDczNTgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGg0PkNvbm5lY3Rpdml0eTwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNpbmdsZVNrZXRjaFwiLGMscCwxKSxjLHAsMCw2NDE5LDY1OTYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHAgc3R5bGU9XFxcImZvbnQtc3R5bGU6aXRhbGljO2NvbG9yOmdyYXk7XFxcIiBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICBObyBjb25uZWN0aXZpdHkgaW5mb3JtYXRpb24gZm9yIGEgY29sbGVjdGlvbiB3aXRoIG9uZSBza2V0Y2guIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJzaW5nbGVTa2V0Y2hcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5PZiB0aGUgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJ0b3RhbF9tcGFfY291bnRcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gTVBBcyBpbiB0aGUgbmV0d29yaywgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb25uZWN0ZWRfbXBhX2NvdW50XCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+XCIpO2lmKF8ucyhfLmYoXCJwbHVyYWxfY29ubmVjdGVkX21wYV9jb3VudFwiLGMscCwxKSxjLHAsMCw2ODAzLDY4MDcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiBhcmVcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJwbHVyYWxfY29ubmVjdGVkX21wYV9jb3VudFwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiBpc1wiKTt9O18uYihcIiB3aXRoaW4gMTAwIGttIG9mIGVhY2ggb3RoZXIuIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJjb25uX3ZhbHVlc1xcXCI+VGhlIG1pbmltdW0gZGlzdGFuY2UgYmV0d2VlbiB0aGUgTVBBcyBpcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm1pbl9kaXN0YW5jZVwiLGMscCwwKSkpO18uYihcIiBrbTwvc3Ryb25nPi48L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJjb25uX3ZhbHVlc1xcXCI+VGhlIG1heGltdW0gZGlzdGFuY2UgYmV0d2VlbiB0aGUgTVBBcyBpcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm1heF9kaXN0YW5jZVwiLGMscCwwKSkpO18uYihcIiBrbTwvc3Ryb25nPi48L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJjb25uX3ZhbHVlc1xcXCI+VGhlIGF2ZXJhZ2UgZGlzdGFuY2UgYmV0d2VlbiB0aGUgTVBBcyBpcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm1lYW5fZGlzdGFuY2VcIixjLHAsMCkpKTtfLmIoXCIga208L3N0cm9uZz4uPC9zcGFuPlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9Xy5iKFwiLS0+XCIpO18uYihcIlxcblwiICsgaSk7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtpZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDc0MjUsNzgzMSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gc2l6ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGg0PlNpemU8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBUaGlzIHNrZXRjaCBhcmVhIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwic2l6ZVwiLGMscCwwKSkpO18uYihcIiBzcXVhcmUga2lsb21ldGVyczwvc3Ryb25nPiwgYW5kIGl0IGluY2x1ZGVzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwiY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50XCIsYyxwLDApKSk7Xy5iKFwiJTwvc3Ryb25nPiBvZiB0aGUgU291dGgtRWFzdCBQbGFubmluZyBSZWdpb24uXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBUaGlzIHNrZXRjaCBpbmNsdWRlcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcImNvYXN0bGluZV9sZW5ndGhcIixjLHAsMCkpKTtfLmIoXCIga2lsb21ldGVyczwvc3Ryb25nPiBvZiBjb2FzdGxpbmUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX07Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwhLS1cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHNpemVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0Pk51bWJlciBvZiBIYWJpdGF0czwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICBUaGUgXCIpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw3OTcyLDgwMjksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiBNYXJpbmUgUHJvdGVjdGVkIEFyZWFcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw4MDExLDgwMTIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcInNcIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMCw4MDUzLDgwOTUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcInNrZXRjaFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDgwNzYsODA3OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiZXNcIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9Xy5iKFwiIGluY2x1ZGVcIik7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJzXCIpO307Xy5iKFwiIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibnVtX2hhYnNcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gb2YgdGhlIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwidG90YWxfaGFic1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBjbGFzc2lmaWVkIGhhYml0YXRzLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIi0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJ1c2VzXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO2lmKF8ucyhfLmQoXCJza2V0Y2hDbGFzcy5kZWxldGVkXCIsYyxwLDEpLGMscCwwLDI0LDI3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtd2FyblxcXCIgc3R5bGU9XFxcIm1hcmdpbi1ib3R0b206MTBweDtcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgVGhpcyBza2V0Y2ggd2FzIGNyZWF0ZWQgdXNpbmcgdGhlIFxcXCJcIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiB0ZW1wbGF0ZSwgd2hpY2ggaXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIG5vIGxvbmdlciBhdmFpbGFibGUuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIGNvcHkgdGhpcyBza2V0Y2ggb3IgbWFrZSBuZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIHNrZXRjaGVzIG9mIHRoaXMgdHlwZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJoYXNDb2FzdGFsXCIsYyxwLDEpLGMscCwwLDMxMCwxMDQ1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDQ+RXhpc3RpbmcgQ29hc3RhbCBDb25zZW50cyA8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXRvZ2dsZS1ub2RlPVxcXCI1M2Q3MTlhNDkzODAxNzRhNzc2NmRkODVcXFwiIGRhdGEtdmlzaWJsZT1cXFwiZmFsc2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIHNob3cgbGF5ZXI8L2E+PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwPlwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDUyNCw1NTQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkEgc2tldGNoIHdpdGhpbiB0aGUgY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlRoZSBza2V0Y2hcIik7fTtfLmIoXCIgY29udGFpbnMgb3IgaXMgd2l0aGluIDIwMG0gb2Ygc2l0ZXMgd2l0aCBSZXNvdXJjZSBDb25zZW50cy48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5Db25zZW50IFR5cGU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiY29hc3RhbF9jb25zZW50c1wiLGMscCwxKSxjLHAsMCw4OTMsOTc4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNVc2VzXCIsYyxwLDEpLGMscCwwLDEwNzQsNDE0NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImhhc1JlY1VzZXNcIixjLHAsMSksYyxwLDAsMTA5MiwyMzU2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDQ+UmVjcmVhdGlvbmFsIFVzZXMgPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8IS0tXCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc1NtYXJvXCIsYyxwLDEpLGMscCwwLDEyMDAsMTY4OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgIDxwPjxzdHJvbmc+U3BlY3RydW0gb2YgTUFyaW5lIFJlY3JlYXRpb25hbCBPcHBvcnR1bml0eSAoU01BUk8pPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8cD5cIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxMzM5LDEzNDksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJTa2V0Y2hcIik7fTtfLmIoXCIgaW5jbHVkZXMgYXJlYShzKSBpZGVudGlmaWVkIGFzIGhhdmluZyA8c3Ryb25nPiBtZWRpdW0gb3IgaGlnaCA8L3N0cm9uZz4gcmVjcmVhdGlvbmFsIG9wcG9ydHVuaXR5LlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8ZW0+WW91IGNhbiBmaW5kIG1vcmUgaW5mb3JtYXRpb24gb24gU01BUk8gaW4gdGhlIFxcXCJkYXRhIGRlc2NyaXB0aW9uXFxcIiBieSByaWdodCBjbGlja2luZyBvbiB0aGUgbGF5ZXIgbmFtZS48L2VtPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9icj48L2JyPlwiKTtfLmIoXCJcXG5cIik7fTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAtLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoyNTBweDtcXFwiPkFjdGl2aXR5IFR5cGU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPk51bWJlciBvZiBTaXRlczwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNSZWNVc2VzXCIsYyxwLDEpLGMscCwwLDE5NTksMjE0MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcInJlY191c2VzXCIsYyxwLDEpLGMscCwwLDE5ODcsMjExNSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJGRUFUX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiQ09VTlRcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzUmVjVXNlc1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQgY29sc3Bhbj0yPjxlbT5Ob25lIFByZXNlbnQ8L2VtPjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCIgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc0hlcml0YWdlXCIsYyxwLDEpLGMscCwwLDIzOTEsMzM0NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxoND5BcmNoZW9sb2dpY2FsIEluZm9ybWF0aW9uIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXRvZ2dsZS1ub2RlPVxcXCI1NTc4ZjE0Y2ZmMzkwNTlhNTgzNjQ2YzlcXFwiIGRhdGEtdmlzaWJsZT1cXFwiZmFsc2VcXFwiPnNob3cgbGF5ZXI8L2E+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxwPlwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDI2NTAsMjY4MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiQSBza2V0Y2ggd2l0aGluIHRoZSBjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiVGhlIHNrZXRjaFwiKTt9O18uYihcIiBjb250YWlucyBvciBpcyB3aXRoaW4gMjAwbSBvZiBzaXRlcyBpZGVudGlmaWVkIGFzIGhhdmluZyBzaWduaWZpY2FudCBoZXJpdGFnZSB2YWx1ZXMuPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoyNTBweDtcXFwiPkhlcml0YWdlIFR5cGU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aD5OdW1iZXIgb2YgU2l0ZXM8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGVyaXRhZ2VcIixjLHAsMSksYyxwLDAsMzExMywzMjUxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJGRUFUX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJDT1VOVFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO307fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImhhc0luZnJhc3RydWN0dXJlXCIsYyxwLDEpLGMscCwwLDMzODcsNDEyMixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxoND5JbmZyYXN0cnVjdHVyZTwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHA+XCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMzUyMywzNTUzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJBIHNrZXRjaCB3aXRoaW4gdGhlIGNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJUaGUgc2tldGNoXCIpO307Xy5iKFwiIGNvbnRhaW5zIG9yIGlzIHdpdGhpbiAyMDBtIG9mIHNpdGVzIHdpdGggZXhpc3RpbmcgaW5mcmFzdHJ1Y3R1cmUuPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoyNTBweDtcXFwiPlR5cGU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaW5mcmFzdHJ1Y3R1cmVcIixjLHAsMSksYyxwLDAsMzkyMCw0MDIxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJGRUFUX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9O30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzVXNlc1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5BY3Rpdml0aWVzIGFuZCBVc2VzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwPlRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw0MjgxLDQyOTEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgIGRvZXMgPHN0cm9uZz5ub3Q8L3N0cm9uZz4gaW5jbHVkZSBhbnkgPHN0cm9uZz5hY3Rpdml0aWVzIG9yIHVzZXM8L3N0cm9uZz4uPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9O18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc1NlYWJpcmRzXCIsYyxwLDEpLGMscCwwLDQ0NjgsNTE5NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+QmlyZHMgPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzU2VhYmlyZEFyZWFzXCIsYyxwLDEpLGMscCwwLDQ1NTYsNDg0MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPjxzdHJvbmc+SW1wb3J0YW50IFNlYWJpcmQgQXJlYXM8L3N0cm9uZz48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzZWFiaXJkc1wiLGMscCwxKSxjLHAsMCw0NzAzLDQ3ODMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJOYW1lXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgXCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc1NlYWJpcmRDb2xvbmllc1wiLGMscCwxKSxjLHAsMCw0ODkzLDUxNjMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+PHN0cm9uZz5TZWFiaXJkIENvbG9uaWVzPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzZWFiaXJkX2NvbG9uaWVzXCIsYyxwLDEpLGMscCwwLDUwMzMsNTEwNSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTmFtZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImhhc01hcmluZVNwZWNpZXNcIixjLHAsMSksYyxwLDAsNTIzMiw1Njk0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5NYXJpbmUgTWFtbWFsczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5TcGVjaWVzPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcIm1hbW1hbHNcIixjLHAsMSksYyxwLDAsNTQ4MCw1NTYwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTmFtZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJzZWFsc1wiLGMscCwxKSxjLHAsMCw1NTk1LDU2NDAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiPCEtLVwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKCFfLnMoXy5mKFwiaGFzTWFyaW5lU3BlY2llc1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5TcGVjaWVzIEluZm9ybWF0aW9uPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwPlRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw1ODUzLDU4ODcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcInNrZXRjaGVzIHdpdGhpbiB0aGUgY29sbGVjdGlvbiBkbyBcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2ggZG9lc1wiKTt9O18uYihcIiA8c3Ryb25nPm5vdDwvc3Ryb25nPiBpbmNsdWRlIGFueSA8c3Ryb25nPmltcG9ydGFudCBtYXJpbmUgbWFtbWFsIGFyZWFzPC9zdHJvbmc+LjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCItLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2hvd0FkamFjZW50XCIsYyxwLDEpLGMscCwwLDYwODcsNzUwMixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PkFkamFjZW50IFRlcnJlc3RyaWFsIEluZm9ybWF0aW9uPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwPjxlbT5BcmVhcyBzaG93biBiZWxvdyBhcmUgd2l0aGluIDEwMG0gb2YgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNjI0OCw2Mjc0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJhIHNrZXRjaCBpbiB0aGUgY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiB0aGUgc2tldGNoIFwiKTt9O18uYihcIjwvZW0+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj48c3Ryb25nPlByb3RlY3RlZCBBcmVhczwvc3Ryb25nPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMjBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc1Byb3RlY3RlZFwiLGMscCwxKSxjLHAsMCw2NDg5LDY2NDUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJwcm90ZWN0ZWRfYXJlYXNcIixjLHAsMSksYyxwLDAsNjUyNCw2NjEyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzUHJvdGVjdGVkXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD48ZW0+Tm9uZSBQcmVzZW50PC9lbT48L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj48c3Ryb25nPkNvbnNlcnZhdGlvbiBDb3ZlbmFudHM8L3N0cm9uZz48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNDb3ZlbmFudHNcIixjLHAsMSksYyxwLDAsNjk5NCw3MjkzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZihfLnMoXy5mKFwicWUyX2NvdmVuYW50c1wiLGMscCwxKSxjLHAsMCw3MDI3LDcxMTUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcIm5hcGFsaXNfY292ZW5hbnRzXCIsYyxwLDEpLGMscCwwLDcxNzAsNzI1OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJOQU1FXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc0NvdmVuYW50c1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+PGVtPk5vbmUgUHJlc2VudDwvZW0+PC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9O18uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9cmV0dXJuIF8uZmwoKTs7fSk7XG5cbmlmKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSB0aGlzW1wiVGVtcGxhdGVzXCJdO1xufSJdfQ==
