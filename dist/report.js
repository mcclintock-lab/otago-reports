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
    hasProtected = (typeof protectedAreas !== "undefined" && protectedAreas !== null ? protectedAreas.length : void 0) > 0;
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
    this.setupHabitatSorting(hab_sizes);
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
    var Error, TOTAL_COASTLINE_LENGTH, TOTAL_HABS, attributes, bad_color, coastline_length, coastline_length_percent, conn_pie_values, connected_mpa_count, context, d3IsPresent, good_color, hab_sizes, isCollection, isGeneric, isMPA, max_distance, mean_distance, min_distance, mpa_avg_min_dim, mpa_avg_size_guideline, mpa_count, new_habs, new_size, not_replicated, not_represented, numSketches, num_habs, num_replicated_habs, num_represented_habs, percent, pluralSketches, plural_connected_mpa_count, plural_mpa_count, prop_sizes, ratio, replicated_habs_pie_values, represented_habs, represented_habs_pie_values, scid, size, total_habs, total_mpa_count, total_percent;
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
    isMPA = scid === MPA_ID || scid === MPA_COLLECTION_ID;
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
    if (isCollection) {
      good_color = "#b3cfa7";
      bad_color = "#e5cace";
      num_replicated_habs = 0;
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
      isGeneric: isGeneric
    };
    this.$el.html(this.template.render(context, partials));
    this.enableLayerTogglers();
    console.log(represented_habs_pie_values);
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
this["Templates"]["environment"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(!_.s(_.f("isGeneric",c,p,1),c,p,1,0,0,"")){_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Habitats Present in ");if(_.s(_.f("isCollection",c,p,1),c,p,0,396,406,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" <a href=\"#\" data-toggle-node=\"53a0a31cd3f6064d2c17580c\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);_.b("    <p>");_.b("\n" + i);_.b("      <i>");_.b("\n" + i);_.b("        Area (%) refers to the percentage of the habitat contained within the ");_.b("\n" + i);_.b("        ");if(_.s(_.f("isGeneric",c,p,1),c,p,0,680,690,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isGeneric",c,p,1),c,p,1,0,0,"")){_.b("network");};_.b("\n" + i);_.b("        ");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" as a proportion of the total area of habitat within the South-East Marine region. Only habitats that meet criteria for a viable habitat size are included as a ‘represented’ habitat.");_.b("\n" + i);_.b("      </i>");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <p class=\"in-report-header\">Habitat types</p>");_.b("\n" + i);_.b("    <table data-paging=\"10\">");_.b("\n" + i);_.b("      <thead>");_.b("\n" + i);_.b("        <tr>");_.b("\n" + i);_.b("          <th style=\"width:180px;\">Habitat</th>");_.b("\n" + i);_.b("          <th>Area (km<sup>2</sup>)</th>");_.b("\n" + i);_.b("          <th>Area (%)</th>");_.b("\n" + i);_.b("          <th>Represented</th>");_.b("\n" + i);_.b("          ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1273,1292,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<th>Replicated</th>");});c.pop();}_.b("\n" + i);_.b("        </tr>");_.b("\n" + i);_.b("      </thead>");_.b("\n" + i);_.b("      <tbody>");_.b("\n" + i);if(_.s(_.f("hasHabTypes",c,p,1),c,p,0,1377,1667,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hab_types",c,p,1),c,p,0,1402,1644,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("PERC",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("REPRESENT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1581,1600,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<td>");_.b(_.v(_.f("REPLIC",c,p,0)));_.b("</td>");});c.pop();}_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}});c.pop();}_.b("        ");_.b("\n" + i);if(!_.s(_.f("hasHabTypes",c,p,1),c,p,1,0,0,"")){_.b("          <tr>");_.b("\n" + i);_.b("            <td colspan=\"");if(_.s(_.f("isCollection",c,p,1),c,p,0,1775,1776,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("5");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("4");};_.b("\">");_.b("\n" + i);_.b("              <i>There are no habitat types.</i>");_.b("\n" + i);_.b("            </td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");};_.b("    ");_.b("\n" + i);_.b("      </tbody>");_.b("\n" + i);_.b("    </table>");_.b("\n" + i);_.b("    <p class=\"in-report-header\">Habitats of Significance</p>");_.b("\n" + i);_.b("    <table data-paging=\"10\">");_.b("\n" + i);_.b("      <thead>");_.b("\n" + i);_.b("        <tr>");_.b("\n" + i);_.b("          <th style=\"width:180px;\">Habitat</th>");_.b("\n" + i);_.b("          <th>Area (km<sup>2</sup>)</th>");_.b("\n" + i);_.b("          <th>Area (%)</th>");_.b("\n" + i);_.b("          <th>Represented</th>");_.b("\n" + i);_.b("          ");if(_.s(_.f("isCollection",c,p,1),c,p,0,2264,2283,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<th>Replicated</th>");});c.pop();}_.b("\n" + i);_.b("        </tr>");_.b("\n" + i);_.b("      </thead>");_.b("\n" + i);_.b("      <tbody>");_.b("\n" + i);if(_.s(_.f("hasSigHabs",c,p,1),c,p,0,2367,2669,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("sig_habs",c,p,1),c,p,0,2391,2647,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("PERC",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("REPRESENT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              ");if(_.s(_.f("isCollection",c,p,1),c,p,0,2582,2601,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<td>");_.b(_.v(_.f("REPLIC",c,p,0)));_.b("</td>");});c.pop();}_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasSigHabs",c,p,1),c,p,1,0,0,"")){_.b("        <tr>");_.b("\n" + i);_.b("            <td colspan=\"");if(_.s(_.f("isCollection",c,p,1),c,p,0,2764,2765,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("5");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("4");};_.b("\">");_.b("\n" + i);_.b("              <i>There are no habitats of significance.</i>");_.b("\n" + i);_.b("            </td>");_.b("\n" + i);_.b("        </tr>");_.b("\n");};_.b("      </tbody>");_.b("\n" + i);_.b("    </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");};_.b("\n" + i);if(_.s(_.f("showAdjacent",c,p,1),c,p,0,3006,4483,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Adjacent Terrestrial Information</h4>");_.b("\n" + i);_.b("        <p><em>MPA Guidelines: \"Consider adjacent terrestrial environment\" (areas shown below are within 100m of ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3228,3254,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("a sketch in the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b(" the sketch ");};_.b(")</em></p>");_.b("\n" + i);_.b("        <p class=\"large\"><strong>Protected Areas</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasProtected",c,p,1),c,p,0,3470,3626,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("protected_areas",c,p,1),c,p,0,3505,3593,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasProtected",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("        <p class=\"large\"><strong>Conservation Covenants</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasCovenants",c,p,1),c,p,0,3975,4274,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("qe2_covenants",c,p,1),c,p,0,4008,4096,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}if(_.s(_.f("napalis_covenants",c,p,1),c,p,0,4151,4239,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasCovenants",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n");return _.fl();;});
this["Templates"]["fishing"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("hasAnyFishing",c,p,1),c,p,0,316,2560,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hasExistingFishing",c,p,1),c,p,0,344,1384,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("      <h4>Existing Fisheries Management</h4>");_.b("\n" + i);_.b("          <p><em>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,475,485,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" includes the following existing fisheries restrictions. ");_.b("\n" + i);_.b("          Also shown is the extent that the fisheries restrictions apply to the ");if(_.s(_.f("isCollection",c,p,1),c,p,0,697,705,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketches");});c.pop();}_.b("\n" + i);_.b("          ");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" as a percentage of total sketch area. For example, 100% means no fishing of that type is currently allowed within the sketch.</em></p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <thead>");_.b("\n" + i);_.b("              <tr>");_.b("\n" + i);_.b("                <th style=\"width:250px;\">Name</th>");_.b("\n" + i);_.b("                <th>Percent</th>");_.b("\n" + i);_.b("              </tr>");_.b("\n" + i);_.b("            </thead>");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("existing_fishing_areas",c,p,1),c,p,0,1169,1301,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("PERC_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}if(_.s(_.f("hasCustomary",c,p,1),c,p,0,1429,2541,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Customary Areas</h4>");_.b("\n" + i);if(_.s(_.f("hasExistingCustomary",c,p,1),c,p,0,1545,1992,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <p> The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1581,1591,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes the following <strong>existing</strong> Customary Areas:</p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("existing_customary_fishing",c,p,1),c,p,0,1819,1912,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n");});c.pop();}if(_.s(_.f("hasProposedCustomary",c,p,1),c,p,0,2051,2498,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <p> The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,2087,2097,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes the following <strong>proposed</strong> Customary Areas:</p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("proposed_customary_fishing",c,p,1),c,p,0,2325,2418,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n");});c.pop();}_.b("      </div>");_.b("\n");});c.pop();}_.b("\n");});c.pop();}if(!_.s(_.f("hasAnyFishing",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Existing or Customary Areas</h4>");_.b("\n" + i);_.b("        <p>No information on existing fishing areas or customary use is available for this area.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,2824,4705,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Fishing Intensity</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        The following tables contains the percent of the total SEMPF low intensity and high intensity fishing that may be displaced by the sketch. <strong>High intensity</strong> is greater than an average of 5 events per annum, <strong>Low</strong> is 5 or less events per annum.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("      <p class=\"in-report-header\">Trawl Fishing Intensity</p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>Sketch Name</th>");_.b("\n" + i);_.b("            <th>% Low Intensity</th>");_.b("\n" + i);_.b("            <th>% High Intensity</th>");_.b("\n" + i);_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("trawl",c,p,1),c,p,0,3519,3650,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("\n" + i);_.b("      <p class=\"in-report-header\">Set Net Fishing Intensity</p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>Sketch Name</th>");_.b("\n" + i);_.b("              <th>% Low Intensity</th>");_.b("\n" + i);_.b("              <th>% High Intensity</th>");_.b("\n" + i);_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("setnet",c,p,1),c,p,0,4019,4162,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("      <p class=\"in-report-header\">Long Line Fishing Intensity</p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>Sketch Name</th>");_.b("\n" + i);_.b("            <th>% Low Intensity</th>");_.b("\n" + i);_.b("            <th>% High Intensity</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("longline",c,p,1),c,p,0,4518,4649,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["overview"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("anyAttributes",c,p,1),c,p,0,313,597,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection\">");_.b("\n" + i);_.b("    <h4>");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("</h4>");_.b("\n" + i);_.b(_.rp("attributes/attributesTable",c,p,"    "));if(_.s(_.f("isCollection",c,p,1),c,p,0,435,557,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <tr><td>");if(_.s(_.f("isMPA",c,p,1),c,p,0,458,472,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Number of MPAs");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,496,514,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Number of Sketches");});c.pop();}_.b("</td>");_.b(_.v(_.f("numSketches",c,p,0)));_.b("<td>");_.b("\n");});c.pop();}_.b("    </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,634,3242,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isGeneric",c,p,1),c,p,0,651,894,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection\">");_.b("\n" + i);_.b("      <h4>Number of Sketches in Collection</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This collection contains <strong>");_.b(_.v(_.f("numSketches",c,p,0)));_.b("</strong> sketch");if(_.s(_.f("pluralSketches",c,p,1),c,p,0,847,849,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("es");});c.pop();}_.b(".");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,922,3231,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    ");_.b("\n" + i);_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Habitats Represented in a fully Protected Area");_.b("\n" + i);_.b("        <a href=\"#\" data-toggle-node=\"53a0a31cd3f6064d2c17580c\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("      <strong>Number of Habitat Classes</strong></br>");_.b("\n" + i);_.b("      <p style=\"margin-top:0px;\" class=\"large\">");_.b("\n" + i);_.b("        There are <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> habitat classes in the planning region, and your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1368,1378,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("\n" + i);_.b("        includes <strong>");_.b(_.v(_.f("new_habs",c,p,0)));_.b("</strong>. For more information on the Habitat Classification, see");_.b("\n" + i);_.b("        the <a href=\"http://www.doc.govt.nz/Documents/conservation/marine-and-coastal/marine-protected-areas/mpa-classification-protection-standard.pdf\" target=\"_blank\">");_.b("\n" + i);_.b("        Marine Protected Areas Classification and Protection Standard</a>");_.b("\n" + i);_.b("      </p>");_.b("\n");};if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,1840,2044,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <div>");_.b("\n" + i);_.b("          <div class=\"represented_habs_pie\" id=\"represented_habs_pie\"></div>");_.b("\n" + i);_.b("          <div class=\"represented_habs_pie_legend\" id=\"represented_habs_pie_legend\"></div>");_.b("\n" + i);_.b("        </div>");_.b("\n");});c.pop();}_.b("    </div>");_.b("\n" + i);_.b("    ");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Habitats Represented in at Least 2 Prot. Areas");_.b("\n" + i);_.b("        <a href=\"#\" data-toggle-node=\"53a0a31cd3f6064d2c17580c\" data-visible=\"false\">show layer</a>");_.b("\n" + i);_.b("      </h4>");_.b("\n" + i);if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("        <strong>Number of Habitat Classes</strong></br>");_.b("\n" + i);_.b("        <p style=\"margin-top:0px;\" class=\"large\">");_.b("\n" + i);_.b("          There are <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> habitat classes in the planning region, and your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,2531,2541,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("\n" + i);_.b("          includes <strong>");_.b(_.v(_.f("new_habs",c,p,0)));_.b("</strong>. For more information on the Habitat Classification, see");_.b("\n" + i);_.b("          the <a href=\"http://www.doc.govt.nz/Documents/conservation/marine-and-coastal/marine-protected-areas/mpa-classification-protection-standard.pdf\" target=\"_blank\">");_.b("\n" + i);_.b("          Marine Protected Areas Classification and Protection Standard</a>");_.b("\n" + i);_.b("        </p>");_.b("\n");};if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,3011,3201,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div>");_.b("\n" + i);_.b("        <div class=\"replicated_habs_pie\" id=\"replicated_habs_pie\"></div>");_.b("\n" + i);_.b("        <div class=\"replicated_habs_pie_legend\" id=\"replicated_habs_pie_legend\"></div>");_.b("\n" + i);_.b("      </div>");_.b("\n");});c.pop();}_.b("    </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection size\">");_.b("\n" + i);_.b("  <h4>");if(_.s(_.f("isMPA",c,p,1),c,p,0,3312,3321,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("MPA Sizes");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,3345,3357,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Sketch Sizes");});c.pop();}_.b("</h4>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,3389,3752,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,3411,3732,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <p class=\"large\">");_.b("\n" + i);_.b("      Of the <strong>");_.b(_.v(_.f("total_mpa_count",c,p,0)));_.b("</strong> MPAs in the network, <strong>");_.b(_.v(_.f("mpa_count",c,p,0)));_.b("</strong> meet");if(!_.s(_.f("plural_mpa_count",c,p,1),c,p,1,0,0,"")){_.b("s");};_.b(" the minimum size dimension of 5km. The average minimum dimension is <strong>");_.b(_.v(_.f("mpa_avg_size_guideline",c,p,0)));_.b("</strong> the 10-20km guideline.");_.b("\n" + i);_.b("    </p>");_.b("\n");});c.pop();}});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,3779,3842,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <p>The size of the sketches in this collection are:</p>");_.b("\n");});c.pop();}_.b("    <table data-paging=\"10\">");_.b("\n" + i);_.b("      <thead>");_.b("\n" + i);_.b("        <tr>");_.b("\n" + i);_.b("          <th>");if(_.s(_.f("isMPA",c,p,1),c,p,0,3937,3945,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("MPA Name");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,3969,3980,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Sketch Name");});c.pop();}_.b("</th>");_.b("\n" + i);_.b("          <th>Area </br>(sq. km.)</th>");_.b("\n" + i);_.b("          <th style=\"width:100px;\">Width (km)</th>");_.b("\n" + i);_.b("          <th style=\"width:100px;\">Coastline Length (km)</th>");_.b("\n" + i);_.b("        </tr>");_.b("\n" + i);_.b("      </thead>");_.b("\n" + i);_.b("      <tbody>");_.b("\n" + i);if(_.s(_.f("prop_sizes",c,p,1),c,p,0,4218,4370,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <tr>");_.b("\n" + i);_.b("          <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          <td>");_.b(_.v(_.f("MIN_DIM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          <td>");_.b(_.v(_.f("COAST",c,p,0)));_.b("\n" + i);_.b("        </tr>");_.b("\n");});c.pop();}_.b("      </tbody>");_.b("\n" + i);_.b("    </table>");_.b("\n" + i);_.b("  <p class=\"large\">");_.b("\n" + i);_.b("    This combined area within the network accounts for <strong>");_.b(_.v(_.f("percent",c,p,0)));_.b("%</strong> of the South-East Marine area, and <strong>");_.b(_.v(_.f("coastline_length_percent",c,p,0)));_.b("%</strong> of the South-East coastline.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,4655,6018,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,4675,6000,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div class=\"reportSection\">");_.b("\n" + i);_.b("        <h4>Connectivity</h4>");_.b("\n" + i);if(_.s(_.f("singleSketch",c,p,1),c,p,0,4765,4942,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <p style=\"font-style:italic;color:gray;\" class=\"large\">");_.b("\n" + i);_.b("                No connectivity information for a collection with one sketch. ");_.b("\n" + i);_.b("              </p>");_.b("\n");});c.pop();}if(!_.s(_.f("singleSketch",c,p,1),c,p,1,0,0,"")){_.b("          <div>");_.b("\n" + i);_.b("            <div class=\"connectivity_pie\" id=\"connectivity_pie\"></div>");_.b("\n" + i);_.b("            <div class=\"connectivity_pie_legend\" id=\"connectivity_pie_legend\"></div>");_.b("\n" + i);_.b("          </div>");_.b("\n" + i);_.b("          <p class=\"large\">Of the <strong>");_.b(_.v(_.f("total_mpa_count",c,p,0)));_.b("</strong> MPAs in the network, <strong>");_.b(_.v(_.f("connected_mpa_count",c,p,0)));_.b("</strong>");if(_.s(_.f("plural_connected_mpa_count",c,p,1),c,p,0,5338,5342,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(" are");});c.pop();}if(!_.s(_.f("plural_connected_mpa_count",c,p,1),c,p,1,0,0,"")){_.b(" is");};_.b(" within the connectivity range of 50 - 100 km. ");_.b("\n" + i);_.b("          </p>");_.b("\n" + i);_.b("          <span class=\"conn_values\">The minimum distance between the MPAs is <strong>");_.b(_.v(_.f("min_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("          <span class=\"conn_values\">The maximum distance between the MPAs is <strong>");_.b(_.v(_.f("max_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("          <span class=\"conn_values\">The average distance between the MPAs is <strong>");_.b(_.v(_.f("mean_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("          <p><i>It is recommended that MPAs should be within 100km of each other.</i></p>");_.b("\n");};_.b("\n" + i);_.b("      </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){if(_.s(_.f("isGeneric",c,p,1),c,p,0,6064,6449,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Size</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This sketch area is <strong>");_.b(_.v(_.f("size",c,p,0)));_.b(" square kilometers</strong>, and it includes <strong>");_.b(_.v(_.f("percent",c,p,0)));_.b("%</strong> of the South-East Planning Region.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This sketch includes <strong>");_.b(_.v(_.f("coastline_length",c,p,0)));_.b(" meters</strong> of coastline.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}};_.b("\n" + i);_.b("<div class=\"reportSection size\">");_.b("\n" + i);_.b("  <h4>Number of Habitats</h4>");_.b("\n" + i);_.b("  <p class=\"large\">");_.b("\n" + i);_.b("    The ");if(_.s(_.f("isMPA",c,p,1),c,p,0,6584,6641,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(" Marine Protected Area");if(_.s(_.f("isCollection",c,p,1),c,p,0,6623,6624,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,6665,6707,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketch");if(_.s(_.f("isCollection",c,p,1),c,p,0,6688,6690,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("es");});c.pop();}});c.pop();}_.b(" include");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("s");};_.b(" <strong>");_.b(_.v(_.f("num_habs",c,p,0)));_.b("</strong> of the <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> classified habitats.");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["uses"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("hasCoastal",c,p,1),c,p,0,310,1045,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Existing Coastal Consents <a href=\"#\" data-toggle-node=\"53d719a49380174a7766dd85\" data-visible=\"false\">");_.b("\n" + i);_.b("      show layer</a></h4>");_.b("\n" + i);_.b("        <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,524,554,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites with Resource Consents.</p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:250px;\">Consent Type</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("coastal_consents",c,p,1),c,p,0,893,978,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("hasUses",c,p,1),c,p,0,1074,4145,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hasRecUses",c,p,1),c,p,0,1092,2356,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Recreational Uses </h4>");_.b("\n" + i);_.b("      <!--");_.b("\n" + i);if(_.s(_.f("hasSmaro",c,p,1),c,p,0,1200,1688,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("        <p><strong>Spectrum of MArine Recreational Opportunity (SMARO)</strong></p>");_.b("\n" + i);_.b("          <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,1339,1349,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" includes area(s) identified as having <strong> medium or high </strong> recreational opportunity.");_.b("\n" + i);_.b("          <em>You can find more information on SMARO in the \"data description\" by right clicking on the layer name.</em>");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("        </br></br>");_.b("\n");};});c.pop();}_.b("      -->");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:250px;\">Activity Type</th>");_.b("\n" + i);_.b("              <th>Number of Sites</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasRecUses",c,p,1),c,p,0,1959,2141,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("rec_uses",c,p,1),c,p,0,1987,2115,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("COUNT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasRecUses",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td colspan=2><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("hasHeritage",c,p,1),c,p,0,2391,3346,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Archeological Information ");_.b("\n" + i);_.b("          <a href=\"#\" data-toggle-node=\"5578f14cff39059a583646c9\" data-visible=\"false\">show layer</a>");_.b("\n" + i);_.b("        </h4>");_.b("\n" + i);_.b("            <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,2650,2680,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites identified as having significant heritage values.</p>");_.b("\n" + i);_.b("            <table data-paging=\"10\">");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th style=\"width:250px;\">Heritage Type</th>");_.b("\n" + i);_.b("                  <th>Number of Sites</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("              <tbody>");_.b("\n" + i);if(_.s(_.f("heritage",c,p,1),c,p,0,3113,3251,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <tr>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("COUNT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                </tr>");_.b("\n");});c.pop();}_.b("              </tbody>");_.b("\n" + i);_.b("            </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");};});c.pop();}if(_.s(_.f("hasInfrastructure",c,p,1),c,p,0,3387,4122,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Infrastructure</h4>");_.b("\n" + i);_.b("            <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,3523,3553,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites with existing infrastructure.</p>");_.b("\n" + i);_.b("            <table data-paging=\"10\">");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th style=\"width:250px;\">Type</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("              <tbody>");_.b("\n" + i);if(_.s(_.f("infrastructure",c,p,1),c,p,0,3920,4021,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <tr>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                </tr>");_.b("\n");});c.pop();}_.b("              </tbody>");_.b("\n" + i);_.b("            </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");};});c.pop();}});c.pop();}if(!_.s(_.f("hasUses",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Activities and Uses</h4>");_.b("\n" + i);_.b("        <p>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,4281,4291,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("  does <strong>not</strong> include any <strong>activities or uses</strong>.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};_.b("\n" + i);if(_.s(_.f("hasSeabirds",c,p,1),c,p,0,4468,5194,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Birds </h4>");_.b("\n" + i);if(_.s(_.f("hasSeabirdAreas",c,p,1),c,p,0,4556,4840,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <p class=\"large\"><strong>Important Seabird Areas</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("seabirds",c,p,1),c,p,0,4703,4783,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n");});c.pop();}_.b("    ");_.b("\n" + i);if(_.s(_.f("hasSeabirdColonies",c,p,1),c,p,0,4893,5163,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p class=\"large\"><strong>Seabird Colonies</strong></p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("seabird_colonies",c,p,1),c,p,0,5033,5105,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n");});c.pop();}_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("hasMarineSpecies",c,p,1),c,p,0,5232,5694,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Marine Mammals</h4>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>Species</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("mammals",c,p,1),c,p,0,5480,5560,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}if(_.s(_.f("seals",c,p,1),c,p,0,5595,5640,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(!_.s(_.f("hasMarineSpecies",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Species Information</h4>");_.b("\n" + i);_.b("        <p>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,5848,5882,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketches within the collection do ");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch does");};_.b(" <strong>not</strong> include any <strong>important marine mammal areas</strong>.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};return _.fl();;});

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = this["Templates"];
}
},{}]},{},[15])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9vdGFnby1yZXBvcnRzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvZW5hYmxlTGF5ZXJUb2dnbGVycy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvam9iSXRlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0UmVzdWx0cy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0VGFiLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvc2NyaXB0cy91dGlscy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9lbnZpcm9ubWVudC5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9maXNoaW5nLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9zY3JpcHRzL2lkcy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9vdmVydmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9yZXBvcnQuY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9vdGFnby1yZXBvcnRzL3NjcmlwdHMvdXNlcy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBLENBQU8sQ0FBVSxDQUFBLEdBQVgsQ0FBTixFQUFrQjtDQUNoQixLQUFBLDJFQUFBO0NBQUEsQ0FBQSxDQUFBO0NBQUEsQ0FDQSxDQUFBLEdBQVk7Q0FEWixDQUVBLENBQUEsR0FBTTtBQUNDLENBQVAsQ0FBQSxDQUFBLENBQUE7Q0FDRSxFQUFBLENBQUEsR0FBTyxxQkFBUDtDQUNBLFNBQUE7SUFMRjtDQUFBLENBTUEsQ0FBVyxDQUFBLElBQVgsYUFBVztDQUVYO0NBQUEsTUFBQSxvQ0FBQTt3QkFBQTtDQUNFLEVBQVcsQ0FBWCxHQUFXLENBQVg7Q0FBQSxFQUNTLENBQVQsRUFBQSxFQUFpQixLQUFSO0NBQ1Q7Q0FDRSxFQUFPLENBQVAsRUFBQSxVQUFPO0NBQVAsRUFD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QWQsS0FBQTtDQURBLENBRVksRUFBQyxDQUFLLENBQWxCLElBQUEsR0FBWTtDQUZaLENBR2UsQ0FBZ0MsQ0FBL0IsQ0FBSyxDQUFyQixPQUFBO0NBSEEsQ0FJTyxFQUFDLENBQVIsQ0FBQSxDQUFlO0NBSmYsQ0FLYSxJQUFiLEtBQUE7Q0FMQSxDQU1VLElBQVYsRUFBQSxVQU5BO0NBQUEsQ0FPVSxJQUFWLEVBQUE7Q0FQQSxDQVFZLElBQVosSUFBQTtDQVJBLENBU1UsSUFBVixFQUFBO0NBVEEsQ0FVYSxJQUFiLEtBQUE7Q0FWQSxDQVdrQixJQUFsQixVQUFBO0NBWEEsQ0FZWSxJQUFaLElBQUE7Q0FaQSxDQWFnQixJQUFoQixRQUFBO0NBYkEsQ0FjbUIsSUFBbkIsV0FBQTtDQWRBLENBZVMsSUFBVCxDQUFBO0NBZkEsQ0FnQmMsSUFBZCxNQUFBO0NBaEJBLENBbUJVLElBQVYsRUFBQTtDQW5CQSxDQW9Ca0IsSUFBbEIsVUFBQTtDQXBCQSxDQXFCYSxJQUFiLEtBQUE7Q0FyQkEsQ0FzQmlCLElBQWpCLFNBQUE7Q0F0QkEsQ0F1Qm9CLElBQXBCLFlBQUE7Q0F2QkEsQ0F5QlMsSUFBVCxDQUFBO0NBekJBLENBMEJZLElBQVosSUFBQTtDQTFCQSxDQTJCVyxJQUFYLEdBQUE7Q0EzQkEsQ0E0Qk8sR0FBUCxDQUFBO0NBNUJBLENBNkJVLElBQVYsRUFBQTtDQTdCQSxDQStCNkIsSUFBN0IscUJBQUE7Q0EvQkEsQ0FnQ2tCLElBQWxCLFVBQUE7Q0FyRkYsS0FBQTtDQUFBLENBdUZvQyxDQUFoQyxDQUFKLEVBQVUsQ0FBQSxDQUFTO0NBQ2xCLEdBQUEsT0FBRCxRQUFBO0NBckdGLEVBVVE7O0NBVlI7O0NBRm9COztBQTJHdEIsQ0F6SEEsRUF5SGlCLEdBQVgsQ0FBTjs7OztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLG51bGwsIm1vZHVsZS5leHBvcnRzID0gKGVsKSAtPlxuICAkZWwgPSAkIGVsXG4gIGFwcCA9IHdpbmRvdy5hcHBcbiAgdG9jID0gYXBwLmdldFRvYygpXG4gIHVubGVzcyB0b2NcbiAgICBjb25zb2xlLmxvZyAnTm8gdGFibGUgb2YgY29udGVudHMgZm91bmQnXG4gICAgcmV0dXJuXG4gIHRvZ2dsZXJzID0gJGVsLmZpbmQoJ2FbZGF0YS10b2dnbGUtbm9kZV0nKVxuICAjIFNldCBpbml0aWFsIHN0YXRlXG4gIGZvciB0b2dnbGVyIGluIHRvZ2dsZXJzLnRvQXJyYXkoKVxuICAgICR0b2dnbGVyID0gJCh0b2dnbGVyKVxuICAgIG5vZGVpZCA9ICR0b2dnbGVyLmRhdGEoJ3RvZ2dsZS1ub2RlJylcbiAgICB0cnlcbiAgICAgIHZpZXcgPSB0b2MuZ2V0Q2hpbGRWaWV3QnlJZCBub2RlaWRcbiAgICAgIG5vZGUgPSB2aWV3Lm1vZGVsXG4gICAgICAkdG9nZ2xlci5hdHRyICdkYXRhLXZpc2libGUnLCAhIW5vZGUuZ2V0KCd2aXNpYmxlJylcbiAgICAgICR0b2dnbGVyLmRhdGEgJ3RvY0l0ZW0nLCB2aWV3XG4gICAgY2F0Y2ggZVxuICAgICAgJHRvZ2dsZXIuYXR0ciAnZGF0YS1ub3QtZm91bmQnLCAndHJ1ZSdcblxuICB0b2dnbGVycy5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAkZWwgPSAkKGUudGFyZ2V0KVxuICAgIHZpZXcgPSAkZWwuZGF0YSgndG9jSXRlbScpXG4gICAgaWYgdmlld1xuICAgICAgdmlldy50b2dnbGVWaXNpYmlsaXR5KGUpXG4gICAgICAkZWwuYXR0ciAnZGF0YS12aXNpYmxlJywgISF2aWV3Lm1vZGVsLmdldCgndmlzaWJsZScpXG4gICAgZWxzZVxuICAgICAgYWxlcnQgXCJMYXllciBub3QgZm91bmQgaW4gdGhlIGN1cnJlbnQgVGFibGUgb2YgQ29udGVudHMuIFxcbkV4cGVjdGVkIG5vZGVpZCAjeyRlbC5kYXRhKCd0b2dnbGUtbm9kZScpfVwiXG4iLCJjbGFzcyBKb2JJdGVtIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuICBjbGFzc05hbWU6ICdyZXBvcnRSZXN1bHQnXG4gIGV2ZW50czoge31cbiAgYmluZGluZ3M6XG4gICAgXCJoNiBhXCI6XG4gICAgICBvYnNlcnZlOiBcInNlcnZpY2VOYW1lXCJcbiAgICAgIHVwZGF0ZVZpZXc6IHRydWVcbiAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgIG5hbWU6ICdocmVmJ1xuICAgICAgICBvYnNlcnZlOiAnc2VydmljZVVybCdcbiAgICAgIH1dXG4gICAgXCIuc3RhcnRlZEF0XCI6XG4gICAgICBvYnNlcnZlOiBbXCJzdGFydGVkQXRcIiwgXCJzdGF0dXNcIl1cbiAgICAgIHZpc2libGU6ICgpIC0+XG4gICAgICAgIEBtb2RlbC5nZXQoJ3N0YXR1cycpIG5vdCBpbiBbJ2NvbXBsZXRlJywgJ2Vycm9yJ11cbiAgICAgIHVwZGF0ZVZpZXc6IHRydWVcbiAgICAgIG9uR2V0OiAoKSAtPlxuICAgICAgICBpZiBAbW9kZWwuZ2V0KCdzdGFydGVkQXQnKVxuICAgICAgICAgIHJldHVybiBcIlN0YXJ0ZWQgXCIgKyBtb21lbnQoQG1vZGVsLmdldCgnc3RhcnRlZEF0JykpLmZyb21Ob3coKSArIFwiLiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgXCJcIlxuICAgIFwiLnN0YXR1c1wiOiAgICAgIFxuICAgICAgb2JzZXJ2ZTogXCJzdGF0dXNcIlxuICAgICAgb25HZXQ6IChzKSAtPlxuICAgICAgICBzd2l0Y2ggc1xuICAgICAgICAgIHdoZW4gJ3BlbmRpbmcnXG4gICAgICAgICAgICBcIndhaXRpbmcgaW4gbGluZVwiXG4gICAgICAgICAgd2hlbiAncnVubmluZydcbiAgICAgICAgICAgIFwicnVubmluZyBhbmFseXRpY2FsIHNlcnZpY2VcIlxuICAgICAgICAgIHdoZW4gJ2NvbXBsZXRlJ1xuICAgICAgICAgICAgXCJjb21wbGV0ZWRcIlxuICAgICAgICAgIHdoZW4gJ2Vycm9yJ1xuICAgICAgICAgICAgXCJhbiBlcnJvciBvY2N1cnJlZFwiXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgc1xuICAgIFwiLnF1ZXVlTGVuZ3RoXCI6IFxuICAgICAgb2JzZXJ2ZTogXCJxdWV1ZUxlbmd0aFwiXG4gICAgICBvbkdldDogKHYpIC0+XG4gICAgICAgIHMgPSBcIldhaXRpbmcgYmVoaW5kICN7dn0gam9iXCJcbiAgICAgICAgaWYgdi5sZW5ndGggPiAxXG4gICAgICAgICAgcyArPSAncydcbiAgICAgICAgcmV0dXJuIHMgKyBcIi4gXCJcbiAgICAgIHZpc2libGU6ICh2KSAtPlxuICAgICAgICB2PyBhbmQgcGFyc2VJbnQodikgPiAwXG4gICAgXCIuZXJyb3JzXCI6XG4gICAgICBvYnNlcnZlOiAnZXJyb3InXG4gICAgICB1cGRhdGVWaWV3OiB0cnVlXG4gICAgICB2aXNpYmxlOiAodikgLT5cbiAgICAgICAgdj8ubGVuZ3RoID4gMlxuICAgICAgb25HZXQ6ICh2KSAtPlxuICAgICAgICBpZiB2P1xuICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHYsIG51bGwsICcgICcpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBudWxsXG5cbiAgY29uc3RydWN0b3I6IChAbW9kZWwpIC0+XG4gICAgc3VwZXIoKVxuXG4gIHJlbmRlcjogKCkgLT5cbiAgICBAJGVsLmh0bWwgXCJcIlwiXG4gICAgICA8aDY+PGEgaHJlZj1cIiNcIiB0YXJnZXQ9XCJfYmxhbmtcIj48L2E+PHNwYW4gY2xhc3M9XCJzdGF0dXNcIj48L3NwYW4+PC9oNj5cbiAgICAgIDxkaXY+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwic3RhcnRlZEF0XCI+PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cInF1ZXVlTGVuZ3RoXCI+PC9zcGFuPlxuICAgICAgICA8cHJlIGNsYXNzPVwiZXJyb3JzXCI+PC9wcmU+XG4gICAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgICBAc3RpY2tpdCgpXG5cbm1vZHVsZS5leHBvcnRzID0gSm9iSXRlbSIsImNsYXNzIFJlcG9ydFJlc3VsdHMgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cbiAgZGVmYXVsdFBvbGxpbmdJbnRlcnZhbDogMzAwMFxuXG4gIGNvbnN0cnVjdG9yOiAoQHNrZXRjaCwgQGRlcHMpIC0+XG4gICAgQHVybCA9IHVybCA9IFwiL3JlcG9ydHMvI3tAc2tldGNoLmlkfS8je0BkZXBzLmpvaW4oJywnKX1cIlxuICAgIHN1cGVyKClcblxuICBwb2xsOiAoKSA9PlxuICAgIEBmZXRjaCB7XG4gICAgICBzdWNjZXNzOiAoKSA9PlxuICAgICAgICBAdHJpZ2dlciAnam9icydcbiAgICAgICAgZm9yIHJlc3VsdCBpbiBAbW9kZWxzXG4gICAgICAgICAgaWYgcmVzdWx0LmdldCgnc3RhdHVzJykgbm90IGluIFsnY29tcGxldGUnLCAnZXJyb3InXVxuICAgICAgICAgICAgdW5sZXNzIEBpbnRlcnZhbFxuICAgICAgICAgICAgICBAaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCBAcG9sbCwgQGRlZmF1bHRQb2xsaW5nSW50ZXJ2YWxcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIGNvbnNvbGUubG9nIEBtb2RlbHNbMF0uZ2V0KCdwYXlsb2FkU2l6ZUJ5dGVzJylcbiAgICAgICAgICBwYXlsb2FkU2l6ZSA9IE1hdGgucm91bmQoKChAbW9kZWxzWzBdLmdldCgncGF5bG9hZFNpemVCeXRlcycpIG9yIDApIC8gMTAyNCkgKiAxMDApIC8gMTAwXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJGZWF0dXJlU2V0IHNlbnQgdG8gR1Agd2VpZ2hlZCBpbiBhdCAje3BheWxvYWRTaXplfWtiXCJcbiAgICAgICAgIyBhbGwgY29tcGxldGUgdGhlblxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAaW50ZXJ2YWwpIGlmIEBpbnRlcnZhbFxuICAgICAgICBpZiBwcm9ibGVtID0gXy5maW5kKEBtb2RlbHMsIChyKSAtPiByLmdldCgnZXJyb3InKT8pXG4gICAgICAgICAgQHRyaWdnZXIgJ2Vycm9yJywgXCJQcm9ibGVtIHdpdGggI3twcm9ibGVtLmdldCgnc2VydmljZU5hbWUnKX0gam9iXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEB0cmlnZ2VyICdmaW5pc2hlZCdcbiAgICAgIGVycm9yOiAoZSwgcmVzLCBhLCBiKSA9PlxuICAgICAgICB1bmxlc3MgcmVzLnN0YXR1cyBpcyAwXG4gICAgICAgICAgaWYgcmVzLnJlc3BvbnNlVGV4dD8ubGVuZ3RoXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAganNvbiA9IEpTT04ucGFyc2UocmVzLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgICMgZG8gbm90aGluZ1xuICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBpbnRlcnZhbCkgaWYgQGludGVydmFsXG4gICAgICAgICAgQHRyaWdnZXIgJ2Vycm9yJywganNvbj8uZXJyb3I/Lm1lc3NhZ2Ugb3JcbiAgICAgICAgICAgICdQcm9ibGVtIGNvbnRhY3RpbmcgdGhlIFNlYVNrZXRjaCBzZXJ2ZXInXG4gICAgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlcG9ydFJlc3VsdHNcbiIsImVuYWJsZUxheWVyVG9nZ2xlcnMgPSByZXF1aXJlICcuL2VuYWJsZUxheWVyVG9nZ2xlcnMuY29mZmVlJ1xucm91bmQgPSByZXF1aXJlKCcuL3V0aWxzLmNvZmZlZScpLnJvdW5kXG5SZXBvcnRSZXN1bHRzID0gcmVxdWlyZSAnLi9yZXBvcnRSZXN1bHRzLmNvZmZlZSdcbnQgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJylcbnRlbXBsYXRlcyA9XG4gIHJlcG9ydExvYWRpbmc6IHRbJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9yZXBvcnRMb2FkaW5nJ11cbkpvYkl0ZW0gPSByZXF1aXJlICcuL2pvYkl0ZW0uY29mZmVlJ1xuQ29sbGVjdGlvblZpZXcgPSByZXF1aXJlKCd2aWV3cy9jb2xsZWN0aW9uVmlldycpXG5cbmNsYXNzIFJlY29yZFNldFxuXG4gIGNvbnN0cnVjdG9yOiAoQGRhdGEsIEB0YWIsIEBza2V0Y2hDbGFzc0lkKSAtPlxuXG4gIHRvQXJyYXk6ICgpIC0+XG4gICAgaWYgQHNrZXRjaENsYXNzSWRcbiAgICAgIGRhdGEgPSBfLmZpbmQgQGRhdGEudmFsdWUsICh2KSA9PlxuICAgICAgICB2LmZlYXR1cmVzP1swXT8uYXR0cmlidXRlcz9bJ1NDX0lEJ10gaXMgQHNrZXRjaENsYXNzSWRcbiAgICAgIHVubGVzcyBkYXRhXG4gICAgICAgIHRocm93IFwiQ291bGQgbm90IGZpbmQgZGF0YSBmb3Igc2tldGNoQ2xhc3MgI3tAc2tldGNoQ2xhc3NJZH1cIlxuICAgIGVsc2VcbiAgICAgIGlmIF8uaXNBcnJheSBAZGF0YS52YWx1ZVxuICAgICAgICBkYXRhID0gQGRhdGEudmFsdWVbMF1cbiAgICAgIGVsc2VcbiAgICAgICAgZGF0YSA9IEBkYXRhLnZhbHVlXG4gICAgXy5tYXAgZGF0YS5mZWF0dXJlcywgKGZlYXR1cmUpIC0+XG4gICAgICBmZWF0dXJlLmF0dHJpYnV0ZXNcblxuICByYXc6IChhdHRyKSAtPlxuICAgIGF0dHJzID0gXy5tYXAgQHRvQXJyYXkoKSwgKHJvdykgLT5cbiAgICAgIHJvd1thdHRyXVxuICAgIGF0dHJzID0gXy5maWx0ZXIgYXR0cnMsIChhdHRyKSAtPiBhdHRyICE9IHVuZGVmaW5lZFxuICAgIGlmIGF0dHJzLmxlbmd0aCBpcyAwXG4gICAgICBjb25zb2xlLmxvZyBAZGF0YVxuICAgICAgQHRhYi5yZXBvcnRFcnJvciBcIkNvdWxkIG5vdCBnZXQgYXR0cmlidXRlICN7YXR0cn0gZnJvbSByZXN1bHRzXCJcbiAgICAgIHRocm93IFwiQ291bGQgbm90IGdldCBhdHRyaWJ1dGUgI3thdHRyfVwiXG4gICAgZWxzZSBpZiBhdHRycy5sZW5ndGggaXMgMVxuICAgICAgcmV0dXJuIGF0dHJzWzBdXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGF0dHJzXG5cbiAgaW50OiAoYXR0cikgLT5cbiAgICByYXcgPSBAcmF3KGF0dHIpXG4gICAgaWYgXy5pc0FycmF5KHJhdylcbiAgICAgIF8ubWFwIHJhdywgcGFyc2VJbnRcbiAgICBlbHNlXG4gICAgICBwYXJzZUludChyYXcpXG5cbiAgZmxvYXQ6IChhdHRyLCBkZWNpbWFsUGxhY2VzPTIpIC0+XG4gICAgcmF3ID0gQHJhdyhhdHRyKVxuICAgIGlmIF8uaXNBcnJheShyYXcpXG4gICAgICBfLm1hcCByYXcsICh2YWwpIC0+IHJvdW5kKHZhbCwgZGVjaW1hbFBsYWNlcylcbiAgICBlbHNlXG4gICAgICByb3VuZChyYXcsIGRlY2ltYWxQbGFjZXMpXG5cbiAgYm9vbDogKGF0dHIpIC0+XG4gICAgcmF3ID0gQHJhdyhhdHRyKVxuICAgIGlmIF8uaXNBcnJheShyYXcpXG4gICAgICBfLm1hcCByYXcsICh2YWwpIC0+IHZhbC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgaXMgJ3RydWUnXG4gICAgZWxzZVxuICAgICAgcmF3LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSBpcyAndHJ1ZSdcblxuY2xhc3MgUmVwb3J0VGFiIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuICBuYW1lOiAnSW5mb3JtYXRpb24nXG4gIGRlcGVuZGVuY2llczogW11cblxuICBpbml0aWFsaXplOiAoQG1vZGVsLCBAb3B0aW9ucykgLT5cbiAgICAjIFdpbGwgYmUgaW5pdGlhbGl6ZWQgYnkgU2VhU2tldGNoIHdpdGggdGhlIGZvbGxvd2luZyBhcmd1bWVudHM6XG4gICAgIyAgICogbW9kZWwgLSBUaGUgc2tldGNoIGJlaW5nIHJlcG9ydGVkIG9uXG4gICAgIyAgICogb3B0aW9uc1xuICAgICMgICAgIC0gLnBhcmVudCAtIHRoZSBwYXJlbnQgcmVwb3J0IHZpZXdcbiAgICAjICAgICAgICBjYWxsIEBvcHRpb25zLnBhcmVudC5kZXN0cm95KCkgdG8gY2xvc2UgdGhlIHdob2xlIHJlcG9ydCB3aW5kb3dcbiAgICBAYXBwID0gd2luZG93LmFwcFxuICAgIF8uZXh0ZW5kIEAsIEBvcHRpb25zXG4gICAgQHJlcG9ydFJlc3VsdHMgPSBuZXcgUmVwb3J0UmVzdWx0cyhAbW9kZWwsIEBkZXBlbmRlbmNpZXMpXG4gICAgQGxpc3RlblRvT25jZSBAcmVwb3J0UmVzdWx0cywgJ2Vycm9yJywgQHJlcG9ydEVycm9yXG4gICAgQGxpc3RlblRvT25jZSBAcmVwb3J0UmVzdWx0cywgJ2pvYnMnLCBAcmVuZGVySm9iRGV0YWlsc1xuICAgIEBsaXN0ZW5Ub09uY2UgQHJlcG9ydFJlc3VsdHMsICdqb2JzJywgQHJlcG9ydEpvYnNcbiAgICBAbGlzdGVuVG8gQHJlcG9ydFJlc3VsdHMsICdmaW5pc2hlZCcsIF8uYmluZCBAcmVuZGVyLCBAXG4gICAgQGxpc3RlblRvT25jZSBAcmVwb3J0UmVzdWx0cywgJ3JlcXVlc3QnLCBAcmVwb3J0UmVxdWVzdGVkXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgIHRocm93ICdyZW5kZXIgbWV0aG9kIG11c3QgYmUgb3ZlcmlkZGVuJ1xuXG4gIHNob3c6ICgpIC0+XG4gICAgQCRlbC5zaG93KClcbiAgICBAdmlzaWJsZSA9IHRydWVcbiAgICBpZiBAZGVwZW5kZW5jaWVzPy5sZW5ndGggYW5kICFAcmVwb3J0UmVzdWx0cy5tb2RlbHMubGVuZ3RoXG4gICAgICBAcmVwb3J0UmVzdWx0cy5wb2xsKClcbiAgICBlbHNlIGlmICFAZGVwZW5kZW5jaWVzPy5sZW5ndGhcbiAgICAgIEByZW5kZXIoKVxuICAgICAgQCQoJ1tkYXRhLWF0dHJpYnV0ZS10eXBlPVVybEZpZWxkXSAudmFsdWUsIFtkYXRhLWF0dHJpYnV0ZS10eXBlPVVwbG9hZEZpZWxkXSAudmFsdWUnKS5lYWNoICgpIC0+XG4gICAgICAgIHRleHQgPSAkKEApLnRleHQoKVxuICAgICAgICBodG1sID0gW11cbiAgICAgICAgZm9yIHVybCBpbiB0ZXh0LnNwbGl0KCcsJylcbiAgICAgICAgICBpZiB1cmwubGVuZ3RoXG4gICAgICAgICAgICBuYW1lID0gXy5sYXN0KHVybC5zcGxpdCgnLycpKVxuICAgICAgICAgICAgaHRtbC5wdXNoIFwiXCJcIjxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj4je25hbWV9PC9hPlwiXCJcIlxuICAgICAgICAkKEApLmh0bWwgaHRtbC5qb2luKCcsICcpXG5cblxuICBoaWRlOiAoKSAtPlxuICAgIEAkZWwuaGlkZSgpXG4gICAgQHZpc2libGUgPSBmYWxzZVxuXG4gIHJlbW92ZTogKCkgPT5cbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCBAZXRhSW50ZXJ2YWxcbiAgICBAc3RvcExpc3RlbmluZygpXG4gICAgc3VwZXIoKVxuXG4gIHJlcG9ydFJlcXVlc3RlZDogKCkgPT5cbiAgICBAJGVsLmh0bWwgdGVtcGxhdGVzLnJlcG9ydExvYWRpbmcucmVuZGVyKHt9KVxuXG4gIHJlcG9ydEVycm9yOiAobXNnLCBjYW5jZWxsZWRSZXF1ZXN0KSA9PlxuICAgIHVubGVzcyBjYW5jZWxsZWRSZXF1ZXN0XG4gICAgICBpZiBtc2cgaXMgJ0pPQl9FUlJPUidcbiAgICAgICAgQHNob3dFcnJvciAnRXJyb3Igd2l0aCBzcGVjaWZpYyBqb2InXG4gICAgICBlbHNlXG4gICAgICAgIEBzaG93RXJyb3IgbXNnXG5cbiAgc2hvd0Vycm9yOiAobXNnKSA9PlxuICAgIEAkKCcucHJvZ3Jlc3MnKS5yZW1vdmUoKVxuICAgIEAkKCdwLmVycm9yJykucmVtb3ZlKClcbiAgICBAJCgnaDQnKS50ZXh0KFwiQW4gRXJyb3IgT2NjdXJyZWRcIikuYWZ0ZXIgXCJcIlwiXG4gICAgICA8cCBjbGFzcz1cImVycm9yXCIgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj4je21zZ308L3A+XG4gICAgXCJcIlwiXG5cbiAgcmVwb3J0Sm9iczogKCkgPT5cbiAgICB1bmxlc3MgQG1heEV0YVxuICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykud2lkdGgoJzEwMCUnKVxuICAgIEAkKCdoNCcpLnRleHQgXCJBbmFseXppbmcgRGVzaWduc1wiXG5cbiAgc3RhcnRFdGFDb3VudGRvd246ICgpID0+XG4gICAgaWYgQG1heEV0YVxuICAgICAgXy5kZWxheSAoKSA9PlxuICAgICAgICBAcmVwb3J0UmVzdWx0cy5wb2xsKClcbiAgICAgICwgKEBtYXhFdGEgKyAxKSAqIDEwMDBcbiAgICAgIF8uZGVsYXkgKCkgPT5cbiAgICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykuY3NzICd0cmFuc2l0aW9uLXRpbWluZy1mdW5jdGlvbicsICdsaW5lYXInXG4gICAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLmNzcyAndHJhbnNpdGlvbi1kdXJhdGlvbicsIFwiI3tAbWF4RXRhICsgMX1zXCJcbiAgICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykud2lkdGgoJzEwMCUnKVxuICAgICAgLCA1MDBcblxuICByZW5kZXJKb2JEZXRhaWxzOiAoKSA9PlxuICAgIG1heEV0YSA9IG51bGxcbiAgICBmb3Igam9iIGluIEByZXBvcnRSZXN1bHRzLm1vZGVsc1xuICAgICAgaWYgam9iLmdldCgnZXRhU2Vjb25kcycpXG4gICAgICAgIGlmICFtYXhFdGEgb3Igam9iLmdldCgnZXRhU2Vjb25kcycpID4gbWF4RXRhXG4gICAgICAgICAgbWF4RXRhID0gam9iLmdldCgnZXRhU2Vjb25kcycpXG4gICAgaWYgbWF4RXRhXG4gICAgICBAbWF4RXRhID0gbWF4RXRhXG4gICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS53aWR0aCgnNSUnKVxuICAgICAgQHN0YXJ0RXRhQ291bnRkb3duKClcblxuICAgIEAkKCdbcmVsPWRldGFpbHNdJykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJylcbiAgICBAJCgnW3JlbD1kZXRhaWxzXScpLmNsaWNrIChlKSA9PlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBAJCgnW3JlbD1kZXRhaWxzXScpLmhpZGUoKVxuICAgICAgQCQoJy5kZXRhaWxzJykuc2hvdygpXG4gICAgZm9yIGpvYiBpbiBAcmVwb3J0UmVzdWx0cy5tb2RlbHNcbiAgICAgIGl0ZW0gPSBuZXcgSm9iSXRlbShqb2IpXG4gICAgICBpdGVtLnJlbmRlcigpXG4gICAgICBAJCgnLmRldGFpbHMnKS5hcHBlbmQgaXRlbS5lbFxuXG4gIGdldFJlc3VsdDogKGlkKSAtPlxuICAgIHJlc3VsdHMgPSBAZ2V0UmVzdWx0cygpXG4gICAgcmVzdWx0ID0gXy5maW5kIHJlc3VsdHMsIChyKSAtPiByLnBhcmFtTmFtZSBpcyBpZFxuICAgIHVubGVzcyByZXN1bHQ/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHJlc3VsdCB3aXRoIGlkICcgKyBpZClcbiAgICByZXN1bHQudmFsdWVcblxuICBnZXRGaXJzdFJlc3VsdDogKHBhcmFtLCBpZCkgLT5cbiAgICByZXN1bHQgPSBAZ2V0UmVzdWx0KHBhcmFtKVxuICAgIHRyeVxuICAgICAgcmV0dXJuIHJlc3VsdFswXS5mZWF0dXJlc1swXS5hdHRyaWJ1dGVzW2lkXVxuICAgIGNhdGNoIGVcbiAgICAgIHRocm93IFwiRXJyb3IgZmluZGluZyAje3BhcmFtfToje2lkfSBpbiBncCByZXN1bHRzXCJcblxuICBnZXRSZXN1bHRzOiAoKSAtPlxuICAgIHJlc3VsdHMgPSBAcmVwb3J0UmVzdWx0cy5tYXAoKHJlc3VsdCkgLT4gcmVzdWx0LmdldCgncmVzdWx0JykucmVzdWx0cylcbiAgICB1bmxlc3MgcmVzdWx0cz8ubGVuZ3RoXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGdwIHJlc3VsdHMnKVxuICAgIF8uZmlsdGVyIHJlc3VsdHMsIChyZXN1bHQpIC0+XG4gICAgICByZXN1bHQucGFyYW1OYW1lIG5vdCBpbiBbJ1Jlc3VsdENvZGUnLCAnUmVzdWx0TXNnJ11cblxuICByZWNvcmRTZXQ6IChkZXBlbmRlbmN5LCBwYXJhbU5hbWUsIHNrZXRjaENsYXNzSWQ9ZmFsc2UpIC0+XG4gICAgdW5sZXNzIGRlcGVuZGVuY3kgaW4gQGRlcGVuZGVuY2llc1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVW5rbm93biBkZXBlbmRlbmN5ICN7ZGVwZW5kZW5jeX1cIlxuICAgIGRlcCA9IEByZXBvcnRSZXN1bHRzLmZpbmQgKHIpIC0+IHIuZ2V0KCdzZXJ2aWNlTmFtZScpIGlzIGRlcGVuZGVuY3lcbiAgICB1bmxlc3MgZGVwXG4gICAgICBjb25zb2xlLmxvZyBAcmVwb3J0UmVzdWx0cy5tb2RlbHNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIkNvdWxkIG5vdCBmaW5kIHJlc3VsdHMgZm9yICN7ZGVwZW5kZW5jeX0uXCJcbiAgICBwYXJhbSA9IF8uZmluZCBkZXAuZ2V0KCdyZXN1bHQnKS5yZXN1bHRzLCAocGFyYW0pIC0+XG4gICAgICBwYXJhbS5wYXJhbU5hbWUgaXMgcGFyYW1OYW1lXG4gICAgdW5sZXNzIHBhcmFtXG4gICAgICBjb25zb2xlLmxvZyBkZXAuZ2V0KCdkYXRhJykucmVzdWx0c1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ291bGQgbm90IGZpbmQgcGFyYW0gI3twYXJhbU5hbWV9IGluICN7ZGVwZW5kZW5jeX1cIlxuICAgIG5ldyBSZWNvcmRTZXQocGFyYW0sIEAsIHNrZXRjaENsYXNzSWQpXG5cbiAgZW5hYmxlVGFibGVQYWdpbmc6ICgpIC0+XG4gICAgQCQoJ1tkYXRhLXBhZ2luZ10nKS5lYWNoICgpIC0+XG4gICAgICAkdGFibGUgPSAkKEApXG4gICAgICBwYWdlU2l6ZSA9ICR0YWJsZS5kYXRhKCdwYWdpbmcnKVxuICAgICAgcm93cyA9ICR0YWJsZS5maW5kKCd0Ym9keSB0cicpLmxlbmd0aFxuICAgICAgcGFnZXMgPSBNYXRoLmNlaWwocm93cyAvIHBhZ2VTaXplKVxuICAgICAgaWYgcGFnZXMgPiAxXG4gICAgICAgICR0YWJsZS5hcHBlbmQgXCJcIlwiXG4gICAgICAgICAgPHRmb290PlxuICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICA8dGQgY29sc3Bhbj1cIiN7JHRhYmxlLmZpbmQoJ3RoZWFkIHRoJykubGVuZ3RofVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwYWdpbmF0aW9uXCI+XG4gICAgICAgICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI1wiPlByZXY8L2E+PC9saT5cbiAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICAgIDwvdGZvb3Q+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICB1bCA9ICR0YWJsZS5maW5kKCd0Zm9vdCB1bCcpXG4gICAgICAgIGZvciBpIGluIF8ucmFuZ2UoMSwgcGFnZXMgKyAxKVxuICAgICAgICAgIHVsLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI1wiPiN7aX08L2E+PC9saT5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgdWwuYXBwZW5kIFwiXCJcIlxuICAgICAgICAgIDxsaT48YSBocmVmPVwiI1wiPk5leHQ8L2E+PC9saT5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgICR0YWJsZS5maW5kKCdsaSBhJykuY2xpY2sgKGUpIC0+XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgJGEgPSAkKHRoaXMpXG4gICAgICAgICAgdGV4dCA9ICRhLnRleHQoKVxuICAgICAgICAgIGlmIHRleHQgaXMgJ05leHQnXG4gICAgICAgICAgICBhID0gJGEucGFyZW50KCkucGFyZW50KCkuZmluZCgnLmFjdGl2ZScpLm5leHQoKS5maW5kKCdhJylcbiAgICAgICAgICAgIHVubGVzcyBhLnRleHQoKSBpcyAnTmV4dCdcbiAgICAgICAgICAgICAgYS5jbGljaygpXG4gICAgICAgICAgZWxzZSBpZiB0ZXh0IGlzICdQcmV2J1xuICAgICAgICAgICAgYSA9ICRhLnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJy5hY3RpdmUnKS5wcmV2KCkuZmluZCgnYScpXG4gICAgICAgICAgICB1bmxlc3MgYS50ZXh0KCkgaXMgJ1ByZXYnXG4gICAgICAgICAgICAgIGEuY2xpY2soKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICRhLnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgJGEucGFyZW50KCkuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgIG4gPSBwYXJzZUludCh0ZXh0KVxuICAgICAgICAgICAgJHRhYmxlLmZpbmQoJ3Rib2R5IHRyJykuaGlkZSgpXG4gICAgICAgICAgICBvZmZzZXQgPSBwYWdlU2l6ZSAqIChuIC0gMSlcbiAgICAgICAgICAgICR0YWJsZS5maW5kKFwidGJvZHkgdHJcIikuc2xpY2Uob2Zmc2V0LCBuKnBhZ2VTaXplKS5zaG93KClcbiAgICAgICAgJCgkdGFibGUuZmluZCgnbGkgYScpWzFdKS5jbGljaygpXG5cbiAgICAgIGlmIG5vUm93c01lc3NhZ2UgPSAkdGFibGUuZGF0YSgnbm8tcm93cycpXG4gICAgICAgIGlmIHJvd3MgaXMgMFxuICAgICAgICAgIHBhcmVudCA9ICR0YWJsZS5wYXJlbnQoKVxuICAgICAgICAgICR0YWJsZS5yZW1vdmUoKVxuICAgICAgICAgIHBhcmVudC5yZW1vdmVDbGFzcyAndGFibGVDb250YWluZXInXG4gICAgICAgICAgcGFyZW50LmFwcGVuZCBcIjxwPiN7bm9Sb3dzTWVzc2FnZX08L3A+XCJcblxuICBlbmFibGVMYXllclRvZ2dsZXJzOiAoKSAtPlxuICAgIGVuYWJsZUxheWVyVG9nZ2xlcnMoQCRlbClcblxuICBnZXRDaGlsZHJlbjogKHNrZXRjaENsYXNzSWQpIC0+XG4gICAgXy5maWx0ZXIgQGNoaWxkcmVuLCAoY2hpbGQpIC0+IGNoaWxkLmdldFNrZXRjaENsYXNzKCkuaWQgaXMgc2tldGNoQ2xhc3NJZFxuXG5cbm1vZHVsZS5leHBvcnRzID0gUmVwb3J0VGFiXG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIFxuICByb3VuZDogKG51bWJlciwgZGVjaW1hbFBsYWNlcykgLT5cbiAgICB1bmxlc3MgXy5pc051bWJlciBudW1iZXJcbiAgICAgIG51bWJlciA9IHBhcnNlRmxvYXQobnVtYmVyKVxuICAgIG11bHRpcGxpZXIgPSBNYXRoLnBvdyAxMCwgZGVjaW1hbFBsYWNlc1xuICAgIE1hdGgucm91bmQobnVtYmVyICogbXVsdGlwbGllcikgLyBtdWx0aXBsaWVyIiwidGhpc1tcIlRlbXBsYXRlc1wiXSA9IHRoaXNbXCJUZW1wbGF0ZXNcIl0gfHwge307XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wibm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL2F0dHJpYnV0ZXMvYXR0cmlidXRlSXRlbVwiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8dHIgZGF0YS1hdHRyaWJ1dGUtaWQ9XFxcIlwiKTtfLmIoXy52KF8uZihcImlkXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiBkYXRhLWF0dHJpYnV0ZS1leHBvcnRpZD1cXFwiXCIpO18uYihfLnYoXy5mKFwiZXhwb3J0aWRcIixjLHAsMCkpKTtfLmIoXCJcXFwiIGRhdGEtYXR0cmlidXRlLXR5cGU9XFxcIlwiKTtfLmIoXy52KF8uZihcInR5cGVcIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHRkIGNsYXNzPVxcXCJuYW1lXFxcIj5cIik7Xy5iKF8udihfLmYoXCJuYW1lXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDx0ZCBjbGFzcz1cXFwidmFsdWVcXFwiPlwiKTtfLmIoXy52KF8uZihcImZvcm1hdHRlZFZhbHVlXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L3RyPlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wibm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL2F0dHJpYnV0ZXMvYXR0cmlidXRlc1RhYmxlXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjx0YWJsZSBjbGFzcz1cXFwiYXR0cmlidXRlc1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImF0dHJpYnV0ZXNcIixjLHAsMSksYyxwLDAsNDQsODEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihfLnJwKFwiYXR0cmlidXRlcy9hdHRyaWJ1dGVJdGVtXCIsYyxwLFwiICAgIFwiKSk7fSk7Yy5wb3AoKTt9Xy5iKFwiPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9nZW5lcmljQXR0cmlidXRlc1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtpZihfLnMoXy5kKFwic2tldGNoQ2xhc3MuZGVsZXRlZFwiLGMscCwxKSxjLHAsMCwyNCwyNzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LXdhcm5cXFwiIHN0eWxlPVxcXCJtYXJnaW4tYm90dG9tOjEwcHg7XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFRoaXMgc2tldGNoIHdhcyBjcmVhdGVkIHVzaW5nIHRoZSBcXFwiXCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIlxcXCIgdGVtcGxhdGUsIHdoaWNoIGlzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBubyBsb25nZXIgYXZhaWxhYmxlLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byBjb3B5IHRoaXMgc2tldGNoIG9yIG1ha2UgbmV3XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBza2V0Y2hlcyBvZiB0aGlzIHR5cGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5cIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiIEF0dHJpYnV0ZXM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihfLnJwKFwiYXR0cmlidXRlcy9hdHRyaWJ1dGVzVGFibGVcIixjLHAsXCIgICAgXCIpKTtfLmIoXCIgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvcmVwb3J0TG9hZGluZ1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRMb2FkaW5nXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwhLS0gPGRpdiBjbGFzcz1cXFwic3Bpbm5lclxcXCI+MzwvZGl2PiAtLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5SZXF1ZXN0aW5nIFJlcG9ydCBmcm9tIFNlcnZlcjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJwcm9ncmVzcyBwcm9ncmVzcy1zdHJpcGVkIGFjdGl2ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcImJhclxcXCIgc3R5bGU9XFxcIndpZHRoOiAxMDAlO1xcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxhIGhyZWY9XFxcIiNcXFwiIHJlbD1cXFwiZGV0YWlsc1xcXCI+ZGV0YWlsczwvYT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwiZGV0YWlsc1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG5cbmlmKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSB0aGlzW1wiVGVtcGxhdGVzXCJdO1xufSIsIlJlcG9ydFRhYiA9IHJlcXVpcmUgJ3JlcG9ydFRhYidcbnRlbXBsYXRlcyA9IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbl9wYXJ0aWFscyA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5wYXJ0aWFscyA9IFtdXG5mb3Iga2V5LCB2YWwgb2YgX3BhcnRpYWxzXG4gIHBhcnRpYWxzW2tleS5yZXBsYWNlKCdub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvJywgJycpXSA9IHZhbFxuXG5pZHMgPSByZXF1aXJlICcuL2lkcy5jb2ZmZWUnXG5mb3Iga2V5LCB2YWx1ZSBvZiBpZHNcbiAgd2luZG93W2tleV0gPSB2YWx1ZVxuXG5cbmNsYXNzIEVudmlyb25tZW50VGFiIGV4dGVuZHMgUmVwb3J0VGFiXG4gICMgdGhpcyBpcyB0aGUgbmFtZSB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBUYWJcbiAgbmFtZTogJ0hhYml0YXRzJ1xuICBjbGFzc05hbWU6ICdlbnZpcm9ubWVudCdcbiAgdGltZW91dDogMTIwMDAwXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZXMuZW52aXJvbm1lbnRcbiAgZGVwZW5kZW5jaWVzOiBbXG4gICAgJ0hhYml0YXRzRW52aXJvbm1lbnQnXG4gICAgJ0hhYml0YXRzT3ZlcnZpZXcnXG4gICAgJ0FkamFjZW50VGVycmVzdHJpYWwnXG4gICAgJ0hhYlJlcHNUb29sYm94J1xuICBdXG5cbiAgcmVuZGVyOiAoKSAtPlxuXG4gICAgI3Nob3cgdGFibGVzIGluc3RlYWQgb2YgZ3JhcGggZm9yIElFXG4gICAgaWYgd2luZG93LmQzXG4gICAgICBkM0lzUHJlc2VudCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBkM0lzUHJlc2VudCA9IGZhbHNlXG4gICAgaXNDb2xsZWN0aW9uID0gQG1vZGVsLmlzQ29sbGVjdGlvbigpXG4gICAgc2NpZCA9IEBza2V0Y2hDbGFzcy5pZFxuICAgIGlmIHNjaWQgPT0gR0VORVJJQ19JRCBvciBzY2lkID09IEdFTkVSSUNfQ09MTEVDVElPTl9JRFxuICAgICAgaXNHZW5lcmljID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGlzR2VuZXJpYyA9IGZhbHNlXG5cbiAgICBpc01QQSA9IChzY2lkID09IE1QQV9JRCBvciBzY2lkID09IE1QQV9DT0xMRUNUSU9OX0lEKVxuICAgIGhhYl9zaXplcyA9IEByZWNvcmRTZXQoJ0hhYlJlcHNUb29sYm94JywgJ0hhYlNpemVzJykudG9BcnJheSgpXG5cbiAgICBoYWJzX2luX3NrZXRjaCA9IGhhYl9zaXplcz8ubGVuZ3RoXG4gICAgaGFic19wbHVyYWwgPSBoYWJzX2luX3NrZXRjaCAhPSAxXG5cbiAgICBwcm90ZWN0ZWRfYXJlYXMgPSBAcmVjb3JkU2V0KCdBZGphY2VudFRlcnJlc3RyaWFsJywgJ1B1YmxpY0NvbnNlcnZhdGlvbkxhbmQnKS50b0FycmF5KClcbiAgICBoYXNQcm90ZWN0ZWQgPSBwcm90ZWN0ZWRBcmVhcz8ubGVuZ3RoID4gMFxuXG4gICAgcWUyX2NvdmVuYW50cyA9IEByZWNvcmRTZXQoJ0FkamFjZW50VGVycmVzdHJpYWwnLCAnQ29hc3RhbFByb3RlY3Rpb24nKS50b0FycmF5KClcbiAgICBoYXNRRTJjb3ZlbmFudHMgPSBxZTJfY292ZW5hbnRzPy5sZW5ndGggPiAwXG5cbiAgICBuYXBhbGlzX2NvdmVuYW50cyA9IEByZWNvcmRTZXQoJ0FkamFjZW50VGVycmVzdHJpYWwnLCAnQWRqYWNlbnRMYW5kQ292ZXInKS50b0FycmF5KClcbiAgICBoYXNOYXBhbGlzQ292ZW5hbnRzID0gbmFwYWxpc19jb3ZlbmFudHM/Lmxlbmd0aCA+IDBcblxuICAgIGhhc0NvdmVuYW50cyA9IChoYXNRRTJjb3ZlbmFudHMgb3IgaGFzTmFwYWxpc0NvdmVuYW50cylcblxuICAgIGlmIGlzR2VuZXJpYyBvciAoIWlzQ29sbGVjdGlvbiBhbmQgaXNNUEEpXG4gICAgICBzaG93QWRqYWNlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgc2hvd0FkamFjZW50ID0gZmFsc2VcbiAgICBcbiAgICBoYWJpdGF0c19yZXByZXNlbnRlZCA9IEByZWNvcmRTZXQoJ0hhYlJlcHNUb29sYm94JywgJ1JlcHJlc2VudGVkSGFicycpLnRvQXJyYXkoKVxuICAgIEByb3VuZERhdGEgaGFiaXRhdHNfcmVwcmVzZW50ZWRcbiAgICBhbGxfaGFicyA9IEBwcm9jZXNzSGFiaXRhdHMoaGFiaXRhdHNfcmVwcmVzZW50ZWQpXG4gXG4gICAgaGFiX3R5cGVzID0gYWxsX2hhYnNbMF1cbiAgICBoYXNIYWJUeXBlcyA9IGhhYl90eXBlcz8ubGVuZ3RoID4gMFxuICAgIHNpZ19oYWJzID0gYWxsX2hhYnNbMV1cbiAgICBoYXNTaWdIYWJzID0gc2lnX2hhYnM/Lmxlbmd0aCA+IDBcbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuIFxuICAgIGNvbnRleHQgPVxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcbiAgICAgIGlzR2VuZXJpYzogaXNHZW5lcmljXG4gICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuXG4gICAgICBoYWJfdHlwZXM6IGhhYl90eXBlc1xuICAgICAgaGFzSGFiVHlwZXM6IGhhc0hhYlR5cGVzXG4gICAgICBzaWdfaGFiczogc2lnX2hhYnNcbiAgICAgIGhhc1NpZ0hhYnM6IGhhc1NpZ0hhYnNcblxuICAgICAgaGFic19wbHVyYWw6IGhhYnNfcGx1cmFsXG4gICAgICBcbiAgICAgIGhhYml0YXRzX3JlcHJlc2VudGVkOiBoYWJpdGF0c19yZXByZXNlbnRlZFxuXG4gICAgICBwcm90ZWN0ZWRfYXJlYXM6IHByb3RlY3RlZF9hcmVhc1xuICAgICAgaGFzUHJvdGVjdGVkOiBoYXNQcm90ZWN0ZWRcblxuICAgICAgcWUyX2NvdmVuYW50czogcWUyX2NvdmVuYW50c1xuICAgICAgaGFzUUUyY292ZW5hbnRzOiBoYXNRRTJjb3ZlbmFudHNcblxuICAgICAgbmFwYWxpc19jb3ZlbmFudHM6IG5hcGFsaXNfY292ZW5hbnRzXG4gICAgICBoYXNOYXBhbGlzQ292ZW5hbnRzOiBoYXNOYXBhbGlzQ292ZW5hbnRzXG5cbiAgICAgIGhhc0NvdmVuYW50czogaGFzQ292ZW5hbnRzXG4gICAgICBzaG93QWRqYWNlbnQ6IHNob3dBZGphY2VudFxuICAgICAgXG5cbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcbiAgICBAZW5hYmxlTGF5ZXJUb2dnbGVycygpXG4gICAgQHJvdW5kRGF0YShoYWJfc2l6ZXMpXG4gICAgQHNldHVwSGFiaXRhdFNvcnRpbmcoaGFiX3NpemVzKVxuXG4gICAgQGVuYWJsZVRhYmxlUGFnaW5nKClcbiAgICBcbiAgcHJvY2Vzc0hhYml0YXRzOiAoaGFic19yZXByZXNlbnRlZCkgPT5cbiAgICBoYWJfdHlwZXMgPSBbXVxuICAgIGNyaXRpY2FsX2hhYml0YXRzID0gW11cbiAgICBmb3IgaGFiIGluIGhhYnNfcmVwcmVzZW50ZWRcbiAgICAgIGlmIGhhYi5IQUJfVFlQRSA9PSBcIkJyeW96b2FuIHJlZWZcIiBvciBoYWIuSEFCX1RZUEUgPT0gXCJNYWNyb2N5c3RpcyBiZWRcIlxuICAgICAgICBjcml0aWNhbF9oYWJpdGF0cy5wdXNoKGhhYilcbiAgICAgIGVsc2VcbiAgICAgICAgaGFiX3R5cGVzLnB1c2goaGFiKVxuXG4gICAgcmV0dXJuIFtoYWJfdHlwZXMsIGNyaXRpY2FsX2hhYml0YXRzXVxuXG4gIHJvdW5kRGF0YTogKGhhYml0YXRzKSA9PiAgXG4gICAgZm9yIGhhYiBpbiBoYWJpdGF0c1xuICAgICAgaGFiLlNJWkVfU1FLTSA9IE51bWJlcihoYWIuU0laRV9TUUtNKS50b0ZpeGVkKDEpXG4gICAgICBoYWIuUEVSQyA9IE51bWJlcihoYWIuUEVSQykudG9GaXhlZCgxKVxuXG4gIHNldHVwSGFiaXRhdFNvcnRpbmc6IChoYWJpdGF0cykgPT5cbiAgICB0Ym9keU5hbWUgPSAnLmhhYl92YWx1ZXMnXG4gICAgdGFibGVOYW1lID0gJy5oYWJfdGFibGUnXG4gICAgQCQoJy5oYWJfdHlwZScpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdoYWJfdHlwZScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIkhBQl9UWVBFXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRIYWJpdGF0Um93U3RyaW5nKVxuICAgIEAkKCcuaGFiX25ld19hcmVhJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2hhYl9uZXdfYXJlYScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlNJWkVfU1FLTVwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nKVxuICAgIEAkKCcuaGFiX25ld19wZXJjJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2hhYl9uZXdfcGVyYycsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiUEVSQ1wiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nKVxuICAgIEByZW5kZXJTb3J0KCdoYWJfdHlwZScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIHVuZGVmaW5lZCwgXCJIQUJfVFlQRVwiLCB0Ym9keU5hbWUsIGZhbHNlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZylcblxuICAjZG8gdGhlIHNvcnRpbmcgLSBzaG91bGQgYmUgdGFibGUgaW5kZXBlbmRlbnRcbiAgI3NraXAgYW55IHRoYXQgYXJlIGxlc3MgdGhhbiAwLjAwXG4gIHJlbmRlclNvcnQ6IChuYW1lLCB0YWJsZU5hbWUsIHBkYXRhLCBldmVudCwgc29ydEJ5LCB0Ym9keU5hbWUsIGlzRmxvYXQsIGdldFJvd1N0cmluZ1ZhbHVlKSA9PlxuICAgIGlmIGV2ZW50XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cblxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgdGFyZ2V0Q29sdW1uID0gQGdldFNlbGVjdGVkQ29sdW1uKGV2ZW50LCBuYW1lKVxuICAgICAgc29ydFVwID0gQGdldFNvcnREaXIodGFyZ2V0Q29sdW1uKVxuXG4gICAgICBpZiBpc0Zsb2F0XG4gICAgICAgIGRhdGEgPSBfLnNvcnRCeSBwZGF0YSwgKHJvdykgLT4gIHBhcnNlRmxvYXQocm93W3NvcnRCeV0pXG4gICAgICBlbHNlXG4gICAgICAgIGRhdGEgPSBfLnNvcnRCeSBwZGF0YSwgKHJvdykgLT4gcm93W3NvcnRCeV1cblxuICAgICAgI2ZsaXAgc29ydGluZyBpZiBuZWVkZWRcbiAgICAgIGlmIHNvcnRVcFxuICAgICAgICBkYXRhLnJldmVyc2UoKVxuXG4gICAgICBlbCA9IEAkKHRib2R5TmFtZSlbMF1cbiAgICAgIGhhYl9ib2R5ID0gZDMuc2VsZWN0KGVsKVxuXG4gICAgICAjcmVtb3ZlIG9sZCByb3dzXG4gICAgICBoYWJfYm9keS5zZWxlY3RBbGwoXCJ0ci5oYWJfcm93c1wiKVxuICAgICAgICAucmVtb3ZlKClcblxuICAgICAgI2FkZCBuZXcgcm93cyAoYW5kIGRhdGEpXG4gICAgICByb3dzID0gaGFiX2JvZHkuc2VsZWN0QWxsKFwidHJcIilcbiAgICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgICAuZW50ZXIoKS5pbnNlcnQoXCJ0clwiLCBcIjpmaXJzdC1jaGlsZFwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiaGFiX3Jvd3NcIilcblxuICAgICAgY29sdW1ucyA9IFtcIkhBQl9UWVBFXCIsIFwiU0laRV9TUUtNXCIsIFwiUEVSQ1wiXVxuICAgICAgY2VsbHMgPSByb3dzLnNlbGVjdEFsbChcInRkXCIpXG4gICAgICAgICAgLmRhdGEoKHJvdywgaSkgLT5jb2x1bW5zLm1hcCAoY29sdW1uKSAtPiAoY29sdW1uOiBjb2x1bW4sIHZhbHVlOiByb3dbY29sdW1uXSkpXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoXCJ0ZFwiKS50ZXh0KChkLCBpKSAtPiBcbiAgICAgICAgICBkLnZhbHVlXG4gICAgICAgICkgICAgXG5cbiAgICAgIEBzZXROZXdTb3J0RGlyKHRhcmdldENvbHVtbiwgc29ydFVwKVxuICAgICAgQHNldFNvcnRpbmdDb2xvcihldmVudCwgdGFibGVOYW1lKVxuICAgICAgI2ZpcmUgdGhlIGV2ZW50IGZvciB0aGUgYWN0aXZlIHBhZ2UgaWYgcGFnaW5hdGlvbiBpcyBwcmVzZW50XG4gICAgICBAZmlyZVBhZ2luYXRpb24odGFibGVOYW1lKVxuICAgICAgaWYgZXZlbnRcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICAjdGFibGUgcm93IGZvciBoYWJpdGF0IHJlcHJlc2VudGF0aW9uXG4gIGdldEhhYml0YXRSb3dTdHJpbmc6IChkKSA9PlxuICAgIHJldHVybiBcIjx0ZD5cIitkLkhBQl9UWVBFK1wiPC90ZD5cIitcIjx0ZD5cIitkLlNJWkVfU1FLTStcIjwvdGQ+XCIrXCI8dGQ+XCIrZC5QRVJDK1wiPC90ZD5cIlxuXG4gIHNldFNvcnRpbmdDb2xvcjogKGV2ZW50LCB0YWJsZU5hbWUpID0+XG4gICAgc29ydGluZ0NsYXNzID0gXCJzb3J0aW5nX2NvbFwiXG4gICAgaWYgZXZlbnRcbiAgICAgIHBhcmVudCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCkucGFyZW50KClcbiAgICAgIG5ld1RhcmdldE5hbWUgPSBldmVudC5jdXJyZW50VGFyZ2V0LmNsYXNzTmFtZVxuICAgICAgdGFyZ2V0U3RyID0gdGFibGVOYW1lK1wiIHRoLnNvcnRpbmdfY29sIGFcIiAgIFxuICAgICAgaWYgQCQodGFyZ2V0U3RyKSBhbmQgQCQodGFyZ2V0U3RyKVswXVxuICAgICAgICBvbGRUYXJnZXROYW1lID0gQCQodGFyZ2V0U3RyKVswXS5jbGFzc05hbWVcbiAgICAgICAgaWYgbmV3VGFyZ2V0TmFtZSAhPSBvbGRUYXJnZXROYW1lXG4gICAgICAgICAgI3JlbW92ZSBpdCBmcm9tIG9sZCBcbiAgICAgICAgICBoZWFkZXJOYW1lID0gdGFibGVOYW1lK1wiIHRoLnNvcnRpbmdfY29sXCJcbiAgICAgICAgICBAJChoZWFkZXJOYW1lKS5yZW1vdmVDbGFzcyhzb3J0aW5nQ2xhc3MpXG4gICAgICAgICAgI2FuZCBhZGQgaXQgdG8gbmV3XG4gICAgICAgICAgcGFyZW50LmFkZENsYXNzKHNvcnRpbmdDbGFzcylcbiAgICAgXG4gIGdldFNvcnREaXI6ICh0YXJnZXRDb2x1bW4pID0+XG4gICAgIHNvcnR1cCA9IEAkKCcuJyt0YXJnZXRDb2x1bW4pLmhhc0NsYXNzKFwic29ydF91cFwiKVxuICAgICByZXR1cm4gc29ydHVwXG5cbiAgZ2V0U2VsZWN0ZWRDb2x1bW46IChldmVudCwgbmFtZSkgPT5cbiAgICBpZiBldmVudFxuICAgICAgI2dldCBzb3J0IG9yZGVyXG4gICAgICB0YXJnZXRDb2x1bW4gPSBldmVudC5jdXJyZW50VGFyZ2V0LmNsYXNzTmFtZVxuICAgICAgbXVsdGlDbGFzc2VzID0gdGFyZ2V0Q29sdW1uLnNwbGl0KCcgJylcbiAgICAgICNwcm90ZWN0ZWRNYW1tYWxzID0gXy5zb3J0QnkgcHJvdGVjdGVkTWFtbWFscywgKHJvdykgLT4gcGFyc2VJbnQocm93LkNvdW50KVxuICAgICAgaGFiQ2xhc3NOYW1lID1fLmZpbmQgbXVsdGlDbGFzc2VzLCAoY2xhc3NuYW1lKSAtPiBcbiAgICAgICAgY2xhc3NuYW1lLmxhc3RJbmRleE9mKCdoYWInLDApID09IDBcbiAgICAgIHRhcmdldENvbHVtbiA9IGhhYkNsYXNzTmFtZVxuICAgIGVsc2VcbiAgICAgICN3aGVuIHRoZXJlIGlzIG5vIGV2ZW50LCBmaXJzdCB0aW1lIHRhYmxlIGlzIGZpbGxlZFxuICAgICAgdGFyZ2V0Q29sdW1uID0gbmFtZVxuXG4gICAgcmV0dXJuIHRhcmdldENvbHVtblxuXG4gIHNldE5ld1NvcnREaXI6ICh0YXJnZXRDb2x1bW4sIHNvcnRVcCkgPT5cbiAgICAjYW5kIHN3aXRjaCBpdFxuICAgIGlmIHNvcnRVcFxuICAgICAgQCQoJy4nK3RhcmdldENvbHVtbikucmVtb3ZlQ2xhc3MoJ3NvcnRfdXAnKVxuICAgICAgQCQoJy4nK3RhcmdldENvbHVtbikuYWRkQ2xhc3MoJ3NvcnRfZG93bicpXG4gICAgZWxzZVxuICAgICAgQCQoJy4nK3RhcmdldENvbHVtbikuYWRkQ2xhc3MoJ3NvcnRfdXAnKVxuICAgICAgQCQoJy4nK3RhcmdldENvbHVtbikucmVtb3ZlQ2xhc3MoJ3NvcnRfZG93bicpXG5cbiAgZmlyZVBhZ2luYXRpb246ICh0YWJsZU5hbWUpID0+XG4gICAgZWwgPSBAJCh0YWJsZU5hbWUpWzBdXG4gICAgaGFiX3RhYmxlID0gZDMuc2VsZWN0KGVsKVxuICAgIGFjdGl2ZV9wYWdlID0gaGFiX3RhYmxlLnNlbGVjdEFsbChcIi5hY3RpdmUgYVwiKVxuICAgIGlmIGFjdGl2ZV9wYWdlIGFuZCBhY3RpdmVfcGFnZVswXSBhbmQgYWN0aXZlX3BhZ2VbMF1bMF1cbiAgICAgIGFjdGl2ZV9wYWdlWzBdWzBdLmNsaWNrKClcblxubW9kdWxlLmV4cG9ydHMgPSBFbnZpcm9ubWVudFRhYiIsIlJlcG9ydFRhYiA9IHJlcXVpcmUgJ3JlcG9ydFRhYidcbnRlbXBsYXRlcyA9IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbl9wYXJ0aWFscyA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5wYXJ0aWFscyA9IFtdXG5mb3Iga2V5LCB2YWwgb2YgX3BhcnRpYWxzXG4gIHBhcnRpYWxzW2tleS5yZXBsYWNlKCdub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvJywgJycpXSA9IHZhbFxuXG5pZHMgPSByZXF1aXJlICcuL2lkcy5jb2ZmZWUnXG5mb3Iga2V5LCB2YWx1ZSBvZiBpZHNcbiAgd2luZG93W2tleV0gPSB2YWx1ZVxuXG5cbmNsYXNzIEZpc2hpbmdUYWIgZXh0ZW5kcyBSZXBvcnRUYWJcbiAgIyB0aGlzIGlzIHRoZSBuYW1lIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIFRhYlxuICBuYW1lOiAnRmlzaGluZydcbiAgY2xhc3NOYW1lOiAnZmlzaGluZydcbiAgdGltZW91dDogMTIwMDAwXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZXMuZmlzaGluZ1xuICBkZXBlbmRlbmNpZXM6IFtcbiAgICAnRmlzaGluZ0ludGVuc2l0eScsICdGaXNoaW5nQXJlYXMnXG4gIF1cblxuICByZW5kZXI6ICgpIC0+XG5cbiAgICAjc2hvdyB0YWJsZXMgaW5zdGVhZCBvZiBncmFwaCBmb3IgSUVcbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIGQzSXNQcmVzZW50ID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGQzSXNQcmVzZW50ID0gZmFsc2VcblxuICAgIGlzQ29sbGVjdGlvbiA9IEBtb2RlbC5pc0NvbGxlY3Rpb24oKVxuICAgIHNjaWQgPSBAc2tldGNoQ2xhc3MuaWRcbiAgICBpZiBzY2lkID09IE1QQV9JRCBvciBzY2lkID09IE1QQV9DT0xMRUNUSU9OX0lEXG4gICAgICBpc01QQSA9IHRydWVcbiAgICBlbHNlXG4gICAgICBpc01QQSA9IGZhbHNlXG5cbiAgICBpZiBpc01QQVxuICAgICAgc2V0bmV0ID0gQHJlY29yZFNldCgnRmlzaGluZ0ludGVuc2l0eScsICdTZXROZXQnKS50b0FycmF5KClcbiAgICAgIEByb3VuZERhdGEoc2V0bmV0KVxuICAgICAgdHJhd2wgPSBAcmVjb3JkU2V0KCdGaXNoaW5nSW50ZW5zaXR5JywgJ1RyYXdsJykudG9BcnJheSgpXG4gICAgICBAcm91bmREYXRhKHRyYXdsKVxuICAgICAgbG9uZ2xpbmUgPSBAcmVjb3JkU2V0KCdGaXNoaW5nSW50ZW5zaXR5JywgJ0xvbmdMaW5lJykudG9BcnJheSgpXG4gICAgICBAcm91bmREYXRhKGxvbmdsaW5lKVxuXG4gICAgZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmcgPSBAcmVjb3JkU2V0KCdGaXNoaW5nQXJlYXMnLCAnRXhpc3RpbmdDdXN0b21hcnlBcmVhJykudG9BcnJheSgpXG4gICAgaGFzRXhpc3RpbmdDdXN0b21hcnkgPSBleGlzdGluZ19jdXN0b21hcnlfZmlzaGluZz8ubGVuZ3RoID4gMFxuICAgIHByb3Bvc2VkX2N1c3RvbWFyeV9maXNoaW5nID0gQHJlY29yZFNldCgnRmlzaGluZ0FyZWFzJywgJ1Byb3Bvc2VkQ3VzdG9tYXJ5QXJlYScpLnRvQXJyYXkoKVxuICAgIGhhc1Byb3Bvc2VkQ3VzdG9tYXJ5ID0gcHJvcG9zZWRfY3VzdG9tYXJ5X2Zpc2hpbmc/Lmxlbmd0aCA+IDBcblxuICAgIGhhc0N1c3RvbWFyeSA9IGhhc0V4aXN0aW5nQ3VzdG9tYXJ5IG9yIGhhc1Byb3Bvc2VkQ3VzdG9tYXJ5XG5cbiAgICBleGlzdGluZ19maXNoaW5nX2FyZWFzID0gQHJlY29yZFNldCgnRmlzaGluZ0FyZWFzJywgJ0Zpc2hpbmdFeGlzdGluZ0FyZWEnKS50b0FycmF5KClcbiAgICBoYXNFeGlzdGluZ0Zpc2hpbmcgPSBleGlzdGluZ19maXNoaW5nX2FyZWFzPy5sZW5ndGggPiAwXG4gICAgaGFzQW55RmlzaGluZyA9IGhhc0V4aXN0aW5nRmlzaGluZyBvciBoYXNDdXN0b21hcnlcbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgIFxuICAgIGlmIGlzTVBBXG4gICAgICBjb250ZXh0ID1cbiAgICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgICBza2V0Y2hDbGFzczogQHNrZXRjaENsYXNzLmZvclRlbXBsYXRlKClcbiAgICAgICAgYXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgICAgYWRtaW46IEBwcm9qZWN0LmlzQWRtaW4gd2luZG93LnVzZXJcbiAgICAgICAgZDNJc1ByZXNlbnQ6IGQzSXNQcmVzZW50XG5cbiAgICAgICAgaXNDb2xsZWN0aW9uOiBpc0NvbGxlY3Rpb25cbiAgICAgICAgc2V0bmV0OiBzZXRuZXRcbiAgICAgICAgdHJhd2w6IHRyYXdsXG4gICAgICAgIGxvbmdsaW5lOiBsb25nbGluZVxuICAgICAgICBpc01QQTogaXNNUEFcbiAgICAgICAgZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmc6IGV4aXN0aW5nX2N1c3RvbWFyeV9maXNoaW5nXG4gICAgICAgIGhhc0V4aXN0aW5nQ3VzdG9tYXJ5OiBoYXNFeGlzdGluZ0N1c3RvbWFyeVxuICAgICAgICBwcm9wb3NlZF9jdXN0b21hcnlfZmlzaGluZzogcHJvcG9zZWRfY3VzdG9tYXJ5X2Zpc2hpbmdcbiAgICAgICAgaGFzUHJvcG9zZWRDdXN0b21hcnk6IGhhc1Byb3Bvc2VkQ3VzdG9tYXJ5XG4gICAgICAgIGV4aXN0aW5nX2Zpc2hpbmdfYXJlYXM6IGV4aXN0aW5nX2Zpc2hpbmdfYXJlYXNcbiAgICAgICAgaGFzRXhpc3RpbmdGaXNoaW5nOiBoYXNFeGlzdGluZ0Zpc2hpbmdcbiAgICAgICAgaGFzQW55RmlzaGluZzogaGFzQW55RmlzaGluZ1xuICAgICAgICBoYXNDdXN0b21hcnk6IGhhc0N1c3RvbWFyeVxuICAgICAgICBpc01QQTogaXNNUEFcbiAgICBlbHNlXG4gICAgICBjb250ZXh0ID1cbiAgICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgICBza2V0Y2hDbGFzczogQHNrZXRjaENsYXNzLmZvclRlbXBsYXRlKClcbiAgICAgICAgYXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgICAgYWRtaW46IEBwcm9qZWN0LmlzQWRtaW4gd2luZG93LnVzZXJcbiAgICAgICAgZDNJc1ByZXNlbnQ6IGQzSXNQcmVzZW50XG4gICAgICAgIGlzQ29sbGVjdGlvbjogaXNDb2xsZWN0aW9uXG4gICAgICAgIGV4aXN0aW5nX2N1c3RvbWFyeV9maXNoaW5nOiBleGlzdGluZ19jdXN0b21hcnlfZmlzaGluZ1xuICAgICAgICBoYXNFeGlzdGluZ0N1c3RvbWFyeTogaGFzRXhpc3RpbmdDdXN0b21hcnlcbiAgICAgICAgcHJvcG9zZWRfY3VzdG9tYXJ5X2Zpc2hpbmc6IHByb3Bvc2VkX2N1c3RvbWFyeV9maXNoaW5nXG4gICAgICAgIGhhc1Byb3Bvc2VkQ3VzdG9tYXJ5OiBoYXNQcm9wb3NlZEN1c3RvbWFyeVxuICAgICAgICBleGlzdGluZ19maXNoaW5nX2FyZWFzOiBleGlzdGluZ19maXNoaW5nX2FyZWFzXG4gICAgICAgIGhhc0V4aXN0aW5nRmlzaGluZzogaGFzRXhpc3RpbmdGaXNoaW5nXG4gICAgICAgIGhhc0FueUZpc2hpbmc6IGhhc0FueUZpc2hpbmdcbiAgICAgICAgaGFzQ3VzdG9tYXJ5OiBoYXNDdXN0b21hcnlcbiAgICAgICAgaXNNUEE6IGlzTVBBXG5cbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcbiAgICBAZW5hYmxlTGF5ZXJUb2dnbGVycygpXG5cbiAgcm91bmREYXRhOiAocmVjX3NldCkgPT5cbiAgICBsb3dfdG90YWwgPSAwLjBcbiAgICBoaWdoX3RvdGFsID0gMC4wXG4gICAgZm9yIHJzIGluIHJlY19zZXRcbiAgICAgIHJzLkxPVyA9IE51bWJlcihycy5MT1cpLnRvRml4ZWQoMSlcbiAgICAgIGxvd190b3RhbCs9TnVtYmVyKHJzLkxPVylcbiAgICAgIHJzLkhJR0ggPSBOdW1iZXIocnMuSElHSCkudG9GaXhlZCgxKVxuICAgICAgaGlnaF90b3RhbCs9TnVtYmVyKHJzLkhJR0gpXG4gICAgICBycy5UT1RBTCA9IE51bWJlcihycy5UT1RBTCkudG9GaXhlZCgxKVxuICAgIGlmIHJlY19zZXQ/Lmxlbmd0aCA+IDBcbiAgICAgIHRvdF9yb3cgPSB7XCJOQU1FXCI6XCJUb3RhbFwiLCBcIkxPV1wiOmxvd190b3RhbCwgXCJISUdIXCI6aGlnaF90b3RhbH1cbiAgICAgIHJlY19zZXQucHVzaCh0b3Rfcm93KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpc2hpbmdUYWIiLCJtb2R1bGUuZXhwb3J0cyA9IFxuICBHRU5FUklDX0lEOiAnNTM5ZjVlYzY4ZDEwOTI2YzI5ZmU3NzYyJ1xuICBHRU5FUklDX0NPTExFQ1RJT05fSUQ6ICc1M2ZkMTk1NTA0MDZkZTY4NGMxMTg5NjknXG4gIE1QQV9JRDogJzU0ZDgxMjkwZmE5NGU2OTc3NTljZTc3MSdcbiAgTVBBX0NPTExFQ1RJT05fSUQ6ICc1NTgyZTYwNWFjMmRkZGQ0Mjk3NmY0MWInIiwiUmVwb3J0VGFiID0gcmVxdWlyZSAncmVwb3J0VGFiJ1xudGVtcGxhdGVzID0gcmVxdWlyZSAnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxuX3BhcnRpYWxzID0gcmVxdWlyZSAnLi4vbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cbmlkcyA9IHJlcXVpcmUgJy4vaWRzLmNvZmZlZSdcbmZvciBrZXksIHZhbHVlIG9mIGlkc1xuICB3aW5kb3dba2V5XSA9IHZhbHVlXG5cbmNsYXNzIE92ZXJ2aWV3VGFiIGV4dGVuZHMgUmVwb3J0VGFiXG4gICMgdGhpcyBpcyB0aGUgbmFtZSB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBUYWJcbiAgbmFtZTogJ092ZXJ2aWV3J1xuICBjbGFzc05hbWU6ICdvdmVydmlldydcbiAgdGltZW91dDogMTIwMDAwXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZXMub3ZlcnZpZXdcbiAgZGVwZW5kZW5jaWVzOiBbXG4gICAgJ1NpemUnXG4gICAgJ0NvYXN0bGluZUxlbmd0aCdcbiAgICAnSGFiaXRhdHNPdmVydmlldydcbiAgICAnUHJvcG9zYWxTaXplJ1xuICAgICdQcm9wb3NhbENvbm5lY3Rpdml0eSdcbiAgICAnSGFiUmVwc1Rvb2xib3gnXG4gIF1cblxuICByZW5kZXI6ICgpIC0+XG4gICAgIyBUaGUgQHJlY29yZFNldCBtZXRob2QgY29udGFpbnMgc29tZSB1c2VmdWwgbWVhbnMgdG8gZ2V0IGRhdGEgb3V0IG9mIFxuICAgICMgdGhlIG1vbnN0ZXJvdXMgUmVjb3JkU2V0IGpzb24uIENoZWNrb3V0IHRoZSBzZWFza2V0Y2gtcmVwb3J0aW5nLXRlbXBsYXRlXG4gICAgIyBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGluZm8uXG4gICAgVE9UQUxfQ09BU1RMSU5FX0xFTkdUSCA9IDY2Ny41OTRcbiAgICBUT1RBTF9IQUJTID0gMzBcbiAgICBpc0NvbGxlY3Rpb24gPSBAbW9kZWwuaXNDb2xsZWN0aW9uKClcbiAgICBpZiBpc0NvbGxlY3Rpb25cbiAgICAgIG51bVNrZXRjaGVzID0gQG1vZGVsLmdldENoaWxkcmVuKCkubGVuZ3RoXG4gICAgICBzY2lkID0gQHNrZXRjaENsYXNzLmlkXG4gICAgZWxzZVxuICAgICAgbnVtU2tldGNoZXMgPSAxXG4gICAgICBzY2lkID0gQHNrZXRjaENsYXNzLmlkXG4gICAgcGx1cmFsU2tldGNoZXMgPSBudW1Ta2V0Y2hlcyA+IDFcbiAgICBpc01QQSA9IChzY2lkID09IE1QQV9JRCBvciBzY2lkID09IE1QQV9DT0xMRUNUSU9OX0lEKVxuICAgIGlzR2VuZXJpYyA9IChzY2lkID09IEdFTkVSSUNfSUQgb3Igc2NpZCA9PSBHRU5FUklDX0NPTExFQ1RJT05fSUQpXG5cbiAgICBwcm9wX3NpemVzID0gQHJlY29yZFNldCgnUHJvcG9zYWxTaXplJywgJ1NpemVzJykudG9BcnJheSgpXG4gICAgcmVwcmVzZW50ZWRfaGFicyA9IEByZWNvcmRTZXQoJ0hhYlJlcHNUb29sYm94JywgJ1JlcHJlc2VudGVkSGFicycpLnRvQXJyYXkoKVxuICAgIGhhYl9zaXplcyA9IEByZWNvcmRTZXQoJ0hhYlJlcHNUb29sYm94JywgJ1JlcHJlc2VudGVkSGFicycpLnRvQXJyYXkoKVxuICAgIG51bV9oYWJzID0gaGFiX3NpemVzPy5sZW5ndGhcbiAgICBudW1fcmVwcmVzZW50ZWRfaGFicyA9IHJlcHJlc2VudGVkX2hhYnM/Lmxlbmd0aFxuXG4gIFxuICAgIG1wYV9hdmdfbWluX2RpbSA9IEBnZXRBdmVyYWdlTWluRGltKHByb3Bfc2l6ZXMpXG4gICAgdG90YWxfcGVyY2VudCA9IEBnZXRUb3RhbEFyZWFQZXJjZW50KHByb3Bfc2l6ZXMpXG4gICAgcHJvcF9zaXplcyA9IEBjbGVhbnVwRGF0YShwcm9wX3NpemVzKVxuICAgIFxuICAgIG1wYV9jb3VudCA9IEBnZXRNaW5EaW1Db3VudChwcm9wX3NpemVzKVxuICAgIHRvdGFsX21wYV9jb3VudCA9IG51bVNrZXRjaGVzXG4gICAgcGx1cmFsX21wYV9jb3VudCA9IG1wYV9jb3VudCAhPSAxXG5cbiAgICBcbiAgICBpZiBtcGFfYXZnX21pbl9kaW0gPCAxMFxuICAgICAgbXBhX2F2Z19zaXplX2d1aWRlbGluZSA9IFwiYmVsb3dcIlxuICAgIGVsc2VcbiAgICAgIG1wYV9hdmdfc2l6ZV9ndWlkZWxpbmUgPSBcImFib3ZlXCJcbiAgICB0cnlcbiAgICAgIHNpemUgPSBAcmVjb3JkU2V0KCdTaXplJywgJ1NpemUnKS5mbG9hdCgnU0laRV9TUUtNJylcbiAgICAgIGNvbnNvbGUubG9nKHNpemUpXG4gICAgICBpZiBzaXplIDwgMC4xXG4gICAgICAgIG5ld19zaXplID0gXCI8IDAuMVwiXG4gICAgICBlbHNlXG4gICAgICAgIG5ld19zaXplID0gIEBhZGRDb21tYXMgc2l6ZVxuXG4gICAgY2F0Y2ggRXJyb3JcbiAgICAgIGNvbnNvbGUubG9nKCdlcnJvciBnZXR0aW5nIHNpemUnKVxuICAgICAgbmV3X3NpemUgPSAwXG5cbiAgICB0cnlcbiAgICAgIHBlcmNlbnQgPSBAcmVjb3JkU2V0KCdTaXplJywgJ1BlcmNlbnQnKS5mbG9hdCgnUEVSQycpXG4gICAgICBpZiBwZXJjZW50ID09IDAgJiYgdG90YWxfcGVyY2VudCA+IDBcbiAgICAgICAgcGVyY2VudCA9IFwiPCAxXCJcbiAgICBjYXRjaCBFcnJvclxuICAgICAgY29uc29sZS5sb2coXCJlcnJvciBnZXR0aW5nIHBlcmNlbnRcIilcbiAgICAgIHBlcmNlbnQgPSB0b3RhbF9wZXJjZW50XG5cbiAgICBjb2FzdGxpbmVfbGVuZ3RoID0gQHJlY29yZFNldCgnQ29hc3RsaW5lTGVuZ3RoJywgJ0NvYXN0bGluZUxlbmd0aCcpLmZsb2F0KCdMR1RIX0lOX00nKVxuICAgIFxuICAgIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA9ICgoY29hc3RsaW5lX2xlbmd0aC8xMDAwKS9UT1RBTF9DT0FTVExJTkVfTEVOR1RIKSoxMDBcbiAgICBpZiBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQgPiAwICYmIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA8IDFcbiAgICAgIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA9IFwiPCAxXCJcbiAgICBlbHNlXG4gICAgICBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQgPSBwYXJzZUZsb2F0KGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCkudG9GaXhlZCgxKVxuXG4gICAgY29hc3RsaW5lX2xlbmd0aCA9IEBhZGRDb21tYXMgY29hc3RsaW5lX2xlbmd0aFxuICAgIG5ld19oYWJzID0gQHJlY29yZFNldCgnSGFiaXRhdHNPdmVydmlldycsICdIYWJpdGF0U2l6ZScpLmZsb2F0KCdORVdfSEFCUycpXG4gICAgdG90YWxfaGFicyA9IEByZWNvcmRTZXQoJ0hhYml0YXRzT3ZlcnZpZXcnLCAnSGFiaXRhdFNpemUnKS5mbG9hdCgnVE9UX0hBQlMnKVxuICAgIFxuICAgIHJhdGlvID0gKGNvYXN0bGluZV9sZW5ndGgvc2l6ZSkudG9GaXhlZCgxKVxuXG4gICAgI3NldHVwIGNvbm5lY3Rpdml0eSBkYXRhXG4gICAgaWYgaXNDb2xsZWN0aW9uXG4gICAgICBnb29kX2NvbG9yID0gXCIjYjNjZmE3XCJcbiAgICAgIGJhZF9jb2xvciA9IFwiI2U1Y2FjZVwiXG4gICAgICBudW1fcmVwbGljYXRlZF9oYWJzID0gMFxuICAgICAgaWYgbnVtU2tldGNoZXMgPiAxXG4gICAgICAgIHRyeVxuICAgICAgICAgIGNvbm5lY3RlZF9tcGFfY291bnQgPSBAcmVjb3JkU2V0KCdQcm9wb3NhbENvbm5lY3Rpdml0eScsICdDb25uJykuZmxvYXQoJ05VTUJFUicpXG4gICAgICAgICAgcGx1cmFsX2Nvbm5lY3RlZF9tcGFfY291bnQgPSB0cnVlXG5cbiAgICAgICAgICBtaW5fZGlzdGFuY2UgPSBAcmVjb3JkU2V0KCdQcm9wb3NhbENvbm5lY3Rpdml0eScsICdDb25uJykuZmxvYXQoJ01JTicpXG4gICAgICAgICAgbWF4X2Rpc3RhbmNlID0gQHJlY29yZFNldCgnUHJvcG9zYWxDb25uZWN0aXZpdHknLCAnQ29ubicpLmZsb2F0KCdNQVgnKVxuICAgICAgICAgIG1lYW5fZGlzdGFuY2UgPSBAcmVjb3JkU2V0KCdQcm9wb3NhbENvbm5lY3Rpdml0eScsICdDb25uJykuZmxvYXQoJ01FQU4nKVxuICAgICAgICAgIGNvbm5fcGllX3ZhbHVlcyA9IEBidWlsZF92YWx1ZXMoXCJNUEFzIFdpdGhpbiBDb25uZWN0aXZpdHkgUmFuZ2VcIiwgY29ubmVjdGVkX21wYV9jb3VudCxnb29kX2NvbG9yLCBcIk1QQXMgT3V0c2lkZSBDb25uZWN0aXZpdHkgUmFuZ2VcIiwgXG4gICAgICAgICAgICB0b3RhbF9tcGFfY291bnQtY29ubmVjdGVkX21wYV9jb3VudCwgYmFkX2NvbG9yKVxuICAgICAgICBjYXRjaCBFcnJvclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3IgcmVhZGluZyBjb25uZWN0aXZpdHkuLi5cIilcbiAgICAgICAgICBcbiAgICAgIG5vdF9yZXByZXNlbnRlZCA9IFRPVEFMX0hBQlMgLSBudW1fcmVwcmVzZW50ZWRfaGFic1xuICAgICAgcmVwcmVzZW50ZWRfaGFic19waWVfdmFsdWVzID0gQGJ1aWxkX3ZhbHVlcyhcIkhhYml0YXQtdHlwZXMgUmVwcmVzZW50ZWRcIiwgbnVtX3JlcHJlc2VudGVkX2hhYnMsIGdvb2RfY29sb3IsIFwiSGFiaXRhdC10eXBlcyBOb3QgUmVwcmVzZW50ZWRcIixcbiAgICAgICAgbm90X3JlcHJlc2VudGVkLCBiYWRfY29sb3IpXG5cbiAgICAgIG5vdF9yZXBsaWNhdGVkID0gVE9UQUxfSEFCUyAtIG51bV9yZXBsaWNhdGVkX2hhYnNcbiAgICAgIHJlcGxpY2F0ZWRfaGFic19waWVfdmFsdWVzID0gQGJ1aWxkX3ZhbHVlcyhcIkhhYml0YXQtdHlwZXMgUmVwbGljYXRlZFwiLCBudW1fcmVwbGljYXRlZF9oYWJzLCBnb29kX2NvbG9yLCBcIkhhYml0YXQtdHlwZXMgTm90IFJlcGxpY2F0ZWRcIixcbiAgICAgICAgbm90X3JlcGxpY2F0ZWQsIGJhZF9jb2xvcilcblxuICAgICNzaG93IHRhYmxlcyBpbnN0ZWFkIG9mIGdyYXBoIGZvciBJRVxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgZDNJc1ByZXNlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgZDNJc1ByZXNlbnQgPSBmYWxzZVxuXG4gICAgXG4gICAgYXR0cmlidXRlcyA9IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICBcbiAgICBjb250ZXh0ID1cbiAgICAgIGQzSXNQcmVzZW50OiBkM0lzUHJlc2VudFxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICBzaXplOiBuZXdfc2l6ZVxuICAgICAgY29hc3RsaW5lX2xlbmd0aDogY29hc3RsaW5lX2xlbmd0aFxuICAgICAgY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50OmNvYXN0bGluZV9sZW5ndGhfcGVyY2VudFxuICAgICAgbmV3X2hhYnM6IG5ld19oYWJzXG4gICAgICB0b3RhbF9oYWJzOiB0b3RhbF9oYWJzXG4gICAgICByYXRpbzogcmF0aW9cbiAgICAgIHBlcmNlbnQ6IHBlcmNlbnRcbiAgICAgIGlzQ29sbGVjdGlvbjogaXNDb2xsZWN0aW9uXG4gICAgICBudW1Ta2V0Y2hlczogbnVtU2tldGNoZXNcbiAgICAgIHBsdXJhbFNrZXRjaGVzOiBwbHVyYWxTa2V0Y2hlc1xuICAgICAgcHJvcF9zaXplczogcHJvcF9zaXplc1xuICAgICAgdG90YWxfbXBhX2NvdW50OiB0b3RhbF9tcGFfY291bnRcbiAgICAgIG1wYV9jb3VudDogbXBhX2NvdW50XG4gICAgICBtcGFfYXZnX3NpemVfZ3VpZGVsaW5lOm1wYV9hdmdfc2l6ZV9ndWlkZWxpbmVcbiAgICAgIHBsdXJhbF9tcGFfY291bnQ6IHBsdXJhbF9tcGFfY291bnRcbiAgICAgIGNvbm5lY3RlZF9tcGFfY291bnQ6IGNvbm5lY3RlZF9tcGFfY291bnRcblxuICAgICAgcGx1cmFsX2Nvbm5lY3RlZF9tcGFfY291bnQ6IHBsdXJhbF9jb25uZWN0ZWRfbXBhX2NvdW50XG4gICAgICBtaW5fZGlzdGFuY2U6IG1pbl9kaXN0YW5jZVxuICAgICAgbWF4X2Rpc3RhbmNlOiBtYXhfZGlzdGFuY2VcbiAgICAgIG1lYW5fZGlzdGFuY2U6IG1lYW5fZGlzdGFuY2VcbiAgICAgIHNpbmdsZVNrZXRjaDogbnVtU2tldGNoZXMgPT0gMVxuICAgICAgaXNNUEE6IGlzTVBBXG4gICAgICBudW1faGFiczogbnVtX2hhYnNcbiAgICAgIHRvdGFsX2hhYnM6IFRPVEFMX0hBQlNcbiAgICAgIG51bV9yZXByZXNlbnRlZF9oYWJzOiBudW1fcmVwcmVzZW50ZWRfaGFic1xuICAgICAgbnVtX3JlcGxpY2F0ZWRfaGFiczogbnVtX3JlcGxpY2F0ZWRfaGFic1xuICAgICAgaXNHZW5lcmljOiBpc0dlbmVyaWNcblxuICAgIEAkZWwuaHRtbCBAdGVtcGxhdGUucmVuZGVyKGNvbnRleHQsIHBhcnRpYWxzKVxuICAgIEBlbmFibGVMYXllclRvZ2dsZXJzKClcblxuICAgICNzaXplX3BpZV92YWx1ZXMgPSBAYnVpbGRfdmFsdWVzKFwiTWVldHMgTWluLiBTaXplXCIsIG1wYV9jb3VudCxcIiNiM2NmYTdcIiwgXCJEb2VzIG5vdCBNZWV0IFNpemUgTWluLlwiLCBcbiAgICAjICB0b3RhbF9tcGFfY291bnQtbXBhX2NvdW50LCBcIiNlNWNhY2VcIilcblxuXG4gICAgY29uc29sZS5sb2cocmVwcmVzZW50ZWRfaGFic19waWVfdmFsdWVzKVxuICAgIEBkcmF3UGllKHJlcHJlc2VudGVkX2hhYnNfcGllX3ZhbHVlcywgXCIjcmVwcmVzZW50ZWRfaGFic19waWVcIilcbiAgICBAZHJhd1BpZShyZXBsaWNhdGVkX2hhYnNfcGllX3ZhbHVlcywgXCIjcmVwbGljYXRlZF9oYWJzX3BpZVwiKVxuICAgIEBkcmF3UGllKGNvbm5fcGllX3ZhbHVlcywgXCIjY29ubmVjdGl2aXR5X3BpZVwiKVxuICBcblxuICBidWlsZF92YWx1ZXM6ICh5ZXNfbGFiZWwsIHllc19jb3VudCwgeWVzX2NvbG9yLCBub19sYWJlbCwgbm9fY291bnQsIG5vX2NvbG9yKSA9PlxuICAgIHllc192YWwgPSB7XCJsYWJlbFwiOnllc19sYWJlbCtcIiAoXCIreWVzX2NvdW50K1wiKVwiLCBcInZhbHVlXCI6eWVzX2NvdW50LCBcImNvbG9yXCI6eWVzX2NvbG9yLCBcInl2YWxcIjoyNX1cbiAgICBub192YWwgPSB7XCJsYWJlbFwiOm5vX2xhYmVsK1wiIChcIitub19jb3VudCtcIilcIiwgXCJ2YWx1ZVwiOm5vX2NvdW50LCBcImNvbG9yXCI6bm9fY29sb3IsIFwieXZhbFwiOjUwfVxuXG4gICAgcmV0dXJuIFt5ZXNfdmFsLCBub192YWxdXG5cbiAgZ2V0RGF0YVZhbHVlOiAoZGF0YSkgPT5cbiAgICByZXR1cm4gZGF0YS52YWx1ZVxuXG4gIGRyYXdQaWU6IChkYXRhLCBwaWVfbmFtZSkgPT5cbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIHcgPSA5MFxuICAgICAgaCA9IDc1XG4gICAgICByID0gMjVcbiAgICAgXG4gICAgICB2aXMgPSBkMy5zZWxlY3QocGllX25hbWUpLmFwcGVuZChcInN2ZzpzdmdcIikuZGF0YShbZGF0YV0pLmF0dHIoXCJ3aWR0aFwiLCB3KS5hdHRyKFwiaGVpZ2h0XCIsIGgpLmFwcGVuZChcInN2ZzpnXCIpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyAocioyKSArIFwiLFwiICsgKHIrNSkgKyBcIilcIilcbiAgICAgIHBpZSA9IGQzLmxheW91dC5waWUoKS52YWx1ZSgoZCkgLT4gcmV0dXJuIGQudmFsdWUpXG5cbiAgICAgICNkZWNsYXJlIGFuIGFyYyBnZW5lcmF0b3IgZnVuY3Rpb25cbiAgICAgIGFyYyA9IGQzLnN2Zy5hcmMoKS5vdXRlclJhZGl1cyhyKVxuXG4gICAgICAjc2VsZWN0IHBhdGhzLCB1c2UgYXJjIGdlbmVyYXRvciB0byBkcmF3XG4gICAgICBhcmNzID0gdmlzLnNlbGVjdEFsbChcImcuc2xpY2VcIikuZGF0YShwaWUpLmVudGVyKCkuYXBwZW5kKFwic3ZnOmdcIikuYXR0cihcImNsYXNzXCIsIFwic2xpY2VcIilcbiAgICAgIGFyY3MuYXBwZW5kKFwic3ZnOnBhdGhcIilcbiAgICAgICAgLmF0dHIoXCJmaWxsXCIsIChkKSAtPiByZXR1cm4gZC5kYXRhLmNvbG9yKVxuICAgICAgICAuYXR0cihcInN0cm9rZVwiLCAoZCkgLT4gcmV0dXJuIGlmIGQuZGF0YS52YWx1ZSA9PSAwIHRoZW4gXCJub25lXCIgZWxzZSBcIiM1NDU0NTRcIilcbiAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMC4yNSlcbiAgICAgICAgLmF0dHIoXCJkXCIsIChkKSAtPiAgXG4gICAgICAgICAgYXJjKGQpXG4gICAgICAgIClcblxuXG4gICAgICBlbCA9IEAkKHBpZV9uYW1lK1wiX2xlZ2VuZFwiKVswXVxuICAgICAgY2hhcnQgPSBkMy5zZWxlY3QoZWwpXG4gICAgICBsZWdlbmRzID0gY2hhcnQuc2VsZWN0QWxsKHBpZV9uYW1lK1wiX2xlZ2VuZFwiKVxuICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgLmVudGVyKCkuaW5zZXJ0KFwiZGl2XCIpXG4gICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImxlZ2VuZC1yb3dcIilcblxuICAgICAgbGVnZW5kcy5hcHBlbmQoXCJzcGFuXCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJwaWUtbGFiZWwtc3dhdGNoXCIpXG4gICAgICAgIC5zdHlsZSgnYmFja2dyb3VuZC1jb2xvcicsIChkLGkpIC0+IGQuY29sb3IpXG4gICAgICBcbiAgICAgIGxlZ2VuZHMuYXBwZW5kKFwic3BhblwiKVxuICAgICAgICAudGV4dCgoZCxpKSAtPiByZXR1cm4gZGF0YVtpXS5sYWJlbClcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInBpZS1sYWJlbFwiKVxuXG4gICAgICBcblxuICBnZXRUb3RhbEFyZWFQZXJjZW50OiAocHJvcF9zaXplcykgPT5cblxuICAgIGZvciBwcyBpbiBwcm9wX3NpemVzXG4gICAgICBpZiBwcy5OQU1FID09IFwiUGVyY2VudCBvZiBUb3RhbCBBcmVhXCJcbiAgICAgICAgcmV0dXJuIHBzLlNJWkVfU1FLTVxuICAgIHJldHVybiAwLjBcblxuICBnZXRBdmVyYWdlTWluRGltOiAocHJvcF9zaXplcykgPT5cbiAgICBmb3IgcHMgaW4gcHJvcF9zaXplc1xuICAgICAgaWYgcHMuTkFNRSA9PSBcIkF2ZXJhZ2VcIlxuICAgICAgICByZXR1cm4gcHMuTUlOX0RJTVxuXG4gIGNsZWFudXBEYXRhOiAocHJvcF9zaXplcywgaXNDb2xsZWN0aW9uKSA9PlxuICAgIGNsZWFuZWRfcHJvcHMgPSBbXVxuICAgIG51bV9za2V0Y2hlcyA9IHByb3Bfc2l6ZXM/Lmxlbmd0aFxuICAgIGZvciBwcyBpbiBwcm9wX3NpemVzXG4gICAgICBpZiBwcy5OQU1FICE9IFwiUGVyY2VudCBvZiBUb3RhbCBBcmVhXCJcbiAgICAgICAgcHMuTUlOX0RJTSA9IHBhcnNlRmxvYXQocHMuTUlOX0RJTSkudG9GaXhlZCgxKVxuICAgICAgICBwcy5TSVpFX1NRS00gPSBwYXJzZUZsb2F0KHBzLlNJWkVfU1FLTSkudG9GaXhlZCgxKVxuICAgICAgICBpZiBwcy5TSVpFX1NRS00gPCAwLjFcbiAgICAgICAgICBwcy5TSVpFX1NRS00gPSBcIjwgMC4xXCJcbiAgICAgICAgcHMuQ09BU1QgPSBOdW1iZXIocHMuQ09BU1QpLnRvRml4ZWQoMSlcbiAgICAgICAgaWYgcHMuQ09BU1QgPT0gMCBcbiAgICAgICAgICBwcy5DT0FTVCA9IFwiLS1cIlxuICAgICAgICAjZG9uJ3QgaW5jbHVkZSBhdmVyYWdlIGZvciBzaW5nZSBza2V0Y2hcbiAgICAgICAgaWYgbnVtX3NrZXRjaGVzID09IDMgXG4gICAgICAgICAgaWYgcHMuTkFNRSAhPSBcIkF2ZXJhZ2VcIlxuICAgICAgICAgICAgY2xlYW5lZF9wcm9wcy5wdXNoKHBzKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgY2xlYW5lZF9wcm9wcy5wdXNoKHBzKVxuXG4gICAgcmV0dXJuIGNsZWFuZWRfcHJvcHNcblxuICBnZXRNaW5EaW1Db3VudDogKHByb3Bfc2l6ZXMpID0+XG4gICAgbnVtX21lZXRfY3JpdGVyaWEgPSAwXG4gICAgdG90YWxfbWluX3NpemUgPSAwXG5cbiAgICBmb3IgcHMgaW4gcHJvcF9zaXplc1xuICAgICAgaWYgcHMuTkFNRSAhPSBcIkF2ZXJhZ2VcIiAmJiBwcy5NSU5fRElNID4gNSBcbiAgICAgICAgbnVtX21lZXRfY3JpdGVyaWErPTFcblxuICAgIHJldHVybiBudW1fbWVldF9jcml0ZXJpYVxuXG4gIGFkZENvbW1hczogKG51bV9zdHIpID0+XG4gICAgbnVtX3N0ciArPSAnJ1xuICAgIHggPSBudW1fc3RyLnNwbGl0KCcuJylcbiAgICB4MSA9IHhbMF1cbiAgICB4MiA9IGlmIHgubGVuZ3RoID4gMSB0aGVuICcuJyArIHhbMV0gZWxzZSAnJ1xuICAgIHJneCA9IC8oXFxkKykoXFxkezN9KS9cbiAgICB3aGlsZSByZ3gudGVzdCh4MSlcbiAgICAgIHgxID0geDEucmVwbGFjZShyZ3gsICckMScgKyAnLCcgKyAnJDInKVxuICAgIHJldHVybiB4MSArIHgyXG5cbm1vZHVsZS5leHBvcnRzID0gT3ZlcnZpZXdUYWIiLCJPdmVydmlld1RhYiA9IHJlcXVpcmUgJy4vb3ZlcnZpZXcuY29mZmVlJ1xuVXNlc1RhYiA9IHJlcXVpcmUgJy4vdXNlcy5jb2ZmZWUnXG5FbnZpcm9ubWVudFRhYiA9IHJlcXVpcmUgJy4vZW52aXJvbm1lbnQuY29mZmVlJ1xuRmlzaGluZ1RhYiA9IHJlcXVpcmUgJy4vZmlzaGluZy5jb2ZmZWUnXG5cbndpbmRvdy5hcHAucmVnaXN0ZXJSZXBvcnQgKHJlcG9ydCkgLT5cbiAgcmVwb3J0LnRhYnMgW092ZXJ2aWV3VGFiLCBFbnZpcm9ubWVudFRhYiwgRmlzaGluZ1RhYixVc2VzVGFiXVxuICAjIHBhdGggbXVzdCBiZSByZWxhdGl2ZSB0byBkaXN0L1xuICByZXBvcnQuc3R5bGVzaGVldHMgWycuL3JlcG9ydC5jc3MnXVxuIiwiUmVwb3J0VGFiID0gcmVxdWlyZSAncmVwb3J0VGFiJ1xudGVtcGxhdGVzID0gcmVxdWlyZSAnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxuX3BhcnRpYWxzID0gcmVxdWlyZSAnLi4vbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cbmlkcyA9IHJlcXVpcmUgJy4vaWRzLmNvZmZlZSdcbmZvciBrZXksIHZhbHVlIG9mIGlkc1xuICB3aW5kb3dba2V5XSA9IHZhbHVlXG5cblxuY2xhc3MgVXNlc1RhYiBleHRlbmRzIFJlcG9ydFRhYlxuICAjIHRoaXMgaXMgdGhlIG5hbWUgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgVGFiXG4gIG5hbWU6ICdPdGhlcidcbiAgY2xhc3NOYW1lOiAndXNlcydcbiAgdGltZW91dDogMTIwMDAwXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZXMudXNlc1xuICBkZXBlbmRlbmNpZXM6IFtcbiAgICAnT3ZlcmxhcFdpdGhSZWNyZWF0aW9uYWxVc2VzJ1xuICAgICdTcGVjaWVzSW5mb3JtYXRpb24nXG4gIF1cblxuXG4gIHJlbmRlcjogKCkgLT5cblxuICAgICNzaG93IHRhYmxlcyBpbnN0ZWFkIG9mIGdyYXBoIGZvciBJRVxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgZDNJc1ByZXNlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgZDNJc1ByZXNlbnQgPSBmYWxzZVxuXG4gICAgI3NwZWNpZXMgaW5mb1xuICAgIHRyeVxuICAgICAgc2VhYmlyZHMgPSBAcmVjb3JkU2V0KCdTcGVjaWVzSW5mb3JtYXRpb24nLCAnU2VhYmlyZHMnKS50b0FycmF5KClcbiAgICAgIGhhc1NlYWJpcmRBcmVhcyA9IHNlYWJpcmRzPy5sZW5ndGggPiAwXG4gICAgY2F0Y2ggRXJyb3JcbiAgICAgIGhhc1NlYWJpcmRBcmVhcyA9IGZhbHNlXG5cbiAgICB0cnlcbiAgICAgIHNlYWJpcmRfY29sb25pZXMgPSBAcmVjb3JkU2V0KCdTcGVjaWVzSW5mb3JtYXRpb24nLCAnU2VhYmlyZENvbG9uaWVzJykudG9BcnJheSgpXG4gICAgICBoYXNTZWFiaXJkQ29sb25pZXMgPSBzZWFiaXJkX2NvbG9uaWVzPy5sZW5ndGggPiAwXG4gICAgY2F0Y2ggRXJyb3JcbiAgICAgIGhhc1NlYWJpcmRDb2xvbmllcyA9IGZhbHNlXG5cbiAgICBcbiAgICBoYXNTZWFiaXJkcyA9IChzZWFiaXJkcz8ubGVuZ3RoPiAwIG9yIHNlYWJpcmRfY29sb25pZXM/Lmxlbmd0aCA+IDApXG4gICAgbWFtbWFscyA9IEByZWNvcmRTZXQoJ1NwZWNpZXNJbmZvcm1hdGlvbicsICdNYW1tYWxzJykudG9BcnJheSgpXG4gICAgaGFzTWFtbWFscyA9IG1hbW1hbHM/Lmxlbmd0aCA+IDBcbiAgICB0cnlcbiAgICAgIHNlYWxzID0gQHJlY29yZFNldCgnU3BlY2llc0luZm9ybWF0aW9uJywgJ1NlYWxzJykudG9BcnJheSgpXG4gICAgICBoYXNTZWFscyA9IHNlYWxzPy5sZW5ndGggPiAwXG4gICAgY2F0Y2ggRXJyb3JcbiAgICAgIGhhc1NlYWxzID0gZmFsc2VcblxuICAgIFxuICAgIHJlZWZfZmlzaCA9IEByZWNvcmRTZXQoJ1NwZWNpZXNJbmZvcm1hdGlvbicsICdSZWVmRmlzaCcpLnRvQXJyYXkoKVxuICAgIGluSGlnaERpdmVyc2l0eVJlZWZGaXNoQXJlYSA9IHJlZWZfZmlzaD8ubGVuZ3RoID4gMFxuXG4gICAgc21hcm8gPSBcIlNNQVJPXCJcbiAgICByZWNfdXNlcyA9IEByZWNvcmRTZXQoJ092ZXJsYXBXaXRoUmVjcmVhdGlvbmFsVXNlcycsICdSZWNyZWF0aW9uYWxVc2UnKS50b0FycmF5KClcbiAgICBoYXNTbWFybyA9IGZhbHNlXG5cblxuICAgIG5vbl9zbWFyb19yZWNfdXNlcyA9IHJlY191c2VzLmZpbHRlciAocmVjKSAtPiByZWMuRkVBVF9UWVBFICE9IHNtYXJvXG4gICAgaGFzUmVjVXNlcyA9IG5vbl9zbWFyb19yZWNfdXNlcz8ubGVuZ3RoID4gMFxuICAgIFxuICAgIGhlcml0YWdlID0gQHJlY29yZFNldCgnT3ZlcmxhcFdpdGhSZWNyZWF0aW9uYWxVc2VzJywgJ0hlcml0YWdlJykudG9BcnJheSgpXG4gICAgaGFzSGVyaXRhZ2UgPSBoZXJpdGFnZT8ubGVuZ3RoID4gMFxuICAgIGNvYXN0YWxfY29uc2VudHMgPSBAcmVjb3JkU2V0KCdPdmVybGFwV2l0aFJlY3JlYXRpb25hbFVzZXMnLCAnQ29hc3RhbENvbnNlbnRzJykudG9BcnJheSgpXG4gICAgaGFzQ29hc3RhbCA9IGNvYXN0YWxfY29uc2VudHM/Lmxlbmd0aCA+IDBcbiAgICBpbmZyYXN0cnVjdHVyZSA9ICBAcmVjb3JkU2V0KCdPdmVybGFwV2l0aFJlY3JlYXRpb25hbFVzZXMnLCAnSW5mcmFzdHJ1Y3R1cmUnKS50b0FycmF5KClcbiAgICBoYXNJbmZyYXN0cnVjdHVyZSA9IGluZnJhc3RydWN0dXJlPy5sZW5ndGggPiAwXG4gICAgYXR0cmlidXRlcyA9IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICBcbiAgICBoYXNVc2VzID0gaGFzUmVjVXNlcyBvciBoYXNIZXJpdGFnZSBvciBoYXNJbmZyYXN0cnVjdHVyZSBvciBoYXNDb2FzdGFsXG4gICAgaGFzTWFyaW5lU3BlY2llcyA9IGhhc01hbW1hbHMgb3IgaGFzU2VhbHNcblxuICAgIGlzQ29sbGVjdGlvbiA9IEBtb2RlbC5pc0NvbGxlY3Rpb24oKVxuICAgIGNvbnRleHQgPVxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcbiAgICAgIHJlY191c2VzOiBub25fc21hcm9fcmVjX3VzZXNcbiAgICAgIGhhc1NtYXJvOiBoYXNTbWFyb1xuICAgICAgaGFzUmVjVXNlczogaGFzUmVjVXNlc1xuICAgICAgaGVyaXRhZ2U6IGhlcml0YWdlXG4gICAgICBoYXNIZXJpdGFnZTogaGFzSGVyaXRhZ2VcbiAgICAgIGNvYXN0YWxfY29uc2VudHM6IGNvYXN0YWxfY29uc2VudHNcbiAgICAgIGhhc0NvYXN0YWw6IGhhc0NvYXN0YWxcbiAgICAgIGluZnJhc3RydWN0dXJlOiBpbmZyYXN0cnVjdHVyZVxuICAgICAgaGFzSW5mcmFzdHJ1Y3R1cmU6IGhhc0luZnJhc3RydWN0dXJlXG4gICAgICBoYXNVc2VzOiBoYXNVc2VzXG4gICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuXG4gICAgICAjc3BlY2llcyBpbmZvXG4gICAgICBzZWFiaXJkczogc2VhYmlyZHNcbiAgICAgIHNlYWJpcmRfY29sb25pZXM6IHNlYWJpcmRfY29sb25pZXNcbiAgICAgIGhhc1NlYWJpcmRzOiBoYXNTZWFiaXJkc1xuICAgICAgaGFzU2VhYmlyZEFyZWFzOiBoYXNTZWFiaXJkQXJlYXNcbiAgICAgIGhhc1NlYWJpcmRDb2xvbmllczogaGFzU2VhYmlyZENvbG9uaWVzXG4gICAgICBcbiAgICAgIG1hbW1hbHM6IG1hbW1hbHNcbiAgICAgIGhhc01hbW1hbHM6IGhhc01hbW1hbHNcbiAgICAgIHJlZWZfZmlzaDogcmVlZl9maXNoXG4gICAgICBzZWFsczogc2VhbHNcbiAgICAgIGhhc1NlYWxzOiBoYXNTZWFsc1xuXG4gICAgICBpbkhpZ2hEaXZlcnNpdHlSZWVmRmlzaEFyZWE6IGluSGlnaERpdmVyc2l0eVJlZWZGaXNoQXJlYVxuICAgICAgaGFzTWFyaW5lU3BlY2llczogaGFzTWFyaW5lU3BlY2llc1xuXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgcGFydGlhbHMpXG4gICAgQGVuYWJsZUxheWVyVG9nZ2xlcnMoKVxuXG4gICAgXG5cbm1vZHVsZS5leHBvcnRzID0gVXNlc1RhYiIsInRoaXNbXCJUZW1wbGF0ZXNcIl0gPSB0aGlzW1wiVGVtcGxhdGVzXCJdIHx8IHt9O1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcImRlbW9cIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+UmVwb3J0IFNlY3Rpb25zPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwPlVzZSByZXBvcnQgc2VjdGlvbnMgdG8gZ3JvdXAgaW5mb3JtYXRpb24gaW50byBtZWFuaW5nZnVsIGNhdGVnb3JpZXM8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5EMyBWaXN1YWxpemF0aW9uczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8dWwgY2xhc3M9XFxcIm5hdiBuYXYtcGlsbHNcXFwiIGlkPVxcXCJ0YWJzMlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxsaSBjbGFzcz1cXFwiYWN0aXZlXFxcIj48YSBocmVmPVxcXCIjY2hhcnRcXFwiPkNoYXJ0PC9hPjwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxsaT48YSBocmVmPVxcXCIjZGF0YVRhYmxlXFxcIj5UYWJsZTwvYT48L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC91bD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInRhYi1jb250ZW50XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwidGFiLXBhbmUgYWN0aXZlXFxcIiBpZD1cXFwiY2hhcnRcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwhLS1baWYgSUUgOF0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcInVuc3VwcG9ydGVkXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICBUaGlzIHZpc3VhbGl6YXRpb24gaXMgbm90IGNvbXBhdGlibGUgd2l0aCBJbnRlcm5ldCBFeHBsb3JlciA4LiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICBQbGVhc2UgdXBncmFkZSB5b3VyIGJyb3dzZXIsIG9yIHZpZXcgcmVzdWx0cyBpbiB0aGUgdGFibGUgdGFiLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD4gICAgICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8IVtlbmRpZl0tLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIFNlZSA8Y29kZT5zcmMvc2NyaXB0cy9kZW1vLmNvZmZlZTwvY29kZT4gZm9yIGFuIGV4YW1wbGUgb2YgaG93IHRvIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgdXNlIGQzLmpzIHRvIHJlbmRlciB2aXN1YWxpemF0aW9ucy4gUHJvdmlkZSBhIHRhYmxlLWJhc2VkIHZpZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIGFuZCB1c2UgY29uZGl0aW9uYWwgY29tbWVudHMgdG8gcHJvdmlkZSBhIGZhbGxiYWNrIGZvciBJRTggdXNlcnMuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8YnI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8YSBocmVmPVxcXCJodHRwOi8vdHdpdHRlci5naXRodWIuaW8vYm9vdHN0cmFwLzIuMy4yL1xcXCI+Qm9vdHN0cmFwIDIueDwvYT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIGlzIGxvYWRlZCB3aXRoaW4gU2VhU2tldGNoIHNvIHlvdSBjYW4gdXNlIGl0IHRvIGNyZWF0ZSB0YWJzIGFuZCBvdGhlciBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIGludGVyZmFjZSBjb21wb25lbnRzLiBqUXVlcnkgYW5kIHVuZGVyc2NvcmUgYXJlIGFsc28gYXZhaWxhYmxlLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInRhYi1wYW5lXFxcIiBpZD1cXFwiZGF0YVRhYmxlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+aW5kZXg8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD52YWx1ZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJjaGFydERhdGFcIixjLHAsMSksYyxwLDAsMTM1MSwxNDE4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgPHRyPjx0ZD5cIik7Xy5iKF8udihfLmYoXCJpbmRleFwiLGMscCwwKSkpO18uYihcIjwvdGQ+PHRkPlwiKTtfLmIoXy52KF8uZihcInZhbHVlXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD48L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIGVtcGhhc2lzXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5FbXBoYXNpczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cD5HaXZlIHJlcG9ydCBzZWN0aW9ucyBhbiA8Y29kZT5lbXBoYXNpczwvY29kZT4gY2xhc3MgdG8gaGlnaGxpZ2h0IGltcG9ydGFudCBpbmZvcm1hdGlvbi48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHdhcm5pbmdcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0Pldhcm5pbmc8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHA+T3IgPGNvZGU+d2FybjwvY29kZT4gb2YgcG90ZW50aWFsIHByb2JsZW1zLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gZGFuZ2VyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5EYW5nZXI8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHA+PGNvZGU+ZGFuZ2VyPC9jb2RlPiBjYW4gYWxzbyBiZSB1c2VkLi4uIHNwYXJpbmdseS48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcImVudmlyb25tZW50XCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO2lmKF8ucyhfLmQoXCJza2V0Y2hDbGFzcy5kZWxldGVkXCIsYyxwLDEpLGMscCwwLDI0LDI3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtd2FyblxcXCIgc3R5bGU9XFxcIm1hcmdpbi1ib3R0b206MTBweDtcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgVGhpcyBza2V0Y2ggd2FzIGNyZWF0ZWQgdXNpbmcgdGhlIFxcXCJcIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiB0ZW1wbGF0ZSwgd2hpY2ggaXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIG5vIGxvbmdlciBhdmFpbGFibGUuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIGNvcHkgdGhpcyBza2V0Y2ggb3IgbWFrZSBuZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIHNrZXRjaGVzIG9mIHRoaXMgdHlwZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+SGFiaXRhdHMgUHJlc2VudCBpbiBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzOTYsNDA2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJDb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiU2tldGNoXCIpO307Xy5iKFwiIDxhIGhyZWY9XFxcIiNcXFwiIGRhdGEtdG9nZ2xlLW5vZGU9XFxcIjUzYTBhMzFjZDNmNjA2NGQyYzE3NTgwY1xcXCIgZGF0YS12aXNpYmxlPVxcXCJmYWxzZVxcXCI+c2hvdyBsYXllcjwvYT48L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIEFyZWEgKCUpIHJlZmVycyB0byB0aGUgcGVyY2VudGFnZSBvZiB0aGUgaGFiaXRhdCBjb250YWluZWQgd2l0aGluIHRoZSBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIFwiKTtpZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDY4MCw2OTAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJuZXR3b3JrXCIpO307Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIFwiKTtpZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaFwiKTt9O18uYihcIiBhcyBhIHByb3BvcnRpb24gb2YgdGhlIHRvdGFsIGFyZWEgb2YgaGFiaXRhdCB3aXRoaW4gdGhlIFNvdXRoLUVhc3QgTWFyaW5lIHJlZ2lvbi4gT25seSBoYWJpdGF0cyB0aGF0IG1lZXQgY3JpdGVyaWEgZm9yIGEgdmlhYmxlIGhhYml0YXQgc2l6ZSBhcmUgaW5jbHVkZWQgYXMgYSDigJhyZXByZXNlbnRlZOKAmSBoYWJpdGF0LlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvaT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxwIGNsYXNzPVxcXCJpbi1yZXBvcnQtaGVhZGVyXFxcIj5IYWJpdGF0IHR5cGVzPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MTgwcHg7XFxcIj5IYWJpdGF0PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoPkFyZWEgKGttPHN1cD4yPC9zdXA+KTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aD5BcmVhICglKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aD5SZXByZXNlbnRlZDwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDEyNzMsMTI5MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPHRoPlJlcGxpY2F0ZWQ8L3RoPlwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzSGFiVHlwZXNcIixjLHAsMSksYyxwLDAsMTM3NywxNjY3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZihfLnMoXy5mKFwiaGFiX3R5cGVzXCIsYyxwLDEpLGMscCwwLDE0MDIsMTY0NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiSEFCX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJTSVpFX1NRS01cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJQRVJDXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiUkVQUkVTRU5UXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxNTgxLDE2MDAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjx0ZD5cIik7Xy5iKF8udihfLmYoXCJSRVBMSUNcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtpZighXy5zKF8uZihcImhhc0hhYlR5cGVzXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQgY29sc3Bhbj1cXFwiXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMTc3NSwxNzc2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI1XCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiNFwiKTt9O18uYihcIlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8aT5UaGVyZSBhcmUgbm8gaGFiaXRhdCB0eXBlcy48L2k+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxwIGNsYXNzPVxcXCJpbi1yZXBvcnQtaGVhZGVyXFxcIj5IYWJpdGF0cyBvZiBTaWduaWZpY2FuY2U8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoxODBweDtcXFwiPkhhYml0YXQ8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGg+QXJlYSAoa208c3VwPjI8L3N1cD4pPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoPkFyZWEgKCUpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoPlJlcHJlc2VudGVkPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMjI2NCwyMjgzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8dGg+UmVwbGljYXRlZDwvdGg+XCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNTaWdIYWJzXCIsYyxwLDEpLGMscCwwLDIzNjcsMjY2OSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcInNpZ19oYWJzXCIsYyxwLDEpLGMscCwwLDIzOTEsMjY0NyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkhBQl9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJTSVpFX1NRS01cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlBFUkNcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlJFUFJFU0VOVFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwyNTgyLDI2MDEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjx0ZD5cIik7Xy5iKF8udihfLmYoXCJSRVBMSUNcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc1NpZ0hhYnNcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQgY29sc3Bhbj1cXFwiXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMjc2NCwyNzY1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI1XCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiNFwiKTt9O18uYihcIlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8aT5UaGVyZSBhcmUgbm8gaGFiaXRhdHMgb2Ygc2lnbmlmaWNhbmNlLjwvaT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzaG93QWRqYWNlbnRcIixjLHAsMSksYyxwLDAsMzAwNiw0NDgzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDQ+QWRqYWNlbnQgVGVycmVzdHJpYWwgSW5mb3JtYXRpb248L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHA+PGVtPk1QQSBHdWlkZWxpbmVzOiBcXFwiQ29uc2lkZXIgYWRqYWNlbnQgdGVycmVzdHJpYWwgZW52aXJvbm1lbnRcXFwiIChhcmVhcyBzaG93biBiZWxvdyBhcmUgd2l0aGluIDEwMG0gb2YgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMzIyOCwzMjU0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJhIHNrZXRjaCBpbiB0aGUgY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiB0aGUgc2tldGNoIFwiKTt9O18uYihcIik8L2VtPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+PHN0cm9uZz5Qcm90ZWN0ZWQgQXJlYXM8L3N0cm9uZz48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNQcm90ZWN0ZWRcIixjLHAsMSksYyxwLDAsMzQ3MCwzNjI2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZihfLnMoXy5mKFwicHJvdGVjdGVkX2FyZWFzXCIsYyxwLDEpLGMscCwwLDM1MDUsMzU5MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJOQU1FXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc1Byb3RlY3RlZFwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+PGVtPk5vbmUgUHJlc2VudDwvZW0+PC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9O18uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+PHN0cm9uZz5Db25zZXJ2YXRpb24gQ292ZW5hbnRzPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzQ292ZW5hbnRzXCIsYyxwLDEpLGMscCwwLDM5NzUsNDI3NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcInFlMl9jb3ZlbmFudHNcIixjLHAsMSksYyxwLDAsNDAwOCw0MDk2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJuYXBhbGlzX2NvdmVuYW50c1wiLGMscCwxKSxjLHAsMCw0MTUxLDQyMzksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJoYXNDb3ZlbmFudHNcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPjxlbT5Ob25lIFByZXNlbnQ8L2VtPjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCIgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJmaXNoaW5nXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO2lmKF8ucyhfLmQoXCJza2V0Y2hDbGFzcy5kZWxldGVkXCIsYyxwLDEpLGMscCwwLDI0LDI3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtd2FyblxcXCIgc3R5bGU9XFxcIm1hcmdpbi1ib3R0b206MTBweDtcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgVGhpcyBza2V0Y2ggd2FzIGNyZWF0ZWQgdXNpbmcgdGhlIFxcXCJcIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiB0ZW1wbGF0ZSwgd2hpY2ggaXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIG5vIGxvbmdlciBhdmFpbGFibGUuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIGNvcHkgdGhpcyBza2V0Y2ggb3IgbWFrZSBuZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIHNrZXRjaGVzIG9mIHRoaXMgdHlwZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc0FueUZpc2hpbmdcIixjLHAsMSksYyxwLDAsMzE2LDI1NjAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJoYXNFeGlzdGluZ0Zpc2hpbmdcIixjLHAsMSksYyxwLDAsMzQ0LDEzODQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+RXhpc3RpbmcgRmlzaGVyaWVzIE1hbmFnZW1lbnQ8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8cD48ZW0+VGhlIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDQ3NSw0ODUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJTa2V0Y2hcIik7fTtfLmIoXCIgaW5jbHVkZXMgdGhlIGZvbGxvd2luZyBleGlzdGluZyBmaXNoZXJpZXMgcmVzdHJpY3Rpb25zLiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgQWxzbyBzaG93biBpcyB0aGUgZXh0ZW50IHRoYXQgdGhlIGZpc2hlcmllcyByZXN0cmljdGlvbnMgYXBwbHkgdG8gdGhlIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDY5Nyw3MDUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcInNrZXRjaGVzXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIFwiKTtpZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaFwiKTt9O18uYihcIiBhcyBhIHBlcmNlbnRhZ2Ugb2YgdG90YWwgc2tldGNoIGFyZWEuIEZvciBleGFtcGxlLCAxMDAlIG1lYW5zIG5vIGZpc2hpbmcgb2YgdGhhdCB0eXBlIGlzIGN1cnJlbnRseSBhbGxvd2VkIHdpdGhpbiB0aGUgc2tldGNoLjwvZW0+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5OYW1lPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRoPlBlcmNlbnQ8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiZXhpc3RpbmdfZmlzaGluZ19hcmVhc1wiLGMscCwxKSxjLHAsMCwxMTY5LDEzMDEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlBFUkNfQVJFQVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaGFzQ3VzdG9tYXJ5XCIsYyxwLDEpLGMscCwwLDE0MjksMjU0MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDQ+Q3VzdG9tYXJ5IEFyZWFzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzRXhpc3RpbmdDdXN0b21hcnlcIixjLHAsMSksYyxwLDAsMTU0NSwxOTkyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgPHA+IFRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxNTgxLDE1OTEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgaW5jbHVkZXMgdGhlIGZvbGxvd2luZyA8c3Ryb25nPmV4aXN0aW5nPC9zdHJvbmc+IEN1c3RvbWFyeSBBcmVhczo8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmdcIixjLHAsMSksYyxwLDAsMTgxOSwxOTEyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkZFQVRfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJoYXNQcm9wb3NlZEN1c3RvbWFyeVwiLGMscCwxKSxjLHAsMCwyMDUxLDI0OTgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8cD4gVGhlIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDIwODcsMjA5NyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaFwiKTt9O18uYihcIiBpbmNsdWRlcyB0aGUgZm9sbG93aW5nIDxzdHJvbmc+cHJvcG9zZWQ8L3N0cm9uZz4gQ3VzdG9tYXJ5IEFyZWFzOjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJwcm9wb3NlZF9jdXN0b21hcnlfZmlzaGluZ1wiLGMscCwxKSxjLHAsMCwyMzI1LDI0MTgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJoYXNBbnlGaXNoaW5nXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PkV4aXN0aW5nIG9yIEN1c3RvbWFyeSBBcmVhczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cD5ObyBpbmZvcm1hdGlvbiBvbiBleGlzdGluZyBmaXNoaW5nIGFyZWFzIG9yIGN1c3RvbWFyeSB1c2UgaXMgYXZhaWxhYmxlIGZvciB0aGlzIGFyZWEuPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9O18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDI4MjQsNDcwNSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PkZpc2hpbmcgSW50ZW5zaXR5PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgVGhlIGZvbGxvd2luZyB0YWJsZXMgY29udGFpbnMgdGhlIHBlcmNlbnQgb2YgdGhlIHRvdGFsIFNFTVBGIGxvdyBpbnRlbnNpdHkgYW5kIGhpZ2ggaW50ZW5zaXR5IGZpc2hpbmcgdGhhdCBtYXkgYmUgZGlzcGxhY2VkIGJ5IHRoZSBza2V0Y2guIDxzdHJvbmc+SGlnaCBpbnRlbnNpdHk8L3N0cm9uZz4gaXMgZ3JlYXRlciB0aGFuIGFuIGF2ZXJhZ2Ugb2YgNSBldmVudHMgcGVyIGFubnVtLCA8c3Ryb25nPkxvdzwvc3Ryb25nPiBpcyA1IG9yIGxlc3MgZXZlbnRzIHBlciBhbm51bS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImluLXJlcG9ydC1oZWFkZXJcXFwiPlRyYXdsIEZpc2hpbmcgSW50ZW5zaXR5PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPlNrZXRjaCBOYW1lPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+JSBMb3cgSW50ZW5zaXR5PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+JSBIaWdoIEludGVuc2l0eTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInRyYXdsXCIsYyxwLDEpLGMscCwwLDM1MTksMzY1MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkxPV1wiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkhJR0hcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwiaW4tcmVwb3J0LWhlYWRlclxcXCI+U2V0IE5ldCBGaXNoaW5nIEludGVuc2l0eTwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPlNrZXRjaCBOYW1lPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD4lIExvdyBJbnRlbnNpdHk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPiUgSGlnaCBJbnRlbnNpdHk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzZXRuZXRcIixjLHAsMSksYyxwLDAsNDAxOSw0MTYyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTE9XXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJISUdIXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJpbi1yZXBvcnQtaGVhZGVyXFxcIj5Mb25nIExpbmUgRmlzaGluZyBJbnRlbnNpdHk8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+U2tldGNoIE5hbWU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD4lIExvdyBJbnRlbnNpdHk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD4lIEhpZ2ggSW50ZW5zaXR5PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImxvbmdsaW5lXCIsYyxwLDEpLGMscCwwLDQ1MTgsNDY0OSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkxPV1wiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkhJR0hcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJvdmVydmlld1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtpZihfLnMoXy5kKFwic2tldGNoQ2xhc3MuZGVsZXRlZFwiLGMscCwxKSxjLHAsMCwyNCwyNzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LXdhcm5cXFwiIHN0eWxlPVxcXCJtYXJnaW4tYm90dG9tOjEwcHg7XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFRoaXMgc2tldGNoIHdhcyBjcmVhdGVkIHVzaW5nIHRoZSBcXFwiXCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIlxcXCIgdGVtcGxhdGUsIHdoaWNoIGlzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBubyBsb25nZXIgYXZhaWxhYmxlLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byBjb3B5IHRoaXMgc2tldGNoIG9yIG1ha2UgbmV3XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBza2V0Y2hlcyBvZiB0aGlzIHR5cGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiYW55QXR0cmlidXRlc1wiLGMscCwxKSxjLHAsMCwzMTMsNTk3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDQ+XCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKF8ucnAoXCJhdHRyaWJ1dGVzL2F0dHJpYnV0ZXNUYWJsZVwiLGMscCxcIiAgICBcIikpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNDM1LDU1NyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgIDx0cj48dGQ+XCIpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw0NTgsNDcyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJOdW1iZXIgb2YgTVBBc1wiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDQ5Niw1MTQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIk51bWJlciBvZiBTa2V0Y2hlc1wiKTt9KTtjLnBvcCgpO31fLmIoXCI8L3RkPlwiKTtfLmIoXy52KF8uZihcIm51bVNrZXRjaGVzXCIsYyxwLDApKSk7Xy5iKFwiPHRkPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw2MzQsMzI0MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMCw2NTEsODk0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGg0Pk51bWJlciBvZiBTa2V0Y2hlcyBpbiBDb2xsZWN0aW9uPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgVGhpcyBjb2xsZWN0aW9uIGNvbnRhaW5zIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibnVtU2tldGNoZXNcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gc2tldGNoXCIpO2lmKF8ucyhfLmYoXCJwbHVyYWxTa2V0Y2hlc1wiLGMscCwxKSxjLHAsMCw4NDcsODQ5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJlc1wiKTt9KTtjLnBvcCgpO31fLmIoXCIuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDkyMiwzMjMxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gc2l6ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGg0PkhhYml0YXRzIFJlcHJlc2VudGVkIGluIGEgZnVsbHkgUHJvdGVjdGVkIEFyZWFcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxhIGhyZWY9XFxcIiNcXFwiIGRhdGEtdG9nZ2xlLW5vZGU9XFxcIjUzYTBhMzFjZDNmNjA2NGQyYzE3NTgwY1xcXCIgZGF0YS12aXNpYmxlPVxcXCJmYWxzZVxcXCI+c2hvdyBsYXllcjwvYT48L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKCFfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICA8c3Ryb25nPk51bWJlciBvZiBIYWJpdGF0IENsYXNzZXM8L3N0cm9uZz48L2JyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIHN0eWxlPVxcXCJtYXJnaW4tdG9wOjBweDtcXFwiIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBUaGVyZSBhcmUgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJ0b3RhbF9oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IGhhYml0YXQgY2xhc3NlcyBpbiB0aGUgcGxhbm5pbmcgcmVnaW9uLCBhbmQgeW91ciBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxMzY4LDEzNzgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgaW5jbHVkZXMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJuZXdfaGFic1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPi4gRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gdGhlIEhhYml0YXQgQ2xhc3NpZmljYXRpb24sIHNlZVwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgdGhlIDxhIGhyZWY9XFxcImh0dHA6Ly93d3cuZG9jLmdvdnQubnovRG9jdW1lbnRzL2NvbnNlcnZhdGlvbi9tYXJpbmUtYW5kLWNvYXN0YWwvbWFyaW5lLXByb3RlY3RlZC1hcmVhcy9tcGEtY2xhc3NpZmljYXRpb24tcHJvdGVjdGlvbi1zdGFuZGFyZC5wZGZcXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIE1hcmluZSBQcm90ZWN0ZWQgQXJlYXMgQ2xhc3NpZmljYXRpb24gYW5kIFByb3RlY3Rpb24gU3RhbmRhcmQ8L2E+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIik7fTtpZihfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDAsMTg0MCwyMDQ0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgIDxkaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInJlcHJlc2VudGVkX2hhYnNfcGllXFxcIiBpZD1cXFwicmVwcmVzZW50ZWRfaGFic19waWVcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXByZXNlbnRlZF9oYWJzX3BpZV9sZWdlbmRcXFwiIGlkPVxcXCJyZXByZXNlbnRlZF9oYWJzX3BpZV9sZWdlbmRcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gc2l6ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGg0PkhhYml0YXRzIFJlcHJlc2VudGVkIGluIGF0IExlYXN0IDIgUHJvdC4gQXJlYXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxhIGhyZWY9XFxcIiNcXFwiIGRhdGEtdG9nZ2xlLW5vZGU9XFxcIjUzYTBhMzFjZDNmNjA2NGQyYzE3NTgwY1xcXCIgZGF0YS12aXNpYmxlPVxcXCJmYWxzZVxcXCI+c2hvdyBsYXllcjwvYT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKCFfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgIDxzdHJvbmc+TnVtYmVyIG9mIEhhYml0YXQgQ2xhc3Nlczwvc3Ryb25nPjwvYnI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cCBzdHlsZT1cXFwibWFyZ2luLXRvcDowcHg7XFxcIiBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBUaGVyZSBhcmUgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJ0b3RhbF9oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IGhhYml0YXQgY2xhc3NlcyBpbiB0aGUgcGxhbm5pbmcgcmVnaW9uLCBhbmQgeW91ciBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwyNTMxLDI1NDEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBpbmNsdWRlcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm5ld19oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+LiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiB0aGUgSGFiaXRhdCBDbGFzc2lmaWNhdGlvbiwgc2VlXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmRvYy5nb3Z0Lm56L0RvY3VtZW50cy9jb25zZXJ2YXRpb24vbWFyaW5lLWFuZC1jb2FzdGFsL21hcmluZS1wcm90ZWN0ZWQtYXJlYXMvbXBhLWNsYXNzaWZpY2F0aW9uLXByb3RlY3Rpb24tc3RhbmRhcmQucGRmXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIE1hcmluZSBQcm90ZWN0ZWQgQXJlYXMgQ2xhc3NpZmljYXRpb24gYW5kIFByb3RlY3Rpb24gU3RhbmRhcmQ8L2E+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3A+XCIpO18uYihcIlxcblwiKTt9O2lmKF8ucyhfLmYoXCJkM0lzUHJlc2VudFwiLGMscCwxKSxjLHAsMCwzMDExLDMyMDEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxkaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBsaWNhdGVkX2hhYnNfcGllXFxcIiBpZD1cXFwicmVwbGljYXRlZF9oYWJzX3BpZVxcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBsaWNhdGVkX2hhYnNfcGllX2xlZ2VuZFxcXCIgaWQ9XFxcInJlcGxpY2F0ZWRfaGFic19waWVfbGVnZW5kXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gc2l6ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+XCIpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCwzMzEyLDMzMjEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIk1QQSBTaXplc1wiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDMzNDUsMzM1NyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiU2tldGNoIFNpemVzXCIpO30pO2MucG9wKCk7fV8uYihcIjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDMzODksMzc1MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzNDExLDM3MzIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIE9mIHRoZSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInRvdGFsX21wYV9jb3VudFwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBNUEFzIGluIHRoZSBuZXR3b3JrLCA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm1wYV9jb3VudFwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBtZWV0XCIpO2lmKCFfLnMoXy5mKFwicGx1cmFsX21wYV9jb3VudFwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNcIik7fTtfLmIoXCIgdGhlIG1pbmltdW0gc2l6ZSBkaW1lbnNpb24gb2YgNWttLiBUaGUgYXZlcmFnZSBtaW5pbXVtIGRpbWVuc2lvbiBpcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm1wYV9hdmdfc2l6ZV9ndWlkZWxpbmVcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gdGhlIDEwLTIwa20gZ3VpZGVsaW5lLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L3A+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDM3NzksMzg0MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgIDxwPlRoZSBzaXplIG9mIHRoZSBza2V0Y2hlcyBpbiB0aGlzIGNvbGxlY3Rpb24gYXJlOjwvcD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aD5cIik7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDM5MzcsMzk0NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiTVBBIE5hbWVcIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMCwzOTY5LDM5ODAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlNrZXRjaCBOYW1lXCIpO30pO2MucG9wKCk7fV8uYihcIjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aD5BcmVhIDwvYnI+KHNxLiBrbS4pPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoxMDBweDtcXFwiPldpZHRoIChrbSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjEwMHB4O1xcXCI+Q29hc3RsaW5lIExlbmd0aCAoa20pPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInByb3Bfc2l6ZXNcIixjLHAsMSksYyxwLDAsNDIxOCw0MzcwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiU0laRV9TUUtNXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk1JTl9ESU1cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiQ09BU1RcIixjLHAsMCkpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICBUaGlzIGNvbWJpbmVkIGFyZWEgd2l0aGluIHRoZSBuZXR3b3JrIGFjY291bnRzIGZvciA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInBlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IE1hcmluZSBhcmVhLCBhbmQgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IGNvYXN0bGluZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw0NjU1LDYwMTgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNDY3NSw2MDAwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxoND5Db25uZWN0aXZpdHk8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzaW5nbGVTa2V0Y2hcIixjLHAsMSksYyxwLDAsNDc2NSw0OTQyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDxwIHN0eWxlPVxcXCJmb250LXN0eWxlOml0YWxpYztjb2xvcjpncmF5O1xcXCIgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgTm8gY29ubmVjdGl2aXR5IGluZm9ybWF0aW9uIGZvciBhIGNvbGxlY3Rpb24gd2l0aCBvbmUgc2tldGNoLiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwic2luZ2xlU2tldGNoXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICAgIDxkaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY29ubmVjdGl2aXR5X3BpZVxcXCIgaWQ9XFxcImNvbm5lY3Rpdml0eV9waWVcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNvbm5lY3Rpdml0eV9waWVfbGVnZW5kXFxcIiBpZD1cXFwiY29ubmVjdGl2aXR5X3BpZV9sZWdlbmRcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5PZiB0aGUgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJ0b3RhbF9tcGFfY291bnRcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gTVBBcyBpbiB0aGUgbmV0d29yaywgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb25uZWN0ZWRfbXBhX2NvdW50XCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+XCIpO2lmKF8ucyhfLmYoXCJwbHVyYWxfY29ubmVjdGVkX21wYV9jb3VudFwiLGMscCwxKSxjLHAsMCw1MzM4LDUzNDIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiBhcmVcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJwbHVyYWxfY29ubmVjdGVkX21wYV9jb3VudFwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiBpc1wiKTt9O18uYihcIiB3aXRoaW4gdGhlIGNvbm5lY3Rpdml0eSByYW5nZSBvZiA1MCAtIDEwMCBrbS4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNvbm5fdmFsdWVzXFxcIj5UaGUgbWluaW11bSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBNUEFzIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibWluX2Rpc3RhbmNlXCIsYyxwLDApKSk7Xy5iKFwiIGttPC9zdHJvbmc+Ljwvc3Bhbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNvbm5fdmFsdWVzXFxcIj5UaGUgbWF4aW11bSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBNUEFzIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibWF4X2Rpc3RhbmNlXCIsYyxwLDApKSk7Xy5iKFwiIGttPC9zdHJvbmc+Ljwvc3Bhbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNvbm5fdmFsdWVzXFxcIj5UaGUgYXZlcmFnZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBNUEFzIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibWVhbl9kaXN0YW5jZVwiLGMscCwwKSkpO18uYihcIiBrbTwvc3Ryb25nPi48L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxwPjxpPkl0IGlzIHJlY29tbWVuZGVkIHRoYXQgTVBBcyBzaG91bGQgYmUgd2l0aGluIDEwMGttIG9mIGVhY2ggb3RoZXIuPC9pPjwvcD5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtpZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDYwNjQsNjQ0OSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gc2l6ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGg0PlNpemU8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBUaGlzIHNrZXRjaCBhcmVhIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwic2l6ZVwiLGMscCwwKSkpO18uYihcIiBzcXVhcmUga2lsb21ldGVyczwvc3Ryb25nPiwgYW5kIGl0IGluY2x1ZGVzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwicGVyY2VudFwiLGMscCwwKSkpO18uYihcIiU8L3N0cm9uZz4gb2YgdGhlIFNvdXRoLUVhc3QgUGxhbm5pbmcgUmVnaW9uLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgVGhpcyBza2V0Y2ggaW5jbHVkZXMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb2FzdGxpbmVfbGVuZ3RoXCIsYyxwLDApKSk7Xy5iKFwiIG1ldGVyczwvc3Ryb25nPiBvZiBjb2FzdGxpbmUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX07Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHNpemVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0Pk51bWJlciBvZiBIYWJpdGF0czwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICBUaGUgXCIpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw2NTg0LDY2NDEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiBNYXJpbmUgUHJvdGVjdGVkIEFyZWFcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw2NjIzLDY2MjQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcInNcIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMCw2NjY1LDY3MDcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcInNrZXRjaFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDY2ODgsNjY5MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiZXNcIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9Xy5iKFwiIGluY2x1ZGVcIik7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJzXCIpO307Xy5iKFwiIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibnVtX2hhYnNcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gb2YgdGhlIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwidG90YWxfaGFic1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBjbGFzc2lmaWVkIGhhYml0YXRzLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJ1c2VzXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO2lmKF8ucyhfLmQoXCJza2V0Y2hDbGFzcy5kZWxldGVkXCIsYyxwLDEpLGMscCwwLDI0LDI3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtd2FyblxcXCIgc3R5bGU9XFxcIm1hcmdpbi1ib3R0b206MTBweDtcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgVGhpcyBza2V0Y2ggd2FzIGNyZWF0ZWQgdXNpbmcgdGhlIFxcXCJcIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiB0ZW1wbGF0ZSwgd2hpY2ggaXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIG5vIGxvbmdlciBhdmFpbGFibGUuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIGNvcHkgdGhpcyBza2V0Y2ggb3IgbWFrZSBuZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIHNrZXRjaGVzIG9mIHRoaXMgdHlwZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJoYXNDb2FzdGFsXCIsYyxwLDEpLGMscCwwLDMxMCwxMDQ1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDQ+RXhpc3RpbmcgQ29hc3RhbCBDb25zZW50cyA8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXRvZ2dsZS1ub2RlPVxcXCI1M2Q3MTlhNDkzODAxNzRhNzc2NmRkODVcXFwiIGRhdGEtdmlzaWJsZT1cXFwiZmFsc2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIHNob3cgbGF5ZXI8L2E+PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwPlwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDUyNCw1NTQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkEgc2tldGNoIHdpdGhpbiB0aGUgY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlRoZSBza2V0Y2hcIik7fTtfLmIoXCIgY29udGFpbnMgb3IgaXMgd2l0aGluIDIwMG0gb2Ygc2l0ZXMgd2l0aCBSZXNvdXJjZSBDb25zZW50cy48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5Db25zZW50IFR5cGU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiY29hc3RhbF9jb25zZW50c1wiLGMscCwxKSxjLHAsMCw4OTMsOTc4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNVc2VzXCIsYyxwLDEpLGMscCwwLDEwNzQsNDE0NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImhhc1JlY1VzZXNcIixjLHAsMSksYyxwLDAsMTA5MiwyMzU2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDQ+UmVjcmVhdGlvbmFsIFVzZXMgPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8IS0tXCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc1NtYXJvXCIsYyxwLDEpLGMscCwwLDEyMDAsMTY4OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgIDxwPjxzdHJvbmc+U3BlY3RydW0gb2YgTUFyaW5lIFJlY3JlYXRpb25hbCBPcHBvcnR1bml0eSAoU01BUk8pPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8cD5cIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxMzM5LDEzNDksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJTa2V0Y2hcIik7fTtfLmIoXCIgaW5jbHVkZXMgYXJlYShzKSBpZGVudGlmaWVkIGFzIGhhdmluZyA8c3Ryb25nPiBtZWRpdW0gb3IgaGlnaCA8L3N0cm9uZz4gcmVjcmVhdGlvbmFsIG9wcG9ydHVuaXR5LlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8ZW0+WW91IGNhbiBmaW5kIG1vcmUgaW5mb3JtYXRpb24gb24gU01BUk8gaW4gdGhlIFxcXCJkYXRhIGRlc2NyaXB0aW9uXFxcIiBieSByaWdodCBjbGlja2luZyBvbiB0aGUgbGF5ZXIgbmFtZS48L2VtPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9icj48L2JyPlwiKTtfLmIoXCJcXG5cIik7fTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAtLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoyNTBweDtcXFwiPkFjdGl2aXR5IFR5cGU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPk51bWJlciBvZiBTaXRlczwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNSZWNVc2VzXCIsYyxwLDEpLGMscCwwLDE5NTksMjE0MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcInJlY191c2VzXCIsYyxwLDEpLGMscCwwLDE5ODcsMjExNSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJGRUFUX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiQ09VTlRcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzUmVjVXNlc1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQgY29sc3Bhbj0yPjxlbT5Ob25lIFByZXNlbnQ8L2VtPjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCIgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc0hlcml0YWdlXCIsYyxwLDEpLGMscCwwLDIzOTEsMzM0NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxoND5BcmNoZW9sb2dpY2FsIEluZm9ybWF0aW9uIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXRvZ2dsZS1ub2RlPVxcXCI1NTc4ZjE0Y2ZmMzkwNTlhNTgzNjQ2YzlcXFwiIGRhdGEtdmlzaWJsZT1cXFwiZmFsc2VcXFwiPnNob3cgbGF5ZXI8L2E+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxwPlwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDI2NTAsMjY4MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiQSBza2V0Y2ggd2l0aGluIHRoZSBjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiVGhlIHNrZXRjaFwiKTt9O18uYihcIiBjb250YWlucyBvciBpcyB3aXRoaW4gMjAwbSBvZiBzaXRlcyBpZGVudGlmaWVkIGFzIGhhdmluZyBzaWduaWZpY2FudCBoZXJpdGFnZSB2YWx1ZXMuPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoyNTBweDtcXFwiPkhlcml0YWdlIFR5cGU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aD5OdW1iZXIgb2YgU2l0ZXM8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGVyaXRhZ2VcIixjLHAsMSksYyxwLDAsMzExMywzMjUxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJGRUFUX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJDT1VOVFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO307fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImhhc0luZnJhc3RydWN0dXJlXCIsYyxwLDEpLGMscCwwLDMzODcsNDEyMixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxoND5JbmZyYXN0cnVjdHVyZTwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHA+XCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMzUyMywzNTUzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJBIHNrZXRjaCB3aXRoaW4gdGhlIGNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJUaGUgc2tldGNoXCIpO307Xy5iKFwiIGNvbnRhaW5zIG9yIGlzIHdpdGhpbiAyMDBtIG9mIHNpdGVzIHdpdGggZXhpc3RpbmcgaW5mcmFzdHJ1Y3R1cmUuPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoyNTBweDtcXFwiPlR5cGU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaW5mcmFzdHJ1Y3R1cmVcIixjLHAsMSksYyxwLDAsMzkyMCw0MDIxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJGRUFUX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9O30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzVXNlc1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5BY3Rpdml0aWVzIGFuZCBVc2VzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwPlRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw0MjgxLDQyOTEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgIGRvZXMgPHN0cm9uZz5ub3Q8L3N0cm9uZz4gaW5jbHVkZSBhbnkgPHN0cm9uZz5hY3Rpdml0aWVzIG9yIHVzZXM8L3N0cm9uZz4uPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9O18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc1NlYWJpcmRzXCIsYyxwLDEpLGMscCwwLDQ0NjgsNTE5NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+QmlyZHMgPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzU2VhYmlyZEFyZWFzXCIsYyxwLDEpLGMscCwwLDQ1NTYsNDg0MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPjxzdHJvbmc+SW1wb3J0YW50IFNlYWJpcmQgQXJlYXM8L3N0cm9uZz48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzZWFiaXJkc1wiLGMscCwxKSxjLHAsMCw0NzAzLDQ3ODMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJOYW1lXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgXCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc1NlYWJpcmRDb2xvbmllc1wiLGMscCwxKSxjLHAsMCw0ODkzLDUxNjMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+PHN0cm9uZz5TZWFiaXJkIENvbG9uaWVzPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzZWFiaXJkX2NvbG9uaWVzXCIsYyxwLDEpLGMscCwwLDUwMzMsNTEwNSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTmFtZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImhhc01hcmluZVNwZWNpZXNcIixjLHAsMSksYyxwLDAsNTIzMiw1Njk0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5NYXJpbmUgTWFtbWFsczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5TcGVjaWVzPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcIm1hbW1hbHNcIixjLHAsMSksYyxwLDAsNTQ4MCw1NTYwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTmFtZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJzZWFsc1wiLGMscCwxKSxjLHAsMCw1NTk1LDU2NDAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJoYXNNYXJpbmVTcGVjaWVzXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PlNwZWNpZXMgSW5mb3JtYXRpb248L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHA+VGhlIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDU4NDgsNTg4MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwic2tldGNoZXMgd2l0aGluIHRoZSBjb2xsZWN0aW9uIGRvIFwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaCBkb2VzXCIpO307Xy5iKFwiIDxzdHJvbmc+bm90PC9zdHJvbmc+IGluY2x1ZGUgYW55IDxzdHJvbmc+aW1wb3J0YW50IG1hcmluZSBtYW1tYWwgYXJlYXM8L3N0cm9uZz4uPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9O3JldHVybiBfLmZsKCk7O30pO1xuXG5pZih0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gdGhpc1tcIlRlbXBsYXRlc1wiXTtcbn0iXX0=
