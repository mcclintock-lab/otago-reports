ReportTab = require 'reportTab'
templates = require '../templates/templates.js'

_partials = require '../node_modules/seasketch-reporting-api/templates/templates.js'

partials = []
for key, val of _partials
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val

ids = require './ids.coffee'
for key, value of ids
  window[key] = value


class EnvironmentTab extends ReportTab
  # this is the name that will be displayed in the Tab
  name: 'Habitats'
  className: 'environment'
  timeout: 120000
  template: templates.environment
  dependencies: [
    'HabitatsEnvironment'
    'HabitatsOverview'
    'AdjacentTerrestrial'
    'HabRepsToolbox'
  ]

  render: () ->

    #show tables instead of graph for IE
    if window.d3
      d3IsPresent = true
    else
      d3IsPresent = false
    isCollection = @model.isCollection()
    scid = @sketchClass.id
    if scid == GENERIC_ID or scid == GENERIC_COLLECTION_ID
      isGeneric = true
    else
      isGeneric = false
    habitats = @recordSet('HabitatsEnvironment', 'HabitatSize').toArray()
    habs_in_sketch = habitats?.length
    habs_plural = habs_in_sketch != 1

    evenness = @recordSet('HabitatsOverview', 'HabitatEvenness').float('EVENNESS')
    total_habs = @recordSet('HabitatsOverview', 'HabitatSize').float('TOT_HABS')
    public_land = @recordSet('AdjacentTerrestrial', 'PublicConservationLand').toArray()
    hasPublic = public_land?.length > 0
    coastal_land = @recordSet('AdjacentTerrestrial', 'CoastalProtection').toArray()
    hasCoastal = coastal_land?.length > 0
    adjacent_land = @recordSet('AdjacentTerrestrial', 'AdjacentLandCover').toArray()
    hasAdjacent = adjacent_land?.length > 0
    
    habitats_represented = @recordSet('HabRepsToolbox', 'RepresentedHabs').toArray()
    attributes = @model.getAttributes()
    
    context =
      sketch: @model.forTemplate()
      sketchClass: @sketchClass.forTemplate()
      attributes: @model.getAttributes()
      anyAttributes: @model.getAttributes().length > 0
      admin: @project.isAdmin window.user
      d3IsPresent: d3IsPresent
      isGeneric: isGeneric
      isCollection: isCollection

      habitats: habitats
      habs_in_sketch: habs_in_sketch
      habs_plural: habs_plural
      evenness: evenness
      total_habs: total_habs
      habitats_represented: habitats_represented
      public_land: public_land
      hasPublicLand: hasPublic
      coastal_land: coastal_land
      hasCoastalLand: hasCoastal
      adjacent_land: adjacent_land
      hasAdjacentLand: hasAdjacent
      

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()
    @setupHabitatSorting(habitats)

    @enableTablePaging()
    
  setupHabitatSorting: (habitats) =>
    tbodyName = '.hab_values'
    tableName = '.hab_table'
    @$('.hab_type').click (event) =>
      @renderSort('hab_type', tableName, habitats, event, "HAB_TYPE", tbodyName, false, @getHabitatRowString)
    @$('.hab_new_area').click (event) =>
      @renderSort('hab_new_area', tableName, habitats, event, "SIZE_HA", tbodyName, true, @getHabitatRowString)
    @$('.hab_new_perc').click (event) =>
      @renderSort('hab_new_perc',tableName, habitats, event, "SIZE_PERC", tbodyName, true, @getHabitatRowString)
    @renderSort('hab_type', tableName, habitats, undefined, "HAB_TYPE", tbodyName, false, @getHabitatRowString)

  #do the sorting - should be table independent
  #skip any that are less than 0.00
  renderSort: (name, tableName, pdata, event, sortBy, tbodyName, isFloat, getRowStringValue) =>
    if event
      event.preventDefault()


    if window.d3
      targetColumn = @getSelectedColumn(event, name)
      sortUp = @getSortDir(targetColumn)

      if isFloat
        data = _.sortBy pdata, (row) ->  parseFloat(row[sortBy])
      else
        data = _.sortBy pdata, (row) -> row[sortBy]

      #flip sorting if needed
      if sortUp
        data.reverse()

      el = @$(tbodyName)[0]
      hab_body = d3.select(el)

      #remove old rows
      hab_body.selectAll("tr.hab_rows")
        .remove()

      #add new rows (and data)
      rows = hab_body.selectAll("tr")
          .data(data)
        .enter().insert("tr", ":first-child")
        .attr("class", "hab_rows")

      columns = ["HAB_TYPE", "SIZE_HA", "SIZE_PERC"]
      cells = rows.selectAll("td")
          .data((row, i) ->columns.map (column) -> (column: column, value: row[column]))
        .enter()
        .append("td").text((d, i) -> 
          d.value
        )    

      @setNewSortDir(targetColumn, sortUp)
      @setSortingColor(event, tableName)
      #fire the event for the active page if pagination is present
      @firePagination(tableName)
      if event
        event.stopPropagation()

  #table row for habitat representation
  getHabitatRowString: (d) =>
    return "<td>"+d.HAB_TYPE+"</td>"+"<td>"+d.SIZE_HA+"</td>"+"<td>"+d.SIZE_PERC+"</td>"

  setSortingColor: (event, tableName) =>
    sortingClass = "sorting_col"
    if event
      parent = $(event.currentTarget).parent()
      newTargetName = event.currentTarget.className
      targetStr = tableName+" th.sorting_col a"   
      if @$(targetStr) and @$(targetStr)[0]
        oldTargetName = @$(targetStr)[0].className
        if newTargetName != oldTargetName
          #remove it from old 
          headerName = tableName+" th.sorting_col"
          @$(headerName).removeClass(sortingClass)
          #and add it to new
          parent.addClass(sortingClass)
     
  getSortDir: (targetColumn) =>
     sortup = @$('.'+targetColumn).hasClass("sort_up")
     return sortup

  getSelectedColumn: (event, name) =>
    if event
      #get sort order
      targetColumn = event.currentTarget.className
      multiClasses = targetColumn.split(' ')
      #protectedMammals = _.sortBy protectedMammals, (row) -> parseInt(row.Count)
      habClassName =_.find multiClasses, (classname) -> 
        classname.lastIndexOf('hab',0) == 0
      targetColumn = habClassName
    else
      #when there is no event, first time table is filled
      targetColumn = name

    return targetColumn

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

module.exports = EnvironmentTab