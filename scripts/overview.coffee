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
    'ProposalSize'
  ]

  render: () ->
    # The @recordSet method contains some useful means to get data out of 
    # the monsterous RecordSet json. Checkout the seasketch-reporting-template
    # documentation for more info.
    TOTAL_COASTLINE_LENGTH = 667.594
    isCollection = @model.isCollection()
    if isCollection
      numSketches = @model.getChildren().length
    else
      numSketches = 1

    prop_sizes = @recordSet('ProposalSize', 'Sizes').toArray()
    
    mpa_avg_min_dim = @getAverageMinDim(prop_sizes)
    mpa_avg_min_size = @getTotalAreaPercent(prop_sizes)
    prop_sizes = @cleanupData(prop_sizes)
    
    mpa_count = @getMinDimCount(prop_sizes)
    total_mpa_count = prop_sizes?.length - 1
    plural_mpa_count = mpa_count > 1

    
    if mpa_avg_min_size < 10
      mpa_avg_size_guideline = "below"
    else
      mpa_avg_size_guideline = "above"

    size = @recordSet('Size', 'Size').float('SIZE_IN_HA')
    new_size =  @addCommas size
    percent = @recordSet('Size', 'Percent').float('PERC_IN_HA')
    if percent == 0 && mpa_avg_min_size > 0
      percent = "< 1"
    coastline_length = @recordSet('CoastlineLength', 'CoastlineLength').float('LGTH_IN_M')
    
    coastline_length_percent = ((coastline_length/1000)/TOTAL_COASTLINE_LENGTH)*100
    if coastline_length_percent > 0 && coastline_length_percent < 1
      coastline_length_percent = "< 1"
    else
      coastline_length_percent = parseFloat(coastline_length_percent).toFixed(1)

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
      coastline_length_percent:coastline_length_percent
      new_habs: new_habs
      total_habs: total_habs
      ratio: ratio
      percent: percent
      isCollection: isCollection
      numSketches: numSketches
      prop_sizes: prop_sizes
      total_mpa_count: total_mpa_count
      mpa_count: mpa_count
      mpa_avg_size_guideline:mpa_avg_size_guideline
      plural_mpa_count: plural_mpa_count

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()

  getTotalAreaPercent: (prop_sizes) =>
    for ps in prop_sizes
      if ps.NAME == "Percent of Total Area"
        return ps.SIZE_IN_HA
    return 0.0

  getAverageMinDim: (prop_sizes) =>
    for ps in prop_sizes
      if ps.NAME == "Average"
        return ps.MIN_DIM

  cleanupData: (prop_sizes) =>

    cleaned_props = []
    for ps in prop_sizes
      if ps.NAME != "Percent of Total Area"
        ps.MIN_DIM = parseFloat(ps.MIN_DIM).toFixed(1)
        ps.SIZE_IN_HA = Math.round(ps.SIZE_IN_HA)
        cleaned_props.push(ps)

    return cleaned_props

  getMinDimCount: (prop_sizes) =>
    num_meet_criteria = 0
    total_min_size = 0

    for ps in prop_sizes
      if ps.NAME != "Average" && ps.MIN_DIM > 5 
        num_meet_criteria+=1

    return num_meet_criteria

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