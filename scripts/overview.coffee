ReportTab = require 'reportTab'
templates = require '../templates/templates.js'

_partials = require '../node_modules/seasketch-reporting-api/templates/templates.js'

partials = []
for key, val of _partials
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val

ids = require './ids.coffee'
for key, value of ids
  window[key] = value

MIN_SIZE = 10000

class OverviewTab extends ReportTab
  # this is the name that will be displayed in the Tab
  name: 'Overview'
  className: 'overview'
  timeout: 120000
  template: templates.overview
  dependencies: [
    'Size'
    'CoastlineLength'
    'HabitatsOverview'
  ]



  render: () ->
    # The @recordSet method contains some useful means to get data out of 
    # the monsterous RecordSet json. Checkout the seasketch-reporting-template
    # documentation for more info.
    attr = @model.getAttribute('MPA_TYPE')

    size = @recordSet('Size', 'Size').float('SIZE_IN_HA')
    coastline_length = @recordSet('CoastlineLength', 'CoastlineLength').float('LGTH_IN_M')
    new_habs = @recordSet('HabitatsOverview', 'HabitatSize').float('NEW_HABS')
    total_habs = @recordSet('HabitatsOverview', 'HabitatSize').float('TOT_HABS')

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
      SIZE: size
      COASTLINE_LENGTH: coastline_length
      new_habs: new_habs
      total_habs: total_habs

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()

    

module.exports = OverviewTab