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
        if (hab.HAB_TYPE.startsWith("Estuarine") || hab.HAB_TYPE === "Mud Flat") {
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
    num_represented_habs = this.getNumHabs("REPYES", represented_habs);
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

  OverviewTab.prototype.getNumHabs = function(attr_name, habitats) {
    var count, hab, _i, _len;
    if ((habitats != null ? habitats.length : void 0) === 0) {
      return 0;
    }
    count = 0;
    for (_i = 0, _len = habitats.length; _i < _len; _i++) {
      hab = habitats[_i];
      if (hab[attr_name] === "Yes") {
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
    if (hab.HAB_TYPE.startsWith("Estuarine")) {
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
this["Templates"]["environment"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Habitats Present in ");if(_.s(_.f("isCollection",c,p,1),c,p,0,382,392,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" <a href=\"#\" data-toggle-node=\"5536dbb48c5b43eb0facbc5a\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);_.b("    <p>");_.b("\n" + i);_.b("      <i>");_.b("\n" + i);_.b("        Area (%) refers to the percentage of the habitat contained within the ");if(_.s(_.f("isGeneric",c,p,1),c,p,0,657,667,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isGeneric",c,p,1),c,p,1,0,0,"")){_.b("network");};_.b("\n" + i);_.b("        ");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" as a proportion of the total area of habitat within the South-East Marine region. ");if(!_.s(_.f("isConfid",c,p,1),c,p,1,0,0,"")){_.b("‘Patch size’ for subtidal habitats refers to the width of the largest patch included in a Type-1 MPA. For intertidal habitats this refers to the maximum length. Whether a habitat is considered ‘Representative’ under the Policy will need to be assessed on a case by case basis, taking into account such things as individual patch size and proportion of habitat. ’Replicate Count’ refers to there being 2 examples of the habitat type included in at least two Type-2 MPA.");};_.b("\n" + i);_.b("        ");if(_.s(_.f("isConfid",c,p,1),c,p,0,1364,1836,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Area (%) refers to the percentage of the habitat contained within the network as a proportion of the total area of habitat within the South-East Marine region. A habitat-type listed as ”Included” does not necessarily mean that it meets the requirement of being viable and therefore representative of that habitat type in the network. This will need to be assessed on a case by case basis, taking into account such things as individual patch size and proportion of habitat.");});c.pop();}_.b("\n" + i);_.b("      </i>");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <p class=\"in-report-header\">Coastal Habitat Types</p>");_.b("\n" + i);if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,1951,2882,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <table data-paging=\"20\" class=\"coastal_hab_table\"> ");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th class=\"sorting_col\" style=\"width:150px;\"><a class=\"coastal_hab_type sort_up\" href=\"#\">Habitat</a></th>");_.b("\n" + i);_.b("              <th><a  class=\"coastal_hab_new_area sort_down\" href=\"#\" >Area (km<sup>2</sup>)</a></th>");_.b("\n" + i);_.b("              <th><a class=\"coastal_hab_new_perc sort_down\" href=\"#\">Area (%)</a></th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,2381,2760,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <th><a class=\"coastal_hab_represent sort_down\" href=\"#\" >");_.b(_.v(_.f("REP_NAME",c,p,0)));_.b("</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,2504,2728,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  <th><a class=\"coastal_hab_replicate sort_down\" href=\"#\">Replicate Count</th>");_.b("\n" + i);_.b("                  <th><a class=\"coastal_hab_connected sort_down\" href=\"#\">Connectivity (in km)<sup>*</sup></th>");_.b("\n");});c.pop();}});c.pop();}_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("         <tbody class=\"coastal_hab_values\"></tbody>");_.b("\n" + i);_.b("       </table>");_.b("\n");});c.pop();}if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:180px;\">Habitat</th>");_.b("\n" + i);_.b("              <th>Area (km<sup>2</sup>)</th>");_.b("\n" + i);_.b("              <th>Area (%)</th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,3143,3370,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <th>Patch Size (Type-1)</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,3224,3338,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                    <th>Replicate Count</th>");_.b("\n" + i);_.b("                    <th>Connectivity (in km)</th>");_.b("\n");});c.pop();}});c.pop();}_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasCoastalHabTypes",c,p,1),c,p,0,3471,3892,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("coastal_hab_types",c,p,1),c,p,0,3508,3857,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("PERC",c,p,0)));_.b("</td>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,3665,3812,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  <td>");_.b(_.v(_.f("REPRESENT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                  ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3742,3778,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<td>");_.b(_.v(_.f("REPLIC",c,p,0)));_.b("</td><td>");_.b(_.v(_.f("CONN",c,p,0)));_.b("</td>");});c.pop();}_.b("\n");});c.pop();}_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasCoastalHabTypes",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td colspan=\"");if(_.s(_.f("isCollection",c,p,1),c,p,0,4017,4018,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("5");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("4");};_.b("\">");_.b("\n" + i);_.b("                  <i>There are no coastal habitat types.</i>");_.b("\n" + i);_.b("                </td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n");};_.b("\n" + i);_.b("    <p class=\"in-report-header\">Estuarine Habitat Types</p>");_.b("\n" + i);if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,4352,5308,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <table data-paging=\"20\" class=\"estuarine_hab_table\"> ");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th class=\"sorting_col\" style=\"width:150px;\"><a class=\"estuarine_hab_type sort_up\" href=\"#\">Habitat</a></th>");_.b("\n" + i);_.b("              <th><a  class=\"estuarine_hab_new_area sort_down\" href=\"#\" >Area (km<sup>2</sup>)</a></th>");_.b("\n" + i);_.b("              <th><a class=\"estuarine_hab_new_perc sort_down\" href=\"#\">Area (%)</a></th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,4790,5184,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <th><a class=\"estuarine_hab_represent sort_down\" style=\"width:80px;\" href=\"#\" >");_.b(_.v(_.f("REP_NAME",c,p,0)));_.b("</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,4935,5152,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  <th><a class=\"estuarine_hab_replicate sort_down\" href=\"#\" >Replicate Count</th>");_.b("\n" + i);_.b("                  <th><a class=\"estuarine_hab_connected sort_down\" href=\"#\">Connectivity (in km)</th>");_.b("\n");});c.pop();}});c.pop();}_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("         <tbody class=\"estuarine_hab_values\"></tbody>");_.b("\n" + i);_.b("       </table>");_.b("\n");});c.pop();}if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:150px;\">Habitat</th>");_.b("\n" + i);_.b("              <th>Area (km<sup>2</sup>)</th>");_.b("\n" + i);_.b("              <th>Area (%)</th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,5569,5796,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <th>Patch Size (Type-1)</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,5650,5764,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                    <th>Replicate Count</th>");_.b("\n" + i);_.b("                    <th>Connectivity (in km)</th>");_.b("\n");});c.pop();}});c.pop();}_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasEstuarineHabTypes",c,p,1),c,p,0,5899,6324,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("estuarine_hab_types",c,p,1),c,p,0,5938,6287,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("PERC",c,p,0)));_.b("</td>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,6095,6242,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                  <td>");_.b(_.v(_.f("REPRESENT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                  ");if(_.s(_.f("isCollection",c,p,1),c,p,0,6172,6208,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<td>");_.b(_.v(_.f("REPLIC",c,p,0)));_.b("</td><td>");_.b(_.v(_.f("CONN",c,p,0)));_.b("</td>");});c.pop();}_.b("\n");});c.pop();}_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasEstuarineHabTypes",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td colspan=\"");if(_.s(_.f("isCollection",c,p,1),c,p,0,6453,6454,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("5");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("4");};_.b("\">");_.b("\n" + i);_.b("                  <i>There are no estuarine habitat types.</i>");_.b("\n" + i);_.b("                </td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("\n");};_.b("\n" + i);_.b("\n" + i);_.b("    <p class=\"in-report-header\">Sensitive Marine Habitats</p>");_.b("\n" + i);if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,6796,7669,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <table data-paging=\"20\" class=\"sig_hab_table\"> ");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th class=\"sorting_col\" style=\"width:150px;\"><a class=\"sig_hab_type sort_down\" href=\"#\">Habitat</a></th>");_.b("\n" + i);_.b("            <th><a  class=\"sig_hab_new_area sort_up\" href=\"#\" >Area (km<sup>2</sup>)</a></th>");_.b("\n" + i);_.b("            <th><a class=\"sig_hab_new_perc sort_down\" href=\"#\">Area (%)</a></th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,7196,7561,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <th><a class=\"sig_hab_represent sort_down\" style=\"width:80px;\" href=\"#\">");_.b(_.v(_.f("REP_NAME",c,p,0)));_.b("</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,7332,7531,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <th><a class=\"sig_hab_replicate sort_down\" href=\"#\">Replicate Count</th>");_.b("\n" + i);_.b("                <th><a class=\"sig_hab_connected sort_down\" href=\"#\">Connectivity (in km) </th>");_.b("\n");});c.pop();}});c.pop();}_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("       <tbody class=\"sig_hab_values\"></tbody>");_.b("\n" + i);_.b("     </table>");_.b("\n");});c.pop();}if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th style=\"width:175px;\">Habitat</th>");_.b("\n" + i);_.b("            <th>Area (km<sup>2</sup>)</th>");_.b("\n" + i);_.b("            <th>Area (%)</th>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,7916,8134,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <th>Patch Size</th>");_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,7988,8102,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                    <th>Replicate Count</th>");_.b("\n" + i);_.b("                    <th>Connectivity (in km)</th>");_.b("\n");});c.pop();}});c.pop();}_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("hasSigHabs",c,p,1),c,p,0,8217,8590,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("sig_habs",c,p,1),c,p,0,8241,8568,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("HAB_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("PERC",c,p,0)));_.b("</td>");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,8388,8529,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <td>");_.b(_.v(_.f("REPRESENT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                ");if(_.s(_.f("isCollection",c,p,1),c,p,0,8461,8497,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<td>");_.b(_.v(_.f("REPLIC",c,p,0)));_.b("</td><td>");_.b(_.v(_.f("CONN",c,p,0)));_.b("</td>");});c.pop();}_.b("\n");});c.pop();}_.b("            </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasSigHabs",c,p,1),c,p,1,0,0,"")){_.b("          <tr>");_.b("\n" + i);_.b("              <td colspan=\"");if(_.s(_.f("isCollection",c,p,1),c,p,0,8689,8690,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("5");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("4");};_.b("\">");_.b("\n" + i);_.b("                <i>There are no habitats of significance.</i>");_.b("\n" + i);_.b("              </td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");};_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("\n");};_.b("    <p>");_.b("\n" + i);_.b("      <em>Sensitive habitats are defined in the report '<a href=\"https://www.mfe.govt.nz/sites/default/files/sensitive-marine-benthic-habitats-defined.pdf\" target=\"_blank\">Sensitive marine benthic habitats defined</a>.' ’NA’ indicates that the habitat is likely to be present in the region but not mapped.</em>");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);if(_.s(_.f("showAdjacent",c,p,1),c,p,0,9275,10691,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("\n" + i);_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Adjacent Terrestrial Information</h4>");_.b("\n" + i);_.b("        <p><em>Areas shown below are within 100m of ");if(_.s(_.f("isCollection",c,p,1),c,p,0,9437,9463,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("a sketch in the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b(" the sketch ");};_.b("</em></p>");_.b("\n" + i);_.b("        <p class=\"large\"><strong>Protected Areas</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"20\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasProtected",c,p,1),c,p,0,9678,9834,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("protected_areas",c,p,1),c,p,0,9713,9801,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasProtected",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("        <p class=\"large\"><strong>Conservation Covenants</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasCovenants",c,p,1),c,p,0,10183,10482,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("qe2_covenants",c,p,1),c,p,0,10216,10304,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}if(_.s(_.f("napalis_covenants",c,p,1),c,p,0,10359,10447,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasCovenants",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n");return _.fl();;});
this["Templates"]["fishing"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("\n" + i);if(_.s(_.f("hasAnyFishing",c,p,1),c,p,0,317,2552,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hasExistingFishing",c,p,1),c,p,0,345,1382,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("      <h4>Existing Fisheries Management</h4>");_.b("\n" + i);_.b("          <p><em>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,476,483,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" includes the following existing fisheries restrictions. ");_.b("\n" + i);_.b("          Also shown is the extent that the fisheries restrictions apply to the ");if(_.s(_.f("isCollection",c,p,1),c,p,0,695,703,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketches");});c.pop();}_.b("\n" + i);_.b("          ");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" as a percentage of total sketch area. For example, 100% means no fishing of that type is currently allowed within the sketch.</em></p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <thead>");_.b("\n" + i);_.b("              <tr>");_.b("\n" + i);_.b("                <th style=\"width:250px;\">Name</th>");_.b("\n" + i);_.b("                <th>Percent</th>");_.b("\n" + i);_.b("              </tr>");_.b("\n" + i);_.b("            </thead>");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("existing_fishing_areas",c,p,1),c,p,0,1167,1299,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("PERC_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}if(_.s(_.f("hasCustomary",c,p,1),c,p,0,1427,2533,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Customary Areas</h4>");_.b("\n" + i);if(_.s(_.f("hasExistingCustomary",c,p,1),c,p,0,1543,1987,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <p> The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1579,1586,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes the following <strong>existing</strong> Customary Areas:</p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("existing_customary_fishing",c,p,1),c,p,0,1814,1907,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n");});c.pop();}if(_.s(_.f("hasProposedCustomary",c,p,1),c,p,0,2046,2490,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <p> The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,2082,2089,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes the following <strong>proposed</strong> Customary Areas:</p>");_.b("\n" + i);_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("proposed_customary_fishing",c,p,1),c,p,0,2317,2410,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n");});c.pop();}_.b("      </div>");_.b("\n");});c.pop();}_.b("\n");});c.pop();}if(!_.s(_.f("hasAnyFishing",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Existing or Customary Areas</h4>");_.b("\n" + i);_.b("        <p>No information on existing fishing areas or customary use is available for this area.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};_.b("\n" + i);if(_.s(_.f("isConfidentialMPANetwork",c,p,1),c,p,0,2835,5081,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("      <h4>Fishing Intensity</h4>");_.b("\n" + i);_.b("          <p>");_.b("\n" + i);_.b("            <em>");_.b("\n" + i);_.b("            Your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,2981,2988,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" includes areas identified as having high, moderate or low intensity fishing grounds for the following fisheries. The percentage of the regions high, moderate and low intensity fishing grounds covered by your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3271,3278,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(" is given below. Fishery displacement shows the percentage of the regions fishery that would be displaced by your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3466,3473,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("network");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b(".");_.b("\n" + i);_.b("            </em>");_.b("\n" + i);_.b("          </p>");_.b("\n" + i);if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,3591,4328,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <table data-paging=\"20\" class=\"fishery_table\"> ");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th class=\"sorting_col\" style=\"width:150px;\"><a class=\"fishery_type sort_up\" href=\"#\">Fishery</a></th>");_.b("\n" + i);_.b("                  <th><a class=\"fishery_high sort_down\" href=\"#\" >High (%)</th>");_.b("\n" + i);_.b("                  <th><a class=\"fishery_moderate sort_down\" href=\"#\">Moderate (%)</a></th>");_.b("\n" + i);_.b("                  <th><a class=\"fishery_low sort_down\" style=\"width:80px;\" href=\"#\" >Low (%)</th>");_.b("\n" + i);_.b("                  <th><a class=\"fishery_disp sort_down\" style=\"width:80px;\" href=\"#\" >Fishery displacement (%)</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("             <tbody class=\"fishery_values\"></tbody>");_.b("\n" + i);_.b("           </table>");_.b("\n");});c.pop();}if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("          <table data-paging=\"10\">");_.b("\n" + i);_.b("            <thead>");_.b("\n" + i);_.b("              <tr>");_.b("\n" + i);_.b("                <th style=\"width:125px;\">Fishery</th>");_.b("\n" + i);_.b("                <th>High (%)</th>");_.b("\n" + i);_.b("                <th>Moderate (%)</th>");_.b("\n" + i);_.b("                <th>Low (%)</th>");_.b("\n" + i);_.b("                <th>Fishery displacement (%)</th>");_.b("\n" + i);_.b("              </tr>");_.b("\n" + i);_.b("            </thead>");_.b("\n" + i);_.b("            <tbody>");_.b("\n" + i);if(_.s(_.f("fishery_intensity",c,p,1),c,p,0,4752,4984,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FISH_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("MODERATE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("DISP",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}_.b("            </tbody>");_.b("\n" + i);_.b("          </table>");_.b("\n");};_.b("    </div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("<!--");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,5127,7008,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Fishing Intensity</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        The following tables contains the percent of the total SEMPF low intensity and high intensity fishing that may be displaced by the sketch. <strong>High intensity</strong> is greater than an average of 5 events per annum, <strong>Low</strong> is 5 or less events per annum.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("      <p class=\"in-report-header\">Trawl Fishing Intensity</p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>Sketch Name</th>");_.b("\n" + i);_.b("            <th>% Low Intensity</th>");_.b("\n" + i);_.b("            <th>% High Intensity</th>");_.b("\n" + i);_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("trawl",c,p,1),c,p,0,5822,5953,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("\n" + i);_.b("      <p class=\"in-report-header\">Set Net Fishing Intensity</p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>Sketch Name</th>");_.b("\n" + i);_.b("              <th>% Low Intensity</th>");_.b("\n" + i);_.b("              <th>% High Intensity</th>");_.b("\n" + i);_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("setnet",c,p,1),c,p,0,6322,6465,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("      <p class=\"in-report-header\">Long Line Fishing Intensity</p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>Sketch Name</th>");_.b("\n" + i);_.b("            <th>% Low Intensity</th>");_.b("\n" + i);_.b("            <th>% High Intensity</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("longline",c,p,1),c,p,0,6821,6952,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("LOW",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("HIGH",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("-->");_.b("\n" + i);_.b("\n" + i);_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["overview"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,313,748,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isMPA",c,p,1),c,p,0,326,737,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>MPA Network</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This Collection has: <strong>");_.b(_.v(_.f("num_reserves",c,p,0)));_.b(" Type-1 MPA");if(_.s(_.f("plural_type1",c,p,1),c,p,0,496,497,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}_.b(", ");_.b(_.v(_.f("num_type2",c,p,0)));_.b(" Type-2 MPA");if(_.s(_.f("plural_type2",c,p,1),c,p,0,557,558,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}_.b(", and ");_.b(_.v(_.f("num_other",c,p,0)));_.b(" Other MPA");if(_.s(_.f("plural_other",c,p,1),c,p,0,621,622,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}_.b("</strong> .");_.b("\n" + i);_.b("        <em>Only Type-1 and Type-2 MPAs are reported on.</em>");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){if(_.s(_.f("anyAttributes",c,p,1),c,p,0,807,1125,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div class=\"reportSection\">");_.b("\n" + i);_.b("        <h4>");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("</h4>");_.b("\n" + i);_.b(_.rp("attributes/attributesTable",c,p,"        "));if(_.s(_.f("isCollection",c,p,1),c,p,0,945,1075,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <tr><td>");if(_.s(_.f("isMPA",c,p,1),c,p,0,972,986,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Number of MPAs");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,1010,1028,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Number of Sketches");});c.pop();}_.b("</td>");_.b(_.v(_.f("numSketches",c,p,0)));_.b("<td>");_.b("\n");});c.pop();}_.b("        </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");});c.pop();}};_.b("\n" + i);if(_.s(_.f("isGeneric",c,p,1),c,p,0,1179,1466,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,1201,1446,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection\">");_.b("\n" + i);_.b("      <h4>Number of Sketches in Collection</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This collection contains <strong>");_.b(_.v(_.f("numSketches",c,p,0)));_.b("</strong> sketch");if(_.s(_.f("pluralSketches",c,p,1),c,p,0,1397,1399,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("es");});c.pop();}_.b(".");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,1494,3816,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,1516,3796,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Coastal Habitats Included in Type-1 MPA");_.b("\n" + i);_.b("        <a href=\"#\" data-toggle-node=\"5536dbb48c5b43eb0facbc5a\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("      <strong>Number of Habitat Classes</strong></br>");_.b("\n" + i);_.b("      <p style=\"margin-top:0px;\" class=\"large\">");_.b("\n" + i);_.b("        There are <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> habitat classes in the planning region, and your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,1950,1960,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("\n" + i);_.b("        includes <strong>");_.b(_.v(_.f("new_habs",c,p,0)));_.b("</strong>. For more information on the Habitat Classification, see");_.b("\n" + i);_.b("        the <a href=\"http://www.doc.govt.nz/Documents/conservation/marine-and-coastal/marine-protected-areas/mpa-classification-protection-standard.pdf\" target=\"_blank\">");_.b("\n" + i);_.b("        Marine Protected Areas Classification and Protection Standard</a>");_.b("\n" + i);_.b("      </p>");_.b("\n");};if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,2422,2626,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <div>");_.b("\n" + i);_.b("          <div class=\"represented_habs_pie\" id=\"represented_habs_pie\"></div>");_.b("\n" + i);_.b("          <div class=\"represented_habs_pie_legend\" id=\"represented_habs_pie_legend\"></div>");_.b("\n" + i);_.b("        </div>");_.b("\n");});c.pop();}_.b("    </div>");_.b("\n" + i);_.b("    ");_.b("\n" + i);_.b("\n" + i);_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Coastal Habitats Replicated");_.b("\n" + i);_.b("        <a href=\"#\" data-toggle-node=\"5536dbb48c5b43eb0facbc5a\" data-visible=\"false\">show layer</a>");_.b("\n" + i);_.b("      </h4>");_.b("\n" + i);if(!_.s(_.f("d3IsPresent",c,p,1),c,p,1,0,0,"")){_.b("        <strong>Number of Habitat Classes</strong></br>");_.b("\n" + i);_.b("        <p style=\"margin-top:0px;\" class=\"large\">");_.b("\n" + i);_.b("          There are <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> habitat classes in the planning region, and your ");if(_.s(_.f("isCollection",c,p,1),c,p,0,3094,3104,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("\n" + i);_.b("          includes <strong>");_.b(_.v(_.f("new_habs",c,p,0)));_.b("</strong>. For more information on the Habitat Classification, see");_.b("\n" + i);_.b("          the <a href=\"http://www.doc.govt.nz/Documents/conservation/marine-and-coastal/marine-protected-areas/mpa-classification-protection-standard.pdf\" target=\"_blank\">");_.b("\n" + i);_.b("          Marine Protected Areas Classification and Protection Standard</a>");_.b("\n" + i);_.b("        </p>");_.b("\n");};if(_.s(_.f("d3IsPresent",c,p,1),c,p,0,3574,3764,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div>");_.b("\n" + i);_.b("        <div class=\"replicated_habs_pie\" id=\"replicated_habs_pie\"></div>");_.b("\n" + i);_.b("        <div class=\"replicated_habs_pie_legend\" id=\"replicated_habs_pie_legend\"></div>");_.b("\n" + i);_.b("      </div>");_.b("\n");});c.pop();}_.b("    </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);if(_.s(_.f("isCollection",c,p,1),c,p,0,3845,5298,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection size\">");_.b("\n" + i);_.b("    <h4>");if(_.s(_.f("isMPA",c,p,1),c,p,0,3899,3908,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("MPA Sizes");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,3932,3944,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Sketch Sizes");});c.pop();}_.b("</h4>");_.b("\n" + i);_.b("    <!--");_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,3987,4314,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        Of the <strong>");_.b(_.v(_.f("total_mpa_count",c,p,0)));_.b("</strong> MPAs in the network, <strong>");_.b(_.v(_.f("mpa_count",c,p,0)));_.b("</strong> meet");if(!_.s(_.f("plural_mpa_count",c,p,1),c,p,1,0,0,"")){_.b("s");};_.b(" the minimum size dimension of 5km. The average minimum dimension is <strong>");_.b(_.v(_.f("mpa_avg_size_guideline",c,p,0)));_.b("</strong> the 10-20km guideline.");_.b("\n" + i);_.b("      </p>");_.b("\n");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,4343,4410,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p>The size of the sketches in this collection are:</p>");_.b("\n");});c.pop();}_.b("    -->");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <thead>");_.b("\n" + i);_.b("          <tr>");_.b("\n" + i);_.b("            <th>");if(_.s(_.f("isMPA",c,p,1),c,p,0,4521,4529,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("MPA Name");});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,4553,4564,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Sketch Name");});c.pop();}_.b("</th>");_.b("\n" + i);_.b("            <th>Area </br>(sq. km.)</th>");_.b("\n" + i);_.b("            <th style=\"width:100px;\">Width (km)</th>");_.b("\n" + i);_.b("            <th style=\"width:100px;\">Coastline Length (km)</th>");_.b("\n" + i);_.b("          </tr>");_.b("\n" + i);_.b("        </thead>");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("prop_sizes",c,p,1),c,p,0,4816,5007,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr class=");_.b(_.v(_.f("CSS_CLASS",c,p,0)));_.b(">");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("MIN_DIM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("COAST",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n" + i);_.b("    <p class=\"large\">");_.b("\n" + i);_.b("      This combined area within the network accounts for <strong>");_.b(_.v(_.f("area_percent",c,p,0)));_.b("%</strong> of the South-East Marine area, and <strong>");_.b(_.v(_.f("coastline_length_percent",c,p,0)));_.b("%</strong> of the South-East coastline.");_.b("\n" + i);_.b("    </p>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){if(_.s(_.f("isMPA",c,p,1),c,p,0,5346,6226,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>MPA Size</h4>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>MPA Name</th>");_.b("\n" + i);_.b("              <th>Area </br>(sq. km.)</th>");_.b("\n" + i);_.b("              <th style=\"width:100px;\">Width (km)</th>");_.b("\n" + i);_.b("              <th style=\"width:100px;\">Coastline Length (km)</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("prop_sizes",c,p,1),c,p,0,5754,5934,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("SIZE_SQKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("MIN_DIM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("COAST",c,p,0)));_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This area within the MPA accounts for <strong>");_.b(_.v(_.f("area_percent",c,p,0)));_.b("%</strong> of the South-East Marine area, and <strong>");_.b(_.v(_.f("coastline_length_percent",c,p,0)));_.b("%</strong> of the South-East coastline.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}};_.b("\n" + i);if(_.s(_.f("isMPA",c,p,1),c,p,0,6266,7551,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("isCollection",c,p,1),c,p,0,6286,7533,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <div class=\"reportSection\">");_.b("\n" + i);_.b("        <h4>Connectivity</h4>");_.b("\n" + i);if(_.s(_.f("singleSketch",c,p,1),c,p,0,6376,6553,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <p style=\"font-style:italic;color:gray;\" class=\"large\">");_.b("\n" + i);_.b("                No connectivity information for a collection with one sketch. ");_.b("\n" + i);_.b("              </p>");_.b("\n");});c.pop();}if(!_.s(_.f("singleSketch",c,p,1),c,p,1,0,0,"")){_.b("          <!--");_.b("\n" + i);_.b("          <div>");_.b("\n" + i);_.b("            <div class=\"connectivity_pie\" id=\"connectivity_pie\"></div>");_.b("\n" + i);_.b("            <div class=\"connectivity_pie_legend\" id=\"connectivity_pie_legend\"></div>");_.b("\n" + i);_.b("          </div>");_.b("\n" + i);_.b("          -->");_.b("\n" + i);_.b("          <p class=\"large\">Of the <strong>");_.b(_.v(_.f("total_mpa_count",c,p,0)));_.b("</strong> MPAs in the network, <strong>");_.b(_.v(_.f("connected_mpa_count",c,p,0)));_.b("</strong>");if(_.s(_.f("plural_connected_mpa_count",c,p,1),c,p,0,6978,6982,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(" are");});c.pop();}if(!_.s(_.f("plural_connected_mpa_count",c,p,1),c,p,1,0,0,"")){_.b(" is");};_.b(" within 100 km of each other. ");_.b("\n" + i);_.b("          </p>");_.b("\n" + i);_.b("          <span class=\"conn_values\">The minimum distance between the MPAs is <strong>");_.b(_.v(_.f("min_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("          <span class=\"conn_values\">The maximum distance between the MPAs is <strong>");_.b(_.v(_.f("max_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n" + i);_.b("          <span class=\"conn_values\">The average distance between the MPAs is <strong>");_.b(_.v(_.f("mean_distance",c,p,0)));_.b(" km</strong>.</span>");_.b("\n");};_.b("\n" + i);_.b("      </div>");_.b("\n");});c.pop();}});c.pop();}_.b("\n" + i);if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){if(_.s(_.f("isGeneric",c,p,1),c,p,0,7597,8003,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <div class=\"reportSection size\">");_.b("\n" + i);_.b("      <h4>Size</h4>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This sketch area is <strong>");_.b(_.v(_.f("size",c,p,0)));_.b(" square kilometers</strong>, and it includes <strong>");_.b(_.v(_.f("coastline_length_percent",c,p,0)));_.b("%</strong> of the South-East Planning Region.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("      <p class=\"large\">");_.b("\n" + i);_.b("        This sketch includes <strong>");_.b(_.v(_.f("coastline_length",c,p,0)));_.b(" kilometers</strong> of coastline.");_.b("\n" + i);_.b("      </p>");_.b("\n" + i);_.b("    </div>");_.b("\n");});c.pop();}};_.b("\n" + i);_.b("\n" + i);_.b("<!--");_.b("\n" + i);_.b("<div class=\"reportSection size\">");_.b("\n" + i);_.b("  <h4>Number of Habitats</h4>");_.b("\n" + i);_.b("  <p class=\"large\">");_.b("\n" + i);_.b("    The ");if(_.s(_.f("isMPA",c,p,1),c,p,0,8144,8201,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(" Marine Protected Area");if(_.s(_.f("isCollection",c,p,1),c,p,0,8183,8184,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("s");});c.pop();}});c.pop();}if(_.s(_.f("isGeneric",c,p,1),c,p,0,8225,8267,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketch");if(_.s(_.f("isCollection",c,p,1),c,p,0,8248,8250,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("es");});c.pop();}});c.pop();}_.b(" include");if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("s");};_.b(" <strong>");_.b(_.v(_.f("num_habs",c,p,0)));_.b("</strong> of the <strong>");_.b(_.v(_.f("total_habs",c,p,0)));_.b("</strong> classified habitats.");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("-->");_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["uses"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("hasCoastal",c,p,1),c,p,0,310,1045,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Existing Coastal Consents <a href=\"#\" data-toggle-node=\"53d719a49380174a7766dd85\" data-visible=\"false\">");_.b("\n" + i);_.b("      show layer</a></h4>");_.b("\n" + i);_.b("        <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,524,554,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites with Resource Consents.</p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:250px;\">Consent Type</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("coastal_consents",c,p,1),c,p,0,893,978,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("hasUses",c,p,1),c,p,0,1074,4145,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("hasRecUses",c,p,1),c,p,0,1092,2356,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Recreational Uses </h4>");_.b("\n" + i);_.b("      <!--");_.b("\n" + i);if(_.s(_.f("hasSmaro",c,p,1),c,p,0,1200,1688,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("        <p><strong>Spectrum of MArine Recreational Opportunity (SMARO)</strong></p>");_.b("\n" + i);_.b("          <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,1339,1349,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("Sketch");};_.b(" includes area(s) identified as having <strong> medium or high </strong> recreational opportunity.");_.b("\n" + i);_.b("          <em>You can find more information on SMARO in the \"data description\" by right clicking on the layer name.</em>");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("        </br></br>");_.b("\n");};});c.pop();}_.b("      -->");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th style=\"width:250px;\">Activity Type</th>");_.b("\n" + i);_.b("              <th>Number of Sites</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("hasRecUses",c,p,1),c,p,0,1959,2141,"{{ }}")){_.rs(c,p,function(c,p,_){if(_.s(_.f("rec_uses",c,p,1),c,p,0,1987,2115,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <tr>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                <td>");_.b(_.v(_.f("COUNT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");});c.pop();}});c.pop();}if(!_.s(_.f("hasRecUses",c,p,1),c,p,1,0,0,"")){_.b("              <tr>");_.b("\n" + i);_.b("                <td colspan=2><em>None Present</em></td>");_.b("\n" + i);_.b("              </tr>");_.b("\n");};_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("  </div>");_.b("\n");});c.pop();}_.b("\n" + i);if(_.s(_.f("hasHeritage",c,p,1),c,p,0,2391,3346,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Archeological Information ");_.b("\n" + i);_.b("          <a href=\"#\" data-toggle-node=\"5578f14cff39059a583646c9\" data-visible=\"false\">show layer</a>");_.b("\n" + i);_.b("        </h4>");_.b("\n" + i);_.b("            <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,2650,2680,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites identified as having significant heritage values.</p>");_.b("\n" + i);_.b("            <table data-paging=\"10\">");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th style=\"width:250px;\">Heritage Type</th>");_.b("\n" + i);_.b("                  <th>Number of Sites</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("              <tbody>");_.b("\n" + i);if(_.s(_.f("heritage",c,p,1),c,p,0,3113,3251,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <tr>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("COUNT",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                </tr>");_.b("\n");});c.pop();}_.b("              </tbody>");_.b("\n" + i);_.b("            </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");};});c.pop();}if(_.s(_.f("hasInfrastructure",c,p,1),c,p,0,3387,4122,"{{ }}")){_.rs(c,p,function(c,p,_){if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("      <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("        <h4>Infrastructure</h4>");_.b("\n" + i);_.b("            <p>");if(_.s(_.f("isCollection",c,p,1),c,p,0,3523,3553,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("A sketch within the collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("The sketch");};_.b(" contains or is within 200m of sites with existing infrastructure.</p>");_.b("\n" + i);_.b("            <table data-paging=\"10\">");_.b("\n" + i);_.b("              <thead>");_.b("\n" + i);_.b("                <tr>");_.b("\n" + i);_.b("                  <th style=\"width:250px;\">Type</th>");_.b("\n" + i);_.b("                </tr>");_.b("\n" + i);_.b("              </thead>");_.b("\n" + i);_.b("              <tbody>");_.b("\n" + i);if(_.s(_.f("infrastructure",c,p,1),c,p,0,3920,4021,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("                <tr>");_.b("\n" + i);_.b("                  <td>");_.b(_.v(_.f("FEAT_TYPE",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("                </tr>");_.b("\n");});c.pop();}_.b("              </tbody>");_.b("\n" + i);_.b("            </table>");_.b("\n" + i);_.b("      </div>");_.b("\n");};});c.pop();}});c.pop();}if(!_.s(_.f("hasUses",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Activities and Uses</h4>");_.b("\n" + i);_.b("        <p>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,4281,4291,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("collection");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch");};_.b("  does <strong>not</strong> include any <strong>activities or uses</strong>.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};_.b("\n" + i);if(_.s(_.f("hasSeabirds",c,p,1),c,p,0,4468,5194,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Birds </h4>");_.b("\n" + i);if(_.s(_.f("hasSeabirdAreas",c,p,1),c,p,0,4556,4840,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <p class=\"large\"><strong>Important Seabird Areas</strong></p>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("seabirds",c,p,1),c,p,0,4703,4783,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n");});c.pop();}_.b("    ");_.b("\n" + i);if(_.s(_.f("hasSeabirdColonies",c,p,1),c,p,0,4893,5163,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <p class=\"large\"><strong>Seabird Colonies</strong></p>");_.b("\n" + i);_.b("      <table data-paging=\"10\">");_.b("\n" + i);_.b("        <tbody>");_.b("\n" + i);if(_.s(_.f("seabird_colonies",c,p,1),c,p,0,5033,5105,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <tr>");_.b("\n" + i);_.b("            <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("          </tr>");_.b("\n");});c.pop();}_.b("        </tbody>");_.b("\n" + i);_.b("      </table>");_.b("\n");});c.pop();}_.b("</div>");_.b("\n");});c.pop();}if(_.s(_.f("hasMarineSpecies",c,p,1),c,p,0,5232,5694,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Marine Mammals</h4>");_.b("\n" + i);_.b("        <table data-paging=\"10\">");_.b("\n" + i);_.b("          <thead>");_.b("\n" + i);_.b("            <tr>");_.b("\n" + i);_.b("              <th>Species</th>");_.b("\n" + i);_.b("            </tr>");_.b("\n" + i);_.b("          </thead>");_.b("\n" + i);_.b("          <tbody>");_.b("\n" + i);if(_.s(_.f("mammals",c,p,1),c,p,0,5480,5560,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("            <tr>");_.b("\n" + i);_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("            </tr>");_.b("\n");});c.pop();}if(_.s(_.f("seals",c,p,1),c,p,0,5595,5640,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("              <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n");});c.pop();}_.b("          </tbody>");_.b("\n" + i);_.b("        </table>");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}if(!_.s(_.f("hasMarineSpecies",c,p,1),c,p,1,0,0,"")){_.b("  <div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("    <h4>Species Information</h4>");_.b("\n" + i);_.b("        <p>The ");if(_.s(_.f("isCollection",c,p,1),c,p,0,5848,5882,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("sketches within the collection do ");});c.pop();}if(!_.s(_.f("isCollection",c,p,1),c,p,1,0,0,"")){_.b("sketch does");};_.b(" <strong>not</strong> include any <strong>important marine mammal areas</strong>.</p>");_.b("\n" + i);_.b("  </div>");_.b("\n");};return _.fl();;});

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = this["Templates"];
}
},{}]},{},[15])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9vdGFnby1yZXBvcnRzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvZW5hYmxlTGF5ZXJUb2dnbGVycy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvam9iSXRlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0UmVzdWx0cy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0VGFiLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvc2NyaXB0cy91dGlscy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9lbnZpcm9ubWVudC5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9maXNoaW5nLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvb3RhZ28tcmVwb3J0cy9zY3JpcHRzL2lkcy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9vdmVydmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvc2NyaXB0cy9yZXBvcnQuY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9vdGFnby1yZXBvcnRzL3NjcmlwdHMvdXNlcy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL290YWdvLXJlcG9ydHMvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBLENBQU8sQ0FBVSxDQUFBLEdBQVgsQ0FBTixFQUFrQjtDQUNoQixLQUFBLDJFQUFBO0NBQUEsQ0FBQSxDQUFBO0NBQUEsQ0FDQSxDQUFBLEdBQVk7Q0FEWixDQUVBLENBQUEsR0FBTTtBQUNDLENBQVAsQ0FBQSxDQUFBLENBQUE7Q0FDRSxFQUFBLENBQUEsR0FBTyxxQkFBUDtDQUNBLFNBQUE7SUFMRjtDQUFBLENBTUEsQ0FBVyxDQUFBLElBQVgsYUFBVztDQUVYO0NBQUEsTUFBQSxvQ0FBQTt3QkFBQTtDQUNFLEVBQVcsQ0FBWCxHQUFXLENBQVg7Q0FBQSxFQUNTLENBQVQsRUFBQSxFQUFpQixLQUFSO0NBQ1Q7Q0FDRSxFQUFPLENBQVAsRUFBQSxVQUFPO0NBQVAsRUFD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QUFkLE1BQUE7Q0FoQkEsQ0FtQlUsSUFBVixFQUFBO0NBbkJBLENBb0JrQixJQUFsQixVQUFBO0NBcEJBLENBcUJhLElBQWIsS0FBQTtDQXJCQSxDQXNCaUIsSUFBakIsU0FBQTtDQXRCQSxDQXVCb0IsSUFBcEIsWUFBQTtDQXZCQSxDQXlCUyxJQUFULENBQUE7Q0F6QkEsQ0EwQlksSUFBWixJQUFBO0NBMUJBLENBMkJXLElBQVgsR0FBQTtDQTNCQSxDQTRCTyxHQUFQLENBQUE7Q0E1QkEsQ0E2QlUsSUFBVixFQUFBO0NBN0JBLENBK0I2QixJQUE3QixxQkFBQTtDQS9CQSxDQWdDa0IsSUFBbEIsVUFBQTtDQXJGRixLQUFBO0NBQUEsQ0F1Rm9DLENBQWhDLENBQUosRUFBVSxDQUFBLENBQVM7Q0FDbEIsR0FBQSxPQUFELFFBQUE7Q0FyR0YsRUFVUTs7Q0FWUjs7Q0FGb0I7O0FBMkd0QixDQXpIQSxFQXlIaUIsR0FBWCxDQUFOOzs7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsbnVsbCwibW9kdWxlLmV4cG9ydHMgPSAoZWwpIC0+XG4gICRlbCA9ICQgZWxcbiAgYXBwID0gd2luZG93LmFwcFxuICB0b2MgPSBhcHAuZ2V0VG9jKClcbiAgdW5sZXNzIHRvY1xuICAgIGNvbnNvbGUubG9nICdObyB0YWJsZSBvZiBjb250ZW50cyBmb3VuZCdcbiAgICByZXR1cm5cbiAgdG9nZ2xlcnMgPSAkZWwuZmluZCgnYVtkYXRhLXRvZ2dsZS1ub2RlXScpXG4gICMgU2V0IGluaXRpYWwgc3RhdGVcbiAgZm9yIHRvZ2dsZXIgaW4gdG9nZ2xlcnMudG9BcnJheSgpXG4gICAgJHRvZ2dsZXIgPSAkKHRvZ2dsZXIpXG4gICAgbm9kZWlkID0gJHRvZ2dsZXIuZGF0YSgndG9nZ2xlLW5vZGUnKVxuICAgIHRyeVxuICAgICAgdmlldyA9IHRvYy5nZXRDaGlsZFZpZXdCeUlkIG5vZGVpZFxuICAgICAgbm9kZSA9IHZpZXcubW9kZWxcbiAgICAgICR0b2dnbGVyLmF0dHIgJ2RhdGEtdmlzaWJsZScsICEhbm9kZS5nZXQoJ3Zpc2libGUnKVxuICAgICAgJHRvZ2dsZXIuZGF0YSAndG9jSXRlbScsIHZpZXdcbiAgICBjYXRjaCBlXG4gICAgICAkdG9nZ2xlci5hdHRyICdkYXRhLW5vdC1mb3VuZCcsICd0cnVlJ1xuXG4gIHRvZ2dsZXJzLm9uICdjbGljaycsIChlKSAtPlxuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICRlbCA9ICQoZS50YXJnZXQpXG4gICAgdmlldyA9ICRlbC5kYXRhKCd0b2NJdGVtJylcbiAgICBpZiB2aWV3XG4gICAgICB2aWV3LnRvZ2dsZVZpc2liaWxpdHkoZSlcbiAgICAgICRlbC5hdHRyICdkYXRhLXZpc2libGUnLCAhIXZpZXcubW9kZWwuZ2V0KCd2aXNpYmxlJylcbiAgICBlbHNlXG4gICAgICBhbGVydCBcIkxheWVyIG5vdCBmb3VuZCBpbiB0aGUgY3VycmVudCBUYWJsZSBvZiBDb250ZW50cy4gXFxuRXhwZWN0ZWQgbm9kZWlkICN7JGVsLmRhdGEoJ3RvZ2dsZS1ub2RlJyl9XCJcbiIsImNsYXNzIEpvYkl0ZW0gZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG4gIGNsYXNzTmFtZTogJ3JlcG9ydFJlc3VsdCdcbiAgZXZlbnRzOiB7fVxuICBiaW5kaW5nczpcbiAgICBcImg2IGFcIjpcbiAgICAgIG9ic2VydmU6IFwic2VydmljZU5hbWVcIlxuICAgICAgdXBkYXRlVmlldzogdHJ1ZVxuICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgbmFtZTogJ2hyZWYnXG4gICAgICAgIG9ic2VydmU6ICdzZXJ2aWNlVXJsJ1xuICAgICAgfV1cbiAgICBcIi5zdGFydGVkQXRcIjpcbiAgICAgIG9ic2VydmU6IFtcInN0YXJ0ZWRBdFwiLCBcInN0YXR1c1wiXVxuICAgICAgdmlzaWJsZTogKCkgLT5cbiAgICAgICAgQG1vZGVsLmdldCgnc3RhdHVzJykgbm90IGluIFsnY29tcGxldGUnLCAnZXJyb3InXVxuICAgICAgdXBkYXRlVmlldzogdHJ1ZVxuICAgICAgb25HZXQ6ICgpIC0+XG4gICAgICAgIGlmIEBtb2RlbC5nZXQoJ3N0YXJ0ZWRBdCcpXG4gICAgICAgICAgcmV0dXJuIFwiU3RhcnRlZCBcIiArIG1vbWVudChAbW9kZWwuZ2V0KCdzdGFydGVkQXQnKSkuZnJvbU5vdygpICsgXCIuIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBcIlwiXG4gICAgXCIuc3RhdHVzXCI6ICAgICAgXG4gICAgICBvYnNlcnZlOiBcInN0YXR1c1wiXG4gICAgICBvbkdldDogKHMpIC0+XG4gICAgICAgIHN3aXRjaCBzXG4gICAgICAgICAgd2hlbiAncGVuZGluZydcbiAgICAgICAgICAgIFwid2FpdGluZyBpbiBsaW5lXCJcbiAgICAgICAgICB3aGVuICdydW5uaW5nJ1xuICAgICAgICAgICAgXCJydW5uaW5nIGFuYWx5dGljYWwgc2VydmljZVwiXG4gICAgICAgICAgd2hlbiAnY29tcGxldGUnXG4gICAgICAgICAgICBcImNvbXBsZXRlZFwiXG4gICAgICAgICAgd2hlbiAnZXJyb3InXG4gICAgICAgICAgICBcImFuIGVycm9yIG9jY3VycmVkXCJcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBzXG4gICAgXCIucXVldWVMZW5ndGhcIjogXG4gICAgICBvYnNlcnZlOiBcInF1ZXVlTGVuZ3RoXCJcbiAgICAgIG9uR2V0OiAodikgLT5cbiAgICAgICAgcyA9IFwiV2FpdGluZyBiZWhpbmQgI3t2fSBqb2JcIlxuICAgICAgICBpZiB2Lmxlbmd0aCA+IDFcbiAgICAgICAgICBzICs9ICdzJ1xuICAgICAgICByZXR1cm4gcyArIFwiLiBcIlxuICAgICAgdmlzaWJsZTogKHYpIC0+XG4gICAgICAgIHY/IGFuZCBwYXJzZUludCh2KSA+IDBcbiAgICBcIi5lcnJvcnNcIjpcbiAgICAgIG9ic2VydmU6ICdlcnJvcidcbiAgICAgIHVwZGF0ZVZpZXc6IHRydWVcbiAgICAgIHZpc2libGU6ICh2KSAtPlxuICAgICAgICB2Py5sZW5ndGggPiAyXG4gICAgICBvbkdldDogKHYpIC0+XG4gICAgICAgIGlmIHY/XG4gICAgICAgICAgSlNPTi5zdHJpbmdpZnkodiwgbnVsbCwgJyAgJylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG51bGxcblxuICBjb25zdHJ1Y3RvcjogKEBtb2RlbCkgLT5cbiAgICBzdXBlcigpXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgIEAkZWwuaHRtbCBcIlwiXCJcbiAgICAgIDxoNj48YSBocmVmPVwiI1wiIHRhcmdldD1cIl9ibGFua1wiPjwvYT48c3BhbiBjbGFzcz1cInN0YXR1c1wiPjwvc3Bhbj48L2g2PlxuICAgICAgPGRpdj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJzdGFydGVkQXRcIj48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwicXVldWVMZW5ndGhcIj48L3NwYW4+XG4gICAgICAgIDxwcmUgY2xhc3M9XCJlcnJvcnNcIj48L3ByZT5cbiAgICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICAgIEBzdGlja2l0KClcblxubW9kdWxlLmV4cG9ydHMgPSBKb2JJdGVtIiwiY2xhc3MgUmVwb3J0UmVzdWx0cyBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuICBkZWZhdWx0UG9sbGluZ0ludGVydmFsOiAzMDAwXG5cbiAgY29uc3RydWN0b3I6IChAc2tldGNoLCBAZGVwcykgLT5cbiAgICBAdXJsID0gdXJsID0gXCIvcmVwb3J0cy8je0Bza2V0Y2guaWR9LyN7QGRlcHMuam9pbignLCcpfVwiXG4gICAgc3VwZXIoKVxuXG4gIHBvbGw6ICgpID0+XG4gICAgQGZldGNoIHtcbiAgICAgIHN1Y2Nlc3M6ICgpID0+XG4gICAgICAgIEB0cmlnZ2VyICdqb2JzJ1xuICAgICAgICBmb3IgcmVzdWx0IGluIEBtb2RlbHNcbiAgICAgICAgICBpZiByZXN1bHQuZ2V0KCdzdGF0dXMnKSBub3QgaW4gWydjb21wbGV0ZScsICdlcnJvciddXG4gICAgICAgICAgICB1bmxlc3MgQGludGVydmFsXG4gICAgICAgICAgICAgIEBpbnRlcnZhbCA9IHNldEludGVydmFsIEBwb2xsLCBAZGVmYXVsdFBvbGxpbmdJbnRlcnZhbFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgY29uc29sZS5sb2cgQG1vZGVsc1swXS5nZXQoJ3BheWxvYWRTaXplQnl0ZXMnKVxuICAgICAgICAgIHBheWxvYWRTaXplID0gTWF0aC5yb3VuZCgoKEBtb2RlbHNbMF0uZ2V0KCdwYXlsb2FkU2l6ZUJ5dGVzJykgb3IgMCkgLyAxMDI0KSAqIDEwMCkgLyAxMDBcbiAgICAgICAgICBjb25zb2xlLmxvZyBcIkZlYXR1cmVTZXQgc2VudCB0byBHUCB3ZWlnaGVkIGluIGF0ICN7cGF5bG9hZFNpemV9a2JcIlxuICAgICAgICAjIGFsbCBjb21wbGV0ZSB0aGVuXG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBpbnRlcnZhbCkgaWYgQGludGVydmFsXG4gICAgICAgIGlmIHByb2JsZW0gPSBfLmZpbmQoQG1vZGVscywgKHIpIC0+IHIuZ2V0KCdlcnJvcicpPylcbiAgICAgICAgICBAdHJpZ2dlciAnZXJyb3InLCBcIlByb2JsZW0gd2l0aCAje3Byb2JsZW0uZ2V0KCdzZXJ2aWNlTmFtZScpfSBqb2JcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHRyaWdnZXIgJ2ZpbmlzaGVkJ1xuICAgICAgZXJyb3I6IChlLCByZXMsIGEsIGIpID0+XG4gICAgICAgIHVubGVzcyByZXMuc3RhdHVzIGlzIDBcbiAgICAgICAgICBpZiByZXMucmVzcG9uc2VUZXh0Py5sZW5ndGhcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICBqc29uID0gSlNPTi5wYXJzZShyZXMucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICAgIyBkbyBub3RoaW5nXG4gICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGludGVydmFsKSBpZiBAaW50ZXJ2YWxcbiAgICAgICAgICBAdHJpZ2dlciAnZXJyb3InLCBqc29uPy5lcnJvcj8ubWVzc2FnZSBvclxuICAgICAgICAgICAgJ1Byb2JsZW0gY29udGFjdGluZyB0aGUgU2VhU2tldGNoIHNlcnZlcidcbiAgICB9XG5cbm1vZHVsZS5leHBvcnRzID0gUmVwb3J0UmVzdWx0c1xuIiwiZW5hYmxlTGF5ZXJUb2dnbGVycyA9IHJlcXVpcmUgJy4vZW5hYmxlTGF5ZXJUb2dnbGVycy5jb2ZmZWUnXG5yb3VuZCA9IHJlcXVpcmUoJy4vdXRpbHMuY29mZmVlJykucm91bmRcblJlcG9ydFJlc3VsdHMgPSByZXF1aXJlICcuL3JlcG9ydFJlc3VsdHMuY29mZmVlJ1xudCA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnKVxudGVtcGxhdGVzID1cbiAgcmVwb3J0TG9hZGluZzogdFsnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3JlcG9ydExvYWRpbmcnXVxuSm9iSXRlbSA9IHJlcXVpcmUgJy4vam9iSXRlbS5jb2ZmZWUnXG5Db2xsZWN0aW9uVmlldyA9IHJlcXVpcmUoJ3ZpZXdzL2NvbGxlY3Rpb25WaWV3JylcblxuY2xhc3MgUmVjb3JkU2V0XG5cbiAgY29uc3RydWN0b3I6IChAZGF0YSwgQHRhYiwgQHNrZXRjaENsYXNzSWQpIC0+XG5cbiAgdG9BcnJheTogKCkgLT5cbiAgICBpZiBAc2tldGNoQ2xhc3NJZFxuICAgICAgZGF0YSA9IF8uZmluZCBAZGF0YS52YWx1ZSwgKHYpID0+XG4gICAgICAgIHYuZmVhdHVyZXM/WzBdPy5hdHRyaWJ1dGVzP1snU0NfSUQnXSBpcyBAc2tldGNoQ2xhc3NJZFxuICAgICAgdW5sZXNzIGRhdGFcbiAgICAgICAgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBkYXRhIGZvciBza2V0Y2hDbGFzcyAje0Bza2V0Y2hDbGFzc0lkfVwiXG4gICAgZWxzZVxuICAgICAgaWYgXy5pc0FycmF5IEBkYXRhLnZhbHVlXG4gICAgICAgIGRhdGEgPSBAZGF0YS52YWx1ZVswXVxuICAgICAgZWxzZVxuICAgICAgICBkYXRhID0gQGRhdGEudmFsdWVcbiAgICBfLm1hcCBkYXRhLmZlYXR1cmVzLCAoZmVhdHVyZSkgLT5cbiAgICAgIGZlYXR1cmUuYXR0cmlidXRlc1xuXG4gIHJhdzogKGF0dHIpIC0+XG4gICAgYXR0cnMgPSBfLm1hcCBAdG9BcnJheSgpLCAocm93KSAtPlxuICAgICAgcm93W2F0dHJdXG4gICAgYXR0cnMgPSBfLmZpbHRlciBhdHRycywgKGF0dHIpIC0+IGF0dHIgIT0gdW5kZWZpbmVkXG4gICAgaWYgYXR0cnMubGVuZ3RoIGlzIDBcbiAgICAgIGNvbnNvbGUubG9nIEBkYXRhXG4gICAgICBAdGFiLnJlcG9ydEVycm9yIFwiQ291bGQgbm90IGdldCBhdHRyaWJ1dGUgI3thdHRyfSBmcm9tIHJlc3VsdHNcIlxuICAgICAgdGhyb3cgXCJDb3VsZCBub3QgZ2V0IGF0dHJpYnV0ZSAje2F0dHJ9XCJcbiAgICBlbHNlIGlmIGF0dHJzLmxlbmd0aCBpcyAxXG4gICAgICByZXR1cm4gYXR0cnNbMF1cbiAgICBlbHNlXG4gICAgICByZXR1cm4gYXR0cnNcblxuICBpbnQ6IChhdHRyKSAtPlxuICAgIHJhdyA9IEByYXcoYXR0cilcbiAgICBpZiBfLmlzQXJyYXkocmF3KVxuICAgICAgXy5tYXAgcmF3LCBwYXJzZUludFxuICAgIGVsc2VcbiAgICAgIHBhcnNlSW50KHJhdylcblxuICBmbG9hdDogKGF0dHIsIGRlY2ltYWxQbGFjZXM9MikgLT5cbiAgICByYXcgPSBAcmF3KGF0dHIpXG4gICAgaWYgXy5pc0FycmF5KHJhdylcbiAgICAgIF8ubWFwIHJhdywgKHZhbCkgLT4gcm91bmQodmFsLCBkZWNpbWFsUGxhY2VzKVxuICAgIGVsc2VcbiAgICAgIHJvdW5kKHJhdywgZGVjaW1hbFBsYWNlcylcblxuICBib29sOiAoYXR0cikgLT5cbiAgICByYXcgPSBAcmF3KGF0dHIpXG4gICAgaWYgXy5pc0FycmF5KHJhdylcbiAgICAgIF8ubWFwIHJhdywgKHZhbCkgLT4gdmFsLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSBpcyAndHJ1ZSdcbiAgICBlbHNlXG4gICAgICByYXcudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpIGlzICd0cnVlJ1xuXG5jbGFzcyBSZXBvcnRUYWIgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG4gIG5hbWU6ICdJbmZvcm1hdGlvbidcbiAgZGVwZW5kZW5jaWVzOiBbXVxuXG4gIGluaXRpYWxpemU6IChAbW9kZWwsIEBvcHRpb25zKSAtPlxuICAgICMgV2lsbCBiZSBpbml0aWFsaXplZCBieSBTZWFTa2V0Y2ggd2l0aCB0aGUgZm9sbG93aW5nIGFyZ3VtZW50czpcbiAgICAjICAgKiBtb2RlbCAtIFRoZSBza2V0Y2ggYmVpbmcgcmVwb3J0ZWQgb25cbiAgICAjICAgKiBvcHRpb25zXG4gICAgIyAgICAgLSAucGFyZW50IC0gdGhlIHBhcmVudCByZXBvcnQgdmlld1xuICAgICMgICAgICAgIGNhbGwgQG9wdGlvbnMucGFyZW50LmRlc3Ryb3koKSB0byBjbG9zZSB0aGUgd2hvbGUgcmVwb3J0IHdpbmRvd1xuICAgIEBhcHAgPSB3aW5kb3cuYXBwXG4gICAgXy5leHRlbmQgQCwgQG9wdGlvbnNcbiAgICBAcmVwb3J0UmVzdWx0cyA9IG5ldyBSZXBvcnRSZXN1bHRzKEBtb2RlbCwgQGRlcGVuZGVuY2llcylcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAnZXJyb3InLCBAcmVwb3J0RXJyb3JcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAnam9icycsIEByZW5kZXJKb2JEZXRhaWxzXG4gICAgQGxpc3RlblRvT25jZSBAcmVwb3J0UmVzdWx0cywgJ2pvYnMnLCBAcmVwb3J0Sm9ic1xuICAgIEBsaXN0ZW5UbyBAcmVwb3J0UmVzdWx0cywgJ2ZpbmlzaGVkJywgXy5iaW5kIEByZW5kZXIsIEBcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAncmVxdWVzdCcsIEByZXBvcnRSZXF1ZXN0ZWRcblxuICByZW5kZXI6ICgpIC0+XG4gICAgdGhyb3cgJ3JlbmRlciBtZXRob2QgbXVzdCBiZSBvdmVyaWRkZW4nXG5cbiAgc2hvdzogKCkgLT5cbiAgICBAJGVsLnNob3coKVxuICAgIEB2aXNpYmxlID0gdHJ1ZVxuICAgIGlmIEBkZXBlbmRlbmNpZXM/Lmxlbmd0aCBhbmQgIUByZXBvcnRSZXN1bHRzLm1vZGVscy5sZW5ndGhcbiAgICAgIEByZXBvcnRSZXN1bHRzLnBvbGwoKVxuICAgIGVsc2UgaWYgIUBkZXBlbmRlbmNpZXM/Lmxlbmd0aFxuICAgICAgQHJlbmRlcigpXG4gICAgICBAJCgnW2RhdGEtYXR0cmlidXRlLXR5cGU9VXJsRmllbGRdIC52YWx1ZSwgW2RhdGEtYXR0cmlidXRlLXR5cGU9VXBsb2FkRmllbGRdIC52YWx1ZScpLmVhY2ggKCkgLT5cbiAgICAgICAgdGV4dCA9ICQoQCkudGV4dCgpXG4gICAgICAgIGh0bWwgPSBbXVxuICAgICAgICBmb3IgdXJsIGluIHRleHQuc3BsaXQoJywnKVxuICAgICAgICAgIGlmIHVybC5sZW5ndGhcbiAgICAgICAgICAgIG5hbWUgPSBfLmxhc3QodXJsLnNwbGl0KCcvJykpXG4gICAgICAgICAgICBodG1sLnB1c2ggXCJcIlwiPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPiN7bmFtZX08L2E+XCJcIlwiXG4gICAgICAgICQoQCkuaHRtbCBodG1sLmpvaW4oJywgJylcblxuXG4gIGhpZGU6ICgpIC0+XG4gICAgQCRlbC5oaWRlKClcbiAgICBAdmlzaWJsZSA9IGZhbHNlXG5cbiAgcmVtb3ZlOiAoKSA9PlxuICAgIHdpbmRvdy5jbGVhckludGVydmFsIEBldGFJbnRlcnZhbFxuICAgIEBzdG9wTGlzdGVuaW5nKClcbiAgICBzdXBlcigpXG5cbiAgcmVwb3J0UmVxdWVzdGVkOiAoKSA9PlxuICAgIEAkZWwuaHRtbCB0ZW1wbGF0ZXMucmVwb3J0TG9hZGluZy5yZW5kZXIoe30pXG5cbiAgcmVwb3J0RXJyb3I6IChtc2csIGNhbmNlbGxlZFJlcXVlc3QpID0+XG4gICAgdW5sZXNzIGNhbmNlbGxlZFJlcXVlc3RcbiAgICAgIGlmIG1zZyBpcyAnSk9CX0VSUk9SJ1xuICAgICAgICBAc2hvd0Vycm9yICdFcnJvciB3aXRoIHNwZWNpZmljIGpvYidcbiAgICAgIGVsc2VcbiAgICAgICAgQHNob3dFcnJvciBtc2dcblxuICBzaG93RXJyb3I6IChtc2cpID0+XG4gICAgQCQoJy5wcm9ncmVzcycpLnJlbW92ZSgpXG4gICAgQCQoJ3AuZXJyb3InKS5yZW1vdmUoKVxuICAgIEAkKCdoNCcpLnRleHQoXCJBbiBFcnJvciBPY2N1cnJlZFwiKS5hZnRlciBcIlwiXCJcbiAgICAgIDxwIGNsYXNzPVwiZXJyb3JcIiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO1wiPiN7bXNnfTwvcD5cbiAgICBcIlwiXCJcblxuICByZXBvcnRKb2JzOiAoKSA9PlxuICAgIHVubGVzcyBAbWF4RXRhXG4gICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS53aWR0aCgnMTAwJScpXG4gICAgQCQoJ2g0JykudGV4dCBcIkFuYWx5emluZyBEZXNpZ25zXCJcblxuICBzdGFydEV0YUNvdW50ZG93bjogKCkgPT5cbiAgICBpZiBAbWF4RXRhXG4gICAgICBfLmRlbGF5ICgpID0+XG4gICAgICAgIEByZXBvcnRSZXN1bHRzLnBvbGwoKVxuICAgICAgLCAoQG1heEV0YSArIDEpICogMTAwMFxuICAgICAgXy5kZWxheSAoKSA9PlxuICAgICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS5jc3MgJ3RyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uJywgJ2xpbmVhcidcbiAgICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykuY3NzICd0cmFuc2l0aW9uLWR1cmF0aW9uJywgXCIje0BtYXhFdGEgKyAxfXNcIlxuICAgICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS53aWR0aCgnMTAwJScpXG4gICAgICAsIDUwMFxuXG4gIHJlbmRlckpvYkRldGFpbHM6ICgpID0+XG4gICAgbWF4RXRhID0gbnVsbFxuICAgIGZvciBqb2IgaW4gQHJlcG9ydFJlc3VsdHMubW9kZWxzXG4gICAgICBpZiBqb2IuZ2V0KCdldGFTZWNvbmRzJylcbiAgICAgICAgaWYgIW1heEV0YSBvciBqb2IuZ2V0KCdldGFTZWNvbmRzJykgPiBtYXhFdGFcbiAgICAgICAgICBtYXhFdGEgPSBqb2IuZ2V0KCdldGFTZWNvbmRzJylcbiAgICBpZiBtYXhFdGFcbiAgICAgIEBtYXhFdGEgPSBtYXhFdGFcbiAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLndpZHRoKCc1JScpXG4gICAgICBAc3RhcnRFdGFDb3VudGRvd24oKVxuXG4gICAgQCQoJ1tyZWw9ZGV0YWlsc10nKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKVxuICAgIEAkKCdbcmVsPWRldGFpbHNdJykuY2xpY2sgKGUpID0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIEAkKCdbcmVsPWRldGFpbHNdJykuaGlkZSgpXG4gICAgICBAJCgnLmRldGFpbHMnKS5zaG93KClcbiAgICBmb3Igam9iIGluIEByZXBvcnRSZXN1bHRzLm1vZGVsc1xuICAgICAgaXRlbSA9IG5ldyBKb2JJdGVtKGpvYilcbiAgICAgIGl0ZW0ucmVuZGVyKClcbiAgICAgIEAkKCcuZGV0YWlscycpLmFwcGVuZCBpdGVtLmVsXG5cbiAgZ2V0UmVzdWx0OiAoaWQpIC0+XG4gICAgcmVzdWx0cyA9IEBnZXRSZXN1bHRzKClcbiAgICByZXN1bHQgPSBfLmZpbmQgcmVzdWx0cywgKHIpIC0+IHIucGFyYW1OYW1lIGlzIGlkXG4gICAgdW5sZXNzIHJlc3VsdD9cbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gcmVzdWx0IHdpdGggaWQgJyArIGlkKVxuICAgIHJlc3VsdC52YWx1ZVxuXG4gIGdldEZpcnN0UmVzdWx0OiAocGFyYW0sIGlkKSAtPlxuICAgIHJlc3VsdCA9IEBnZXRSZXN1bHQocGFyYW0pXG4gICAgdHJ5XG4gICAgICByZXR1cm4gcmVzdWx0WzBdLmZlYXR1cmVzWzBdLmF0dHJpYnV0ZXNbaWRdXG4gICAgY2F0Y2ggZVxuICAgICAgdGhyb3cgXCJFcnJvciBmaW5kaW5nICN7cGFyYW19OiN7aWR9IGluIGdwIHJlc3VsdHNcIlxuXG4gIGdldFJlc3VsdHM6ICgpIC0+XG4gICAgcmVzdWx0cyA9IEByZXBvcnRSZXN1bHRzLm1hcCgocmVzdWx0KSAtPiByZXN1bHQuZ2V0KCdyZXN1bHQnKS5yZXN1bHRzKVxuICAgIHVubGVzcyByZXN1bHRzPy5sZW5ndGhcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZ3AgcmVzdWx0cycpXG4gICAgXy5maWx0ZXIgcmVzdWx0cywgKHJlc3VsdCkgLT5cbiAgICAgIHJlc3VsdC5wYXJhbU5hbWUgbm90IGluIFsnUmVzdWx0Q29kZScsICdSZXN1bHRNc2cnXVxuXG4gIHJlY29yZFNldDogKGRlcGVuZGVuY3ksIHBhcmFtTmFtZSwgc2tldGNoQ2xhc3NJZD1mYWxzZSkgLT5cbiAgICB1bmxlc3MgZGVwZW5kZW5jeSBpbiBAZGVwZW5kZW5jaWVzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJVbmtub3duIGRlcGVuZGVuY3kgI3tkZXBlbmRlbmN5fVwiXG4gICAgZGVwID0gQHJlcG9ydFJlc3VsdHMuZmluZCAocikgLT4gci5nZXQoJ3NlcnZpY2VOYW1lJykgaXMgZGVwZW5kZW5jeVxuICAgIHVubGVzcyBkZXBcbiAgICAgIGNvbnNvbGUubG9nIEByZXBvcnRSZXN1bHRzLm1vZGVsc1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ291bGQgbm90IGZpbmQgcmVzdWx0cyBmb3IgI3tkZXBlbmRlbmN5fS5cIlxuICAgIHBhcmFtID0gXy5maW5kIGRlcC5nZXQoJ3Jlc3VsdCcpLnJlc3VsdHMsIChwYXJhbSkgLT5cbiAgICAgIHBhcmFtLnBhcmFtTmFtZSBpcyBwYXJhbU5hbWVcbiAgICB1bmxlc3MgcGFyYW1cbiAgICAgIGNvbnNvbGUubG9nIGRlcC5nZXQoJ2RhdGEnKS5yZXN1bHRzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDb3VsZCBub3QgZmluZCBwYXJhbSAje3BhcmFtTmFtZX0gaW4gI3tkZXBlbmRlbmN5fVwiXG4gICAgbmV3IFJlY29yZFNldChwYXJhbSwgQCwgc2tldGNoQ2xhc3NJZClcblxuICBlbmFibGVUYWJsZVBhZ2luZzogKCkgLT5cbiAgICBAJCgnW2RhdGEtcGFnaW5nXScpLmVhY2ggKCkgLT5cbiAgICAgICR0YWJsZSA9ICQoQClcbiAgICAgIHBhZ2VTaXplID0gJHRhYmxlLmRhdGEoJ3BhZ2luZycpXG4gICAgICByb3dzID0gJHRhYmxlLmZpbmQoJ3Rib2R5IHRyJykubGVuZ3RoXG4gICAgICBwYWdlcyA9IE1hdGguY2VpbChyb3dzIC8gcGFnZVNpemUpXG4gICAgICBpZiBwYWdlcyA+IDFcbiAgICAgICAgJHRhYmxlLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgICA8dGZvb3Q+XG4gICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgIDx0ZCBjb2xzcGFuPVwiI3skdGFibGUuZmluZCgndGhlYWQgdGgnKS5sZW5ndGh9XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBhZ2luYXRpb25cIj5cbiAgICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjXCI+UHJldjwvYT48L2xpPlxuICAgICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgPC90Zm9vdD5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIHVsID0gJHRhYmxlLmZpbmQoJ3Rmb290IHVsJylcbiAgICAgICAgZm9yIGkgaW4gXy5yYW5nZSgxLCBwYWdlcyArIDEpXG4gICAgICAgICAgdWwuYXBwZW5kIFwiXCJcIlxuICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjXCI+I3tpfTwvYT48L2xpPlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICB1bC5hcHBlbmQgXCJcIlwiXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XCIjXCI+TmV4dDwvYT48L2xpPlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgJHRhYmxlLmZpbmQoJ2xpIGEnKS5jbGljayAoZSkgLT5cbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAkYSA9ICQodGhpcylcbiAgICAgICAgICB0ZXh0ID0gJGEudGV4dCgpXG4gICAgICAgICAgaWYgdGV4dCBpcyAnTmV4dCdcbiAgICAgICAgICAgIGEgPSAkYS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuYWN0aXZlJykubmV4dCgpLmZpbmQoJ2EnKVxuICAgICAgICAgICAgdW5sZXNzIGEudGV4dCgpIGlzICdOZXh0J1xuICAgICAgICAgICAgICBhLmNsaWNrKClcbiAgICAgICAgICBlbHNlIGlmIHRleHQgaXMgJ1ByZXYnXG4gICAgICAgICAgICBhID0gJGEucGFyZW50KCkucGFyZW50KCkuZmluZCgnLmFjdGl2ZScpLnByZXYoKS5maW5kKCdhJylcbiAgICAgICAgICAgIHVubGVzcyBhLnRleHQoKSBpcyAnUHJldidcbiAgICAgICAgICAgICAgYS5jbGljaygpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgJGEucGFyZW50KCkucGFyZW50KCkuZmluZCgnLmFjdGl2ZScpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkYS5wYXJlbnQoKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgbiA9IHBhcnNlSW50KHRleHQpXG4gICAgICAgICAgICAkdGFibGUuZmluZCgndGJvZHkgdHInKS5oaWRlKClcbiAgICAgICAgICAgIG9mZnNldCA9IHBhZ2VTaXplICogKG4gLSAxKVxuICAgICAgICAgICAgJHRhYmxlLmZpbmQoXCJ0Ym9keSB0clwiKS5zbGljZShvZmZzZXQsIG4qcGFnZVNpemUpLnNob3coKVxuICAgICAgICAkKCR0YWJsZS5maW5kKCdsaSBhJylbMV0pLmNsaWNrKClcblxuICAgICAgaWYgbm9Sb3dzTWVzc2FnZSA9ICR0YWJsZS5kYXRhKCduby1yb3dzJylcbiAgICAgICAgaWYgcm93cyBpcyAwXG4gICAgICAgICAgcGFyZW50ID0gJHRhYmxlLnBhcmVudCgpXG4gICAgICAgICAgJHRhYmxlLnJlbW92ZSgpXG4gICAgICAgICAgcGFyZW50LnJlbW92ZUNsYXNzICd0YWJsZUNvbnRhaW5lcidcbiAgICAgICAgICBwYXJlbnQuYXBwZW5kIFwiPHA+I3tub1Jvd3NNZXNzYWdlfTwvcD5cIlxuXG4gIGVuYWJsZUxheWVyVG9nZ2xlcnM6ICgpIC0+XG4gICAgZW5hYmxlTGF5ZXJUb2dnbGVycyhAJGVsKVxuXG4gIGdldENoaWxkcmVuOiAoc2tldGNoQ2xhc3NJZCkgLT5cbiAgICBfLmZpbHRlciBAY2hpbGRyZW4sIChjaGlsZCkgLT4gY2hpbGQuZ2V0U2tldGNoQ2xhc3MoKS5pZCBpcyBza2V0Y2hDbGFzc0lkXG5cblxubW9kdWxlLmV4cG9ydHMgPSBSZXBvcnRUYWJcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgXG4gIHJvdW5kOiAobnVtYmVyLCBkZWNpbWFsUGxhY2VzKSAtPlxuICAgIHVubGVzcyBfLmlzTnVtYmVyIG51bWJlclxuICAgICAgbnVtYmVyID0gcGFyc2VGbG9hdChudW1iZXIpXG4gICAgbXVsdGlwbGllciA9IE1hdGgucG93IDEwLCBkZWNpbWFsUGxhY2VzXG4gICAgTWF0aC5yb3VuZChudW1iZXIgKiBtdWx0aXBsaWVyKSAvIG11bHRpcGxpZXIiLCJ0aGlzW1wiVGVtcGxhdGVzXCJdID0gdGhpc1tcIlRlbXBsYXRlc1wiXSB8fCB7fTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvYXR0cmlidXRlcy9hdHRyaWJ1dGVJdGVtXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjx0ciBkYXRhLWF0dHJpYnV0ZS1pZD1cXFwiXCIpO18uYihfLnYoXy5mKFwiaWRcIixjLHAsMCkpKTtfLmIoXCJcXFwiIGRhdGEtYXR0cmlidXRlLWV4cG9ydGlkPVxcXCJcIik7Xy5iKF8udihfLmYoXCJleHBvcnRpZFwiLGMscCwwKSkpO18uYihcIlxcXCIgZGF0YS1hdHRyaWJ1dGUtdHlwZT1cXFwiXCIpO18uYihfLnYoXy5mKFwidHlwZVwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8dGQgY2xhc3M9XFxcIm5hbWVcXFwiPlwiKTtfLmIoXy52KF8uZihcIm5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHRkIGNsYXNzPVxcXCJ2YWx1ZVxcXCI+XCIpO18uYihfLnYoXy5mKFwiZm9ybWF0dGVkVmFsdWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvdHI+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvYXR0cmlidXRlcy9hdHRyaWJ1dGVzVGFibGVcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPHRhYmxlIGNsYXNzPVxcXCJhdHRyaWJ1dGVzXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiYXR0cmlidXRlc1wiLGMscCwxKSxjLHAsMCw0NCw4MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKF8ucnAoXCJhdHRyaWJ1dGVzL2F0dHJpYnV0ZUl0ZW1cIixjLHAsXCIgICAgXCIpKTt9KTtjLnBvcCgpO31fLmIoXCI8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wibm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL2dlbmVyaWNBdHRyaWJ1dGVzXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO2lmKF8ucyhfLmQoXCJza2V0Y2hDbGFzcy5kZWxldGVkXCIsYyxwLDEpLGMscCwwLDI0LDI3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtd2FyblxcXCIgc3R5bGU9XFxcIm1hcmdpbi1ib3R0b206MTBweDtcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgVGhpcyBza2V0Y2ggd2FzIGNyZWF0ZWQgdXNpbmcgdGhlIFxcXCJcIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiB0ZW1wbGF0ZSwgd2hpY2ggaXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIG5vIGxvbmdlciBhdmFpbGFibGUuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIGNvcHkgdGhpcyBza2V0Y2ggb3IgbWFrZSBuZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIHNrZXRjaGVzIG9mIHRoaXMgdHlwZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCIgQXR0cmlidXRlczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKF8ucnAoXCJhdHRyaWJ1dGVzL2F0dHJpYnV0ZXNUYWJsZVwiLGMscCxcIiAgICBcIikpO18uYihcIiAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9yZXBvcnRMb2FkaW5nXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydExvYWRpbmdcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPCEtLSA8ZGl2IGNsYXNzPVxcXCJzcGlubmVyXFxcIj4zPC9kaXY+IC0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PlJlcXVlc3RpbmcgUmVwb3J0IGZyb20gU2VydmVyPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInByb2dyZXNzIHByb2dyZXNzLXN0cmlwZWQgYWN0aXZlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwiYmFyXFxcIiBzdHlsZT1cXFwid2lkdGg6IDEwMCU7XFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGEgaHJlZj1cXFwiI1xcXCIgcmVsPVxcXCJkZXRhaWxzXFxcIj5kZXRhaWxzPC9hPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJkZXRhaWxzXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcblxuaWYodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHRoaXNbXCJUZW1wbGF0ZXNcIl07XG59IiwiUmVwb3J0VGFiID0gcmVxdWlyZSAncmVwb3J0VGFiJ1xudGVtcGxhdGVzID0gcmVxdWlyZSAnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxuX3BhcnRpYWxzID0gcmVxdWlyZSAnLi4vbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cbmlkcyA9IHJlcXVpcmUgJy4vaWRzLmNvZmZlZSdcbmZvciBrZXksIHZhbHVlIG9mIGlkc1xuICB3aW5kb3dba2V5XSA9IHZhbHVlXG5cblxuY2xhc3MgRW52aXJvbm1lbnRUYWIgZXh0ZW5kcyBSZXBvcnRUYWJcbiAgIyB0aGlzIGlzIHRoZSBuYW1lIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIFRhYlxuICBuYW1lOiAnSGFiaXRhdHMnXG4gIGNsYXNzTmFtZTogJ2Vudmlyb25tZW50J1xuICB0aW1lb3V0OiAxMjAwMDBcbiAgdGVtcGxhdGU6IHRlbXBsYXRlcy5lbnZpcm9ubWVudFxuICBkZXBlbmRlbmNpZXM6IFtcbiAgICAnSGFiaXRhdHNPdmVydmlldydcbiAgICAnQWRqYWNlbnRUZXJyZXN0cmlhbCdcbiAgICAnTmV3SGFiUmVwc1Rvb2xib3gnXG4gIF1cblxuICByZW5kZXI6ICgpIC0+XG5cbiAgICAjc2hvdyB0YWJsZXMgaW5zdGVhZCBvZiBncmFwaCBmb3IgSUVcbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIGQzSXNQcmVzZW50ID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGQzSXNQcmVzZW50ID0gZmFsc2VcblxuICAgIGlzQ29sbGVjdGlvbiA9IEBtb2RlbC5pc0NvbGxlY3Rpb24oKVxuICAgIHNjaWQgPSBAc2tldGNoQ2xhc3MuaWRcblxuICAgIGlmIHNjaWQgPT0gR0VORVJJQ19JRCBvciBzY2lkID09IEdFTkVSSUNfQ09MTEVDVElPTl9JRFxuICAgICAgaXNHZW5lcmljID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGlzR2VuZXJpYyA9IGZhbHNlXG5cbiAgICBpc01QQSA9IChzY2lkID09IE1QQV9JRCBvciBzY2lkID09IE1QQV9DT0xMRUNUSU9OX0lEIG9yIHNjaWQgPT0gTVBBX0NPTkZJRF9DT0xMRUNUSU9OX0lEKVxuICAgIFxuICAgIGhhYl9zaXplcyA9IEByZWNvcmRTZXQoJ05ld0hhYlJlcHNUb29sYm94JywgJ0hhYlNpemVzJykudG9BcnJheSgpXG5cbiAgICBoYWJzX2luX3NrZXRjaCA9IGhhYl9zaXplcz8ubGVuZ3RoXG4gICAgaGFic19wbHVyYWwgPSBoYWJzX2luX3NrZXRjaCAhPSAxXG5cbiAgICBwcm90ZWN0ZWRfYXJlYXMgPSBAcmVjb3JkU2V0KCdBZGphY2VudFRlcnJlc3RyaWFsJywgJ1B1YmxpY0NvbnNlcnZhdGlvbkxhbmQnKS50b0FycmF5KClcbiAgICBoYXNQcm90ZWN0ZWQgPSBwcm90ZWN0ZWRfYXJlYXM/Lmxlbmd0aCA+IDBcblxuICAgIHFlMl9jb3ZlbmFudHMgPSBAcmVjb3JkU2V0KCdBZGphY2VudFRlcnJlc3RyaWFsJywgJ0NvYXN0YWxQcm90ZWN0aW9uJykudG9BcnJheSgpXG4gICAgaGFzUUUyY292ZW5hbnRzID0gcWUyX2NvdmVuYW50cz8ubGVuZ3RoID4gMFxuXG4gICAgbmFwYWxpc19jb3ZlbmFudHMgPSBAcmVjb3JkU2V0KCdBZGphY2VudFRlcnJlc3RyaWFsJywgJ0FkamFjZW50TGFuZENvdmVyJykudG9BcnJheSgpXG4gICAgaGFzTmFwYWxpc0NvdmVuYW50cyA9IG5hcGFsaXNfY292ZW5hbnRzPy5sZW5ndGggPiAwXG5cbiAgICBoYXNDb3ZlbmFudHMgPSAoaGFzUUUyY292ZW5hbnRzIG9yIGhhc05hcGFsaXNDb3ZlbmFudHMpXG5cbiAgICBpZiBpc0dlbmVyaWMgb3IgKCFpc0NvbGxlY3Rpb24gYW5kIGlzTVBBKVxuICAgICAgc2hvd0FkamFjZW50ID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIHNob3dBZGphY2VudCA9IGZhbHNlXG4gICAgXG5cbiAgICBSRVBfTkFNRSA9IFwiUGF0Y2ggU2l6ZSAoVHlwZS0xKVwiXG4gICAgaXNDb25maWQgPSBmYWxzZVxuICAgIGhhYml0YXRzX3JlcHJlc2VudGVkID0gQHJlY29yZFNldCgnTmV3SGFiUmVwc1Rvb2xib3gnLCAnUmVwcmVzZW50ZWRIYWJzJykudG9BcnJheSgpXG5cbiAgICBAcm91bmREYXRhIGhhYml0YXRzX3JlcHJlc2VudGVkXG4gICAgbm9SZXNlcnZlVHlwZXMgPSBAaGFzTm9SZXNlcnZlVHlwZXMgQG1vZGVsLmdldENoaWxkcmVuKClcbiAgICBcbiAgICBhbGxfaGFicyA9IEBwcm9jZXNzSGFiaXRhdHMoaGFiaXRhdHNfcmVwcmVzZW50ZWQsIG5vUmVzZXJ2ZVR5cGVzKVxuIFxuICAgIGNvYXN0YWxfaGFiX3R5cGVzID0gYWxsX2hhYnNbMF1cbiAgICBoYXNDb2FzdGFsSGFiVHlwZXMgPSBjb2FzdGFsX2hhYl90eXBlcz8ubGVuZ3RoID4gMFxuICAgIGVzdHVhcmluZV9oYWJfdHlwZXMgPSBhbGxfaGFic1sxXVxuICAgIGhhc0VzdHVhcmluZUhhYlR5cGVzID0gZXN0dWFyaW5lX2hhYl90eXBlcz8ubGVuZ3RoID4gMFxuICAgIHNpZ19oYWJzID0gYWxsX2hhYnNbMl1cbiAgICBoYXNTaWdIYWJzID0gc2lnX2hhYnM/Lmxlbmd0aCA+IDBcbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuIFxuICAgIGNvbnRleHQgPVxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcbiAgICAgIGlzR2VuZXJpYzogaXNHZW5lcmljXG4gICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuICAgICAgaXNNUEE6IGlzTVBBXG5cbiAgICAgIGNvYXN0YWxfaGFiX3R5cGVzOiBjb2FzdGFsX2hhYl90eXBlc1xuICAgICAgaGFzQ29hc3RhbEhhYlR5cGVzOiBoYXNDb2FzdGFsSGFiVHlwZXNcbiAgICAgIGVzdHVhcmluZV9oYWJfdHlwZXM6IGVzdHVhcmluZV9oYWJfdHlwZXNcbiAgICAgIGhhc0VzdHVhcmluZUhhYlR5cGVzOiBoYXNFc3R1YXJpbmVIYWJUeXBlc1xuXG4gICAgICBzaWdfaGFiczogc2lnX2hhYnNcbiAgICAgIGhhc1NpZ0hhYnM6IGhhc1NpZ0hhYnNcblxuICAgICAgaGFic19wbHVyYWw6IGhhYnNfcGx1cmFsXG4gICAgICBoYWJpdGF0c19yZXByZXNlbnRlZDogaGFiaXRhdHNfcmVwcmVzZW50ZWRcblxuICAgICAgcHJvdGVjdGVkX2FyZWFzOiBwcm90ZWN0ZWRfYXJlYXNcbiAgICAgIGhhc1Byb3RlY3RlZDogaGFzUHJvdGVjdGVkXG5cbiAgICAgIHFlMl9jb3ZlbmFudHM6IHFlMl9jb3ZlbmFudHNcbiAgICAgIGhhc1FFMmNvdmVuYW50czogaGFzUUUyY292ZW5hbnRzXG5cbiAgICAgIG5hcGFsaXNfY292ZW5hbnRzOiBuYXBhbGlzX2NvdmVuYW50c1xuICAgICAgaGFzTmFwYWxpc0NvdmVuYW50czogaGFzTmFwYWxpc0NvdmVuYW50c1xuXG4gICAgICBoYXNDb3ZlbmFudHM6IGhhc0NvdmVuYW50c1xuICAgICAgc2hvd0FkamFjZW50OiBzaG93QWRqYWNlbnRcbiAgICAgIFxuICAgICAgI29ubHkgbmVlZGVkIHdoaWxlIHdlIGhhdmUgSW5jbHVkZWQvUGF0Y2ggU2l6ZSBiZWhhdmluZyBkaWZmZXJlbnRseSBmb3IgTVBBIChjb25maWQpIGFuZCBNUEFcbiAgICAgIFJFUF9OQU1FOiBSRVBfTkFNRVxuICAgICAgaXNDb25maWQ6IGlzQ29uZmlkXG5cbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcbiAgICBAZW5hYmxlTGF5ZXJUb2dnbGVycygpXG4gICAgQHJvdW5kRGF0YShoYWJfc2l6ZXMpXG4gICAgQHNldHVwQ29hc3RhbEhhYml0YXRTb3J0aW5nKGNvYXN0YWxfaGFiX3R5cGVzLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEBzZXR1cEVzdHVhcmluZUhhYml0YXRTb3J0aW5nKGVzdHVhcmluZV9oYWJfdHlwZXMsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQHNldHVwU2lnSGFiaXRhdFNvcnRpbmcoc2lnX2hhYnMsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG5cbiAgICBAZW5hYmxlVGFibGVQYWdpbmcoKVxuICAgIFxuICBwcm9jZXNzSGFiaXRhdHM6IChoYWJzX3JlcHJlc2VudGVkLCBub1Jlc2VydmVzKSA9PlxuICAgIGNvYXN0YWxfaGFiX3R5cGVzID0gW11cbiAgICBlc3R1YXJpbmVfaGFiX3R5cGVzID0gW11cbiAgICBjcml0aWNhbF9oYWJpdGF0cyA9IFtdXG4gICAgZm9yIGhhYiBpbiBoYWJzX3JlcHJlc2VudGVkXG4gICAgICAjaWYgdGhlcmUgYXJlIG9ubHkgdHlwZSAyIGFuZCBvdGhlciByZXNlcnZlcywgc2hvdyBwYXRjaCBzaXplIGFzIE5BIGlmIGl0cyAwXG4gICAgICBpZiBub1Jlc2VydmVzXG4gICAgICAgIHRyeVxuICAgICAgICAgIGlmIE51bWJlci5wYXJzZUZsb2F0KGhhYi5SRVBSRVNFTlQpID09IDAuMFxuICAgICAgICAgICAgaGFiLlJFUFJFU0VOVD1cIk5BXCJcbiAgICAgICAgY2F0Y2ggRXJyb3JcblxuICAgICAgaWYgaGFiLkhBQl9UWVBFID09IFwiQnJ5b3pvYW4gcmVlZlwiIG9yIGhhYi5IQUJfVFlQRSA9PSBcIk1hY3JvY3lzdGlzIGJlZFwiIG9yIGhhYi5IQUJfVFlQRSA9PSBcIlNlYWdyYXNzIGJlZFwiXG4gICAgICAgIGNyaXRpY2FsX2hhYml0YXRzLnB1c2goaGFiKVxuICAgICAgZWxzZVxuXG4gICAgICAgIGlmIGhhYi5IQUJfVFlQRS5zdGFydHNXaXRoKFwiRXN0dWFyaW5lXCIpIG9yIGhhYi5IQUJfVFlQRSA9PSBcIk11ZCBGbGF0XCJcbiAgICAgICAgICBlc3R1YXJpbmVfaGFiX3R5cGVzLnB1c2goaGFiKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgI3NraXBwaW5nIHRoaXMgb25lIGJlY2F1c2UgaXRzIHNvIHNtYWxsXG4gICAgICAgICAgaWYgaGFiLkhBQl9UWVBFICE9IFwiRGVlcCBXYXRlciBHcmF2ZWxcIlxuICAgICAgICAgICAgY29hc3RhbF9oYWJfdHlwZXMucHVzaChoYWIpXG5cbiAgICBuYV9oYWJzID0gW1wiQnJhY2hpb3BvZCBiZWRzXCIsIFwiQ2FsY2FyZW91cyB0dWJlIHdvcm0gdGhpY2tldHNcIiwgXCJDaGFldG9wdGVyaWRhZSB3b3JtIGZpZWxkc1wiLFxuICAgICAgICAgICAgICAgXCJSaG9kb2xpdGggYmVkc1wiLCBcIlNlYSBwZW4gZmllbGRzXCIsIFwiU3BvbmdlIGdhcmRlbnNcIiwgXCJTdG9ueSBjb3JhbCB0aGlja2V0c1wiXVxuICAgIGZvciBuaCBpbiBuYV9oYWJzXG4gICAgICBuZXdfaGFiID0ge1wiSEFCX1RZUEVcIjogbmgsIFwiU0laRV9TUUtNXCI6XCJOQVwiLCBcIlBFUkNcIjpcIk5BXCIsIFwiUkVQUkVTRU5UXCI6XCJOQVwiLCBcIlJFUExJQ1wiOlwiTkFcIiwgXCJDT05OXCI6XCJOQVwifVxuICAgICAgY3JpdGljYWxfaGFiaXRhdHMucHVzaChuZXdfaGFiKVxuICAgIHJldHVybiBbY29hc3RhbF9oYWJfdHlwZXMsIGVzdHVhcmluZV9oYWJfdHlwZXMsIGNyaXRpY2FsX2hhYml0YXRzXVxuXG4gIHJvdW5kRGF0YTogKGhhYml0YXRzKSA9PiAgXG4gICAgZm9yIGhhYiBpbiBoYWJpdGF0c1xuICAgICAgaGFiLlNJWkVfU1FLTSA9IE51bWJlcihoYWIuU0laRV9TUUtNKS50b0ZpeGVkKDEpXG4gICAgICBoYWIuUEVSQyA9IE51bWJlcihoYWIuUEVSQykudG9GaXhlZCgxKVxuXG4gIHNldHVwU2lnSGFiaXRhdFNvcnRpbmc6IChoYWJpdGF0cywgaXNNUEEsIGlzQ29sbGVjdGlvbikgPT5cbiAgICB0Ym9keU5hbWUgPSAnLnNpZ19oYWJfdmFsdWVzJ1xuICAgIHRhYmxlTmFtZSA9ICcuc2lnX2hhYl90YWJsZSdcbiAgICBAJCgnLnNpZ19oYWJfdHlwZScpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdzaWdfaGFiX3R5cGUnLCB0YWJsZU5hbWUsIGhhYml0YXRzLCBldmVudCwgXCJIQUJfVFlQRVwiLCB0Ym9keU5hbWUsIGZhbHNlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBAJCgnLnNpZ19oYWJfbmV3X2FyZWEnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnc2lnX2hhYl9uZXdfYXJlYScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlNJWkVfU1FLTVwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuc2lnX2hhYl9uZXdfcGVyYycpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdzaWdfaGFiX25ld19wZXJjJyx0YWJsZU5hbWUsIGhhYml0YXRzLCBldmVudCwgXCJQRVJDXCIsIHRib2R5TmFtZSwgdHJ1ZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgXG4gICAgQCQoJy5zaWdfaGFiX3JlcHJlc2VudCcpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdzaWdfaGFiX3JlcHJlc2VudCcsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiUkVQUkVTRU5UXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuc2lnX2hhYl9yZXBsaWNhdGUnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnc2lnX2hhYl9yZXBsaWNhdGUnLHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlJFUExJQ1wiLCB0Ym9keU5hbWUsIGZhbHNlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBAJCgnLnNpZ19oYWJfY29ubmVjdGVkJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ3NpZ19oYWJfY29ubmVjdGVkJyx0YWJsZU5hbWUsIGhhYml0YXRzLCBldmVudCwgXCJDT05OXCIsIHRib2R5TmFtZSwgdHJ1ZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgXG4gICAgQHJlbmRlclNvcnQoJ3NpZ19oYWJfbmV3X2FyZWEnLCB0YWJsZU5hbWUsIGhhYml0YXRzLCB1bmRlZmluZWQsIFwiU0laRV9TUUtNXCIsIHRib2R5TmFtZSwgdHJ1ZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG5cbiAgc2V0dXBDb2FzdGFsSGFiaXRhdFNvcnRpbmc6IChoYWJpdGF0cywgaXNNUEEsIGlzQ29sbGVjdGlvbikgPT5cbiAgICB0Ym9keU5hbWUgPSAnLmNvYXN0YWxfaGFiX3ZhbHVlcydcbiAgICB0YWJsZU5hbWUgPSAnLmNvYXN0YWxfaGFiX3RhYmxlJ1xuICAgIEAkKCcuY29hc3RhbF9oYWJfdHlwZScpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdjb2FzdGFsX2hhYl90eXBlJywgdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiSEFCX1RZUEVcIiwgdGJvZHlOYW1lLCBmYWxzZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQCQoJy5jb2FzdGFsX2hhYl9uZXdfYXJlYScpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdjb2FzdGFsX2hhYl9uZXdfYXJlYScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlNJWkVfU1FLTVwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuY29hc3RhbF9oYWJfbmV3X3BlcmMnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnY29hc3RhbF9oYWJfbmV3X3BlcmMnLHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlBFUkNcIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBcbiAgICBAJCgnLmNvYXN0YWxfaGFiX3JlcHJlc2VudCcpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdjb2FzdGFsX2hhYl9yZXByZXNlbnQnLHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlJFUFJFU0VOVFwiLCB0Ym9keU5hbWUsIGZhbHNlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBAJCgnLmNvYXN0YWxfaGFiX3JlcGxpY2F0ZScpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdjb2FzdGFsX2hhYl9yZXBsaWNhdGUnLHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlJFUExJQ1wiLCB0Ym9keU5hbWUsIGZhbHNlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBAJCgnLmNvYXN0YWxfaGFiX2Nvbm5lY3RlZCcpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdjb2FzdGFsX2hhYl9jb25uZWN0ZWQnLHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIkNPTk5cIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBAcmVuZGVyU29ydCgnY29hc3RhbF9oYWJfbmV3X2FyZWEnLCB0YWJsZU5hbWUsIGhhYml0YXRzLCB1bmRlZmluZWQsIFwiU0laRV9TUUtNXCIsIHRib2R5TmFtZSwgdHJ1ZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG5cbiAgc2V0dXBFc3R1YXJpbmVIYWJpdGF0U29ydGluZzogKGhhYml0YXRzLCBpc01QQSwgaXNDb2xsZWN0aW9uKSA9PlxuICAgIHRib2R5TmFtZSA9ICcuZXN0dWFyaW5lX2hhYl92YWx1ZXMnXG4gICAgdGFibGVOYW1lID0gJy5lc3R1YXJpbmVfaGFiX3RhYmxlJ1xuICAgIEAkKCcuZXN0dWFyaW5lX2hhYl90eXBlJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2VzdHVhcmluZV9oYWJfdHlwZScsIHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIkhBQl9UWVBFXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuZXN0dWFyaW5lX2hhYl9uZXdfYXJlYScpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdlc3R1YXJpbmVfaGFiX25ld19hcmVhJywgdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiU0laRV9TUUtNXCIsIHRib2R5TmFtZSwgdHJ1ZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQCQoJy5lc3R1YXJpbmVfaGFiX25ld19wZXJjJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2VzdHVhcmluZV9oYWJfbmV3X3BlcmMnLHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIlBFUkNcIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBcbiAgICBAJCgnLmVzdHVhcmluZV9oYWJfcmVwcmVzZW50JykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2VzdHVhcmluZV9oYWJfcmVwcmVzZW50Jyx0YWJsZU5hbWUsIGhhYml0YXRzLCBldmVudCwgXCJSRVBSRVNFTlRcIiwgdGJvZHlOYW1lLCBmYWxzZSwgQGdldEhhYml0YXRSb3dTdHJpbmcsIGlzTVBBLCBpc0NvbGxlY3Rpb24pXG4gICAgQCQoJy5lc3R1YXJpbmVfaGFiX3JlcGxpY2F0ZScpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdlc3R1YXJpbmVfaGFiX3JlcGxpY2F0ZScsdGFibGVOYW1lLCBoYWJpdGF0cywgZXZlbnQsIFwiUkVQTElDXCIsIHRib2R5TmFtZSwgZmFsc2UsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuICAgIEAkKCcuZXN0dWFyaW5lX2hhYl9jb25uZWN0ZWQnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnZXN0dWFyaW5lX2hhYl9jb25uZWN0ZWQnLHRhYmxlTmFtZSwgaGFiaXRhdHMsIGV2ZW50LCBcIkNPTk5cIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0SGFiaXRhdFJvd1N0cmluZywgaXNNUEEsIGlzQ29sbGVjdGlvbilcbiAgICBAcmVuZGVyU29ydCgnZXN0dWFyaW5laGFiX25ld19hcmVhJywgdGFibGVOYW1lLCBoYWJpdGF0cywgdW5kZWZpbmVkLCBcIlNJWkVfU1FLTVwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRIYWJpdGF0Um93U3RyaW5nLCBpc01QQSwgaXNDb2xsZWN0aW9uKVxuXG5cblxuICAjZG8gdGhlIHNvcnRpbmcgLSBzaG91bGQgYmUgdGFibGUgaW5kZXBlbmRlbnRcbiAgI3NraXAgYW55IHRoYXQgYXJlIGxlc3MgdGhhbiAwLjAwXG4gIHJlbmRlclNvcnQ6IChuYW1lLCB0YWJsZU5hbWUsIHBkYXRhLCBldmVudCwgc29ydEJ5LCB0Ym9keU5hbWUsIGlzRmxvYXQsIGdldFJvd1N0cmluZ1ZhbHVlLCBpc01QQSwgaXNDb2xsZWN0aW9uKSA9PlxuICAgIGlmIGV2ZW50XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cblxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgdGFyZ2V0Q29sdW1uID0gQGdldFNlbGVjdGVkQ29sdW1uKGV2ZW50LCBuYW1lKVxuICAgICAgc29ydFVwID0gQGdldFNvcnREaXIodGFyZ2V0Q29sdW1uKVxuXG4gICAgICBpZiBpc0Zsb2F0XG4gICAgICAgIGRhdGEgPSBfLnNvcnRCeSBwZGF0YSwgKHJvdykgLT4gXG4gICAgICAgICAgICBpZiBpc05hTihyb3dbc29ydEJ5XSlcbiAgICAgICAgICAgICAgdmFsID0gLTEuMFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICB2YWwgPSBwYXJzZUZsb2F0KHJvd1tzb3J0QnldKVxuICAgICAgICAgICAgcmV0dXJuIHZhbFxuICAgICAgZWxzZVxuICAgICAgICBkYXRhID0gXy5zb3J0QnkgcGRhdGEsIChyb3cpIC0+IHJvd1tzb3J0QnldXG5cbiAgICAgICNmbGlwIHNvcnRpbmcgaWYgbmVlZGVkXG4gICAgICBpZiBzb3J0VXBcbiAgICAgICAgZGF0YS5yZXZlcnNlKClcblxuICAgICAgZWwgPSBAJCh0Ym9keU5hbWUpWzBdXG4gICAgICBoYWJfYm9keSA9IGQzLnNlbGVjdChlbClcblxuICAgICAgI3JlbW92ZSBvbGQgcm93c1xuICAgICAgaGFiX2JvZHkuc2VsZWN0QWxsKFwidHIuaGFiX3Jvd3NcIilcbiAgICAgICAgLnJlbW92ZSgpXG5cbiAgICAgICNhZGQgbmV3IHJvd3MgKGFuZCBkYXRhKVxuICAgICAgcm93cyA9IGhhYl9ib2R5LnNlbGVjdEFsbChcInRyXCIpXG4gICAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgICAgLmVudGVyKCkuaW5zZXJ0KFwidHJcIiwgXCI6Zmlyc3QtY2hpbGRcIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImhhYl9yb3dzXCIpXG5cbiAgICAgIGlmIGlzTVBBXG4gICAgICAgIGlmIGlzQ29sbGVjdGlvblxuICAgICAgICAgIGNvbHVtbnMgPSBbXCJIQUJfVFlQRVwiLCBcIlNJWkVfU1FLTVwiLCBcIlBFUkNcIiwgXCJSRVBSRVNFTlRcIiwgXCJSRVBMSUNcIiwgXCJDT05OXCJdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjb2x1bW5zID0gW1wiSEFCX1RZUEVcIiwgXCJTSVpFX1NRS01cIiwgXCJQRVJDXCIsIFwiUkVQUkVTRU5UXCJdXG4gICAgICBlbHNlXG4gICAgICAgIGNvbHVtbnMgPSBbXCJIQUJfVFlQRVwiLCBcIlNJWkVfU1FLTVwiLCBcIlBFUkNcIl1cblxuICAgICAgY2VsbHMgPSByb3dzLnNlbGVjdEFsbChcInRkXCIpXG4gICAgICAgICAgLmRhdGEoKHJvdywgaSkgLT5jb2x1bW5zLm1hcCAoY29sdW1uKSAtPiAoY29sdW1uOiBjb2x1bW4sIHZhbHVlOiByb3dbY29sdW1uXSkpXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoXCJ0ZFwiKS50ZXh0KChkLCBpKSAtPiBcbiAgICAgICAgICBkLnZhbHVlXG4gICAgICAgICkgICAgXG5cbiAgICAgIEBzZXROZXdTb3J0RGlyKHRhcmdldENvbHVtbiwgc29ydFVwKVxuICAgICAgQHNldFNvcnRpbmdDb2xvcihldmVudCwgdGFibGVOYW1lKVxuXG4gICAgICAjZmlyZSB0aGUgZXZlbnQgZm9yIHRoZSBhY3RpdmUgcGFnZSBpZiBwYWdpbmF0aW9uIGlzIHByZXNlbnRcbiAgICAgIEBmaXJlUGFnaW5hdGlvbih0YWJsZU5hbWUpXG4gICAgICBpZiBldmVudFxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXG4gIGdldEZsb2F0OiAodmFsKSA9PlxuICAgIHRyeVxuICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICByZXR1cm4gMC4wXG5cbiAgI3RhYmxlIHJvdyBmb3IgaGFiaXRhdCByZXByZXNlbnRhdGlvblxuICBnZXRIYWJpdGF0Um93U3RyaW5nOiAoZCwgaXNNUEEsIGlzQ29sbGVjdGlvbikgPT5cbiAgICBpZiBkIGlzIHVuZGVmaW5lZFxuICAgICAgcmV0dXJuIFwiXCJcbiAgICByZXByZXNlbnRlZF9zdHIgPSBcIlwiXG4gICAgcmVwbGljYXRlZF9zdHIgPSBcIlwiXG4gICAgY29ubmVjdGVkX3N0ciA9IFwiXCJcbiAgICBpZiBpc01QQVxuICAgICAgcmVwcmVzZW50ZWRfc3RyID0gXCI8dGRcIj4rZC5SRVBSRVNFTlQrXCI8L3RkPlwiXG4gICAgICBpZiBpc0NvbGxlY3Rpb25cbiAgICAgICAgcmVwbGljYXRlZF9zdHIgPSBcIjx0ZD5cIitkLlJFUExJQytcIjwvdGQ+XCJcbiAgICAgICAgY29ubmVjdGVkX3N0ciA9IFwiPHRkPlwiK2QuQ09OTitcIjwvdGQ+XCJcblxuICAgIHJldHVybiBcIjx0ZD5cIitkLkhBQl9UWVBFK1wiPC90ZD5cIitcIjx0ZD5cIitkLlNJWkVfU1FLTStcIjwvdGQ+XCIrXCI8dGQ+XCIrZC5QRVJDK1wiPC90ZD5cIityZXByZXNlbnRlZF9zdHIrcmVwbGljYXRlZF9zdHJcblxuICBzZXRTb3J0aW5nQ29sb3I6IChldmVudCwgdGFibGVOYW1lKSA9PlxuICAgIHNvcnRpbmdDbGFzcyA9IFwic29ydGluZ19jb2xcIlxuICAgIGlmIGV2ZW50XG4gICAgICBwYXJlbnQgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnBhcmVudCgpXG4gICAgICBuZXdUYXJnZXROYW1lID0gZXZlbnQuY3VycmVudFRhcmdldC5jbGFzc05hbWVcbiAgICAgIHRhcmdldFN0ciA9IHRhYmxlTmFtZStcIiB0aC5zb3J0aW5nX2NvbCBhXCIgICBcbiAgICAgIGlmIEAkKHRhcmdldFN0cikgYW5kIEAkKHRhcmdldFN0cilbMF1cbiAgICAgICAgb2xkVGFyZ2V0TmFtZSA9IEAkKHRhcmdldFN0cilbMF0uY2xhc3NOYW1lXG4gICAgICAgIGlmIG5ld1RhcmdldE5hbWUgIT0gb2xkVGFyZ2V0TmFtZVxuICAgICAgICAgICNyZW1vdmUgaXQgZnJvbSBvbGQgXG4gICAgICAgICAgaGVhZGVyTmFtZSA9IHRhYmxlTmFtZStcIiB0aC5zb3J0aW5nX2NvbFwiXG4gICAgICAgICAgQCQoaGVhZGVyTmFtZSkucmVtb3ZlQ2xhc3Moc29ydGluZ0NsYXNzKVxuICAgICAgICAgICNhbmQgYWRkIGl0IHRvIG5ld1xuICAgICAgICAgIHBhcmVudC5hZGRDbGFzcyhzb3J0aW5nQ2xhc3MpXG4gICAgIFxuICBnZXRTb3J0RGlyOiAodGFyZ2V0Q29sdW1uKSA9PlxuICAgICBzb3J0dXAgPSBAJCgnLicrdGFyZ2V0Q29sdW1uKS5oYXNDbGFzcyhcInNvcnRfdXBcIilcbiAgICAgcmV0dXJuIHNvcnR1cFxuXG4gIGdldFNlbGVjdGVkQ29sdW1uOiAoZXZlbnQsIG5hbWUpID0+XG4gICAgaWYgZXZlbnRcbiAgICAgICNnZXQgc29ydCBvcmRlclxuICAgICAgdGFyZ2V0Q29sdW1uID0gZXZlbnQuY3VycmVudFRhcmdldC5jbGFzc05hbWVcblxuICAgICAgbXVsdGlDbGFzc2VzID0gdGFyZ2V0Q29sdW1uLnNwbGl0KCcgJylcbiAgICAgICNwcm90ZWN0ZWRNYW1tYWxzID0gXy5zb3J0QnkgcHJvdGVjdGVkTWFtbWFscywgKHJvdykgLT4gcGFyc2VJbnQocm93LkNvdW50KVxuICAgICAgaGFiQ2xhc3NOYW1lID1fLmZpbmQgbXVsdGlDbGFzc2VzLCAoY2xhc3NuYW1lKSAtPiBcbiAgICAgICAgY2xhc3NuYW1lLmxhc3RJbmRleE9mKCdjb2FzdGFsX2hhYicsMCkgPT0gMCBvciBjbGFzc25hbWUubGFzdEluZGV4T2YoJ2VzdHVhcmluZV9oYWInLDApID09IDBcbiAgICAgIFxuICAgICAgaWYgaGFiQ2xhc3NOYW1lIGlzIHVuZGVmaW5lZFxuICAgICAgICBoYWJDbGFzc05hbWUgPV8uZmluZCBtdWx0aUNsYXNzZXMsIChjbGFzc25hbWUpIC0+IFxuICAgICAgICAgIGNsYXNzbmFtZS5sYXN0SW5kZXhPZignc2lnJywwKSA9PSAwIFxuXG4gICAgICB0YXJnZXRDb2x1bW4gPSBoYWJDbGFzc05hbWVcbiAgICBlbHNlXG4gICAgICAjd2hlbiB0aGVyZSBpcyBubyBldmVudCwgZmlyc3QgdGltZSB0YWJsZSBpcyBmaWxsZWRcbiAgICAgIHRhcmdldENvbHVtbiA9IG5hbWVcblxuICAgIHJldHVybiB0YXJnZXRDb2x1bW5cblxuICBoYXNOb1Jlc2VydmVUeXBlczogKHJlc2VydmVzKSA9PlxuICAgIHRyeVxuICAgICAgdDJfc3RyID0gXCJUeXBlMlwiXG4gICAgICBtcl9zdHIgPSBcIk1SXCJcbiAgICAgIG90aGVyX3N0ciA9IFwiT3RoZXJcIlxuICAgICAgbnVtcmVzZXJ2ZXMgPSAwXG5cbiAgICAgIGZvciByZXMgaW4gcmVzZXJ2ZXNcbiAgICAgICAgYXR0cnMgPSByZXMuZ2V0QXR0cmlidXRlcygpXG4gICAgICAgIGZvciBhdHQgaW4gYXR0cnNcbiAgICAgICAgICBpZiBhdHQuZXhwb3J0aWQgPT0gXCJNQU5BR0VNRU5UXCIgXG4gICAgICAgICAgICByZXNfdHlwZSA9IGF0dC52YWx1ZVxuICAgICAgICAgICAgaWYgcmVzX3R5cGUgPT0gbXJfc3RyIG9yIHJlc190eXBlLmluZGV4T2YobXJfc3RyKSA+PTBcbiAgICAgICAgICAgICAgICBudW1yZXNlcnZlcys9MVxuXG4gICAgICByZXR1cm4gKG51bXJlc2VydmVzID09IDApXG5cbiAgICBjYXRjaCBFcnJvclxuICAgICAgY29uc29sZS5sb2coXCJzb21ldGhpbmcgd2VudCB3cm9uZyBsb29raW5nIGZvciByZXNlcnZlIGF0dHJpYnV0ZS4uLlwiKVxuICAgICAgcmV0dXJuIGZhbHNlICAgIFxuXG4gIHNldE5ld1NvcnREaXI6ICh0YXJnZXRDb2x1bW4sIHNvcnRVcCkgPT5cbiAgICAjYW5kIHN3aXRjaCBpdFxuICAgIGlmIHNvcnRVcFxuICAgICAgQCQoJy4nK3RhcmdldENvbHVtbikucmVtb3ZlQ2xhc3MoJ3NvcnRfdXAnKVxuICAgICAgQCQoJy4nK3RhcmdldENvbHVtbikuYWRkQ2xhc3MoJ3NvcnRfZG93bicpXG4gICAgZWxzZVxuICAgICAgQCQoJy4nK3RhcmdldENvbHVtbikuYWRkQ2xhc3MoJ3NvcnRfdXAnKVxuICAgICAgQCQoJy4nK3RhcmdldENvbHVtbikucmVtb3ZlQ2xhc3MoJ3NvcnRfZG93bicpXG5cbiAgZmlyZVBhZ2luYXRpb246ICh0YWJsZU5hbWUpID0+XG4gICAgZWwgPSBAJCh0YWJsZU5hbWUpWzBdXG4gICAgaGFiX3RhYmxlID0gZDMuc2VsZWN0KGVsKVxuICAgIGFjdGl2ZV9wYWdlID0gaGFiX3RhYmxlLnNlbGVjdEFsbChcIi5hY3RpdmUgYVwiKVxuICAgIGlmIGFjdGl2ZV9wYWdlIGFuZCBhY3RpdmVfcGFnZVswXSBhbmQgYWN0aXZlX3BhZ2VbMF1bMF1cbiAgICAgIGFjdGl2ZV9wYWdlWzBdWzBdLmNsaWNrKClcblxubW9kdWxlLmV4cG9ydHMgPSBFbnZpcm9ubWVudFRhYiIsIlJlcG9ydFRhYiA9IHJlcXVpcmUgJ3JlcG9ydFRhYidcbnRlbXBsYXRlcyA9IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbl9wYXJ0aWFscyA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5wYXJ0aWFscyA9IFtdXG5mb3Iga2V5LCB2YWwgb2YgX3BhcnRpYWxzXG4gIHBhcnRpYWxzW2tleS5yZXBsYWNlKCdub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvJywgJycpXSA9IHZhbFxuXG5pZHMgPSByZXF1aXJlICcuL2lkcy5jb2ZmZWUnXG5mb3Iga2V5LCB2YWx1ZSBvZiBpZHNcbiAgd2luZG93W2tleV0gPSB2YWx1ZVxuXG5cbmNsYXNzIEZpc2hpbmdUYWIgZXh0ZW5kcyBSZXBvcnRUYWJcbiAgIyB0aGlzIGlzIHRoZSBuYW1lIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIFRhYlxuICBuYW1lOiAnRmlzaGluZydcbiAgY2xhc3NOYW1lOiAnZmlzaGluZydcbiAgdGltZW91dDogMTIwMDAwXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZXMuZmlzaGluZ1xuICBkZXBlbmRlbmNpZXM6IFtcbiAgICAnRmlzaGluZ0FyZWFzJywgJ0Zpc2hlcnlJbnRlbnNpdHknXG4gIF1cblxuICByZW5kZXI6ICgpIC0+XG5cbiAgICAjc2hvdyB0YWJsZXMgaW5zdGVhZCBvZiBncmFwaCBmb3IgSUVcbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIGQzSXNQcmVzZW50ID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGQzSXNQcmVzZW50ID0gZmFsc2VcblxuICAgIGlzQ29sbGVjdGlvbiA9IEBtb2RlbC5pc0NvbGxlY3Rpb24oKVxuICAgIHNjaWQgPSBAc2tldGNoQ2xhc3MuaWRcbiAgIFxuICAgIGlmIChzY2lkID09IE1QQV9JRCBvciBzY2lkID09IE1QQV9DT0xMRUNUSU9OX0lEIG9yIHNjaWQgPT0gTVBBX0NPTkZJRF9DT0xMRUNUSU9OX0lEKVxuICAgICAgaXNNUEEgPSB0cnVlXG4gICAgICBpc0NvbmZpZGVudGlhbE1QQU5ldHdvcmsgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgaXNNUEEgPSBmYWxzZVxuICAgICAgaXNDb25maWRlbnRpYWxNUEFOZXR3b3JrID0gZmFsc2VcblxuICAgIFxuICAgIGlmIGlzTVBBXG4gICAgICBmaXNoZXJ5X2ludGVuc2l0eSA9IEByZWNvcmRTZXQoJ0Zpc2hlcnlJbnRlbnNpdHknLCAnRmlzaGVyeUludGVuc2l0eScpLnRvQXJyYXkoKVxuXG5cbiAgICBleGlzdGluZ19jdXN0b21hcnlfZmlzaGluZyA9IEByZWNvcmRTZXQoJ0Zpc2hpbmdBcmVhcycsICdFeGlzdGluZ0N1c3RvbWFyeUFyZWEnKS50b0FycmF5KClcbiAgICBoYXNFeGlzdGluZ0N1c3RvbWFyeSA9IGV4aXN0aW5nX2N1c3RvbWFyeV9maXNoaW5nPy5sZW5ndGggPiAwXG4gICAgcHJvcG9zZWRfY3VzdG9tYXJ5X2Zpc2hpbmcgPSBAcmVjb3JkU2V0KCdGaXNoaW5nQXJlYXMnLCAnUHJvcG9zZWRDdXN0b21hcnlBcmVhJykudG9BcnJheSgpXG4gICAgaGFzUHJvcG9zZWRDdXN0b21hcnkgPSBwcm9wb3NlZF9jdXN0b21hcnlfZmlzaGluZz8ubGVuZ3RoID4gMFxuXG4gICAgaGFzQ3VzdG9tYXJ5ID0gaGFzRXhpc3RpbmdDdXN0b21hcnkgb3IgaGFzUHJvcG9zZWRDdXN0b21hcnlcblxuICAgIGV4aXN0aW5nX2Zpc2hpbmdfYXJlYXMgPSBAcmVjb3JkU2V0KCdGaXNoaW5nQXJlYXMnLCAnRmlzaGluZ0V4aXN0aW5nQXJlYScpLnRvQXJyYXkoKVxuICAgIGhhc0V4aXN0aW5nRmlzaGluZyA9IGV4aXN0aW5nX2Zpc2hpbmdfYXJlYXM/Lmxlbmd0aCA+IDBcbiAgICBoYXNBbnlGaXNoaW5nID0gaGFzRXhpc3RpbmdGaXNoaW5nIG9yIGhhc0N1c3RvbWFyeVxuICAgIGF0dHJpYnV0ZXMgPSBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgXG4gICAgaWYgaXNNUEFcbiAgICAgIGNvbnRleHQgPVxuICAgICAgICBza2V0Y2g6IEBtb2RlbC5mb3JUZW1wbGF0ZSgpXG4gICAgICAgIHNrZXRjaENsYXNzOiBAc2tldGNoQ2xhc3MuZm9yVGVtcGxhdGUoKVxuICAgICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICAgIGFueUF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKCkubGVuZ3RoID4gMFxuICAgICAgICBhZG1pbjogQHByb2plY3QuaXNBZG1pbiB3aW5kb3cudXNlclxuICAgICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcbiAgICAgICAgaXNDb2xsZWN0aW9uOiBpc0NvbGxlY3Rpb25cbiAgICAgICAgaXNNUEE6IGlzTVBBXG4gICAgICAgIGV4aXN0aW5nX2N1c3RvbWFyeV9maXNoaW5nOiBleGlzdGluZ19jdXN0b21hcnlfZmlzaGluZ1xuICAgICAgICBoYXNFeGlzdGluZ0N1c3RvbWFyeTogaGFzRXhpc3RpbmdDdXN0b21hcnlcbiAgICAgICAgcHJvcG9zZWRfY3VzdG9tYXJ5X2Zpc2hpbmc6IHByb3Bvc2VkX2N1c3RvbWFyeV9maXNoaW5nXG4gICAgICAgIGhhc1Byb3Bvc2VkQ3VzdG9tYXJ5OiBoYXNQcm9wb3NlZEN1c3RvbWFyeVxuICAgICAgICBleGlzdGluZ19maXNoaW5nX2FyZWFzOiBleGlzdGluZ19maXNoaW5nX2FyZWFzXG4gICAgICAgIGhhc0V4aXN0aW5nRmlzaGluZzogaGFzRXhpc3RpbmdGaXNoaW5nXG4gICAgICAgIGhhc0FueUZpc2hpbmc6IGhhc0FueUZpc2hpbmdcbiAgICAgICAgaGFzQ3VzdG9tYXJ5OiBoYXNDdXN0b21hcnlcbiAgICAgICAgZmlzaGVyeV9pbnRlbnNpdHk6IGZpc2hlcnlfaW50ZW5zaXR5XG4gICAgICAgIGlzQ29uZmlkZW50aWFsTVBBTmV0d29yazogaXNDb25maWRlbnRpYWxNUEFOZXR3b3JrXG4gICAgZWxzZVxuICAgICAgY29udGV4dCA9XG4gICAgICAgIHNrZXRjaDogQG1vZGVsLmZvclRlbXBsYXRlKClcbiAgICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICAgIGF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICAgICAgYW55QXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKS5sZW5ndGggPiAwXG4gICAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICAgIGQzSXNQcmVzZW50OiBkM0lzUHJlc2VudFxuICAgICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuICAgICAgICBleGlzdGluZ19jdXN0b21hcnlfZmlzaGluZzogZXhpc3RpbmdfY3VzdG9tYXJ5X2Zpc2hpbmdcbiAgICAgICAgaGFzRXhpc3RpbmdDdXN0b21hcnk6IGhhc0V4aXN0aW5nQ3VzdG9tYXJ5XG4gICAgICAgIHByb3Bvc2VkX2N1c3RvbWFyeV9maXNoaW5nOiBwcm9wb3NlZF9jdXN0b21hcnlfZmlzaGluZ1xuICAgICAgICBoYXNQcm9wb3NlZEN1c3RvbWFyeTogaGFzUHJvcG9zZWRDdXN0b21hcnlcbiAgICAgICAgZXhpc3RpbmdfZmlzaGluZ19hcmVhczogZXhpc3RpbmdfZmlzaGluZ19hcmVhc1xuICAgICAgICBoYXNFeGlzdGluZ0Zpc2hpbmc6IGhhc0V4aXN0aW5nRmlzaGluZ1xuICAgICAgICBoYXNBbnlGaXNoaW5nOiBoYXNBbnlGaXNoaW5nXG4gICAgICAgIGhhc0N1c3RvbWFyeTogaGFzQ3VzdG9tYXJ5XG4gICAgICAgIGlzTVBBOiBpc01QQVxuICAgICAgICBpc0NvbmZpZGVudGlhbE1QQU5ldHdvcms6IGlzQ29uZmlkZW50aWFsTVBBTmV0d29ya1xuXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgcGFydGlhbHMpXG4gICAgQGVuYWJsZUxheWVyVG9nZ2xlcnMoKVxuICAgIEBzZXR1cEZpc2hlcnlTb3J0aW5nKGZpc2hlcnlfaW50ZW5zaXR5KVxuXG4gIHJvdW5kRGF0YTogKHJlY19zZXQpID0+XG4gICAgbG93X3RvdGFsID0gMC4wXG4gICAgaGlnaF90b3RhbCA9IDAuMFxuICAgIGZvciBycyBpbiByZWNfc2V0XG4gICAgICBycy5MT1cgPSBOdW1iZXIocnMuTE9XKS50b0ZpeGVkKDEpXG4gICAgICBsb3dfdG90YWwrPU51bWJlcihycy5MT1cpXG4gICAgICBycy5ISUdIID0gTnVtYmVyKHJzLkhJR0gpLnRvRml4ZWQoMSlcbiAgICAgIGhpZ2hfdG90YWwrPU51bWJlcihycy5ISUdIKVxuICAgICAgcnMuVE9UQUwgPSBOdW1iZXIocnMuVE9UQUwpLnRvRml4ZWQoMSlcbiAgICBpZiByZWNfc2V0Py5sZW5ndGggPiAwXG4gICAgICB0b3Rfcm93ID0ge1wiTkFNRVwiOlwiVG90YWxcIiwgXCJMT1dcIjpsb3dfdG90YWwsIFwiSElHSFwiOmhpZ2hfdG90YWx9XG4gICAgICByZWNfc2V0LnB1c2godG90X3JvdylcblxuICBzZXR1cEZpc2hlcnlTb3J0aW5nOiAoZmlzaGVyeV9pbnRlbnNpdHkpID0+XG4gICAgdGJvZHlOYW1lID0gJy5maXNoZXJ5X3ZhbHVlcydcbiAgICB0YWJsZU5hbWUgPSAnLmZpc2hlcnlfdGFibGUnXG5cbiAgICBAJCgnLmZpc2hlcnlfdHlwZScpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdmaXNoZXJ5X3R5cGUnLCB0YWJsZU5hbWUsIGZpc2hlcnlfaW50ZW5zaXR5LCBldmVudCwgXCJGSVNIX1RZUEVcIiwgdGJvZHlOYW1lLCBmYWxzZSwgQGdldEZpc2hlcnlSb3dTdHJpbmcpXG4gICAgXG4gICAgQCQoJy5maXNoZXJ5X2hpZ2gnKS5jbGljayAoZXZlbnQpID0+XG4gICAgICBAcmVuZGVyU29ydCgnZmlzaGVyeV9oaWdoJywgdGFibGVOYW1lLCBmaXNoZXJ5X2ludGVuc2l0eSwgZXZlbnQsIFwiSElHSFwiLCB0Ym9keU5hbWUsIHRydWUsIEBnZXRGaXNoZXJ5Um93U3RyaW5nKVxuXG4gICAgQCQoJy5maXNoZXJ5X21vZGVyYXRlJykuY2xpY2sgKGV2ZW50KSA9PlxuICAgICAgQHJlbmRlclNvcnQoJ2Zpc2hlcnlfbW9kZXJhdGUnLHRhYmxlTmFtZSwgZmlzaGVyeV9pbnRlbnNpdHksIGV2ZW50LCBcIk1PREVSQVRFXCIsIHRib2R5TmFtZSwgdHJ1ZSwgQGdldEZpc2hlcnlSb3dTdHJpbmcpXG4gICAgXG4gICAgQCQoJy5maXNoZXJ5X2xvdycpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdmaXNoZXJ5X2xvdycsdGFibGVOYW1lLCBmaXNoZXJ5X2ludGVuc2l0eSwgZXZlbnQsIFwiTE9XXCIsIHRib2R5TmFtZSwgdHJ1ZSwgQGdldEZpc2hlcnlSb3dTdHJpbmcpXG5cbiAgICBAJCgnLmZpc2hlcnlfZGlzcCcpLmNsaWNrIChldmVudCkgPT5cbiAgICAgIEByZW5kZXJTb3J0KCdmaXNoZXJ5X2Rpc3AnLHRhYmxlTmFtZSwgZmlzaGVyeV9pbnRlbnNpdHksIGV2ZW50LCBcIkRJU1BcIiwgdGJvZHlOYW1lLCB0cnVlLCBAZ2V0RmlzaGVyeVJvd1N0cmluZylcblxuXG4gICAgQHJlbmRlclNvcnQoJ2Zpc2hlcnlfdHlwZScsIHRhYmxlTmFtZSwgZmlzaGVyeV9pbnRlbnNpdHksIHVuZGVmaW5lZCwgXCJGSVNIX1RZUEVcIiwgdGJvZHlOYW1lLCBmYWxzZSwgQGdldEZpc2hlcnlSb3dTdHJpbmcpXG4gIFxuICAjdGFibGUgcm93IGZvciBoYWJpdGF0IHJlcHJlc2VudGF0aW9uXG4gIGdldEZpc2hlcnlSb3dTdHJpbmc6IChkKSA9PlxuICAgIGlmIGQgaXMgdW5kZWZpbmVkXG4gICAgICByZXR1cm4gXCJcIlxuXG4gICAgcmV0dXJuIFwiPHRkPlwiK2QuRklTSF9UWVBFK1wiPC90ZD5cIitcIjx0ZD5cIitkLkhJR0grXCI8L3RkPlwiK1wiPHRkPlwiK2QuTU9ERVJBVEUrXCI8L3RkPlwiK1wiPHRkPlwiK2QuTE9XK1wiPC90ZD5cIitcIjx0ZD5cIitkLkRJU1ArXCI8L3RkPlwiXG4gIFxuICBnZXRGbG9hdDogKHZhbCkgPT5cbiAgICB0cnlcbiAgICAgIHJldHVybiBwYXJzZUZsb2F0KHZhbClcbiAgICBjYXRjaCBlcnJvclxuICAgICAgcmV0dXJuIDAuMFxuXG4gIHJlbmRlclNvcnQ6IChuYW1lLCB0YWJsZU5hbWUsIHBkYXRhLCBldmVudCwgc29ydEJ5LCB0Ym9keU5hbWUsIGlzRmxvYXQsIGdldFJvd1N0cmluZ1ZhbHVlICkgPT5cbiAgICBpZiBldmVudFxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgaWYgd2luZG93LmQzXG4gICAgICB0YXJnZXRDb2x1bW4gPSBAZ2V0U2VsZWN0ZWRDb2x1bW4oZXZlbnQsIG5hbWUpXG5cbiAgICAgIHNvcnRVcCA9IEBnZXRTb3J0RGlyKHRhcmdldENvbHVtbilcblxuICAgICAgaWYgaXNGbG9hdFxuICAgICAgICBkYXRhID0gXy5zb3J0QnkgcGRhdGEsIChyb3cpIC0+IFxuICAgICAgICAgICAgaWYgaXNOYU4ocm93W3NvcnRCeV0pXG4gICAgICAgICAgICAgIHZhbCA9IC0xLjBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgdmFsID0gcGFyc2VGbG9hdChyb3dbc29ydEJ5XSlcbiAgICAgICAgICAgIHJldHVybiB2YWxcbiAgICAgIGVsc2VcbiAgICAgICAgZGF0YSA9IF8uc29ydEJ5IHBkYXRhLCAocm93KSAtPiByb3dbc29ydEJ5XVxuXG4gICAgICAjZmxpcCBzb3J0aW5nIGlmIG5lZWRlZFxuICAgICAgaWYgc29ydFVwXG4gICAgICAgIGRhdGEucmV2ZXJzZSgpXG5cbiAgICAgIGVsID0gQCQodGJvZHlOYW1lKVswXVxuICAgICAgaGFiX2JvZHkgPSBkMy5zZWxlY3QoZWwpXG5cbiAgICAgICNyZW1vdmUgb2xkIHJvd3NcbiAgICAgIGhhYl9ib2R5LnNlbGVjdEFsbChcInRyLmZpc2hlcnlfcm93c1wiKVxuICAgICAgICAucmVtb3ZlKClcblxuICAgICAgI2FkZCBuZXcgcm93cyAoYW5kIGRhdGEpXG4gICAgICByb3dzID0gaGFiX2JvZHkuc2VsZWN0QWxsKFwidHJcIilcbiAgICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgICAuZW50ZXIoKS5pbnNlcnQoXCJ0clwiLCBcIjpmaXJzdC1jaGlsZFwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiZmlzaGVyeV9yb3dzXCIpXG5cbiAgICAgIGNvbHVtbnMgPSBbXCJGSVNIX1RZUEVcIiwgXCJISUdIXCIsIFwiTU9ERVJBVEVcIiwgXCJMT1dcIiwgXCJESVNQXCJdXG5cbiAgICAgIGNlbGxzID0gcm93cy5zZWxlY3RBbGwoXCJ0ZFwiKVxuICAgICAgICAgIC5kYXRhKChyb3csIGkpIC0+Y29sdW1ucy5tYXAgKGNvbHVtbikgLT4gKGNvbHVtbjogY29sdW1uLCB2YWx1ZTogcm93W2NvbHVtbl0pKVxuICAgICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKFwidGRcIikudGV4dCgoZCwgaSkgLT4gXG4gICAgICAgICAgZC52YWx1ZVxuICAgICAgICApICAgIFxuXG4gICAgICBAc2V0TmV3U29ydERpcih0YXJnZXRDb2x1bW4sIHNvcnRVcClcblxuICAgICAgI2ZpcmUgdGhlIGV2ZW50IGZvciB0aGUgYWN0aXZlIHBhZ2UgaWYgcGFnaW5hdGlvbiBpcyBwcmVzZW50XG4gICAgICBAZmlyZVBhZ2luYXRpb24odGFibGVOYW1lKVxuICAgICAgaWYgZXZlbnRcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICBcbiAgZ2V0U2VsZWN0ZWRDb2x1bW46IChldmVudCwgbmFtZSkgPT5cbiAgICBpZiBldmVudFxuICAgICAgI2dldCBzb3J0IG9yZGVyXG4gICAgICB0YXJnZXRDb2x1bW4gPSBldmVudC5jdXJyZW50VGFyZ2V0LmNsYXNzTmFtZVxuICAgICAgbXVsdGlDbGFzc2VzID0gdGFyZ2V0Q29sdW1uLnNwbGl0KCcgJylcbiAgICAgIHRhcmdldENvbHVtbiA9IG11bHRpQ2xhc3Nlc1swXVxuICAgIGVsc2VcbiAgICAgICN3aGVuIHRoZXJlIGlzIG5vIGV2ZW50LCBmaXJzdCB0aW1lIHRhYmxlIGlzIGZpbGxlZFxuICAgICAgdGFyZ2V0Q29sdW1uID0gbmFtZVxuXG4gICAgcmV0dXJuIHRhcmdldENvbHVtblxuXG4gIGdldFNvcnREaXI6ICh0YXJnZXRDb2x1bW4pID0+XG4gICAgIHNvcnR1cCA9IEAkKCcuJyt0YXJnZXRDb2x1bW4pLmhhc0NsYXNzKFwic29ydF91cFwiKVxuICAgICByZXR1cm4gc29ydHVwXG5cbiAgc2V0TmV3U29ydERpcjogKHRhcmdldENvbHVtbiwgc29ydFVwKSA9PlxuICAgICNhbmQgc3dpdGNoIGl0XG4gICAgaWYgc29ydFVwXG4gICAgICBAJCgnLicrdGFyZ2V0Q29sdW1uKS5yZW1vdmVDbGFzcygnc29ydF91cCcpXG4gICAgICBAJCgnLicrdGFyZ2V0Q29sdW1uKS5hZGRDbGFzcygnc29ydF9kb3duJylcbiAgICBlbHNlXG4gICAgICBAJCgnLicrdGFyZ2V0Q29sdW1uKS5hZGRDbGFzcygnc29ydF91cCcpXG4gICAgICBAJCgnLicrdGFyZ2V0Q29sdW1uKS5yZW1vdmVDbGFzcygnc29ydF9kb3duJylcblxuICBmaXJlUGFnaW5hdGlvbjogKHRhYmxlTmFtZSkgPT5cbiAgICBlbCA9IEAkKHRhYmxlTmFtZSlbMF1cbiAgICBoYWJfdGFibGUgPSBkMy5zZWxlY3QoZWwpXG4gICAgYWN0aXZlX3BhZ2UgPSBoYWJfdGFibGUuc2VsZWN0QWxsKFwiLmFjdGl2ZSBhXCIpXG4gICAgaWYgYWN0aXZlX3BhZ2UgYW5kIGFjdGl2ZV9wYWdlWzBdIGFuZCBhY3RpdmVfcGFnZVswXVswXVxuICAgICAgYWN0aXZlX3BhZ2VbMF1bMF0uY2xpY2soKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpc2hpbmdUYWIiLCJtb2R1bGUuZXhwb3J0cyA9IFxuICBHRU5FUklDX0lEOiAnNTM5ZjVlYzY4ZDEwOTI2YzI5ZmU3NzYyJ1xuICBHRU5FUklDX0NPTExFQ1RJT05fSUQ6ICc1M2ZkMTk1NTA0MDZkZTY4NGMxMTg5NjknXG4gIE1QQV9JRDogJzU0ZDgxMjkwZmE5NGU2OTc3NTljZTc3MSdcbiAgTVBBX0NPTkZJRF9DT0xMRUNUSU9OX0lEOiAnNTU4MmU2MDVhYzJkZGRkNDI5NzZmNDFiJ1xuICBNUEFfQ09MTEVDVElPTl9JRDogJzU2MzEyYWJjZTgzN2YyMmYwNmI2ZDI3MiciLCJSZXBvcnRUYWIgPSByZXF1aXJlICdyZXBvcnRUYWInXG50ZW1wbGF0ZXMgPSByZXF1aXJlICcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5fcGFydGlhbHMgPSByZXF1aXJlICcuLi9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxucGFydGlhbHMgPSBbXVxuZm9yIGtleSwgdmFsIG9mIF9wYXJ0aWFsc1xuICBwYXJ0aWFsc1trZXkucmVwbGFjZSgnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpLycsICcnKV0gPSB2YWxcblxuaWRzID0gcmVxdWlyZSAnLi9pZHMuY29mZmVlJ1xuZm9yIGtleSwgdmFsdWUgb2YgaWRzXG4gIHdpbmRvd1trZXldID0gdmFsdWVcblxuY2xhc3MgT3ZlcnZpZXdUYWIgZXh0ZW5kcyBSZXBvcnRUYWJcbiAgIyB0aGlzIGlzIHRoZSBuYW1lIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIFRhYlxuICBuYW1lOiAnT3ZlcnZpZXcnXG4gIGNsYXNzTmFtZTogJ292ZXJ2aWV3J1xuICB0aW1lb3V0OiAxMjAwMDBcbiAgdGVtcGxhdGU6IHRlbXBsYXRlcy5vdmVydmlld1xuICBkZXBlbmRlbmNpZXM6IFtcbiAgICAnSGFiaXRhdHNPdmVydmlldydcbiAgICAnUHJvcG9zYWxTaXplJ1xuICAgICdQcm9wb3NhbENvbm5lY3Rpdml0eSdcbiAgICAnTmV3SGFiUmVwc1Rvb2xib3gnXG4gIF1cblxuICByZW5kZXI6ICgpIC0+XG4gICAgIyBUaGUgQHJlY29yZFNldCBtZXRob2QgY29udGFpbnMgc29tZSB1c2VmdWwgbWVhbnMgdG8gZ2V0IGRhdGEgb3V0IG9mIFxuICAgICMgdGhlIG1vbnN0ZXJvdXMgUmVjb3JkU2V0IGpzb24uIENoZWNrb3V0IHRoZSBzZWFza2V0Y2gtcmVwb3J0aW5nLXRlbXBsYXRlXG4gICAgIyBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGluZm8uXG4gICAgVE9UQUxfQ09BU1RMSU5FX0xFTkdUSCA9IDc2Ni40NjY5MTdcbiAgICBUT1RfU0laRV9TUUtNID0gODkzMC42NjI4OTNcblxuICAgIFxuICAgIFRPVEFMX0hBQlMgPTIyXG5cbiAgICBzY2lkID0gQHNrZXRjaENsYXNzLmlkXG4gICAgaXNDb2xsZWN0aW9uID0gQG1vZGVsLmlzQ29sbGVjdGlvbigpXG5cbiAgICBpc01QQSA9IChzY2lkID09IE1QQV9JRCBvciBzY2lkID09IE1QQV9DT0xMRUNUSU9OX0lEIG9yIHNjaWQgPT0gTVBBX0NPTkZJRF9DT0xMRUNUSU9OX0lEKVxuXG4gICAgbnVtX3Jlc2VydmVzID0gMFxuICAgIG51bV90eXBlMiA9IDBcbiAgICBudW1fb3RoZXIgPSAwXG4gICAgcGx1cmFsX3R5cGUxID0gdHJ1ZVxuICAgIHBsdXJhbF90eXBlMiA9IHRydWVcbiAgICBwbHVyYWxfb3RoZXIgPSB0cnVlXG5cbiAgICBpZiBpc0NvbGxlY3Rpb25cbiAgICAgIG51bVNrZXRjaGVzID0gQG1vZGVsLmdldENoaWxkcmVuKCkubGVuZ3RoXG4gICAgICBpZiBpc01QQVxuICAgICAgICByZXNlcnZlX3R5cGVzID0gQGdldFJlc2VydmVWYWx1ZXMgQG1vZGVsLmdldENoaWxkcmVuKClcbiAgICAgICAgbnVtX3Jlc2VydmVzID0gcmVzZXJ2ZV90eXBlc1swXVxuICAgICAgICBwbHVyYWxfdHlwZTEgPSBudW1fcmVzZXJ2ZXMgIT0gMVxuICAgICAgICBudW1fdHlwZTIgPSByZXNlcnZlX3R5cGVzWzFdXG4gICAgICAgIHBsdXJhbF90eXBlMiA9IG51bV90eXBlMiAhPSAxXG4gICAgICAgIG51bV9vdGhlciA9IHJlc2VydmVfdHlwZXNbMl1cbiAgICAgICAgcGx1cmFsX290aGVyID0gbnVtX290aGVyICE9IDFcbiAgICBlbHNlXG4gICAgICBudW1Ta2V0Y2hlcyA9IDFcblxuICAgIHBsdXJhbFNrZXRjaGVzID0gbnVtU2tldGNoZXMgPiAxXG5cbiAgICBpc0dlbmVyaWMgPSAoc2NpZCA9PSBHRU5FUklDX0lEIG9yIHNjaWQgPT0gR0VORVJJQ19DT0xMRUNUSU9OX0lEKVxuXG4gICAgdG90YWxfc2l6ZXMgPSBAcmVjb3JkU2V0KCdQcm9wb3NhbFNpemUnLCAnU2l6ZVRvdGFscycpLnRvQXJyYXkoKVxuICAgIHByb3Bfc2l6ZXMgPSBAcmVjb3JkU2V0KCdQcm9wb3NhbFNpemUnLCAnU2l6ZXMnKS50b0FycmF5KClcblxuICAgIFxuICAgIHJlcHJlc2VudGVkX2hhYnMgPSBAcmVjb3JkU2V0KCdOZXdIYWJSZXBzVG9vbGJveCcsICdSZXByZXNlbnRlZEhhYnMnKS50b0FycmF5KClcbiAgICBoYWJfc2l6ZXMgPSBAcmVjb3JkU2V0KCdOZXdIYWJSZXBzVG9vbGJveCcsICdIYWJTaXplcycpLnRvQXJyYXkoKVxuICAgIG51bV9oYWJzID0gaGFiX3NpemVzPy5sZW5ndGhcblxuICAgIG51bV9yZXByZXNlbnRlZF9oYWJzID0gQGdldE51bUhhYnMoXCJSRVBZRVNcIiwgcmVwcmVzZW50ZWRfaGFicylcbiAgICBudW1fcmVwbGljYXRlZF9oYWJzID0gQGdldE51bUhhYnMoXCJSRVBMSUNcIiwgcmVwcmVzZW50ZWRfaGFicylcblxuICAgIG1wYV9hdmdfbWluX2RpbSA9IEBnZXRBdmVyYWdlTWluRGltKHByb3Bfc2l6ZXMpXG4gICAgdG90YWxfcGVyY2VudCA9IEBnZXRUb3RhbEFyZWFQZXJjZW50KHByb3Bfc2l6ZXMpXG4gICAgcHJvcF9zaXplcyA9IEBjbGVhbnVwRGF0YShwcm9wX3NpemVzKVxuICAgIFxuICAgIG1wYV9jb3VudCA9IEBnZXRNaW5EaW1Db3VudChwcm9wX3NpemVzKVxuICAgIHRvdGFsX21wYV9jb3VudCA9IG51bVNrZXRjaGVzXG4gICAgcGx1cmFsX21wYV9jb3VudCA9IG1wYV9jb3VudCAhPSAxXG5cbiAgICBcbiAgICBpZiBtcGFfYXZnX21pbl9kaW0gPCAxMFxuICAgICAgbXBhX2F2Z19zaXplX2d1aWRlbGluZSA9IFwiYmVsb3dcIlxuICAgIGVsc2VcbiAgICAgIG1wYV9hdmdfc2l6ZV9ndWlkZWxpbmUgPSBcImFib3ZlXCJcblxuXG4gICAgaWYgdG90YWxfc2l6ZXM/Lmxlbmd0aCA+IDBcbiAgICAgIGNvYXN0bGluZV9sZW5ndGggPSB0b3RhbF9zaXplc1swXS5DT0FTVFxuICAgICAgY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50ID0gKGNvYXN0bGluZV9sZW5ndGgvVE9UQUxfQ09BU1RMSU5FX0xFTkdUSCkqMTAwLjBcbiAgICAgIGlmIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA+IDAgJiYgY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50IDwgMVxuICAgICAgICBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQgPSBcIjwgMVwiXG4gICAgICBlbHNlXG4gICAgICAgIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA9IHBhcnNlRmxvYXQoY29hc3RsaW5lX2xlbmd0aF9wZXJjZW50KS50b0ZpeGVkKDEpXG4gICAgICAgIGlmIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA+IDEwMFxuICAgICAgICAgIGNvYXN0bGluZV9sZW5ndGhfcGVyY2VudCA9IDEwMFxuICAgICAgc2l6ZSA9IHRvdGFsX3NpemVzWzBdLlNJWkVfU1FLTVxuXG4gICAgICBjb2FzdGxpbmVfbGVuZ3RoID0gcGFyc2VGbG9hdChjb2FzdGxpbmVfbGVuZ3RoKS50b0ZpeGVkKDEpXG4gICAgICBhcmVhX3BlcmNlbnQgPSBwYXJzZUZsb2F0KChzaXplL1RPVF9TSVpFX1NRS00pKjEwMCkudG9GaXhlZCgxKVxuICAgICAgaWYgYXJlYV9wZXJjZW50ID4gMTAwXG4gICAgICAgIGFyZWFfcGVyY2VudCA9IDEwMC4wXG5cbiAgICAgIGlmIGFyZWFfcGVyY2VudCA8IDAuMVxuICAgICAgICBhcmVhX3BlcmNlbnQgPSBcIjwgMVwiXG5cbiAgICBuZXdfaGFicyA9IEByZWNvcmRTZXQoJ0hhYml0YXRzT3ZlcnZpZXcnLCAnSGFiaXRhdFNpemUnKS5mbG9hdCgnTkVXX0hBQlMnKVxuICAgIHRvdGFsX2hhYnMgPSBAcmVjb3JkU2V0KCdIYWJpdGF0c092ZXJ2aWV3JywgJ0hhYml0YXRTaXplJykuZmxvYXQoJ1RPVF9IQUJTJylcbiAgICBcbiAgICByYXRpbyA9IChjb2FzdGxpbmVfbGVuZ3RoL3NpemUpLnRvRml4ZWQoMSlcblxuICAgICNzZXR1cCBjb25uZWN0aXZpdHkgZGF0YVxuICAgIGlmIGlzQ29sbGVjdGlvblxuICAgICAgZ29vZF9jb2xvciA9IFwiI2IzY2ZhN1wiXG4gICAgICBiYWRfY29sb3IgPSBcIiNlNWNhY2VcIlxuICAgICAgaWYgbnVtU2tldGNoZXMgPiAxXG4gICAgICAgIHRyeVxuICAgICAgICAgIGNvbm5lY3RlZF9tcGFfY291bnQgPSBAcmVjb3JkU2V0KCdQcm9wb3NhbENvbm5lY3Rpdml0eScsICdDb25uJykuZmxvYXQoJ05VTUJFUicpXG4gICAgICAgICAgcGx1cmFsX2Nvbm5lY3RlZF9tcGFfY291bnQgPSB0cnVlXG5cbiAgICAgICAgICBtaW5fZGlzdGFuY2UgPSBAcmVjb3JkU2V0KCdQcm9wb3NhbENvbm5lY3Rpdml0eScsICdDb25uJykuZmxvYXQoJ01JTicpXG4gICAgICAgICAgbWF4X2Rpc3RhbmNlID0gQHJlY29yZFNldCgnUHJvcG9zYWxDb25uZWN0aXZpdHknLCAnQ29ubicpLmZsb2F0KCdNQVgnKVxuICAgICAgICAgIG1lYW5fZGlzdGFuY2UgPSBAcmVjb3JkU2V0KCdQcm9wb3NhbENvbm5lY3Rpdml0eScsICdDb25uJykuZmxvYXQoJ01FQU4nKVxuICAgICAgICAgIGNvbm5fcGllX3ZhbHVlcyA9IEBidWlsZF92YWx1ZXMoXCJNUEFzIFdpdGhpbiBDb25uZWN0aXZpdHkgUmFuZ2VcIiwgY29ubmVjdGVkX21wYV9jb3VudCxnb29kX2NvbG9yLCBcIk1QQXMgT3V0c2lkZSBDb25uZWN0aXZpdHkgUmFuZ2VcIiwgXG4gICAgICAgICAgICB0b3RhbF9tcGFfY291bnQtY29ubmVjdGVkX21wYV9jb3VudCwgYmFkX2NvbG9yKVxuICAgICAgICBjYXRjaCBFcnJvclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3IgcmVhZGluZyBjb25uZWN0aXZpdHkuLi5cIilcbiAgICAgICAgICBcbiAgICAgIG5vdF9yZXByZXNlbnRlZCA9IFRPVEFMX0hBQlMgLSBudW1fcmVwcmVzZW50ZWRfaGFic1xuICAgICAgcmVwcmVzZW50ZWRfaGFic19waWVfdmFsdWVzID0gQGJ1aWxkX3ZhbHVlcyhcIkhhYml0YXQtdHlwZXMgSW5jbHVkZWRcIiwgbnVtX3JlcHJlc2VudGVkX2hhYnMsIGdvb2RfY29sb3IsIFwiSGFiaXRhdC10eXBlcyBOb3QgSW5jbHVkZWRcIixcbiAgICAgICAgbm90X3JlcHJlc2VudGVkLCBiYWRfY29sb3IpXG5cbiAgICAgIG5vdF9yZXBsaWNhdGVkID0gVE9UQUxfSEFCUyAtIG51bV9yZXBsaWNhdGVkX2hhYnNcbiAgICAgIHJlcGxpY2F0ZWRfaGFic19waWVfdmFsdWVzID0gQGJ1aWxkX3ZhbHVlcyhcIkhhYml0YXQtdHlwZXMgUmVwbGljYXRlZFwiLCBudW1fcmVwbGljYXRlZF9oYWJzLCBnb29kX2NvbG9yLCBcIkhhYml0YXQtdHlwZXMgTm90IFJlcGxpY2F0ZWRcIixcbiAgICAgICAgbm90X3JlcGxpY2F0ZWQsIGJhZF9jb2xvcilcblxuICAgICNzaG93IHRhYmxlcyBpbnN0ZWFkIG9mIGdyYXBoIGZvciBJRVxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgZDNJc1ByZXNlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgZDNJc1ByZXNlbnQgPSBmYWxzZVxuXG4gICAgXG4gICAgYXR0cmlidXRlcyA9IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICBcbiAgICBjb250ZXh0ID1cbiAgICAgIGQzSXNQcmVzZW50OiBkM0lzUHJlc2VudFxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICBzaXplOiBzaXplXG4gICAgICBjb2FzdGxpbmVfbGVuZ3RoOiBjb2FzdGxpbmVfbGVuZ3RoXG4gICAgICBjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnQ6Y29hc3RsaW5lX2xlbmd0aF9wZXJjZW50XG4gICAgICBuZXdfaGFiczogbmV3X2hhYnNcbiAgICAgIHRvdGFsX2hhYnM6IHRvdGFsX2hhYnNcbiAgICAgIHJhdGlvOiByYXRpb1xuICAgICAgYXJlYV9wZXJjZW50OiBhcmVhX3BlcmNlbnRcbiAgICAgIGlzQ29sbGVjdGlvbjogaXNDb2xsZWN0aW9uXG4gICAgICBudW1Ta2V0Y2hlczogbnVtU2tldGNoZXNcbiAgICAgIHBsdXJhbFNrZXRjaGVzOiBwbHVyYWxTa2V0Y2hlc1xuICAgICAgcHJvcF9zaXplczogcHJvcF9zaXplc1xuICAgICAgdG90YWxfbXBhX2NvdW50OiB0b3RhbF9tcGFfY291bnRcbiAgICAgIG1wYV9jb3VudDogbXBhX2NvdW50XG4gICAgICBtcGFfYXZnX3NpemVfZ3VpZGVsaW5lOm1wYV9hdmdfc2l6ZV9ndWlkZWxpbmVcbiAgICAgIHBsdXJhbF9tcGFfY291bnQ6IHBsdXJhbF9tcGFfY291bnRcbiAgICAgIGNvbm5lY3RlZF9tcGFfY291bnQ6IGNvbm5lY3RlZF9tcGFfY291bnRcblxuICAgICAgcGx1cmFsX2Nvbm5lY3RlZF9tcGFfY291bnQ6IHBsdXJhbF9jb25uZWN0ZWRfbXBhX2NvdW50XG4gICAgICBtaW5fZGlzdGFuY2U6IG1pbl9kaXN0YW5jZVxuICAgICAgbWF4X2Rpc3RhbmNlOiBtYXhfZGlzdGFuY2VcbiAgICAgIG1lYW5fZGlzdGFuY2U6IG1lYW5fZGlzdGFuY2VcbiAgICAgIHNpbmdsZVNrZXRjaDogbnVtU2tldGNoZXMgPT0gMVxuICAgICAgaXNNUEE6IGlzTVBBXG4gICAgICBudW1faGFiczogbnVtX2hhYnNcbiAgICAgIHRvdGFsX2hhYnM6IFRPVEFMX0hBQlNcbiAgICAgIG51bV9yZXByZXNlbnRlZF9oYWJzOiBudW1fcmVwcmVzZW50ZWRfaGFic1xuICAgICAgbnVtX3JlcGxpY2F0ZWRfaGFiczogbnVtX3JlcGxpY2F0ZWRfaGFic1xuICAgICAgaXNHZW5lcmljOiBpc0dlbmVyaWNcbiAgICAgIGlzTVBBOiBpc01QQVxuICAgICAgbnVtX3Jlc2VydmVzOiBudW1fcmVzZXJ2ZXNcbiAgICAgIHBsdXJhbF90eXBlMTogcGx1cmFsX3R5cGUxXG4gICAgICBudW1fdHlwZTI6IG51bV90eXBlMlxuICAgICAgcGx1cmFsX3R5cGUyOiBwbHVyYWxfdHlwZTJcbiAgICAgIG51bV9vdGhlcjogbnVtX290aGVyXG4gICAgICBwbHVyYWxfb3RoZXI6IHBsdXJhbF9vdGhlclxuXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgcGFydGlhbHMpXG4gICAgQGVuYWJsZUxheWVyVG9nZ2xlcnMoKVxuXG4gICAgI3NpemVfcGllX3ZhbHVlcyA9IEBidWlsZF92YWx1ZXMoXCJNZWV0cyBNaW4uIFNpemVcIiwgbXBhX2NvdW50LFwiI2IzY2ZhN1wiLCBcIkRvZXMgbm90IE1lZXQgU2l6ZSBNaW4uXCIsIFxuICAgICMgIHRvdGFsX21wYV9jb3VudC1tcGFfY291bnQsIFwiI2U1Y2FjZVwiKVxuXG4gICAgQGRyYXdQaWUocmVwcmVzZW50ZWRfaGFic19waWVfdmFsdWVzLCBcIiNyZXByZXNlbnRlZF9oYWJzX3BpZVwiKVxuICAgIEBkcmF3UGllKHJlcGxpY2F0ZWRfaGFic19waWVfdmFsdWVzLCBcIiNyZXBsaWNhdGVkX2hhYnNfcGllXCIpXG4gICAgQGRyYXdQaWUoY29ubl9waWVfdmFsdWVzLCBcIiNjb25uZWN0aXZpdHlfcGllXCIpXG4gIFxuXG4gIGJ1aWxkX3ZhbHVlczogKHllc19sYWJlbCwgeWVzX2NvdW50LCB5ZXNfY29sb3IsIG5vX2xhYmVsLCBub19jb3VudCwgbm9fY29sb3IpID0+XG4gICAgeWVzX3ZhbCA9IHtcImxhYmVsXCI6eWVzX2xhYmVsK1wiIChcIit5ZXNfY291bnQrXCIpXCIsIFwidmFsdWVcIjp5ZXNfY291bnQsIFwiY29sb3JcIjp5ZXNfY29sb3IsIFwieXZhbFwiOjI1fVxuICAgIG5vX3ZhbCA9IHtcImxhYmVsXCI6bm9fbGFiZWwrXCIgKFwiK25vX2NvdW50K1wiKVwiLCBcInZhbHVlXCI6bm9fY291bnQsIFwiY29sb3JcIjpub19jb2xvciwgXCJ5dmFsXCI6NTB9XG5cbiAgICByZXR1cm4gW3llc192YWwsIG5vX3ZhbF1cblxuICBnZXROdW1IYWJzOiAoYXR0cl9uYW1lLCBoYWJpdGF0cykgPT5cbiAgICBpZiBoYWJpdGF0cz8ubGVuZ3RoID09IDBcbiAgICAgIHJldHVybiAwXG5cbiAgICBjb3VudCA9IDBcbiAgICBmb3IgaGFiIGluIGhhYml0YXRzXG4gICAgICBpZiBoYWJbYXR0cl9uYW1lXSA9PSBcIlllc1wiXG4gICAgICAgIGlmIEBpc0NvYXN0YWxIYWIoaGFiKVxuICAgICAgICAgIGNvdW50Kz0xXG4gICAgcmV0dXJuIGNvdW50XG5cbiAgaXNDb2FzdGFsSGFiOiAoaGFiKSA9PlxuICAgIGlmIGhhYi5IQUJfVFlQRSA9PSBcIkJyeW96b2FuIHJlZWZcIiBvciBoYWIuSEFCX1RZUEUgPT0gXCJNYWNyb2N5c3RpcyBiZWRcIiBvciBoYWIuSEFCX1RZUEUgPT0gXCJTZWFncmFzcyBiZWRcIlxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgaWYgaGFiLkhBQl9UWVBFLnN0YXJ0c1dpdGgoXCJFc3R1YXJpbmVcIilcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIGlmIGhhYi5IQUJfVFlQRSA9PSBcIk11ZCBGbGF0XCJcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG5cbiAgaXNUeXBlMk9ubHk6IChyZXNlcnZlcykgPT5cbiAgICByZXNjb3VudHMgPSBAZ2V0UmVzZXJ2ZVZhbHVlcyhyZXNlcnZlcylcbiAgICBpZiByZXNjb3VudHNbMF0gPT0gMFxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICAgIFxuICBnZXRSZXNlcnZlVmFsdWVzOiAocmVzZXJ2ZXMpID0+XG4gICAgbnVtX3Jlc2VydmVzID0gMFxuICAgIG51bV90eXBlMiA9IDBcbiAgICBudW1fb3RoZXIgPSAwXG4gICAgdDJfc3RyID0gXCJUeXBlMlwiXG4gICAgbXJfc3RyID0gXCJNUlwiXG4gICAgb3RoZXJfc3RyID0gXCJPdGhlclwiXG4gICAgdHJ5XG4gICAgICBmb3IgcmVzIGluIHJlc2VydmVzXG4gICAgICAgIGF0dHJzID0gcmVzLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgICBmb3IgYXR0IGluIGF0dHJzXG4gICAgICAgICAgaWYgYXR0LmV4cG9ydGlkID09IFwiTUFOQUdFTUVOVFwiIFxuICAgICAgICAgICAgcmVzX3R5cGUgPSBhdHQudmFsdWVcbiAgICAgICAgICAgIGlmIHJlc190eXBlID09IHQyX3N0ciBvciByZXNfdHlwZS5pbmRleE9mKHQyX3N0cikgPj0wXG4gICAgICAgICAgICAgIG51bV90eXBlMis9MVxuICAgICAgICAgICAgZWxzZSBpZiByZXNfdHlwZSA9PSBtcl9zdHIgb3IgcmVzX3R5cGUuaW5kZXhPZihtcl9zdHIpID49MFxuICAgICAgICAgICAgICBudW1fcmVzZXJ2ZXMrPTFcbiAgICAgICAgICAgIGVsc2UgaWYgcmVzX3R5cGUgPT0gb3RoZXJfc3RyIG9yIHJlc190eXBlLmluZGV4T2Yob3RoZXJfc3RyKSA+PSAwXG4gICAgICAgICAgICAgIG51bV9vdGhlcis9MVxuICAgIGNhdGNoIEVycm9yXG4gICAgICBjb25zb2xlLmxvZygncmFuIGludG8gcHJvYmxlbSBnZXR0aW5nIG1wYSB0eXBlcycpXG5cbiAgICByZXR1cm4gW251bV9yZXNlcnZlcywgbnVtX3R5cGUyLCBudW1fb3RoZXJdXG5cbiAgZ2V0RGF0YVZhbHVlOiAoZGF0YSkgPT5cbiAgICByZXR1cm4gZGF0YS52YWx1ZVxuXG4gIGRyYXdQaWU6IChkYXRhLCBwaWVfbmFtZSkgPT5cbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIHcgPSA5MFxuICAgICAgaCA9IDc1XG4gICAgICByID0gMjVcbiAgICAgXG4gICAgICB2aXNfZWwgPSBAJChwaWVfbmFtZSlbMF1cbiAgICAgICN2aXMgPSBkMy5zZWxlY3QodmlzX2VsKVxuICAgICAgdmlzID0gZDMuc2VsZWN0KHZpc19lbCkuYXBwZW5kKFwic3ZnOnN2Z1wiKS5kYXRhKFtkYXRhXSkuYXR0cihcIndpZHRoXCIsIHcpLmF0dHIoXCJoZWlnaHRcIiwgaCkuYXBwZW5kKFwic3ZnOmdcIikuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIChyKjIpICsgXCIsXCIgKyAocis1KSArIFwiKVwiKVxuICAgICAgXG4gICAgICAjdmlzID0gZDMuc2VsZWN0KHBpZV9uYW1lKS5hcHBlbmQoXCJzdmc6c3ZnXCIpLmRhdGEoW2RhdGFdKS5hdHRyKFwid2lkdGhcIiwgdykuYXR0cihcImhlaWdodFwiLCBoKS5hcHBlbmQoXCJzdmc6Z1wiKS5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgKHIqMikgKyBcIixcIiArIChyKzUpICsgXCIpXCIpXG4gICAgICBcbiAgICAgIHBpZSA9IGQzLmxheW91dC5waWUoKS52YWx1ZSgoZCkgLT4gcmV0dXJuIGQudmFsdWUpXG5cbiAgICAgICNkZWNsYXJlIGFuIGFyYyBnZW5lcmF0b3IgZnVuY3Rpb25cbiAgICAgIGFyYyA9IGQzLnN2Zy5hcmMoKS5vdXRlclJhZGl1cyhyKVxuXG4gICAgICAjc2VsZWN0IHBhdGhzLCB1c2UgYXJjIGdlbmVyYXRvciB0byBkcmF3XG4gICAgICBhcmNzID0gdmlzLnNlbGVjdEFsbChcImcuc2xpY2VcIikuZGF0YShwaWUpLmVudGVyKCkuYXBwZW5kKFwic3ZnOmdcIikuYXR0cihcImNsYXNzXCIsIFwic2xpY2VcIilcbiAgICAgIGFyY3MuYXBwZW5kKFwic3ZnOnBhdGhcIilcbiAgICAgICAgLmF0dHIoXCJmaWxsXCIsIChkKSAtPiByZXR1cm4gZC5kYXRhLmNvbG9yKVxuICAgICAgICAuYXR0cihcInN0cm9rZVwiLCAoZCkgLT4gcmV0dXJuIGlmIGQuZGF0YS52YWx1ZSA9PSAwIHRoZW4gXCJub25lXCIgZWxzZSBcIiM1NDU0NTRcIilcbiAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMC4yNSlcbiAgICAgICAgLmF0dHIoXCJkXCIsIChkKSAtPiAgXG4gICAgICAgICAgYXJjKGQpXG4gICAgICAgIClcbiAgICAgICAgXG4gICAgICAnJydcbiAgICAgIGVsID0gQCQoJy52aXonKVtpbmRleF1cbiAgICAgIHggPSBkMy5zY2FsZS5saW5lYXIoKVxuICAgICAgICAuZG9tYWluKFswLCBtYXhfdmFsdWVdKVxuICAgICAgICAucmFuZ2UoWzAsIDQwMF0pXG4gICAgICBjaGFydCA9IGQzLnNlbGVjdChlbClcbiAgICAgIGNoYXJ0LnNlbGVjdEFsbChcImRpdi5yYW5nZVwiKVxuICAgICAgICAuZGF0YSh0MnJhbmdlcylcbiAgICAgICcnJ1xuICAgICAgZWwgPSBAJChwaWVfbmFtZStcIl9sZWdlbmRcIilbMF1cbiAgICAgIGNoYXJ0ID0gZDMuc2VsZWN0KGVsKVxuICAgICAgbGVnZW5kcyA9IGNoYXJ0LnNlbGVjdEFsbChwaWVfbmFtZStcIl9sZWdlbmRcIilcbiAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgIC5lbnRlcigpLmluc2VydChcImRpdlwiKVxuICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJsZWdlbmQtcm93XCIpXG5cbiAgICAgIGxlZ2VuZHMuYXBwZW5kKFwic3BhblwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwicGllLWxhYmVsLXN3YXRjaFwiKVxuICAgICAgICAuc3R5bGUoJ2JhY2tncm91bmQtY29sb3InLCAoZCxpKSAtPiBkLmNvbG9yKVxuICAgICAgXG4gICAgICBsZWdlbmRzLmFwcGVuZChcInNwYW5cIilcbiAgICAgICAgLnRleHQoKGQsaSkgLT4gcmV0dXJuIGRhdGFbaV0ubGFiZWwpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJwaWUtbGFiZWxcIilcblxuICAgICAgXG5cbiAgZ2V0VG90YWxBcmVhUGVyY2VudDogKHByb3Bfc2l6ZXMpID0+XG5cbiAgICBmb3IgcHMgaW4gcHJvcF9zaXplc1xuICAgICAgaWYgcHMuTkFNRSA9PSBcIlBlcmNlbnQgb2YgVG90YWwgQXJlYVwiXG4gICAgICAgIHJldHVybiBwcy5TSVpFX1NRS01cbiAgICByZXR1cm4gMC4wXG5cbiAgZ2V0QXZlcmFnZU1pbkRpbTogKHByb3Bfc2l6ZXMpID0+XG4gICAgZm9yIHBzIGluIHByb3Bfc2l6ZXNcbiAgICAgIGlmIHBzLk5BTUUgPT0gXCJBdmVyYWdlXCJcbiAgICAgICAgcmV0dXJuIHBzLk1JTl9ESU1cblxuICBjbGVhbnVwRGF0YTogKHByb3Bfc2l6ZXMsIGlzQ29sbGVjdGlvbikgPT5cbiAgICBjbGVhbmVkX3Byb3BzID0gW11cbiAgICBudW1fc2tldGNoZXMgPSBwcm9wX3NpemVzPy5sZW5ndGhcbiAgICBmb3IgcHMgaW4gcHJvcF9zaXplc1xuICAgICAgaWYgcHMuTkFNRSAhPSBcIlBlcmNlbnQgb2YgVG90YWwgQXJlYVwiXG4gICAgICAgIHBzLk1JTl9ESU0gPSBwYXJzZUZsb2F0KHBzLk1JTl9ESU0pLnRvRml4ZWQoMSlcbiAgICAgICAgcHMuU0laRV9TUUtNID0gcGFyc2VGbG9hdChwcy5TSVpFX1NRS00pLnRvRml4ZWQoMSlcbiAgICAgICAgaWYgcHMuU0laRV9TUUtNIDwgMC4xXG4gICAgICAgICAgcHMuU0laRV9TUUtNID0gXCI8IDAuMVwiXG4gICAgICAgIHBzLkNPQVNUID0gTnVtYmVyKHBzLkNPQVNUKS50b0ZpeGVkKDEpXG4gICAgICAgIGlmIHBzLkNPQVNUID09IDAgXG4gICAgICAgICAgcHMuQ09BU1QgPSBcIi0tXCJcbiAgICAgICAgI2Rvbid0IGluY2x1ZGUgYXZlcmFnZSBmb3Igc2luZ2Ugc2tldGNoXG4gICAgICAgIGlmIG51bV9za2V0Y2hlcyA9PSAzIFxuICAgICAgICAgIGlmIHBzLk5BTUUgIT0gXCJBdmVyYWdlXCJcbiAgICAgICAgICAgIGNsZWFuZWRfcHJvcHMucHVzaChwcylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNsZWFuZWRfcHJvcHMucHVzaChwcylcbiAgICAgIGlmIHBzLk5BTUUgPT0gXCJBdmVyYWdlXCJcbiAgICAgICAgcHMuQ1NTX0NMQVNTID0gXCJpc19hdmdcIlxuICAgICAgZWxzZVxuICAgICAgICBwcy5DU1NfQ0xBU1MgPSBcIm5vdF9hdmdcIlxuXG4gICAgcmV0dXJuIGNsZWFuZWRfcHJvcHNcblxuICBnZXRNaW5EaW1Db3VudDogKHByb3Bfc2l6ZXMpID0+XG4gICAgbnVtX21lZXRfY3JpdGVyaWEgPSAwXG4gICAgdG90YWxfbWluX3NpemUgPSAwXG5cbiAgICBmb3IgcHMgaW4gcHJvcF9zaXplc1xuICAgICAgaWYgcHMuTkFNRSAhPSBcIkF2ZXJhZ2VcIiAmJiBwcy5NSU5fRElNID4gNSBcbiAgICAgICAgbnVtX21lZXRfY3JpdGVyaWErPTFcblxuICAgIHJldHVybiBudW1fbWVldF9jcml0ZXJpYVxuXG4gIGFkZENvbW1hczogKG51bV9zdHIpID0+XG4gICAgbnVtX3N0ciArPSAnJ1xuICAgIHggPSBudW1fc3RyLnNwbGl0KCcuJylcbiAgICB4MSA9IHhbMF1cbiAgICB4MiA9IGlmIHgubGVuZ3RoID4gMSB0aGVuICcuJyArIHhbMV0gZWxzZSAnJ1xuICAgIHJneCA9IC8oXFxkKykoXFxkezN9KS9cbiAgICB3aGlsZSByZ3gudGVzdCh4MSlcbiAgICAgIHgxID0geDEucmVwbGFjZShyZ3gsICckMScgKyAnLCcgKyAnJDInKVxuICAgIHJldHVybiB4MSArIHgyXG5cbm1vZHVsZS5leHBvcnRzID0gT3ZlcnZpZXdUYWIiLCJPdmVydmlld1RhYiA9IHJlcXVpcmUgJy4vb3ZlcnZpZXcuY29mZmVlJ1xuVXNlc1RhYiA9IHJlcXVpcmUgJy4vdXNlcy5jb2ZmZWUnXG5FbnZpcm9ubWVudFRhYiA9IHJlcXVpcmUgJy4vZW52aXJvbm1lbnQuY29mZmVlJ1xuRmlzaGluZ1RhYiA9IHJlcXVpcmUgJy4vZmlzaGluZy5jb2ZmZWUnXG5cbndpbmRvdy5hcHAucmVnaXN0ZXJSZXBvcnQgKHJlcG9ydCkgLT5cbiAgcmVwb3J0LnRhYnMgW092ZXJ2aWV3VGFiLCBFbnZpcm9ubWVudFRhYiwgRmlzaGluZ1RhYixVc2VzVGFiXVxuICAjIHBhdGggbXVzdCBiZSByZWxhdGl2ZSB0byBkaXN0L1xuICByZXBvcnQuc3R5bGVzaGVldHMgWycuL3JlcG9ydC5jc3MnXVxuIiwiUmVwb3J0VGFiID0gcmVxdWlyZSAncmVwb3J0VGFiJ1xudGVtcGxhdGVzID0gcmVxdWlyZSAnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxuX3BhcnRpYWxzID0gcmVxdWlyZSAnLi4vbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cbmlkcyA9IHJlcXVpcmUgJy4vaWRzLmNvZmZlZSdcbmZvciBrZXksIHZhbHVlIG9mIGlkc1xuICB3aW5kb3dba2V5XSA9IHZhbHVlXG5cblxuY2xhc3MgVXNlc1RhYiBleHRlbmRzIFJlcG9ydFRhYlxuICAjIHRoaXMgaXMgdGhlIG5hbWUgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgVGFiXG4gIG5hbWU6ICdPdGhlcidcbiAgY2xhc3NOYW1lOiAndXNlcydcbiAgdGltZW91dDogMTIwMDAwXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZXMudXNlc1xuICBkZXBlbmRlbmNpZXM6IFtcbiAgICAnT3ZlcmxhcFdpdGhSZWNyZWF0aW9uYWxVc2VzJ1xuICAgICdTcGVjaWVzSW5mb3JtYXRpb24nXG4gIF1cblxuXG4gIHJlbmRlcjogKCkgLT5cblxuICAgICNzaG93IHRhYmxlcyBpbnN0ZWFkIG9mIGdyYXBoIGZvciBJRVxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgZDNJc1ByZXNlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgZDNJc1ByZXNlbnQgPSBmYWxzZVxuXG4gICAgI3NwZWNpZXMgaW5mb1xuICAgIHRyeVxuICAgICAgc2VhYmlyZHMgPSBAcmVjb3JkU2V0KCdTcGVjaWVzSW5mb3JtYXRpb24nLCAnU2VhYmlyZHMnKS50b0FycmF5KClcbiAgICAgIGhhc1NlYWJpcmRBcmVhcyA9IHNlYWJpcmRzPy5sZW5ndGggPiAwXG4gICAgY2F0Y2ggRXJyb3JcbiAgICAgIGhhc1NlYWJpcmRBcmVhcyA9IGZhbHNlXG5cbiAgICB0cnlcbiAgICAgIHNlYWJpcmRfY29sb25pZXMgPSBAcmVjb3JkU2V0KCdTcGVjaWVzSW5mb3JtYXRpb24nLCAnU2VhYmlyZENvbG9uaWVzJykudG9BcnJheSgpXG4gICAgICBoYXNTZWFiaXJkQ29sb25pZXMgPSBzZWFiaXJkX2NvbG9uaWVzPy5sZW5ndGggPiAwXG4gICAgY2F0Y2ggRXJyb3JcbiAgICAgIGhhc1NlYWJpcmRDb2xvbmllcyA9IGZhbHNlXG5cbiAgICBcbiAgICBoYXNTZWFiaXJkcyA9IChzZWFiaXJkcz8ubGVuZ3RoPiAwIG9yIHNlYWJpcmRfY29sb25pZXM/Lmxlbmd0aCA+IDApXG4gICAgbWFtbWFscyA9IEByZWNvcmRTZXQoJ1NwZWNpZXNJbmZvcm1hdGlvbicsICdNYW1tYWxzJykudG9BcnJheSgpXG4gICAgaGFzTWFtbWFscyA9IG1hbW1hbHM/Lmxlbmd0aCA+IDBcbiAgICB0cnlcbiAgICAgIHNlYWxzID0gQHJlY29yZFNldCgnU3BlY2llc0luZm9ybWF0aW9uJywgJ1NlYWxzJykudG9BcnJheSgpXG4gICAgICBoYXNTZWFscyA9IHNlYWxzPy5sZW5ndGggPiAwXG4gICAgY2F0Y2ggRXJyb3JcbiAgICAgIGhhc1NlYWxzID0gZmFsc2VcblxuICAgIFxuICAgIHJlZWZfZmlzaCA9IEByZWNvcmRTZXQoJ1NwZWNpZXNJbmZvcm1hdGlvbicsICdSZWVmRmlzaCcpLnRvQXJyYXkoKVxuICAgIGluSGlnaERpdmVyc2l0eVJlZWZGaXNoQXJlYSA9IHJlZWZfZmlzaD8ubGVuZ3RoID4gMFxuXG4gICAgc21hcm8gPSBcIlNNQVJPXCJcbiAgICByZWNfdXNlcyA9IEByZWNvcmRTZXQoJ092ZXJsYXBXaXRoUmVjcmVhdGlvbmFsVXNlcycsICdSZWNyZWF0aW9uYWxVc2UnKS50b0FycmF5KClcbiAgICBoYXNTbWFybyA9IGZhbHNlXG5cblxuICAgIG5vbl9zbWFyb19yZWNfdXNlcyA9IHJlY191c2VzLmZpbHRlciAocmVjKSAtPiByZWMuRkVBVF9UWVBFICE9IHNtYXJvXG4gICAgaGFzUmVjVXNlcyA9IG5vbl9zbWFyb19yZWNfdXNlcz8ubGVuZ3RoID4gMFxuICAgIFxuICAgIGhlcml0YWdlID0gQHJlY29yZFNldCgnT3ZlcmxhcFdpdGhSZWNyZWF0aW9uYWxVc2VzJywgJ0hlcml0YWdlJykudG9BcnJheSgpXG4gICAgaGFzSGVyaXRhZ2UgPSBoZXJpdGFnZT8ubGVuZ3RoID4gMFxuICAgIGNvYXN0YWxfY29uc2VudHMgPSBAcmVjb3JkU2V0KCdPdmVybGFwV2l0aFJlY3JlYXRpb25hbFVzZXMnLCAnQ29hc3RhbENvbnNlbnRzJykudG9BcnJheSgpXG4gICAgaGFzQ29hc3RhbCA9IGNvYXN0YWxfY29uc2VudHM/Lmxlbmd0aCA+IDBcbiAgICBpbmZyYXN0cnVjdHVyZSA9ICBAcmVjb3JkU2V0KCdPdmVybGFwV2l0aFJlY3JlYXRpb25hbFVzZXMnLCAnSW5mcmFzdHJ1Y3R1cmUnKS50b0FycmF5KClcbiAgICBoYXNJbmZyYXN0cnVjdHVyZSA9IGluZnJhc3RydWN0dXJlPy5sZW5ndGggPiAwXG4gICAgYXR0cmlidXRlcyA9IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICBcbiAgICBoYXNVc2VzID0gaGFzUmVjVXNlcyBvciBoYXNIZXJpdGFnZSBvciBoYXNJbmZyYXN0cnVjdHVyZSBvciBoYXNDb2FzdGFsXG4gICAgaGFzTWFyaW5lU3BlY2llcyA9IGhhc01hbW1hbHMgb3IgaGFzU2VhbHNcblxuICAgIGlzQ29sbGVjdGlvbiA9IEBtb2RlbC5pc0NvbGxlY3Rpb24oKVxuICAgIGNvbnRleHQgPVxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcbiAgICAgIHJlY191c2VzOiBub25fc21hcm9fcmVjX3VzZXNcbiAgICAgIGhhc1NtYXJvOiBoYXNTbWFyb1xuICAgICAgaGFzUmVjVXNlczogaGFzUmVjVXNlc1xuICAgICAgaGVyaXRhZ2U6IGhlcml0YWdlXG4gICAgICBoYXNIZXJpdGFnZTogaGFzSGVyaXRhZ2VcbiAgICAgIGNvYXN0YWxfY29uc2VudHM6IGNvYXN0YWxfY29uc2VudHNcbiAgICAgIGhhc0NvYXN0YWw6IGhhc0NvYXN0YWxcbiAgICAgIGluZnJhc3RydWN0dXJlOiBpbmZyYXN0cnVjdHVyZVxuICAgICAgaGFzSW5mcmFzdHJ1Y3R1cmU6IGhhc0luZnJhc3RydWN0dXJlXG4gICAgICBoYXNVc2VzOiBoYXNVc2VzXG4gICAgICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvblxuXG4gICAgICAjc3BlY2llcyBpbmZvXG4gICAgICBzZWFiaXJkczogc2VhYmlyZHNcbiAgICAgIHNlYWJpcmRfY29sb25pZXM6IHNlYWJpcmRfY29sb25pZXNcbiAgICAgIGhhc1NlYWJpcmRzOiBoYXNTZWFiaXJkc1xuICAgICAgaGFzU2VhYmlyZEFyZWFzOiBoYXNTZWFiaXJkQXJlYXNcbiAgICAgIGhhc1NlYWJpcmRDb2xvbmllczogaGFzU2VhYmlyZENvbG9uaWVzXG4gICAgICBcbiAgICAgIG1hbW1hbHM6IG1hbW1hbHNcbiAgICAgIGhhc01hbW1hbHM6IGhhc01hbW1hbHNcbiAgICAgIHJlZWZfZmlzaDogcmVlZl9maXNoXG4gICAgICBzZWFsczogc2VhbHNcbiAgICAgIGhhc1NlYWxzOiBoYXNTZWFsc1xuXG4gICAgICBpbkhpZ2hEaXZlcnNpdHlSZWVmRmlzaEFyZWE6IGluSGlnaERpdmVyc2l0eVJlZWZGaXNoQXJlYVxuICAgICAgaGFzTWFyaW5lU3BlY2llczogaGFzTWFyaW5lU3BlY2llc1xuXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgcGFydGlhbHMpXG4gICAgQGVuYWJsZUxheWVyVG9nZ2xlcnMoKVxuXG4gICAgXG5cbm1vZHVsZS5leHBvcnRzID0gVXNlc1RhYiIsInRoaXNbXCJUZW1wbGF0ZXNcIl0gPSB0aGlzW1wiVGVtcGxhdGVzXCJdIHx8IHt9O1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcImRlbW9cIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+UmVwb3J0IFNlY3Rpb25zPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwPlVzZSByZXBvcnQgc2VjdGlvbnMgdG8gZ3JvdXAgaW5mb3JtYXRpb24gaW50byBtZWFuaW5nZnVsIGNhdGVnb3JpZXM8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5EMyBWaXN1YWxpemF0aW9uczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8dWwgY2xhc3M9XFxcIm5hdiBuYXYtcGlsbHNcXFwiIGlkPVxcXCJ0YWJzMlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxsaSBjbGFzcz1cXFwiYWN0aXZlXFxcIj48YSBocmVmPVxcXCIjY2hhcnRcXFwiPkNoYXJ0PC9hPjwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxsaT48YSBocmVmPVxcXCIjZGF0YVRhYmxlXFxcIj5UYWJsZTwvYT48L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC91bD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInRhYi1jb250ZW50XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwidGFiLXBhbmUgYWN0aXZlXFxcIiBpZD1cXFwiY2hhcnRcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwhLS1baWYgSUUgOF0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcInVuc3VwcG9ydGVkXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICBUaGlzIHZpc3VhbGl6YXRpb24gaXMgbm90IGNvbXBhdGlibGUgd2l0aCBJbnRlcm5ldCBFeHBsb3JlciA4LiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICBQbGVhc2UgdXBncmFkZSB5b3VyIGJyb3dzZXIsIG9yIHZpZXcgcmVzdWx0cyBpbiB0aGUgdGFibGUgdGFiLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD4gICAgICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8IVtlbmRpZl0tLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIFNlZSA8Y29kZT5zcmMvc2NyaXB0cy9kZW1vLmNvZmZlZTwvY29kZT4gZm9yIGFuIGV4YW1wbGUgb2YgaG93IHRvIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgdXNlIGQzLmpzIHRvIHJlbmRlciB2aXN1YWxpemF0aW9ucy4gUHJvdmlkZSBhIHRhYmxlLWJhc2VkIHZpZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIGFuZCB1c2UgY29uZGl0aW9uYWwgY29tbWVudHMgdG8gcHJvdmlkZSBhIGZhbGxiYWNrIGZvciBJRTggdXNlcnMuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8YnI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8YSBocmVmPVxcXCJodHRwOi8vdHdpdHRlci5naXRodWIuaW8vYm9vdHN0cmFwLzIuMy4yL1xcXCI+Qm9vdHN0cmFwIDIueDwvYT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIGlzIGxvYWRlZCB3aXRoaW4gU2VhU2tldGNoIHNvIHlvdSBjYW4gdXNlIGl0IHRvIGNyZWF0ZSB0YWJzIGFuZCBvdGhlciBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIGludGVyZmFjZSBjb21wb25lbnRzLiBqUXVlcnkgYW5kIHVuZGVyc2NvcmUgYXJlIGFsc28gYXZhaWxhYmxlLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInRhYi1wYW5lXFxcIiBpZD1cXFwiZGF0YVRhYmxlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+aW5kZXg8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD52YWx1ZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJjaGFydERhdGFcIixjLHAsMSksYyxwLDAsMTM1MSwxNDE4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgPHRyPjx0ZD5cIik7Xy5iKF8udihfLmYoXCJpbmRleFwiLGMscCwwKSkpO18uYihcIjwvdGQ+PHRkPlwiKTtfLmIoXy52KF8uZihcInZhbHVlXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD48L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIGVtcGhhc2lzXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5FbXBoYXNpczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cD5HaXZlIHJlcG9ydCBzZWN0aW9ucyBhbiA8Y29kZT5lbXBoYXNpczwvY29kZT4gY2xhc3MgdG8gaGlnaGxpZ2h0IGltcG9ydGFudCBpbmZvcm1hdGlvbi48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHdhcm5pbmdcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0Pldhcm5pbmc8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHA+T3IgPGNvZGU+d2FybjwvY29kZT4gb2YgcG90ZW50aWFsIHByb2JsZW1zLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gZGFuZ2VyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5EYW5nZXI8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHA+PGNvZGU+ZGFuZ2VyPC9jb2RlPiBjYW4gYWxzbyBiZSB1c2VkLi4uIHNwYXJpbmdseS48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcImVudmlyb25tZW50XCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO2lmKF8ucyhfLmQoXCJza2V0Y2hDbGFzcy5kZWxldGVkXCIsYyxwLDEpLGMscCwwLDI0LDI3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtd2FyblxcXCIgc3R5bGU9XFxcIm1hcmdpbi1ib3R0b206MTBweDtcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgVGhpcyBza2V0Y2ggd2FzIGNyZWF0ZWQgdXNpbmcgdGhlIFxcXCJcIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiB0ZW1wbGF0ZSwgd2hpY2ggaXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIG5vIGxvbmdlciBhdmFpbGFibGUuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIGNvcHkgdGhpcyBza2V0Y2ggb3IgbWFrZSBuZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIHNrZXRjaGVzIG9mIHRoaXMgdHlwZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+SGFiaXRhdHMgUHJlc2VudCBpbiBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzODIsMzkyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJDb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiU2tldGNoXCIpO307Xy5iKFwiIDxhIGhyZWY9XFxcIiNcXFwiIGRhdGEtdG9nZ2xlLW5vZGU9XFxcIjU1MzZkYmI0OGM1YjQzZWIwZmFjYmM1YVxcXCIgZGF0YS12aXNpYmxlPVxcXCJmYWxzZVxcXCI+c2hvdyBsYXllcjwvYT48L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIEFyZWEgKCUpIHJlZmVycyB0byB0aGUgcGVyY2VudGFnZSBvZiB0aGUgaGFiaXRhdCBjb250YWluZWQgd2l0aGluIHRoZSBcIik7aWYoXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMCw2NTcsNjY3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwibmV0d29ya1wiKTt9O18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBcIik7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgYXMgYSBwcm9wb3J0aW9uIG9mIHRoZSB0b3RhbCBhcmVhIG9mIGhhYml0YXQgd2l0aGluIHRoZSBTb3V0aC1FYXN0IE1hcmluZSByZWdpb24uIFwiKTtpZighXy5zKF8uZihcImlzQ29uZmlkXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwi4oCYUGF0Y2ggc2l6ZeKAmSBmb3Igc3VidGlkYWwgaGFiaXRhdHMgcmVmZXJzIHRvIHRoZSB3aWR0aCBvZiB0aGUgbGFyZ2VzdCBwYXRjaCBpbmNsdWRlZCBpbiBhIFR5cGUtMSBNUEEuIEZvciBpbnRlcnRpZGFsIGhhYml0YXRzIHRoaXMgcmVmZXJzIHRvIHRoZSBtYXhpbXVtIGxlbmd0aC4gV2hldGhlciBhIGhhYml0YXQgaXMgY29uc2lkZXJlZCDigJhSZXByZXNlbnRhdGl2ZeKAmSB1bmRlciB0aGUgUG9saWN5IHdpbGwgbmVlZCB0byBiZSBhc3Nlc3NlZCBvbiBhIGNhc2UgYnkgY2FzZSBiYXNpcywgdGFraW5nIGludG8gYWNjb3VudCBzdWNoIHRoaW5ncyBhcyBpbmRpdmlkdWFsIHBhdGNoIHNpemUgYW5kIHByb3BvcnRpb24gb2YgaGFiaXRhdC4g4oCZUmVwbGljYXRlIENvdW504oCZIHJlZmVycyB0byB0aGVyZSBiZWluZyAyIGV4YW1wbGVzIG9mIHRoZSBoYWJpdGF0IHR5cGUgaW5jbHVkZWQgaW4gYXQgbGVhc3QgdHdvIFR5cGUtMiBNUEEuXCIpO307Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIFwiKTtpZihfLnMoXy5mKFwiaXNDb25maWRcIixjLHAsMSksYyxwLDAsMTM2NCwxODM2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJBcmVhICglKSByZWZlcnMgdG8gdGhlIHBlcmNlbnRhZ2Ugb2YgdGhlIGhhYml0YXQgY29udGFpbmVkIHdpdGhpbiB0aGUgbmV0d29yayBhcyBhIHByb3BvcnRpb24gb2YgdGhlIHRvdGFsIGFyZWEgb2YgaGFiaXRhdCB3aXRoaW4gdGhlIFNvdXRoLUVhc3QgTWFyaW5lIHJlZ2lvbi4gQSBoYWJpdGF0LXR5cGUgbGlzdGVkIGFzIOKAnUluY2x1ZGVk4oCdIGRvZXMgbm90IG5lY2Vzc2FyaWx5IG1lYW4gdGhhdCBpdCBtZWV0cyB0aGUgcmVxdWlyZW1lbnQgb2YgYmVpbmcgdmlhYmxlIGFuZCB0aGVyZWZvcmUgcmVwcmVzZW50YXRpdmUgb2YgdGhhdCBoYWJpdGF0IHR5cGUgaW4gdGhlIG5ldHdvcmsuIFRoaXMgd2lsbCBuZWVkIHRvIGJlIGFzc2Vzc2VkIG9uIGEgY2FzZSBieSBjYXNlIGJhc2lzLCB0YWtpbmcgaW50byBhY2NvdW50IHN1Y2ggdGhpbmdzIGFzIGluZGl2aWR1YWwgcGF0Y2ggc2l6ZSBhbmQgcHJvcG9ydGlvbiBvZiBoYWJpdGF0LlwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvaT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxwIGNsYXNzPVxcXCJpbi1yZXBvcnQtaGVhZGVyXFxcIj5Db2FzdGFsIEhhYml0YXQgVHlwZXM8L3A+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwwLDE5NTEsMjg4MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjIwXFxcIiBjbGFzcz1cXFwiY29hc3RhbF9oYWJfdGFibGVcXFwiPiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aCBjbGFzcz1cXFwic29ydGluZ19jb2xcXFwiIHN0eWxlPVxcXCJ3aWR0aDoxNTBweDtcXFwiPjxhIGNsYXNzPVxcXCJjb2FzdGFsX2hhYl90eXBlIHNvcnRfdXBcXFwiIGhyZWY9XFxcIiNcXFwiPkhhYml0YXQ8L2E+PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD48YSAgY2xhc3M9XFxcImNvYXN0YWxfaGFiX25ld19hcmVhIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCIgPkFyZWEgKGttPHN1cD4yPC9zdXA+KTwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJjb2FzdGFsX2hhYl9uZXdfcGVyYyBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiPkFyZWEgKCUpPC9hPjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDIzODEsMjc2MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcImNvYXN0YWxfaGFiX3JlcHJlc2VudCBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiID5cIik7Xy5iKF8udihfLmYoXCJSRVBfTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwyNTA0LDI3MjgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICAgIDx0aD48YSBjbGFzcz1cXFwiY29hc3RhbF9oYWJfcmVwbGljYXRlIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCI+UmVwbGljYXRlIENvdW50PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcImNvYXN0YWxfaGFiX2Nvbm5lY3RlZCBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiPkNvbm5lY3Rpdml0eSAoaW4ga20pPHN1cD4qPC9zdXA+PC90aD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgPHRib2R5IGNsYXNzPVxcXCJjb2FzdGFsX2hhYl92YWx1ZXNcXFwiPjwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MTgwcHg7XFxcIj5IYWJpdGF0PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5BcmVhIChrbTxzdXA+Mjwvc3VwPik8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPkFyZWEgKCUpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsMzE0MywzMzcwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgPHRoPlBhdGNoIFNpemUgKFR5cGUtMSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMzIyNCwzMzM4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgICAgIDx0aD5SZXBsaWNhdGUgQ291bnQ8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgICAgPHRoPkNvbm5lY3Rpdml0eSAoaW4ga20pPC90aD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzQ29hc3RhbEhhYlR5cGVzXCIsYyxwLDEpLGMscCwwLDM0NzEsMzg5MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImNvYXN0YWxfaGFiX3R5cGVzXCIsYyxwLDEpLGMscCwwLDM1MDgsMzg1NyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJIQUJfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJTSVpFX1NRS01cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiUEVSQ1wiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDM2NjUsMzgxMixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlJFUFJFU0VOVFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMzc0MiwzNzc4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8dGQ+XCIpO18uYihfLnYoXy5mKFwiUkVQTElDXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD48dGQ+XCIpO18uYihfLnYoXy5mKFwiQ09OTlwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc0NvYXN0YWxIYWJUeXBlc1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQgY29sc3Bhbj1cXFwiXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNDAxNyw0MDE4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI1XCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiNFwiKTt9O18uYihcIlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPGk+VGhlcmUgYXJlIG5vIGNvYXN0YWwgaGFiaXRhdCB0eXBlcy48L2k+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCIgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9O18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxwIGNsYXNzPVxcXCJpbi1yZXBvcnQtaGVhZGVyXFxcIj5Fc3R1YXJpbmUgSGFiaXRhdCBUeXBlczwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDAsNDM1Miw1MzA4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMjBcXFwiIGNsYXNzPVxcXCJlc3R1YXJpbmVfaGFiX3RhYmxlXFxcIj4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGggY2xhc3M9XFxcInNvcnRpbmdfY29sXFxcIiBzdHlsZT1cXFwid2lkdGg6MTUwcHg7XFxcIj48YSBjbGFzcz1cXFwiZXN0dWFyaW5lX2hhYl90eXBlIHNvcnRfdXBcXFwiIGhyZWY9XFxcIiNcXFwiPkhhYml0YXQ8L2E+PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD48YSAgY2xhc3M9XFxcImVzdHVhcmluZV9oYWJfbmV3X2FyZWEgc29ydF9kb3duXFxcIiBocmVmPVxcXCIjXFxcIiA+QXJlYSAoa208c3VwPjI8L3N1cD4pPC9hPjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcImVzdHVhcmluZV9oYWJfbmV3X3BlcmMgc29ydF9kb3duXFxcIiBocmVmPVxcXCIjXFxcIj5BcmVhICglKTwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw0NzkwLDUxODQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJlc3R1YXJpbmVfaGFiX3JlcHJlc2VudCBzb3J0X2Rvd25cXFwiIHN0eWxlPVxcXCJ3aWR0aDo4MHB4O1xcXCIgaHJlZj1cXFwiI1xcXCIgPlwiKTtfLmIoXy52KF8uZihcIlJFUF9OQU1FXCIsYyxwLDApKSk7Xy5iKFwiPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDQ5MzUsNTE1MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJlc3R1YXJpbmVfaGFiX3JlcGxpY2F0ZSBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiID5SZXBsaWNhdGUgQ291bnQ8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aD48YSBjbGFzcz1cXFwiZXN0dWFyaW5lX2hhYl9jb25uZWN0ZWQgc29ydF9kb3duXFxcIiBocmVmPVxcXCIjXFxcIj5Db25uZWN0aXZpdHkgKGluIGttKTwvdGg+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgIDx0Ym9keSBjbGFzcz1cXFwiZXN0dWFyaW5lX2hhYl92YWx1ZXNcXFwiPjwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MTUwcHg7XFxcIj5IYWJpdGF0PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5BcmVhIChrbTxzdXA+Mjwvc3VwPik8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRoPkFyZWEgKCUpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsNTU2OSw1Nzk2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgPHRoPlBhdGNoIFNpemUgKFR5cGUtMSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNTY1MCw1NzY0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgICAgICAgIDx0aD5SZXBsaWNhdGUgQ291bnQ8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgICAgPHRoPkNvbm5lY3Rpdml0eSAoaW4ga20pPC90aD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzRXN0dWFyaW5lSGFiVHlwZXNcIixjLHAsMSksYyxwLDAsNTg5OSw2MzI0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZihfLnMoXy5mKFwiZXN0dWFyaW5lX2hhYl90eXBlc1wiLGMscCwxKSxjLHAsMCw1OTM4LDYyODcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiSEFCX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiU0laRV9TUUtNXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlBFUkNcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw2MDk1LDYyNDIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJSRVBSRVNFTlRcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIFwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDYxNzIsNjIwOCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPHRkPlwiKTtfLmIoXy52KF8uZihcIlJFUExJQ1wiLGMscCwwKSkpO18uYihcIjwvdGQ+PHRkPlwiKTtfLmIoXy52KF8uZihcIkNPTk5cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJoYXNFc3R1YXJpbmVIYWJUeXBlc1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQgY29sc3Bhbj1cXFwiXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNjQ1Myw2NDU0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI1XCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiNFwiKTt9O18uYihcIlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPGk+VGhlcmUgYXJlIG5vIGVzdHVhcmluZSBoYWJpdGF0IHR5cGVzLjwvaT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9O18uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIik7fTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxwIGNsYXNzPVxcXCJpbi1yZXBvcnQtaGVhZGVyXFxcIj5TZW5zaXRpdmUgTWFyaW5lIEhhYml0YXRzPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJkM0lzUHJlc2VudFwiLGMscCwxKSxjLHAsMCw2Nzk2LDc2NjksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMjBcXFwiIGNsYXNzPVxcXCJzaWdfaGFiX3RhYmxlXFxcIj4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGggY2xhc3M9XFxcInNvcnRpbmdfY29sXFxcIiBzdHlsZT1cXFwid2lkdGg6MTUwcHg7XFxcIj48YSBjbGFzcz1cXFwic2lnX2hhYl90eXBlIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCI+SGFiaXRhdDwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD48YSAgY2xhc3M9XFxcInNpZ19oYWJfbmV3X2FyZWEgc29ydF91cFxcXCIgaHJlZj1cXFwiI1xcXCIgPkFyZWEgKGttPHN1cD4yPC9zdXA+KTwvYT48L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD48YSBjbGFzcz1cXFwic2lnX2hhYl9uZXdfcGVyYyBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiPkFyZWEgKCUpPC9hPjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDcxOTYsNzU2MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcInNpZ19oYWJfcmVwcmVzZW50IHNvcnRfZG93blxcXCIgc3R5bGU9XFxcIndpZHRoOjgwcHg7XFxcIiBocmVmPVxcXCIjXFxcIj5cIik7Xy5iKF8udihfLmYoXCJSRVBfTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw3MzMyLDc1MzEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcInNpZ19oYWJfcmVwbGljYXRlIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCI+UmVwbGljYXRlIENvdW50PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJzaWdfaGFiX2Nvbm5lY3RlZCBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiPkNvbm5lY3Rpdml0eSAoaW4ga20pIDwvdGg+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgIDx0Ym9keSBjbGFzcz1cXFwic2lnX2hhYl92YWx1ZXNcXFwiPjwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJkM0lzUHJlc2VudFwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoxNzVweDtcXFwiPkhhYml0YXQ8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD5BcmVhIChrbTxzdXA+Mjwvc3VwPik8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD5BcmVhICglKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDc5MTYsODEzNCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgIDx0aD5QYXRjaCBTaXplPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDc5ODgsODEwMixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgICAgICA8dGg+UmVwbGljYXRlIENvdW50PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICAgIDx0aD5Db25uZWN0aXZpdHkgKGluIGttKTwvdGg+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31fLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc1NpZ0hhYnNcIixjLHAsMSksYyxwLDAsODIxNyw4NTkwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZihfLnMoXy5mKFwic2lnX2hhYnNcIixjLHAsMSksYyxwLDAsODI0MSw4NTY4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiSEFCX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlNJWkVfU1FLTVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiUEVSQ1wiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDgzODgsODUyOSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJSRVBSRVNFTlRcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw4NDYxLDg0OTcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjx0ZD5cIik7Xy5iKF8udihfLmYoXCJSRVBMSUNcIixjLHAsMCkpKTtfLmIoXCI8L3RkPjx0ZD5cIik7Xy5iKF8udihfLmYoXCJDT05OXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc1NpZ0hhYnNcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkIGNvbHNwYW49XFxcIlwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDg2ODksODY5MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiNVwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIjRcIik7fTtfLmIoXCJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8aT5UaGVyZSBhcmUgbm8gaGFiaXRhdHMgb2Ygc2lnbmlmaWNhbmNlLjwvaT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9O18uYihcIiAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiKTt9O18uYihcIiAgICA8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8ZW0+U2Vuc2l0aXZlIGhhYml0YXRzIGFyZSBkZWZpbmVkIGluIHRoZSByZXBvcnQgJzxhIGhyZWY9XFxcImh0dHBzOi8vd3d3Lm1mZS5nb3Z0Lm56L3NpdGVzL2RlZmF1bHQvZmlsZXMvc2Vuc2l0aXZlLW1hcmluZS1iZW50aGljLWhhYml0YXRzLWRlZmluZWQucGRmXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+U2Vuc2l0aXZlIG1hcmluZSBiZW50aGljIGhhYml0YXRzIGRlZmluZWQ8L2E+Licg4oCZTkHigJkgaW5kaWNhdGVzIHRoYXQgdGhlIGhhYml0YXQgaXMgbGlrZWx5IHRvIGJlIHByZXNlbnQgaW4gdGhlIHJlZ2lvbiBidXQgbm90IG1hcHBlZC48L2VtPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2hvd0FkamFjZW50XCIsYyxwLDEpLGMscCwwLDkyNzUsMTA2OTEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PkFkamFjZW50IFRlcnJlc3RyaWFsIEluZm9ybWF0aW9uPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwPjxlbT5BcmVhcyBzaG93biBiZWxvdyBhcmUgd2l0aGluIDEwMG0gb2YgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsOTQzNyw5NDYzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJhIHNrZXRjaCBpbiB0aGUgY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiB0aGUgc2tldGNoIFwiKTt9O18uYihcIjwvZW0+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj48c3Ryb25nPlByb3RlY3RlZCBBcmVhczwvc3Ryb25nPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMjBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc1Byb3RlY3RlZFwiLGMscCwxKSxjLHAsMCw5Njc4LDk4MzQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJwcm90ZWN0ZWRfYXJlYXNcIixjLHAsMSksYyxwLDAsOTcxMyw5ODAxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzUHJvdGVjdGVkXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD48ZW0+Tm9uZSBQcmVzZW50PC9lbT48L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj48c3Ryb25nPkNvbnNlcnZhdGlvbiBDb3ZlbmFudHM8L3N0cm9uZz48L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNDb3ZlbmFudHNcIixjLHAsMSksYyxwLDAsMTAxODMsMTA0ODIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJxZTJfY292ZW5hbnRzXCIsYyxwLDEpLGMscCwwLDEwMjE2LDEwMzA0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJuYXBhbGlzX2NvdmVuYW50c1wiLGMscCwxKSxjLHAsMCwxMDM1OSwxMDQ0NyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJOQU1FXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc0NvdmVuYW50c1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+PGVtPk5vbmUgUHJlc2VudDwvZW0+PC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9O18uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcImZpc2hpbmdcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7aWYoXy5zKF8uZChcInNrZXRjaENsYXNzLmRlbGV0ZWRcIixjLHAsMSksYyxwLDAsMjQsMjcwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJhbGVydCBhbGVydC13YXJuXFxcIiBzdHlsZT1cXFwibWFyZ2luLWJvdHRvbToxMHB4O1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBUaGlzIHNrZXRjaCB3YXMgY3JlYXRlZCB1c2luZyB0aGUgXFxcIlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCJcXFwiIHRlbXBsYXRlLCB3aGljaCBpc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgbm8gbG9uZ2VyIGF2YWlsYWJsZS4gWW91IHdpbGwgbm90IGJlIGFibGUgdG8gY29weSB0aGlzIHNrZXRjaCBvciBtYWtlIG5ld1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgc2tldGNoZXMgb2YgdGhpcyB0eXBlLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNBbnlGaXNoaW5nXCIsYyxwLDEpLGMscCwwLDMxNywyNTUyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtpZihfLnMoXy5mKFwiaGFzRXhpc3RpbmdGaXNoaW5nXCIsYyxwLDEpLGMscCwwLDM0NSwxMzgyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGg0PkV4aXN0aW5nIEZpc2hlcmllcyBNYW5hZ2VtZW50PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHA+PGVtPlRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw0NzYsNDgzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJuZXR3b3JrXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiU2tldGNoXCIpO307Xy5iKFwiIGluY2x1ZGVzIHRoZSBmb2xsb3dpbmcgZXhpc3RpbmcgZmlzaGVyaWVzIHJlc3RyaWN0aW9ucy4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIEFsc28gc2hvd24gaXMgdGhlIGV4dGVudCB0aGF0IHRoZSBmaXNoZXJpZXMgcmVzdHJpY3Rpb25zIGFwcGx5IHRvIHRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw2OTUsNzAzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJza2V0Y2hlc1wiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBcIik7aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgYXMgYSBwZXJjZW50YWdlIG9mIHRvdGFsIHNrZXRjaCBhcmVhLiBGb3IgZXhhbXBsZSwgMTAwJSBtZWFucyBubyBmaXNoaW5nIG9mIHRoYXQgdHlwZSBpcyBjdXJyZW50bHkgYWxsb3dlZCB3aXRoaW4gdGhlIHNrZXRjaC48L2VtPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjI1MHB4O1xcXCI+TmFtZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0aD5QZXJjZW50PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImV4aXN0aW5nX2Zpc2hpbmdfYXJlYXNcIixjLHAsMSksYyxwLDAsMTE2NywxMjk5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkZFQVRfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJQRVJDX0FSRUFcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImhhc0N1c3RvbWFyeVwiLGMscCwxKSxjLHAsMCwxNDI3LDI1MzMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGg0PkN1c3RvbWFyeSBBcmVhczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc0V4aXN0aW5nQ3VzdG9tYXJ5XCIsYyxwLDEpLGMscCwwLDE1NDMsMTk4NyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDxwPiBUaGUgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMTU3OSwxNTg2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJuZXR3b3JrXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic2tldGNoXCIpO307Xy5iKFwiIGluY2x1ZGVzIHRoZSBmb2xsb3dpbmcgPHN0cm9uZz5leGlzdGluZzwvc3Ryb25nPiBDdXN0b21hcnkgQXJlYXM6PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImV4aXN0aW5nX2N1c3RvbWFyeV9maXNoaW5nXCIsYyxwLDEpLGMscCwwLDE4MTQsMTkwNyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJGRUFUX1RZUEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaGFzUHJvcG9zZWRDdXN0b21hcnlcIixjLHAsMSksYyxwLDAsMjA0NiwyNDkwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgPHA+IFRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwyMDgyLDIwODksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIm5ldHdvcmtcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgaW5jbHVkZXMgdGhlIGZvbGxvd2luZyA8c3Ryb25nPnByb3Bvc2VkPC9zdHJvbmc+IEN1c3RvbWFyeSBBcmVhczo8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwicHJvcG9zZWRfY3VzdG9tYXJ5X2Zpc2hpbmdcIixjLHAsMSksYyxwLDAsMjMxNywyNDEwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkZFQVRfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzQW55RmlzaGluZ1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5FeGlzdGluZyBvciBDdXN0b21hcnkgQXJlYXM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHA+Tm8gaW5mb3JtYXRpb24gb24gZXhpc3RpbmcgZmlzaGluZyBhcmVhcyBvciBjdXN0b21hcnkgdXNlIGlzIGF2YWlsYWJsZSBmb3IgdGhpcyBhcmVhLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc0NvbmZpZGVudGlhbE1QQU5ldHdvcmtcIixjLHAsMSksYyxwLDAsMjgzNSw1MDgxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGg0PkZpc2hpbmcgSW50ZW5zaXR5PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPGVtPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIFlvdXIgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMjk4MSwyOTg4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJuZXR3b3JrXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic2tldGNoXCIpO307Xy5iKFwiIGluY2x1ZGVzIGFyZWFzIGlkZW50aWZpZWQgYXMgaGF2aW5nIGhpZ2gsIG1vZGVyYXRlIG9yIGxvdyBpbnRlbnNpdHkgZmlzaGluZyBncm91bmRzIGZvciB0aGUgZm9sbG93aW5nIGZpc2hlcmllcy4gVGhlIHBlcmNlbnRhZ2Ugb2YgdGhlIHJlZ2lvbnMgaGlnaCwgbW9kZXJhdGUgYW5kIGxvdyBpbnRlbnNpdHkgZmlzaGluZyBncm91bmRzIGNvdmVyZWQgYnkgeW91ciBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzMjcxLDMyNzgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIm5ldHdvcmtcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIgaXMgZ2l2ZW4gYmVsb3cuIEZpc2hlcnkgZGlzcGxhY2VtZW50IHNob3dzIHRoZSBwZXJjZW50YWdlIG9mIHRoZSByZWdpb25zIGZpc2hlcnkgdGhhdCB3b3VsZCBiZSBkaXNwbGFjZWQgYnkgeW91ciBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzNDY2LDM0NzMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIm5ldHdvcmtcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCIuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC9lbT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJkM0lzUHJlc2VudFwiLGMscCwxKSxjLHAsMCwzNTkxLDQzMjgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMjBcXFwiIGNsYXNzPVxcXCJmaXNoZXJ5X3RhYmxlXFxcIj4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XFxcInNvcnRpbmdfY29sXFxcIiBzdHlsZT1cXFwid2lkdGg6MTUwcHg7XFxcIj48YSBjbGFzcz1cXFwiZmlzaGVyeV90eXBlIHNvcnRfdXBcXFwiIGhyZWY9XFxcIiNcXFwiPkZpc2hlcnk8L2E+PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGg+PGEgY2xhc3M9XFxcImZpc2hlcnlfaGlnaCBzb3J0X2Rvd25cXFwiIGhyZWY9XFxcIiNcXFwiID5IaWdoICglKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJmaXNoZXJ5X21vZGVyYXRlIHNvcnRfZG93blxcXCIgaHJlZj1cXFwiI1xcXCI+TW9kZXJhdGUgKCUpPC9hPjwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgICAgPHRoPjxhIGNsYXNzPVxcXCJmaXNoZXJ5X2xvdyBzb3J0X2Rvd25cXFwiIHN0eWxlPVxcXCJ3aWR0aDo4MHB4O1xcXCIgaHJlZj1cXFwiI1xcXCIgPkxvdyAoJSk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aD48YSBjbGFzcz1cXFwiZmlzaGVyeV9kaXNwIHNvcnRfZG93blxcXCIgc3R5bGU9XFxcIndpZHRoOjgwcHg7XFxcIiBocmVmPVxcXCIjXFxcIiA+RmlzaGVyeSBkaXNwbGFjZW1lbnQgKCUpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgIDx0Ym9keSBjbGFzcz1cXFwiZmlzaGVyeV92YWx1ZXNcXFwiPjwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJkM0lzUHJlc2VudFwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MTI1cHg7XFxcIj5GaXNoZXJ5PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRoPkhpZ2ggKCUpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRoPk1vZGVyYXRlICglKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICAgIDx0aD5Mb3cgKCUpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRoPkZpc2hlcnkgZGlzcGxhY2VtZW50ICglKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJmaXNoZXJ5X2ludGVuc2l0eVwiLGMscCwxKSxjLHAsMCw0NzUyLDQ5ODQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRklTSF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkhJR0hcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTU9ERVJBVEVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTE9XXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkRJU1BcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9O18uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiPCEtLVwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw1MTI3LDcwMDgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5GaXNoaW5nIEludGVuc2l0eTwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIFRoZSBmb2xsb3dpbmcgdGFibGVzIGNvbnRhaW5zIHRoZSBwZXJjZW50IG9mIHRoZSB0b3RhbCBTRU1QRiBsb3cgaW50ZW5zaXR5IGFuZCBoaWdoIGludGVuc2l0eSBmaXNoaW5nIHRoYXQgbWF5IGJlIGRpc3BsYWNlZCBieSB0aGUgc2tldGNoLiA8c3Ryb25nPkhpZ2ggaW50ZW5zaXR5PC9zdHJvbmc+IGlzIGdyZWF0ZXIgdGhhbiBhbiBhdmVyYWdlIG9mIDUgZXZlbnRzIHBlciBhbm51bSwgPHN0cm9uZz5Mb3c8L3N0cm9uZz4gaXMgNSBvciBsZXNzIGV2ZW50cyBwZXIgYW5udW0uXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJpbi1yZXBvcnQtaGVhZGVyXFxcIj5UcmF3bCBGaXNoaW5nIEludGVuc2l0eTwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD5Ta2V0Y2ggTmFtZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPiUgTG93IEludGVuc2l0eTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPiUgSGlnaCBJbnRlbnNpdHk8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJ0cmF3bFwiLGMscCwxKSxjLHAsMCw1ODIyLDU5NTMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJMT1dcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJISUdIXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImluLXJlcG9ydC1oZWFkZXJcXFwiPlNldCBOZXQgRmlzaGluZyBJbnRlbnNpdHk8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5Ta2V0Y2ggTmFtZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+JSBMb3cgSW50ZW5zaXR5PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD4lIEhpZ2ggSW50ZW5zaXR5PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2V0bmV0XCIsYyxwLDEpLGMscCwwLDYzMjIsNjQ2NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkxPV1wiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiSElHSFwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwiaW4tcmVwb3J0LWhlYWRlclxcXCI+TG9uZyBMaW5lIEZpc2hpbmcgSW50ZW5zaXR5PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoPlNrZXRjaCBOYW1lPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+JSBMb3cgSW50ZW5zaXR5PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+JSBIaWdoIEludGVuc2l0eTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJsb25nbGluZVwiLGMscCwxKSxjLHAsMCw2ODIxLDY5NTIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJMT1dcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJISUdIXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIi0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wib3ZlcnZpZXdcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7aWYoXy5zKF8uZChcInNrZXRjaENsYXNzLmRlbGV0ZWRcIixjLHAsMSksYyxwLDAsMjQsMjcwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJhbGVydCBhbGVydC13YXJuXFxcIiBzdHlsZT1cXFwibWFyZ2luLWJvdHRvbToxMHB4O1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBUaGlzIHNrZXRjaCB3YXMgY3JlYXRlZCB1c2luZyB0aGUgXFxcIlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCJcXFwiIHRlbXBsYXRlLCB3aGljaCBpc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgbm8gbG9uZ2VyIGF2YWlsYWJsZS4gWW91IHdpbGwgbm90IGJlIGFibGUgdG8gY29weSB0aGlzIHNrZXRjaCBvciBtYWtlIG5ld1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgc2tldGNoZXMgb2YgdGhpcyB0eXBlLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDMxMyw3NDgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCwzMjYsNzM3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBzaXplXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+TVBBIE5ldHdvcms8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBUaGlzIENvbGxlY3Rpb24gaGFzOiA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm51bV9yZXNlcnZlc1wiLGMscCwwKSkpO18uYihcIiBUeXBlLTEgTVBBXCIpO2lmKF8ucyhfLmYoXCJwbHVyYWxfdHlwZTFcIixjLHAsMSksYyxwLDAsNDk2LDQ5NyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwic1wiKTt9KTtjLnBvcCgpO31fLmIoXCIsIFwiKTtfLmIoXy52KF8uZihcIm51bV90eXBlMlwiLGMscCwwKSkpO18uYihcIiBUeXBlLTIgTVBBXCIpO2lmKF8ucyhfLmYoXCJwbHVyYWxfdHlwZTJcIixjLHAsMSksYyxwLDAsNTU3LDU1OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwic1wiKTt9KTtjLnBvcCgpO31fLmIoXCIsIGFuZCBcIik7Xy5iKF8udihfLmYoXCJudW1fb3RoZXJcIixjLHAsMCkpKTtfLmIoXCIgT3RoZXIgTVBBXCIpO2lmKF8ucyhfLmYoXCJwbHVyYWxfb3RoZXJcIixjLHAsMSksYyxwLDAsNjIxLDYyMixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwic1wiKTt9KTtjLnBvcCgpO31fLmIoXCI8L3N0cm9uZz4gLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGVtPk9ubHkgVHlwZS0xIGFuZCBUeXBlLTIgTVBBcyBhcmUgcmVwb3J0ZWQgb24uPC9lbT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtpZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe2lmKF8ucyhfLmYoXCJhbnlBdHRyaWJ1dGVzXCIsYyxwLDEpLGMscCwwLDgwNywxMTI1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxoND5cIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXy5ycChcImF0dHJpYnV0ZXMvYXR0cmlidXRlc1RhYmxlXCIsYyxwLFwiICAgICAgICBcIikpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsOTQ1LDEwNzUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgPHRyPjx0ZD5cIik7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDk3Miw5ODYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIk51bWJlciBvZiBNUEFzXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsMTAxMCwxMDI4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJOdW1iZXIgb2YgU2tldGNoZXNcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiPC90ZD5cIik7Xy5iKF8udihfLmYoXCJudW1Ta2V0Y2hlc1wiLGMscCwwKSkpO18uYihcIjx0ZD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX07Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaXNHZW5lcmljXCIsYyxwLDEpLGMscCwwLDExNzksMTQ2NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwxMjAxLDE0NDYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+TnVtYmVyIG9mIFNrZXRjaGVzIGluIENvbGxlY3Rpb248L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBUaGlzIGNvbGxlY3Rpb24gY29udGFpbnMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJudW1Ta2V0Y2hlc1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBza2V0Y2hcIik7aWYoXy5zKF8uZihcInBsdXJhbFNrZXRjaGVzXCIsYyxwLDEpLGMscCwwLDEzOTcsMTM5OSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiZXNcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCwxNDk0LDM4MTYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMTUxNiwzNzk2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBzaXplXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8aDQ+Q29hc3RhbCBIYWJpdGF0cyBJbmNsdWRlZCBpbiBUeXBlLTEgTVBBXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXRvZ2dsZS1ub2RlPVxcXCI1NTM2ZGJiNDhjNWI0M2ViMGZhY2JjNWFcXFwiIGRhdGEtdmlzaWJsZT1cXFwiZmFsc2VcXFwiPnNob3cgbGF5ZXI8L2E+PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZighXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgPHN0cm9uZz5OdW1iZXIgb2YgSGFiaXRhdCBDbGFzc2VzPC9zdHJvbmc+PC9icj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBzdHlsZT1cXFwibWFyZ2luLXRvcDowcHg7XFxcIiBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgVGhlcmUgYXJlIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwidG90YWxfaGFic1wiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBoYWJpdGF0IGNsYXNzZXMgaW4gdGhlIHBsYW5uaW5nIHJlZ2lvbiwgYW5kIHlvdXIgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMTk1MCwxOTYwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic2tldGNoXCIpO307Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIGluY2x1ZGVzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibmV3X2hhYnNcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4uIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHRoZSBIYWJpdGF0IENsYXNzaWZpY2F0aW9uLCBzZWVcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmRvYy5nb3Z0Lm56L0RvY3VtZW50cy9jb25zZXJ2YXRpb24vbWFyaW5lLWFuZC1jb2FzdGFsL21hcmluZS1wcm90ZWN0ZWQtYXJlYXMvbXBhLWNsYXNzaWZpY2F0aW9uLXByb3RlY3Rpb24tc3RhbmRhcmQucGRmXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICBNYXJpbmUgUHJvdGVjdGVkIEFyZWFzIENsYXNzaWZpY2F0aW9uIGFuZCBQcm90ZWN0aW9uIFN0YW5kYXJkPC9hPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIpO307aWYoXy5zKF8uZihcImQzSXNQcmVzZW50XCIsYyxwLDEpLGMscCwwLDI0MjIsMjYyNixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICA8ZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXByZXNlbnRlZF9oYWJzX3BpZVxcXCIgaWQ9XFxcInJlcHJlc2VudGVkX2hhYnNfcGllXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGRpdiBjbGFzcz1cXFwicmVwcmVzZW50ZWRfaGFic19waWVfbGVnZW5kXFxcIiBpZD1cXFwicmVwcmVzZW50ZWRfaGFic19waWVfbGVnZW5kXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHNpemVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxoND5Db2FzdGFsIEhhYml0YXRzIFJlcGxpY2F0ZWRcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxhIGhyZWY9XFxcIiNcXFwiIGRhdGEtdG9nZ2xlLW5vZGU9XFxcIjU1MzZkYmI0OGM1YjQzZWIwZmFjYmM1YVxcXCIgZGF0YS12aXNpYmxlPVxcXCJmYWxzZVxcXCI+c2hvdyBsYXllcjwvYT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKCFfLnMoXy5mKFwiZDNJc1ByZXNlbnRcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgIDxzdHJvbmc+TnVtYmVyIG9mIEhhYml0YXQgQ2xhc3Nlczwvc3Ryb25nPjwvYnI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cCBzdHlsZT1cXFwibWFyZ2luLXRvcDowcHg7XFxcIiBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBUaGVyZSBhcmUgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJ0b3RhbF9oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IGhhYml0YXQgY2xhc3NlcyBpbiB0aGUgcGxhbm5pbmcgcmVnaW9uLCBhbmQgeW91ciBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzMDk0LDMxMDQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2hcIik7fTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBpbmNsdWRlcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm5ld19oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+LiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiB0aGUgSGFiaXRhdCBDbGFzc2lmaWNhdGlvbiwgc2VlXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmRvYy5nb3Z0Lm56L0RvY3VtZW50cy9jb25zZXJ2YXRpb24vbWFyaW5lLWFuZC1jb2FzdGFsL21hcmluZS1wcm90ZWN0ZWQtYXJlYXMvbXBhLWNsYXNzaWZpY2F0aW9uLXByb3RlY3Rpb24tc3RhbmRhcmQucGRmXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIE1hcmluZSBQcm90ZWN0ZWQgQXJlYXMgQ2xhc3NpZmljYXRpb24gYW5kIFByb3RlY3Rpb24gU3RhbmRhcmQ8L2E+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3A+XCIpO18uYihcIlxcblwiKTt9O2lmKF8ucyhfLmYoXCJkM0lzUHJlc2VudFwiLGMscCwxKSxjLHAsMCwzNTc0LDM3NjQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxkaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBsaWNhdGVkX2hhYnNfcGllXFxcIiBpZD1cXFwicmVwbGljYXRlZF9oYWJzX3BpZVxcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXBsaWNhdGVkX2hhYnNfcGllX2xlZ2VuZFxcXCIgaWQ9XFxcInJlcGxpY2F0ZWRfaGFic19waWVfbGVnZW5kXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwzODQ1LDUyOTgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBzaXplXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PlwiKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsMzg5OSwzOTA4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJNUEEgU2l6ZXNcIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMCwzOTMyLDM5NDQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlNrZXRjaCBTaXplc1wiKTt9KTtjLnBvcCgpO31fLmIoXCI8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8IS0tXCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDM5ODcsNDMxNCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIE9mIHRoZSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInRvdGFsX21wYV9jb3VudFwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBNUEFzIGluIHRoZSBuZXR3b3JrLCA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm1wYV9jb3VudFwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBtZWV0XCIpO2lmKCFfLnMoXy5mKFwicGx1cmFsX21wYV9jb3VudFwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInNcIik7fTtfLmIoXCIgdGhlIG1pbmltdW0gc2l6ZSBkaW1lbnNpb24gb2YgNWttLiBUaGUgYXZlcmFnZSBtaW5pbXVtIGRpbWVuc2lvbiBpcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm1wYV9hdmdfc2l6ZV9ndWlkZWxpbmVcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gdGhlIDEwLTIwa20gZ3VpZGVsaW5lLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsNDM0Myw0NDEwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICA8cD5UaGUgc2l6ZSBvZiB0aGUgc2tldGNoZXMgaW4gdGhpcyBjb2xsZWN0aW9uIGFyZTo8L3A+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgLS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGg+XCIpO2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw0NTIxLDQ1MjksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIk1QQSBOYW1lXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsNDU1Myw0NTY0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJTa2V0Y2ggTmFtZVwiKTt9KTtjLnBvcCgpO31fLmIoXCI8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0aD5BcmVhIDwvYnI+KHNxLiBrbS4pPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjEwMHB4O1xcXCI+V2lkdGggKGttKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRoIHN0eWxlPVxcXCJ3aWR0aDoxMDBweDtcXFwiPkNvYXN0bGluZSBMZW5ndGggKGttKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJwcm9wX3NpemVzXCIsYyxwLDEpLGMscCwwLDQ4MTYsNTAwNyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDx0ciBjbGFzcz1cIik7Xy5iKF8udihfLmYoXCJDU1NfQ0xBU1NcIixjLHAsMCkpKTtfLmIoXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJTSVpFX1NRS01cIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJNSU5fRElNXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiQ09BU1RcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgVGhpcyBjb21iaW5lZCBhcmVhIHdpdGhpbiB0aGUgbmV0d29yayBhY2NvdW50cyBmb3IgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJhcmVhX3BlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IE1hcmluZSBhcmVhLCBhbmQgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb2FzdGxpbmVfbGVuZ3RoX3BlcmNlbnRcIixjLHAsMCkpKTtfLmIoXCIlPC9zdHJvbmc+IG9mIHRoZSBTb3V0aC1FYXN0IGNvYXN0bGluZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe2lmKF8ucyhfLmYoXCJpc01QQVwiLGMscCwxKSxjLHAsMCw1MzQ2LDYyMjYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHNpemVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxoND5NUEEgU2l6ZTwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5NUEEgTmFtZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+QXJlYSA8L2JyPihzcS4ga20uKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjEwMHB4O1xcXCI+V2lkdGggKGttKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjEwMHB4O1xcXCI+Q29hc3RsaW5lIExlbmd0aCAoa20pPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInByb3Bfc2l6ZXNcIixjLHAsMSksYyxwLDAsNTc1NCw1OTM0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiU0laRV9TUUtNXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJNSU5fRElNXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJDT0FTVFwiLGMscCwwKSkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgVGhpcyBhcmVhIHdpdGhpbiB0aGUgTVBBIGFjY291bnRzIGZvciA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcImFyZWFfcGVyY2VudFwiLGMscCwwKSkpO18uYihcIiU8L3N0cm9uZz4gb2YgdGhlIFNvdXRoLUVhc3QgTWFyaW5lIGFyZWEsIGFuZCA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcImNvYXN0bGluZV9sZW5ndGhfcGVyY2VudFwiLGMscCwwKSkpO18uYihcIiU8L3N0cm9uZz4gb2YgdGhlIFNvdXRoLUVhc3QgY29hc3RsaW5lLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319O18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImlzTVBBXCIsYyxwLDEpLGMscCwwLDYyNjYsNzU1MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw2Mjg2LDc1MzMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGg0PkNvbm5lY3Rpdml0eTwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNpbmdsZVNrZXRjaFwiLGMscCwxKSxjLHAsMCw2Mzc2LDY1NTMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHAgc3R5bGU9XFxcImZvbnQtc3R5bGU6aXRhbGljO2NvbG9yOmdyYXk7XFxcIiBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICBObyBjb25uZWN0aXZpdHkgaW5mb3JtYXRpb24gZm9yIGEgY29sbGVjdGlvbiB3aXRoIG9uZSBza2V0Y2guIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC9wPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJzaW5nbGVTa2V0Y2hcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgICAgPCEtLVwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8ZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNvbm5lY3Rpdml0eV9waWVcXFwiIGlkPVxcXCJjb25uZWN0aXZpdHlfcGllXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjb25uZWN0aXZpdHlfcGllX2xlZ2VuZFxcXCIgaWQ9XFxcImNvbm5lY3Rpdml0eV9waWVfbGVnZW5kXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIC0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPk9mIHRoZSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInRvdGFsX21wYV9jb3VudFwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBNUEFzIGluIHRoZSBuZXR3b3JrLCA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcImNvbm5lY3RlZF9tcGFfY291bnRcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz5cIik7aWYoXy5zKF8uZihcInBsdXJhbF9jb25uZWN0ZWRfbXBhX2NvdW50XCIsYyxwLDEpLGMscCwwLDY5NzgsNjk4MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiIGFyZVwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcInBsdXJhbF9jb25uZWN0ZWRfbXBhX2NvdW50XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiIGlzXCIpO307Xy5iKFwiIHdpdGhpbiAxMDAga20gb2YgZWFjaCBvdGhlci4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNvbm5fdmFsdWVzXFxcIj5UaGUgbWluaW11bSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBNUEFzIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibWluX2Rpc3RhbmNlXCIsYyxwLDApKSk7Xy5iKFwiIGttPC9zdHJvbmc+Ljwvc3Bhbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNvbm5fdmFsdWVzXFxcIj5UaGUgbWF4aW11bSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBNUEFzIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibWF4X2Rpc3RhbmNlXCIsYyxwLDApKSk7Xy5iKFwiIGttPC9zdHJvbmc+Ljwvc3Bhbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNvbm5fdmFsdWVzXFxcIj5UaGUgYXZlcmFnZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBNUEFzIGlzIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwibWVhbl9kaXN0YW5jZVwiLGMscCwwKSkpO18uYihcIiBrbTwvc3Ryb25nPi48L3NwYW4+XCIpO18uYihcIlxcblwiKTt9O18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7aWYoXy5zKF8uZihcImlzR2VuZXJpY1wiLGMscCwxKSxjLHAsMCw3NTk3LDgwMDMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHNpemVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxoND5TaXplPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgVGhpcyBza2V0Y2ggYXJlYSBpcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInNpemVcIixjLHAsMCkpKTtfLmIoXCIgc3F1YXJlIGtpbG9tZXRlcnM8L3N0cm9uZz4sIGFuZCBpdCBpbmNsdWRlcyA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcImNvYXN0bGluZV9sZW5ndGhfcGVyY2VudFwiLGMscCwwKSkpO18uYihcIiU8L3N0cm9uZz4gb2YgdGhlIFNvdXRoLUVhc3QgUGxhbm5pbmcgUmVnaW9uLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgVGhpcyBza2V0Y2ggaW5jbHVkZXMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb2FzdGxpbmVfbGVuZ3RoXCIsYyxwLDApKSk7Xy5iKFwiIGtpbG9tZXRlcnM8L3N0cm9uZz4gb2YgY29hc3RsaW5lLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319O18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8IS0tXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiBzaXplXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5OdW1iZXIgb2YgSGFiaXRhdHM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgVGhlIFwiKTtpZihfLnMoXy5mKFwiaXNNUEFcIixjLHAsMSksYyxwLDAsODE0NCw4MjAxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgTWFyaW5lIFByb3RlY3RlZCBBcmVhXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsODE4Myw4MTg0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJzXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJpc0dlbmVyaWNcIixjLHAsMSksYyxwLDAsODIyNSw4MjY3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJza2V0Y2hcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw4MjQ4LDgyNTAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcImVzXCIpO30pO2MucG9wKCk7fX0pO2MucG9wKCk7fV8uYihcIiBpbmNsdWRlXCIpO2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic1wiKTt9O18uYihcIiA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcIm51bV9oYWJzXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IG9mIHRoZSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInRvdGFsX2hhYnNcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gY2xhc3NpZmllZCBoYWJpdGF0cy5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCItLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1widXNlc1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtpZihfLnMoXy5kKFwic2tldGNoQ2xhc3MuZGVsZXRlZFwiLGMscCwxKSxjLHAsMCwyNCwyNzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LXdhcm5cXFwiIHN0eWxlPVxcXCJtYXJnaW4tYm90dG9tOjEwcHg7XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFRoaXMgc2tldGNoIHdhcyBjcmVhdGVkIHVzaW5nIHRoZSBcXFwiXCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIlxcXCIgdGVtcGxhdGUsIHdoaWNoIGlzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBubyBsb25nZXIgYXZhaWxhYmxlLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byBjb3B5IHRoaXMgc2tldGNoIG9yIG1ha2UgbmV3XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBza2V0Y2hlcyBvZiB0aGlzIHR5cGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwiaGFzQ29hc3RhbFwiLGMscCwxKSxjLHAsMCwzMTAsMTA0NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PkV4aXN0aW5nIENvYXN0YWwgQ29uc2VudHMgPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTNkNzE5YTQ5MzgwMTc0YTc3NjZkZDg1XFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICBzaG93IGxheWVyPC9hPjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cD5cIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw1MjQsNTU0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJBIHNrZXRjaCB3aXRoaW4gdGhlIGNvbGxlY3Rpb25cIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJUaGUgc2tldGNoXCIpO307Xy5iKFwiIGNvbnRhaW5zIG9yIGlzIHdpdGhpbiAyMDBtIG9mIHNpdGVzIHdpdGggUmVzb3VyY2UgQ29uc2VudHMuPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGggc3R5bGU9XFxcIndpZHRoOjI1MHB4O1xcXCI+Q29uc2VudCBUeXBlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImNvYXN0YWxfY29uc2VudHNcIixjLHAsMSksYyxwLDAsODkzLDk3OCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkZFQVRfVFlQRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzVXNlc1wiLGMscCwxKSxjLHAsMCwxMDc0LDQxNDUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJoYXNSZWNVc2VzXCIsYyxwLDEpLGMscCwwLDEwOTIsMjM1NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGg0PlJlY3JlYXRpb25hbCBVc2VzIDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPCEtLVwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNTbWFyb1wiLGMscCwxKSxjLHAsMCwxMjAwLDE2ODgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgICA8cD48c3Ryb25nPlNwZWN0cnVtIG9mIE1BcmluZSBSZWNyZWF0aW9uYWwgT3Bwb3J0dW5pdHkgKFNNQVJPKTwvc3Ryb25nPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHA+XCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsMTMzOSwxMzQ5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJDb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiU2tldGNoXCIpO307Xy5iKFwiIGluY2x1ZGVzIGFyZWEocykgaWRlbnRpZmllZCBhcyBoYXZpbmcgPHN0cm9uZz4gbWVkaXVtIG9yIGhpZ2ggPC9zdHJvbmc+IHJlY3JlYXRpb25hbCBvcHBvcnR1bml0eS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGVtPllvdSBjYW4gZmluZCBtb3JlIGluZm9ybWF0aW9uIG9uIFNNQVJPIGluIHRoZSBcXFwiZGF0YSBkZXNjcmlwdGlvblxcXCIgYnkgcmlnaHQgY2xpY2tpbmcgb24gdGhlIGxheWVyIG5hbWUuPC9lbT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvYnI+PC9icj5cIik7Xy5iKFwiXFxuXCIpO307fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgLS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5BY3Rpdml0eSBUeXBlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aD5OdW1iZXIgb2YgU2l0ZXM8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFzUmVjVXNlc1wiLGMscCwxKSxjLHAsMCwxOTU5LDIxNDEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKF8ucyhfLmYoXCJyZWNfdXNlc1wiLGMscCwxKSxjLHAsMCwxOTg3LDIxMTUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkNPVU5UXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc1JlY1VzZXNcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRkIGNvbHNwYW49Mj48ZW0+Tm9uZSBQcmVzZW50PC9lbT48L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNIZXJpdGFnZVwiLGMscCwxKSxjLHAsMCwyMzkxLDMzNDYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDQ+QXJjaGVvbG9naWNhbCBJbmZvcm1hdGlvbiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTU3OGYxNGNmZjM5MDU5YTU4MzY0NmM5XFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5zaG93IGxheWVyPC9hPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8cD5cIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCwyNjUwLDI2ODAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkEgc2tldGNoIHdpdGhpbiB0aGUgY29sbGVjdGlvblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlRoZSBza2V0Y2hcIik7fTtfLmIoXCIgY29udGFpbnMgb3IgaXMgd2l0aGluIDIwMG0gb2Ygc2l0ZXMgaWRlbnRpZmllZCBhcyBoYXZpbmcgc2lnbmlmaWNhbnQgaGVyaXRhZ2UgdmFsdWVzLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5IZXJpdGFnZSBUeXBlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGg+TnVtYmVyIG9mIFNpdGVzPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhlcml0YWdlXCIsYyxwLDEpLGMscCwwLDMxMTMsMzI1MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiQ09VTlRcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiKTt9O30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJoYXNJbmZyYXN0cnVjdHVyZVwiLGMscCwxKSxjLHAsMCwzMzg3LDQxMjIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe2lmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiICAgICAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDQ+SW5mcmFzdHJ1Y3R1cmU8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxwPlwiKTtpZihfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwwLDM1MjMsMzU1MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiQSBza2V0Y2ggd2l0aGluIHRoZSBjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiVGhlIHNrZXRjaFwiKTt9O18uYihcIiBjb250YWlucyBvciBpcyB3aXRoaW4gMjAwbSBvZiBzaXRlcyB3aXRoIGV4aXN0aW5nIGluZnJhc3RydWN0dXJlLjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT1cXFwid2lkdGg6MjUwcHg7XFxcIj5UeXBlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImluZnJhc3RydWN0dXJlXCIsYyxwLDEpLGMscCwwLDM5MjAsNDAyMSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiRkVBVF9UWVBFXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICAgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTt9KTtjLnBvcCgpO319KTtjLnBvcCgpO31pZighXy5zKF8uZihcImhhc1VzZXNcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDQ+QWN0aXZpdGllcyBhbmQgVXNlczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8cD5UaGUgXCIpO2lmKF8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDAsNDI4MSw0MjkxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJjb2xsZWN0aW9uXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaXNDb2xsZWN0aW9uXCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwic2tldGNoXCIpO307Xy5iKFwiICBkb2VzIDxzdHJvbmc+bm90PC9zdHJvbmc+IGluY2x1ZGUgYW55IDxzdHJvbmc+YWN0aXZpdGllcyBvciB1c2VzPC9zdHJvbmc+LjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNTZWFiaXJkc1wiLGMscCwxKSxjLHAsMCw0NDY4LDUxOTQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkJpcmRzIDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhc1NlYWJpcmRBcmVhc1wiLGMscCwxKSxjLHAsMCw0NTU2LDQ4NDAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgPHAgY2xhc3M9XFxcImxhcmdlXFxcIj48c3Ryb25nPkltcG9ydGFudCBTZWFiaXJkIEFyZWFzPC9zdHJvbmc+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2VhYmlyZHNcIixjLHAsMSksYyxwLDAsNDcwMyw0NzgzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTmFtZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgIFwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJoYXNTZWFiaXJkQ29sb25pZXNcIixjLHAsMSksYyxwLDAsNDg5Myw1MTYzLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPjxzdHJvbmc+U2VhYmlyZCBDb2xvbmllczwvc3Ryb25nPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2VhYmlyZF9jb2xvbmllc1wiLGMscCwxKSxjLHAsMCw1MDMzLDUxMDUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdGFibGU+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJoYXNNYXJpbmVTcGVjaWVzXCIsYyxwLDEpLGMscCwwLDUyMzIsNTY5NCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+TWFyaW5lIE1hbW1hbHM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8dGg+U3BlY2llczwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJtYW1tYWxzXCIsYyxwLDEpLGMscCwwLDU0ODAsNTU2MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwic2VhbHNcIixjLHAsMSksYyxwLDAsNTU5NSw1NjQwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJOYW1lXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgICAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiaGFzTWFyaW5lU3BlY2llc1wiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIiAgPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxoND5TcGVjaWVzIEluZm9ybWF0aW9uPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxwPlRoZSBcIik7aWYoXy5zKF8uZihcImlzQ29sbGVjdGlvblwiLGMscCwxKSxjLHAsMCw1ODQ4LDU4ODIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcInNrZXRjaGVzIHdpdGhpbiB0aGUgY29sbGVjdGlvbiBkbyBcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJpc0NvbGxlY3Rpb25cIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJza2V0Y2ggZG9lc1wiKTt9O18uYihcIiA8c3Ryb25nPm5vdDwvc3Ryb25nPiBpbmNsdWRlIGFueSA8c3Ryb25nPmltcG9ydGFudCBtYXJpbmUgbWFtbWFsIGFyZWFzPC9zdHJvbmc+LjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fTtyZXR1cm4gXy5mbCgpOzt9KTtcblxuaWYodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHRoaXNbXCJUZW1wbGF0ZXNcIl07XG59Il19
