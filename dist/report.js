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
    this.getSelectedColumn = __bind(this.getSelectedColumn, this);
    this.getSortDir = __bind(this.getSortDir, this);
    this.setSortingColor = __bind(this.setSortingColor, this);
    this.getHabitatRowString = __bind(this.getHabitatRowString, this);
    this.renderSort = __bind(this.renderSort, this);
    this.setupHabitatSorting = __bind(this.setupHabitatSorting, this);
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

  EnvironmentTab.prototype.dependencies = ['HabitatsEnvironment', 'HabitatsOverview', 'AdjacentTerrestrial', 'HabRepsToolbox'];

  EnvironmentTab.prototype.render = function() {
    var all_habs, attributes, context, d3IsPresent, hab_sizes, hab_types, habitats_represented, habs_in_sketch, habs_plural, hasCovenants, hasHabTypes, hasNapalisCovenants, hasProtected, hasQE2covenants, hasSigHabs, isCollection, isGeneric, isMPA, napalis_covenants, protected_areas, qe2_covenants, scid, showAdjacent, sig_habs;
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
    isMPA = scid === MPA_ID || scid === MPA_COLLECTION_ID;
    hab_sizes = this.recordSet('HabRepsToolbox', 'HabSizes').toArray();
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
    habitats_represented = this.recordSet('HabRepsToolbox', 'RepresentedHabs').toArray();
    this.roundData(habitats_represented);
    all_habs = this.processHabitats(habitats_represented);
    hab_types = all_habs[0];
    hasHabTypes = (hab_types != null ? hab_types.length : void 0) > 0;
    sig_habs = all_habs[1];
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
      hab_types: hab_types,
      hasHabTypes: hasHabTypes,
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
      showAdjacent: showAdjacent
    };
    this.$el.html(this.template.render(context, partials));
    this.enableLayerTogglers();
    this.roundData(hab_sizes);
    this.setupHabitatSorting(hab_types, isMPA, isCollection);
    this.setupSigHabitatSorting(sig_habs, isMPA, isCollection);
    return this.enableTablePaging();
  };

  EnvironmentTab.prototype.processHabitats = function(habs_represented) {
    var critical_habitats, hab, hab_types, _i, _len;
    hab_types = [];
    critical_habitats = [];
    for (_i = 0, _len = habs_represented.length; _i < _len; _i++) {
      hab = habs_represented[_i];
      if (hab.HAB_TYPE === "Bryozoan reef" || hab.HAB_TYPE === "Macrocystis bed") {
        critical_habitats.push(hab);
      } else {
        hab_types.push(hab);
      }
    }
    return [hab_types, critical_habitats];
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
    return this.renderSort('sig_hab_type', tableName, habitats, void 0, "HAB_TYPE", tbodyName, false, this.getHabitatRowString, isMPA, isCollection);
  };

  EnvironmentTab.prototype.setupHabitatSorting = function(habitats, isMPA, isCollection) {
    var tableName, tbodyName,
      _this = this;
    tbodyName = '.hab_values';
    tableName = '.hab_table';
    this.$('.hab_type').click(function(event) {
      return _this.renderSort('hab_type', tableName, habitats, event, "HAB_TYPE", tbodyName, false, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.hab_new_area').click(function(event) {
      return _this.renderSort('hab_new_area', tableName, habitats, event, "SIZE_SQKM", tbodyName, true, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.hab_new_perc').click(function(event) {
      return _this.renderSort('hab_new_perc', tableName, habitats, event, "PERC", tbodyName, true, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.hab_represent').click(function(event) {
      return _this.renderSort('hab_represent', tableName, habitats, event, "REPRESENT", tbodyName, false, _this.getHabitatRowString, isMPA, isCollection);
    });
    this.$('.hab_replicate').click(function(event) {
      return _this.renderSort('hab_replicate', tableName, habitats, event, "REPLIC", tbodyName, false, _this.getHabitatRowString, isMPA, isCollection);
    });
    return this.renderSort('hab_type', tableName, habitats, void 0, "HAB_TYPE", tbodyName, false, this.getHabitatRowString, isMPA, isCollection);
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
          return parseFloat(row[sortBy]);
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
          columns = ["HAB_TYPE", "SIZE_SQKM", "PERC", "REPRESENT", "REPLIC"];
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

  EnvironmentTab.prototype.getHabitatRowString = function(d, isMPA, isCollection) {
    var replicated_str, represented_str;
    if (d === void 0) {
      return "";
    }
    represented_str = "";
    replicated_str = "";
    if (isMPA) {
      represented_str = "<td" > +d.REPRESENT + "</td>";
      if (isCollection) {
        replicated_str = "<td>" + d.REPLIC + "</td>";
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
        return classname.lastIndexOf('hab', 0) === 0;
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
    this.roundData = __bind(this.roundData, this);
    _ref = FishingTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  FishingTab.prototype.name = 'Fishing';

  FishingTab.prototype.className = 'fishing';

  FishingTab.prototype.timeout = 120000;

  FishingTab.prototype.template = templates.fishing;

  FishingTab.prototype.dependencies = ['FishingIntensity', 'FishingAreas'];

  FishingTab.prototype.render = function() {
    var attributes, context, d3IsPresent, existing_customary_fishing, existing_fishing_areas, hasAnyFishing, hasCustomary, hasExistingCustomary, hasExistingFishing, hasProposedCustomary, isCollection, isMPA, longline, proposed_customary_fishing, scid, setnet, trawl;
    if (window.d3) {
      d3IsPresent = true;
    } else {
      d3IsPresent = false;
    }
    isCollection = this.model.isCollection();
    scid = this.sketchClass.id;
    if (scid === MPA_ID || scid === MPA_COLLECTION_ID) {
      isMPA = true;
    } else {
      isMPA = false;
    }
    if (isMPA) {
      setnet = this.recordSet('FishingIntensity', 'SetNet').toArray();
      this.roundData(setnet);
      trawl = this.recordSet('FishingIntensity', 'Trawl').toArray();
      this.roundData(trawl);
      longline = this.recordSet('FishingIntensity', 'LongLine').toArray();
      this.roundData(longline);
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
        setnet: setnet,
        trawl: trawl,
        longline: longline,
        isMPA: isMPA,
        existing_customary_fishing: existing_customary_fishing,
        hasExistingCustomary: hasExistingCustomary,
        proposed_customary_fishing: proposed_customary_fishing,
        hasProposedCustomary: hasProposedCustomary,
        existing_fishing_areas: existing_fishing_areas,
        hasExistingFishing: hasExistingFishing,
        hasAnyFishing: hasAnyFishing,
        hasCustomary: hasCustomary,
        isMPA: isMPA
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
        isMPA: isMPA
      };
    }
    this.$el.html(this.template.render(context, partials));
    return this.enableLayerTogglers();
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

  return FishingTab;

})(ReportTab);

module.exports = FishingTab;


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":17,"./ids.coffee":13,"reportTab":"a21iR2"}],13:[function(require,module,exports){
module.exports = {
  GENERIC_ID: '539f5ec68d10926c29fe7762',
  GENERIC_COLLECTION_ID: '53fd19550406de684c118969',
  MPA_ID: '54d81290fa94e697759ce771',
  MPA_COLLECTION_ID: '5582e605ac2dddd42976f41b'
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
    this.getNumHabs = __bind(this.getNumHabs, this);
    this.build_values = __bind(this.build_values, this);
    _ref = OverviewTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  OverviewTab.prototype.name = 'Overview';

  OverviewTab.prototype.className = 'overview';

  OverviewTab.prototype.timeout = 120000;

  OverviewTab.prototype.template = templates.overview;

  OverviewTab.prototype.dependencies = ['Size', 'CoastlineLength', 'HabitatsOverview', 'ProposalSize', 'ProposalConnectivity', 'HabRepsToolbox'];

  OverviewTab.prototype.render = function() {
    var Error, TOTAL_COASTLINE_LENGTH, TOTAL_HABS, attributes, bad_color, coastline_length, coastline_length_percent, conn_pie_values, connected_mpa_count, context, d3IsPresent, good_color, hab_sizes, isCollection, isGeneric, isMPA, max_distance, mean_distance, min_distance, mpa_avg_min_dim, mpa_avg_size_guideline, mpa_count, new_habs, new_size, not_replicated, not_represented, numSketches, num_habs, num_replicated_habs, num_represented_habs, num_reserves, num_type2, percent, pluralSketches, plural_connected_mpa_count, plural_mpa_count, prop_sizes, ratio, replicated_habs_pie_values, represented_habs, represented_habs_pie_values, reserve_types, scid, size, total_habs, total_mpa_count, total_percent;
    TOTAL_COASTLINE_LENGTH = 667.594;
    TOTAL_HABS = 30;
    scid = this.sketchClass.id;
    isCollection = this.model.isCollection();
    isMPA = scid === MPA_ID || scid === MPA_COLLECTION_ID;
    num_reserves = 0;
    num_type2 = 0;
    if (isCollection) {
      numSketches = this.model.getChildren().length;
      if (isMPA) {
        reserve_types = this.getReserveValues(this.model.getChildren());
        num_reserves = reserve_types[0];
        num_type2 = reserve_types[1];
      }
    } else {
      numSketches = 1;
    }
    pluralSketches = numSketches > 1;
    isMPA = scid === MPA_ID || scid === MPA_COLLECTION_ID;
    isGeneric = scid === GENERIC_ID || scid === GENERIC_COLLECTION_ID;
    prop_sizes = this.recordSet('ProposalSize', 'Sizes').toArray();
    represented_habs = this.recordSet('HabRepsToolbox', 'RepresentedHabs').toArray();
    hab_sizes = this.recordSet('HabRepsToolbox', 'RepresentedHabs').toArray();
    num_habs = hab_sizes != null ? hab_sizes.length : void 0;
    num_represented_habs = this.getNumHabs("REPRESENT", represented_habs);
    num_replicated_habs = this.getNumHabs("REPLIC", represented_habs);
    console.log("num represented: ", num_represented_habs);
    console.log("num replicated: ", num_replicated_habs);
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
    try {
      size = this.recordSet('Size', 'Size').float('SIZE_SQKM');
      if (size < 0.1) {
        new_size = "< 0.1";
      } else {
        new_size = this.addCommas(size);
      }
    } catch (_error) {
      Error = _error;
      console.log('error getting size');
      new_size = 0;
    }
    try {
      percent = this.recordSet('Size', 'Percent').float('PERC');
      if (percent === 0 && total_percent > 0) {
        percent = "< 1";
      }
    } catch (_error) {
      Error = _error;
      percent = total_percent;
    }
    coastline_length = this.recordSet('CoastlineLength', 'CoastlineLength').float('LGTH_IN_M');
    coastline_length_percent = ((coastline_length / 1000) / TOTAL_COASTLINE_LENGTH) * 100;
    if (coastline_length_percent > 0 && coastline_length_percent < 1) {
      coastline_length_percent = "< 1";
    } else {
      coastline_length_percent = parseFloat(coastline_length_percent).toFixed(1);
    }
    coastline_length = this.addCommas(coastline_length);
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
      represented_habs_pie_values = this.build_values("Habitat-types Represented", num_represented_habs, good_color, "Habitat-types Not Represented", not_represented, bad_color);
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
      size: new_size,
      coastline_length: coastline_length,
      coastline_length_percent: coastline_length_percent,
      new_habs: new_habs,
      total_habs: total_habs,
      ratio: ratio,
      percent: percent,
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
      num_type2: num_type2
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

  OverviewTab.prototype.getNumHabs = function(attr_name, habitats) {
    var count, hab, _i, _len;
    if ((habitats != null ? habitats.length : void 0) === 0) {
      return 0;
    }
    count = 0;
    for (_i = 0, _len = habitats.length; _i < _len; _i++) {
      hab = habitats[_i];
      if (hab[attr_name] === "Yes") {
        count += 1;
      }
    }
    return count;
  };

  OverviewTab.prototype.getReserveValues = function(reserves) {
    var Error, att, attrs, num_reserves, num_type2, res, _i, _j, _len, _len1;
    num_reserves = 0;
    num_type2 = 0;
    try {
      for (_i = 0, _len = reserves.length; _i < _len; _i++) {
        res = reserves[_i];
        attrs = res.getAttributes();
        for (_j = 0, _len1 = attrs.length; _j < _len1; _j++) {
          att = attrs[_j];
          if (att.exportid === "MANAGEMENT") {
            if (att.value[0] === "Type2") {
              num_type2 += 1;
            } else if (att.value[0] === "MR") {
              num_reserves += 1;
            }
          }
        }
      }
    } catch (_error) {
      Error = _error;
      console.log('ran into problem getting mpa types');
    }
    return [num_reserves, num_type2];
  };

  OverviewTab.prototype.getDataValue = function(data) {
    return data.value;
  };

  OverviewTab.prototype.drawPie = function(data, pie_name) {
    var arc, arcs, chart, el, h, legends, pie, r, vis, w;
    if (window.d3) {
      w = 90;
      h = 75;
      r = 25;
      vis = d3.select(pie_name).append("svg:svg").data([data]).attr("width", w).attr("height", h).append("svg:g").attr("transform", "translate(" + (r * 2) + "," + (r + 5) + ")");
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
        ps.SIZE_SQKM = parseFloat(ps.SIZE_SQKM).toFixed(1);
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
this["Templates"]["environment"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Habitats Present in ");if(_.s(_.f("isCollection",c,p,1),c,p,0,382,392,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" <a href=\"#\" data-toggle-node=\"5536dbb48c5b43eb0facbc5a\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);_.b("    <p>");_.b("\n" + i);_.b("      <i>");_.b("\n" + i);_.b("        Area (%) refers to the percentage of the habitat contained within the ");_.b("\n" + i);_.b("        ");if(_.s(_.f("isGeneric",c,p,1),c,p,0,666,676,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isGeneric",c,p,1),c,p,1,0,0,"")){_.b("network");};_.b("\n" + i);_.b("        ");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" as a proportion of the total area of habitat within the South-East Marine region. ");if(_.s(_.f("isMPA",c,p,1),c,p,0,867,966,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Only habitats that meet criteria for a viable habitat size are included as a ‘represented’ habitat.");});c.pop();}_.b("\n" + i);_.b("      </i>");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("    <p class=\"in-report-header\">Habitat types</p>");_.b("\n" + i);if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,1069,1827,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <table data-paging=\"20\" class=\"hab_table\"> ");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th class=\"sorting_col\" style=\"width:250px;\"><a class=\"hab_type sort_up\" href=\"#\">Habitat</a></th>");_.b("\n" + i);_.b("              <th><a  class=\"hab_new_area sort_down\" href=\"#\" >Area (km<sup>2</sup>)</a></th>");_.b("\n" + i);_.b("              <th><a class=\"hab_new_perc sort_down\" href=\"#\">Area (%)</a></th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,1467,1713,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <th><a class=\"hab_represent sort_down\" href=\"#\" >Represented</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,1581,1681,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  <th><a class=\"hab_replicate sort_down\" href=\"#\" >Replicated</th>");_.b("\n");});c.pop();}});c.pop();}_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("         <tbody class=\"hab_values\"></tbody>");_.b("\n" + i);_.b("       </table>");_.b("\n");});c.pop();}if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:180px;\">Habitat</th>");_.b("\n" + i);_.b("              <th>Area (km<sup>2</sup>)</th>");_.b("\n" + i);_.b("              <th>Area (%)</th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,2088,2244,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <th>Represented</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,2157,2212,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  <th>Replicated</th>");_.b("\n");});c.pop();}});c.pop();}_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasHabTypes",c,p,1),c,p,0,2338,2726,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hab_types",c,p,1),c,p,0,2367,2699,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("PERC",c,p,0)));_.b("</td>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,2524,2654,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  <td>");_.b(_.v(_.f("REPRESENT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                  ");if(_.s(_.f("isCollection",c,p,1),c,p,0,2601,2620,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<td>");_.b(_.v(_.f("REPLIC",c,p,0)));_.b("</td>");});c.pop();}_.b("\n");});c.pop();}_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasHabTypes",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td colspan=\"");if(_.s(_.f("isCollection",c,p,1),c,p,0,2837,2838,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("5");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("4");};_.b("\">");_.b("\n" + i);_.b("                  <i>There are no habitat types.</i>");_.b("\n" + i);_.b("                </td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n");};_.b("    <p class=\"in-report-header\">Habitats of Significance</p>");_.b("\n" + i);if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,3157,3909,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <table data-paging=\"20\" class=\"sig_hab_table\"> ");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th class=\"sorting_col\" style=\"width:250px;\"><a class=\"sig_hab_type sort_up\" href=\"#\">Habitat</a></th>");_.b("\n" + i);_.b("            <th><a  class=\"sig_hab_new_area sort_down\" href=\"#\" >Area (km<sup>2</sup>)</a></th>");_.b("\n" + i);_.b("            <th><a class=\"sig_hab_new_perc sort_down\" href=\"#\">Area (%)</a></th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,3557,3801,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <th><a class=\"sig_hab_represent sort_down\" href=\"#\">Represented</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,3672,3771,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <th><a class=\"sig_hab_replicate sort_down\" href=\"#\">Replicated</th>");_.b("\n");});c.pop();}});c.pop();}_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("       <tbody class=\"sig_hab_values\"></tbody>");_.b("\n" + i);_.b("     </table>");_.b("\n");});c.pop();}if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th style=\"width:180px;\">Habitat</th>");_.b("\n" + i);_.b("            <th>Area (km<sup>2</sup>)</th>");_.b("\n" + i);_.b("            <th>Area (%)</th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,4154,4266,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <th>Represented</th>");_.b("\n" + i);_.b("            ");if(_.s(_.f("isCollection",c,p,1),c,p,0,4217,4236,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<th>Replicated</th>");});c.pop();}_.b("\n");});c.pop();}_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("hasSigHabs",c,p,1),c,p,0,4349,4705,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("sig_habs",c,p,1),c,p,0,4373,4683,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("PERC",c,p,0)));_.b("</td>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,4520,4644,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <td>");_.b(_.v(_.f("REPRESENT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                ");if(_.s(_.f("isCollection",c,p,1),c,p,0,4593,4612,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<td>");_.b(_.v(_.f("REPLIC",c,p,0)));_.b("</td>");});c.pop();}_.b("\n");});c.pop();}_.b("            </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasSigHabs",c,p,1),c,p,1,0,0,"")){_.b("          <tr>");_.b("\n" + i);_.b("              <td colspan=\"");if(_.s(_.f("isCollection",c,p,1),c,p,0,4804,4805,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("5");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("4");};_.b("\">");_.b("\n" + i);_.b("                <i>There are no habitats of significance.</i>");_.b("\n" + i);_.b("              </td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");};_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n");};_.b("  </div>");_.b("\n" + i);if(_.s(_.f("showAdjacent",c,p,1),c,p,0,5061,6538,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Adjacent Terrestrial Information</h4>");_.b("\n" + i);_.b("        <p><em>MPA Guidelines: \"Consider adjacent terrestrial environment\" (areas shown below are within 100m of ");if(_.s(_.f("isCollection",c,p,1),c,p,0,5283,5309,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("a sketch in the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b(" the sketch ");};_.b(")</em></p>");_.b("\n" + i);_.b("        <p class=\"large\"><strong>Protected Areas</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"20\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasProtected",c,p,1),c,p,0,5525,5681,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("protected_areas",c,p,1),c,p,0,5560,5648,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasProtected",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("        <p class=\"large\"><strong>Conservation Covenants</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasCovenants",c,p,1),c,p,0,6030,6329,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("qe2_covenants",c,p,1),c,p,0,6063,6151,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}if(_.s(_.f("napalis_covenants",c,p,1),c,p,0,6206,6294,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasCovenants",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n");return _.fl();;});
this["Templates"]["fishing"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("hasAnyFishing",c,p,1),c,p,0,316,2560,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hasExistingFishing",c,p,1),c,p,0,344,1384,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("      <h4>Existing Fisheries Management</h4>");_.b("\n" + i);_.b("          <p><em>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,475,485,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" includes the following existing fisheries restrictions. ");_.b("\n" + i);_.b("          Also shown is the extent that the fisheries restrictions apply to the ");if(_.s(_.f("isCollection",c,p,1),c,p,0,697,705,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketches");});c.pop();}_.b("\n" + i);_.b("          ");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" as a percentage of total sketch area. For example, 100% means no fishing of that type is currently allowed within the sketch.</em></p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <thead>");_.b("\n" + i);_.b("              <tr>");_.b("\n" + i);_.b("                <th style=\"width:250px;\">Name</th>");_.b("\n" + i);_.b("                <th>Percent</th>");_.b("\n" + i);_.b("              </tr>");_.b("\n" + i);_.b("            </thead>");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("existing_fishing_areas",c,p,1),c,p,0,1169,1301,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("PERC_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}if(_.s(_.f("hasCustomary",c,p,1),c,p,0,1429,2541,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Customary Areas</h4>");_.b("\n" + i);if(_.s(_.f("hasExistingCustomary",c,p,1),c,p,0,1545,1992,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <p> The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1581,1591,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes the following <strong>existing</strong> Customary Areas:</p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("existing_customary_fishing",c,p,1),c,p,0,1819,1912,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n");});c.pop();}if(_.s(_.f("hasProposedCustomary",c,p,1),c,p,0,2051,2498,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <p> The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,2087,2097,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes the following <strong>proposed</strong> Customary Areas:</p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("proposed_customary_fishing",c,p,1),c,p,0,2325,2418,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n");});c.pop();}_.b("      </div>");_.b("\n");});c.pop();}_.b("\n");});c.pop();}if(!_.s(_.f("hasAnyFishing",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Existing or Customary Areas</h4>");_.b("\n" + i);_.b("        <p>No information on existing fishing areas or customary use is available for this area.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,2824,4705,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Fishing Intensity</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        The following tables contains the percent of the total SEMPF low intensity and high intensity fishing that may be displaced by the sketch. <strong>High intensity</strong> is greater than an average of 5 events per annum, <strong>Low</strong> is 5 or less events per annum.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("      <p class=\"in-report-header\">Trawl Fishing Intensity</p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>Sketch Name</th>");_.b("\n" + i);_.b("            <th>% Low Intensity</th>");_.b("\n" + i);_.b("            <th>% High Intensity</th>");_.b("\n" + i);_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("trawl",c,p,1),c,p,0,3519,3650,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("\n" + i);_.b("      <p class=\"in-report-header\">Set Net Fishing Intensity</p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>Sketch Name</th>");_.b("\n" + i);_.b("              <th>% Low Intensity</th>");_.b("\n" + i);_.b("              <th>% High Intensity</th>");_.b("\n" + i);_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("setnet",c,p,1),c,p,0,4019,4162,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("      <p class=\"in-report-header\">Long Line Fishing Intensity</p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>Sketch Name</th>");_.b("\n" + i);_.b("            <th>% Low Intensity</th>");_.b("\n" + i);_.b("            <th>% High Intensity</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("longline",c,p,1),c,p,0,4518,4649,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["overview"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,313,575,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isMPA",c,p,1),c,p,0,326,564,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>MPA Network</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This Collection has <strong>");_.b(_.v(_.f("num_reserves",c,p,0)));_.b(" Marine Reserves</strong> and <strong>");_.b(_.v(_.f("num_type2",c,p,0)));_.b(" Type-2 MPA</strong>.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);if(_.s(_.f("anyAttributes",c,p,1),c,p,0,612,896,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection\">");_.b("\n" + i);_.b("    <h4>");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("</h4>");_.b("\n" + i);_.b(_.rp("attributes/attributesTable",c,p,"    "));if(_.s(_.f("isCollection",c,p,1),c,p,0,734,856,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <tr><td>");if(_.s(_.f("isMPA",c,p,1),c,p,0,757,771,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Number of MPAs");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,795,813,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Number of Sketches");});c.pop();}_.b("</td>");_.b(_.v(_.f("numSketches",c,p,0)));_.b("<td>");_.b("\n");});c.pop();}_.b("    </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("\n" + i);if(_.s(_.f("isGeneric",c,p,1),c,p,0,933,1220,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,955,1200,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection\">");_.b("\n" + i);_.b("      <h4>Number of Sketches in Collection</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This collection contains <strong>");_.b(_.v(_.f("numSketches",c,p,0)));_.b("</strong> sketch");if(_.s(_.f("pluralSketches",c,p,1),c,p,0,1151,1153,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("es");});c.pop();}_.b(".");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,1248,3596,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,1270,3576,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Habitats Represented in a fully Protected Area");_.b("\n" + i);_.b("        <a href=\"#\" data-toggle-node=\"53a0a31cd3f6064d2c17580c\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("      <strong>Number of Habitat Classes</strong></br>");_.b("\n" + i);_.b("      <p style=\"margin-top:0px;\" class=\"large\">");_.b("\n" + i);_.b("        There are <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> habitat classes in the planning region, and your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1711,1721,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("\n" + i);_.b("        includes <strong>");_.b(_.v(_.f("new_habs",c,p,0)));_.b("</strong>. For more information on the Habitat Classification, see");_.b("\n" + i);_.b("        the <a href=\"http://www.doc.govt.nz/Documents/conservation/marine-and-coastal/marine-protected-areas/mpa-classification-protection-standard.pdf\" target=\"_blank\">");_.b("\n" + i);_.b("        Marine Protected Areas Classification and Protection Standard</a>");_.b("\n" + i);_.b("      </p>");_.b("\n");};if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,2183,2387,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <div>");_.b("\n" + i);_.b("          <div class=\"represented_habs_pie\" id=\"represented_habs_pie\"></div>");_.b("\n" + i);_.b("          <div class=\"represented_habs_pie_legend\" id=\"represented_habs_pie_legend\"></div>");_.b("\n" + i);_.b("        </div>");_.b("\n");});c.pop();}_.b("    </div>");_.b("\n" + i);_.b("    ");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Habitats Represented in at Least 2 Prot. Areas");_.b("\n" + i);_.b("        <a href=\"#\" data-toggle-node=\"53a0a31cd3f6064d2c17580c\" data-visible=\"false\">show layer</a>");_.b("\n" + i);_.b("      </h4>");_.b("\n" + i);if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("        <strong>Number of Habitat Classes</strong></br>");_.b("\n" + i);_.b("        <p style=\"margin-top:0px;\" class=\"large\">");_.b("\n" + i);_.b("          There are <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> habitat classes in the planning region, and your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,2874,2884,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("\n" + i);_.b("          includes <strong>");_.b(_.v(_.f("new_habs",c,p,0)));_.b("</strong>. For more information on the Habitat Classification, see");_.b("\n" + i);_.b("          the <a href=\"http://www.doc.govt.nz/Documents/conservation/marine-and-coastal/marine-protected-areas/mpa-classification-protection-standard.pdf\" target=\"_blank\">");_.b("\n" + i);_.b("          Marine Protected Areas Classification and Protection Standard</a>");_.b("\n" + i);_.b("        </p>");_.b("\n");};if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,3354,3544,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div>");_.b("\n" + i);_.b("        <div class=\"replicated_habs_pie\" id=\"replicated_habs_pie\"></div>");_.b("\n" + i);_.b("        <div class=\"replicated_habs_pie_legend\" id=\"replicated_habs_pie_legend\"></div>");_.b("\n" + i);_.b("      </div>");_.b("\n");});c.pop();}_.b("    </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,3625,5031,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection size\">");_.b("\n" + i);_.b("    <h4>");if(_.s(_.f("isMPA",c,p,1),c,p,0,3679,3688,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("MPA Sizes");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,3712,3724,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Sketch Sizes");});c.pop();}_.b("</h4>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,3758,4085,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        Of the <strong>");_.b(_.v(_.f("total_mpa_count",c,p,0)));_.b("</strong> MPAs in the network, <strong>");_.b(_.v(_.f("mpa_count",c,p,0)));_.b("</strong> meet");if(!_.s(_.f("plural_mpa_count",c,p,1),c,p,1,0,0,"")){_.b("s");};_.b(" the minimum size dimension of 5km. The average minimum dimension is <strong>");_.b(_.v(_.f("mpa_avg_size_guideline",c,p,0)));_.b("</strong> the 10-20km guideline.");_.b("\n" + i);_.b("      </p>");_.b("\n");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,4114,4181,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p>The size of the sketches in this collection are:</p>");_.b("\n");});c.pop();}_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>");if(_.s(_.f("isMPA",c,p,1),c,p,0,4284,4292,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("MPA Name");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,4316,4327,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Sketch Name");});c.pop();}_.b("</th>");_.b("\n" + i);_.b("            <th>Area </br>(sq. km.)</th>");_.b("\n" + i);_.b("            <th style=\"width:100px;\">Width (km)</th>");_.b("\n" + i);_.b("            <th style=\"width:100px;\">Coastline Length (km)</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("prop_sizes",c,p,1),c,p,0,4579,4745,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("MIN_DIM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("COAST",c,p,0)));_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("    <p class=\"large\">");_.b("\n" + i);_.b("      This combined area within the network accounts for <strong>");_.b(_.v(_.f("percent",c,p,0)));_.b("%</strong> of the South-East Marine area, and <strong>");_.b(_.v(_.f("coastline_length_percent",c,p,0)));_.b("%</strong> of the South-East coastline.");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){if(_.s(_.f("isMPA",c,p,1),c,p,0,5079,5954,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>MPA Size</h4>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>MPA Name</th>");_.b("\n" + i);_.b("              <th>Area </br>(sq. km.)</th>");_.b("\n" + i);_.b("              <th style=\"width:100px;\">Width (km)</th>");_.b("\n" + i);_.b("              <th style=\"width:100px;\">Coastline Length (km)</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("prop_sizes",c,p,1),c,p,0,5487,5667,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("MIN_DIM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("COAST",c,p,0)));_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This area within the MPA accounts for <strong>");_.b(_.v(_.f("percent",c,p,0)));_.b("%</strong> of the South-East Marine area, and <strong>");_.b(_.v(_.f("coastline_length_percent",c,p,0)));_.b("%</strong> of the South-East coastline.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}};_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,5994,7357,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,6014,7339,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div class=\"reportSection\">");_.b("\n" + i);_.b("        <h4>Connectivity</h4>");_.b("\n" + i);if(_.s(_.f("singleSketch",c,p,1),c,p,0,6104,6281,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <p style=\"font-style:italic;color:gray;\" class=\"large\">");_.b("\n" + i);_.b("                No connectivity information for a collection with one sketch. ");_.b("\n" + i);_.b("              </p>");_.b("\n");});c.pop();}if(!_.s(_.f("singleSketch",c,p,1),c,p,1,0,0,"")){_.b("          <div>");_.b("\n" + i);_.b("            <div class=\"connectivity_pie\" id=\"connectivity_pie\"></div>");_.b("\n" + i);_.b("            <div class=\"connectivity_pie_legend\" id=\"connectivity_pie_legend\"></div>");_.b("\n" + i);_.b("          </div>");_.b("\n" + i);_.b("          <p class=\"large\">Of the <strong>");_.b(_.v(_.f("total_mpa_count",c,p,0)));_.b("</strong> MPAs in the network, <strong>");_.b(_.v(_.f("connected_mpa_count",c,p,0)));_.b("</strong>");if(_.s(_.f("plural_connected_mpa_count",c,p,1),c,p,0,6677,6681,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(" are");});c.pop();}if(!_.s(_.f("plural_connected_mpa_count",c,p,1),c,p,1,0,0,"")){_.b(" is");};_.b(" within the connectivity range of 50 - 100 km. ");_.b("\n" + i);_.b("          </p>");_.b("\n" + i);_.b("          <span class=\"conn_values\">The minimum distance between the MPAs is <strong>");_.b(_.v(_.f("min_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("          <span class=\"conn_values\">The maximum distance between the MPAs is <strong>");_.b(_.v(_.f("max_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("          <span class=\"conn_values\">The average distance between the MPAs is <strong>");_.b(_.v(_.f("mean_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("          <p><i>It is recommended that MPAs should be within 100km of each other.</i></p>");_.b("\n");};_.b("\n" + i);_.b("      </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){if(_.s(_.f("isGeneric",c,p,1),c,p,0,7403,7788,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Size</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This sketch area is <strong>");_.b(_.v(_.f("size",c,p,0)));_.b(" square kilometers</strong>, and it includes <strong>");_.b(_.v(_.f("percent",c,p,0)));_.b("%</strong> of the South-East Planning Region.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This sketch includes <strong>");_.b(_.v(_.f("coastline_length",c,p,0)));_.b(" meters</strong> of coastline.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}};_.b("\n" + i);_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection size\">");_.b("\n" + i);_.b("  <h4>Number of Habitats</h4>");_.b("\n" + i);_.b("  <p class=\"large\">");_.b("\n" + i);_.b("    The ");if(_.s(_.f("isMPA",c,p,1),c,p,0,7925,7982,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(" Marine Protected Area");if(_.s(_.f("isCollection",c,p,1),c,p,0,7964,7965,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,8006,8048,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketch");if(_.s(_.f("isCollection",c,p,1),c,p,0,8029,8031,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("es");});c.pop();}});c.pop();}_.b(" include");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("s");};_.b(" <strong>");_.b(_.v(_.f("num_habs",c,p,0)));_.b("</strong> of the <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> classified habitats.");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["uses"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("hasCoastal",c,p,1),c,p,0,310,1045,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Existing Coastal Consents <a href=\"#\" data-toggle-node=\"53d719a49380174a7766dd85\" data-visible=\"false\">");_.b("\n" + i);_.b("      show layer</a></h4>");_.b("\n" + i);_.b("        <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,524,554,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites with Resource Consents.</p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:250px;\">Consent Type</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("coastal_consents",c,p,1),c,p,0,893,978,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("hasUses",c,p,1),c,p,0,1074,4145,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hasRecUses",c,p,1),c,p,0,1092,2356,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Recreational Uses </h4>");_.b("\n" + i);_.b("      <!--");_.b("\n" + i);if(_.s(_.f("hasSmaro",c,p,1),c,p,0,1200,1688,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("        <p><strong>Spectrum of MArine Recreational Opportunity (SMARO)</strong></p>");_.b("\n" + i);_.b("          <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,1339,1349,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" includes area(s) identified as having <strong> medium or high </strong> recreational opportunity.");_.b("\n" + i);_.b("          <em>You can find more information on SMARO in the \"data description\" by right clicking on the layer name.</em>");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("        </br></br>");_.b("\n");};});c.pop();}_.b("      -->");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:250px;\">Activity Type</th>");_.b("\n" + i);_.b("              <th>Number of Sites</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasRecUses",c,p,1),c,p,0,1959,2141,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("rec_uses",c,p,1),c,p,0,1987,2115,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("COUNT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasRecUses",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td colspan=2><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("hasHeritage",c,p,1),c,p,0,2391,3346,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Archeological Information ");_.b("\n" + i);_.b("          <a href=\"#\" data-toggle-node=\"5578f14cff39059a583646c9\" data-visible=\"false\">show layer</a>");_.b("\n" + i);_.b("        </h4>");_.b("\n" + i);_.b("            <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,2650,2680,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites identified as having significant heritage values.</p>");_.b("\n" + i);_.b("            <table data-paging=\"10\">");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th style=\"width:250px;\">Heritage Type</th>");_.b("\n" + i);_.b("                  <th>Number of Sites</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("              <tbody>");_.b("\n" + i);if(_.s(_.f("heritage",c,p,1),c,p,0,3113,3251,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <tr>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("COUNT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                </tr>");_.b("\n");});c.pop();}_.b("              </tbody>");_.b("\n" + i);_.b("            </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");};});c.pop();}if(_.s(_.f("hasInfrastructure",c,p,1),c,p,0,3387,4122,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Infrastructure</h4>");_.b("\n" + i);_.b("            <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,3523,3553,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites with existing infrastructure.</p>");_.b("\n" + i);_.b("            <table data-paging=\"10\">");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th style=\"width:250px;\">Type</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("              <tbody>");_.b("\n" + i);if(_.s(_.f("infrastructure",c,p,1),c,p,0,3920,4021,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <tr>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                </tr>");_.b("\n");});c.pop();}_.b("              </tbody>");_.b("\n" + i);_.b("            </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");};});c.pop();}});c.pop();}if(!_.s(_.f("hasUses",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Activities and Uses</h4>");_.b("\n" + i);_.b("        <p>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,4281,4291,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("  does <strong>not</strong> include any <strong>activities or uses</strong>.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};_.b("\n" + i);if(_.s(_.f("hasSeabirds",c,p,1),c,p,0,4468,5194,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Birds </h4>");_.b("\n" + i);if(_.s(_.f("hasSeabirdAreas",c,p,1),c,p,0,4556,4840,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <p class=\"large\"><strong>Important Seabird Areas</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("seabirds",c,p,1),c,p,0,4703,4783,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n");});c.pop();}_.b("    ");_.b("\n" + i);if(_.s(_.f("hasSeabirdColonies",c,p,1),c,p,0,4893,5163,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p class=\"large\"><strong>Seabird Colonies</strong></p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("seabird_colonies",c,p,1),c,p,0,5033,5105,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n");});c.pop();}_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("hasMarineSpecies",c,p,1),c,p,0,5232,5694,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Marine Mammals</h4>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>Species</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("mammals",c,p,1),c,p,0,5480,5560,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}if(_.s(_.f("seals",c,p,1),c,p,0,5595,5640,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(!_.s(_.f("hasMarineSpecies",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Species Information</h4>");_.b("\n" + i);_.b("        <p>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,5848,5882,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketches within the collection do ");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch does");};_.b(" <strong>not</strong> include any <strong>important marine mammal areas</strong>.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};return _.fl();;});

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = this["Templates"];
}
},{}]},{},[15])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9vdGFnby1yZXBvcnRzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvZW5hYmxlTGF5ZXJUb2dnbGVycy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvam9iSXRlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0UmVzdWx0cy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0VGFiLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvc2NyaXB0cy91dGlscy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9lbnZpcm9ubWVudC5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9maXNoaW5nLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9zY3JpcHRzL2lkcy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9vdmVydmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9yZXBvcnQuY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9vdGFnby1yZXBvcnRzL3NjcmlwdHMvdXNlcy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBLENBQU8sQ0FBVSxDQUFBLEdBQVgsQ0FBTixFQUFrQjtDQUNoQixLQUFBLDJFQUFBO0NBQUEsQ0FBQSxDQUFBO0NBQUEsQ0FDQSxDQUFBLEdBQVk7Q0FEWixDQUVBLENBQUEsR0FBTTtBQUNDLENBQVAsQ0FBQSxDQUFBLENBQUE7Q0FDRSxFQUFBLENBQUEsR0FBTyxxQkFBUDtDQUNBLFNBQUE7SUFMRjtDQUFBLENBTUEsQ0FBVyxDQUFBLElBQVgsYUFBVztDQUVYO0NBQUEsTUFBQSxvQ0FBQTt3QkFBQTtDQUNFLEVBQVcsQ0FBWCxHQUFXLENBQVg7Q0FBQSxFQUNTLENBQVQsRUFBQSxFQUFpQixLQUFSO0NBQ1Q7Q0FDRSxFQUFPLENBQVAsRUFBQSxVQUFPO0NBQVAsRUFD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S0FBQTtDQVZBLENBV2tCLElBQWxCLFVBQUE7Q0FYQSxDQVlZLElBQVosSUFBQTtDQVpBLENBYWdCLElBQWhCLFFBQUE7Q0FiQSxDQWNtQixJQUFuQixXQUFBO0NBZEEsQ0FlUyxJQUFULENBQUE7Q0FmQSxDQWdCYyxJQUFkLE1BQUE7Q0FoQkEsQ0FtQlUsSUFBVixFQUFBO0NBbkJBLENBb0JrQixJQUFsQixVQUFBO0NBcEJBLENBcUJhLElBQWIsS0FBQTtDQXJCQSxDQXNCaUIsSUFBakIsU0FBQTtDQXRCQSxDQXVCb0IsSUFBcEIsWUFBQTtDQXZCQSxDQXlCUyxJQUFULENBQUE7Q0F6QkEsQ0EwQlksSUFBWixJQUFBO0NBMUJBLENBMkJXLElBQVgsR0FBQTtDQTNCQSxDQTRCTyxHQUFQLENBQUE7Q0E1QkEsQ0E2QlUsSUFBVixFQUFBO0NBN0JBLENBK0I2QixJQUE3QixxQkFBQTtDQS9CQSxDQWdDa0IsSUFBbEIsVUFBQTtDQXJGRixLQUFBO0NBQUEsQ0F1Rm9DLENBQWhDLENBQUosRUFBVSxDQUFBLENBQVM7Q0FDbEIsR0FBQSxPQUFELFFBQUE7Q0FyR0YsRUFVUTs7Q0FWUjs7Q0FGb0I7O0FBMkd0QixDQXpIQSxFQXlIaUIsR0FBWCxDQUFOOzs7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsbnVsbCwibW9kdWxlLmV4cG9ydHMgPSAoZWwpIC0+XG4gICRlbCA9ICQgZWxcbiAgYXBwID0gd2luZG93LmFwcFxuICB0b2MgPSBhcHAuZ2V0VG9jKClcbiAgdW5sZXNzIHRvY1xuICAgIGNvbnNvbGUubG9nICdObyB0YWJsZSBvZiBjb250ZW50cyBmb3VuZCdcbiAgICByZXR1cm5cbiAgdG9nZ2xlcnMgPSAkZWwuZmluZCgnYVtkYXRhLXRvZ2dsZS1ub2RlXScpXG4gICMgU2V0IGluaXRpYWwgc3RhdGVcbiAgZm9yIHRvZ2dsZXIgaW4gdG9nZ2xlcnMudG9BcnJheSgpXG4gICAgJHRvZ2dsZXIgPSAkKHRvZ2dsZXIpXG4gICAgbm9kZWlkID0gJHRvZ2dsZXIuZGF0YSgndG9nZ2xlLW5vZGUnKVxuICAgIHRyeVxuICAgICAgdmlldyA9IHRvYy5nZXRDaGlsZFZpZXdCeUlkIG5vZGVpZFxuICAgICAgbm9kZSA9IHZpZXcubW9kZWxcbiAgICAgICR0b2dnbGVyLmF0dHIgJ2RhdGEtdmlzaWJsZScsICEhbm9kZS5nZXQoJ3Zpc2libGUnKVxuICAgICAgJHRvZ2dsZXIuZGF0YSAndG9jSXRlbScsIHZpZXdcbiAgICBjYXRjaCBlXG4gICAgICAkdG9nZ2xlci5hdHRyICdkYXRhLW5vdC1mb3VuZCcsICd0cnVlJ1xuXG4gIHRvZ2dsZXJzLm9uICdjbGljaycsIChlKSAtPlxuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICRlbCA9ICQoZS50YXJnZXQpXG4gICAgdmlldyA9ICRlbC5kYXRhKCd0b2NJdGVtJylcbiAgICBpZiB2aWV3XG4gICAgICB2aWV3LnRvZ2dsZVZpc2liaWxpdHkoZSlcbiAgICAgICRlbC5hdHRyICdkYXRhLXZpc2libGUnLCAhIXZpZXcubW9kZWwuZ2V0KCd2aXNpYmxlJylcbiAgICBlbHNlXG4gICAgICBhbGVydCBcIkxheWVyIG5vdCBmb3VuZCBpbiB0aGUgY3VycmVudCBUYWJsZSBvZiBDb250ZW50cy4gXFxuRXhwZWN0ZWQgbm9kZWlkICN7JGVsLmRhdGEoJ3RvZ2dsZS1ub2RlJyl9XCJcbiIsImNsYXNzIEpvYkl0ZW0gZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG4gIGNsYXNzTmFtZTogJ3JlcG9ydFJlc3VsdCdcbiAgZXZlbnRzOiB7fVxuICBiaW5kaW5nczpcbiAgICBcImg2IGFcIjpcbiAgICAgIG9ic2VydmU6IFwic2VydmljZU5hbWVcIlxuICAgICAgdXBkYXRlVmlldzogdHJ1ZVxuICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgbmFtZTogJ2hyZWYnXG4gICAgICAgIG9ic2VydmU6ICdzZXJ2aWNlVXJsJ1xuICAgICAgfV1cbiAgICBcIi5zdGFydGVkQXRcIjpcbiAgICAgIG9ic2VydmU6IFtcInN0YXJ0ZWRBdFwiLCBcInN0YXR1c1wiXVxuICAgICAgdmlzaWJsZTogKCkgLT5cbiAgICAgICAgQG1vZGVsLmdldCgnc3RhdHVzJykgbm90IGluIFsnY29tcGxldGUnLCAnZXJyb3InXVxuICAgICAgdXBkYXRlVmlldzogdHJ1ZVxuICAgICAgb25HZXQ6ICgpIC0+XG4gICAgICAgIGlmIEBtb2RlbC5nZXQoJ3N0YXJ0ZWRBdCcpXG4gICAgICAgICAgcmV0dXJuIFwiU3RhcnRlZCBcIiArIG1vbWVudChAbW9kZWwuZ2V0KCdzdGFydGVkQXQnKSkuZnJvbU5vdygpICsgXCIuIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBcIlwiXG4gICAgXCIuc3RhdHVzXCI6ICAgICAgXG4gICAgICBvYnNlcnZlOiBcInN0YXR1c1wiXG4gICAgICBvbkdldDogKHMpIC0+XG4gICAgICAgIHN3aXRjaCBzXG4gICAgICAgICAgd2hlbiAncGVuZGluZydcbiAgICAgICAgICAgIFwid2FpdGluZyBpbiBsaW5lXCJcbiAgICAgICAgICB3aGVuICdydW5uaW5nJ1xuICAgICAgICAgICAgXCJydW5uaW5nIGFuYWx5dGljYWwgc2VydmljZVwiXG4gICAgICAgICAgd2hlbiAnY29tcGxldGUnXG4gICAgICAgICAgICBcImNvbXBsZXRlZFwiXG4gICAgICAgICAgd2hlbiAnZXJyb3InXG4gICAgICAgICAgICBcImFuIGVycm9yIG9jY3VycmVkXCJcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBzXG4gICAgXCIucXVldWVMZW5ndGhcIjogXG4gICAgICBvYnNlcnZlOiBcInF1ZXVlTGVuZ3RoXCJcbiAgICAgIG9uR2V0OiAodikgLT5cbiAgICAgICAgcyA9IFwiV2FpdGluZyBiZWhpbmQgI3t2fSBqb2JcIlxuICAgICAgICBpZiB2Lmxlbmd0aCA+IDFcbiAgICAgICAgICBzICs9ICdzJ1xuICAgICAgICByZXR1cm4gcyArIFwiLiBcIlxuICAgICAgdmlzaWJsZTogKHYpIC0+XG4gICAgICAgIHY/IGFuZCBwYXJzZUludCh2KSA+IDBcbiAgICBcIi5lcnJvcnNcIjpcbiAgICAgIG9ic2VydmU6ICdlcnJvcidcbiAgICAgIHVwZGF0ZVZpZXc6IHRydWVcbiAgICAgIHZpc2libGU6ICh2KSAtPlxuICAgICAgICB2Py5sZW5ndGggPiAyXG4gICAgICBvbkdldDogKHYpIC0+XG4gICAgICAgIGlmIHY/XG4gICAgICAgICAgSlNPTi5zdHJpbmdpZnkodiwgbnVsbCwgJyAgJylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG51bGxcblxuICBjb25zdHJ1Y3RvcjogKEBtb2RlbCkgLT5cbiAgICBzdXBlcigpXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgIEAkZWwuaHRtbCBcIlwiXCJcbiAgICAgIDxoNj48YSBocmVmPVwiI1wiIHRhcmdldD1cIl9ibGFua1wiPjwvYT48c3BhbiBjbGFzcz1cInN0YXR1c1wiPjwvc3Bhbj48L2g2PlxuICAgICAgPGRpdj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJzdGFydGVkQXRcIj48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwicXVldWVMZW5ndGhcIj48L3NwYW4+XG4gICAgICAgIDxwcmUgY2xhc3M9XCJlcnJvcnNcIj48L3ByZT5cbiAgICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICAgIEBzdGlja2l0KClcblxubW9kdWxlLmV4cG9ydHMgPSBKb2JJdGVtIiwiY2xhc3MgUmVwb3J0UmVzdWx0cyBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuICBkZWZhdWx0UG9sbGluZ0ludGVydmFsOiAzMDAwXG5cbiAgY29uc3RydWN0b3I6IChAc2tldGNoLCBAZGVwcykgLT5cbiAgICBAdXJsID0gdXJsID0gXCIvcmVwb3J0cy8je0Bza2V0Y2guaWR9LyN7QGRlcHMuam9pbignLCcpfVwiXG4gICAgc3VwZXIoKVxuXG4gIHBvbGw6ICgpID0+XG4gICAgQGZldGNoIHtcbiAgICAgIHN1Y2Nlc3M6ICgpID0+XG4gICAgICAgIEB0cmlnZ2VyICdqb2JzJ1xuICAgICAgICBmb3IgcmVzdWx0IGluIEBtb2RlbHNcbiAgICAgICAgICBpZiByZXN1bHQuZ2V0KCdzdGF0dXMnKSBub3QgaW4gWydjb21wbGV0ZScsICdlcnJvciddXG4gICAgICAgICAgICB1bmxlc3MgQGludGVydmFsXG4gICAgICAgICAgICAgIEBpbnRlcnZhbCA9IHNldEludGVydmFsIEBwb2xsLCBAZGVmYXVsdFBvbGxpbmdJbnRlcnZhbFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgY29uc29sZS5sb2cgQG1vZGVsc1swXS5nZXQoJ3BheWxvYWRTaXplQnl0ZXMnKVxuICAgICAgICAgIHBheWxvYWRTaXplID0gTWF0aC5yb3VuZCgoKEBtb2RlbHNbMF0uZ2V0KCdwYXlsb2FkU2l6ZUJ5dGVzJykgb3IgMCkgLyAxMDI0KSAqIDEwMCkgLyAxMDBcbiAgICAgICAgICBjb25zb2xlLmxvZyBcIkZlYXR1cmVTZXQgc2VudCB0byBHUCB3ZWlnaGVkIGluIGF0ICN7cGF5bG9hZFNpemV9a2JcIlxuICAgICAgICAjIGFsbCBjb21wbGV0ZSB0aGVuXG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBpbnRlcnZhbCkgaWYgQGludGVydmFsXG4gICAgICAgIGlmIHByb2JsZW0gPSBfLmZpbmQoQG1vZGVscywgKHIpIC0+IHIuZ2V0KCdlcnJvcicpPylcbiAgICAgICAgICBAdHJpZ2dlciAnZXJyb3InLCBcIlByb2JsZW0gd2l0aCAje3Byb2JsZW0uZ2V0KCdzZXJ2aWNlTmFtZScpfSBqb2JcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHRyaWdnZXIgJ2ZpbmlzaGVkJ1xuICAgICAgZXJyb3I6IChlLCByZXMsIGEsIGIpID0+XG4gICAgICAgIHVubGVzcyByZXMuc3RhdHVzIGlzIDBcbiAgICAgICAgICBpZiByZXMucmVzcG9uc2VUZXh0Py5sZW5ndGhcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICBqc29uID0gSlNPTi5wYXJzZShyZXMucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICAgIyBkbyBub3RoaW5nXG4gICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGludGVydmFsKSBpZiBAaW50ZXJ2YWxcbiAgICAgICAgICBAdHJpZ2dlciAnZXJyb3InLCBqc29uPy5lcnJvcj8ubWVzc2FnZSBvclxuICAgICAgICAgICAgJ1Byb2JsZW0gY29udGFjdGluZyB0aGUgU2VhU2tldGNoIHNlcnZlcidcbiAgICB9XG5cbm1vZHVsZS5leHBvcnRzID0gUmVwb3J0UmVzdWx0c1xuIiwiZW5hYmxlTGF5ZXJUb2dnbGVycyA9IHJlcXVpcmUgJy4vZW5hYmxlTGF5ZXJUb2dnbGVycy5jb2ZmZWUnXG5yb3VuZCA9IHJlcXVpcmUoJy4vdXRpbHMuY29mZmVlJykucm91bmRcblJlcG9ydFJlc3VsdHMgPSByZXF1aXJlICcuL3JlcG9ydFJlc3VsdHMuY29mZmVlJ1xudCA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnKVxudGVtcGxhdGVzID1cbiAgcmVwb3J0TG9hZGluZzogdFsnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3JlcG9ydExvYWRpbmcnXVxuSm9iSXRlbSA9IHJlcXVpcmUgJy4vam9iSXRlbS5jb2ZmZWUnXG5Db2xsZWN0aW9uVmlldyA9IHJlcXVpcmUoJ3ZpZXdzL2NvbGxlY3Rpb25WaWV3JylcblxuY2xhc3MgUmVjb3JkU2V0XG5cbiAgY29uc3RydWN0b3I6IChAZGF0YSwgQHRhYiwgQHNrZXRjaENsYXNzSWQpIC0+XG5cbiAgdG9BcnJheTogKCkgLT5cbiAgICBpZiBAc2tldGNoQ2xhc3NJZFxuICAgICAgZGF0YSA9IF8uZmluZCBAZGF0YS52YWx1ZSwgKHYpID0+XG4gICAgICAgIHYuZmVhdHVyZXM/WzBdPy5hdHRyaWJ1dGVzP1snU0NfSUQnXSBpcyBAc2tldGNoQ2xhc3NJZFxuICAgICAgdW5sZXNzIGRhdGFcbiAgICAgICAgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBkYXRhIGZvciBza2V0Y2hDbGFzcyAje0Bza2V0Y2hDbGFzc0lkfVwiXG4gICAgZWxzZVxuICAgICAgaWYgXy5pc0FycmF5IEBkYXRhLnZhbHVlXG4gICAgICAgIGRhdGEgPSBAZGF0YS52YWx1ZVswXVxuICAgICAgZWxzZVxuICAgICAgICBkYXRhID0gQGRhdGEudmFsdWVcbiAgICBfLm1hcCBkYXRhLmZlYXR1cmVzLCAoZmVhdHVyZSkgLT5cbiAgICAgIGZlYXR1cmUuYXR0cmlidXRlc1xuXG4gIHJhdzogKGF0dHIpIC0+XG4gICAgYXR0cnMgPSBfLm1hcCBAdG9BcnJheSgpLCAocm93KSAtPlxuICAgICAgcm93W2F0dHJdXG4gICAgYXR0cnMgPSBfLmZpbHRlciBhdHRycywgKGF0dHIpIC0+IGF0dHIgIT0gdW5kZWZpbmVkXG4gICAgaWYgYXR0cnMubGVuZ3RoIGlzIDBcbiAgICAgIGNvbnNvbGUubG9nIEBkYXRhXG4gICAgICBAdGFiLnJlcG9ydEVycm9yIFwiQ291bGQgbm90IGdldCBhdHRyaWJ1dGUgI3thdHRyfSBmcm9tIHJlc3VsdHNcIlxuICAgICAgdGhyb3cgXCJDb3VsZCBub3QgZ2V0IGF0dHJpYnV0ZSAje2F0dHJ9XCJcbiAgICBlbHNlIGlmIGF0dHJzLmxlbmd0aCBpcyAxXG4gICAgICByZXR1cm4gYXR0cnNbMF1cbiAgICBlbHNlXG4gICAgICByZXR1cm4gYXR0cnNcblxuICBpbnQ6IChhdHRyKSAtPlxuICAgIHJhdyA9IEByYXcoYXR0cilcbiAgICBpZiBfLmlzQXJyYXkocmF3KVxuICAgICAgXy5tYXAgcmF3LCBwYXJzZUludFxuICAgIGVsc2VcbiAgICAgIHBhcnNlSW50KHJhdylcblxuICBmbG9hdDogKGF0dHIsIGRlY2ltYWxQbGFjZXM9MikgLT5cbiAgICByYXcgPSBAcmF3KGF0dHIpXG4gICAgaWYgXy5pc0FycmF5KHJhdylcbiAgICAgIF8ubWFwIHJhdywgKHZhbCkgLT4gcm91bmQodmFsLCBkZWNpbWFsUGxhY2VzKVxuICAgIGVsc2VcbiAgICAgIHJvdW5kKHJhdywgZGVjaW1hbFBsYWNlcylcblxuICBib29sOiAoYXR0cikgLT5cbiAgICByYXcgPSBAcmF3KGF0dHIpXG4gICAgaWYgXy5pc0FycmF5KHJhdylcbiAgICAgIF8ubWFwIHJhdywgKHZhbCkgLT4gdmFsLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSBpcyAndHJ1ZSdcbiAgICBlbHNlXG4gICAgICByYXcudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpIGlzICd0cnVlJ1xuXG5jbGFzcyBSZXBvcnRUYWIgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG4gIG5hbWU6ICdJbmZvcm1hdGlvbidcbiAgZGVwZW5kZW5jaWVzOiBbXVxuXG4gIGluaXRpYWxpemU6IChAbW9kZWwsIEBvcHRpb25zKSAtPlxuICAgICMgV2lsbCBiZSBpbml0aWFsaXplZCBieSBTZWFTa2V0Y2ggd2l0aCB0aGUgZm9sbG93aW5nIGFyZ3VtZW50czpcbiAgICAjICAgKiBtb2RlbCAtIFRoZSBza2V0Y2ggYmVpbmcgcmVwb3J0ZWQgb25cbiAgICAjICAgKiBvcHRpb25zXG4gICAgIyAgICAgLSAucGFyZW50IC0gdGhlIHBhcmVudCByZXBvcnQgdmlld1xuICAgICMgICAgICAgIGNhbGwgQG9wdGlvbnMucGFyZW50LmRlc3Ryb3koKSB0byBjbG9zZSB0aGUgd2hvbGUgcmVwb3J0IHdpbmRvd1xuICAgIEBhcHAgPSB3aW5kb3cuYXBwXG4gICAgXy5leHRlbmQgQCwgQG9wdGlvbnNcbiAgICBAcmVwb3J0UmVzdWx0cyA9IG5ldyBSZXBvcnRSZXN1bHRzKEBtb2RlbCwgQGRlcGVuZGVuY2llcylcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAnZXJyb3InLCBAcmVwb3J0RXJyb3JcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAnam9icycsIEByZW5kZXJKb2JEZXRhaWxzXG4gICAgQGxpc3RlblRvT25jZSBAcmVwb3J0UmVzdWx0cywgJ2pvYnMnLCBAcmVwb3J0Sm9ic1xuICAgIEBsaXN0ZW5UbyBAcmVwb3J0UmVzdWx0cywgJ2ZpbmlzaGVkJywgXy5iaW5kIEByZW5kZXIsIEBcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAncmVxdWVzdCcsIEByZXBvcnRSZXF1ZXN0ZWRcblxuICByZW5kZXI6ICgpIC0+XG4gICAgdGhyb3cgJ3JlbmRlciBtZXRob2QgbXVzdCBiZSBvdmVyaWRkZW4nXG5cbiAgc2hvdzogKCkgLT5cbiAgICBAJGVsLnNob3coKVxuICAgIEB2aXNpYmxlID0gdHJ1ZVxuICAgIGlmIEBkZXBlbmRlbmNpZXM/Lmxlbmd0aCBhbmQgIUByZXBvcnRSZXN1bHRzLm1vZGVscy5sZW5ndGhcbiAgICAgIEByZXBvcnRSZXN1bHRzLnBvbGwoKVxuICAgIGVsc2UgaWYgIUBkZXBlbmRlbmNpZXM/Lmxlbmd0aFxuICAgICAgQHJlbmRlcigpXG4gICAgICBAJCgnW2RhdGEtYXR0cmlidXRlLXR5cGU9VXJsRmllbGRdIC52YWx1ZSwgW2RhdGEtYXR0cmlidXRlLXR5cGU9VXBsb2FkRmllbGRdIC52YWx1ZScpLmVhY2ggKCkgLT5cbiAgICAgICAgdGV4dCA9ICQoQCkudGV4dCgpXG4gICAgICAgIGh0bWwgPSBbXVxuICAgICAgICBmb3IgdXJsIGluIHRleHQuc3BsaXQoJywnKVxuICAgICAgICAgIGlmIHVybC5sZW5ndGhcbiAgICAgICAgICAgIG5hbWUgPSBfLmxhc3QodXJsLnNwbGl0KCcvJykpXG4gICAgICAgICAgICBodG1sLnB1c2ggXCJcIlwiPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPiN7bmFtZX08L2E+XCJcIlwiXG4gICAgICAgICQoQCkuaHRtbCBodG1sLmpvaW4oJywgJylcblxuXG4gIGhpZGU6ICgpIC0+XG4gICAgQCRlbC5oaWRlKClcbiAgICBAdmlzaWJsZSA9IGZhbHNlXG5cbiAgcmVtb3ZlOiAoKSA9PlxuICAgIHdpbmRvdy5jbGVhckludGVydmFsIEBldGFJbnRlcnZhbFxuICAgIEBzdG9wTGlzdGVuaW5nKClcbiAgICBzdXBlcigpXG5cbiAgcmVwb3J0UmVxdWVzdGVkOiAoKSA9PlxuICAgIEAkZWwuaHRtbCB0ZW1wbGF0ZXMucmVwb3J0TG9hZGluZy5yZW5kZXIoe30pXG5cbiAgcmVwb3J0RXJyb3I6IChtc2csIGNhbmNlbGxlZFJlcXVlc3QpID0+XG4gICAgdW5sZXNzIGNhbmNlbGxlZFJlcXVlc3RcbiAgICAgIGlmIG1zZyBpcyAnSk9CX0VSUk9SJ1xuICAgICAgICBAc2hvd0Vycm9yICdFcnJvciB3aXRoIHNwZWNpZmljIGpvYidcbiAgICAgIGVsc2VcbiAgICAgICAgQHNob3dFcnJvciBtc2dcblxuICBzaG93RXJyb3I6IChtc2cpID0+XG4gICAgQCQoJy5wcm9ncmVzcycpLnJlbW92ZSgpXG4gICAgQCQoJ3AuZXJyb3InKS5yZW1vdmUoKVxuICAgIEAkKCdoNCcpLnRleHQoXCJBbiBFcnJvciBPY2N1cnJlZFwiKS5hZnRlciBcIlwiXCJcbiAgICAgIDxwIGNsYXNzPVwiZXJyb3JcIiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO1wiPiN7bXNnfTwvcD5cbiAgICBcIlwiXCJcblxuICByZXBvcnRKb2JzOiAoKSA9PlxuICAgIHVubGVzcyBAbWF4RXRhXG4gICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS53aWR0aCgnMTAwJScpXG4gICAgQCQoJ2g0JykudGV4dCBcIkFuYWx5emluZyBEZXNpZ25zXCJcblxuICBzdGFydEV0YUNvdW50ZG93bjogKCkgPT5cbiAgICBpZiBAbWF4RXRhXG4gICAgICBfLmRlbGF5ICgpID0+XG4gICAgICAgIEByZXBvcnRSZXN1bHRzLnBvbGwoKVxuICAgICAgLCAoQG1heEV0YSArIDEpICogMTAwMFxuICAgICAgXy5kZWxheSAoKSA9PlxuICAgICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS5jc3MgJ3RyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uJywgJ2xpbmVhcidcbiAgICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykuY3NzICd0cmFuc2l0aW9uLWR1cmF0aW9uJywgXCIje0BtYXhFdGEgKyAxfXNcIlxuICAgICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS53aWR0aCgnMTAwJScpXG4gICAgICAsIDUwMFxuXG4gIHJlbmRlckpvYkRldGFpbHM6ICgpID0+XG4gICAgbWF4RXRhID0gbnVsbFxuICAgIGZvciBqb2IgaW4gQHJlcG9ydFJlc3VsdHMubW9kZWxzXG4gICAgICBpZiBqb2IuZ2V0KCdldGFTZWNvbmRzJylcbiAgICAgICAgaWYgIW1heEV0YSBvciBqb2IuZ2V0KCdldGFTZWNvbmRzJykgPiBtYXhFdGFcbiAgICAgICAgICBtYXhFdGEgPSBqb2IuZ2V0KCdldGFTZWNvbmRzJylcbiAgICBpZiBtYXhFdGFcbiAgICAgIEBtYXhFdGEgPSBtYXhFdGFcbiAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLndpZHRoKCc1JScpXG4gICAgICBAc3RhcnRFdGFDb3VudGRvd24oKVxuXG4gICAgQCQoJ1tyZWw9ZGV0YWlsc10nKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKVxuICAgIEAkKCdbcmVsPWRldGFpbHNdJykuY2xpY2sgKGUpID0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIEAkKCdbcmVsPWRldGFpbHNdJykuaGlkZSgpXG4gICAgICBAJCgnLmRldGFpbHMnKS5zaG93KClcbiAgICBmb3Igam9iIGluIEByZXBvcnRSZXN1bHRzLm1vZGVsc1xuICAgICAgaXRlbSA9IG5ldyBKb2JJdGVtKGpvYilcbiAgICAgIGl0ZW0ucmVuZGVyKClcbiAgICAgIEAkKCcuZGV0YWlscycpLmFwcGVuZCBpdGVtLmVsXG5cbiAgZ2V0UmVzdWx0OiAoaWQpIC0+XG4gICAgcmVzdWx0cyA9IEBnZXRSZXN1bHRzKClcbiAgICByZXN1bHQgPSBfLmZpbmQgcmVzdWx0cywgKHIpIC0+IHIucGFyYW1OYW1lIGlzIGlkXG4gICAgdW5sZXNzIHJlc3VsdD9cbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gcmVzdWx0IHdpdGggaWQgJyArIGlkKVxuICAgIHJlc3VsdC52YWx1ZVxuXG4gIGdldEZpcnN0UmVzdWx0OiAocGFyYW0sIGlkKSAtPlxuICAgIHJlc3VsdCA9IEBnZXRSZXN1bHQocGFyYW0pXG4gICAgdHJ5XG4gICAgICByZXR1cm4gcmVzdWx0WzBdLmZlYXR1cmVzWzBdLmF0dHJpYnV0ZXNbaWRdXG4gICAgY2F0Y2ggZVxuICAgICAgdGhyb3cgXCJFcnJvciBmaW5kaW5nICN7cGFyYW19OiN7aWR9IGluIGdwIHJlc3VsdHNcIlxuXG4gIGdldFJlc3VsdHM6ICgpIC0+XG4gICAgcmVzdWx0cyA9IEByZXBvcnRSZXN1bHRzLm1hcCgocmVzdWx0KSAtPiByZXN1bHQuZ2V0KCdyZXN1bHQnKS5yZXN1bHRzKVxuICAgIHVubGVzcyByZXN1bHRzPy5sZW5ndGhcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZ3AgcmVzdWx0cycpXG4gICAgXy5maWx0ZXIgcmVzdWx0cywgKHJlc3VsdCkgLT5cbiAgICAgIHJlc3VsdC5wYXJhbU5hbWUgbm90IGluIFsnUmVzdWx0Q29kZScsICdSZXN1bHRNc2cnXVxuXG4gIHJlY29yZFNldDogKGRlcGVuZGVuY3ksIHBhcmFtTmFtZSwgc2tldGNoQ2xhc3NJZD1mYWxzZSkgLT5cbiAgICB1bmxlc3MgZGVwZW5kZW5jeSBpbiBAZGVwZW5kZW5jaWVzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJVbmtub3duIGRlcGVuZGVuY3kgI3tkZXBlbmRlbmN5fVwiXG4gICAgZGVwID0gQHJlcG9ydFJlc3VsdHMuZmluZCAocikgLT4gci5nZXQoJ3NlcnZpY2VOYW1lJykgaXMgZGVwZW5kZW5jeVxuICAgIHVubGVzcyBkZXBcbiAgICAgIGNvbnNvbGUubG9nIEByZXBvcnRSZXN1bHRzLm1vZGVsc1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ291bGQgbm90IGZpbmQgcmVzdWx0cyBmb3IgI3tkZXBlbmRlbmN5fS5cIlxuICAgIHBhcmFtID0gXy5maW5kIGRlcC5nZXQoJ3Jlc3VsdCcpLnJlc3VsdHMsIChwYXJhbSkgLT5cbiAgICAgIHBhcmFtLnBhcmFtTmFtZSBpcyBwYXJhbU5hbWVcbiAgICB1bmxlc3MgcGFyYW1cbiAgICAgIGNvbnNvbGUubG9nIGRlcC5nZXQoJ2RhdGEnKS5yZXN1bHRzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDb3VsZCBub3QgZmluZCBwYXJhbSAje3BhcmFtTmFtZX0gaW4gI3tkZXBlbmRlbmN5fVwiXG4gICAgbmV3IFJlY29yZFNldChwYXJhbSwgQCwgc2tldGNoQ2xhc3NJZClcblxuICBlbmFibGVUYWJsZVBhZ2luZzogKCkgLT5cbiAgICBAJCgnW2RhdGEtcGFnaW5nXScpLmVhY2ggKCkgLT5cbiAgICAgICR0YWJsZSA9ICQoQClcbiAgICAgIHBhZ2VTaXplID0gJHRhYmxlLmRhdGEoJ3BhZ2luZycpXG4gICAgICByb3dzID0gJHRhYmxlLmZpbmQoJ3Rib2R5IHRyJykubGVuZ3RoXG4gICAgICBwYWdlcyA9IE1hdGguY2VpbChyb3dzIC8gcGFnZVNpemUpXG4gICAgICBpZiBwYWdlcyA+IDFcbiAgICAgICAgJHRhYmxlLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgICA8dGZvb3Q+XG4gICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgIDx0ZCBjb2xzcGFuPVwiI3skdGFibGUuZmluZCgndGhlYWQgdGgnKS5sZW5ndGh9XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBhZ2luYXRpb25cIj5cbiAgICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjXCI+UHJldjwvYT48L2xpPlxuICAgICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgPC90Zm9vdD5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIHVsID0gJHRhYmxlLmZpbmQoJ3Rmb290IHVsJylcbiAgICAgICAgZm9yIGkgaW4gXy5yYW5nZSgxLCBwYWdlcyArIDEpXG4gICAgICAgICAgdWwuYXBwZW5kIFwiXCJcIlxuICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjXCI+I3tpfTwvYT48L2xpPlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICB1bC5hcHBlbmQgXCJcIlwiXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XCIjXCI+TmV4dDwvYT48L2xpPlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgJHRhYmxlLmZpbmQoJ2xpIGEnKS5jbGljayAoZSkgLT5cbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAkYSA9ICQodGhpcylcbiAgICAgICAgICB0ZXh0ID0gJGEudGV4dCgpXG4gICAgICAgICAgaWYgdGV4dCBpcyAnTmV4dCdcbiAgICAgICAgICAgIGEgPSAkYS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuYWN0aXZlJykubmV4dCgpLmZpbmQoJ2EnKVxuICAgICAgICAgICAgdW5sZXNzIGEudGV4dCgpIGlzICdOZXh0J1xuICAgICAgICAgICAgICBhLmNsaWNrKClcbiAgICAgICAgICBlbHNlIGlmIHRleHQgaXMgJ1ByZXYnXG4gICAgICAgICAgICBhID0gJGEucGFyZW50KCkucGFyZW50KCkuZmluZCgnLmFjdGl2ZScpLnByZXYoKS5maW5kKCdhJylcbiAgICAgICAgICAgIHVubGVzcyBhLnRleHQoKSBpcyAnUHJldidcbiAgICAgICAgICAgICAgYS5jbGljaygpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgJGEucGFyZW50KCkucGFyZW50KCkuZmluZCgnLmFjdGl2ZScpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkYS5wYXJlbnQoKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgbiA9IHBhcnNlSW50KHRleHQpXG4gICAgICAgICAgICAkdGFibGUuZmluZCgndGJvZHkgdHInKS5oaWRlKClcbiAgICAgICAgICAgIG9mZnNldCA9IHBhZ2VTaXplICogKG4gLSAxKVxuICAgICAgICAgICAgJHRhYmxlLmZpbmQoXCJ0Ym9keSB0clwiKS5zbGljZShvZmZzZXQsIG4qcGFnZVNpemUpLnNob3coKVxuICAgICAgICAkKCR0YWJsZS5maW5kKCdsaSBhJylbMV0pLmNsaWNrKClcblxuICAgICAgaWYgbm9Sb3dzTWVzc2FnZSA9ICR0YWJsZS5kYXRhKCduby1yb3dzJylcbiAgICAgICAgaWYgcm93cyBpcyAwXG4gICAgICAgICAgcGFyZW50ID0gJHRhYmxlLnBhcmVudCgpXG4gICAgICAgICAgJHRhYmxlLnJlbW92ZSgpXG4gICAgICAgICAgcGFyZW50LnJlbW92ZUNsYXNzICd0YWJsZUNvbnRhaW5lcidcbiAgICAgICAgICBwYXJlbnQuYXBwZW5kIFwiPHA+I3tub1Jvd3NNZXNzYWdlfTwvcD5cIlxuXG4gIGVuYWJsZUxheWVyVG9nZ2xlcnM6ICgpIC0+XG4gICAgZW5hYmxlTGF5ZXJUb2dnbGVycyhAJGVsKVxuXG4gIGdldENoaWxkcmVuOiAoc2tldGNoQ2xhc3NJZCkgLT5cbiAgICBfLmZpbHRlciBAY2hpbGRyZW4sIChjaGlsZCkgLT4gY2hpbGQuZ2V0U2tldGNoQ2xhc3MoKS5pZCBpcyBza2V0Y2hDbGFzc0lkXG5cblxubW9kdWxlLmV4cG9ydHMgPSBSZXBvcnRUYWJcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgXG4gIHJvdW5kOiAobnVtYmVyLCBkZWNpbWFsUGxhY2VzKSAtPlxuICAgIHVubGVzcyBfLmlzTnVtYmVyIG51bWJlclxuICAgICAgbnVtYmVyID0gcGFyc2VGbG9hdChudW1iZXIpXG4gICAgbXVsdGlwbGllciA9IE1hdGgucG93IDEwLCBkZWNpbWFsUGxhY2VzXG4gICAgTWF0aC5yb3VuZChudW1iZXIgKiBtdWx0aXBsaWVyKSAvIG11bHRpcGxpZXIiLCJ0aGlzW1wiVGVtcGxhdGVzXCJdID0gdGhpc1tcIlRlbXBsYXRlc1wiXSB8fCB7fTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvYXR0cmlidXRlcy9hdHRyaWJ1dGVJdGVtXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjx0ciBkYXRhLWF0dHJpYnV0ZS1pZD1cXFwiXCIpO18uYihfLnYoXy5mKFwiaWRcIixjLHAsMCkpKTtfLmIoXCJcXFwiIGRhdGEtYXR0cmlidXRlLWV4cG9ydGlkPVxcXCJcIik7Xy5iKF8udihfLmYoXCJleHBvcnRpZFwiLGMscCwwKSkpO18uYihcIlxcXCIgZGF0YS1hdHRyaWJ1dGUtdHlwZT1cXFwiXCIpO18uYihfLnYoXy5mKFwidHlwZVwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8dGQgY2xhc3M9XFxcIm5hbWVcXFwiPlwiKTtfLmIoXy52KF8uZihcIm5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHRkIGNsYXNzPVxcXCJ2YWx1ZVxcXCI+XCIpO18uYihfLnYoXy5mKFwiZm9ybWF0dGVkVmFsdWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvdHI+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvYXR0cmlidXRlcy9hdHRyaWJ1dGVzVGFibGVcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPHRhYmxlIGNsYXNzPVxcXCJhdHRyaWJ1dGVzXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiYXR0cmlidXRlc1wiLGMscCwxKSxjLHAsMCw0NCw4MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKF8ucnAoXCJhdHRyaWJ1dGVzL2F0dHJpYnV0ZUl0ZW1cIixjLHAsXCIgICAgXCIpKTt9KTtjLnBvcCgpO31fLmIoXCI8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wibm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL2dlbmVyaWNBdHRyaWJ1dGVzXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO2lmKF8ucyhfLmQoXCJza2V0Y2hDbGFzcy5kZWxldGVkXCIsYyxwLDEpLGMscCwwLDI0LDI3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtd2FyblxcXCIgc3R5bGU9XFxcIm1hcmdpbi1ib3R0b206MTBweDtcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgVGhpcyBza2V0Y2ggd2FzIGNyZWF0ZWQgdXNpbmcgdGhlIFxcXCJcIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiB0ZW1wbGF0ZSwgd2hpY2ggaXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIG5vIGxvbmdlciBhdmFpbGFibGUuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIGNvcHkgdGhpcyBza2V0Y2ggb3IgbWFrZSBuZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIHNrZXRjaGVzIG9mIHRoaXMgdHlwZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCIgQXR0cmlidXRlczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKF8ucnAoXCJhdHRyaWJ1dGVzL2F0dHJpYnV0ZXNUYWJsZVwiLGMscCxcIiAgICBcIikpO18uYihcIiAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9yZXBvcnRMb2FkaW5nXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydExvYWRpbmdcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPCEtLSA8ZGl2IGNsYXNzPVxcXCJzcGlubmVyXFxcIj4zPC9kaXY+IC0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PlJlcXVlc3RpbmcgUmVwb3J0IGZyb20gU2VydmVyPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInByb2dyZXNzIHByb2dyZXNzLXN0cmlwZWQgYWN0aXZlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwiYmFyXFxcIiBzdHlsZT1cXFwid2lkdGg6IDEwMCU7XFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGEgaHJlZj1cXFwiI1xcXCIgcmVsPVxcXCJkZXRhaWxzXFxcIj5kZXRhaWxzPC9hPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJkZXRhaWxzXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcblxuaWYodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHRoaXNbXCJUZW1wbGF0ZXNcIl07XG59IiwiUmVwb3J0VGFiID0gcmVxdWlyZSAncmVwb3J0VGFiJ1xudGVtcGxhdGVzID0gcmVxdWlyZSAnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxuX3BhcnRpYWxzID0gcmVxdWlyZSAnLi4vbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cbmlkcyA9IHJlcXVpcmUgJy4vaWRzLmNvZmZlZSdcbmZvciBrZXksIHZhbHVlIG9mIGlkc1xuICB3aW5kb3dba2V5XSA9IHZhbHVlXG5cblxuY2xhc3MgRW52aXJvbm1lbnRUYWIgZXh0ZW5kcyBSZXBvcnRUYWJcbiAgIyB0aGlzIGlzIHRoZSBuYW1lIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIFRhYlxuICBuYW1lOiAnSGFiaXRhdHMnXG4gIGNsYXNzTmFtZTogJ2Vudmlyb25tZW50J1xuICB0aW1lb3V0OiAxMjAwMDBcbiAgdGVtcGxhdGU6IHRlbXBsYXRlcy5lbnZpcm9ubWVudFxuICBkZXBlbmRlbmNpZXM6IFtcbiAgICAnSGFiaXRhdHNFbnZpcm9ubWVudCdcbiAgICAnSGFiaXRhdHNPdmVydmlldydcbiAgICAnQWRqYWNlbnRUZXJyZXN0cmlhbCdcbiAgICAnSGFiUmVwc1Rvb2xib3gnXG4gIF1cblxuICByZW5kZXI6ICgpIC0+XG5cbiAgICAjc2hvdyB0YWJsZXMgaW5zdGVhZCBvZiBncmFwaCBmb3IgSUVcbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIGQzSXNQcmVzZW50ID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGQzSXNQcmVzZW50ID0gZmFsc2VcbiAgICBpc0NvbGxlY3Rpb24gPSBAbW9kZWwuaXNDb2xsZWN0aW9uKClcbiAgICBzY2lkID0gQHNrZXRjaENsYXNzLmlkXG4gICAgaWYgc2NpZCA9PSBHRU5FUklDX0lEIG9yIHNjaWQgPT0gR0VORVJJQ19DT0xMRUNUSU9OX0lEXG4gICAgICBpc0dlbmVyaWMgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgaXNHZW5lcmljID0gZmFsc2VcblxuICAgIGlzTVBBID0gKHNjaWQgPT0gTVBBX0lEIG9yIHNjaWQgPT0gTVBBX0NPTExFQ1RJT05fSUQpXG4gICAgaGFiX3NpemVzID0gQHJlY29yZFNldCgnSGFiUmVwc1Rvb2xib3gnLCAnSGFiU2l6ZXMnKS50b0FycmF5KClcblxuICAgIGhhYnNfaW5fc2tldGNoID0gaGFiX3NpemVzPy5sZW5ndGhcbiAgICBoYWJzX3BsdXJhbCA9IGhhYnNfaW5fc2tldGNoICE9IDFcblxuICAgIHByb3RlY3RlZF9hcmVhcyA9IEByZWNvcmRTZXQoJ0FkamFjZW50VGVycmVzdHJpYWwnLCAnUHVibGljQ29uc2VydmF0aW9uTGFuZCcpLnRvQXJyYXkoKVxuICAgIGhhc1Byb3RlY3RlZCA9IHByb3RlY3RlZF9hcmVhcz8ubGVuZ3RoID4gMFxuXG4gICAgcWUyX2NvdmVuYW50cyA9IEByZWNvcmRTZXQoJ0FkamFjZW50VGVycmVzdHJpYWwnLCAnQ29hc3RhbFByb3RlY3Rpb24nKS50b0FycmF5KClcbiAgICBoYXNRRTJjb3ZlbmFudHMgPSBxZTJfY292ZW5hbnRzPy5sZW5ndGggPiAwXG5cbiAgICBuYXBhbGlzX2NvdmVuYW50cyA9IEByZWNvcmRTZXQoJ0FkamFjZW50VGVycmVzdHJpYWwnLCAnQWRqYWNlbnRMYW5kQ292ZXInKS50b0FycmF5KClcbiAgICBoYXNOYXBhbGlzQ292ZW5hbnRzID0gbmFwYWxpc19jb3ZlbmFudHM/Lmxlbmd0aCA+IDBcblxuICAgIGhhc0NvdmVuYW50cyA9IChoYXNRRTJjb3ZlbmFudHMgb3IgaGFzTmFwYWxpc0NvdmVuYW50cylcblxuICAgIGlmIGlzR2VuZXJpYyBvciAoIWlzQ29sbGVjdGlvbiBhbmQgaXNNUEEpXG4gICAgICBzaG93QWRqYWNlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgc2hvd0FkamFjZW50ID0gZmFsc2VcbiAgICBcbiAgICBoYWJpdGF0c19yZXByZXNlbnRlZCA9IEByZWNvcmRTZXQoJ0hhYlJlcHNUb29sYm94JywgJ1JlcHJlc2VudGVkSGFicycpLnRvQXJyYXkoKVxuICAgIEByb3VuZERhdGEgaGFiaXRhdHNfcmVwcmVzZW50ZWRcbiAgICBhbGxfaGFicyA9IEBwcm9jZXNzSGFiaXRhdHMoaGFiaXRhdHNfcmVwcmVzZW50ZWQpXG4gXG4gICAgaGFiX3R5cGVzID0gYWxsX2hhYnNbMF1cbiAgICBoYXNIYWJUeXBlcyA9IGhhYl90eXBlcz8ubGVuZ3RoID4gMFxuICAgIHNpZ19oYWJzID0gYWxsX2hhYnNbMV1cbiAgICBoYXNTaWdIYWJzID0gc2lnX2hhYnM/Lmxlbmd0aCA+IDBcbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuIFxuICAgIGNvbnRleHQgPVxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcbiAgICAgIGlzR2VuZXJpYzogaXNHZW5lcmljXG4gICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuICAgICAgaXNNUEE6IGlzTVBBXG5cbiAgICAgIGhhYl90eXBlczogaGFiX3R5cGVzXG4gICAgICBoYXNIYWJUeXBlczogaGFzSGFiVHlwZXNcbiAgICAgIHNpZ19oYWJzOiBzaWdfaGFic1xuICAgICAgaGFzU2lnSGFiczogaGFzU2lnSGFic1xuXG4gICAgICBoYWJzX3BsdXJhbDogaGFic19wbHVyYWxcbiAgICAgIGhhYml0YXRzX3JlcHJlc2VudGVkOiBoYWJpdGF0c19yZXByZXNlbnRlZFxuXG4gICAgICBwcm90ZWN0ZWRfYXJlYXM6IHByb3RlY3RlZF9hcmVhc1xuICAgICAgaGFzUHJvdGVjdGVkOiBoYXNQcm90ZWN0ZWRcblxuICAgICAgcWUyX2NvdmVuYW50czogcWUyX2NvdmVuYW50c1xuICAgICAgaGFzUUUyY292ZW5hbnRzOiBoYXNRRTJjb3ZlbmFudHNcblxuICAgICAgbmFwYWxpc19jb3ZlbmFudHM6IG5hcGFsaXNfY292ZW5hbnRzXG4gICAgICBoYXNOYXBhbGlzQ292ZW5hbnRzOiBoYXNOYXBhbGlzQ292ZW5hbnRzXG5cbiAgICAgIGhhc0NvdmVuYW50czogaGFzQ292ZW5hbnRzXG4gICAgICBzaG93QWRqYWNlbnQ6IHNob3dBZGphY2VudFxuICAgICAgXG5cbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcbiAgICBAZW5hYmxlTGF5ZXJUb2dnbGVycygpXG4gICAgQHJvdW5kRGF0YShoYWJfc2l6ZXMpXG4gICAgQHNldHVwSGFiaXRhdFNvcnRpbmcoaGFiX3R5cGVzLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEBzZXR1cFNpZ0hhYml0YXRTb3J0aW5nKHNpZ19oYWJzLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuXG4gICAgQGVuYWJsZVRhYmxlUGFnaW5nKClcbiAgICBcbiAgcHJvY2Vzc0hhYml0YXRzOiAoaGFic19yZXByZXNlbnRlZCkgPT5cbiAgICBoYWJfdHlwZXMgPSBbXVxuICAgIGNyaXRpY2FsX2hhYml0YXRzID0gW11cbiAgICBmb3IgaGFiIGluIGhhYnNfcmVwcmVzZW50ZWRcbiAgICAgIGlmIGhhYi5IQUJfVFlQRSA9PSBcIkJyeW96b2FuIHJlZWZcIiBvciBoYWIuSEFCX1RZUEUgPT0gXCJNYWNyb2N5c3RpcyBiZWRcIlxuICAgICAgICBjcml0aWNhbF9oYWJpdGF0cy5wdXNoKGhhYilcbiAgICAgIGVsc2VcbiAgICAgICAgaGFiX3R5cGVzLnB1c2goaGFiKVxuXG4gICAgcmV0dXJuIFtoYWJfdHlwZXMsIGNyaXRpY2FsX2hhYml0YXRzXVxuXG4gIHJvdW5kRGF0YTogKGhhYml0YXRzKSA9PiAgXG4gICAgZm9yIGhhYiBpbiBoYWJpdGF0c1xuICAgICAgaGFiLlNJWkVfU1FLTSA9IE51bWJlcihoYWIuU0laRV9TUUtNKS50b0ZpeGVkKDEpXG4gICAgICBoYWIuUEVSQyA9IE51bWJlcihoYWIuUEVSQykudG9GaXhlZCgxKVxuXG4gIHNldHVwU2lnSGFiaXRhdFNvcnRpbmc6IChoYWJpdGF0cywgaXNNUEEsIGlzQ29sbGVjdGlvbikgPT5cbiAgICB0Ym9keU5hbWUgPSAnLnNpZ19oYWJfdmFsdWVzJ1xuICAgIHRhYmxlTmFtZSA9ICcuc2lnX2hhYl90YWJsZSdcbiAgICBAJCgnLnNpZ19oYWJfdHlwZScpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdzaWdfaGFiX3R5cGUnLCB0YWJsZU5hbWUsIGhhYml0YXRzLCBldmVudCwgXCJIQUJfVFlQRVwiLCB0Ym9keU5hbWUsIGZhbHNlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBAJCgnLnNpZ19oYWJfbmV3X2FyZWEnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnc2lnX2hhYl9uZXdfYXJlYScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlNJWkVfU1FLTVwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuc2lnX2hhYl9uZXdfcGVyYycpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdzaWdfaGFiX25ld19wZXJjJyx0YWJsZU5hbWUsIGhhYml0YXRzLCBldmVudCwgXCJQRVJDXCIsIHRib2R5TmFtZSwgdHJ1ZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgXG4gICAgQCQoJy5zaWdfaGFiX3JlcHJlc2VudCcpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdzaWdfaGFiX3JlcHJlc2VudCcsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiUkVQUkVTRU5UXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuc2lnX2hhYl9yZXBsaWNhdGUnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnc2lnX2hhYl9yZXBsaWNhdGUnLHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlJFUExJQ1wiLCB0Ym9keU5hbWUsIGZhbHNlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBcbiAgICBAcmVuZGVyU29ydCgnc2lnX2hhYl90eXBlJywgdGFibGVOYW1lLCBoYWJpdGF0cywgdW5kZWZpbmVkLCBcIkhBQl9UWVBFXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuXG4gIHNldHVwSGFiaXRhdFNvcnRpbmc6IChoYWJpdGF0cywgaXNNUEEsIGlzQ29sbGVjdGlvbikgPT5cbiAgICB0Ym9keU5hbWUgPSAnLmhhYl92YWx1ZXMnXG4gICAgdGFibGVOYW1lID0gJy5oYWJfdGFibGUnXG4gICAgQCQoJy5oYWJfdHlwZScpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdoYWJfdHlwZScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIkhBQl9UWVBFXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuaGFiX25ld19hcmVhJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2hhYl9uZXdfYXJlYScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlNJWkVfU1FLTVwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuaGFiX25ld19wZXJjJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2hhYl9uZXdfcGVyYycsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiUEVSQ1wiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIFxuICAgIEAkKCcuaGFiX3JlcHJlc2VudCcpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdoYWJfcmVwcmVzZW50Jyx0YWJsZU5hbWUsIGhhYml0YXRzLCBldmVudCwgXCJSRVBSRVNFTlRcIiwgdGJvZHlOYW1lLCBmYWxzZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQCQoJy5oYWJfcmVwbGljYXRlJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2hhYl9yZXBsaWNhdGUnLHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlJFUExJQ1wiLCB0Ym9keU5hbWUsIGZhbHNlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICAgICAgXG5cbiAgICBAcmVuZGVyU29ydCgnaGFiX3R5cGUnLCB0YWJsZU5hbWUsIGhhYml0YXRzLCB1bmRlZmluZWQsIFwiSEFCX1RZUEVcIiwgdGJvZHlOYW1lLCBmYWxzZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG5cbiAgI2RvIHRoZSBzb3J0aW5nIC0gc2hvdWxkIGJlIHRhYmxlIGluZGVwZW5kZW50XG4gICNza2lwIGFueSB0aGF0IGFyZSBsZXNzIHRoYW4gMC4wMFxuICByZW5kZXJTb3J0OiAobmFtZSwgdGFibGVOYW1lLCBwZGF0YSwgZXZlbnQsIHNvcnRCeSwgdGJvZHlOYW1lLCBpc0Zsb2F0LCBnZXRSb3dTdHJpbmdWYWx1ZSwgaXNNUEEsIGlzQ29sbGVjdGlvbikgPT5cbiAgICBpZiBldmVudFxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG5cbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIHRhcmdldENvbHVtbiA9IEBnZXRTZWxlY3RlZENvbHVtbihldmVudCwgbmFtZSlcbiAgICAgIHNvcnRVcCA9IEBnZXRTb3J0RGlyKHRhcmdldENvbHVtbilcblxuICAgICAgaWYgaXNGbG9hdFxuICAgICAgICBkYXRhID0gXy5zb3J0QnkgcGRhdGEsIChyb3cpIC0+ICBwYXJzZUZsb2F0KHJvd1tzb3J0QnldKVxuICAgICAgZWxzZVxuICAgICAgICBkYXRhID0gXy5zb3J0QnkgcGRhdGEsIChyb3cpIC0+IHJvd1tzb3J0QnldXG5cbiAgICAgICNmbGlwIHNvcnRpbmcgaWYgbmVlZGVkXG4gICAgICBpZiBzb3J0VXBcbiAgICAgICAgZGF0YS5yZXZlcnNlKClcblxuICAgICAgZWwgPSBAJCh0Ym9keU5hbWUpWzBdXG4gICAgICBoYWJfYm9keSA9IGQzLnNlbGVjdChlbClcblxuICAgICAgI3JlbW92ZSBvbGQgcm93c1xuICAgICAgaGFiX2JvZHkuc2VsZWN0QWxsKFwidHIuaGFiX3Jvd3NcIilcbiAgICAgICAgLnJlbW92ZSgpXG5cbiAgICAgICNhZGQgbmV3IHJvd3MgKGFuZCBkYXRhKVxuICAgICAgcm93cyA9IGhhYl9ib2R5LnNlbGVjdEFsbChcInRyXCIpXG4gICAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgICAgLmVudGVyKCkuaW5zZXJ0KFwidHJcIiwgXCI6Zmlyc3QtY2hpbGRcIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImhhYl9yb3dzXCIpXG5cbiAgICAgIGlmIGlzTVBBXG4gICAgICAgIGlmIGlzQ29sbGVjdGlvblxuICAgICAgICAgIGNvbHVtbnMgPSBbXCJIQUJfVFlQRVwiLCBcIlNJWkVfU1FLTVwiLCBcIlBFUkNcIiwgXCJSRVBSRVNFTlRcIiwgXCJSRVBMSUNcIl1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNvbHVtbnMgPSBbXCJIQUJfVFlQRVwiLCBcIlNJWkVfU1FLTVwiLCBcIlBFUkNcIiwgXCJSRVBSRVNFTlRcIl1cbiAgICAgIGVsc2VcbiAgICAgICAgY29sdW1ucyA9IFtcIkhBQl9UWVBFXCIsIFwiU0laRV9TUUtNXCIsIFwiUEVSQ1wiXVxuXG4gICAgICBjZWxscyA9IHJvd3Muc2VsZWN0QWxsKFwidGRcIilcbiAgICAgICAgICAuZGF0YSgocm93LCBpKSAtPmNvbHVtbnMubWFwIChjb2x1bW4pIC0+IChjb2x1bW46IGNvbHVtbiwgdmFsdWU6IHJvd1tjb2x1bW5dKSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZChcInRkXCIpLnRleHQoKGQsIGkpIC0+IFxuICAgICAgICAgIGQudmFsdWVcbiAgICAgICAgKSAgICBcblxuICAgICAgQHNldE5ld1NvcnREaXIodGFyZ2V0Q29sdW1uLCBzb3J0VXApXG4gICAgICBAc2V0U29ydGluZ0NvbG9yKGV2ZW50LCB0YWJsZU5hbWUpXG5cbiAgICAgICNmaXJlIHRoZSBldmVudCBmb3IgdGhlIGFjdGl2ZSBwYWdlIGlmIHBhZ2luYXRpb24gaXMgcHJlc2VudFxuICAgICAgQGZpcmVQYWdpbmF0aW9uKHRhYmxlTmFtZSlcbiAgICAgIGlmIGV2ZW50XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgI3RhYmxlIHJvdyBmb3IgaGFiaXRhdCByZXByZXNlbnRhdGlvblxuICBnZXRIYWJpdGF0Um93U3RyaW5nOiAoZCwgaXNNUEEsIGlzQ29sbGVjdGlvbikgPT5cbiAgICBpZiBkIGlzIHVuZGVmaW5lZFxuICAgICAgcmV0dXJuIFwiXCJcbiAgICByZXByZXNlbnRlZF9zdHIgPSBcIlwiXG4gICAgcmVwbGljYXRlZF9zdHIgPSBcIlwiXG4gICAgaWYgaXNNUEFcbiAgICAgIHJlcHJlc2VudGVkX3N0ciA9IFwiPHRkXCI+K2QuUkVQUkVTRU5UK1wiPC90ZD5cIlxuICAgICAgaWYgaXNDb2xsZWN0aW9uXG4gICAgICAgIHJlcGxpY2F0ZWRfc3RyID0gXCI8dGQ+XCIrZC5SRVBMSUMrXCI8L3RkPlwiXG5cbiAgICByZXR1cm4gXCI8dGQ+XCIrZC5IQUJfVFlQRStcIjwvdGQ+XCIrXCI8dGQ+XCIrZC5TSVpFX1NRS00rXCI8L3RkPlwiK1wiPHRkPlwiK2QuUEVSQytcIjwvdGQ+XCIrcmVwcmVzZW50ZWRfc3RyK3JlcGxpY2F0ZWRfc3RyXG5cbiAgc2V0U29ydGluZ0NvbG9yOiAoZXZlbnQsIHRhYmxlTmFtZSkgPT5cbiAgICBzb3J0aW5nQ2xhc3MgPSBcInNvcnRpbmdfY29sXCJcbiAgICBpZiBldmVudFxuICAgICAgcGFyZW50ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoKVxuICAgICAgbmV3VGFyZ2V0TmFtZSA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuY2xhc3NOYW1lXG4gICAgICB0YXJnZXRTdHIgPSB0YWJsZU5hbWUrXCIgdGguc29ydGluZ19jb2wgYVwiICAgXG4gICAgICBpZiBAJCh0YXJnZXRTdHIpIGFuZCBAJCh0YXJnZXRTdHIpWzBdXG4gICAgICAgIG9sZFRhcmdldE5hbWUgPSBAJCh0YXJnZXRTdHIpWzBdLmNsYXNzTmFtZVxuICAgICAgICBpZiBuZXdUYXJnZXROYW1lICE9IG9sZFRhcmdldE5hbWVcbiAgICAgICAgICAjcmVtb3ZlIGl0IGZyb20gb2xkIFxuICAgICAgICAgIGhlYWRlck5hbWUgPSB0YWJsZU5hbWUrXCIgdGguc29ydGluZ19jb2xcIlxuICAgICAgICAgIEAkKGhlYWRlck5hbWUpLnJlbW92ZUNsYXNzKHNvcnRpbmdDbGFzcylcbiAgICAgICAgICAjYW5kIGFkZCBpdCB0byBuZXdcbiAgICAgICAgICBwYXJlbnQuYWRkQ2xhc3Moc29ydGluZ0NsYXNzKVxuICAgICBcbiAgZ2V0U29ydERpcjogKHRhcmdldENvbHVtbikgPT5cbiAgICAgc29ydHVwID0gQCQoJy4nK3RhcmdldENvbHVtbikuaGFzQ2xhc3MoXCJzb3J0X3VwXCIpXG4gICAgIHJldHVybiBzb3J0dXBcblxuICBnZXRTZWxlY3RlZENvbHVtbjogKGV2ZW50LCBuYW1lKSA9PlxuICAgIGlmIGV2ZW50XG4gICAgICAjZ2V0IHNvcnQgb3JkZXJcbiAgICAgIHRhcmdldENvbHVtbiA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuY2xhc3NOYW1lXG5cbiAgICAgIG11bHRpQ2xhc3NlcyA9IHRhcmdldENvbHVtbi5zcGxpdCgnICcpXG4gICAgICAjcHJvdGVjdGVkTWFtbWFscyA9IF8uc29ydEJ5IHByb3RlY3RlZE1hbW1hbHMsIChyb3cpIC0+IHBhcnNlSW50KHJvdy5Db3VudClcbiAgICAgIGhhYkNsYXNzTmFtZSA9Xy5maW5kIG11bHRpQ2xhc3NlcywgKGNsYXNzbmFtZSkgLT4gXG4gICAgICAgIGNsYXNzbmFtZS5sYXN0SW5kZXhPZignaGFiJywwKSA9PSAwIFxuICAgICAgaWYgaGFiQ2xhc3NOYW1lIGlzIHVuZGVmaW5lZFxuICAgICAgICBoYWJDbGFzc05hbWUgPV8uZmluZCBtdWx0aUNsYXNzZXMsIChjbGFzc25hbWUpIC0+IFxuICAgICAgICAgIGNsYXNzbmFtZS5sYXN0SW5kZXhPZignc2lnJywwKSA9PSAwIFxuXG4gICAgICB0YXJnZXRDb2x1bW4gPSBoYWJDbGFzc05hbWVcbiAgICBlbHNlXG4gICAgICAjd2hlbiB0aGVyZSBpcyBubyBldmVudCwgZmlyc3QgdGltZSB0YWJsZSBpcyBmaWxsZWRcbiAgICAgIHRhcmdldENvbHVtbiA9IG5hbWVcblxuICAgIHJldHVybiB0YXJnZXRDb2x1bW5cblxuICBzZXROZXdTb3J0RGlyOiAodGFyZ2V0Q29sdW1uLCBzb3J0VXApID0+XG4gICAgI2FuZCBzd2l0Y2ggaXRcbiAgICBpZiBzb3J0VXBcbiAgICAgIEAkKCcuJyt0YXJnZXRDb2x1bW4pLnJlbW92ZUNsYXNzKCdzb3J0X3VwJylcbiAgICAgIEAkKCcuJyt0YXJnZXRDb2x1bW4pLmFkZENsYXNzKCdzb3J0X2Rvd24nKVxuICAgIGVsc2VcbiAgICAgIEAkKCcuJyt0YXJnZXRDb2x1bW4pLmFkZENsYXNzKCdzb3J0X3VwJylcbiAgICAgIEAkKCcuJyt0YXJnZXRDb2x1bW4pLnJlbW92ZUNsYXNzKCdzb3J0X2Rvd24nKVxuXG4gIGZpcmVQYWdpbmF0aW9uOiAodGFibGVOYW1lKSA9PlxuICAgIGVsID0gQCQodGFibGVOYW1lKVswXVxuICAgIGhhYl90YWJsZSA9IGQzLnNlbGVjdChlbClcbiAgICBhY3RpdmVfcGFnZSA9IGhhYl90YWJsZS5zZWxlY3RBbGwoXCIuYWN0aXZlIGFcIilcbiAgICBpZiBhY3RpdmVfcGFnZSBhbmQgYWN0aXZlX3BhZ2VbMF0gYW5kIGFjdGl2ZV9wYWdlWzBdWzBdXG4gICAgICBhY3RpdmVfcGFnZVswXVswXS5jbGljaygpXG5cbm1vZHVsZS5leHBvcnRzID0gRW52aXJvbm1lbnRUYWIiLCJSZXBvcnRUYWIgPSByZXF1aXJlICdyZXBvcnRUYWInXG50ZW1wbGF0ZXMgPSByZXF1aXJlICcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5fcGFydGlhbHMgPSByZXF1aXJlICcuLi9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxucGFydGlhbHMgPSBbXVxuZm9yIGtleSwgdmFsIG9mIF9wYXJ0aWFsc1xuICBwYXJ0aWFsc1trZXkucmVwbGFjZSgnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpLycsICcnKV0gPSB2YWxcblxuaWRzID0gcmVxdWlyZSAnLi9pZHMuY29mZmVlJ1xuZm9yIGtleSwgdmFsdWUgb2YgaWRzXG4gIHdpbmRvd1trZXldID0gdmFsdWVcblxuXG5jbGFzcyBGaXNoaW5nVGFiIGV4dGVuZHMgUmVwb3J0VGFiXG4gICMgdGhpcyBpcyB0aGUgbmFtZSB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBUYWJcbiAgbmFtZTogJ0Zpc2hpbmcnXG4gIGNsYXNzTmFtZTogJ2Zpc2hpbmcnXG4gIHRpbWVvdXQ6IDEyMDAwMFxuICB0ZW1wbGF0ZTogdGVtcGxhdGVzLmZpc2hpbmdcbiAgZGVwZW5kZW5jaWVzOiBbXG4gICAgJ0Zpc2hpbmdJbnRlbnNpdHknLCAnRmlzaGluZ0FyZWFzJ1xuICBdXG5cbiAgcmVuZGVyOiAoKSAtPlxuXG4gICAgI3Nob3cgdGFibGVzIGluc3RlYWQgb2YgZ3JhcGggZm9yIElFXG4gICAgaWYgd2luZG93LmQzXG4gICAgICBkM0lzUHJlc2VudCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBkM0lzUHJlc2VudCA9IGZhbHNlXG5cbiAgICBpc0NvbGxlY3Rpb24gPSBAbW9kZWwuaXNDb2xsZWN0aW9uKClcbiAgICBzY2lkID0gQHNrZXRjaENsYXNzLmlkXG4gICAgaWYgc2NpZCA9PSBNUEFfSUQgb3Igc2NpZCA9PSBNUEFfQ09MTEVDVElPTl9JRFxuICAgICAgaXNNUEEgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgaXNNUEEgPSBmYWxzZVxuXG4gICAgaWYgaXNNUEFcbiAgICAgIHNldG5ldCA9IEByZWNvcmRTZXQoJ0Zpc2hpbmdJbnRlbnNpdHknLCAnU2V0TmV0JykudG9BcnJheSgpXG4gICAgICBAcm91bmREYXRhKHNldG5ldClcbiAgICAgIHRyYXdsID0gQHJlY29yZFNldCgnRmlzaGluZ0ludGVuc2l0eScsICdUcmF3bCcpLnRvQXJyYXkoKVxuICAgICAgQHJvdW5kRGF0YSh0cmF3bClcbiAgICAgIGxvbmdsaW5lID0gQHJlY29yZFNldCgnRmlzaGluZ0ludGVuc2l0eScsICdMb25nTGluZScpLnRvQXJyYXkoKVxuICAgICAgQHJvdW5kRGF0YShsb25nbGluZSlcblxuICAgIGV4aXN0aW5nX2N1c3RvbWFyeV9maXNoaW5nID0gQHJlY29yZFNldCgnRmlzaGluZ0FyZWFzJywgJ0V4aXN0aW5nQ3VzdG9tYXJ5QXJlYScpLnRvQXJyYXkoKVxuICAgIGhhc0V4aXN0aW5nQ3VzdG9tYXJ5ID0gZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmc/Lmxlbmd0aCA+IDBcbiAgICBwcm9wb3NlZF9jdXN0b21hcnlfZmlzaGluZyA9IEByZWNvcmRTZXQoJ0Zpc2hpbmdBcmVhcycsICdQcm9wb3NlZEN1c3RvbWFyeUFyZWEnKS50b0FycmF5KClcbiAgICBoYXNQcm9wb3NlZEN1c3RvbWFyeSA9IHByb3Bvc2VkX2N1c3RvbWFyeV9maXNoaW5nPy5sZW5ndGggPiAwXG5cbiAgICBoYXNDdXN0b21hcnkgPSBoYXNFeGlzdGluZ0N1c3RvbWFyeSBvciBoYXNQcm9wb3NlZEN1c3RvbWFyeVxuXG4gICAgZXhpc3RpbmdfZmlzaGluZ19hcmVhcyA9IEByZWNvcmRTZXQoJ0Zpc2hpbmdBcmVhcycsICdGaXNoaW5nRXhpc3RpbmdBcmVhJykudG9BcnJheSgpXG4gICAgaGFzRXhpc3RpbmdGaXNoaW5nID0gZXhpc3RpbmdfZmlzaGluZ19hcmVhcz8ubGVuZ3RoID4gMFxuICAgIGhhc0FueUZpc2hpbmcgPSBoYXNFeGlzdGluZ0Zpc2hpbmcgb3IgaGFzQ3VzdG9tYXJ5XG4gICAgYXR0cmlidXRlcyA9IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICBcbiAgICBpZiBpc01QQVxuICAgICAgY29udGV4dCA9XG4gICAgICAgIHNrZXRjaDogQG1vZGVsLmZvclRlbXBsYXRlKClcbiAgICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICAgIGF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICAgICAgYW55QXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKS5sZW5ndGggPiAwXG4gICAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICAgIGQzSXNQcmVzZW50OiBkM0lzUHJlc2VudFxuXG4gICAgICAgIGlzQ29sbGVjdGlvbjogaXNDb2xsZWN0aW9uXG4gICAgICAgIHNldG5ldDogc2V0bmV0XG4gICAgICAgIHRyYXdsOiB0cmF3bFxuICAgICAgICBsb25nbGluZTogbG9uZ2xpbmVcbiAgICAgICAgaXNNUEE6IGlzTVBBXG4gICAgICAgIGV4aXN0aW5nX2N1c3RvbWFyeV9maXNoaW5nOiBleGlzdGluZ19jdXN0b21hcnlfZmlzaGluZ1xuICAgICAgICBoYXNFeGlzdGluZ0N1c3RvbWFyeTogaGFzRXhpc3RpbmdDdXN0b21hcnlcbiAgICAgICAgcHJvcG9zZWRfY3VzdG9tYXJ5X2Zpc2hpbmc6IHByb3Bvc2VkX2N1c3RvbWFyeV9maXNoaW5nXG4gICAgICAgIGhhc1Byb3Bvc2VkQ3VzdG9tYXJ5OiBoYXNQcm9wb3NlZEN1c3RvbWFyeVxuICAgICAgICBleGlzdGluZ19maXNoaW5nX2FyZWFzOiBleGlzdGluZ19maXNoaW5nX2FyZWFzXG4gICAgICAgIGhhc0V4aXN0aW5nRmlzaGluZzogaGFzRXhpc3RpbmdGaXNoaW5nXG4gICAgICAgIGhhc0FueUZpc2hpbmc6IGhhc0FueUZpc2hpbmdcbiAgICAgICAgaGFzQ3VzdG9tYXJ5OiBoYXNDdXN0b21hcnlcbiAgICAgICAgaXNNUEE6IGlzTVBBXG4gICAgZWxzZVxuICAgICAgY29udGV4dCA9XG4gICAgICAgIHNrZXRjaDogQG1vZGVsLmZvclRlbXBsYXRlKClcbiAgICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICAgIGF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICAgICAgYW55QXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKS5sZW5ndGggPiAwXG4gICAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICAgIGQzSXNQcmVzZW50OiBkM0lzUHJlc2VudFxuICAgICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuICAgICAgICBleGlzdGluZ19jdXN0b21hcnlfZmlzaGluZzogZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmdcbiAgICAgICAgaGFzRXhpc3RpbmdDdXN0b21hcnk6IGhhc0V4aXN0aW5nQ3VzdG9tYXJ5XG4gICAgICAgIHByb3Bvc2VkX2N1c3RvbWFyeV9maXNoaW5nOiBwcm9wb3NlZF9jdXN0b21hcnlfZmlzaGluZ1xuICAgICAgICBoYXNQcm9wb3NlZEN1c3RvbWFyeTogaGFzUHJvcG9zZWRDdXN0b21hcnlcbiAgICAgICAgZXhpc3RpbmdfZmlzaGluZ19hcmVhczogZXhpc3RpbmdfZmlzaGluZ19hcmVhc1xuICAgICAgICBoYXNFeGlzdGluZ0Zpc2hpbmc6IGhhc0V4aXN0aW5nRmlzaGluZ1xuICAgICAgICBoYXNBbnlGaXNoaW5nOiBoYXNBbnlGaXNoaW5nXG4gICAgICAgIGhhc0N1c3RvbWFyeTogaGFzQ3VzdG9tYXJ5XG4gICAgICAgIGlzTVBBOiBpc01QQVxuXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgcGFydGlhbHMpXG4gICAgQGVuYWJsZUxheWVyVG9nZ2xlcnMoKVxuXG4gIHJvdW5kRGF0YTogKHJlY19zZXQpID0+XG4gICAgbG93X3RvdGFsID0gMC4wXG4gICAgaGlnaF90b3RhbCA9IDAuMFxuICAgIGZvciBycyBpbiByZWNfc2V0XG4gICAgICBycy5MT1cgPSBOdW1iZXIocnMuTE9XKS50b0ZpeGVkKDEpXG4gICAgICBsb3dfdG90YWwrPU51bWJlcihycy5MT1cpXG4gICAgICBycy5ISUdIID0gTnVtYmVyKHJzLkhJR0gpLnRvRml4ZWQoMSlcbiAgICAgIGhpZ2hfdG90YWwrPU51bWJlcihycy5ISUdIKVxuICAgICAgcnMuVE9UQUwgPSBOdW1iZXIocnMuVE9UQUwpLnRvRml4ZWQoMSlcbiAgICBpZiByZWNfc2V0Py5sZW5ndGggPiAwXG4gICAgICB0b3Rfcm93ID0ge1wiTkFNRVwiOlwiVG90YWxcIiwgXCJMT1dcIjpsb3dfdG90YWwsIFwiSElHSFwiOmhpZ2hfdG90YWx9XG4gICAgICByZWNfc2V0LnB1c2godG90X3JvdylcblxubW9kdWxlLmV4cG9ydHMgPSBGaXNoaW5nVGFiIiwibW9kdWxlLmV4cG9ydHMgPSBcbiAgR0VORVJJQ19JRDogJzUzOWY1ZWM2OGQxMDkyNmMyOWZlNzc2MidcbiAgR0VORVJJQ19DT0xMRUNUSU9OX0lEOiAnNTNmZDE5NTUwNDA2ZGU2ODRjMTE4OTY5J1xuICBNUEFfSUQ6ICc1NGQ4MTI5MGZhOTRlNjk3NzU5Y2U3NzEnXG4gIE1QQV9DT0xMRUNUSU9OX0lEOiAnNTU4MmU2MDVhYzJkZGRkNDI5NzZmNDFiJyIsIlJlcG9ydFRhYiA9IHJlcXVpcmUgJ3JlcG9ydFRhYidcbnRlbXBsYXRlcyA9IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbl9wYXJ0aWFscyA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5wYXJ0aWFscyA9IFtdXG5mb3Iga2V5LCB2YWwgb2YgX3BhcnRpYWxzXG4gIHBhcnRpYWxzW2tleS5yZXBsYWNlKCdub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvJywgJycpXSA9IHZhbFxuXG5pZHMgPSByZXF1aXJlICcuL2lkcy5jb2ZmZWUnXG5mb3Iga2V5LCB2YWx1ZSBvZiBpZHNcbiAgd2luZG93W2tleV0gPSB2YWx1ZVxuXG5jbGFzcyBPdmVydmlld1RhYiBleHRlbmRzIFJlcG9ydFRhYlxuICAjIHRoaXMgaXMgdGhlIG5hbWUgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgVGFiXG4gIG5hbWU6ICdPdmVydmlldydcbiAgY2xhc3NOYW1lOiAnb3ZlcnZpZXcnXG4gIHRpbWVvdXQ6IDEyMDAwMFxuICB0ZW1wbGF0ZTogdGVtcGxhdGVzLm92ZXJ2aWV3XG4gIGRlcGVuZGVuY2llczogW1xuICAgICdTaXplJ1xuICAgICdDb2FzdGxpbmVMZW5ndGgnXG4gICAgJ0hhYml0YXRzT3ZlcnZpZXcnXG4gICAgJ1Byb3Bvc2FsU2l6ZSdcbiAgICAnUHJvcG9zYWxDb25uZWN0aXZpdHknXG4gICAgJ0hhYlJlcHNUb29sYm94J1xuICBdXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgICMgVGhlIEByZWNvcmRTZXQgbWV0aG9kIGNvbnRhaW5zIHNvbWUgdXNlZnVsIG1lYW5zIHRvIGdldCBkYXRhIG91dCBvZiBcbiAgICAjIHRoZSBtb25zdGVyb3VzIFJlY29yZFNldCBqc29uLiBDaGVja291dCB0aGUgc2Vhc2tldGNoLXJlcG9ydGluZy10ZW1wbGF0ZVxuICAgICMgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBpbmZvLlxuICAgIFRPVEFMX0NPQVNUTElORV9MRU5HVEggPSA2NjcuNTk0XG4gICAgVE9UQUxfSEFCUyA9IDMwXG4gICAgc2NpZCA9IEBza2V0Y2hDbGFzcy5pZFxuICAgIGlzQ29sbGVjdGlvbiA9IEBtb2RlbC5pc0NvbGxlY3Rpb24oKVxuICAgIGlzTVBBID0gKHNjaWQgPT0gTVBBX0lEIG9yIHNjaWQgPT0gTVBBX0NPTExFQ1RJT05fSUQpXG4gICAgbnVtX3Jlc2VydmVzID0gMFxuICAgIG51bV90eXBlMiA9IDBcblxuICAgIGlmIGlzQ29sbGVjdGlvblxuICAgICAgbnVtU2tldGNoZXMgPSBAbW9kZWwuZ2V0Q2hpbGRyZW4oKS5sZW5ndGhcbiAgICAgIGlmIGlzTVBBXG4gICAgICAgIHJlc2VydmVfdHlwZXMgPSBAZ2V0UmVzZXJ2ZVZhbHVlcyBAbW9kZWwuZ2V0Q2hpbGRyZW4oKVxuICAgICAgICBudW1fcmVzZXJ2ZXMgPSByZXNlcnZlX3R5cGVzWzBdXG4gICAgICAgIG51bV90eXBlMiA9IHJlc2VydmVfdHlwZXNbMV1cbiAgICBlbHNlXG4gICAgICBudW1Ta2V0Y2hlcyA9IDFcblxuXG4gICAgcGx1cmFsU2tldGNoZXMgPSBudW1Ta2V0Y2hlcyA+IDFcbiAgICBpc01QQSA9IChzY2lkID09IE1QQV9JRCBvciBzY2lkID09IE1QQV9DT0xMRUNUSU9OX0lEKVxuICAgIGlzR2VuZXJpYyA9IChzY2lkID09IEdFTkVSSUNfSUQgb3Igc2NpZCA9PSBHRU5FUklDX0NPTExFQ1RJT05fSUQpXG5cbiAgICBwcm9wX3NpemVzID0gQHJlY29yZFNldCgnUHJvcG9zYWxTaXplJywgJ1NpemVzJykudG9BcnJheSgpXG4gICAgcmVwcmVzZW50ZWRfaGFicyA9IEByZWNvcmRTZXQoJ0hhYlJlcHNUb29sYm94JywgJ1JlcHJlc2VudGVkSGFicycpLnRvQXJyYXkoKVxuICAgIGhhYl9zaXplcyA9IEByZWNvcmRTZXQoJ0hhYlJlcHNUb29sYm94JywgJ1JlcHJlc2VudGVkSGFicycpLnRvQXJyYXkoKVxuICAgIG51bV9oYWJzID0gaGFiX3NpemVzPy5sZW5ndGhcblxuXG4gICAgbnVtX3JlcHJlc2VudGVkX2hhYnMgPSBAZ2V0TnVtSGFicyhcIlJFUFJFU0VOVFwiLCByZXByZXNlbnRlZF9oYWJzKVxuICAgIG51bV9yZXBsaWNhdGVkX2hhYnMgPSBAZ2V0TnVtSGFicyhcIlJFUExJQ1wiLCByZXByZXNlbnRlZF9oYWJzKVxuICBcbiAgICBjb25zb2xlLmxvZyhcIm51bSByZXByZXNlbnRlZDogXCIsIG51bV9yZXByZXNlbnRlZF9oYWJzKVxuICAgIGNvbnNvbGUubG9nKFwibnVtIHJlcGxpY2F0ZWQ6IFwiLCBudW1fcmVwbGljYXRlZF9oYWJzKVxuXG4gICAgbXBhX2F2Z19taW5fZGltID0gQGdldEF2ZXJhZ2VNaW5EaW0ocHJvcF9zaXplcylcbiAgICB0b3RhbF9wZXJjZW50ID0gQGdldFRvdGFsQXJlYVBlcmNlbnQocHJvcF9zaXplcylcbiAgICBwcm9wX3NpemVzID0gQGNsZWFudXBEYXRhKHByb3Bfc2l6ZXMpXG4gICAgXG4gICAgbXBhX2NvdW50ID0gQGdldE1pbkRpbUNvdW50KHByb3Bfc2l6ZXMpXG4gICAgdG90YWxfbXBhX2NvdW50ID0gbnVtU2tldGNoZXNcbiAgICBwbHVyYWxfbXBhX2NvdW50ID0gbXBhX2NvdW50ICE9IDFcblxuICAgIFxuICAgIGlmIG1wYV9hdmdfbWluX2RpbSA8IDEwXG4gICAgICBtcGFfYXZnX3NpemVfZ3VpZGVsaW5lID0gXCJiZWxvd1wiXG4gICAgZWxzZVxuICAgICAgbXBhX2F2Z19zaXplX2d1aWRlbGluZSA9IFwiYWJvdmVcIlxuICAgIHRyeVxuICAgICAgc2l6ZSA9IEByZWNvcmRTZXQoJ1NpemUnLCAnU2l6ZScpLmZsb2F0KCdTSVpFX1NRS00nKVxuICAgICAgaWYgc2l6ZSA8IDAuMVxuICAgICAgICBuZXdfc2l6ZSA9IFwiPCAwLjFcIlxuICAgICAgZWxzZVxuICAgICAgICBuZXdfc2l6ZSA9ICBAYWRkQ29tbWFzIHNpemVcblxuICAgIGNhdGNoIEVycm9yXG4gICAgICBjb25zb2xlLmxvZygnZXJyb3IgZ2V0dGluZyBzaXplJylcbiAgICAgIG5ld19zaXplID0gMFxuXG4gICAgdHJ5XG4gICAgICBwZXJjZW50ID0gQHJlY29yZFNldCgnU2l6ZScsICdQZXJjZW50JykuZmxvYXQoJ1BFUkMnKVxuICAgICAgaWYgcGVyY2VudCA9PSAwICYmIHRvdGFsX3BlcmNlbnQgPiAwXG4gICAgICAgIHBlcmNlbnQgPSBcIjwgMVwiXG4gICAgY2F0Y2ggRXJyb3JcbiAgICAgIHBlcmNlbnQgPSB0b3RhbF9wZXJjZW50XG5cbiAgICBjb2FzdGxpbmVfbGVuZ3RoID0gQHJlY29yZFNldCgnQ29hc3RsaW5lTGVuZ3RoJywgJ0NvYXN0bGluZUxlbmd0aCcpLmZsb2F0KCdMR1RIX0lOX00nKVxuICAgIFxuICAgIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA9ICgoY29hc3RsaW5lX2xlbmd0aC8xMDAwKS9UT1RBTF9DT0FTVExJTkVfTEVOR1RIKSoxMDBcbiAgICBpZiBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQgPiAwICYmIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA8IDFcbiAgICAgIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA9IFwiPCAxXCJcbiAgICBlbHNlXG4gICAgICBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQgPSBwYXJzZUZsb2F0KGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCkudG9GaXhlZCgxKVxuXG4gICAgY29hc3RsaW5lX2xlbmd0aCA9IEBhZGRDb21tYXMgY29hc3RsaW5lX2xlbmd0aFxuICAgIG5ld19oYWJzID0gQHJlY29yZFNldCgnSGFiaXRhdHNPdmVydmlldycsICdIYWJpdGF0U2l6ZScpLmZsb2F0KCdORVdfSEFCUycpXG4gICAgdG90YWxfaGFicyA9IEByZWNvcmRTZXQoJ0hhYml0YXRzT3ZlcnZpZXcnLCAnSGFiaXRhdFNpemUnKS5mbG9hdCgnVE9UX0hBQlMnKVxuICAgIFxuICAgIHJhdGlvID0gKGNvYXN0bGluZV9sZW5ndGgvc2l6ZSkudG9GaXhlZCgxKVxuXG4gICAgI3NldHVwIGNvbm5lY3Rpdml0eSBkYXRhXG4gICAgaWYgaXNDb2xsZWN0aW9uXG4gICAgICBnb29kX2NvbG9yID0gXCIjYjNjZmE3XCJcbiAgICAgIGJhZF9jb2xvciA9IFwiI2U1Y2FjZVwiXG4gICAgICBpZiBudW1Ta2V0Y2hlcyA+IDFcbiAgICAgICAgdHJ5XG4gICAgICAgICAgY29ubmVjdGVkX21wYV9jb3VudCA9IEByZWNvcmRTZXQoJ1Byb3Bvc2FsQ29ubmVjdGl2aXR5JywgJ0Nvbm4nKS5mbG9hdCgnTlVNQkVSJylcbiAgICAgICAgICBwbHVyYWxfY29ubmVjdGVkX21wYV9jb3VudCA9IHRydWVcblxuICAgICAgICAgIG1pbl9kaXN0YW5jZSA9IEByZWNvcmRTZXQoJ1Byb3Bvc2FsQ29ubmVjdGl2aXR5JywgJ0Nvbm4nKS5mbG9hdCgnTUlOJylcbiAgICAgICAgICBtYXhfZGlzdGFuY2UgPSBAcmVjb3JkU2V0KCdQcm9wb3NhbENvbm5lY3Rpdml0eScsICdDb25uJykuZmxvYXQoJ01BWCcpXG4gICAgICAgICAgbWVhbl9kaXN0YW5jZSA9IEByZWNvcmRTZXQoJ1Byb3Bvc2FsQ29ubmVjdGl2aXR5JywgJ0Nvbm4nKS5mbG9hdCgnTUVBTicpXG4gICAgICAgICAgY29ubl9waWVfdmFsdWVzID0gQGJ1aWxkX3ZhbHVlcyhcIk1QQXMgV2l0aGluIENvbm5lY3Rpdml0eSBSYW5nZVwiLCBjb25uZWN0ZWRfbXBhX2NvdW50LGdvb2RfY29sb3IsIFwiTVBBcyBPdXRzaWRlIENvbm5lY3Rpdml0eSBSYW5nZVwiLCBcbiAgICAgICAgICAgIHRvdGFsX21wYV9jb3VudC1jb25uZWN0ZWRfbXBhX2NvdW50LCBiYWRfY29sb3IpXG4gICAgICAgIGNhdGNoIEVycm9yXG4gICAgICAgICAgY29uc29sZS5sb2coXCJlcnJvciByZWFkaW5nIGNvbm5lY3Rpdml0eS4uLlwiKVxuICAgICAgICAgIFxuICAgICAgbm90X3JlcHJlc2VudGVkID0gVE9UQUxfSEFCUyAtIG51bV9yZXByZXNlbnRlZF9oYWJzXG4gICAgICByZXByZXNlbnRlZF9oYWJzX3BpZV92YWx1ZXMgPSBAYnVpbGRfdmFsdWVzKFwiSGFiaXRhdC10eXBlcyBSZXByZXNlbnRlZFwiLCBudW1fcmVwcmVzZW50ZWRfaGFicywgZ29vZF9jb2xvciwgXCJIYWJpdGF0LXR5cGVzIE5vdCBSZXByZXNlbnRlZFwiLFxuICAgICAgICBub3RfcmVwcmVzZW50ZWQsIGJhZF9jb2xvcilcblxuICAgICAgbm90X3JlcGxpY2F0ZWQgPSBUT1RBTF9IQUJTIC0gbnVtX3JlcGxpY2F0ZWRfaGFic1xuICAgICAgcmVwbGljYXRlZF9oYWJzX3BpZV92YWx1ZXMgPSBAYnVpbGRfdmFsdWVzKFwiSGFiaXRhdC10eXBlcyBSZXBsaWNhdGVkXCIsIG51bV9yZXBsaWNhdGVkX2hhYnMsIGdvb2RfY29sb3IsIFwiSGFiaXRhdC10eXBlcyBOb3QgUmVwbGljYXRlZFwiLFxuICAgICAgICBub3RfcmVwbGljYXRlZCwgYmFkX2NvbG9yKVxuXG4gICAgI3Nob3cgdGFibGVzIGluc3RlYWQgb2YgZ3JhcGggZm9yIElFXG4gICAgaWYgd2luZG93LmQzXG4gICAgICBkM0lzUHJlc2VudCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBkM0lzUHJlc2VudCA9IGZhbHNlXG5cbiAgICBcbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgIFxuICAgIGNvbnRleHQgPVxuICAgICAgZDNJc1ByZXNlbnQ6IGQzSXNQcmVzZW50XG4gICAgICBza2V0Y2g6IEBtb2RlbC5mb3JUZW1wbGF0ZSgpXG4gICAgICBza2V0Y2hDbGFzczogQHNrZXRjaENsYXNzLmZvclRlbXBsYXRlKClcbiAgICAgIGF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICAgIGFueUF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKCkubGVuZ3RoID4gMFxuICAgICAgYWRtaW46IEBwcm9qZWN0LmlzQWRtaW4gd2luZG93LnVzZXJcbiAgICAgIHNpemU6IG5ld19zaXplXG4gICAgICBjb2FzdGxpbmVfbGVuZ3RoOiBjb2FzdGxpbmVfbGVuZ3RoXG4gICAgICBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQ6Y29hc3RsaW5lX2xlbmd0aF9wZXJjZW50XG4gICAgICBuZXdfaGFiczogbmV3X2hhYnNcbiAgICAgIHRvdGFsX2hhYnM6IHRvdGFsX2hhYnNcbiAgICAgIHJhdGlvOiByYXRpb1xuICAgICAgcGVyY2VudDogcGVyY2VudFxuICAgICAgaXNDb2xsZWN0aW9uOiBpc0NvbGxlY3Rpb25cbiAgICAgIG51bVNrZXRjaGVzOiBudW1Ta2V0Y2hlc1xuICAgICAgcGx1cmFsU2tldGNoZXM6IHBsdXJhbFNrZXRjaGVzXG4gICAgICBwcm9wX3NpemVzOiBwcm9wX3NpemVzXG4gICAgICB0b3RhbF9tcGFfY291bnQ6IHRvdGFsX21wYV9jb3VudFxuICAgICAgbXBhX2NvdW50OiBtcGFfY291bnRcbiAgICAgIG1wYV9hdmdfc2l6ZV9ndWlkZWxpbmU6bXBhX2F2Z19zaXplX2d1aWRlbGluZVxuICAgICAgcGx1cmFsX21wYV9jb3VudDogcGx1cmFsX21wYV9jb3VudFxuICAgICAgY29ubmVjdGVkX21wYV9jb3VudDogY29ubmVjdGVkX21wYV9jb3VudFxuXG4gICAgICBwbHVyYWxfY29ubmVjdGVkX21wYV9jb3VudDogcGx1cmFsX2Nvbm5lY3RlZF9tcGFfY291bnRcbiAgICAgIG1pbl9kaXN0YW5jZTogbWluX2Rpc3RhbmNlXG4gICAgICBtYXhfZGlzdGFuY2U6IG1heF9kaXN0YW5jZVxuICAgICAgbWVhbl9kaXN0YW5jZTogbWVhbl9kaXN0YW5jZVxuICAgICAgc2luZ2xlU2tldGNoOiBudW1Ta2V0Y2hlcyA9PSAxXG4gICAgICBpc01QQTogaXNNUEFcbiAgICAgIG51bV9oYWJzOiBudW1faGFic1xuICAgICAgdG90YWxfaGFiczogVE9UQUxfSEFCU1xuICAgICAgbnVtX3JlcHJlc2VudGVkX2hhYnM6IG51bV9yZXByZXNlbnRlZF9oYWJzXG4gICAgICBudW1fcmVwbGljYXRlZF9oYWJzOiBudW1fcmVwbGljYXRlZF9oYWJzXG4gICAgICBpc0dlbmVyaWM6IGlzR2VuZXJpY1xuICAgICAgaXNNUEE6IGlzTVBBXG4gICAgICBudW1fcmVzZXJ2ZXM6IG51bV9yZXNlcnZlc1xuICAgICAgbnVtX3R5cGUyOiBudW1fdHlwZTJcblxuICAgIEAkZWwuaHRtbCBAdGVtcGxhdGUucmVuZGVyKGNvbnRleHQsIHBhcnRpYWxzKVxuICAgIEBlbmFibGVMYXllclRvZ2dsZXJzKClcblxuICAgICNzaXplX3BpZV92YWx1ZXMgPSBAYnVpbGRfdmFsdWVzKFwiTWVldHMgTWluLiBTaXplXCIsIG1wYV9jb3VudCxcIiNiM2NmYTdcIiwgXCJEb2VzIG5vdCBNZWV0IFNpemUgTWluLlwiLCBcbiAgICAjICB0b3RhbF9tcGFfY291bnQtbXBhX2NvdW50LCBcIiNlNWNhY2VcIilcblxuICAgIEBkcmF3UGllKHJlcHJlc2VudGVkX2hhYnNfcGllX3ZhbHVlcywgXCIjcmVwcmVzZW50ZWRfaGFic19waWVcIilcbiAgICBAZHJhd1BpZShyZXBsaWNhdGVkX2hhYnNfcGllX3ZhbHVlcywgXCIjcmVwbGljYXRlZF9oYWJzX3BpZVwiKVxuICAgIEBkcmF3UGllKGNvbm5fcGllX3ZhbHVlcywgXCIjY29ubmVjdGl2aXR5X3BpZVwiKVxuICBcblxuICBidWlsZF92YWx1ZXM6ICh5ZXNfbGFiZWwsIHllc19jb3VudCwgeWVzX2NvbG9yLCBub19sYWJlbCwgbm9fY291bnQsIG5vX2NvbG9yKSA9PlxuICAgIHllc192YWwgPSB7XCJsYWJlbFwiOnllc19sYWJlbCtcIiAoXCIreWVzX2NvdW50K1wiKVwiLCBcInZhbHVlXCI6eWVzX2NvdW50LCBcImNvbG9yXCI6eWVzX2NvbG9yLCBcInl2YWxcIjoyNX1cbiAgICBub192YWwgPSB7XCJsYWJlbFwiOm5vX2xhYmVsK1wiIChcIitub19jb3VudCtcIilcIiwgXCJ2YWx1ZVwiOm5vX2NvdW50LCBcImNvbG9yXCI6bm9fY29sb3IsIFwieXZhbFwiOjUwfVxuXG4gICAgcmV0dXJuIFt5ZXNfdmFsLCBub192YWxdXG5cbiAgZ2V0TnVtSGFiczogKGF0dHJfbmFtZSwgaGFiaXRhdHMpID0+XG4gICAgaWYgaGFiaXRhdHM/Lmxlbmd0aCA9PSAwXG4gICAgICByZXR1cm4gMFxuXG4gICAgY291bnQgPSAwXG4gICAgZm9yIGhhYiBpbiBoYWJpdGF0c1xuICAgICAgaWYgaGFiW2F0dHJfbmFtZV0gPT0gXCJZZXNcIlxuICAgICAgICBjb3VudCs9MVxuICAgIHJldHVybiBjb3VudFxuXG4gIGdldFJlc2VydmVWYWx1ZXM6IChyZXNlcnZlcykgPT5cbiAgICBudW1fcmVzZXJ2ZXMgPSAwXG4gICAgbnVtX3R5cGUyID0gMFxuICAgIHRyeVxuICAgICAgZm9yIHJlcyBpbiByZXNlcnZlc1xuICAgICAgICBhdHRycyA9IHJlcy5nZXRBdHRyaWJ1dGVzKClcbiAgICAgICAgZm9yIGF0dCBpbiBhdHRyc1xuICAgICAgICAgIGlmIGF0dC5leHBvcnRpZCA9PSBcIk1BTkFHRU1FTlRcIlxuICAgICAgICAgICAgaWYgYXR0LnZhbHVlWzBdID09IFwiVHlwZTJcIlxuICAgICAgICAgICAgICBudW1fdHlwZTIrPTFcbiAgICAgICAgICAgIGVsc2UgaWYgYXR0LnZhbHVlWzBdID09IFwiTVJcIlxuICAgICAgICAgICAgICBudW1fcmVzZXJ2ZXMrPTFcbiAgICBjYXRjaCBFcnJvclxuICAgICAgY29uc29sZS5sb2coJ3JhbiBpbnRvIHByb2JsZW0gZ2V0dGluZyBtcGEgdHlwZXMnKVxuXG4gICAgcmV0dXJuIFtudW1fcmVzZXJ2ZXMsIG51bV90eXBlMl1cblxuICBnZXREYXRhVmFsdWU6IChkYXRhKSA9PlxuICAgIHJldHVybiBkYXRhLnZhbHVlXG5cbiAgZHJhd1BpZTogKGRhdGEsIHBpZV9uYW1lKSA9PlxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgdyA9IDkwXG4gICAgICBoID0gNzVcbiAgICAgIHIgPSAyNVxuICAgICBcbiAgICAgIHZpcyA9IGQzLnNlbGVjdChwaWVfbmFtZSkuYXBwZW5kKFwic3ZnOnN2Z1wiKS5kYXRhKFtkYXRhXSkuYXR0cihcIndpZHRoXCIsIHcpLmF0dHIoXCJoZWlnaHRcIiwgaCkuYXBwZW5kKFwic3ZnOmdcIikuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIChyKjIpICsgXCIsXCIgKyAocis1KSArIFwiKVwiKVxuICAgICAgcGllID0gZDMubGF5b3V0LnBpZSgpLnZhbHVlKChkKSAtPiByZXR1cm4gZC52YWx1ZSlcblxuICAgICAgI2RlY2xhcmUgYW4gYXJjIGdlbmVyYXRvciBmdW5jdGlvblxuICAgICAgYXJjID0gZDMuc3ZnLmFyYygpLm91dGVyUmFkaXVzKHIpXG5cbiAgICAgICNzZWxlY3QgcGF0aHMsIHVzZSBhcmMgZ2VuZXJhdG9yIHRvIGRyYXdcbiAgICAgIGFyY3MgPSB2aXMuc2VsZWN0QWxsKFwiZy5zbGljZVwiKS5kYXRhKHBpZSkuZW50ZXIoKS5hcHBlbmQoXCJzdmc6Z1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJzbGljZVwiKVxuICAgICAgYXJjcy5hcHBlbmQoXCJzdmc6cGF0aFwiKVxuICAgICAgICAuYXR0cihcImZpbGxcIiwgKGQpIC0+IHJldHVybiBkLmRhdGEuY29sb3IpXG4gICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIChkKSAtPiByZXR1cm4gaWYgZC5kYXRhLnZhbHVlID09IDAgdGhlbiBcIm5vbmVcIiBlbHNlIFwiIzU0NTQ1NFwiKVxuICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCAwLjI1KVxuICAgICAgICAuYXR0cihcImRcIiwgKGQpIC0+ICBcbiAgICAgICAgICBhcmMoZClcbiAgICAgICAgKVxuXG5cbiAgICAgIGVsID0gQCQocGllX25hbWUrXCJfbGVnZW5kXCIpWzBdXG4gICAgICBjaGFydCA9IGQzLnNlbGVjdChlbClcbiAgICAgIGxlZ2VuZHMgPSBjaGFydC5zZWxlY3RBbGwocGllX25hbWUrXCJfbGVnZW5kXCIpXG4gICAgICAgIC5kYXRhKGRhdGEpXG4gICAgICAuZW50ZXIoKS5pbnNlcnQoXCJkaXZcIilcbiAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwibGVnZW5kLXJvd1wiKVxuXG4gICAgICBsZWdlbmRzLmFwcGVuZChcInNwYW5cIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInBpZS1sYWJlbC1zd2F0Y2hcIilcbiAgICAgICAgLnN0eWxlKCdiYWNrZ3JvdW5kLWNvbG9yJywgKGQsaSkgLT4gZC5jb2xvcilcbiAgICAgIFxuICAgICAgbGVnZW5kcy5hcHBlbmQoXCJzcGFuXCIpXG4gICAgICAgIC50ZXh0KChkLGkpIC0+IHJldHVybiBkYXRhW2ldLmxhYmVsKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwicGllLWxhYmVsXCIpXG5cbiAgICAgIFxuXG4gIGdldFRvdGFsQXJlYVBlcmNlbnQ6IChwcm9wX3NpemVzKSA9PlxuXG4gICAgZm9yIHBzIGluIHByb3Bfc2l6ZXNcbiAgICAgIGlmIHBzLk5BTUUgPT0gXCJQZXJjZW50IG9mIFRvdGFsIEFyZWFcIlxuICAgICAgICByZXR1cm4gcHMuU0laRV9TUUtNXG4gICAgcmV0dXJuIDAuMFxuXG4gIGdldEF2ZXJhZ2VNaW5EaW06IChwcm9wX3NpemVzKSA9PlxuICAgIGZvciBwcyBpbiBwcm9wX3NpemVzXG4gICAgICBpZiBwcy5OQU1FID09IFwiQXZlcmFnZVwiXG4gICAgICAgIHJldHVybiBwcy5NSU5fRElNXG5cbiAgY2xlYW51cERhdGE6IChwcm9wX3NpemVzLCBpc0NvbGxlY3Rpb24pID0+XG4gICAgY2xlYW5lZF9wcm9wcyA9IFtdXG4gICAgbnVtX3NrZXRjaGVzID0gcHJvcF9zaXplcz8ubGVuZ3RoXG4gICAgZm9yIHBzIGluIHByb3Bfc2l6ZXNcbiAgICAgIGlmIHBzLk5BTUUgIT0gXCJQZXJjZW50IG9mIFRvdGFsIEFyZWFcIlxuICAgICAgICBwcy5NSU5fRElNID0gcGFyc2VGbG9hdChwcy5NSU5fRElNKS50b0ZpeGVkKDEpXG4gICAgICAgIHBzLlNJWkVfU1FLTSA9IHBhcnNlRmxvYXQocHMuU0laRV9TUUtNKS50b0ZpeGVkKDEpXG4gICAgICAgIGlmIHBzLlNJWkVfU1FLTSA8IDAuMVxuICAgICAgICAgIHBzLlNJWkVfU1FLTSA9IFwiPCAwLjFcIlxuICAgICAgICBwcy5DT0FTVCA9IE51bWJlcihwcy5DT0FTVCkudG9GaXhlZCgxKVxuICAgICAgICBpZiBwcy5DT0FTVCA9PSAwIFxuICAgICAgICAgIHBzLkNPQVNUID0gXCItLVwiXG4gICAgICAgICNkb24ndCBpbmNsdWRlIGF2ZXJhZ2UgZm9yIHNpbmdlIHNrZXRjaFxuICAgICAgICBpZiBudW1fc2tldGNoZXMgPT0gMyBcbiAgICAgICAgICBpZiBwcy5OQU1FICE9IFwiQXZlcmFnZVwiXG4gICAgICAgICAgICBjbGVhbmVkX3Byb3BzLnB1c2gocHMpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjbGVhbmVkX3Byb3BzLnB1c2gocHMpXG5cbiAgICByZXR1cm4gY2xlYW5lZF9wcm9wc1xuXG4gIGdldE1pbkRpbUNvdW50OiAocHJvcF9zaXplcykgPT5cbiAgICBudW1fbWVldF9jcml0ZXJpYSA9IDBcbiAgICB0b3RhbF9taW5fc2l6ZSA9IDBcblxuICAgIGZvciBwcyBpbiBwcm9wX3NpemVzXG4gICAgICBpZiBwcy5OQU1FICE9IFwiQXZlcmFnZVwiICYmIHBzLk1JTl9ESU0gPiA1IFxuICAgICAgICBudW1fbWVldF9jcml0ZXJpYSs9MVxuXG4gICAgcmV0dXJuIG51bV9tZWV0X2NyaXRlcmlhXG5cbiAgYWRkQ29tbWFzOiAobnVtX3N0cikgPT5cbiAgICBudW1fc3RyICs9ICcnXG4gICAgeCA9IG51bV9zdHIuc3BsaXQoJy4nKVxuICAgIHgxID0geFswXVxuICAgIHgyID0gaWYgeC5sZW5ndGggPiAxIHRoZW4gJy4nICsgeFsxXSBlbHNlICcnXG4gICAgcmd4ID0gLyhcXGQrKShcXGR7M30pL1xuICAgIHdoaWxlIHJneC50ZXN0KHgxKVxuICAgICAgeDEgPSB4MS5yZXBsYWNlKHJneCwgJyQxJyArICcsJyArICckMicpXG4gICAgcmV0dXJuIHgxICsgeDJcblxubW9kdWxlLmV4cG9ydHMgPSBPdmVydmlld1RhYiIsIk92ZXJ2aWV3VGFiID0gcmVxdWlyZSAnLi9vdmVydmlldy5jb2ZmZWUnXG5Vc2VzVGFiID0gcmVxdWlyZSAnLi91c2VzLmNvZmZlZSdcbkVudmlyb25tZW50VGFiID0gcmVxdWlyZSAnLi9lbnZpcm9ubWVudC5jb2ZmZWUnXG5GaXNoaW5nVGFiID0gcmVxdWlyZSAnLi9maXNoaW5nLmNvZmZlZSdcblxud2luZG93LmFwcC5yZWdpc3RlclJlcG9ydCAocmVwb3J0KSAtPlxuICByZXBvcnQudGFicyBbT3ZlcnZpZXdUYWIsIEVudmlyb25tZW50VGFiLCBGaXNoaW5nVGFiLFVzZXNUYWJdXG4gICMgcGF0aCBtdXN0IGJlIHJlbGF0aXZlIHRvIGRpc3QvXG4gIHJlcG9ydC5zdHlsZXNoZWV0cyBbJy4vcmVwb3J0LmNzcyddXG4iLCJSZXBvcnRUYWIgPSByZXF1aXJlICdyZXBvcnRUYWInXG50ZW1wbGF0ZXMgPSByZXF1aXJlICcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5fcGFydGlhbHMgPSByZXF1aXJlICcuLi9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxucGFydGlhbHMgPSBbXVxuZm9yIGtleSwgdmFsIG9mIF9wYXJ0aWFsc1xuICBwYXJ0aWFsc1trZXkucmVwbGFjZSgnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpLycsICcnKV0gPSB2YWxcblxuaWRzID0gcmVxdWlyZSAnLi9pZHMuY29mZmVlJ1xuZm9yIGtleSwgdmFsdWUgb2YgaWRzXG4gIHdpbmRvd1trZXldID0gdmFsdWVcblxuXG5jbGFzcyBVc2VzVGFiIGV4dGVuZHMgUmVwb3J0VGFiXG4gICMgdGhpcyBpcyB0aGUgbmFtZSB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBUYWJcbiAgbmFtZTogJ090aGVyJ1xuICBjbGFzc05hbWU6ICd1c2VzJ1xuICB0aW1lb3V0OiAxMjAwMDBcbiAgdGVtcGxhdGU6IHRlbXBsYXRlcy51c2VzXG4gIGRlcGVuZGVuY2llczogW1xuICAgICdPdmVybGFwV2l0aFJlY3JlYXRpb25hbFVzZXMnXG4gICAgJ1NwZWNpZXNJbmZvcm1hdGlvbidcbiAgXVxuXG5cbiAgcmVuZGVyOiAoKSAtPlxuXG4gICAgI3Nob3cgdGFibGVzIGluc3RlYWQgb2YgZ3JhcGggZm9yIElFXG4gICAgaWYgd2luZG93LmQzXG4gICAgICBkM0lzUHJlc2VudCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBkM0lzUHJlc2VudCA9IGZhbHNlXG5cbiAgICAjc3BlY2llcyBpbmZvXG4gICAgdHJ5XG4gICAgICBzZWFiaXJkcyA9IEByZWNvcmRTZXQoJ1NwZWNpZXNJbmZvcm1hdGlvbicsICdTZWFiaXJkcycpLnRvQXJyYXkoKVxuICAgICAgaGFzU2VhYmlyZEFyZWFzID0gc2VhYmlyZHM/Lmxlbmd0aCA+IDBcbiAgICBjYXRjaCBFcnJvclxuICAgICAgaGFzU2VhYmlyZEFyZWFzID0gZmFsc2VcblxuICAgIHRyeVxuICAgICAgc2VhYmlyZF9jb2xvbmllcyA9IEByZWNvcmRTZXQoJ1NwZWNpZXNJbmZvcm1hdGlvbicsICdTZWFiaXJkQ29sb25pZXMnKS50b0FycmF5KClcbiAgICAgIGhhc1NlYWJpcmRDb2xvbmllcyA9IHNlYWJpcmRfY29sb25pZXM/Lmxlbmd0aCA+IDBcbiAgICBjYXRjaCBFcnJvclxuICAgICAgaGFzU2VhYmlyZENvbG9uaWVzID0gZmFsc2VcblxuICAgIFxuICAgIGhhc1NlYWJpcmRzID0gKHNlYWJpcmRzPy5sZW5ndGg+IDAgb3Igc2VhYmlyZF9jb2xvbmllcz8ubGVuZ3RoID4gMClcbiAgICBtYW1tYWxzID0gQHJlY29yZFNldCgnU3BlY2llc0luZm9ybWF0aW9uJywgJ01hbW1hbHMnKS50b0FycmF5KClcbiAgICBoYXNNYW1tYWxzID0gbWFtbWFscz8ubGVuZ3RoID4gMFxuICAgIHRyeVxuICAgICAgc2VhbHMgPSBAcmVjb3JkU2V0KCdTcGVjaWVzSW5mb3JtYXRpb24nLCAnU2VhbHMnKS50b0FycmF5KClcbiAgICAgIGhhc1NlYWxzID0gc2VhbHM/Lmxlbmd0aCA+IDBcbiAgICBjYXRjaCBFcnJvclxuICAgICAgaGFzU2VhbHMgPSBmYWxzZVxuXG4gICAgXG4gICAgcmVlZl9maXNoID0gQHJlY29yZFNldCgnU3BlY2llc0luZm9ybWF0aW9uJywgJ1JlZWZGaXNoJykudG9BcnJheSgpXG4gICAgaW5IaWdoRGl2ZXJzaXR5UmVlZkZpc2hBcmVhID0gcmVlZl9maXNoPy5sZW5ndGggPiAwXG5cbiAgICBzbWFybyA9IFwiU01BUk9cIlxuICAgIHJlY191c2VzID0gQHJlY29yZFNldCgnT3ZlcmxhcFdpdGhSZWNyZWF0aW9uYWxVc2VzJywgJ1JlY3JlYXRpb25hbFVzZScpLnRvQXJyYXkoKVxuICAgIGhhc1NtYXJvID0gZmFsc2VcblxuXG4gICAgbm9uX3NtYXJvX3JlY191c2VzID0gcmVjX3VzZXMuZmlsdGVyIChyZWMpIC0+IHJlYy5GRUFUX1RZUEUgIT0gc21hcm9cbiAgICBoYXNSZWNVc2VzID0gbm9uX3NtYXJvX3JlY191c2VzPy5sZW5ndGggPiAwXG4gICAgXG4gICAgaGVyaXRhZ2UgPSBAcmVjb3JkU2V0KCdPdmVybGFwV2l0aFJlY3JlYXRpb25hbFVzZXMnLCAnSGVyaXRhZ2UnKS50b0FycmF5KClcbiAgICBoYXNIZXJpdGFnZSA9IGhlcml0YWdlPy5sZW5ndGggPiAwXG4gICAgY29hc3RhbF9jb25zZW50cyA9IEByZWNvcmRTZXQoJ092ZXJsYXBXaXRoUmVjcmVhdGlvbmFsVXNlcycsICdDb2FzdGFsQ29uc2VudHMnKS50b0FycmF5KClcbiAgICBoYXNDb2FzdGFsID0gY29hc3RhbF9jb25zZW50cz8ubGVuZ3RoID4gMFxuICAgIGluZnJhc3RydWN0dXJlID0gIEByZWNvcmRTZXQoJ092ZXJsYXBXaXRoUmVjcmVhdGlvbmFsVXNlcycsICdJbmZyYXN0cnVjdHVyZScpLnRvQXJyYXkoKVxuICAgIGhhc0luZnJhc3RydWN0dXJlID0gaW5mcmFzdHJ1Y3R1cmU/Lmxlbmd0aCA+IDBcbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgIFxuICAgIGhhc1VzZXMgPSBoYXNSZWNVc2VzIG9yIGhhc0hlcml0YWdlIG9yIGhhc0luZnJhc3RydWN0dXJlIG9yIGhhc0NvYXN0YWxcbiAgICBoYXNNYXJpbmVTcGVjaWVzID0gaGFzTWFtbWFscyBvciBoYXNTZWFsc1xuXG4gICAgaXNDb2xsZWN0aW9uID0gQG1vZGVsLmlzQ29sbGVjdGlvbigpXG4gICAgY29udGV4dCA9XG4gICAgICBza2V0Y2g6IEBtb2RlbC5mb3JUZW1wbGF0ZSgpXG4gICAgICBza2V0Y2hDbGFzczogQHNrZXRjaENsYXNzLmZvclRlbXBsYXRlKClcbiAgICAgIGF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICAgIGFueUF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKCkubGVuZ3RoID4gMFxuICAgICAgYWRtaW46IEBwcm9qZWN0LmlzQWRtaW4gd2luZG93LnVzZXJcbiAgICAgIGQzSXNQcmVzZW50OiBkM0lzUHJlc2VudFxuICAgICAgcmVjX3VzZXM6IG5vbl9zbWFyb19yZWNfdXNlc1xuICAgICAgaGFzU21hcm86IGhhc1NtYXJvXG4gICAgICBoYXNSZWNVc2VzOiBoYXNSZWNVc2VzXG4gICAgICBoZXJpdGFnZTogaGVyaXRhZ2VcbiAgICAgIGhhc0hlcml0YWdlOiBoYXNIZXJpdGFnZVxuICAgICAgY29hc3RhbF9jb25zZW50czogY29hc3RhbF9jb25zZW50c1xuICAgICAgaGFzQ29hc3RhbDogaGFzQ29hc3RhbFxuICAgICAgaW5mcmFzdHJ1Y3R1cmU6IGluZnJhc3RydWN0dXJlXG4gICAgICBoYXNJbmZyYXN0cnVjdHVyZTogaGFzSW5mcmFzdHJ1Y3R1cmVcbiAgICAgIGhhc1VzZXM6IGhhc1VzZXNcbiAgICAgIGlzQ29sbGVjdGlvbjogaXNDb2xsZWN0aW9uXG5cbiAgICAgICNzcGVjaWVzIGluZm9cbiAgICAgIHNlYWJpcmRzOiBzZWFiaXJkc1xuICAgICAgc2VhYmlyZF9jb2xvbmllczogc2VhYmlyZF9jb2xvbmllc1xuICAgICAgaGFzU2VhYmlyZHM6IGhhc1NlYWJpcmRzXG4gICAgICBoYXNTZWFiaXJkQXJlYXM6IGhhc1NlYWJpcmRBcmVhc1xuICAgICAgaGFzU2VhYmlyZENvbG9uaWVzOiBoYXNTZWFiaXJkQ29sb25pZXNcbiAgICAgIFxuICAgICAgbWFtbWFsczogbWFtbWFsc1xuICAgICAgaGFzTWFtbWFsczogaGFzTWFtbWFsc1xuICAgICAgcmVlZl9maXNoOiByZWVmX2Zpc2hcbiAgICAgIHNlYWxzOiBzZWFsc1xuICAgICAgaGFzU2VhbHM6IGhhc1NlYWxzXG5cbiAgICAgIGluSGlnaERpdmVyc2l0eVJlZWZGaXNoQXJlYTogaW5IaWdoRGl2ZXJzaXR5UmVlZkZpc2hBcmVhXG4gICAgICBoYXNNYXJpbmVTcGVjaWVzOiBoYXNNYXJpbmVTcGVjaWVzXG5cbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcbiAgICBAZW5hYmxlTGF5ZXJUb2dnbGVycygpXG5cbiAgICBcblxubW9kdWxlLmV4cG9ydHMgPSBVc2VzVGFiIiwidGhpc1tcIlRlbXBsYXRlc1wiXSA9IHRoaXNbXCJUZW1wbGF0ZXNcIl0gfHwge307XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wiZGVtb1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5SZXBvcnQgU2VjdGlvbnM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHA+VXNlIHJlcG9ydCBzZWN0aW9ucyB0byBncm91cCBpbmZvcm1hdGlvbiBpbnRvIG1lYW5pbmdmdWwgY2F0ZWdvcmllczwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkQzIFZpc3VhbGl6YXRpb25zPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDx1bCBjbGFzcz1cXFwibmF2IG5hdi1waWxsc1xcXCIgaWQ9XFxcInRhYnMyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGxpIGNsYXNzPVxcXCJhY3RpdmVcXFwiPjxhIGhyZWY9XFxcIiNjaGFydFxcXCI+Q2hhcnQ8L2E+PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGxpPjxhIGhyZWY9XFxcIiNkYXRhVGFibGVcXFwiPlRhYmxlPC9hPjwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3VsPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGRpdiBjbGFzcz1cXFwidGFiLWNvbnRlbnRcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJ0YWItcGFuZSBhY3RpdmVcXFwiIGlkPVxcXCJjaGFydFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPCEtLVtpZiBJRSA4XT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwidW5zdXBwb3J0ZWRcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIFRoaXMgdmlzdWFsaXphdGlvbiBpcyBub3QgY29tcGF0aWJsZSB3aXRoIEludGVybmV0IEV4cGxvcmVyIDguIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIFBsZWFzZSB1cGdyYWRlIHlvdXIgYnJvd3Nlciwgb3IgdmlldyByZXN1bHRzIGluIHRoZSB0YWJsZSB0YWIuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPiAgICAgIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwhW2VuZGlmXS0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgU2VlIDxjb2RlPnNyYy9zY3JpcHRzL2RlbW8uY29mZmVlPC9jb2RlPiBmb3IgYW4gZXhhbXBsZSBvZiBob3cgdG8gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICB1c2UgZDMuanMgdG8gcmVuZGVyIHZpc3VhbGl6YXRpb25zLiBQcm92aWRlIGEgdGFibGUtYmFzZWQgdmlld1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgYW5kIHVzZSBjb25kaXRpb25hbCBjb21tZW50cyB0byBwcm92aWRlIGEgZmFsbGJhY2sgZm9yIElFOCB1c2Vycy5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxicj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxhIGhyZWY9XFxcImh0dHA6Ly90d2l0dGVyLmdpdGh1Yi5pby9ib290c3RyYXAvMi4zLjIvXFxcIj5Cb290c3RyYXAgMi54PC9hPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgaXMgbG9hZGVkIHdpdGhpbiBTZWFTa2V0Y2ggc28geW91IGNhbiB1c2UgaXQgdG8gY3JlYXRlIHRhYnMgYW5kIG90aGVyIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgaW50ZXJmYWNlIGNvbXBvbmVudHMuIGpRdWVyeSBhbmQgdW5kZXJzY29yZSBhcmUgYWxzbyBhdmFpbGFibGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwidGFiLXBhbmVcXFwiIGlkPVxcXCJkYXRhVGFibGVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD5pbmRleDwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPnZhbHVlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImNoYXJ0RGF0YVwiLGMscCwxKSxjLHAsMCwxMzUxLDE0MTgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8dHI+PHRkPlwiKTtfLmIoXy52KF8uZihcImluZGV4XCIsYyxwLDApKSk7Xy5iKFwiPC90ZD48dGQ+XCIpO18uYihfLnYoXy5mKFwidmFsdWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPjwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gZW1waGFzaXNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkVtcGhhc2lzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwPkdpdmUgcmVwb3J0IHNlY3Rpb25zIGFuIDxjb2RlPmVtcGhhc2lzPC9jb2RlPiBjbGFzcyB0byBoaWdobGlnaHQgaW1wb3J0YW50IGluZm9ybWF0aW9uLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gd2FybmluZ1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+V2FybmluZzwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cD5PciA8Y29kZT53YXJuPC9jb2RlPiBvZiBwb3RlbnRpYWwgcHJvYmxlbXMuPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBkYW5nZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkRhbmdlcjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cD48Y29kZT5kYW5nZXI8L2NvZGU+IGNhbiBhbHNvIGJlIHVzZWQuLi4gc3BhcmluZ2x5LjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wiZW52aXJvbm1lbnRcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7aWYoXy5zKF8uZChcInNrZXRjaENsYXNzLmRlbGV0ZWRcIixjLHAsMSksYyxwLDAsMjQsMjcwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJhbGVydCBhbGVydC13YXJuXFxcIiBzdHlsZT1cXFwibWFyZ2luLWJvdHRvbToxMHB4O1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBUaGlzIHNrZXRjaCB3YXMgY3JlYXRlZCB1c2luZyB0aGUgXFxcIlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCJcXFwiIHRlbXBsYXRlLCB3aGljaCBpc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgbm8gbG9uZ2VyIGF2YWlsYWJsZS4gWW91IHdpbGwgbm90IGJlIGFibGUgdG8gY29weSB0aGlzIHNrZXRjaCBvciBtYWtlIG5ld1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgc2tldGNoZXMgb2YgdGhpcyB0eXBlLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5IYWJpdGF0cyBQcmVzZW50IGluIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDM4MiwzOTIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJTa2V0Y2hcIik7fTtfLmIoXCIgPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTUzNmRiYjQ4YzViNDNlYjBmYWNiYzVhXFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5zaG93IGxheWVyPC9hPjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgQXJlYSAoJSkgcmVmZXJzIHRvIHRoZSBwZXJjZW50YWdlIG9mIHRoZSBoYWJpdGF0IGNvbnRhaW5lZCB3aXRoaW4gdGhlIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgXCIpO2lmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsNjY2LDY3NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIm5ldHdvcmtcIik7fTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgXCIpO2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic2tldGNoXCIpO307Xy5iKFwiIGFzIGEgcHJvcG9ydGlvbiBvZiB0aGUgdG90YWwgYXJlYSBvZiBoYWJpdGF0IHdpdGhpbiB0aGUgU291dGgtRWFzdCBNYXJpbmUgcmVnaW9uLiBcIik7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDg2Nyw5NjYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIk9ubHkgaGFiaXRhdHMgdGhhdCBtZWV0IGNyaXRlcmlhIGZvciBhIHZpYWJsZSBoYWJpdGF0IHNpemUgYXJlIGluY2x1ZGVkIGFzIGEg4oCYcmVwcmVzZW50ZWTigJkgaGFiaXRhdC5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2k+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHAgY2xhc3M9XFxcImluLXJlcG9ydC1oZWFkZXJcXFwiPkhhYml0YXQgdHlwZXM8L3A+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwwLDEwNjksMTgyNyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjIwXFxcIiBjbGFzcz1cXFwiaGFiX3RhYmxlXFxcIj4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGggY2xhc3M9XFxcInNvcnRpbmdfY29sXFxcIiBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj48YSBjbGFzcz1cXFwiaGFiX3R5cGUgc29ydF91cFxcXCIgaHJlZj1cXFwiI1xcXCI+SGFiaXRhdDwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPjxhICBjbGFzcz1cXFwiaGFiX25ld19hcmVhIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCIgPkFyZWEgKGttPHN1cD4yPC9zdXA+KTwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJoYWJfbmV3X3BlcmMgc29ydF9kb3duXFxcIiBocmVmPVxcXCIjXFxcIj5BcmVhICglKTwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCwxNDY3LDE3MTMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJoYWJfcmVwcmVzZW50IHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCIgPlJlcHJlc2VudGVkPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDE1ODEsMTY4MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJoYWJfcmVwbGljYXRlIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCIgPlJlcGxpY2F0ZWQ8L3RoPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICA8dGJvZHkgY2xhc3M9XFxcImhhYl92YWx1ZXNcXFwiPjwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MTgwcHg7XFxcIj5IYWJpdGF0PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5BcmVhIChrbTxzdXA+Mjwvc3VwPik8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPkFyZWEgKCUpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsMjA4OCwyMjQ0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0aD5SZXByZXNlbnRlZDwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwyMTU3LDIyMTIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICAgIDx0aD5SZXBsaWNhdGVkPC90aD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzSGFiVHlwZXNcIixjLHAsMSksYyxwLDAsMjMzOCwyNzI2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZihfLnMoXy5mKFwiaGFiX3R5cGVzXCIsYyxwLDEpLGMscCwwLDIzNjcsMjY5OSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJIQUJfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJTSVpFX1NRS01cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiUEVSQ1wiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDI1MjQsMjY1NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlJFUFJFU0VOVFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMjYwMSwyNjIwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8dGQ+XCIpO18uYihfLnYoXy5mKFwiUkVQTElDXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzSGFiVHlwZXNcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkIGNvbHNwYW49XFxcIlwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDI4MzcsMjgzOCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiNVwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIjRcIik7fTtfLmIoXCJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDxpPlRoZXJlIGFyZSBubyBoYWJpdGF0IHR5cGVzLjwvaT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9O18uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgIDxwIGNsYXNzPVxcXCJpbi1yZXBvcnQtaGVhZGVyXFxcIj5IYWJpdGF0cyBvZiBTaWduaWZpY2FuY2U8L3A+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwwLDMxNTcsMzkwOSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIyMFxcXCIgY2xhc3M9XFxcInNpZ19oYWJfdGFibGVcXFwiPiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aCBjbGFzcz1cXFwic29ydGluZ19jb2xcXFwiIHN0eWxlPVxcXCJ3aWR0aDoyNTBweDtcXFwiPjxhIGNsYXNzPVxcXCJzaWdfaGFiX3R5cGUgc29ydF91cFxcXCIgaHJlZj1cXFwiI1xcXCI+SGFiaXRhdDwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD48YSAgY2xhc3M9XFxcInNpZ19oYWJfbmV3X2FyZWEgc29ydF9kb3duXFxcIiBocmVmPVxcXCIjXFxcIiA+QXJlYSAoa208c3VwPjI8L3N1cD4pPC9hPjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJzaWdfaGFiX25ld19wZXJjIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCI+QXJlYSAoJSk8L2E+PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsMzU1NywzODAxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0aD48YSBjbGFzcz1cXFwic2lnX2hhYl9yZXByZXNlbnQgc29ydF9kb3duXFxcIiBocmVmPVxcXCIjXFxcIj5SZXByZXNlbnRlZDwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzNjcyLDM3NzEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcInNpZ19oYWJfcmVwbGljYXRlIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCI+UmVwbGljYXRlZDwvdGg+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgIDx0Ym9keSBjbGFzcz1cXFwic2lnX2hhYl92YWx1ZXNcXFwiPjwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJkM0lzUHJlc2VudFwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoxODBweDtcXFwiPkhhYml0YXQ8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD5BcmVhIChrbTxzdXA+Mjwvc3VwPik8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD5BcmVhICglKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDQxNTQsNDI2NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRoPlJlcHJlc2VudGVkPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw0MjE3LDQyMzYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjx0aD5SZXBsaWNhdGVkPC90aD5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzU2lnSGFic1wiLGMscCwxKSxjLHAsMCw0MzQ5LDQ3MDUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJzaWdfaGFic1wiLGMscCwxKSxjLHAsMCw0MzczLDQ2ODMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJIQUJfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiU0laRV9TUUtNXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJQRVJDXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsNDUyMCw0NjQ0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlJFUFJFU0VOVFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDQ1OTMsNDYxMixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPHRkPlwiKTtfLmIoXy52KF8uZihcIlJFUExJQ1wiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJoYXNTaWdIYWJzXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZCBjb2xzcGFuPVxcXCJcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw0ODA0LDQ4MDUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjVcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCI0XCIpO307Xy5iKFwiXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPGk+VGhlcmUgYXJlIG5vIGhhYml0YXRzIG9mIHNpZ25pZmljYW5jZS48L2k+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCIgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2hvd0FkamFjZW50XCIsYyxwLDEpLGMscCwwLDUwNjEsNjUzOCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PkFkamFjZW50IFRlcnJlc3RyaWFsIEluZm9ybWF0aW9uPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwPjxlbT5NUEEgR3VpZGVsaW5lczogXFxcIkNvbnNpZGVyIGFkamFjZW50IHRlcnJlc3RyaWFsIGVudmlyb25tZW50XFxcIiAoYXJlYXMgc2hvd24gYmVsb3cgYXJlIHdpdGhpbiAxMDBtIG9mIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDUyODMsNTMwOSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiYSBza2V0Y2ggaW4gdGhlIGNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgdGhlIHNrZXRjaCBcIik7fTtfLmIoXCIpPC9lbT48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPjxzdHJvbmc+UHJvdGVjdGVkIEFyZWFzPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIyMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzUHJvdGVjdGVkXCIsYyxwLDEpLGMscCwwLDU1MjUsNTY4MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcInByb3RlY3RlZF9hcmVhc1wiLGMscCwxKSxjLHAsMCw1NTYwLDU2NDgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJoYXNQcm90ZWN0ZWRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPjxlbT5Ob25lIFByZXNlbnQ8L2VtPjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCIgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPjxzdHJvbmc+Q29uc2VydmF0aW9uIENvdmVuYW50czwvc3Ryb25nPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc0NvdmVuYW50c1wiLGMscCwxKSxjLHAsMCw2MDMwLDYzMjksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJxZTJfY292ZW5hbnRzXCIsYyxwLDEpLGMscCwwLDYwNjMsNjE1MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJOQU1FXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwibmFwYWxpc19jb3ZlbmFudHNcIixjLHAsMSksYyxwLDAsNjIwNiw2Mjk0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzQ292ZW5hbnRzXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD48ZW0+Tm9uZSBQcmVzZW50PC9lbT48L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wiZmlzaGluZ1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtpZihfLnMoXy5kKFwic2tldGNoQ2xhc3MuZGVsZXRlZFwiLGMscCwxKSxjLHAsMCwyNCwyNzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LXdhcm5cXFwiIHN0eWxlPVxcXCJtYXJnaW4tYm90dG9tOjEwcHg7XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFRoaXMgc2tldGNoIHdhcyBjcmVhdGVkIHVzaW5nIHRoZSBcXFwiXCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIlxcXCIgdGVtcGxhdGUsIHdoaWNoIGlzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBubyBsb25nZXIgYXZhaWxhYmxlLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byBjb3B5IHRoaXMgc2tldGNoIG9yIG1ha2UgbmV3XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBza2V0Y2hlcyBvZiB0aGlzIHR5cGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNBbnlGaXNoaW5nXCIsYyxwLDEpLGMscCwwLDMxNiwyNTYwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZihfLnMoXy5mKFwiaGFzRXhpc3RpbmdGaXNoaW5nXCIsYyxwLDEpLGMscCwwLDM0NCwxMzg0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGg0PkV4aXN0aW5nIEZpc2hlcmllcyBNYW5hZ2VtZW50PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHA+PGVtPlRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw0NzUsNDg1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJDb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiU2tldGNoXCIpO307Xy5iKFwiIGluY2x1ZGVzIHRoZSBmb2xsb3dpbmcgZXhpc3RpbmcgZmlzaGVyaWVzIHJlc3RyaWN0aW9ucy4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIEFsc28gc2hvd24gaXMgdGhlIGV4dGVudCB0aGF0IHRoZSBmaXNoZXJpZXMgcmVzdHJpY3Rpb25zIGFwcGx5IHRvIHRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw2OTcsNzA1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJza2V0Y2hlc1wiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBcIik7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgYXMgYSBwZXJjZW50YWdlIG9mIHRvdGFsIHNrZXRjaCBhcmVhLiBGb3IgZXhhbXBsZSwgMTAwJSBtZWFucyBubyBmaXNoaW5nIG9mIHRoYXQgdHlwZSBpcyBjdXJyZW50bHkgYWxsb3dlZCB3aXRoaW4gdGhlIHNrZXRjaC48L2VtPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjI1MHB4O1xcXCI+TmFtZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0aD5QZXJjZW50PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImV4aXN0aW5nX2Zpc2hpbmdfYXJlYXNcIixjLHAsMSksYyxwLDAsMTE2OSwxMzAxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkZFQVRfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJQRVJDX0FSRUFcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImhhc0N1c3RvbWFyeVwiLGMscCwxKSxjLHAsMCwxNDI5LDI1NDEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGg0PkN1c3RvbWFyeSBBcmVhczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc0V4aXN0aW5nQ3VzdG9tYXJ5XCIsYyxwLDEpLGMscCwwLDE1NDUsMTk5MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDxwPiBUaGUgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMTU4MSwxNTkxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic2tldGNoXCIpO307Xy5iKFwiIGluY2x1ZGVzIHRoZSBmb2xsb3dpbmcgPHN0cm9uZz5leGlzdGluZzwvc3Ryb25nPiBDdXN0b21hcnkgQXJlYXM6PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImV4aXN0aW5nX2N1c3RvbWFyeV9maXNoaW5nXCIsYyxwLDEpLGMscCwwLDE4MTksMTkxMixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJGRUFUX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaGFzUHJvcG9zZWRDdXN0b21hcnlcIixjLHAsMSksYyxwLDAsMjA1MSwyNDk4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgPHA+IFRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwyMDg3LDIwOTcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgaW5jbHVkZXMgdGhlIGZvbGxvd2luZyA8c3Ryb25nPnByb3Bvc2VkPC9zdHJvbmc+IEN1c3RvbWFyeSBBcmVhczo8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwicHJvcG9zZWRfY3VzdG9tYXJ5X2Zpc2hpbmdcIixjLHAsMSksYyxwLDAsMjMyNSwyNDE4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkZFQVRfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzQW55RmlzaGluZ1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5FeGlzdGluZyBvciBDdXN0b21hcnkgQXJlYXM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHA+Tm8gaW5mb3JtYXRpb24gb24gZXhpc3RpbmcgZmlzaGluZyBhcmVhcyBvciBjdXN0b21hcnkgdXNlIGlzIGF2YWlsYWJsZSBmb3IgdGhpcyBhcmVhLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCwyODI0LDQ3MDUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5GaXNoaW5nIEludGVuc2l0eTwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIFRoZSBmb2xsb3dpbmcgdGFibGVzIGNvbnRhaW5zIHRoZSBwZXJjZW50IG9mIHRoZSB0b3RhbCBTRU1QRiBsb3cgaW50ZW5zaXR5IGFuZCBoaWdoIGludGVuc2l0eSBmaXNoaW5nIHRoYXQgbWF5IGJlIGRpc3BsYWNlZCBieSB0aGUgc2tldGNoLiA8c3Ryb25nPkhpZ2ggaW50ZW5zaXR5PC9zdHJvbmc+IGlzIGdyZWF0ZXIgdGhhbiBhbiBhdmVyYWdlIG9mIDUgZXZlbnRzIHBlciBhbm51bSwgPHN0cm9uZz5Mb3c8L3N0cm9uZz4gaXMgNSBvciBsZXNzIGV2ZW50cyBwZXIgYW5udW0uXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJpbi1yZXBvcnQtaGVhZGVyXFxcIj5UcmF3bCBGaXNoaW5nIEludGVuc2l0eTwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD5Ta2V0Y2ggTmFtZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPiUgTG93IEludGVuc2l0eTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPiUgSGlnaCBJbnRlbnNpdHk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJ0cmF3bFwiLGMscCwxKSxjLHAsMCwzNTE5LDM2NTAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJMT1dcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJISUdIXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImluLXJlcG9ydC1oZWFkZXJcXFwiPlNldCBOZXQgRmlzaGluZyBJbnRlbnNpdHk8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5Ta2V0Y2ggTmFtZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+JSBMb3cgSW50ZW5zaXR5PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD4lIEhpZ2ggSW50ZW5zaXR5PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2V0bmV0XCIsYyxwLDEpLGMscCwwLDQwMTksNDE2MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkxPV1wiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiSElHSFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwiaW4tcmVwb3J0LWhlYWRlclxcXCI+TG9uZyBMaW5lIEZpc2hpbmcgSW50ZW5zaXR5PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPlNrZXRjaCBOYW1lPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+JSBMb3cgSW50ZW5zaXR5PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+JSBIaWdoIEludGVuc2l0eTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJsb25nbGluZVwiLGMscCwxKSxjLHAsMCw0NTE4LDQ2NDksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJMT1dcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJISUdIXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wib3ZlcnZpZXdcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7aWYoXy5zKF8uZChcInNrZXRjaENsYXNzLmRlbGV0ZWRcIixjLHAsMSksYyxwLDAsMjQsMjcwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJhbGVydCBhbGVydC13YXJuXFxcIiBzdHlsZT1cXFwibWFyZ2luLWJvdHRvbToxMHB4O1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBUaGlzIHNrZXRjaCB3YXMgY3JlYXRlZCB1c2luZyB0aGUgXFxcIlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCJcXFwiIHRlbXBsYXRlLCB3aGljaCBpc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgbm8gbG9uZ2VyIGF2YWlsYWJsZS4gWW91IHdpbGwgbm90IGJlIGFibGUgdG8gY29weSB0aGlzIHNrZXRjaCBvciBtYWtlIG5ld1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgc2tldGNoZXMgb2YgdGhpcyB0eXBlLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDMxMyw1NzUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCwzMjYsNTY0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBzaXplXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+TVBBIE5ldHdvcms8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBUaGlzIENvbGxlY3Rpb24gaGFzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibnVtX3Jlc2VydmVzXCIsYyxwLDApKSk7Xy5iKFwiIE1hcmluZSBSZXNlcnZlczwvc3Ryb25nPiBhbmQgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJudW1fdHlwZTJcIixjLHAsMCkpKTtfLmIoXCIgVHlwZS0yIE1QQTwvc3Ryb25nPi5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiYW55QXR0cmlidXRlc1wiLGMscCwxKSxjLHAsMCw2MTIsODk2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDQ+XCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKF8ucnAoXCJhdHRyaWJ1dGVzL2F0dHJpYnV0ZXNUYWJsZVwiLGMscCxcIiAgICBcIikpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNzM0LDg1NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgIDx0cj48dGQ+XCIpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw3NTcsNzcxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJOdW1iZXIgb2YgTVBBc1wiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDc5NSw4MTMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIk51bWJlciBvZiBTa2V0Y2hlc1wiKTt9KTtjLnBvcCgpO31fLmIoXCI8L3RkPlwiKTtfLmIoXy52KF8uZihcIm51bVNrZXRjaGVzXCIsYyxwLDApKSk7Xy5iKFwiPHRkPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDkzMywxMjIwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDk1NSwxMjAwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGg0Pk51bWJlciBvZiBTa2V0Y2hlcyBpbiBDb2xsZWN0aW9uPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgVGhpcyBjb2xsZWN0aW9uIGNvbnRhaW5zIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibnVtU2tldGNoZXNcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gc2tldGNoXCIpO2lmKF8ucyhfLmYoXCJwbHVyYWxTa2V0Y2hlc1wiLGMscCwxKSxjLHAsMCwxMTUxLDExNTMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImVzXCIpO30pO2MucG9wKCk7fV8uYihcIi5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsMTI0OCwzNTk2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDEyNzAsMzU3NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gc2l6ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGg0PkhhYml0YXRzIFJlcHJlc2VudGVkIGluIGEgZnVsbHkgUHJvdGVjdGVkIEFyZWFcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxhIGhyZWY9XFxcIiNcXFwiIGRhdGEtdG9nZ2xlLW5vZGU9XFxcIjUzYTBhMzFjZDNmNjA2NGQyYzE3NTgwY1xcXCIgZGF0YS12aXNpYmxlPVxcXCJmYWxzZVxcXCI+c2hvdyBsYXllcjwvYT48L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKCFfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICA8c3Ryb25nPk51bWJlciBvZiBIYWJpdGF0IENsYXNzZXM8L3N0cm9uZz48L2JyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIHN0eWxlPVxcXCJtYXJnaW4tdG9wOjBweDtcXFwiIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBUaGVyZSBhcmUgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJ0b3RhbF9oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IGhhYml0YXQgY2xhc3NlcyBpbiB0aGUgcGxhbm5pbmcgcmVnaW9uLCBhbmQgeW91ciBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxNzExLDE3MjEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgaW5jbHVkZXMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJuZXdfaGFic1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPi4gRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gdGhlIEhhYml0YXQgQ2xhc3NpZmljYXRpb24sIHNlZVwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgdGhlIDxhIGhyZWY9XFxcImh0dHA6Ly93d3cuZG9jLmdvdnQubnovRG9jdW1lbnRzL2NvbnNlcnZhdGlvbi9tYXJpbmUtYW5kLWNvYXN0YWwvbWFyaW5lLXByb3RlY3RlZC1hcmVhcy9tcGEtY2xhc3NpZmljYXRpb24tcHJvdGVjdGlvbi1zdGFuZGFyZC5wZGZcXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIE1hcmluZSBQcm90ZWN0ZWQgQXJlYXMgQ2xhc3NpZmljYXRpb24gYW5kIFByb3RlY3Rpb24gU3RhbmRhcmQ8L2E+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIik7fTtpZihfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDAsMjE4MywyMzg3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgIDxkaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInJlcHJlc2VudGVkX2hhYnNfcGllXFxcIiBpZD1cXFwicmVwcmVzZW50ZWRfaGFic19waWVcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXByZXNlbnRlZF9oYWJzX3BpZV9sZWdlbmRcXFwiIGlkPVxcXCJyZXByZXNlbnRlZF9oYWJzX3BpZV9sZWdlbmRcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gc2l6ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGg0PkhhYml0YXRzIFJlcHJlc2VudGVkIGluIGF0IExlYXN0IDIgUHJvdC4gQXJlYXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxhIGhyZWY9XFxcIiNcXFwiIGRhdGEtdG9nZ2xlLW5vZGU9XFxcIjUzYTBhMzFjZDNmNjA2NGQyYzE3NTgwY1xcXCIgZGF0YS12aXNpYmxlPVxcXCJmYWxzZVxcXCI+c2hvdyBsYXllcjwvYT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKCFfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgIDxzdHJvbmc+TnVtYmVyIG9mIEhhYml0YXQgQ2xhc3Nlczwvc3Ryb25nPjwvYnI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cCBzdHlsZT1cXFwibWFyZ2luLXRvcDowcHg7XFxcIiBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBUaGVyZSBhcmUgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJ0b3RhbF9oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IGhhYml0YXQgY2xhc3NlcyBpbiB0aGUgcGxhbm5pbmcgcmVnaW9uLCBhbmQgeW91ciBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwyODc0LDI4ODQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBpbmNsdWRlcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm5ld19oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+LiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiB0aGUgSGFiaXRhdCBDbGFzc2lmaWNhdGlvbiwgc2VlXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmRvYy5nb3Z0Lm56L0RvY3VtZW50cy9jb25zZXJ2YXRpb24vbWFyaW5lLWFuZC1jb2FzdGFsL21hcmluZS1wcm90ZWN0ZWQtYXJlYXMvbXBhLWNsYXNzaWZpY2F0aW9uLXByb3RlY3Rpb24tc3RhbmRhcmQucGRmXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIE1hcmluZSBQcm90ZWN0ZWQgQXJlYXMgQ2xhc3NpZmljYXRpb24gYW5kIFByb3RlY3Rpb24gU3RhbmRhcmQ8L2E+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3A+XCIpO18uYihcIlxcblwiKTt9O2lmKF8ucyhfLmYoXCJkM0lzUHJlc2VudFwiLGMscCwxKSxjLHAsMCwzMzU0LDM1NDQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxkaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBsaWNhdGVkX2hhYnNfcGllXFxcIiBpZD1cXFwicmVwbGljYXRlZF9oYWJzX3BpZVxcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBsaWNhdGVkX2hhYnNfcGllX2xlZ2VuZFxcXCIgaWQ9XFxcInJlcGxpY2F0ZWRfaGFic19waWVfbGVnZW5kXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzNjI1LDUwMzEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBzaXplXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PlwiKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsMzY3OSwzNjg4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJNUEEgU2l6ZXNcIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMCwzNzEyLDM3MjQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlNrZXRjaCBTaXplc1wiKTt9KTtjLnBvcCgpO31fLmIoXCI8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCwzNzU4LDQwODUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBPZiB0aGUgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJ0b3RhbF9tcGFfY291bnRcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gTVBBcyBpbiB0aGUgbmV0d29yaywgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJtcGFfY291bnRcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gbWVldFwiKTtpZighXy5zKF8uZihcInBsdXJhbF9tcGFfY291bnRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJzXCIpO307Xy5iKFwiIHRoZSBtaW5pbXVtIHNpemUgZGltZW5zaW9uIG9mIDVrbS4gVGhlIGF2ZXJhZ2UgbWluaW11bSBkaW1lbnNpb24gaXMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJtcGFfYXZnX3NpemVfZ3VpZGVsaW5lXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IHRoZSAxMC0yMGttIGd1aWRlbGluZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3A+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDQxMTQsNDE4MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPHA+VGhlIHNpemUgb2YgdGhlIHNrZXRjaGVzIGluIHRoaXMgY29sbGVjdGlvbiBhcmU6PC9wPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+XCIpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw0Mjg0LDQyOTIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIk1QQSBOYW1lXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsNDMxNiw0MzI3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJTa2V0Y2ggTmFtZVwiKTt9KTtjLnBvcCgpO31fLmIoXCI8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD5BcmVhIDwvYnI+KHNxLiBrbS4pPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjEwMHB4O1xcXCI+V2lkdGggKGttKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoxMDBweDtcXFwiPkNvYXN0bGluZSBMZW5ndGggKGttKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJwcm9wX3NpemVzXCIsYyxwLDEpLGMscCwwLDQ1NzksNDc0NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlNJWkVfU1FLTVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk1JTl9ESU1cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJDT0FTVFwiLGMscCwwKSkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICBUaGlzIGNvbWJpbmVkIGFyZWEgd2l0aGluIHRoZSBuZXR3b3JrIGFjY291bnRzIGZvciA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInBlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IE1hcmluZSBhcmVhLCBhbmQgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IGNvYXN0bGluZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw1MDc5LDU5NTQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHNpemVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxoND5NUEEgU2l6ZTwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5NUEEgTmFtZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+QXJlYSA8L2JyPihzcS4ga20uKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjEwMHB4O1xcXCI+V2lkdGggKGttKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjEwMHB4O1xcXCI+Q29hc3RsaW5lIExlbmd0aCAoa20pPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInByb3Bfc2l6ZXNcIixjLHAsMSksYyxwLDAsNTQ4Nyw1NjY3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiU0laRV9TUUtNXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJNSU5fRElNXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJDT0FTVFwiLGMscCwwKSkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgVGhpcyBhcmVhIHdpdGhpbiB0aGUgTVBBIGFjY291bnRzIGZvciA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInBlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IE1hcmluZSBhcmVhLCBhbmQgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IGNvYXN0bGluZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw1OTk0LDczNTcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNjAxNCw3MzM5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxoND5Db25uZWN0aXZpdHk8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzaW5nbGVTa2V0Y2hcIixjLHAsMSksYyxwLDAsNjEwNCw2MjgxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDxwIHN0eWxlPVxcXCJmb250LXN0eWxlOml0YWxpYztjb2xvcjpncmF5O1xcXCIgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgTm8gY29ubmVjdGl2aXR5IGluZm9ybWF0aW9uIGZvciBhIGNvbGxlY3Rpb24gd2l0aCBvbmUgc2tldGNoLiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwic2luZ2xlU2tldGNoXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICAgIDxkaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY29ubmVjdGl2aXR5X3BpZVxcXCIgaWQ9XFxcImNvbm5lY3Rpdml0eV9waWVcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNvbm5lY3Rpdml0eV9waWVfbGVnZW5kXFxcIiBpZD1cXFwiY29ubmVjdGl2aXR5X3BpZV9sZWdlbmRcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5PZiB0aGUgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJ0b3RhbF9tcGFfY291bnRcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gTVBBcyBpbiB0aGUgbmV0d29yaywgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb25uZWN0ZWRfbXBhX2NvdW50XCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+XCIpO2lmKF8ucyhfLmYoXCJwbHVyYWxfY29ubmVjdGVkX21wYV9jb3VudFwiLGMscCwxKSxjLHAsMCw2Njc3LDY2ODEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiBhcmVcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJwbHVyYWxfY29ubmVjdGVkX21wYV9jb3VudFwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiBpc1wiKTt9O18uYihcIiB3aXRoaW4gdGhlIGNvbm5lY3Rpdml0eSByYW5nZSBvZiA1MCAtIDEwMCBrbS4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNvbm5fdmFsdWVzXFxcIj5UaGUgbWluaW11bSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBNUEFzIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibWluX2Rpc3RhbmNlXCIsYyxwLDApKSk7Xy5iKFwiIGttPC9zdHJvbmc+Ljwvc3Bhbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNvbm5fdmFsdWVzXFxcIj5UaGUgbWF4aW11bSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBNUEFzIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibWF4X2Rpc3RhbmNlXCIsYyxwLDApKSk7Xy5iKFwiIGttPC9zdHJvbmc+Ljwvc3Bhbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNvbm5fdmFsdWVzXFxcIj5UaGUgYXZlcmFnZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBNUEFzIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibWVhbl9kaXN0YW5jZVwiLGMscCwwKSkpO18uYihcIiBrbTwvc3Ryb25nPi48L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxwPjxpPkl0IGlzIHJlY29tbWVuZGVkIHRoYXQgTVBBcyBzaG91bGQgYmUgd2l0aGluIDEwMGttIG9mIGVhY2ggb3RoZXIuPC9pPjwvcD5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtpZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDc0MDMsNzc4OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gc2l6ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGg0PlNpemU8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBUaGlzIHNrZXRjaCBhcmVhIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwic2l6ZVwiLGMscCwwKSkpO18uYihcIiBzcXVhcmUga2lsb21ldGVyczwvc3Ryb25nPiwgYW5kIGl0IGluY2x1ZGVzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwicGVyY2VudFwiLGMscCwwKSkpO18uYihcIiU8L3N0cm9uZz4gb2YgdGhlIFNvdXRoLUVhc3QgUGxhbm5pbmcgUmVnaW9uLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgVGhpcyBza2V0Y2ggaW5jbHVkZXMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb2FzdGxpbmVfbGVuZ3RoXCIsYyxwLDApKSk7Xy5iKFwiIG1ldGVyczwvc3Ryb25nPiBvZiBjb2FzdGxpbmUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX07Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBzaXplXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5OdW1iZXIgb2YgSGFiaXRhdHM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgVGhlIFwiKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsNzkyNSw3OTgyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgTWFyaW5lIFByb3RlY3RlZCBBcmVhXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNzk2NCw3OTY1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJzXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsODAwNiw4MDQ4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJza2V0Y2hcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw4MDI5LDgwMzEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImVzXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIiBpbmNsdWRlXCIpO2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic1wiKTt9O18uYihcIiA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm51bV9oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IG9mIHRoZSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInRvdGFsX2hhYnNcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gY2xhc3NpZmllZCBoYWJpdGF0cy5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1widXNlc1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtpZihfLnMoXy5kKFwic2tldGNoQ2xhc3MuZGVsZXRlZFwiLGMscCwxKSxjLHAsMCwyNCwyNzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LXdhcm5cXFwiIHN0eWxlPVxcXCJtYXJnaW4tYm90dG9tOjEwcHg7XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFRoaXMgc2tldGNoIHdhcyBjcmVhdGVkIHVzaW5nIHRoZSBcXFwiXCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIlxcXCIgdGVtcGxhdGUsIHdoaWNoIGlzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBubyBsb25nZXIgYXZhaWxhYmxlLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byBjb3B5IHRoaXMgc2tldGNoIG9yIG1ha2UgbmV3XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBza2V0Y2hlcyBvZiB0aGlzIHR5cGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaGFzQ29hc3RhbFwiLGMscCwxKSxjLHAsMCwzMTAsMTA0NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PkV4aXN0aW5nIENvYXN0YWwgQ29uc2VudHMgPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTNkNzE5YTQ5MzgwMTc0YTc3NjZkZDg1XFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICBzaG93IGxheWVyPC9hPjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cD5cIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw1MjQsNTU0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJBIHNrZXRjaCB3aXRoaW4gdGhlIGNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJUaGUgc2tldGNoXCIpO307Xy5iKFwiIGNvbnRhaW5zIG9yIGlzIHdpdGhpbiAyMDBtIG9mIHNpdGVzIHdpdGggUmVzb3VyY2UgQ29uc2VudHMuPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjI1MHB4O1xcXCI+Q29uc2VudCBUeXBlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImNvYXN0YWxfY29uc2VudHNcIixjLHAsMSksYyxwLDAsODkzLDk3OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkZFQVRfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzVXNlc1wiLGMscCwxKSxjLHAsMCwxMDc0LDQxNDUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJoYXNSZWNVc2VzXCIsYyxwLDEpLGMscCwwLDEwOTIsMjM1NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PlJlY3JlYXRpb25hbCBVc2VzIDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPCEtLVwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNTbWFyb1wiLGMscCwxKSxjLHAsMCwxMjAwLDE2ODgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICA8cD48c3Ryb25nPlNwZWN0cnVtIG9mIE1BcmluZSBSZWNyZWF0aW9uYWwgT3Bwb3J0dW5pdHkgKFNNQVJPKTwvc3Ryb25nPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHA+XCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMTMzOSwxMzQ5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJDb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiU2tldGNoXCIpO307Xy5iKFwiIGluY2x1ZGVzIGFyZWEocykgaWRlbnRpZmllZCBhcyBoYXZpbmcgPHN0cm9uZz4gbWVkaXVtIG9yIGhpZ2ggPC9zdHJvbmc+IHJlY3JlYXRpb25hbCBvcHBvcnR1bml0eS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGVtPllvdSBjYW4gZmluZCBtb3JlIGluZm9ybWF0aW9uIG9uIFNNQVJPIGluIHRoZSBcXFwiZGF0YSBkZXNjcmlwdGlvblxcXCIgYnkgcmlnaHQgY2xpY2tpbmcgb24gdGhlIGxheWVyIG5hbWUuPC9lbT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvYnI+PC9icj5cIik7Xy5iKFwiXFxuXCIpO307fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgLS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5BY3Rpdml0eSBUeXBlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5OdW1iZXIgb2YgU2l0ZXM8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzUmVjVXNlc1wiLGMscCwxKSxjLHAsMCwxOTU5LDIxNDEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJyZWNfdXNlc1wiLGMscCwxKSxjLHAsMCwxOTg3LDIxMTUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkNPVU5UXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc1JlY1VzZXNcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkIGNvbHNwYW49Mj48ZW0+Tm9uZSBQcmVzZW50PC9lbT48L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNIZXJpdGFnZVwiLGMscCwxKSxjLHAsMCwyMzkxLDMzNDYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDQ+QXJjaGVvbG9naWNhbCBJbmZvcm1hdGlvbiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTU3OGYxNGNmZjM5MDU5YTU4MzY0NmM5XFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5zaG93IGxheWVyPC9hPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8cD5cIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwyNjUwLDI2ODAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkEgc2tldGNoIHdpdGhpbiB0aGUgY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlRoZSBza2V0Y2hcIik7fTtfLmIoXCIgY29udGFpbnMgb3IgaXMgd2l0aGluIDIwMG0gb2Ygc2l0ZXMgaWRlbnRpZmllZCBhcyBoYXZpbmcgc2lnbmlmaWNhbnQgaGVyaXRhZ2UgdmFsdWVzLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5IZXJpdGFnZSBUeXBlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGg+TnVtYmVyIG9mIFNpdGVzPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhlcml0YWdlXCIsYyxwLDEpLGMscCwwLDMxMTMsMzI1MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiQ09VTlRcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9O30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJoYXNJbmZyYXN0cnVjdHVyZVwiLGMscCwxKSxjLHAsMCwzMzg3LDQxMjIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDQ+SW5mcmFzdHJ1Y3R1cmU8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxwPlwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDM1MjMsMzU1MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiQSBza2V0Y2ggd2l0aGluIHRoZSBjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiVGhlIHNrZXRjaFwiKTt9O18uYihcIiBjb250YWlucyBvciBpcyB3aXRoaW4gMjAwbSBvZiBzaXRlcyB3aXRoIGV4aXN0aW5nIGluZnJhc3RydWN0dXJlLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5UeXBlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImluZnJhc3RydWN0dXJlXCIsYyxwLDEpLGMscCwwLDM5MjAsNDAyMSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc1VzZXNcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDQ+QWN0aXZpdGllcyBhbmQgVXNlczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cD5UaGUgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNDI4MSw0MjkxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic2tldGNoXCIpO307Xy5iKFwiICBkb2VzIDxzdHJvbmc+bm90PC9zdHJvbmc+IGluY2x1ZGUgYW55IDxzdHJvbmc+YWN0aXZpdGllcyBvciB1c2VzPC9zdHJvbmc+LjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNTZWFiaXJkc1wiLGMscCwxKSxjLHAsMCw0NDY4LDUxOTQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkJpcmRzIDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc1NlYWJpcmRBcmVhc1wiLGMscCwxKSxjLHAsMCw0NTU2LDQ4NDAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj48c3Ryb25nPkltcG9ydGFudCBTZWFiaXJkIEFyZWFzPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2VhYmlyZHNcIixjLHAsMSksYyxwLDAsNDcwMyw0NzgzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTmFtZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgIFwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNTZWFiaXJkQ29sb25pZXNcIixjLHAsMSksYyxwLDAsNDg5Myw1MTYzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPjxzdHJvbmc+U2VhYmlyZCBDb2xvbmllczwvc3Ryb25nPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2VhYmlyZF9jb2xvbmllc1wiLGMscCwxKSxjLHAsMCw1MDMzLDUxMDUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJoYXNNYXJpbmVTcGVjaWVzXCIsYyxwLDEpLGMscCwwLDUyMzIsNTY5NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+TWFyaW5lIE1hbW1hbHM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+U3BlY2llczwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJtYW1tYWxzXCIsYyxwLDEpLGMscCwwLDU0ODAsNTU2MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwic2VhbHNcIixjLHAsMSksYyxwLDAsNTU5NSw1NjQwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJOYW1lXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzTWFyaW5lU3BlY2llc1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5TcGVjaWVzIEluZm9ybWF0aW9uPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwPlRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw1ODQ4LDU4ODIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcInNrZXRjaGVzIHdpdGhpbiB0aGUgY29sbGVjdGlvbiBkbyBcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2ggZG9lc1wiKTt9O18uYihcIiA8c3Ryb25nPm5vdDwvc3Ryb25nPiBpbmNsdWRlIGFueSA8c3Ryb25nPmltcG9ydGFudCBtYXJpbmUgbWFtbWFsIGFyZWFzPC9zdHJvbmc+LjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTtyZXR1cm4gXy5mbCgpOzt9KTtcblxuaWYodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHRoaXNbXCJUZW1wbGF0ZXNcIl07XG59Il19
