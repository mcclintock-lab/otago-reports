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
    _ref = EnvironmentTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  EnvironmentTab.prototype.name = 'Habitats';

  EnvironmentTab.prototype.className = 'environment';

  EnvironmentTab.prototype.timeout = 120000;

  EnvironmentTab.prototype.template = templates.environment;

  EnvironmentTab.prototype.dependencies = ['HabitatsEnvironment', 'HabitatsOverview', 'AdjacentTerrestrial', 'HabitatsRepresentivity'];

  EnvironmentTab.prototype.render = function() {
    var adjacent_land, attributes, coastal_land, context, d3IsPresent, evenness, habitats, habitats_represented, habs_in_sketch, habs_plural, hasAdjacent, hasCoastal, hasPublic, isCollection, public_land, total_habs;
    if (window.d3) {
      d3IsPresent = true;
    } else {
      d3IsPresent = false;
    }
    habitats = this.recordSet('HabitatsEnvironment', 'HabitatSize').toArray();
    habs_in_sketch = habitats != null ? habitats.length : void 0;
    habs_plural = habs_in_sketch !== 1;
    evenness = this.recordSet('HabitatsOverview', 'HabitatEvenness').float('EVENNESS');
    total_habs = this.recordSet('HabitatsOverview', 'HabitatSize').float('TOT_HABS');
    public_land = this.recordSet('AdjacentTerrestrial', 'PublicConservationLand').toArray();
    hasPublic = (public_land != null ? public_land.length : void 0) > 0;
    coastal_land = this.recordSet('AdjacentTerrestrial', 'CoastalProtection').toArray();
    hasCoastal = (coastal_land != null ? coastal_land.length : void 0) > 0;
    adjacent_land = this.recordSet('AdjacentTerrestrial', 'AdjacentLandCover').toArray();
    hasAdjacent = (adjacent_land != null ? adjacent_land.length : void 0) > 0;
    habitats_represented = this.recordSet('HabitatsRepresentivity', 'RepresentedHabs').toArray();
    attributes = this.model.getAttributes();
    isCollection = this.model.isCollection();
    context = {
      sketch: this.model.forTemplate(),
      sketchClass: this.sketchClass.forTemplate(),
      attributes: this.model.getAttributes(),
      anyAttributes: this.model.getAttributes().length > 0,
      admin: this.project.isAdmin(window.user),
      d3IsPresent: d3IsPresent,
      habitats: habitats,
      habs_in_sketch: habs_in_sketch,
      habs_plural: habs_plural,
      evenness: evenness,
      total_habs: total_habs,
      habitats_represented: habitats_represented,
      public_land: public_land,
      hasPublicLand: hasPublic,
      coastal_land: coastal_land,
      hasCoastalLand: hasCoastal,
      adjacent_land: adjacent_land,
      hasAdjacentLand: hasAdjacent,
      isCollection: isCollection
    };
    this.$el.html(this.template.render(context, partials));
    this.enableLayerTogglers();
    this.setupHabitatSorting(habitats);
    return this.enableTablePaging();
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
      return _this.renderSort('hab_new_area', tableName, habitats, event, "SIZE_HA", tbodyName, true, _this.getHabitatRowString);
    });
    this.$('.hab_new_perc').click(function(event) {
      return _this.renderSort('hab_new_perc', tableName, habitats, event, "SIZE_PERC", tbodyName, true, _this.getHabitatRowString);
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
      columns = ["HAB_TYPE", "SIZE_HA", "SIZE_PERC"];
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
    return "<td>" + d.HAB_TYPE + "</td>" + "<td>" + d.SIZE_HA + "</td>" + "<td>" + d.SIZE_PERC + "</td>";
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
    _ref = FishingTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  FishingTab.prototype.name = 'Fishing';

  FishingTab.prototype.className = 'fishing';

  FishingTab.prototype.timeout = 120000;

  FishingTab.prototype.template = templates.fishing;

  FishingTab.prototype.dependencies = ['FishingAreas'];

  FishingTab.prototype.render = function() {
    var attributes, context, d3IsPresent, existing_customary_fishing, existing_fishing_areas, hasAnyFishing, hasCustomary, hasExistingCustomary, hasExistingFishing, hasProposedCustomary, isCollection, proposed_customary_fishing;
    if (window.d3) {
      d3IsPresent = true;
    } else {
      d3IsPresent = false;
    }
    existing_customary_fishing = this.recordSet('FishingAreas', 'ExistingCustomaryArea').toArray();
    hasExistingCustomary = (existing_customary_fishing != null ? existing_customary_fishing.length : void 0) > 0;
    console.log("existing_customary: ", existing_customary_fishing);
    proposed_customary_fishing = this.recordSet('FishingAreas', 'ProposedCustomaryArea').toArray();
    console.log("proposed customary: ", proposed_customary_fishing);
    hasProposedCustomary = (proposed_customary_fishing != null ? proposed_customary_fishing.length : void 0) > 0;
    hasCustomary = hasExistingCustomary || hasProposedCustomary;
    console.log("has customary? ", hasCustomary);
    isCollection = this.model.isCollection();
    existing_fishing_areas = this.recordSet('FishingAreas', 'FishingExistingArea').toArray();
    hasExistingFishing = (existing_fishing_areas != null ? existing_fishing_areas.length : void 0) > 0;
    hasAnyFishing = hasExistingFishing || hasCustomary;
    attributes = this.model.getAttributes();
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
      isCollection: isCollection
    };
    this.$el.html(this.template.render(context, partials));
    return this.enableLayerTogglers();
  };

  return FishingTab;

})(ReportTab);

