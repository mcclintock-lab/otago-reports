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
    'FishingIntensity', 'FishingAreas'
  ]

  render: () ->

    #show tables instead of graph for IE
    if window.d3
      d3IsPresent = true
    else
      d3IsPresent = false

    isCollection = @model.isCollection()
    scid = @sketchClass.id
    if scid == MPA_ID or scid == MPA_COLLECTION_ID
      isMPA = true
    else
      isMPA = false

    if isMPA
      setnet = @recordSet('FishingIntensity', 'SetNet').toArray()
      @roundData(setnet)
      trawl = @recordSet('FishingIntensity', 'Trawl').toArray()
      @roundData(trawl)
      longline = @recordSet('FishingIntensity', 'LongLine').toArray()
      @roundData(longline)

    existing_customary_fishing = @recordSet('FishingAreas', 'ExistingCustomaryArea').toArray()
    hasExistingCustomary = existing_customary_fishing?.length > 0
    proposed_customary_fishing = @recordSet('FishingAreas', 'ProposedCustomaryArea').toArray()
    hasProposedCustomary = proposed_customary_fishing?.length > 0

    hasCustomary = hasExistingCustomary or hasProposedCustomary

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
        setnet: setnet
        trawl: trawl
        longline: longline
        isMPA: isMPA
        existing_customary_fishing: existing_customary_fishing
        hasExistingCustomary: hasExistingCustomary
        proposed_customary_fishing: proposed_customary_fishing
        hasProposedCustomary: hasProposedCustomary
        existing_fishing_areas: existing_fishing_areas
        hasExistingFishing: hasExistingFishing
        hasAnyFishing: hasAnyFishing
        hasCustomary: hasCustomary
        isMPA: isMPA
    else
      context =
        sketch: @model.forTemplate()
        sketchClass: @sketchClass.forTemplate()
        attributes: @model.getAttributes()
        anyAttributes: @model.getAttributes().length > 0
        admin: @project.isAdmin window.user
        d3IsPresent: d3IsPresent
        isCollection: isCollection
        existing_customary_fishing: existing_customary_fishing
        hasExistingCustomary: hasExistingCustomary
        proposed_customary_fishing: proposed_customary_fishing
        hasProposedCustomary: hasProposedCustomary
        existing_fishing_areas: existing_fishing_areas
        hasExistingFishing: hasExistingFishing
        hasAnyFishing: hasAnyFishing
        hasCustomary: hasCustomary
        isMPA: isMPA

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()

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

module.exports = FishingTab