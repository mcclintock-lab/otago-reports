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
    this.getFloat = __bind(this.getFloat, this);
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

  EnvironmentTab.prototype.dependencies = ['HabitatsOverview', 'AdjacentTerrestrial', 'HabRepsToolbox'];

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
    isMPA = scid === MPA_ID || scid === MPA_COLLECTION_ID || scid === MPA_CONFID_COLLECTION_ID;
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
    var critical_habitats, hab, hab_types, na_habs, new_hab, nh, _i, _j, _len, _len1;
    hab_types = [];
    critical_habitats = [];
    for (_i = 0, _len = habs_represented.length; _i < _len; _i++) {
      hab = habs_represented[_i];
      if (hab.HAB_TYPE === "Bryozoan reef" || hab.HAB_TYPE === "Macrocystis bed" || hab.HAB_TYPE === "Seagrass bed") {
        critical_habitats.push(hab);
      } else {
        hab_types.push(hab);
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
    this.$('.sig_hab_connected').click(function(event) {
      return _this.renderSort('sig_hab_connected', tableName, habitats, event, "CONN", tbodyName, true, _this.getHabitatRowString, isMPA, isCollection);
    });
    return this.renderSort('sig_hab_new_area', tableName, habitats, void 0, "SIZE_SQKM", tbodyName, true, this.getHabitatRowString, isMPA, isCollection);
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
    this.$('.hab_connected').click(function(event) {
      return _this.renderSort('hab_connected', tableName, habitats, event, "CONN", tbodyName, true, _this.getHabitatRowString, isMPA, isCollection);
    });
    return this.renderSort('hab_new_area', tableName, habitats, void 0, "SIZE_SQKM", tbodyName, true, this.getHabitatRowString, isMPA, isCollection);
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
    console.log("scid:", scid);
    if (scid === MPA_ID || scid === MPA_COLLECTION_ID || scid === MPA_CONFID_COLLECTION_ID) {
      isMPA = true;
    } else {
      isMPA = false;
    }
    isConfidentialMPANetwork = scid === MPA_CONFID_COLLECTION_ID;
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
    this.getNumHabs = __bind(this.getNumHabs, this);
    this.build_values = __bind(this.build_values, this);
    _ref = OverviewTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  OverviewTab.prototype.name = 'Overview';

  OverviewTab.prototype.className = 'overview';

  OverviewTab.prototype.timeout = 120000;

  OverviewTab.prototype.template = templates.overview;

  OverviewTab.prototype.dependencies = ['HabitatsOverview', 'ProposalSize', 'ProposalConnectivity', 'HabRepsToolbox'];

  OverviewTab.prototype.render = function() {
    var Error, TOTAL_COASTLINE_LENGTH, TOTAL_HABS, TOT_SIZE_SQKM, area_percent, attributes, bad_color, coastline_length, coastline_length_percent, conn_pie_values, connected_mpa_count, context, d3IsPresent, good_color, hab_sizes, isCollection, isGeneric, isMPA, max_distance, mean_distance, min_distance, mpa_avg_min_dim, mpa_avg_size_guideline, mpa_count, new_habs, not_replicated, not_represented, numSketches, num_habs, num_other, num_replicated_habs, num_represented_habs, num_reserves, num_type2, pluralSketches, plural_connected_mpa_count, plural_mpa_count, plural_other, plural_type1, plural_type2, prop_sizes, ratio, replicated_habs_pie_values, represented_habs, represented_habs_pie_values, reserve_types, scid, size, total_habs, total_mpa_count, total_percent, total_sizes;
    TOTAL_COASTLINE_LENGTH = 766.466917;
    TOT_SIZE_SQKM = 8930.662893;
    TOTAL_HABS = 38;
    scid = this.sketchClass.id;
    isCollection = this.model.isCollection();
    isMPA = scid === MPA_ID || scid === MPA_COLLECTION_ID || scid === MPA_CONFID_COLLECTION_ID;
    console.log("scid: ", scid);
    console.log("ismpa ", isMPA);
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
    represented_habs = this.recordSet('HabRepsToolbox', 'RepresentedHabs').toArray();
    hab_sizes = this.recordSet('HabRepsToolbox', 'HabSizes').toArray();
    num_habs = hab_sizes != null ? hab_sizes.length : void 0;
    num_represented_habs = this.getNumHabs("REPRESENT", represented_habs);
    num_replicated_habs = this.getNumHabs("REPLIC", represented_habs);
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
      area_percent = parseFloat((size / TOT_SIZE_SQKM) * 100).toFixed(1);
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
this["Templates"]["environment"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Habitats Present in ");if(_.s(_.f("isCollection",c,p,1),c,p,0,382,392,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" <a href=\"#\" data-toggle-node=\"5536dbb48c5b43eb0facbc5a\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);_.b("    <p>");_.b("\n" + i);_.b("      <i>");_.b("\n" + i);_.b("        Area (%) refers to the percentage of the habitat contained within the ");_.b("\n" + i);_.b("        ");if(_.s(_.f("isGeneric",c,p,1),c,p,0,666,676,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isGeneric",c,p,1),c,p,1,0,0,"")){_.b("network");};_.b("\n" + i);_.b("        ");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" as a proportion of the total area of habitat within the South-East Marine region.");_.b("\n" + i);_.b("      </i>");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("    <p class=\"in-report-header\">Habitat types</p>");_.b("\n" + i);if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,949,2086,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <table data-paging=\"20\" class=\"hab_table\"> ");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th class=\"sorting_col\" style=\"width:200px;\"><a class=\"hab_type sort_up\" href=\"#\">Habitat</a></th>");_.b("\n" + i);_.b("              <th><a  class=\"hab_new_area sort_down\" href=\"#\" >Area (km<sup>2</sup>)</a></th>");_.b("\n" + i);_.b("              <th><a class=\"hab_new_perc sort_down\" href=\"#\">Area (%)</a></th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,1347,1697,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <th><a class=\"hab_represent sort_down\" href=\"#\" >Represented</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,1461,1665,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  <th><a class=\"hab_replicate sort_down\" href=\"#\" >Replicated</th>");_.b("\n" + i);_.b("                  <th><a class=\"hab_connected sort_down\" href=\"#\">Connectivity (in km)<sup>*</sup></th>");_.b("\n");});c.pop();}});c.pop();}_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("         <tbody class=\"hab_values\"></tbody>");_.b("\n" + i);_.b("       </table>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,1821,2069,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,1847,2045,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <p>");_.b("\n" + i);_.b("            <i>");_.b("\n" + i);_.b("              <sup>*</sup>General guidelines for MPA network design suggest MPA of similar habitat types to be 50-100km apart.");_.b("\n" + i);_.b("            </i>");_.b("\n" + i);_.b("          </p>");_.b("\n");});c.pop();}});c.pop();}});c.pop();}if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:180px;\">Habitat</th>");_.b("\n" + i);_.b("              <th>Area (km<sup>2</sup>)</th>");_.b("\n" + i);_.b("              <th>Area (%)</th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,2347,2573,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <th>Represented</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,2420,2541,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                    <th>Replicated</th>");_.b("\n" + i);_.b("                    <th>Connectivity (in km)<sup>*</sup></th>");_.b("\n");});c.pop();}});c.pop();}_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasHabTypes",c,p,1),c,p,0,2667,3072,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hab_types",c,p,1),c,p,0,2696,3045,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("PERC",c,p,0)));_.b("</td>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,2853,3000,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  <td>");_.b(_.v(_.f("REPRESENT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                  ");if(_.s(_.f("isCollection",c,p,1),c,p,0,2930,2966,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<td>");_.b(_.v(_.f("REPLIC",c,p,0)));_.b("</td><td>");_.b(_.v(_.f("CONN",c,p,0)));_.b("</td>");});c.pop();}_.b("\n");});c.pop();}_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasHabTypes",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td colspan=\"");if(_.s(_.f("isCollection",c,p,1),c,p,0,3183,3184,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("5");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("4");};_.b("\">");_.b("\n" + i);_.b("                  <i>There are no habitat types.</i>");_.b("\n" + i);_.b("                </td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,3417,3665,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,3443,3641,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <p>");_.b("\n" + i);_.b("            <i>");_.b("\n" + i);_.b("              <sup>*</sup>General guidelines for MPA network design suggest MPA of similar habitat types to be 50-100km apart.");_.b("\n" + i);_.b("            </i>");_.b("\n" + i);_.b("          </p>");_.b("\n");});c.pop();}});c.pop();}};_.b("    <p class=\"in-report-header\">Sensitive Marine Habitats</p>");_.b("\n" + i);if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,3781,4915,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <table data-paging=\"20\" class=\"sig_hab_table\"> ");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th class=\"sorting_col\" style=\"width:200px;\"><a class=\"sig_hab_type sort_down\" href=\"#\">Habitat</a></th>");_.b("\n" + i);_.b("            <th><a  class=\"sig_hab_new_area sort_up\" href=\"#\" >Area (km<sup>2</sup>)</a></th>");_.b("\n" + i);_.b("            <th><a class=\"sig_hab_new_perc sort_down\" href=\"#\">Area (%)</a></th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,4181,4532,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <th><a class=\"sig_hab_represent sort_down\" href=\"#\">Represented</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,4296,4502,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <th><a class=\"sig_hab_replicate sort_down\" href=\"#\">Replicated</th>");_.b("\n" + i);_.b("                <th><a class=\"sig_hab_connected sort_down\" href=\"#\">Connectivity (in km)<sup>*</sup> </th>");_.b("\n");});c.pop();}});c.pop();}_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("       <tbody class=\"sig_hab_values\"></tbody>");_.b("\n" + i);_.b("     </table>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,4652,4900,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,4678,4876,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <p>");_.b("\n" + i);_.b("            <i>");_.b("\n" + i);_.b("              <sup>*</sup>General guidelines for MPA network design suggest MPA of similar habitat types to be 50-100km apart.");_.b("\n" + i);_.b("            </i>");_.b("\n" + i);_.b("          </p>");_.b("\n");});c.pop();}});c.pop();}});c.pop();}if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th style=\"width:180px;\">Habitat</th>");_.b("\n" + i);_.b("            <th>Area (km<sup>2</sup>)</th>");_.b("\n" + i);_.b("            <th>Area (%)</th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,5162,5388,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <th>Represented</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,5235,5356,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                    <th>Replicated</th>");_.b("\n" + i);_.b("                    <th>Connectivity (in km)<sup>*</sup></th>");_.b("\n");});c.pop();}});c.pop();}_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("hasSigHabs",c,p,1),c,p,0,5471,5844,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("sig_habs",c,p,1),c,p,0,5495,5822,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("PERC",c,p,0)));_.b("</td>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,5642,5783,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <td>");_.b(_.v(_.f("REPRESENT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                ");if(_.s(_.f("isCollection",c,p,1),c,p,0,5715,5751,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<td>");_.b(_.v(_.f("REPLIC",c,p,0)));_.b("</td><td>");_.b(_.v(_.f("CONN",c,p,0)));_.b("</td>");});c.pop();}_.b("\n");});c.pop();}_.b("            </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasSigHabs",c,p,1),c,p,1,0,0,"")){_.b("          <tr>");_.b("\n" + i);_.b("              <td colspan=\"");if(_.s(_.f("isCollection",c,p,1),c,p,0,5943,5944,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("5");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("4");};_.b("\">");_.b("\n" + i);_.b("                <i>There are no habitats of significance.</i>");_.b("\n" + i);_.b("              </td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");};_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);if(_.s(_.f("hasSigHabs",c,p,1),c,p,0,6174,6474,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isMPA",c,p,1),c,p,0,6193,6457,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,6221,6431,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <p>");_.b("\n" + i);_.b("              <i>");_.b("\n" + i);_.b("                <sup>*</sup>General guidelines for MPA network design suggest MPA of similar habitat types to be 50-100km apart.");_.b("\n" + i);_.b("              </i>");_.b("\n" + i);_.b("            </p>");_.b("\n");});c.pop();}});c.pop();}});c.pop();}};_.b("    <p>");_.b("\n" + i);_.b("      <em>Sensitive habitats are defined in the report '<a href=\"https://www.mfe.govt.nz/sites/default/files/sensitive-marine-benthic-habitats-defined.pdf\" target=\"_blank\">Sensitive marine benthic habitats defined</a>.' ’NA’ indicates that the habitat is likely to be present in the region but not mapped.</em>");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);if(_.s(_.f("showAdjacent",c,p,1),c,p,0,6865,8342,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Adjacent Terrestrial Information</h4>");_.b("\n" + i);_.b("        <p><em>MPA Guidelines: \"Consider adjacent terrestrial environment\" (areas shown below are within 100m of ");if(_.s(_.f("isCollection",c,p,1),c,p,0,7087,7113,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("a sketch in the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b(" the sketch ");};_.b(")</em></p>");_.b("\n" + i);_.b("        <p class=\"large\"><strong>Protected Areas</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"20\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasProtected",c,p,1),c,p,0,7329,7485,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("protected_areas",c,p,1),c,p,0,7364,7452,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasProtected",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("        <p class=\"large\"><strong>Conservation Covenants</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasCovenants",c,p,1),c,p,0,7834,8133,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("qe2_covenants",c,p,1),c,p,0,7867,7955,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}if(_.s(_.f("napalis_covenants",c,p,1),c,p,0,8010,8098,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasCovenants",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n");return _.fl();;});
this["Templates"]["fishing"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("\n" + i);if(_.s(_.f("hasAnyFishing",c,p,1),c,p,0,317,2552,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hasExistingFishing",c,p,1),c,p,0,345,1382,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("      <h4>Existing Fisheries Management</h4>");_.b("\n" + i);_.b("          <p><em>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,476,483,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" includes the following existing fisheries restrictions. ");_.b("\n" + i);_.b("          Also shown is the extent that the fisheries restrictions apply to the ");if(_.s(_.f("isCollection",c,p,1),c,p,0,695,703,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketches");});c.pop();}_.b("\n" + i);_.b("          ");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" as a percentage of total sketch area. For example, 100% means no fishing of that type is currently allowed within the sketch.</em></p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <thead>");_.b("\n" + i);_.b("              <tr>");_.b("\n" + i);_.b("                <th style=\"width:250px;\">Name</th>");_.b("\n" + i);_.b("                <th>Percent</th>");_.b("\n" + i);_.b("              </tr>");_.b("\n" + i);_.b("            </thead>");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("existing_fishing_areas",c,p,1),c,p,0,1167,1299,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("PERC_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}if(_.s(_.f("hasCustomary",c,p,1),c,p,0,1427,2533,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Customary Areas</h4>");_.b("\n" + i);if(_.s(_.f("hasExistingCustomary",c,p,1),c,p,0,1543,1987,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <p> The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1579,1586,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes the following <strong>existing</strong> Customary Areas:</p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("existing_customary_fishing",c,p,1),c,p,0,1814,1907,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n");});c.pop();}if(_.s(_.f("hasProposedCustomary",c,p,1),c,p,0,2046,2490,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <p> The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,2082,2089,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes the following <strong>proposed</strong> Customary Areas:</p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("proposed_customary_fishing",c,p,1),c,p,0,2317,2410,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n");});c.pop();}_.b("      </div>");_.b("\n");});c.pop();}_.b("\n");});c.pop();}if(!_.s(_.f("hasAnyFishing",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Existing or Customary Areas</h4>");_.b("\n" + i);_.b("        <p>No information on existing fishing areas or customary use is available for this area.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};_.b("\n" + i);if(_.s(_.f("isConfidentialMPANetwork",c,p,1),c,p,0,2835,4252,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("      <h4>Fishing Intensity</h4>");_.b("\n" + i);_.b("          <p>");_.b("\n" + i);_.b("            <em>");_.b("\n" + i);_.b("            Your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,2981,2988,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes areas identified as having high, moderate or low intensity fishing grounds for the following fisheries. The percentage of the regions high, moderate and low intensity fishing grounds covered by your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3271,3278,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" is given below. Fishery displacement shows the percentage of the regions fishery that would be displaced by your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3466,3473,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(".");_.b("\n" + i);_.b("            </em>");_.b("\n" + i);_.b("          </p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <thead>");_.b("\n" + i);_.b("              <tr>");_.b("\n" + i);_.b("\n" + i);_.b("                <th style=\"width:125px;\">Fishery</th>");_.b("\n" + i);_.b("                <th>High (%)</th>");_.b("\n" + i);_.b("                <th>Moderate (%)</th>");_.b("\n" + i);_.b("                <th>Low (%)</th>");_.b("\n" + i);_.b("                <th>Fishery displacement (%)</th>");_.b("\n" + i);_.b("              </tr>");_.b("\n" + i);_.b("            </thead>");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("fishery_intensity",c,p,1),c,p,0,3946,4178,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FISH_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("MODERATE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("DISP",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("<!--");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,4298,6179,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Fishing Intensity</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        The following tables contains the percent of the total SEMPF low intensity and high intensity fishing that may be displaced by the sketch. <strong>High intensity</strong> is greater than an average of 5 events per annum, <strong>Low</strong> is 5 or less events per annum.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("      <p class=\"in-report-header\">Trawl Fishing Intensity</p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>Sketch Name</th>");_.b("\n" + i);_.b("            <th>% Low Intensity</th>");_.b("\n" + i);_.b("            <th>% High Intensity</th>");_.b("\n" + i);_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("trawl",c,p,1),c,p,0,4993,5124,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("\n" + i);_.b("      <p class=\"in-report-header\">Set Net Fishing Intensity</p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>Sketch Name</th>");_.b("\n" + i);_.b("              <th>% Low Intensity</th>");_.b("\n" + i);_.b("              <th>% High Intensity</th>");_.b("\n" + i);_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("setnet",c,p,1),c,p,0,5493,5636,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("      <p class=\"in-report-header\">Long Line Fishing Intensity</p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>Sketch Name</th>");_.b("\n" + i);_.b("            <th>% Low Intensity</th>");_.b("\n" + i);_.b("            <th>% High Intensity</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("longline",c,p,1),c,p,0,5992,6123,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("-->");_.b("\n" + i);_.b("\n" + i);_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["overview"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,313,748,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isMPA",c,p,1),c,p,0,326,737,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>MPA Network</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This Collection has: <strong>");_.b(_.v(_.f("num_reserves",c,p,0)));_.b(" Type-1 MPA");if(_.s(_.f("plural_type1",c,p,1),c,p,0,496,497,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}_.b(", ");_.b(_.v(_.f("num_type2",c,p,0)));_.b(" Type-2 MPA");if(_.s(_.f("plural_type2",c,p,1),c,p,0,557,558,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}_.b(", and ");_.b(_.v(_.f("num_other",c,p,0)));_.b(" Other MPA");if(_.s(_.f("plural_other",c,p,1),c,p,0,621,622,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}_.b("</strong> .");_.b("\n" + i);_.b("        <em>Only Type-1 and Type-2 MPAs are reported on.</em>");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){if(_.s(_.f("anyAttributes",c,p,1),c,p,0,807,1125,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div class=\"reportSection\">");_.b("\n" + i);_.b("        <h4>");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("</h4>");_.b("\n" + i);_.b(_.rp("attributes/attributesTable",c,p,"        "));if(_.s(_.f("isCollection",c,p,1),c,p,0,945,1075,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <tr><td>");if(_.s(_.f("isMPA",c,p,1),c,p,0,972,986,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Number of MPAs");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,1010,1028,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Number of Sketches");});c.pop();}_.b("</td>");_.b(_.v(_.f("numSketches",c,p,0)));_.b("<td>");_.b("\n");});c.pop();}_.b("        </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");});c.pop();}};_.b("\n" + i);if(_.s(_.f("isGeneric",c,p,1),c,p,0,1179,1466,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,1201,1446,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection\">");_.b("\n" + i);_.b("      <h4>Number of Sketches in Collection</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This collection contains <strong>");_.b(_.v(_.f("numSketches",c,p,0)));_.b("</strong> sketch");if(_.s(_.f("pluralSketches",c,p,1),c,p,0,1397,1399,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("es");});c.pop();}_.b(".");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,1494,3822,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,1516,3802,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Habitats Represented in Type-1 MPA");_.b("\n" + i);_.b("        <a href=\"#\" data-toggle-node=\"53a0a31cd3f6064d2c17580c\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("      <strong>Number of Habitat Classes</strong></br>");_.b("\n" + i);_.b("      <p style=\"margin-top:0px;\" class=\"large\">");_.b("\n" + i);_.b("        There are <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> habitat classes in the planning region, and your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1945,1955,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("\n" + i);_.b("        includes <strong>");_.b(_.v(_.f("new_habs",c,p,0)));_.b("</strong>. For more information on the Habitat Classification, see");_.b("\n" + i);_.b("        the <a href=\"http://www.doc.govt.nz/Documents/conservation/marine-and-coastal/marine-protected-areas/mpa-classification-protection-standard.pdf\" target=\"_blank\">");_.b("\n" + i);_.b("        Marine Protected Areas Classification and Protection Standard</a>");_.b("\n" + i);_.b("      </p>");_.b("\n");};if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,2417,2621,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <div>");_.b("\n" + i);_.b("          <div class=\"represented_habs_pie\" id=\"represented_habs_pie\"></div>");_.b("\n" + i);_.b("          <div class=\"represented_habs_pie_legend\" id=\"represented_habs_pie_legend\"></div>");_.b("\n" + i);_.b("        </div>");_.b("\n");});c.pop();}_.b("    </div>");_.b("\n" + i);_.b("    ");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Habitats Represented in at Least 2 MPA");_.b("\n" + i);_.b("        <a href=\"#\" data-toggle-node=\"53a0a31cd3f6064d2c17580c\" data-visible=\"false\">show layer</a>");_.b("\n" + i);_.b("      </h4>");_.b("\n" + i);if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("        <strong>Number of Habitat Classes</strong></br>");_.b("\n" + i);_.b("        <p style=\"margin-top:0px;\" class=\"large\">");_.b("\n" + i);_.b("          There are <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> habitat classes in the planning region, and your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3100,3110,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("\n" + i);_.b("          includes <strong>");_.b(_.v(_.f("new_habs",c,p,0)));_.b("</strong>. For more information on the Habitat Classification, see");_.b("\n" + i);_.b("          the <a href=\"http://www.doc.govt.nz/Documents/conservation/marine-and-coastal/marine-protected-areas/mpa-classification-protection-standard.pdf\" target=\"_blank\">");_.b("\n" + i);_.b("          Marine Protected Areas Classification and Protection Standard</a>");_.b("\n" + i);_.b("        </p>");_.b("\n");};if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,3580,3770,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div>");_.b("\n" + i);_.b("        <div class=\"replicated_habs_pie\" id=\"replicated_habs_pie\"></div>");_.b("\n" + i);_.b("        <div class=\"replicated_habs_pie_legend\" id=\"replicated_habs_pie_legend\"></div>");_.b("\n" + i);_.b("      </div>");_.b("\n");});c.pop();}_.b("    </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,3851,5493,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection size\">");_.b("\n" + i);_.b("    <h4>");if(_.s(_.f("isMPA",c,p,1),c,p,0,3905,3914,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("MPA Sizes");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,3938,3950,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Sketch Sizes");});c.pop();}_.b("</h4>");_.b("\n" + i);_.b("    <!--");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,3993,4320,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        Of the <strong>");_.b(_.v(_.f("total_mpa_count",c,p,0)));_.b("</strong> MPAs in the network, <strong>");_.b(_.v(_.f("mpa_count",c,p,0)));_.b("</strong> meet");if(!_.s(_.f("plural_mpa_count",c,p,1),c,p,1,0,0,"")){_.b("s");};_.b(" the minimum size dimension of 5km. The average minimum dimension is <strong>");_.b(_.v(_.f("mpa_avg_size_guideline",c,p,0)));_.b("</strong> the 10-20km guideline.");_.b("\n" + i);_.b("      </p>");_.b("\n");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,4349,4416,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p>The size of the sketches in this collection are:</p>");_.b("\n");});c.pop();}_.b("    -->");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>");if(_.s(_.f("isMPA",c,p,1),c,p,0,4527,4535,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("MPA Name");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,4559,4570,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Sketch Name");});c.pop();}_.b("</th>");_.b("\n" + i);_.b("            <th>Area </br>(sq. km.)</th>");_.b("\n" + i);_.b("            <th style=\"width:100px;\">Width (km)</th>");_.b("\n" + i);_.b("            <th style=\"width:100px;\">Coastline Length (km)</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("prop_sizes",c,p,1),c,p,0,4822,5013,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr class=");_.b(_.v(_.f("CSS_CLASS",c,p,0)));_.b(">");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("MIN_DIM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("COAST",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("    <p class=\"large\">");_.b("\n" + i);_.b("      This combined area within the network accounts for <strong>");_.b(_.v(_.f("area_percent",c,p,0)));_.b("%</strong> of the South-East Marine area, and <strong>");_.b(_.v(_.f("coastline_length_percent",c,p,0)));_.b("%</strong> of the South-East coastline.");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("    <p>");_.b("\n" + i);_.b("      <i>");_.b("\n" + i);_.b("        General guidelines for MPA network design suggest individual MPA should be a minimum of 5km width and the average width for a network 10-20km.");_.b("\n" + i);_.b("      </i>");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){if(_.s(_.f("isMPA",c,p,1),c,p,0,5541,6421,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>MPA Size</h4>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>MPA Name</th>");_.b("\n" + i);_.b("              <th>Area </br>(sq. km.)</th>");_.b("\n" + i);_.b("              <th style=\"width:100px;\">Width (km)</th>");_.b("\n" + i);_.b("              <th style=\"width:100px;\">Coastline Length (km)</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("prop_sizes",c,p,1),c,p,0,5949,6129,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("MIN_DIM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("COAST",c,p,0)));_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This area within the MPA accounts for <strong>");_.b(_.v(_.f("area_percent",c,p,0)));_.b("%</strong> of the South-East Marine area, and <strong>");_.b(_.v(_.f("coastline_length_percent",c,p,0)));_.b("%</strong> of the South-East coastline.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}};_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,6461,7871,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,6481,7853,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div class=\"reportSection\">");_.b("\n" + i);_.b("        <h4>Connectivity</h4>");_.b("\n" + i);if(_.s(_.f("singleSketch",c,p,1),c,p,0,6571,6748,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <p style=\"font-style:italic;color:gray;\" class=\"large\">");_.b("\n" + i);_.b("                No connectivity information for a collection with one sketch. ");_.b("\n" + i);_.b("              </p>");_.b("\n");});c.pop();}if(!_.s(_.f("singleSketch",c,p,1),c,p,1,0,0,"")){_.b("          <!--");_.b("\n" + i);_.b("          <div>");_.b("\n" + i);_.b("            <div class=\"connectivity_pie\" id=\"connectivity_pie\"></div>");_.b("\n" + i);_.b("            <div class=\"connectivity_pie_legend\" id=\"connectivity_pie_legend\"></div>");_.b("\n" + i);_.b("          </div>");_.b("\n" + i);_.b("          -->");_.b("\n" + i);_.b("          <p class=\"large\">Of the <strong>");_.b(_.v(_.f("total_mpa_count",c,p,0)));_.b("</strong> MPAs in the network, <strong>");_.b(_.v(_.f("connected_mpa_count",c,p,0)));_.b("</strong>");if(_.s(_.f("plural_connected_mpa_count",c,p,1),c,p,0,7173,7177,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(" are");});c.pop();}if(!_.s(_.f("plural_connected_mpa_count",c,p,1),c,p,1,0,0,"")){_.b(" is");};_.b(" within 100 km of each other. ");_.b("\n" + i);_.b("          </p>");_.b("\n" + i);_.b("          <span class=\"conn_values\">The minimum distance between the MPAs is <strong>");_.b(_.v(_.f("min_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("          <span class=\"conn_values\">The maximum distance between the MPAs is <strong>");_.b(_.v(_.f("max_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("          <span class=\"conn_values\">The average distance between the MPAs is <strong>");_.b(_.v(_.f("mean_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("          <p><i>General guidelines for MPA network design suggest MPA of similar habitat types to be 50-100km apart.</i></p>");_.b("\n");};_.b("\n" + i);_.b("      </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){if(_.s(_.f("isGeneric",c,p,1),c,p,0,7917,8323,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Size</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This sketch area is <strong>");_.b(_.v(_.f("size",c,p,0)));_.b(" square kilometers</strong>, and it includes <strong>");_.b(_.v(_.f("coastline_length_percent",c,p,0)));_.b("%</strong> of the South-East Planning Region.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This sketch includes <strong>");_.b(_.v(_.f("coastline_length",c,p,0)));_.b(" kilometers</strong> of coastline.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}};_.b("\n" + i);_.b("\n" + i);_.b("<!--");_.b("\n" + i);_.b("<div class=\"reportSection size\">");_.b("\n" + i);_.b("  <h4>Number of Habitats</h4>");_.b("\n" + i);_.b("  <p class=\"large\">");_.b("\n" + i);_.b("    The ");if(_.s(_.f("isMPA",c,p,1),c,p,0,8464,8521,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(" Marine Protected Area");if(_.s(_.f("isCollection",c,p,1),c,p,0,8503,8504,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,8545,8587,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketch");if(_.s(_.f("isCollection",c,p,1),c,p,0,8568,8570,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("es");});c.pop();}});c.pop();}_.b(" include");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("s");};_.b(" <strong>");_.b(_.v(_.f("num_habs",c,p,0)));_.b("</strong> of the <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> classified habitats.");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("-->");_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["uses"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("hasCoastal",c,p,1),c,p,0,310,1045,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Existing Coastal Consents <a href=\"#\" data-toggle-node=\"53d719a49380174a7766dd85\" data-visible=\"false\">");_.b("\n" + i);_.b("      show layer</a></h4>");_.b("\n" + i);_.b("        <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,524,554,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites with Resource Consents.</p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:250px;\">Consent Type</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("coastal_consents",c,p,1),c,p,0,893,978,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("hasUses",c,p,1),c,p,0,1074,4145,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hasRecUses",c,p,1),c,p,0,1092,2356,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Recreational Uses </h4>");_.b("\n" + i);_.b("      <!--");_.b("\n" + i);if(_.s(_.f("hasSmaro",c,p,1),c,p,0,1200,1688,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("        <p><strong>Spectrum of MArine Recreational Opportunity (SMARO)</strong></p>");_.b("\n" + i);_.b("          <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,1339,1349,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" includes area(s) identified as having <strong> medium or high </strong> recreational opportunity.");_.b("\n" + i);_.b("          <em>You can find more information on SMARO in the \"data description\" by right clicking on the layer name.</em>");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("        </br></br>");_.b("\n");};});c.pop();}_.b("      -->");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:250px;\">Activity Type</th>");_.b("\n" + i);_.b("              <th>Number of Sites</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasRecUses",c,p,1),c,p,0,1959,2141,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("rec_uses",c,p,1),c,p,0,1987,2115,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("COUNT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasRecUses",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td colspan=2><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("hasHeritage",c,p,1),c,p,0,2391,3346,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Archeological Information ");_.b("\n" + i);_.b("          <a href=\"#\" data-toggle-node=\"5578f14cff39059a583646c9\" data-visible=\"false\">show layer</a>");_.b("\n" + i);_.b("        </h4>");_.b("\n" + i);_.b("            <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,2650,2680,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites identified as having significant heritage values.</p>");_.b("\n" + i);_.b("            <table data-paging=\"10\">");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th style=\"width:250px;\">Heritage Type</th>");_.b("\n" + i);_.b("                  <th>Number of Sites</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("              <tbody>");_.b("\n" + i);if(_.s(_.f("heritage",c,p,1),c,p,0,3113,3251,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <tr>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("COUNT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                </tr>");_.b("\n");});c.pop();}_.b("              </tbody>");_.b("\n" + i);_.b("            </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");};});c.pop();}if(_.s(_.f("hasInfrastructure",c,p,1),c,p,0,3387,4122,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Infrastructure</h4>");_.b("\n" + i);_.b("            <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,3523,3553,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites with existing infrastructure.</p>");_.b("\n" + i);_.b("            <table data-paging=\"10\">");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th style=\"width:250px;\">Type</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("              <tbody>");_.b("\n" + i);if(_.s(_.f("infrastructure",c,p,1),c,p,0,3920,4021,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <tr>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                </tr>");_.b("\n");});c.pop();}_.b("              </tbody>");_.b("\n" + i);_.b("            </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");};});c.pop();}});c.pop();}if(!_.s(_.f("hasUses",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Activities and Uses</h4>");_.b("\n" + i);_.b("        <p>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,4281,4291,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("  does <strong>not</strong> include any <strong>activities or uses</strong>.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};_.b("\n" + i);if(_.s(_.f("hasSeabirds",c,p,1),c,p,0,4468,5194,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Birds </h4>");_.b("\n" + i);if(_.s(_.f("hasSeabirdAreas",c,p,1),c,p,0,4556,4840,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <p class=\"large\"><strong>Important Seabird Areas</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("seabirds",c,p,1),c,p,0,4703,4783,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n");});c.pop();}_.b("    ");_.b("\n" + i);if(_.s(_.f("hasSeabirdColonies",c,p,1),c,p,0,4893,5163,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p class=\"large\"><strong>Seabird Colonies</strong></p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("seabird_colonies",c,p,1),c,p,0,5033,5105,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n");});c.pop();}_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("hasMarineSpecies",c,p,1),c,p,0,5232,5694,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Marine Mammals</h4>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>Species</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("mammals",c,p,1),c,p,0,5480,5560,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}if(_.s(_.f("seals",c,p,1),c,p,0,5595,5640,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(!_.s(_.f("hasMarineSpecies",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Species Information</h4>");_.b("\n" + i);_.b("        <p>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,5848,5882,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketches within the collection do ");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch does");};_.b(" <strong>not</strong> include any <strong>important marine mammal areas</strong>.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};return _.fl();;});

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = this["Templates"];
}
},{}]},{},[15])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9vdGFnby1yZXBvcnRzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvZW5hYmxlTGF5ZXJUb2dnbGVycy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvam9iSXRlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0UmVzdWx0cy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0VGFiLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvc2NyaXB0cy91dGlscy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9lbnZpcm9ubWVudC5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9maXNoaW5nLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9zY3JpcHRzL2lkcy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9vdmVydmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9yZXBvcnQuY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9vdGFnby1yZXBvcnRzL3NjcmlwdHMvdXNlcy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBLENBQU8sQ0FBVSxDQUFBLEdBQVgsQ0FBTixFQUFrQjtDQUNoQixLQUFBLDJFQUFBO0NBQUEsQ0FBQSxDQUFBO0NBQUEsQ0FDQSxDQUFBLEdBQVk7Q0FEWixDQUVBLENBQUEsR0FBTTtBQUNDLENBQVAsQ0FBQSxDQUFBLENBQUE7Q0FDRSxFQUFBLENBQUEsR0FBTyxxQkFBUDtDQUNBLFNBQUE7SUFMRjtDQUFBLENBTUEsQ0FBVyxDQUFBLElBQVgsYUFBVztDQUVYO0NBQUEsTUFBQSxvQ0FBQTt3QkFBQTtDQUNFLEVBQVcsQ0FBWCxHQUFXLENBQVg7Q0FBQSxFQUNTLENBQVQsRUFBQSxFQUFpQixLQUFSO0NBQ1Q7Q0FDRSxFQUFPLENBQVAsRUFBQSxVQUFPO0NBQVAsRUFD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SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIixudWxsLCJtb2R1bGUuZXhwb3J0cyA9IChlbCkgLT5cbiAgJGVsID0gJCBlbFxuICBhcHAgPSB3aW5kb3cuYXBwXG4gIHRvYyA9IGFwcC5nZXRUb2MoKVxuICB1bmxlc3MgdG9jXG4gICAgY29uc29sZS5sb2cgJ05vIHRhYmxlIG9mIGNvbnRlbnRzIGZvdW5kJ1xuICAgIHJldHVyblxuICB0b2dnbGVycyA9ICRlbC5maW5kKCdhW2RhdGEtdG9nZ2xlLW5vZGVdJylcbiAgIyBTZXQgaW5pdGlhbCBzdGF0ZVxuICBmb3IgdG9nZ2xlciBpbiB0b2dnbGVycy50b0FycmF5KClcbiAgICAkdG9nZ2xlciA9ICQodG9nZ2xlcilcbiAgICBub2RlaWQgPSAkdG9nZ2xlci5kYXRhKCd0b2dnbGUtbm9kZScpXG4gICAgdHJ5XG4gICAgICB2aWV3ID0gdG9jLmdldENoaWxkVmlld0J5SWQgbm9kZWlkXG4gICAgICBub2RlID0gdmlldy5tb2RlbFxuICAgICAgJHRvZ2dsZXIuYXR0ciAnZGF0YS12aXNpYmxlJywgISFub2RlLmdldCgndmlzaWJsZScpXG4gICAgICAkdG9nZ2xlci5kYXRhICd0b2NJdGVtJywgdmlld1xuICAgIGNhdGNoIGVcbiAgICAgICR0b2dnbGVyLmF0dHIgJ2RhdGEtbm90LWZvdW5kJywgJ3RydWUnXG5cbiAgdG9nZ2xlcnMub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgJGVsID0gJChlLnRhcmdldClcbiAgICB2aWV3ID0gJGVsLmRhdGEoJ3RvY0l0ZW0nKVxuICAgIGlmIHZpZXdcbiAgICAgIHZpZXcudG9nZ2xlVmlzaWJpbGl0eShlKVxuICAgICAgJGVsLmF0dHIgJ2RhdGEtdmlzaWJsZScsICEhdmlldy5tb2RlbC5nZXQoJ3Zpc2libGUnKVxuICAgIGVsc2VcbiAgICAgIGFsZXJ0IFwiTGF5ZXIgbm90IGZvdW5kIGluIHRoZSBjdXJyZW50IFRhYmxlIG9mIENvbnRlbnRzLiBcXG5FeHBlY3RlZCBub2RlaWQgI3skZWwuZGF0YSgndG9nZ2xlLW5vZGUnKX1cIlxuIiwiY2xhc3MgSm9iSXRlbSBleHRlbmRzIEJhY2tib25lLlZpZXdcbiAgY2xhc3NOYW1lOiAncmVwb3J0UmVzdWx0J1xuICBldmVudHM6IHt9XG4gIGJpbmRpbmdzOlxuICAgIFwiaDYgYVwiOlxuICAgICAgb2JzZXJ2ZTogXCJzZXJ2aWNlTmFtZVwiXG4gICAgICB1cGRhdGVWaWV3OiB0cnVlXG4gICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICBuYW1lOiAnaHJlZidcbiAgICAgICAgb2JzZXJ2ZTogJ3NlcnZpY2VVcmwnXG4gICAgICB9XVxuICAgIFwiLnN0YXJ0ZWRBdFwiOlxuICAgICAgb2JzZXJ2ZTogW1wic3RhcnRlZEF0XCIsIFwic3RhdHVzXCJdXG4gICAgICB2aXNpYmxlOiAoKSAtPlxuICAgICAgICBAbW9kZWwuZ2V0KCdzdGF0dXMnKSBub3QgaW4gWydjb21wbGV0ZScsICdlcnJvciddXG4gICAgICB1cGRhdGVWaWV3OiB0cnVlXG4gICAgICBvbkdldDogKCkgLT5cbiAgICAgICAgaWYgQG1vZGVsLmdldCgnc3RhcnRlZEF0JylcbiAgICAgICAgICByZXR1cm4gXCJTdGFydGVkIFwiICsgbW9tZW50KEBtb2RlbC5nZXQoJ3N0YXJ0ZWRBdCcpKS5mcm9tTm93KCkgKyBcIi4gXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFwiXCJcbiAgICBcIi5zdGF0dXNcIjogICAgICBcbiAgICAgIG9ic2VydmU6IFwic3RhdHVzXCJcbiAgICAgIG9uR2V0OiAocykgLT5cbiAgICAgICAgc3dpdGNoIHNcbiAgICAgICAgICB3aGVuICdwZW5kaW5nJ1xuICAgICAgICAgICAgXCJ3YWl0aW5nIGluIGxpbmVcIlxuICAgICAgICAgIHdoZW4gJ3J1bm5pbmcnXG4gICAgICAgICAgICBcInJ1bm5pbmcgYW5hbHl0aWNhbCBzZXJ2aWNlXCJcbiAgICAgICAgICB3aGVuICdjb21wbGV0ZSdcbiAgICAgICAgICAgIFwiY29tcGxldGVkXCJcbiAgICAgICAgICB3aGVuICdlcnJvcidcbiAgICAgICAgICAgIFwiYW4gZXJyb3Igb2NjdXJyZWRcIlxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNcbiAgICBcIi5xdWV1ZUxlbmd0aFwiOiBcbiAgICAgIG9ic2VydmU6IFwicXVldWVMZW5ndGhcIlxuICAgICAgb25HZXQ6ICh2KSAtPlxuICAgICAgICBzID0gXCJXYWl0aW5nIGJlaGluZCAje3Z9IGpvYlwiXG4gICAgICAgIGlmIHYubGVuZ3RoID4gMVxuICAgICAgICAgIHMgKz0gJ3MnXG4gICAgICAgIHJldHVybiBzICsgXCIuIFwiXG4gICAgICB2aXNpYmxlOiAodikgLT5cbiAgICAgICAgdj8gYW5kIHBhcnNlSW50KHYpID4gMFxuICAgIFwiLmVycm9yc1wiOlxuICAgICAgb2JzZXJ2ZTogJ2Vycm9yJ1xuICAgICAgdXBkYXRlVmlldzogdHJ1ZVxuICAgICAgdmlzaWJsZTogKHYpIC0+XG4gICAgICAgIHY/Lmxlbmd0aCA+IDJcbiAgICAgIG9uR2V0OiAodikgLT5cbiAgICAgICAgaWYgdj9cbiAgICAgICAgICBKU09OLnN0cmluZ2lmeSh2LCBudWxsLCAnICAnKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQG1vZGVsKSAtPlxuICAgIHN1cGVyKClcblxuICByZW5kZXI6ICgpIC0+XG4gICAgQCRlbC5odG1sIFwiXCJcIlxuICAgICAgPGg2PjxhIGhyZWY9XCIjXCIgdGFyZ2V0PVwiX2JsYW5rXCI+PC9hPjxzcGFuIGNsYXNzPVwic3RhdHVzXCI+PC9zcGFuPjwvaDY+XG4gICAgICA8ZGl2PlxuICAgICAgICA8c3BhbiBjbGFzcz1cInN0YXJ0ZWRBdFwiPjwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJxdWV1ZUxlbmd0aFwiPjwvc3Bhbj5cbiAgICAgICAgPHByZSBjbGFzcz1cImVycm9yc1wiPjwvcHJlPlxuICAgICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gICAgQHN0aWNraXQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEpvYkl0ZW0iLCJjbGFzcyBSZXBvcnRSZXN1bHRzIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXG4gIGRlZmF1bHRQb2xsaW5nSW50ZXJ2YWw6IDMwMDBcblxuICBjb25zdHJ1Y3RvcjogKEBza2V0Y2gsIEBkZXBzKSAtPlxuICAgIEB1cmwgPSB1cmwgPSBcIi9yZXBvcnRzLyN7QHNrZXRjaC5pZH0vI3tAZGVwcy5qb2luKCcsJyl9XCJcbiAgICBzdXBlcigpXG5cbiAgcG9sbDogKCkgPT5cbiAgICBAZmV0Y2gge1xuICAgICAgc3VjY2VzczogKCkgPT5cbiAgICAgICAgQHRyaWdnZXIgJ2pvYnMnXG4gICAgICAgIGZvciByZXN1bHQgaW4gQG1vZGVsc1xuICAgICAgICAgIGlmIHJlc3VsdC5nZXQoJ3N0YXR1cycpIG5vdCBpbiBbJ2NvbXBsZXRlJywgJ2Vycm9yJ11cbiAgICAgICAgICAgIHVubGVzcyBAaW50ZXJ2YWxcbiAgICAgICAgICAgICAgQGludGVydmFsID0gc2V0SW50ZXJ2YWwgQHBvbGwsIEBkZWZhdWx0UG9sbGluZ0ludGVydmFsXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICBjb25zb2xlLmxvZyBAbW9kZWxzWzBdLmdldCgncGF5bG9hZFNpemVCeXRlcycpXG4gICAgICAgICAgcGF5bG9hZFNpemUgPSBNYXRoLnJvdW5kKCgoQG1vZGVsc1swXS5nZXQoJ3BheWxvYWRTaXplQnl0ZXMnKSBvciAwKSAvIDEwMjQpICogMTAwKSAvIDEwMFxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiRmVhdHVyZVNldCBzZW50IHRvIEdQIHdlaWdoZWQgaW4gYXQgI3twYXlsb2FkU2l6ZX1rYlwiXG4gICAgICAgICMgYWxsIGNvbXBsZXRlIHRoZW5cbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGludGVydmFsKSBpZiBAaW50ZXJ2YWxcbiAgICAgICAgaWYgcHJvYmxlbSA9IF8uZmluZChAbW9kZWxzLCAocikgLT4gci5nZXQoJ2Vycm9yJyk/KVxuICAgICAgICAgIEB0cmlnZ2VyICdlcnJvcicsIFwiUHJvYmxlbSB3aXRoICN7cHJvYmxlbS5nZXQoJ3NlcnZpY2VOYW1lJyl9IGpvYlwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAdHJpZ2dlciAnZmluaXNoZWQnXG4gICAgICBlcnJvcjogKGUsIHJlcywgYSwgYikgPT5cbiAgICAgICAgdW5sZXNzIHJlcy5zdGF0dXMgaXMgMFxuICAgICAgICAgIGlmIHJlcy5yZXNwb25zZVRleHQ/Lmxlbmd0aFxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgIGpzb24gPSBKU09OLnBhcnNlKHJlcy5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgICAjIGRvIG5vdGhpbmdcbiAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAaW50ZXJ2YWwpIGlmIEBpbnRlcnZhbFxuICAgICAgICAgIEB0cmlnZ2VyICdlcnJvcicsIGpzb24/LmVycm9yPy5tZXNzYWdlIG9yXG4gICAgICAgICAgICAnUHJvYmxlbSBjb250YWN0aW5nIHRoZSBTZWFTa2V0Y2ggc2VydmVyJ1xuICAgIH1cblxubW9kdWxlLmV4cG9ydHMgPSBSZXBvcnRSZXN1bHRzXG4iLCJlbmFibGVMYXllclRvZ2dsZXJzID0gcmVxdWlyZSAnLi9lbmFibGVMYXllclRvZ2dsZXJzLmNvZmZlZSdcbnJvdW5kID0gcmVxdWlyZSgnLi91dGlscy5jb2ZmZWUnKS5yb3VuZFxuUmVwb3J0UmVzdWx0cyA9IHJlcXVpcmUgJy4vcmVwb3J0UmVzdWx0cy5jb2ZmZWUnXG50ID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcycpXG50ZW1wbGF0ZXMgPVxuICByZXBvcnRMb2FkaW5nOiB0Wydub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvcmVwb3J0TG9hZGluZyddXG5Kb2JJdGVtID0gcmVxdWlyZSAnLi9qb2JJdGVtLmNvZmZlZSdcbkNvbGxlY3Rpb25WaWV3ID0gcmVxdWlyZSgndmlld3MvY29sbGVjdGlvblZpZXcnKVxuXG5jbGFzcyBSZWNvcmRTZXRcblxuICBjb25zdHJ1Y3RvcjogKEBkYXRhLCBAdGFiLCBAc2tldGNoQ2xhc3NJZCkgLT5cblxuICB0b0FycmF5OiAoKSAtPlxuICAgIGlmIEBza2V0Y2hDbGFzc0lkXG4gICAgICBkYXRhID0gXy5maW5kIEBkYXRhLnZhbHVlLCAodikgPT5cbiAgICAgICAgdi5mZWF0dXJlcz9bMF0/LmF0dHJpYnV0ZXM/WydTQ19JRCddIGlzIEBza2V0Y2hDbGFzc0lkXG4gICAgICB1bmxlc3MgZGF0YVxuICAgICAgICB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIGRhdGEgZm9yIHNrZXRjaENsYXNzICN7QHNrZXRjaENsYXNzSWR9XCJcbiAgICBlbHNlXG4gICAgICBpZiBfLmlzQXJyYXkgQGRhdGEudmFsdWVcbiAgICAgICAgZGF0YSA9IEBkYXRhLnZhbHVlWzBdXG4gICAgICBlbHNlXG4gICAgICAgIGRhdGEgPSBAZGF0YS52YWx1ZVxuICAgIF8ubWFwIGRhdGEuZmVhdHVyZXMsIChmZWF0dXJlKSAtPlxuICAgICAgZmVhdHVyZS5hdHRyaWJ1dGVzXG5cbiAgcmF3OiAoYXR0cikgLT5cbiAgICBhdHRycyA9IF8ubWFwIEB0b0FycmF5KCksIChyb3cpIC0+XG4gICAgICByb3dbYXR0cl1cbiAgICBhdHRycyA9IF8uZmlsdGVyIGF0dHJzLCAoYXR0cikgLT4gYXR0ciAhPSB1bmRlZmluZWRcbiAgICBpZiBhdHRycy5sZW5ndGggaXMgMFxuICAgICAgY29uc29sZS5sb2cgQGRhdGFcbiAgICAgIEB0YWIucmVwb3J0RXJyb3IgXCJDb3VsZCBub3QgZ2V0IGF0dHJpYnV0ZSAje2F0dHJ9IGZyb20gcmVzdWx0c1wiXG4gICAgICB0aHJvdyBcIkNvdWxkIG5vdCBnZXQgYXR0cmlidXRlICN7YXR0cn1cIlxuICAgIGVsc2UgaWYgYXR0cnMubGVuZ3RoIGlzIDFcbiAgICAgIHJldHVybiBhdHRyc1swXVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBhdHRyc1xuXG4gIGludDogKGF0dHIpIC0+XG4gICAgcmF3ID0gQHJhdyhhdHRyKVxuICAgIGlmIF8uaXNBcnJheShyYXcpXG4gICAgICBfLm1hcCByYXcsIHBhcnNlSW50XG4gICAgZWxzZVxuICAgICAgcGFyc2VJbnQocmF3KVxuXG4gIGZsb2F0OiAoYXR0ciwgZGVjaW1hbFBsYWNlcz0yKSAtPlxuICAgIHJhdyA9IEByYXcoYXR0cilcbiAgICBpZiBfLmlzQXJyYXkocmF3KVxuICAgICAgXy5tYXAgcmF3LCAodmFsKSAtPiByb3VuZCh2YWwsIGRlY2ltYWxQbGFjZXMpXG4gICAgZWxzZVxuICAgICAgcm91bmQocmF3LCBkZWNpbWFsUGxhY2VzKVxuXG4gIGJvb2w6IChhdHRyKSAtPlxuICAgIHJhdyA9IEByYXcoYXR0cilcbiAgICBpZiBfLmlzQXJyYXkocmF3KVxuICAgICAgXy5tYXAgcmF3LCAodmFsKSAtPiB2YWwudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpIGlzICd0cnVlJ1xuICAgIGVsc2VcbiAgICAgIHJhdy50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgaXMgJ3RydWUnXG5cbmNsYXNzIFJlcG9ydFRhYiBleHRlbmRzIEJhY2tib25lLlZpZXdcbiAgbmFtZTogJ0luZm9ybWF0aW9uJ1xuICBkZXBlbmRlbmNpZXM6IFtdXG5cbiAgaW5pdGlhbGl6ZTogKEBtb2RlbCwgQG9wdGlvbnMpIC0+XG4gICAgIyBXaWxsIGJlIGluaXRpYWxpemVkIGJ5IFNlYVNrZXRjaCB3aXRoIHRoZSBmb2xsb3dpbmcgYXJndW1lbnRzOlxuICAgICMgICAqIG1vZGVsIC0gVGhlIHNrZXRjaCBiZWluZyByZXBvcnRlZCBvblxuICAgICMgICAqIG9wdGlvbnNcbiAgICAjICAgICAtIC5wYXJlbnQgLSB0aGUgcGFyZW50IHJlcG9ydCB2aWV3XG4gICAgIyAgICAgICAgY2FsbCBAb3B0aW9ucy5wYXJlbnQuZGVzdHJveSgpIHRvIGNsb3NlIHRoZSB3aG9sZSByZXBvcnQgd2luZG93XG4gICAgQGFwcCA9IHdpbmRvdy5hcHBcbiAgICBfLmV4dGVuZCBALCBAb3B0aW9uc1xuICAgIEByZXBvcnRSZXN1bHRzID0gbmV3IFJlcG9ydFJlc3VsdHMoQG1vZGVsLCBAZGVwZW5kZW5jaWVzKVxuICAgIEBsaXN0ZW5Ub09uY2UgQHJlcG9ydFJlc3VsdHMsICdlcnJvcicsIEByZXBvcnRFcnJvclxuICAgIEBsaXN0ZW5Ub09uY2UgQHJlcG9ydFJlc3VsdHMsICdqb2JzJywgQHJlbmRlckpvYkRldGFpbHNcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAnam9icycsIEByZXBvcnRKb2JzXG4gICAgQGxpc3RlblRvIEByZXBvcnRSZXN1bHRzLCAnZmluaXNoZWQnLCBfLmJpbmQgQHJlbmRlciwgQFxuICAgIEBsaXN0ZW5Ub09uY2UgQHJlcG9ydFJlc3VsdHMsICdyZXF1ZXN0JywgQHJlcG9ydFJlcXVlc3RlZFxuXG4gIHJlbmRlcjogKCkgLT5cbiAgICB0aHJvdyAncmVuZGVyIG1ldGhvZCBtdXN0IGJlIG92ZXJpZGRlbidcblxuICBzaG93OiAoKSAtPlxuICAgIEAkZWwuc2hvdygpXG4gICAgQHZpc2libGUgPSB0cnVlXG4gICAgaWYgQGRlcGVuZGVuY2llcz8ubGVuZ3RoIGFuZCAhQHJlcG9ydFJlc3VsdHMubW9kZWxzLmxlbmd0aFxuICAgICAgQHJlcG9ydFJlc3VsdHMucG9sbCgpXG4gICAgZWxzZSBpZiAhQGRlcGVuZGVuY2llcz8ubGVuZ3RoXG4gICAgICBAcmVuZGVyKClcbiAgICAgIEAkKCdbZGF0YS1hdHRyaWJ1dGUtdHlwZT1VcmxGaWVsZF0gLnZhbHVlLCBbZGF0YS1hdHRyaWJ1dGUtdHlwZT1VcGxvYWRGaWVsZF0gLnZhbHVlJykuZWFjaCAoKSAtPlxuICAgICAgICB0ZXh0ID0gJChAKS50ZXh0KClcbiAgICAgICAgaHRtbCA9IFtdXG4gICAgICAgIGZvciB1cmwgaW4gdGV4dC5zcGxpdCgnLCcpXG4gICAgICAgICAgaWYgdXJsLmxlbmd0aFxuICAgICAgICAgICAgbmFtZSA9IF8ubGFzdCh1cmwuc3BsaXQoJy8nKSlcbiAgICAgICAgICAgIGh0bWwucHVzaCBcIlwiXCI8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+I3tuYW1lfTwvYT5cIlwiXCJcbiAgICAgICAgJChAKS5odG1sIGh0bWwuam9pbignLCAnKVxuXG5cbiAgaGlkZTogKCkgLT5cbiAgICBAJGVsLmhpZGUoKVxuICAgIEB2aXNpYmxlID0gZmFsc2VcblxuICByZW1vdmU6ICgpID0+XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwgQGV0YUludGVydmFsXG4gICAgQHN0b3BMaXN0ZW5pbmcoKVxuICAgIHN1cGVyKClcblxuICByZXBvcnRSZXF1ZXN0ZWQ6ICgpID0+XG4gICAgQCRlbC5odG1sIHRlbXBsYXRlcy5yZXBvcnRMb2FkaW5nLnJlbmRlcih7fSlcblxuICByZXBvcnRFcnJvcjogKG1zZywgY2FuY2VsbGVkUmVxdWVzdCkgPT5cbiAgICB1bmxlc3MgY2FuY2VsbGVkUmVxdWVzdFxuICAgICAgaWYgbXNnIGlzICdKT0JfRVJST1InXG4gICAgICAgIEBzaG93RXJyb3IgJ0Vycm9yIHdpdGggc3BlY2lmaWMgam9iJ1xuICAgICAgZWxzZVxuICAgICAgICBAc2hvd0Vycm9yIG1zZ1xuXG4gIHNob3dFcnJvcjogKG1zZykgPT5cbiAgICBAJCgnLnByb2dyZXNzJykucmVtb3ZlKClcbiAgICBAJCgncC5lcnJvcicpLnJlbW92ZSgpXG4gICAgQCQoJ2g0JykudGV4dChcIkFuIEVycm9yIE9jY3VycmVkXCIpLmFmdGVyIFwiXCJcIlxuICAgICAgPHAgY2xhc3M9XCJlcnJvclwiIHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+I3ttc2d9PC9wPlxuICAgIFwiXCJcIlxuXG4gIHJlcG9ydEpvYnM6ICgpID0+XG4gICAgdW5sZXNzIEBtYXhFdGFcbiAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLndpZHRoKCcxMDAlJylcbiAgICBAJCgnaDQnKS50ZXh0IFwiQW5hbHl6aW5nIERlc2lnbnNcIlxuXG4gIHN0YXJ0RXRhQ291bnRkb3duOiAoKSA9PlxuICAgIGlmIEBtYXhFdGFcbiAgICAgIF8uZGVsYXkgKCkgPT5cbiAgICAgICAgQHJlcG9ydFJlc3VsdHMucG9sbCgpXG4gICAgICAsIChAbWF4RXRhICsgMSkgKiAxMDAwXG4gICAgICBfLmRlbGF5ICgpID0+XG4gICAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLmNzcyAndHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb24nLCAnbGluZWFyJ1xuICAgICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS5jc3MgJ3RyYW5zaXRpb24tZHVyYXRpb24nLCBcIiN7QG1heEV0YSArIDF9c1wiXG4gICAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLndpZHRoKCcxMDAlJylcbiAgICAgICwgNTAwXG5cbiAgcmVuZGVySm9iRGV0YWlsczogKCkgPT5cbiAgICBtYXhFdGEgPSBudWxsXG4gICAgZm9yIGpvYiBpbiBAcmVwb3J0UmVzdWx0cy5tb2RlbHNcbiAgICAgIGlmIGpvYi5nZXQoJ2V0YVNlY29uZHMnKVxuICAgICAgICBpZiAhbWF4RXRhIG9yIGpvYi5nZXQoJ2V0YVNlY29uZHMnKSA+IG1heEV0YVxuICAgICAgICAgIG1heEV0YSA9IGpvYi5nZXQoJ2V0YVNlY29uZHMnKVxuICAgIGlmIG1heEV0YVxuICAgICAgQG1heEV0YSA9IG1heEV0YVxuICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykud2lkdGgoJzUlJylcbiAgICAgIEBzdGFydEV0YUNvdW50ZG93bigpXG5cbiAgICBAJCgnW3JlbD1kZXRhaWxzXScpLmNzcygnZGlzcGxheScsICdibG9jaycpXG4gICAgQCQoJ1tyZWw9ZGV0YWlsc10nKS5jbGljayAoZSkgPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgQCQoJ1tyZWw9ZGV0YWlsc10nKS5oaWRlKClcbiAgICAgIEAkKCcuZGV0YWlscycpLnNob3coKVxuICAgIGZvciBqb2IgaW4gQHJlcG9ydFJlc3VsdHMubW9kZWxzXG4gICAgICBpdGVtID0gbmV3IEpvYkl0ZW0oam9iKVxuICAgICAgaXRlbS5yZW5kZXIoKVxuICAgICAgQCQoJy5kZXRhaWxzJykuYXBwZW5kIGl0ZW0uZWxcblxuICBnZXRSZXN1bHQ6IChpZCkgLT5cbiAgICByZXN1bHRzID0gQGdldFJlc3VsdHMoKVxuICAgIHJlc3VsdCA9IF8uZmluZCByZXN1bHRzLCAocikgLT4gci5wYXJhbU5hbWUgaXMgaWRcbiAgICB1bmxlc3MgcmVzdWx0P1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyByZXN1bHQgd2l0aCBpZCAnICsgaWQpXG4gICAgcmVzdWx0LnZhbHVlXG5cbiAgZ2V0Rmlyc3RSZXN1bHQ6IChwYXJhbSwgaWQpIC0+XG4gICAgcmVzdWx0ID0gQGdldFJlc3VsdChwYXJhbSlcbiAgICB0cnlcbiAgICAgIHJldHVybiByZXN1bHRbMF0uZmVhdHVyZXNbMF0uYXR0cmlidXRlc1tpZF1cbiAgICBjYXRjaCBlXG4gICAgICB0aHJvdyBcIkVycm9yIGZpbmRpbmcgI3twYXJhbX06I3tpZH0gaW4gZ3AgcmVzdWx0c1wiXG5cbiAgZ2V0UmVzdWx0czogKCkgLT5cbiAgICByZXN1bHRzID0gQHJlcG9ydFJlc3VsdHMubWFwKChyZXN1bHQpIC0+IHJlc3VsdC5nZXQoJ3Jlc3VsdCcpLnJlc3VsdHMpXG4gICAgdW5sZXNzIHJlc3VsdHM/Lmxlbmd0aFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBncCByZXN1bHRzJylcbiAgICBfLmZpbHRlciByZXN1bHRzLCAocmVzdWx0KSAtPlxuICAgICAgcmVzdWx0LnBhcmFtTmFtZSBub3QgaW4gWydSZXN1bHRDb2RlJywgJ1Jlc3VsdE1zZyddXG5cbiAgcmVjb3JkU2V0OiAoZGVwZW5kZW5jeSwgcGFyYW1OYW1lLCBza2V0Y2hDbGFzc0lkPWZhbHNlKSAtPlxuICAgIHVubGVzcyBkZXBlbmRlbmN5IGluIEBkZXBlbmRlbmNpZXNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlVua25vd24gZGVwZW5kZW5jeSAje2RlcGVuZGVuY3l9XCJcbiAgICBkZXAgPSBAcmVwb3J0UmVzdWx0cy5maW5kIChyKSAtPiByLmdldCgnc2VydmljZU5hbWUnKSBpcyBkZXBlbmRlbmN5XG4gICAgdW5sZXNzIGRlcFxuICAgICAgY29uc29sZS5sb2cgQHJlcG9ydFJlc3VsdHMubW9kZWxzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDb3VsZCBub3QgZmluZCByZXN1bHRzIGZvciAje2RlcGVuZGVuY3l9LlwiXG4gICAgcGFyYW0gPSBfLmZpbmQgZGVwLmdldCgncmVzdWx0JykucmVzdWx0cywgKHBhcmFtKSAtPlxuICAgICAgcGFyYW0ucGFyYW1OYW1lIGlzIHBhcmFtTmFtZVxuICAgIHVubGVzcyBwYXJhbVxuICAgICAgY29uc29sZS5sb2cgZGVwLmdldCgnZGF0YScpLnJlc3VsdHNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIkNvdWxkIG5vdCBmaW5kIHBhcmFtICN7cGFyYW1OYW1lfSBpbiAje2RlcGVuZGVuY3l9XCJcbiAgICBuZXcgUmVjb3JkU2V0KHBhcmFtLCBALCBza2V0Y2hDbGFzc0lkKVxuXG4gIGVuYWJsZVRhYmxlUGFnaW5nOiAoKSAtPlxuICAgIEAkKCdbZGF0YS1wYWdpbmddJykuZWFjaCAoKSAtPlxuICAgICAgJHRhYmxlID0gJChAKVxuICAgICAgcGFnZVNpemUgPSAkdGFibGUuZGF0YSgncGFnaW5nJylcbiAgICAgIHJvd3MgPSAkdGFibGUuZmluZCgndGJvZHkgdHInKS5sZW5ndGhcbiAgICAgIHBhZ2VzID0gTWF0aC5jZWlsKHJvd3MgLyBwYWdlU2l6ZSlcbiAgICAgIGlmIHBhZ2VzID4gMVxuICAgICAgICAkdGFibGUuYXBwZW5kIFwiXCJcIlxuICAgICAgICAgIDx0Zm9vdD5cbiAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgPHRkIGNvbHNwYW49XCIjeyR0YWJsZS5maW5kKCd0aGVhZCB0aCcpLmxlbmd0aH1cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGFnaW5hdGlvblwiPlxuICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj5QcmV2PC9hPjwvbGk+XG4gICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICA8L3Rmb290PlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgdWwgPSAkdGFibGUuZmluZCgndGZvb3QgdWwnKVxuICAgICAgICBmb3IgaSBpbiBfLnJhbmdlKDEsIHBhZ2VzICsgMSlcbiAgICAgICAgICB1bC5hcHBlbmQgXCJcIlwiXG4gICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj4je2l9PC9hPjwvbGk+XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHVsLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj5OZXh0PC9hPjwvbGk+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICAkdGFibGUuZmluZCgnbGkgYScpLmNsaWNrIChlKSAtPlxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICRhID0gJCh0aGlzKVxuICAgICAgICAgIHRleHQgPSAkYS50ZXh0KClcbiAgICAgICAgICBpZiB0ZXh0IGlzICdOZXh0J1xuICAgICAgICAgICAgYSA9ICRhLnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJy5hY3RpdmUnKS5uZXh0KCkuZmluZCgnYScpXG4gICAgICAgICAgICB1bmxlc3MgYS50ZXh0KCkgaXMgJ05leHQnXG4gICAgICAgICAgICAgIGEuY2xpY2soKVxuICAgICAgICAgIGVsc2UgaWYgdGV4dCBpcyAnUHJldidcbiAgICAgICAgICAgIGEgPSAkYS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuYWN0aXZlJykucHJldigpLmZpbmQoJ2EnKVxuICAgICAgICAgICAgdW5sZXNzIGEudGV4dCgpIGlzICdQcmV2J1xuICAgICAgICAgICAgICBhLmNsaWNrKClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAkYS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgICRhLnBhcmVudCgpLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICBuID0gcGFyc2VJbnQodGV4dClcbiAgICAgICAgICAgICR0YWJsZS5maW5kKCd0Ym9keSB0cicpLmhpZGUoKVxuICAgICAgICAgICAgb2Zmc2V0ID0gcGFnZVNpemUgKiAobiAtIDEpXG4gICAgICAgICAgICAkdGFibGUuZmluZChcInRib2R5IHRyXCIpLnNsaWNlKG9mZnNldCwgbipwYWdlU2l6ZSkuc2hvdygpXG4gICAgICAgICQoJHRhYmxlLmZpbmQoJ2xpIGEnKVsxXSkuY2xpY2soKVxuXG4gICAgICBpZiBub1Jvd3NNZXNzYWdlID0gJHRhYmxlLmRhdGEoJ25vLXJvd3MnKVxuICAgICAgICBpZiByb3dzIGlzIDBcbiAgICAgICAgICBwYXJlbnQgPSAkdGFibGUucGFyZW50KClcbiAgICAgICAgICAkdGFibGUucmVtb3ZlKClcbiAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2xhc3MgJ3RhYmxlQ29udGFpbmVyJ1xuICAgICAgICAgIHBhcmVudC5hcHBlbmQgXCI8cD4je25vUm93c01lc3NhZ2V9PC9wPlwiXG5cbiAgZW5hYmxlTGF5ZXJUb2dnbGVyczogKCkgLT5cbiAgICBlbmFibGVMYXllclRvZ2dsZXJzKEAkZWwpXG5cbiAgZ2V0Q2hpbGRyZW46IChza2V0Y2hDbGFzc0lkKSAtPlxuICAgIF8uZmlsdGVyIEBjaGlsZHJlbiwgKGNoaWxkKSAtPiBjaGlsZC5nZXRTa2V0Y2hDbGFzcygpLmlkIGlzIHNrZXRjaENsYXNzSWRcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlcG9ydFRhYlxuIiwibW9kdWxlLmV4cG9ydHMgPVxuICBcbiAgcm91bmQ6IChudW1iZXIsIGRlY2ltYWxQbGFjZXMpIC0+XG4gICAgdW5sZXNzIF8uaXNOdW1iZXIgbnVtYmVyXG4gICAgICBudW1iZXIgPSBwYXJzZUZsb2F0KG51bWJlcilcbiAgICBtdWx0aXBsaWVyID0gTWF0aC5wb3cgMTAsIGRlY2ltYWxQbGFjZXNcbiAgICBNYXRoLnJvdW5kKG51bWJlciAqIG11bHRpcGxpZXIpIC8gbXVsdGlwbGllciIsInRoaXNbXCJUZW1wbGF0ZXNcIl0gPSB0aGlzW1wiVGVtcGxhdGVzXCJdIHx8IHt9O1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9hdHRyaWJ1dGVzL2F0dHJpYnV0ZUl0ZW1cIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPHRyIGRhdGEtYXR0cmlidXRlLWlkPVxcXCJcIik7Xy5iKF8udihfLmYoXCJpZFwiLGMscCwwKSkpO18uYihcIlxcXCIgZGF0YS1hdHRyaWJ1dGUtZXhwb3J0aWQ9XFxcIlwiKTtfLmIoXy52KF8uZihcImV4cG9ydGlkXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiBkYXRhLWF0dHJpYnV0ZS10eXBlPVxcXCJcIik7Xy5iKF8udihfLmYoXCJ0eXBlXCIsYyxwLDApKSk7Xy5iKFwiXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDx0ZCBjbGFzcz1cXFwibmFtZVxcXCI+XCIpO18uYihfLnYoXy5mKFwibmFtZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8dGQgY2xhc3M9XFxcInZhbHVlXFxcIj5cIik7Xy5iKF8udihfLmYoXCJmb3JtYXR0ZWRWYWx1ZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC90cj5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9hdHRyaWJ1dGVzL2F0dHJpYnV0ZXNUYWJsZVwiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8dGFibGUgY2xhc3M9XFxcImF0dHJpYnV0ZXNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJhdHRyaWJ1dGVzXCIsYyxwLDEpLGMscCwwLDQ0LDgxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXy5ycChcImF0dHJpYnV0ZXMvYXR0cmlidXRlSXRlbVwiLGMscCxcIiAgICBcIikpO30pO2MucG9wKCk7fV8uYihcIjwvdGFibGU+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvZ2VuZXJpY0F0dHJpYnV0ZXNcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7aWYoXy5zKF8uZChcInNrZXRjaENsYXNzLmRlbGV0ZWRcIixjLHAsMSksYyxwLDAsMjQsMjcwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJhbGVydCBhbGVydC13YXJuXFxcIiBzdHlsZT1cXFwibWFyZ2luLWJvdHRvbToxMHB4O1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBUaGlzIHNrZXRjaCB3YXMgY3JlYXRlZCB1c2luZyB0aGUgXFxcIlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCJcXFwiIHRlbXBsYXRlLCB3aGljaCBpc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgbm8gbG9uZ2VyIGF2YWlsYWJsZS4gWW91IHdpbGwgbm90IGJlIGFibGUgdG8gY29weSB0aGlzIHNrZXRjaCBvciBtYWtlIG5ld1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgc2tldGNoZXMgb2YgdGhpcyB0eXBlLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+XCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIiBBdHRyaWJ1dGVzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXy5ycChcImF0dHJpYnV0ZXMvYXR0cmlidXRlc1RhYmxlXCIsYyxwLFwiICAgIFwiKSk7Xy5iKFwiICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wibm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3JlcG9ydExvYWRpbmdcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0TG9hZGluZ1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8IS0tIDxkaXYgY2xhc3M9XFxcInNwaW5uZXJcXFwiPjM8L2Rpdj4gLS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+UmVxdWVzdGluZyBSZXBvcnQgZnJvbSBTZXJ2ZXI8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGRpdiBjbGFzcz1cXFwicHJvZ3Jlc3MgcHJvZ3Jlc3Mtc3RyaXBlZCBhY3RpdmVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJiYXJcXFwiIHN0eWxlPVxcXCJ3aWR0aDogMTAwJTtcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8YSBocmVmPVxcXCIjXFxcIiByZWw9XFxcImRldGFpbHNcXFwiPmRldGFpbHM8L2E+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcImRldGFpbHNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xuXG5pZih0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gdGhpc1tcIlRlbXBsYXRlc1wiXTtcbn0iLCJSZXBvcnRUYWIgPSByZXF1aXJlICdyZXBvcnRUYWInXG50ZW1wbGF0ZXMgPSByZXF1aXJlICcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5fcGFydGlhbHMgPSByZXF1aXJlICcuLi9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxucGFydGlhbHMgPSBbXVxuZm9yIGtleSwgdmFsIG9mIF9wYXJ0aWFsc1xuICBwYXJ0aWFsc1trZXkucmVwbGFjZSgnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpLycsICcnKV0gPSB2YWxcblxuaWRzID0gcmVxdWlyZSAnLi9pZHMuY29mZmVlJ1xuZm9yIGtleSwgdmFsdWUgb2YgaWRzXG4gIHdpbmRvd1trZXldID0gdmFsdWVcblxuXG5jbGFzcyBFbnZpcm9ubWVudFRhYiBleHRlbmRzIFJlcG9ydFRhYlxuICAjIHRoaXMgaXMgdGhlIG5hbWUgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgVGFiXG4gIG5hbWU6ICdIYWJpdGF0cydcbiAgY2xhc3NOYW1lOiAnZW52aXJvbm1lbnQnXG4gIHRpbWVvdXQ6IDEyMDAwMFxuICB0ZW1wbGF0ZTogdGVtcGxhdGVzLmVudmlyb25tZW50XG4gIGRlcGVuZGVuY2llczogW1xuICAgICdIYWJpdGF0c092ZXJ2aWV3J1xuICAgICdBZGphY2VudFRlcnJlc3RyaWFsJ1xuICAgICdIYWJSZXBzVG9vbGJveCdcbiAgXVxuXG4gIHJlbmRlcjogKCkgLT5cblxuICAgICNzaG93IHRhYmxlcyBpbnN0ZWFkIG9mIGdyYXBoIGZvciBJRVxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgZDNJc1ByZXNlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgZDNJc1ByZXNlbnQgPSBmYWxzZVxuXG5cbiAgICBpc0NvbGxlY3Rpb24gPSBAbW9kZWwuaXNDb2xsZWN0aW9uKClcbiAgICBzY2lkID0gQHNrZXRjaENsYXNzLmlkXG4gICAgaWYgc2NpZCA9PSBHRU5FUklDX0lEIG9yIHNjaWQgPT0gR0VORVJJQ19DT0xMRUNUSU9OX0lEXG4gICAgICBpc0dlbmVyaWMgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgaXNHZW5lcmljID0gZmFsc2VcblxuICAgIGlzTVBBID0gKHNjaWQgPT0gTVBBX0lEIG9yIHNjaWQgPT0gTVBBX0NPTExFQ1RJT05fSUQgb3Igc2NpZCA9PSBNUEFfQ09ORklEX0NPTExFQ1RJT05fSUQpXG4gICAgXG4gICAgaGFiX3NpemVzID0gQHJlY29yZFNldCgnSGFiUmVwc1Rvb2xib3gnLCAnSGFiU2l6ZXMnKS50b0FycmF5KClcblxuICAgIGhhYnNfaW5fc2tldGNoID0gaGFiX3NpemVzPy5sZW5ndGhcbiAgICBoYWJzX3BsdXJhbCA9IGhhYnNfaW5fc2tldGNoICE9IDFcblxuICAgIHByb3RlY3RlZF9hcmVhcyA9IEByZWNvcmRTZXQoJ0FkamFjZW50VGVycmVzdHJpYWwnLCAnUHVibGljQ29uc2VydmF0aW9uTGFuZCcpLnRvQXJyYXkoKVxuICAgIGhhc1Byb3RlY3RlZCA9IHByb3RlY3RlZF9hcmVhcz8ubGVuZ3RoID4gMFxuXG4gICAgcWUyX2NvdmVuYW50cyA9IEByZWNvcmRTZXQoJ0FkamFjZW50VGVycmVzdHJpYWwnLCAnQ29hc3RhbFByb3RlY3Rpb24nKS50b0FycmF5KClcbiAgICBoYXNRRTJjb3ZlbmFudHMgPSBxZTJfY292ZW5hbnRzPy5sZW5ndGggPiAwXG5cbiAgICBuYXBhbGlzX2NvdmVuYW50cyA9IEByZWNvcmRTZXQoJ0FkamFjZW50VGVycmVzdHJpYWwnLCAnQWRqYWNlbnRMYW5kQ292ZXInKS50b0FycmF5KClcbiAgICBoYXNOYXBhbGlzQ292ZW5hbnRzID0gbmFwYWxpc19jb3ZlbmFudHM/Lmxlbmd0aCA+IDBcblxuICAgIGhhc0NvdmVuYW50cyA9IChoYXNRRTJjb3ZlbmFudHMgb3IgaGFzTmFwYWxpc0NvdmVuYW50cylcblxuICAgIGlmIGlzR2VuZXJpYyBvciAoIWlzQ29sbGVjdGlvbiBhbmQgaXNNUEEpXG4gICAgICBzaG93QWRqYWNlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgc2hvd0FkamFjZW50ID0gZmFsc2VcbiAgICBcbiAgICBoYWJpdGF0c19yZXByZXNlbnRlZCA9IEByZWNvcmRTZXQoJ0hhYlJlcHNUb29sYm94JywgJ1JlcHJlc2VudGVkSGFicycpLnRvQXJyYXkoKVxuICAgIEByb3VuZERhdGEgaGFiaXRhdHNfcmVwcmVzZW50ZWRcbiAgICBhbGxfaGFicyA9IEBwcm9jZXNzSGFiaXRhdHMoaGFiaXRhdHNfcmVwcmVzZW50ZWQpXG4gXG4gICAgaGFiX3R5cGVzID0gYWxsX2hhYnNbMF1cbiAgICBoYXNIYWJUeXBlcyA9IGhhYl90eXBlcz8ubGVuZ3RoID4gMFxuICAgIHNpZ19oYWJzID0gYWxsX2hhYnNbMV1cbiAgICBoYXNTaWdIYWJzID0gc2lnX2hhYnM/Lmxlbmd0aCA+IDBcbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuIFxuICAgIGNvbnRleHQgPVxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcbiAgICAgIGlzR2VuZXJpYzogaXNHZW5lcmljXG4gICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuICAgICAgaXNNUEE6IGlzTVBBXG5cbiAgICAgIGhhYl90eXBlczogaGFiX3R5cGVzXG4gICAgICBoYXNIYWJUeXBlczogaGFzSGFiVHlwZXNcbiAgICAgIHNpZ19oYWJzOiBzaWdfaGFic1xuICAgICAgaGFzU2lnSGFiczogaGFzU2lnSGFic1xuXG4gICAgICBoYWJzX3BsdXJhbDogaGFic19wbHVyYWxcbiAgICAgIGhhYml0YXRzX3JlcHJlc2VudGVkOiBoYWJpdGF0c19yZXByZXNlbnRlZFxuXG4gICAgICBwcm90ZWN0ZWRfYXJlYXM6IHByb3RlY3RlZF9hcmVhc1xuICAgICAgaGFzUHJvdGVjdGVkOiBoYXNQcm90ZWN0ZWRcblxuICAgICAgcWUyX2NvdmVuYW50czogcWUyX2NvdmVuYW50c1xuICAgICAgaGFzUUUyY292ZW5hbnRzOiBoYXNRRTJjb3ZlbmFudHNcblxuICAgICAgbmFwYWxpc19jb3ZlbmFudHM6IG5hcGFsaXNfY292ZW5hbnRzXG4gICAgICBoYXNOYXBhbGlzQ292ZW5hbnRzOiBoYXNOYXBhbGlzQ292ZW5hbnRzXG5cbiAgICAgIGhhc0NvdmVuYW50czogaGFzQ292ZW5hbnRzXG4gICAgICBzaG93QWRqYWNlbnQ6IHNob3dBZGphY2VudFxuICAgICAgXG4gICAgICBcblxuICAgIEAkZWwuaHRtbCBAdGVtcGxhdGUucmVuZGVyKGNvbnRleHQsIHBhcnRpYWxzKVxuICAgIEBlbmFibGVMYXllclRvZ2dsZXJzKClcbiAgICBAcm91bmREYXRhKGhhYl9zaXplcylcbiAgICBAc2V0dXBIYWJpdGF0U29ydGluZyhoYWJfdHlwZXMsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQHNldHVwU2lnSGFiaXRhdFNvcnRpbmcoc2lnX2hhYnMsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG5cbiAgICBAZW5hYmxlVGFibGVQYWdpbmcoKVxuICAgIFxuICBwcm9jZXNzSGFiaXRhdHM6IChoYWJzX3JlcHJlc2VudGVkKSA9PlxuICAgIGhhYl90eXBlcyA9IFtdXG4gICAgY3JpdGljYWxfaGFiaXRhdHMgPSBbXVxuICAgIGZvciBoYWIgaW4gaGFic19yZXByZXNlbnRlZFxuICAgICAgaWYgaGFiLkhBQl9UWVBFID09IFwiQnJ5b3pvYW4gcmVlZlwiIG9yIGhhYi5IQUJfVFlQRSA9PSBcIk1hY3JvY3lzdGlzIGJlZFwiIG9yIGhhYi5IQUJfVFlQRSA9PSBcIlNlYWdyYXNzIGJlZFwiXG4gICAgICAgIGNyaXRpY2FsX2hhYml0YXRzLnB1c2goaGFiKVxuICAgICAgZWxzZVxuICAgICAgICBoYWJfdHlwZXMucHVzaChoYWIpXG5cbiAgICBuYV9oYWJzID0gW1wiQnJhY2hpb3BvZCBiZWRzXCIsIFwiQ2FsY2FyZW91cyB0dWJlIHdvcm0gdGhpY2tldHNcIiwgXCJDaGFldG9wdGVyaWRhZSB3b3JtIGZpZWxkc1wiLFxuICAgICAgICAgICAgICAgXCJSaG9kb2xpdGggYmVkc1wiLCBcIlNlYSBwZW4gZmllbGRzXCIsIFwiU3BvbmdlIGdhcmRlbnNcIiwgXCJTdG9ueSBjb3JhbCB0aGlja2V0c1wiXVxuICAgIGZvciBuaCBpbiBuYV9oYWJzXG4gICAgICBuZXdfaGFiID0ge1wiSEFCX1RZUEVcIjogbmgsIFwiU0laRV9TUUtNXCI6XCJOQVwiLCBcIlBFUkNcIjpcIk5BXCIsIFwiUkVQUkVTRU5UXCI6XCJOQVwiLCBcIlJFUExJQ1wiOlwiTkFcIiwgXCJDT05OXCI6XCJOQVwifVxuICAgICAgY3JpdGljYWxfaGFiaXRhdHMucHVzaChuZXdfaGFiKVxuICAgIHJldHVybiBbaGFiX3R5cGVzLCBjcml0aWNhbF9oYWJpdGF0c11cblxuICByb3VuZERhdGE6IChoYWJpdGF0cykgPT4gIFxuICAgIGZvciBoYWIgaW4gaGFiaXRhdHNcbiAgICAgIGhhYi5TSVpFX1NRS00gPSBOdW1iZXIoaGFiLlNJWkVfU1FLTSkudG9GaXhlZCgxKVxuICAgICAgaGFiLlBFUkMgPSBOdW1iZXIoaGFiLlBFUkMpLnRvRml4ZWQoMSlcblxuICBzZXR1cFNpZ0hhYml0YXRTb3J0aW5nOiAoaGFiaXRhdHMsIGlzTVBBLCBpc0NvbGxlY3Rpb24pID0+XG4gICAgdGJvZHlOYW1lID0gJy5zaWdfaGFiX3ZhbHVlcydcbiAgICB0YWJsZU5hbWUgPSAnLnNpZ19oYWJfdGFibGUnXG4gICAgQCQoJy5zaWdfaGFiX3R5cGUnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnc2lnX2hhYl90eXBlJywgdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiSEFCX1RZUEVcIiwgdGJvZHlOYW1lLCBmYWxzZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQCQoJy5zaWdfaGFiX25ld19hcmVhJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ3NpZ19oYWJfbmV3X2FyZWEnLCB0YWJsZU5hbWUsIGhhYml0YXRzLCBldmVudCwgXCJTSVpFX1NRS01cIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBAJCgnLnNpZ19oYWJfbmV3X3BlcmMnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnc2lnX2hhYl9uZXdfcGVyYycsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiUEVSQ1wiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIFxuICAgIEAkKCcuc2lnX2hhYl9yZXByZXNlbnQnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnc2lnX2hhYl9yZXByZXNlbnQnLHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlJFUFJFU0VOVFwiLCB0Ym9keU5hbWUsIGZhbHNlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBAJCgnLnNpZ19oYWJfcmVwbGljYXRlJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ3NpZ19oYWJfcmVwbGljYXRlJyx0YWJsZU5hbWUsIGhhYml0YXRzLCBldmVudCwgXCJSRVBMSUNcIiwgdGJvZHlOYW1lLCBmYWxzZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQCQoJy5zaWdfaGFiX2Nvbm5lY3RlZCcpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdzaWdfaGFiX2Nvbm5lY3RlZCcsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiQ09OTlwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIFxuICAgIEByZW5kZXJTb3J0KCdzaWdfaGFiX25ld19hcmVhJywgdGFibGVOYW1lLCBoYWJpdGF0cywgdW5kZWZpbmVkLCBcIlNJWkVfU1FLTVwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuXG4gIHNldHVwSGFiaXRhdFNvcnRpbmc6IChoYWJpdGF0cywgaXNNUEEsIGlzQ29sbGVjdGlvbikgPT5cbiAgICB0Ym9keU5hbWUgPSAnLmhhYl92YWx1ZXMnXG4gICAgdGFibGVOYW1lID0gJy5oYWJfdGFibGUnXG4gICAgQCQoJy5oYWJfdHlwZScpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdoYWJfdHlwZScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIkhBQl9UWVBFXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuaGFiX25ld19hcmVhJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2hhYl9uZXdfYXJlYScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlNJWkVfU1FLTVwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuaGFiX25ld19wZXJjJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2hhYl9uZXdfcGVyYycsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiUEVSQ1wiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIFxuICAgIEAkKCcuaGFiX3JlcHJlc2VudCcpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdoYWJfcmVwcmVzZW50Jyx0YWJsZU5hbWUsIGhhYml0YXRzLCBldmVudCwgXCJSRVBSRVNFTlRcIiwgdGJvZHlOYW1lLCBmYWxzZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQCQoJy5oYWJfcmVwbGljYXRlJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2hhYl9yZXBsaWNhdGUnLHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlJFUExJQ1wiLCB0Ym9keU5hbWUsIGZhbHNlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBAJCgnLmhhYl9jb25uZWN0ZWQnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnaGFiX2Nvbm5lY3RlZCcsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiQ09OTlwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgICAgICBcblxuICAgIEByZW5kZXJTb3J0KCdoYWJfbmV3X2FyZWEnLCB0YWJsZU5hbWUsIGhhYml0YXRzLCB1bmRlZmluZWQsIFwiU0laRV9TUUtNXCIsIHRib2R5TmFtZSwgdHJ1ZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG5cblxuXG4gICNkbyB0aGUgc29ydGluZyAtIHNob3VsZCBiZSB0YWJsZSBpbmRlcGVuZGVudFxuICAjc2tpcCBhbnkgdGhhdCBhcmUgbGVzcyB0aGFuIDAuMDBcbiAgcmVuZGVyU29ydDogKG5hbWUsIHRhYmxlTmFtZSwgcGRhdGEsIGV2ZW50LCBzb3J0QnksIHRib2R5TmFtZSwgaXNGbG9hdCwgZ2V0Um93U3RyaW5nVmFsdWUsIGlzTVBBLCBpc0NvbGxlY3Rpb24pID0+XG4gICAgaWYgZXZlbnRcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuXG4gICAgaWYgd2luZG93LmQzXG4gICAgICB0YXJnZXRDb2x1bW4gPSBAZ2V0U2VsZWN0ZWRDb2x1bW4oZXZlbnQsIG5hbWUpXG4gICAgICBzb3J0VXAgPSBAZ2V0U29ydERpcih0YXJnZXRDb2x1bW4pXG5cbiAgICAgIGlmIGlzRmxvYXRcbiAgICAgICAgZGF0YSA9IF8uc29ydEJ5IHBkYXRhLCAocm93KSAtPiBcbiAgICAgICAgICAgIGlmIGlzTmFOKHJvd1tzb3J0QnldKVxuICAgICAgICAgICAgICB2YWwgPSAtMS4wXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHZhbCA9IHBhcnNlRmxvYXQocm93W3NvcnRCeV0pXG4gICAgICAgICAgICByZXR1cm4gdmFsXG4gICAgICBlbHNlXG4gICAgICAgIGRhdGEgPSBfLnNvcnRCeSBwZGF0YSwgKHJvdykgLT4gcm93W3NvcnRCeV1cblxuICAgICAgI2ZsaXAgc29ydGluZyBpZiBuZWVkZWRcbiAgICAgIGlmIHNvcnRVcFxuICAgICAgICBkYXRhLnJldmVyc2UoKVxuXG4gICAgICBlbCA9IEAkKHRib2R5TmFtZSlbMF1cbiAgICAgIGhhYl9ib2R5ID0gZDMuc2VsZWN0KGVsKVxuXG4gICAgICAjcmVtb3ZlIG9sZCByb3dzXG4gICAgICBoYWJfYm9keS5zZWxlY3RBbGwoXCJ0ci5oYWJfcm93c1wiKVxuICAgICAgICAucmVtb3ZlKClcblxuICAgICAgI2FkZCBuZXcgcm93cyAoYW5kIGRhdGEpXG4gICAgICByb3dzID0gaGFiX2JvZHkuc2VsZWN0QWxsKFwidHJcIilcbiAgICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgICAuZW50ZXIoKS5pbnNlcnQoXCJ0clwiLCBcIjpmaXJzdC1jaGlsZFwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiaGFiX3Jvd3NcIilcblxuICAgICAgaWYgaXNNUEFcbiAgICAgICAgaWYgaXNDb2xsZWN0aW9uXG4gICAgICAgICAgY29sdW1ucyA9IFtcIkhBQl9UWVBFXCIsIFwiU0laRV9TUUtNXCIsIFwiUEVSQ1wiLCBcIlJFUFJFU0VOVFwiLCBcIlJFUExJQ1wiLCBcIkNPTk5cIl1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNvbHVtbnMgPSBbXCJIQUJfVFlQRVwiLCBcIlNJWkVfU1FLTVwiLCBcIlBFUkNcIiwgXCJSRVBSRVNFTlRcIl1cbiAgICAgIGVsc2VcbiAgICAgICAgY29sdW1ucyA9IFtcIkhBQl9UWVBFXCIsIFwiU0laRV9TUUtNXCIsIFwiUEVSQ1wiXVxuXG4gICAgICBjZWxscyA9IHJvd3Muc2VsZWN0QWxsKFwidGRcIilcbiAgICAgICAgICAuZGF0YSgocm93LCBpKSAtPmNvbHVtbnMubWFwIChjb2x1bW4pIC0+IChjb2x1bW46IGNvbHVtbiwgdmFsdWU6IHJvd1tjb2x1bW5dKSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZChcInRkXCIpLnRleHQoKGQsIGkpIC0+IFxuICAgICAgICAgIGQudmFsdWVcbiAgICAgICAgKSAgICBcblxuICAgICAgQHNldE5ld1NvcnREaXIodGFyZ2V0Q29sdW1uLCBzb3J0VXApXG4gICAgICBAc2V0U29ydGluZ0NvbG9yKGV2ZW50LCB0YWJsZU5hbWUpXG5cbiAgICAgICNmaXJlIHRoZSBldmVudCBmb3IgdGhlIGFjdGl2ZSBwYWdlIGlmIHBhZ2luYXRpb24gaXMgcHJlc2VudFxuICAgICAgQGZpcmVQYWdpbmF0aW9uKHRhYmxlTmFtZSlcbiAgICAgIGlmIGV2ZW50XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgZ2V0RmxvYXQ6ICh2YWwpID0+XG4gICAgdHJ5XG4gICAgICByZXR1cm4gcGFyc2VGbG9hdCh2YWwpXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIHJldHVybiAwLjBcblxuICAjdGFibGUgcm93IGZvciBoYWJpdGF0IHJlcHJlc2VudGF0aW9uXG4gIGdldEhhYml0YXRSb3dTdHJpbmc6IChkLCBpc01QQSwgaXNDb2xsZWN0aW9uKSA9PlxuICAgIGlmIGQgaXMgdW5kZWZpbmVkXG4gICAgICByZXR1cm4gXCJcIlxuICAgIHJlcHJlc2VudGVkX3N0ciA9IFwiXCJcbiAgICByZXBsaWNhdGVkX3N0ciA9IFwiXCJcbiAgICBjb25uZWN0ZWRfc3RyID0gXCJcIlxuICAgIGlmIGlzTVBBXG4gICAgICByZXByZXNlbnRlZF9zdHIgPSBcIjx0ZFwiPitkLlJFUFJFU0VOVCtcIjwvdGQ+XCJcbiAgICAgIGlmIGlzQ29sbGVjdGlvblxuICAgICAgICByZXBsaWNhdGVkX3N0ciA9IFwiPHRkPlwiK2QuUkVQTElDK1wiPC90ZD5cIlxuICAgICAgICBjb25uZWN0ZWRfc3RyID0gXCI8dGQ+XCIrZC5DT05OK1wiPC90ZD5cIlxuXG4gICAgcmV0dXJuIFwiPHRkPlwiK2QuSEFCX1RZUEUrXCI8L3RkPlwiK1wiPHRkPlwiK2QuU0laRV9TUUtNK1wiPC90ZD5cIitcIjx0ZD5cIitkLlBFUkMrXCI8L3RkPlwiK3JlcHJlc2VudGVkX3N0cityZXBsaWNhdGVkX3N0clxuXG4gIHNldFNvcnRpbmdDb2xvcjogKGV2ZW50LCB0YWJsZU5hbWUpID0+XG4gICAgc29ydGluZ0NsYXNzID0gXCJzb3J0aW5nX2NvbFwiXG4gICAgaWYgZXZlbnRcbiAgICAgIHBhcmVudCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCkucGFyZW50KClcbiAgICAgIG5ld1RhcmdldE5hbWUgPSBldmVudC5jdXJyZW50VGFyZ2V0LmNsYXNzTmFtZVxuICAgICAgdGFyZ2V0U3RyID0gdGFibGVOYW1lK1wiIHRoLnNvcnRpbmdfY29sIGFcIiAgIFxuICAgICAgaWYgQCQodGFyZ2V0U3RyKSBhbmQgQCQodGFyZ2V0U3RyKVswXVxuICAgICAgICBvbGRUYXJnZXROYW1lID0gQCQodGFyZ2V0U3RyKVswXS5jbGFzc05hbWVcbiAgICAgICAgaWYgbmV3VGFyZ2V0TmFtZSAhPSBvbGRUYXJnZXROYW1lXG4gICAgICAgICAgI3JlbW92ZSBpdCBmcm9tIG9sZCBcbiAgICAgICAgICBoZWFkZXJOYW1lID0gdGFibGVOYW1lK1wiIHRoLnNvcnRpbmdfY29sXCJcbiAgICAgICAgICBAJChoZWFkZXJOYW1lKS5yZW1vdmVDbGFzcyhzb3J0aW5nQ2xhc3MpXG4gICAgICAgICAgI2FuZCBhZGQgaXQgdG8gbmV3XG4gICAgICAgICAgcGFyZW50LmFkZENsYXNzKHNvcnRpbmdDbGFzcylcbiAgICAgXG4gIGdldFNvcnREaXI6ICh0YXJnZXRDb2x1bW4pID0+XG4gICAgIHNvcnR1cCA9IEAkKCcuJyt0YXJnZXRDb2x1bW4pLmhhc0NsYXNzKFwic29ydF91cFwiKVxuICAgICByZXR1cm4gc29ydHVwXG5cbiAgZ2V0U2VsZWN0ZWRDb2x1bW46IChldmVudCwgbmFtZSkgPT5cbiAgICBpZiBldmVudFxuICAgICAgI2dldCBzb3J0IG9yZGVyXG4gICAgICB0YXJnZXRDb2x1bW4gPSBldmVudC5jdXJyZW50VGFyZ2V0LmNsYXNzTmFtZVxuXG4gICAgICBtdWx0aUNsYXNzZXMgPSB0YXJnZXRDb2x1bW4uc3BsaXQoJyAnKVxuICAgICAgI3Byb3RlY3RlZE1hbW1hbHMgPSBfLnNvcnRCeSBwcm90ZWN0ZWRNYW1tYWxzLCAocm93KSAtPiBwYXJzZUludChyb3cuQ291bnQpXG4gICAgICBoYWJDbGFzc05hbWUgPV8uZmluZCBtdWx0aUNsYXNzZXMsIChjbGFzc25hbWUpIC0+IFxuICAgICAgICBjbGFzc25hbWUubGFzdEluZGV4T2YoJ2hhYicsMCkgPT0gMCBcbiAgICAgIGlmIGhhYkNsYXNzTmFtZSBpcyB1bmRlZmluZWRcbiAgICAgICAgaGFiQ2xhc3NOYW1lID1fLmZpbmQgbXVsdGlDbGFzc2VzLCAoY2xhc3NuYW1lKSAtPiBcbiAgICAgICAgICBjbGFzc25hbWUubGFzdEluZGV4T2YoJ3NpZycsMCkgPT0gMCBcblxuICAgICAgdGFyZ2V0Q29sdW1uID0gaGFiQ2xhc3NOYW1lXG4gICAgZWxzZVxuICAgICAgI3doZW4gdGhlcmUgaXMgbm8gZXZlbnQsIGZpcnN0IHRpbWUgdGFibGUgaXMgZmlsbGVkXG4gICAgICB0YXJnZXRDb2x1bW4gPSBuYW1lXG5cbiAgICByZXR1cm4gdGFyZ2V0Q29sdW1uXG5cbiAgc2V0TmV3U29ydERpcjogKHRhcmdldENvbHVtbiwgc29ydFVwKSA9PlxuICAgICNhbmQgc3dpdGNoIGl0XG4gICAgaWYgc29ydFVwXG4gICAgICBAJCgnLicrdGFyZ2V0Q29sdW1uKS5yZW1vdmVDbGFzcygnc29ydF91cCcpXG4gICAgICBAJCgnLicrdGFyZ2V0Q29sdW1uKS5hZGRDbGFzcygnc29ydF9kb3duJylcbiAgICBlbHNlXG4gICAgICBAJCgnLicrdGFyZ2V0Q29sdW1uKS5hZGRDbGFzcygnc29ydF91cCcpXG4gICAgICBAJCgnLicrdGFyZ2V0Q29sdW1uKS5yZW1vdmVDbGFzcygnc29ydF9kb3duJylcblxuICBmaXJlUGFnaW5hdGlvbjogKHRhYmxlTmFtZSkgPT5cbiAgICBlbCA9IEAkKHRhYmxlTmFtZSlbMF1cbiAgICBoYWJfdGFibGUgPSBkMy5zZWxlY3QoZWwpXG4gICAgYWN0aXZlX3BhZ2UgPSBoYWJfdGFibGUuc2VsZWN0QWxsKFwiLmFjdGl2ZSBhXCIpXG4gICAgaWYgYWN0aXZlX3BhZ2UgYW5kIGFjdGl2ZV9wYWdlWzBdIGFuZCBhY3RpdmVfcGFnZVswXVswXVxuICAgICAgYWN0aXZlX3BhZ2VbMF1bMF0uY2xpY2soKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVudmlyb25tZW50VGFiIiwiUmVwb3J0VGFiID0gcmVxdWlyZSAncmVwb3J0VGFiJ1xudGVtcGxhdGVzID0gcmVxdWlyZSAnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxuX3BhcnRpYWxzID0gcmVxdWlyZSAnLi4vbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cbmlkcyA9IHJlcXVpcmUgJy4vaWRzLmNvZmZlZSdcbmZvciBrZXksIHZhbHVlIG9mIGlkc1xuICB3aW5kb3dba2V5XSA9IHZhbHVlXG5cblxuY2xhc3MgRmlzaGluZ1RhYiBleHRlbmRzIFJlcG9ydFRhYlxuICAjIHRoaXMgaXMgdGhlIG5hbWUgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgVGFiXG4gIG5hbWU6ICdGaXNoaW5nJ1xuICBjbGFzc05hbWU6ICdmaXNoaW5nJ1xuICB0aW1lb3V0OiAxMjAwMDBcbiAgdGVtcGxhdGU6IHRlbXBsYXRlcy5maXNoaW5nXG4gIGRlcGVuZGVuY2llczogW1xuICAgICdGaXNoaW5nQXJlYXMnLCAnRmlzaGVyeUludGVuc2l0eSdcbiAgXVxuXG4gIHJlbmRlcjogKCkgLT5cblxuICAgICNzaG93IHRhYmxlcyBpbnN0ZWFkIG9mIGdyYXBoIGZvciBJRVxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgZDNJc1ByZXNlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgZDNJc1ByZXNlbnQgPSBmYWxzZVxuXG4gICAgaXNDb2xsZWN0aW9uID0gQG1vZGVsLmlzQ29sbGVjdGlvbigpXG4gICAgc2NpZCA9IEBza2V0Y2hDbGFzcy5pZFxuICAgIGNvbnNvbGUubG9nKFwic2NpZDpcIixzY2lkKVxuICAgIGlmIChzY2lkID09IE1QQV9JRCBvciBzY2lkID09IE1QQV9DT0xMRUNUSU9OX0lEIG9yIHNjaWQgPT0gTVBBX0NPTkZJRF9DT0xMRUNUSU9OX0lEKVxuICAgICAgaXNNUEEgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgaXNNUEEgPSBmYWxzZVxuXG4gICAgaXNDb25maWRlbnRpYWxNUEFOZXR3b3JrID0gKHNjaWQgPT0gTVBBX0NPTkZJRF9DT0xMRUNUSU9OX0lEKVxuICAgIGlmIGlzTVBBXG4gICAgICBcbiAgICAgIGZpc2hlcnlfaW50ZW5zaXR5ID0gQHJlY29yZFNldCgnRmlzaGVyeUludGVuc2l0eScsICdGaXNoZXJ5SW50ZW5zaXR5JykudG9BcnJheSgpXG5cbiAgICBleGlzdGluZ19jdXN0b21hcnlfZmlzaGluZyA9IEByZWNvcmRTZXQoJ0Zpc2hpbmdBcmVhcycsICdFeGlzdGluZ0N1c3RvbWFyeUFyZWEnKS50b0FycmF5KClcbiAgICBoYXNFeGlzdGluZ0N1c3RvbWFyeSA9IGV4aXN0aW5nX2N1c3RvbWFyeV9maXNoaW5nPy5sZW5ndGggPiAwXG4gICAgcHJvcG9zZWRfY3VzdG9tYXJ5X2Zpc2hpbmcgPSBAcmVjb3JkU2V0KCdGaXNoaW5nQXJlYXMnLCAnUHJvcG9zZWRDdXN0b21hcnlBcmVhJykudG9BcnJheSgpXG4gICAgaGFzUHJvcG9zZWRDdXN0b21hcnkgPSBwcm9wb3NlZF9jdXN0b21hcnlfZmlzaGluZz8ubGVuZ3RoID4gMFxuXG4gICAgaGFzQ3VzdG9tYXJ5ID0gaGFzRXhpc3RpbmdDdXN0b21hcnkgb3IgaGFzUHJvcG9zZWRDdXN0b21hcnlcblxuICAgIGV4aXN0aW5nX2Zpc2hpbmdfYXJlYXMgPSBAcmVjb3JkU2V0KCdGaXNoaW5nQXJlYXMnLCAnRmlzaGluZ0V4aXN0aW5nQXJlYScpLnRvQXJyYXkoKVxuICAgIGhhc0V4aXN0aW5nRmlzaGluZyA9IGV4aXN0aW5nX2Zpc2hpbmdfYXJlYXM/Lmxlbmd0aCA+IDBcbiAgICBoYXNBbnlGaXNoaW5nID0gaGFzRXhpc3RpbmdGaXNoaW5nIG9yIGhhc0N1c3RvbWFyeVxuICAgIGF0dHJpYnV0ZXMgPSBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgXG4gICAgaWYgaXNNUEFcbiAgICAgIGNvbnRleHQgPVxuICAgICAgICBza2V0Y2g6IEBtb2RlbC5mb3JUZW1wbGF0ZSgpXG4gICAgICAgIHNrZXRjaENsYXNzOiBAc2tldGNoQ2xhc3MuZm9yVGVtcGxhdGUoKVxuICAgICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICAgIGFueUF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKCkubGVuZ3RoID4gMFxuICAgICAgICBhZG1pbjogQHByb2plY3QuaXNBZG1pbiB3aW5kb3cudXNlclxuICAgICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcbiAgICAgICAgaXNDb2xsZWN0aW9uOiBpc0NvbGxlY3Rpb25cbiAgICAgICAgaXNNUEE6IGlzTVBBXG4gICAgICAgIGV4aXN0aW5nX2N1c3RvbWFyeV9maXNoaW5nOiBleGlzdGluZ19jdXN0b21hcnlfZmlzaGluZ1xuICAgICAgICBoYXNFeGlzdGluZ0N1c3RvbWFyeTogaGFzRXhpc3RpbmdDdXN0b21hcnlcbiAgICAgICAgcHJvcG9zZWRfY3VzdG9tYXJ5X2Zpc2hpbmc6IHByb3Bvc2VkX2N1c3RvbWFyeV9maXNoaW5nXG4gICAgICAgIGhhc1Byb3Bvc2VkQ3VzdG9tYXJ5OiBoYXNQcm9wb3NlZEN1c3RvbWFyeVxuICAgICAgICBleGlzdGluZ19maXNoaW5nX2FyZWFzOiBleGlzdGluZ19maXNoaW5nX2FyZWFzXG4gICAgICAgIGhhc0V4aXN0aW5nRmlzaGluZzogaGFzRXhpc3RpbmdGaXNoaW5nXG4gICAgICAgIGhhc0FueUZpc2hpbmc6IGhhc0FueUZpc2hpbmdcbiAgICAgICAgaGFzQ3VzdG9tYXJ5OiBoYXNDdXN0b21hcnlcbiAgICAgICAgZmlzaGVyeV9pbnRlbnNpdHk6IGZpc2hlcnlfaW50ZW5zaXR5XG4gICAgICAgIGlzQ29uZmlkZW50aWFsTVBBTmV0d29yazogaXNDb25maWRlbnRpYWxNUEFOZXR3b3JrXG4gICAgZWxzZVxuICAgICAgY29udGV4dCA9XG4gICAgICAgIHNrZXRjaDogQG1vZGVsLmZvclRlbXBsYXRlKClcbiAgICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICAgIGF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICAgICAgYW55QXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKS5sZW5ndGggPiAwXG4gICAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICAgIGQzSXNQcmVzZW50OiBkM0lzUHJlc2VudFxuICAgICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuICAgICAgICBleGlzdGluZ19jdXN0b21hcnlfZmlzaGluZzogZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmdcbiAgICAgICAgaGFzRXhpc3RpbmdDdXN0b21hcnk6IGhhc0V4aXN0aW5nQ3VzdG9tYXJ5XG4gICAgICAgIHByb3Bvc2VkX2N1c3RvbWFyeV9maXNoaW5nOiBwcm9wb3NlZF9jdXN0b21hcnlfZmlzaGluZ1xuICAgICAgICBoYXNQcm9wb3NlZEN1c3RvbWFyeTogaGFzUHJvcG9zZWRDdXN0b21hcnlcbiAgICAgICAgZXhpc3RpbmdfZmlzaGluZ19hcmVhczogZXhpc3RpbmdfZmlzaGluZ19hcmVhc1xuICAgICAgICBoYXNFeGlzdGluZ0Zpc2hpbmc6IGhhc0V4aXN0aW5nRmlzaGluZ1xuICAgICAgICBoYXNBbnlGaXNoaW5nOiBoYXNBbnlGaXNoaW5nXG4gICAgICAgIGhhc0N1c3RvbWFyeTogaGFzQ3VzdG9tYXJ5XG4gICAgICAgIGlzTVBBOiBpc01QQVxuICAgICAgICBpc0NvbmZpZGVudGlhbE1QQU5ldHdvcms6IGlzQ29uZmlkZW50aWFsTVBBTmV0d29ya1xuXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgcGFydGlhbHMpXG4gICAgQGVuYWJsZUxheWVyVG9nZ2xlcnMoKVxuXG4gIHJvdW5kRGF0YTogKHJlY19zZXQpID0+XG4gICAgbG93X3RvdGFsID0gMC4wXG4gICAgaGlnaF90b3RhbCA9IDAuMFxuICAgIGZvciBycyBpbiByZWNfc2V0XG4gICAgICBycy5MT1cgPSBOdW1iZXIocnMuTE9XKS50b0ZpeGVkKDEpXG4gICAgICBsb3dfdG90YWwrPU51bWJlcihycy5MT1cpXG4gICAgICBycy5ISUdIID0gTnVtYmVyKHJzLkhJR0gpLnRvRml4ZWQoMSlcbiAgICAgIGhpZ2hfdG90YWwrPU51bWJlcihycy5ISUdIKVxuICAgICAgcnMuVE9UQUwgPSBOdW1iZXIocnMuVE9UQUwpLnRvRml4ZWQoMSlcbiAgICBpZiByZWNfc2V0Py5sZW5ndGggPiAwXG4gICAgICB0b3Rfcm93ID0ge1wiTkFNRVwiOlwiVG90YWxcIiwgXCJMT1dcIjpsb3dfdG90YWwsIFwiSElHSFwiOmhpZ2hfdG90YWx9XG4gICAgICByZWNfc2V0LnB1c2godG90X3JvdylcblxubW9kdWxlLmV4cG9ydHMgPSBGaXNoaW5nVGFiIiwibW9kdWxlLmV4cG9ydHMgPSBcbiAgR0VORVJJQ19JRDogJzUzOWY1ZWM2OGQxMDkyNmMyOWZlNzc2MidcbiAgR0VORVJJQ19DT0xMRUNUSU9OX0lEOiAnNTNmZDE5NTUwNDA2ZGU2ODRjMTE4OTY5J1xuICBNUEFfSUQ6ICc1NGQ4MTI5MGZhOTRlNjk3NzU5Y2U3NzEnXG4gIE1QQV9DT05GSURfQ09MTEVDVElPTl9JRDogJzU1ODJlNjA1YWMyZGRkZDQyOTc2ZjQxYidcbiAgTVBBX0NPTExFQ1RJT05fSUQ6ICc1NjMxMmFiY2U4MzdmMjJmMDZiNmQyNzInIiwiUmVwb3J0VGFiID0gcmVxdWlyZSAncmVwb3J0VGFiJ1xudGVtcGxhdGVzID0gcmVxdWlyZSAnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxuX3BhcnRpYWxzID0gcmVxdWlyZSAnLi4vbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cbmlkcyA9IHJlcXVpcmUgJy4vaWRzLmNvZmZlZSdcbmZvciBrZXksIHZhbHVlIG9mIGlkc1xuICB3aW5kb3dba2V5XSA9IHZhbHVlXG5cbmNsYXNzIE92ZXJ2aWV3VGFiIGV4dGVuZHMgUmVwb3J0VGFiXG4gICMgdGhpcyBpcyB0aGUgbmFtZSB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBUYWJcbiAgbmFtZTogJ092ZXJ2aWV3J1xuICBjbGFzc05hbWU6ICdvdmVydmlldydcbiAgdGltZW91dDogMTIwMDAwXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZXMub3ZlcnZpZXdcbiAgZGVwZW5kZW5jaWVzOiBbXG4gICAgJ0hhYml0YXRzT3ZlcnZpZXcnXG4gICAgJ1Byb3Bvc2FsU2l6ZSdcbiAgICAnUHJvcG9zYWxDb25uZWN0aXZpdHknXG4gICAgJ0hhYlJlcHNUb29sYm94J1xuICBdXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgICMgVGhlIEByZWNvcmRTZXQgbWV0aG9kIGNvbnRhaW5zIHNvbWUgdXNlZnVsIG1lYW5zIHRvIGdldCBkYXRhIG91dCBvZiBcbiAgICAjIHRoZSBtb25zdGVyb3VzIFJlY29yZFNldCBqc29uLiBDaGVja291dCB0aGUgc2Vhc2tldGNoLXJlcG9ydGluZy10ZW1wbGF0ZVxuICAgICMgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBpbmZvLlxuICAgIFRPVEFMX0NPQVNUTElORV9MRU5HVEggPSA3NjYuNDY2OTE3XG4gICAgVE9UX1NJWkVfU1FLTSA9IDg5MzAuNjYyODkzXG5cbiAgICBUT1RBTF9IQUJTID0gMzhcbiAgICBzY2lkID0gQHNrZXRjaENsYXNzLmlkXG4gICAgaXNDb2xsZWN0aW9uID0gQG1vZGVsLmlzQ29sbGVjdGlvbigpXG5cbiAgICBpc01QQSA9IChzY2lkID09IE1QQV9JRCBvciBzY2lkID09IE1QQV9DT0xMRUNUSU9OX0lEIG9yIHNjaWQgPT0gTVBBX0NPTkZJRF9DT0xMRUNUSU9OX0lEKVxuICAgIGNvbnNvbGUubG9nKFwic2NpZDogXCIsIHNjaWQpXG4gICAgY29uc29sZS5sb2coXCJpc21wYSBcIiwgaXNNUEEpXG4gICAgbnVtX3Jlc2VydmVzID0gMFxuICAgIG51bV90eXBlMiA9IDBcbiAgICBudW1fb3RoZXIgPSAwXG4gICAgcGx1cmFsX3R5cGUxID0gdHJ1ZVxuICAgIHBsdXJhbF90eXBlMiA9IHRydWVcbiAgICBwbHVyYWxfb3RoZXIgPSB0cnVlXG5cbiAgICBpZiBpc0NvbGxlY3Rpb25cbiAgICAgIG51bVNrZXRjaGVzID0gQG1vZGVsLmdldENoaWxkcmVuKCkubGVuZ3RoXG4gICAgICBpZiBpc01QQVxuICAgICAgICByZXNlcnZlX3R5cGVzID0gQGdldFJlc2VydmVWYWx1ZXMgQG1vZGVsLmdldENoaWxkcmVuKClcbiAgICAgICAgbnVtX3Jlc2VydmVzID0gcmVzZXJ2ZV90eXBlc1swXVxuICAgICAgICBwbHVyYWxfdHlwZTEgPSBudW1fcmVzZXJ2ZXMgIT0gMVxuICAgICAgICBudW1fdHlwZTIgPSByZXNlcnZlX3R5cGVzWzFdXG4gICAgICAgIHBsdXJhbF90eXBlMiA9IG51bV90eXBlMiAhPSAxXG4gICAgICAgIG51bV9vdGhlciA9IHJlc2VydmVfdHlwZXNbMl1cbiAgICAgICAgcGx1cmFsX290aGVyID0gbnVtX290aGVyICE9IDFcbiAgICBlbHNlXG4gICAgICBudW1Ta2V0Y2hlcyA9IDFcblxuICAgIHBsdXJhbFNrZXRjaGVzID0gbnVtU2tldGNoZXMgPiAxXG5cbiAgICBpc0dlbmVyaWMgPSAoc2NpZCA9PSBHRU5FUklDX0lEIG9yIHNjaWQgPT0gR0VORVJJQ19DT0xMRUNUSU9OX0lEKVxuXG4gICAgdG90YWxfc2l6ZXMgPSBAcmVjb3JkU2V0KCdQcm9wb3NhbFNpemUnLCAnU2l6ZVRvdGFscycpLnRvQXJyYXkoKVxuICAgIHByb3Bfc2l6ZXMgPSBAcmVjb3JkU2V0KCdQcm9wb3NhbFNpemUnLCAnU2l6ZXMnKS50b0FycmF5KClcblxuICAgIFxuICAgIHJlcHJlc2VudGVkX2hhYnMgPSBAcmVjb3JkU2V0KCdIYWJSZXBzVG9vbGJveCcsICdSZXByZXNlbnRlZEhhYnMnKS50b0FycmF5KClcbiAgICBoYWJfc2l6ZXMgPSBAcmVjb3JkU2V0KCdIYWJSZXBzVG9vbGJveCcsICdIYWJTaXplcycpLnRvQXJyYXkoKVxuICAgIG51bV9oYWJzID0gaGFiX3NpemVzPy5sZW5ndGhcblxuXG4gICAgbnVtX3JlcHJlc2VudGVkX2hhYnMgPSBAZ2V0TnVtSGFicyhcIlJFUFJFU0VOVFwiLCByZXByZXNlbnRlZF9oYWJzKVxuICAgIG51bV9yZXBsaWNhdGVkX2hhYnMgPSBAZ2V0TnVtSGFicyhcIlJFUExJQ1wiLCByZXByZXNlbnRlZF9oYWJzKVxuXG4gICAgbXBhX2F2Z19taW5fZGltID0gQGdldEF2ZXJhZ2VNaW5EaW0ocHJvcF9zaXplcylcbiAgICB0b3RhbF9wZXJjZW50ID0gQGdldFRvdGFsQXJlYVBlcmNlbnQocHJvcF9zaXplcylcbiAgICBwcm9wX3NpemVzID0gQGNsZWFudXBEYXRhKHByb3Bfc2l6ZXMpXG4gICAgXG4gICAgbXBhX2NvdW50ID0gQGdldE1pbkRpbUNvdW50KHByb3Bfc2l6ZXMpXG4gICAgdG90YWxfbXBhX2NvdW50ID0gbnVtU2tldGNoZXNcbiAgICBwbHVyYWxfbXBhX2NvdW50ID0gbXBhX2NvdW50ICE9IDFcblxuICAgIFxuICAgIGlmIG1wYV9hdmdfbWluX2RpbSA8IDEwXG4gICAgICBtcGFfYXZnX3NpemVfZ3VpZGVsaW5lID0gXCJiZWxvd1wiXG4gICAgZWxzZVxuICAgICAgbXBhX2F2Z19zaXplX2d1aWRlbGluZSA9IFwiYWJvdmVcIlxuXG5cbiAgICBpZiB0b3RhbF9zaXplcz8ubGVuZ3RoID4gMFxuICAgICAgY29hc3RsaW5lX2xlbmd0aCA9IHRvdGFsX3NpemVzWzBdLkNPQVNUXG4gICAgICBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQgPSAoY29hc3RsaW5lX2xlbmd0aC9UT1RBTF9DT0FTVExJTkVfTEVOR1RIKSoxMDAuMFxuICAgICAgaWYgY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50ID4gMCAmJiBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQgPCAxXG4gICAgICAgIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA9IFwiPCAxXCJcbiAgICAgIGVsc2VcbiAgICAgICAgY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50ID0gcGFyc2VGbG9hdChjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQpLnRvRml4ZWQoMSlcbiAgICAgICAgaWYgY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50ID4gMTAwXG4gICAgICAgICAgY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50ID0gMTAwXG4gICAgICBzaXplID0gdG90YWxfc2l6ZXNbMF0uU0laRV9TUUtNXG5cbiAgICAgIGNvYXN0bGluZV9sZW5ndGggPSBwYXJzZUZsb2F0KGNvYXN0bGluZV9sZW5ndGgpLnRvRml4ZWQoMSlcbiAgICAgIGFyZWFfcGVyY2VudCA9IHBhcnNlRmxvYXQoKHNpemUvVE9UX1NJWkVfU1FLTSkqMTAwKS50b0ZpeGVkKDEpXG4gICAgICBpZiBhcmVhX3BlcmNlbnQgPiAxMDBcbiAgICAgICAgYXJlYV9wZXJjZW50ID0gMTAwLjBcblxuICAgICAgaWYgYXJlYV9wZXJjZW50IDwgMC4xXG4gICAgICAgIGFyZWFfcGVyY2VudCA9IFwiPCAxXCJcblxuICAgIG5ld19oYWJzID0gQHJlY29yZFNldCgnSGFiaXRhdHNPdmVydmlldycsICdIYWJpdGF0U2l6ZScpLmZsb2F0KCdORVdfSEFCUycpXG4gICAgdG90YWxfaGFicyA9IEByZWNvcmRTZXQoJ0hhYml0YXRzT3ZlcnZpZXcnLCAnSGFiaXRhdFNpemUnKS5mbG9hdCgnVE9UX0hBQlMnKVxuICAgIFxuICAgIHJhdGlvID0gKGNvYXN0bGluZV9sZW5ndGgvc2l6ZSkudG9GaXhlZCgxKVxuXG4gICAgI3NldHVwIGNvbm5lY3Rpdml0eSBkYXRhXG4gICAgaWYgaXNDb2xsZWN0aW9uXG4gICAgICBnb29kX2NvbG9yID0gXCIjYjNjZmE3XCJcbiAgICAgIGJhZF9jb2xvciA9IFwiI2U1Y2FjZVwiXG4gICAgICBpZiBudW1Ta2V0Y2hlcyA+IDFcbiAgICAgICAgdHJ5XG4gICAgICAgICAgY29ubmVjdGVkX21wYV9jb3VudCA9IEByZWNvcmRTZXQoJ1Byb3Bvc2FsQ29ubmVjdGl2aXR5JywgJ0Nvbm4nKS5mbG9hdCgnTlVNQkVSJylcbiAgICAgICAgICBwbHVyYWxfY29ubmVjdGVkX21wYV9jb3VudCA9IHRydWVcblxuICAgICAgICAgIG1pbl9kaXN0YW5jZSA9IEByZWNvcmRTZXQoJ1Byb3Bvc2FsQ29ubmVjdGl2aXR5JywgJ0Nvbm4nKS5mbG9hdCgnTUlOJylcbiAgICAgICAgICBtYXhfZGlzdGFuY2UgPSBAcmVjb3JkU2V0KCdQcm9wb3NhbENvbm5lY3Rpdml0eScsICdDb25uJykuZmxvYXQoJ01BWCcpXG4gICAgICAgICAgbWVhbl9kaXN0YW5jZSA9IEByZWNvcmRTZXQoJ1Byb3Bvc2FsQ29ubmVjdGl2aXR5JywgJ0Nvbm4nKS5mbG9hdCgnTUVBTicpXG4gICAgICAgICAgY29ubl9waWVfdmFsdWVzID0gQGJ1aWxkX3ZhbHVlcyhcIk1QQXMgV2l0aGluIENvbm5lY3Rpdml0eSBSYW5nZVwiLCBjb25uZWN0ZWRfbXBhX2NvdW50LGdvb2RfY29sb3IsIFwiTVBBcyBPdXRzaWRlIENvbm5lY3Rpdml0eSBSYW5nZVwiLCBcbiAgICAgICAgICAgIHRvdGFsX21wYV9jb3VudC1jb25uZWN0ZWRfbXBhX2NvdW50LCBiYWRfY29sb3IpXG4gICAgICAgIGNhdGNoIEVycm9yXG4gICAgICAgICAgY29uc29sZS5sb2coXCJlcnJvciByZWFkaW5nIGNvbm5lY3Rpdml0eS4uLlwiKVxuICAgICAgICAgIFxuICAgICAgbm90X3JlcHJlc2VudGVkID0gVE9UQUxfSEFCUyAtIG51bV9yZXByZXNlbnRlZF9oYWJzXG4gICAgICByZXByZXNlbnRlZF9oYWJzX3BpZV92YWx1ZXMgPSBAYnVpbGRfdmFsdWVzKFwiSGFiaXRhdC10eXBlcyBSZXByZXNlbnRlZFwiLCBudW1fcmVwcmVzZW50ZWRfaGFicywgZ29vZF9jb2xvciwgXCJIYWJpdGF0LXR5cGVzIE5vdCBSZXByZXNlbnRlZFwiLFxuICAgICAgICBub3RfcmVwcmVzZW50ZWQsIGJhZF9jb2xvcilcblxuICAgICAgbm90X3JlcGxpY2F0ZWQgPSBUT1RBTF9IQUJTIC0gbnVtX3JlcGxpY2F0ZWRfaGFic1xuICAgICAgcmVwbGljYXRlZF9oYWJzX3BpZV92YWx1ZXMgPSBAYnVpbGRfdmFsdWVzKFwiSGFiaXRhdC10eXBlcyBSZXBsaWNhdGVkXCIsIG51bV9yZXBsaWNhdGVkX2hhYnMsIGdvb2RfY29sb3IsIFwiSGFiaXRhdC10eXBlcyBOb3QgUmVwbGljYXRlZFwiLFxuICAgICAgICBub3RfcmVwbGljYXRlZCwgYmFkX2NvbG9yKVxuXG4gICAgI3Nob3cgdGFibGVzIGluc3RlYWQgb2YgZ3JhcGggZm9yIElFXG4gICAgaWYgd2luZG93LmQzXG4gICAgICBkM0lzUHJlc2VudCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBkM0lzUHJlc2VudCA9IGZhbHNlXG5cbiAgICBcbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgIFxuICAgIGNvbnRleHQgPVxuICAgICAgZDNJc1ByZXNlbnQ6IGQzSXNQcmVzZW50XG4gICAgICBza2V0Y2g6IEBtb2RlbC5mb3JUZW1wbGF0ZSgpXG4gICAgICBza2V0Y2hDbGFzczogQHNrZXRjaENsYXNzLmZvclRlbXBsYXRlKClcbiAgICAgIGF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICAgIGFueUF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKCkubGVuZ3RoID4gMFxuICAgICAgYWRtaW46IEBwcm9qZWN0LmlzQWRtaW4gd2luZG93LnVzZXJcbiAgICAgIHNpemU6IHNpemVcbiAgICAgIGNvYXN0bGluZV9sZW5ndGg6IGNvYXN0bGluZV9sZW5ndGhcbiAgICAgIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudDpjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnRcbiAgICAgIG5ld19oYWJzOiBuZXdfaGFic1xuICAgICAgdG90YWxfaGFiczogdG90YWxfaGFic1xuICAgICAgcmF0aW86IHJhdGlvXG4gICAgICBhcmVhX3BlcmNlbnQ6IGFyZWFfcGVyY2VudFxuICAgICAgaXNDb2xsZWN0aW9uOiBpc0NvbGxlY3Rpb25cbiAgICAgIG51bVNrZXRjaGVzOiBudW1Ta2V0Y2hlc1xuICAgICAgcGx1cmFsU2tldGNoZXM6IHBsdXJhbFNrZXRjaGVzXG4gICAgICBwcm9wX3NpemVzOiBwcm9wX3NpemVzXG4gICAgICB0b3RhbF9tcGFfY291bnQ6IHRvdGFsX21wYV9jb3VudFxuICAgICAgbXBhX2NvdW50OiBtcGFfY291bnRcbiAgICAgIG1wYV9hdmdfc2l6ZV9ndWlkZWxpbmU6bXBhX2F2Z19zaXplX2d1aWRlbGluZVxuICAgICAgcGx1cmFsX21wYV9jb3VudDogcGx1cmFsX21wYV9jb3VudFxuICAgICAgY29ubmVjdGVkX21wYV9jb3VudDogY29ubmVjdGVkX21wYV9jb3VudFxuXG4gICAgICBwbHVyYWxfY29ubmVjdGVkX21wYV9jb3VudDogcGx1cmFsX2Nvbm5lY3RlZF9tcGFfY291bnRcbiAgICAgIG1pbl9kaXN0YW5jZTogbWluX2Rpc3RhbmNlXG4gICAgICBtYXhfZGlzdGFuY2U6IG1heF9kaXN0YW5jZVxuICAgICAgbWVhbl9kaXN0YW5jZTogbWVhbl9kaXN0YW5jZVxuICAgICAgc2luZ2xlU2tldGNoOiBudW1Ta2V0Y2hlcyA9PSAxXG4gICAgICBpc01QQTogaXNNUEFcbiAgICAgIG51bV9oYWJzOiBudW1faGFic1xuICAgICAgdG90YWxfaGFiczogVE9UQUxfSEFCU1xuICAgICAgbnVtX3JlcHJlc2VudGVkX2hhYnM6IG51bV9yZXByZXNlbnRlZF9oYWJzXG4gICAgICBudW1fcmVwbGljYXRlZF9oYWJzOiBudW1fcmVwbGljYXRlZF9oYWJzXG4gICAgICBpc0dlbmVyaWM6IGlzR2VuZXJpY1xuICAgICAgaXNNUEE6IGlzTVBBXG4gICAgICBudW1fcmVzZXJ2ZXM6IG51bV9yZXNlcnZlc1xuICAgICAgcGx1cmFsX3R5cGUxOiBwbHVyYWxfdHlwZTFcbiAgICAgIG51bV90eXBlMjogbnVtX3R5cGUyXG4gICAgICBwbHVyYWxfdHlwZTI6IHBsdXJhbF90eXBlMlxuICAgICAgbnVtX290aGVyOiBudW1fb3RoZXJcbiAgICAgIHBsdXJhbF9vdGhlcjogcGx1cmFsX290aGVyXG5cbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcbiAgICBAZW5hYmxlTGF5ZXJUb2dnbGVycygpXG5cbiAgICAjc2l6ZV9waWVfdmFsdWVzID0gQGJ1aWxkX3ZhbHVlcyhcIk1lZXRzIE1pbi4gU2l6ZVwiLCBtcGFfY291bnQsXCIjYjNjZmE3XCIsIFwiRG9lcyBub3QgTWVldCBTaXplIE1pbi5cIiwgXG4gICAgIyAgdG90YWxfbXBhX2NvdW50LW1wYV9jb3VudCwgXCIjZTVjYWNlXCIpXG5cbiAgICBAZHJhd1BpZShyZXByZXNlbnRlZF9oYWJzX3BpZV92YWx1ZXMsIFwiI3JlcHJlc2VudGVkX2hhYnNfcGllXCIpXG4gICAgQGRyYXdQaWUocmVwbGljYXRlZF9oYWJzX3BpZV92YWx1ZXMsIFwiI3JlcGxpY2F0ZWRfaGFic19waWVcIilcbiAgICBAZHJhd1BpZShjb25uX3BpZV92YWx1ZXMsIFwiI2Nvbm5lY3Rpdml0eV9waWVcIilcbiAgXG5cbiAgYnVpbGRfdmFsdWVzOiAoeWVzX2xhYmVsLCB5ZXNfY291bnQsIHllc19jb2xvciwgbm9fbGFiZWwsIG5vX2NvdW50LCBub19jb2xvcikgPT5cbiAgICB5ZXNfdmFsID0ge1wibGFiZWxcIjp5ZXNfbGFiZWwrXCIgKFwiK3llc19jb3VudCtcIilcIiwgXCJ2YWx1ZVwiOnllc19jb3VudCwgXCJjb2xvclwiOnllc19jb2xvciwgXCJ5dmFsXCI6MjV9XG4gICAgbm9fdmFsID0ge1wibGFiZWxcIjpub19sYWJlbCtcIiAoXCIrbm9fY291bnQrXCIpXCIsIFwidmFsdWVcIjpub19jb3VudCwgXCJjb2xvclwiOm5vX2NvbG9yLCBcInl2YWxcIjo1MH1cblxuICAgIHJldHVybiBbeWVzX3ZhbCwgbm9fdmFsXVxuXG4gIGdldE51bUhhYnM6IChhdHRyX25hbWUsIGhhYml0YXRzKSA9PlxuICAgIGlmIGhhYml0YXRzPy5sZW5ndGggPT0gMFxuICAgICAgcmV0dXJuIDBcblxuICAgIGNvdW50ID0gMFxuICAgIGZvciBoYWIgaW4gaGFiaXRhdHNcbiAgICAgIGlmIGhhYlthdHRyX25hbWVdID09IFwiWWVzXCJcbiAgICAgICAgY291bnQrPTFcbiAgICByZXR1cm4gY291bnRcblxuICBnZXRSZXNlcnZlVmFsdWVzOiAocmVzZXJ2ZXMpID0+XG4gICAgbnVtX3Jlc2VydmVzID0gMFxuICAgIG51bV90eXBlMiA9IDBcbiAgICBudW1fb3RoZXIgPSAwXG4gICAgdDJfc3RyID0gXCJUeXBlMlwiXG4gICAgbXJfc3RyID0gXCJNUlwiXG4gICAgb3RoZXJfc3RyID0gXCJPdGhlclwiXG4gICAgdHJ5XG4gICAgICBmb3IgcmVzIGluIHJlc2VydmVzXG4gICAgICAgIGF0dHJzID0gcmVzLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgICBmb3IgYXR0IGluIGF0dHJzXG4gICAgICAgICAgaWYgYXR0LmV4cG9ydGlkID09IFwiTUFOQUdFTUVOVFwiIFxuICAgICAgICAgICAgcmVzX3R5cGUgPSBhdHQudmFsdWVcbiAgICAgICAgICAgIGlmIHJlc190eXBlID09IHQyX3N0ciBvciByZXNfdHlwZS5pbmRleE9mKHQyX3N0cikgPj0wXG4gICAgICAgICAgICAgIG51bV90eXBlMis9MVxuICAgICAgICAgICAgZWxzZSBpZiByZXNfdHlwZSA9PSBtcl9zdHIgb3IgcmVzX3R5cGUuaW5kZXhPZihtcl9zdHIpID49MFxuICAgICAgICAgICAgICBudW1fcmVzZXJ2ZXMrPTFcbiAgICAgICAgICAgIGVsc2UgaWYgcmVzX3R5cGUgPT0gb3RoZXJfc3RyIG9yIHJlc190eXBlLmluZGV4T2Yob3RoZXJfc3RyKSA+PSAwXG4gICAgICAgICAgICAgIG51bV9vdGhlcis9MVxuICAgIGNhdGNoIEVycm9yXG4gICAgICBjb25zb2xlLmxvZygncmFuIGludG8gcHJvYmxlbSBnZXR0aW5nIG1wYSB0eXBlcycpXG5cbiAgICByZXR1cm4gW251bV9yZXNlcnZlcywgbnVtX3R5cGUyLCBudW1fb3RoZXJdXG5cbiAgZ2V0RGF0YVZhbHVlOiAoZGF0YSkgPT5cbiAgICByZXR1cm4gZGF0YS52YWx1ZVxuXG4gIGRyYXdQaWU6IChkYXRhLCBwaWVfbmFtZSkgPT5cbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIHcgPSA5MFxuICAgICAgaCA9IDc1XG4gICAgICByID0gMjVcbiAgICAgXG4gICAgICB2aXNfZWwgPSBAJChwaWVfbmFtZSlbMF1cbiAgICAgICN2aXMgPSBkMy5zZWxlY3QodmlzX2VsKVxuICAgICAgdmlzID0gZDMuc2VsZWN0KHZpc19lbCkuYXBwZW5kKFwic3ZnOnN2Z1wiKS5kYXRhKFtkYXRhXSkuYXR0cihcIndpZHRoXCIsIHcpLmF0dHIoXCJoZWlnaHRcIiwgaCkuYXBwZW5kKFwic3ZnOmdcIikuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIChyKjIpICsgXCIsXCIgKyAocis1KSArIFwiKVwiKVxuICAgICAgXG4gICAgICAjdmlzID0gZDMuc2VsZWN0KHBpZV9uYW1lKS5hcHBlbmQoXCJzdmc6c3ZnXCIpLmRhdGEoW2RhdGFdKS5hdHRyKFwid2lkdGhcIiwgdykuYXR0cihcImhlaWdodFwiLCBoKS5hcHBlbmQoXCJzdmc6Z1wiKS5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgKHIqMikgKyBcIixcIiArIChyKzUpICsgXCIpXCIpXG4gICAgICBcbiAgICAgIHBpZSA9IGQzLmxheW91dC5waWUoKS52YWx1ZSgoZCkgLT4gcmV0dXJuIGQudmFsdWUpXG5cbiAgICAgICNkZWNsYXJlIGFuIGFyYyBnZW5lcmF0b3IgZnVuY3Rpb25cbiAgICAgIGFyYyA9IGQzLnN2Zy5hcmMoKS5vdXRlclJhZGl1cyhyKVxuXG4gICAgICAjc2VsZWN0IHBhdGhzLCB1c2UgYXJjIGdlbmVyYXRvciB0byBkcmF3XG4gICAgICBhcmNzID0gdmlzLnNlbGVjdEFsbChcImcuc2xpY2VcIikuZGF0YShwaWUpLmVudGVyKCkuYXBwZW5kKFwic3ZnOmdcIikuYXR0cihcImNsYXNzXCIsIFwic2xpY2VcIilcbiAgICAgIGFyY3MuYXBwZW5kKFwic3ZnOnBhdGhcIilcbiAgICAgICAgLmF0dHIoXCJmaWxsXCIsIChkKSAtPiByZXR1cm4gZC5kYXRhLmNvbG9yKVxuICAgICAgICAuYXR0cihcInN0cm9rZVwiLCAoZCkgLT4gcmV0dXJuIGlmIGQuZGF0YS52YWx1ZSA9PSAwIHRoZW4gXCJub25lXCIgZWxzZSBcIiM1NDU0NTRcIilcbiAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMC4yNSlcbiAgICAgICAgLmF0dHIoXCJkXCIsIChkKSAtPiAgXG4gICAgICAgICAgYXJjKGQpXG4gICAgICAgIClcbiAgICAgICcnJ1xuICAgICAgZWwgPSBAJCgnLnZpeicpW2luZGV4XVxuICAgICAgeCA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgICAgIC5kb21haW4oWzAsIG1heF92YWx1ZV0pXG4gICAgICAgIC5yYW5nZShbMCwgNDAwXSlcbiAgICAgIGNoYXJ0ID0gZDMuc2VsZWN0KGVsKVxuICAgICAgY2hhcnQuc2VsZWN0QWxsKFwiZGl2LnJhbmdlXCIpXG4gICAgICAgIC5kYXRhKHQycmFuZ2VzKVxuICAgICAgJycnXG4gICAgICBlbCA9IEAkKHBpZV9uYW1lK1wiX2xlZ2VuZFwiKVswXVxuICAgICAgY2hhcnQgPSBkMy5zZWxlY3QoZWwpXG4gICAgICBsZWdlbmRzID0gY2hhcnQuc2VsZWN0QWxsKHBpZV9uYW1lK1wiX2xlZ2VuZFwiKVxuICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgLmVudGVyKCkuaW5zZXJ0KFwiZGl2XCIpXG4gICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImxlZ2VuZC1yb3dcIilcblxuICAgICAgbGVnZW5kcy5hcHBlbmQoXCJzcGFuXCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJwaWUtbGFiZWwtc3dhdGNoXCIpXG4gICAgICAgIC5zdHlsZSgnYmFja2dyb3VuZC1jb2xvcicsIChkLGkpIC0+IGQuY29sb3IpXG4gICAgICBcbiAgICAgIGxlZ2VuZHMuYXBwZW5kKFwic3BhblwiKVxuICAgICAgICAudGV4dCgoZCxpKSAtPiByZXR1cm4gZGF0YVtpXS5sYWJlbClcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInBpZS1sYWJlbFwiKVxuXG4gICAgICBcblxuICBnZXRUb3RhbEFyZWFQZXJjZW50OiAocHJvcF9zaXplcykgPT5cblxuICAgIGZvciBwcyBpbiBwcm9wX3NpemVzXG4gICAgICBpZiBwcy5OQU1FID09IFwiUGVyY2VudCBvZiBUb3RhbCBBcmVhXCJcbiAgICAgICAgcmV0dXJuIHBzLlNJWkVfU1FLTVxuICAgIHJldHVybiAwLjBcblxuICBnZXRBdmVyYWdlTWluRGltOiAocHJvcF9zaXplcykgPT5cbiAgICBmb3IgcHMgaW4gcHJvcF9zaXplc1xuICAgICAgaWYgcHMuTkFNRSA9PSBcIkF2ZXJhZ2VcIlxuICAgICAgICByZXR1cm4gcHMuTUlOX0RJTVxuXG4gIGNsZWFudXBEYXRhOiAocHJvcF9zaXplcywgaXNDb2xsZWN0aW9uKSA9PlxuICAgIGNsZWFuZWRfcHJvcHMgPSBbXVxuICAgIG51bV9za2V0Y2hlcyA9IHByb3Bfc2l6ZXM/Lmxlbmd0aFxuICAgIGZvciBwcyBpbiBwcm9wX3NpemVzXG4gICAgICBpZiBwcy5OQU1FICE9IFwiUGVyY2VudCBvZiBUb3RhbCBBcmVhXCJcbiAgICAgICAgcHMuTUlOX0RJTSA9IHBhcnNlRmxvYXQocHMuTUlOX0RJTSkudG9GaXhlZCgxKVxuICAgICAgICBwcy5TSVpFX1NRS00gPSBwYXJzZUZsb2F0KHBzLlNJWkVfU1FLTSkudG9GaXhlZCgxKVxuICAgICAgICBpZiBwcy5TSVpFX1NRS00gPCAwLjFcbiAgICAgICAgICBwcy5TSVpFX1NRS00gPSBcIjwgMC4xXCJcbiAgICAgICAgcHMuQ09BU1QgPSBOdW1iZXIocHMuQ09BU1QpLnRvRml4ZWQoMSlcbiAgICAgICAgaWYgcHMuQ09BU1QgPT0gMCBcbiAgICAgICAgICBwcy5DT0FTVCA9IFwiLS1cIlxuICAgICAgICAjZG9uJ3QgaW5jbHVkZSBhdmVyYWdlIGZvciBzaW5nZSBza2V0Y2hcbiAgICAgICAgaWYgbnVtX3NrZXRjaGVzID09IDMgXG4gICAgICAgICAgaWYgcHMuTkFNRSAhPSBcIkF2ZXJhZ2VcIlxuICAgICAgICAgICAgY2xlYW5lZF9wcm9wcy5wdXNoKHBzKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgY2xlYW5lZF9wcm9wcy5wdXNoKHBzKVxuICAgICAgaWYgcHMuTkFNRSA9PSBcIkF2ZXJhZ2VcIlxuICAgICAgICBwcy5DU1NfQ0xBU1MgPSBcImlzX2F2Z1wiXG4gICAgICBlbHNlXG4gICAgICAgIHBzLkNTU19DTEFTUyA9IFwibm90X2F2Z1wiXG5cbiAgICByZXR1cm4gY2xlYW5lZF9wcm9wc1xuXG4gIGdldE1pbkRpbUNvdW50OiAocHJvcF9zaXplcykgPT5cbiAgICBudW1fbWVldF9jcml0ZXJpYSA9IDBcbiAgICB0b3RhbF9taW5fc2l6ZSA9IDBcblxuICAgIGZvciBwcyBpbiBwcm9wX3NpemVzXG4gICAgICBpZiBwcy5OQU1FICE9IFwiQXZlcmFnZVwiICYmIHBzLk1JTl9ESU0gPiA1IFxuICAgICAgICBudW1fbWVldF9jcml0ZXJpYSs9MVxuXG4gICAgcmV0dXJuIG51bV9tZWV0X2NyaXRlcmlhXG5cbiAgYWRkQ29tbWFzOiAobnVtX3N0cikgPT5cbiAgICBudW1fc3RyICs9ICcnXG4gICAgeCA9IG51bV9zdHIuc3BsaXQoJy4nKVxuICAgIHgxID0geFswXVxuICAgIHgyID0gaWYgeC5sZW5ndGggPiAxIHRoZW4gJy4nICsgeFsxXSBlbHNlICcnXG4gICAgcmd4ID0gLyhcXGQrKShcXGR7M30pL1xuICAgIHdoaWxlIHJneC50ZXN0KHgxKVxuICAgICAgeDEgPSB4MS5yZXBsYWNlKHJneCwgJyQxJyArICcsJyArICckMicpXG4gICAgcmV0dXJuIHgxICsgeDJcblxubW9kdWxlLmV4cG9ydHMgPSBPdmVydmlld1RhYiIsIk92ZXJ2aWV3VGFiID0gcmVxdWlyZSAnLi9vdmVydmlldy5jb2ZmZWUnXG5Vc2VzVGFiID0gcmVxdWlyZSAnLi91c2VzLmNvZmZlZSdcbkVudmlyb25tZW50VGFiID0gcmVxdWlyZSAnLi9lbnZpcm9ubWVudC5jb2ZmZWUnXG5GaXNoaW5nVGFiID0gcmVxdWlyZSAnLi9maXNoaW5nLmNvZmZlZSdcblxud2luZG93LmFwcC5yZWdpc3RlclJlcG9ydCAocmVwb3J0KSAtPlxuICByZXBvcnQudGFicyBbT3ZlcnZpZXdUYWIsIEVudmlyb25tZW50VGFiLCBGaXNoaW5nVGFiLFVzZXNUYWJdXG4gICMgcGF0aCBtdXN0IGJlIHJlbGF0aXZlIHRvIGRpc3QvXG4gIHJlcG9ydC5zdHlsZXNoZWV0cyBbJy4vcmVwb3J0LmNzcyddXG4iLCJSZXBvcnRUYWIgPSByZXF1aXJlICdyZXBvcnRUYWInXG50ZW1wbGF0ZXMgPSByZXF1aXJlICcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5fcGFydGlhbHMgPSByZXF1aXJlICcuLi9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxucGFydGlhbHMgPSBbXVxuZm9yIGtleSwgdmFsIG9mIF9wYXJ0aWFsc1xuICBwYXJ0aWFsc1trZXkucmVwbGFjZSgnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpLycsICcnKV0gPSB2YWxcblxuaWRzID0gcmVxdWlyZSAnLi9pZHMuY29mZmVlJ1xuZm9yIGtleSwgdmFsdWUgb2YgaWRzXG4gIHdpbmRvd1trZXldID0gdmFsdWVcblxuXG5jbGFzcyBVc2VzVGFiIGV4dGVuZHMgUmVwb3J0VGFiXG4gICMgdGhpcyBpcyB0aGUgbmFtZSB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBUYWJcbiAgbmFtZTogJ090aGVyJ1xuICBjbGFzc05hbWU6ICd1c2VzJ1xuICB0aW1lb3V0OiAxMjAwMDBcbiAgdGVtcGxhdGU6IHRlbXBsYXRlcy51c2VzXG4gIGRlcGVuZGVuY2llczogW1xuICAgICdPdmVybGFwV2l0aFJlY3JlYXRpb25hbFVzZXMnXG4gICAgJ1NwZWNpZXNJbmZvcm1hdGlvbidcbiAgXVxuXG5cbiAgcmVuZGVyOiAoKSAtPlxuXG4gICAgI3Nob3cgdGFibGVzIGluc3RlYWQgb2YgZ3JhcGggZm9yIElFXG4gICAgaWYgd2luZG93LmQzXG4gICAgICBkM0lzUHJlc2VudCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBkM0lzUHJlc2VudCA9IGZhbHNlXG5cbiAgICAjc3BlY2llcyBpbmZvXG4gICAgdHJ5XG4gICAgICBzZWFiaXJkcyA9IEByZWNvcmRTZXQoJ1NwZWNpZXNJbmZvcm1hdGlvbicsICdTZWFiaXJkcycpLnRvQXJyYXkoKVxuICAgICAgaGFzU2VhYmlyZEFyZWFzID0gc2VhYmlyZHM/Lmxlbmd0aCA+IDBcbiAgICBjYXRjaCBFcnJvclxuICAgICAgaGFzU2VhYmlyZEFyZWFzID0gZmFsc2VcblxuICAgIHRyeVxuICAgICAgc2VhYmlyZF9jb2xvbmllcyA9IEByZWNvcmRTZXQoJ1NwZWNpZXNJbmZvcm1hdGlvbicsICdTZWFiaXJkQ29sb25pZXMnKS50b0FycmF5KClcbiAgICAgIGhhc1NlYWJpcmRDb2xvbmllcyA9IHNlYWJpcmRfY29sb25pZXM/Lmxlbmd0aCA+IDBcbiAgICBjYXRjaCBFcnJvclxuICAgICAgaGFzU2VhYmlyZENvbG9uaWVzID0gZmFsc2VcblxuICAgIFxuICAgIGhhc1NlYWJpcmRzID0gKHNlYWJpcmRzPy5sZW5ndGg+IDAgb3Igc2VhYmlyZF9jb2xvbmllcz8ubGVuZ3RoID4gMClcbiAgICBtYW1tYWxzID0gQHJlY29yZFNldCgnU3BlY2llc0luZm9ybWF0aW9uJywgJ01hbW1hbHMnKS50b0FycmF5KClcbiAgICBoYXNNYW1tYWxzID0gbWFtbWFscz8ubGVuZ3RoID4gMFxuICAgIHRyeVxuICAgICAgc2VhbHMgPSBAcmVjb3JkU2V0KCdTcGVjaWVzSW5mb3JtYXRpb24nLCAnU2VhbHMnKS50b0FycmF5KClcbiAgICAgIGhhc1NlYWxzID0gc2VhbHM/Lmxlbmd0aCA+IDBcbiAgICBjYXRjaCBFcnJvclxuICAgICAgaGFzU2VhbHMgPSBmYWxzZVxuXG4gICAgXG4gICAgcmVlZl9maXNoID0gQHJlY29yZFNldCgnU3BlY2llc0luZm9ybWF0aW9uJywgJ1JlZWZGaXNoJykudG9BcnJheSgpXG4gICAgaW5IaWdoRGl2ZXJzaXR5UmVlZkZpc2hBcmVhID0gcmVlZl9maXNoPy5sZW5ndGggPiAwXG5cbiAgICBzbWFybyA9IFwiU01BUk9cIlxuICAgIHJlY191c2VzID0gQHJlY29yZFNldCgnT3ZlcmxhcFdpdGhSZWNyZWF0aW9uYWxVc2VzJywgJ1JlY3JlYXRpb25hbFVzZScpLnRvQXJyYXkoKVxuICAgIGhhc1NtYXJvID0gZmFsc2VcblxuXG4gICAgbm9uX3NtYXJvX3JlY191c2VzID0gcmVjX3VzZXMuZmlsdGVyIChyZWMpIC0+IHJlYy5GRUFUX1RZUEUgIT0gc21hcm9cbiAgICBoYXNSZWNVc2VzID0gbm9uX3NtYXJvX3JlY191c2VzPy5sZW5ndGggPiAwXG4gICAgXG4gICAgaGVyaXRhZ2UgPSBAcmVjb3JkU2V0KCdPdmVybGFwV2l0aFJlY3JlYXRpb25hbFVzZXMnLCAnSGVyaXRhZ2UnKS50b0FycmF5KClcbiAgICBoYXNIZXJpdGFnZSA9IGhlcml0YWdlPy5sZW5ndGggPiAwXG4gICAgY29hc3RhbF9jb25zZW50cyA9IEByZWNvcmRTZXQoJ092ZXJsYXBXaXRoUmVjcmVhdGlvbmFsVXNlcycsICdDb2FzdGFsQ29uc2VudHMnKS50b0FycmF5KClcbiAgICBoYXNDb2FzdGFsID0gY29hc3RhbF9jb25zZW50cz8ubGVuZ3RoID4gMFxuICAgIGluZnJhc3RydWN0dXJlID0gIEByZWNvcmRTZXQoJ092ZXJsYXBXaXRoUmVjcmVhdGlvbmFsVXNlcycsICdJbmZyYXN0cnVjdHVyZScpLnRvQXJyYXkoKVxuICAgIGhhc0luZnJhc3RydWN0dXJlID0gaW5mcmFzdHJ1Y3R1cmU/Lmxlbmd0aCA+IDBcbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgIFxuICAgIGhhc1VzZXMgPSBoYXNSZWNVc2VzIG9yIGhhc0hlcml0YWdlIG9yIGhhc0luZnJhc3RydWN0dXJlIG9yIGhhc0NvYXN0YWxcbiAgICBoYXNNYXJpbmVTcGVjaWVzID0gaGFzTWFtbWFscyBvciBoYXNTZWFsc1xuXG4gICAgaXNDb2xsZWN0aW9uID0gQG1vZGVsLmlzQ29sbGVjdGlvbigpXG4gICAgY29udGV4dCA9XG4gICAgICBza2V0Y2g6IEBtb2RlbC5mb3JUZW1wbGF0ZSgpXG4gICAgICBza2V0Y2hDbGFzczogQHNrZXRjaENsYXNzLmZvclRlbXBsYXRlKClcbiAgICAgIGF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICAgIGFueUF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKCkubGVuZ3RoID4gMFxuICAgICAgYWRtaW46IEBwcm9qZWN0LmlzQWRtaW4gd2luZG93LnVzZXJcbiAgICAgIGQzSXNQcmVzZW50OiBkM0lzUHJlc2VudFxuICAgICAgcmVjX3VzZXM6IG5vbl9zbWFyb19yZWNfdXNlc1xuICAgICAgaGFzU21hcm86IGhhc1NtYXJvXG4gICAgICBoYXNSZWNVc2VzOiBoYXNSZWNVc2VzXG4gICAgICBoZXJpdGFnZTogaGVyaXRhZ2VcbiAgICAgIGhhc0hlcml0YWdlOiBoYXNIZXJpdGFnZVxuICAgICAgY29hc3RhbF9jb25zZW50czogY29hc3RhbF9jb25zZW50c1xuICAgICAgaGFzQ29hc3RhbDogaGFzQ29hc3RhbFxuICAgICAgaW5mcmFzdHJ1Y3R1cmU6IGluZnJhc3RydWN0dXJlXG4gICAgICBoYXNJbmZyYXN0cnVjdHVyZTogaGFzSW5mcmFzdHJ1Y3R1cmVcbiAgICAgIGhhc1VzZXM6IGhhc1VzZXNcbiAgICAgIGlzQ29sbGVjdGlvbjogaXNDb2xsZWN0aW9uXG5cbiAgICAgICNzcGVjaWVzIGluZm9cbiAgICAgIHNlYWJpcmRzOiBzZWFiaXJkc1xuICAgICAgc2VhYmlyZF9jb2xvbmllczogc2VhYmlyZF9jb2xvbmllc1xuICAgICAgaGFzU2VhYmlyZHM6IGhhc1NlYWJpcmRzXG4gICAgICBoYXNTZWFiaXJkQXJlYXM6IGhhc1NlYWJpcmRBcmVhc1xuICAgICAgaGFzU2VhYmlyZENvbG9uaWVzOiBoYXNTZWFiaXJkQ29sb25pZXNcbiAgICAgIFxuICAgICAgbWFtbWFsczogbWFtbWFsc1xuICAgICAgaGFzTWFtbWFsczogaGFzTWFtbWFsc1xuICAgICAgcmVlZl9maXNoOiByZWVmX2Zpc2hcbiAgICAgIHNlYWxzOiBzZWFsc1xuICAgICAgaGFzU2VhbHM6IGhhc1NlYWxzXG5cbiAgICAgIGluSGlnaERpdmVyc2l0eVJlZWZGaXNoQXJlYTogaW5IaWdoRGl2ZXJzaXR5UmVlZkZpc2hBcmVhXG4gICAgICBoYXNNYXJpbmVTcGVjaWVzOiBoYXNNYXJpbmVTcGVjaWVzXG5cbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcbiAgICBAZW5hYmxlTGF5ZXJUb2dnbGVycygpXG5cbiAgICBcblxubW9kdWxlLmV4cG9ydHMgPSBVc2VzVGFiIiwidGhpc1tcIlRlbXBsYXRlc1wiXSA9IHRoaXNbXCJUZW1wbGF0ZXNcIl0gfHwge307XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wiZGVtb1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5SZXBvcnQgU2VjdGlvbnM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHA+VXNlIHJlcG9ydCBzZWN0aW9ucyB0byBncm91cCBpbmZvcm1hdGlvbiBpbnRvIG1lYW5pbmdmdWwgY2F0ZWdvcmllczwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkQzIFZpc3VhbGl6YXRpb25zPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDx1bCBjbGFzcz1cXFwibmF2IG5hdi1waWxsc1xcXCIgaWQ9XFxcInRhYnMyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGxpIGNsYXNzPVxcXCJhY3RpdmVcXFwiPjxhIGhyZWY9XFxcIiNjaGFydFxcXCI+Q2hhcnQ8L2E+PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGxpPjxhIGhyZWY9XFxcIiNkYXRhVGFibGVcXFwiPlRhYmxlPC9hPjwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3VsPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGRpdiBjbGFzcz1cXFwidGFiLWNvbnRlbnRcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJ0YWItcGFuZSBhY3RpdmVcXFwiIGlkPVxcXCJjaGFydFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPCEtLVtpZiBJRSA4XT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwidW5zdXBwb3J0ZWRcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIFRoaXMgdmlzdWFsaXphdGlvbiBpcyBub3QgY29tcGF0aWJsZSB3aXRoIEludGVybmV0IEV4cGxvcmVyIDguIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIFBsZWFzZSB1cGdyYWRlIHlvdXIgYnJvd3Nlciwgb3IgdmlldyByZXN1bHRzIGluIHRoZSB0YWJsZSB0YWIuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPiAgICAgIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwhW2VuZGlmXS0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgU2VlIDxjb2RlPnNyYy9zY3JpcHRzL2RlbW8uY29mZmVlPC9jb2RlPiBmb3IgYW4gZXhhbXBsZSBvZiBob3cgdG8gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICB1c2UgZDMuanMgdG8gcmVuZGVyIHZpc3VhbGl6YXRpb25zLiBQcm92aWRlIGEgdGFibGUtYmFzZWQgdmlld1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgYW5kIHVzZSBjb25kaXRpb25hbCBjb21tZW50cyB0byBwcm92aWRlIGEgZmFsbGJhY2sgZm9yIElFOCB1c2Vycy5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxicj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxhIGhyZWY9XFxcImh0dHA6Ly90d2l0dGVyLmdpdGh1Yi5pby9ib290c3RyYXAvMi4zLjIvXFxcIj5Cb290c3RyYXAgMi54PC9hPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgaXMgbG9hZGVkIHdpdGhpbiBTZWFTa2V0Y2ggc28geW91IGNhbiB1c2UgaXQgdG8gY3JlYXRlIHRhYnMgYW5kIG90aGVyIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgaW50ZXJmYWNlIGNvbXBvbmVudHMuIGpRdWVyeSBhbmQgdW5kZXJzY29yZSBhcmUgYWxzbyBhdmFpbGFibGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwidGFiLXBhbmVcXFwiIGlkPVxcXCJkYXRhVGFibGVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD5pbmRleDwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPnZhbHVlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImNoYXJ0RGF0YVwiLGMscCwxKSxjLHAsMCwxMzUxLDE0MTgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8dHI+PHRkPlwiKTtfLmIoXy52KF8uZihcImluZGV4XCIsYyxwLDApKSk7Xy5iKFwiPC90ZD48dGQ+XCIpO18uYihfLnYoXy5mKFwidmFsdWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPjwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gZW1waGFzaXNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkVtcGhhc2lzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwPkdpdmUgcmVwb3J0IHNlY3Rpb25zIGFuIDxjb2RlPmVtcGhhc2lzPC9jb2RlPiBjbGFzcyB0byBoaWdobGlnaHQgaW1wb3J0YW50IGluZm9ybWF0aW9uLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gd2FybmluZ1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+V2FybmluZzwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cD5PciA8Y29kZT53YXJuPC9jb2RlPiBvZiBwb3RlbnRpYWwgcHJvYmxlbXMuPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBkYW5nZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkRhbmdlcjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cD48Y29kZT5kYW5nZXI8L2NvZGU+IGNhbiBhbHNvIGJlIHVzZWQuLi4gc3BhcmluZ2x5LjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wiZW52aXJvbm1lbnRcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7aWYoXy5zKF8uZChcInNrZXRjaENsYXNzLmRlbGV0ZWRcIixjLHAsMSksYyxwLDAsMjQsMjcwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJhbGVydCBhbGVydC13YXJuXFxcIiBzdHlsZT1cXFwibWFyZ2luLWJvdHRvbToxMHB4O1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBUaGlzIHNrZXRjaCB3YXMgY3JlYXRlZCB1c2luZyB0aGUgXFxcIlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCJcXFwiIHRlbXBsYXRlLCB3aGljaCBpc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgbm8gbG9uZ2VyIGF2YWlsYWJsZS4gWW91IHdpbGwgbm90IGJlIGFibGUgdG8gY29weSB0aGlzIHNrZXRjaCBvciBtYWtlIG5ld1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgc2tldGNoZXMgb2YgdGhpcyB0eXBlLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5IYWJpdGF0cyBQcmVzZW50IGluIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDM4MiwzOTIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJTa2V0Y2hcIik7fTtfLmIoXCIgPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTUzNmRiYjQ4YzViNDNlYjBmYWNiYzVhXFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5zaG93IGxheWVyPC9hPjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgQXJlYSAoJSkgcmVmZXJzIHRvIHRoZSBwZXJjZW50YWdlIG9mIHRoZSBoYWJpdGF0IGNvbnRhaW5lZCB3aXRoaW4gdGhlIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgXCIpO2lmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsNjY2LDY3NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIm5ldHdvcmtcIik7fTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgXCIpO2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic2tldGNoXCIpO307Xy5iKFwiIGFzIGEgcHJvcG9ydGlvbiBvZiB0aGUgdG90YWwgYXJlYSBvZiBoYWJpdGF0IHdpdGhpbiB0aGUgU291dGgtRWFzdCBNYXJpbmUgcmVnaW9uLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvaT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8cCBjbGFzcz1cXFwiaW4tcmVwb3J0LWhlYWRlclxcXCI+SGFiaXRhdCB0eXBlczwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDAsOTQ5LDIwODYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIyMFxcXCIgY2xhc3M9XFxcImhhYl90YWJsZVxcXCI+IFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoIGNsYXNzPVxcXCJzb3J0aW5nX2NvbFxcXCIgc3R5bGU9XFxcIndpZHRoOjIwMHB4O1xcXCI+PGEgY2xhc3M9XFxcImhhYl90eXBlIHNvcnRfdXBcXFwiIGhyZWY9XFxcIiNcXFwiPkhhYml0YXQ8L2E+PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD48YSAgY2xhc3M9XFxcImhhYl9uZXdfYXJlYSBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiID5BcmVhIChrbTxzdXA+Mjwvc3VwPik8L2E+PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD48YSBjbGFzcz1cXFwiaGFiX25ld19wZXJjIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCI+QXJlYSAoJSk8L2E+PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsMTM0NywxNjk3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0aD48YSBjbGFzcz1cXFwiaGFiX3JlcHJlc2VudCBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiID5SZXByZXNlbnRlZDwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxNDYxLDE2NjUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICAgIDx0aD48YSBjbGFzcz1cXFwiaGFiX3JlcGxpY2F0ZSBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiID5SZXBsaWNhdGVkPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcImhhYl9jb25uZWN0ZWQgc29ydF9kb3duXFxcIiBocmVmPVxcXCIjXFxcIj5Db25uZWN0aXZpdHkgKGluIGttKTxzdXA+Kjwvc3VwPjwvdGg+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgIDx0Ym9keSBjbGFzcz1cXFwiaGFiX3ZhbHVlc1xcXCI+PC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsMTgyMSwyMDY5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDE4NDcsMjA0NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHN1cD4qPC9zdXA+R2VuZXJhbCBndWlkZWxpbmVzIGZvciBNUEEgbmV0d29yayBkZXNpZ24gc3VnZ2VzdCBNUEEgb2Ygc2ltaWxhciBoYWJpdGF0IHR5cGVzIHRvIGJlIDUwLTEwMGttIGFwYXJ0LlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvaT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJkM0lzUHJlc2VudFwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjE4MHB4O1xcXCI+SGFiaXRhdDwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+QXJlYSAoa208c3VwPjI8L3N1cD4pPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5BcmVhICglKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDIzNDcsMjU3MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgIDx0aD5SZXByZXNlbnRlZDwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwyNDIwLDI1NDEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICAgICAgPHRoPlJlcGxpY2F0ZWQ8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgICAgPHRoPkNvbm5lY3Rpdml0eSAoaW4ga20pPHN1cD4qPC9zdXA+PC90aD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzSGFiVHlwZXNcIixjLHAsMSksYyxwLDAsMjY2NywzMDcyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZihfLnMoXy5mKFwiaGFiX3R5cGVzXCIsYyxwLDEpLGMscCwwLDI2OTYsMzA0NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJIQUJfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJTSVpFX1NRS01cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiUEVSQ1wiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDI4NTMsMzAwMCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlJFUFJFU0VOVFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMjkzMCwyOTY2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8dGQ+XCIpO18uYihfLnYoXy5mKFwiUkVQTElDXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD48dGQ+XCIpO18uYihfLnYoXy5mKFwiQ09OTlwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc0hhYlR5cGVzXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZCBjb2xzcGFuPVxcXCJcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzMTgzLDMxODQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjVcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCI0XCIpO307Xy5iKFwiXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8aT5UaGVyZSBhcmUgbm8gaGFiaXRhdCB0eXBlcy48L2k+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCIgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDM0MTcsMzY2NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzNDQzLDM2NDEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8aT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDxzdXA+Kjwvc3VwPkdlbmVyYWwgZ3VpZGVsaW5lcyBmb3IgTVBBIG5ldHdvcmsgZGVzaWduIHN1Z2dlc3QgTVBBIG9mIHNpbWlsYXIgaGFiaXRhdCB0eXBlcyB0byBiZSA1MC0xMDBrbSBhcGFydC5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L2k+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fX07Xy5iKFwiICAgIDxwIGNsYXNzPVxcXCJpbi1yZXBvcnQtaGVhZGVyXFxcIj5TZW5zaXRpdmUgTWFyaW5lIEhhYml0YXRzPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJkM0lzUHJlc2VudFwiLGMscCwxKSxjLHAsMCwzNzgxLDQ5MTUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMjBcXFwiIGNsYXNzPVxcXCJzaWdfaGFiX3RhYmxlXFxcIj4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGggY2xhc3M9XFxcInNvcnRpbmdfY29sXFxcIiBzdHlsZT1cXFwid2lkdGg6MjAwcHg7XFxcIj48YSBjbGFzcz1cXFwic2lnX2hhYl90eXBlIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCI+SGFiaXRhdDwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD48YSAgY2xhc3M9XFxcInNpZ19oYWJfbmV3X2FyZWEgc29ydF91cFxcXCIgaHJlZj1cXFwiI1xcXCIgPkFyZWEgKGttPHN1cD4yPC9zdXA+KTwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD48YSBjbGFzcz1cXFwic2lnX2hhYl9uZXdfcGVyYyBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiPkFyZWEgKCUpPC9hPjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDQxODEsNDUzMixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcInNpZ19oYWJfcmVwcmVzZW50IHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCI+UmVwcmVzZW50ZWQ8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNDI5Niw0NTAyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJzaWdfaGFiX3JlcGxpY2F0ZSBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiPlJlcGxpY2F0ZWQ8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcInNpZ19oYWJfY29ubmVjdGVkIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCI+Q29ubmVjdGl2aXR5IChpbiBrbSk8c3VwPio8L3N1cD4gPC90aD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgPHRib2R5IGNsYXNzPVxcXCJzaWdfaGFiX3ZhbHVlc1xcXCI+PC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDQ2NTIsNDkwMCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw0Njc4LDQ4NzYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8aT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDxzdXA+Kjwvc3VwPkdlbmVyYWwgZ3VpZGVsaW5lcyBmb3IgTVBBIG5ldHdvcmsgZGVzaWduIHN1Z2dlc3QgTVBBIG9mIHNpbWlsYXIgaGFiaXRhdCB0eXBlcyB0byBiZSA1MC0xMDBrbSBhcGFydC5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L2k+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MTgwcHg7XFxcIj5IYWJpdGF0PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+QXJlYSAoa208c3VwPjI8L3N1cD4pPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+QXJlYSAoJSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw1MTYyLDUzODgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICA8dGg+UmVwcmVzZW50ZWQ8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNTIzNSw1MzU2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgICAgIDx0aD5SZXBsaWNhdGVkPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICAgIDx0aD5Db25uZWN0aXZpdHkgKGluIGttKTxzdXA+Kjwvc3VwPjwvdGg+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc1NpZ0hhYnNcIixjLHAsMSksYyxwLDAsNTQ3MSw1ODQ0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZihfLnMoXy5mKFwic2lnX2hhYnNcIixjLHAsMSksYyxwLDAsNTQ5NSw1ODIyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiSEFCX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlNJWkVfU1FLTVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiUEVSQ1wiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDU2NDIsNTc4MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJSRVBSRVNFTlRcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw1NzE1LDU3NTEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjx0ZD5cIik7Xy5iKF8udihfLmYoXCJSRVBMSUNcIixjLHAsMCkpKTtfLmIoXCI8L3RkPjx0ZD5cIik7Xy5iKF8udihfLmYoXCJDT05OXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc1NpZ0hhYnNcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkIGNvbHNwYW49XFxcIlwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDU5NDMsNTk0NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiNVwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIjRcIik7fTtfLmIoXCJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8aT5UaGVyZSBhcmUgbm8gaGFiaXRhdHMgb2Ygc2lnbmlmaWNhbmNlLjwvaT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9O18uYihcIiAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNTaWdIYWJzXCIsYyxwLDEpLGMscCwwLDYxNzQsNjQ3NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDYxOTMsNjQ1NyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw2MjIxLDY0MzEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgIDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDxzdXA+Kjwvc3VwPkdlbmVyYWwgZ3VpZGVsaW5lcyBmb3IgTVBBIG5ldHdvcmsgZGVzaWduIHN1Z2dlc3QgTVBBIG9mIHNpbWlsYXIgaGFiaXRhdCB0eXBlcyB0byBiZSA1MC0xMDBrbSBhcGFydC5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvaT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3A+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO319KTtjLnBvcCgpO319O18uYihcIiAgICA8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8ZW0+U2Vuc2l0aXZlIGhhYml0YXRzIGFyZSBkZWZpbmVkIGluIHRoZSByZXBvcnQgJzxhIGhyZWY9XFxcImh0dHBzOi8vd3d3Lm1mZS5nb3Z0Lm56L3NpdGVzL2RlZmF1bHQvZmlsZXMvc2Vuc2l0aXZlLW1hcmluZS1iZW50aGljLWhhYml0YXRzLWRlZmluZWQucGRmXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+U2Vuc2l0aXZlIG1hcmluZSBiZW50aGljIGhhYml0YXRzIGRlZmluZWQ8L2E+Licg4oCZTkHigJkgaW5kaWNhdGVzIHRoYXQgdGhlIGhhYml0YXQgaXMgbGlrZWx5IHRvIGJlIHByZXNlbnQgaW4gdGhlIHJlZ2lvbiBidXQgbm90IG1hcHBlZC48L2VtPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2hvd0FkamFjZW50XCIsYyxwLDEpLGMscCwwLDY4NjUsODM0MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PkFkamFjZW50IFRlcnJlc3RyaWFsIEluZm9ybWF0aW9uPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwPjxlbT5NUEEgR3VpZGVsaW5lczogXFxcIkNvbnNpZGVyIGFkamFjZW50IHRlcnJlc3RyaWFsIGVudmlyb25tZW50XFxcIiAoYXJlYXMgc2hvd24gYmVsb3cgYXJlIHdpdGhpbiAxMDBtIG9mIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDcwODcsNzExMyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiYSBza2V0Y2ggaW4gdGhlIGNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgdGhlIHNrZXRjaCBcIik7fTtfLmIoXCIpPC9lbT48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPjxzdHJvbmc+UHJvdGVjdGVkIEFyZWFzPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIyMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzUHJvdGVjdGVkXCIsYyxwLDEpLGMscCwwLDczMjksNzQ4NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcInByb3RlY3RlZF9hcmVhc1wiLGMscCwxKSxjLHAsMCw3MzY0LDc0NTIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJoYXNQcm90ZWN0ZWRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPjxlbT5Ob25lIFByZXNlbnQ8L2VtPjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCIgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPjxzdHJvbmc+Q29uc2VydmF0aW9uIENvdmVuYW50czwvc3Ryb25nPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc0NvdmVuYW50c1wiLGMscCwxKSxjLHAsMCw3ODM0LDgxMzMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJxZTJfY292ZW5hbnRzXCIsYyxwLDEpLGMscCwwLDc4NjcsNzk1NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJOQU1FXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwibmFwYWxpc19jb3ZlbmFudHNcIixjLHAsMSksYyxwLDAsODAxMCw4MDk4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzQ292ZW5hbnRzXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD48ZW0+Tm9uZSBQcmVzZW50PC9lbT48L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wiZmlzaGluZ1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtpZihfLnMoXy5kKFwic2tldGNoQ2xhc3MuZGVsZXRlZFwiLGMscCwxKSxjLHAsMCwyNCwyNzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LXdhcm5cXFwiIHN0eWxlPVxcXCJtYXJnaW4tYm90dG9tOjEwcHg7XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFRoaXMgc2tldGNoIHdhcyBjcmVhdGVkIHVzaW5nIHRoZSBcXFwiXCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIlxcXCIgdGVtcGxhdGUsIHdoaWNoIGlzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBubyBsb25nZXIgYXZhaWxhYmxlLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byBjb3B5IHRoaXMgc2tldGNoIG9yIG1ha2UgbmV3XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBza2V0Y2hlcyBvZiB0aGlzIHR5cGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc0FueUZpc2hpbmdcIixjLHAsMSksYyxwLDAsMzE3LDI1NTIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJoYXNFeGlzdGluZ0Zpc2hpbmdcIixjLHAsMSksYyxwLDAsMzQ1LDEzODIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+RXhpc3RpbmcgRmlzaGVyaWVzIE1hbmFnZW1lbnQ8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8cD48ZW0+VGhlIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDQ3Niw0ODMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIm5ldHdvcmtcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJTa2V0Y2hcIik7fTtfLmIoXCIgaW5jbHVkZXMgdGhlIGZvbGxvd2luZyBleGlzdGluZyBmaXNoZXJpZXMgcmVzdHJpY3Rpb25zLiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgQWxzbyBzaG93biBpcyB0aGUgZXh0ZW50IHRoYXQgdGhlIGZpc2hlcmllcyByZXN0cmljdGlvbnMgYXBwbHkgdG8gdGhlIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDY5NSw3MDMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcInNrZXRjaGVzXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIFwiKTtpZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaFwiKTt9O18uYihcIiBhcyBhIHBlcmNlbnRhZ2Ugb2YgdG90YWwgc2tldGNoIGFyZWEuIEZvciBleGFtcGxlLCAxMDAlIG1lYW5zIG5vIGZpc2hpbmcgb2YgdGhhdCB0eXBlIGlzIGN1cnJlbnRseSBhbGxvd2VkIHdpdGhpbiB0aGUgc2tldGNoLjwvZW0+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5OYW1lPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRoPlBlcmNlbnQ8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiZXhpc3RpbmdfZmlzaGluZ19hcmVhc1wiLGMscCwxKSxjLHAsMCwxMTY3LDEyOTksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlBFUkNfQVJFQVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaGFzQ3VzdG9tYXJ5XCIsYyxwLDEpLGMscCwwLDE0MjcsMjUzMyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDQ+Q3VzdG9tYXJ5IEFyZWFzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzRXhpc3RpbmdDdXN0b21hcnlcIixjLHAsMSksYyxwLDAsMTU0MywxOTg3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgPHA+IFRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxNTc5LDE1ODYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIm5ldHdvcmtcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgaW5jbHVkZXMgdGhlIGZvbGxvd2luZyA8c3Ryb25nPmV4aXN0aW5nPC9zdHJvbmc+IEN1c3RvbWFyeSBBcmVhczo8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmdcIixjLHAsMSksYyxwLDAsMTgxNCwxOTA3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkZFQVRfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJoYXNQcm9wb3NlZEN1c3RvbWFyeVwiLGMscCwxKSxjLHAsMCwyMDQ2LDI0OTAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8cD4gVGhlIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDIwODIsMjA4OSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwibmV0d29ya1wiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaFwiKTt9O18uYihcIiBpbmNsdWRlcyB0aGUgZm9sbG93aW5nIDxzdHJvbmc+cHJvcG9zZWQ8L3N0cm9uZz4gQ3VzdG9tYXJ5IEFyZWFzOjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJwcm9wb3NlZF9jdXN0b21hcnlfZmlzaGluZ1wiLGMscCwxKSxjLHAsMCwyMzE3LDI0MTAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJoYXNBbnlGaXNoaW5nXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PkV4aXN0aW5nIG9yIEN1c3RvbWFyeSBBcmVhczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cD5ObyBpbmZvcm1hdGlvbiBvbiBleGlzdGluZyBmaXNoaW5nIGFyZWFzIG9yIGN1c3RvbWFyeSB1c2UgaXMgYXZhaWxhYmxlIGZvciB0aGlzIGFyZWEuPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9O18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29uZmlkZW50aWFsTVBBTmV0d29ya1wiLGMscCwxKSxjLHAsMCwyODM1LDQyNTIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+RmlzaGluZyBJbnRlbnNpdHk8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8ZW0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgWW91ciBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwyOTgxLDI5ODgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIm5ldHdvcmtcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgaW5jbHVkZXMgYXJlYXMgaWRlbnRpZmllZCBhcyBoYXZpbmcgaGlnaCwgbW9kZXJhdGUgb3IgbG93IGludGVuc2l0eSBmaXNoaW5nIGdyb3VuZHMgZm9yIHRoZSBmb2xsb3dpbmcgZmlzaGVyaWVzLiBUaGUgcGVyY2VudGFnZSBvZiB0aGUgcmVnaW9ucyBoaWdoLCBtb2RlcmF0ZSBhbmQgbG93IGludGVuc2l0eSBmaXNoaW5nIGdyb3VuZHMgY292ZXJlZCBieSB5b3VyIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDMyNzEsMzI3OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwibmV0d29ya1wiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaFwiKTt9O18uYihcIiBpcyBnaXZlbiBiZWxvdy4gRmlzaGVyeSBkaXNwbGFjZW1lbnQgc2hvd3MgdGhlIHBlcmNlbnRhZ2Ugb2YgdGhlIHJlZ2lvbnMgZmlzaGVyeSB0aGF0IHdvdWxkIGJlIGRpc3BsYWNlZCBieSB5b3VyIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDM0NjYsMzQ3MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwibmV0d29ya1wiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaFwiKTt9O18uYihcIi5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L2VtPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjEyNXB4O1xcXCI+RmlzaGVyeTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0aD5IaWdoICglKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0aD5Nb2RlcmF0ZSAoJSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGg+TG93ICglKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0aD5GaXNoZXJ5IGRpc3BsYWNlbWVudCAoJSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiZmlzaGVyeV9pbnRlbnNpdHlcIixjLHAsMSksYyxwLDAsMzk0Niw0MTc4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkZJU0hfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJISUdIXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk1PREVSQVRFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkxPV1wiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJESVNQXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiPCEtLVwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw0Mjk4LDYxNzksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5GaXNoaW5nIEludGVuc2l0eTwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIFRoZSBmb2xsb3dpbmcgdGFibGVzIGNvbnRhaW5zIHRoZSBwZXJjZW50IG9mIHRoZSB0b3RhbCBTRU1QRiBsb3cgaW50ZW5zaXR5IGFuZCBoaWdoIGludGVuc2l0eSBmaXNoaW5nIHRoYXQgbWF5IGJlIGRpc3BsYWNlZCBieSB0aGUgc2tldGNoLiA8c3Ryb25nPkhpZ2ggaW50ZW5zaXR5PC9zdHJvbmc+IGlzIGdyZWF0ZXIgdGhhbiBhbiBhdmVyYWdlIG9mIDUgZXZlbnRzIHBlciBhbm51bSwgPHN0cm9uZz5Mb3c8L3N0cm9uZz4gaXMgNSBvciBsZXNzIGV2ZW50cyBwZXIgYW5udW0uXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJpbi1yZXBvcnQtaGVhZGVyXFxcIj5UcmF3bCBGaXNoaW5nIEludGVuc2l0eTwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD5Ta2V0Y2ggTmFtZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPiUgTG93IEludGVuc2l0eTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPiUgSGlnaCBJbnRlbnNpdHk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJ0cmF3bFwiLGMscCwxKSxjLHAsMCw0OTkzLDUxMjQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJMT1dcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJISUdIXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImluLXJlcG9ydC1oZWFkZXJcXFwiPlNldCBOZXQgRmlzaGluZyBJbnRlbnNpdHk8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5Ta2V0Y2ggTmFtZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+JSBMb3cgSW50ZW5zaXR5PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD4lIEhpZ2ggSW50ZW5zaXR5PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2V0bmV0XCIsYyxwLDEpLGMscCwwLDU0OTMsNTYzNixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkxPV1wiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiSElHSFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwiaW4tcmVwb3J0LWhlYWRlclxcXCI+TG9uZyBMaW5lIEZpc2hpbmcgSW50ZW5zaXR5PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPlNrZXRjaCBOYW1lPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+JSBMb3cgSW50ZW5zaXR5PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+JSBIaWdoIEludGVuc2l0eTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJsb25nbGluZVwiLGMscCwxKSxjLHAsMCw1OTkyLDYxMjMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJMT1dcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJISUdIXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIi0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wib3ZlcnZpZXdcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7aWYoXy5zKF8uZChcInNrZXRjaENsYXNzLmRlbGV0ZWRcIixjLHAsMSksYyxwLDAsMjQsMjcwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJhbGVydCBhbGVydC13YXJuXFxcIiBzdHlsZT1cXFwibWFyZ2luLWJvdHRvbToxMHB4O1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBUaGlzIHNrZXRjaCB3YXMgY3JlYXRlZCB1c2luZyB0aGUgXFxcIlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCJcXFwiIHRlbXBsYXRlLCB3aGljaCBpc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgbm8gbG9uZ2VyIGF2YWlsYWJsZS4gWW91IHdpbGwgbm90IGJlIGFibGUgdG8gY29weSB0aGlzIHNrZXRjaCBvciBtYWtlIG5ld1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgc2tldGNoZXMgb2YgdGhpcyB0eXBlLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDMxMyw3NDgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCwzMjYsNzM3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBzaXplXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+TVBBIE5ldHdvcms8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBUaGlzIENvbGxlY3Rpb24gaGFzOiA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm51bV9yZXNlcnZlc1wiLGMscCwwKSkpO18uYihcIiBUeXBlLTEgTVBBXCIpO2lmKF8ucyhfLmYoXCJwbHVyYWxfdHlwZTFcIixjLHAsMSksYyxwLDAsNDk2LDQ5NyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwic1wiKTt9KTtjLnBvcCgpO31fLmIoXCIsIFwiKTtfLmIoXy52KF8uZihcIm51bV90eXBlMlwiLGMscCwwKSkpO18uYihcIiBUeXBlLTIgTVBBXCIpO2lmKF8ucyhfLmYoXCJwbHVyYWxfdHlwZTJcIixjLHAsMSksYyxwLDAsNTU3LDU1OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwic1wiKTt9KTtjLnBvcCgpO31fLmIoXCIsIGFuZCBcIik7Xy5iKF8udihfLmYoXCJudW1fb3RoZXJcIixjLHAsMCkpKTtfLmIoXCIgT3RoZXIgTVBBXCIpO2lmKF8ucyhfLmYoXCJwbHVyYWxfb3RoZXJcIixjLHAsMSksYyxwLDAsNjIxLDYyMixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwic1wiKTt9KTtjLnBvcCgpO31fLmIoXCI8L3N0cm9uZz4gLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGVtPk9ubHkgVHlwZS0xIGFuZCBUeXBlLTIgTVBBcyBhcmUgcmVwb3J0ZWQgb24uPC9lbT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtpZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe2lmKF8ucyhfLmYoXCJhbnlBdHRyaWJ1dGVzXCIsYyxwLDEpLGMscCwwLDgwNywxMTI1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxoND5cIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXy5ycChcImF0dHJpYnV0ZXMvYXR0cmlidXRlc1RhYmxlXCIsYyxwLFwiICAgICAgICBcIikpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsOTQ1LDEwNzUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgPHRyPjx0ZD5cIik7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDk3Miw5ODYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIk51bWJlciBvZiBNUEFzXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsMTAxMCwxMDI4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJOdW1iZXIgb2YgU2tldGNoZXNcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiPC90ZD5cIik7Xy5iKF8udihfLmYoXCJudW1Ta2V0Y2hlc1wiLGMscCwwKSkpO18uYihcIjx0ZD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX07Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDExNzksMTQ2NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxMjAxLDE0NDYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+TnVtYmVyIG9mIFNrZXRjaGVzIGluIENvbGxlY3Rpb248L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBUaGlzIGNvbGxlY3Rpb24gY29udGFpbnMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJudW1Ta2V0Y2hlc1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBza2V0Y2hcIik7aWYoXy5zKF8uZihcInBsdXJhbFNrZXRjaGVzXCIsYyxwLDEpLGMscCwwLDEzOTcsMTM5OSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiZXNcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCwxNDk0LDM4MjIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMTUxNiwzODAyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBzaXplXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+SGFiaXRhdHMgUmVwcmVzZW50ZWQgaW4gVHlwZS0xIE1QQVwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTNhMGEzMWNkM2Y2MDY0ZDJjMTc1ODBjXFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5zaG93IGxheWVyPC9hPjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoIV8ucyhfLmYoXCJkM0lzUHJlc2VudFwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgIDxzdHJvbmc+TnVtYmVyIG9mIEhhYml0YXQgQ2xhc3Nlczwvc3Ryb25nPjwvYnI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgc3R5bGU9XFxcIm1hcmdpbi10b3A6MHB4O1xcXCIgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIFRoZXJlIGFyZSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInRvdGFsX2hhYnNcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gaGFiaXRhdCBjbGFzc2VzIGluIHRoZSBwbGFubmluZyByZWdpb24sIGFuZCB5b3VyIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDE5NDUsMTk1NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaFwiKTt9O18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBpbmNsdWRlcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm5ld19oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+LiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiB0aGUgSGFiaXRhdCBDbGFzc2lmaWNhdGlvbiwgc2VlXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICB0aGUgPGEgaHJlZj1cXFwiaHR0cDovL3d3dy5kb2MuZ292dC5uei9Eb2N1bWVudHMvY29uc2VydmF0aW9uL21hcmluZS1hbmQtY29hc3RhbC9tYXJpbmUtcHJvdGVjdGVkLWFyZWFzL21wYS1jbGFzc2lmaWNhdGlvbi1wcm90ZWN0aW9uLXN0YW5kYXJkLnBkZlxcXCIgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgTWFyaW5lIFByb3RlY3RlZCBBcmVhcyBDbGFzc2lmaWNhdGlvbiBhbmQgUHJvdGVjdGlvbiBTdGFuZGFyZDwvYT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3A+XCIpO18uYihcIlxcblwiKTt9O2lmKF8ucyhfLmYoXCJkM0lzUHJlc2VudFwiLGMscCwxKSxjLHAsMCwyNDE3LDI2MjEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgPGRpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGRpdiBjbGFzcz1cXFwicmVwcmVzZW50ZWRfaGFic19waWVcXFwiIGlkPVxcXCJyZXByZXNlbnRlZF9oYWJzX3BpZVxcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInJlcHJlc2VudGVkX2hhYnNfcGllX2xlZ2VuZFxcXCIgaWQ9XFxcInJlcHJlc2VudGVkX2hhYnNfcGllX2xlZ2VuZFxcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBzaXplXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+SGFiaXRhdHMgUmVwcmVzZW50ZWQgaW4gYXQgTGVhc3QgMiBNUEFcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxhIGhyZWY9XFxcIiNcXFwiIGRhdGEtdG9nZ2xlLW5vZGU9XFxcIjUzYTBhMzFjZDNmNjA2NGQyYzE3NTgwY1xcXCIgZGF0YS12aXNpYmxlPVxcXCJmYWxzZVxcXCI+c2hvdyBsYXllcjwvYT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKCFfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgIDxzdHJvbmc+TnVtYmVyIG9mIEhhYml0YXQgQ2xhc3Nlczwvc3Ryb25nPjwvYnI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cCBzdHlsZT1cXFwibWFyZ2luLXRvcDowcHg7XFxcIiBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBUaGVyZSBhcmUgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJ0b3RhbF9oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IGhhYml0YXQgY2xhc3NlcyBpbiB0aGUgcGxhbm5pbmcgcmVnaW9uLCBhbmQgeW91ciBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzMTAwLDMxMTAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBpbmNsdWRlcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm5ld19oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+LiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiB0aGUgSGFiaXRhdCBDbGFzc2lmaWNhdGlvbiwgc2VlXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmRvYy5nb3Z0Lm56L0RvY3VtZW50cy9jb25zZXJ2YXRpb24vbWFyaW5lLWFuZC1jb2FzdGFsL21hcmluZS1wcm90ZWN0ZWQtYXJlYXMvbXBhLWNsYXNzaWZpY2F0aW9uLXByb3RlY3Rpb24tc3RhbmRhcmQucGRmXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIE1hcmluZSBQcm90ZWN0ZWQgQXJlYXMgQ2xhc3NpZmljYXRpb24gYW5kIFByb3RlY3Rpb24gU3RhbmRhcmQ8L2E+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3A+XCIpO18uYihcIlxcblwiKTt9O2lmKF8ucyhfLmYoXCJkM0lzUHJlc2VudFwiLGMscCwxKSxjLHAsMCwzNTgwLDM3NzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxkaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBsaWNhdGVkX2hhYnNfcGllXFxcIiBpZD1cXFwicmVwbGljYXRlZF9oYWJzX3BpZVxcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBsaWNhdGVkX2hhYnNfcGllX2xlZ2VuZFxcXCIgaWQ9XFxcInJlcGxpY2F0ZWRfaGFic19waWVfbGVnZW5kXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzODUxLDU0OTMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBzaXplXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PlwiKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsMzkwNSwzOTE0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJNUEEgU2l6ZXNcIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMCwzOTM4LDM5NTAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlNrZXRjaCBTaXplc1wiKTt9KTtjLnBvcCgpO31fLmIoXCI8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8IS0tXCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDM5OTMsNDMyMCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIE9mIHRoZSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInRvdGFsX21wYV9jb3VudFwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBNUEFzIGluIHRoZSBuZXR3b3JrLCA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm1wYV9jb3VudFwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBtZWV0XCIpO2lmKCFfLnMoXy5mKFwicGx1cmFsX21wYV9jb3VudFwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNcIik7fTtfLmIoXCIgdGhlIG1pbmltdW0gc2l6ZSBkaW1lbnNpb24gb2YgNWttLiBUaGUgYXZlcmFnZSBtaW5pbXVtIGRpbWVuc2lvbiBpcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm1wYV9hdmdfc2l6ZV9ndWlkZWxpbmVcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gdGhlIDEwLTIwa20gZ3VpZGVsaW5lLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsNDM0OSw0NDE2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICA8cD5UaGUgc2l6ZSBvZiB0aGUgc2tldGNoZXMgaW4gdGhpcyBjb2xsZWN0aW9uIGFyZTo8L3A+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgLS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+XCIpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw0NTI3LDQ1MzUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIk1QQSBOYW1lXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsNDU1OSw0NTcwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJTa2V0Y2ggTmFtZVwiKTt9KTtjLnBvcCgpO31fLmIoXCI8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD5BcmVhIDwvYnI+KHNxLiBrbS4pPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjEwMHB4O1xcXCI+V2lkdGggKGttKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoxMDBweDtcXFwiPkNvYXN0bGluZSBMZW5ndGggKGttKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJwcm9wX3NpemVzXCIsYyxwLDEpLGMscCwwLDQ4MjIsNTAxMyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0ciBjbGFzcz1cIik7Xy5iKF8udihfLmYoXCJDU1NfQ0xBU1NcIixjLHAsMCkpKTtfLmIoXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJTSVpFX1NRS01cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJNSU5fRElNXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiQ09BU1RcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgVGhpcyBjb21iaW5lZCBhcmVhIHdpdGhpbiB0aGUgbmV0d29yayBhY2NvdW50cyBmb3IgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJhcmVhX3BlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IE1hcmluZSBhcmVhLCBhbmQgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IGNvYXN0bGluZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIEdlbmVyYWwgZ3VpZGVsaW5lcyBmb3IgTVBBIG5ldHdvcmsgZGVzaWduIHN1Z2dlc3QgaW5kaXZpZHVhbCBNUEEgc2hvdWxkIGJlIGEgbWluaW11bSBvZiA1a20gd2lkdGggYW5kIHRoZSBhdmVyYWdlIHdpZHRoIGZvciBhIG5ldHdvcmsgMTAtMjBrbS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2k+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsNTU0MSw2NDIxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBzaXplXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+TVBBIFNpemU8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+TVBBIE5hbWU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPkFyZWEgPC9icj4oc3EuIGttLik8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoxMDBweDtcXFwiPldpZHRoIChrbSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoxMDBweDtcXFwiPkNvYXN0bGluZSBMZW5ndGggKGttKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJwcm9wX3NpemVzXCIsYyxwLDEpLGMscCwwLDU5NDksNjEyOSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlNJWkVfU1FLTVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTUlOX0RJTVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiQ09BU1RcIixjLHAsMCkpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIFRoaXMgYXJlYSB3aXRoaW4gdGhlIE1QQSBhY2NvdW50cyBmb3IgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJhcmVhX3BlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IE1hcmluZSBhcmVhLCBhbmQgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IGNvYXN0bGluZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw2NDYxLDc4NzEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNjQ4MSw3ODUzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxoND5Db25uZWN0aXZpdHk8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzaW5nbGVTa2V0Y2hcIixjLHAsMSksYyxwLDAsNjU3MSw2NzQ4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDxwIHN0eWxlPVxcXCJmb250LXN0eWxlOml0YWxpYztjb2xvcjpncmF5O1xcXCIgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgTm8gY29ubmVjdGl2aXR5IGluZm9ybWF0aW9uIGZvciBhIGNvbGxlY3Rpb24gd2l0aCBvbmUgc2tldGNoLiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwic2luZ2xlU2tldGNoXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICAgIDwhLS1cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGRpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjb25uZWN0aXZpdHlfcGllXFxcIiBpZD1cXFwiY29ubmVjdGl2aXR5X3BpZVxcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY29ubmVjdGl2aXR5X3BpZV9sZWdlbmRcXFwiIGlkPVxcXCJjb25uZWN0aXZpdHlfcGllX2xlZ2VuZFxcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAtLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5PZiB0aGUgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJ0b3RhbF9tcGFfY291bnRcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gTVBBcyBpbiB0aGUgbmV0d29yaywgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb25uZWN0ZWRfbXBhX2NvdW50XCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+XCIpO2lmKF8ucyhfLmYoXCJwbHVyYWxfY29ubmVjdGVkX21wYV9jb3VudFwiLGMscCwxKSxjLHAsMCw3MTczLDcxNzcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiBhcmVcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJwbHVyYWxfY29ubmVjdGVkX21wYV9jb3VudFwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiBpc1wiKTt9O18uYihcIiB3aXRoaW4gMTAwIGttIG9mIGVhY2ggb3RoZXIuIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJjb25uX3ZhbHVlc1xcXCI+VGhlIG1pbmltdW0gZGlzdGFuY2UgYmV0d2VlbiB0aGUgTVBBcyBpcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm1pbl9kaXN0YW5jZVwiLGMscCwwKSkpO18uYihcIiBrbTwvc3Ryb25nPi48L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJjb25uX3ZhbHVlc1xcXCI+VGhlIG1heGltdW0gZGlzdGFuY2UgYmV0d2VlbiB0aGUgTVBBcyBpcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm1heF9kaXN0YW5jZVwiLGMscCwwKSkpO18uYihcIiBrbTwvc3Ryb25nPi48L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJjb25uX3ZhbHVlc1xcXCI+VGhlIGF2ZXJhZ2UgZGlzdGFuY2UgYmV0d2VlbiB0aGUgTVBBcyBpcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm1lYW5fZGlzdGFuY2VcIixjLHAsMCkpKTtfLmIoXCIga208L3N0cm9uZz4uPC9zcGFuPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8cD48aT5HZW5lcmFsIGd1aWRlbGluZXMgZm9yIE1QQSBuZXR3b3JrIGRlc2lnbiBzdWdnZXN0IE1QQSBvZiBzaW1pbGFyIGhhYml0YXQgdHlwZXMgdG8gYmUgNTAtMTAwa20gYXBhcnQuPC9pPjwvcD5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtpZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDc5MTcsODMyMyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gc2l6ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGg0PlNpemU8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBUaGlzIHNrZXRjaCBhcmVhIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwic2l6ZVwiLGMscCwwKSkpO18uYihcIiBzcXVhcmUga2lsb21ldGVyczwvc3Ryb25nPiwgYW5kIGl0IGluY2x1ZGVzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwiY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50XCIsYyxwLDApKSk7Xy5iKFwiJTwvc3Ryb25nPiBvZiB0aGUgU291dGgtRWFzdCBQbGFubmluZyBSZWdpb24uXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBUaGlzIHNrZXRjaCBpbmNsdWRlcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcImNvYXN0bGluZV9sZW5ndGhcIixjLHAsMCkpKTtfLmIoXCIga2lsb21ldGVyczwvc3Ryb25nPiBvZiBjb2FzdGxpbmUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX07Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwhLS1cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHNpemVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0Pk51bWJlciBvZiBIYWJpdGF0czwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICBUaGUgXCIpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw4NDY0LDg1MjEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiBNYXJpbmUgUHJvdGVjdGVkIEFyZWFcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw4NTAzLDg1MDQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcInNcIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMCw4NTQ1LDg1ODcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcInNrZXRjaFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDg1NjgsODU3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiZXNcIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9Xy5iKFwiIGluY2x1ZGVcIik7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJzXCIpO307Xy5iKFwiIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibnVtX2hhYnNcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gb2YgdGhlIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwidG90YWxfaGFic1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBjbGFzc2lmaWVkIGhhYml0YXRzLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIi0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJ1c2VzXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO2lmKF8ucyhfLmQoXCJza2V0Y2hDbGFzcy5kZWxldGVkXCIsYyxwLDEpLGMscCwwLDI0LDI3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtd2FyblxcXCIgc3R5bGU9XFxcIm1hcmdpbi1ib3R0b206MTBweDtcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgVGhpcyBza2V0Y2ggd2FzIGNyZWF0ZWQgdXNpbmcgdGhlIFxcXCJcIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiB0ZW1wbGF0ZSwgd2hpY2ggaXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIG5vIGxvbmdlciBhdmFpbGFibGUuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIGNvcHkgdGhpcyBza2V0Y2ggb3IgbWFrZSBuZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIHNrZXRjaGVzIG9mIHRoaXMgdHlwZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJoYXNDb2FzdGFsXCIsYyxwLDEpLGMscCwwLDMxMCwxMDQ1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDQ+RXhpc3RpbmcgQ29hc3RhbCBDb25zZW50cyA8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXRvZ2dsZS1ub2RlPVxcXCI1M2Q3MTlhNDkzODAxNzRhNzc2NmRkODVcXFwiIGRhdGEtdmlzaWJsZT1cXFwiZmFsc2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIHNob3cgbGF5ZXI8L2E+PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwPlwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDUyNCw1NTQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkEgc2tldGNoIHdpdGhpbiB0aGUgY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlRoZSBza2V0Y2hcIik7fTtfLmIoXCIgY29udGFpbnMgb3IgaXMgd2l0aGluIDIwMG0gb2Ygc2l0ZXMgd2l0aCBSZXNvdXJjZSBDb25zZW50cy48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5Db25zZW50IFR5cGU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiY29hc3RhbF9jb25zZW50c1wiLGMscCwxKSxjLHAsMCw4OTMsOTc4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNVc2VzXCIsYyxwLDEpLGMscCwwLDEwNzQsNDE0NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImhhc1JlY1VzZXNcIixjLHAsMSksYyxwLDAsMTA5MiwyMzU2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDQ+UmVjcmVhdGlvbmFsIFVzZXMgPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8IS0tXCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc1NtYXJvXCIsYyxwLDEpLGMscCwwLDEyMDAsMTY4OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgIDxwPjxzdHJvbmc+U3BlY3RydW0gb2YgTUFyaW5lIFJlY3JlYXRpb25hbCBPcHBvcnR1bml0eSAoU01BUk8pPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8cD5cIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxMzM5LDEzNDksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJTa2V0Y2hcIik7fTtfLmIoXCIgaW5jbHVkZXMgYXJlYShzKSBpZGVudGlmaWVkIGFzIGhhdmluZyA8c3Ryb25nPiBtZWRpdW0gb3IgaGlnaCA8L3N0cm9uZz4gcmVjcmVhdGlvbmFsIG9wcG9ydHVuaXR5LlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8ZW0+WW91IGNhbiBmaW5kIG1vcmUgaW5mb3JtYXRpb24gb24gU01BUk8gaW4gdGhlIFxcXCJkYXRhIGRlc2NyaXB0aW9uXFxcIiBieSByaWdodCBjbGlja2luZyBvbiB0aGUgbGF5ZXIgbmFtZS48L2VtPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9icj48L2JyPlwiKTtfLmIoXCJcXG5cIik7fTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAtLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoyNTBweDtcXFwiPkFjdGl2aXR5IFR5cGU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPk51bWJlciBvZiBTaXRlczwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNSZWNVc2VzXCIsYyxwLDEpLGMscCwwLDE5NTksMjE0MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcInJlY191c2VzXCIsYyxwLDEpLGMscCwwLDE5ODcsMjExNSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJGRUFUX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiQ09VTlRcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzUmVjVXNlc1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQgY29sc3Bhbj0yPjxlbT5Ob25lIFByZXNlbnQ8L2VtPjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCIgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc0hlcml0YWdlXCIsYyxwLDEpLGMscCwwLDIzOTEsMzM0NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxoND5BcmNoZW9sb2dpY2FsIEluZm9ybWF0aW9uIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXRvZ2dsZS1ub2RlPVxcXCI1NTc4ZjE0Y2ZmMzkwNTlhNTgzNjQ2YzlcXFwiIGRhdGEtdmlzaWJsZT1cXFwiZmFsc2VcXFwiPnNob3cgbGF5ZXI8L2E+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxwPlwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDI2NTAsMjY4MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiQSBza2V0Y2ggd2l0aGluIHRoZSBjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiVGhlIHNrZXRjaFwiKTt9O18uYihcIiBjb250YWlucyBvciBpcyB3aXRoaW4gMjAwbSBvZiBzaXRlcyBpZGVudGlmaWVkIGFzIGhhdmluZyBzaWduaWZpY2FudCBoZXJpdGFnZSB2YWx1ZXMuPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoyNTBweDtcXFwiPkhlcml0YWdlIFR5cGU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aD5OdW1iZXIgb2YgU2l0ZXM8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGVyaXRhZ2VcIixjLHAsMSksYyxwLDAsMzExMywzMjUxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJGRUFUX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJDT1VOVFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO307fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImhhc0luZnJhc3RydWN0dXJlXCIsYyxwLDEpLGMscCwwLDMzODcsNDEyMixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxoND5JbmZyYXN0cnVjdHVyZTwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHA+XCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMzUyMywzNTUzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJBIHNrZXRjaCB3aXRoaW4gdGhlIGNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJUaGUgc2tldGNoXCIpO307Xy5iKFwiIGNvbnRhaW5zIG9yIGlzIHdpdGhpbiAyMDBtIG9mIHNpdGVzIHdpdGggZXhpc3RpbmcgaW5mcmFzdHJ1Y3R1cmUuPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoyNTBweDtcXFwiPlR5cGU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaW5mcmFzdHJ1Y3R1cmVcIixjLHAsMSksYyxwLDAsMzkyMCw0MDIxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJGRUFUX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9O30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzVXNlc1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5BY3Rpdml0aWVzIGFuZCBVc2VzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwPlRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw0MjgxLDQyOTEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgIGRvZXMgPHN0cm9uZz5ub3Q8L3N0cm9uZz4gaW5jbHVkZSBhbnkgPHN0cm9uZz5hY3Rpdml0aWVzIG9yIHVzZXM8L3N0cm9uZz4uPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9O18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc1NlYWJpcmRzXCIsYyxwLDEpLGMscCwwLDQ0NjgsNTE5NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+QmlyZHMgPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzU2VhYmlyZEFyZWFzXCIsYyxwLDEpLGMscCwwLDQ1NTYsNDg0MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPjxzdHJvbmc+SW1wb3J0YW50IFNlYWJpcmQgQXJlYXM8L3N0cm9uZz48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzZWFiaXJkc1wiLGMscCwxKSxjLHAsMCw0NzAzLDQ3ODMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJOYW1lXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgXCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc1NlYWJpcmRDb2xvbmllc1wiLGMscCwxKSxjLHAsMCw0ODkzLDUxNjMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+PHN0cm9uZz5TZWFiaXJkIENvbG9uaWVzPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzZWFiaXJkX2NvbG9uaWVzXCIsYyxwLDEpLGMscCwwLDUwMzMsNTEwNSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTmFtZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImhhc01hcmluZVNwZWNpZXNcIixjLHAsMSksYyxwLDAsNTIzMiw1Njk0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5NYXJpbmUgTWFtbWFsczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5TcGVjaWVzPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcIm1hbW1hbHNcIixjLHAsMSksYyxwLDAsNTQ4MCw1NTYwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTmFtZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJzZWFsc1wiLGMscCwxKSxjLHAsMCw1NTk1LDU2NDAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJoYXNNYXJpbmVTcGVjaWVzXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PlNwZWNpZXMgSW5mb3JtYXRpb248L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHA+VGhlIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDU4NDgsNTg4MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwic2tldGNoZXMgd2l0aGluIHRoZSBjb2xsZWN0aW9uIGRvIFwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaCBkb2VzXCIpO307Xy5iKFwiIDxzdHJvbmc+bm90PC9zdHJvbmc+IGluY2x1ZGUgYW55IDxzdHJvbmc+aW1wb3J0YW50IG1hcmluZSBtYW1tYWwgYXJlYXM8L3N0cm9uZz4uPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9O3JldHVybiBfLmZsKCk7O30pO1xuXG5pZih0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gdGhpc1tcIlRlbXBsYXRlc1wiXTtcbn0iXX0=
