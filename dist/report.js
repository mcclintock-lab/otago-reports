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
    this.roundData = __bind(this.roundData, this);
    _ref = EnvironmentTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  EnvironmentTab.prototype.name = 'Habitats';

  EnvironmentTab.prototype.className = 'environment';

  EnvironmentTab.prototype.timeout = 120000;

  EnvironmentTab.prototype.template = templates.environment;

  EnvironmentTab.prototype.dependencies = ['HabitatsEnvironment', 'HabitatsOverview', 'AdjacentTerrestrial', 'HabRepsToolbox'];

  EnvironmentTab.prototype.render = function() {
    var adjacent_land, attributes, coastal_land, context, d3IsPresent, hab_sizes, habitats_represented, habs_in_sketch, habs_plural, hasAdjacent, hasCoastal, hasPublic, isCollection, isGeneric, public_land, scid;
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
    hab_sizes = this.recordSet('HabRepsToolbox', 'HabSizes').toArray();
    'habitats = @recordSet(\'HabitatsEnvironment\', \'HabitatSize\').toArray()\nhabs_in_sketch = habitats?.length\nhabs_plural = habs_in_sketch != 1';
    habs_in_sketch = hab_sizes != null ? hab_sizes.length : void 0;
    habs_plural = habs_in_sketch !== 1;
    public_land = this.recordSet('AdjacentTerrestrial', 'PublicConservationLand').toArray();
    hasPublic = (public_land != null ? public_land.length : void 0) > 0;
    coastal_land = this.recordSet('AdjacentTerrestrial', 'CoastalProtection').toArray();
    hasCoastal = (coastal_land != null ? coastal_land.length : void 0) > 0;
    adjacent_land = this.recordSet('AdjacentTerrestrial', 'AdjacentLandCover').toArray();
    hasAdjacent = (adjacent_land != null ? adjacent_land.length : void 0) > 0;
    habitats_represented = this.recordSet('HabRepsToolbox', 'RepresentedHabs').toArray();
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
      hab_sizes: hab_sizes,
      habs_in_sketch: habs_in_sketch,
      habs_plural: habs_plural,
      habitats_represented: habitats_represented,
      public_land: public_land,
      hasPublicLand: hasPublic,
      coastal_land: coastal_land,
      hasCoastalLand: hasCoastal,
      adjacent_land: adjacent_land,
      hasAdjacentLand: hasAdjacent
    };
    this.$el.html(this.template.render(context, partials));
    this.enableLayerTogglers();
    this.roundData(hab_sizes);
    this.setupHabitatSorting(hab_sizes);
    return this.enableTablePaging();
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

  EnvironmentTab.prototype.setupHabitatSorting = function(habitats) {
    var tableName, tbodyName,
      _this = this;
    tbodyName = '.hab_values';
    tableName = '.hab_table';
    this.$('.hab_type').click(function(event) {
      return _this.renderSort('hab_type', tableName, habitats, event, "HAB_TYPE", tbodyName, false, _this.getHabitatRowString);
    });
    this.$('.hab_new_area').click(function(event) {
      return _this.renderSort('hab_new_area', tableName, habitats, event, "SIZE_SQKM", tbodyName, true, _this.getHabitatRowString);
    });
    this.$('.hab_new_perc').click(function(event) {
      return _this.renderSort('hab_new_perc', tableName, habitats, event, "PERC", tbodyName, true, _this.getHabitatRowString);
    });
    return this.renderSort('hab_type', tableName, habitats, void 0, "HAB_TYPE", tbodyName, false, this.getHabitatRowString);
  };

  EnvironmentTab.prototype.renderSort = function(name, tableName, pdata, event, sortBy, tbodyName, isFloat, getRowStringValue) {
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
      columns = ["HAB_TYPE", "SIZE_SQKM", "PERC"];
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

  EnvironmentTab.prototype.getHabitatRowString = function(d) {
    return "<td>" + d.HAB_TYPE + "</td>" + "<td>" + d.SIZE_SQKM + "</td>" + "<td>" + d.PERC + "</td>";
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
    } else {
      existing_customary_fishing = this.recordSet('FishingAreas', 'ExistingCustomaryArea').toArray();
      hasExistingCustomary = (existing_customary_fishing != null ? existing_customary_fishing.length : void 0) > 0;
      console.log("existing_customary: ", existing_customary_fishing);
      proposed_customary_fishing = this.recordSet('FishingAreas', 'ProposedCustomaryArea').toArray();
      console.log("proposed customary: ", proposed_customary_fishing);
      hasProposedCustomary = (proposed_customary_fishing != null ? proposed_customary_fishing.length : void 0) > 0;
      hasCustomary = hasExistingCustomary || hasProposedCustomary;
      console.log("has customary? ", hasCustomary);
      existing_fishing_areas = this.recordSet('FishingAreas', 'FishingExistingArea').toArray();
      hasExistingFishing = (existing_fishing_areas != null ? existing_fishing_areas.length : void 0) > 0;
      hasAnyFishing = hasExistingFishing || hasCustomary;
    }
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
    var rs, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = rec_set.length; _i < _len; _i++) {
      rs = rec_set[_i];
      rs.LOW = Number(rs.LOW).toFixed(1);
      rs.HIGH = Number(rs.HIGH).toFixed(1);
      _results.push(rs.TOTAL = Number(rs.TOTAL).toFixed(1));
    }
    return _results;
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
    var Error, TOTAL_COASTLINE_LENGTH, TOTAL_HABS, attributes, bad_color, coastline_length, coastline_length_percent, conn_pie_values, connected_mpa_count, context, d3IsPresent, good_color, hab_sizes, isCollection, isGeneric, isMPA, max_distance, mean_distance, min_distance, mpa_avg_min_dim, mpa_avg_size_guideline, mpa_count, new_habs, new_size, not_replicated, not_represented, numSketches, num_habs, num_replicated_habs, num_represented_habs, percent, pluralSketches, plural_connected_mpa_count, plural_mpa_count, prop_sizes, ratio, replicated_habs_pie_values, represented_habs, represented_habs_pie_values, res, scid, size, total_habs, total_mpa_count, total_percent;
    TOTAL_COASTLINE_LENGTH = 667.594;
    TOTAL_HABS = 30;
    isCollection = this.model.isCollection();
    if (isCollection) {
      numSketches = this.model.getChildren().length;
      scid = this.sketchClass.id;
    } else {
      numSketches = 1;
      scid = this.sketchClass.id;
    }
    pluralSketches = numSketches > 1;
    isGeneric = scid === GENERIC_ID || scid === GENERIC_COLLECTION_ID;
    prop_sizes = this.recordSet('ProposalSize', 'Sizes').toArray();
    represented_habs = this.recordSet('HabRepsToolbox', 'RepresentedHabs').toArray();
    hab_sizes = this.recordSet('HabRepsToolbox', 'RepresentedHabs').toArray();
    num_habs = hab_sizes != null ? hab_sizes.length : void 0;
    num_represented_habs = represented_habs != null ? represented_habs.length : void 0;
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
      console.log(size);
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
      console.log("error getting percent");
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
    if (numSketches > 1) {
      res = this.recordSet('ProposalConnectivity', 'ResultMsg');
      console.log("result: ", res);
      connected_mpa_count = this.recordSet('ProposalConnectivity', 'Conn').float('NUMBER');
      plural_connected_mpa_count = true;
      min_distance = this.recordSet('ProposalConnectivity', 'Conn').float('MIN');
      max_distance = this.recordSet('ProposalConnectivity', 'Conn').float('MAX');
      mean_distance = this.recordSet('ProposalConnectivity', 'Conn').float('MEAN');
      good_color = "#b3cfa7";
      bad_color = "#e5cace";
      num_replicated_habs = 0;
      conn_pie_values = this.build_values("MPAs Within Connectivity Range", connected_mpa_count, good_color, "MPAs Outside Connectivity Range", total_mpa_count - connected_mpa_count, bad_color);
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
    isMPA = scid === MPA_ID || scid === MPA_COLLECTION_ID;
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
      isGeneric: isGeneric
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

  OverviewTab.prototype.cleanupData = function(prop_sizes) {
    var cleaned_props, ps, _i, _len;
    cleaned_props = [];
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
        cleaned_props.push(ps);
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
this["Templates"]["environment"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(!_.s(_.f("isGeneric",c,p,1),c,p,1,0,0,"")){_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Habitat-types Represented in ");if(_.s(_.f("isCollection",c,p,1),c,p,0,405,415,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" ");_.b("\n" + i);_.b("  <a href=\"#\" data-toggle-node=\"53a0a31cd3f6064d2c17580c\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);_.b("      <table data-paging=\"20\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th style=\"width:250px;\">Habitat</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("habitats_represented",c,p,1),c,p,0,769,845,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("</div>");_.b("\n");};_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Habitats Present in ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1012,1022,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" <a href=\"#\" data-toggle-node=\"53a0a31cd3f6064d2c17580c\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);_.b("    <p>");_.b("\n" + i);_.b("      <i>");_.b("\n" + i);_.b("        Area (%) refers to the percentage of the habitat contained within the ");_.b("\n" + i);_.b("        ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1299,1372,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isGeneric",c,p,1),c,p,0,1313,1323,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isGeneric",c,p,1),c,p,1,0,0,"")){_.b("network");};});c.pop();}_.b("\n" + i);_.b("        ");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" as a proportion of the total area of habitat within the South-East Marine region.");_.b("\n" + i);_.b("      </i>");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,1561,2038,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <table data-paging=\"20\" class=\"hab_table\"> ");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th class=\"sorting_col\" style=\"width:250px;\"><a class=\"hab_type sort_up\" href=\"#\">Habitat Classification Type</a></th>");_.b("\n" + i);_.b("            <th><a  class=\"hab_new_area sort_down\" href=\"#\" >Area (km<sup>2</sup>)</a></th>");_.b("\n" + i);_.b("            <th><a class=\"hab_new_perc sort_down\" href=\"#\">Area (%)</a></th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody class=\"hab_values\"></tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n");});c.pop();}if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th style=\"width:250px;\">Habitats</th>");_.b("\n" + i);_.b("            <th>Area (<sup>2</sup>)</th>");_.b("\n" + i);_.b("            <th>Area (%)</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("hab_sizes",c,p,1),c,p,0,2333,2474,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("PERC",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n");};_.b("    <!---  ");_.b("\n" + i);_.b("      </br>");_.b("\n" + i);_.b("      <p>");_.b("\n" + i);_.b("        <p class=\"large\">");_.b("\n" + i);_.b("          <strong>Habitat Evenness</strong></br>");_.b("\n" + i);_.b("          The measure of 'evenness' for the <strong>");_.b(_.v(_.f("habs_in_sketch",c,p,0)));_.b("</strong> habitat");if(_.s(_.f("habs_plural",c,p,1),c,p,0,2754,2755,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}_.b(" present in the Sketch is <strong>");_.b(_.v(_.f("evenness",c,p,0)));_.b("</strong>.");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("        <p>");_.b("\n" + i);_.b("          <em>Evenness is a measure of the relative abundance of habitats within an area, where a high number approaching ");_.b("\n" + i);_.b("          1 means all the habitats are relatively similar in size, and a low number indicating that the habitats are varied ");_.b("\n" + i);_.b("          in their size. A higher habitat evenness score generally indicates a higher species diversity. ");_.b("\n" + i);_.b("          Evenness has been calculated using the Simpson's E index.</em>");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    -->");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Adjacent Terrestrial Information</h4>");_.b("\n" + i);_.b("      <p><em>MPA Guidelines: \"Consider adjacent terrestrial environment\" (areas shown below are within 100m of ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3534,3560,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("a sketch in the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b(" the sketch ");};_.b(")</em></p>");_.b("\n" + i);_.b("      <p class=\"large\"><strong>Public Conservation Land</strong></p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("hasPublicLand",c,p,1),c,p,0,3778,3914,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("public_land",c,p,1),c,p,0,3807,3887,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasPublicLand",c,p,1),c,p,1,0,0,"")){_.b("            <tr>");_.b("\n" + i);_.b("              <td><em>None Present</em></td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");};_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("      <p class=\"large\"><strong>Coastal Protection and Recreation Areas (CPA & CRA)</strong></p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("hasCoastalLand",c,p,1),c,p,0,4275,4413,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("coastal_land",c,p,1),c,p,0,4305,4385,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasCoastalLand",c,p,1),c,p,1,0,0,"")){_.b("            <tr>");_.b("\n" + i);_.b("              <td><em>None Present</em></td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");};_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["fishing"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,309,3186,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("      <h4>Trawl Fishing Intensity</h4>");_.b("\n" + i);_.b("        <p class=\"large\">");_.b("\n" + i);_.b("          The following table contains the percent of the total SEMPF low intensity and high intensity trawl fishing that may be displaced by the sketch. <i>High intensity is greater than an average of 5 events per annum, Low is 5 or less events per annum.</i>");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <thead>");_.b("\n" + i);_.b("              <tr>");_.b("\n" + i);_.b("                <th>Sketch Name</th>");_.b("\n" + i);_.b("                <th>% Low Intensity</th>");_.b("\n" + i);_.b("                <th>% High Intensity</th>");_.b("\n" + i);_.b("                <th>Total %</th>");_.b("\n" + i);_.b("\n" + i);_.b("              </tr>");_.b("\n" + i);_.b("            </thead>");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("trawl",c,p,1),c,p,0,1009,1199,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("TOTAL",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("    <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("      <h4>Set Net Fishing Intensity</h4>");_.b("\n" + i);_.b("        <p class=\"large\">");_.b("\n" + i);_.b("          The following table contains the percent of the total SEMPF low intensity and high intensity set net fishing that may be displaced by the sketch. <i>High intensity is greater than an average of 5 events per annum, Low is 5 or less events per annum.</i>");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <thead>");_.b("\n" + i);_.b("              <tr>");_.b("\n" + i);_.b("                <th>Sketch Name</th>");_.b("\n" + i);_.b("                <th>% Low Intensity</th>");_.b("\n" + i);_.b("                <th>% High Intensity</th>");_.b("\n" + i);_.b("                <th>Total %</th>");_.b("\n" + i);_.b("\n" + i);_.b("              </tr>");_.b("\n" + i);_.b("            </thead>");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("setnet",c,p,1),c,p,0,1965,2155,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("TOTAL",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("    <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("      <h4>Long Line Fishing Intensity</h4>");_.b("\n" + i);_.b("        <p class=\"large\">");_.b("\n" + i);_.b("          The following table contains the percent of the total SEMPF low intensity and high intensity long line fishing that may be displaced by the sketch. <i>High intensity is greater than an average of 5 events per annum, Low is 5 or less events per annum.</i>");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <thead>");_.b("\n" + i);_.b("              <tr>");_.b("\n" + i);_.b("                <th>Sketch Name</th>");_.b("\n" + i);_.b("                <th>% Low Intensity</th>");_.b("\n" + i);_.b("                <th>% High Intensity</th>");_.b("\n" + i);_.b("                <th>Total %</th>");_.b("\n" + i);_.b("\n" + i);_.b("              </tr>");_.b("\n" + i);_.b("            </thead>");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("longline",c,p,1),c,p,0,2928,3118,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("TOTAL",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n" + i);_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(!_.s(_.f("isMPA",c,p,1),c,p,1,0,0,"")){if(_.s(_.f("hasAnyFishing",c,p,1),c,p,0,3229,5419,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hasExistingFishing",c,p,1),c,p,0,3257,4297,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("      <h4>Existing Fisheries Management</h4>");_.b("\n" + i);_.b("          <p><em>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3388,3398,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" includes the following existing fisheries restrictions. ");_.b("\n" + i);_.b("          Also shown is the extent that the fisheries restrictions apply to the ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3610,3618,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketches");});c.pop();}_.b("\n" + i);_.b("          ");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" as a percentage of total sketch area. For example, 100% means no fishing of that type is currently allowed within the sketch.</em></p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <thead>");_.b("\n" + i);_.b("              <tr>");_.b("\n" + i);_.b("                <th style=\"width:250px;\">Name</th>");_.b("\n" + i);_.b("                <th>Percent</th>");_.b("\n" + i);_.b("              </tr>");_.b("\n" + i);_.b("            </thead>");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("existing_fishing_areas",c,p,1),c,p,0,4082,4214,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("PERC_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}if(_.s(_.f("hasCustomary",c,p,1),c,p,0,4342,5400,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("      <h4>Customary Areas</h4>");_.b("\n" + i);if(_.s(_.f("hasExistingCustomary",c,p,1),c,p,0,4452,4877,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <p> The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,4486,4496,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes the following <strong>existing</strong> Customary Areas:</p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("existing_customary_fishing",c,p,1),c,p,0,4718,4803,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n");});c.pop();}if(_.s(_.f("hasProposedCustomary",c,p,1),c,p,0,4934,5359,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <p> The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,4968,4978,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes the following <strong>proposed</strong> Customary Areas:</p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("proposed_customary_fishing",c,p,1),c,p,0,5200,5285,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n");});c.pop();}_.b("    </div>");_.b("\n");});c.pop();}_.b("\n");});c.pop();}if(!_.s(_.f("hasAnyFishing",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Existing or Customary Areas</h4>");_.b("\n" + i);_.b("        <p>No information on existing fishing areas or customary use is available for this area.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};};return _.fl();;});
this["Templates"]["overview"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("anyAttributes",c,p,1),c,p,0,313,597,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection\">");_.b("\n" + i);_.b("    <h4>");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("</h4>");_.b("\n" + i);_.b(_.rp("attributes/attributesTable",c,p,"    "));if(_.s(_.f("isCollection",c,p,1),c,p,0,435,557,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <tr><td>");if(_.s(_.f("isMPA",c,p,1),c,p,0,458,472,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Number of MPAs");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,496,514,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Number of Sketches");});c.pop();}_.b("</td>");_.b(_.v(_.f("numSketches",c,p,0)));_.b("<td>");_.b("\n");});c.pop();}_.b("    </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,634,4395,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isGeneric",c,p,1),c,p,0,651,894,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection\">");_.b("\n" + i);_.b("      <h4>Number of Sketches in Collection</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This collection contains <strong>");_.b(_.v(_.f("numSketches",c,p,0)));_.b("</strong> sketch");if(_.s(_.f("pluralSketches",c,p,1),c,p,0,847,849,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("es");});c.pop();}_.b(".");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,922,4383,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    ");_.b("\n" + i);_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Habitat-types Represented ");_.b("\n" + i);_.b("        <a href=\"#\" data-toggle-node=\"53a0a31cd3f6064d2c17580c\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("      <strong>Number of Habitat Classes</strong></br>");_.b("\n" + i);_.b("      <p style=\"margin-top:0px;\" class=\"large\">");_.b("\n" + i);_.b("        There are <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> habitat classes in the planning region, and your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1348,1358,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("\n" + i);_.b("        includes <strong>");_.b(_.v(_.f("new_habs",c,p,0)));_.b("</strong>. For more information on the Habitat Classification, see");_.b("\n" + i);_.b("        the <a href=\"http://www.doc.govt.nz/Documents/conservation/marine-and-coastal/marine-protected-areas/mpa-classification-protection-standard.pdf\" target=\"_blank\">");_.b("\n" + i);_.b("        Marine Protected Areas Classification and Protection Standard</a>");_.b("\n" + i);_.b("      </p>");_.b("\n");};if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,1820,2024,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <div>");_.b("\n" + i);_.b("          <div class=\"represented_habs_pie\" id=\"represented_habs_pie\"></div>");_.b("\n" + i);_.b("          <div class=\"represented_habs_pie_legend\" id=\"represented_habs_pie_legend\"></div>");_.b("\n" + i);_.b("        </div>");_.b("\n");});c.pop();}_.b("    </div>");_.b("\n" + i);_.b("    ");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Habitat-types Replicated");_.b("\n" + i);_.b("        <a href=\"#\" data-toggle-node=\"53a0a31cd3f6064d2c17580c\" data-visible=\"false\">show layer</a>");_.b("\n" + i);_.b("      </h4>");_.b("\n" + i);if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("        <strong>Number of Habitat Classes</strong></br>");_.b("\n" + i);_.b("        <p style=\"margin-top:0px;\" class=\"large\">");_.b("\n" + i);_.b("          There are <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> habitat classes in the planning region, and your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,2489,2499,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("\n" + i);_.b("          includes <strong>");_.b(_.v(_.f("new_habs",c,p,0)));_.b("</strong>. For more information on the Habitat Classification, see");_.b("\n" + i);_.b("          the <a href=\"http://www.doc.govt.nz/Documents/conservation/marine-and-coastal/marine-protected-areas/mpa-classification-protection-standard.pdf\" target=\"_blank\">");_.b("\n" + i);_.b("          Marine Protected Areas Classification and Protection Standard</a>");_.b("\n" + i);_.b("        </p>");_.b("\n");};if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,2969,3159,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div>");_.b("\n" + i);_.b("        <div class=\"replicated_habs_pie\" id=\"replicated_habs_pie\"></div>");_.b("\n" + i);_.b("        <div class=\"replicated_habs_pie_legend\" id=\"replicated_habs_pie_legend\"></div>");_.b("\n" + i);_.b("      </div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("    <div class=\"reportSection\">");_.b("\n" + i);_.b("      <h4>Connectivity</h4>");_.b("\n" + i);if(_.s(_.f("singleSketch",c,p,1),c,p,0,3271,3440,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <p style=\"font-style:italic;color:gray;\" class=\"large\">");_.b("\n" + i);_.b("              No connectivity information for a collection with one sketch. ");_.b("\n" + i);_.b("            </p>");_.b("\n");});c.pop();}if(!_.s(_.f("singleSketch",c,p,1),c,p,1,0,0,"")){_.b("        <div>");_.b("\n" + i);_.b("          <div class=\"connectivity_pie\" id=\"connectivity_pie\"></div>");_.b("\n" + i);_.b("          <div class=\"connectivity_pie_legend\" id=\"connectivity_pie_legend\"></div>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("        <p class=\"large\">Of the <strong>");_.b(_.v(_.f("total_mpa_count",c,p,0)));_.b("</strong> MPAs in the network, <strong>");_.b(_.v(_.f("connected_mpa_count",c,p,0)));_.b("</strong>");if(_.s(_.f("plural_connected_mpa_count",c,p,1),c,p,0,3824,3828,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(" are");});c.pop();}if(!_.s(_.f("plural_connected_mpa_count",c,p,1),c,p,1,0,0,"")){_.b(" is");};_.b(" within the connectivity range of 50 - 100 km. ");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("        <span class=\"conn_values\">The minimum distance between the MPAs is <strong>");_.b(_.v(_.f("min_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("        <span class=\"conn_values\">The maximum distance between the MPAs is <strong>");_.b(_.v(_.f("max_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("        <span class=\"conn_values\">The average distance between the MPAs is <strong>");_.b(_.v(_.f("mean_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n");};_.b("    </div>");_.b("\n");});c.pop();}_.b("\n");});c.pop();}_.b("  <div class=\"reportSection size\">");_.b("\n" + i);_.b("    <h4>");if(_.s(_.f("isMPA",c,p,1),c,p,0,4466,4475,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("MPA Sizes");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,4499,4511,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Sketch Sizes");});c.pop();}_.b("</h4>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,4545,4872,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        Of the <strong>");_.b(_.v(_.f("total_mpa_count",c,p,0)));_.b("</strong> MPAs in the network, <strong>");_.b(_.v(_.f("mpa_count",c,p,0)));_.b("</strong> meet");if(!_.s(_.f("plural_mpa_count",c,p,1),c,p,1,0,0,"")){_.b("s");};_.b(" the minimum size dimension of 5km. The average minimum dimension is <strong>");_.b(_.v(_.f("mpa_avg_size_guideline",c,p,0)));_.b("</strong> the 10-20km guideline.");_.b("\n" + i);_.b("      </p>");_.b("\n");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,4901,4968,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p>The size of the sketches in this collection are:</p>");_.b("\n");});c.pop();}_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>");if(_.s(_.f("isMPA",c,p,1),c,p,0,5071,5079,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("MPA Name");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,5103,5114,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Sketch Name");});c.pop();}_.b("</th>");_.b("\n" + i);_.b("            <th>Area </br>(sq. km.)</th>");_.b("\n" + i);_.b("            <th style=\"width:100px;\">Width (km)</th>");_.b("\n" + i);_.b("            <th style=\"width:100px;\">Coastline Length (km)</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("prop_sizes",c,p,1),c,p,0,5366,5532,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("MIN_DIM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("COAST",c,p,0)));_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("    <p class=\"large\">");_.b("\n" + i);_.b("      This combined area within the network accounts for <strong>");_.b(_.v(_.f("percent",c,p,0)));_.b("%</strong> of the South-East Marine area, and <strong>");_.b(_.v(_.f("coastline_length_percent",c,p,0)));_.b("%</strong> of the South-East coastline.");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection size\">");_.b("\n" + i);_.b("    <h4>Size</h4>");_.b("\n" + i);_.b("    <p class=\"large\">");_.b("\n" + i);_.b("      This sketch area is <strong>");_.b(_.v(_.f("size",c,p,0)));_.b(" square kilometers</strong>, and it includes <strong>");_.b(_.v(_.f("percent",c,p,0)));_.b("%</strong> of the South-East Planning Region.");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("    <p class=\"large\">");_.b("\n" + i);_.b("      This sketch includes <strong>");_.b(_.v(_.f("coastline_length",c,p,0)));_.b(" meters</strong> of coastline.");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};_.b("\n" + i);_.b("<div class=\"reportSection size\">");_.b("\n" + i);_.b("  <h4>Number of Habitats</h4>");_.b("\n" + i);_.b("  <p class=\"large\">");_.b("\n" + i);_.b("    The ");if(_.s(_.f("isMPA",c,p,1),c,p,0,6319,6376,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(" Marine Protected Area");if(_.s(_.f("isCollection",c,p,1),c,p,0,6358,6359,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,6400,6442,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketch");if(_.s(_.f("isCollection",c,p,1),c,p,0,6423,6425,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("es");});c.pop();}});c.pop();}_.b(" include");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("s");};_.b(" <strong>");_.b(_.v(_.f("num_habs",c,p,0)));_.b("</strong> of the <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> habitats within the SEM region.");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["uses"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("hasCoastal",c,p,1),c,p,0,310,1045,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Existing Coastal Consents <a href=\"#\" data-toggle-node=\"53d719a49380174a7766dd85\" data-visible=\"false\">");_.b("\n" + i);_.b("      show layer</a></h4>");_.b("\n" + i);_.b("        <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,524,554,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites with Resource Consents.</p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:250px;\">Consent Type</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("coastal_consents",c,p,1),c,p,0,893,978,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("hasUses",c,p,1),c,p,0,1074,4145,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hasRecUses",c,p,1),c,p,0,1092,2356,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Recreational Uses </h4>");_.b("\n" + i);_.b("      <!--");_.b("\n" + i);if(_.s(_.f("hasSmaro",c,p,1),c,p,0,1200,1688,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("        <p><strong>Spectrum of MArine Recreational Opportunity (SMARO)</strong></p>");_.b("\n" + i);_.b("          <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,1339,1349,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" includes area(s) identified as having <strong> medium or high </strong> recreational opportunity.");_.b("\n" + i);_.b("          <em>You can find more information on SMARO in the \"data description\" by right clicking on the layer name.</em>");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("        </br></br>");_.b("\n");};});c.pop();}_.b("      -->");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:250px;\">Activity Type</th>");_.b("\n" + i);_.b("              <th>Number of Sites</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasRecUses",c,p,1),c,p,0,1959,2141,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("rec_uses",c,p,1),c,p,0,1987,2115,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("COUNT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasRecUses",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td colspan=2><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("hasHeritage",c,p,1),c,p,0,2391,3346,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Archeological Information ");_.b("\n" + i);_.b("          <a href=\"#\" data-toggle-node=\"5578f14cff39059a583646c9\" data-visible=\"false\">show layer</a>");_.b("\n" + i);_.b("        </h4>");_.b("\n" + i);_.b("            <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,2650,2680,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites identified as having significant heritage values.</p>");_.b("\n" + i);_.b("            <table data-paging=\"10\">");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th style=\"width:250px;\">Heritage Type</th>");_.b("\n" + i);_.b("                  <th>Number of Sites</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("              <tbody>");_.b("\n" + i);if(_.s(_.f("heritage",c,p,1),c,p,0,3113,3251,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <tr>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("COUNT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                </tr>");_.b("\n");});c.pop();}_.b("              </tbody>");_.b("\n" + i);_.b("            </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");};});c.pop();}if(_.s(_.f("hasInfrastructure",c,p,1),c,p,0,3387,4122,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Infrastructure</h4>");_.b("\n" + i);_.b("            <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,3523,3553,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites with existing infrastructure.</p>");_.b("\n" + i);_.b("            <table data-paging=\"10\">");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th style=\"width:250px;\">Type</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("              <tbody>");_.b("\n" + i);if(_.s(_.f("infrastructure",c,p,1),c,p,0,3920,4021,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <tr>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                </tr>");_.b("\n");});c.pop();}_.b("              </tbody>");_.b("\n" + i);_.b("            </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");};});c.pop();}});c.pop();}if(!_.s(_.f("hasUses",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Activities and Uses</h4>");_.b("\n" + i);_.b("        <p>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,4281,4291,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("  does <strong>not</strong> include any <strong>activities or uses</strong>.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};_.b("\n" + i);if(_.s(_.f("hasSeabirds",c,p,1),c,p,0,4468,5194,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Birds </h4>");_.b("\n" + i);if(_.s(_.f("hasSeabirdAreas",c,p,1),c,p,0,4556,4840,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <p class=\"large\"><strong>Important Seabird Areas</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("seabirds",c,p,1),c,p,0,4703,4783,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n");});c.pop();}_.b("    ");_.b("\n" + i);if(_.s(_.f("hasSeabirdColonies",c,p,1),c,p,0,4893,5163,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p class=\"large\"><strong>Seabird Colonies</strong></p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("seabird_colonies",c,p,1),c,p,0,5033,5105,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n");});c.pop();}_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("hasMarineSpecies",c,p,1),c,p,0,5232,5694,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Marine Mammals</h4>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>Species</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("mammals",c,p,1),c,p,0,5480,5560,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}if(_.s(_.f("seals",c,p,1),c,p,0,5595,5640,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(!_.s(_.f("hasMarineSpecies",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Species Information</h4>");_.b("\n" + i);_.b("        <p>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,5848,5882,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketches within the collection do ");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch does");};_.b(" <strong>not</strong> include any <strong>important marine mammal areas</strong>.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};return _.fl();;});

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = this["Templates"];
}
},{}]},{},[15])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9vdGFnby1yZXBvcnRzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvZW5hYmxlTGF5ZXJUb2dnbGVycy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvam9iSXRlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0UmVzdWx0cy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0VGFiLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvc2NyaXB0cy91dGlscy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9lbnZpcm9ubWVudC5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9maXNoaW5nLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9zY3JpcHRzL2lkcy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9vdmVydmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9yZXBvcnQuY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9vdGFnby1yZXBvcnRzL3NjcmlwdHMvdXNlcy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBLENBQU8sQ0FBVSxDQUFBLEdBQVgsQ0FBTixFQUFrQjtDQUNoQixLQUFBLDJFQUFBO0NBQUEsQ0FBQSxDQUFBO0NBQUEsQ0FDQSxDQUFBLEdBQVk7Q0FEWixDQUVBLENBQUEsR0FBTTtBQUNDLENBQVAsQ0FBQSxDQUFBLENBQUE7Q0FDRSxFQUFBLENBQUEsR0FBTyxxQkFBUDtDQUNBLFNBQUE7SUFMRjtDQUFBLENBTUEsQ0FBVyxDQUFBLElBQVgsYUFBVztDQUVYO0NBQUEsTUFBQSxvQ0FBQTt3QkFBQTtDQUNFLEVBQVcsQ0FBWCxHQUFXLENBQVg7Q0FBQSxFQUNTLENBQVQsRUFBQSxFQUFpQixLQUFSO0NBQ1Q7Q0FDRSxFQUFPLENBQVAsRUFBQSxVQUFPO0NBQVAsRUFD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Q0FkQSxDQWVTLElBQVQsQ0FBQTtDQWZBLENBZ0JjLElBQWQsTUFBQTtDQWhCQSxDQW1CVSxJQUFWLEVBQUE7Q0FuQkEsQ0FvQmtCLElBQWxCLFVBQUE7Q0FwQkEsQ0FxQmEsSUFBYixLQUFBO0NBckJBLENBc0JpQixJQUFqQixTQUFBO0NBdEJBLENBdUJvQixJQUFwQixZQUFBO0NBdkJBLENBeUJTLElBQVQsQ0FBQTtDQXpCQSxDQTBCWSxJQUFaLElBQUE7Q0ExQkEsQ0EyQlcsSUFBWCxHQUFBO0NBM0JBLENBNEJPLEdBQVAsQ0FBQTtDQTVCQSxDQTZCVSxJQUFWLEVBQUE7Q0E3QkEsQ0ErQjZCLElBQTdCLHFCQUFBO0NBL0JBLENBZ0NrQixJQUFsQixVQUFBO0NBckZGLEtBQUE7Q0FBQSxDQXVGb0MsQ0FBaEMsQ0FBSixFQUFVLENBQUEsQ0FBUztDQUNsQixHQUFBLE9BQUQsUUFBQTtDQXJHRixFQVVROztDQVZSOztDQUZvQjs7QUEyR3RCLENBekhBLEVBeUhpQixHQUFYLENBQU47Ozs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIixudWxsLCJtb2R1bGUuZXhwb3J0cyA9IChlbCkgLT5cbiAgJGVsID0gJCBlbFxuICBhcHAgPSB3aW5kb3cuYXBwXG4gIHRvYyA9IGFwcC5nZXRUb2MoKVxuICB1bmxlc3MgdG9jXG4gICAgY29uc29sZS5sb2cgJ05vIHRhYmxlIG9mIGNvbnRlbnRzIGZvdW5kJ1xuICAgIHJldHVyblxuICB0b2dnbGVycyA9ICRlbC5maW5kKCdhW2RhdGEtdG9nZ2xlLW5vZGVdJylcbiAgIyBTZXQgaW5pdGlhbCBzdGF0ZVxuICBmb3IgdG9nZ2xlciBpbiB0b2dnbGVycy50b0FycmF5KClcbiAgICAkdG9nZ2xlciA9ICQodG9nZ2xlcilcbiAgICBub2RlaWQgPSAkdG9nZ2xlci5kYXRhKCd0b2dnbGUtbm9kZScpXG4gICAgdHJ5XG4gICAgICB2aWV3ID0gdG9jLmdldENoaWxkVmlld0J5SWQgbm9kZWlkXG4gICAgICBub2RlID0gdmlldy5tb2RlbFxuICAgICAgJHRvZ2dsZXIuYXR0ciAnZGF0YS12aXNpYmxlJywgISFub2RlLmdldCgndmlzaWJsZScpXG4gICAgICAkdG9nZ2xlci5kYXRhICd0b2NJdGVtJywgdmlld1xuICAgIGNhdGNoIGVcbiAgICAgICR0b2dnbGVyLmF0dHIgJ2RhdGEtbm90LWZvdW5kJywgJ3RydWUnXG5cbiAgdG9nZ2xlcnMub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgJGVsID0gJChlLnRhcmdldClcbiAgICB2aWV3ID0gJGVsLmRhdGEoJ3RvY0l0ZW0nKVxuICAgIGlmIHZpZXdcbiAgICAgIHZpZXcudG9nZ2xlVmlzaWJpbGl0eShlKVxuICAgICAgJGVsLmF0dHIgJ2RhdGEtdmlzaWJsZScsICEhdmlldy5tb2RlbC5nZXQoJ3Zpc2libGUnKVxuICAgIGVsc2VcbiAgICAgIGFsZXJ0IFwiTGF5ZXIgbm90IGZvdW5kIGluIHRoZSBjdXJyZW50IFRhYmxlIG9mIENvbnRlbnRzLiBcXG5FeHBlY3RlZCBub2RlaWQgI3skZWwuZGF0YSgndG9nZ2xlLW5vZGUnKX1cIlxuIiwiY2xhc3MgSm9iSXRlbSBleHRlbmRzIEJhY2tib25lLlZpZXdcbiAgY2xhc3NOYW1lOiAncmVwb3J0UmVzdWx0J1xuICBldmVudHM6IHt9XG4gIGJpbmRpbmdzOlxuICAgIFwiaDYgYVwiOlxuICAgICAgb2JzZXJ2ZTogXCJzZXJ2aWNlTmFtZVwiXG4gICAgICB1cGRhdGVWaWV3OiB0cnVlXG4gICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICBuYW1lOiAnaHJlZidcbiAgICAgICAgb2JzZXJ2ZTogJ3NlcnZpY2VVcmwnXG4gICAgICB9XVxuICAgIFwiLnN0YXJ0ZWRBdFwiOlxuICAgICAgb2JzZXJ2ZTogW1wic3RhcnRlZEF0XCIsIFwic3RhdHVzXCJdXG4gICAgICB2aXNpYmxlOiAoKSAtPlxuICAgICAgICBAbW9kZWwuZ2V0KCdzdGF0dXMnKSBub3QgaW4gWydjb21wbGV0ZScsICdlcnJvciddXG4gICAgICB1cGRhdGVWaWV3OiB0cnVlXG4gICAgICBvbkdldDogKCkgLT5cbiAgICAgICAgaWYgQG1vZGVsLmdldCgnc3RhcnRlZEF0JylcbiAgICAgICAgICByZXR1cm4gXCJTdGFydGVkIFwiICsgbW9tZW50KEBtb2RlbC5nZXQoJ3N0YXJ0ZWRBdCcpKS5mcm9tTm93KCkgKyBcIi4gXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFwiXCJcbiAgICBcIi5zdGF0dXNcIjogICAgICBcbiAgICAgIG9ic2VydmU6IFwic3RhdHVzXCJcbiAgICAgIG9uR2V0OiAocykgLT5cbiAgICAgICAgc3dpdGNoIHNcbiAgICAgICAgICB3aGVuICdwZW5kaW5nJ1xuICAgICAgICAgICAgXCJ3YWl0aW5nIGluIGxpbmVcIlxuICAgICAgICAgIHdoZW4gJ3J1bm5pbmcnXG4gICAgICAgICAgICBcInJ1bm5pbmcgYW5hbHl0aWNhbCBzZXJ2aWNlXCJcbiAgICAgICAgICB3aGVuICdjb21wbGV0ZSdcbiAgICAgICAgICAgIFwiY29tcGxldGVkXCJcbiAgICAgICAgICB3aGVuICdlcnJvcidcbiAgICAgICAgICAgIFwiYW4gZXJyb3Igb2NjdXJyZWRcIlxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNcbiAgICBcIi5xdWV1ZUxlbmd0aFwiOiBcbiAgICAgIG9ic2VydmU6IFwicXVldWVMZW5ndGhcIlxuICAgICAgb25HZXQ6ICh2KSAtPlxuICAgICAgICBzID0gXCJXYWl0aW5nIGJlaGluZCAje3Z9IGpvYlwiXG4gICAgICAgIGlmIHYubGVuZ3RoID4gMVxuICAgICAgICAgIHMgKz0gJ3MnXG4gICAgICAgIHJldHVybiBzICsgXCIuIFwiXG4gICAgICB2aXNpYmxlOiAodikgLT5cbiAgICAgICAgdj8gYW5kIHBhcnNlSW50KHYpID4gMFxuICAgIFwiLmVycm9yc1wiOlxuICAgICAgb2JzZXJ2ZTogJ2Vycm9yJ1xuICAgICAgdXBkYXRlVmlldzogdHJ1ZVxuICAgICAgdmlzaWJsZTogKHYpIC0+XG4gICAgICAgIHY/Lmxlbmd0aCA+IDJcbiAgICAgIG9uR2V0OiAodikgLT5cbiAgICAgICAgaWYgdj9cbiAgICAgICAgICBKU09OLnN0cmluZ2lmeSh2LCBudWxsLCAnICAnKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQG1vZGVsKSAtPlxuICAgIHN1cGVyKClcblxuICByZW5kZXI6ICgpIC0+XG4gICAgQCRlbC5odG1sIFwiXCJcIlxuICAgICAgPGg2PjxhIGhyZWY9XCIjXCIgdGFyZ2V0PVwiX2JsYW5rXCI+PC9hPjxzcGFuIGNsYXNzPVwic3RhdHVzXCI+PC9zcGFuPjwvaDY+XG4gICAgICA8ZGl2PlxuICAgICAgICA8c3BhbiBjbGFzcz1cInN0YXJ0ZWRBdFwiPjwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJxdWV1ZUxlbmd0aFwiPjwvc3Bhbj5cbiAgICAgICAgPHByZSBjbGFzcz1cImVycm9yc1wiPjwvcHJlPlxuICAgICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gICAgQHN0aWNraXQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEpvYkl0ZW0iLCJjbGFzcyBSZXBvcnRSZXN1bHRzIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXG4gIGRlZmF1bHRQb2xsaW5nSW50ZXJ2YWw6IDMwMDBcblxuICBjb25zdHJ1Y3RvcjogKEBza2V0Y2gsIEBkZXBzKSAtPlxuICAgIEB1cmwgPSB1cmwgPSBcIi9yZXBvcnRzLyN7QHNrZXRjaC5pZH0vI3tAZGVwcy5qb2luKCcsJyl9XCJcbiAgICBzdXBlcigpXG5cbiAgcG9sbDogKCkgPT5cbiAgICBAZmV0Y2gge1xuICAgICAgc3VjY2VzczogKCkgPT5cbiAgICAgICAgQHRyaWdnZXIgJ2pvYnMnXG4gICAgICAgIGZvciByZXN1bHQgaW4gQG1vZGVsc1xuICAgICAgICAgIGlmIHJlc3VsdC5nZXQoJ3N0YXR1cycpIG5vdCBpbiBbJ2NvbXBsZXRlJywgJ2Vycm9yJ11cbiAgICAgICAgICAgIHVubGVzcyBAaW50ZXJ2YWxcbiAgICAgICAgICAgICAgQGludGVydmFsID0gc2V0SW50ZXJ2YWwgQHBvbGwsIEBkZWZhdWx0UG9sbGluZ0ludGVydmFsXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICBjb25zb2xlLmxvZyBAbW9kZWxzWzBdLmdldCgncGF5bG9hZFNpemVCeXRlcycpXG4gICAgICAgICAgcGF5bG9hZFNpemUgPSBNYXRoLnJvdW5kKCgoQG1vZGVsc1swXS5nZXQoJ3BheWxvYWRTaXplQnl0ZXMnKSBvciAwKSAvIDEwMjQpICogMTAwKSAvIDEwMFxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiRmVhdHVyZVNldCBzZW50IHRvIEdQIHdlaWdoZWQgaW4gYXQgI3twYXlsb2FkU2l6ZX1rYlwiXG4gICAgICAgICMgYWxsIGNvbXBsZXRlIHRoZW5cbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGludGVydmFsKSBpZiBAaW50ZXJ2YWxcbiAgICAgICAgaWYgcHJvYmxlbSA9IF8uZmluZChAbW9kZWxzLCAocikgLT4gci5nZXQoJ2Vycm9yJyk/KVxuICAgICAgICAgIEB0cmlnZ2VyICdlcnJvcicsIFwiUHJvYmxlbSB3aXRoICN7cHJvYmxlbS5nZXQoJ3NlcnZpY2VOYW1lJyl9IGpvYlwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAdHJpZ2dlciAnZmluaXNoZWQnXG4gICAgICBlcnJvcjogKGUsIHJlcywgYSwgYikgPT5cbiAgICAgICAgdW5sZXNzIHJlcy5zdGF0dXMgaXMgMFxuICAgICAgICAgIGlmIHJlcy5yZXNwb25zZVRleHQ/Lmxlbmd0aFxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgIGpzb24gPSBKU09OLnBhcnNlKHJlcy5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgICAjIGRvIG5vdGhpbmdcbiAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAaW50ZXJ2YWwpIGlmIEBpbnRlcnZhbFxuICAgICAgICAgIEB0cmlnZ2VyICdlcnJvcicsIGpzb24/LmVycm9yPy5tZXNzYWdlIG9yXG4gICAgICAgICAgICAnUHJvYmxlbSBjb250YWN0aW5nIHRoZSBTZWFTa2V0Y2ggc2VydmVyJ1xuICAgIH1cblxubW9kdWxlLmV4cG9ydHMgPSBSZXBvcnRSZXN1bHRzXG4iLCJlbmFibGVMYXllclRvZ2dsZXJzID0gcmVxdWlyZSAnLi9lbmFibGVMYXllclRvZ2dsZXJzLmNvZmZlZSdcbnJvdW5kID0gcmVxdWlyZSgnLi91dGlscy5jb2ZmZWUnKS5yb3VuZFxuUmVwb3J0UmVzdWx0cyA9IHJlcXVpcmUgJy4vcmVwb3J0UmVzdWx0cy5jb2ZmZWUnXG50ID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcycpXG50ZW1wbGF0ZXMgPVxuICByZXBvcnRMb2FkaW5nOiB0Wydub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvcmVwb3J0TG9hZGluZyddXG5Kb2JJdGVtID0gcmVxdWlyZSAnLi9qb2JJdGVtLmNvZmZlZSdcbkNvbGxlY3Rpb25WaWV3ID0gcmVxdWlyZSgndmlld3MvY29sbGVjdGlvblZpZXcnKVxuXG5jbGFzcyBSZWNvcmRTZXRcblxuICBjb25zdHJ1Y3RvcjogKEBkYXRhLCBAdGFiLCBAc2tldGNoQ2xhc3NJZCkgLT5cblxuICB0b0FycmF5OiAoKSAtPlxuICAgIGlmIEBza2V0Y2hDbGFzc0lkXG4gICAgICBkYXRhID0gXy5maW5kIEBkYXRhLnZhbHVlLCAodikgPT5cbiAgICAgICAgdi5mZWF0dXJlcz9bMF0/LmF0dHJpYnV0ZXM/WydTQ19JRCddIGlzIEBza2V0Y2hDbGFzc0lkXG4gICAgICB1bmxlc3MgZGF0YVxuICAgICAgICB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIGRhdGEgZm9yIHNrZXRjaENsYXNzICN7QHNrZXRjaENsYXNzSWR9XCJcbiAgICBlbHNlXG4gICAgICBpZiBfLmlzQXJyYXkgQGRhdGEudmFsdWVcbiAgICAgICAgZGF0YSA9IEBkYXRhLnZhbHVlWzBdXG4gICAgICBlbHNlXG4gICAgICAgIGRhdGEgPSBAZGF0YS52YWx1ZVxuICAgIF8ubWFwIGRhdGEuZmVhdHVyZXMsIChmZWF0dXJlKSAtPlxuICAgICAgZmVhdHVyZS5hdHRyaWJ1dGVzXG5cbiAgcmF3OiAoYXR0cikgLT5cbiAgICBhdHRycyA9IF8ubWFwIEB0b0FycmF5KCksIChyb3cpIC0+XG4gICAgICByb3dbYXR0cl1cbiAgICBhdHRycyA9IF8uZmlsdGVyIGF0dHJzLCAoYXR0cikgLT4gYXR0ciAhPSB1bmRlZmluZWRcbiAgICBpZiBhdHRycy5sZW5ndGggaXMgMFxuICAgICAgY29uc29sZS5sb2cgQGRhdGFcbiAgICAgIEB0YWIucmVwb3J0RXJyb3IgXCJDb3VsZCBub3QgZ2V0IGF0dHJpYnV0ZSAje2F0dHJ9IGZyb20gcmVzdWx0c1wiXG4gICAgICB0aHJvdyBcIkNvdWxkIG5vdCBnZXQgYXR0cmlidXRlICN7YXR0cn1cIlxuICAgIGVsc2UgaWYgYXR0cnMubGVuZ3RoIGlzIDFcbiAgICAgIHJldHVybiBhdHRyc1swXVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBhdHRyc1xuXG4gIGludDogKGF0dHIpIC0+XG4gICAgcmF3ID0gQHJhdyhhdHRyKVxuICAgIGlmIF8uaXNBcnJheShyYXcpXG4gICAgICBfLm1hcCByYXcsIHBhcnNlSW50XG4gICAgZWxzZVxuICAgICAgcGFyc2VJbnQocmF3KVxuXG4gIGZsb2F0OiAoYXR0ciwgZGVjaW1hbFBsYWNlcz0yKSAtPlxuICAgIHJhdyA9IEByYXcoYXR0cilcbiAgICBpZiBfLmlzQXJyYXkocmF3KVxuICAgICAgXy5tYXAgcmF3LCAodmFsKSAtPiByb3VuZCh2YWwsIGRlY2ltYWxQbGFjZXMpXG4gICAgZWxzZVxuICAgICAgcm91bmQocmF3LCBkZWNpbWFsUGxhY2VzKVxuXG4gIGJvb2w6IChhdHRyKSAtPlxuICAgIHJhdyA9IEByYXcoYXR0cilcbiAgICBpZiBfLmlzQXJyYXkocmF3KVxuICAgICAgXy5tYXAgcmF3LCAodmFsKSAtPiB2YWwudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpIGlzICd0cnVlJ1xuICAgIGVsc2VcbiAgICAgIHJhdy50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgaXMgJ3RydWUnXG5cbmNsYXNzIFJlcG9ydFRhYiBleHRlbmRzIEJhY2tib25lLlZpZXdcbiAgbmFtZTogJ0luZm9ybWF0aW9uJ1xuICBkZXBlbmRlbmNpZXM6IFtdXG5cbiAgaW5pdGlhbGl6ZTogKEBtb2RlbCwgQG9wdGlvbnMpIC0+XG4gICAgIyBXaWxsIGJlIGluaXRpYWxpemVkIGJ5IFNlYVNrZXRjaCB3aXRoIHRoZSBmb2xsb3dpbmcgYXJndW1lbnRzOlxuICAgICMgICAqIG1vZGVsIC0gVGhlIHNrZXRjaCBiZWluZyByZXBvcnRlZCBvblxuICAgICMgICAqIG9wdGlvbnNcbiAgICAjICAgICAtIC5wYXJlbnQgLSB0aGUgcGFyZW50IHJlcG9ydCB2aWV3XG4gICAgIyAgICAgICAgY2FsbCBAb3B0aW9ucy5wYXJlbnQuZGVzdHJveSgpIHRvIGNsb3NlIHRoZSB3aG9sZSByZXBvcnQgd2luZG93XG4gICAgQGFwcCA9IHdpbmRvdy5hcHBcbiAgICBfLmV4dGVuZCBALCBAb3B0aW9uc1xuICAgIEByZXBvcnRSZXN1bHRzID0gbmV3IFJlcG9ydFJlc3VsdHMoQG1vZGVsLCBAZGVwZW5kZW5jaWVzKVxuICAgIEBsaXN0ZW5Ub09uY2UgQHJlcG9ydFJlc3VsdHMsICdlcnJvcicsIEByZXBvcnRFcnJvclxuICAgIEBsaXN0ZW5Ub09uY2UgQHJlcG9ydFJlc3VsdHMsICdqb2JzJywgQHJlbmRlckpvYkRldGFpbHNcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAnam9icycsIEByZXBvcnRKb2JzXG4gICAgQGxpc3RlblRvIEByZXBvcnRSZXN1bHRzLCAnZmluaXNoZWQnLCBfLmJpbmQgQHJlbmRlciwgQFxuICAgIEBsaXN0ZW5Ub09uY2UgQHJlcG9ydFJlc3VsdHMsICdyZXF1ZXN0JywgQHJlcG9ydFJlcXVlc3RlZFxuXG4gIHJlbmRlcjogKCkgLT5cbiAgICB0aHJvdyAncmVuZGVyIG1ldGhvZCBtdXN0IGJlIG92ZXJpZGRlbidcblxuICBzaG93OiAoKSAtPlxuICAgIEAkZWwuc2hvdygpXG4gICAgQHZpc2libGUgPSB0cnVlXG4gICAgaWYgQGRlcGVuZGVuY2llcz8ubGVuZ3RoIGFuZCAhQHJlcG9ydFJlc3VsdHMubW9kZWxzLmxlbmd0aFxuICAgICAgQHJlcG9ydFJlc3VsdHMucG9sbCgpXG4gICAgZWxzZSBpZiAhQGRlcGVuZGVuY2llcz8ubGVuZ3RoXG4gICAgICBAcmVuZGVyKClcbiAgICAgIEAkKCdbZGF0YS1hdHRyaWJ1dGUtdHlwZT1VcmxGaWVsZF0gLnZhbHVlLCBbZGF0YS1hdHRyaWJ1dGUtdHlwZT1VcGxvYWRGaWVsZF0gLnZhbHVlJykuZWFjaCAoKSAtPlxuICAgICAgICB0ZXh0ID0gJChAKS50ZXh0KClcbiAgICAgICAgaHRtbCA9IFtdXG4gICAgICAgIGZvciB1cmwgaW4gdGV4dC5zcGxpdCgnLCcpXG4gICAgICAgICAgaWYgdXJsLmxlbmd0aFxuICAgICAgICAgICAgbmFtZSA9IF8ubGFzdCh1cmwuc3BsaXQoJy8nKSlcbiAgICAgICAgICAgIGh0bWwucHVzaCBcIlwiXCI8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+I3tuYW1lfTwvYT5cIlwiXCJcbiAgICAgICAgJChAKS5odG1sIGh0bWwuam9pbignLCAnKVxuXG5cbiAgaGlkZTogKCkgLT5cbiAgICBAJGVsLmhpZGUoKVxuICAgIEB2aXNpYmxlID0gZmFsc2VcblxuICByZW1vdmU6ICgpID0+XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwgQGV0YUludGVydmFsXG4gICAgQHN0b3BMaXN0ZW5pbmcoKVxuICAgIHN1cGVyKClcblxuICByZXBvcnRSZXF1ZXN0ZWQ6ICgpID0+XG4gICAgQCRlbC5odG1sIHRlbXBsYXRlcy5yZXBvcnRMb2FkaW5nLnJlbmRlcih7fSlcblxuICByZXBvcnRFcnJvcjogKG1zZywgY2FuY2VsbGVkUmVxdWVzdCkgPT5cbiAgICB1bmxlc3MgY2FuY2VsbGVkUmVxdWVzdFxuICAgICAgaWYgbXNnIGlzICdKT0JfRVJST1InXG4gICAgICAgIEBzaG93RXJyb3IgJ0Vycm9yIHdpdGggc3BlY2lmaWMgam9iJ1xuICAgICAgZWxzZVxuICAgICAgICBAc2hvd0Vycm9yIG1zZ1xuXG4gIHNob3dFcnJvcjogKG1zZykgPT5cbiAgICBAJCgnLnByb2dyZXNzJykucmVtb3ZlKClcbiAgICBAJCgncC5lcnJvcicpLnJlbW92ZSgpXG4gICAgQCQoJ2g0JykudGV4dChcIkFuIEVycm9yIE9jY3VycmVkXCIpLmFmdGVyIFwiXCJcIlxuICAgICAgPHAgY2xhc3M9XCJlcnJvclwiIHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+I3ttc2d9PC9wPlxuICAgIFwiXCJcIlxuXG4gIHJlcG9ydEpvYnM6ICgpID0+XG4gICAgdW5sZXNzIEBtYXhFdGFcbiAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLndpZHRoKCcxMDAlJylcbiAgICBAJCgnaDQnKS50ZXh0IFwiQW5hbHl6aW5nIERlc2lnbnNcIlxuXG4gIHN0YXJ0RXRhQ291bnRkb3duOiAoKSA9PlxuICAgIGlmIEBtYXhFdGFcbiAgICAgIF8uZGVsYXkgKCkgPT5cbiAgICAgICAgQHJlcG9ydFJlc3VsdHMucG9sbCgpXG4gICAgICAsIChAbWF4RXRhICsgMSkgKiAxMDAwXG4gICAgICBfLmRlbGF5ICgpID0+XG4gICAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLmNzcyAndHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb24nLCAnbGluZWFyJ1xuICAgICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS5jc3MgJ3RyYW5zaXRpb24tZHVyYXRpb24nLCBcIiN7QG1heEV0YSArIDF9c1wiXG4gICAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLndpZHRoKCcxMDAlJylcbiAgICAgICwgNTAwXG5cbiAgcmVuZGVySm9iRGV0YWlsczogKCkgPT5cbiAgICBtYXhFdGEgPSBudWxsXG4gICAgZm9yIGpvYiBpbiBAcmVwb3J0UmVzdWx0cy5tb2RlbHNcbiAgICAgIGlmIGpvYi5nZXQoJ2V0YVNlY29uZHMnKVxuICAgICAgICBpZiAhbWF4RXRhIG9yIGpvYi5nZXQoJ2V0YVNlY29uZHMnKSA+IG1heEV0YVxuICAgICAgICAgIG1heEV0YSA9IGpvYi5nZXQoJ2V0YVNlY29uZHMnKVxuICAgIGlmIG1heEV0YVxuICAgICAgQG1heEV0YSA9IG1heEV0YVxuICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykud2lkdGgoJzUlJylcbiAgICAgIEBzdGFydEV0YUNvdW50ZG93bigpXG5cbiAgICBAJCgnW3JlbD1kZXRhaWxzXScpLmNzcygnZGlzcGxheScsICdibG9jaycpXG4gICAgQCQoJ1tyZWw9ZGV0YWlsc10nKS5jbGljayAoZSkgPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgQCQoJ1tyZWw9ZGV0YWlsc10nKS5oaWRlKClcbiAgICAgIEAkKCcuZGV0YWlscycpLnNob3coKVxuICAgIGZvciBqb2IgaW4gQHJlcG9ydFJlc3VsdHMubW9kZWxzXG4gICAgICBpdGVtID0gbmV3IEpvYkl0ZW0oam9iKVxuICAgICAgaXRlbS5yZW5kZXIoKVxuICAgICAgQCQoJy5kZXRhaWxzJykuYXBwZW5kIGl0ZW0uZWxcblxuICBnZXRSZXN1bHQ6IChpZCkgLT5cbiAgICByZXN1bHRzID0gQGdldFJlc3VsdHMoKVxuICAgIHJlc3VsdCA9IF8uZmluZCByZXN1bHRzLCAocikgLT4gci5wYXJhbU5hbWUgaXMgaWRcbiAgICB1bmxlc3MgcmVzdWx0P1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyByZXN1bHQgd2l0aCBpZCAnICsgaWQpXG4gICAgcmVzdWx0LnZhbHVlXG5cbiAgZ2V0Rmlyc3RSZXN1bHQ6IChwYXJhbSwgaWQpIC0+XG4gICAgcmVzdWx0ID0gQGdldFJlc3VsdChwYXJhbSlcbiAgICB0cnlcbiAgICAgIHJldHVybiByZXN1bHRbMF0uZmVhdHVyZXNbMF0uYXR0cmlidXRlc1tpZF1cbiAgICBjYXRjaCBlXG4gICAgICB0aHJvdyBcIkVycm9yIGZpbmRpbmcgI3twYXJhbX06I3tpZH0gaW4gZ3AgcmVzdWx0c1wiXG5cbiAgZ2V0UmVzdWx0czogKCkgLT5cbiAgICByZXN1bHRzID0gQHJlcG9ydFJlc3VsdHMubWFwKChyZXN1bHQpIC0+IHJlc3VsdC5nZXQoJ3Jlc3VsdCcpLnJlc3VsdHMpXG4gICAgdW5sZXNzIHJlc3VsdHM/Lmxlbmd0aFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBncCByZXN1bHRzJylcbiAgICBfLmZpbHRlciByZXN1bHRzLCAocmVzdWx0KSAtPlxuICAgICAgcmVzdWx0LnBhcmFtTmFtZSBub3QgaW4gWydSZXN1bHRDb2RlJywgJ1Jlc3VsdE1zZyddXG5cbiAgcmVjb3JkU2V0OiAoZGVwZW5kZW5jeSwgcGFyYW1OYW1lLCBza2V0Y2hDbGFzc0lkPWZhbHNlKSAtPlxuICAgIHVubGVzcyBkZXBlbmRlbmN5IGluIEBkZXBlbmRlbmNpZXNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlVua25vd24gZGVwZW5kZW5jeSAje2RlcGVuZGVuY3l9XCJcbiAgICBkZXAgPSBAcmVwb3J0UmVzdWx0cy5maW5kIChyKSAtPiByLmdldCgnc2VydmljZU5hbWUnKSBpcyBkZXBlbmRlbmN5XG4gICAgdW5sZXNzIGRlcFxuICAgICAgY29uc29sZS5sb2cgQHJlcG9ydFJlc3VsdHMubW9kZWxzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDb3VsZCBub3QgZmluZCByZXN1bHRzIGZvciAje2RlcGVuZGVuY3l9LlwiXG4gICAgcGFyYW0gPSBfLmZpbmQgZGVwLmdldCgncmVzdWx0JykucmVzdWx0cywgKHBhcmFtKSAtPlxuICAgICAgcGFyYW0ucGFyYW1OYW1lIGlzIHBhcmFtTmFtZVxuICAgIHVubGVzcyBwYXJhbVxuICAgICAgY29uc29sZS5sb2cgZGVwLmdldCgnZGF0YScpLnJlc3VsdHNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIkNvdWxkIG5vdCBmaW5kIHBhcmFtICN7cGFyYW1OYW1lfSBpbiAje2RlcGVuZGVuY3l9XCJcbiAgICBuZXcgUmVjb3JkU2V0KHBhcmFtLCBALCBza2V0Y2hDbGFzc0lkKVxuXG4gIGVuYWJsZVRhYmxlUGFnaW5nOiAoKSAtPlxuICAgIEAkKCdbZGF0YS1wYWdpbmddJykuZWFjaCAoKSAtPlxuICAgICAgJHRhYmxlID0gJChAKVxuICAgICAgcGFnZVNpemUgPSAkdGFibGUuZGF0YSgncGFnaW5nJylcbiAgICAgIHJvd3MgPSAkdGFibGUuZmluZCgndGJvZHkgdHInKS5sZW5ndGhcbiAgICAgIHBhZ2VzID0gTWF0aC5jZWlsKHJvd3MgLyBwYWdlU2l6ZSlcbiAgICAgIGlmIHBhZ2VzID4gMVxuICAgICAgICAkdGFibGUuYXBwZW5kIFwiXCJcIlxuICAgICAgICAgIDx0Zm9vdD5cbiAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgPHRkIGNvbHNwYW49XCIjeyR0YWJsZS5maW5kKCd0aGVhZCB0aCcpLmxlbmd0aH1cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGFnaW5hdGlvblwiPlxuICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj5QcmV2PC9hPjwvbGk+XG4gICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICA8L3Rmb290PlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgdWwgPSAkdGFibGUuZmluZCgndGZvb3QgdWwnKVxuICAgICAgICBmb3IgaSBpbiBfLnJhbmdlKDEsIHBhZ2VzICsgMSlcbiAgICAgICAgICB1bC5hcHBlbmQgXCJcIlwiXG4gICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj4je2l9PC9hPjwvbGk+XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHVsLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj5OZXh0PC9hPjwvbGk+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICAkdGFibGUuZmluZCgnbGkgYScpLmNsaWNrIChlKSAtPlxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICRhID0gJCh0aGlzKVxuICAgICAgICAgIHRleHQgPSAkYS50ZXh0KClcbiAgICAgICAgICBpZiB0ZXh0IGlzICdOZXh0J1xuICAgICAgICAgICAgYSA9ICRhLnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJy5hY3RpdmUnKS5uZXh0KCkuZmluZCgnYScpXG4gICAgICAgICAgICB1bmxlc3MgYS50ZXh0KCkgaXMgJ05leHQnXG4gICAgICAgICAgICAgIGEuY2xpY2soKVxuICAgICAgICAgIGVsc2UgaWYgdGV4dCBpcyAnUHJldidcbiAgICAgICAgICAgIGEgPSAkYS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuYWN0aXZlJykucHJldigpLmZpbmQoJ2EnKVxuICAgICAgICAgICAgdW5sZXNzIGEudGV4dCgpIGlzICdQcmV2J1xuICAgICAgICAgICAgICBhLmNsaWNrKClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAkYS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgICRhLnBhcmVudCgpLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICBuID0gcGFyc2VJbnQodGV4dClcbiAgICAgICAgICAgICR0YWJsZS5maW5kKCd0Ym9keSB0cicpLmhpZGUoKVxuICAgICAgICAgICAgb2Zmc2V0ID0gcGFnZVNpemUgKiAobiAtIDEpXG4gICAgICAgICAgICAkdGFibGUuZmluZChcInRib2R5IHRyXCIpLnNsaWNlKG9mZnNldCwgbipwYWdlU2l6ZSkuc2hvdygpXG4gICAgICAgICQoJHRhYmxlLmZpbmQoJ2xpIGEnKVsxXSkuY2xpY2soKVxuXG4gICAgICBpZiBub1Jvd3NNZXNzYWdlID0gJHRhYmxlLmRhdGEoJ25vLXJvd3MnKVxuICAgICAgICBpZiByb3dzIGlzIDBcbiAgICAgICAgICBwYXJlbnQgPSAkdGFibGUucGFyZW50KClcbiAgICAgICAgICAkdGFibGUucmVtb3ZlKClcbiAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2xhc3MgJ3RhYmxlQ29udGFpbmVyJ1xuICAgICAgICAgIHBhcmVudC5hcHBlbmQgXCI8cD4je25vUm93c01lc3NhZ2V9PC9wPlwiXG5cbiAgZW5hYmxlTGF5ZXJUb2dnbGVyczogKCkgLT5cbiAgICBlbmFibGVMYXllclRvZ2dsZXJzKEAkZWwpXG5cbiAgZ2V0Q2hpbGRyZW46IChza2V0Y2hDbGFzc0lkKSAtPlxuICAgIF8uZmlsdGVyIEBjaGlsZHJlbiwgKGNoaWxkKSAtPiBjaGlsZC5nZXRTa2V0Y2hDbGFzcygpLmlkIGlzIHNrZXRjaENsYXNzSWRcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlcG9ydFRhYlxuIiwibW9kdWxlLmV4cG9ydHMgPVxuICBcbiAgcm91bmQ6IChudW1iZXIsIGRlY2ltYWxQbGFjZXMpIC0+XG4gICAgdW5sZXNzIF8uaXNOdW1iZXIgbnVtYmVyXG4gICAgICBudW1iZXIgPSBwYXJzZUZsb2F0KG51bWJlcilcbiAgICBtdWx0aXBsaWVyID0gTWF0aC5wb3cgMTAsIGRlY2ltYWxQbGFjZXNcbiAgICBNYXRoLnJvdW5kKG51bWJlciAqIG11bHRpcGxpZXIpIC8gbXVsdGlwbGllciIsInRoaXNbXCJUZW1wbGF0ZXNcIl0gPSB0aGlzW1wiVGVtcGxhdGVzXCJdIHx8IHt9O1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9hdHRyaWJ1dGVzL2F0dHJpYnV0ZUl0ZW1cIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPHRyIGRhdGEtYXR0cmlidXRlLWlkPVxcXCJcIik7Xy5iKF8udihfLmYoXCJpZFwiLGMscCwwKSkpO18uYihcIlxcXCIgZGF0YS1hdHRyaWJ1dGUtZXhwb3J0aWQ9XFxcIlwiKTtfLmIoXy52KF8uZihcImV4cG9ydGlkXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiBkYXRhLWF0dHJpYnV0ZS10eXBlPVxcXCJcIik7Xy5iKF8udihfLmYoXCJ0eXBlXCIsYyxwLDApKSk7Xy5iKFwiXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDx0ZCBjbGFzcz1cXFwibmFtZVxcXCI+XCIpO18uYihfLnYoXy5mKFwibmFtZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8dGQgY2xhc3M9XFxcInZhbHVlXFxcIj5cIik7Xy5iKF8udihfLmYoXCJmb3JtYXR0ZWRWYWx1ZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC90cj5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9hdHRyaWJ1dGVzL2F0dHJpYnV0ZXNUYWJsZVwiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8dGFibGUgY2xhc3M9XFxcImF0dHJpYnV0ZXNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJhdHRyaWJ1dGVzXCIsYyxwLDEpLGMscCwwLDQ0LDgxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXy5ycChcImF0dHJpYnV0ZXMvYXR0cmlidXRlSXRlbVwiLGMscCxcIiAgICBcIikpO30pO2MucG9wKCk7fV8uYihcIjwvdGFibGU+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvZ2VuZXJpY0F0dHJpYnV0ZXNcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7aWYoXy5zKF8uZChcInNrZXRjaENsYXNzLmRlbGV0ZWRcIixjLHAsMSksYyxwLDAsMjQsMjcwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJhbGVydCBhbGVydC13YXJuXFxcIiBzdHlsZT1cXFwibWFyZ2luLWJvdHRvbToxMHB4O1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBUaGlzIHNrZXRjaCB3YXMgY3JlYXRlZCB1c2luZyB0aGUgXFxcIlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCJcXFwiIHRlbXBsYXRlLCB3aGljaCBpc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgbm8gbG9uZ2VyIGF2YWlsYWJsZS4gWW91IHdpbGwgbm90IGJlIGFibGUgdG8gY29weSB0aGlzIHNrZXRjaCBvciBtYWtlIG5ld1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgc2tldGNoZXMgb2YgdGhpcyB0eXBlLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+XCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIiBBdHRyaWJ1dGVzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXy5ycChcImF0dHJpYnV0ZXMvYXR0cmlidXRlc1RhYmxlXCIsYyxwLFwiICAgIFwiKSk7Xy5iKFwiICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wibm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3JlcG9ydExvYWRpbmdcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0TG9hZGluZ1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8IS0tIDxkaXYgY2xhc3M9XFxcInNwaW5uZXJcXFwiPjM8L2Rpdj4gLS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+UmVxdWVzdGluZyBSZXBvcnQgZnJvbSBTZXJ2ZXI8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGRpdiBjbGFzcz1cXFwicHJvZ3Jlc3MgcHJvZ3Jlc3Mtc3RyaXBlZCBhY3RpdmVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJiYXJcXFwiIHN0eWxlPVxcXCJ3aWR0aDogMTAwJTtcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8YSBocmVmPVxcXCIjXFxcIiByZWw9XFxcImRldGFpbHNcXFwiPmRldGFpbHM8L2E+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcImRldGFpbHNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xuXG5pZih0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gdGhpc1tcIlRlbXBsYXRlc1wiXTtcbn0iLCJSZXBvcnRUYWIgPSByZXF1aXJlICdyZXBvcnRUYWInXG50ZW1wbGF0ZXMgPSByZXF1aXJlICcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5fcGFydGlhbHMgPSByZXF1aXJlICcuLi9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxucGFydGlhbHMgPSBbXVxuZm9yIGtleSwgdmFsIG9mIF9wYXJ0aWFsc1xuICBwYXJ0aWFsc1trZXkucmVwbGFjZSgnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpLycsICcnKV0gPSB2YWxcblxuaWRzID0gcmVxdWlyZSAnLi9pZHMuY29mZmVlJ1xuZm9yIGtleSwgdmFsdWUgb2YgaWRzXG4gIHdpbmRvd1trZXldID0gdmFsdWVcblxuXG5jbGFzcyBFbnZpcm9ubWVudFRhYiBleHRlbmRzIFJlcG9ydFRhYlxuICAjIHRoaXMgaXMgdGhlIG5hbWUgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgVGFiXG4gIG5hbWU6ICdIYWJpdGF0cydcbiAgY2xhc3NOYW1lOiAnZW52aXJvbm1lbnQnXG4gIHRpbWVvdXQ6IDEyMDAwMFxuICB0ZW1wbGF0ZTogdGVtcGxhdGVzLmVudmlyb25tZW50XG4gIGRlcGVuZGVuY2llczogW1xuICAgICdIYWJpdGF0c0Vudmlyb25tZW50J1xuICAgICdIYWJpdGF0c092ZXJ2aWV3J1xuICAgICdBZGphY2VudFRlcnJlc3RyaWFsJ1xuICAgICdIYWJSZXBzVG9vbGJveCdcbiAgXVxuXG4gIHJlbmRlcjogKCkgLT5cblxuICAgICNzaG93IHRhYmxlcyBpbnN0ZWFkIG9mIGdyYXBoIGZvciBJRVxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgZDNJc1ByZXNlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgZDNJc1ByZXNlbnQgPSBmYWxzZVxuICAgIGlzQ29sbGVjdGlvbiA9IEBtb2RlbC5pc0NvbGxlY3Rpb24oKVxuICAgIHNjaWQgPSBAc2tldGNoQ2xhc3MuaWRcbiAgICBpZiBzY2lkID09IEdFTkVSSUNfSUQgb3Igc2NpZCA9PSBHRU5FUklDX0NPTExFQ1RJT05fSURcbiAgICAgIGlzR2VuZXJpYyA9IHRydWVcbiAgICBlbHNlXG4gICAgICBpc0dlbmVyaWMgPSBmYWxzZVxuICAgIGhhYl9zaXplcyA9IEByZWNvcmRTZXQoJ0hhYlJlcHNUb29sYm94JywgJ0hhYlNpemVzJykudG9BcnJheSgpXG4gICAgJycnXG4gICAgaGFiaXRhdHMgPSBAcmVjb3JkU2V0KCdIYWJpdGF0c0Vudmlyb25tZW50JywgJ0hhYml0YXRTaXplJykudG9BcnJheSgpXG4gICAgaGFic19pbl9za2V0Y2ggPSBoYWJpdGF0cz8ubGVuZ3RoXG4gICAgaGFic19wbHVyYWwgPSBoYWJzX2luX3NrZXRjaCAhPSAxXG4gICAgJycnXG4gICAgaGFic19pbl9za2V0Y2ggPSBoYWJfc2l6ZXM/Lmxlbmd0aFxuICAgIGhhYnNfcGx1cmFsID0gaGFic19pbl9za2V0Y2ggIT0gMVxuXG4gICAgI2V2ZW5uZXNzID0gQHJlY29yZFNldCgnSGFiaXRhdHNPdmVydmlldycsICdIYWJpdGF0RXZlbm5lc3MnKS5mbG9hdCgnRVZFTk5FU1MnKVxuICAgICN0b3RhbF9oYWJzID0gQHJlY29yZFNldCgnSGFiaXRhdHNPdmVydmlldycsICdIYWJpdGF0U2l6ZScpLmZsb2F0KCdUT1RfSEFCUycpXG4gICAgXG4gICAgcHVibGljX2xhbmQgPSBAcmVjb3JkU2V0KCdBZGphY2VudFRlcnJlc3RyaWFsJywgJ1B1YmxpY0NvbnNlcnZhdGlvbkxhbmQnKS50b0FycmF5KClcbiAgICBoYXNQdWJsaWMgPSBwdWJsaWNfbGFuZD8ubGVuZ3RoID4gMFxuICAgIGNvYXN0YWxfbGFuZCA9IEByZWNvcmRTZXQoJ0FkamFjZW50VGVycmVzdHJpYWwnLCAnQ29hc3RhbFByb3RlY3Rpb24nKS50b0FycmF5KClcbiAgICBoYXNDb2FzdGFsID0gY29hc3RhbF9sYW5kPy5sZW5ndGggPiAwXG4gICAgYWRqYWNlbnRfbGFuZCA9IEByZWNvcmRTZXQoJ0FkamFjZW50VGVycmVzdHJpYWwnLCAnQWRqYWNlbnRMYW5kQ292ZXInKS50b0FycmF5KClcbiAgICBoYXNBZGphY2VudCA9IGFkamFjZW50X2xhbmQ/Lmxlbmd0aCA+IDBcbiAgICBcbiAgICBoYWJpdGF0c19yZXByZXNlbnRlZCA9IEByZWNvcmRTZXQoJ0hhYlJlcHNUb29sYm94JywgJ1JlcHJlc2VudGVkSGFicycpLnRvQXJyYXkoKVxuICAgIGF0dHJpYnV0ZXMgPSBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgXG4gICAgY29udGV4dCA9XG4gICAgICBza2V0Y2g6IEBtb2RlbC5mb3JUZW1wbGF0ZSgpXG4gICAgICBza2V0Y2hDbGFzczogQHNrZXRjaENsYXNzLmZvclRlbXBsYXRlKClcbiAgICAgIGF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICAgIGFueUF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKCkubGVuZ3RoID4gMFxuICAgICAgYWRtaW46IEBwcm9qZWN0LmlzQWRtaW4gd2luZG93LnVzZXJcbiAgICAgIGQzSXNQcmVzZW50OiBkM0lzUHJlc2VudFxuICAgICAgaXNHZW5lcmljOiBpc0dlbmVyaWNcbiAgICAgIGlzQ29sbGVjdGlvbjogaXNDb2xsZWN0aW9uXG5cbiAgICAgIGhhYl9zaXplczogaGFiX3NpemVzXG4gICAgICBoYWJzX2luX3NrZXRjaDogaGFic19pbl9za2V0Y2hcbiAgICAgIGhhYnNfcGx1cmFsOiBoYWJzX3BsdXJhbFxuICAgICAgXG4gICAgICBoYWJpdGF0c19yZXByZXNlbnRlZDogaGFiaXRhdHNfcmVwcmVzZW50ZWRcbiAgICAgIHB1YmxpY19sYW5kOiBwdWJsaWNfbGFuZFxuICAgICAgaGFzUHVibGljTGFuZDogaGFzUHVibGljXG4gICAgICBjb2FzdGFsX2xhbmQ6IGNvYXN0YWxfbGFuZFxuICAgICAgaGFzQ29hc3RhbExhbmQ6IGhhc0NvYXN0YWxcbiAgICAgIGFkamFjZW50X2xhbmQ6IGFkamFjZW50X2xhbmRcbiAgICAgIGhhc0FkamFjZW50TGFuZDogaGFzQWRqYWNlbnRcbiAgICAgIFxuXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgcGFydGlhbHMpXG4gICAgQGVuYWJsZUxheWVyVG9nZ2xlcnMoKVxuICAgIEByb3VuZERhdGEoaGFiX3NpemVzKVxuICAgIEBzZXR1cEhhYml0YXRTb3J0aW5nKGhhYl9zaXplcylcblxuICAgIEBlbmFibGVUYWJsZVBhZ2luZygpXG4gICAgXG4gIHJvdW5kRGF0YTogKGhhYml0YXRzKSA9PiAgXG4gICAgZm9yIGhhYiBpbiBoYWJpdGF0c1xuICAgICAgaGFiLlNJWkVfU1FLTSA9IE51bWJlcihoYWIuU0laRV9TUUtNKS50b0ZpeGVkKDEpXG4gICAgICBoYWIuUEVSQyA9IE51bWJlcihoYWIuUEVSQykudG9GaXhlZCgxKVxuXG4gIHNldHVwSGFiaXRhdFNvcnRpbmc6IChoYWJpdGF0cykgPT5cbiAgICB0Ym9keU5hbWUgPSAnLmhhYl92YWx1ZXMnXG4gICAgdGFibGVOYW1lID0gJy5oYWJfdGFibGUnXG4gICAgQCQoJy5oYWJfdHlwZScpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdoYWJfdHlwZScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIkhBQl9UWVBFXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRIYWJpdGF0Um93U3RyaW5nKVxuICAgIEAkKCcuaGFiX25ld19hcmVhJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2hhYl9uZXdfYXJlYScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlNJWkVfU1FLTVwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nKVxuICAgIEAkKCcuaGFiX25ld19wZXJjJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2hhYl9uZXdfcGVyYycsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiUEVSQ1wiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nKVxuICAgIEByZW5kZXJTb3J0KCdoYWJfdHlwZScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIHVuZGVmaW5lZCwgXCJIQUJfVFlQRVwiLCB0Ym9keU5hbWUsIGZhbHNlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZylcblxuICAjZG8gdGhlIHNvcnRpbmcgLSBzaG91bGQgYmUgdGFibGUgaW5kZXBlbmRlbnRcbiAgI3NraXAgYW55IHRoYXQgYXJlIGxlc3MgdGhhbiAwLjAwXG4gIHJlbmRlclNvcnQ6IChuYW1lLCB0YWJsZU5hbWUsIHBkYXRhLCBldmVudCwgc29ydEJ5LCB0Ym9keU5hbWUsIGlzRmxvYXQsIGdldFJvd1N0cmluZ1ZhbHVlKSA9PlxuICAgIGlmIGV2ZW50XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cblxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgdGFyZ2V0Q29sdW1uID0gQGdldFNlbGVjdGVkQ29sdW1uKGV2ZW50LCBuYW1lKVxuICAgICAgc29ydFVwID0gQGdldFNvcnREaXIodGFyZ2V0Q29sdW1uKVxuXG4gICAgICBpZiBpc0Zsb2F0XG4gICAgICAgIGRhdGEgPSBfLnNvcnRCeSBwZGF0YSwgKHJvdykgLT4gIHBhcnNlRmxvYXQocm93W3NvcnRCeV0pXG4gICAgICBlbHNlXG4gICAgICAgIGRhdGEgPSBfLnNvcnRCeSBwZGF0YSwgKHJvdykgLT4gcm93W3NvcnRCeV1cblxuICAgICAgI2ZsaXAgc29ydGluZyBpZiBuZWVkZWRcbiAgICAgIGlmIHNvcnRVcFxuICAgICAgICBkYXRhLnJldmVyc2UoKVxuXG4gICAgICBlbCA9IEAkKHRib2R5TmFtZSlbMF1cbiAgICAgIGhhYl9ib2R5ID0gZDMuc2VsZWN0KGVsKVxuXG4gICAgICAjcmVtb3ZlIG9sZCByb3dzXG4gICAgICBoYWJfYm9keS5zZWxlY3RBbGwoXCJ0ci5oYWJfcm93c1wiKVxuICAgICAgICAucmVtb3ZlKClcblxuICAgICAgI2FkZCBuZXcgcm93cyAoYW5kIGRhdGEpXG4gICAgICByb3dzID0gaGFiX2JvZHkuc2VsZWN0QWxsKFwidHJcIilcbiAgICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgICAuZW50ZXIoKS5pbnNlcnQoXCJ0clwiLCBcIjpmaXJzdC1jaGlsZFwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiaGFiX3Jvd3NcIilcblxuICAgICAgY29sdW1ucyA9IFtcIkhBQl9UWVBFXCIsIFwiU0laRV9TUUtNXCIsIFwiUEVSQ1wiXVxuICAgICAgY2VsbHMgPSByb3dzLnNlbGVjdEFsbChcInRkXCIpXG4gICAgICAgICAgLmRhdGEoKHJvdywgaSkgLT5jb2x1bW5zLm1hcCAoY29sdW1uKSAtPiAoY29sdW1uOiBjb2x1bW4sIHZhbHVlOiByb3dbY29sdW1uXSkpXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoXCJ0ZFwiKS50ZXh0KChkLCBpKSAtPiBcbiAgICAgICAgICBkLnZhbHVlXG4gICAgICAgICkgICAgXG5cbiAgICAgIEBzZXROZXdTb3J0RGlyKHRhcmdldENvbHVtbiwgc29ydFVwKVxuICAgICAgQHNldFNvcnRpbmdDb2xvcihldmVudCwgdGFibGVOYW1lKVxuICAgICAgI2ZpcmUgdGhlIGV2ZW50IGZvciB0aGUgYWN0aXZlIHBhZ2UgaWYgcGFnaW5hdGlvbiBpcyBwcmVzZW50XG4gICAgICBAZmlyZVBhZ2luYXRpb24odGFibGVOYW1lKVxuICAgICAgaWYgZXZlbnRcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICAjdGFibGUgcm93IGZvciBoYWJpdGF0IHJlcHJlc2VudGF0aW9uXG4gIGdldEhhYml0YXRSb3dTdHJpbmc6IChkKSA9PlxuICAgIHJldHVybiBcIjx0ZD5cIitkLkhBQl9UWVBFK1wiPC90ZD5cIitcIjx0ZD5cIitkLlNJWkVfU1FLTStcIjwvdGQ+XCIrXCI8dGQ+XCIrZC5QRVJDK1wiPC90ZD5cIlxuXG4gIHNldFNvcnRpbmdDb2xvcjogKGV2ZW50LCB0YWJsZU5hbWUpID0+XG4gICAgc29ydGluZ0NsYXNzID0gXCJzb3J0aW5nX2NvbFwiXG4gICAgaWYgZXZlbnRcbiAgICAgIHBhcmVudCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCkucGFyZW50KClcbiAgICAgIG5ld1RhcmdldE5hbWUgPSBldmVudC5jdXJyZW50VGFyZ2V0LmNsYXNzTmFtZVxuICAgICAgdGFyZ2V0U3RyID0gdGFibGVOYW1lK1wiIHRoLnNvcnRpbmdfY29sIGFcIiAgIFxuICAgICAgaWYgQCQodGFyZ2V0U3RyKSBhbmQgQCQodGFyZ2V0U3RyKVswXVxuICAgICAgICBvbGRUYXJnZXROYW1lID0gQCQodGFyZ2V0U3RyKVswXS5jbGFzc05hbWVcbiAgICAgICAgaWYgbmV3VGFyZ2V0TmFtZSAhPSBvbGRUYXJnZXROYW1lXG4gICAgICAgICAgI3JlbW92ZSBpdCBmcm9tIG9sZCBcbiAgICAgICAgICBoZWFkZXJOYW1lID0gdGFibGVOYW1lK1wiIHRoLnNvcnRpbmdfY29sXCJcbiAgICAgICAgICBAJChoZWFkZXJOYW1lKS5yZW1vdmVDbGFzcyhzb3J0aW5nQ2xhc3MpXG4gICAgICAgICAgI2FuZCBhZGQgaXQgdG8gbmV3XG4gICAgICAgICAgcGFyZW50LmFkZENsYXNzKHNvcnRpbmdDbGFzcylcbiAgICAgXG4gIGdldFNvcnREaXI6ICh0YXJnZXRDb2x1bW4pID0+XG4gICAgIHNvcnR1cCA9IEAkKCcuJyt0YXJnZXRDb2x1bW4pLmhhc0NsYXNzKFwic29ydF91cFwiKVxuICAgICByZXR1cm4gc29ydHVwXG5cbiAgZ2V0U2VsZWN0ZWRDb2x1bW46IChldmVudCwgbmFtZSkgPT5cbiAgICBpZiBldmVudFxuICAgICAgI2dldCBzb3J0IG9yZGVyXG4gICAgICB0YXJnZXRDb2x1bW4gPSBldmVudC5jdXJyZW50VGFyZ2V0LmNsYXNzTmFtZVxuICAgICAgbXVsdGlDbGFzc2VzID0gdGFyZ2V0Q29sdW1uLnNwbGl0KCcgJylcbiAgICAgICNwcm90ZWN0ZWRNYW1tYWxzID0gXy5zb3J0QnkgcHJvdGVjdGVkTWFtbWFscywgKHJvdykgLT4gcGFyc2VJbnQocm93LkNvdW50KVxuICAgICAgaGFiQ2xhc3NOYW1lID1fLmZpbmQgbXVsdGlDbGFzc2VzLCAoY2xhc3NuYW1lKSAtPiBcbiAgICAgICAgY2xhc3NuYW1lLmxhc3RJbmRleE9mKCdoYWInLDApID09IDBcbiAgICAgIHRhcmdldENvbHVtbiA9IGhhYkNsYXNzTmFtZVxuICAgIGVsc2VcbiAgICAgICN3aGVuIHRoZXJlIGlzIG5vIGV2ZW50LCBmaXJzdCB0aW1lIHRhYmxlIGlzIGZpbGxlZFxuICAgICAgdGFyZ2V0Q29sdW1uID0gbmFtZVxuXG4gICAgcmV0dXJuIHRhcmdldENvbHVtblxuXG4gIHNldE5ld1NvcnREaXI6ICh0YXJnZXRDb2x1bW4sIHNvcnRVcCkgPT5cbiAgICAjYW5kIHN3aXRjaCBpdFxuICAgIGlmIHNvcnRVcFxuICAgICAgQCQoJy4nK3RhcmdldENvbHVtbikucmVtb3ZlQ2xhc3MoJ3NvcnRfdXAnKVxuICAgICAgQCQoJy4nK3RhcmdldENvbHVtbikuYWRkQ2xhc3MoJ3NvcnRfZG93bicpXG4gICAgZWxzZVxuICAgICAgQCQoJy4nK3RhcmdldENvbHVtbikuYWRkQ2xhc3MoJ3NvcnRfdXAnKVxuICAgICAgQCQoJy4nK3RhcmdldENvbHVtbikucmVtb3ZlQ2xhc3MoJ3NvcnRfZG93bicpXG5cbiAgZmlyZVBhZ2luYXRpb246ICh0YWJsZU5hbWUpID0+XG4gICAgZWwgPSBAJCh0YWJsZU5hbWUpWzBdXG4gICAgaGFiX3RhYmxlID0gZDMuc2VsZWN0KGVsKVxuICAgIGFjdGl2ZV9wYWdlID0gaGFiX3RhYmxlLnNlbGVjdEFsbChcIi5hY3RpdmUgYVwiKVxuICAgIGlmIGFjdGl2ZV9wYWdlIGFuZCBhY3RpdmVfcGFnZVswXSBhbmQgYWN0aXZlX3BhZ2VbMF1bMF1cbiAgICAgIGFjdGl2ZV9wYWdlWzBdWzBdLmNsaWNrKClcblxubW9kdWxlLmV4cG9ydHMgPSBFbnZpcm9ubWVudFRhYiIsIlJlcG9ydFRhYiA9IHJlcXVpcmUgJ3JlcG9ydFRhYidcbnRlbXBsYXRlcyA9IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbl9wYXJ0aWFscyA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5wYXJ0aWFscyA9IFtdXG5mb3Iga2V5LCB2YWwgb2YgX3BhcnRpYWxzXG4gIHBhcnRpYWxzW2tleS5yZXBsYWNlKCdub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvJywgJycpXSA9IHZhbFxuXG5pZHMgPSByZXF1aXJlICcuL2lkcy5jb2ZmZWUnXG5mb3Iga2V5LCB2YWx1ZSBvZiBpZHNcbiAgd2luZG93W2tleV0gPSB2YWx1ZVxuXG5cbmNsYXNzIEZpc2hpbmdUYWIgZXh0ZW5kcyBSZXBvcnRUYWJcbiAgIyB0aGlzIGlzIHRoZSBuYW1lIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIFRhYlxuICBuYW1lOiAnRmlzaGluZydcbiAgY2xhc3NOYW1lOiAnZmlzaGluZydcbiAgdGltZW91dDogMTIwMDAwXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZXMuZmlzaGluZ1xuICBkZXBlbmRlbmNpZXM6IFtcbiAgICAnRmlzaGluZ0ludGVuc2l0eScsICdGaXNoaW5nQXJlYXMnXG4gIF1cblxuICByZW5kZXI6ICgpIC0+XG5cbiAgICAjc2hvdyB0YWJsZXMgaW5zdGVhZCBvZiBncmFwaCBmb3IgSUVcbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIGQzSXNQcmVzZW50ID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGQzSXNQcmVzZW50ID0gZmFsc2VcblxuICAgIGlzQ29sbGVjdGlvbiA9IEBtb2RlbC5pc0NvbGxlY3Rpb24oKVxuICAgIHNjaWQgPSBAc2tldGNoQ2xhc3MuaWRcbiAgICBpZiBzY2lkID09IE1QQV9JRCBvciBzY2lkID09IE1QQV9DT0xMRUNUSU9OX0lEXG4gICAgICBpc01QQSA9IHRydWVcbiAgICBlbHNlXG4gICAgICBpc01QQSA9IGZhbHNlXG5cbiAgICBpZiBpc01QQVxuICAgICAgc2V0bmV0ID0gQHJlY29yZFNldCgnRmlzaGluZ0ludGVuc2l0eScsICdTZXROZXQnKS50b0FycmF5KClcbiAgICAgIEByb3VuZERhdGEoc2V0bmV0KVxuXG4gICAgICB0cmF3bCA9IEByZWNvcmRTZXQoJ0Zpc2hpbmdJbnRlbnNpdHknLCAnVHJhd2wnKS50b0FycmF5KClcbiAgICAgIEByb3VuZERhdGEodHJhd2wpXG4gICAgICBsb25nbGluZSA9IEByZWNvcmRTZXQoJ0Zpc2hpbmdJbnRlbnNpdHknLCAnTG9uZ0xpbmUnKS50b0FycmF5KClcbiAgICAgIEByb3VuZERhdGEobG9uZ2xpbmUpXG5cbiAgICBlbHNlXG4gICAgICBleGlzdGluZ19jdXN0b21hcnlfZmlzaGluZyA9IEByZWNvcmRTZXQoJ0Zpc2hpbmdBcmVhcycsICdFeGlzdGluZ0N1c3RvbWFyeUFyZWEnKS50b0FycmF5KClcbiAgICAgIGhhc0V4aXN0aW5nQ3VzdG9tYXJ5ID0gZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmc/Lmxlbmd0aCA+IDBcbiAgICAgIGNvbnNvbGUubG9nKFwiZXhpc3RpbmdfY3VzdG9tYXJ5OiBcIiwgZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmcpXG4gICAgICBwcm9wb3NlZF9jdXN0b21hcnlfZmlzaGluZyA9IEByZWNvcmRTZXQoJ0Zpc2hpbmdBcmVhcycsICdQcm9wb3NlZEN1c3RvbWFyeUFyZWEnKS50b0FycmF5KClcbiAgICAgIGNvbnNvbGUubG9nKFwicHJvcG9zZWQgY3VzdG9tYXJ5OiBcIiwgcHJvcG9zZWRfY3VzdG9tYXJ5X2Zpc2hpbmcpXG4gICAgICBoYXNQcm9wb3NlZEN1c3RvbWFyeSA9IHByb3Bvc2VkX2N1c3RvbWFyeV9maXNoaW5nPy5sZW5ndGggPiAwXG4gICAgICBoYXNDdXN0b21hcnkgPSBoYXNFeGlzdGluZ0N1c3RvbWFyeSBvciBoYXNQcm9wb3NlZEN1c3RvbWFyeVxuICAgICAgY29uc29sZS5sb2coXCJoYXMgY3VzdG9tYXJ5PyBcIiwgaGFzQ3VzdG9tYXJ5KVxuICAgICAgXG4gICAgICBleGlzdGluZ19maXNoaW5nX2FyZWFzID0gQHJlY29yZFNldCgnRmlzaGluZ0FyZWFzJywgJ0Zpc2hpbmdFeGlzdGluZ0FyZWEnKS50b0FycmF5KClcbiAgICAgIGhhc0V4aXN0aW5nRmlzaGluZyA9IGV4aXN0aW5nX2Zpc2hpbmdfYXJlYXM/Lmxlbmd0aCA+IDBcbiAgICAgIGhhc0FueUZpc2hpbmcgPSBoYXNFeGlzdGluZ0Zpc2hpbmcgb3IgaGFzQ3VzdG9tYXJ5XG5cbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgIFxuICAgIGlmIGlzTVBBXG4gICAgICBjb250ZXh0ID1cbiAgICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgICBza2V0Y2hDbGFzczogQHNrZXRjaENsYXNzLmZvclRlbXBsYXRlKClcbiAgICAgICAgYXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgICAgYWRtaW46IEBwcm9qZWN0LmlzQWRtaW4gd2luZG93LnVzZXJcbiAgICAgICAgZDNJc1ByZXNlbnQ6IGQzSXNQcmVzZW50XG5cbiAgICAgICAgaXNDb2xsZWN0aW9uOiBpc0NvbGxlY3Rpb25cbiAgICAgICAgc2V0bmV0OiBzZXRuZXRcbiAgICAgICAgdHJhd2w6IHRyYXdsXG4gICAgICAgIGxvbmdsaW5lOiBsb25nbGluZVxuICAgICAgICBpc01QQTogaXNNUEFcbiAgICBlbHNlXG4gICAgICBjb250ZXh0ID1cbiAgICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgICBza2V0Y2hDbGFzczogQHNrZXRjaENsYXNzLmZvclRlbXBsYXRlKClcbiAgICAgICAgYXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgICAgYWRtaW46IEBwcm9qZWN0LmlzQWRtaW4gd2luZG93LnVzZXJcbiAgICAgICAgZDNJc1ByZXNlbnQ6IGQzSXNQcmVzZW50XG4gICAgICAgIFxuICAgICAgICBleGlzdGluZ19jdXN0b21hcnlfZmlzaGluZzogZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmdcbiAgICAgICAgaGFzRXhpc3RpbmdDdXN0b21hcnk6IGhhc0V4aXN0aW5nQ3VzdG9tYXJ5XG4gICAgICAgIHByb3Bvc2VkX2N1c3RvbWFyeV9maXNoaW5nOiBwcm9wb3NlZF9jdXN0b21hcnlfZmlzaGluZ1xuICAgICAgICBoYXNQcm9wb3NlZEN1c3RvbWFyeTogaGFzUHJvcG9zZWRDdXN0b21hcnlcbiAgICAgICAgZXhpc3RpbmdfZmlzaGluZ19hcmVhczogZXhpc3RpbmdfZmlzaGluZ19hcmVhc1xuICAgICAgICBoYXNFeGlzdGluZ0Zpc2hpbmc6IGhhc0V4aXN0aW5nRmlzaGluZ1xuICAgICAgICBoYXNBbnlGaXNoaW5nOiBoYXNBbnlGaXNoaW5nXG4gICAgICAgIGhhc0N1c3RvbWFyeTogaGFzQ3VzdG9tYXJ5XG4gICAgICAgIGlzTVBBOiBpc01QQVxuXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgcGFydGlhbHMpXG4gICAgQGVuYWJsZUxheWVyVG9nZ2xlcnMoKVxuXG4gIHJvdW5kRGF0YTogKHJlY19zZXQpID0+XG4gICAgZm9yIHJzIGluIHJlY19zZXRcbiAgICAgIHJzLkxPVyA9IE51bWJlcihycy5MT1cpLnRvRml4ZWQoMSlcbiAgICAgIHJzLkhJR0ggPSBOdW1iZXIocnMuSElHSCkudG9GaXhlZCgxKVxuICAgICAgcnMuVE9UQUwgPSBOdW1iZXIocnMuVE9UQUwpLnRvRml4ZWQoMSlcblxubW9kdWxlLmV4cG9ydHMgPSBGaXNoaW5nVGFiIiwibW9kdWxlLmV4cG9ydHMgPSBcbiAgR0VORVJJQ19JRDogJzUzOWY1ZWM2OGQxMDkyNmMyOWZlNzc2MidcbiAgR0VORVJJQ19DT0xMRUNUSU9OX0lEOiAnNTNmZDE5NTUwNDA2ZGU2ODRjMTE4OTY5J1xuICBNUEFfSUQ6ICc1NGQ4MTI5MGZhOTRlNjk3NzU5Y2U3NzEnXG4gIE1QQV9DT0xMRUNUSU9OX0lEOiAnNTU4MmU2MDVhYzJkZGRkNDI5NzZmNDFiJyIsIlJlcG9ydFRhYiA9IHJlcXVpcmUgJ3JlcG9ydFRhYidcbnRlbXBsYXRlcyA9IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbl9wYXJ0aWFscyA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5wYXJ0aWFscyA9IFtdXG5mb3Iga2V5LCB2YWwgb2YgX3BhcnRpYWxzXG4gIHBhcnRpYWxzW2tleS5yZXBsYWNlKCdub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvJywgJycpXSA9IHZhbFxuXG5pZHMgPSByZXF1aXJlICcuL2lkcy5jb2ZmZWUnXG5mb3Iga2V5LCB2YWx1ZSBvZiBpZHNcbiAgd2luZG93W2tleV0gPSB2YWx1ZVxuXG5jbGFzcyBPdmVydmlld1RhYiBleHRlbmRzIFJlcG9ydFRhYlxuICAjIHRoaXMgaXMgdGhlIG5hbWUgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgVGFiXG4gIG5hbWU6ICdPdmVydmlldydcbiAgY2xhc3NOYW1lOiAnb3ZlcnZpZXcnXG4gIHRpbWVvdXQ6IDEyMDAwMFxuICB0ZW1wbGF0ZTogdGVtcGxhdGVzLm92ZXJ2aWV3XG4gIGRlcGVuZGVuY2llczogW1xuICAgICdTaXplJ1xuICAgICdDb2FzdGxpbmVMZW5ndGgnXG4gICAgJ0hhYml0YXRzT3ZlcnZpZXcnXG4gICAgJ1Byb3Bvc2FsU2l6ZSdcbiAgICAnUHJvcG9zYWxDb25uZWN0aXZpdHknXG4gICAgJ0hhYlJlcHNUb29sYm94J1xuICBdXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgICMgVGhlIEByZWNvcmRTZXQgbWV0aG9kIGNvbnRhaW5zIHNvbWUgdXNlZnVsIG1lYW5zIHRvIGdldCBkYXRhIG91dCBvZiBcbiAgICAjIHRoZSBtb25zdGVyb3VzIFJlY29yZFNldCBqc29uLiBDaGVja291dCB0aGUgc2Vhc2tldGNoLXJlcG9ydGluZy10ZW1wbGF0ZVxuICAgICMgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBpbmZvLlxuICAgIFRPVEFMX0NPQVNUTElORV9MRU5HVEggPSA2NjcuNTk0XG4gICAgVE9UQUxfSEFCUyA9IDMwXG4gICAgaXNDb2xsZWN0aW9uID0gQG1vZGVsLmlzQ29sbGVjdGlvbigpXG4gICAgaWYgaXNDb2xsZWN0aW9uXG4gICAgICBudW1Ta2V0Y2hlcyA9IEBtb2RlbC5nZXRDaGlsZHJlbigpLmxlbmd0aFxuICAgICAgc2NpZCA9IEBza2V0Y2hDbGFzcy5pZFxuICAgIGVsc2VcbiAgICAgIG51bVNrZXRjaGVzID0gMVxuICAgICAgc2NpZCA9IEBza2V0Y2hDbGFzcy5pZFxuICAgIHBsdXJhbFNrZXRjaGVzID0gbnVtU2tldGNoZXMgPiAxXG5cbiAgICBpc0dlbmVyaWMgPSAoc2NpZCA9PSBHRU5FUklDX0lEIG9yIHNjaWQgPT0gR0VORVJJQ19DT0xMRUNUSU9OX0lEKVxuXG4gICAgcHJvcF9zaXplcyA9IEByZWNvcmRTZXQoJ1Byb3Bvc2FsU2l6ZScsICdTaXplcycpLnRvQXJyYXkoKVxuICAgIHJlcHJlc2VudGVkX2hhYnMgPSBAcmVjb3JkU2V0KCdIYWJSZXBzVG9vbGJveCcsICdSZXByZXNlbnRlZEhhYnMnKS50b0FycmF5KClcbiAgICBoYWJfc2l6ZXMgPSBAcmVjb3JkU2V0KCdIYWJSZXBzVG9vbGJveCcsICdSZXByZXNlbnRlZEhhYnMnKS50b0FycmF5KClcbiAgICBudW1faGFicyA9IGhhYl9zaXplcz8ubGVuZ3RoXG4gICAgbnVtX3JlcHJlc2VudGVkX2hhYnMgPSByZXByZXNlbnRlZF9oYWJzPy5sZW5ndGhcblxuICBcbiAgICBtcGFfYXZnX21pbl9kaW0gPSBAZ2V0QXZlcmFnZU1pbkRpbShwcm9wX3NpemVzKVxuICAgIHRvdGFsX3BlcmNlbnQgPSBAZ2V0VG90YWxBcmVhUGVyY2VudChwcm9wX3NpemVzKVxuICAgIHByb3Bfc2l6ZXMgPSBAY2xlYW51cERhdGEocHJvcF9zaXplcylcbiAgICBcbiAgICBtcGFfY291bnQgPSBAZ2V0TWluRGltQ291bnQocHJvcF9zaXplcylcbiAgICB0b3RhbF9tcGFfY291bnQgPSBudW1Ta2V0Y2hlc1xuICAgIHBsdXJhbF9tcGFfY291bnQgPSBtcGFfY291bnQgIT0gMVxuXG4gICAgXG4gICAgaWYgbXBhX2F2Z19taW5fZGltIDwgMTBcbiAgICAgIG1wYV9hdmdfc2l6ZV9ndWlkZWxpbmUgPSBcImJlbG93XCJcbiAgICBlbHNlXG4gICAgICBtcGFfYXZnX3NpemVfZ3VpZGVsaW5lID0gXCJhYm92ZVwiXG4gICAgdHJ5XG4gICAgICBzaXplID0gQHJlY29yZFNldCgnU2l6ZScsICdTaXplJykuZmxvYXQoJ1NJWkVfU1FLTScpXG4gICAgICBjb25zb2xlLmxvZyhzaXplKVxuICAgICAgaWYgc2l6ZSA8IDAuMVxuICAgICAgICBuZXdfc2l6ZSA9IFwiPCAwLjFcIlxuICAgICAgZWxzZVxuICAgICAgICBuZXdfc2l6ZSA9ICBAYWRkQ29tbWFzIHNpemVcblxuICAgIGNhdGNoIEVycm9yXG4gICAgICBjb25zb2xlLmxvZygnZXJyb3IgZ2V0dGluZyBzaXplJylcbiAgICAgIG5ld19zaXplID0gMFxuXG4gICAgdHJ5XG4gICAgICBwZXJjZW50ID0gQHJlY29yZFNldCgnU2l6ZScsICdQZXJjZW50JykuZmxvYXQoJ1BFUkMnKVxuICAgICAgaWYgcGVyY2VudCA9PSAwICYmIHRvdGFsX3BlcmNlbnQgPiAwXG4gICAgICAgIHBlcmNlbnQgPSBcIjwgMVwiXG4gICAgY2F0Y2ggRXJyb3JcbiAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3IgZ2V0dGluZyBwZXJjZW50XCIpXG4gICAgICBwZXJjZW50ID0gdG90YWxfcGVyY2VudFxuXG4gICAgY29hc3RsaW5lX2xlbmd0aCA9IEByZWNvcmRTZXQoJ0NvYXN0bGluZUxlbmd0aCcsICdDb2FzdGxpbmVMZW5ndGgnKS5mbG9hdCgnTEdUSF9JTl9NJylcbiAgICBcbiAgICBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQgPSAoKGNvYXN0bGluZV9sZW5ndGgvMTAwMCkvVE9UQUxfQ09BU1RMSU5FX0xFTkdUSCkqMTAwXG4gICAgaWYgY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50ID4gMCAmJiBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQgPCAxXG4gICAgICBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQgPSBcIjwgMVwiXG4gICAgZWxzZVxuICAgICAgY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50ID0gcGFyc2VGbG9hdChjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQpLnRvRml4ZWQoMSlcblxuICAgIGNvYXN0bGluZV9sZW5ndGggPSBAYWRkQ29tbWFzIGNvYXN0bGluZV9sZW5ndGhcbiAgICBuZXdfaGFicyA9IEByZWNvcmRTZXQoJ0hhYml0YXRzT3ZlcnZpZXcnLCAnSGFiaXRhdFNpemUnKS5mbG9hdCgnTkVXX0hBQlMnKVxuICAgIHRvdGFsX2hhYnMgPSBAcmVjb3JkU2V0KCdIYWJpdGF0c092ZXJ2aWV3JywgJ0hhYml0YXRTaXplJykuZmxvYXQoJ1RPVF9IQUJTJylcbiAgICBcbiAgICByYXRpbyA9IChjb2FzdGxpbmVfbGVuZ3RoL3NpemUpLnRvRml4ZWQoMSlcblxuICAgICNzZXR1cCBjb25uZWN0aXZpdHkgZGF0YVxuICAgIGlmIG51bVNrZXRjaGVzID4gMVxuICAgICAgcmVzID0gQHJlY29yZFNldCgnUHJvcG9zYWxDb25uZWN0aXZpdHknLCAnUmVzdWx0TXNnJylcbiAgICAgIGNvbnNvbGUubG9nKFwicmVzdWx0OiBcIiwgcmVzKVxuICAgICAgY29ubmVjdGVkX21wYV9jb3VudCA9IEByZWNvcmRTZXQoJ1Byb3Bvc2FsQ29ubmVjdGl2aXR5JywgJ0Nvbm4nKS5mbG9hdCgnTlVNQkVSJylcbiAgICAgIFxuICAgICAgcGx1cmFsX2Nvbm5lY3RlZF9tcGFfY291bnQgPSB0cnVlXG5cbiAgICAgIG1pbl9kaXN0YW5jZSA9IEByZWNvcmRTZXQoJ1Byb3Bvc2FsQ29ubmVjdGl2aXR5JywgJ0Nvbm4nKS5mbG9hdCgnTUlOJylcbiAgICAgIG1heF9kaXN0YW5jZSA9IEByZWNvcmRTZXQoJ1Byb3Bvc2FsQ29ubmVjdGl2aXR5JywgJ0Nvbm4nKS5mbG9hdCgnTUFYJylcbiAgICAgIG1lYW5fZGlzdGFuY2UgPSBAcmVjb3JkU2V0KCdQcm9wb3NhbENvbm5lY3Rpdml0eScsICdDb25uJykuZmxvYXQoJ01FQU4nKVxuICAgICAgZ29vZF9jb2xvciA9IFwiI2IzY2ZhN1wiXG4gICAgICBiYWRfY29sb3IgPSBcIiNlNWNhY2VcIlxuICAgICAgbnVtX3JlcGxpY2F0ZWRfaGFicyA9IDBcblxuICAgICAgY29ubl9waWVfdmFsdWVzID0gQGJ1aWxkX3ZhbHVlcyhcIk1QQXMgV2l0aGluIENvbm5lY3Rpdml0eSBSYW5nZVwiLCBjb25uZWN0ZWRfbXBhX2NvdW50LGdvb2RfY29sb3IsIFwiTVBBcyBPdXRzaWRlIENvbm5lY3Rpdml0eSBSYW5nZVwiLCBcbiAgICAgICAgdG90YWxfbXBhX2NvdW50LWNvbm5lY3RlZF9tcGFfY291bnQsIGJhZF9jb2xvcilcblxuICAgICAgbm90X3JlcHJlc2VudGVkID0gVE9UQUxfSEFCUyAtIG51bV9yZXByZXNlbnRlZF9oYWJzXG4gICAgICByZXByZXNlbnRlZF9oYWJzX3BpZV92YWx1ZXMgPSBAYnVpbGRfdmFsdWVzKFwiSGFiaXRhdC10eXBlcyBSZXByZXNlbnRlZFwiLCBudW1fcmVwcmVzZW50ZWRfaGFicywgZ29vZF9jb2xvciwgXCJIYWJpdGF0LXR5cGVzIE5vdCBSZXByZXNlbnRlZFwiLFxuICAgICAgICBub3RfcmVwcmVzZW50ZWQsIGJhZF9jb2xvcilcblxuICAgICAgbm90X3JlcGxpY2F0ZWQgPSBUT1RBTF9IQUJTIC0gbnVtX3JlcGxpY2F0ZWRfaGFic1xuICAgICAgcmVwbGljYXRlZF9oYWJzX3BpZV92YWx1ZXMgPSBAYnVpbGRfdmFsdWVzKFwiSGFiaXRhdC10eXBlcyBSZXBsaWNhdGVkXCIsIG51bV9yZXBsaWNhdGVkX2hhYnMsIGdvb2RfY29sb3IsIFwiSGFiaXRhdC10eXBlcyBOb3QgUmVwbGljYXRlZFwiLFxuICAgICAgICBub3RfcmVwbGljYXRlZCwgYmFkX2NvbG9yKVxuXG4gICAgI3Nob3cgdGFibGVzIGluc3RlYWQgb2YgZ3JhcGggZm9yIElFXG4gICAgaWYgd2luZG93LmQzXG4gICAgICBkM0lzUHJlc2VudCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBkM0lzUHJlc2VudCA9IGZhbHNlXG5cbiAgICBpc01QQSA9IChzY2lkID09IE1QQV9JRCBvciBzY2lkID09IE1QQV9DT0xMRUNUSU9OX0lEKVxuICAgIGF0dHJpYnV0ZXMgPSBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgXG4gICAgY29udGV4dCA9XG4gICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcbiAgICAgIHNrZXRjaDogQG1vZGVsLmZvclRlbXBsYXRlKClcbiAgICAgIHNrZXRjaENsYXNzOiBAc2tldGNoQ2xhc3MuZm9yVGVtcGxhdGUoKVxuICAgICAgYXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgYW55QXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKS5sZW5ndGggPiAwXG4gICAgICBhZG1pbjogQHByb2plY3QuaXNBZG1pbiB3aW5kb3cudXNlclxuICAgICAgc2l6ZTogbmV3X3NpemVcbiAgICAgIGNvYXN0bGluZV9sZW5ndGg6IGNvYXN0bGluZV9sZW5ndGhcbiAgICAgIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudDpjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnRcbiAgICAgIG5ld19oYWJzOiBuZXdfaGFic1xuICAgICAgdG90YWxfaGFiczogdG90YWxfaGFic1xuICAgICAgcmF0aW86IHJhdGlvXG4gICAgICBwZXJjZW50OiBwZXJjZW50XG4gICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuICAgICAgbnVtU2tldGNoZXM6IG51bVNrZXRjaGVzXG4gICAgICBwbHVyYWxTa2V0Y2hlczogcGx1cmFsU2tldGNoZXNcbiAgICAgIHByb3Bfc2l6ZXM6IHByb3Bfc2l6ZXNcbiAgICAgIHRvdGFsX21wYV9jb3VudDogdG90YWxfbXBhX2NvdW50XG4gICAgICBtcGFfY291bnQ6IG1wYV9jb3VudFxuICAgICAgbXBhX2F2Z19zaXplX2d1aWRlbGluZTptcGFfYXZnX3NpemVfZ3VpZGVsaW5lXG4gICAgICBwbHVyYWxfbXBhX2NvdW50OiBwbHVyYWxfbXBhX2NvdW50XG4gICAgICBjb25uZWN0ZWRfbXBhX2NvdW50OiBjb25uZWN0ZWRfbXBhX2NvdW50XG5cbiAgICAgIHBsdXJhbF9jb25uZWN0ZWRfbXBhX2NvdW50OiBwbHVyYWxfY29ubmVjdGVkX21wYV9jb3VudFxuICAgICAgbWluX2Rpc3RhbmNlOiBtaW5fZGlzdGFuY2VcbiAgICAgIG1heF9kaXN0YW5jZTogbWF4X2Rpc3RhbmNlXG4gICAgICBtZWFuX2Rpc3RhbmNlOiBtZWFuX2Rpc3RhbmNlXG4gICAgICBzaW5nbGVTa2V0Y2g6IG51bVNrZXRjaGVzID09IDFcbiAgICAgIGlzTVBBOiBpc01QQVxuICAgICAgbnVtX2hhYnM6IG51bV9oYWJzXG4gICAgICB0b3RhbF9oYWJzOiBUT1RBTF9IQUJTXG4gICAgICBudW1fcmVwcmVzZW50ZWRfaGFiczogbnVtX3JlcHJlc2VudGVkX2hhYnNcbiAgICAgIG51bV9yZXBsaWNhdGVkX2hhYnM6IG51bV9yZXBsaWNhdGVkX2hhYnNcbiAgICAgIGlzR2VuZXJpYzogaXNHZW5lcmljXG5cbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcbiAgICBAZW5hYmxlTGF5ZXJUb2dnbGVycygpXG5cbiAgICAjc2l6ZV9waWVfdmFsdWVzID0gQGJ1aWxkX3ZhbHVlcyhcIk1lZXRzIE1pbi4gU2l6ZVwiLCBtcGFfY291bnQsXCIjYjNjZmE3XCIsIFwiRG9lcyBub3QgTWVldCBTaXplIE1pbi5cIiwgXG4gICAgIyAgdG90YWxfbXBhX2NvdW50LW1wYV9jb3VudCwgXCIjZTVjYWNlXCIpXG5cblxuICAgIFxuICAgIEBkcmF3UGllKHJlcHJlc2VudGVkX2hhYnNfcGllX3ZhbHVlcywgXCIjcmVwcmVzZW50ZWRfaGFic19waWVcIilcbiAgICBAZHJhd1BpZShyZXBsaWNhdGVkX2hhYnNfcGllX3ZhbHVlcywgXCIjcmVwbGljYXRlZF9oYWJzX3BpZVwiKVxuICAgIEBkcmF3UGllKGNvbm5fcGllX3ZhbHVlcywgXCIjY29ubmVjdGl2aXR5X3BpZVwiKVxuICBcblxuICBidWlsZF92YWx1ZXM6ICh5ZXNfbGFiZWwsIHllc19jb3VudCwgeWVzX2NvbG9yLCBub19sYWJlbCwgbm9fY291bnQsIG5vX2NvbG9yKSA9PlxuICAgIHllc192YWwgPSB7XCJsYWJlbFwiOnllc19sYWJlbCtcIiAoXCIreWVzX2NvdW50K1wiKVwiLCBcInZhbHVlXCI6eWVzX2NvdW50LCBcImNvbG9yXCI6eWVzX2NvbG9yLCBcInl2YWxcIjoyNX1cbiAgICBub192YWwgPSB7XCJsYWJlbFwiOm5vX2xhYmVsK1wiIChcIitub19jb3VudCtcIilcIiwgXCJ2YWx1ZVwiOm5vX2NvdW50LCBcImNvbG9yXCI6bm9fY29sb3IsIFwieXZhbFwiOjUwfVxuXG4gICAgcmV0dXJuIFt5ZXNfdmFsLCBub192YWxdXG5cbiAgZ2V0RGF0YVZhbHVlOiAoZGF0YSkgPT5cbiAgICByZXR1cm4gZGF0YS52YWx1ZVxuXG4gIGRyYXdQaWU6IChkYXRhLCBwaWVfbmFtZSkgPT5cbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIHcgPSA5MFxuICAgICAgaCA9IDc1XG4gICAgICByID0gMjVcbiAgICAgXG4gICAgICB2aXMgPSBkMy5zZWxlY3QocGllX25hbWUpLmFwcGVuZChcInN2ZzpzdmdcIikuZGF0YShbZGF0YV0pLmF0dHIoXCJ3aWR0aFwiLCB3KS5hdHRyKFwiaGVpZ2h0XCIsIGgpLmFwcGVuZChcInN2ZzpnXCIpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyAocioyKSArIFwiLFwiICsgKHIrNSkgKyBcIilcIilcbiAgICAgIHBpZSA9IGQzLmxheW91dC5waWUoKS52YWx1ZSgoZCkgLT4gcmV0dXJuIGQudmFsdWUpXG5cbiAgICAgICNkZWNsYXJlIGFuIGFyYyBnZW5lcmF0b3IgZnVuY3Rpb25cbiAgICAgIGFyYyA9IGQzLnN2Zy5hcmMoKS5vdXRlclJhZGl1cyhyKVxuXG4gICAgICAjc2VsZWN0IHBhdGhzLCB1c2UgYXJjIGdlbmVyYXRvciB0byBkcmF3XG4gICAgICBhcmNzID0gdmlzLnNlbGVjdEFsbChcImcuc2xpY2VcIikuZGF0YShwaWUpLmVudGVyKCkuYXBwZW5kKFwic3ZnOmdcIikuYXR0cihcImNsYXNzXCIsIFwic2xpY2VcIilcbiAgICAgIGFyY3MuYXBwZW5kKFwic3ZnOnBhdGhcIilcbiAgICAgICAgLmF0dHIoXCJmaWxsXCIsIChkKSAtPiByZXR1cm4gZC5kYXRhLmNvbG9yKVxuICAgICAgICAuYXR0cihcInN0cm9rZVwiLCAoZCkgLT4gcmV0dXJuIGlmIGQuZGF0YS52YWx1ZSA9PSAwIHRoZW4gXCJub25lXCIgZWxzZSBcIiM1NDU0NTRcIilcbiAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMC4yNSlcbiAgICAgICAgLmF0dHIoXCJkXCIsIChkKSAtPiAgXG4gICAgICAgICAgYXJjKGQpXG4gICAgICAgIClcblxuXG4gICAgICBlbCA9IEAkKHBpZV9uYW1lK1wiX2xlZ2VuZFwiKVswXVxuICAgICAgY2hhcnQgPSBkMy5zZWxlY3QoZWwpXG4gICAgICBsZWdlbmRzID0gY2hhcnQuc2VsZWN0QWxsKHBpZV9uYW1lK1wiX2xlZ2VuZFwiKVxuICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgLmVudGVyKCkuaW5zZXJ0KFwiZGl2XCIpXG4gICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImxlZ2VuZC1yb3dcIilcblxuICAgICAgbGVnZW5kcy5hcHBlbmQoXCJzcGFuXCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJwaWUtbGFiZWwtc3dhdGNoXCIpXG4gICAgICAgIC5zdHlsZSgnYmFja2dyb3VuZC1jb2xvcicsIChkLGkpIC0+IGQuY29sb3IpXG4gICAgICBcbiAgICAgIGxlZ2VuZHMuYXBwZW5kKFwic3BhblwiKVxuICAgICAgICAudGV4dCgoZCxpKSAtPiByZXR1cm4gZGF0YVtpXS5sYWJlbClcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInBpZS1sYWJlbFwiKVxuXG4gICAgICBcblxuICBnZXRUb3RhbEFyZWFQZXJjZW50OiAocHJvcF9zaXplcykgPT5cblxuICAgIGZvciBwcyBpbiBwcm9wX3NpemVzXG4gICAgICBpZiBwcy5OQU1FID09IFwiUGVyY2VudCBvZiBUb3RhbCBBcmVhXCJcbiAgICAgICAgcmV0dXJuIHBzLlNJWkVfU1FLTVxuICAgIHJldHVybiAwLjBcblxuICBnZXRBdmVyYWdlTWluRGltOiAocHJvcF9zaXplcykgPT5cbiAgICBmb3IgcHMgaW4gcHJvcF9zaXplc1xuICAgICAgaWYgcHMuTkFNRSA9PSBcIkF2ZXJhZ2VcIlxuICAgICAgICByZXR1cm4gcHMuTUlOX0RJTVxuXG4gIGNsZWFudXBEYXRhOiAocHJvcF9zaXplcykgPT5cbiAgICBjbGVhbmVkX3Byb3BzID0gW11cbiAgICBmb3IgcHMgaW4gcHJvcF9zaXplc1xuICAgICAgaWYgcHMuTkFNRSAhPSBcIlBlcmNlbnQgb2YgVG90YWwgQXJlYVwiXG4gICAgICAgIHBzLk1JTl9ESU0gPSBwYXJzZUZsb2F0KHBzLk1JTl9ESU0pLnRvRml4ZWQoMSlcbiAgICAgICAgcHMuU0laRV9TUUtNID0gcGFyc2VGbG9hdChwcy5TSVpFX1NRS00pLnRvRml4ZWQoMSlcbiAgICAgICAgaWYgcHMuU0laRV9TUUtNIDwgMC4xXG4gICAgICAgICAgcHMuU0laRV9TUUtNID0gXCI8IDAuMVwiXG4gICAgICAgIHBzLkNPQVNUID0gTnVtYmVyKHBzLkNPQVNUKS50b0ZpeGVkKDEpXG4gICAgICAgIGlmIHBzLkNPQVNUID09IDAgXG4gICAgICAgICAgcHMuQ09BU1QgPSBcIi0tXCJcbiAgICAgICAgICBcbiAgICAgICAgY2xlYW5lZF9wcm9wcy5wdXNoKHBzKVxuXG4gICAgcmV0dXJuIGNsZWFuZWRfcHJvcHNcblxuICBnZXRNaW5EaW1Db3VudDogKHByb3Bfc2l6ZXMpID0+XG4gICAgbnVtX21lZXRfY3JpdGVyaWEgPSAwXG4gICAgdG90YWxfbWluX3NpemUgPSAwXG5cbiAgICBmb3IgcHMgaW4gcHJvcF9zaXplc1xuICAgICAgaWYgcHMuTkFNRSAhPSBcIkF2ZXJhZ2VcIiAmJiBwcy5NSU5fRElNID4gNSBcbiAgICAgICAgbnVtX21lZXRfY3JpdGVyaWErPTFcblxuICAgIHJldHVybiBudW1fbWVldF9jcml0ZXJpYVxuXG4gIGFkZENvbW1hczogKG51bV9zdHIpID0+XG4gICAgbnVtX3N0ciArPSAnJ1xuICAgIHggPSBudW1fc3RyLnNwbGl0KCcuJylcbiAgICB4MSA9IHhbMF1cbiAgICB4MiA9IGlmIHgubGVuZ3RoID4gMSB0aGVuICcuJyArIHhbMV0gZWxzZSAnJ1xuICAgIHJneCA9IC8oXFxkKykoXFxkezN9KS9cbiAgICB3aGlsZSByZ3gudGVzdCh4MSlcbiAgICAgIHgxID0geDEucmVwbGFjZShyZ3gsICckMScgKyAnLCcgKyAnJDInKVxuICAgIHJldHVybiB4MSArIHgyXG5cbm1vZHVsZS5leHBvcnRzID0gT3ZlcnZpZXdUYWIiLCJPdmVydmlld1RhYiA9IHJlcXVpcmUgJy4vb3ZlcnZpZXcuY29mZmVlJ1xuVXNlc1RhYiA9IHJlcXVpcmUgJy4vdXNlcy5jb2ZmZWUnXG5FbnZpcm9ubWVudFRhYiA9IHJlcXVpcmUgJy4vZW52aXJvbm1lbnQuY29mZmVlJ1xuRmlzaGluZ1RhYiA9IHJlcXVpcmUgJy4vZmlzaGluZy5jb2ZmZWUnXG5cbndpbmRvdy5hcHAucmVnaXN0ZXJSZXBvcnQgKHJlcG9ydCkgLT5cbiAgcmVwb3J0LnRhYnMgW092ZXJ2aWV3VGFiLCBFbnZpcm9ubWVudFRhYiwgRmlzaGluZ1RhYixVc2VzVGFiXVxuICAjIHBhdGggbXVzdCBiZSByZWxhdGl2ZSB0byBkaXN0L1xuICByZXBvcnQuc3R5bGVzaGVldHMgWycuL3JlcG9ydC5jc3MnXVxuIiwiUmVwb3J0VGFiID0gcmVxdWlyZSAncmVwb3J0VGFiJ1xudGVtcGxhdGVzID0gcmVxdWlyZSAnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxuX3BhcnRpYWxzID0gcmVxdWlyZSAnLi4vbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cbmlkcyA9IHJlcXVpcmUgJy4vaWRzLmNvZmZlZSdcbmZvciBrZXksIHZhbHVlIG9mIGlkc1xuICB3aW5kb3dba2V5XSA9IHZhbHVlXG5cblxuY2xhc3MgVXNlc1RhYiBleHRlbmRzIFJlcG9ydFRhYlxuICAjIHRoaXMgaXMgdGhlIG5hbWUgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgVGFiXG4gIG5hbWU6ICdPdGhlcidcbiAgY2xhc3NOYW1lOiAndXNlcydcbiAgdGltZW91dDogMTIwMDAwXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZXMudXNlc1xuICBkZXBlbmRlbmNpZXM6IFtcbiAgICAnT3ZlcmxhcFdpdGhSZWNyZWF0aW9uYWxVc2VzJ1xuICAgICdTcGVjaWVzSW5mb3JtYXRpb24nXG4gIF1cblxuXG4gIHJlbmRlcjogKCkgLT5cblxuICAgICNzaG93IHRhYmxlcyBpbnN0ZWFkIG9mIGdyYXBoIGZvciBJRVxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgZDNJc1ByZXNlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgZDNJc1ByZXNlbnQgPSBmYWxzZVxuXG4gICAgI3NwZWNpZXMgaW5mb1xuICAgIHRyeVxuICAgICAgc2VhYmlyZHMgPSBAcmVjb3JkU2V0KCdTcGVjaWVzSW5mb3JtYXRpb24nLCAnU2VhYmlyZHMnKS50b0FycmF5KClcbiAgICAgIGhhc1NlYWJpcmRBcmVhcyA9IHNlYWJpcmRzPy5sZW5ndGggPiAwXG4gICAgY2F0Y2ggRXJyb3JcbiAgICAgIGhhc1NlYWJpcmRBcmVhcyA9IGZhbHNlXG5cbiAgICB0cnlcbiAgICAgIHNlYWJpcmRfY29sb25pZXMgPSBAcmVjb3JkU2V0KCdTcGVjaWVzSW5mb3JtYXRpb24nLCAnU2VhYmlyZENvbG9uaWVzJykudG9BcnJheSgpXG4gICAgICBoYXNTZWFiaXJkQ29sb25pZXMgPSBzZWFiaXJkX2NvbG9uaWVzPy5sZW5ndGggPiAwXG4gICAgY2F0Y2ggRXJyb3JcbiAgICAgIGhhc1NlYWJpcmRDb2xvbmllcyA9IGZhbHNlXG5cbiAgICBcbiAgICBoYXNTZWFiaXJkcyA9IChzZWFiaXJkcz8ubGVuZ3RoPiAwIG9yIHNlYWJpcmRfY29sb25pZXM/Lmxlbmd0aCA+IDApXG4gICAgbWFtbWFscyA9IEByZWNvcmRTZXQoJ1NwZWNpZXNJbmZvcm1hdGlvbicsICdNYW1tYWxzJykudG9BcnJheSgpXG4gICAgaGFzTWFtbWFscyA9IG1hbW1hbHM/Lmxlbmd0aCA+IDBcbiAgICB0cnlcbiAgICAgIHNlYWxzID0gQHJlY29yZFNldCgnU3BlY2llc0luZm9ybWF0aW9uJywgJ1NlYWxzJykudG9BcnJheSgpXG4gICAgICBoYXNTZWFscyA9IHNlYWxzPy5sZW5ndGggPiAwXG4gICAgY2F0Y2ggRXJyb3JcbiAgICAgIGhhc1NlYWxzID0gZmFsc2VcblxuICAgIFxuICAgIHJlZWZfZmlzaCA9IEByZWNvcmRTZXQoJ1NwZWNpZXNJbmZvcm1hdGlvbicsICdSZWVmRmlzaCcpLnRvQXJyYXkoKVxuICAgIGluSGlnaERpdmVyc2l0eVJlZWZGaXNoQXJlYSA9IHJlZWZfZmlzaD8ubGVuZ3RoID4gMFxuXG4gICAgc21hcm8gPSBcIlNNQVJPXCJcbiAgICByZWNfdXNlcyA9IEByZWNvcmRTZXQoJ092ZXJsYXBXaXRoUmVjcmVhdGlvbmFsVXNlcycsICdSZWNyZWF0aW9uYWxVc2UnKS50b0FycmF5KClcbiAgICBoYXNTbWFybyA9IGZhbHNlXG5cblxuICAgIG5vbl9zbWFyb19yZWNfdXNlcyA9IHJlY191c2VzLmZpbHRlciAocmVjKSAtPiByZWMuRkVBVF9UWVBFICE9IHNtYXJvXG4gICAgaGFzUmVjVXNlcyA9IG5vbl9zbWFyb19yZWNfdXNlcz8ubGVuZ3RoID4gMFxuICAgIFxuICAgIGhlcml0YWdlID0gQHJlY29yZFNldCgnT3ZlcmxhcFdpdGhSZWNyZWF0aW9uYWxVc2VzJywgJ0hlcml0YWdlJykudG9BcnJheSgpXG4gICAgaGFzSGVyaXRhZ2UgPSBoZXJpdGFnZT8ubGVuZ3RoID4gMFxuICAgIGNvYXN0YWxfY29uc2VudHMgPSBAcmVjb3JkU2V0KCdPdmVybGFwV2l0aFJlY3JlYXRpb25hbFVzZXMnLCAnQ29hc3RhbENvbnNlbnRzJykudG9BcnJheSgpXG4gICAgaGFzQ29hc3RhbCA9IGNvYXN0YWxfY29uc2VudHM/Lmxlbmd0aCA+IDBcbiAgICBpbmZyYXN0cnVjdHVyZSA9ICBAcmVjb3JkU2V0KCdPdmVybGFwV2l0aFJlY3JlYXRpb25hbFVzZXMnLCAnSW5mcmFzdHJ1Y3R1cmUnKS50b0FycmF5KClcbiAgICBoYXNJbmZyYXN0cnVjdHVyZSA9IGluZnJhc3RydWN0dXJlPy5sZW5ndGggPiAwXG4gICAgYXR0cmlidXRlcyA9IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICBcbiAgICBoYXNVc2VzID0gaGFzUmVjVXNlcyBvciBoYXNIZXJpdGFnZSBvciBoYXNJbmZyYXN0cnVjdHVyZSBvciBoYXNDb2FzdGFsXG4gICAgaGFzTWFyaW5lU3BlY2llcyA9IGhhc01hbW1hbHMgb3IgaGFzU2VhbHNcblxuICAgIGlzQ29sbGVjdGlvbiA9IEBtb2RlbC5pc0NvbGxlY3Rpb24oKVxuICAgIGNvbnRleHQgPVxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcbiAgICAgIHJlY191c2VzOiBub25fc21hcm9fcmVjX3VzZXNcbiAgICAgIGhhc1NtYXJvOiBoYXNTbWFyb1xuICAgICAgaGFzUmVjVXNlczogaGFzUmVjVXNlc1xuICAgICAgaGVyaXRhZ2U6IGhlcml0YWdlXG4gICAgICBoYXNIZXJpdGFnZTogaGFzSGVyaXRhZ2VcbiAgICAgIGNvYXN0YWxfY29uc2VudHM6IGNvYXN0YWxfY29uc2VudHNcbiAgICAgIGhhc0NvYXN0YWw6IGhhc0NvYXN0YWxcbiAgICAgIGluZnJhc3RydWN0dXJlOiBpbmZyYXN0cnVjdHVyZVxuICAgICAgaGFzSW5mcmFzdHJ1Y3R1cmU6IGhhc0luZnJhc3RydWN0dXJlXG4gICAgICBoYXNVc2VzOiBoYXNVc2VzXG4gICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuXG4gICAgICAjc3BlY2llcyBpbmZvXG4gICAgICBzZWFiaXJkczogc2VhYmlyZHNcbiAgICAgIHNlYWJpcmRfY29sb25pZXM6IHNlYWJpcmRfY29sb25pZXNcbiAgICAgIGhhc1NlYWJpcmRzOiBoYXNTZWFiaXJkc1xuICAgICAgaGFzU2VhYmlyZEFyZWFzOiBoYXNTZWFiaXJkQXJlYXNcbiAgICAgIGhhc1NlYWJpcmRDb2xvbmllczogaGFzU2VhYmlyZENvbG9uaWVzXG4gICAgICBcbiAgICAgIG1hbW1hbHM6IG1hbW1hbHNcbiAgICAgIGhhc01hbW1hbHM6IGhhc01hbW1hbHNcbiAgICAgIHJlZWZfZmlzaDogcmVlZl9maXNoXG4gICAgICBzZWFsczogc2VhbHNcbiAgICAgIGhhc1NlYWxzOiBoYXNTZWFsc1xuXG4gICAgICBpbkhpZ2hEaXZlcnNpdHlSZWVmRmlzaEFyZWE6IGluSGlnaERpdmVyc2l0eVJlZWZGaXNoQXJlYVxuICAgICAgaGFzTWFyaW5lU3BlY2llczogaGFzTWFyaW5lU3BlY2llc1xuXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgcGFydGlhbHMpXG4gICAgQGVuYWJsZUxheWVyVG9nZ2xlcnMoKVxuXG4gICAgXG5cbm1vZHVsZS5leHBvcnRzID0gVXNlc1RhYiIsInRoaXNbXCJUZW1wbGF0ZXNcIl0gPSB0aGlzW1wiVGVtcGxhdGVzXCJdIHx8IHt9O1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcImRlbW9cIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+UmVwb3J0IFNlY3Rpb25zPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwPlVzZSByZXBvcnQgc2VjdGlvbnMgdG8gZ3JvdXAgaW5mb3JtYXRpb24gaW50byBtZWFuaW5nZnVsIGNhdGVnb3JpZXM8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5EMyBWaXN1YWxpemF0aW9uczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8dWwgY2xhc3M9XFxcIm5hdiBuYXYtcGlsbHNcXFwiIGlkPVxcXCJ0YWJzMlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxsaSBjbGFzcz1cXFwiYWN0aXZlXFxcIj48YSBocmVmPVxcXCIjY2hhcnRcXFwiPkNoYXJ0PC9hPjwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxsaT48YSBocmVmPVxcXCIjZGF0YVRhYmxlXFxcIj5UYWJsZTwvYT48L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC91bD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInRhYi1jb250ZW50XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwidGFiLXBhbmUgYWN0aXZlXFxcIiBpZD1cXFwiY2hhcnRcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwhLS1baWYgSUUgOF0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcInVuc3VwcG9ydGVkXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICBUaGlzIHZpc3VhbGl6YXRpb24gaXMgbm90IGNvbXBhdGlibGUgd2l0aCBJbnRlcm5ldCBFeHBsb3JlciA4LiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICBQbGVhc2UgdXBncmFkZSB5b3VyIGJyb3dzZXIsIG9yIHZpZXcgcmVzdWx0cyBpbiB0aGUgdGFibGUgdGFiLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD4gICAgICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8IVtlbmRpZl0tLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIFNlZSA8Y29kZT5zcmMvc2NyaXB0cy9kZW1vLmNvZmZlZTwvY29kZT4gZm9yIGFuIGV4YW1wbGUgb2YgaG93IHRvIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgdXNlIGQzLmpzIHRvIHJlbmRlciB2aXN1YWxpemF0aW9ucy4gUHJvdmlkZSBhIHRhYmxlLWJhc2VkIHZpZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIGFuZCB1c2UgY29uZGl0aW9uYWwgY29tbWVudHMgdG8gcHJvdmlkZSBhIGZhbGxiYWNrIGZvciBJRTggdXNlcnMuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8YnI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8YSBocmVmPVxcXCJodHRwOi8vdHdpdHRlci5naXRodWIuaW8vYm9vdHN0cmFwLzIuMy4yL1xcXCI+Qm9vdHN0cmFwIDIueDwvYT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIGlzIGxvYWRlZCB3aXRoaW4gU2VhU2tldGNoIHNvIHlvdSBjYW4gdXNlIGl0IHRvIGNyZWF0ZSB0YWJzIGFuZCBvdGhlciBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIGludGVyZmFjZSBjb21wb25lbnRzLiBqUXVlcnkgYW5kIHVuZGVyc2NvcmUgYXJlIGFsc28gYXZhaWxhYmxlLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInRhYi1wYW5lXFxcIiBpZD1cXFwiZGF0YVRhYmxlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+aW5kZXg8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD52YWx1ZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJjaGFydERhdGFcIixjLHAsMSksYyxwLDAsMTM1MSwxNDE4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgPHRyPjx0ZD5cIik7Xy5iKF8udihfLmYoXCJpbmRleFwiLGMscCwwKSkpO18uYihcIjwvdGQ+PHRkPlwiKTtfLmIoXy52KF8uZihcInZhbHVlXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD48L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIGVtcGhhc2lzXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5FbXBoYXNpczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cD5HaXZlIHJlcG9ydCBzZWN0aW9ucyBhbiA8Y29kZT5lbXBoYXNpczwvY29kZT4gY2xhc3MgdG8gaGlnaGxpZ2h0IGltcG9ydGFudCBpbmZvcm1hdGlvbi48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHdhcm5pbmdcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0Pldhcm5pbmc8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHA+T3IgPGNvZGU+d2FybjwvY29kZT4gb2YgcG90ZW50aWFsIHByb2JsZW1zLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gZGFuZ2VyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5EYW5nZXI8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHA+PGNvZGU+ZGFuZ2VyPC9jb2RlPiBjYW4gYWxzbyBiZSB1c2VkLi4uIHNwYXJpbmdseS48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcImVudmlyb25tZW50XCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO2lmKF8ucyhfLmQoXCJza2V0Y2hDbGFzcy5kZWxldGVkXCIsYyxwLDEpLGMscCwwLDI0LDI3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtd2FyblxcXCIgc3R5bGU9XFxcIm1hcmdpbi1ib3R0b206MTBweDtcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgVGhpcyBza2V0Y2ggd2FzIGNyZWF0ZWQgdXNpbmcgdGhlIFxcXCJcIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiB0ZW1wbGF0ZSwgd2hpY2ggaXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIG5vIGxvbmdlciBhdmFpbGFibGUuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIGNvcHkgdGhpcyBza2V0Y2ggb3IgbWFrZSBuZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIHNrZXRjaGVzIG9mIHRoaXMgdHlwZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+SGFiaXRhdC10eXBlcyBSZXByZXNlbnRlZCBpbiBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw0MDUsNDE1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJDb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiU2tldGNoXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTNhMGEzMWNkM2Y2MDY0ZDJjMTc1ODBjXFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5zaG93IGxheWVyPC9hPjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIyMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjI1MHB4O1xcXCI+SGFiaXRhdDwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYWJpdGF0c19yZXByZXNlbnRlZFwiLGMscCwxKSxjLHAsMCw3NjksODQ1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJIQUJfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5IYWJpdGF0cyBQcmVzZW50IGluIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDEwMTIsMTAyMixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiQ29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlNrZXRjaFwiKTt9O18uYihcIiA8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXRvZ2dsZS1ub2RlPVxcXCI1M2EwYTMxY2QzZjYwNjRkMmMxNzU4MGNcXFwiIGRhdGEtdmlzaWJsZT1cXFwiZmFsc2VcXFwiPnNob3cgbGF5ZXI8L2E+PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBBcmVhICglKSByZWZlcnMgdG8gdGhlIHBlcmNlbnRhZ2Ugb2YgdGhlIGhhYml0YXQgY29udGFpbmVkIHdpdGhpbiB0aGUgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxMjk5LDEzNzIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsMTMxMywxMzIzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwibmV0d29ya1wiKTt9O30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBcIik7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgYXMgYSBwcm9wb3J0aW9uIG9mIHRoZSB0b3RhbCBhcmVhIG9mIGhhYml0YXQgd2l0aGluIHRoZSBTb3V0aC1FYXN0IE1hcmluZSByZWdpb24uXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9pPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwwLDE1NjEsMjAzOCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIyMFxcXCIgY2xhc3M9XFxcImhhYl90YWJsZVxcXCI+IFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoIGNsYXNzPVxcXCJzb3J0aW5nX2NvbFxcXCIgc3R5bGU9XFxcIndpZHRoOjI1MHB4O1xcXCI+PGEgY2xhc3M9XFxcImhhYl90eXBlIHNvcnRfdXBcXFwiIGhyZWY9XFxcIiNcXFwiPkhhYml0YXQgQ2xhc3NpZmljYXRpb24gVHlwZTwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD48YSAgY2xhc3M9XFxcImhhYl9uZXdfYXJlYSBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiID5BcmVhIChrbTxzdXA+Mjwvc3VwPik8L2E+PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcImhhYl9uZXdfcGVyYyBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiPkFyZWEgKCUpPC9hPjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5IGNsYXNzPVxcXCJoYWJfdmFsdWVzXFxcIj48L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjI1MHB4O1xcXCI+SGFiaXRhdHM8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD5BcmVhICg8c3VwPjI8L3N1cD4pPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+QXJlYSAoJSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFiX3NpemVzXCIsYyxwLDEpLGMscCwwLDIzMzMsMjQ3NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiSEFCX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJTSVpFX1NRS01cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJQRVJDXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCIgICAgPCEtLS0gIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvYnI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8c3Ryb25nPkhhYml0YXQgRXZlbm5lc3M8L3N0cm9uZz48L2JyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBUaGUgbWVhc3VyZSBvZiAnZXZlbm5lc3MnIGZvciB0aGUgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJoYWJzX2luX3NrZXRjaFwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBoYWJpdGF0XCIpO2lmKF8ucyhfLmYoXCJoYWJzX3BsdXJhbFwiLGMscCwxKSxjLHAsMCwyNzU0LDI3NTUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcInNcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiIHByZXNlbnQgaW4gdGhlIFNrZXRjaCBpcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcImV2ZW5uZXNzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+LlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxlbT5FdmVubmVzcyBpcyBhIG1lYXN1cmUgb2YgdGhlIHJlbGF0aXZlIGFidW5kYW5jZSBvZiBoYWJpdGF0cyB3aXRoaW4gYW4gYXJlYSwgd2hlcmUgYSBoaWdoIG51bWJlciBhcHByb2FjaGluZyBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgMSBtZWFucyBhbGwgdGhlIGhhYml0YXRzIGFyZSByZWxhdGl2ZWx5IHNpbWlsYXIgaW4gc2l6ZSwgYW5kIGEgbG93IG51bWJlciBpbmRpY2F0aW5nIHRoYXQgdGhlIGhhYml0YXRzIGFyZSB2YXJpZWQgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIGluIHRoZWlyIHNpemUuIEEgaGlnaGVyIGhhYml0YXQgZXZlbm5lc3Mgc2NvcmUgZ2VuZXJhbGx5IGluZGljYXRlcyBhIGhpZ2hlciBzcGVjaWVzIGRpdmVyc2l0eS4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIEV2ZW5uZXNzIGhhcyBiZWVuIGNhbGN1bGF0ZWQgdXNpbmcgdGhlIFNpbXBzb24ncyBFIGluZGV4LjwvZW0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAtLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5BZGphY2VudCBUZXJyZXN0cmlhbCBJbmZvcm1hdGlvbjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHA+PGVtPk1QQSBHdWlkZWxpbmVzOiBcXFwiQ29uc2lkZXIgYWRqYWNlbnQgdGVycmVzdHJpYWwgZW52aXJvbm1lbnRcXFwiIChhcmVhcyBzaG93biBiZWxvdyBhcmUgd2l0aGluIDEwMG0gb2YgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMzUzNCwzNTYwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJhIHNrZXRjaCBpbiB0aGUgY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiB0aGUgc2tldGNoIFwiKTt9O18uYihcIik8L2VtPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPjxzdHJvbmc+UHVibGljIENvbnNlcnZhdGlvbiBMYW5kPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNQdWJsaWNMYW5kXCIsYyxwLDEpLGMscCwwLDM3NzgsMzkxNCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcInB1YmxpY19sYW5kXCIsYyxwLDEpLGMscCwwLDM4MDcsMzg4NyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc1B1YmxpY0xhbmRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+PGVtPk5vbmUgUHJlc2VudDwvZW0+PC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCIgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPjxzdHJvbmc+Q29hc3RhbCBQcm90ZWN0aW9uIGFuZCBSZWNyZWF0aW9uIEFyZWFzIChDUEEgJiBDUkEpPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNDb2FzdGFsTGFuZFwiLGMscCwxKSxjLHAsMCw0Mjc1LDQ0MTMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJjb2FzdGFsX2xhbmRcIixjLHAsMSksYyxwLDAsNDMwNSw0Mzg1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzQ29hc3RhbExhbmRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+PGVtPk5vbmUgUHJlc2VudDwvZW0+PC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCIgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJmaXNoaW5nXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO2lmKF8ucyhfLmQoXCJza2V0Y2hDbGFzcy5kZWxldGVkXCIsYyxwLDEpLGMscCwwLDI0LDI3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtd2FyblxcXCIgc3R5bGU9XFxcIm1hcmdpbi1ib3R0b206MTBweDtcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgVGhpcyBza2V0Y2ggd2FzIGNyZWF0ZWQgdXNpbmcgdGhlIFxcXCJcIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiB0ZW1wbGF0ZSwgd2hpY2ggaXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIG5vIGxvbmdlciBhdmFpbGFibGUuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIGNvcHkgdGhpcyBza2V0Y2ggb3IgbWFrZSBuZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIHNrZXRjaGVzIG9mIHRoaXMgdHlwZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsMzA5LDMxODYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+VHJhd2wgRmlzaGluZyBJbnRlbnNpdHk8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgVGhlIGZvbGxvd2luZyB0YWJsZSBjb250YWlucyB0aGUgcGVyY2VudCBvZiB0aGUgdG90YWwgU0VNUEYgbG93IGludGVuc2l0eSBhbmQgaGlnaCBpbnRlbnNpdHkgdHJhd2wgZmlzaGluZyB0aGF0IG1heSBiZSBkaXNwbGFjZWQgYnkgdGhlIHNrZXRjaC4gPGk+SGlnaCBpbnRlbnNpdHkgaXMgZ3JlYXRlciB0aGFuIGFuIGF2ZXJhZ2Ugb2YgNSBldmVudHMgcGVyIGFubnVtLCBMb3cgaXMgNSBvciBsZXNzIGV2ZW50cyBwZXIgYW5udW0uPC9pPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0aD5Ta2V0Y2ggTmFtZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0aD4lIExvdyBJbnRlbnNpdHk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGg+JSBIaWdoIEludGVuc2l0eTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0aD5Ub3RhbCAlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwidHJhd2xcIixjLHAsMSksYyxwLDAsMTAwOSwxMTk5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTE9XXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkhJR0hcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiVE9UQUxcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+U2V0IE5ldCBGaXNoaW5nIEludGVuc2l0eTwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBUaGUgZm9sbG93aW5nIHRhYmxlIGNvbnRhaW5zIHRoZSBwZXJjZW50IG9mIHRoZSB0b3RhbCBTRU1QRiBsb3cgaW50ZW5zaXR5IGFuZCBoaWdoIGludGVuc2l0eSBzZXQgbmV0IGZpc2hpbmcgdGhhdCBtYXkgYmUgZGlzcGxhY2VkIGJ5IHRoZSBza2V0Y2guIDxpPkhpZ2ggaW50ZW5zaXR5IGlzIGdyZWF0ZXIgdGhhbiBhbiBhdmVyYWdlIG9mIDUgZXZlbnRzIHBlciBhbm51bSwgTG93IGlzIDUgb3IgbGVzcyBldmVudHMgcGVyIGFubnVtLjwvaT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGg+U2tldGNoIE5hbWU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGg+JSBMb3cgSW50ZW5zaXR5PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRoPiUgSGlnaCBJbnRlbnNpdHk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGg+VG90YWwgJTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNldG5ldFwiLGMscCwxKSxjLHAsMCwxOTY1LDIxNTUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJMT1dcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiSElHSFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJUT1RBTFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxoND5Mb25nIExpbmUgRmlzaGluZyBJbnRlbnNpdHk8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgVGhlIGZvbGxvd2luZyB0YWJsZSBjb250YWlucyB0aGUgcGVyY2VudCBvZiB0aGUgdG90YWwgU0VNUEYgbG93IGludGVuc2l0eSBhbmQgaGlnaCBpbnRlbnNpdHkgbG9uZyBsaW5lIGZpc2hpbmcgdGhhdCBtYXkgYmUgZGlzcGxhY2VkIGJ5IHRoZSBza2V0Y2guIDxpPkhpZ2ggaW50ZW5zaXR5IGlzIGdyZWF0ZXIgdGhhbiBhbiBhdmVyYWdlIG9mIDUgZXZlbnRzIHBlciBhbm51bSwgTG93IGlzIDUgb3IgbGVzcyBldmVudHMgcGVyIGFubnVtLjwvaT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGg+U2tldGNoIE5hbWU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGg+JSBMb3cgSW50ZW5zaXR5PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRoPiUgSGlnaCBJbnRlbnNpdHk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGg+VG90YWwgJTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImxvbmdsaW5lXCIsYyxwLDEpLGMscCwwLDI5MjgsMzExOCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJOQU1FXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkxPV1wiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJISUdIXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlRPVEFMXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtpZighXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7aWYoXy5zKF8uZihcImhhc0FueUZpc2hpbmdcIixjLHAsMSksYyxwLDAsMzIyOSw1NDE5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZihfLnMoXy5mKFwiaGFzRXhpc3RpbmdGaXNoaW5nXCIsYyxwLDEpLGMscCwwLDMyNTcsNDI5NyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxoND5FeGlzdGluZyBGaXNoZXJpZXMgTWFuYWdlbWVudDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxwPjxlbT5UaGUgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMzM4OCwzMzk4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJDb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiU2tldGNoXCIpO307Xy5iKFwiIGluY2x1ZGVzIHRoZSBmb2xsb3dpbmcgZXhpc3RpbmcgZmlzaGVyaWVzIHJlc3RyaWN0aW9ucy4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIEFsc28gc2hvd24gaXMgdGhlIGV4dGVudCB0aGF0IHRoZSBmaXNoZXJpZXMgcmVzdHJpY3Rpb25zIGFwcGx5IHRvIHRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzNjEwLDM2MTgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcInNrZXRjaGVzXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIFwiKTtpZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaFwiKTt9O18uYihcIiBhcyBhIHBlcmNlbnRhZ2Ugb2YgdG90YWwgc2tldGNoIGFyZWEuIEZvciBleGFtcGxlLCAxMDAlIG1lYW5zIG5vIGZpc2hpbmcgb2YgdGhhdCB0eXBlIGlzIGN1cnJlbnRseSBhbGxvd2VkIHdpdGhpbiB0aGUgc2tldGNoLjwvZW0+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5OYW1lPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRoPlBlcmNlbnQ8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiZXhpc3RpbmdfZmlzaGluZ19hcmVhc1wiLGMscCwxKSxjLHAsMCw0MDgyLDQyMTQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlBFUkNfQVJFQVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaGFzQ3VzdG9tYXJ5XCIsYyxwLDEpLGMscCwwLDQzNDIsNTQwMCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxoND5DdXN0b21hcnkgQXJlYXM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNFeGlzdGluZ0N1c3RvbWFyeVwiLGMscCwxKSxjLHAsMCw0NDUyLDQ4NzcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgPHA+IFRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw0NDg2LDQ0OTYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgaW5jbHVkZXMgdGhlIGZvbGxvd2luZyA8c3Ryb25nPmV4aXN0aW5nPC9zdHJvbmc+IEN1c3RvbWFyeSBBcmVhczo8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJleGlzdGluZ19jdXN0b21hcnlfZmlzaGluZ1wiLGMscCwxKSxjLHAsMCw0NzE4LDQ4MDMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJGRUFUX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaGFzUHJvcG9zZWRDdXN0b21hcnlcIixjLHAsMSksYyxwLDAsNDkzNCw1MzU5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgIDxwPiBUaGUgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNDk2OCw0OTc4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic2tldGNoXCIpO307Xy5iKFwiIGluY2x1ZGVzIHRoZSBmb2xsb3dpbmcgPHN0cm9uZz5wcm9wb3NlZDwvc3Ryb25nPiBDdXN0b21hcnkgQXJlYXM6PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwicHJvcG9zZWRfY3VzdG9tYXJ5X2Zpc2hpbmdcIixjLHAsMSksYyxwLDAsNTIwMCw1Mjg1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzQW55RmlzaGluZ1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5FeGlzdGluZyBvciBDdXN0b21hcnkgQXJlYXM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHA+Tm8gaW5mb3JtYXRpb24gb24gZXhpc3RpbmcgZmlzaGluZyBhcmVhcyBvciBjdXN0b21hcnkgdXNlIGlzIGF2YWlsYWJsZSBmb3IgdGhpcyBhcmVhLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTt9O3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm92ZXJ2aWV3XCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO2lmKF8ucyhfLmQoXCJza2V0Y2hDbGFzcy5kZWxldGVkXCIsYyxwLDEpLGMscCwwLDI0LDI3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtd2FyblxcXCIgc3R5bGU9XFxcIm1hcmdpbi1ib3R0b206MTBweDtcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgVGhpcyBza2V0Y2ggd2FzIGNyZWF0ZWQgdXNpbmcgdGhlIFxcXCJcIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiB0ZW1wbGF0ZSwgd2hpY2ggaXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIG5vIGxvbmdlciBhdmFpbGFibGUuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIGNvcHkgdGhpcyBza2V0Y2ggb3IgbWFrZSBuZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIHNrZXRjaGVzIG9mIHRoaXMgdHlwZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJhbnlBdHRyaWJ1dGVzXCIsYyxwLDEpLGMscCwwLDMxMyw1OTcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5cIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXy5ycChcImF0dHJpYnV0ZXMvYXR0cmlidXRlc1RhYmxlXCIsYyxwLFwiICAgIFwiKSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw0MzUsNTU3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgPHRyPjx0ZD5cIik7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDQ1OCw0NzIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIk51bWJlciBvZiBNUEFzXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsNDk2LDUxNCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiTnVtYmVyIG9mIFNrZXRjaGVzXCIpO30pO2MucG9wKCk7fV8uYihcIjwvdGQ+XCIpO18uYihfLnYoXy5mKFwibnVtU2tldGNoZXNcIixjLHAsMCkpKTtfLmIoXCI8dGQ+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDYzNCw0Mzk1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDY1MSw4OTQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+TnVtYmVyIG9mIFNrZXRjaGVzIGluIENvbGxlY3Rpb248L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBUaGlzIGNvbGxlY3Rpb24gY29udGFpbnMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJudW1Ta2V0Y2hlc1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBza2V0Y2hcIik7aWYoXy5zKF8uZihcInBsdXJhbFNrZXRjaGVzXCIsYyxwLDEpLGMscCwwLDg0Nyw4NDksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImVzXCIpO30pO2MucG9wKCk7fV8uYihcIi5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsOTIyLDQzODMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBzaXplXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+SGFiaXRhdC10eXBlcyBSZXByZXNlbnRlZCBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxhIGhyZWY9XFxcIiNcXFwiIGRhdGEtdG9nZ2xlLW5vZGU9XFxcIjUzYTBhMzFjZDNmNjA2NGQyYzE3NTgwY1xcXCIgZGF0YS12aXNpYmxlPVxcXCJmYWxzZVxcXCI+c2hvdyBsYXllcjwvYT48L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKCFfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICA8c3Ryb25nPk51bWJlciBvZiBIYWJpdGF0IENsYXNzZXM8L3N0cm9uZz48L2JyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIHN0eWxlPVxcXCJtYXJnaW4tdG9wOjBweDtcXFwiIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBUaGVyZSBhcmUgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJ0b3RhbF9oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IGhhYml0YXQgY2xhc3NlcyBpbiB0aGUgcGxhbm5pbmcgcmVnaW9uLCBhbmQgeW91ciBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxMzQ4LDEzNTgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgaW5jbHVkZXMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJuZXdfaGFic1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPi4gRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gdGhlIEhhYml0YXQgQ2xhc3NpZmljYXRpb24sIHNlZVwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgdGhlIDxhIGhyZWY9XFxcImh0dHA6Ly93d3cuZG9jLmdvdnQubnovRG9jdW1lbnRzL2NvbnNlcnZhdGlvbi9tYXJpbmUtYW5kLWNvYXN0YWwvbWFyaW5lLXByb3RlY3RlZC1hcmVhcy9tcGEtY2xhc3NpZmljYXRpb24tcHJvdGVjdGlvbi1zdGFuZGFyZC5wZGZcXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIE1hcmluZSBQcm90ZWN0ZWQgQXJlYXMgQ2xhc3NpZmljYXRpb24gYW5kIFByb3RlY3Rpb24gU3RhbmRhcmQ8L2E+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIik7fTtpZihfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDAsMTgyMCwyMDI0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgIDxkaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInJlcHJlc2VudGVkX2hhYnNfcGllXFxcIiBpZD1cXFwicmVwcmVzZW50ZWRfaGFic19waWVcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXByZXNlbnRlZF9oYWJzX3BpZV9sZWdlbmRcXFwiIGlkPVxcXCJyZXByZXNlbnRlZF9oYWJzX3BpZV9sZWdlbmRcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gc2l6ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGg0PkhhYml0YXQtdHlwZXMgUmVwbGljYXRlZFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTNhMGEzMWNkM2Y2MDY0ZDJjMTc1ODBjXFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5zaG93IGxheWVyPC9hPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoIV8ucyhfLmYoXCJkM0lzUHJlc2VudFwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgICAgPHN0cm9uZz5OdW1iZXIgb2YgSGFiaXRhdCBDbGFzc2VzPC9zdHJvbmc+PC9icj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwIHN0eWxlPVxcXCJtYXJnaW4tdG9wOjBweDtcXFwiIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIFRoZXJlIGFyZSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInRvdGFsX2hhYnNcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gaGFiaXRhdCBjbGFzc2VzIGluIHRoZSBwbGFubmluZyByZWdpb24sIGFuZCB5b3VyIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDI0ODksMjQ5OSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaFwiKTt9O18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIGluY2x1ZGVzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibmV3X2hhYnNcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4uIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHRoZSBIYWJpdGF0IENsYXNzaWZpY2F0aW9uLCBzZWVcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgdGhlIDxhIGhyZWY9XFxcImh0dHA6Ly93d3cuZG9jLmdvdnQubnovRG9jdW1lbnRzL2NvbnNlcnZhdGlvbi9tYXJpbmUtYW5kLWNvYXN0YWwvbWFyaW5lLXByb3RlY3RlZC1hcmVhcy9tcGEtY2xhc3NpZmljYXRpb24tcHJvdGVjdGlvbi1zdGFuZGFyZC5wZGZcXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgTWFyaW5lIFByb3RlY3RlZCBBcmVhcyBDbGFzc2lmaWNhdGlvbiBhbmQgUHJvdGVjdGlvbiBTdGFuZGFyZDwvYT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIpO307aWYoXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwwLDI5NjksMzE1OSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPGRpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxkaXYgY2xhc3M9XFxcInJlcGxpY2F0ZWRfaGFic19waWVcXFwiIGlkPVxcXCJyZXBsaWNhdGVkX2hhYnNfcGllXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxkaXYgY2xhc3M9XFxcInJlcGxpY2F0ZWRfaGFic19waWVfbGVnZW5kXFxcIiBpZD1cXFwicmVwbGljYXRlZF9oYWJzX3BpZV9sZWdlbmRcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxoND5Db25uZWN0aXZpdHk8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzaW5nbGVTa2V0Y2hcIixjLHAsMSksYyxwLDAsMzI3MSwzNDQwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8cCBzdHlsZT1cXFwiZm9udC1zdHlsZTppdGFsaWM7Y29sb3I6Z3JheTtcXFwiIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICBObyBjb25uZWN0aXZpdHkgaW5mb3JtYXRpb24gZm9yIGEgY29sbGVjdGlvbiB3aXRoIG9uZSBza2V0Y2guIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwic2luZ2xlU2tldGNoXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICA8ZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjb25uZWN0aXZpdHlfcGllXFxcIiBpZD1cXFwiY29ubmVjdGl2aXR5X3BpZVxcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNvbm5lY3Rpdml0eV9waWVfbGVnZW5kXFxcIiBpZD1cXFwiY29ubmVjdGl2aXR5X3BpZV9sZWdlbmRcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPk9mIHRoZSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInRvdGFsX21wYV9jb3VudFwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBNUEFzIGluIHRoZSBuZXR3b3JrLCA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcImNvbm5lY3RlZF9tcGFfY291bnRcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz5cIik7aWYoXy5zKF8uZihcInBsdXJhbF9jb25uZWN0ZWRfbXBhX2NvdW50XCIsYyxwLDEpLGMscCwwLDM4MjQsMzgyOCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiIGFyZVwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcInBsdXJhbF9jb25uZWN0ZWRfbXBhX2NvdW50XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiIGlzXCIpO307Xy5iKFwiIHdpdGhpbiB0aGUgY29ubmVjdGl2aXR5IHJhbmdlIG9mIDUwIC0gMTAwIGttLiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJjb25uX3ZhbHVlc1xcXCI+VGhlIG1pbmltdW0gZGlzdGFuY2UgYmV0d2VlbiB0aGUgTVBBcyBpcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm1pbl9kaXN0YW5jZVwiLGMscCwwKSkpO18uYihcIiBrbTwvc3Ryb25nPi48L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8c3BhbiBjbGFzcz1cXFwiY29ubl92YWx1ZXNcXFwiPlRoZSBtYXhpbXVtIGRpc3RhbmNlIGJldHdlZW4gdGhlIE1QQXMgaXMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJtYXhfZGlzdGFuY2VcIixjLHAsMCkpKTtfLmIoXCIga208L3N0cm9uZz4uPC9zcGFuPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNvbm5fdmFsdWVzXFxcIj5UaGUgYXZlcmFnZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBNUEFzIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibWVhbl9kaXN0YW5jZVwiLGMscCwwKSkpO18uYihcIiBrbTwvc3Ryb25nPi48L3NwYW4+XCIpO18uYihcIlxcblwiKTt9O18uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gc2l6ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5cIik7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDQ0NjYsNDQ3NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiTVBBIFNpemVzXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsNDQ5OSw0NTExLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJTa2V0Y2ggU2l6ZXNcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsNDU0NSw0ODcyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgT2YgdGhlIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwidG90YWxfbXBhX2NvdW50XCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IE1QQXMgaW4gdGhlIG5ldHdvcmssIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibXBhX2NvdW50XCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IG1lZXRcIik7aWYoIV8ucyhfLmYoXCJwbHVyYWxfbXBhX2NvdW50XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic1wiKTt9O18uYihcIiB0aGUgbWluaW11bSBzaXplIGRpbWVuc2lvbiBvZiA1a20uIFRoZSBhdmVyYWdlIG1pbmltdW0gZGltZW5zaW9uIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibXBhX2F2Z19zaXplX2d1aWRlbGluZVwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiB0aGUgMTAtMjBrbSBndWlkZWxpbmUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMCw0OTAxLDQ5NjgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxwPlRoZSBzaXplIG9mIHRoZSBza2V0Y2hlcyBpbiB0aGlzIGNvbGxlY3Rpb24gYXJlOjwvcD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPlwiKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsNTA3MSw1MDc5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJNUEEgTmFtZVwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDUxMDMsNTExNCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiU2tldGNoIE5hbWVcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+QXJlYSA8L2JyPihzcS4ga20uKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoxMDBweDtcXFwiPldpZHRoIChrbSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MTAwcHg7XFxcIj5Db2FzdGxpbmUgTGVuZ3RoIChrbSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwicHJvcF9zaXplc1wiLGMscCwxKSxjLHAsMCw1MzY2LDU1MzIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJTSVpFX1NRS01cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJNSU5fRElNXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiQ09BU1RcIixjLHAsMCkpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgVGhpcyBjb21iaW5lZCBhcmVhIHdpdGhpbiB0aGUgbmV0d29yayBhY2NvdW50cyBmb3IgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJwZXJjZW50XCIsYyxwLDApKSk7Xy5iKFwiJTwvc3Ryb25nPiBvZiB0aGUgU291dGgtRWFzdCBNYXJpbmUgYXJlYSwgYW5kIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwiY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50XCIsYyxwLDApKSk7Xy5iKFwiJTwvc3Ryb25nPiBvZiB0aGUgU291dGgtRWFzdCBjb2FzdGxpbmUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gc2l6ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5TaXplPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICBUaGlzIHNrZXRjaCBhcmVhIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwic2l6ZVwiLGMscCwwKSkpO18uYihcIiBzcXVhcmUga2lsb21ldGVyczwvc3Ryb25nPiwgYW5kIGl0IGluY2x1ZGVzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwicGVyY2VudFwiLGMscCwwKSkpO18uYihcIiU8L3N0cm9uZz4gb2YgdGhlIFNvdXRoLUVhc3QgUGxhbm5pbmcgUmVnaW9uLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgVGhpcyBza2V0Y2ggaW5jbHVkZXMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb2FzdGxpbmVfbGVuZ3RoXCIsYyxwLDApKSk7Xy5iKFwiIG1ldGVyczwvc3Ryb25nPiBvZiBjb2FzdGxpbmUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gc2l6ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+TnVtYmVyIG9mIEhhYml0YXRzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIFRoZSBcIik7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDYzMTksNjM3NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiIE1hcmluZSBQcm90ZWN0ZWQgQXJlYVwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDYzNTgsNjM1OSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwic1wiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDY0MDAsNjQ0MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwic2tldGNoXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNjQyMyw2NDI1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJlc1wiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31fLmIoXCIgaW5jbHVkZVwiKTtpZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNcIik7fTtfLmIoXCIgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJudW1faGFic1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBvZiB0aGUgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJ0b3RhbF9oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IGhhYml0YXRzIHdpdGhpbiB0aGUgU0VNIHJlZ2lvbi5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1widXNlc1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtpZihfLnMoXy5kKFwic2tldGNoQ2xhc3MuZGVsZXRlZFwiLGMscCwxKSxjLHAsMCwyNCwyNzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LXdhcm5cXFwiIHN0eWxlPVxcXCJtYXJnaW4tYm90dG9tOjEwcHg7XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFRoaXMgc2tldGNoIHdhcyBjcmVhdGVkIHVzaW5nIHRoZSBcXFwiXCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIlxcXCIgdGVtcGxhdGUsIHdoaWNoIGlzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBubyBsb25nZXIgYXZhaWxhYmxlLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byBjb3B5IHRoaXMgc2tldGNoIG9yIG1ha2UgbmV3XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBza2V0Y2hlcyBvZiB0aGlzIHR5cGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaGFzQ29hc3RhbFwiLGMscCwxKSxjLHAsMCwzMTAsMTA0NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PkV4aXN0aW5nIENvYXN0YWwgQ29uc2VudHMgPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTNkNzE5YTQ5MzgwMTc0YTc3NjZkZDg1XFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICBzaG93IGxheWVyPC9hPjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cD5cIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw1MjQsNTU0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJBIHNrZXRjaCB3aXRoaW4gdGhlIGNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJUaGUgc2tldGNoXCIpO307Xy5iKFwiIGNvbnRhaW5zIG9yIGlzIHdpdGhpbiAyMDBtIG9mIHNpdGVzIHdpdGggUmVzb3VyY2UgQ29uc2VudHMuPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjI1MHB4O1xcXCI+Q29uc2VudCBUeXBlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImNvYXN0YWxfY29uc2VudHNcIixjLHAsMSksYyxwLDAsODkzLDk3OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkZFQVRfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzVXNlc1wiLGMscCwxKSxjLHAsMCwxMDc0LDQxNDUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJoYXNSZWNVc2VzXCIsYyxwLDEpLGMscCwwLDEwOTIsMjM1NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PlJlY3JlYXRpb25hbCBVc2VzIDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPCEtLVwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNTbWFyb1wiLGMscCwxKSxjLHAsMCwxMjAwLDE2ODgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICA8cD48c3Ryb25nPlNwZWN0cnVtIG9mIE1BcmluZSBSZWNyZWF0aW9uYWwgT3Bwb3J0dW5pdHkgKFNNQVJPKTwvc3Ryb25nPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHA+XCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMTMzOSwxMzQ5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJDb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiU2tldGNoXCIpO307Xy5iKFwiIGluY2x1ZGVzIGFyZWEocykgaWRlbnRpZmllZCBhcyBoYXZpbmcgPHN0cm9uZz4gbWVkaXVtIG9yIGhpZ2ggPC9zdHJvbmc+IHJlY3JlYXRpb25hbCBvcHBvcnR1bml0eS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGVtPllvdSBjYW4gZmluZCBtb3JlIGluZm9ybWF0aW9uIG9uIFNNQVJPIGluIHRoZSBcXFwiZGF0YSBkZXNjcmlwdGlvblxcXCIgYnkgcmlnaHQgY2xpY2tpbmcgb24gdGhlIGxheWVyIG5hbWUuPC9lbT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvYnI+PC9icj5cIik7Xy5iKFwiXFxuXCIpO307fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgLS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5BY3Rpdml0eSBUeXBlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5OdW1iZXIgb2YgU2l0ZXM8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzUmVjVXNlc1wiLGMscCwxKSxjLHAsMCwxOTU5LDIxNDEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJyZWNfdXNlc1wiLGMscCwxKSxjLHAsMCwxOTg3LDIxMTUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkNPVU5UXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc1JlY1VzZXNcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkIGNvbHNwYW49Mj48ZW0+Tm9uZSBQcmVzZW50PC9lbT48L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNIZXJpdGFnZVwiLGMscCwxKSxjLHAsMCwyMzkxLDMzNDYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDQ+QXJjaGVvbG9naWNhbCBJbmZvcm1hdGlvbiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTU3OGYxNGNmZjM5MDU5YTU4MzY0NmM5XFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5zaG93IGxheWVyPC9hPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8cD5cIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwyNjUwLDI2ODAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkEgc2tldGNoIHdpdGhpbiB0aGUgY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlRoZSBza2V0Y2hcIik7fTtfLmIoXCIgY29udGFpbnMgb3IgaXMgd2l0aGluIDIwMG0gb2Ygc2l0ZXMgaWRlbnRpZmllZCBhcyBoYXZpbmcgc2lnbmlmaWNhbnQgaGVyaXRhZ2UgdmFsdWVzLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5IZXJpdGFnZSBUeXBlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGg+TnVtYmVyIG9mIFNpdGVzPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhlcml0YWdlXCIsYyxwLDEpLGMscCwwLDMxMTMsMzI1MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiQ09VTlRcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9O30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJoYXNJbmZyYXN0cnVjdHVyZVwiLGMscCwxKSxjLHAsMCwzMzg3LDQxMjIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDQ+SW5mcmFzdHJ1Y3R1cmU8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxwPlwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDM1MjMsMzU1MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiQSBza2V0Y2ggd2l0aGluIHRoZSBjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiVGhlIHNrZXRjaFwiKTt9O18uYihcIiBjb250YWlucyBvciBpcyB3aXRoaW4gMjAwbSBvZiBzaXRlcyB3aXRoIGV4aXN0aW5nIGluZnJhc3RydWN0dXJlLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5UeXBlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImluZnJhc3RydWN0dXJlXCIsYyxwLDEpLGMscCwwLDM5MjAsNDAyMSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc1VzZXNcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDQ+QWN0aXZpdGllcyBhbmQgVXNlczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cD5UaGUgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNDI4MSw0MjkxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic2tldGNoXCIpO307Xy5iKFwiICBkb2VzIDxzdHJvbmc+bm90PC9zdHJvbmc+IGluY2x1ZGUgYW55IDxzdHJvbmc+YWN0aXZpdGllcyBvciB1c2VzPC9zdHJvbmc+LjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNTZWFiaXJkc1wiLGMscCwxKSxjLHAsMCw0NDY4LDUxOTQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkJpcmRzIDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc1NlYWJpcmRBcmVhc1wiLGMscCwxKSxjLHAsMCw0NTU2LDQ4NDAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj48c3Ryb25nPkltcG9ydGFudCBTZWFiaXJkIEFyZWFzPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2VhYmlyZHNcIixjLHAsMSksYyxwLDAsNDcwMyw0NzgzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTmFtZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgIFwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNTZWFiaXJkQ29sb25pZXNcIixjLHAsMSksYyxwLDAsNDg5Myw1MTYzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPjxzdHJvbmc+U2VhYmlyZCBDb2xvbmllczwvc3Ryb25nPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2VhYmlyZF9jb2xvbmllc1wiLGMscCwxKSxjLHAsMCw1MDMzLDUxMDUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJoYXNNYXJpbmVTcGVjaWVzXCIsYyxwLDEpLGMscCwwLDUyMzIsNTY5NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+TWFyaW5lIE1hbW1hbHM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+U3BlY2llczwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJtYW1tYWxzXCIsYyxwLDEpLGMscCwwLDU0ODAsNTU2MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwic2VhbHNcIixjLHAsMSksYyxwLDAsNTU5NSw1NjQwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJOYW1lXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzTWFyaW5lU3BlY2llc1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5TcGVjaWVzIEluZm9ybWF0aW9uPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwPlRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw1ODQ4LDU4ODIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcInNrZXRjaGVzIHdpdGhpbiB0aGUgY29sbGVjdGlvbiBkbyBcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2ggZG9lc1wiKTt9O18uYihcIiA8c3Ryb25nPm5vdDwvc3Ryb25nPiBpbmNsdWRlIGFueSA8c3Ryb25nPmltcG9ydGFudCBtYXJpbmUgbWFtbWFsIGFyZWFzPC9zdHJvbmc+LjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTtyZXR1cm4gXy5mbCgpOzt9KTtcblxuaWYodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHRoaXNbXCJUZW1wbGF0ZXNcIl07XG59Il19