module.exports = FishingTab;


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":17,"./ids.coffee":13,"reportTab":"a21iR2"}],13:[function(require,module,exports){
module.exports = {
  PROTECTION_ID: '524f249d80e2ba6e260019ee',
  AQUACULTURE_ID: '524f129c80e2ba6e260019c7',
  PROTECTION_COLLECTION_ID: '52646ab7f34404b824000021',
  AQUACULTURE_COLLECTION_ID: '531e2bbb91a385607ef4a0dd'
};


},{}],14:[function(require,module,exports){
var MIN_SIZE, OverviewTab, ReportTab, ids, key, partials, templates, val, value, _partials, _ref,
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

MIN_SIZE = 10000;

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

  OverviewTab.prototype.dependencies = ['Size', 'CoastlineLength', 'HabitatsOverview', 'ProposalSize', 'ProposalConnectivity'];

  OverviewTab.prototype.render = function() {
    var Error, TOTAL_COASTLINE_LENGTH, attributes, coastline_length, coastline_length_percent, conn_pie_values, connected_mpa_count, context, d3IsPresent, isCollection, max_distance, mean_distance, min_distance, mpa_avg_min_dim, mpa_avg_size_guideline, mpa_count, new_habs, new_size, numSketches, percent, plural_connected_mpa_count, plural_mpa_count, prop_conn, prop_sizes, ratio, size, total_habs, total_mpa_count, total_percent;
    TOTAL_COASTLINE_LENGTH = 667.594;
    isCollection = this.model.isCollection();
    if (isCollection) {
      numSketches = this.model.getChildren().length;
    } else {
      numSketches = 1;
    }
    prop_sizes = this.recordSet('ProposalSize', 'Sizes').toArray();
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
      prop_conn = this.recordSet('ProposalConnectivity', 'Conn').toArray();
      connected_mpa_count = this.recordSet('ProposalConnectivity', 'Conn').float('NUMBER');
      plural_connected_mpa_count = true;
      min_distance = this.recordSet('ProposalConnectivity', 'Conn').float('MIN');
      max_distance = this.recordSet('ProposalConnectivity', 'Conn').float('MAX');
      mean_distance = this.recordSet('ProposalConnectivity', 'Conn').float('MEAN');
      conn_pie_values = this.build_values("Within Connectivity Range", connected_mpa_count, "#b3cfa7", "Not Within Range", total_mpa_count - connected_mpa_count, "#e5cace");
    }
    if (window.d3) {
      d3IsPresent = true;
    } else {
      d3IsPresent = false;
    }
    attributes = this.model.getAttributes();
    context = {
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
      singleSketch: numSketches === 1
    };
    this.$el.html(this.template.render(context, partials));
    this.enableLayerTogglers();
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
      w = 125;
      h = 85;
      r = 35;
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
    var Error, attributes, coastal_consents, context, d3IsPresent, hasCoastal, hasHeritage, hasInfrastructure, hasMammals, hasRecUses, hasSeabirds, hasSeals, hasSmaro, hasSpecies, hasUses, heritage, inHighDiversityReefFishArea, infrastructure, isCollection, mammals, non_smaro_rec_uses, rec, rec_uses, reef_fish, seabirds, seals, smaro, _i, _len;
    if (window.d3) {
      d3IsPresent = true;
    } else {
      d3IsPresent = false;
    }
    seabirds = this.recordSet('SpeciesInformation', 'Seabirds').toArray();
    hasSeabirds = (seabirds != null ? seabirds.length : void 0) > 0;
    mammals = this.recordSet('SpeciesInformation', 'Mammals').toArray();
    hasMammals = (mammals != null ? mammals.length : void 0) > 0;
    try {
      seals = this.recordSet('SpeciesInformation', 'Seals').toArray();
    } catch (_error) {
      Error = _error;
    }
    hasSeals = (seals != null ? seals.length : void 0) > 0;
    reef_fish = this.recordSet('SpeciesInformation', 'ReefFish').toArray();
    inHighDiversityReefFishArea = (reef_fish != null ? reef_fish.length : void 0) > 0;
    smaro = "SMARO";
    rec_uses = this.recordSet('OverlapWithRecreationalUses', 'RecreationalUse').toArray();
    hasSmaro = false;
    for (_i = 0, _len = rec_uses.length; _i < _len; _i++) {
      rec = rec_uses[_i];
      console.log(rec.FEAT_TYPE);
      if (rec.FEAT_TYPE === smaro) {
        hasSmaro = true;
        break;
      }
    }
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
    hasSpecies = hasMammals || hasSeabirds || hasSeals;
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
      hasSeabirds: hasSeabirds,
      mammals: mammals,
      hasMammals: hasMammals,
      reef_fish: reef_fish,
      seals: seals,
      hasSeals: hasSeals,
      inHighDiversityReefFishArea: inHighDiversityReefFishArea,
      hasSpecies: hasSpecies
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
this["Templates"]["environment"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("anyAttributes",c,p,1),c,p,0,313,426,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("</h4>");_.b("\n" + i);_.b(_.rp("attributes/attributesTable",c,p,"  "));_.b("  </table>");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Habitats Represented in ");if(_.s(_.f("isCollection",c,p,1),c,p,0,535,545,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" <!--<a href=\"#\" data-toggle-node=\"53a0a31cd3f6064d2c17580c\" data-visible=\"false\">show layer</a>--></h4>");_.b("\n" + i);_.b("      <table data-paging=\"20\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th style=\"width:250px;\">Habitat</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("habitats_represented",c,p,1),c,p,0,903,979,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Habitats Present in ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1131,1141,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" <a href=\"#\" data-toggle-node=\"53a0a31cd3f6064d2c17580c\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,1316,1781,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <table data-paging=\"20\" class=\"hab_table\"> ");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th class=\"sorting_col\" style=\"width:250px;\"><a class=\"hab_type sort_up\" href=\"#\">Habitat Classification Type</a></th>");_.b("\n" + i);_.b("            <th><a  class=\"hab_new_area sort_down\" href=\"#\" >Area (ha)</a></th>");_.b("\n" + i);_.b("            <th><a class=\"hab_new_perc sort_down\" href=\"#\">Area (%)</a></th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody class=\"hab_values\"></tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n");});c.pop();}if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th style=\"width:250px;\">Habitats</th>");_.b("\n" + i);_.b("            <th>Area (ha)</th>");_.b("\n" + i);_.b("            <th>Area (%)</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("habitats",c,p,1),c,p,0,2065,2209,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("SIZE_HA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("SIZE_PERC",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n");};_.b("    <!---  ");_.b("\n" + i);_.b("      </br>");_.b("\n" + i);_.b("      <p>");_.b("\n" + i);_.b("        <p class=\"large\">");_.b("\n" + i);_.b("          <strong>Habitat Evenness</strong></br>");_.b("\n" + i);_.b("          The measure of 'evenness' for the <strong>");_.b(_.v(_.f("habs_in_sketch",c,p,0)));_.b("</strong> habitat");if(_.s(_.f("habs_plural",c,p,1),c,p,0,2488,2489,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}_.b(" present in the Sketch is <strong>");_.b(_.v(_.f("evenness",c,p,0)));_.b("</strong>.");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("        <p>");_.b("\n" + i);_.b("          <em>Evenness is a measure of the relative abundance of habitats within an area, where a high number approaching ");_.b("\n" + i);_.b("          1 means all the habitats are relatively similar in size, and a low number indicating that the habitats are varied ");_.b("\n" + i);_.b("          in their size. A higher habitat evenness score generally indicates a higher species diversity. ");_.b("\n" + i);_.b("          Evenness has been calculated using the Simpson's E index.</em>");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    -->");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Adjacent Terrestrial Information</h4>");_.b("\n" + i);_.b("      <p><em>MPA Guidelines: \"Consider adjacent terrestrial environment\" (areas shown below are within 100m of ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3268,3294,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("a sketch in the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b(" the sketch ");};_.b(")</em></p>");_.b("\n" + i);_.b("      <p class=\"large\"><strong>Public Conservation Land</strong></p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("hasPublicLand",c,p,1),c,p,0,3512,3648,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("public_land",c,p,1),c,p,0,3541,3621,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasPublicLand",c,p,1),c,p,1,0,0,"")){_.b("            <tr>");_.b("\n" + i);_.b("              <td><em>None Present</em></td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");};_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("      <p class=\"large\"><strong>Coastal Protection and Recreation Areas (CPA & CRA)</strong></p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("hasCoastalLand",c,p,1),c,p,0,4009,4147,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("coastal_land",c,p,1),c,p,0,4039,4119,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasCoastalLand",c,p,1),c,p,1,0,0,"")){_.b("            <tr>");_.b("\n" + i);_.b("              <td><em>None Present</em></td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");};_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["fishing"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("anyAttributes",c,p,1),c,p,0,313,426,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("</h4>");_.b("\n" + i);_.b(_.rp("attributes/attributesTable",c,p,"  "));_.b("  </table>");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("hasAnyFishing",c,p,1),c,p,0,463,2450,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hasExistingFishing",c,p,1),c,p,0,489,1386,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Existing Fisheries Management</h4>");_.b("\n" + i);_.b("        <p><em>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,614,624,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" includes the following existing fisheries restrictions. ");_.b("\n" + i);_.b("        Also shown is the extent that the fisheries restrictions apply to the ");if(_.s(_.f("isCollection",c,p,1),c,p,0,834,842,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketches");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" as a percentage of total sketch area.</em></p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:250px;\">Name</th>");_.b("\n" + i);_.b("              <th>Percent</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("existing_fishing_areas",c,p,1),c,p,0,1189,1311,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("PERC_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}if(_.s(_.f("hasCustomary",c,p,1),c,p,0,1429,2431,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Customary Areas</h4>");_.b("\n" + i);if(_.s(_.f("hasExistingCustomary",c,p,1),c,p,0,1533,1936,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p> The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1565,1575,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes the following <strong>existing</strong> Customary Areas:</p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("existing_customary_fishing",c,p,1),c,p,0,1791,1868,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n");});c.pop();}if(_.s(_.f("hasProposedCustomary",c,p,1),c,p,0,1991,2394,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p> The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,2023,2033,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes the following <strong>proposed</strong> Customary Areas:</p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("proposed_customary_fishing",c,p,1),c,p,0,2249,2326,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n");});c.pop();}_.b("  </div>");_.b("\n");});c.pop();}_.b("\n");});c.pop();}if(!_.s(_.f("hasAnyFishing",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Existing or Customary Areas</h4>");_.b("\n" + i);_.b("        <p>No information on existing fishing areas or customary use is available for this area.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};return _.fl();;});
this["Templates"]["overview"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("anyAttributes",c,p,1),c,p,0,313,436,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection\">");_.b("\n" + i);_.b("    <h4>");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("</h4>");_.b("\n" + i);_.b(_.rp("attributes/attributesTable",c,p,"    "));_.b("    </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,473,2779,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection size\">");_.b("\n" + i);_.b("    <h4>MPA Sizes</h4>");_.b("\n" + i);_.b("    <p class=\"large\">");_.b("\n" + i);_.b("      Of the <strong>");_.b(_.v(_.f("total_mpa_count",c,p,0)));_.b("</strong> MPAs in the network, <strong>");_.b(_.v(_.f("mpa_count",c,p,0)));_.b("</strong> meet");if(!_.s(_.f("plural_mpa_count",c,p,1),c,p,1,0,0,"")){_.b("s");};_.b(" the minimum size dimension of 5km. The average minimum dimension is <strong>");_.b(_.v(_.f("mpa_avg_size_guideline",c,p,0)));_.b("</strong> the 10-20km guideline.");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>MPA Name</th>");_.b("\n" + i);_.b("            <th>Area </br>(sq. km.)</th>");_.b("\n" + i);_.b("            <th style=\"width:100px;\">Width (km)</th>");_.b("\n" + i);_.b("            <th style=\"width:100px;\">Coastline Length (km)</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("prop_sizes",c,p,1),c,p,0,1172,1338,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("MIN_DIM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("COAST",c,p,0)));_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("    <p class=\"large\">");_.b("\n" + i);_.b("      This combined area within the network accounts for <strong>");_.b(_.v(_.f("percent",c,p,0)));_.b("%</strong> of the South-East Marine area, and <strong>");_.b(_.v(_.f("coastline_length_percent",c,p,0)));_.b("%</strong> of the South-East coastline.");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <div class=\"reportSection\">");_.b("\n" + i);_.b("    <h4>Connectivity</h4>");_.b("\n" + i);if(_.s(_.f("singleSketch",c,p,1),c,p,0,1701,1862,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <p style=\"font-style:italic;color:gray;\" class=\"large\">");_.b("\n" + i);_.b("            No connectivity information for a collection with one sketch. ");_.b("\n" + i);_.b("          </p>");_.b("\n");});c.pop();}if(!_.s(_.f("singleSketch",c,p,1),c,p,1,0,0,"")){_.b("      <div>");_.b("\n" + i);_.b("        <div class=\"connectivity_pie\" id=\"connectivity_pie\"></div>");_.b("\n" + i);_.b("        <div class=\"connectivity_pie_legend\" id=\"connectivity_pie_legend\"></div>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("      <p class=\"large\">Of the <strong>");_.b(_.v(_.f("total_mpa_count",c,p,0)));_.b("</strong> MPAs in the network, <strong>");_.b(_.v(_.f("connected_mpa_count",c,p,0)));_.b("</strong>");if(_.s(_.f("plural_connected_mpa_count",c,p,1),c,p,0,2234,2238,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(" are");});c.pop();}if(!_.s(_.f("plural_connected_mpa_count",c,p,1),c,p,1,0,0,"")){_.b(" is");};_.b(" within the connectivity range of 50 - 100 km. ");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("      <span class=\"conn_values\">The minimum distance between the MPAs is <strong>");_.b(_.v(_.f("min_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("      <span class=\"conn_values\">The maximum distance between the MPAs is <strong>");_.b(_.v(_.f("max_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("      <span class=\"conn_values\">The average distance between the MPAs is <strong>");_.b(_.v(_.f("mean_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n");};_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,2815,2984,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection\">");_.b("\n" + i);_.b("    <h4>Collection</h4>");_.b("\n" + i);_.b("    <p class=\"large\">");_.b("\n" + i);_.b("      This collection contains <strong>");_.b(_.v(_.f("numSketches",c,p,0)));_.b("</strong> sketches.");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection size\">");_.b("\n" + i);_.b("    <h4>Size</h4>");_.b("\n" + i);_.b("    <p class=\"large\">");_.b("\n" + i);_.b("      This sketch area is <strong>");_.b(_.v(_.f("size",c,p,0)));_.b(" square kilometers</strong>, and it includes <strong>");_.b(_.v(_.f("percent",c,p,0)));_.b("%</strong> of the South-East Planning Region.");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("    <p class=\"large\">");_.b("\n" + i);_.b("      This sketch includes <strong>");_.b(_.v(_.f("coastline_length",c,p,0)));_.b(" meters</strong> of coastline.");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};_.b("<!--");_.b("\n" + i);_.b("<div class=\"reportSection size\">");_.b("\n" + i);_.b("  <h4>Representation of Habitats <a href=\"#\" data-toggle-node=\"53a0a31cd3f6064d2c17580c\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);_.b("  <strong>Number of Habitat Classes</strong></br>");_.b("\n" + i);_.b("  <p style=\"margin-top:0px;\" class=\"large\">");_.b("\n" + i);_.b("    There are <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> habitat classes in the planning region, and your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3775,3785,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("\n" + i);_.b("    includes <strong>");_.b(_.v(_.f("new_habs",c,p,0)));_.b("</strong>. For more information on the Habitat Classification, see");_.b("\n" + i);_.b("    the <a href=\"http://www.doc.govt.nz/Documents/conservation/marine-and-coastal/marine-protected-areas/mpa-classification-protection-standard.pdf\" target=\"_blank\">");_.b("\n" + i);_.b("    Marine Protected Areas Classification and Protection Standard</a>");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("-->");return _.fl();;});
this["Templates"]["uses"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("anyAttributes",c,p,1),c,p,0,313,426,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("</h4>");_.b("\n" + i);_.b(_.rp("attributes/attributesTable",c,p,"  "));_.b("  </table>");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("hasCoastal",c,p,1),c,p,0,460,1195,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Existing Coastal Consents <a href=\"#\" data-toggle-node=\"53d719a49380174a7766dd85\" data-visible=\"false\">");_.b("\n" + i);_.b("      show layer</a></h4>");_.b("\n" + i);_.b("        <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,674,704,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites with Resource Consents.</p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:250px;\">Consent Type</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("coastal_consents",c,p,1),c,p,0,1043,1128,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("hasUses",c,p,1),c,p,0,1224,4145,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hasRecUses",c,p,1),c,p,0,1242,2485,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Recreational Uses </h4>");_.b("\n" + i);if(_.s(_.f("hasSmaro",c,p,1),c,p,0,1339,1827,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("        <p><strong>Spectrum of MArine Recreational Opportunity (SMARO)</strong></p>");_.b("\n" + i);_.b("          <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,1478,1488,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" includes area(s) identified as having <strong> medium or high </strong> recreational opportunity.");_.b("\n" + i);_.b("          <em>You can find more information on SMARO in the \"data description\" by right clicking on the layer name.</em>");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("        </br></br>");_.b("\n");};});c.pop();}_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:250px;\">Activity Type</th>");_.b("\n" + i);_.b("              <th>Number of Sites</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasRecUses",c,p,1),c,p,0,2088,2270,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("rec_uses",c,p,1),c,p,0,2116,2244,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("COUNT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasRecUses",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td colspan=2><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("hasHeritage",c,p,1),c,p,0,2520,3346,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Heritage</h4>");_.b("\n" + i);_.b("            <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,2650,2680,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites identified as having significant heritage values.</p>");_.b("\n" + i);_.b("            <table data-paging=\"10\">");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th style=\"width:250px;\">Heritage Type</th>");_.b("\n" + i);_.b("                  <th>Number of Sites</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("              <tbody>");_.b("\n" + i);if(_.s(_.f("heritage",c,p,1),c,p,0,3113,3251,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <tr>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("COUNT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                </tr>");_.b("\n");});c.pop();}_.b("              </tbody>");_.b("\n" + i);_.b("            </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");};});c.pop();}if(_.s(_.f("hasInfrastructure",c,p,1),c,p,0,3387,4122,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Infrastructure</h4>");_.b("\n" + i);_.b("            <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,3523,3553,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites with existing infrastructure.</p>");_.b("\n" + i);_.b("            <table data-paging=\"10\">");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th style=\"width:250px;\">Type</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("              <tbody>");_.b("\n" + i);if(_.s(_.f("infrastructure",c,p,1),c,p,0,3920,4021,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <tr>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                </tr>");_.b("\n");});c.pop();}_.b("              </tbody>");_.b("\n" + i);_.b("            </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");};});c.pop();}});c.pop();}if(!_.s(_.f("hasUses",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Activities and Uses</h4>");_.b("\n" + i);_.b("        <p>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,4281,4291,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("  does <strong>not</strong> include any <strong>activities or uses</strong>.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};_.b("\n" + i);if(_.s(_.f("hasSpecies",c,p,1),c,p,0,4467,5838,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Species Information</h4>");_.b("\n" + i);if(_.s(_.f("hasSeabirds",c,p,1),c,p,0,4564,4847,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <p class=\"large\"><strong>Important Seabird Areas</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("seabirds",c,p,1),c,p,0,4711,4791,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n");});c.pop();}if(_.s(_.f("hasMammals",c,p,1),c,p,0,4885,5336,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <p class=\"large\"><strong>Marine Mammals</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>Species</th>");_.b("\n" + i);_.b("              <th>Number of Sightings</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("mammals",c,p,1),c,p,0,5168,5281,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Count",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n");});c.pop();}if(_.s(_.f("hasSeals",c,p,1),c,p,0,5371,5817,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <p class=\"large\"><strong>Seal Colonies</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>Species</th>");_.b("\n" + i);_.b("              <th>Number of Sightings</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("seals",c,p,1),c,p,0,5651,5764,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Count",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n");});c.pop();}_.b("</div>");_.b("\n");});c.pop();}if(!_.s(_.f("hasSpecies",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Species Information</h4>");_.b("\n" + i);_.b("        <p>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,5980,6014,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketches within the collection do ");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch does");};_.b(" <strong>not</strong> include any <strong>important species areas</strong>.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};return _.fl();;});

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = this["Templates"];
}
},{}]},{},[15])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9vdGFnby1yZXBvcnRzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvZW5hYmxlTGF5ZXJUb2dnbGVycy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvam9iSXRlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0UmVzdWx0cy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0VGFiLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvc2NyaXB0cy91dGlscy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9lbnZpcm9ubWVudC5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9maXNoaW5nLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9zY3JpcHRzL2lkcy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9vdmVydmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9yZXBvcnQuY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9vdGFnby1yZXBvcnRzL3NjcmlwdHMvdXNlcy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBLENBQU8sQ0FBVSxDQUFBLEdBQVgsQ0FBTixFQUFrQjtDQUNoQixLQUFBLDJFQUFBO0NBQUEsQ0FBQSxDQUFBO0NBQUEsQ0FDQSxDQUFBLEdBQVk7Q0FEWixDQUVBLENBQUEsR0FBTTtBQUNDLENBQVAsQ0FBQSxDQUFBLENBQUE7Q0FDRSxFQUFBLENBQUEsR0FBTyxxQkFBUDtDQUNBLFNBQUE7SUFMRjtDQUFBLENBTUEsQ0FBVyxDQUFBLElBQVgsYUFBVztDQUVYO0NBQUEsTUFBQSxvQ0FBQTt3QkFBQTtDQUNFLEVBQVcsQ0FBWCxHQUFXLENBQVg7Q0FBQSxFQUNTLENBQVQsRUFBQSxFQUFpQixLQUFSO0NBQ1Q7Q0FDRSxFQUFPLENBQVAsRUFBQSxVQUFPO0NBQVAsRUFD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QUZvQjs7QUE4RnRCLENBNUdBLEVBNEdpQixHQUFYLENBQU47Ozs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIixudWxsLCJtb2R1bGUuZXhwb3J0cyA9IChlbCkgLT5cbiAgJGVsID0gJCBlbFxuICBhcHAgPSB3aW5kb3cuYXBwXG4gIHRvYyA9IGFwcC5nZXRUb2MoKVxuICB1bmxlc3MgdG9jXG4gICAgY29uc29sZS5sb2cgJ05vIHRhYmxlIG9mIGNvbnRlbnRzIGZvdW5kJ1xuICAgIHJldHVyblxuICB0b2dnbGVycyA9ICRlbC5maW5kKCdhW2RhdGEtdG9nZ2xlLW5vZGVdJylcbiAgIyBTZXQgaW5pdGlhbCBzdGF0ZVxuICBmb3IgdG9nZ2xlciBpbiB0b2dnbGVycy50b0FycmF5KClcbiAgICAkdG9nZ2xlciA9ICQodG9nZ2xlcilcbiAgICBub2RlaWQgPSAkdG9nZ2xlci5kYXRhKCd0b2dnbGUtbm9kZScpXG4gICAgdHJ5XG4gICAgICB2aWV3ID0gdG9jLmdldENoaWxkVmlld0J5SWQgbm9kZWlkXG4gICAgICBub2RlID0gdmlldy5tb2RlbFxuICAgICAgJHRvZ2dsZXIuYXR0ciAnZGF0YS12aXNpYmxlJywgISFub2RlLmdldCgndmlzaWJsZScpXG4gICAgICAkdG9nZ2xlci5kYXRhICd0b2NJdGVtJywgdmlld1xuICAgIGNhdGNoIGVcbiAgICAgICR0b2dnbGVyLmF0dHIgJ2RhdGEtbm90LWZvdW5kJywgJ3RydWUnXG5cbiAgdG9nZ2xlcnMub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgJGVsID0gJChlLnRhcmdldClcbiAgICB2aWV3ID0gJGVsLmRhdGEoJ3RvY0l0ZW0nKVxuICAgIGlmIHZpZXdcbiAgICAgIHZpZXcudG9nZ2xlVmlzaWJpbGl0eShlKVxuICAgICAgJGVsLmF0dHIgJ2RhdGEtdmlzaWJsZScsICEhdmlldy5tb2RlbC5nZXQoJ3Zpc2libGUnKVxuICAgIGVsc2VcbiAgICAgIGFsZXJ0IFwiTGF5ZXIgbm90IGZvdW5kIGluIHRoZSBjdXJyZW50IFRhYmxlIG9mIENvbnRlbnRzLiBcXG5FeHBlY3RlZCBub2RlaWQgI3skZWwuZGF0YSgndG9nZ2xlLW5vZGUnKX1cIlxuIiwiY2xhc3MgSm9iSXRlbSBleHRlbmRzIEJhY2tib25lLlZpZXdcbiAgY2xhc3NOYW1lOiAncmVwb3J0UmVzdWx0J1xuICBldmVudHM6IHt9XG4gIGJpbmRpbmdzOlxuICAgIFwiaDYgYVwiOlxuICAgICAgb2JzZXJ2ZTogXCJzZXJ2aWNlTmFtZVwiXG4gICAgICB1cGRhdGVWaWV3OiB0cnVlXG4gICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICBuYW1lOiAnaHJlZidcbiAgICAgICAgb2JzZXJ2ZTogJ3NlcnZpY2VVcmwnXG4gICAgICB9XVxuICAgIFwiLnN0YXJ0ZWRBdFwiOlxuICAgICAgb2JzZXJ2ZTogW1wic3RhcnRlZEF0XCIsIFwic3RhdHVzXCJdXG4gICAgICB2aXNpYmxlOiAoKSAtPlxuICAgICAgICBAbW9kZWwuZ2V0KCdzdGF0dXMnKSBub3QgaW4gWydjb21wbGV0ZScsICdlcnJvciddXG4gICAgICB1cGRhdGVWaWV3OiB0cnVlXG4gICAgICBvbkdldDogKCkgLT5cbiAgICAgICAgaWYgQG1vZGVsLmdldCgnc3RhcnRlZEF0JylcbiAgICAgICAgICByZXR1cm4gXCJTdGFydGVkIFwiICsgbW9tZW50KEBtb2RlbC5nZXQoJ3N0YXJ0ZWRBdCcpKS5mcm9tTm93KCkgKyBcIi4gXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFwiXCJcbiAgICBcIi5zdGF0dXNcIjogICAgICBcbiAgICAgIG9ic2VydmU6IFwic3RhdHVzXCJcbiAgICAgIG9uR2V0OiAocykgLT5cbiAgICAgICAgc3dpdGNoIHNcbiAgICAgICAgICB3aGVuICdwZW5kaW5nJ1xuICAgICAgICAgICAgXCJ3YWl0aW5nIGluIGxpbmVcIlxuICAgICAgICAgIHdoZW4gJ3J1bm5pbmcnXG4gICAgICAgICAgICBcInJ1bm5pbmcgYW5hbHl0aWNhbCBzZXJ2aWNlXCJcbiAgICAgICAgICB3aGVuICdjb21wbGV0ZSdcbiAgICAgICAgICAgIFwiY29tcGxldGVkXCJcbiAgICAgICAgICB3aGVuICdlcnJvcidcbiAgICAgICAgICAgIFwiYW4gZXJyb3Igb2NjdXJyZWRcIlxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNcbiAgICBcIi5xdWV1ZUxlbmd0aFwiOiBcbiAgICAgIG9ic2VydmU6IFwicXVldWVMZW5ndGhcIlxuICAgICAgb25HZXQ6ICh2KSAtPlxuICAgICAgICBzID0gXCJXYWl0aW5nIGJlaGluZCAje3Z9IGpvYlwiXG4gICAgICAgIGlmIHYubGVuZ3RoID4gMVxuICAgICAgICAgIHMgKz0gJ3MnXG4gICAgICAgIHJldHVybiBzICsgXCIuIFwiXG4gICAgICB2aXNpYmxlOiAodikgLT5cbiAgICAgICAgdj8gYW5kIHBhcnNlSW50KHYpID4gMFxuICAgIFwiLmVycm9yc1wiOlxuICAgICAgb2JzZXJ2ZTogJ2Vycm9yJ1xuICAgICAgdXBkYXRlVmlldzogdHJ1ZVxuICAgICAgdmlzaWJsZTogKHYpIC0+XG4gICAgICAgIHY/Lmxlbmd0aCA+IDJcbiAgICAgIG9uR2V0OiAodikgLT5cbiAgICAgICAgaWYgdj9cbiAgICAgICAgICBKU09OLnN0cmluZ2lmeSh2LCBudWxsLCAnICAnKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQG1vZGVsKSAtPlxuICAgIHN1cGVyKClcblxuICByZW5kZXI6ICgpIC0+XG4gICAgQCRlbC5odG1sIFwiXCJcIlxuICAgICAgPGg2PjxhIGhyZWY9XCIjXCIgdGFyZ2V0PVwiX2JsYW5rXCI+PC9hPjxzcGFuIGNsYXNzPVwic3RhdHVzXCI+PC9zcGFuPjwvaDY+XG4gICAgICA8ZGl2PlxuICAgICAgICA8c3BhbiBjbGFzcz1cInN0YXJ0ZWRBdFwiPjwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJxdWV1ZUxlbmd0aFwiPjwvc3Bhbj5cbiAgICAgICAgPHByZSBjbGFzcz1cImVycm9yc1wiPjwvcHJlPlxuICAgICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gICAgQHN0aWNraXQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEpvYkl0ZW0iLCJjbGFzcyBSZXBvcnRSZXN1bHRzIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXG4gIGRlZmF1bHRQb2xsaW5nSW50ZXJ2YWw6IDMwMDBcblxuICBjb25zdHJ1Y3RvcjogKEBza2V0Y2gsIEBkZXBzKSAtPlxuICAgIEB1cmwgPSB1cmwgPSBcIi9yZXBvcnRzLyN7QHNrZXRjaC5pZH0vI3tAZGVwcy5qb2luKCcsJyl9XCJcbiAgICBzdXBlcigpXG5cbiAgcG9sbDogKCkgPT5cbiAgICBAZmV0Y2gge1xuICAgICAgc3VjY2VzczogKCkgPT5cbiAgICAgICAgQHRyaWdnZXIgJ2pvYnMnXG4gICAgICAgIGZvciByZXN1bHQgaW4gQG1vZGVsc1xuICAgICAgICAgIGlmIHJlc3VsdC5nZXQoJ3N0YXR1cycpIG5vdCBpbiBbJ2NvbXBsZXRlJywgJ2Vycm9yJ11cbiAgICAgICAgICAgIHVubGVzcyBAaW50ZXJ2YWxcbiAgICAgICAgICAgICAgQGludGVydmFsID0gc2V0SW50ZXJ2YWwgQHBvbGwsIEBkZWZhdWx0UG9sbGluZ0ludGVydmFsXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICBjb25zb2xlLmxvZyBAbW9kZWxzWzBdLmdldCgncGF5bG9hZFNpemVCeXRlcycpXG4gICAgICAgICAgcGF5bG9hZFNpemUgPSBNYXRoLnJvdW5kKCgoQG1vZGVsc1swXS5nZXQoJ3BheWxvYWRTaXplQnl0ZXMnKSBvciAwKSAvIDEwMjQpICogMTAwKSAvIDEwMFxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiRmVhdHVyZVNldCBzZW50IHRvIEdQIHdlaWdoZWQgaW4gYXQgI3twYXlsb2FkU2l6ZX1rYlwiXG4gICAgICAgICMgYWxsIGNvbXBsZXRlIHRoZW5cbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGludGVydmFsKSBpZiBAaW50ZXJ2YWxcbiAgICAgICAgaWYgcHJvYmxlbSA9IF8uZmluZChAbW9kZWxzLCAocikgLT4gci5nZXQoJ2Vycm9yJyk/KVxuICAgICAgICAgIEB0cmlnZ2VyICdlcnJvcicsIFwiUHJvYmxlbSB3aXRoICN7cHJvYmxlbS5nZXQoJ3NlcnZpY2VOYW1lJyl9IGpvYlwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAdHJpZ2dlciAnZmluaXNoZWQnXG4gICAgICBlcnJvcjogKGUsIHJlcywgYSwgYikgPT5cbiAgICAgICAgdW5sZXNzIHJlcy5zdGF0dXMgaXMgMFxuICAgICAgICAgIGlmIHJlcy5yZXNwb25zZVRleHQ/Lmxlbmd0aFxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgIGpzb24gPSBKU09OLnBhcnNlKHJlcy5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgICAjIGRvIG5vdGhpbmdcbiAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAaW50ZXJ2YWwpIGlmIEBpbnRlcnZhbFxuICAgICAgICAgIEB0cmlnZ2VyICdlcnJvcicsIGpzb24/LmVycm9yPy5tZXNzYWdlIG9yXG4gICAgICAgICAgICAnUHJvYmxlbSBjb250YWN0aW5nIHRoZSBTZWFTa2V0Y2ggc2VydmVyJ1xuICAgIH1cblxubW9kdWxlLmV4cG9ydHMgPSBSZXBvcnRSZXN1bHRzXG4iLCJlbmFibGVMYXllclRvZ2dsZXJzID0gcmVxdWlyZSAnLi9lbmFibGVMYXllclRvZ2dsZXJzLmNvZmZlZSdcbnJvdW5kID0gcmVxdWlyZSgnLi91dGlscy5jb2ZmZWUnKS5yb3VuZFxuUmVwb3J0UmVzdWx0cyA9IHJlcXVpcmUgJy4vcmVwb3J0UmVzdWx0cy5jb2ZmZWUnXG50ID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcycpXG50ZW1wbGF0ZXMgPVxuICByZXBvcnRMb2FkaW5nOiB0Wydub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvcmVwb3J0TG9hZGluZyddXG5Kb2JJdGVtID0gcmVxdWlyZSAnLi9qb2JJdGVtLmNvZmZlZSdcbkNvbGxlY3Rpb25WaWV3ID0gcmVxdWlyZSgndmlld3MvY29sbGVjdGlvblZpZXcnKVxuXG5jbGFzcyBSZWNvcmRTZXRcblxuICBjb25zdHJ1Y3RvcjogKEBkYXRhLCBAdGFiLCBAc2tldGNoQ2xhc3NJZCkgLT5cblxuICB0b0FycmF5OiAoKSAtPlxuICAgIGlmIEBza2V0Y2hDbGFzc0lkXG4gICAgICBkYXRhID0gXy5maW5kIEBkYXRhLnZhbHVlLCAodikgPT5cbiAgICAgICAgdi5mZWF0dXJlcz9bMF0/LmF0dHJpYnV0ZXM/WydTQ19JRCddIGlzIEBza2V0Y2hDbGFzc0lkXG4gICAgICB1bmxlc3MgZGF0YVxuICAgICAgICB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIGRhdGEgZm9yIHNrZXRjaENsYXNzICN7QHNrZXRjaENsYXNzSWR9XCJcbiAgICBlbHNlXG4gICAgICBpZiBfLmlzQXJyYXkgQGRhdGEudmFsdWVcbiAgICAgICAgZGF0YSA9IEBkYXRhLnZhbHVlWzBdXG4gICAgICBlbHNlXG4gICAgICAgIGRhdGEgPSBAZGF0YS52YWx1ZVxuICAgIF8ubWFwIGRhdGEuZmVhdHVyZXMsIChmZWF0dXJlKSAtPlxuICAgICAgZmVhdHVyZS5hdHRyaWJ1dGVzXG5cbiAgcmF3OiAoYXR0cikgLT5cbiAgICBhdHRycyA9IF8ubWFwIEB0b0FycmF5KCksIChyb3cpIC0+XG4gICAgICByb3dbYXR0cl1cbiAgICBhdHRycyA9IF8uZmlsdGVyIGF0dHJzLCAoYXR0cikgLT4gYXR0ciAhPSB1bmRlZmluZWRcbiAgICBpZiBhdHRycy5sZW5ndGggaXMgMFxuICAgICAgY29uc29sZS5sb2cgQGRhdGFcbiAgICAgIEB0YWIucmVwb3J0RXJyb3IgXCJDb3VsZCBub3QgZ2V0IGF0dHJpYnV0ZSAje2F0dHJ9IGZyb20gcmVzdWx0c1wiXG4gICAgICB0aHJvdyBcIkNvdWxkIG5vdCBnZXQgYXR0cmlidXRlICN7YXR0cn1cIlxuICAgIGVsc2UgaWYgYXR0cnMubGVuZ3RoIGlzIDFcbiAgICAgIHJldHVybiBhdHRyc1swXVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBhdHRyc1xuXG4gIGludDogKGF0dHIpIC0+XG4gICAgcmF3ID0gQHJhdyhhdHRyKVxuICAgIGlmIF8uaXNBcnJheShyYXcpXG4gICAgICBfLm1hcCByYXcsIHBhcnNlSW50XG4gICAgZWxzZVxuICAgICAgcGFyc2VJbnQocmF3KVxuXG4gIGZsb2F0OiAoYXR0ciwgZGVjaW1hbFBsYWNlcz0yKSAtPlxuICAgIHJhdyA9IEByYXcoYXR0cilcbiAgICBpZiBfLmlzQXJyYXkocmF3KVxuICAgICAgXy5tYXAgcmF3LCAodmFsKSAtPiByb3VuZCh2YWwsIGRlY2ltYWxQbGFjZXMpXG4gICAgZWxzZVxuICAgICAgcm91bmQocmF3LCBkZWNpbWFsUGxhY2VzKVxuXG4gIGJvb2w6IChhdHRyKSAtPlxuICAgIHJhdyA9IEByYXcoYXR0cilcbiAgICBpZiBfLmlzQXJyYXkocmF3KVxuICAgICAgXy5tYXAgcmF3LCAodmFsKSAtPiB2YWwudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpIGlzICd0cnVlJ1xuICAgIGVsc2VcbiAgICAgIHJhdy50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgaXMgJ3RydWUnXG5cbmNsYXNzIFJlcG9ydFRhYiBleHRlbmRzIEJhY2tib25lLlZpZXdcbiAgbmFtZTogJ0luZm9ybWF0aW9uJ1xuICBkZXBlbmRlbmNpZXM6IFtdXG5cbiAgaW5pdGlhbGl6ZTogKEBtb2RlbCwgQG9wdGlvbnMpIC0+XG4gICAgIyBXaWxsIGJlIGluaXRpYWxpemVkIGJ5IFNlYVNrZXRjaCB3aXRoIHRoZSBmb2xsb3dpbmcgYXJndW1lbnRzOlxuICAgICMgICAqIG1vZGVsIC0gVGhlIHNrZXRjaCBiZWluZyByZXBvcnRlZCBvblxuICAgICMgICAqIG9wdGlvbnNcbiAgICAjICAgICAtIC5wYXJlbnQgLSB0aGUgcGFyZW50IHJlcG9ydCB2aWV3XG4gICAgIyAgICAgICAgY2FsbCBAb3B0aW9ucy5wYXJlbnQuZGVzdHJveSgpIHRvIGNsb3NlIHRoZSB3aG9sZSByZXBvcnQgd2luZG93XG4gICAgQGFwcCA9IHdpbmRvdy5hcHBcbiAgICBfLmV4dGVuZCBALCBAb3B0aW9uc1xuICAgIEByZXBvcnRSZXN1bHRzID0gbmV3IFJlcG9ydFJlc3VsdHMoQG1vZGVsLCBAZGVwZW5kZW5jaWVzKVxuICAgIEBsaXN0ZW5Ub09uY2UgQHJlcG9ydFJlc3VsdHMsICdlcnJvcicsIEByZXBvcnRFcnJvclxuICAgIEBsaXN0ZW5Ub09uY2UgQHJlcG9ydFJlc3VsdHMsICdqb2JzJywgQHJlbmRlckpvYkRldGFpbHNcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAnam9icycsIEByZXBvcnRKb2JzXG4gICAgQGxpc3RlblRvIEByZXBvcnRSZXN1bHRzLCAnZmluaXNoZWQnLCBfLmJpbmQgQHJlbmRlciwgQFxuICAgIEBsaXN0ZW5Ub09uY2UgQHJlcG9ydFJlc3VsdHMsICdyZXF1ZXN0JywgQHJlcG9ydFJlcXVlc3RlZFxuXG4gIHJlbmRlcjogKCkgLT5cbiAgICB0aHJvdyAncmVuZGVyIG1ldGhvZCBtdXN0IGJlIG92ZXJpZGRlbidcblxuICBzaG93OiAoKSAtPlxuICAgIEAkZWwuc2hvdygpXG4gICAgQHZpc2libGUgPSB0cnVlXG4gICAgaWYgQGRlcGVuZGVuY2llcz8ubGVuZ3RoIGFuZCAhQHJlcG9ydFJlc3VsdHMubW9kZWxzLmxlbmd0aFxuICAgICAgQHJlcG9ydFJlc3VsdHMucG9sbCgpXG4gICAgZWxzZSBpZiAhQGRlcGVuZGVuY2llcz8ubGVuZ3RoXG4gICAgICBAcmVuZGVyKClcbiAgICAgIEAkKCdbZGF0YS1hdHRyaWJ1dGUtdHlwZT1VcmxGaWVsZF0gLnZhbHVlLCBbZGF0YS1hdHRyaWJ1dGUtdHlwZT1VcGxvYWRGaWVsZF0gLnZhbHVlJykuZWFjaCAoKSAtPlxuICAgICAgICB0ZXh0ID0gJChAKS50ZXh0KClcbiAgICAgICAgaHRtbCA9IFtdXG4gICAgICAgIGZvciB1cmwgaW4gdGV4dC5zcGxpdCgnLCcpXG4gICAgICAgICAgaWYgdXJsLmxlbmd0aFxuICAgICAgICAgICAgbmFtZSA9IF8ubGFzdCh1cmwuc3BsaXQoJy8nKSlcbiAgICAgICAgICAgIGh0bWwucHVzaCBcIlwiXCI8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+I3tuYW1lfTwvYT5cIlwiXCJcbiAgICAgICAgJChAKS5odG1sIGh0bWwuam9pbignLCAnKVxuXG5cbiAgaGlkZTogKCkgLT5cbiAgICBAJGVsLmhpZGUoKVxuICAgIEB2aXNpYmxlID0gZmFsc2VcblxuICByZW1vdmU6ICgpID0+XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwgQGV0YUludGVydmFsXG4gICAgQHN0b3BMaXN0ZW5pbmcoKVxuICAgIHN1cGVyKClcblxuICByZXBvcnRSZXF1ZXN0ZWQ6ICgpID0+XG4gICAgQCRlbC5odG1sIHRlbXBsYXRlcy5yZXBvcnRMb2FkaW5nLnJlbmRlcih7fSlcblxuICByZXBvcnRFcnJvcjogKG1zZywgY2FuY2VsbGVkUmVxdWVzdCkgPT5cbiAgICB1bmxlc3MgY2FuY2VsbGVkUmVxdWVzdFxuICAgICAgaWYgbXNnIGlzICdKT0JfRVJST1InXG4gICAgICAgIEBzaG93RXJyb3IgJ0Vycm9yIHdpdGggc3BlY2lmaWMgam9iJ1xuICAgICAgZWxzZVxuICAgICAgICBAc2hvd0Vycm9yIG1zZ1xuXG4gIHNob3dFcnJvcjogKG1zZykgPT5cbiAgICBAJCgnLnByb2dyZXNzJykucmVtb3ZlKClcbiAgICBAJCgncC5lcnJvcicpLnJlbW92ZSgpXG4gICAgQCQoJ2g0JykudGV4dChcIkFuIEVycm9yIE9jY3VycmVkXCIpLmFmdGVyIFwiXCJcIlxuICAgICAgPHAgY2xhc3M9XCJlcnJvclwiIHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+I3ttc2d9PC9wPlxuICAgIFwiXCJcIlxuXG4gIHJlcG9ydEpvYnM6ICgpID0+XG4gICAgdW5sZXNzIEBtYXhFdGFcbiAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLndpZHRoKCcxMDAlJylcbiAgICBAJCgnaDQnKS50ZXh0IFwiQW5hbHl6aW5nIERlc2lnbnNcIlxuXG4gIHN0YXJ0RXRhQ291bnRkb3duOiAoKSA9PlxuICAgIGlmIEBtYXhFdGFcbiAgICAgIF8uZGVsYXkgKCkgPT5cbiAgICAgICAgQHJlcG9ydFJlc3VsdHMucG9sbCgpXG4gICAgICAsIChAbWF4RXRhICsgMSkgKiAxMDAwXG4gICAgICBfLmRlbGF5ICgpID0+XG4gICAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLmNzcyAndHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb24nLCAnbGluZWFyJ1xuICAgICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS5jc3MgJ3RyYW5zaXRpb24tZHVyYXRpb24nLCBcIiN7QG1heEV0YSArIDF9c1wiXG4gICAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLndpZHRoKCcxMDAlJylcbiAgICAgICwgNTAwXG5cbiAgcmVuZGVySm9iRGV0YWlsczogKCkgPT5cbiAgICBtYXhFdGEgPSBudWxsXG4gICAgZm9yIGpvYiBpbiBAcmVwb3J0UmVzdWx0cy5tb2RlbHNcbiAgICAgIGlmIGpvYi5nZXQoJ2V0YVNlY29uZHMnKVxuICAgICAgICBpZiAhbWF4RXRhIG9yIGpvYi5nZXQoJ2V0YVNlY29uZHMnKSA+IG1heEV0YVxuICAgICAgICAgIG1heEV0YSA9IGpvYi5nZXQoJ2V0YVNlY29uZHMnKVxuICAgIGlmIG1heEV0YVxuICAgICAgQG1heEV0YSA9IG1heEV0YVxuICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykud2lkdGgoJzUlJylcbiAgICAgIEBzdGFydEV0YUNvdW50ZG93bigpXG5cbiAgICBAJCgnW3JlbD1kZXRhaWxzXScpLmNzcygnZGlzcGxheScsICdibG9jaycpXG4gICAgQCQoJ1tyZWw9ZGV0YWlsc10nKS5jbGljayAoZSkgPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgQCQoJ1tyZWw9ZGV0YWlsc10nKS5oaWRlKClcbiAgICAgIEAkKCcuZGV0YWlscycpLnNob3coKVxuICAgIGZvciBqb2IgaW4gQHJlcG9ydFJlc3VsdHMubW9kZWxzXG4gICAgICBpdGVtID0gbmV3IEpvYkl0ZW0oam9iKVxuICAgICAgaXRlbS5yZW5kZXIoKVxuICAgICAgQCQoJy5kZXRhaWxzJykuYXBwZW5kIGl0ZW0uZWxcblxuICBnZXRSZXN1bHQ6IChpZCkgLT5cbiAgICByZXN1bHRzID0gQGdldFJlc3VsdHMoKVxuICAgIHJlc3VsdCA9IF8uZmluZCByZXN1bHRzLCAocikgLT4gci5wYXJhbU5hbWUgaXMgaWRcbiAgICB1bmxlc3MgcmVzdWx0P1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyByZXN1bHQgd2l0aCBpZCAnICsgaWQpXG4gICAgcmVzdWx0LnZhbHVlXG5cbiAgZ2V0Rmlyc3RSZXN1bHQ6IChwYXJhbSwgaWQpIC0+XG4gICAgcmVzdWx0ID0gQGdldFJlc3VsdChwYXJhbSlcbiAgICB0cnlcbiAgICAgIHJldHVybiByZXN1bHRbMF0uZmVhdHVyZXNbMF0uYXR0cmlidXRlc1tpZF1cbiAgICBjYXRjaCBlXG4gICAgICB0aHJvdyBcIkVycm9yIGZpbmRpbmcgI3twYXJhbX06I3tpZH0gaW4gZ3AgcmVzdWx0c1wiXG5cbiAgZ2V0UmVzdWx0czogKCkgLT5cbiAgICByZXN1bHRzID0gQHJlcG9ydFJlc3VsdHMubWFwKChyZXN1bHQpIC0+IHJlc3VsdC5nZXQoJ3Jlc3VsdCcpLnJlc3VsdHMpXG4gICAgdW5sZXNzIHJlc3VsdHM/Lmxlbmd0aFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBncCByZXN1bHRzJylcbiAgICBfLmZpbHRlciByZXN1bHRzLCAocmVzdWx0KSAtPlxuICAgICAgcmVzdWx0LnBhcmFtTmFtZSBub3QgaW4gWydSZXN1bHRDb2RlJywgJ1Jlc3VsdE1zZyddXG5cbiAgcmVjb3JkU2V0OiAoZGVwZW5kZW5jeSwgcGFyYW1OYW1lLCBza2V0Y2hDbGFzc0lkPWZhbHNlKSAtPlxuICAgIHVubGVzcyBkZXBlbmRlbmN5IGluIEBkZXBlbmRlbmNpZXNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlVua25vd24gZGVwZW5kZW5jeSAje2RlcGVuZGVuY3l9XCJcbiAgICBkZXAgPSBAcmVwb3J0UmVzdWx0cy5maW5kIChyKSAtPiByLmdldCgnc2VydmljZU5hbWUnKSBpcyBkZXBlbmRlbmN5XG4gICAgdW5sZXNzIGRlcFxuICAgICAgY29uc29sZS5sb2cgQHJlcG9ydFJlc3VsdHMubW9kZWxzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDb3VsZCBub3QgZmluZCByZXN1bHRzIGZvciAje2RlcGVuZGVuY3l9LlwiXG4gICAgcGFyYW0gPSBfLmZpbmQgZGVwLmdldCgncmVzdWx0JykucmVzdWx0cywgKHBhcmFtKSAtPlxuICAgICAgcGFyYW0ucGFyYW1OYW1lIGlzIHBhcmFtTmFtZVxuICAgIHVubGVzcyBwYXJhbVxuICAgICAgY29uc29sZS5sb2cgZGVwLmdldCgnZGF0YScpLnJlc3VsdHNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIkNvdWxkIG5vdCBmaW5kIHBhcmFtICN7cGFyYW1OYW1lfSBpbiAje2RlcGVuZGVuY3l9XCJcbiAgICBuZXcgUmVjb3JkU2V0KHBhcmFtLCBALCBza2V0Y2hDbGFzc0lkKVxuXG4gIGVuYWJsZVRhYmxlUGFnaW5nOiAoKSAtPlxuICAgIEAkKCdbZGF0YS1wYWdpbmddJykuZWFjaCAoKSAtPlxuICAgICAgJHRhYmxlID0gJChAKVxuICAgICAgcGFnZVNpemUgPSAkdGFibGUuZGF0YSgncGFnaW5nJylcbiAgICAgIHJvd3MgPSAkdGFibGUuZmluZCgndGJvZHkgdHInKS5sZW5ndGhcbiAgICAgIHBhZ2VzID0gTWF0aC5jZWlsKHJvd3MgLyBwYWdlU2l6ZSlcbiAgICAgIGlmIHBhZ2VzID4gMVxuICAgICAgICAkdGFibGUuYXBwZW5kIFwiXCJcIlxuICAgICAgICAgIDx0Zm9vdD5cbiAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgPHRkIGNvbHNwYW49XCIjeyR0YWJsZS5maW5kKCd0aGVhZCB0aCcpLmxlbmd0aH1cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGFnaW5hdGlvblwiPlxuICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj5QcmV2PC9hPjwvbGk+XG4gICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICA8L3Rmb290PlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgdWwgPSAkdGFibGUuZmluZCgndGZvb3QgdWwnKVxuICAgICAgICBmb3IgaSBpbiBfLnJhbmdlKDEsIHBhZ2VzICsgMSlcbiAgICAgICAgICB1bC5hcHBlbmQgXCJcIlwiXG4gICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj4je2l9PC9hPjwvbGk+XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHVsLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj5OZXh0PC9hPjwvbGk+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICAkdGFibGUuZmluZCgnbGkgYScpLmNsaWNrIChlKSAtPlxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICRhID0gJCh0aGlzKVxuICAgICAgICAgIHRleHQgPSAkYS50ZXh0KClcbiAgICAgICAgICBpZiB0ZXh0IGlzICdOZXh0J1xuICAgICAgICAgICAgYSA9ICRhLnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJy5hY3RpdmUnKS5uZXh0KCkuZmluZCgnYScpXG4gICAgICAgICAgICB1bmxlc3MgYS50ZXh0KCkgaXMgJ05leHQnXG4gICAgICAgICAgICAgIGEuY2xpY2soKVxuICAgICAgICAgIGVsc2UgaWYgdGV4dCBpcyAnUHJldidcbiAgICAgICAgICAgIGEgPSAkYS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuYWN0aXZlJykucHJldigpLmZpbmQoJ2EnKVxuICAgICAgICAgICAgdW5sZXNzIGEudGV4dCgpIGlzICdQcmV2J1xuICAgICAgICAgICAgICBhLmNsaWNrKClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAkYS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgICRhLnBhcmVudCgpLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICBuID0gcGFyc2VJbnQodGV4dClcbiAgICAgICAgICAgICR0YWJsZS5maW5kKCd0Ym9keSB0cicpLmhpZGUoKVxuICAgICAgICAgICAgb2Zmc2V0ID0gcGFnZVNpemUgKiAobiAtIDEpXG4gICAgICAgICAgICAkdGFibGUuZmluZChcInRib2R5IHRyXCIpLnNsaWNlKG9mZnNldCwgbipwYWdlU2l6ZSkuc2hvdygpXG4gICAgICAgICQoJHRhYmxlLmZpbmQoJ2xpIGEnKVsxXSkuY2xpY2soKVxuXG4gICAgICBpZiBub1Jvd3NNZXNzYWdlID0gJHRhYmxlLmRhdGEoJ25vLXJvd3MnKVxuICAgICAgICBpZiByb3dzIGlzIDBcbiAgICAgICAgICBwYXJlbnQgPSAkdGFibGUucGFyZW50KClcbiAgICAgICAgICAkdGFibGUucmVtb3ZlKClcbiAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2xhc3MgJ3RhYmxlQ29udGFpbmVyJ1xuICAgICAgICAgIHBhcmVudC5hcHBlbmQgXCI8cD4je25vUm93c01lc3NhZ2V9PC9wPlwiXG5cbiAgZW5hYmxlTGF5ZXJUb2dnbGVyczogKCkgLT5cbiAgICBlbmFibGVMYXllclRvZ2dsZXJzKEAkZWwpXG5cbiAgZ2V0Q2hpbGRyZW46IChza2V0Y2hDbGFzc0lkKSAtPlxuICAgIF8uZmlsdGVyIEBjaGlsZHJlbiwgKGNoaWxkKSAtPiBjaGlsZC5nZXRTa2V0Y2hDbGFzcygpLmlkIGlzIHNrZXRjaENsYXNzSWRcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlcG9ydFRhYlxuIiwibW9kdWxlLmV4cG9ydHMgPVxuICBcbiAgcm91bmQ6IChudW1iZXIsIGRlY2ltYWxQbGFjZXMpIC0+XG4gICAgdW5sZXNzIF8uaXNOdW1iZXIgbnVtYmVyXG4gICAgICBudW1iZXIgPSBwYXJzZUZsb2F0KG51bWJlcilcbiAgICBtdWx0aXBsaWVyID0gTWF0aC5wb3cgMTAsIGRlY2ltYWxQbGFjZXNcbiAgICBNYXRoLnJvdW5kKG51bWJlciAqIG11bHRpcGxpZXIpIC8gbXVsdGlwbGllciIsInRoaXNbXCJUZW1wbGF0ZXNcIl0gPSB0aGlzW1wiVGVtcGxhdGVzXCJdIHx8IHt9O1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9hdHRyaWJ1dGVzL2F0dHJpYnV0ZUl0ZW1cIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPHRyIGRhdGEtYXR0cmlidXRlLWlkPVxcXCJcIik7Xy5iKF8udihfLmYoXCJpZFwiLGMscCwwKSkpO18uYihcIlxcXCIgZGF0YS1hdHRyaWJ1dGUtZXhwb3J0aWQ9XFxcIlwiKTtfLmIoXy52KF8uZihcImV4cG9ydGlkXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiBkYXRhLWF0dHJpYnV0ZS10eXBlPVxcXCJcIik7Xy5iKF8udihfLmYoXCJ0eXBlXCIsYyxwLDApKSk7Xy5iKFwiXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDx0ZCBjbGFzcz1cXFwibmFtZVxcXCI+XCIpO18uYihfLnYoXy5mKFwibmFtZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8dGQgY2xhc3M9XFxcInZhbHVlXFxcIj5cIik7Xy5iKF8udihfLmYoXCJmb3JtYXR0ZWRWYWx1ZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC90cj5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9hdHRyaWJ1dGVzL2F0dHJpYnV0ZXNUYWJsZVwiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8dGFibGUgY2xhc3M9XFxcImF0dHJpYnV0ZXNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJhdHRyaWJ1dGVzXCIsYyxwLDEpLGMscCwwLDQ0LDgxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXy5ycChcImF0dHJpYnV0ZXMvYXR0cmlidXRlSXRlbVwiLGMscCxcIiAgICBcIikpO30pO2MucG9wKCk7fV8uYihcIjwvdGFibGU+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvZ2VuZXJpY0F0dHJpYnV0ZXNcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7aWYoXy5zKF8uZChcInNrZXRjaENsYXNzLmRlbGV0ZWRcIixjLHAsMSksYyxwLDAsMjQsMjcwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJhbGVydCBhbGVydC13YXJuXFxcIiBzdHlsZT1cXFwibWFyZ2luLWJvdHRvbToxMHB4O1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBUaGlzIHNrZXRjaCB3YXMgY3JlYXRlZCB1c2luZyB0aGUgXFxcIlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCJcXFwiIHRlbXBsYXRlLCB3aGljaCBpc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgbm8gbG9uZ2VyIGF2YWlsYWJsZS4gWW91IHdpbGwgbm90IGJlIGFibGUgdG8gY29weSB0aGlzIHNrZXRjaCBvciBtYWtlIG5ld1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgc2tldGNoZXMgb2YgdGhpcyB0eXBlLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+XCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIiBBdHRyaWJ1dGVzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXy5ycChcImF0dHJpYnV0ZXMvYXR0cmlidXRlc1RhYmxlXCIsYyxwLFwiICAgIFwiKSk7Xy5iKFwiICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wibm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3JlcG9ydExvYWRpbmdcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0TG9hZGluZ1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8IS0tIDxkaXYgY2xhc3M9XFxcInNwaW5uZXJcXFwiPjM8L2Rpdj4gLS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+UmVxdWVzdGluZyBSZXBvcnQgZnJvbSBTZXJ2ZXI8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGRpdiBjbGFzcz1cXFwicHJvZ3Jlc3MgcHJvZ3Jlc3Mtc3RyaXBlZCBhY3RpdmVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJiYXJcXFwiIHN0eWxlPVxcXCJ3aWR0aDogMTAwJTtcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8YSBocmVmPVxcXCIjXFxcIiByZWw9XFxcImRldGFpbHNcXFwiPmRldGFpbHM8L2E+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcImRldGFpbHNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xuXG5pZih0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gdGhpc1tcIlRlbXBsYXRlc1wiXTtcbn0iLCJSZXBvcnRUYWIgPSByZXF1aXJlICdyZXBvcnRUYWInXG50ZW1wbGF0ZXMgPSByZXF1aXJlICcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5fcGFydGlhbHMgPSByZXF1aXJlICcuLi9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxucGFydGlhbHMgPSBbXVxuZm9yIGtleSwgdmFsIG9mIF9wYXJ0aWFsc1xuICBwYXJ0aWFsc1trZXkucmVwbGFjZSgnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpLycsICcnKV0gPSB2YWxcblxuaWRzID0gcmVxdWlyZSAnLi9pZHMuY29mZmVlJ1xuZm9yIGtleSwgdmFsdWUgb2YgaWRzXG4gIHdpbmRvd1trZXldID0gdmFsdWVcblxuXG5jbGFzcyBFbnZpcm9ubWVudFRhYiBleHRlbmRzIFJlcG9ydFRhYlxuICAjIHRoaXMgaXMgdGhlIG5hbWUgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgVGFiXG4gIG5hbWU6ICdIYWJpdGF0cydcbiAgY2xhc3NOYW1lOiAnZW52aXJvbm1lbnQnXG4gIHRpbWVvdXQ6IDEyMDAwMFxuICB0ZW1wbGF0ZTogdGVtcGxhdGVzLmVudmlyb25tZW50XG4gIGRlcGVuZGVuY2llczogW1xuICAgICdIYWJpdGF0c0Vudmlyb25tZW50J1xuICAgICdIYWJpdGF0c092ZXJ2aWV3J1xuICAgICdBZGphY2VudFRlcnJlc3RyaWFsJ1xuICAgICdIYWJpdGF0c1JlcHJlc2VudGl2aXR5J1xuICBdXG5cbiAgcmVuZGVyOiAoKSAtPlxuXG4gICAgI3Nob3cgdGFibGVzIGluc3RlYWQgb2YgZ3JhcGggZm9yIElFXG4gICAgaWYgd2luZG93LmQzXG4gICAgICBkM0lzUHJlc2VudCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBkM0lzUHJlc2VudCA9IGZhbHNlXG5cbiAgICBoYWJpdGF0cyA9IEByZWNvcmRTZXQoJ0hhYml0YXRzRW52aXJvbm1lbnQnLCAnSGFiaXRhdFNpemUnKS50b0FycmF5KClcbiAgICBoYWJzX2luX3NrZXRjaCA9IGhhYml0YXRzPy5sZW5ndGhcbiAgICBoYWJzX3BsdXJhbCA9IGhhYnNfaW5fc2tldGNoICE9IDFcblxuICAgIGV2ZW5uZXNzID0gQHJlY29yZFNldCgnSGFiaXRhdHNPdmVydmlldycsICdIYWJpdGF0RXZlbm5lc3MnKS5mbG9hdCgnRVZFTk5FU1MnKVxuICAgIHRvdGFsX2hhYnMgPSBAcmVjb3JkU2V0KCdIYWJpdGF0c092ZXJ2aWV3JywgJ0hhYml0YXRTaXplJykuZmxvYXQoJ1RPVF9IQUJTJylcbiAgICBwdWJsaWNfbGFuZCA9IEByZWNvcmRTZXQoJ0FkamFjZW50VGVycmVzdHJpYWwnLCAnUHVibGljQ29uc2VydmF0aW9uTGFuZCcpLnRvQXJyYXkoKVxuICAgIGhhc1B1YmxpYyA9IHB1YmxpY19sYW5kPy5sZW5ndGggPiAwXG4gICAgY29hc3RhbF9sYW5kID0gQHJlY29yZFNldCgnQWRqYWNlbnRUZXJyZXN0cmlhbCcsICdDb2FzdGFsUHJvdGVjdGlvbicpLnRvQXJyYXkoKVxuICAgIGhhc0NvYXN0YWwgPSBjb2FzdGFsX2xhbmQ/Lmxlbmd0aCA+IDBcbiAgICBhZGphY2VudF9sYW5kID0gQHJlY29yZFNldCgnQWRqYWNlbnRUZXJyZXN0cmlhbCcsICdBZGphY2VudExhbmRDb3ZlcicpLnRvQXJyYXkoKVxuICAgIGhhc0FkamFjZW50ID0gYWRqYWNlbnRfbGFuZD8ubGVuZ3RoID4gMFxuICAgIFxuICAgIGhhYml0YXRzX3JlcHJlc2VudGVkID0gQHJlY29yZFNldCgnSGFiaXRhdHNSZXByZXNlbnRpdml0eScsICdSZXByZXNlbnRlZEhhYnMnKS50b0FycmF5KClcbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgIGlzQ29sbGVjdGlvbiA9IEBtb2RlbC5pc0NvbGxlY3Rpb24oKVxuICAgIGNvbnRleHQgPVxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcbiAgICAgIGhhYml0YXRzOiBoYWJpdGF0c1xuICAgICAgaGFic19pbl9za2V0Y2g6IGhhYnNfaW5fc2tldGNoXG4gICAgICBoYWJzX3BsdXJhbDogaGFic19wbHVyYWxcbiAgICAgIGV2ZW5uZXNzOiBldmVubmVzc1xuICAgICAgdG90YWxfaGFiczogdG90YWxfaGFic1xuICAgICAgaGFiaXRhdHNfcmVwcmVzZW50ZWQ6IGhhYml0YXRzX3JlcHJlc2VudGVkXG5cblxuICAgICAgXG4gICAgICBwdWJsaWNfbGFuZDogcHVibGljX2xhbmRcbiAgICAgIGhhc1B1YmxpY0xhbmQ6IGhhc1B1YmxpY1xuICAgICAgY29hc3RhbF9sYW5kOiBjb2FzdGFsX2xhbmRcbiAgICAgIGhhc0NvYXN0YWxMYW5kOiBoYXNDb2FzdGFsXG4gICAgICBhZGphY2VudF9sYW5kOiBhZGphY2VudF9sYW5kXG4gICAgICBoYXNBZGphY2VudExhbmQ6IGhhc0FkamFjZW50XG4gICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgcGFydGlhbHMpXG4gICAgQGVuYWJsZUxheWVyVG9nZ2xlcnMoKVxuICAgIEBzZXR1cEhhYml0YXRTb3J0aW5nKGhhYml0YXRzKVxuXG4gICAgQGVuYWJsZVRhYmxlUGFnaW5nKClcbiAgICBcbiAgc2V0dXBIYWJpdGF0U29ydGluZzogKGhhYml0YXRzKSA9PlxuICAgIHRib2R5TmFtZSA9ICcuaGFiX3ZhbHVlcydcbiAgICB0YWJsZU5hbWUgPSAnLmhhYl90YWJsZSdcbiAgICBAJCgnLmhhYl90eXBlJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2hhYl90eXBlJywgdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiSEFCX1RZUEVcIiwgdGJvZHlOYW1lLCBmYWxzZSwgQGdldEhhYml0YXRSb3dTdHJpbmcpXG4gICAgQCQoJy5oYWJfbmV3X2FyZWEnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnaGFiX25ld19hcmVhJywgdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiU0laRV9IQVwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nKVxuICAgIEAkKCcuaGFiX25ld19wZXJjJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2hhYl9uZXdfcGVyYycsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiU0laRV9QRVJDXCIsIHRib2R5TmFtZSwgdHJ1ZSwgQGdldEhhYml0YXRSb3dTdHJpbmcpXG4gICAgQHJlbmRlclNvcnQoJ2hhYl90eXBlJywgdGFibGVOYW1lLCBoYWJpdGF0cywgdW5kZWZpbmVkLCBcIkhBQl9UWVBFXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRIYWJpdGF0Um93U3RyaW5nKVxuXG4gICNkbyB0aGUgc29ydGluZyAtIHNob3VsZCBiZSB0YWJsZSBpbmRlcGVuZGVudFxuICAjc2tpcCBhbnkgdGhhdCBhcmUgbGVzcyB0aGFuIDAuMDBcbiAgcmVuZGVyU29ydDogKG5hbWUsIHRhYmxlTmFtZSwgcGRhdGEsIGV2ZW50LCBzb3J0QnksIHRib2R5TmFtZSwgaXNGbG9hdCwgZ2V0Um93U3RyaW5nVmFsdWUpID0+XG4gICAgaWYgZXZlbnRcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuXG4gICAgaWYgd2luZG93LmQzXG4gICAgICB0YXJnZXRDb2x1bW4gPSBAZ2V0U2VsZWN0ZWRDb2x1bW4oZXZlbnQsIG5hbWUpXG4gICAgICBzb3J0VXAgPSBAZ2V0U29ydERpcih0YXJnZXRDb2x1bW4pXG5cbiAgICAgIGlmIGlzRmxvYXRcbiAgICAgICAgZGF0YSA9IF8uc29ydEJ5IHBkYXRhLCAocm93KSAtPiAgcGFyc2VGbG9hdChyb3dbc29ydEJ5XSlcbiAgICAgIGVsc2VcbiAgICAgICAgZGF0YSA9IF8uc29ydEJ5IHBkYXRhLCAocm93KSAtPiByb3dbc29ydEJ5XVxuXG4gICAgICAjZmxpcCBzb3J0aW5nIGlmIG5lZWRlZFxuICAgICAgaWYgc29ydFVwXG4gICAgICAgIGRhdGEucmV2ZXJzZSgpXG5cbiAgICAgIGVsID0gQCQodGJvZHlOYW1lKVswXVxuICAgICAgaGFiX2JvZHkgPSBkMy5zZWxlY3QoZWwpXG5cbiAgICAgICNyZW1vdmUgb2xkIHJvd3NcbiAgICAgIGhhYl9ib2R5LnNlbGVjdEFsbChcInRyLmhhYl9yb3dzXCIpXG4gICAgICAgIC5yZW1vdmUoKVxuXG4gICAgICAjYWRkIG5ldyByb3dzIChhbmQgZGF0YSlcbiAgICAgIHJvd3MgPSBoYWJfYm9keS5zZWxlY3RBbGwoXCJ0clwiKVxuICAgICAgICAgIC5kYXRhKGRhdGEpXG4gICAgICAgIC5lbnRlcigpLmluc2VydChcInRyXCIsIFwiOmZpcnN0LWNoaWxkXCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJoYWJfcm93c1wiKVxuXG4gICAgICBjb2x1bW5zID0gW1wiSEFCX1RZUEVcIiwgXCJTSVpFX0hBXCIsIFwiU0laRV9QRVJDXCJdXG4gICAgICBjZWxscyA9IHJvd3Muc2VsZWN0QWxsKFwidGRcIilcbiAgICAgICAgICAuZGF0YSgocm93LCBpKSAtPmNvbHVtbnMubWFwIChjb2x1bW4pIC0+IChjb2x1bW46IGNvbHVtbiwgdmFsdWU6IHJvd1tjb2x1bW5dKSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZChcInRkXCIpLnRleHQoKGQsIGkpIC0+IFxuICAgICAgICAgIGQudmFsdWVcbiAgICAgICAgKSAgICBcblxuICAgICAgQHNldE5ld1NvcnREaXIodGFyZ2V0Q29sdW1uLCBzb3J0VXApXG4gICAgICBAc2V0U29ydGluZ0NvbG9yKGV2ZW50LCB0YWJsZU5hbWUpXG4gICAgICAjZmlyZSB0aGUgZXZlbnQgZm9yIHRoZSBhY3RpdmUgcGFnZSBpZiBwYWdpbmF0aW9uIGlzIHByZXNlbnRcbiAgICAgIEBmaXJlUGFnaW5hdGlvbih0YWJsZU5hbWUpXG4gICAgICBpZiBldmVudFxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICN0YWJsZSByb3cgZm9yIGhhYml0YXQgcmVwcmVzZW50YXRpb25cbiAgZ2V0SGFiaXRhdFJvd1N0cmluZzogKGQpID0+XG4gICAgcmV0dXJuIFwiPHRkPlwiK2QuSEFCX1RZUEUrXCI8L3RkPlwiK1wiPHRkPlwiK2QuU0laRV9IQStcIjwvdGQ+XCIrXCI8dGQ+XCIrZC5TSVpFX1BFUkMrXCI8L3RkPlwiXG5cbiAgc2V0U29ydGluZ0NvbG9yOiAoZXZlbnQsIHRhYmxlTmFtZSkgPT5cbiAgICBzb3J0aW5nQ2xhc3MgPSBcInNvcnRpbmdfY29sXCJcbiAgICBpZiBldmVudFxuICAgICAgcGFyZW50ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoKVxuICAgICAgbmV3VGFyZ2V0TmFtZSA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuY2xhc3NOYW1lXG4gICAgICB0YXJnZXRTdHIgPSB0YWJsZU5hbWUrXCIgdGguc29ydGluZ19jb2wgYVwiICAgXG4gICAgICBpZiBAJCh0YXJnZXRTdHIpIGFuZCBAJCh0YXJnZXRTdHIpWzBdXG4gICAgICAgIG9sZFRhcmdldE5hbWUgPSBAJCh0YXJnZXRTdHIpWzBdLmNsYXNzTmFtZVxuICAgICAgICBpZiBuZXdUYXJnZXROYW1lICE9IG9sZFRhcmdldE5hbWVcbiAgICAgICAgICAjcmVtb3ZlIGl0IGZyb20gb2xkIFxuICAgICAgICAgIGhlYWRlck5hbWUgPSB0YWJsZU5hbWUrXCIgdGguc29ydGluZ19jb2xcIlxuICAgICAgICAgIEAkKGhlYWRlck5hbWUpLnJlbW92ZUNsYXNzKHNvcnRpbmdDbGFzcylcbiAgICAgICAgICAjYW5kIGFkZCBpdCB0byBuZXdcbiAgICAgICAgICBwYXJlbnQuYWRkQ2xhc3Moc29ydGluZ0NsYXNzKVxuICAgICBcbiAgZ2V0U29ydERpcjogKHRhcmdldENvbHVtbikgPT5cbiAgICAgc29ydHVwID0gQCQoJy4nK3RhcmdldENvbHVtbikuaGFzQ2xhc3MoXCJzb3J0X3VwXCIpXG4gICAgIHJldHVybiBzb3J0dXBcblxuICBnZXRTZWxlY3RlZENvbHVtbjogKGV2ZW50LCBuYW1lKSA9PlxuICAgIGlmIGV2ZW50XG4gICAgICAjZ2V0IHNvcnQgb3JkZXJcbiAgICAgIHRhcmdldENvbHVtbiA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuY2xhc3NOYW1lXG4gICAgICBtdWx0aUNsYXNzZXMgPSB0YXJnZXRDb2x1bW4uc3BsaXQoJyAnKVxuICAgICAgI3Byb3RlY3RlZE1hbW1hbHMgPSBfLnNvcnRCeSBwcm90ZWN0ZWRNYW1tYWxzLCAocm93KSAtPiBwYXJzZUludChyb3cuQ291bnQpXG4gICAgICBoYWJDbGFzc05hbWUgPV8uZmluZCBtdWx0aUNsYXNzZXMsIChjbGFzc25hbWUpIC0+IFxuICAgICAgICBjbGFzc25hbWUubGFzdEluZGV4T2YoJ2hhYicsMCkgPT0gMFxuICAgICAgdGFyZ2V0Q29sdW1uID0gaGFiQ2xhc3NOYW1lXG4gICAgZWxzZVxuICAgICAgI3doZW4gdGhlcmUgaXMgbm8gZXZlbnQsIGZpcnN0IHRpbWUgdGFibGUgaXMgZmlsbGVkXG4gICAgICB0YXJnZXRDb2x1bW4gPSBuYW1lXG5cbiAgICByZXR1cm4gdGFyZ2V0Q29sdW1uXG5cbiAgc2V0TmV3U29ydERpcjogKHRhcmdldENvbHVtbiwgc29ydFVwKSA9PlxuICAgICNhbmQgc3dpdGNoIGl0XG4gICAgaWYgc29ydFVwXG4gICAgICBAJCgnLicrdGFyZ2V0Q29sdW1uKS5yZW1vdmVDbGFzcygnc29ydF91cCcpXG4gICAgICBAJCgnLicrdGFyZ2V0Q29sdW1uKS5hZGRDbGFzcygnc29ydF9kb3duJylcbiAgICBlbHNlXG4gICAgICBAJCgnLicrdGFyZ2V0Q29sdW1uKS5hZGRDbGFzcygnc29ydF91cCcpXG4gICAgICBAJCgnLicrdGFyZ2V0Q29sdW1uKS5yZW1vdmVDbGFzcygnc29ydF9kb3duJylcblxuICBmaXJlUGFnaW5hdGlvbjogKHRhYmxlTmFtZSkgPT5cbiAgICBlbCA9IEAkKHRhYmxlTmFtZSlbMF1cbiAgICBoYWJfdGFibGUgPSBkMy5zZWxlY3QoZWwpXG4gICAgYWN0aXZlX3BhZ2UgPSBoYWJfdGFibGUuc2VsZWN0QWxsKFwiLmFjdGl2ZSBhXCIpXG4gICAgaWYgYWN0aXZlX3BhZ2UgYW5kIGFjdGl2ZV9wYWdlWzBdIGFuZCBhY3RpdmVfcGFnZVswXVswXVxuICAgICAgYWN0aXZlX3BhZ2VbMF1bMF0uY2xpY2soKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVudmlyb25tZW50VGFiIiwiUmVwb3J0VGFiID0gcmVxdWlyZSAncmVwb3J0VGFiJ1xudGVtcGxhdGVzID0gcmVxdWlyZSAnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxuX3BhcnRpYWxzID0gcmVxdWlyZSAnLi4vbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cbmlkcyA9IHJlcXVpcmUgJy4vaWRzLmNvZmZlZSdcbmZvciBrZXksIHZhbHVlIG9mIGlkc1xuICB3aW5kb3dba2V5XSA9IHZhbHVlXG5cblxuY2xhc3MgRmlzaGluZ1RhYiBleHRlbmRzIFJlcG9ydFRhYlxuICAjIHRoaXMgaXMgdGhlIG5hbWUgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgVGFiXG4gIG5hbWU6ICdGaXNoaW5nJ1xuICBjbGFzc05hbWU6ICdmaXNoaW5nJ1xuICB0aW1lb3V0OiAxMjAwMDBcbiAgdGVtcGxhdGU6IHRlbXBsYXRlcy5maXNoaW5nXG4gIGRlcGVuZGVuY2llczogW1xuICAgICdGaXNoaW5nQXJlYXMnXG4gIF1cblxuICByZW5kZXI6ICgpIC0+XG5cbiAgICAjc2hvdyB0YWJsZXMgaW5zdGVhZCBvZiBncmFwaCBmb3IgSUVcbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIGQzSXNQcmVzZW50ID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGQzSXNQcmVzZW50ID0gZmFsc2VcblxuICAgIGV4aXN0aW5nX2N1c3RvbWFyeV9maXNoaW5nID0gQHJlY29yZFNldCgnRmlzaGluZ0FyZWFzJywgJ0V4aXN0aW5nQ3VzdG9tYXJ5QXJlYScpLnRvQXJyYXkoKVxuICAgIGhhc0V4aXN0aW5nQ3VzdG9tYXJ5ID0gZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmc/Lmxlbmd0aCA+IDBcbiAgICBjb25zb2xlLmxvZyhcImV4aXN0aW5nX2N1c3RvbWFyeTogXCIsIGV4aXN0aW5nX2N1c3RvbWFyeV9maXNoaW5nKVxuICAgIHByb3Bvc2VkX2N1c3RvbWFyeV9maXNoaW5nID0gQHJlY29yZFNldCgnRmlzaGluZ0FyZWFzJywgJ1Byb3Bvc2VkQ3VzdG9tYXJ5QXJlYScpLnRvQXJyYXkoKVxuICAgIGNvbnNvbGUubG9nKFwicHJvcG9zZWQgY3VzdG9tYXJ5OiBcIiwgcHJvcG9zZWRfY3VzdG9tYXJ5X2Zpc2hpbmcpXG4gICAgaGFzUHJvcG9zZWRDdXN0b21hcnkgPSBwcm9wb3NlZF9jdXN0b21hcnlfZmlzaGluZz8ubGVuZ3RoID4gMFxuICAgIGhhc0N1c3RvbWFyeSA9IGhhc0V4aXN0aW5nQ3VzdG9tYXJ5IG9yIGhhc1Byb3Bvc2VkQ3VzdG9tYXJ5XG4gICAgY29uc29sZS5sb2coXCJoYXMgY3VzdG9tYXJ5PyBcIiwgaGFzQ3VzdG9tYXJ5KVxuICAgIGlzQ29sbGVjdGlvbiA9IEBtb2RlbC5pc0NvbGxlY3Rpb24oKVxuICAgIGV4aXN0aW5nX2Zpc2hpbmdfYXJlYXMgPSBAcmVjb3JkU2V0KCdGaXNoaW5nQXJlYXMnLCAnRmlzaGluZ0V4aXN0aW5nQXJlYScpLnRvQXJyYXkoKVxuICAgIGhhc0V4aXN0aW5nRmlzaGluZyA9IGV4aXN0aW5nX2Zpc2hpbmdfYXJlYXM/Lmxlbmd0aCA+IDBcbiAgICBoYXNBbnlGaXNoaW5nID0gaGFzRXhpc3RpbmdGaXNoaW5nIG9yIGhhc0N1c3RvbWFyeVxuXG4gICAgYXR0cmlidXRlcyA9IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICBcbiAgICBjb250ZXh0ID1cbiAgICAgIHNrZXRjaDogQG1vZGVsLmZvclRlbXBsYXRlKClcbiAgICAgIHNrZXRjaENsYXNzOiBAc2tldGNoQ2xhc3MuZm9yVGVtcGxhdGUoKVxuICAgICAgYXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgYW55QXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKS5sZW5ndGggPiAwXG4gICAgICBhZG1pbjogQHByb2plY3QuaXNBZG1pbiB3aW5kb3cudXNlclxuICAgICAgZDNJc1ByZXNlbnQ6IGQzSXNQcmVzZW50XG4gICAgICBleGlzdGluZ19jdXN0b21hcnlfZmlzaGluZzogZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmdcbiAgICAgIGhhc0V4aXN0aW5nQ3VzdG9tYXJ5OiBoYXNFeGlzdGluZ0N1c3RvbWFyeVxuICAgICAgcHJvcG9zZWRfY3VzdG9tYXJ5X2Zpc2hpbmc6IHByb3Bvc2VkX2N1c3RvbWFyeV9maXNoaW5nXG4gICAgICBoYXNQcm9wb3NlZEN1c3RvbWFyeTogaGFzUHJvcG9zZWRDdXN0b21hcnlcbiAgICAgIGV4aXN0aW5nX2Zpc2hpbmdfYXJlYXM6IGV4aXN0aW5nX2Zpc2hpbmdfYXJlYXNcbiAgICAgIGhhc0V4aXN0aW5nRmlzaGluZzogaGFzRXhpc3RpbmdGaXNoaW5nXG4gICAgICBoYXNBbnlGaXNoaW5nOiBoYXNBbnlGaXNoaW5nXG4gICAgICBoYXNDdXN0b21hcnk6IGhhc0N1c3RvbWFyeVxuICAgICAgaXNDb2xsZWN0aW9uOiBpc0NvbGxlY3Rpb25cblxuICAgICAgXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgcGFydGlhbHMpXG4gICAgQGVuYWJsZUxheWVyVG9nZ2xlcnMoKVxuXG4gICAgXG5cbm1vZHVsZS5leHBvcnRzID0gRmlzaGluZ1RhYiIsIm1vZHVsZS5leHBvcnRzID0gXG4gIFBST1RFQ1RJT05fSUQ6ICc1MjRmMjQ5ZDgwZTJiYTZlMjYwMDE5ZWUnXG4gIEFRVUFDVUxUVVJFX0lEOiAnNTI0ZjEyOWM4MGUyYmE2ZTI2MDAxOWM3J1xuICBQUk9URUNUSU9OX0NPTExFQ1RJT05fSUQ6ICc1MjY0NmFiN2YzNDQwNGI4MjQwMDAwMjEnXG4gIEFRVUFDVUxUVVJFX0NPTExFQ1RJT05fSUQ6ICc1MzFlMmJiYjkxYTM4NTYwN2VmNGEwZGQnIiwiUmVwb3J0VGFiID0gcmVxdWlyZSAncmVwb3J0VGFiJ1xudGVtcGxhdGVzID0gcmVxdWlyZSAnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxuX3BhcnRpYWxzID0gcmVxdWlyZSAnLi4vbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cbmlkcyA9IHJlcXVpcmUgJy4vaWRzLmNvZmZlZSdcbmZvciBrZXksIHZhbHVlIG9mIGlkc1xuICB3aW5kb3dba2V5XSA9IHZhbHVlXG5cbk1JTl9TSVpFID0gMTAwMDBcblxuY2xhc3MgT3ZlcnZpZXdUYWIgZXh0ZW5kcyBSZXBvcnRUYWJcbiAgIyB0aGlzIGlzIHRoZSBuYW1lIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIFRhYlxuICBuYW1lOiAnT3ZlcnZpZXcnXG4gIGNsYXNzTmFtZTogJ292ZXJ2aWV3J1xuICB0aW1lb3V0OiAxMjAwMDBcbiAgdGVtcGxhdGU6IHRlbXBsYXRlcy5vdmVydmlld1xuICBkZXBlbmRlbmNpZXM6IFtcbiAgICAnU2l6ZSdcbiAgICAnQ29hc3RsaW5lTGVuZ3RoJ1xuICAgICdIYWJpdGF0c092ZXJ2aWV3J1xuICAgICdQcm9wb3NhbFNpemUnXG4gICAgJ1Byb3Bvc2FsQ29ubmVjdGl2aXR5J1xuICBdXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgICMgVGhlIEByZWNvcmRTZXQgbWV0aG9kIGNvbnRhaW5zIHNvbWUgdXNlZnVsIG1lYW5zIHRvIGdldCBkYXRhIG91dCBvZiBcbiAgICAjIHRoZSBtb25zdGVyb3VzIFJlY29yZFNldCBqc29uLiBDaGVja291dCB0aGUgc2Vhc2tldGNoLXJlcG9ydGluZy10ZW1wbGF0ZVxuICAgICMgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBpbmZvLlxuICAgIFRPVEFMX0NPQVNUTElORV9MRU5HVEggPSA2NjcuNTk0XG4gICAgaXNDb2xsZWN0aW9uID0gQG1vZGVsLmlzQ29sbGVjdGlvbigpXG4gICAgaWYgaXNDb2xsZWN0aW9uXG4gICAgICBudW1Ta2V0Y2hlcyA9IEBtb2RlbC5nZXRDaGlsZHJlbigpLmxlbmd0aFxuICAgIGVsc2VcbiAgICAgIG51bVNrZXRjaGVzID0gMVxuXG5cbiAgICBwcm9wX3NpemVzID0gQHJlY29yZFNldCgnUHJvcG9zYWxTaXplJywgJ1NpemVzJykudG9BcnJheSgpXG5cblxuICAgIG1wYV9hdmdfbWluX2RpbSA9IEBnZXRBdmVyYWdlTWluRGltKHByb3Bfc2l6ZXMpXG4gICAgdG90YWxfcGVyY2VudCA9IEBnZXRUb3RhbEFyZWFQZXJjZW50KHByb3Bfc2l6ZXMpXG4gICAgcHJvcF9zaXplcyA9IEBjbGVhbnVwRGF0YShwcm9wX3NpemVzKVxuICAgIFxuICAgIG1wYV9jb3VudCA9IEBnZXRNaW5EaW1Db3VudChwcm9wX3NpemVzKVxuICAgIHRvdGFsX21wYV9jb3VudCA9IG51bVNrZXRjaGVzXG4gICAgcGx1cmFsX21wYV9jb3VudCA9IG1wYV9jb3VudCAhPSAxXG5cbiAgICBcbiAgICBpZiBtcGFfYXZnX21pbl9kaW0gPCAxMFxuICAgICAgbXBhX2F2Z19zaXplX2d1aWRlbGluZSA9IFwiYmVsb3dcIlxuICAgIGVsc2VcbiAgICAgIG1wYV9hdmdfc2l6ZV9ndWlkZWxpbmUgPSBcImFib3ZlXCJcbiAgICB0cnlcbiAgICAgIHNpemUgPSBAcmVjb3JkU2V0KCdTaXplJywgJ1NpemUnKS5mbG9hdCgnU0laRV9TUUtNJylcbiAgICAgIGNvbnNvbGUubG9nKHNpemUpXG4gICAgICBpZiBzaXplIDwgMC4xXG4gICAgICAgIG5ld19zaXplID0gXCI8IDAuMVwiXG4gICAgICBlbHNlXG4gICAgICAgIG5ld19zaXplID0gIEBhZGRDb21tYXMgc2l6ZVxuXG4gICAgY2F0Y2ggRXJyb3JcbiAgICAgIGNvbnNvbGUubG9nKCdlcnJvciBnZXR0aW5nIHNpemUnKVxuICAgICAgbmV3X3NpemUgPSAwXG5cbiAgICB0cnlcbiAgICAgIHBlcmNlbnQgPSBAcmVjb3JkU2V0KCdTaXplJywgJ1BlcmNlbnQnKS5mbG9hdCgnUEVSQycpXG4gICAgICBpZiBwZXJjZW50ID09IDAgJiYgdG90YWxfcGVyY2VudCA+IDBcbiAgICAgICAgcGVyY2VudCA9IFwiPCAxXCJcbiAgICBjYXRjaCBFcnJvclxuICAgICAgY29uc29sZS5sb2coXCJlcnJvciBnZXR0aW5nIHBlcmNlbnRcIilcbiAgICAgIHBlcmNlbnQgPSB0b3RhbF9wZXJjZW50XG5cbiAgICBjb2FzdGxpbmVfbGVuZ3RoID0gQHJlY29yZFNldCgnQ29hc3RsaW5lTGVuZ3RoJywgJ0NvYXN0bGluZUxlbmd0aCcpLmZsb2F0KCdMR1RIX0lOX00nKVxuICAgIFxuICAgIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA9ICgoY29hc3RsaW5lX2xlbmd0aC8xMDAwKS9UT1RBTF9DT0FTVExJTkVfTEVOR1RIKSoxMDBcbiAgICBpZiBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQgPiAwICYmIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA8IDFcbiAgICAgIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA9IFwiPCAxXCJcbiAgICBlbHNlXG4gICAgICBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQgPSBwYXJzZUZsb2F0KGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCkudG9GaXhlZCgxKVxuXG4gICAgY29hc3RsaW5lX2xlbmd0aCA9IEBhZGRDb21tYXMgY29hc3RsaW5lX2xlbmd0aFxuICAgIG5ld19oYWJzID0gQHJlY29yZFNldCgnSGFiaXRhdHNPdmVydmlldycsICdIYWJpdGF0U2l6ZScpLmZsb2F0KCdORVdfSEFCUycpXG4gICAgdG90YWxfaGFicyA9IEByZWNvcmRTZXQoJ0hhYml0YXRzT3ZlcnZpZXcnLCAnSGFiaXRhdFNpemUnKS5mbG9hdCgnVE9UX0hBQlMnKVxuICAgIFxuICAgIHJhdGlvID0gKGNvYXN0bGluZV9sZW5ndGgvc2l6ZSkudG9GaXhlZCgxKVxuXG4gICAgI3NldHVwIGNvbm5lY3Rpdml0eSBkYXRhXG4gICAgaWYgbnVtU2tldGNoZXMgPiAxXG4gICAgICBwcm9wX2Nvbm4gPSBAcmVjb3JkU2V0KCdQcm9wb3NhbENvbm5lY3Rpdml0eScsICdDb25uJykudG9BcnJheSgpXG4gICAgICBjb25uZWN0ZWRfbXBhX2NvdW50ID0gQHJlY29yZFNldCgnUHJvcG9zYWxDb25uZWN0aXZpdHknLCAnQ29ubicpLmZsb2F0KCdOVU1CRVInKVxuICAgICAgXG4gICAgICBwbHVyYWxfY29ubmVjdGVkX21wYV9jb3VudCA9IHRydWVcblxuICAgICAgbWluX2Rpc3RhbmNlID0gQHJlY29yZFNldCgnUHJvcG9zYWxDb25uZWN0aXZpdHknLCAnQ29ubicpLmZsb2F0KCdNSU4nKVxuICAgICAgbWF4X2Rpc3RhbmNlID0gQHJlY29yZFNldCgnUHJvcG9zYWxDb25uZWN0aXZpdHknLCAnQ29ubicpLmZsb2F0KCdNQVgnKVxuICAgICAgbWVhbl9kaXN0YW5jZSA9IEByZWNvcmRTZXQoJ1Byb3Bvc2FsQ29ubmVjdGl2aXR5JywgJ0Nvbm4nKS5mbG9hdCgnTUVBTicpXG4gICAgICBjb25uX3BpZV92YWx1ZXMgPSBAYnVpbGRfdmFsdWVzKFwiV2l0aGluIENvbm5lY3Rpdml0eSBSYW5nZVwiLCBjb25uZWN0ZWRfbXBhX2NvdW50LFwiI2IzY2ZhN1wiLCBcIk5vdCBXaXRoaW4gUmFuZ2VcIiwgXG4gICAgICAgIHRvdGFsX21wYV9jb3VudC1jb25uZWN0ZWRfbXBhX2NvdW50LCBcIiNlNWNhY2VcIilcblxuICAgICNzaG93IHRhYmxlcyBpbnN0ZWFkIG9mIGdyYXBoIGZvciBJRVxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgZDNJc1ByZXNlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgZDNJc1ByZXNlbnQgPSBmYWxzZVxuXG4gICAgYXR0cmlidXRlcyA9IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICBcbiAgICBjb250ZXh0ID1cbiAgICAgIHNrZXRjaDogQG1vZGVsLmZvclRlbXBsYXRlKClcbiAgICAgIHNrZXRjaENsYXNzOiBAc2tldGNoQ2xhc3MuZm9yVGVtcGxhdGUoKVxuICAgICAgYXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgYW55QXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKS5sZW5ndGggPiAwXG4gICAgICBhZG1pbjogQHByb2plY3QuaXNBZG1pbiB3aW5kb3cudXNlclxuICAgICAgc2l6ZTogbmV3X3NpemVcbiAgICAgIGNvYXN0bGluZV9sZW5ndGg6IGNvYXN0bGluZV9sZW5ndGhcbiAgICAgIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudDpjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnRcbiAgICAgIG5ld19oYWJzOiBuZXdfaGFic1xuICAgICAgdG90YWxfaGFiczogdG90YWxfaGFic1xuICAgICAgcmF0aW86IHJhdGlvXG4gICAgICBwZXJjZW50OiBwZXJjZW50XG4gICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuICAgICAgbnVtU2tldGNoZXM6IG51bVNrZXRjaGVzXG4gICAgICBwcm9wX3NpemVzOiBwcm9wX3NpemVzXG4gICAgICB0b3RhbF9tcGFfY291bnQ6IHRvdGFsX21wYV9jb3VudFxuICAgICAgbXBhX2NvdW50OiBtcGFfY291bnRcbiAgICAgIG1wYV9hdmdfc2l6ZV9ndWlkZWxpbmU6bXBhX2F2Z19zaXplX2d1aWRlbGluZVxuICAgICAgcGx1cmFsX21wYV9jb3VudDogcGx1cmFsX21wYV9jb3VudFxuICAgICAgY29ubmVjdGVkX21wYV9jb3VudDogY29ubmVjdGVkX21wYV9jb3VudFxuXG4gICAgICBwbHVyYWxfY29ubmVjdGVkX21wYV9jb3VudDogcGx1cmFsX2Nvbm5lY3RlZF9tcGFfY291bnRcbiAgICAgIG1pbl9kaXN0YW5jZTogbWluX2Rpc3RhbmNlXG4gICAgICBtYXhfZGlzdGFuY2U6IG1heF9kaXN0YW5jZVxuICAgICAgbWVhbl9kaXN0YW5jZTogbWVhbl9kaXN0YW5jZVxuICAgICAgc2luZ2xlU2tldGNoOiBudW1Ta2V0Y2hlcyA9PSAxXG5cbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcbiAgICBAZW5hYmxlTGF5ZXJUb2dnbGVycygpXG5cbiAgICAjc2l6ZV9waWVfdmFsdWVzID0gQGJ1aWxkX3ZhbHVlcyhcIk1lZXRzIE1pbi4gU2l6ZVwiLCBtcGFfY291bnQsXCIjYjNjZmE3XCIsIFwiRG9lcyBub3QgTWVldCBTaXplIE1pbi5cIiwgXG4gICAgIyAgdG90YWxfbXBhX2NvdW50LW1wYV9jb3VudCwgXCIjZTVjYWNlXCIpXG5cblxuICAgIEBkcmF3UGllKGNvbm5fcGllX3ZhbHVlcywgXCIjY29ubmVjdGl2aXR5X3BpZVwiKVxuICAgICNAZHJhd1BpZShzaXplX3BpZV92YWx1ZXMsIFwiI3NpemVfcGllXCIpXG5cbiAgYnVpbGRfdmFsdWVzOiAoeWVzX2xhYmVsLCB5ZXNfY291bnQsIHllc19jb2xvciwgbm9fbGFiZWwsIG5vX2NvdW50LCBub19jb2xvcikgPT5cbiAgICB5ZXNfdmFsID0ge1wibGFiZWxcIjp5ZXNfbGFiZWwrXCIgKFwiK3llc19jb3VudCtcIilcIiwgXCJ2YWx1ZVwiOnllc19jb3VudCwgXCJjb2xvclwiOnllc19jb2xvciwgXCJ5dmFsXCI6MjV9XG4gICAgbm9fdmFsID0ge1wibGFiZWxcIjpub19sYWJlbCtcIiAoXCIrbm9fY291bnQrXCIpXCIsIFwidmFsdWVcIjpub19jb3VudCwgXCJjb2xvclwiOm5vX2NvbG9yLCBcInl2YWxcIjo1MH1cblxuICAgIHJldHVybiBbeWVzX3ZhbCwgbm9fdmFsXVxuXG4gIGdldERhdGFWYWx1ZTogKGRhdGEpID0+XG4gICAgcmV0dXJuIGRhdGEudmFsdWVcblxuICBkcmF3UGllOiAoZGF0YSwgcGllX25hbWUpID0+XG4gICAgaWYgd2luZG93LmQzXG4gICAgICB3ID0gMTI1XG4gICAgICBoID0gODVcbiAgICAgIHIgPSAzNVxuICAgICBcbiAgICAgIHZpcyA9IGQzLnNlbGVjdChwaWVfbmFtZSkuYXBwZW5kKFwic3ZnOnN2Z1wiKS5kYXRhKFtkYXRhXSkuYXR0cihcIndpZHRoXCIsIHcpLmF0dHIoXCJoZWlnaHRcIiwgaCkuYXBwZW5kKFwic3ZnOmdcIikuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIChyKjIpICsgXCIsXCIgKyAocis1KSArIFwiKVwiKVxuICAgICAgcGllID0gZDMubGF5b3V0LnBpZSgpLnZhbHVlKChkKSAtPiByZXR1cm4gZC52YWx1ZSlcblxuICAgICAgI2RlY2xhcmUgYW4gYXJjIGdlbmVyYXRvciBmdW5jdGlvblxuICAgICAgYXJjID0gZDMuc3ZnLmFyYygpLm91dGVyUmFkaXVzKHIpXG5cbiAgICAgICNzZWxlY3QgcGF0aHMsIHVzZSBhcmMgZ2VuZXJhdG9yIHRvIGRyYXdcbiAgICAgIGFyY3MgPSB2aXMuc2VsZWN0QWxsKFwiZy5zbGljZVwiKS5kYXRhKHBpZSkuZW50ZXIoKS5hcHBlbmQoXCJzdmc6Z1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJzbGljZVwiKVxuICAgICAgYXJjcy5hcHBlbmQoXCJzdmc6cGF0aFwiKVxuICAgICAgICAuYXR0cihcImZpbGxcIiwgKGQpIC0+IHJldHVybiBkLmRhdGEuY29sb3IpXG4gICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIChkKSAtPiByZXR1cm4gaWYgZC5kYXRhLnZhbHVlID09IDAgdGhlbiBcIm5vbmVcIiBlbHNlIFwiIzU0NTQ1NFwiKVxuICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCAwLjI1KVxuICAgICAgICAuYXR0cihcImRcIiwgKGQpIC0+ICBcbiAgICAgICAgICBhcmMoZClcbiAgICAgICAgKVxuXG5cbiAgICAgIGVsID0gQCQocGllX25hbWUrXCJfbGVnZW5kXCIpWzBdXG4gICAgICBjaGFydCA9IGQzLnNlbGVjdChlbClcbiAgICAgIGxlZ2VuZHMgPSBjaGFydC5zZWxlY3RBbGwocGllX25hbWUrXCJfbGVnZW5kXCIpXG4gICAgICAgIC5kYXRhKGRhdGEpXG4gICAgICAuZW50ZXIoKS5pbnNlcnQoXCJkaXZcIilcbiAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwibGVnZW5kLXJvd1wiKVxuXG4gICAgICBsZWdlbmRzLmFwcGVuZChcInNwYW5cIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInBpZS1sYWJlbC1zd2F0Y2hcIilcbiAgICAgICAgLnN0eWxlKCdiYWNrZ3JvdW5kLWNvbG9yJywgKGQsaSkgLT4gZC5jb2xvcilcbiAgICAgIFxuICAgICAgbGVnZW5kcy5hcHBlbmQoXCJzcGFuXCIpXG4gICAgICAgIC50ZXh0KChkLGkpIC0+IHJldHVybiBkYXRhW2ldLmxhYmVsKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwicGllLWxhYmVsXCIpXG5cbiAgICAgIFxuXG4gIGdldFRvdGFsQXJlYVBlcmNlbnQ6IChwcm9wX3NpemVzKSA9PlxuXG4gICAgZm9yIHBzIGluIHByb3Bfc2l6ZXNcbiAgICAgIGlmIHBzLk5BTUUgPT0gXCJQZXJjZW50IG9mIFRvdGFsIEFyZWFcIlxuICAgICAgICByZXR1cm4gcHMuU0laRV9TUUtNXG4gICAgcmV0dXJuIDAuMFxuXG4gIGdldEF2ZXJhZ2VNaW5EaW06IChwcm9wX3NpemVzKSA9PlxuICAgIGZvciBwcyBpbiBwcm9wX3NpemVzXG4gICAgICBpZiBwcy5OQU1FID09IFwiQXZlcmFnZVwiXG4gICAgICAgIHJldHVybiBwcy5NSU5fRElNXG5cbiAgY2xlYW51cERhdGE6IChwcm9wX3NpemVzKSA9PlxuICAgIGNsZWFuZWRfcHJvcHMgPSBbXVxuICAgIGZvciBwcyBpbiBwcm9wX3NpemVzXG4gICAgICBpZiBwcy5OQU1FICE9IFwiUGVyY2VudCBvZiBUb3RhbCBBcmVhXCJcbiAgICAgICAgcHMuTUlOX0RJTSA9IHBhcnNlRmxvYXQocHMuTUlOX0RJTSkudG9GaXhlZCgxKVxuICAgICAgICBwcy5TSVpFX1NRS00gPSBwYXJzZUZsb2F0KHBzLlNJWkVfU1FLTSkudG9GaXhlZCgxKVxuICAgICAgICBpZiBwcy5TSVpFX1NRS00gPCAwLjFcbiAgICAgICAgICBwcy5TSVpFX1NRS00gPSBcIjwgMC4xXCJcbiAgICAgICAgcHMuQ09BU1QgPSBOdW1iZXIocHMuQ09BU1QpLnRvRml4ZWQoMSlcbiAgICAgICAgaWYgcHMuQ09BU1QgPT0gMCBcbiAgICAgICAgICBwcy5DT0FTVCA9IFwiLS1cIlxuICAgICAgICAgIFxuICAgICAgICBjbGVhbmVkX3Byb3BzLnB1c2gocHMpXG5cbiAgICByZXR1cm4gY2xlYW5lZF9wcm9wc1xuXG4gIGdldE1pbkRpbUNvdW50OiAocHJvcF9zaXplcykgPT5cbiAgICBudW1fbWVldF9jcml0ZXJpYSA9IDBcbiAgICB0b3RhbF9taW5fc2l6ZSA9IDBcblxuICAgIGZvciBwcyBpbiBwcm9wX3NpemVzXG4gICAgICBpZiBwcy5OQU1FICE9IFwiQXZlcmFnZVwiICYmIHBzLk1JTl9ESU0gPiA1IFxuICAgICAgICBudW1fbWVldF9jcml0ZXJpYSs9MVxuXG4gICAgcmV0dXJuIG51bV9tZWV0X2NyaXRlcmlhXG5cbiAgYWRkQ29tbWFzOiAobnVtX3N0cikgPT5cbiAgICBudW1fc3RyICs9ICcnXG4gICAgeCA9IG51bV9zdHIuc3BsaXQoJy4nKVxuICAgIHgxID0geFswXVxuICAgIHgyID0gaWYgeC5sZW5ndGggPiAxIHRoZW4gJy4nICsgeFsxXSBlbHNlICcnXG4gICAgcmd4ID0gLyhcXGQrKShcXGR7M30pL1xuICAgIHdoaWxlIHJneC50ZXN0KHgxKVxuICAgICAgeDEgPSB4MS5yZXBsYWNlKHJneCwgJyQxJyArICcsJyArICckMicpXG4gICAgcmV0dXJuIHgxICsgeDJcblxubW9kdWxlLmV4cG9ydHMgPSBPdmVydmlld1RhYiIsIk92ZXJ2aWV3VGFiID0gcmVxdWlyZSAnLi9vdmVydmlldy5jb2ZmZWUnXG5Vc2VzVGFiID0gcmVxdWlyZSAnLi91c2VzLmNvZmZlZSdcbkVudmlyb25tZW50VGFiID0gcmVxdWlyZSAnLi9lbnZpcm9ubWVudC5jb2ZmZWUnXG5GaXNoaW5nVGFiID0gcmVxdWlyZSAnLi9maXNoaW5nLmNvZmZlZSdcblxud2luZG93LmFwcC5yZWdpc3RlclJlcG9ydCAocmVwb3J0KSAtPlxuICByZXBvcnQudGFicyBbT3ZlcnZpZXdUYWIsIEVudmlyb25tZW50VGFiLCBGaXNoaW5nVGFiLFVzZXNUYWJdXG4gICMgcGF0aCBtdXN0IGJlIHJlbGF0aXZlIHRvIGRpc3QvXG4gIHJlcG9ydC5zdHlsZXNoZWV0cyBbJy4vcmVwb3J0LmNzcyddXG4iLCJSZXBvcnRUYWIgPSByZXF1aXJlICdyZXBvcnRUYWInXG50ZW1wbGF0ZXMgPSByZXF1aXJlICcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5fcGFydGlhbHMgPSByZXF1aXJlICcuLi9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxucGFydGlhbHMgPSBbXVxuZm9yIGtleSwgdmFsIG9mIF9wYXJ0aWFsc1xuICBwYXJ0aWFsc1trZXkucmVwbGFjZSgnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpLycsICcnKV0gPSB2YWxcblxuaWRzID0gcmVxdWlyZSAnLi9pZHMuY29mZmVlJ1xuZm9yIGtleSwgdmFsdWUgb2YgaWRzXG4gIHdpbmRvd1trZXldID0gdmFsdWVcblxuXG5jbGFzcyBVc2VzVGFiIGV4dGVuZHMgUmVwb3J0VGFiXG4gICMgdGhpcyBpcyB0aGUgbmFtZSB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBUYWJcbiAgbmFtZTogJ090aGVyJ1xuICBjbGFzc05hbWU6ICd1c2VzJ1xuICB0aW1lb3V0OiAxMjAwMDBcbiAgdGVtcGxhdGU6IHRlbXBsYXRlcy51c2VzXG4gIGRlcGVuZGVuY2llczogW1xuICAgICdPdmVybGFwV2l0aFJlY3JlYXRpb25hbFVzZXMnXG4gICAgJ1NwZWNpZXNJbmZvcm1hdGlvbidcbiAgXVxuXG5cbiAgcmVuZGVyOiAoKSAtPlxuXG4gICAgI3Nob3cgdGFibGVzIGluc3RlYWQgb2YgZ3JhcGggZm9yIElFXG4gICAgaWYgd2luZG93LmQzXG4gICAgICBkM0lzUHJlc2VudCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBkM0lzUHJlc2VudCA9IGZhbHNlXG5cbiAgICAjc3BlY2llcyBpbmZvXG4gICAgc2VhYmlyZHMgPSBAcmVjb3JkU2V0KCdTcGVjaWVzSW5mb3JtYXRpb24nLCAnU2VhYmlyZHMnKS50b0FycmF5KClcbiAgICBoYXNTZWFiaXJkcyA9IHNlYWJpcmRzPy5sZW5ndGg+IDBcbiAgICBtYW1tYWxzID0gQHJlY29yZFNldCgnU3BlY2llc0luZm9ybWF0aW9uJywgJ01hbW1hbHMnKS50b0FycmF5KClcbiAgICBoYXNNYW1tYWxzID0gbWFtbWFscz8ubGVuZ3RoID4gMFxuICAgIHRyeVxuICAgICAgc2VhbHMgPSBAcmVjb3JkU2V0KCdTcGVjaWVzSW5mb3JtYXRpb24nLCAnU2VhbHMnKS50b0FycmF5KClcbiAgICBjYXRjaCBFcnJvclxuXG5cbiAgICBoYXNTZWFscyA9IHNlYWxzPy5sZW5ndGggPiAwXG4gICAgcmVlZl9maXNoID0gQHJlY29yZFNldCgnU3BlY2llc0luZm9ybWF0aW9uJywgJ1JlZWZGaXNoJykudG9BcnJheSgpXG4gICAgaW5IaWdoRGl2ZXJzaXR5UmVlZkZpc2hBcmVhID0gcmVlZl9maXNoPy5sZW5ndGggPiAwXG5cbiAgICBzbWFybyA9IFwiU01BUk9cIlxuICAgIHJlY191c2VzID0gQHJlY29yZFNldCgnT3ZlcmxhcFdpdGhSZWNyZWF0aW9uYWxVc2VzJywgJ1JlY3JlYXRpb25hbFVzZScpLnRvQXJyYXkoKVxuICAgIGhhc1NtYXJvID0gZmFsc2VcbiAgICBmb3IgcmVjIGluIHJlY191c2VzXG4gICAgICBjb25zb2xlLmxvZyhyZWMuRkVBVF9UWVBFKVxuICAgICAgaWYgcmVjLkZFQVRfVFlQRSA9PSBzbWFyb1xuICAgICAgICBoYXNTbWFybyA9IHRydWVcbiAgICAgICAgYnJlYWtcblxuXG4gICAgbm9uX3NtYXJvX3JlY191c2VzID0gcmVjX3VzZXMuZmlsdGVyIChyZWMpIC0+IHJlYy5GRUFUX1RZUEUgIT0gc21hcm9cbiAgICBoYXNSZWNVc2VzID0gbm9uX3NtYXJvX3JlY191c2VzPy5sZW5ndGggPiAwXG4gICAgXG4gICAgaGVyaXRhZ2UgPSBAcmVjb3JkU2V0KCdPdmVybGFwV2l0aFJlY3JlYXRpb25hbFVzZXMnLCAnSGVyaXRhZ2UnKS50b0FycmF5KClcbiAgICBoYXNIZXJpdGFnZSA9IGhlcml0YWdlPy5sZW5ndGggPiAwXG4gICAgY29hc3RhbF9jb25zZW50cyA9IEByZWNvcmRTZXQoJ092ZXJsYXBXaXRoUmVjcmVhdGlvbmFsVXNlcycsICdDb2FzdGFsQ29uc2VudHMnKS50b0FycmF5KClcbiAgICBoYXNDb2FzdGFsID0gY29hc3RhbF9jb25zZW50cz8ubGVuZ3RoID4gMFxuICAgIGluZnJhc3RydWN0dXJlID0gIEByZWNvcmRTZXQoJ092ZXJsYXBXaXRoUmVjcmVhdGlvbmFsVXNlcycsICdJbmZyYXN0cnVjdHVyZScpLnRvQXJyYXkoKVxuICAgIGhhc0luZnJhc3RydWN0dXJlID0gaW5mcmFzdHJ1Y3R1cmU/Lmxlbmd0aCA+IDBcbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgIFxuICAgIGhhc1VzZXMgPSBoYXNSZWNVc2VzIG9yIGhhc0hlcml0YWdlIG9yIGhhc0luZnJhc3RydWN0dXJlIG9yIGhhc0NvYXN0YWxcbiAgICBoYXNTcGVjaWVzID0gaGFzTWFtbWFscyBvciBoYXNTZWFiaXJkcyBvciBoYXNTZWFsc1xuICAgIGlzQ29sbGVjdGlvbiA9IEBtb2RlbC5pc0NvbGxlY3Rpb24oKVxuICAgIGNvbnRleHQgPVxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcbiAgICAgIHJlY191c2VzOiBub25fc21hcm9fcmVjX3VzZXNcbiAgICAgIGhhc1NtYXJvOiBoYXNTbWFyb1xuICAgICAgaGFzUmVjVXNlczogaGFzUmVjVXNlc1xuICAgICAgaGVyaXRhZ2U6IGhlcml0YWdlXG4gICAgICBoYXNIZXJpdGFnZTogaGFzSGVyaXRhZ2VcbiAgICAgIGNvYXN0YWxfY29uc2VudHM6IGNvYXN0YWxfY29uc2VudHNcbiAgICAgIGhhc0NvYXN0YWw6IGhhc0NvYXN0YWxcbiAgICAgIGluZnJhc3RydWN0dXJlOiBpbmZyYXN0cnVjdHVyZVxuICAgICAgaGFzSW5mcmFzdHJ1Y3R1cmU6IGhhc0luZnJhc3RydWN0dXJlXG4gICAgICBoYXNVc2VzOiBoYXNVc2VzXG4gICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuXG4gICAgICAjc3BlY2llcyBpbmZvXG4gICAgICBzZWFiaXJkczogc2VhYmlyZHNcbiAgICAgIGhhc1NlYWJpcmRzOiBoYXNTZWFiaXJkc1xuICAgICAgbWFtbWFsczogbWFtbWFsc1xuICAgICAgaGFzTWFtbWFsczogaGFzTWFtbWFsc1xuICAgICAgcmVlZl9maXNoOiByZWVmX2Zpc2hcbiAgICAgIHNlYWxzOiBzZWFsc1xuICAgICAgaGFzU2VhbHM6IGhhc1NlYWxzXG5cbiAgICAgIGluSGlnaERpdmVyc2l0eVJlZWZGaXNoQXJlYTogaW5IaWdoRGl2ZXJzaXR5UmVlZkZpc2hBcmVhXG4gICAgICBoYXNTcGVjaWVzOiBoYXNTcGVjaWVzXG5cbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcbiAgICBAZW5hYmxlTGF5ZXJUb2dnbGVycygpXG5cbiAgICBcblxubW9kdWxlLmV4cG9ydHMgPSBVc2VzVGFiIiwidGhpc1tcIlRlbXBsYXRlc1wiXSA9IHRoaXNbXCJUZW1wbGF0ZXNcIl0gfHwge307XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wiZGVtb1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5SZXBvcnQgU2VjdGlvbnM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHA+VXNlIHJlcG9ydCBzZWN0aW9ucyB0byBncm91cCBpbmZvcm1hdGlvbiBpbnRvIG1lYW5pbmdmdWwgY2F0ZWdvcmllczwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkQzIFZpc3VhbGl6YXRpb25zPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDx1bCBjbGFzcz1cXFwibmF2IG5hdi1waWxsc1xcXCIgaWQ9XFxcInRhYnMyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGxpIGNsYXNzPVxcXCJhY3RpdmVcXFwiPjxhIGhyZWY9XFxcIiNjaGFydFxcXCI+Q2hhcnQ8L2E+PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGxpPjxhIGhyZWY9XFxcIiNkYXRhVGFibGVcXFwiPlRhYmxlPC9hPjwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3VsPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGRpdiBjbGFzcz1cXFwidGFiLWNvbnRlbnRcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJ0YWItcGFuZSBhY3RpdmVcXFwiIGlkPVxcXCJjaGFydFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPCEtLVtpZiBJRSA4XT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwidW5zdXBwb3J0ZWRcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIFRoaXMgdmlzdWFsaXphdGlvbiBpcyBub3QgY29tcGF0aWJsZSB3aXRoIEludGVybmV0IEV4cGxvcmVyIDguIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIFBsZWFzZSB1cGdyYWRlIHlvdXIgYnJvd3Nlciwgb3IgdmlldyByZXN1bHRzIGluIHRoZSB0YWJsZSB0YWIuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPiAgICAgIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwhW2VuZGlmXS0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgU2VlIDxjb2RlPnNyYy9zY3JpcHRzL2RlbW8uY29mZmVlPC9jb2RlPiBmb3IgYW4gZXhhbXBsZSBvZiBob3cgdG8gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICB1c2UgZDMuanMgdG8gcmVuZGVyIHZpc3VhbGl6YXRpb25zLiBQcm92aWRlIGEgdGFibGUtYmFzZWQgdmlld1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgYW5kIHVzZSBjb25kaXRpb25hbCBjb21tZW50cyB0byBwcm92aWRlIGEgZmFsbGJhY2sgZm9yIElFOCB1c2Vycy5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxicj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxhIGhyZWY9XFxcImh0dHA6Ly90d2l0dGVyLmdpdGh1Yi5pby9ib290c3RyYXAvMi4zLjIvXFxcIj5Cb290c3RyYXAgMi54PC9hPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgaXMgbG9hZGVkIHdpdGhpbiBTZWFTa2V0Y2ggc28geW91IGNhbiB1c2UgaXQgdG8gY3JlYXRlIHRhYnMgYW5kIG90aGVyIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgaW50ZXJmYWNlIGNvbXBvbmVudHMuIGpRdWVyeSBhbmQgdW5kZXJzY29yZSBhcmUgYWxzbyBhdmFpbGFibGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwidGFiLXBhbmVcXFwiIGlkPVxcXCJkYXRhVGFibGVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD5pbmRleDwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPnZhbHVlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImNoYXJ0RGF0YVwiLGMscCwxKSxjLHAsMCwxMzUxLDE0MTgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8dHI+PHRkPlwiKTtfLmIoXy52KF8uZihcImluZGV4XCIsYyxwLDApKSk7Xy5iKFwiPC90ZD48dGQ+XCIpO18uYihfLnYoXy5mKFwidmFsdWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPjwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gZW1waGFzaXNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkVtcGhhc2lzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwPkdpdmUgcmVwb3J0IHNlY3Rpb25zIGFuIDxjb2RlPmVtcGhhc2lzPC9jb2RlPiBjbGFzcyB0byBoaWdobGlnaHQgaW1wb3J0YW50IGluZm9ybWF0aW9uLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gd2FybmluZ1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+V2FybmluZzwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cD5PciA8Y29kZT53YXJuPC9jb2RlPiBvZiBwb3RlbnRpYWwgcHJvYmxlbXMuPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBkYW5nZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkRhbmdlcjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cD48Y29kZT5kYW5nZXI8L2NvZGU+IGNhbiBhbHNvIGJlIHVzZWQuLi4gc3BhcmluZ2x5LjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wiZW52aXJvbm1lbnRcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7aWYoXy5zKF8uZChcInNrZXRjaENsYXNzLmRlbGV0ZWRcIixjLHAsMSksYyxwLDAsMjQsMjcwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJhbGVydCBhbGVydC13YXJuXFxcIiBzdHlsZT1cXFwibWFyZ2luLWJvdHRvbToxMHB4O1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBUaGlzIHNrZXRjaCB3YXMgY3JlYXRlZCB1c2luZyB0aGUgXFxcIlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCJcXFwiIHRlbXBsYXRlLCB3aGljaCBpc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgbm8gbG9uZ2VyIGF2YWlsYWJsZS4gWW91IHdpbGwgbm90IGJlIGFibGUgdG8gY29weSB0aGlzIHNrZXRjaCBvciBtYWtlIG5ld1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgc2tldGNoZXMgb2YgdGhpcyB0eXBlLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImFueUF0dHJpYnV0ZXNcIixjLHAsMSksYyxwLDAsMzEzLDQyNixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+XCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKF8ucnAoXCJhdHRyaWJ1dGVzL2F0dHJpYnV0ZXNUYWJsZVwiLGMscCxcIiAgXCIpKTtfLmIoXCIgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5IYWJpdGF0cyBSZXByZXNlbnRlZCBpbiBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw1MzUsNTQ1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJDb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiU2tldGNoXCIpO307Xy5iKFwiIDwhLS08YSBocmVmPVxcXCIjXFxcIiBkYXRhLXRvZ2dsZS1ub2RlPVxcXCI1M2EwYTMxY2QzZjYwNjRkMmMxNzU4MGNcXFwiIGRhdGEtdmlzaWJsZT1cXFwiZmFsc2VcXFwiPnNob3cgbGF5ZXI8L2E+LS0+PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjIwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5IYWJpdGF0PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhYml0YXRzX3JlcHJlc2VudGVkXCIsYyxwLDEpLGMscCwwLDkwMyw5NzksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkhBQl9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+SGFiaXRhdHMgUHJlc2VudCBpbiBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxMTMxLDExNDEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJTa2V0Y2hcIik7fTtfLmIoXCIgPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTNhMGEzMWNkM2Y2MDY0ZDJjMTc1ODBjXFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5zaG93IGxheWVyPC9hPjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwwLDEzMTYsMTc4MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIyMFxcXCIgY2xhc3M9XFxcImhhYl90YWJsZVxcXCI+IFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoIGNsYXNzPVxcXCJzb3J0aW5nX2NvbFxcXCIgc3R5bGU9XFxcIndpZHRoOjI1MHB4O1xcXCI+PGEgY2xhc3M9XFxcImhhYl90eXBlIHNvcnRfdXBcXFwiIGhyZWY9XFxcIiNcXFwiPkhhYml0YXQgQ2xhc3NpZmljYXRpb24gVHlwZTwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD48YSAgY2xhc3M9XFxcImhhYl9uZXdfYXJlYSBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiID5BcmVhIChoYSk8L2E+PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcImhhYl9uZXdfcGVyYyBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiPkFyZWEgKCUpPC9hPjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5IGNsYXNzPVxcXCJoYWJfdmFsdWVzXFxcIj48L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjI1MHB4O1xcXCI+SGFiaXRhdHM8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD5BcmVhIChoYSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD5BcmVhICglKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYWJpdGF0c1wiLGMscCwxKSxjLHAsMCwyMDY1LDIyMDksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkhBQl9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiU0laRV9IQVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlNJWkVfUEVSQ1wiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgIDwhLS0tICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2JyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHN0cm9uZz5IYWJpdGF0IEV2ZW5uZXNzPC9zdHJvbmc+PC9icj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgVGhlIG1lYXN1cmUgb2YgJ2V2ZW5uZXNzJyBmb3IgdGhlIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwiaGFic19pbl9za2V0Y2hcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gaGFiaXRhdFwiKTtpZihfLnMoXy5mKFwiaGFic19wbHVyYWxcIixjLHAsMSksYyxwLDAsMjQ4OCwyNDg5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJzXCIpO30pO2MucG9wKCk7fV8uYihcIiBwcmVzZW50IGluIHRoZSBTa2V0Y2ggaXMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJldmVubmVzc1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPi5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8ZW0+RXZlbm5lc3MgaXMgYSBtZWFzdXJlIG9mIHRoZSByZWxhdGl2ZSBhYnVuZGFuY2Ugb2YgaGFiaXRhdHMgd2l0aGluIGFuIGFyZWEsIHdoZXJlIGEgaGlnaCBudW1iZXIgYXBwcm9hY2hpbmcgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDEgbWVhbnMgYWxsIHRoZSBoYWJpdGF0cyBhcmUgcmVsYXRpdmVseSBzaW1pbGFyIGluIHNpemUsIGFuZCBhIGxvdyBudW1iZXIgaW5kaWNhdGluZyB0aGF0IHRoZSBoYWJpdGF0cyBhcmUgdmFyaWVkIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBpbiB0aGVpciBzaXplLiBBIGhpZ2hlciBoYWJpdGF0IGV2ZW5uZXNzIHNjb3JlIGdlbmVyYWxseSBpbmRpY2F0ZXMgYSBoaWdoZXIgc3BlY2llcyBkaXZlcnNpdHkuIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBFdmVubmVzcyBoYXMgYmVlbiBjYWxjdWxhdGVkIHVzaW5nIHRoZSBTaW1wc29uJ3MgRSBpbmRleC48L2VtPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgLS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+QWRqYWNlbnQgVGVycmVzdHJpYWwgSW5mb3JtYXRpb248L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwPjxlbT5NUEEgR3VpZGVsaW5lczogXFxcIkNvbnNpZGVyIGFkamFjZW50IHRlcnJlc3RyaWFsIGVudmlyb25tZW50XFxcIiAoYXJlYXMgc2hvd24gYmVsb3cgYXJlIHdpdGhpbiAxMDBtIG9mIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDMyNjgsMzI5NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiYSBza2V0Y2ggaW4gdGhlIGNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgdGhlIHNrZXRjaCBcIik7fTtfLmIoXCIpPC9lbT48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj48c3Ryb25nPlB1YmxpYyBDb25zZXJ2YXRpb24gTGFuZDwvc3Ryb25nPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzUHVibGljTGFuZFwiLGMscCwxKSxjLHAsMCwzNTEyLDM2NDgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJwdWJsaWNfbGFuZFwiLGMscCwxKSxjLHAsMCwzNTQxLDM2MjEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJOQU1FXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJoYXNQdWJsaWNMYW5kXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPjxlbT5Ob25lIFByZXNlbnQ8L2VtPjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj48c3Ryb25nPkNvYXN0YWwgUHJvdGVjdGlvbiBhbmQgUmVjcmVhdGlvbiBBcmVhcyAoQ1BBICYgQ1JBKTwvc3Ryb25nPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzQ29hc3RhbExhbmRcIixjLHAsMSksYyxwLDAsNDAwOSw0MTQ3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZihfLnMoXy5mKFwiY29hc3RhbF9sYW5kXCIsYyxwLDEpLGMscCwwLDQwMzksNDExOSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc0NvYXN0YWxMYW5kXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPjxlbT5Ob25lIFByZXNlbnQ8L2VtPjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wiZmlzaGluZ1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtpZihfLnMoXy5kKFwic2tldGNoQ2xhc3MuZGVsZXRlZFwiLGMscCwxKSxjLHAsMCwyNCwyNzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LXdhcm5cXFwiIHN0eWxlPVxcXCJtYXJnaW4tYm90dG9tOjEwcHg7XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFRoaXMgc2tldGNoIHdhcyBjcmVhdGVkIHVzaW5nIHRoZSBcXFwiXCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIlxcXCIgdGVtcGxhdGUsIHdoaWNoIGlzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBubyBsb25nZXIgYXZhaWxhYmxlLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byBjb3B5IHRoaXMgc2tldGNoIG9yIG1ha2UgbmV3XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBza2V0Y2hlcyBvZiB0aGlzIHR5cGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiYW55QXR0cmlidXRlc1wiLGMscCwxKSxjLHAsMCwzMTMsNDI2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5cIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXy5ycChcImF0dHJpYnV0ZXMvYXR0cmlidXRlc1RhYmxlXCIsYyxwLFwiICBcIikpO18uYihcIiAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJoYXNBbnlGaXNoaW5nXCIsYyxwLDEpLGMscCwwLDQ2MywyNDUwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZihfLnMoXy5mKFwiaGFzRXhpc3RpbmdGaXNoaW5nXCIsYyxwLDEpLGMscCwwLDQ4OSwxMzg2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDQ+RXhpc3RpbmcgRmlzaGVyaWVzIE1hbmFnZW1lbnQ8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHA+PGVtPlRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw2MTQsNjI0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJDb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiU2tldGNoXCIpO307Xy5iKFwiIGluY2x1ZGVzIHRoZSBmb2xsb3dpbmcgZXhpc3RpbmcgZmlzaGVyaWVzIHJlc3RyaWN0aW9ucy4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBBbHNvIHNob3duIGlzIHRoZSBleHRlbnQgdGhhdCB0aGUgZmlzaGVyaWVzIHJlc3RyaWN0aW9ucyBhcHBseSB0byB0aGUgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsODM0LDg0MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwic2tldGNoZXNcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgYXMgYSBwZXJjZW50YWdlIG9mIHRvdGFsIHNrZXRjaCBhcmVhLjwvZW0+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjI1MHB4O1xcXCI+TmFtZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+UGVyY2VudDwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJleGlzdGluZ19maXNoaW5nX2FyZWFzXCIsYyxwLDEpLGMscCwwLDExODksMTMxMSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkZFQVRfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiUEVSQ19BUkVBXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaGFzQ3VzdG9tYXJ5XCIsYyxwLDEpLGMscCwwLDE0MjksMjQzMSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PkN1c3RvbWFyeSBBcmVhczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc0V4aXN0aW5nQ3VzdG9tYXJ5XCIsYyxwLDEpLGMscCwwLDE1MzMsMTkzNixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPHA+IFRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxNTY1LDE1NzUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgaW5jbHVkZXMgdGhlIGZvbGxvd2luZyA8c3Ryb25nPmV4aXN0aW5nPC9zdHJvbmc+IEN1c3RvbWFyeSBBcmVhczo8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImV4aXN0aW5nX2N1c3RvbWFyeV9maXNoaW5nXCIsYyxwLDEpLGMscCwwLDE3OTEsMTg2OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImhhc1Byb3Bvc2VkQ3VzdG9tYXJ5XCIsYyxwLDEpLGMscCwwLDE5OTEsMjM5NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPHA+IFRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwyMDIzLDIwMzMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgaW5jbHVkZXMgdGhlIGZvbGxvd2luZyA8c3Ryb25nPnByb3Bvc2VkPC9zdHJvbmc+IEN1c3RvbWFyeSBBcmVhczo8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInByb3Bvc2VkX2N1c3RvbWFyeV9maXNoaW5nXCIsYyxwLDEpLGMscCwwLDIyNDksMjMyNixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc0FueUZpc2hpbmdcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDQ+RXhpc3Rpbmcgb3IgQ3VzdG9tYXJ5IEFyZWFzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwPk5vIGluZm9ybWF0aW9uIG9uIGV4aXN0aW5nIGZpc2hpbmcgYXJlYXMgb3IgY3VzdG9tYXJ5IHVzZSBpcyBhdmFpbGFibGUgZm9yIHRoaXMgYXJlYS48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO307cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wib3ZlcnZpZXdcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7aWYoXy5zKF8uZChcInNrZXRjaENsYXNzLmRlbGV0ZWRcIixjLHAsMSksYyxwLDAsMjQsMjcwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJhbGVydCBhbGVydC13YXJuXFxcIiBzdHlsZT1cXFwibWFyZ2luLWJvdHRvbToxMHB4O1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBUaGlzIHNrZXRjaCB3YXMgY3JlYXRlZCB1c2luZyB0aGUgXFxcIlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCJcXFwiIHRlbXBsYXRlLCB3aGljaCBpc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgbm8gbG9uZ2VyIGF2YWlsYWJsZS4gWW91IHdpbGwgbm90IGJlIGFibGUgdG8gY29weSB0aGlzIHNrZXRjaCBvciBtYWtlIG5ld1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgc2tldGNoZXMgb2YgdGhpcyB0eXBlLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImFueUF0dHJpYnV0ZXNcIixjLHAsMSksYyxwLDAsMzEzLDQzNixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihfLnJwKFwiYXR0cmlidXRlcy9hdHRyaWJ1dGVzVGFibGVcIixjLHAsXCIgICAgXCIpKTtfLmIoXCIgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDQ3MywyNzc5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gc2l6ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5NUEEgU2l6ZXM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIE9mIHRoZSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInRvdGFsX21wYV9jb3VudFwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBNUEFzIGluIHRoZSBuZXR3b3JrLCA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm1wYV9jb3VudFwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBtZWV0XCIpO2lmKCFfLnMoXy5mKFwicGx1cmFsX21wYV9jb3VudFwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNcIik7fTtfLmIoXCIgdGhlIG1pbmltdW0gc2l6ZSBkaW1lbnNpb24gb2YgNWttLiBUaGUgYXZlcmFnZSBtaW5pbXVtIGRpbWVuc2lvbiBpcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm1wYV9hdmdfc2l6ZV9ndWlkZWxpbmVcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gdGhlIDEwLTIwa20gZ3VpZGVsaW5lLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+TVBBIE5hbWU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD5BcmVhIDwvYnI+KHNxLiBrbS4pPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjEwMHB4O1xcXCI+V2lkdGggKGttKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoxMDBweDtcXFwiPkNvYXN0bGluZSBMZW5ndGggKGttKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJwcm9wX3NpemVzXCIsYyxwLDEpLGMscCwwLDExNzIsMTMzOCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlNJWkVfU1FLTVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk1JTl9ESU1cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJDT0FTVFwiLGMscCwwKSkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICBUaGlzIGNvbWJpbmVkIGFyZWEgd2l0aGluIHRoZSBuZXR3b3JrIGFjY291bnRzIGZvciA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInBlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IE1hcmluZSBhcmVhLCBhbmQgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IGNvYXN0bGluZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PkNvbm5lY3Rpdml0eTwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNpbmdsZVNrZXRjaFwiLGMscCwxKSxjLHAsMCwxNzAxLDE4NjIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8cCBzdHlsZT1cXFwiZm9udC1zdHlsZTppdGFsaWM7Y29sb3I6Z3JheTtcXFwiIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgTm8gY29ubmVjdGl2aXR5IGluZm9ybWF0aW9uIGZvciBhIGNvbGxlY3Rpb24gd2l0aCBvbmUgc2tldGNoLiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJzaW5nbGVTa2V0Y2hcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICA8ZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGRpdiBjbGFzcz1cXFwiY29ubmVjdGl2aXR5X3BpZVxcXCIgaWQ9XFxcImNvbm5lY3Rpdml0eV9waWVcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGRpdiBjbGFzcz1cXFwiY29ubmVjdGl2aXR5X3BpZV9sZWdlbmRcXFwiIGlkPVxcXCJjb25uZWN0aXZpdHlfcGllX2xlZ2VuZFxcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5PZiB0aGUgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJ0b3RhbF9tcGFfY291bnRcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gTVBBcyBpbiB0aGUgbmV0d29yaywgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb25uZWN0ZWRfbXBhX2NvdW50XCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+XCIpO2lmKF8ucyhfLmYoXCJwbHVyYWxfY29ubmVjdGVkX21wYV9jb3VudFwiLGMscCwxKSxjLHAsMCwyMjM0LDIyMzgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiBhcmVcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJwbHVyYWxfY29ubmVjdGVkX21wYV9jb3VudFwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiBpc1wiKTt9O18uYihcIiB3aXRoaW4gdGhlIGNvbm5lY3Rpdml0eSByYW5nZSBvZiA1MCAtIDEwMCBrbS4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxzcGFuIGNsYXNzPVxcXCJjb25uX3ZhbHVlc1xcXCI+VGhlIG1pbmltdW0gZGlzdGFuY2UgYmV0d2VlbiB0aGUgTVBBcyBpcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm1pbl9kaXN0YW5jZVwiLGMscCwwKSkpO18uYihcIiBrbTwvc3Ryb25nPi48L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHNwYW4gY2xhc3M9XFxcImNvbm5fdmFsdWVzXFxcIj5UaGUgbWF4aW11bSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBNUEFzIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibWF4X2Rpc3RhbmNlXCIsYyxwLDApKSk7Xy5iKFwiIGttPC9zdHJvbmc+Ljwvc3Bhbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8c3BhbiBjbGFzcz1cXFwiY29ubl92YWx1ZXNcXFwiPlRoZSBhdmVyYWdlIGRpc3RhbmNlIGJldHdlZW4gdGhlIE1QQXMgaXMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJtZWFuX2Rpc3RhbmNlXCIsYyxwLDApKSk7Xy5iKFwiIGttPC9zdHJvbmc+Ljwvc3Bhbj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwyODE1LDI5ODQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5Db2xsZWN0aW9uPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICBUaGlzIGNvbGxlY3Rpb24gY29udGFpbnMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJudW1Ta2V0Y2hlc1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBza2V0Y2hlcy5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHNpemVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDQ+U2l6ZTwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgVGhpcyBza2V0Y2ggYXJlYSBpcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInNpemVcIixjLHAsMCkpKTtfLmIoXCIgc3F1YXJlIGtpbG9tZXRlcnM8L3N0cm9uZz4sIGFuZCBpdCBpbmNsdWRlcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInBlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IFBsYW5uaW5nIFJlZ2lvbi5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIFRoaXMgc2tldGNoIGluY2x1ZGVzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwiY29hc3RsaW5lX2xlbmd0aFwiLGMscCwwKSkpO18uYihcIiBtZXRlcnM8L3N0cm9uZz4gb2YgY29hc3RsaW5lLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiPCEtLVwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gc2l6ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+UmVwcmVzZW50YXRpb24gb2YgSGFiaXRhdHMgPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTNhMGEzMWNkM2Y2MDY0ZDJjMTc1ODBjXFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5zaG93IGxheWVyPC9hPjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8c3Ryb25nPk51bWJlciBvZiBIYWJpdGF0IENsYXNzZXM8L3N0cm9uZz48L2JyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgc3R5bGU9XFxcIm1hcmdpbi10b3A6MHB4O1xcXCIgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgVGhlcmUgYXJlIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwidG90YWxfaGFic1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBoYWJpdGF0IGNsYXNzZXMgaW4gdGhlIHBsYW5uaW5nIHJlZ2lvbiwgYW5kIHlvdXIgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMzc3NSwzNzg1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic2tldGNoXCIpO307Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgaW5jbHVkZXMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJuZXdfaGFic1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPi4gRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gdGhlIEhhYml0YXQgQ2xhc3NpZmljYXRpb24sIHNlZVwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICB0aGUgPGEgaHJlZj1cXFwiaHR0cDovL3d3dy5kb2MuZ292dC5uei9Eb2N1bWVudHMvY29uc2VydmF0aW9uL21hcmluZS1hbmQtY29hc3RhbC9tYXJpbmUtcHJvdGVjdGVkLWFyZWFzL21wYS1jbGFzc2lmaWNhdGlvbi1wcm90ZWN0aW9uLXN0YW5kYXJkLnBkZlxcXCIgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICBNYXJpbmUgUHJvdGVjdGVkIEFyZWFzIENsYXNzaWZpY2F0aW9uIGFuZCBQcm90ZWN0aW9uIFN0YW5kYXJkPC9hPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIi0tPlwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJ1c2VzXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO2lmKF8ucyhfLmQoXCJza2V0Y2hDbGFzcy5kZWxldGVkXCIsYyxwLDEpLGMscCwwLDI0LDI3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtd2FyblxcXCIgc3R5bGU9XFxcIm1hcmdpbi1ib3R0b206MTBweDtcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgVGhpcyBza2V0Y2ggd2FzIGNyZWF0ZWQgdXNpbmcgdGhlIFxcXCJcIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiB0ZW1wbGF0ZSwgd2hpY2ggaXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIG5vIGxvbmdlciBhdmFpbGFibGUuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIGNvcHkgdGhpcyBza2V0Y2ggb3IgbWFrZSBuZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIHNrZXRjaGVzIG9mIHRoaXMgdHlwZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJhbnlBdHRyaWJ1dGVzXCIsYyxwLDEpLGMscCwwLDMxMyw0MjYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihfLnJwKFwiYXR0cmlidXRlcy9hdHRyaWJ1dGVzVGFibGVcIixjLHAsXCIgIFwiKSk7Xy5iKFwiICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImhhc0NvYXN0YWxcIixjLHAsMSksYyxwLDAsNDYwLDExOTUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5FeGlzdGluZyBDb2FzdGFsIENvbnNlbnRzIDxhIGhyZWY9XFxcIiNcXFwiIGRhdGEtdG9nZ2xlLW5vZGU9XFxcIjUzZDcxOWE0OTM4MDE3NGE3NzY2ZGQ4NVxcXCIgZGF0YS12aXNpYmxlPVxcXCJmYWxzZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgc2hvdyBsYXllcjwvYT48L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHA+XCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNjc0LDcwNCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiQSBza2V0Y2ggd2l0aGluIHRoZSBjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiVGhlIHNrZXRjaFwiKTt9O18uYihcIiBjb250YWlucyBvciBpcyB3aXRoaW4gMjAwbSBvZiBzaXRlcyB3aXRoIFJlc291cmNlIENvbnNlbnRzLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoyNTBweDtcXFwiPkNvbnNlbnQgVHlwZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJjb2FzdGFsX2NvbnNlbnRzXCIsYyxwLDEpLGMscCwwLDEwNDMsMTEyOCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkZFQVRfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzVXNlc1wiLGMscCwxKSxjLHAsMCwxMjI0LDQxNDUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJoYXNSZWNVc2VzXCIsYyxwLDEpLGMscCwwLDEyNDIsMjQ4NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PlJlY3JlYXRpb25hbCBVc2VzIDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc1NtYXJvXCIsYyxwLDEpLGMscCwwLDEzMzksMTgyNyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgIDxwPjxzdHJvbmc+U3BlY3RydW0gb2YgTUFyaW5lIFJlY3JlYXRpb25hbCBPcHBvcnR1bml0eSAoU01BUk8pPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8cD5cIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxNDc4LDE0ODgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJTa2V0Y2hcIik7fTtfLmIoXCIgaW5jbHVkZXMgYXJlYShzKSBpZGVudGlmaWVkIGFzIGhhdmluZyA8c3Ryb25nPiBtZWRpdW0gb3IgaGlnaCA8L3N0cm9uZz4gcmVjcmVhdGlvbmFsIG9wcG9ydHVuaXR5LlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8ZW0+WW91IGNhbiBmaW5kIG1vcmUgaW5mb3JtYXRpb24gb24gU01BUk8gaW4gdGhlIFxcXCJkYXRhIGRlc2NyaXB0aW9uXFxcIiBieSByaWdodCBjbGlja2luZyBvbiB0aGUgbGF5ZXIgbmFtZS48L2VtPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9icj48L2JyPlwiKTtfLmIoXCJcXG5cIik7fTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoyNTBweDtcXFwiPkFjdGl2aXR5IFR5cGU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPk51bWJlciBvZiBTaXRlczwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNSZWNVc2VzXCIsYyxwLDEpLGMscCwwLDIwODgsMjI3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcInJlY191c2VzXCIsYyxwLDEpLGMscCwwLDIxMTYsMjI0NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJGRUFUX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiQ09VTlRcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzUmVjVXNlc1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQgY29sc3Bhbj0yPjxlbT5Ob25lIFByZXNlbnQ8L2VtPjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCIgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc0hlcml0YWdlXCIsYyxwLDEpLGMscCwwLDI1MjAsMzM0NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxoND5IZXJpdGFnZTwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHA+XCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMjY1MCwyNjgwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJBIHNrZXRjaCB3aXRoaW4gdGhlIGNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJUaGUgc2tldGNoXCIpO307Xy5iKFwiIGNvbnRhaW5zIG9yIGlzIHdpdGhpbiAyMDBtIG9mIHNpdGVzIGlkZW50aWZpZWQgYXMgaGF2aW5nIHNpZ25pZmljYW50IGhlcml0YWdlIHZhbHVlcy48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjI1MHB4O1xcXCI+SGVyaXRhZ2UgVHlwZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRoPk51bWJlciBvZiBTaXRlczwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoZXJpdGFnZVwiLGMscCwxKSxjLHAsMCwzMTEzLDMyNTEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkZFQVRfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkNPVU5UXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaGFzSW5mcmFzdHJ1Y3R1cmVcIixjLHAsMSksYyxwLDAsMzM4Nyw0MTIyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGg0PkluZnJhc3RydWN0dXJlPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8cD5cIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzNTIzLDM1NTMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkEgc2tldGNoIHdpdGhpbiB0aGUgY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlRoZSBza2V0Y2hcIik7fTtfLmIoXCIgY29udGFpbnMgb3IgaXMgd2l0aGluIDIwMG0gb2Ygc2l0ZXMgd2l0aCBleGlzdGluZyBpbmZyYXN0cnVjdHVyZS48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjI1MHB4O1xcXCI+VHlwZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpbmZyYXN0cnVjdHVyZVwiLGMscCwxKSxjLHAsMCwzOTIwLDQwMjEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkZFQVRfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO307fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJoYXNVc2VzXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PkFjdGl2aXRpZXMgYW5kIFVzZXM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHA+VGhlIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDQyODEsNDI5MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaFwiKTt9O18uYihcIiAgZG9lcyA8c3Ryb25nPm5vdDwvc3Ryb25nPiBpbmNsdWRlIGFueSA8c3Ryb25nPmFjdGl2aXRpZXMgb3IgdXNlczwvc3Ryb25nPi48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzU3BlY2llc1wiLGMscCwxKSxjLHAsMCw0NDY3LDU4MzgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PlNwZWNpZXMgSW5mb3JtYXRpb248L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNTZWFiaXJkc1wiLGMscCwxKSxjLHAsMCw0NTY0LDQ4NDcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj48c3Ryb25nPkltcG9ydGFudCBTZWFiaXJkIEFyZWFzPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2VhYmlyZHNcIixjLHAsMSksYyxwLDAsNDcxMSw0NzkxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTmFtZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJoYXNNYW1tYWxzXCIsYyxwLDEpLGMscCwwLDQ4ODUsNTMzNixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPjxzdHJvbmc+TWFyaW5lIE1hbW1hbHM8L3N0cm9uZz48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5TcGVjaWVzPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5OdW1iZXIgb2YgU2lnaHRpbmdzPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcIm1hbW1hbHNcIixjLHAsMSksYyxwLDAsNTE2OCw1MjgxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTmFtZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiQ291bnRcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaGFzU2VhbHNcIixjLHAsMSksYyxwLDAsNTM3MSw1ODE3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+PHN0cm9uZz5TZWFsIENvbG9uaWVzPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+U3BlY2llczwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+TnVtYmVyIG9mIFNpZ2h0aW5nczwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzZWFsc1wiLGMscCwxKSxjLHAsMCw1NjUxLDU3NjQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJOYW1lXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJDb3VudFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJoYXNTcGVjaWVzXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PlNwZWNpZXMgSW5mb3JtYXRpb248L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHA+VGhlIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDU5ODAsNjAxNCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwic2tldGNoZXMgd2l0aGluIHRoZSBjb2xsZWN0aW9uIGRvIFwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNrZXRjaCBkb2VzXCIpO307Xy5iKFwiIDxzdHJvbmc+bm90PC9zdHJvbmc+IGluY2x1ZGUgYW55IDxzdHJvbmc+aW1wb3J0YW50IHNwZWNpZXMgYXJlYXM8L3N0cm9uZz4uPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9O3JldHVybiBfLmZsKCk7O30pO1xuXG5pZih0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gdGhpc1tcIlRlbXBsYXRlc1wiXTtcbn0iXX0=
