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

    isMPA = (scid == MPA_ID or scid == MPA_COLLECTION_ID)
    hab_sizes = @recordSet('HabRepsToolbox', 'HabSizes').toArray()

    habs_in_sketch = hab_sizes?.length
    habs_plural = habs_in_sketch != 1

    protected_areas = @recordSet('AdjacentTerrestrial', 'PublicConservationLand').toArray()
    hasProtected = protected_areas?.length > 0

    qe2_covenants = @recordSet('AdjacentTerrestrial', 'CoastalProtection').toArray()
    hasQE2covenants = qe2_covenants?.length > 0

    napalis_covenants = @recordSet('AdjacentTerrestrial', 'AdjacentLandCover').toArray()
    hasNapalisCovenants = napalis_covenants?.length > 0

    hasCovenants = (hasQE2covenants or hasNapalisCovenants)

    if isGeneric or (!isCollection and isMPA)
      showAdjacent = true
    else
      showAdjacent = false
    
    habitats_represented = @recordSet('HabRepsToolbox', 'RepresentedHabs').toArray()
    @roundData habitats_represented
    all_habs = @processHabitats(habitats_represented)
 
    hab_types = all_habs[0]
    hasHabTypes = hab_types?.length > 0
    sig_habs = all_habs[1]
    hasSigHabs = sig_habs?.length > 0
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
      isMPA: isMPA

      hab_types: hab_types
      hasHabTypes: hasHabTypes
      sig_habs: sig_habs
      hasSigHabs: hasSigHabs

      habs_plural: habs_plural
      habitats_represented: habitats_represented

      protected_areas: protected_areas
      hasProtected: hasProtected

      qe2_covenants: qe2_covenants
      hasQE2covenants: hasQE2covenants

      napalis_covenants: napalis_covenants
      hasNapalisCovenants: hasNapalisCovenants

      hasCovenants: hasCovenants
      showAdjacent: showAdjacent
      

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()
    @roundData(hab_sizes)
    @setupHabitatSorting(hab_types, isMPA, isCollection)
    @setupSigHabitatSorting(sig_habs, isMPA, isCollection)

    @enableTablePaging()
    
  processHabitats: (habs_represented) =>
    hab_types = []
    critical_habitats = []
    for hab in habs_represented
      if hab.HAB_TYPE == "Bryozoan reef" or hab.HAB_TYPE == "Macrocystis bed" or hab.HAB_TYPE == "Seagrass bed"
        critical_habitats.push(hab)
      else
        hab_types.push(hab)

    na_habs = ["Brachiopod beds", "Calcareous tube worm thickets", "Chaetopteridae worm fields",
               "Rhodolith beds", "Sea pen fields", "Sponge gardens", "Stony coral thickets"]
    for nh in na_habs
      new_hab = {"HAB_TYPE": nh, "SIZE_SQKM":"NA", "PERC":"NA", "REPRESENT":"NA", "REPLIC":"NA", "CONN":"NA"}
      critical_habitats.push(new_hab)
    return [hab_types, critical_habitats]

  roundData: (habitats) =>  
    for hab in habitats
      hab.SIZE_SQKM = Number(hab.SIZE_SQKM).toFixed(1)
      hab.PERC = Number(hab.PERC).toFixed(1)

  setupSigHabitatSorting: (habitats, isMPA, isCollection) =>
    tbodyName = '.sig_hab_values'
    tableName = '.sig_hab_table'
    @$('.sig_hab_type').click (event) =>
      @renderSort('sig_hab_type', tableName, habitats, event, "HAB_TYPE", tbodyName, false, @getHabitatRowString, isMPA, isCollection)
    @$('.sig_hab_new_area').click (event) =>
      @renderSort('sig_hab_new_area', tableName, habitats, event, "SIZE_SQKM", tbodyName, true, @getHabitatRowString, isMPA, isCollection)
    @$('.sig_hab_new_perc').click (event) =>
      @renderSort('sig_hab_new_perc',tableName, habitats, event, "PERC", tbodyName, true, @getHabitatRowString, isMPA, isCollection)
    
    @$('.sig_hab_represent').click (event) =>
      @renderSort('sig_hab_represent',tableName, habitats, event, "REPRESENT", tbodyName, false, @getHabitatRowString, isMPA, isCollection)
    @$('.sig_hab_replicate').click (event) =>
      @renderSort('sig_hab_replicate',tableName, habitats, event, "REPLIC", tbodyName, false, @getHabitatRowString, isMPA, isCollection)
    @$('.sig_hab_connected').click (event) =>
      @renderSort('sig_hab_connected',tableName, habitats, event, "CONN", tbodyName, true, @getHabitatRowString, isMPA, isCollection)
    
    @renderSort('sig_hab_new_area', tableName, habitats, undefined, "SIZE_SQKM", tbodyName, true, @getHabitatRowString, isMPA, isCollection)

  setupHabitatSorting: (habitats, isMPA, isCollection) =>
    tbodyName = '.hab_values'
    tableName = '.hab_table'
    @$('.hab_type').click (event) =>
      @renderSort('hab_type', tableName, habitats, event, "HAB_TYPE", tbodyName, false, @getHabitatRowString, isMPA, isCollection)
    @$('.hab_new_area').click (event) =>
      @renderSort('hab_new_area', tableName, habitats, event, "SIZE_SQKM", tbodyName, true, @getHabitatRowString, isMPA, isCollection)
    @$('.hab_new_perc').click (event) =>
      @renderSort('hab_new_perc',tableName, habitats, event, "PERC", tbodyName, true, @getHabitatRowString, isMPA, isCollection)
    
    @$('.hab_represent').click (event) =>
      @renderSort('hab_represent',tableName, habitats, event, "REPRESENT", tbodyName, false, @getHabitatRowString, isMPA, isCollection)
    @$('.hab_replicate').click (event) =>
      @renderSort('hab_replicate',tableName, habitats, event, "REPLIC", tbodyName, false, @getHabitatRowString, isMPA, isCollection)
    @$('.hab_connected').click (event) =>
      @renderSort('hab_connected',tableName, habitats, event, "CONN", tbodyName, true, @getHabitatRowString, isMPA, isCollection)
        

    @renderSort('hab_new_area', tableName, habitats, undefined, "SIZE_SQKM", tbodyName, true, @getHabitatRowString, isMPA, isCollection)



  #do the sorting - should be table independent
  #skip any that are less than 0.00
  renderSort: (name, tableName, pdata, event, sortBy, tbodyName, isFloat, getRowStringValue, isMPA, isCollection) =>
    if event
      event.preventDefault()


    if window.d3
      targetColumn = @getSelectedColumn(event, name)
      sortUp = @getSortDir(targetColumn)

      if isFloat
        data = _.sortBy pdata, (row) -> 
            if isNaN(row[sortBy])
              val = 0.0
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
      hab_body.selectAll("tr.hab_rows")
        .remove()

      #add new rows (and data)
      rows = hab_body.selectAll("tr")
          .data(data)
        .enter().insert("tr", ":first-child")
        .attr("class", "hab_rows")

      if isMPA
        if isCollection
          columns = ["HAB_TYPE", "SIZE_SQKM", "PERC", "REPRESENT", "REPLIC", "CONN"]
        else
          columns = ["HAB_TYPE", "SIZE_SQKM", "PERC", "REPRESENT"]
      else
        columns = ["HAB_TYPE", "SIZE_SQKM", "PERC"]

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

  getFloat: (val) =>
    try
      return parseFloat(val)
    catch error
      return 0.0

  #table row for habitat representation
  getHabitatRowString: (d, isMPA, isCollection) =>
    if d is undefined
      return ""
    represented_str = ""
    replicated_str = ""
    connected_str = ""
    if isMPA
      represented_str = "<td">+d.REPRESENT+"</td>"
      if isCollection
        replicated_str = "<td>"+d.REPLIC+"</td>"
        connected_str = "<td>"+d.CONN+"</td>"

    return "<td>"+d.HAB_TYPE+"</td>"+"<td>"+d.SIZE_SQKM+"</td>"+"<td>"+d.PERC+"</td>"+represented_str+replicated_str

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
      if habClassName is undefined
        habClassName =_.find multiClasses, (classname) -> 
          classname.lastIndexOf('sig',0) == 0 

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