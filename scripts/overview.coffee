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

    isCollection = @model.isCollection()
    if isCollection
      numSketches = @model.collection.length
    else
      numSketches = 1

    size = @recordSet('Size', 'Size').float('SIZE_IN_HA')
    new_size =  @addCommas size
    percent = @recordSet('Size', 'Percent').float('PERC_IN_HA')
    coastline_length = @recordSet('CoastlineLength', 'CoastlineLength').float('LGTH_IN_M')
    coastline_length = @addCommas coastline_length
    new_habs = @recordSet('HabitatsOverview', 'HabitatSize').float('NEW_HABS')
    total_habs = @recordSet('HabitatsOverview', 'HabitatSize').float('TOT_HABS')
    
    ratio = (coastline_length/size).toFixed(1)


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
      size: new_size
      coastline_length: coastline_length
      new_habs: new_habs
      total_habs: total_habs
      ratio: ratio
      percent: percent
      isCollection: isCollection
      numSketches: numSketches

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()

    
  addCommas: (num_str) =>
    num_str += ''
    x = num_str.split('.')
    x1 = x[0]
    x2 = if x.length > 1 then '.' + x[1] else ''
    rgx = /(\d+)(\d{3})/
    while rgx.test(x1)
      x1 = x1.replace(rgx, '$1' + ',' + '$2')
    return x1 + x2

module.exports = OverviewTab