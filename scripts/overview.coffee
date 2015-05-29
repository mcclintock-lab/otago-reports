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
    'ProposalConnectivity'
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
    total_mpa_count = numSketches
    plural_mpa_count = mpa_count != 1

    
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

    #setup connectivity data
    if numSketches > 1
      prop_conn = @recordSet('ProposalConnectivity', 'Conn').toArray()
      connected_mpa_count = @recordSet('ProposalConnectivity', 'Conn').float('NUMBER')
      
      plural_connected_mpa_count = true

      min_distance = @recordSet('ProposalConnectivity', 'Conn').float('MIN')
      max_distance = @recordSet('ProposalConnectivity', 'Conn').float('MAX')
      mean_distance = @recordSet('ProposalConnectivity', 'Conn').float('MEAN')
      conn_pie_values = @build_values("Within Connectivity Range", connected_mpa_count,"#b3cfa7", "Not Within Range", 
        total_mpa_count-connected_mpa_count, "#e5cace")

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
      connected_mpa_count: connected_mpa_count

      plural_connected_mpa_count: plural_connected_mpa_count
      min_distance: min_distance
      max_distance: max_distance
      mean_distance: mean_distance
      singleSketch: numSketches == 1

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()

    #size_pie_values = @build_values("Meets Min. Size", mpa_count,"#b3cfa7", "Does not Meet Size Min.", 
    #  total_mpa_count-mpa_count, "#e5cace")


    @drawPie(conn_pie_values, "#connectivity_pie")
    #@drawPie(size_pie_values, "#size_pie")

  build_values: (yes_label, yes_count, yes_color, no_label, no_count, no_color) =>
    yes_val = {"label":yes_label+" ("+yes_count+")", "value":yes_count, "color":yes_color, "yval":25}
    no_val = {"label":no_label+" ("+no_count+")", "value":no_count, "color":no_color, "yval":50}

    return [yes_val, no_val]

  getDataValue: (data) =>
    return data.value

  drawPie: (data, pie_name) =>
    if window.d3
      w = 125
      h = 85
      r = 35
     
      vis = d3.select(pie_name).append("svg:svg").data([data]).attr("width", w).attr("height", h).append("svg:g").attr("transform", "translate(" + (r*2) + "," + (r+5) + ")")
      pie = d3.layout.pie().value((d) -> return d.value)

      #declare an arc generator function
      arc = d3.svg.arc().outerRadius(r)

      #select paths, use arc generator to draw
      arcs = vis.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice")
      arcs.append("svg:path")
        .attr("fill", (d) -> return d.data.color)
        .attr("stroke", (d) -> return if d.data.value == 0 then "none" else "#545454")
        .attr("stroke-width", 0.25)
        .attr("d", (d) ->  
          arc(d)
        )


      el = @$(pie_name+"_legend")[0]
      chart = d3.select(el)
      legends = chart.selectAll(pie_name+"_legend")
        .data(data)
      .enter().insert("div")
          .attr("class", "legend-row")

      legends.append("span")
        .attr("class", "pie-label-swatch")
        .style('background-color', (d,i) -> d.color)
      
      legends.append("span")
        .text((d,i) -> return data[i].label)
        .attr("class", "pie-label")

      

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