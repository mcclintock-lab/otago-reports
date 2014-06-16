ReportTab = require 'reportTab'
templates = require '../templates/templates.js'

_partials = require '../node_modules/seasketch-reporting-api/templates/templates.js'

partials = []
for key, val of _partials
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val

ids = require './ids.coffee'
for key, value of ids
  window[key] = value


class ValuesTab extends ReportTab
  # this is the name that will be displayed in the Tab
  name: 'Values and Uses'
  className: 'values'
  timeout: 120000
  template: templates.values
  dependencies: [

  ]



  render: () ->

    #show tables instead of graph for IE
    if window.d3
      d3IsPresent = true
    else
      d3IsPresent = false


    attributes = @model.getAttributes()
    
    context =
      sketch: @model.forTemplate()
      sketchClass: @sketchClass.forTemplate()
      attributes: @model.getAttributes()
      anyAttributes: @model.getAttributes().length > 0
      admin: @project.isAdmin window.user
      d3IsPresent: d3IsPresent

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()

    

module.exports = ValuesTab