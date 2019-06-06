ReportTab = require 'reportTab'
templates = require '../templates/templates.js'

_partials = require '../node_modules/seasketch-reporting-api/templates/templates.js'

partials = []
for key, val of _partials
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val

ids = require './ids.coffee'
for key, value of ids
  window[key] = value


class FishingTab extends ReportTab
  # this is the name that will be displayed in the Tab
  name: 'Fishing'
  className: 'fishing'
  timeout: 120000
  template: templates.fishing
  dependencies: [
    'FishingAreas', 'FisheryIntensity'
  ]

  render: () ->

    #show tables instead of graph for IE
    if window.d3
      d3IsPresent = true
    else
      d3IsPresent = false

    isCollection = @model.isCollection()
    scid = @sketchClass.id
   
    if (scid == MPA_ID or scid == MPA_COLLECTION_ID or scid == MPA_CONFID_COLLECTION_ID)
      isMPA = true
      isConfidentialMPANetwork = true
    else
      isMPA = false
      isConfidentialMPANetwork = false

    
    if isMPA
      fishery_intensity = @recordSet('FisheryIntensity', 'FisheryIntensity').toArray()


    existing_customary_fishing = @recordSet('FishingAreas', 'ExistingCustomaryArea').toArray()
    proposed_customary_fishing = @recordSet('FishingAreas', 'ProposedCustomaryArea').toArray()
    
    customary_fishing = []
    if existing_customary_fishing?.length > 0
      customary_fishing = customary_fishing.concat(existing_customary_fishing)

    if proposed_customary_fishing?.length > 0
      customary_fishing = customary_fishing.concat(proposed_customary_fishing)
    customary_fishing.sort()
    
    hasCustomary = customary_fishing?.length > 0

    existing_fishing_areas = @recordSet('FishingAreas', 'FishingExistingArea').toArray()
    hasExistingFishing = existing_fishing_areas?.length > 0
    hasAnyFishing = hasExistingFishing or hasCustomary
    attributes = @model.getAttributes()
    
    if isMPA
      context =
        sketch: @model.forTemplate()
        sketchClass: @sketchClass.forTemplate()
        attributes: @model.getAttributes()
        anyAttributes: @model.getAttributes().length > 0
        admin: @project.isAdmin window.user
        d3IsPresent: d3IsPresent
        isCollection: isCollection
        isMPA: isMPA
        customary_fishing: customary_fishing
        hasCustomary: hasCustomary
        existing_fishing_areas: existing_fishing_areas
        hasExistingFishing: hasExistingFishing
        hasAnyFishing: hasAnyFishing
       
        fishery_intensity: fishery_intensity
        isConfidentialMPANetwork: isConfidentialMPANetwork
    else
      context =
        sketch: @model.forTemplate()
        sketchClass: @sketchClass.forTemplate()
        attributes: @model.getAttributes()
        anyAttributes: @model.getAttributes().length > 0
        admin: @project.isAdmin window.user
        d3IsPresent: d3IsPresent
        isCollection: isCollection
        customary_fishing: customary_fishing
        hasCustomary: hasCustomary
        existing_fishing_areas: existing_fishing_areas
        hasExistingFishing: hasExistingFishing
        hasAnyFishing: hasAnyFishing
        
        isMPA: isMPA
        isConfidentialMPANetwork: isConfidentialMPANetwork

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()
    @setupFisherySorting(fishery_intensity)

  roundData: (rec_set) =>
    low_total = 0.0
    high_total = 0.0
    for rs in rec_set
      rs.LOW = Number(rs.LOW).toFixed(1)
      low_total+=Number(rs.LOW)
      rs.HIGH = Number(rs.HIGH).toFixed(1)
      high_total+=Number(rs.HIGH)
      rs.TOTAL = Number(rs.TOTAL).toFixed(1)
    if rec_set?.length > 0
      tot_row = {"NAME":"Total", "LOW":low_total, "HIGH":high_total}
      rec_set.push(tot_row)

  setupFisherySorting: (fishery_intensity) =>
    tbodyName = '.fishery_values'
    tableName = '.fishery_table'

    @$('.fishery_type').click (event) =>
      @renderSort('fishery_type', tableName, fishery_intensity, event, "FISH_TYPE", tbodyName, false, @getFisheryRowString)
    
    @$('.fishery_high').click (event) =>
      @renderSort('fishery_high', tableName, fishery_intensity, event, "HIGH", tbodyName, true, @getFisheryRowString)

    @$('.fishery_moderate').click (event) =>
      @renderSort('fishery_moderate',tableName, fishery_intensity, event, "MODERATE", tbodyName, true, @getFisheryRowString)
    
    @$('.fishery_low').click (event) =>
      @renderSort('fishery_low',tableName, fishery_intensity, event, "LOW", tbodyName, true, @getFisheryRowString)

    @$('.fishery_disp').click (event) =>
      @renderSort('fishery_disp',tableName, fishery_intensity, event, "DISP", tbodyName, true, @getFisheryRowString)


    @renderSort('fishery_type', tableName, fishery_intensity, undefined, "FISH_TYPE", tbodyName, false, @getFisheryRowString)
  
  #table row for habitat representation
  getFisheryRowString: (d) =>
    if d is undefined
      return ""

    return "<td>"+d.FISH_TYPE+"</td>"+"<td>"+d.HIGH+"</td>"+"<td>"+d.MODERATE+"</td>"+"<td>"+d.LOW+"</td>"+"<td>"+d.DISP+"</td>"
  
  getFloat: (val) =>
    try
      return parseFloat(val)
    catch error
      return 0.0

  renderSort: (name, tableName, pdata, event, sortBy, tbodyName, isFloat, getRowStringValue ) =>
    if event
      event.preventDefault()

    if window.d3
      targetColumn = @getSelectedColumn(event, name)

      sortUp = @getSortDir(targetColumn)

      if isFloat
        data = _.sortBy pdata, (row) -> 
            if isNaN(row[sortBy])
              val = -1.0
            else
              val = parseFloat(row[sortBy])
            return val
      else
        data = _.sortBy pdata, (row) -> row[sortBy]

      #flip sorting if needed
      if sortUp
        data.reverse()

      el = @$(tbodyName)[0]
      hab_body = d3.select(el)

      #remove old rows
      hab_body.selectAll("tr.fishery_rows")
        .remove()

      #add new rows (and data)
      rows = hab_body.selectAll("tr")
          .data(data)
        .enter().insert("tr", ":first-child")
        .attr("class", "fishery_rows")

      columns = ["FISH_TYPE", "HIGH", "MODERATE", "LOW", "DISP"]

      cells = rows.selectAll("td")
          .data((row, i) ->columns.map (column) -> (column: column, value: row[column]))
        .enter()
        .append("td").text((d, i) -> 
          d.value
        )    

      @setNewSortDir(targetColumn, sortUp)

      #fire the event for the active page if pagination is present
      @firePagination(tableName)
      if event
        event.stopPropagation()

     
  getSelectedColumn: (event, name) =>
    if event
      #get sort order
      targetColumn = event.currentTarget.className
      multiClasses = targetColumn.split(' ')
      targetColumn = multiClasses[0]
    else
      #when there is no event, first time table is filled
      targetColumn = name

    return targetColumn

  getSortDir: (targetColumn) =>
     sortup = @$('.'+targetColumn).hasClass("sort_up")
     return sortup

  setNewSortDir: (targetColumn, sortUp) =>
    #and switch it
    if sortUp
      @$('.'+targetColumn).removeClass('sort_up')
      @$('.'+targetColumn).addClass('sort_down')
    else
      @$('.'+targetColumn).addClass('sort_up')
      @$('.'+targetColumn).removeClass('sort_down')

  firePagination: (tableName) =>
    el = @$(tableName)[0]
    hab_table = d3.select(el)
    active_page = hab_table.selectAll(".active a")
    if active_page and active_page[0] and active_page[0][0]
      active_page[0][0].click()

module.exports = FishingTab