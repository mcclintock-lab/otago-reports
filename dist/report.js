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


},{}],4:[function(require,module,exports){
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
var CollectionView, JobItem, RecordSet, ReportResults, ReportTab, enableLayerTogglers, round, t, templates, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

enableLayerTogglers = require('./enableLayerTogglers.coffee');

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
      console.log(this.data);
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
    window.clearInterval(this.etaInterval);
    this.stopListening();
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

  ReportTab.prototype.getChildren = function(sketchClassId) {
    return _.filter(this.children, function(child) {
      return child.getSketchClass().id === sketchClassId;
    });
  };

  return ReportTab;

})(Backbone.View);

module.exports = ReportTab;


},{"../templates/templates.js":"CNqB+b","./enableLayerTogglers.coffee":2,"./jobItem.coffee":3,"./reportResults.coffee":4,"./utils.coffee":"+VosKh","views/collectionView":1}],"reportTab":[function(require,module,exports){
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
this["Templates"]["node_modules/seasketch-reporting-api/attributes/attributesTable"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<table class=\"attributes\">");_.b("\n" + i);if(_.s(_.f("attributes",c,p,1),c,p,0,44,81,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(_.rp("attributes/attributeItem",c,p,"    "));});c.pop();}_.b("</table>");_.b("\n");return _.fl();;});
this["Templates"]["node_modules/seasketch-reporting-api/genericAttributes"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b(" Attributes</h4>");_.b("\n" + i);_.b(_.rp("attributes/attributesTable",c,p,"    "));_.b("  </table>");_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});
this["Templates"]["node_modules/seasketch-reporting-api/reportLoading"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div class=\"reportLoading\">");_.b("\n" + i);_.b("  <!-- <div class=\"spinner\">3</div> -->");_.b("\n" + i);_.b("  <h4>Requesting Report from Server</h4>");_.b("\n" + i);_.b("  <div class=\"progress progress-striped active\">");_.b("\n" + i);_.b("    <div class=\"bar\" style=\"width: 100%;\"></div>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <a href=\"#\" rel=\"details\">details</a>");_.b("\n" + i);_.b("    <div class=\"details\">");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = this["Templates"];
}
},{}],"api/templates":[function(require,module,exports){
module.exports=require('CNqB+b');
},{}],11:[function(require,module,exports){
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

  EnvironmentTab.prototype.dependencies = ['HabitatsOverview', 'AdjacentTerrestrial', 'NewHabRepsToolbox'];

  EnvironmentTab.prototype.render = function() {
    var REP_NAME, all_habs, attributes, coastal_hab_types, context, d3IsPresent, estuarine_hab_types, hab_sizes, habitats_represented, habs_in_sketch, habs_plural, hasCoastalHabTypes, hasCovenants, hasEstuarineHabTypes, hasNapalisCovenants, hasProtected, hasQE2covenants, hasSigHabs, isCollection, isConfid, isGeneric, isMPA, napalis_covenants, noReserveTypes, protected_areas, qe2_covenants, scid, showAdjacent, sig_habs;
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
      protected_areas: protected_areas,
      hasProtected: hasProtected,
      qe2_covenants: qe2_covenants,
      hasQE2covenants: hasQE2covenants,
      napalis_covenants: napalis_covenants,
      hasNapalisCovenants: hasNapalisCovenants,
      hasCovenants: hasCovenants,
      showAdjacent: showAdjacent,
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
    var Error, coastal_hab_types, critical_habitats, estuarine_hab_types, hab, na_habs, new_hab, nh, _i, _j, _len, _len1;
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
    na_habs = ["Brachiopod beds", "Calcareous tube worm thickets", "Chaetopteridae worm fields", "Rhodolith beds", "Sea pen fields", "Sponge gardens", "Stony coral thickets"];
    for (_j = 0, _len1 = na_habs.length; _j < _len1; _j++) {
      nh = na_habs[_j];
      new_hab = {
        "HAB_TYPE": nh,
        "SIZE_SQKM": "NA",
        "PERC": "NA",
        "REPRESENT": "NA",
        "REPLIC": "NA",
        "CONN": "NA"
      };
      critical_habitats.push(new_hab);
    }
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
          columns = ["HAB_TYPE", "SIZE_SQKM", "PERC", "REPRESENT", "REPLIC", "CONN"];
        } else {
          columns = ["HAB_TYPE", "SIZE_SQKM", "PERC", "REPRESENT"];
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
      represented_str = "<td" > +d.REPRESENT + "</td>";
      if (isCollection) {
        replicated_str = "<td>" + d.REPLIC + "</td>";
        connected_str = "<td>" + d.CONN + "</td>";
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


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":17,"./ids.coffee":13,"reportTab":"a21iR2"}],12:[function(require,module,exports){
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


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":17,"./ids.coffee":13,"reportTab":"a21iR2"}],13:[function(require,module,exports){
module.exports = {
  GENERIC_ID: '539f5ec68d10926c29fe7762',
  GENERIC_COLLECTION_ID: '53fd19550406de684c118969',
  MPA_ID: '54d81290fa94e697759ce771',
  MPA_CONFID_COLLECTION_ID: '5582e605ac2dddd42976f41b',
  MPA_COLLECTION_ID: '56312abce837f22f06b6d272'
};


},{}],14:[function(require,module,exports){
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


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":17,"./ids.coffee":13,"reportTab":"a21iR2"}],15:[function(require,module,exports){
var EnvironmentTab, FishingTab, OverviewTab, UsesTab;

OverviewTab = require('./overview.coffee');

UsesTab = require('./uses.coffee');

EnvironmentTab = require('./environment.coffee');

FishingTab = require('./fishing.coffee');

window.app.registerReport(function(report) {
  report.tabs([OverviewTab, EnvironmentTab, FishingTab, UsesTab]);
  return report.stylesheets(['./report.css']);
});


},{"./environment.coffee":11,"./fishing.coffee":12,"./overview.coffee":14,"./uses.coffee":16}],16:[function(require,module,exports){
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

  UsesTab.prototype.dependencies = ['OverlapWithRecreationalUses', 'SpeciesInformation'];

  UsesTab.prototype.render = function() {
    var Error, attributes, coastal_consents, context, d3IsPresent, hasCoastal, hasHeritage, hasInfrastructure, hasMammals, hasMarineSpecies, hasRecUses, hasSeabirdAreas, hasSeabirdColonies, hasSeabirds, hasSeals, hasSmaro, hasUses, heritage, inHighDiversityReefFishArea, infrastructure, isCollection, mammals, non_smaro_rec_uses, rec_uses, reef_fish, seabird_colonies, seabirds, seals, smaro;
    if (window.d3) {
      d3IsPresent = true;
    } else {
      d3IsPresent = false;
    }
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
    hasRecUses = (non_smaro_rec_uses != null ? non_smaro_rec_uses.length : void 0) > 0;
    heritage = this.recordSet('OverlapWithRecreationalUses', 'Heritage').toArray();
    hasHeritage = (heritage != null ? heritage.length : void 0) > 0;
    coastal_consents = this.recordSet('OverlapWithRecreationalUses', 'CoastalConsents').toArray();
    hasCoastal = (coastal_consents != null ? coastal_consents.length : void 0) > 0;
    infrastructure = this.recordSet('OverlapWithRecreationalUses', 'Infrastructure').toArray();
    hasInfrastructure = (infrastructure != null ? infrastructure.length : void 0) > 0;
    attributes = this.model.getAttributes();
    hasUses = hasRecUses || hasHeritage || hasInfrastructure || hasCoastal;
    hasMarineSpecies = hasMammals || hasSeals;
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
      hasMarineSpecies: hasMarineSpecies
    };
    this.$el.html(this.template.render(context, partials));
    return this.enableLayerTogglers();
  };

  return UsesTab;

})(ReportTab);

module.exports = UsesTab;


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":17,"./ids.coffee":13,"reportTab":"a21iR2"}],17:[function(require,module,exports){
this["Templates"] = this["Templates"] || {};
this["Templates"]["demo"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>Report Sections</h4>");_.b("\n" + i);_.b("  <p>Use report sections to group information into meaningful categories</p>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>D3 Visualizations</h4>");_.b("\n" + i);_.b("  <ul class=\"nav nav-pills\" id=\"tabs2\">");_.b("\n" + i);_.b("    <li class=\"active\"><a href=\"#chart\">Chart</a></li>");_.b("\n" + i);_.b("    <li><a href=\"#dataTable\">Table</a></li>");_.b("\n" + i);_.b("  </ul>");_.b("\n" + i);_.b("  <div class=\"tab-content\">");_.b("\n" + i);_.b("    <div class=\"tab-pane active\" id=\"chart\">");_.b("\n" + i);_.b("      <!--[if IE 8]>");_.b("\n" + i);_.b("      <p class=\"unsupported\">");_.b("\n" + i);_.b("      This visualization is not compatible with Internet Explorer 8. ");_.b("\n" + i);_.b("      Please upgrade your browser, or view results in the table tab.");_.b("\n" + i);_.b("      </p>      ");_.b("\n" + i);_.b("      <![endif]-->");_.b("\n" + i);_.b("      <p>");_.b("\n" + i);_.b("        See <code>src/scripts/demo.coffee</code> for an example of how to ");_.b("\n" + i);_.b("        use d3.js to render visualizations. Provide a table-based view");_.b("\n" + i);_.b("        and use conditional comments to provide a fallback for IE8 users.");_.b("\n" + i);_.b("        <br>");_.b("\n" + i);_.b("        <a href=\"http://twitter.github.io/bootstrap/2.3.2/\">Bootstrap 2.x</a>");_.b("\n" + i);_.b("        is loaded within SeaSketch so you can use it to create tabs and other ");_.b("\n" + i);_.b("        interface components. jQuery and underscore are also available.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("    <div class=\"tab-pane\" id=\"dataTable\">");_.b("\n" + i);_.b("      <table>");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>index</th>");_.b("\n" + i);_.b("            <th>value</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("chartData",c,p,1),c,p,0,1351,1418,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr><td>");_.b(_.v(_.f("index",c,p,0)));_.b("</td><td>");_.b(_.v(_.f("value",c,p,0)));_.b("</td></tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection emphasis\">");_.b("\n" + i);_.b("  <h4>Emphasis</h4>");_.b("\n" + i);_.b("  <p>Give report sections an <code>emphasis</code> class to highlight important information.</p>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection warning\">");_.b("\n" + i);_.b("  <h4>Warning</h4>");_.b("\n" + i);_.b("  <p>Or <code>warn</code> of potential problems.</p>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection danger\">");_.b("\n" + i);_.b("  <h4>Danger</h4>");_.b("\n" + i);_.b("  <p><code>danger</code> can also be used... sparingly.</p>");_.b("\n" + i);_.b("</div>");return _.fl();;});
this["Templates"]["environment"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Habitats Present in ");if(_.s(_.f("isCollection",c,p,1),c,p,0,382,392,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" <a href=\"#\" data-toggle-node=\"5536dbb48c5b43eb0facbc5a\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);_.b("    <p>");_.b("\n" + i);_.b("      <i>");_.b("\n" + i);_.b("        Area (%) refers to the percentage of the habitat contained within the ");if(_.s(_.f("isGeneric",c,p,1),c,p,0,657,667,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isGeneric",c,p,1),c,p,1,0,0,"")){_.b("network");};_.b("\n" + i);_.b("        ");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" as a proportion of the total area of habitat within the South-East Marine region. ");if(!_.s(_.f("isConfid",c,p,1),c,p,1,0,0,"")){_.b("‘Patch size’ for subtidal habitats refers to the width of the largest patch included in a Type-1 MPA. For intertidal habitats this refers to the maximum length. Whether a habitat is considered ‘Representative’ under the Policy will need to be assessed on a case by case basis, taking into account such things as individual patch size and proportion of habitat. ’Replicates’ refers to there being 2 examples of the habitat type included in at least two Type-2 MPA.");};_.b("\n" + i);_.b("        ");if(_.s(_.f("isConfid",c,p,1),c,p,0,1359,1831,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Area (%) refers to the percentage of the habitat contained within the network as a proportion of the total area of habitat within the South-East Marine region. A habitat-type listed as ”Included” does not necessarily mean that it meets the requirement of being viable and therefore representative of that habitat type in the network. This will need to be assessed on a case by case basis, taking into account such things as individual patch size and proportion of habitat.");});c.pop();}_.b("\n" + i);_.b("      </i>");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <p class=\"in-report-header\">Coastal Habitat Types</p>");_.b("\n" + i);if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,1946,2872,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <table data-paging=\"22\" class=\"coastal_hab_table\"> ");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th class=\"sorting_col\" style=\"width:150px;\"><a class=\"coastal_hab_type sort_up\" href=\"#\">Habitat</a></th>");_.b("\n" + i);_.b("              <th><a  class=\"coastal_hab_new_area sort_down\" href=\"#\" >Area (km<sup>2</sup>)</a></th>");_.b("\n" + i);_.b("              <th><a class=\"coastal_hab_new_perc sort_down\" href=\"#\">Area (%)</a></th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,2376,2750,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <th><a class=\"coastal_hab_represent sort_down\" href=\"#\" >");_.b(_.v(_.f("REP_NAME",c,p,0)));_.b("</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,2499,2718,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  <th><a class=\"coastal_hab_replicate sort_down\" href=\"#\">Replicates</th>");_.b("\n" + i);_.b("                  <th><a class=\"coastal_hab_connected sort_down\" href=\"#\">Connectivity (in km)<sup>*</sup></th>");_.b("\n");});c.pop();}});c.pop();}_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("         <tbody class=\"coastal_hab_values\"></tbody>");_.b("\n" + i);_.b("       </table>");_.b("\n");});c.pop();}if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:180px;\">Habitat</th>");_.b("\n" + i);_.b("              <th>Area (km<sup>2</sup>)</th>");_.b("\n" + i);_.b("              <th>Area (%)</th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,3133,3355,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <th>Patch Size (Type-1)</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,3214,3323,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                    <th>Replicates</th>");_.b("\n" + i);_.b("                    <th>Connectivity (in km)</th>");_.b("\n");});c.pop();}});c.pop();}_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasCoastalHabTypes",c,p,1),c,p,0,3456,3877,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("coastal_hab_types",c,p,1),c,p,0,3493,3842,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("PERC",c,p,0)));_.b("</td>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,3650,3797,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  <td>");_.b(_.v(_.f("REPRESENT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                  ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3727,3763,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<td>");_.b(_.v(_.f("REPLIC",c,p,0)));_.b("</td><td>");_.b(_.v(_.f("CONN",c,p,0)));_.b("</td>");});c.pop();}_.b("\n");});c.pop();}_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasCoastalHabTypes",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td colspan=\"");if(_.s(_.f("isCollection",c,p,1),c,p,0,4002,4003,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("5");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("4");};_.b("\">");_.b("\n" + i);_.b("                  <i>There are no coastal habitat types.</i>");_.b("\n" + i);_.b("                </td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n");};_.b("\n" + i);_.b("    <p class=\"in-report-header\">Estuarine Habitat Types</p>");_.b("\n" + i);if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,4337,5288,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <table data-paging=\"20\" class=\"estuarine_hab_table\"> ");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th class=\"sorting_col\" style=\"width:150px;\"><a class=\"estuarine_hab_type sort_up\" href=\"#\">Habitat</a></th>");_.b("\n" + i);_.b("              <th><a  class=\"estuarine_hab_new_area sort_down\" href=\"#\" >Area (km<sup>2</sup>)</a></th>");_.b("\n" + i);_.b("              <th><a class=\"estuarine_hab_new_perc sort_down\" href=\"#\">Area (%)</a></th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,4775,5164,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <th><a class=\"estuarine_hab_represent sort_down\" style=\"width:80px;\" href=\"#\" >");_.b(_.v(_.f("REP_NAME",c,p,0)));_.b("</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,4920,5132,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  <th><a class=\"estuarine_hab_replicate sort_down\" href=\"#\" >Replicates</th>");_.b("\n" + i);_.b("                  <th><a class=\"estuarine_hab_connected sort_down\" href=\"#\">Connectivity (in km)</th>");_.b("\n");});c.pop();}});c.pop();}_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("         <tbody class=\"estuarine_hab_values\"></tbody>");_.b("\n" + i);_.b("       </table>");_.b("\n");});c.pop();}if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:150px;\">Habitat</th>");_.b("\n" + i);_.b("              <th>Area (km<sup>2</sup>)</th>");_.b("\n" + i);_.b("              <th>Area (%)</th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,5549,5771,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <th>Patch Size (Type-1)</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,5630,5739,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                    <th>Replicates</th>");_.b("\n" + i);_.b("                    <th>Connectivity (in km)</th>");_.b("\n");});c.pop();}});c.pop();}_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasEstuarineHabTypes",c,p,1),c,p,0,5874,6299,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("estuarine_hab_types",c,p,1),c,p,0,5913,6262,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("PERC",c,p,0)));_.b("</td>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,6070,6217,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  <td>");_.b(_.v(_.f("REPRESENT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                  ");if(_.s(_.f("isCollection",c,p,1),c,p,0,6147,6183,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<td>");_.b(_.v(_.f("REPLIC",c,p,0)));_.b("</td><td>");_.b(_.v(_.f("CONN",c,p,0)));_.b("</td>");});c.pop();}_.b("\n");});c.pop();}_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasEstuarineHabTypes",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td colspan=\"");if(_.s(_.f("isCollection",c,p,1),c,p,0,6428,6429,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("5");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("4");};_.b("\">");_.b("\n" + i);_.b("                  <i>There are no estuarine habitat types.</i>");_.b("\n" + i);_.b("                </td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n");};_.b("    <p class=\"in-report-header\">Sensitive Marine Habitats</p>");_.b("\n" + i);if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,6768,7636,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <table data-paging=\"20\" class=\"sig_hab_table\"> ");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th class=\"sorting_col\" style=\"width:150px;\"><a class=\"sig_hab_type sort_down\" href=\"#\">Habitat</a></th>");_.b("\n" + i);_.b("            <th><a  class=\"sig_hab_new_area sort_up\" href=\"#\" >Area (km<sup>2</sup>)</a></th>");_.b("\n" + i);_.b("            <th><a class=\"sig_hab_new_perc sort_down\" href=\"#\">Area (%)</a></th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,7168,7528,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <th><a class=\"sig_hab_represent sort_down\" style=\"width:80px;\" href=\"#\">");_.b(_.v(_.f("REP_NAME",c,p,0)));_.b("</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,7304,7498,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <th><a class=\"sig_hab_replicate sort_down\" href=\"#\">Replicates</th>");_.b("\n" + i);_.b("                <th><a class=\"sig_hab_connected sort_down\" href=\"#\">Connectivity (in km) </th>");_.b("\n");});c.pop();}});c.pop();}_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("       <tbody class=\"sig_hab_values\"></tbody>");_.b("\n" + i);_.b("     </table>");_.b("\n");});c.pop();}if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th style=\"width:175px;\">Habitat</th>");_.b("\n" + i);_.b("            <th>Area (km<sup>2</sup>)</th>");_.b("\n" + i);_.b("            <th>Area (%)</th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,7883,8096,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <th>Patch Size</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,7955,8064,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                    <th>Replicates</th>");_.b("\n" + i);_.b("                    <th>Connectivity (in km)</th>");_.b("\n");});c.pop();}});c.pop();}_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("hasSigHabs",c,p,1),c,p,0,8179,8552,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("sig_habs",c,p,1),c,p,0,8203,8530,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("PERC",c,p,0)));_.b("</td>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,8350,8491,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <td>");_.b(_.v(_.f("REPRESENT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                ");if(_.s(_.f("isCollection",c,p,1),c,p,0,8423,8459,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<td>");_.b(_.v(_.f("REPLIC",c,p,0)));_.b("</td><td>");_.b(_.v(_.f("CONN",c,p,0)));_.b("</td>");});c.pop();}_.b("\n");});c.pop();}_.b("            </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasSigHabs",c,p,1),c,p,1,0,0,"")){_.b("          <tr>");_.b("\n" + i);_.b("              <td colspan=\"");if(_.s(_.f("isCollection",c,p,1),c,p,0,8651,8652,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("5");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("4");};_.b("\">");_.b("\n" + i);_.b("                <i>There are no habitats of significance.</i>");_.b("\n" + i);_.b("              </td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");};_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("\n");};_.b("    <p>");_.b("\n" + i);_.b("      <em>Sensitive habitats are defined in the report '<a href=\"https://www.mfe.govt.nz/sites/default/files/sensitive-marine-benthic-habitats-defined.pdf\" target=\"_blank\">Sensitive marine benthic habitats defined</a>.' ’NA’ indicates that the habitat is likely to be present in the region but not mapped.</em>");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);if(_.s(_.f("showAdjacent",c,p,1),c,p,0,9237,10653,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("\n" + i);_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Adjacent Terrestrial Information</h4>");_.b("\n" + i);_.b("        <p><em>Areas shown below are within 100m of ");if(_.s(_.f("isCollection",c,p,1),c,p,0,9399,9425,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("a sketch in the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b(" the sketch ");};_.b("</em></p>");_.b("\n" + i);_.b("        <p class=\"large\"><strong>Protected Areas</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"20\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasProtected",c,p,1),c,p,0,9640,9796,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("protected_areas",c,p,1),c,p,0,9675,9763,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasProtected",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("        <p class=\"large\"><strong>Conservation Covenants</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasCovenants",c,p,1),c,p,0,10145,10444,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("qe2_covenants",c,p,1),c,p,0,10178,10266,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}if(_.s(_.f("napalis_covenants",c,p,1),c,p,0,10321,10409,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasCovenants",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n");return _.fl();;});
this["Templates"]["fishing"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("\n" + i);if(_.s(_.f("hasAnyFishing",c,p,1),c,p,0,317,2552,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hasExistingFishing",c,p,1),c,p,0,345,1382,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("      <h4>Existing Fisheries Management</h4>");_.b("\n" + i);_.b("          <p><em>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,476,483,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" includes the following existing fisheries restrictions. ");_.b("\n" + i);_.b("          Also shown is the extent that the fisheries restrictions apply to the ");if(_.s(_.f("isCollection",c,p,1),c,p,0,695,703,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketches");});c.pop();}_.b("\n" + i);_.b("          ");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" as a percentage of total sketch area. For example, 100% means no fishing of that type is currently allowed within the sketch.</em></p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <thead>");_.b("\n" + i);_.b("              <tr>");_.b("\n" + i);_.b("                <th style=\"width:250px;\">Name</th>");_.b("\n" + i);_.b("                <th>Percent</th>");_.b("\n" + i);_.b("              </tr>");_.b("\n" + i);_.b("            </thead>");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("existing_fishing_areas",c,p,1),c,p,0,1167,1299,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("PERC_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}if(_.s(_.f("hasCustomary",c,p,1),c,p,0,1427,2533,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Customary Areas</h4>");_.b("\n" + i);if(_.s(_.f("hasExistingCustomary",c,p,1),c,p,0,1543,1987,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <p> The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1579,1586,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes the following <strong>existing</strong> Customary Areas:</p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("existing_customary_fishing",c,p,1),c,p,0,1814,1907,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n");});c.pop();}if(_.s(_.f("hasProposedCustomary",c,p,1),c,p,0,2046,2490,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <p> The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,2082,2089,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes the following <strong>proposed</strong> Customary Areas:</p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("proposed_customary_fishing",c,p,1),c,p,0,2317,2410,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n");});c.pop();}_.b("      </div>");_.b("\n");});c.pop();}_.b("\n");});c.pop();}if(!_.s(_.f("hasAnyFishing",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Existing or Customary Areas</h4>");_.b("\n" + i);_.b("        <p>No information on existing fishing areas or customary use is available for this area.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};_.b("\n" + i);if(_.s(_.f("isConfidentialMPANetwork",c,p,1),c,p,0,2835,5081,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("      <h4>Fishing Intensity</h4>");_.b("\n" + i);_.b("          <p>");_.b("\n" + i);_.b("            <em>");_.b("\n" + i);_.b("            Your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,2981,2988,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes areas identified as having high, moderate or low intensity fishing grounds for the following fisheries. The percentage of the regions high, moderate and low intensity fishing grounds covered by your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3271,3278,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" is given below. Fishery displacement shows the percentage of the regions fishery that would be displaced by your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3466,3473,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(".");_.b("\n" + i);_.b("            </em>");_.b("\n" + i);_.b("          </p>");_.b("\n" + i);if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,3591,4328,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <table data-paging=\"20\" class=\"fishery_table\"> ");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th class=\"sorting_col\" style=\"width:150px;\"><a class=\"fishery_type sort_up\" href=\"#\">Fishery</a></th>");_.b("\n" + i);_.b("                  <th><a class=\"fishery_high sort_down\" href=\"#\" >High (%)</th>");_.b("\n" + i);_.b("                  <th><a class=\"fishery_moderate sort_down\" href=\"#\">Moderate (%)</a></th>");_.b("\n" + i);_.b("                  <th><a class=\"fishery_low sort_down\" style=\"width:80px;\" href=\"#\" >Low (%)</th>");_.b("\n" + i);_.b("                  <th><a class=\"fishery_disp sort_down\" style=\"width:80px;\" href=\"#\" >Fishery displacement (%)</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("             <tbody class=\"fishery_values\"></tbody>");_.b("\n" + i);_.b("           </table>");_.b("\n");});c.pop();}if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <thead>");_.b("\n" + i);_.b("              <tr>");_.b("\n" + i);_.b("                <th style=\"width:125px;\">Fishery</th>");_.b("\n" + i);_.b("                <th>High (%)</th>");_.b("\n" + i);_.b("                <th>Moderate (%)</th>");_.b("\n" + i);_.b("                <th>Low (%)</th>");_.b("\n" + i);_.b("                <th>Fishery displacement (%)</th>");_.b("\n" + i);_.b("              </tr>");_.b("\n" + i);_.b("            </thead>");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("fishery_intensity",c,p,1),c,p,0,4752,4984,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FISH_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("MODERATE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("DISP",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n");};_.b("    </div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("<!--");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,5127,7008,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Fishing Intensity</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        The following tables contains the percent of the total SEMPF low intensity and high intensity fishing that may be displaced by the sketch. <strong>High intensity</strong> is greater than an average of 5 events per annum, <strong>Low</strong> is 5 or less events per annum.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("      <p class=\"in-report-header\">Trawl Fishing Intensity</p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>Sketch Name</th>");_.b("\n" + i);_.b("            <th>% Low Intensity</th>");_.b("\n" + i);_.b("            <th>% High Intensity</th>");_.b("\n" + i);_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("trawl",c,p,1),c,p,0,5822,5953,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("\n" + i);_.b("      <p class=\"in-report-header\">Set Net Fishing Intensity</p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>Sketch Name</th>");_.b("\n" + i);_.b("              <th>% Low Intensity</th>");_.b("\n" + i);_.b("              <th>% High Intensity</th>");_.b("\n" + i);_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("setnet",c,p,1),c,p,0,6322,6465,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("      <p class=\"in-report-header\">Long Line Fishing Intensity</p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>Sketch Name</th>");_.b("\n" + i);_.b("            <th>% Low Intensity</th>");_.b("\n" + i);_.b("            <th>% High Intensity</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("longline",c,p,1),c,p,0,6821,6952,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("-->");_.b("\n" + i);_.b("\n" + i);_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["overview"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,313,748,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isMPA",c,p,1),c,p,0,326,737,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>MPA Network</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This Collection has: <strong>");_.b(_.v(_.f("num_reserves",c,p,0)));_.b(" Type-1 MPA");if(_.s(_.f("plural_type1",c,p,1),c,p,0,496,497,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}_.b(", ");_.b(_.v(_.f("num_type2",c,p,0)));_.b(" Type-2 MPA");if(_.s(_.f("plural_type2",c,p,1),c,p,0,557,558,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}_.b(", and ");_.b(_.v(_.f("num_other",c,p,0)));_.b(" Other MPA");if(_.s(_.f("plural_other",c,p,1),c,p,0,621,622,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}_.b("</strong> .");_.b("\n" + i);_.b("        <em>Only Type-1 and Type-2 MPAs are reported on.</em>");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){if(_.s(_.f("anyAttributes",c,p,1),c,p,0,807,1125,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div class=\"reportSection\">");_.b("\n" + i);_.b("        <h4>");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("</h4>");_.b("\n" + i);_.b(_.rp("attributes/attributesTable",c,p,"        "));if(_.s(_.f("isCollection",c,p,1),c,p,0,945,1075,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <tr><td>");if(_.s(_.f("isMPA",c,p,1),c,p,0,972,986,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Number of MPAs");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,1010,1028,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Number of Sketches");});c.pop();}_.b("</td>");_.b(_.v(_.f("numSketches",c,p,0)));_.b("<td>");_.b("\n");});c.pop();}_.b("        </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");});c.pop();}};if(_.s(_.f("isGeneric",c,p,1),c,p,0,1178,1465,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,1200,1445,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection\">");_.b("\n" + i);_.b("      <h4>Number of Sketches in Collection</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This collection contains <strong>");_.b(_.v(_.f("numSketches",c,p,0)));_.b("</strong> sketch");if(_.s(_.f("pluralSketches",c,p,1),c,p,0,1396,1398,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("es");});c.pop();}_.b(".");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,1493,3815,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,1515,3795,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Coastal Habitats Included in Type-1 MPA");_.b("\n" + i);_.b("        <a href=\"#\" data-toggle-node=\"5536dbb48c5b43eb0facbc5a\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("      <strong>Number of Habitat Classes</strong></br>");_.b("\n" + i);_.b("      <p style=\"margin-top:0px;\" class=\"large\">");_.b("\n" + i);_.b("        There are <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> habitat classes in the planning region, and your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1949,1959,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("\n" + i);_.b("        includes <strong>");_.b(_.v(_.f("new_habs",c,p,0)));_.b("</strong>. For more information on the Habitat Classification, see");_.b("\n" + i);_.b("        the <a href=\"http://www.doc.govt.nz/Documents/conservation/marine-and-coastal/marine-protected-areas/mpa-classification-protection-standard.pdf\" target=\"_blank\">");_.b("\n" + i);_.b("        Marine Protected Areas Classification and Protection Standard</a>");_.b("\n" + i);_.b("      </p>");_.b("\n");};if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,2421,2625,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <div>");_.b("\n" + i);_.b("          <div class=\"represented_habs_pie\" id=\"represented_habs_pie\"></div>");_.b("\n" + i);_.b("          <div class=\"represented_habs_pie_legend\" id=\"represented_habs_pie_legend\"></div>");_.b("\n" + i);_.b("        </div>");_.b("\n");});c.pop();}_.b("    </div>");_.b("\n" + i);_.b("    ");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Coastal Habitats Replicated");_.b("\n" + i);_.b("        <a href=\"#\" data-toggle-node=\"5536dbb48c5b43eb0facbc5a\" data-visible=\"false\">show layer</a>");_.b("\n" + i);_.b("      </h4>");_.b("\n" + i);if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("        <strong>Number of Habitat Classes</strong></br>");_.b("\n" + i);_.b("        <p style=\"margin-top:0px;\" class=\"large\">");_.b("\n" + i);_.b("          There are <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> habitat classes in the planning region, and your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3093,3103,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("\n" + i);_.b("          includes <strong>");_.b(_.v(_.f("new_habs",c,p,0)));_.b("</strong>. For more information on the Habitat Classification, see");_.b("\n" + i);_.b("          the <a href=\"http://www.doc.govt.nz/Documents/conservation/marine-and-coastal/marine-protected-areas/mpa-classification-protection-standard.pdf\" target=\"_blank\">");_.b("\n" + i);_.b("          Marine Protected Areas Classification and Protection Standard</a>");_.b("\n" + i);_.b("        </p>");_.b("\n");};if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,3573,3763,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div>");_.b("\n" + i);_.b("        <div class=\"replicated_habs_pie\" id=\"replicated_habs_pie\"></div>");_.b("\n" + i);_.b("        <div class=\"replicated_habs_pie_legend\" id=\"replicated_habs_pie_legend\"></div>");_.b("\n" + i);_.b("      </div>");_.b("\n");});c.pop();}_.b("    </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,3844,5297,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection size\">");_.b("\n" + i);_.b("    <h4>");if(_.s(_.f("isMPA",c,p,1),c,p,0,3898,3907,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("MPA Sizes");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,3931,3943,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Sketch Sizes");});c.pop();}_.b("</h4>");_.b("\n" + i);_.b("    <!--");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,3986,4313,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        Of the <strong>");_.b(_.v(_.f("total_mpa_count",c,p,0)));_.b("</strong> MPAs in the network, <strong>");_.b(_.v(_.f("mpa_count",c,p,0)));_.b("</strong> meet");if(!_.s(_.f("plural_mpa_count",c,p,1),c,p,1,0,0,"")){_.b("s");};_.b(" the minimum size dimension of 5km. The average minimum dimension is <strong>");_.b(_.v(_.f("mpa_avg_size_guideline",c,p,0)));_.b("</strong> the 10-20km guideline.");_.b("\n" + i);_.b("      </p>");_.b("\n");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,4342,4409,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p>The size of the sketches in this collection are:</p>");_.b("\n");});c.pop();}_.b("    -->");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>");if(_.s(_.f("isMPA",c,p,1),c,p,0,4520,4528,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("MPA Name");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,4552,4563,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Sketch Name");});c.pop();}_.b("</th>");_.b("\n" + i);_.b("            <th>Area </br>(sq. km.)</th>");_.b("\n" + i);_.b("            <th style=\"width:100px;\">Width (km)</th>");_.b("\n" + i);_.b("            <th style=\"width:100px;\">Coastline Length (km)</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("prop_sizes",c,p,1),c,p,0,4815,5006,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr class=");_.b(_.v(_.f("CSS_CLASS",c,p,0)));_.b(">");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("MIN_DIM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("COAST",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("    <p class=\"large\">");_.b("\n" + i);_.b("      This combined area within the network accounts for <strong>");_.b(_.v(_.f("area_percent",c,p,0)));_.b("%</strong> of the South-East Marine area, and <strong>");_.b(_.v(_.f("coastline_length_percent",c,p,0)));_.b("%</strong> of the South-East coastline.");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){if(_.s(_.f("isMPA",c,p,1),c,p,0,5345,6225,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>MPA Size</h4>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>MPA Name</th>");_.b("\n" + i);_.b("              <th>Area </br>(sq. km.)</th>");_.b("\n" + i);_.b("              <th style=\"width:100px;\">Width (km)</th>");_.b("\n" + i);_.b("              <th style=\"width:100px;\">Coastline Length (km)</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("prop_sizes",c,p,1),c,p,0,5753,5933,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("MIN_DIM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("COAST",c,p,0)));_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This area within the MPA accounts for <strong>");_.b(_.v(_.f("area_percent",c,p,0)));_.b("%</strong> of the South-East Marine area, and <strong>");_.b(_.v(_.f("coastline_length_percent",c,p,0)));_.b("%</strong> of the South-East coastline.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}};_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,6265,7550,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,6285,7532,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div class=\"reportSection\">");_.b("\n" + i);_.b("        <h4>Connectivity</h4>");_.b("\n" + i);if(_.s(_.f("singleSketch",c,p,1),c,p,0,6375,6552,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <p style=\"font-style:italic;color:gray;\" class=\"large\">");_.b("\n" + i);_.b("                No connectivity information for a collection with one sketch. ");_.b("\n" + i);_.b("              </p>");_.b("\n");});c.pop();}if(!_.s(_.f("singleSketch",c,p,1),c,p,1,0,0,"")){_.b("          <!--");_.b("\n" + i);_.b("          <div>");_.b("\n" + i);_.b("            <div class=\"connectivity_pie\" id=\"connectivity_pie\"></div>");_.b("\n" + i);_.b("            <div class=\"connectivity_pie_legend\" id=\"connectivity_pie_legend\"></div>");_.b("\n" + i);_.b("          </div>");_.b("\n" + i);_.b("          -->");_.b("\n" + i);_.b("          <p class=\"large\">Of the <strong>");_.b(_.v(_.f("total_mpa_count",c,p,0)));_.b("</strong> MPAs in the network, <strong>");_.b(_.v(_.f("connected_mpa_count",c,p,0)));_.b("</strong>");if(_.s(_.f("plural_connected_mpa_count",c,p,1),c,p,0,6977,6981,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(" are");});c.pop();}if(!_.s(_.f("plural_connected_mpa_count",c,p,1),c,p,1,0,0,"")){_.b(" is");};_.b(" within 100 km of each other. ");_.b("\n" + i);_.b("          </p>");_.b("\n" + i);_.b("          <span class=\"conn_values\">The minimum distance between the MPAs is <strong>");_.b(_.v(_.f("min_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("          <span class=\"conn_values\">The maximum distance between the MPAs is <strong>");_.b(_.v(_.f("max_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("          <span class=\"conn_values\">The average distance between the MPAs is <strong>");_.b(_.v(_.f("mean_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n");};_.b("\n" + i);_.b("      </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){if(_.s(_.f("isGeneric",c,p,1),c,p,0,7596,8002,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Size</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This sketch area is <strong>");_.b(_.v(_.f("size",c,p,0)));_.b(" square kilometers</strong>, and it includes <strong>");_.b(_.v(_.f("coastline_length_percent",c,p,0)));_.b("%</strong> of the South-East Planning Region.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This sketch includes <strong>");_.b(_.v(_.f("coastline_length",c,p,0)));_.b(" kilometers</strong> of coastline.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}};_.b("\n" + i);_.b("\n" + i);_.b("<!--");_.b("\n" + i);_.b("<div class=\"reportSection size\">");_.b("\n" + i);_.b("  <h4>Number of Habitats</h4>");_.b("\n" + i);_.b("  <p class=\"large\">");_.b("\n" + i);_.b("    The ");if(_.s(_.f("isMPA",c,p,1),c,p,0,8143,8200,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(" Marine Protected Area");if(_.s(_.f("isCollection",c,p,1),c,p,0,8182,8183,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,8224,8266,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketch");if(_.s(_.f("isCollection",c,p,1),c,p,0,8247,8249,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("es");});c.pop();}});c.pop();}_.b(" include");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("s");};_.b(" <strong>");_.b(_.v(_.f("num_habs",c,p,0)));_.b("</strong> of the <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> classified habitats.");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("-->");_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["uses"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("hasCoastal",c,p,1),c,p,0,310,1045,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Existing Coastal Consents <a href=\"#\" data-toggle-node=\"53d719a49380174a7766dd85\" data-visible=\"false\">");_.b("\n" + i);_.b("      show layer</a></h4>");_.b("\n" + i);_.b("        <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,524,554,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites with Resource Consents.</p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:250px;\">Consent Type</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("coastal_consents",c,p,1),c,p,0,893,978,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("hasUses",c,p,1),c,p,0,1074,4145,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hasRecUses",c,p,1),c,p,0,1092,2356,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Recreational Uses </h4>");_.b("\n" + i);_.b("      <!--");_.b("\n" + i);if(_.s(_.f("hasSmaro",c,p,1),c,p,0,1200,1688,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("        <p><strong>Spectrum of MArine Recreational Opportunity (SMARO)</strong></p>");_.b("\n" + i);_.b("          <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,1339,1349,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" includes area(s) identified as having <strong> medium or high </strong> recreational opportunity.");_.b("\n" + i);_.b("          <em>You can find more information on SMARO in the \"data description\" by right clicking on the layer name.</em>");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("        </br></br>");_.b("\n");};});c.pop();}_.b("      -->");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:250px;\">Activity Type</th>");_.b("\n" + i);_.b("              <th>Number of Sites</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasRecUses",c,p,1),c,p,0,1959,2141,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("rec_uses",c,p,1),c,p,0,1987,2115,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("COUNT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasRecUses",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td colspan=2><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("hasHeritage",c,p,1),c,p,0,2391,3346,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Archeological Information ");_.b("\n" + i);_.b("          <a href=\"#\" data-toggle-node=\"5578f14cff39059a583646c9\" data-visible=\"false\">show layer</a>");_.b("\n" + i);_.b("        </h4>");_.b("\n" + i);_.b("            <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,2650,2680,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites identified as having significant heritage values.</p>");_.b("\n" + i);_.b("            <table data-paging=\"10\">");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th style=\"width:250px;\">Heritage Type</th>");_.b("\n" + i);_.b("                  <th>Number of Sites</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("              <tbody>");_.b("\n" + i);if(_.s(_.f("heritage",c,p,1),c,p,0,3113,3251,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <tr>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("COUNT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                </tr>");_.b("\n");});c.pop();}_.b("              </tbody>");_.b("\n" + i);_.b("            </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");};});c.pop();}if(_.s(_.f("hasInfrastructure",c,p,1),c,p,0,3387,4122,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Infrastructure</h4>");_.b("\n" + i);_.b("            <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,3523,3553,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites with existing infrastructure.</p>");_.b("\n" + i);_.b("            <table data-paging=\"10\">");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th style=\"width:250px;\">Type</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("              <tbody>");_.b("\n" + i);if(_.s(_.f("infrastructure",c,p,1),c,p,0,3920,4021,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <tr>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                </tr>");_.b("\n");});c.pop();}_.b("              </tbody>");_.b("\n" + i);_.b("            </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");};});c.pop();}});c.pop();}if(!_.s(_.f("hasUses",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Activities and Uses</h4>");_.b("\n" + i);_.b("        <p>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,4281,4291,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("  does <strong>not</strong> include any <strong>activities or uses</strong>.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};_.b("\n" + i);if(_.s(_.f("hasSeabirds",c,p,1),c,p,0,4468,5194,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Birds </h4>");_.b("\n" + i);if(_.s(_.f("hasSeabirdAreas",c,p,1),c,p,0,4556,4840,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <p class=\"large\"><strong>Important Seabird Areas</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("seabirds",c,p,1),c,p,0,4703,4783,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n");});c.pop();}_.b("    ");_.b("\n" + i);if(_.s(_.f("hasSeabirdColonies",c,p,1),c,p,0,4893,5163,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p class=\"large\"><strong>Seabird Colonies</strong></p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("seabird_colonies",c,p,1),c,p,0,5033,5105,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n");});c.pop();}_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("hasMarineSpecies",c,p,1),c,p,0,5232,5694,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Marine Mammals</h4>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>Species</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("mammals",c,p,1),c,p,0,5480,5560,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}if(_.s(_.f("seals",c,p,1),c,p,0,5595,5640,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(!_.s(_.f("hasMarineSpecies",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Species Information</h4>");_.b("\n" + i);_.b("        <p>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,5848,5882,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketches within the collection do ");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch does");};_.b(" <strong>not</strong> include any <strong>important marine mammal areas</strong>.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};return _.fl();;});

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = this["Templates"];
}
},{}]},{},[15])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9vdGFnby1yZXBvcnRzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvZW5hYmxlTGF5ZXJUb2dnbGVycy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvam9iSXRlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0UmVzdWx0cy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0VGFiLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvc2NyaXB0cy91dGlscy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9lbnZpcm9ubWVudC5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9maXNoaW5nLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9zY3JpcHRzL2lkcy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9vdmVydmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9yZXBvcnQuY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9vdGFnby1yZXBvcnRzL3NjcmlwdHMvdXNlcy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBLENBQU8sQ0FBVSxDQUFBLEdBQVgsQ0FBTixFQUFrQjtDQUNoQixLQUFBLDJFQUFBO0NBQUEsQ0FBQSxDQUFBO0NBQUEsQ0FDQSxDQUFBLEdBQVk7Q0FEWixDQUVBLENBQUEsR0FBTTtBQUNDLENBQVAsQ0FBQSxDQUFBLENBQUE7Q0FDRSxFQUFBLENBQUEsR0FBTyxxQkFBUDtDQUNBLFNBQUE7SUFMRjtDQUFBLENBTUEsQ0FBVyxDQUFBLElBQVgsYUFBVztDQUVYO0NBQUEsTUFBQSxvQ0FBQTt3QkFBQTtDQUNFLEVBQVcsQ0FBWCxHQUFXLENBQVg7Q0FBQSxFQUNTLENBQVQsRUFBQSxFQUFpQixLQUFSO0NBQ1Q7Q0FDRSxFQUFPLENBQVAsRUFBQSxVQUFPO0NBQVAsRUFD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Y3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsbnVsbCwibW9kdWxlLmV4cG9ydHMgPSAoZWwpIC0+XG4gICRlbCA9ICQgZWxcbiAgYXBwID0gd2luZG93LmFwcFxuICB0b2MgPSBhcHAuZ2V0VG9jKClcbiAgdW5sZXNzIHRvY1xuICAgIGNvbnNvbGUubG9nICdObyB0YWJsZSBvZiBjb250ZW50cyBmb3VuZCdcbiAgICByZXR1cm5cbiAgdG9nZ2xlcnMgPSAkZWwuZmluZCgnYVtkYXRhLXRvZ2dsZS1ub2RlXScpXG4gICMgU2V0IGluaXRpYWwgc3RhdGVcbiAgZm9yIHRvZ2dsZXIgaW4gdG9nZ2xlcnMudG9BcnJheSgpXG4gICAgJHRvZ2dsZXIgPSAkKHRvZ2dsZXIpXG4gICAgbm9kZWlkID0gJHRvZ2dsZXIuZGF0YSgndG9nZ2xlLW5vZGUnKVxuICAgIHRyeVxuICAgICAgdmlldyA9IHRvYy5nZXRDaGlsZFZpZXdCeUlkIG5vZGVpZFxuICAgICAgbm9kZSA9IHZpZXcubW9kZWxcbiAgICAgICR0b2dnbGVyLmF0dHIgJ2RhdGEtdmlzaWJsZScsICEhbm9kZS5nZXQoJ3Zpc2libGUnKVxuICAgICAgJHRvZ2dsZXIuZGF0YSAndG9jSXRlbScsIHZpZXdcbiAgICBjYXRjaCBlXG4gICAgICAkdG9nZ2xlci5hdHRyICdkYXRhLW5vdC1mb3VuZCcsICd0cnVlJ1xuXG4gIHRvZ2dsZXJzLm9uICdjbGljaycsIChlKSAtPlxuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICRlbCA9ICQoZS50YXJnZXQpXG4gICAgdmlldyA9ICRlbC5kYXRhKCd0b2NJdGVtJylcbiAgICBpZiB2aWV3XG4gICAgICB2aWV3LnRvZ2dsZVZpc2liaWxpdHkoZSlcbiAgICAgICRlbC5hdHRyICdkYXRhLXZpc2libGUnLCAhIXZpZXcubW9kZWwuZ2V0KCd2aXNpYmxlJylcbiAgICBlbHNlXG4gICAgICBhbGVydCBcIkxheWVyIG5vdCBmb3VuZCBpbiB0aGUgY3VycmVudCBUYWJsZSBvZiBDb250ZW50cy4gXFxuRXhwZWN0ZWQgbm9kZWlkICN7JGVsLmRhdGEoJ3RvZ2dsZS1ub2RlJyl9XCJcbiIsImNsYXNzIEpvYkl0ZW0gZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG4gIGNsYXNzTmFtZTogJ3JlcG9ydFJlc3VsdCdcbiAgZXZlbnRzOiB7fVxuICBiaW5kaW5nczpcbiAgICBcImg2IGFcIjpcbiAgICAgIG9ic2VydmU6IFwic2VydmljZU5hbWVcIlxuICAgICAgdXBkYXRlVmlldzogdHJ1ZVxuICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgbmFtZTogJ2hyZWYnXG4gICAgICAgIG9ic2VydmU6ICdzZXJ2aWNlVXJsJ1xuICAgICAgfV1cbiAgICBcIi5zdGFydGVkQXRcIjpcbiAgICAgIG9ic2VydmU6IFtcInN0YXJ0ZWRBdFwiLCBcInN0YXR1c1wiXVxuICAgICAgdmlzaWJsZTogKCkgLT5cbiAgICAgICAgQG1vZGVsLmdldCgnc3RhdHVzJykgbm90IGluIFsnY29tcGxldGUnLCAnZXJyb3InXVxuICAgICAgdXBkYXRlVmlldzogdHJ1ZVxuICAgICAgb25HZXQ6ICgpIC0+XG4gICAgICAgIGlmIEBtb2RlbC5nZXQoJ3N0YXJ0ZWRBdCcpXG4gICAgICAgICAgcmV0dXJuIFwiU3RhcnRlZCBcIiArIG1vbWVudChAbW9kZWwuZ2V0KCdzdGFydGVkQXQnKSkuZnJvbU5vdygpICsgXCIuIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBcIlwiXG4gICAgXCIuc3RhdHVzXCI6ICAgICAgXG4gICAgICBvYnNlcnZlOiBcInN0YXR1c1wiXG4gICAgICBvbkdldDogKHMpIC0+XG4gICAgICAgIHN3aXRjaCBzXG4gICAgICAgICAgd2hlbiAncGVuZGluZydcbiAgICAgICAgICAgIFwid2FpdGluZyBpbiBsaW5lXCJcbiAgICAgICAgICB3aGVuICdydW5uaW5nJ1xuICAgICAgICAgICAgXCJydW5uaW5nIGFuYWx5dGljYWwgc2VydmljZVwiXG4gICAgICAgICAgd2hlbiAnY29tcGxldGUnXG4gICAgICAgICAgICBcImNvbXBsZXRlZFwiXG4gICAgICAgICAgd2hlbiAnZXJyb3InXG4gICAgICAgICAgICBcImFuIGVycm9yIG9jY3VycmVkXCJcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBzXG4gICAgXCIucXVldWVMZW5ndGhcIjogXG4gICAgICBvYnNlcnZlOiBcInF1ZXVlTGVuZ3RoXCJcbiAgICAgIG9uR2V0OiAodikgLT5cbiAgICAgICAgcyA9IFwiV2FpdGluZyBiZWhpbmQgI3t2fSBqb2JcIlxuICAgICAgICBpZiB2Lmxlbmd0aCA+IDFcbiAgICAgICAgICBzICs9ICdzJ1xuICAgICAgICByZXR1cm4gcyArIFwiLiBcIlxuICAgICAgdmlzaWJsZTogKHYpIC0+XG4gICAgICAgIHY/IGFuZCBwYXJzZUludCh2KSA+IDBcbiAgICBcIi5lcnJvcnNcIjpcbiAgICAgIG9ic2VydmU6ICdlcnJvcidcbiAgICAgIHVwZGF0ZVZpZXc6IHRydWVcbiAgICAgIHZpc2libGU6ICh2KSAtPlxuICAgICAgICB2Py5sZW5ndGggPiAyXG4gICAgICBvbkdldDogKHYpIC0+XG4gICAgICAgIGlmIHY/XG4gICAgICAgICAgSlNPTi5zdHJpbmdpZnkodiwgbnVsbCwgJyAgJylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG51bGxcblxuICBjb25zdHJ1Y3RvcjogKEBtb2RlbCkgLT5cbiAgICBzdXBlcigpXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgIEAkZWwuaHRtbCBcIlwiXCJcbiAgICAgIDxoNj48YSBocmVmPVwiI1wiIHRhcmdldD1cIl9ibGFua1wiPjwvYT48c3BhbiBjbGFzcz1cInN0YXR1c1wiPjwvc3Bhbj48L2g2PlxuICAgICAgPGRpdj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJzdGFydGVkQXRcIj48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwicXVldWVMZW5ndGhcIj48L3NwYW4+XG4gICAgICAgIDxwcmUgY2xhc3M9XCJlcnJvcnNcIj48L3ByZT5cbiAgICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICAgIEBzdGlja2l0KClcblxubW9kdWxlLmV4cG9ydHMgPSBKb2JJdGVtIiwiY2xhc3MgUmVwb3J0UmVzdWx0cyBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuICBkZWZhdWx0UG9sbGluZ0ludGVydmFsOiAzMDAwXG5cbiAgY29uc3RydWN0b3I6IChAc2tldGNoLCBAZGVwcykgLT5cbiAgICBAdXJsID0gdXJsID0gXCIvcmVwb3J0cy8je0Bza2V0Y2guaWR9LyN7QGRlcHMuam9pbignLCcpfVwiXG4gICAgc3VwZXIoKVxuXG4gIHBvbGw6ICgpID0+XG4gICAgQGZldGNoIHtcbiAgICAgIHN1Y2Nlc3M6ICgpID0+XG4gICAgICAgIEB0cmlnZ2VyICdqb2JzJ1xuICAgICAgICBmb3IgcmVzdWx0IGluIEBtb2RlbHNcbiAgICAgICAgICBpZiByZXN1bHQuZ2V0KCdzdGF0dXMnKSBub3QgaW4gWydjb21wbGV0ZScsICdlcnJvciddXG4gICAgICAgICAgICB1bmxlc3MgQGludGVydmFsXG4gICAgICAgICAgICAgIEBpbnRlcnZhbCA9IHNldEludGVydmFsIEBwb2xsLCBAZGVmYXVsdFBvbGxpbmdJbnRlcnZhbFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgY29uc29sZS5sb2cgQG1vZGVsc1swXS5nZXQoJ3BheWxvYWRTaXplQnl0ZXMnKVxuICAgICAgICAgIHBheWxvYWRTaXplID0gTWF0aC5yb3VuZCgoKEBtb2RlbHNbMF0uZ2V0KCdwYXlsb2FkU2l6ZUJ5dGVzJykgb3IgMCkgLyAxMDI0KSAqIDEwMCkgLyAxMDBcbiAgICAgICAgICBjb25zb2xlLmxvZyBcIkZlYXR1cmVTZXQgc2VudCB0byBHUCB3ZWlnaGVkIGluIGF0ICN7cGF5bG9hZFNpemV9a2JcIlxuICAgICAgICAjIGFsbCBjb21wbGV0ZSB0aGVuXG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBpbnRlcnZhbCkgaWYgQGludGVydmFsXG4gICAgICAgIGlmIHByb2JsZW0gPSBfLmZpbmQoQG1vZGVscywgKHIpIC0+IHIuZ2V0KCdlcnJvcicpPylcbiAgICAgICAgICBAdHJpZ2dlciAnZXJyb3InLCBcIlByb2JsZW0gd2l0aCAje3Byb2JsZW0uZ2V0KCdzZXJ2aWNlTmFtZScpfSBqb2JcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHRyaWdnZXIgJ2ZpbmlzaGVkJ1xuICAgICAgZXJyb3I6IChlLCByZXMsIGEsIGIpID0+XG4gICAgICAgIHVubGVzcyByZXMuc3RhdHVzIGlzIDBcbiAgICAgICAgICBpZiByZXMucmVzcG9uc2VUZXh0Py5sZW5ndGhcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICBqc29uID0gSlNPTi5wYXJzZShyZXMucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICAgIyBkbyBub3RoaW5nXG4gICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGludGVydmFsKSBpZiBAaW50ZXJ2YWxcbiAgICAgICAgICBAdHJpZ2dlciAnZXJyb3InLCBqc29uPy5lcnJvcj8ubWVzc2FnZSBvclxuICAgICAgICAgICAgJ1Byb2JsZW0gY29udGFjdGluZyB0aGUgU2VhU2tldGNoIHNlcnZlcidcbiAgICB9XG5cbm1vZHVsZS5leHBvcnRzID0gUmVwb3J0UmVzdWx0c1xuIiwiZW5hYmxlTGF5ZXJUb2dnbGVycyA9IHJlcXVpcmUgJy4vZW5hYmxlTGF5ZXJUb2dnbGVycy5jb2ZmZWUnXG5yb3VuZCA9IHJlcXVpcmUoJy4vdXRpbHMuY29mZmVlJykucm91bmRcblJlcG9ydFJlc3VsdHMgPSByZXF1aXJlICcuL3JlcG9ydFJlc3VsdHMuY29mZmVlJ1xudCA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnKVxudGVtcGxhdGVzID1cbiAgcmVwb3J0TG9hZGluZzogdFsnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3JlcG9ydExvYWRpbmcnXVxuSm9iSXRlbSA9IHJlcXVpcmUgJy4vam9iSXRlbS5jb2ZmZWUnXG5Db2xsZWN0aW9uVmlldyA9IHJlcXVpcmUoJ3ZpZXdzL2NvbGxlY3Rpb25WaWV3JylcblxuY2xhc3MgUmVjb3JkU2V0XG5cbiAgY29uc3RydWN0b3I6IChAZGF0YSwgQHRhYiwgQHNrZXRjaENsYXNzSWQpIC0+XG5cbiAgdG9BcnJheTogKCkgLT5cbiAgICBpZiBAc2tldGNoQ2xhc3NJZFxuICAgICAgZGF0YSA9IF8uZmluZCBAZGF0YS52YWx1ZSwgKHYpID0+XG4gICAgICAgIHYuZmVhdHVyZXM/WzBdPy5hdHRyaWJ1dGVzP1snU0NfSUQnXSBpcyBAc2tldGNoQ2xhc3NJZFxuICAgICAgdW5sZXNzIGRhdGFcbiAgICAgICAgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBkYXRhIGZvciBza2V0Y2hDbGFzcyAje0Bza2V0Y2hDbGFzc0lkfVwiXG4gICAgZWxzZVxuICAgICAgaWYgXy5pc0FycmF5IEBkYXRhLnZhbHVlXG4gICAgICAgIGRhdGEgPSBAZGF0YS52YWx1ZVswXVxuICAgICAgZWxzZVxuICAgICAgICBkYXRhID0gQGRhdGEudmFsdWVcbiAgICBfLm1hcCBkYXRhLmZlYXR1cmVzLCAoZmVhdHVyZSkgLT5cbiAgICAgIGZlYXR1cmUuYXR0cmlidXRlc1xuXG4gIHJhdzogKGF0dHIpIC0+XG4gICAgYXR0cnMgPSBfLm1hcCBAdG9BcnJheSgpLCAocm93KSAtPlxuICAgICAgcm93W2F0dHJdXG4gICAgYXR0cnMgPSBfLmZpbHRlciBhdHRycywgKGF0dHIpIC0+IGF0dHIgIT0gdW5kZWZpbmVkXG4gICAgaWYgYXR0cnMubGVuZ3RoIGlzIDBcbiAgICAgIGNvbnNvbGUubG9nIEBkYXRhXG4gICAgICBAdGFiLnJlcG9ydEVycm9yIFwiQ291bGQgbm90IGdldCBhdHRyaWJ1dGUgI3thdHRyfSBmcm9tIHJlc3VsdHNcIlxuICAgICAgdGhyb3cgXCJDb3VsZCBub3QgZ2V0IGF0dHJpYnV0ZSAje2F0dHJ9XCJcbiAgICBlbHNlIGlmIGF0dHJzLmxlbmd0aCBpcyAxXG4gICAgICByZXR1cm4gYXR0cnNbMF1cbiAgICBlbHNlXG4gICAgICByZXR1cm4gYXR0cnNcblxuICBpbnQ6IChhdHRyKSAtPlxuICAgIHJhdyA9IEByYXcoYXR0cilcbiAgICBpZiBfLmlzQXJyYXkocmF3KVxuICAgICAgXy5tYXAgcmF3LCBwYXJzZUludFxuICAgIGVsc2VcbiAgICAgIHBhcnNlSW50KHJhdylcblxuICBmbG9hdDogKGF0dHIsIGRlY2ltYWxQbGFjZXM9MikgLT5cbiAgICByYXcgPSBAcmF3KGF0dHIpXG4gICAgaWYgXy5pc0FycmF5KHJhdylcbiAgICAgIF8ubWFwIHJhdywgKHZhbCkgLT4gcm91bmQodmFsLCBkZWNpbWFsUGxhY2VzKVxuICAgIGVsc2VcbiAgICAgIHJvdW5kKHJhdywgZGVjaW1hbFBsYWNlcylcblxuICBib29sOiAoYXR0cikgLT5cbiAgICByYXcgPSBAcmF3KGF0dHIpXG4gICAgaWYgXy5pc0FycmF5KHJhdylcbiAgICAgIF8ubWFwIHJhdywgKHZhbCkgLT4gdmFsLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSBpcyAndHJ1ZSdcbiAgICBlbHNlXG4gICAgICByYXcudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpIGlzICd0cnVlJ1xuXG5jbGFzcyBSZXBvcnRUYWIgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG4gIG5hbWU6ICdJbmZvcm1hdGlvbidcbiAgZGVwZW5kZW5jaWVzOiBbXVxuXG4gIGluaXRpYWxpemU6IChAbW9kZWwsIEBvcHRpb25zKSAtPlxuICAgICMgV2lsbCBiZSBpbml0aWFsaXplZCBieSBTZWFTa2V0Y2ggd2l0aCB0aGUgZm9sbG93aW5nIGFyZ3VtZW50czpcbiAgICAjICAgKiBtb2RlbCAtIFRoZSBza2V0Y2ggYmVpbmcgcmVwb3J0ZWQgb25cbiAgICAjICAgKiBvcHRpb25zXG4gICAgIyAgICAgLSAucGFyZW50IC0gdGhlIHBhcmVudCByZXBvcnQgdmlld1xuICAgICMgICAgICAgIGNhbGwgQG9wdGlvbnMucGFyZW50LmRlc3Ryb3koKSB0byBjbG9zZSB0aGUgd2hvbGUgcmVwb3J0IHdpbmRvd1xuICAgIEBhcHAgPSB3aW5kb3cuYXBwXG4gICAgXy5leHRlbmQgQCwgQG9wdGlvbnNcbiAgICBAcmVwb3J0UmVzdWx0cyA9IG5ldyBSZXBvcnRSZXN1bHRzKEBtb2RlbCwgQGRlcGVuZGVuY2llcylcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAnZXJyb3InLCBAcmVwb3J0RXJyb3JcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAnam9icycsIEByZW5kZXJKb2JEZXRhaWxzXG4gICAgQGxpc3RlblRvT25jZSBAcmVwb3J0UmVzdWx0cywgJ2pvYnMnLCBAcmVwb3J0Sm9ic1xuICAgIEBsaXN0ZW5UbyBAcmVwb3J0UmVzdWx0cywgJ2ZpbmlzaGVkJywgXy5iaW5kIEByZW5kZXIsIEBcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAncmVxdWVzdCcsIEByZXBvcnRSZXF1ZXN0ZWRcblxuICByZW5kZXI6ICgpIC0+XG4gICAgdGhyb3cgJ3JlbmRlciBtZXRob2QgbXVzdCBiZSBvdmVyaWRkZW4nXG5cbiAgc2hvdzogKCkgLT5cbiAgICBAJGVsLnNob3coKVxuICAgIEB2aXNpYmxlID0gdHJ1ZVxuICAgIGlmIEBkZXBlbmRlbmNpZXM/Lmxlbmd0aCBhbmQgIUByZXBvcnRSZXN1bHRzLm1vZGVscy5sZW5ndGhcbiAgICAgIEByZXBvcnRSZXN1bHRzLnBvbGwoKVxuICAgIGVsc2UgaWYgIUBkZXBlbmRlbmNpZXM/Lmxlbmd0aFxuICAgICAgQHJlbmRlcigpXG4gICAgICBAJCgnW2RhdGEtYXR0cmlidXRlLXR5cGU9VXJsRmllbGRdIC52YWx1ZSwgW2RhdGEtYXR0cmlidXRlLXR5cGU9VXBsb2FkRmllbGRdIC52YWx1ZScpLmVhY2ggKCkgLT5cbiAgICAgICAgdGV4dCA9ICQoQCkudGV4dCgpXG4gICAgICAgIGh0bWwgPSBbXVxuICAgICAgICBmb3IgdXJsIGluIHRleHQuc3BsaXQoJywnKVxuICAgICAgICAgIGlmIHVybC5sZW5ndGhcbiAgICAgICAgICAgIG5hbWUgPSBfLmxhc3QodXJsLnNwbGl0KCcvJykpXG4gICAgICAgICAgICBodG1sLnB1c2ggXCJcIlwiPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPiN7bmFtZX08L2E+XCJcIlwiXG4gICAgICAgICQoQCkuaHRtbCBodG1sLmpvaW4oJywgJylcblxuXG4gIGhpZGU6ICgpIC0+XG4gICAgQCRlbC5oaWRlKClcbiAgICBAdmlzaWJsZSA9IGZhbHNlXG5cbiAgcmVtb3ZlOiAoKSA9PlxuICAgIHdpbmRvdy5jbGVhckludGVydmFsIEBldGFJbnRlcnZhbFxuICAgIEBzdG9wTGlzdGVuaW5nKClcbiAgICBzdXBlcigpXG5cbiAgcmVwb3J0UmVxdWVzdGVkOiAoKSA9PlxuICAgIEAkZWwuaHRtbCB0ZW1wbGF0ZXMucmVwb3J0TG9hZGluZy5yZW5kZXIoe30pXG5cbiAgcmVwb3J0RXJyb3I6IChtc2csIGNhbmNlbGxlZFJlcXVlc3QpID0+XG4gICAgdW5sZXNzIGNhbmNlbGxlZFJlcXVlc3RcbiAgICAgIGlmIG1zZyBpcyAnSk9CX0VSUk9SJ1xuICAgICAgICBAc2hvd0Vycm9yICdFcnJvciB3aXRoIHNwZWNpZmljIGpvYidcbiAgICAgIGVsc2VcbiAgICAgICAgQHNob3dFcnJvciBtc2dcblxuICBzaG93RXJyb3I6IChtc2cpID0+XG4gICAgQCQoJy5wcm9ncmVzcycpLnJlbW92ZSgpXG4gICAgQCQoJ3AuZXJyb3InKS5yZW1vdmUoKVxuICAgIEAkKCdoNCcpLnRleHQoXCJBbiBFcnJvciBPY2N1cnJlZFwiKS5hZnRlciBcIlwiXCJcbiAgICAgIDxwIGNsYXNzPVwiZXJyb3JcIiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO1wiPiN7bXNnfTwvcD5cbiAgICBcIlwiXCJcblxuICByZXBvcnRKb2JzOiAoKSA9PlxuICAgIHVubGVzcyBAbWF4RXRhXG4gICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS53aWR0aCgnMTAwJScpXG4gICAgQCQoJ2g0JykudGV4dCBcIkFuYWx5emluZyBEZXNpZ25zXCJcblxuICBzdGFydEV0YUNvdW50ZG93bjogKCkgPT5cbiAgICBpZiBAbWF4RXRhXG4gICAgICBfLmRlbGF5ICgpID0+XG4gICAgICAgIEByZXBvcnRSZXN1bHRzLnBvbGwoKVxuICAgICAgLCAoQG1heEV0YSArIDEpICogMTAwMFxuICAgICAgXy5kZWxheSAoKSA9PlxuICAgICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS5jc3MgJ3RyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uJywgJ2xpbmVhcidcbiAgICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykuY3NzICd0cmFuc2l0aW9uLWR1cmF0aW9uJywgXCIje0BtYXhFdGEgKyAxfXNcIlxuICAgICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS53aWR0aCgnMTAwJScpXG4gICAgICAsIDUwMFxuXG4gIHJlbmRlckpvYkRldGFpbHM6ICgpID0+XG4gICAgbWF4RXRhID0gbnVsbFxuICAgIGZvciBqb2IgaW4gQHJlcG9ydFJlc3VsdHMubW9kZWxzXG4gICAgICBpZiBqb2IuZ2V0KCdldGFTZWNvbmRzJylcbiAgICAgICAgaWYgIW1heEV0YSBvciBqb2IuZ2V0KCdldGFTZWNvbmRzJykgPiBtYXhFdGFcbiAgICAgICAgICBtYXhFdGEgPSBqb2IuZ2V0KCdldGFTZWNvbmRzJylcbiAgICBpZiBtYXhFdGFcbiAgICAgIEBtYXhFdGEgPSBtYXhFdGFcbiAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLndpZHRoKCc1JScpXG4gICAgICBAc3RhcnRFdGFDb3VudGRvd24oKVxuXG4gICAgQCQoJ1tyZWw9ZGV0YWlsc10nKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKVxuICAgIEAkKCdbcmVsPWRldGFpbHNdJykuY2xpY2sgKGUpID0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIEAkKCdbcmVsPWRldGFpbHNdJykuaGlkZSgpXG4gICAgICBAJCgnLmRldGFpbHMnKS5zaG93KClcbiAgICBmb3Igam9iIGluIEByZXBvcnRSZXN1bHRzLm1vZGVsc1xuICAgICAgaXRlbSA9IG5ldyBKb2JJdGVtKGpvYilcbiAgICAgIGl0ZW0ucmVuZGVyKClcbiAgICAgIEAkKCcuZGV0YWlscycpLmFwcGVuZCBpdGVtLmVsXG5cbiAgZ2V0UmVzdWx0OiAoaWQpIC0+XG4gICAgcmVzdWx0cyA9IEBnZXRSZXN1bHRzKClcbiAgICByZXN1bHQgPSBfLmZpbmQgcmVzdWx0cywgKHIpIC0+IHIucGFyYW1OYW1lIGlzIGlkXG4gICAgdW5sZXNzIHJlc3VsdD9cbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gcmVzdWx0IHdpdGggaWQgJyArIGlkKVxuICAgIHJlc3VsdC52YWx1ZVxuXG4gIGdldEZpcnN0UmVzdWx0OiAocGFyYW0sIGlkKSAtPlxuICAgIHJlc3VsdCA9IEBnZXRSZXN1bHQocGFyYW0pXG4gICAgdHJ5XG4gICAgICByZXR1cm4gcmVzdWx0WzBdLmZlYXR1cmVzWzBdLmF0dHJpYnV0ZXNbaWRdXG4gICAgY2F0Y2ggZVxuICAgICAgdGhyb3cgXCJFcnJvciBmaW5kaW5nICN7cGFyYW19OiN7aWR9IGluIGdwIHJlc3VsdHNcIlxuXG4gIGdldFJlc3VsdHM6ICgpIC0+XG4gICAgcmVzdWx0cyA9IEByZXBvcnRSZXN1bHRzLm1hcCgocmVzdWx0KSAtPiByZXN1bHQuZ2V0KCdyZXN1bHQnKS5yZXN1bHRzKVxuICAgIHVubGVzcyByZXN1bHRzPy5sZW5ndGhcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZ3AgcmVzdWx0cycpXG4gICAgXy5maWx0ZXIgcmVzdWx0cywgKHJlc3VsdCkgLT5cbiAgICAgIHJlc3VsdC5wYXJhbU5hbWUgbm90IGluIFsnUmVzdWx0Q29kZScsICdSZXN1bHRNc2cnXVxuXG4gIHJlY29yZFNldDogKGRlcGVuZGVuY3ksIHBhcmFtTmFtZSwgc2tldGNoQ2xhc3NJZD1mYWxzZSkgLT5cbiAgICB1bmxlc3MgZGVwZW5kZW5jeSBpbiBAZGVwZW5kZW5jaWVzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJVbmtub3duIGRlcGVuZGVuY3kgI3tkZXBlbmRlbmN5fVwiXG4gICAgZGVwID0gQHJlcG9ydFJlc3VsdHMuZmluZCAocikgLT4gci5nZXQoJ3NlcnZpY2VOYW1lJykgaXMgZGVwZW5kZW5jeVxuICAgIHVubGVzcyBkZXBcbiAgICAgIGNvbnNvbGUubG9nIEByZXBvcnRSZXN1bHRzLm1vZGVsc1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ291bGQgbm90IGZpbmQgcmVzdWx0cyBmb3IgI3tkZXBlbmRlbmN5fS5cIlxuICAgIHBhcmFtID0gXy5maW5kIGRlcC5nZXQoJ3Jlc3VsdCcpLnJlc3VsdHMsIChwYXJhbSkgLT5cbiAgICAgIHBhcmFtLnBhcmFtTmFtZSBpcyBwYXJhbU5hbWVcbiAgICB1bmxlc3MgcGFyYW1cbiAgICAgIGNvbnNvbGUubG9nIGRlcC5nZXQoJ2RhdGEnKS5yZXN1bHRzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDb3VsZCBub3QgZmluZCBwYXJhbSAje3BhcmFtTmFtZX0gaW4gI3tkZXBlbmRlbmN5fVwiXG4gICAgbmV3IFJlY29yZFNldChwYXJhbSwgQCwgc2tldGNoQ2xhc3NJZClcblxuICBlbmFibGVUYWJsZVBhZ2luZzogKCkgLT5cbiAgICBAJCgnW2RhdGEtcGFnaW5nXScpLmVhY2ggKCkgLT5cbiAgICAgICR0YWJsZSA9ICQoQClcbiAgICAgIHBhZ2VTaXplID0gJHRhYmxlLmRhdGEoJ3BhZ2luZycpXG4gICAgICByb3dzID0gJHRhYmxlLmZpbmQoJ3Rib2R5IHRyJykubGVuZ3RoXG4gICAgICBwYWdlcyA9IE1hdGguY2VpbChyb3dzIC8gcGFnZVNpemUpXG4gICAgICBpZiBwYWdlcyA+IDFcbiAgICAgICAgJHRhYmxlLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgICA8dGZvb3Q+XG4gICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgIDx0ZCBjb2xzcGFuPVwiI3skdGFibGUuZmluZCgndGhlYWQgdGgnKS5sZW5ndGh9XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBhZ2luYXRpb25cIj5cbiAgICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjXCI+UHJldjwvYT48L2xpPlxuICAgICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgPC90Zm9vdD5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIHVsID0gJHRhYmxlLmZpbmQoJ3Rmb290IHVsJylcbiAgICAgICAgZm9yIGkgaW4gXy5yYW5nZSgxLCBwYWdlcyArIDEpXG4gICAgICAgICAgdWwuYXBwZW5kIFwiXCJcIlxuICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjXCI+I3tpfTwvYT48L2xpPlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICB1bC5hcHBlbmQgXCJcIlwiXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XCIjXCI+TmV4dDwvYT48L2xpPlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgJHRhYmxlLmZpbmQoJ2xpIGEnKS5jbGljayAoZSkgLT5cbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAkYSA9ICQodGhpcylcbiAgICAgICAgICB0ZXh0ID0gJGEudGV4dCgpXG4gICAgICAgICAgaWYgdGV4dCBpcyAnTmV4dCdcbiAgICAgICAgICAgIGEgPSAkYS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuYWN0aXZlJykubmV4dCgpLmZpbmQoJ2EnKVxuICAgICAgICAgICAgdW5sZXNzIGEudGV4dCgpIGlzICdOZXh0J1xuICAgICAgICAgICAgICBhLmNsaWNrKClcbiAgICAgICAgICBlbHNlIGlmIHRleHQgaXMgJ1ByZXYnXG4gICAgICAgICAgICBhID0gJGEucGFyZW50KCkucGFyZW50KCkuZmluZCgnLmFjdGl2ZScpLnByZXYoKS5maW5kKCdhJylcbiAgICAgICAgICAgIHVubGVzcyBhLnRleHQoKSBpcyAnUHJldidcbiAgICAgICAgICAgICAgYS5jbGljaygpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgJGEucGFyZW50KCkucGFyZW50KCkuZmluZCgnLmFjdGl2ZScpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkYS5wYXJlbnQoKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgbiA9IHBhcnNlSW50KHRleHQpXG4gICAgICAgICAgICAkdGFibGUuZmluZCgndGJvZHkgdHInKS5oaWRlKClcbiAgICAgICAgICAgIG9mZnNldCA9IHBhZ2VTaXplICogKG4gLSAxKVxuICAgICAgICAgICAgJHRhYmxlLmZpbmQoXCJ0Ym9keSB0clwiKS5zbGljZShvZmZzZXQsIG4qcGFnZVNpemUpLnNob3coKVxuICAgICAgICAkKCR0YWJsZS5maW5kKCdsaSBhJylbMV0pLmNsaWNrKClcblxuICAgICAgaWYgbm9Sb3dzTWVzc2FnZSA9ICR0YWJsZS5kYXRhKCduby1yb3dzJylcbiAgICAgICAgaWYgcm93cyBpcyAwXG4gICAgICAgICAgcGFyZW50ID0gJHRhYmxlLnBhcmVudCgpXG4gICAgICAgICAgJHRhYmxlLnJlbW92ZSgpXG4gICAgICAgICAgcGFyZW50LnJlbW92ZUNsYXNzICd0YWJsZUNvbnRhaW5lcidcbiAgICAgICAgICBwYXJlbnQuYXBwZW5kIFwiPHA+I3tub1Jvd3NNZXNzYWdlfTwvcD5cIlxuXG4gIGVuYWJsZUxheWVyVG9nZ2xlcnM6ICgpIC0+XG4gICAgZW5hYmxlTGF5ZXJUb2dnbGVycyhAJGVsKVxuXG4gIGdldENoaWxkcmVuOiAoc2tldGNoQ2xhc3NJZCkgLT5cbiAgICBfLmZpbHRlciBAY2hpbGRyZW4sIChjaGlsZCkgLT4gY2hpbGQuZ2V0U2tldGNoQ2xhc3MoKS5pZCBpcyBza2V0Y2hDbGFzc0lkXG5cblxubW9kdWxlLmV4cG9ydHMgPSBSZXBvcnRUYWJcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgXG4gIHJvdW5kOiAobnVtYmVyLCBkZWNpbWFsUGxhY2VzKSAtPlxuICAgIHVubGVzcyBfLmlzTnVtYmVyIG51bWJlclxuICAgICAgbnVtYmVyID0gcGFyc2VGbG9hdChudW1iZXIpXG4gICAgbXVsdGlwbGllciA9IE1hdGgucG93IDEwLCBkZWNpbWFsUGxhY2VzXG4gICAgTWF0aC5yb3VuZChudW1iZXIgKiBtdWx0aXBsaWVyKSAvIG11bHRpcGxpZXIiLCJ0aGlzW1wiVGVtcGxhdGVzXCJdID0gdGhpc1tcIlRlbXBsYXRlc1wiXSB8fCB7fTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvYXR0cmlidXRlcy9hdHRyaWJ1dGVJdGVtXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjx0ciBkYXRhLWF0dHJpYnV0ZS1pZD1cXFwiXCIpO18uYihfLnYoXy5mKFwiaWRcIixjLHAsMCkpKTtfLmIoXCJcXFwiIGRhdGEtYXR0cmlidXRlLWV4cG9ydGlkPVxcXCJcIik7Xy5iKF8udihfLmYoXCJleHBvcnRpZFwiLGMscCwwKSkpO18uYihcIlxcXCIgZGF0YS1hdHRyaWJ1dGUtdHlwZT1cXFwiXCIpO18uYihfLnYoXy5mKFwidHlwZVwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8dGQgY2xhc3M9XFxcIm5hbWVcXFwiPlwiKTtfLmIoXy52KF8uZihcIm5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHRkIGNsYXNzPVxcXCJ2YWx1ZVxcXCI+XCIpO18uYihfLnYoXy5mKFwiZm9ybWF0dGVkVmFsdWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvdHI+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvYXR0cmlidXRlcy9hdHRyaWJ1dGVzVGFibGVcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPHRhYmxlIGNsYXNzPVxcXCJhdHRyaWJ1dGVzXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiYXR0cmlidXRlc1wiLGMscCwxKSxjLHAsMCw0NCw4MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKF8ucnAoXCJhdHRyaWJ1dGVzL2F0dHJpYnV0ZUl0ZW1cIixjLHAsXCIgICAgXCIpKTt9KTtjLnBvcCgpO31fLmIoXCI8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wibm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL2dlbmVyaWNBdHRyaWJ1dGVzXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO2lmKF8ucyhfLmQoXCJza2V0Y2hDbGFzcy5kZWxldGVkXCIsYyxwLDEpLGMscCwwLDI0LDI3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtd2FyblxcXCIgc3R5bGU9XFxcIm1hcmdpbi1ib3R0b206MTBweDtcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgVGhpcyBza2V0Y2ggd2FzIGNyZWF0ZWQgdXNpbmcgdGhlIFxcXCJcIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiB0ZW1wbGF0ZSwgd2hpY2ggaXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIG5vIGxvbmdlciBhdmFpbGFibGUuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIGNvcHkgdGhpcyBza2V0Y2ggb3IgbWFrZSBuZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIHNrZXRjaGVzIG9mIHRoaXMgdHlwZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCIgQXR0cmlidXRlczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKF8ucnAoXCJhdHRyaWJ1dGVzL2F0dHJpYnV0ZXNUYWJsZVwiLGMscCxcIiAgICBcIikpO18uYihcIiAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9yZXBvcnRMb2FkaW5nXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydExvYWRpbmdcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPCEtLSA8ZGl2IGNsYXNzPVxcXCJzcGlubmVyXFxcIj4zPC9kaXY+IC0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PlJlcXVlc3RpbmcgUmVwb3J0IGZyb20gU2VydmVyPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInByb2dyZXNzIHByb2dyZXNzLXN0cmlwZWQgYWN0aXZlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwiYmFyXFxcIiBzdHlsZT1cXFwid2lkdGg6IDEwMCU7XFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGEgaHJlZj1cXFwiI1xcXCIgcmVsPVxcXCJkZXRhaWxzXFxcIj5kZXRhaWxzPC9hPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJkZXRhaWxzXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcblxuaWYodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHRoaXNbXCJUZW1wbGF0ZXNcIl07XG59IiwiUmVwb3J0VGFiID0gcmVxdWlyZSAncmVwb3J0VGFiJ1xudGVtcGxhdGVzID0gcmVxdWlyZSAnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxuX3BhcnRpYWxzID0gcmVxdWlyZSAnLi4vbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cbmlkcyA9IHJlcXVpcmUgJy4vaWRzLmNvZmZlZSdcbmZvciBrZXksIHZhbHVlIG9mIGlkc1xuICB3aW5kb3dba2V5XSA9IHZhbHVlXG5cblxuY2xhc3MgRW52aXJvbm1lbnRUYWIgZXh0ZW5kcyBSZXBvcnRUYWJcbiAgIyB0aGlzIGlzIHRoZSBuYW1lIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIFRhYlxuICBuYW1lOiAnSGFiaXRhdHMnXG4gIGNsYXNzTmFtZTogJ2Vudmlyb25tZW50J1xuICB0aW1lb3V0OiAxMjAwMDBcbiAgdGVtcGxhdGU6IHRlbXBsYXRlcy5lbnZpcm9ubWVudFxuICBkZXBlbmRlbmNpZXM6IFtcbiAgICAnSGFiaXRhdHNPdmVydmlldydcbiAgICAnQWRqYWNlbnRUZXJyZXN0cmlhbCdcbiAgICAnTmV3SGFiUmVwc1Rvb2xib3gnXG4gIF1cblxuICByZW5kZXI6ICgpIC0+XG5cbiAgICAjc2hvdyB0YWJsZXMgaW5zdGVhZCBvZiBncmFwaCBmb3IgSUVcbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIGQzSXNQcmVzZW50ID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGQzSXNQcmVzZW50ID0gZmFsc2VcblxuICAgIGlzQ29sbGVjdGlvbiA9IEBtb2RlbC5pc0NvbGxlY3Rpb24oKVxuICAgIHNjaWQgPSBAc2tldGNoQ2xhc3MuaWRcblxuICAgIGlmIHNjaWQgPT0gR0VORVJJQ19JRCBvciBzY2lkID09IEdFTkVSSUNfQ09MTEVDVElPTl9JRFxuICAgICAgaXNHZW5lcmljID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGlzR2VuZXJpYyA9IGZhbHNlXG5cbiAgICBpc01QQSA9IChzY2lkID09IE1QQV9JRCBvciBzY2lkID09IE1QQV9DT0xMRUNUSU9OX0lEIG9yIHNjaWQgPT0gTVBBX0NPTkZJRF9DT0xMRUNUSU9OX0lEKVxuICAgIFxuICAgIGhhYl9zaXplcyA9IEByZWNvcmRTZXQoJ05ld0hhYlJlcHNUb29sYm94JywgJ0hhYlNpemVzJykudG9BcnJheSgpXG5cbiAgICBoYWJzX2luX3NrZXRjaCA9IGhhYl9zaXplcz8ubGVuZ3RoXG4gICAgaGFic19wbHVyYWwgPSBoYWJzX2luX3NrZXRjaCAhPSAxXG5cbiAgICBwcm90ZWN0ZWRfYXJlYXMgPSBAcmVjb3JkU2V0KCdBZGphY2VudFRlcnJlc3RyaWFsJywgJ1B1YmxpY0NvbnNlcnZhdGlvbkxhbmQnKS50b0FycmF5KClcbiAgICBoYXNQcm90ZWN0ZWQgPSBwcm90ZWN0ZWRfYXJlYXM/Lmxlbmd0aCA+IDBcblxuICAgIHFlMl9jb3ZlbmFudHMgPSBAcmVjb3JkU2V0KCdBZGphY2VudFRlcnJlc3RyaWFsJywgJ0NvYXN0YWxQcm90ZWN0aW9uJykudG9BcnJheSgpXG4gICAgaGFzUUUyY292ZW5hbnRzID0gcWUyX2NvdmVuYW50cz8ubGVuZ3RoID4gMFxuXG4gICAgbmFwYWxpc19jb3ZlbmFudHMgPSBAcmVjb3JkU2V0KCdBZGphY2VudFRlcnJlc3RyaWFsJywgJ0FkamFjZW50TGFuZENvdmVyJykudG9BcnJheSgpXG4gICAgaGFzTmFwYWxpc0NvdmVuYW50cyA9IG5hcGFsaXNfY292ZW5hbnRzPy5sZW5ndGggPiAwXG5cbiAgICBoYXNDb3ZlbmFudHMgPSAoaGFzUUUyY292ZW5hbnRzIG9yIGhhc05hcGFsaXNDb3ZlbmFudHMpXG5cbiAgICBpZiBpc0dlbmVyaWMgb3IgKCFpc0NvbGxlY3Rpb24gYW5kIGlzTVBBKVxuICAgICAgc2hvd0FkamFjZW50ID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIHNob3dBZGphY2VudCA9IGZhbHNlXG4gICAgXG5cbiAgICBSRVBfTkFNRSA9IFwiUGF0Y2ggU2l6ZSAoVHlwZS0xKVwiXG4gICAgaXNDb25maWQgPSBmYWxzZVxuICAgIGhhYml0YXRzX3JlcHJlc2VudGVkID0gQHJlY29yZFNldCgnTmV3SGFiUmVwc1Rvb2xib3gnLCAnUmVwcmVzZW50ZWRIYWJzJykudG9BcnJheSgpXG4gICAgY29uc29sZS5sb2coXCJoYWJzOjo6OlwiLCBoYWJpdGF0c19yZXByZXNlbnRlZClcbiAgICBAcm91bmREYXRhIGhhYml0YXRzX3JlcHJlc2VudGVkXG4gICAgbm9SZXNlcnZlVHlwZXMgPSBAaGFzTm9SZXNlcnZlVHlwZXMgQG1vZGVsLmdldENoaWxkcmVuKClcbiAgICBcbiAgICBhbGxfaGFicyA9IEBwcm9jZXNzSGFiaXRhdHMoaGFiaXRhdHNfcmVwcmVzZW50ZWQsIG5vUmVzZXJ2ZVR5cGVzKVxuIFxuICAgIGNvYXN0YWxfaGFiX3R5cGVzID0gYWxsX2hhYnNbMF1cbiAgICBoYXNDb2FzdGFsSGFiVHlwZXMgPSBjb2FzdGFsX2hhYl90eXBlcz8ubGVuZ3RoID4gMFxuICAgIGVzdHVhcmluZV9oYWJfdHlwZXMgPSBhbGxfaGFic1sxXVxuICAgIGhhc0VzdHVhcmluZUhhYlR5cGVzID0gZXN0dWFyaW5lX2hhYl90eXBlcz8ubGVuZ3RoID4gMFxuICAgIHNpZ19oYWJzID0gYWxsX2hhYnNbMl1cbiAgICBoYXNTaWdIYWJzID0gc2lnX2hhYnM/Lmxlbmd0aCA+IDBcbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuIFxuICAgIGNvbnRleHQgPVxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcbiAgICAgIGlzR2VuZXJpYzogaXNHZW5lcmljXG4gICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuICAgICAgaXNNUEE6IGlzTVBBXG5cbiAgICAgIGNvYXN0YWxfaGFiX3R5cGVzOiBjb2FzdGFsX2hhYl90eXBlc1xuICAgICAgaGFzQ29hc3RhbEhhYlR5cGVzOiBoYXNDb2FzdGFsSGFiVHlwZXNcbiAgICAgIGVzdHVhcmluZV9oYWJfdHlwZXM6IGVzdHVhcmluZV9oYWJfdHlwZXNcbiAgICAgIGhhc0VzdHVhcmluZUhhYlR5cGVzOiBoYXNFc3R1YXJpbmVIYWJUeXBlc1xuXG4gICAgICBzaWdfaGFiczogc2lnX2hhYnNcbiAgICAgIGhhc1NpZ0hhYnM6IGhhc1NpZ0hhYnNcblxuICAgICAgaGFic19wbHVyYWw6IGhhYnNfcGx1cmFsXG4gICAgICBoYWJpdGF0c19yZXByZXNlbnRlZDogaGFiaXRhdHNfcmVwcmVzZW50ZWRcblxuICAgICAgcHJvdGVjdGVkX2FyZWFzOiBwcm90ZWN0ZWRfYXJlYXNcbiAgICAgIGhhc1Byb3RlY3RlZDogaGFzUHJvdGVjdGVkXG5cbiAgICAgIHFlMl9jb3ZlbmFudHM6IHFlMl9jb3ZlbmFudHNcbiAgICAgIGhhc1FFMmNvdmVuYW50czogaGFzUUUyY292ZW5hbnRzXG5cbiAgICAgIG5hcGFsaXNfY292ZW5hbnRzOiBuYXBhbGlzX2NvdmVuYW50c1xuICAgICAgaGFzTmFwYWxpc0NvdmVuYW50czogaGFzTmFwYWxpc0NvdmVuYW50c1xuXG4gICAgICBoYXNDb3ZlbmFudHM6IGhhc0NvdmVuYW50c1xuICAgICAgc2hvd0FkamFjZW50OiBzaG93QWRqYWNlbnRcbiAgICAgIFxuICAgICAgI29ubHkgbmVlZGVkIHdoaWxlIHdlIGhhdmUgSW5jbHVkZWQvUGF0Y2ggU2l6ZSBiZWhhdmluZyBkaWZmZXJlbnRseSBmb3IgTVBBIChjb25maWQpIGFuZCBNUEFcbiAgICAgIFJFUF9OQU1FOiBSRVBfTkFNRVxuICAgICAgaXNDb25maWQ6IGlzQ29uZmlkXG5cbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcbiAgICBAZW5hYmxlTGF5ZXJUb2dnbGVycygpXG4gICAgQHJvdW5kRGF0YShoYWJfc2l6ZXMpXG4gICAgQHNldHVwQ29hc3RhbEhhYml0YXRTb3J0aW5nKGNvYXN0YWxfaGFiX3R5cGVzLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEBzZXR1cEVzdHVhcmluZUhhYml0YXRTb3J0aW5nKGVzdHVhcmluZV9oYWJfdHlwZXMsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQHNldHVwU2lnSGFiaXRhdFNvcnRpbmcoc2lnX2hhYnMsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG5cbiAgICBAZW5hYmxlVGFibGVQYWdpbmcoKVxuICAgIFxuICBwcm9jZXNzSGFiaXRhdHM6IChoYWJzX3JlcHJlc2VudGVkLCBub1Jlc2VydmVzKSA9PlxuICAgIGNvYXN0YWxfaGFiX3R5cGVzID0gW11cbiAgICBlc3R1YXJpbmVfaGFiX3R5cGVzID0gW11cbiAgICBjcml0aWNhbF9oYWJpdGF0cyA9IFtdXG4gICAgZm9yIGhhYiBpbiBoYWJzX3JlcHJlc2VudGVkXG4gICAgICAjaWYgdGhlcmUgYXJlIG9ubHkgdHlwZSAyIGFuZCBvdGhlciByZXNlcnZlcywgc2hvdyBwYXRjaCBzaXplIGFzIE5BIGlmIGl0cyAwXG4gICAgICBpZiBub1Jlc2VydmVzXG4gICAgICAgIHRyeVxuICAgICAgICAgIGlmIE51bWJlci5wYXJzZUZsb2F0KGhhYi5SRVBSRVNFTlQpID09IDAuMFxuICAgICAgICAgICAgaGFiLlJFUFJFU0VOVD1cIk5BXCJcbiAgICAgICAgY2F0Y2ggRXJyb3JcblxuICAgICAgaWYgaGFiLkhBQl9UWVBFID09IFwiQnJ5b3pvYW4gcmVlZlwiIG9yIGhhYi5IQUJfVFlQRSA9PSBcIk1hY3JvY3lzdGlzIGJlZFwiIG9yIGhhYi5IQUJfVFlQRSA9PSBcIlNlYWdyYXNzIGJlZFwiXG4gICAgICAgIGNyaXRpY2FsX2hhYml0YXRzLnB1c2goaGFiKVxuICAgICAgZWxzZVxuXG4gICAgICAgIGlmIGhhYi5IQUJfVFlQRS5pbmRleE9mKFwiRXN0dWFyaW5lXCIpID09IDAgb3IgaGFiLkhBQl9UWVBFID09IFwiTXVkIEZsYXRcIlxuICAgICAgICAgIGVzdHVhcmluZV9oYWJfdHlwZXMucHVzaChoYWIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjc2tpcHBpbmcgdGhpcyBvbmUgYmVjYXVzZSBpdHMgc28gc21hbGxcbiAgICAgICAgICBpZiBoYWIuSEFCX1RZUEUgIT0gXCJEZWVwIFdhdGVyIEdyYXZlbFwiXG4gICAgICAgICAgICBjb2FzdGFsX2hhYl90eXBlcy5wdXNoKGhhYilcblxuICAgIG5hX2hhYnMgPSBbXCJCcmFjaGlvcG9kIGJlZHNcIiwgXCJDYWxjYXJlb3VzIHR1YmUgd29ybSB0aGlja2V0c1wiLCBcIkNoYWV0b3B0ZXJpZGFlIHdvcm0gZmllbGRzXCIsXG4gICAgICAgICAgICAgICBcIlJob2RvbGl0aCBiZWRzXCIsIFwiU2VhIHBlbiBmaWVsZHNcIiwgXCJTcG9uZ2UgZ2FyZGVuc1wiLCBcIlN0b255IGNvcmFsIHRoaWNrZXRzXCJdXG4gICAgZm9yIG5oIGluIG5hX2hhYnNcbiAgICAgIG5ld19oYWIgPSB7XCJIQUJfVFlQRVwiOiBuaCwgXCJTSVpFX1NRS01cIjpcIk5BXCIsIFwiUEVSQ1wiOlwiTkFcIiwgXCJSRVBSRVNFTlRcIjpcIk5BXCIsIFwiUkVQTElDXCI6XCJOQVwiLCBcIkNPTk5cIjpcIk5BXCJ9XG4gICAgICBjcml0aWNhbF9oYWJpdGF0cy5wdXNoKG5ld19oYWIpXG4gICAgcmV0dXJuIFtjb2FzdGFsX2hhYl90eXBlcywgZXN0dWFyaW5lX2hhYl90eXBlcywgY3JpdGljYWxfaGFiaXRhdHNdXG5cbiAgcm91bmREYXRhOiAoaGFiaXRhdHMpID0+ICBcbiAgICBmb3IgaGFiIGluIGhhYml0YXRzXG4gICAgICBoYWIuU0laRV9TUUtNID0gTnVtYmVyKGhhYi5TSVpFX1NRS00pLnRvRml4ZWQoMSlcbiAgICAgIGhhYi5QRVJDID0gTnVtYmVyKGhhYi5QRVJDKS50b0ZpeGVkKDEpXG5cbiAgc2V0dXBTaWdIYWJpdGF0U29ydGluZzogKGhhYml0YXRzLCBpc01QQSwgaXNDb2xsZWN0aW9uKSA9PlxuICAgIHRib2R5TmFtZSA9ICcuc2lnX2hhYl92YWx1ZXMnXG4gICAgdGFibGVOYW1lID0gJy5zaWdfaGFiX3RhYmxlJ1xuICAgIEAkKCcuc2lnX2hhYl90eXBlJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ3NpZ19oYWJfdHlwZScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIkhBQl9UWVBFXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuc2lnX2hhYl9uZXdfYXJlYScpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdzaWdfaGFiX25ld19hcmVhJywgdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiU0laRV9TUUtNXCIsIHRib2R5TmFtZSwgdHJ1ZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQCQoJy5zaWdfaGFiX25ld19wZXJjJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ3NpZ19oYWJfbmV3X3BlcmMnLHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlBFUkNcIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBcbiAgICBAJCgnLnNpZ19oYWJfcmVwcmVzZW50JykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ3NpZ19oYWJfcmVwcmVzZW50Jyx0YWJsZU5hbWUsIGhhYml0YXRzLCBldmVudCwgXCJSRVBSRVNFTlRcIiwgdGJvZHlOYW1lLCBmYWxzZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQCQoJy5zaWdfaGFiX3JlcGxpY2F0ZScpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdzaWdfaGFiX3JlcGxpY2F0ZScsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiUkVQTElDXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuc2lnX2hhYl9jb25uZWN0ZWQnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnc2lnX2hhYl9jb25uZWN0ZWQnLHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIkNPTk5cIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBcbiAgICBAcmVuZGVyU29ydCgnc2lnX2hhYl9uZXdfYXJlYScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIHVuZGVmaW5lZCwgXCJTSVpFX1NRS01cIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcblxuICBzZXR1cENvYXN0YWxIYWJpdGF0U29ydGluZzogKGhhYml0YXRzLCBpc01QQSwgaXNDb2xsZWN0aW9uKSA9PlxuICAgIHRib2R5TmFtZSA9ICcuY29hc3RhbF9oYWJfdmFsdWVzJ1xuICAgIHRhYmxlTmFtZSA9ICcuY29hc3RhbF9oYWJfdGFibGUnXG4gICAgQCQoJy5jb2FzdGFsX2hhYl90eXBlJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2NvYXN0YWxfaGFiX3R5cGUnLCB0YWJsZU5hbWUsIGhhYml0YXRzLCBldmVudCwgXCJIQUJfVFlQRVwiLCB0Ym9keU5hbWUsIGZhbHNlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBAJCgnLmNvYXN0YWxfaGFiX25ld19hcmVhJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2NvYXN0YWxfaGFiX25ld19hcmVhJywgdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiU0laRV9TUUtNXCIsIHRib2R5TmFtZSwgdHJ1ZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQCQoJy5jb2FzdGFsX2hhYl9uZXdfcGVyYycpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdjb2FzdGFsX2hhYl9uZXdfcGVyYycsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiUEVSQ1wiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIFxuICAgIEAkKCcuY29hc3RhbF9oYWJfcmVwcmVzZW50JykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2NvYXN0YWxfaGFiX3JlcHJlc2VudCcsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiUkVQUkVTRU5UXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuY29hc3RhbF9oYWJfcmVwbGljYXRlJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2NvYXN0YWxfaGFiX3JlcGxpY2F0ZScsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiUkVQTElDXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuY29hc3RhbF9oYWJfY29ubmVjdGVkJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2NvYXN0YWxfaGFiX2Nvbm5lY3RlZCcsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiQ09OTlwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEByZW5kZXJTb3J0KCdjb2FzdGFsX2hhYl9uZXdfYXJlYScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIHVuZGVmaW5lZCwgXCJTSVpFX1NRS01cIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcblxuICBzZXR1cEVzdHVhcmluZUhhYml0YXRTb3J0aW5nOiAoaGFiaXRhdHMsIGlzTVBBLCBpc0NvbGxlY3Rpb24pID0+XG4gICAgdGJvZHlOYW1lID0gJy5lc3R1YXJpbmVfaGFiX3ZhbHVlcydcbiAgICB0YWJsZU5hbWUgPSAnLmVzdHVhcmluZV9oYWJfdGFibGUnXG4gICAgQCQoJy5lc3R1YXJpbmVfaGFiX3R5cGUnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnZXN0dWFyaW5lX2hhYl90eXBlJywgdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiSEFCX1RZUEVcIiwgdGJvZHlOYW1lLCBmYWxzZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQCQoJy5lc3R1YXJpbmVfaGFiX25ld19hcmVhJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2VzdHVhcmluZV9oYWJfbmV3X2FyZWEnLCB0YWJsZU5hbWUsIGhhYml0YXRzLCBldmVudCwgXCJTSVpFX1NRS01cIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBAJCgnLmVzdHVhcmluZV9oYWJfbmV3X3BlcmMnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnZXN0dWFyaW5lX2hhYl9uZXdfcGVyYycsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiUEVSQ1wiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIFxuICAgIEAkKCcuZXN0dWFyaW5lX2hhYl9yZXByZXNlbnQnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnZXN0dWFyaW5lX2hhYl9yZXByZXNlbnQnLHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlJFUFJFU0VOVFwiLCB0Ym9keU5hbWUsIGZhbHNlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBAJCgnLmVzdHVhcmluZV9oYWJfcmVwbGljYXRlJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2VzdHVhcmluZV9oYWJfcmVwbGljYXRlJyx0YWJsZU5hbWUsIGhhYml0YXRzLCBldmVudCwgXCJSRVBMSUNcIiwgdGJvZHlOYW1lLCBmYWxzZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQCQoJy5lc3R1YXJpbmVfaGFiX2Nvbm5lY3RlZCcpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdlc3R1YXJpbmVfaGFiX2Nvbm5lY3RlZCcsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiQ09OTlwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEByZW5kZXJTb3J0KCdlc3R1YXJpbmVoYWJfbmV3X2FyZWEnLCB0YWJsZU5hbWUsIGhhYml0YXRzLCB1bmRlZmluZWQsIFwiU0laRV9TUUtNXCIsIHRib2R5TmFtZSwgdHJ1ZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG5cblxuXG4gICNkbyB0aGUgc29ydGluZyAtIHNob3VsZCBiZSB0YWJsZSBpbmRlcGVuZGVudFxuICAjc2tpcCBhbnkgdGhhdCBhcmUgbGVzcyB0aGFuIDAuMDBcbiAgcmVuZGVyU29ydDogKG5hbWUsIHRhYmxlTmFtZSwgcGRhdGEsIGV2ZW50LCBzb3J0QnksIHRib2R5TmFtZSwgaXNGbG9hdCwgZ2V0Um93U3RyaW5nVmFsdWUsIGlzTVBBLCBpc0NvbGxlY3Rpb24pID0+XG4gICAgaWYgZXZlbnRcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuXG4gICAgaWYgd2luZG93LmQzXG4gICAgICB0YXJnZXRDb2x1bW4gPSBAZ2V0U2VsZWN0ZWRDb2x1bW4oZXZlbnQsIG5hbWUpXG4gICAgICBzb3J0VXAgPSBAZ2V0U29ydERpcih0YXJnZXRDb2x1bW4pXG5cbiAgICAgIGlmIGlzRmxvYXRcbiAgICAgICAgZGF0YSA9IF8uc29ydEJ5IHBkYXRhLCAocm93KSAtPiBcbiAgICAgICAgICAgIGlmIGlzTmFOKHJvd1tzb3J0QnldKVxuICAgICAgICAgICAgICB2YWwgPSAtMS4wXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHZhbCA9IHBhcnNlRmxvYXQocm93W3NvcnRCeV0pXG4gICAgICAgICAgICByZXR1cm4gdmFsXG4gICAgICBlbHNlXG4gICAgICAgIGRhdGEgPSBfLnNvcnRCeSBwZGF0YSwgKHJvdykgLT4gcm93W3NvcnRCeV1cblxuICAgICAgI2ZsaXAgc29ydGluZyBpZiBuZWVkZWRcbiAgICAgIGlmIHNvcnRVcFxuICAgICAgICBkYXRhLnJldmVyc2UoKVxuXG4gICAgICBlbCA9IEAkKHRib2R5TmFtZSlbMF1cbiAgICAgIGhhYl9ib2R5ID0gZDMuc2VsZWN0KGVsKVxuXG4gICAgICAjcmVtb3ZlIG9sZCByb3dzXG4gICAgICBoYWJfYm9keS5zZWxlY3RBbGwoXCJ0ci5oYWJfcm93c1wiKVxuICAgICAgICAucmVtb3ZlKClcblxuICAgICAgI2FkZCBuZXcgcm93cyAoYW5kIGRhdGEpXG4gICAgICByb3dzID0gaGFiX2JvZHkuc2VsZWN0QWxsKFwidHJcIilcbiAgICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgICAuZW50ZXIoKS5pbnNlcnQoXCJ0clwiLCBcIjpmaXJzdC1jaGlsZFwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiaGFiX3Jvd3NcIilcblxuICAgICAgaWYgaXNNUEFcbiAgICAgICAgaWYgaXNDb2xsZWN0aW9uXG4gICAgICAgICAgY29sdW1ucyA9IFtcIkhBQl9UWVBFXCIsIFwiU0laRV9TUUtNXCIsIFwiUEVSQ1wiLCBcIlJFUFJFU0VOVFwiLCBcIlJFUExJQ1wiLCBcIkNPTk5cIl1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNvbHVtbnMgPSBbXCJIQUJfVFlQRVwiLCBcIlNJWkVfU1FLTVwiLCBcIlBFUkNcIiwgXCJSRVBSRVNFTlRcIl1cbiAgICAgIGVsc2VcbiAgICAgICAgY29sdW1ucyA9IFtcIkhBQl9UWVBFXCIsIFwiU0laRV9TUUtNXCIsIFwiUEVSQ1wiXVxuXG4gICAgICBjZWxscyA9IHJvd3Muc2VsZWN0QWxsKFwidGRcIilcbiAgICAgICAgICAuZGF0YSgocm93LCBpKSAtPmNvbHVtbnMubWFwIChjb2x1bW4pIC0+IChjb2x1bW46IGNvbHVtbiwgdmFsdWU6IHJvd1tjb2x1bW5dKSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZChcInRkXCIpLnRleHQoKGQsIGkpIC0+IFxuICAgICAgICAgIGQudmFsdWVcbiAgICAgICAgKSAgICBcblxuICAgICAgQHNldE5ld1NvcnREaXIodGFyZ2V0Q29sdW1uLCBzb3J0VXApXG4gICAgICBAc2V0U29ydGluZ0NvbG9yKGV2ZW50LCB0YWJsZU5hbWUpXG5cbiAgICAgICNmaXJlIHRoZSBldmVudCBmb3IgdGhlIGFjdGl2ZSBwYWdlIGlmIHBhZ2luYXRpb24gaXMgcHJlc2VudFxuICAgICAgQGZpcmVQYWdpbmF0aW9uKHRhYmxlTmFtZSlcbiAgICAgIGlmIGV2ZW50XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgZ2V0RmxvYXQ6ICh2YWwpID0+XG4gICAgdHJ5XG4gICAgICByZXR1cm4gcGFyc2VGbG9hdCh2YWwpXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIHJldHVybiAwLjBcblxuICAjdGFibGUgcm93IGZvciBoYWJpdGF0IHJlcHJlc2VudGF0aW9uXG4gIGdldEhhYml0YXRSb3dTdHJpbmc6IChkLCBpc01QQSwgaXNDb2xsZWN0aW9uKSA9PlxuICAgIGlmIGQgaXMgdW5kZWZpbmVkXG4gICAgICByZXR1cm4gXCJcIlxuICAgIHJlcHJlc2VudGVkX3N0ciA9IFwiXCJcbiAgICByZXBsaWNhdGVkX3N0ciA9IFwiXCJcbiAgICBjb25uZWN0ZWRfc3RyID0gXCJcIlxuICAgIGlmIGlzTVBBXG4gICAgICByZXByZXNlbnRlZF9zdHIgPSBcIjx0ZFwiPitkLlJFUFJFU0VOVCtcIjwvdGQ+XCJcbiAgICAgIGlmIGlzQ29sbGVjdGlvblxuICAgICAgICByZXBsaWNhdGVkX3N0ciA9IFwiPHRkPlwiK2QuUkVQTElDK1wiPC90ZD5cIlxuICAgICAgICBjb25uZWN0ZWRfc3RyID0gXCI8dGQ+XCIrZC5DT05OK1wiPC90ZD5cIlxuXG4gICAgcmV0dXJuIFwiPHRkPlwiK2QuSEFCX1RZUEUrXCI8L3RkPlwiK1wiPHRkPlwiK2QuU0laRV9TUUtNK1wiPC90ZD5cIitcIjx0ZD5cIitkLlBFUkMrXCI8L3RkPlwiK3JlcHJlc2VudGVkX3N0cityZXBsaWNhdGVkX3N0clxuXG4gIHNldFNvcnRpbmdDb2xvcjogKGV2ZW50LCB0YWJsZU5hbWUpID0+XG4gICAgc29ydGluZ0NsYXNzID0gXCJzb3J0aW5nX2NvbFwiXG4gICAgaWYgZXZlbnRcbiAgICAgIHBhcmVudCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCkucGFyZW50KClcbiAgICAgIG5ld1RhcmdldE5hbWUgPSBldmVudC5jdXJyZW50VGFyZ2V0LmNsYXNzTmFtZVxuICAgICAgdGFyZ2V0U3RyID0gdGFibGVOYW1lK1wiIHRoLnNvcnRpbmdfY29sIGFcIiAgIFxuICAgICAgaWYgQCQodGFyZ2V0U3RyKSBhbmQgQCQodGFyZ2V0U3RyKVswXVxuICAgICAgICBvbGRUYXJnZXROYW1lID0gQCQodGFyZ2V0U3RyKVswXS5jbGFzc05hbWVcbiAgICAgICAgaWYgbmV3VGFyZ2V0TmFtZSAhPSBvbGRUYXJnZXROYW1lXG4gICAgICAgICAgI3JlbW92ZSBpdCBmcm9tIG9sZCBcbiAgICAgICAgICBoZWFkZXJOYW1lID0gdGFibGVOYW1lK1wiIHRoLnNvcnRpbmdfY29sXCJcbiAgICAgICAgICBAJChoZWFkZXJOYW1lKS5yZW1vdmVDbGFzcyhzb3J0aW5nQ2xhc3MpXG4gICAgICAgICAgI2FuZCBhZGQgaXQgdG8gbmV3XG4gICAgICAgICAgcGFyZW50LmFkZENsYXNzKHNvcnRpbmdDbGFzcylcbiAgICAgXG4gIGdldFNvcnREaXI6ICh0YXJnZXRDb2x1bW4pID0+XG4gICAgIHNvcnR1cCA9IEAkKCcuJyt0YXJnZXRDb2x1bW4pLmhhc0NsYXNzKFwic29ydF91cFwiKVxuICAgICByZXR1cm4gc29ydHVwXG5cbiAgZ2V0U2VsZWN0ZWRDb2x1bW46IChldmVudCwgbmFtZSkgPT5cbiAgICBpZiBldmVudFxuICAgICAgI2dldCBzb3J0IG9yZGVyXG4gICAgICB0YXJnZXRDb2x1bW4gPSBldmVudC5jdXJyZW50VGFyZ2V0LmNsYXNzTmFtZVxuXG4gICAgICBtdWx0aUNsYXNzZXMgPSB0YXJnZXRDb2x1bW4uc3BsaXQoJyAnKVxuICAgICAgI3Byb3RlY3RlZE1hbW1hbHMgPSBfLnNvcnRCeSBwcm90ZWN0ZWRNYW1tYWxzLCAocm93KSAtPiBwYXJzZUludChyb3cuQ291bnQpXG4gICAgICBoYWJDbGFzc05hbWUgPV8uZmluZCBtdWx0aUNsYXNzZXMsIChjbGFzc25hbWUpIC0+IFxuICAgICAgICBjbGFzc25hbWUubGFzdEluZGV4T2YoJ2NvYXN0YWxfaGFiJywwKSA9PSAwIG9yIGNsYXNzbmFtZS5sYXN0SW5kZXhPZignZXN0dWFyaW5lX2hhYicsMCkgPT0gMFxuICAgICAgXG4gICAgICBpZiBoYWJDbGFzc05hbWUgaXMgdW5kZWZpbmVkXG4gICAgICAgIGhhYkNsYXNzTmFtZSA9Xy5maW5kIG11bHRpQ2xhc3NlcywgKGNsYXNzbmFtZSkgLT4gXG4gICAgICAgICAgY2xhc3NuYW1lLmxhc3RJbmRleE9mKCdzaWcnLDApID09IDAgXG5cbiAgICAgIHRhcmdldENvbHVtbiA9IGhhYkNsYXNzTmFtZVxuICAgIGVsc2VcbiAgICAgICN3aGVuIHRoZXJlIGlzIG5vIGV2ZW50LCBmaXJzdCB0aW1lIHRhYmxlIGlzIGZpbGxlZFxuICAgICAgdGFyZ2V0Q29sdW1uID0gbmFtZVxuXG4gICAgcmV0dXJuIHRhcmdldENvbHVtblxuXG4gIGhhc05vUmVzZXJ2ZVR5cGVzOiAocmVzZXJ2ZXMpID0+XG4gICAgdHJ5XG4gICAgICB0Ml9zdHIgPSBcIlR5cGUyXCJcbiAgICAgIG1yX3N0ciA9IFwiTVJcIlxuICAgICAgb3RoZXJfc3RyID0gXCJPdGhlclwiXG4gICAgICBudW1yZXNlcnZlcyA9IDBcblxuICAgICAgZm9yIHJlcyBpbiByZXNlcnZlc1xuICAgICAgICBhdHRycyA9IHJlcy5nZXRBdHRyaWJ1dGVzKClcbiAgICAgICAgZm9yIGF0dCBpbiBhdHRyc1xuICAgICAgICAgIGlmIGF0dC5leHBvcnRpZCA9PSBcIk1BTkFHRU1FTlRcIiBcbiAgICAgICAgICAgIHJlc190eXBlID0gYXR0LnZhbHVlXG4gICAgICAgICAgICBpZiByZXNfdHlwZSA9PSBtcl9zdHIgb3IgcmVzX3R5cGUuaW5kZXhPZihtcl9zdHIpID49MFxuICAgICAgICAgICAgICAgIG51bXJlc2VydmVzKz0xXG5cbiAgICAgIHJldHVybiAobnVtcmVzZXJ2ZXMgPT0gMClcblxuICAgIGNhdGNoIEVycm9yXG4gICAgICBjb25zb2xlLmxvZyhcInNvbWV0aGluZyB3ZW50IHdyb25nIGxvb2tpbmcgZm9yIHJlc2VydmUgYXR0cmlidXRlLi4uXCIpXG4gICAgICByZXR1cm4gZmFsc2UgICAgXG5cbiAgc2V0TmV3U29ydERpcjogKHRhcmdldENvbHVtbiwgc29ydFVwKSA9PlxuICAgICNhbmQgc3dpdGNoIGl0XG4gICAgaWYgc29ydFVwXG4gICAgICBAJCgnLicrdGFyZ2V0Q29sdW1uKS5yZW1vdmVDbGFzcygnc29ydF91cCcpXG4gICAgICBAJCgnLicrdGFyZ2V0Q29sdW1uKS5hZGRDbGFzcygnc29ydF9kb3duJylcbiAgICBlbHNlXG4gICAgICBAJCgnLicrdGFyZ2V0Q29sdW1uKS5hZGRDbGFzcygnc29ydF91cCcpXG4gICAgICBAJCgnLicrdGFyZ2V0Q29sdW1uKS5yZW1vdmVDbGFzcygnc29ydF9kb3duJylcblxuICBmaXJlUGFnaW5hdGlvbjogKHRhYmxlTmFtZSkgPT5cbiAgICBlbCA9IEAkKHRhYmxlTmFtZSlbMF1cbiAgICBoYWJfdGFibGUgPSBkMy5zZWxlY3QoZWwpXG4gICAgYWN0aXZlX3BhZ2UgPSBoYWJfdGFibGUuc2VsZWN0QWxsKFwiLmFjdGl2ZSBhXCIpXG4gICAgaWYgYWN0aXZlX3BhZ2UgYW5kIGFjdGl2ZV9wYWdlWzBdIGFuZCBhY3RpdmVfcGFnZVswXVswXVxuICAgICAgYWN0aXZlX3BhZ2VbMF1bMF0uY2xpY2soKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVudmlyb25tZW50VGFiIiwiUmVwb3J0VGFiID0gcmVxdWlyZSAncmVwb3J0VGFiJ1xudGVtcGxhdGVzID0gcmVxdWlyZSAnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxuX3BhcnRpYWxzID0gcmVxdWlyZSAnLi4vbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cbmlkcyA9IHJlcXVpcmUgJy4vaWRzLmNvZmZlZSdcbmZvciBrZXksIHZhbHVlIG9mIGlkc1xuICB3aW5kb3dba2V5XSA9IHZhbHVlXG5cblxuY2xhc3MgRmlzaGluZ1RhYiBleHRlbmRzIFJlcG9ydFRhYlxuICAjIHRoaXMgaXMgdGhlIG5hbWUgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgVGFiXG4gIG5hbWU6ICdGaXNoaW5nJ1xuICBjbGFzc05hbWU6ICdmaXNoaW5nJ1xuICB0aW1lb3V0OiAxMjAwMDBcbiAgdGVtcGxhdGU6IHRlbXBsYXRlcy5maXNoaW5nXG4gIGRlcGVuZGVuY2llczogW1xuICAgICdGaXNoaW5nQXJlYXMnLCAnRmlzaGVyeUludGVuc2l0eSdcbiAgXVxuXG4gIHJlbmRlcjogKCkgLT5cblxuICAgICNzaG93IHRhYmxlcyBpbnN0ZWFkIG9mIGdyYXBoIGZvciBJRVxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgZDNJc1ByZXNlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgZDNJc1ByZXNlbnQgPSBmYWxzZVxuXG4gICAgaXNDb2xsZWN0aW9uID0gQG1vZGVsLmlzQ29sbGVjdGlvbigpXG4gICAgc2NpZCA9IEBza2V0Y2hDbGFzcy5pZFxuICAgXG4gICAgaWYgKHNjaWQgPT0gTVBBX0lEIG9yIHNjaWQgPT0gTVBBX0NPTExFQ1RJT05fSUQgb3Igc2NpZCA9PSBNUEFfQ09ORklEX0NPTExFQ1RJT05fSUQpXG4gICAgICBpc01QQSA9IHRydWVcbiAgICAgIGlzQ29uZmlkZW50aWFsTVBBTmV0d29yayA9IHRydWVcbiAgICBlbHNlXG4gICAgICBpc01QQSA9IGZhbHNlXG4gICAgICBpc0NvbmZpZGVudGlhbE1QQU5ldHdvcmsgPSBmYWxzZVxuXG4gICAgXG4gICAgaWYgaXNNUEFcbiAgICAgIGZpc2hlcnlfaW50ZW5zaXR5ID0gQHJlY29yZFNldCgnRmlzaGVyeUludGVuc2l0eScsICdGaXNoZXJ5SW50ZW5zaXR5JykudG9BcnJheSgpXG5cblxuICAgIGV4aXN0aW5nX2N1c3RvbWFyeV9maXNoaW5nID0gQHJlY29yZFNldCgnRmlzaGluZ0FyZWFzJywgJ0V4aXN0aW5nQ3VzdG9tYXJ5QXJlYScpLnRvQXJyYXkoKVxuICAgIGhhc0V4aXN0aW5nQ3VzdG9tYXJ5ID0gZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmc/Lmxlbmd0aCA+IDBcbiAgICBwcm9wb3NlZF9jdXN0b21hcnlfZmlzaGluZyA9IEByZWNvcmRTZXQoJ0Zpc2hpbmdBcmVhcycsICdQcm9wb3NlZEN1c3RvbWFyeUFyZWEnKS50b0FycmF5KClcbiAgICBoYXNQcm9wb3NlZEN1c3RvbWFyeSA9IHByb3Bvc2VkX2N1c3RvbWFyeV9maXNoaW5nPy5sZW5ndGggPiAwXG5cbiAgICBoYXNDdXN0b21hcnkgPSBoYXNFeGlzdGluZ0N1c3RvbWFyeSBvciBoYXNQcm9wb3NlZEN1c3RvbWFyeVxuXG4gICAgZXhpc3RpbmdfZmlzaGluZ19hcmVhcyA9IEByZWNvcmRTZXQoJ0Zpc2hpbmdBcmVhcycsICdGaXNoaW5nRXhpc3RpbmdBcmVhJykudG9BcnJheSgpXG4gICAgaGFzRXhpc3RpbmdGaXNoaW5nID0gZXhpc3RpbmdfZmlzaGluZ19hcmVhcz8ubGVuZ3RoID4gMFxuICAgIGhhc0FueUZpc2hpbmcgPSBoYXNFeGlzdGluZ0Zpc2hpbmcgb3IgaGFzQ3VzdG9tYXJ5XG4gICAgYXR0cmlidXRlcyA9IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICBcbiAgICBpZiBpc01QQVxuICAgICAgY29udGV4dCA9XG4gICAgICAgIHNrZXRjaDogQG1vZGVsLmZvclRlbXBsYXRlKClcbiAgICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICAgIGF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICAgICAgYW55QXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKS5sZW5ndGggPiAwXG4gICAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICAgIGQzSXNQcmVzZW50OiBkM0lzUHJlc2VudFxuICAgICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuICAgICAgICBpc01QQTogaXNNUEFcbiAgICAgICAgZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmc6IGV4aXN0aW5nX2N1c3RvbWFyeV9maXNoaW5nXG4gICAgICAgIGhhc0V4aXN0aW5nQ3VzdG9tYXJ5OiBoYXNFeGlzdGluZ0N1c3RvbWFyeVxuICAgICAgICBwcm9wb3NlZF9jdXN0b21hcnlfZmlzaGluZzogcHJvcG9zZWRfY3VzdG9tYXJ5X2Zpc2hpbmdcbiAgICAgICAgaGFzUHJvcG9zZWRDdXN0b21hcnk6IGhhc1Byb3Bvc2VkQ3VzdG9tYXJ5XG4gICAgICAgIGV4aXN0aW5nX2Zpc2hpbmdfYXJlYXM6IGV4aXN0aW5nX2Zpc2hpbmdfYXJlYXNcbiAgICAgICAgaGFzRXhpc3RpbmdGaXNoaW5nOiBoYXNFeGlzdGluZ0Zpc2hpbmdcbiAgICAgICAgaGFzQW55RmlzaGluZzogaGFzQW55RmlzaGluZ1xuICAgICAgICBoYXNDdXN0b21hcnk6IGhhc0N1c3RvbWFyeVxuICAgICAgICBmaXNoZXJ5X2ludGVuc2l0eTogZmlzaGVyeV9pbnRlbnNpdHlcbiAgICAgICAgaXNDb25maWRlbnRpYWxNUEFOZXR3b3JrOiBpc0NvbmZpZGVudGlhbE1QQU5ldHdvcmtcbiAgICBlbHNlXG4gICAgICBjb250ZXh0ID1cbiAgICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgICBza2V0Y2hDbGFzczogQHNrZXRjaENsYXNzLmZvclRlbXBsYXRlKClcbiAgICAgICAgYXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgICAgYWRtaW46IEBwcm9qZWN0LmlzQWRtaW4gd2luZG93LnVzZXJcbiAgICAgICAgZDNJc1ByZXNlbnQ6IGQzSXNQcmVzZW50XG4gICAgICAgIGlzQ29sbGVjdGlvbjogaXNDb2xsZWN0aW9uXG4gICAgICAgIGV4aXN0aW5nX2N1c3RvbWFyeV9maXNoaW5nOiBleGlzdGluZ19jdXN0b21hcnlfZmlzaGluZ1xuICAgICAgICBoYXNFeGlzdGluZ0N1c3RvbWFyeTogaGFzRXhpc3RpbmdDdXN0b21hcnlcbiAgICAgICAgcHJvcG9zZWRfY3VzdG9tYXJ5X2Zpc2hpbmc6IHByb3Bvc2VkX2N1c3RvbWFyeV9maXNoaW5nXG4gICAgICAgIGhhc1Byb3Bvc2VkQ3VzdG9tYXJ5OiBoYXNQcm9wb3NlZEN1c3RvbWFyeVxuICAgICAgICBleGlzdGluZ19maXNoaW5nX2FyZWFzOiBleGlzdGluZ19maXNoaW5nX2FyZWFzXG4gICAgICAgIGhhc0V4aXN0aW5nRmlzaGluZzogaGFzRXhpc3RpbmdGaXNoaW5nXG4gICAgICAgIGhhc0FueUZpc2hpbmc6IGhhc0FueUZpc2hpbmdcbiAgICAgICAgaGFzQ3VzdG9tYXJ5OiBoYXNDdXN0b21hcnlcbiAgICAgICAgaXNNUEE6IGlzTVBBXG4gICAgICAgIGlzQ29uZmlkZW50aWFsTVBBTmV0d29yazogaXNDb25maWRlbnRpYWxNUEFOZXR3b3JrXG5cbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcbiAgICBAZW5hYmxlTGF5ZXJUb2dnbGVycygpXG4gICAgQHNldHVwRmlzaGVyeVNvcnRpbmcoZmlzaGVyeV9pbnRlbnNpdHkpXG5cbiAgcm91bmREYXRhOiAocmVjX3NldCkgPT5cbiAgICBsb3dfdG90YWwgPSAwLjBcbiAgICBoaWdoX3RvdGFsID0gMC4wXG4gICAgZm9yIHJzIGluIHJlY19zZXRcbiAgICAgIHJzLkxPVyA9IE51bWJlcihycy5MT1cpLnRvRml4ZWQoMSlcbiAgICAgIGxvd190b3RhbCs9TnVtYmVyKHJzLkxPVylcbiAgICAgIHJzLkhJR0ggPSBOdW1iZXIocnMuSElHSCkudG9GaXhlZCgxKVxuICAgICAgaGlnaF90b3RhbCs9TnVtYmVyKHJzLkhJR0gpXG4gICAgICBycy5UT1RBTCA9IE51bWJlcihycy5UT1RBTCkudG9GaXhlZCgxKVxuICAgIGlmIHJlY19zZXQ/Lmxlbmd0aCA+IDBcbiAgICAgIHRvdF9yb3cgPSB7XCJOQU1FXCI6XCJUb3RhbFwiLCBcIkxPV1wiOmxvd190b3RhbCwgXCJISUdIXCI6aGlnaF90b3RhbH1cbiAgICAgIHJlY19zZXQucHVzaCh0b3Rfcm93KVxuXG4gIHNldHVwRmlzaGVyeVNvcnRpbmc6IChmaXNoZXJ5X2ludGVuc2l0eSkgPT5cbiAgICB0Ym9keU5hbWUgPSAnLmZpc2hlcnlfdmFsdWVzJ1xuICAgIHRhYmxlTmFtZSA9ICcuZmlzaGVyeV90YWJsZSdcblxuICAgIEAkKCcuZmlzaGVyeV90eXBlJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2Zpc2hlcnlfdHlwZScsIHRhYmxlTmFtZSwgZmlzaGVyeV9pbnRlbnNpdHksIGV2ZW50LCBcIkZJU0hfVFlQRVwiLCB0Ym9keU5hbWUsIGZhbHNlLCBAZ2V0RmlzaGVyeVJvd1N0cmluZylcbiAgICBcbiAgICBAJCgnLmZpc2hlcnlfaGlnaCcpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdmaXNoZXJ5X2hpZ2gnLCB0YWJsZU5hbWUsIGZpc2hlcnlfaW50ZW5zaXR5LCBldmVudCwgXCJISUdIXCIsIHRib2R5TmFtZSwgdHJ1ZSwgQGdldEZpc2hlcnlSb3dTdHJpbmcpXG5cbiAgICBAJCgnLmZpc2hlcnlfbW9kZXJhdGUnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnZmlzaGVyeV9tb2RlcmF0ZScsdGFibGVOYW1lLCBmaXNoZXJ5X2ludGVuc2l0eSwgZXZlbnQsIFwiTU9ERVJBVEVcIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0RmlzaGVyeVJvd1N0cmluZylcbiAgICBcbiAgICBAJCgnLmZpc2hlcnlfbG93JykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2Zpc2hlcnlfbG93Jyx0YWJsZU5hbWUsIGZpc2hlcnlfaW50ZW5zaXR5LCBldmVudCwgXCJMT1dcIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0RmlzaGVyeVJvd1N0cmluZylcblxuICAgIEAkKCcuZmlzaGVyeV9kaXNwJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2Zpc2hlcnlfZGlzcCcsdGFibGVOYW1lLCBmaXNoZXJ5X2ludGVuc2l0eSwgZXZlbnQsIFwiRElTUFwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRGaXNoZXJ5Um93U3RyaW5nKVxuXG5cbiAgICBAcmVuZGVyU29ydCgnZmlzaGVyeV90eXBlJywgdGFibGVOYW1lLCBmaXNoZXJ5X2ludGVuc2l0eSwgdW5kZWZpbmVkLCBcIkZJU0hfVFlQRVwiLCB0Ym9keU5hbWUsIGZhbHNlLCBAZ2V0RmlzaGVyeVJvd1N0cmluZylcbiAgXG4gICN0YWJsZSByb3cgZm9yIGhhYml0YXQgcmVwcmVzZW50YXRpb25cbiAgZ2V0RmlzaGVyeVJvd1N0cmluZzogKGQpID0+XG4gICAgaWYgZCBpcyB1bmRlZmluZWRcbiAgICAgIHJldHVybiBcIlwiXG5cbiAgICByZXR1cm4gXCI8dGQ+XCIrZC5GSVNIX1RZUEUrXCI8L3RkPlwiK1wiPHRkPlwiK2QuSElHSCtcIjwvdGQ+XCIrXCI8dGQ+XCIrZC5NT0RFUkFURStcIjwvdGQ+XCIrXCI8dGQ+XCIrZC5MT1crXCI8L3RkPlwiK1wiPHRkPlwiK2QuRElTUCtcIjwvdGQ+XCJcbiAgXG4gIGdldEZsb2F0OiAodmFsKSA9PlxuICAgIHRyeVxuICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICByZXR1cm4gMC4wXG5cbiAgcmVuZGVyU29ydDogKG5hbWUsIHRhYmxlTmFtZSwgcGRhdGEsIGV2ZW50LCBzb3J0QnksIHRib2R5TmFtZSwgaXNGbG9hdCwgZ2V0Um93U3RyaW5nVmFsdWUgKSA9PlxuICAgIGlmIGV2ZW50XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIHRhcmdldENvbHVtbiA9IEBnZXRTZWxlY3RlZENvbHVtbihldmVudCwgbmFtZSlcblxuICAgICAgc29ydFVwID0gQGdldFNvcnREaXIodGFyZ2V0Q29sdW1uKVxuXG4gICAgICBpZiBpc0Zsb2F0XG4gICAgICAgIGRhdGEgPSBfLnNvcnRCeSBwZGF0YSwgKHJvdykgLT4gXG4gICAgICAgICAgICBpZiBpc05hTihyb3dbc29ydEJ5XSlcbiAgICAgICAgICAgICAgdmFsID0gLTEuMFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICB2YWwgPSBwYXJzZUZsb2F0KHJvd1tzb3J0QnldKVxuICAgICAgICAgICAgcmV0dXJuIHZhbFxuICAgICAgZWxzZVxuICAgICAgICBkYXRhID0gXy5zb3J0QnkgcGRhdGEsIChyb3cpIC0+IHJvd1tzb3J0QnldXG5cbiAgICAgICNmbGlwIHNvcnRpbmcgaWYgbmVlZGVkXG4gICAgICBpZiBzb3J0VXBcbiAgICAgICAgZGF0YS5yZXZlcnNlKClcblxuICAgICAgZWwgPSBAJCh0Ym9keU5hbWUpWzBdXG4gICAgICBoYWJfYm9keSA9IGQzLnNlbGVjdChlbClcblxuICAgICAgI3JlbW92ZSBvbGQgcm93c1xuICAgICAgaGFiX2JvZHkuc2VsZWN0QWxsKFwidHIuZmlzaGVyeV9yb3dzXCIpXG4gICAgICAgIC5yZW1vdmUoKVxuXG4gICAgICAjYWRkIG5ldyByb3dzIChhbmQgZGF0YSlcbiAgICAgIHJvd3MgPSBoYWJfYm9keS5zZWxlY3RBbGwoXCJ0clwiKVxuICAgICAgICAgIC5kYXRhKGRhdGEpXG4gICAgICAgIC5lbnRlcigpLmluc2VydChcInRyXCIsIFwiOmZpcnN0LWNoaWxkXCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJmaXNoZXJ5X3Jvd3NcIilcblxuICAgICAgY29sdW1ucyA9IFtcIkZJU0hfVFlQRVwiLCBcIkhJR0hcIiwgXCJNT0RFUkFURVwiLCBcIkxPV1wiLCBcIkRJU1BcIl1cblxuICAgICAgY2VsbHMgPSByb3dzLnNlbGVjdEFsbChcInRkXCIpXG4gICAgICAgICAgLmRhdGEoKHJvdywgaSkgLT5jb2x1bW5zLm1hcCAoY29sdW1uKSAtPiAoY29sdW1uOiBjb2x1bW4sIHZhbHVlOiByb3dbY29sdW1uXSkpXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoXCJ0ZFwiKS50ZXh0KChkLCBpKSAtPiBcbiAgICAgICAgICBkLnZhbHVlXG4gICAgICAgICkgICAgXG5cbiAgICAgIEBzZXROZXdTb3J0RGlyKHRhcmdldENvbHVtbiwgc29ydFVwKVxuXG4gICAgICAjZmlyZSB0aGUgZXZlbnQgZm9yIHRoZSBhY3RpdmUgcGFnZSBpZiBwYWdpbmF0aW9uIGlzIHByZXNlbnRcbiAgICAgIEBmaXJlUGFnaW5hdGlvbih0YWJsZU5hbWUpXG4gICAgICBpZiBldmVudFxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgIFxuICBnZXRTZWxlY3RlZENvbHVtbjogKGV2ZW50LCBuYW1lKSA9PlxuICAgIGlmIGV2ZW50XG4gICAgICAjZ2V0IHNvcnQgb3JkZXJcbiAgICAgIHRhcmdldENvbHVtbiA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuY2xhc3NOYW1lXG4gICAgICBtdWx0aUNsYXNzZXMgPSB0YXJnZXRDb2x1bW4uc3BsaXQoJyAnKVxuICAgICAgdGFyZ2V0Q29sdW1uID0gbXVsdGlDbGFzc2VzWzBdXG4gICAgZWxzZVxuICAgICAgI3doZW4gdGhlcmUgaXMgbm8gZXZlbnQsIGZpcnN0IHRpbWUgdGFibGUgaXMgZmlsbGVkXG4gICAgICB0YXJnZXRDb2x1bW4gPSBuYW1lXG5cbiAgICByZXR1cm4gdGFyZ2V0Q29sdW1uXG5cbiAgZ2V0U29ydERpcjogKHRhcmdldENvbHVtbikgPT5cbiAgICAgc29ydHVwID0gQCQoJy4nK3RhcmdldENvbHVtbikuaGFzQ2xhc3MoXCJzb3J0X3VwXCIpXG4gICAgIHJldHVybiBzb3J0dXBcblxuICBzZXROZXdTb3J0RGlyOiAodGFyZ2V0Q29sdW1uLCBzb3J0VXApID0+XG4gICAgI2FuZCBzd2l0Y2ggaXRcbiAgICBpZiBzb3J0VXBcbiAgICAgIEAkKCcuJyt0YXJnZXRDb2x1bW4pLnJlbW92ZUNsYXNzKCdzb3J0X3VwJylcbiAgICAgIEAkKCcuJyt0YXJnZXRDb2x1bW4pLmFkZENsYXNzKCdzb3J0X2Rvd24nKVxuICAgIGVsc2VcbiAgICAgIEAkKCcuJyt0YXJnZXRDb2x1bW4pLmFkZENsYXNzKCdzb3J0X3VwJylcbiAgICAgIEAkKCcuJyt0YXJnZXRDb2x1bW4pLnJlbW92ZUNsYXNzKCdzb3J0X2Rvd24nKVxuXG4gIGZpcmVQYWdpbmF0aW9uOiAodGFibGVOYW1lKSA9PlxuICAgIGVsID0gQCQodGFibGVOYW1lKVswXVxuICAgIGhhYl90YWJsZSA9IGQzLnNlbGVjdChlbClcbiAgICBhY3RpdmVfcGFnZSA9IGhhYl90YWJsZS5zZWxlY3RBbGwoXCIuYWN0aXZlIGFcIilcbiAgICBpZiBhY3RpdmVfcGFnZSBhbmQgYWN0aXZlX3BhZ2VbMF0gYW5kIGFjdGl2ZV9wYWdlWzBdWzBdXG4gICAgICBhY3RpdmVfcGFnZVswXVswXS5jbGljaygpXG5cbm1vZHVsZS5leHBvcnRzID0gRmlzaGluZ1RhYiIsIm1vZHVsZS5leHBvcnRzID0gXG4gIEdFTkVSSUNfSUQ6ICc1MzlmNWVjNjhkMTA5MjZjMjlmZTc3NjInXG4gIEdFTkVSSUNfQ09MTEVDVElPTl9JRDogJzUzZmQxOTU1MDQwNmRlNjg0YzExODk2OSdcbiAgTVBBX0lEOiAnNTRkODEyOTBmYTk0ZTY5Nzc1OWNlNzcxJ1xuICBNUEFfQ09ORklEX0NPTExFQ1RJT05fSUQ6ICc1NTgyZTYwNWFjMmRkZGQ0Mjk3NmY0MWInXG4gIE1QQV9DT0xMRUNUSU9OX0lEOiAnNTYzMTJhYmNlODM3ZjIyZjA2YjZkMjcyJyIsIlJlcG9ydFRhYiA9IHJlcXVpcmUgJ3JlcG9ydFRhYidcbnRlbXBsYXRlcyA9IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbl9wYXJ0aWFscyA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5wYXJ0aWFscyA9IFtdXG5mb3Iga2V5LCB2YWwgb2YgX3BhcnRpYWxzXG4gIHBhcnRpYWxzW2tleS5yZXBsYWNlKCdub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvJywgJycpXSA9IHZhbFxuXG5pZHMgPSByZXF1aXJlICcuL2lkcy5jb2ZmZWUnXG5mb3Iga2V5LCB2YWx1ZSBvZiBpZHNcbiAgd2luZG93W2tleV0gPSB2YWx1ZVxuXG5jbGFzcyBPdmVydmlld1RhYiBleHRlbmRzIFJlcG9ydFRhYlxuICAjIHRoaXMgaXMgdGhlIG5hbWUgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgVGFiXG4gIG5hbWU6ICdPdmVydmlldydcbiAgY2xhc3NOYW1lOiAnb3ZlcnZpZXcnXG4gIHRpbWVvdXQ6IDEyMDAwMFxuICB0ZW1wbGF0ZTogdGVtcGxhdGVzLm92ZXJ2aWV3XG4gIGRlcGVuZGVuY2llczogW1xuICAgICdIYWJpdGF0c092ZXJ2aWV3J1xuICAgICdQcm9wb3NhbFNpemUnXG4gICAgJ1Byb3Bvc2FsQ29ubmVjdGl2aXR5J1xuICAgICdOZXdIYWJSZXBzVG9vbGJveCdcbiAgXVxuXG4gIHJlbmRlcjogKCkgLT5cbiAgICAjIFRoZSBAcmVjb3JkU2V0IG1ldGhvZCBjb250YWlucyBzb21lIHVzZWZ1bCBtZWFucyB0byBnZXQgZGF0YSBvdXQgb2YgXG4gICAgIyB0aGUgbW9uc3Rlcm91cyBSZWNvcmRTZXQganNvbi4gQ2hlY2tvdXQgdGhlIHNlYXNrZXRjaC1yZXBvcnRpbmctdGVtcGxhdGVcbiAgICAjIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgaW5mby5cbiAgICBUT1RBTF9DT0FTVExJTkVfTEVOR1RIID0gNzY2LjQ2NjkxN1xuICAgIFRPVF9TSVpFX1NRS00gPSA4OTMwLjY2Mjg5M1xuXG4gICAgXG4gICAgVE9UQUxfSEFCUyA9MjJcblxuICAgIHNjaWQgPSBAc2tldGNoQ2xhc3MuaWRcbiAgICBpc0NvbGxlY3Rpb24gPSBAbW9kZWwuaXNDb2xsZWN0aW9uKClcblxuICAgIGlzTVBBID0gKHNjaWQgPT0gTVBBX0lEIG9yIHNjaWQgPT0gTVBBX0NPTExFQ1RJT05fSUQgb3Igc2NpZCA9PSBNUEFfQ09ORklEX0NPTExFQ1RJT05fSUQpXG5cbiAgICBudW1fcmVzZXJ2ZXMgPSAwXG4gICAgbnVtX3R5cGUyID0gMFxuICAgIG51bV9vdGhlciA9IDBcbiAgICBwbHVyYWxfdHlwZTEgPSB0cnVlXG4gICAgcGx1cmFsX3R5cGUyID0gdHJ1ZVxuICAgIHBsdXJhbF9vdGhlciA9IHRydWVcblxuICAgIGlmIGlzQ29sbGVjdGlvblxuICAgICAgbnVtU2tldGNoZXMgPSBAbW9kZWwuZ2V0Q2hpbGRyZW4oKS5sZW5ndGhcbiAgICAgIGlmIGlzTVBBXG4gICAgICAgIHJlc2VydmVfdHlwZXMgPSBAZ2V0UmVzZXJ2ZVZhbHVlcyBAbW9kZWwuZ2V0Q2hpbGRyZW4oKVxuICAgICAgICBudW1fcmVzZXJ2ZXMgPSByZXNlcnZlX3R5cGVzWzBdXG4gICAgICAgIHBsdXJhbF90eXBlMSA9IG51bV9yZXNlcnZlcyAhPSAxXG4gICAgICAgIG51bV90eXBlMiA9IHJlc2VydmVfdHlwZXNbMV1cbiAgICAgICAgcGx1cmFsX3R5cGUyID0gbnVtX3R5cGUyICE9IDFcbiAgICAgICAgbnVtX290aGVyID0gcmVzZXJ2ZV90eXBlc1syXVxuICAgICAgICBwbHVyYWxfb3RoZXIgPSBudW1fb3RoZXIgIT0gMVxuICAgIGVsc2VcbiAgICAgIG51bVNrZXRjaGVzID0gMVxuXG4gICAgcGx1cmFsU2tldGNoZXMgPSBudW1Ta2V0Y2hlcyA+IDFcblxuICAgIGlzR2VuZXJpYyA9IChzY2lkID09IEdFTkVSSUNfSUQgb3Igc2NpZCA9PSBHRU5FUklDX0NPTExFQ1RJT05fSUQpXG5cbiAgICB0b3RhbF9zaXplcyA9IEByZWNvcmRTZXQoJ1Byb3Bvc2FsU2l6ZScsICdTaXplVG90YWxzJykudG9BcnJheSgpXG4gICAgcHJvcF9zaXplcyA9IEByZWNvcmRTZXQoJ1Byb3Bvc2FsU2l6ZScsICdTaXplcycpLnRvQXJyYXkoKVxuICAgIFxuICAgIHJlcHJlc2VudGVkX2hhYnMgPSBAcmVjb3JkU2V0KCdOZXdIYWJSZXBzVG9vbGJveCcsICdSZXByZXNlbnRlZEhhYnMnKS50b0FycmF5KClcbiAgICBoYWJfc2l6ZXMgPSBAcmVjb3JkU2V0KCdOZXdIYWJSZXBzVG9vbGJveCcsICdIYWJTaXplcycpLnRvQXJyYXkoKVxuICAgIG51bV9oYWJzID0gaGFiX3NpemVzPy5sZW5ndGhcblxuICAgIG51bV9yZXByZXNlbnRlZF9oYWJzID0gQGdldE51bUhhYnMoXCJSRVBZRVNcIiwgcmVwcmVzZW50ZWRfaGFicywgXCJZZXNcIilcbiAgICBudW1fcmVwbGljYXRlZF9oYWJzID0gQGdldE51bWJlclJlcGxpY2F0ZWRIYWJzKFwiUkVQTElDXCIsIHJlcHJlc2VudGVkX2hhYnMpXG5cbiAgICBtcGFfYXZnX21pbl9kaW0gPSBAZ2V0QXZlcmFnZU1pbkRpbShwcm9wX3NpemVzKVxuICAgIHRvdGFsX3BlcmNlbnQgPSBAZ2V0VG90YWxBcmVhUGVyY2VudChwcm9wX3NpemVzKVxuICAgIHByb3Bfc2l6ZXMgPSBAY2xlYW51cERhdGEocHJvcF9zaXplcylcbiAgICBcbiAgICBtcGFfY291bnQgPSBAZ2V0TWluRGltQ291bnQocHJvcF9zaXplcylcbiAgICB0b3RhbF9tcGFfY291bnQgPSBudW1Ta2V0Y2hlc1xuICAgIHBsdXJhbF9tcGFfY291bnQgPSBtcGFfY291bnQgIT0gMVxuXG4gICAgXG4gICAgaWYgbXBhX2F2Z19taW5fZGltIDwgMTBcbiAgICAgIG1wYV9hdmdfc2l6ZV9ndWlkZWxpbmUgPSBcImJlbG93XCJcbiAgICBlbHNlXG4gICAgICBtcGFfYXZnX3NpemVfZ3VpZGVsaW5lID0gXCJhYm92ZVwiXG5cblxuICAgIGlmIHRvdGFsX3NpemVzPy5sZW5ndGggPiAwXG4gICAgICBjb2FzdGxpbmVfbGVuZ3RoID0gdG90YWxfc2l6ZXNbMF0uQ09BU1RcbiAgICAgIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA9IChjb2FzdGxpbmVfbGVuZ3RoL1RPVEFMX0NPQVNUTElORV9MRU5HVEgpKjEwMC4wXG4gICAgICBpZiBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQgPiAwICYmIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA8IDFcbiAgICAgICAgY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50ID0gXCI8IDFcIlxuICAgICAgZWxzZVxuICAgICAgICBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQgPSBwYXJzZUZsb2F0KGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCkudG9GaXhlZCgxKVxuICAgICAgICBpZiBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQgPiAxMDBcbiAgICAgICAgICBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQgPSAxMDBcbiAgICAgIHNpemUgPSB0b3RhbF9zaXplc1swXS5TSVpFX1NRS01cblxuICAgICAgY29hc3RsaW5lX2xlbmd0aCA9IHBhcnNlRmxvYXQoY29hc3RsaW5lX2xlbmd0aCkudG9GaXhlZCgxKVxuICAgICAgYXJlYV9wZXJjZW50ID0gcGFyc2VGbG9hdCgoc2l6ZS9UT1RfU0laRV9TUUtNKSoxMDApLnRvRml4ZWQoMilcbiAgICAgIGlmIGFyZWFfcGVyY2VudCA+IDEwMFxuICAgICAgICBhcmVhX3BlcmNlbnQgPSAxMDAuMFxuXG4gICAgICBpZiBhcmVhX3BlcmNlbnQgPCAwLjFcbiAgICAgICAgYXJlYV9wZXJjZW50ID0gXCI8IDFcIlxuXG4gICAgbmV3X2hhYnMgPSBAcmVjb3JkU2V0KCdIYWJpdGF0c092ZXJ2aWV3JywgJ0hhYml0YXRTaXplJykuZmxvYXQoJ05FV19IQUJTJylcbiAgICB0b3RhbF9oYWJzID0gQHJlY29yZFNldCgnSGFiaXRhdHNPdmVydmlldycsICdIYWJpdGF0U2l6ZScpLmZsb2F0KCdUT1RfSEFCUycpXG4gICAgXG4gICAgcmF0aW8gPSAoY29hc3RsaW5lX2xlbmd0aC9zaXplKS50b0ZpeGVkKDEpXG5cbiAgICAjc2V0dXAgY29ubmVjdGl2aXR5IGRhdGFcbiAgICBpZiBpc0NvbGxlY3Rpb25cbiAgICAgIGdvb2RfY29sb3IgPSBcIiNiM2NmYTdcIlxuICAgICAgYmFkX2NvbG9yID0gXCIjZTVjYWNlXCJcbiAgICAgIGlmIG51bVNrZXRjaGVzID4gMVxuICAgICAgICB0cnlcbiAgICAgICAgICBjb25uZWN0ZWRfbXBhX2NvdW50ID0gQHJlY29yZFNldCgnUHJvcG9zYWxDb25uZWN0aXZpdHknLCAnQ29ubicpLmZsb2F0KCdOVU1CRVInKVxuICAgICAgICAgIHBsdXJhbF9jb25uZWN0ZWRfbXBhX2NvdW50ID0gdHJ1ZVxuXG4gICAgICAgICAgbWluX2Rpc3RhbmNlID0gQHJlY29yZFNldCgnUHJvcG9zYWxDb25uZWN0aXZpdHknLCAnQ29ubicpLmZsb2F0KCdNSU4nKVxuICAgICAgICAgIG1heF9kaXN0YW5jZSA9IEByZWNvcmRTZXQoJ1Byb3Bvc2FsQ29ubmVjdGl2aXR5JywgJ0Nvbm4nKS5mbG9hdCgnTUFYJylcbiAgICAgICAgICBtZWFuX2Rpc3RhbmNlID0gQHJlY29yZFNldCgnUHJvcG9zYWxDb25uZWN0aXZpdHknLCAnQ29ubicpLmZsb2F0KCdNRUFOJylcbiAgICAgICAgICBjb25uX3BpZV92YWx1ZXMgPSBAYnVpbGRfdmFsdWVzKFwiTVBBcyBXaXRoaW4gQ29ubmVjdGl2aXR5IFJhbmdlXCIsIGNvbm5lY3RlZF9tcGFfY291bnQsZ29vZF9jb2xvciwgXCJNUEFzIE91dHNpZGUgQ29ubmVjdGl2aXR5IFJhbmdlXCIsIFxuICAgICAgICAgICAgdG90YWxfbXBhX2NvdW50LWNvbm5lY3RlZF9tcGFfY291bnQsIGJhZF9jb2xvcilcbiAgICAgICAgY2F0Y2ggRXJyb3JcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yIHJlYWRpbmcgY29ubmVjdGl2aXR5Li4uXCIpXG4gICAgICAgICAgXG4gICAgICBub3RfcmVwcmVzZW50ZWQgPSBUT1RBTF9IQUJTIC0gbnVtX3JlcHJlc2VudGVkX2hhYnNcbiAgICAgIHJlcHJlc2VudGVkX2hhYnNfcGllX3ZhbHVlcyA9IEBidWlsZF92YWx1ZXMoXCJIYWJpdGF0LXR5cGVzIEluY2x1ZGVkXCIsIG51bV9yZXByZXNlbnRlZF9oYWJzLCBnb29kX2NvbG9yLCBcIkhhYml0YXQtdHlwZXMgTm90IEluY2x1ZGVkXCIsXG4gICAgICAgIG5vdF9yZXByZXNlbnRlZCwgYmFkX2NvbG9yKVxuXG4gICAgICBub3RfcmVwbGljYXRlZCA9IFRPVEFMX0hBQlMgLSBudW1fcmVwbGljYXRlZF9oYWJzXG4gICAgICByZXBsaWNhdGVkX2hhYnNfcGllX3ZhbHVlcyA9IEBidWlsZF92YWx1ZXMoXCJIYWJpdGF0LXR5cGVzIFJlcGxpY2F0ZWRcIiwgbnVtX3JlcGxpY2F0ZWRfaGFicywgZ29vZF9jb2xvciwgXCJIYWJpdGF0LXR5cGVzIE5vdCBSZXBsaWNhdGVkXCIsXG4gICAgICAgIG5vdF9yZXBsaWNhdGVkLCBiYWRfY29sb3IpXG5cbiAgICAjc2hvdyB0YWJsZXMgaW5zdGVhZCBvZiBncmFwaCBmb3IgSUVcbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIGQzSXNQcmVzZW50ID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGQzSXNQcmVzZW50ID0gZmFsc2VcblxuICAgIFxuICAgIGF0dHJpYnV0ZXMgPSBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgXG4gICAgY29udGV4dCA9XG4gICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcbiAgICAgIHNrZXRjaDogQG1vZGVsLmZvclRlbXBsYXRlKClcbiAgICAgIHNrZXRjaENsYXNzOiBAc2tldGNoQ2xhc3MuZm9yVGVtcGxhdGUoKVxuICAgICAgYXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgYW55QXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKS5sZW5ndGggPiAwXG4gICAgICBhZG1pbjogQHByb2plY3QuaXNBZG1pbiB3aW5kb3cudXNlclxuICAgICAgc2l6ZTogc2l6ZVxuICAgICAgY29hc3RsaW5lX2xlbmd0aDogY29hc3RsaW5lX2xlbmd0aFxuICAgICAgY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50OmNvYXN0bGluZV9sZW5ndGhfcGVyY2VudFxuICAgICAgbmV3X2hhYnM6IG5ld19oYWJzXG4gICAgICB0b3RhbF9oYWJzOiB0b3RhbF9oYWJzXG4gICAgICByYXRpbzogcmF0aW9cbiAgICAgIGFyZWFfcGVyY2VudDogYXJlYV9wZXJjZW50XG4gICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuICAgICAgbnVtU2tldGNoZXM6IG51bVNrZXRjaGVzXG4gICAgICBwbHVyYWxTa2V0Y2hlczogcGx1cmFsU2tldGNoZXNcbiAgICAgIHByb3Bfc2l6ZXM6IHByb3Bfc2l6ZXNcbiAgICAgIHRvdGFsX21wYV9jb3VudDogdG90YWxfbXBhX2NvdW50XG4gICAgICBtcGFfY291bnQ6IG1wYV9jb3VudFxuICAgICAgbXBhX2F2Z19zaXplX2d1aWRlbGluZTptcGFfYXZnX3NpemVfZ3VpZGVsaW5lXG4gICAgICBwbHVyYWxfbXBhX2NvdW50OiBwbHVyYWxfbXBhX2NvdW50XG4gICAgICBjb25uZWN0ZWRfbXBhX2NvdW50OiBjb25uZWN0ZWRfbXBhX2NvdW50XG5cbiAgICAgIHBsdXJhbF9jb25uZWN0ZWRfbXBhX2NvdW50OiBwbHVyYWxfY29ubmVjdGVkX21wYV9jb3VudFxuICAgICAgbWluX2Rpc3RhbmNlOiBtaW5fZGlzdGFuY2VcbiAgICAgIG1heF9kaXN0YW5jZTogbWF4X2Rpc3RhbmNlXG4gICAgICBtZWFuX2Rpc3RhbmNlOiBtZWFuX2Rpc3RhbmNlXG4gICAgICBzaW5nbGVTa2V0Y2g6IG51bVNrZXRjaGVzID09IDFcbiAgICAgIGlzTVBBOiBpc01QQVxuICAgICAgbnVtX2hhYnM6IG51bV9oYWJzXG4gICAgICB0b3RhbF9oYWJzOiBUT1RBTF9IQUJTXG4gICAgICBudW1fcmVwcmVzZW50ZWRfaGFiczogbnVtX3JlcHJlc2VudGVkX2hhYnNcbiAgICAgIG51bV9yZXBsaWNhdGVkX2hhYnM6IG51bV9yZXBsaWNhdGVkX2hhYnNcbiAgICAgIGlzR2VuZXJpYzogaXNHZW5lcmljXG4gICAgICBpc01QQTogaXNNUEFcbiAgICAgIG51bV9yZXNlcnZlczogbnVtX3Jlc2VydmVzXG4gICAgICBwbHVyYWxfdHlwZTE6IHBsdXJhbF90eXBlMVxuICAgICAgbnVtX3R5cGUyOiBudW1fdHlwZTJcbiAgICAgIHBsdXJhbF90eXBlMjogcGx1cmFsX3R5cGUyXG4gICAgICBudW1fb3RoZXI6IG51bV9vdGhlclxuICAgICAgcGx1cmFsX290aGVyOiBwbHVyYWxfb3RoZXJcblxuICAgIEAkZWwuaHRtbCBAdGVtcGxhdGUucmVuZGVyKGNvbnRleHQsIHBhcnRpYWxzKVxuICAgIEBlbmFibGVMYXllclRvZ2dsZXJzKClcblxuICAgICNzaXplX3BpZV92YWx1ZXMgPSBAYnVpbGRfdmFsdWVzKFwiTWVldHMgTWluLiBTaXplXCIsIG1wYV9jb3VudCxcIiNiM2NmYTdcIiwgXCJEb2VzIG5vdCBNZWV0IFNpemUgTWluLlwiLCBcbiAgICAjICB0b3RhbF9tcGFfY291bnQtbXBhX2NvdW50LCBcIiNlNWNhY2VcIilcblxuICAgIEBkcmF3UGllKHJlcHJlc2VudGVkX2hhYnNfcGllX3ZhbHVlcywgXCIjcmVwcmVzZW50ZWRfaGFic19waWVcIilcbiAgICBAZHJhd1BpZShyZXBsaWNhdGVkX2hhYnNfcGllX3ZhbHVlcywgXCIjcmVwbGljYXRlZF9oYWJzX3BpZVwiKVxuICAgIEBkcmF3UGllKGNvbm5fcGllX3ZhbHVlcywgXCIjY29ubmVjdGl2aXR5X3BpZVwiKVxuICBcblxuICBidWlsZF92YWx1ZXM6ICh5ZXNfbGFiZWwsIHllc19jb3VudCwgeWVzX2NvbG9yLCBub19sYWJlbCwgbm9fY291bnQsIG5vX2NvbG9yKSA9PlxuICAgIHllc192YWwgPSB7XCJsYWJlbFwiOnllc19sYWJlbCtcIiAoXCIreWVzX2NvdW50K1wiKVwiLCBcInZhbHVlXCI6eWVzX2NvdW50LCBcImNvbG9yXCI6eWVzX2NvbG9yLCBcInl2YWxcIjoyNX1cbiAgICBub192YWwgPSB7XCJsYWJlbFwiOm5vX2xhYmVsK1wiIChcIitub19jb3VudCtcIilcIiwgXCJ2YWx1ZVwiOm5vX2NvdW50LCBcImNvbG9yXCI6bm9fY29sb3IsIFwieXZhbFwiOjUwfVxuXG4gICAgcmV0dXJuIFt5ZXNfdmFsLCBub192YWxdXG5cbiAgZ2V0TnVtYmVyUmVwbGljYXRlZEhhYnM6IChhdHRyX25hbWUsIGhhYml0YXRzKSA9PlxuICAgIGlmIGhhYml0YXRzPy5sZW5ndGggPT0gMFxuICAgICAgcmV0dXJuIDBcblxuICAgIGNvdW50ID0gMFxuICAgIGZvciBoYWIgaW4gaGFiaXRhdHNcbiAgICAgIHRyeVxuICAgICAgICBudW1fcmVwcyA9IE51bWJlci5wYXJzZUludChoYWJbYXR0cl9uYW1lXSlcbiAgICAgICAgaWYgbnVtX3JlcHMgPiAxXG4gICAgICAgICAgaWYgQGlzQ29hc3RhbEhhYihoYWIpXG4gICAgICAgICAgICBjb3VudCs9MVxuICAgICAgY2F0Y2ggZVxuICAgICAgICAjZG8gbm90aGluZyAtIGd1YXJkIGluIGNhc2UgYSBub24tbnVtYmVyIGNvbWVzIGJhY2sgIFxuICAgICAgXG4gICAgcmV0dXJuIGNvdW50XG5cbiAgZ2V0TnVtSGFiczogKGF0dHJfbmFtZSwgaGFiaXRhdHMsIHRndCkgPT5cbiAgICBpZiBoYWJpdGF0cz8ubGVuZ3RoID09IDBcbiAgICAgIHJldHVybiAwXG4gICAgY291bnQgPSAwXG4gICAgZm9yIGhhYiBpbiBoYWJpdGF0c1xuICAgICAgaWYgaGFiW2F0dHJfbmFtZV0gPT0gdGd0XG4gICAgICAgIGlmIEBpc0NvYXN0YWxIYWIoaGFiKVxuICAgICAgICAgIGNvdW50Kz0xXG5cbiAgICByZXR1cm4gY291bnRcblxuICBpc0NvYXN0YWxIYWI6IChoYWIpID0+XG4gICAgaWYgaGFiLkhBQl9UWVBFID09IFwiQnJ5b3pvYW4gcmVlZlwiIG9yIGhhYi5IQUJfVFlQRSA9PSBcIk1hY3JvY3lzdGlzIGJlZFwiIG9yIGhhYi5IQUJfVFlQRSA9PSBcIlNlYWdyYXNzIGJlZFwiXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICBpZiBoYWIuSEFCX1RZUEUuaW5kZXhPZihcIkVzdHVhcmluZVwiKSA9PSAwXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICBpZiBoYWIuSEFCX1RZUEUgPT0gXCJNdWQgRmxhdFwiXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIGlzVHlwZTJPbmx5OiAocmVzZXJ2ZXMpID0+XG4gICAgcmVzY291bnRzID0gQGdldFJlc2VydmVWYWx1ZXMocmVzZXJ2ZXMpXG4gICAgaWYgcmVzY291bnRzWzBdID09IDBcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICBcbiAgZ2V0UmVzZXJ2ZVZhbHVlczogKHJlc2VydmVzKSA9PlxuICAgIG51bV9yZXNlcnZlcyA9IDBcbiAgICBudW1fdHlwZTIgPSAwXG4gICAgbnVtX290aGVyID0gMFxuICAgIHQyX3N0ciA9IFwiVHlwZTJcIlxuICAgIG1yX3N0ciA9IFwiTVJcIlxuICAgIG90aGVyX3N0ciA9IFwiT3RoZXJcIlxuICAgIHRyeVxuICAgICAgZm9yIHJlcyBpbiByZXNlcnZlc1xuICAgICAgICBhdHRycyA9IHJlcy5nZXRBdHRyaWJ1dGVzKClcbiAgICAgICAgZm9yIGF0dCBpbiBhdHRyc1xuICAgICAgICAgIGlmIGF0dC5leHBvcnRpZCA9PSBcIk1BTkFHRU1FTlRcIiBcbiAgICAgICAgICAgIHJlc190eXBlID0gYXR0LnZhbHVlXG4gICAgICAgICAgICBpZiByZXNfdHlwZSA9PSB0Ml9zdHIgb3IgcmVzX3R5cGUuaW5kZXhPZih0Ml9zdHIpID49MFxuICAgICAgICAgICAgICBudW1fdHlwZTIrPTFcbiAgICAgICAgICAgIGVsc2UgaWYgcmVzX3R5cGUgPT0gbXJfc3RyIG9yIHJlc190eXBlLmluZGV4T2YobXJfc3RyKSA+PTBcbiAgICAgICAgICAgICAgbnVtX3Jlc2VydmVzKz0xXG4gICAgICAgICAgICBlbHNlIGlmIHJlc190eXBlID09IG90aGVyX3N0ciBvciByZXNfdHlwZS5pbmRleE9mKG90aGVyX3N0cikgPj0gMFxuICAgICAgICAgICAgICBudW1fb3RoZXIrPTFcbiAgICBjYXRjaCBFcnJvclxuICAgICAgY29uc29sZS5sb2coJ3JhbiBpbnRvIHByb2JsZW0gZ2V0dGluZyBtcGEgdHlwZXMnKVxuXG4gICAgcmV0dXJuIFtudW1fcmVzZXJ2ZXMsIG51bV90eXBlMiwgbnVtX290aGVyXVxuXG4gIGdldERhdGFWYWx1ZTogKGRhdGEpID0+XG4gICAgcmV0dXJuIGRhdGEudmFsdWVcblxuICBkcmF3UGllOiAoZGF0YSwgcGllX25hbWUpID0+XG4gICAgaWYgd2luZG93LmQzXG4gICAgICB3ID0gOTBcbiAgICAgIGggPSA3NVxuICAgICAgciA9IDI1XG4gICAgIFxuICAgICAgdmlzX2VsID0gQCQocGllX25hbWUpWzBdXG4gICAgICAjdmlzID0gZDMuc2VsZWN0KHZpc19lbClcbiAgICAgIHZpcyA9IGQzLnNlbGVjdCh2aXNfZWwpLmFwcGVuZChcInN2ZzpzdmdcIikuZGF0YShbZGF0YV0pLmF0dHIoXCJ3aWR0aFwiLCB3KS5hdHRyKFwiaGVpZ2h0XCIsIGgpLmFwcGVuZChcInN2ZzpnXCIpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyAocioyKSArIFwiLFwiICsgKHIrNSkgKyBcIilcIilcbiAgICAgIFxuICAgICAgI3ZpcyA9IGQzLnNlbGVjdChwaWVfbmFtZSkuYXBwZW5kKFwic3ZnOnN2Z1wiKS5kYXRhKFtkYXRhXSkuYXR0cihcIndpZHRoXCIsIHcpLmF0dHIoXCJoZWlnaHRcIiwgaCkuYXBwZW5kKFwic3ZnOmdcIikuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIChyKjIpICsgXCIsXCIgKyAocis1KSArIFwiKVwiKVxuICAgICAgXG4gICAgICBwaWUgPSBkMy5sYXlvdXQucGllKCkudmFsdWUoKGQpIC0+IHJldHVybiBkLnZhbHVlKVxuXG4gICAgICAjZGVjbGFyZSBhbiBhcmMgZ2VuZXJhdG9yIGZ1bmN0aW9uXG4gICAgICBhcmMgPSBkMy5zdmcuYXJjKCkub3V0ZXJSYWRpdXMocilcblxuICAgICAgI3NlbGVjdCBwYXRocywgdXNlIGFyYyBnZW5lcmF0b3IgdG8gZHJhd1xuICAgICAgYXJjcyA9IHZpcy5zZWxlY3RBbGwoXCJnLnNsaWNlXCIpLmRhdGEocGllKS5lbnRlcigpLmFwcGVuZChcInN2ZzpnXCIpLmF0dHIoXCJjbGFzc1wiLCBcInNsaWNlXCIpXG4gICAgICBhcmNzLmFwcGVuZChcInN2ZzpwYXRoXCIpXG4gICAgICAgIC5hdHRyKFwiZmlsbFwiLCAoZCkgLT4gcmV0dXJuIGQuZGF0YS5jb2xvcilcbiAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgKGQpIC0+IHJldHVybiBpZiBkLmRhdGEudmFsdWUgPT0gMCB0aGVuIFwibm9uZVwiIGVsc2UgXCIjNTQ1NDU0XCIpXG4gICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDAuMjUpXG4gICAgICAgIC5hdHRyKFwiZFwiLCAoZCkgLT4gIFxuICAgICAgICAgIGFyYyhkKVxuICAgICAgICApXG4gICAgICAgIFxuICAgICAgJycnXG4gICAgICBlbCA9IEAkKCcudml6JylbaW5kZXhdXG4gICAgICB4ID0gZDMuc2NhbGUubGluZWFyKClcbiAgICAgICAgLmRvbWFpbihbMCwgbWF4X3ZhbHVlXSlcbiAgICAgICAgLnJhbmdlKFswLCA0MDBdKVxuICAgICAgY2hhcnQgPSBkMy5zZWxlY3QoZWwpXG4gICAgICBjaGFydC5zZWxlY3RBbGwoXCJkaXYucmFuZ2VcIilcbiAgICAgICAgLmRhdGEodDJyYW5nZXMpXG4gICAgICAnJydcbiAgICAgIGVsID0gQCQocGllX25hbWUrXCJfbGVnZW5kXCIpWzBdXG4gICAgICBjaGFydCA9IGQzLnNlbGVjdChlbClcbiAgICAgIGxlZ2VuZHMgPSBjaGFydC5zZWxlY3RBbGwocGllX25hbWUrXCJfbGVnZW5kXCIpXG4gICAgICAgIC5kYXRhKGRhdGEpXG4gICAgICAuZW50ZXIoKS5pbnNlcnQoXCJkaXZcIilcbiAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwibGVnZW5kLXJvd1wiKVxuXG4gICAgICBsZWdlbmRzLmFwcGVuZChcInNwYW5cIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInBpZS1sYWJlbC1zd2F0Y2hcIilcbiAgICAgICAgLnN0eWxlKCdiYWNrZ3JvdW5kLWNvbG9yJywgKGQsaSkgLT4gZC5jb2xvcilcbiAgICAgIFxuICAgICAgbGVnZW5kcy5hcHBlbmQoXCJzcGFuXCIpXG4gICAgICAgIC50ZXh0KChkLGkpIC0+IHJldHVybiBkYXRhW2ldLmxhYmVsKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwicGllLWxhYmVsXCIpXG5cbiAgICAgIFxuXG4gIGdldFRvdGFsQXJlYVBlcmNlbnQ6IChwcm9wX3NpemVzKSA9PlxuXG4gICAgZm9yIHBzIGluIHByb3Bfc2l6ZXNcbiAgICAgIGlmIHBzLk5BTUUgPT0gXCJQZXJjZW50IG9mIFRvdGFsIEFyZWFcIlxuICAgICAgICByZXR1cm4gcHMuU0laRV9TUUtNXG4gICAgcmV0dXJuIDAuMFxuXG4gIGdldEF2ZXJhZ2VNaW5EaW06IChwcm9wX3NpemVzKSA9PlxuICAgIGZvciBwcyBpbiBwcm9wX3NpemVzXG4gICAgICBpZiBwcy5OQU1FID09IFwiQXZlcmFnZVwiXG4gICAgICAgIHJldHVybiBwcy5NSU5fRElNXG5cbiAgY2xlYW51cERhdGE6IChwcm9wX3NpemVzLCBpc0NvbGxlY3Rpb24pID0+XG4gICAgY2xlYW5lZF9wcm9wcyA9IFtdXG4gICAgbnVtX3NrZXRjaGVzID0gcHJvcF9zaXplcz8ubGVuZ3RoXG4gICAgZm9yIHBzIGluIHByb3Bfc2l6ZXNcbiAgICAgIGlmIHBzLk5BTUUgIT0gXCJQZXJjZW50IG9mIFRvdGFsIEFyZWFcIlxuICAgICAgICBwcy5NSU5fRElNID0gcGFyc2VGbG9hdChwcy5NSU5fRElNKS50b0ZpeGVkKDEpXG4gICAgICAgIHBzLlNJWkVfU1FLTSA9IHBhcnNlRmxvYXQocHMuU0laRV9TUUtNKS50b0ZpeGVkKDIpXG4gICAgICAgIGlmIHBzLlNJWkVfU1FLTSA8IDAuMVxuICAgICAgICAgIHBzLlNJWkVfU1FLTSA9IFwiPCAwLjFcIlxuICAgICAgICBwcy5DT0FTVCA9IE51bWJlcihwcy5DT0FTVCkudG9GaXhlZCgxKVxuICAgICAgICBpZiBwcy5DT0FTVCA9PSAwIFxuICAgICAgICAgIHBzLkNPQVNUID0gXCItLVwiXG4gICAgICAgICNkb24ndCBpbmNsdWRlIGF2ZXJhZ2UgZm9yIHNpbmdlIHNrZXRjaFxuICAgICAgICBpZiBudW1fc2tldGNoZXMgPT0gMyBcbiAgICAgICAgICBpZiBwcy5OQU1FICE9IFwiQXZlcmFnZVwiXG4gICAgICAgICAgICBjbGVhbmVkX3Byb3BzLnB1c2gocHMpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjbGVhbmVkX3Byb3BzLnB1c2gocHMpXG4gICAgICBpZiBwcy5OQU1FID09IFwiQXZlcmFnZVwiXG4gICAgICAgIHBzLkNTU19DTEFTUyA9IFwiaXNfYXZnXCJcbiAgICAgIGVsc2VcbiAgICAgICAgcHMuQ1NTX0NMQVNTID0gXCJub3RfYXZnXCJcblxuICAgIHJldHVybiBjbGVhbmVkX3Byb3BzXG5cbiAgZ2V0TWluRGltQ291bnQ6IChwcm9wX3NpemVzKSA9PlxuICAgIG51bV9tZWV0X2NyaXRlcmlhID0gMFxuICAgIHRvdGFsX21pbl9zaXplID0gMFxuXG4gICAgZm9yIHBzIGluIHByb3Bfc2l6ZXNcbiAgICAgIGlmIHBzLk5BTUUgIT0gXCJBdmVyYWdlXCIgJiYgcHMuTUlOX0RJTSA+IDUgXG4gICAgICAgIG51bV9tZWV0X2NyaXRlcmlhKz0xXG5cbiAgICByZXR1cm4gbnVtX21lZXRfY3JpdGVyaWFcblxuICBhZGRDb21tYXM6IChudW1fc3RyKSA9PlxuICAgIG51bV9zdHIgKz0gJydcbiAgICB4ID0gbnVtX3N0ci5zcGxpdCgnLicpXG4gICAgeDEgPSB4WzBdXG4gICAgeDIgPSBpZiB4Lmxlbmd0aCA+IDEgdGhlbiAnLicgKyB4WzFdIGVsc2UgJydcbiAgICByZ3ggPSAvKFxcZCspKFxcZHszfSkvXG4gICAgd2hpbGUgcmd4LnRlc3QoeDEpXG4gICAgICB4MSA9IHgxLnJlcGxhY2Uocmd4LCAnJDEnICsgJywnICsgJyQyJylcbiAgICByZXR1cm4geDEgKyB4MlxuXG5tb2R1bGUuZXhwb3J0cyA9IE92ZXJ2aWV3VGFiIiwiT3ZlcnZpZXdUYWIgPSByZXF1aXJlICcuL292ZXJ2aWV3LmNvZmZlZSdcblVzZXNUYWIgPSByZXF1aXJlICcuL3VzZXMuY29mZmVlJ1xuRW52aXJvbm1lbnRUYWIgPSByZXF1aXJlICcuL2Vudmlyb25tZW50LmNvZmZlZSdcbkZpc2hpbmdUYWIgPSByZXF1aXJlICcuL2Zpc2hpbmcuY29mZmVlJ1xuXG53aW5kb3cuYXBwLnJlZ2lzdGVyUmVwb3J0IChyZXBvcnQpIC0+XG4gIHJlcG9ydC50YWJzIFtPdmVydmlld1RhYiwgRW52aXJvbm1lbnRUYWIsIEZpc2hpbmdUYWIsVXNlc1RhYl1cbiAgIyBwYXRoIG11c3QgYmUgcmVsYXRpdmUgdG8gZGlzdC9cbiAgcmVwb3J0LnN0eWxlc2hlZXRzIFsnLi9yZXBvcnQuY3NzJ11cbiIsIlJlcG9ydFRhYiA9IHJlcXVpcmUgJ3JlcG9ydFRhYidcbnRlbXBsYXRlcyA9IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbl9wYXJ0aWFscyA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5wYXJ0aWFscyA9IFtdXG5mb3Iga2V5LCB2YWwgb2YgX3BhcnRpYWxzXG4gIHBhcnRpYWxzW2tleS5yZXBsYWNlKCdub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvJywgJycpXSA9IHZhbFxuXG5pZHMgPSByZXF1aXJlICcuL2lkcy5jb2ZmZWUnXG5mb3Iga2V5LCB2YWx1ZSBvZiBpZHNcbiAgd2luZG93W2tleV0gPSB2YWx1ZVxuXG5cbmNsYXNzIFVzZXNUYWIgZXh0ZW5kcyBSZXBvcnRUYWJcbiAgIyB0aGlzIGlzIHRoZSBuYW1lIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIFRhYlxuICBuYW1lOiAnT3RoZXInXG4gIGNsYXNzTmFtZTogJ3VzZXMnXG4gIHRpbWVvdXQ6IDEyMDAwMFxuICB0ZW1wbGF0ZTogdGVtcGxhdGVzLnVzZXNcbiAgZGVwZW5kZW5jaWVzOiBbXG4gICAgJ092ZXJsYXBXaXRoUmVjcmVhdGlvbmFsVXNlcydcbiAgICAnU3BlY2llc0luZm9ybWF0aW9uJ1xuICBdXG5cblxuICByZW5kZXI6ICgpIC0+XG5cbiAgICAjc2hvdyB0YWJsZXMgaW5zdGVhZCBvZiBncmFwaCBmb3IgSUVcbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIGQzSXNQcmVzZW50ID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGQzSXNQcmVzZW50ID0gZmFsc2VcblxuICAgICNzcGVjaWVzIGluZm9cbiAgICB0cnlcbiAgICAgIHNlYWJpcmRzID0gQHJlY29yZFNldCgnU3BlY2llc0luZm9ybWF0aW9uJywgJ1NlYWJpcmRzJykudG9BcnJheSgpXG4gICAgICBoYXNTZWFiaXJkQXJlYXMgPSBzZWFiaXJkcz8ubGVuZ3RoID4gMFxuICAgIGNhdGNoIEVycm9yXG4gICAgICBoYXNTZWFiaXJkQXJlYXMgPSBmYWxzZVxuXG4gICAgdHJ5XG4gICAgICBzZWFiaXJkX2NvbG9uaWVzID0gQHJlY29yZFNldCgnU3BlY2llc0luZm9ybWF0aW9uJywgJ1NlYWJpcmRDb2xvbmllcycpLnRvQXJyYXkoKVxuICAgICAgaGFzU2VhYmlyZENvbG9uaWVzID0gc2VhYmlyZF9jb2xvbmllcz8ubGVuZ3RoID4gMFxuICAgIGNhdGNoIEVycm9yXG4gICAgICBoYXNTZWFiaXJkQ29sb25pZXMgPSBmYWxzZVxuXG4gICAgXG4gICAgaGFzU2VhYmlyZHMgPSAoc2VhYmlyZHM/Lmxlbmd0aD4gMCBvciBzZWFiaXJkX2NvbG9uaWVzPy5sZW5ndGggPiAwKVxuICAgIG1hbW1hbHMgPSBAcmVjb3JkU2V0KCdTcGVjaWVzSW5mb3JtYXRpb24nLCAnTWFtbWFscycpLnRvQXJyYXkoKVxuICAgIGhhc01hbW1hbHMgPSBtYW1tYWxzPy5sZW5ndGggPiAwXG4gICAgdHJ5XG4gICAgICBzZWFscyA9IEByZWNvcmRTZXQoJ1NwZWNpZXNJbmZvcm1hdGlvbicsICdTZWFscycpLnRvQXJyYXkoKVxuICAgICAgaGFzU2VhbHMgPSBzZWFscz8ubGVuZ3RoID4gMFxuICAgIGNhdGNoIEVycm9yXG4gICAgICBoYXNTZWFscyA9IGZhbHNlXG5cbiAgICBcbiAgICByZWVmX2Zpc2ggPSBAcmVjb3JkU2V0KCdTcGVjaWVzSW5mb3JtYXRpb24nLCAnUmVlZkZpc2gnKS50b0FycmF5KClcbiAgICBpbkhpZ2hEaXZlcnNpdHlSZWVmRmlzaEFyZWEgPSByZWVmX2Zpc2g/Lmxlbmd0aCA+IDBcblxuICAgIHNtYXJvID0gXCJTTUFST1wiXG4gICAgcmVjX3VzZXMgPSBAcmVjb3JkU2V0KCdPdmVybGFwV2l0aFJlY3JlYXRpb25hbFVzZXMnLCAnUmVjcmVhdGlvbmFsVXNlJykudG9BcnJheSgpXG4gICAgaGFzU21hcm8gPSBmYWxzZVxuXG5cbiAgICBub25fc21hcm9fcmVjX3VzZXMgPSByZWNfdXNlcy5maWx0ZXIgKHJlYykgLT4gcmVjLkZFQVRfVFlQRSAhPSBzbWFyb1xuICAgIGhhc1JlY1VzZXMgPSBub25fc21hcm9fcmVjX3VzZXM/Lmxlbmd0aCA+IDBcbiAgICBcbiAgICBoZXJpdGFnZSA9IEByZWNvcmRTZXQoJ092ZXJsYXBXaXRoUmVjcmVhdGlvbmFsVXNlcycsICdIZXJpdGFnZScpLnRvQXJyYXkoKVxuICAgIGhhc0hlcml0YWdlID0gaGVyaXRhZ2U/Lmxlbmd0aCA+IDBcbiAgICBjb2FzdGFsX2NvbnNlbnRzID0gQHJlY29yZFNldCgnT3ZlcmxhcFdpdGhSZWNyZWF0aW9uYWxVc2VzJywgJ0NvYXN0YWxDb25zZW50cycpLnRvQXJyYXkoKVxuICAgIGhhc0NvYXN0YWwgPSBjb2FzdGFsX2NvbnNlbnRzPy5sZW5ndGggPiAwXG4gICAgaW5mcmFzdHJ1Y3R1cmUgPSAgQHJlY29yZFNldCgnT3ZlcmxhcFdpdGhSZWNyZWF0aW9uYWxVc2VzJywgJ0luZnJhc3RydWN0dXJlJykudG9BcnJheSgpXG4gICAgaGFzSW5mcmFzdHJ1Y3R1cmUgPSBpbmZyYXN0cnVjdHVyZT8ubGVuZ3RoID4gMFxuICAgIGF0dHJpYnV0ZXMgPSBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgXG4gICAgaGFzVXNlcyA9IGhhc1JlY1VzZXMgb3IgaGFzSGVyaXRhZ2Ugb3IgaGFzSW5mcmFzdHJ1Y3R1cmUgb3IgaGFzQ29hc3RhbFxuICAgIGhhc01hcmluZVNwZWNpZXMgPSBoYXNNYW1tYWxzIG9yIGhhc1NlYWxzXG5cbiAgICBpc0NvbGxlY3Rpb24gPSBAbW9kZWwuaXNDb2xsZWN0aW9uKClcbiAgICBjb250ZXh0ID1cbiAgICAgIHNrZXRjaDogQG1vZGVsLmZvclRlbXBsYXRlKClcbiAgICAgIHNrZXRjaENsYXNzOiBAc2tldGNoQ2xhc3MuZm9yVGVtcGxhdGUoKVxuICAgICAgYXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgYW55QXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKS5sZW5ndGggPiAwXG4gICAgICBhZG1pbjogQHByb2plY3QuaXNBZG1pbiB3aW5kb3cudXNlclxuICAgICAgZDNJc1ByZXNlbnQ6IGQzSXNQcmVzZW50XG4gICAgICByZWNfdXNlczogbm9uX3NtYXJvX3JlY191c2VzXG4gICAgICBoYXNTbWFybzogaGFzU21hcm9cbiAgICAgIGhhc1JlY1VzZXM6IGhhc1JlY1VzZXNcbiAgICAgIGhlcml0YWdlOiBoZXJpdGFnZVxuICAgICAgaGFzSGVyaXRhZ2U6IGhhc0hlcml0YWdlXG4gICAgICBjb2FzdGFsX2NvbnNlbnRzOiBjb2FzdGFsX2NvbnNlbnRzXG4gICAgICBoYXNDb2FzdGFsOiBoYXNDb2FzdGFsXG4gICAgICBpbmZyYXN0cnVjdHVyZTogaW5mcmFzdHJ1Y3R1cmVcbiAgICAgIGhhc0luZnJhc3RydWN0dXJlOiBoYXNJbmZyYXN0cnVjdHVyZVxuICAgICAgaGFzVXNlczogaGFzVXNlc1xuICAgICAgaXNDb2xsZWN0aW9uOiBpc0NvbGxlY3Rpb25cblxuICAgICAgI3NwZWNpZXMgaW5mb1xuICAgICAgc2VhYmlyZHM6IHNlYWJpcmRzXG4gICAgICBzZWFiaXJkX2NvbG9uaWVzOiBzZWFiaXJkX2NvbG9uaWVzXG4gICAgICBoYXNTZWFiaXJkczogaGFzU2VhYmlyZHNcbiAgICAgIGhhc1NlYWJpcmRBcmVhczogaGFzU2VhYmlyZEFyZWFzXG4gICAgICBoYXNTZWFiaXJkQ29sb25pZXM6IGhhc1NlYWJpcmRDb2xvbmllc1xuICAgICAgXG4gICAgICBtYW1tYWxzOiBtYW1tYWxzXG4gICAgICBoYXNNYW1tYWxzOiBoYXNNYW1tYWxzXG4gICAgICByZWVmX2Zpc2g6IHJlZWZfZmlzaFxuICAgICAgc2VhbHM6IHNlYWxzXG4gICAgICBoYXNTZWFsczogaGFzU2VhbHNcblxuICAgICAgaW5IaWdoRGl2ZXJzaXR5UmVlZkZpc2hBcmVhOiBpbkhpZ2hEaXZlcnNpdHlSZWVmRmlzaEFyZWFcbiAgICAgIGhhc01hcmluZVNwZWNpZXM6IGhhc01hcmluZVNwZWNpZXNcblxuICAgIEAkZWwuaHRtbCBAdGVtcGxhdGUucmVuZGVyKGNvbnRleHQsIHBhcnRpYWxzKVxuICAgIEBlbmFibGVMYXllclRvZ2dsZXJzKClcblxuICAgIFxuXG5tb2R1bGUuZXhwb3J0cyA9IFVzZXNUYWIiLCJ0aGlzW1wiVGVtcGxhdGVzXCJdID0gdGhpc1tcIlRlbXBsYXRlc1wiXSB8fCB7fTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJkZW1vXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PlJlcG9ydCBTZWN0aW9uczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cD5Vc2UgcmVwb3J0IHNlY3Rpb25zIHRvIGdyb3VwIGluZm9ybWF0aW9uIGludG8gbWVhbmluZ2Z1bCBjYXRlZ29yaWVzPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+RDMgVmlzdWFsaXphdGlvbnM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHVsIGNsYXNzPVxcXCJuYXYgbmF2LXBpbGxzXFxcIiBpZD1cXFwidGFiczJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8bGkgY2xhc3M9XFxcImFjdGl2ZVxcXCI+PGEgaHJlZj1cXFwiI2NoYXJ0XFxcIj5DaGFydDwvYT48L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8bGk+PGEgaHJlZj1cXFwiI2RhdGFUYWJsZVxcXCI+VGFibGU8L2E+PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvdWw+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJ0YWItY29udGVudFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInRhYi1wYW5lIGFjdGl2ZVxcXCIgaWQ9XFxcImNoYXJ0XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8IS0tW2lmIElFIDhdPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJ1bnN1cHBvcnRlZFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgVGhpcyB2aXN1YWxpemF0aW9uIGlzIG5vdCBjb21wYXRpYmxlIHdpdGggSW50ZXJuZXQgRXhwbG9yZXIgOC4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgUGxlYXNlIHVwZ3JhZGUgeW91ciBicm93c2VyLCBvciB2aWV3IHJlc3VsdHMgaW4gdGhlIHRhYmxlIHRhYi5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3A+ICAgICAgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPCFbZW5kaWZdLS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBTZWUgPGNvZGU+c3JjL3NjcmlwdHMvZGVtby5jb2ZmZWU8L2NvZGU+IGZvciBhbiBleGFtcGxlIG9mIGhvdyB0byBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIHVzZSBkMy5qcyB0byByZW5kZXIgdmlzdWFsaXphdGlvbnMuIFByb3ZpZGUgYSB0YWJsZS1iYXNlZCB2aWV3XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBhbmQgdXNlIGNvbmRpdGlvbmFsIGNvbW1lbnRzIHRvIHByb3ZpZGUgYSBmYWxsYmFjayBmb3IgSUU4IHVzZXJzLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGJyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGEgaHJlZj1cXFwiaHR0cDovL3R3aXR0ZXIuZ2l0aHViLmlvL2Jvb3RzdHJhcC8yLjMuMi9cXFwiPkJvb3RzdHJhcCAyLng8L2E+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBpcyBsb2FkZWQgd2l0aGluIFNlYVNrZXRjaCBzbyB5b3UgY2FuIHVzZSBpdCB0byBjcmVhdGUgdGFicyBhbmQgb3RoZXIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBpbnRlcmZhY2UgY29tcG9uZW50cy4galF1ZXJ5IGFuZCB1bmRlcnNjb3JlIGFyZSBhbHNvIGF2YWlsYWJsZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJ0YWItcGFuZVxcXCIgaWQ9XFxcImRhdGFUYWJsZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHRhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPmluZGV4PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+dmFsdWU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiY2hhcnREYXRhXCIsYyxwLDEpLGMscCwwLDEzNTEsMTQxOCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0cj48dGQ+XCIpO18uYihfLnYoXy5mKFwiaW5kZXhcIixjLHAsMCkpKTtfLmIoXCI8L3RkPjx0ZD5cIik7Xy5iKF8udihfLmYoXCJ2YWx1ZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+PC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBlbXBoYXNpc1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+RW1waGFzaXM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHA+R2l2ZSByZXBvcnQgc2VjdGlvbnMgYW4gPGNvZGU+ZW1waGFzaXM8L2NvZGU+IGNsYXNzIHRvIGhpZ2hsaWdodCBpbXBvcnRhbnQgaW5mb3JtYXRpb24uPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB3YXJuaW5nXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5XYXJuaW5nPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwPk9yIDxjb2RlPndhcm48L2NvZGU+IG9mIHBvdGVudGlhbCBwcm9ibGVtcy48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIGRhbmdlclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+RGFuZ2VyPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwPjxjb2RlPmRhbmdlcjwvY29kZT4gY2FuIGFsc28gYmUgdXNlZC4uLiBzcGFyaW5nbHkuPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJlbnZpcm9ubWVudFwiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtpZihfLnMoXy5kKFwic2tldGNoQ2xhc3MuZGVsZXRlZFwiLGMscCwxKSxjLHAsMCwyNCwyNzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LXdhcm5cXFwiIHN0eWxlPVxcXCJtYXJnaW4tYm90dG9tOjEwcHg7XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFRoaXMgc2tldGNoIHdhcyBjcmVhdGVkIHVzaW5nIHRoZSBcXFwiXCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIlxcXCIgdGVtcGxhdGUsIHdoaWNoIGlzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBubyBsb25nZXIgYXZhaWxhYmxlLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byBjb3B5IHRoaXMgc2tldGNoIG9yIG1ha2UgbmV3XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBza2V0Y2hlcyBvZiB0aGlzIHR5cGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkhhYml0YXRzIFByZXNlbnQgaW4gXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMzgyLDM5MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiQ29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlNrZXRjaFwiKTt9O18uYihcIiA8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXRvZ2dsZS1ub2RlPVxcXCI1NTM2ZGJiNDhjNWI0M2ViMGZhY2JjNWFcXFwiIGRhdGEtdmlzaWJsZT1cXFwiZmFsc2VcXFwiPnNob3cgbGF5ZXI8L2E+PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBBcmVhICglKSByZWZlcnMgdG8gdGhlIHBlcmNlbnRhZ2Ugb2YgdGhlIGhhYml0YXQgY29udGFpbmVkIHdpdGhpbiB0aGUgXCIpO2lmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsNjU3LDY2NyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIm5ldHdvcmtcIik7fTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgXCIpO2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic2tldGNoXCIpO307Xy5iKFwiIGFzIGEgcHJvcG9ydGlvbiBvZiB0aGUgdG90YWwgYXJlYSBvZiBoYWJpdGF0IHdpdGhpbiB0aGUgU291dGgtRWFzdCBNYXJpbmUgcmVnaW9uLiBcIik7aWYoIV8ucyhfLmYoXCJpc0NvbmZpZFwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIuKAmFBhdGNoIHNpemXigJkgZm9yIHN1YnRpZGFsIGhhYml0YXRzIHJlZmVycyB0byB0aGUgd2lkdGggb2YgdGhlIGxhcmdlc3QgcGF0Y2ggaW5jbHVkZWQgaW4gYSBUeXBlLTEgTVBBLiBGb3IgaW50ZXJ0aWRhbCBoYWJpdGF0cyB0aGlzIHJlZmVycyB0byB0aGUgbWF4aW11bSBsZW5ndGguIFdoZXRoZXIgYSBoYWJpdGF0IGlzIGNvbnNpZGVyZWQg4oCYUmVwcmVzZW50YXRpdmXigJkgdW5kZXIgdGhlIFBvbGljeSB3aWxsIG5lZWQgdG8gYmUgYXNzZXNzZWQgb24gYSBjYXNlIGJ5IGNhc2UgYmFzaXMsIHRha2luZyBpbnRvIGFjY291bnQgc3VjaCB0aGluZ3MgYXMgaW5kaXZpZHVhbCBwYXRjaCBzaXplIGFuZCBwcm9wb3J0aW9uIG9mIGhhYml0YXQuIOKAmVJlcGxpY2F0ZXPigJkgcmVmZXJzIHRvIHRoZXJlIGJlaW5nIDIgZXhhbXBsZXMgb2YgdGhlIGhhYml0YXQgdHlwZSBpbmNsdWRlZCBpbiBhdCBsZWFzdCB0d28gVHlwZS0yIE1QQS5cIik7fTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbmZpZFwiLGMscCwxKSxjLHAsMCwxMzU5LDE4MzEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkFyZWEgKCUpIHJlZmVycyB0byB0aGUgcGVyY2VudGFnZSBvZiB0aGUgaGFiaXRhdCBjb250YWluZWQgd2l0aGluIHRoZSBuZXR3b3JrIGFzIGEgcHJvcG9ydGlvbiBvZiB0aGUgdG90YWwgYXJlYSBvZiBoYWJpdGF0IHdpdGhpbiB0aGUgU291dGgtRWFzdCBNYXJpbmUgcmVnaW9uLiBBIGhhYml0YXQtdHlwZSBsaXN0ZWQgYXMg4oCdSW5jbHVkZWTigJ0gZG9lcyBub3QgbmVjZXNzYXJpbHkgbWVhbiB0aGF0IGl0IG1lZXRzIHRoZSByZXF1aXJlbWVudCBvZiBiZWluZyB2aWFibGUgYW5kIHRoZXJlZm9yZSByZXByZXNlbnRhdGl2ZSBvZiB0aGF0IGhhYml0YXQgdHlwZSBpbiB0aGUgbmV0d29yay4gVGhpcyB3aWxsIG5lZWQgdG8gYmUgYXNzZXNzZWQgb24gYSBjYXNlIGJ5IGNhc2UgYmFzaXMsIHRha2luZyBpbnRvIGFjY291bnQgc3VjaCB0aGluZ3MgYXMgaW5kaXZpZHVhbCBwYXRjaCBzaXplIGFuZCBwcm9wb3J0aW9uIG9mIGhhYml0YXQuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9pPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHAgY2xhc3M9XFxcImluLXJlcG9ydC1oZWFkZXJcXFwiPkNvYXN0YWwgSGFiaXRhdCBUeXBlczwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDAsMTk0NiwyODcyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMjJcXFwiIGNsYXNzPVxcXCJjb2FzdGFsX2hhYl90YWJsZVxcXCI+IFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoIGNsYXNzPVxcXCJzb3J0aW5nX2NvbFxcXCIgc3R5bGU9XFxcIndpZHRoOjE1MHB4O1xcXCI+PGEgY2xhc3M9XFxcImNvYXN0YWxfaGFiX3R5cGUgc29ydF91cFxcXCIgaHJlZj1cXFwiI1xcXCI+SGFiaXRhdDwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPjxhICBjbGFzcz1cXFwiY29hc3RhbF9oYWJfbmV3X2FyZWEgc29ydF9kb3duXFxcIiBocmVmPVxcXCIjXFxcIiA+QXJlYSAoa208c3VwPjI8L3N1cD4pPC9hPjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcImNvYXN0YWxfaGFiX25ld19wZXJjIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCI+QXJlYSAoJSk8L2E+PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsMjM3NiwyNzUwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0aD48YSBjbGFzcz1cXFwiY29hc3RhbF9oYWJfcmVwcmVzZW50IHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCIgPlwiKTtfLmIoXy52KF8uZihcIlJFUF9OQU1FXCIsYyxwLDApKSk7Xy5iKFwiPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDI0OTksMjcxOCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJjb2FzdGFsX2hhYl9yZXBsaWNhdGUgc29ydF9kb3duXFxcIiBocmVmPVxcXCIjXFxcIj5SZXBsaWNhdGVzPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcImNvYXN0YWxfaGFiX2Nvbm5lY3RlZCBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiPkNvbm5lY3Rpdml0eSAoaW4ga20pPHN1cD4qPC9zdXA+PC90aD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgPHRib2R5IGNsYXNzPVxcXCJjb2FzdGFsX2hhYl92YWx1ZXNcXFwiPjwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MTgwcHg7XFxcIj5IYWJpdGF0PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5BcmVhIChrbTxzdXA+Mjwvc3VwPik8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPkFyZWEgKCUpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsMzEzMywzMzU1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgPHRoPlBhdGNoIFNpemUgKFR5cGUtMSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMzIxNCwzMzIzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgICAgIDx0aD5SZXBsaWNhdGVzPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICAgIDx0aD5Db25uZWN0aXZpdHkgKGluIGttKTwvdGg+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc0NvYXN0YWxIYWJUeXBlc1wiLGMscCwxKSxjLHAsMCwzNDU2LDM4NzcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJjb2FzdGFsX2hhYl90eXBlc1wiLGMscCwxKSxjLHAsMCwzNDkzLDM4NDIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiSEFCX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiU0laRV9TUUtNXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlBFUkNcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCwzNjUwLDM3OTcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJSRVBSRVNFTlRcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDM3MjcsMzc2MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPHRkPlwiKTtfLmIoXy52KF8uZihcIlJFUExJQ1wiLGMscCwwKSkpO18uYihcIjwvdGQ+PHRkPlwiKTtfLmIoXy52KF8uZihcIkNPTk5cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJoYXNDb2FzdGFsSGFiVHlwZXNcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkIGNvbHNwYW49XFxcIlwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDQwMDIsNDAwMyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiNVwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIjRcIik7fTtfLmIoXCJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDxpPlRoZXJlIGFyZSBubyBjb2FzdGFsIGhhYml0YXQgdHlwZXMuPC9pPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8cCBjbGFzcz1cXFwiaW4tcmVwb3J0LWhlYWRlclxcXCI+RXN0dWFyaW5lIEhhYml0YXQgVHlwZXM8L3A+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwwLDQzMzcsNTI4OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjIwXFxcIiBjbGFzcz1cXFwiZXN0dWFyaW5lX2hhYl90YWJsZVxcXCI+IFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoIGNsYXNzPVxcXCJzb3J0aW5nX2NvbFxcXCIgc3R5bGU9XFxcIndpZHRoOjE1MHB4O1xcXCI+PGEgY2xhc3M9XFxcImVzdHVhcmluZV9oYWJfdHlwZSBzb3J0X3VwXFxcIiBocmVmPVxcXCIjXFxcIj5IYWJpdGF0PC9hPjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+PGEgIGNsYXNzPVxcXCJlc3R1YXJpbmVfaGFiX25ld19hcmVhIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCIgPkFyZWEgKGttPHN1cD4yPC9zdXA+KTwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJlc3R1YXJpbmVfaGFiX25ld19wZXJjIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCI+QXJlYSAoJSk8L2E+PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsNDc3NSw1MTY0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0aD48YSBjbGFzcz1cXFwiZXN0dWFyaW5lX2hhYl9yZXByZXNlbnQgc29ydF9kb3duXFxcIiBzdHlsZT1cXFwid2lkdGg6ODBweDtcXFwiIGhyZWY9XFxcIiNcXFwiID5cIik7Xy5iKF8udihfLmYoXCJSRVBfTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw0OTIwLDUxMzIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICAgIDx0aD48YSBjbGFzcz1cXFwiZXN0dWFyaW5lX2hhYl9yZXBsaWNhdGUgc29ydF9kb3duXFxcIiBocmVmPVxcXCIjXFxcIiA+UmVwbGljYXRlczwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJlc3R1YXJpbmVfaGFiX2Nvbm5lY3RlZCBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiPkNvbm5lY3Rpdml0eSAoaW4ga20pPC90aD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgPHRib2R5IGNsYXNzPVxcXCJlc3R1YXJpbmVfaGFiX3ZhbHVlc1xcXCI+PC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoxNTBweDtcXFwiPkhhYml0YXQ8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPkFyZWEgKGttPHN1cD4yPC9zdXA+KTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+QXJlYSAoJSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw1NTQ5LDU3NzEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICA8dGg+UGF0Y2ggU2l6ZSAoVHlwZS0xKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw1NjMwLDU3MzksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICAgICAgPHRoPlJlcGxpY2F0ZXM8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgICAgPHRoPkNvbm5lY3Rpdml0eSAoaW4ga20pPC90aD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzRXN0dWFyaW5lSGFiVHlwZXNcIixjLHAsMSksYyxwLDAsNTg3NCw2Mjk5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZihfLnMoXy5mKFwiZXN0dWFyaW5lX2hhYl90eXBlc1wiLGMscCwxKSxjLHAsMCw1OTEzLDYyNjIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiSEFCX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiU0laRV9TUUtNXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlBFUkNcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw2MDcwLDYyMTcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJSRVBSRVNFTlRcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDYxNDcsNjE4MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPHRkPlwiKTtfLmIoXy52KF8uZihcIlJFUExJQ1wiLGMscCwwKSkpO18uYihcIjwvdGQ+PHRkPlwiKTtfLmIoXy52KF8uZihcIkNPTk5cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJoYXNFc3R1YXJpbmVIYWJUeXBlc1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQgY29sc3Bhbj1cXFwiXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNjQyOCw2NDI5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI1XCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiNFwiKTt9O18uYihcIlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPGk+VGhlcmUgYXJlIG5vIGVzdHVhcmluZSBoYWJpdGF0IHR5cGVzLjwvaT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9O18uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgIDxwIGNsYXNzPVxcXCJpbi1yZXBvcnQtaGVhZGVyXFxcIj5TZW5zaXRpdmUgTWFyaW5lIEhhYml0YXRzPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJkM0lzUHJlc2VudFwiLGMscCwxKSxjLHAsMCw2NzY4LDc2MzYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMjBcXFwiIGNsYXNzPVxcXCJzaWdfaGFiX3RhYmxlXFxcIj4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGggY2xhc3M9XFxcInNvcnRpbmdfY29sXFxcIiBzdHlsZT1cXFwid2lkdGg6MTUwcHg7XFxcIj48YSBjbGFzcz1cXFwic2lnX2hhYl90eXBlIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCI+SGFiaXRhdDwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD48YSAgY2xhc3M9XFxcInNpZ19oYWJfbmV3X2FyZWEgc29ydF91cFxcXCIgaHJlZj1cXFwiI1xcXCIgPkFyZWEgKGttPHN1cD4yPC9zdXA+KTwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD48YSBjbGFzcz1cXFwic2lnX2hhYl9uZXdfcGVyYyBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiPkFyZWEgKCUpPC9hPjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDcxNjgsNzUyOCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcInNpZ19oYWJfcmVwcmVzZW50IHNvcnRfZG93blxcXCIgc3R5bGU9XFxcIndpZHRoOjgwcHg7XFxcIiBocmVmPVxcXCIjXFxcIj5cIik7Xy5iKF8udihfLmYoXCJSRVBfTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw3MzA0LDc0OTgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcInNpZ19oYWJfcmVwbGljYXRlIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCI+UmVwbGljYXRlczwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0aD48YSBjbGFzcz1cXFwic2lnX2hhYl9jb25uZWN0ZWQgc29ydF9kb3duXFxcIiBocmVmPVxcXCIjXFxcIj5Db25uZWN0aXZpdHkgKGluIGttKSA8L3RoPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICA8dGJvZHkgY2xhc3M9XFxcInNpZ19oYWJfdmFsdWVzXFxcIj48L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MTc1cHg7XFxcIj5IYWJpdGF0PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+QXJlYSAoa208c3VwPjI8L3N1cD4pPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+QXJlYSAoJSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw3ODgzLDgwOTYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICA8dGg+UGF0Y2ggU2l6ZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw3OTU1LDgwNjQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICAgICAgPHRoPlJlcGxpY2F0ZXM8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgICAgPHRoPkNvbm5lY3Rpdml0eSAoaW4ga20pPC90aD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzU2lnSGFic1wiLGMscCwxKSxjLHAsMCw4MTc5LDg1NTIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJzaWdfaGFic1wiLGMscCwxKSxjLHAsMCw4MjAzLDg1MzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJIQUJfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiU0laRV9TUUtNXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJQRVJDXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsODM1MCw4NDkxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlJFUFJFU0VOVFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDg0MjMsODQ1OSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPHRkPlwiKTtfLmIoXy52KF8uZihcIlJFUExJQ1wiLGMscCwwKSkpO18uYihcIjwvdGQ+PHRkPlwiKTtfLmIoXy52KF8uZihcIkNPTk5cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzU2lnSGFic1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQgY29sc3Bhbj1cXFwiXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsODY1MSw4NjUyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI1XCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiNFwiKTt9O18uYihcIlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDxpPlRoZXJlIGFyZSBubyBoYWJpdGF0cyBvZiBzaWduaWZpY2FuY2UuPC9pPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgIDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxlbT5TZW5zaXRpdmUgaGFiaXRhdHMgYXJlIGRlZmluZWQgaW4gdGhlIHJlcG9ydCAnPGEgaHJlZj1cXFwiaHR0cHM6Ly93d3cubWZlLmdvdnQubnovc2l0ZXMvZGVmYXVsdC9maWxlcy9zZW5zaXRpdmUtbWFyaW5lLWJlbnRoaWMtaGFiaXRhdHMtZGVmaW5lZC5wZGZcXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj5TZW5zaXRpdmUgbWFyaW5lIGJlbnRoaWMgaGFiaXRhdHMgZGVmaW5lZDwvYT4uJyDigJlOQeKAmSBpbmRpY2F0ZXMgdGhhdCB0aGUgaGFiaXRhdCBpcyBsaWtlbHkgdG8gYmUgcHJlc2VudCBpbiB0aGUgcmVnaW9uIGJ1dCBub3QgbWFwcGVkLjwvZW0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzaG93QWRqYWNlbnRcIixjLHAsMSksYyxwLDAsOTIzNywxMDY1MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDQ+QWRqYWNlbnQgVGVycmVzdHJpYWwgSW5mb3JtYXRpb248L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHA+PGVtPkFyZWFzIHNob3duIGJlbG93IGFyZSB3aXRoaW4gMTAwbSBvZiBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw5Mzk5LDk0MjUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImEgc2tldGNoIGluIHRoZSBjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiIHRoZSBza2V0Y2ggXCIpO307Xy5iKFwiPC9lbT48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPjxzdHJvbmc+UHJvdGVjdGVkIEFyZWFzPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIyMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzUHJvdGVjdGVkXCIsYyxwLDEpLGMscCwwLDk2NDAsOTc5NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcInByb3RlY3RlZF9hcmVhc1wiLGMscCwxKSxjLHAsMCw5Njc1LDk3NjMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJoYXNQcm90ZWN0ZWRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPjxlbT5Ob25lIFByZXNlbnQ8L2VtPjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCIgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPjxzdHJvbmc+Q29uc2VydmF0aW9uIENvdmVuYW50czwvc3Ryb25nPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc0NvdmVuYW50c1wiLGMscCwxKSxjLHAsMCwxMDE0NSwxMDQ0NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcInFlMl9jb3ZlbmFudHNcIixjLHAsMSksYyxwLDAsMTAxNzgsMTAyNjYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcIm5hcGFsaXNfY292ZW5hbnRzXCIsYyxwLDEpLGMscCwwLDEwMzIxLDEwNDA5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzQ292ZW5hbnRzXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD48ZW0+Tm9uZSBQcmVzZW50PC9lbT48L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wiZmlzaGluZ1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtpZihfLnMoXy5kKFwic2tldGNoQ2xhc3MuZGVsZXRlZFwiLGMscCwxKSxjLHAsMCwyNCwyNzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LXdhcm5cXFwiIHN0eWxlPVxcXCJtYXJnaW4tYm90dG9tOjEwcHg7XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFRoaXMgc2tldGNoIHdhcyBjcmVhdGVkIHVzaW5nIHRoZSBcXFwiXCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIlxcXCIgdGVtcGxhdGUsIHdoaWNoIGlzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBubyBsb25nZXIgYXZhaWxhYmxlLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byBjb3B5IHRoaXMgc2tldGNoIG9yIG1ha2UgbmV3XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBza2V0Y2hlcyBvZiB0aGlzIHR5cGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc0FueUZpc2hpbmdcIixjLHAsMSksYyxwLDAsMzE3LDI1NTIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJoYXNFeGlzdGluZ0Zpc2hpbmdcIixjLHAsMSksYyxwLDAsMzQ1LDEzODIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+RXhpc3RpbmcgRmlzaGVyaWVzIE1hbmFnZW1lbnQ8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8cD48ZW0+VGhlIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDQ3Niw0ODMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIm5ldHdvcmtcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJTa2V0Y2hcIik7fTtfLmIoXCIgaW5jbHVkZXMgdGhlIGZvbGxvd2luZyBleGlzdGluZyBmaXNoZXJpZXMgcmVzdHJpY3Rpb25zLiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgQWxzbyBzaG93biBpcyB0aGUgZXh0ZW50IHRoYXQgdGhlIGZpc2hlcmllcyByZXN0cmljdGlvbnMgYXBwbHkgdG8gdGhlIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDY5NSw3MDMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcInNrZXRjaGVzXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIFwiKTtpZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaFwiKTt9O18uYihcIiBhcyBhIHBlcmNlbnRhZ2Ugb2YgdG90YWwgc2tldGNoIGFyZWEuIEZvciBleGFtcGxlLCAxMDAlIG1lYW5zIG5vIGZpc2hpbmcgb2YgdGhhdCB0eXBlIGlzIGN1cnJlbnRseSBhbGxvd2VkIHdpdGhpbiB0aGUgc2tldGNoLjwvZW0+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5OYW1lPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRoPlBlcmNlbnQ8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiZXhpc3RpbmdfZmlzaGluZ19hcmVhc1wiLGMscCwxKSxjLHAsMCwxMTY3LDEyOTksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlBFUkNfQVJFQVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaGFzQ3VzdG9tYXJ5XCIsYyxwLDEpLGMscCwwLDE0MjcsMjUzMyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDQ+Q3VzdG9tYXJ5IEFyZWFzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzRXhpc3RpbmdDdXN0b21hcnlcIixjLHAsMSksYyxwLDAsMTU0MywxOTg3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgPHA+IFRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxNTc5LDE1ODYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIm5ldHdvcmtcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgaW5jbHVkZXMgdGhlIGZvbGxvd2luZyA8c3Ryb25nPmV4aXN0aW5nPC9zdHJvbmc+IEN1c3RvbWFyeSBBcmVhczo8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmdcIixjLHAsMSksYyxwLDAsMTgxNCwxOTA3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkZFQVRfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJoYXNQcm9wb3NlZEN1c3RvbWFyeVwiLGMscCwxKSxjLHAsMCwyMDQ2LDI0OTAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8cD4gVGhlIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDIwODIsMjA4OSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwibmV0d29ya1wiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaFwiKTt9O18uYihcIiBpbmNsdWRlcyB0aGUgZm9sbG93aW5nIDxzdHJvbmc+cHJvcG9zZWQ8L3N0cm9uZz4gQ3VzdG9tYXJ5IEFyZWFzOjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJwcm9wb3NlZF9jdXN0b21hcnlfZmlzaGluZ1wiLGMscCwxKSxjLHAsMCwyMzE3LDI0MTAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJoYXNBbnlGaXNoaW5nXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PkV4aXN0aW5nIG9yIEN1c3RvbWFyeSBBcmVhczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cD5ObyBpbmZvcm1hdGlvbiBvbiBleGlzdGluZyBmaXNoaW5nIGFyZWFzIG9yIGN1c3RvbWFyeSB1c2UgaXMgYXZhaWxhYmxlIGZvciB0aGlzIGFyZWEuPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9O18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29uZmlkZW50aWFsTVBBTmV0d29ya1wiLGMscCwxKSxjLHAsMCwyODM1LDUwODEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+RmlzaGluZyBJbnRlbnNpdHk8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8ZW0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgWW91ciBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwyOTgxLDI5ODgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIm5ldHdvcmtcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgaW5jbHVkZXMgYXJlYXMgaWRlbnRpZmllZCBhcyBoYXZpbmcgaGlnaCwgbW9kZXJhdGUgb3IgbG93IGludGVuc2l0eSBmaXNoaW5nIGdyb3VuZHMgZm9yIHRoZSBmb2xsb3dpbmcgZmlzaGVyaWVzLiBUaGUgcGVyY2VudGFnZSBvZiB0aGUgcmVnaW9ucyBoaWdoLCBtb2RlcmF0ZSBhbmQgbG93IGludGVuc2l0eSBmaXNoaW5nIGdyb3VuZHMgY292ZXJlZCBieSB5b3VyIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDMyNzEsMzI3OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwibmV0d29ya1wiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaFwiKTt9O18uYihcIiBpcyBnaXZlbiBiZWxvdy4gRmlzaGVyeSBkaXNwbGFjZW1lbnQgc2hvd3MgdGhlIHBlcmNlbnRhZ2Ugb2YgdGhlIHJlZ2lvbnMgZmlzaGVyeSB0aGF0IHdvdWxkIGJlIGRpc3BsYWNlZCBieSB5b3VyIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDM0NjYsMzQ3MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwibmV0d29ya1wiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaFwiKTt9O18uYihcIi5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L2VtPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwwLDM1OTEsNDMyOCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIyMFxcXCIgY2xhc3M9XFxcImZpc2hlcnlfdGFibGVcXFwiPiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cXFwic29ydGluZ19jb2xcXFwiIHN0eWxlPVxcXCJ3aWR0aDoxNTBweDtcXFwiPjxhIGNsYXNzPVxcXCJmaXNoZXJ5X3R5cGUgc29ydF91cFxcXCIgaHJlZj1cXFwiI1xcXCI+RmlzaGVyeTwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aD48YSBjbGFzcz1cXFwiZmlzaGVyeV9oaWdoIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCIgPkhpZ2ggKCUpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcImZpc2hlcnlfbW9kZXJhdGUgc29ydF9kb3duXFxcIiBocmVmPVxcXCIjXFxcIj5Nb2RlcmF0ZSAoJSk8L2E+PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcImZpc2hlcnlfbG93IHNvcnRfZG93blxcXCIgc3R5bGU9XFxcIndpZHRoOjgwcHg7XFxcIiBocmVmPVxcXCIjXFxcIiA+TG93ICglKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJmaXNoZXJ5X2Rpc3Agc29ydF9kb3duXFxcIiBzdHlsZT1cXFwid2lkdGg6ODBweDtcXFwiIGhyZWY9XFxcIiNcXFwiID5GaXNoZXJ5IGRpc3BsYWNlbWVudCAoJSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgPHRib2R5IGNsYXNzPVxcXCJmaXNoZXJ5X3ZhbHVlc1xcXCI+PC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoxMjVweDtcXFwiPkZpc2hlcnk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGg+SGlnaCAoJSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGg+TW9kZXJhdGUgKCUpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRoPkxvdyAoJSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGg+RmlzaGVyeSBkaXNwbGFjZW1lbnQgKCUpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImZpc2hlcnlfaW50ZW5zaXR5XCIsYyxwLDEpLGMscCwwLDQ3NTIsNDk4NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJGSVNIX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiSElHSFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJNT0RFUkFURVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJMT1dcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRElTUFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8IS0tXCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDUxMjcsNzAwOCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PkZpc2hpbmcgSW50ZW5zaXR5PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgVGhlIGZvbGxvd2luZyB0YWJsZXMgY29udGFpbnMgdGhlIHBlcmNlbnQgb2YgdGhlIHRvdGFsIFNFTVBGIGxvdyBpbnRlbnNpdHkgYW5kIGhpZ2ggaW50ZW5zaXR5IGZpc2hpbmcgdGhhdCBtYXkgYmUgZGlzcGxhY2VkIGJ5IHRoZSBza2V0Y2guIDxzdHJvbmc+SGlnaCBpbnRlbnNpdHk8L3N0cm9uZz4gaXMgZ3JlYXRlciB0aGFuIGFuIGF2ZXJhZ2Ugb2YgNSBldmVudHMgcGVyIGFubnVtLCA8c3Ryb25nPkxvdzwvc3Ryb25nPiBpcyA1IG9yIGxlc3MgZXZlbnRzIHBlciBhbm51bS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImluLXJlcG9ydC1oZWFkZXJcXFwiPlRyYXdsIEZpc2hpbmcgSW50ZW5zaXR5PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPlNrZXRjaCBOYW1lPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+JSBMb3cgSW50ZW5zaXR5PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+JSBIaWdoIEludGVuc2l0eTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInRyYXdsXCIsYyxwLDEpLGMscCwwLDU4MjIsNTk1MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkxPV1wiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkhJR0hcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwiaW4tcmVwb3J0LWhlYWRlclxcXCI+U2V0IE5ldCBGaXNoaW5nIEludGVuc2l0eTwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPlNrZXRjaCBOYW1lPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD4lIExvdyBJbnRlbnNpdHk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPiUgSGlnaCBJbnRlbnNpdHk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzZXRuZXRcIixjLHAsMSksYyxwLDAsNjMyMiw2NDY1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTE9XXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJISUdIXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJpbi1yZXBvcnQtaGVhZGVyXFxcIj5Mb25nIExpbmUgRmlzaGluZyBJbnRlbnNpdHk8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+U2tldGNoIE5hbWU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD4lIExvdyBJbnRlbnNpdHk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD4lIEhpZ2ggSW50ZW5zaXR5PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImxvbmdsaW5lXCIsYyxwLDEpLGMscCwwLDY4MjEsNjk1MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkxPV1wiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkhJR0hcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiLS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJvdmVydmlld1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtpZihfLnMoXy5kKFwic2tldGNoQ2xhc3MuZGVsZXRlZFwiLGMscCwxKSxjLHAsMCwyNCwyNzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LXdhcm5cXFwiIHN0eWxlPVxcXCJtYXJnaW4tYm90dG9tOjEwcHg7XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFRoaXMgc2tldGNoIHdhcyBjcmVhdGVkIHVzaW5nIHRoZSBcXFwiXCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIlxcXCIgdGVtcGxhdGUsIHdoaWNoIGlzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBubyBsb25nZXIgYXZhaWxhYmxlLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byBjb3B5IHRoaXMgc2tldGNoIG9yIG1ha2UgbmV3XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBza2V0Y2hlcyBvZiB0aGlzIHR5cGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMzEzLDc0OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDMyNiw3MzcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHNpemVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxoND5NUEEgTmV0d29yazwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIFRoaXMgQ29sbGVjdGlvbiBoYXM6IDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibnVtX3Jlc2VydmVzXCIsYyxwLDApKSk7Xy5iKFwiIFR5cGUtMSBNUEFcIik7aWYoXy5zKF8uZihcInBsdXJhbF90eXBlMVwiLGMscCwxKSxjLHAsMCw0OTYsNDk3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJzXCIpO30pO2MucG9wKCk7fV8uYihcIiwgXCIpO18uYihfLnYoXy5mKFwibnVtX3R5cGUyXCIsYyxwLDApKSk7Xy5iKFwiIFR5cGUtMiBNUEFcIik7aWYoXy5zKF8uZihcInBsdXJhbF90eXBlMlwiLGMscCwxKSxjLHAsMCw1NTcsNTU4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJzXCIpO30pO2MucG9wKCk7fV8uYihcIiwgYW5kIFwiKTtfLmIoXy52KF8uZihcIm51bV9vdGhlclwiLGMscCwwKSkpO18uYihcIiBPdGhlciBNUEFcIik7aWYoXy5zKF8uZihcInBsdXJhbF9vdGhlclwiLGMscCwxKSxjLHAsMCw2MjEsNjIyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJzXCIpO30pO2MucG9wKCk7fV8uYihcIjwvc3Ryb25nPiAuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZW0+T25seSBUeXBlLTEgYW5kIFR5cGUtMiBNUEFzIGFyZSByZXBvcnRlZCBvbi48L2VtPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7aWYoXy5zKF8uZihcImFueUF0dHJpYnV0ZXNcIixjLHAsMSksYyxwLDAsODA3LDExMjUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGg0PlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihfLnJwKFwiYXR0cmlidXRlcy9hdHRyaWJ1dGVzVGFibGVcIixjLHAsXCIgICAgICAgIFwiKSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw5NDUsMTA3NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICA8dHI+PHRkPlwiKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsOTcyLDk4NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiTnVtYmVyIG9mIE1QQXNcIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMCwxMDEwLDEwMjgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIk51bWJlciBvZiBTa2V0Y2hlc1wiKTt9KTtjLnBvcCgpO31fLmIoXCI8L3RkPlwiKTtfLmIoXy52KF8uZihcIm51bVNrZXRjaGVzXCIsYyxwLDApKSk7Xy5iKFwiPHRkPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fTtpZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDExNzgsMTQ2NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxMjAwLDE0NDUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+TnVtYmVyIG9mIFNrZXRjaGVzIGluIENvbGxlY3Rpb248L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBUaGlzIGNvbGxlY3Rpb24gY29udGFpbnMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJudW1Ta2V0Y2hlc1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBza2V0Y2hcIik7aWYoXy5zKF8uZihcInBsdXJhbFNrZXRjaGVzXCIsYyxwLDEpLGMscCwwLDEzOTYsMTM5OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiZXNcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCwxNDkzLDM4MTUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMTUxNSwzNzk1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBzaXplXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+Q29hc3RhbCBIYWJpdGF0cyBJbmNsdWRlZCBpbiBUeXBlLTEgTVBBXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXRvZ2dsZS1ub2RlPVxcXCI1NTM2ZGJiNDhjNWI0M2ViMGZhY2JjNWFcXFwiIGRhdGEtdmlzaWJsZT1cXFwiZmFsc2VcXFwiPnNob3cgbGF5ZXI8L2E+PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZighXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgPHN0cm9uZz5OdW1iZXIgb2YgSGFiaXRhdCBDbGFzc2VzPC9zdHJvbmc+PC9icj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBzdHlsZT1cXFwibWFyZ2luLXRvcDowcHg7XFxcIiBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgVGhlcmUgYXJlIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwidG90YWxfaGFic1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBoYWJpdGF0IGNsYXNzZXMgaW4gdGhlIHBsYW5uaW5nIHJlZ2lvbiwgYW5kIHlvdXIgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMTk0OSwxOTU5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic2tldGNoXCIpO307Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIGluY2x1ZGVzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibmV3X2hhYnNcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4uIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHRoZSBIYWJpdGF0IENsYXNzaWZpY2F0aW9uLCBzZWVcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmRvYy5nb3Z0Lm56L0RvY3VtZW50cy9jb25zZXJ2YXRpb24vbWFyaW5lLWFuZC1jb2FzdGFsL21hcmluZS1wcm90ZWN0ZWQtYXJlYXMvbXBhLWNsYXNzaWZpY2F0aW9uLXByb3RlY3Rpb24tc3RhbmRhcmQucGRmXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBNYXJpbmUgUHJvdGVjdGVkIEFyZWFzIENsYXNzaWZpY2F0aW9uIGFuZCBQcm90ZWN0aW9uIFN0YW5kYXJkPC9hPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIpO307aWYoXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwwLDI0MjEsMjYyNSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICA8ZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXByZXNlbnRlZF9oYWJzX3BpZVxcXCIgaWQ9XFxcInJlcHJlc2VudGVkX2hhYnNfcGllXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGRpdiBjbGFzcz1cXFwicmVwcmVzZW50ZWRfaGFic19waWVfbGVnZW5kXFxcIiBpZD1cXFwicmVwcmVzZW50ZWRfaGFic19waWVfbGVnZW5kXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHNpemVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxoND5Db2FzdGFsIEhhYml0YXRzIFJlcGxpY2F0ZWRcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxhIGhyZWY9XFxcIiNcXFwiIGRhdGEtdG9nZ2xlLW5vZGU9XFxcIjU1MzZkYmI0OGM1YjQzZWIwZmFjYmM1YVxcXCIgZGF0YS12aXNpYmxlPVxcXCJmYWxzZVxcXCI+c2hvdyBsYXllcjwvYT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKCFfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgIDxzdHJvbmc+TnVtYmVyIG9mIEhhYml0YXQgQ2xhc3Nlczwvc3Ryb25nPjwvYnI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cCBzdHlsZT1cXFwibWFyZ2luLXRvcDowcHg7XFxcIiBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBUaGVyZSBhcmUgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJ0b3RhbF9oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IGhhYml0YXQgY2xhc3NlcyBpbiB0aGUgcGxhbm5pbmcgcmVnaW9uLCBhbmQgeW91ciBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzMDkzLDMxMDMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBpbmNsdWRlcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm5ld19oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+LiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiB0aGUgSGFiaXRhdCBDbGFzc2lmaWNhdGlvbiwgc2VlXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmRvYy5nb3Z0Lm56L0RvY3VtZW50cy9jb25zZXJ2YXRpb24vbWFyaW5lLWFuZC1jb2FzdGFsL21hcmluZS1wcm90ZWN0ZWQtYXJlYXMvbXBhLWNsYXNzaWZpY2F0aW9uLXByb3RlY3Rpb24tc3RhbmRhcmQucGRmXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIE1hcmluZSBQcm90ZWN0ZWQgQXJlYXMgQ2xhc3NpZmljYXRpb24gYW5kIFByb3RlY3Rpb24gU3RhbmRhcmQ8L2E+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3A+XCIpO18uYihcIlxcblwiKTt9O2lmKF8ucyhfLmYoXCJkM0lzUHJlc2VudFwiLGMscCwxKSxjLHAsMCwzNTczLDM3NjMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxkaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBsaWNhdGVkX2hhYnNfcGllXFxcIiBpZD1cXFwicmVwbGljYXRlZF9oYWJzX3BpZVxcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBsaWNhdGVkX2hhYnNfcGllX2xlZ2VuZFxcXCIgaWQ9XFxcInJlcGxpY2F0ZWRfaGFic19waWVfbGVnZW5kXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzODQ0LDUyOTcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBzaXplXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PlwiKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsMzg5OCwzOTA3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJNUEEgU2l6ZXNcIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMCwzOTMxLDM5NDMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlNrZXRjaCBTaXplc1wiKTt9KTtjLnBvcCgpO31fLmIoXCI8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8IS0tXCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDM5ODYsNDMxMyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIE9mIHRoZSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInRvdGFsX21wYV9jb3VudFwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBNUEFzIGluIHRoZSBuZXR3b3JrLCA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm1wYV9jb3VudFwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBtZWV0XCIpO2lmKCFfLnMoXy5mKFwicGx1cmFsX21wYV9jb3VudFwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNcIik7fTtfLmIoXCIgdGhlIG1pbmltdW0gc2l6ZSBkaW1lbnNpb24gb2YgNWttLiBUaGUgYXZlcmFnZSBtaW5pbXVtIGRpbWVuc2lvbiBpcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm1wYV9hdmdfc2l6ZV9ndWlkZWxpbmVcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gdGhlIDEwLTIwa20gZ3VpZGVsaW5lLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsNDM0Miw0NDA5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICA8cD5UaGUgc2l6ZSBvZiB0aGUgc2tldGNoZXMgaW4gdGhpcyBjb2xsZWN0aW9uIGFyZTo8L3A+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgLS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+XCIpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw0NTIwLDQ1MjgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIk1QQSBOYW1lXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsNDU1Miw0NTYzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJTa2V0Y2ggTmFtZVwiKTt9KTtjLnBvcCgpO31fLmIoXCI8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD5BcmVhIDwvYnI+KHNxLiBrbS4pPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjEwMHB4O1xcXCI+V2lkdGggKGttKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoxMDBweDtcXFwiPkNvYXN0bGluZSBMZW5ndGggKGttKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJwcm9wX3NpemVzXCIsYyxwLDEpLGMscCwwLDQ4MTUsNTAwNixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0ciBjbGFzcz1cIik7Xy5iKF8udihfLmYoXCJDU1NfQ0xBU1NcIixjLHAsMCkpKTtfLmIoXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJTSVpFX1NRS01cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJNSU5fRElNXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiQ09BU1RcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgVGhpcyBjb21iaW5lZCBhcmVhIHdpdGhpbiB0aGUgbmV0d29yayBhY2NvdW50cyBmb3IgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJhcmVhX3BlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IE1hcmluZSBhcmVhLCBhbmQgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IGNvYXN0bGluZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw1MzQ1LDYyMjUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHNpemVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxoND5NUEEgU2l6ZTwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5NUEEgTmFtZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+QXJlYSA8L2JyPihzcS4ga20uKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjEwMHB4O1xcXCI+V2lkdGggKGttKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjEwMHB4O1xcXCI+Q29hc3RsaW5lIExlbmd0aCAoa20pPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInByb3Bfc2l6ZXNcIixjLHAsMSksYyxwLDAsNTc1Myw1OTMzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiU0laRV9TUUtNXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJNSU5fRElNXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJDT0FTVFwiLGMscCwwKSkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgVGhpcyBhcmVhIHdpdGhpbiB0aGUgTVBBIGFjY291bnRzIGZvciA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcImFyZWFfcGVyY2VudFwiLGMscCwwKSkpO18uYihcIiU8L3N0cm9uZz4gb2YgdGhlIFNvdXRoLUVhc3QgTWFyaW5lIGFyZWEsIGFuZCA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcImNvYXN0bGluZV9sZW5ndGhfcGVyY2VudFwiLGMscCwwKSkpO18uYihcIiU8L3N0cm9uZz4gb2YgdGhlIFNvdXRoLUVhc3QgY29hc3RsaW5lLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319O18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDYyNjUsNzU1MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw2Mjg1LDc1MzIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGg0PkNvbm5lY3Rpdml0eTwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNpbmdsZVNrZXRjaFwiLGMscCwxKSxjLHAsMCw2Mzc1LDY1NTIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHAgc3R5bGU9XFxcImZvbnQtc3R5bGU6aXRhbGljO2NvbG9yOmdyYXk7XFxcIiBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICBObyBjb25uZWN0aXZpdHkgaW5mb3JtYXRpb24gZm9yIGEgY29sbGVjdGlvbiB3aXRoIG9uZSBza2V0Y2guIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJzaW5nbGVTa2V0Y2hcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgICAgPCEtLVwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8ZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNvbm5lY3Rpdml0eV9waWVcXFwiIGlkPVxcXCJjb25uZWN0aXZpdHlfcGllXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjb25uZWN0aXZpdHlfcGllX2xlZ2VuZFxcXCIgaWQ9XFxcImNvbm5lY3Rpdml0eV9waWVfbGVnZW5kXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIC0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPk9mIHRoZSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInRvdGFsX21wYV9jb3VudFwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBNUEFzIGluIHRoZSBuZXR3b3JrLCA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcImNvbm5lY3RlZF9tcGFfY291bnRcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz5cIik7aWYoXy5zKF8uZihcInBsdXJhbF9jb25uZWN0ZWRfbXBhX2NvdW50XCIsYyxwLDEpLGMscCwwLDY5NzcsNjk4MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiIGFyZVwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcInBsdXJhbF9jb25uZWN0ZWRfbXBhX2NvdW50XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiIGlzXCIpO307Xy5iKFwiIHdpdGhpbiAxMDAga20gb2YgZWFjaCBvdGhlci4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNvbm5fdmFsdWVzXFxcIj5UaGUgbWluaW11bSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBNUEFzIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibWluX2Rpc3RhbmNlXCIsYyxwLDApKSk7Xy5iKFwiIGttPC9zdHJvbmc+Ljwvc3Bhbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNvbm5fdmFsdWVzXFxcIj5UaGUgbWF4aW11bSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBNUEFzIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibWF4X2Rpc3RhbmNlXCIsYyxwLDApKSk7Xy5iKFwiIGttPC9zdHJvbmc+Ljwvc3Bhbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNvbm5fdmFsdWVzXFxcIj5UaGUgYXZlcmFnZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBNUEFzIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibWVhbl9kaXN0YW5jZVwiLGMscCwwKSkpO18uYihcIiBrbTwvc3Ryb25nPi48L3NwYW4+XCIpO18uYihcIlxcblwiKTt9O18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7aWYoXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMCw3NTk2LDgwMDIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHNpemVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxoND5TaXplPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgVGhpcyBza2V0Y2ggYXJlYSBpcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInNpemVcIixjLHAsMCkpKTtfLmIoXCIgc3F1YXJlIGtpbG9tZXRlcnM8L3N0cm9uZz4sIGFuZCBpdCBpbmNsdWRlcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcImNvYXN0bGluZV9sZW5ndGhfcGVyY2VudFwiLGMscCwwKSkpO18uYihcIiU8L3N0cm9uZz4gb2YgdGhlIFNvdXRoLUVhc3QgUGxhbm5pbmcgUmVnaW9uLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgVGhpcyBza2V0Y2ggaW5jbHVkZXMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb2FzdGxpbmVfbGVuZ3RoXCIsYyxwLDApKSk7Xy5iKFwiIGtpbG9tZXRlcnM8L3N0cm9uZz4gb2YgY29hc3RsaW5lLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319O18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8IS0tXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBzaXplXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5OdW1iZXIgb2YgSGFiaXRhdHM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgVGhlIFwiKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsODE0Myw4MjAwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgTWFyaW5lIFByb3RlY3RlZCBBcmVhXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsODE4Miw4MTgzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJzXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsODIyNCw4MjY2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJza2V0Y2hcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw4MjQ3LDgyNDksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImVzXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIiBpbmNsdWRlXCIpO2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic1wiKTt9O18uYihcIiA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm51bV9oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IG9mIHRoZSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInRvdGFsX2hhYnNcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gY2xhc3NpZmllZCBoYWJpdGF0cy5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCItLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1widXNlc1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtpZihfLnMoXy5kKFwic2tldGNoQ2xhc3MuZGVsZXRlZFwiLGMscCwxKSxjLHAsMCwyNCwyNzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LXdhcm5cXFwiIHN0eWxlPVxcXCJtYXJnaW4tYm90dG9tOjEwcHg7XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFRoaXMgc2tldGNoIHdhcyBjcmVhdGVkIHVzaW5nIHRoZSBcXFwiXCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIlxcXCIgdGVtcGxhdGUsIHdoaWNoIGlzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBubyBsb25nZXIgYXZhaWxhYmxlLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byBjb3B5IHRoaXMgc2tldGNoIG9yIG1ha2UgbmV3XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBza2V0Y2hlcyBvZiB0aGlzIHR5cGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaGFzQ29hc3RhbFwiLGMscCwxKSxjLHAsMCwzMTAsMTA0NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PkV4aXN0aW5nIENvYXN0YWwgQ29uc2VudHMgPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTNkNzE5YTQ5MzgwMTc0YTc3NjZkZDg1XFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICBzaG93IGxheWVyPC9hPjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cD5cIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw1MjQsNTU0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJBIHNrZXRjaCB3aXRoaW4gdGhlIGNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJUaGUgc2tldGNoXCIpO307Xy5iKFwiIGNvbnRhaW5zIG9yIGlzIHdpdGhpbiAyMDBtIG9mIHNpdGVzIHdpdGggUmVzb3VyY2UgQ29uc2VudHMuPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjI1MHB4O1xcXCI+Q29uc2VudCBUeXBlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImNvYXN0YWxfY29uc2VudHNcIixjLHAsMSksYyxwLDAsODkzLDk3OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkZFQVRfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzVXNlc1wiLGMscCwxKSxjLHAsMCwxMDc0LDQxNDUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJoYXNSZWNVc2VzXCIsYyxwLDEpLGMscCwwLDEwOTIsMjM1NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PlJlY3JlYXRpb25hbCBVc2VzIDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPCEtLVwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNTbWFyb1wiLGMscCwxKSxjLHAsMCwxMjAwLDE2ODgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICA8cD48c3Ryb25nPlNwZWN0cnVtIG9mIE1BcmluZSBSZWNyZWF0aW9uYWwgT3Bwb3J0dW5pdHkgKFNNQVJPKTwvc3Ryb25nPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHA+XCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMTMzOSwxMzQ5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJDb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiU2tldGNoXCIpO307Xy5iKFwiIGluY2x1ZGVzIGFyZWEocykgaWRlbnRpZmllZCBhcyBoYXZpbmcgPHN0cm9uZz4gbWVkaXVtIG9yIGhpZ2ggPC9zdHJvbmc+IHJlY3JlYXRpb25hbCBvcHBvcnR1bml0eS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGVtPllvdSBjYW4gZmluZCBtb3JlIGluZm9ybWF0aW9uIG9uIFNNQVJPIGluIHRoZSBcXFwiZGF0YSBkZXNjcmlwdGlvblxcXCIgYnkgcmlnaHQgY2xpY2tpbmcgb24gdGhlIGxheWVyIG5hbWUuPC9lbT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvYnI+PC9icj5cIik7Xy5iKFwiXFxuXCIpO307fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgLS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5BY3Rpdml0eSBUeXBlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5OdW1iZXIgb2YgU2l0ZXM8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzUmVjVXNlc1wiLGMscCwxKSxjLHAsMCwxOTU5LDIxNDEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJyZWNfdXNlc1wiLGMscCwxKSxjLHAsMCwxOTg3LDIxMTUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkNPVU5UXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc1JlY1VzZXNcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkIGNvbHNwYW49Mj48ZW0+Tm9uZSBQcmVzZW50PC9lbT48L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNIZXJpdGFnZVwiLGMscCwxKSxjLHAsMCwyMzkxLDMzNDYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDQ+QXJjaGVvbG9naWNhbCBJbmZvcm1hdGlvbiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTU3OGYxNGNmZjM5MDU5YTU4MzY0NmM5XFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5zaG93IGxheWVyPC9hPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8cD5cIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwyNjUwLDI2ODAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkEgc2tldGNoIHdpdGhpbiB0aGUgY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlRoZSBza2V0Y2hcIik7fTtfLmIoXCIgY29udGFpbnMgb3IgaXMgd2l0aGluIDIwMG0gb2Ygc2l0ZXMgaWRlbnRpZmllZCBhcyBoYXZpbmcgc2lnbmlmaWNhbnQgaGVyaXRhZ2UgdmFsdWVzLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5IZXJpdGFnZSBUeXBlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGg+TnVtYmVyIG9mIFNpdGVzPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhlcml0YWdlXCIsYyxwLDEpLGMscCwwLDMxMTMsMzI1MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiQ09VTlRcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9O30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJoYXNJbmZyYXN0cnVjdHVyZVwiLGMscCwxKSxjLHAsMCwzMzg3LDQxMjIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDQ+SW5mcmFzdHJ1Y3R1cmU8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxwPlwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDM1MjMsMzU1MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiQSBza2V0Y2ggd2l0aGluIHRoZSBjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiVGhlIHNrZXRjaFwiKTt9O18uYihcIiBjb250YWlucyBvciBpcyB3aXRoaW4gMjAwbSBvZiBzaXRlcyB3aXRoIGV4aXN0aW5nIGluZnJhc3RydWN0dXJlLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5UeXBlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImluZnJhc3RydWN0dXJlXCIsYyxwLDEpLGMscCwwLDM5MjAsNDAyMSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc1VzZXNcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDQ+QWN0aXZpdGllcyBhbmQgVXNlczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cD5UaGUgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNDI4MSw0MjkxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic2tldGNoXCIpO307Xy5iKFwiICBkb2VzIDxzdHJvbmc+bm90PC9zdHJvbmc+IGluY2x1ZGUgYW55IDxzdHJvbmc+YWN0aXZpdGllcyBvciB1c2VzPC9zdHJvbmc+LjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNTZWFiaXJkc1wiLGMscCwxKSxjLHAsMCw0NDY4LDUxOTQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkJpcmRzIDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc1NlYWJpcmRBcmVhc1wiLGMscCwxKSxjLHAsMCw0NTU2LDQ4NDAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj48c3Ryb25nPkltcG9ydGFudCBTZWFiaXJkIEFyZWFzPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2VhYmlyZHNcIixjLHAsMSksYyxwLDAsNDcwMyw0NzgzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTmFtZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgIFwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNTZWFiaXJkQ29sb25pZXNcIixjLHAsMSksYyxwLDAsNDg5Myw1MTYzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPjxzdHJvbmc+U2VhYmlyZCBDb2xvbmllczwvc3Ryb25nPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2VhYmlyZF9jb2xvbmllc1wiLGMscCwxKSxjLHAsMCw1MDMzLDUxMDUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJoYXNNYXJpbmVTcGVjaWVzXCIsYyxwLDEpLGMscCwwLDUyMzIsNTY5NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+TWFyaW5lIE1hbW1hbHM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+U3BlY2llczwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJtYW1tYWxzXCIsYyxwLDEpLGMscCwwLDU0ODAsNTU2MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwic2VhbHNcIixjLHAsMSksYyxwLDAsNTU5NSw1NjQwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJOYW1lXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzTWFyaW5lU3BlY2llc1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5TcGVjaWVzIEluZm9ybWF0aW9uPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwPlRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw1ODQ4LDU4ODIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcInNrZXRjaGVzIHdpdGhpbiB0aGUgY29sbGVjdGlvbiBkbyBcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2ggZG9lc1wiKTt9O18uYihcIiA8c3Ryb25nPm5vdDwvc3Ryb25nPiBpbmNsdWRlIGFueSA8c3Ryb25nPmltcG9ydGFudCBtYXJpbmUgbWFtbWFsIGFyZWFzPC9zdHJvbmc+LjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTtyZXR1cm4gXy5mbCgpOzt9KTtcblxuaWYodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHRoaXNbXCJUZW1wbGF0ZXNcIl07XG59Il19
