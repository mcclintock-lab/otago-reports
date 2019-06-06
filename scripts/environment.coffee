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
    'NewHabRepsToolbox'
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

    isMPA = (scid == MPA_ID or scid == MPA_COLLECTION_ID or scid == MPA_CONFID_COLLECTION_ID)
    
    hab_sizes = @recordSet('NewHabRepsToolbox', 'HabSizes').toArray()

    habs_in_sketch = hab_sizes?.length
    habs_plural = habs_in_sketch != 1


    REP_NAME = "Patch Size (Type-1)"
    isConfid = false
    habitats_represented = @recordSet('NewHabRepsToolbox', 'RepresentedHabs').toArray()
    console.log("habs::::", habitats_represented)
    @roundData habitats_represented
    noReserveTypes = @hasNoReserveTypes @model.getChildren()
    
    all_habs = @processHabitats(habitats_represented, noReserveTypes)
 
    coastal_hab_types = all_habs[0]
    hasCoastalHabTypes = coastal_hab_types?.length > 0
    estuarine_hab_types = all_habs[1]
    hasEstuarineHabTypes = estuarine_hab_types?.length > 0
    sig_habs = all_habs[2]
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

      coastal_hab_types: coastal_hab_types
      hasCoastalHabTypes: hasCoastalHabTypes
      estuarine_hab_types: estuarine_hab_types
      hasEstuarineHabTypes: hasEstuarineHabTypes

      sig_habs: sig_habs
      hasSigHabs: hasSigHabs

      habs_plural: habs_plural
      habitats_represented: habitats_represented

      
      #only needed while we have Included/Patch Size behaving differently for MPA (confid) and MPA
      REP_NAME: REP_NAME
      isConfid: isConfid

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()
    @roundData(hab_sizes)
    @setupCoastalHabitatSorting(coastal_hab_types, isMPA, isCollection)
    @setupEstuarineHabitatSorting(estuarine_hab_types, isMPA, isCollection)
    @setupSigHabitatSorting(sig_habs, isMPA, isCollection)

    @enableTablePaging()
    
  processHabitats: (habs_represented, noReserves) =>
    coastal_hab_types = []
    estuarine_hab_types = []
    critical_habitats = []
    for hab in habs_represented
      #if there are only type 2 and other reserves, show patch size as NA if its 0
      if noReserves
        try
          if Number.parseFloat(hab.REPRESENT) == 0.0
            hab.REPRESENT="NA"
        catch Error

      if hab.HAB_TYPE == "Bryozoan reef" or hab.HAB_TYPE == "Macrocystis bed" or hab.HAB_TYPE == "Seagrass bed"
        '''
        June 2019 changes
        “Sensitive Marine Habitats” table: 
         only keep seagrass bed, Bryozoans (but call “Bryozoan Thicket”) 
         and Macrocystis bed (but call “Giant Kelp Forest”); 
        '''
        if hab.HAB_TYPE == "Bryozoan reef"
          hab.HAB_TYPE = "Bryozoan Thicket"
        if  hab.HAB_TYPE == "Macrocystis bed"
          hab.HAB_TYPE = "Giant Kelp Forest"
        if hab.HAB_TYPE == "Seagrass bed"
          hab.HAB_TYPE =  "Seagrass Bed"
        critical_habitats.push(hab)
      else

        if hab.HAB_TYPE.indexOf("Estuarine") == 0 or hab.HAB_TYPE == "Mud Flat"
          estuarine_hab_types.push(hab)
        else
          #skipping this one because its so small
          if hab.HAB_TYPE != "Deep Water Gravel"
            coastal_hab_types.push(hab)

   
    '''
     #June 2019 - removed
    na_habs = ["Brachiopod beds", "Calcareous tube worm thickets", "Chaetopteridae worm fields",
               "Rhodolith beds", "Sea pen fields", "Sponge gardens", "Stony coral thickets"]
    for nh in na_habs
      new_hab = {"HAB_TYPE": nh, "SIZE_SQKM":"NA", "PERC":"NA", "REPRESENT":"NA", "REPLIC":"NA", "CONN":"NA"}
      critical_habitats.push(new_hab)
    '''
    return [coastal_hab_types, estuarine_hab_types, critical_habitats]

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

  setupCoastalHabitatSorting: (habitats, isMPA, isCollection) =>
    tbodyName = '.coastal_hab_values'
    tableName = '.coastal_hab_table'
    @$('.coastal_hab_type').click (event) =>
      @renderSort('coastal_hab_type', tableName, habitats, event, "HAB_TYPE", tbodyName, false, @getHabitatRowString, isMPA, isCollection)
    @$('.coastal_hab_new_area').click (event) =>
      @renderSort('coastal_hab_new_area', tableName, habitats, event, "SIZE_SQKM", tbodyName, true, @getHabitatRowString, isMPA, isCollection)
    @$('.coastal_hab_new_perc').click (event) =>
      @renderSort('coastal_hab_new_perc',tableName, habitats, event, "PERC", tbodyName, true, @getHabitatRowString, isMPA, isCollection)
    
    @$('.coastal_hab_represent').click (event) =>
      @renderSort('coastal_hab_represent',tableName, habitats, event, "REPRESENT", tbodyName, false, @getHabitatRowString, isMPA, isCollection)
    @$('.coastal_hab_replicate').click (event) =>
      @renderSort('coastal_hab_replicate',tableName, habitats, event, "REPLIC", tbodyName, false, @getHabitatRowString, isMPA, isCollection)
    @$('.coastal_hab_connected').click (event) =>
      @renderSort('coastal_hab_connected',tableName, habitats, event, "CONN", tbodyName, true, @getHabitatRowString, isMPA, isCollection)
    @renderSort('coastal_hab_new_area', tableName, habitats, undefined, "SIZE_SQKM", tbodyName, true, @getHabitatRowString, isMPA, isCollection)

  setupEstuarineHabitatSorting: (habitats, isMPA, isCollection) =>
    tbodyName = '.estuarine_hab_values'
    tableName = '.estuarine_hab_table'
    @$('.estuarine_hab_type').click (event) =>
      @renderSort('estuarine_hab_type', tableName, habitats, event, "HAB_TYPE", tbodyName, false, @getHabitatRowString, isMPA, isCollection)
    @$('.estuarine_hab_new_area').click (event) =>
      @renderSort('estuarine_hab_new_area', tableName, habitats, event, "SIZE_SQKM", tbodyName, true, @getHabitatRowString, isMPA, isCollection)
    @$('.estuarine_hab_new_perc').click (event) =>
      @renderSort('estuarine_hab_new_perc',tableName, habitats, event, "PERC", tbodyName, true, @getHabitatRowString, isMPA, isCollection)
    
    @$('.estuarine_hab_represent').click (event) =>
      @renderSort('estuarine_hab_represent',tableName, habitats, event, "REPRESENT", tbodyName, false, @getHabitatRowString, isMPA, isCollection)
    @$('.estuarine_hab_replicate').click (event) =>
      @renderSort('estuarine_hab_replicate',tableName, habitats, event, "REPLIC", tbodyName, false, @getHabitatRowString, isMPA, isCollection)
    @$('.estuarine_hab_connected').click (event) =>
      @renderSort('estuarine_hab_connected',tableName, habitats, event, "CONN", tbodyName, true, @getHabitatRowString, isMPA, isCollection)
    @renderSort('estuarinehab_new_area', tableName, habitats, undefined, "SIZE_SQKM", tbodyName, true, @getHabitatRowString, isMPA, isCollection)



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
      hab_body.selectAll("tr.hab_rows")
        .remove()

      #add new rows (and data)
      rows = hab_body.selectAll("tr")
          .data(data)
        .enter().insert("tr", ":first-child")
        .attr("class", "hab_rows")

      if isMPA
        #June 2019removed  "REPRESENT" from 3rd position
        if isCollection
          columns = ["HAB_TYPE", "SIZE_SQKM", "PERC", "REPLIC", "CONN"]
        else
          columns = ["HAB_TYPE", "SIZE_SQKM", "PERC"]
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
      
      represented_str = ''
      if isCollection
        replicated_str = "<td>"+d.REPLIC+"</td>"
        connected_str = "<td>"+d.CONN+"</td>"
        represented_str = "<td">+d.REPRESENT+"</td>"

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
        classname.lastIndexOf('coastal_hab',0) == 0 or classname.lastIndexOf('estuarine_hab',0) == 0
      
      if habClassName is undefined
        habClassName =_.find multiClasses, (classname) -> 
          classname.lastIndexOf('sig',0) == 0 

      targetColumn = habClassName
    else
      #when there is no event, first time table is filled
      targetColumn = name

    return targetColumn

  hasNoReserveTypes: (reserves) =>
    try
      t2_str = "Type2"
      mr_str = "MR"
      other_str = "Other"
      numreserves = 0

      for res in reserves
        attrs = res.getAttributes()
        for att in attrs
          if att.exportid == "MANAGEMENT" 
            res_type = att.value
            if res_type == mr_str or res_type.indexOf(mr_str) >=0
                numreserves+=1

      return (numreserves == 0)

    catch Error
      console.log("something went wrong looking for reserve attribute...")
      return false    

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