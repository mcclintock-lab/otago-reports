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
    'FishingAreas'
  ]

  render: () ->

    #show tables instead of graph for IE
    if window.d3
      d3IsPresent = true
    else
      d3IsPresent = false

    existing_customary_fishing = @recordSet('FishingAreas', 'ExistingCustomaryArea').toArray()
    hasExistingCustomary = existing_customary_fishing?.length > 0
    console.log("existing_customary: ", existing_customary_fishing)
    proposed_customary_fishing = @recordSet('FishingAreas', 'ProposedCustomaryArea').toArray()
    console.log("proposed customary: ", proposed_customary_fishing)
    hasProposedCustomary = proposed_customary_fishing?.length > 0
    hasCustomary = hasExistingCustomary or hasProposedCustomary
    console.log("has customary? ", hasCustomary)

    existing_fishing_areas = @recordSet('FishingAreas', 'FishingExistingArea').toArray()
    hasExistingFishing = existing_fishing_areas?.length > 0
    hasAnyFishing = hasExistingFishing or hasCustomary

    attributes = @model.getAttributes()
    
    context =
      sketch: @model.forTemplate()
      sketchClass: @sketchClass.forTemplate()
      attributes: @model.getAttributes()
      anyAttributes: @model.getAttributes().length > 0
      admin: @project.isAdmin window.user
      d3IsPresent: d3IsPresent
      existing_customary_fishing: existing_customary_fishing
      hasExistingCustomary: hasExistingCustomary
      proposed_customary_fishing: proposed_customary_fishing
      hasProposedCustomary: hasProposedCustomary
      existing_fishing_areas: existing_fishing_areas
      hasExistingFishing: hasExistingFishing
      hasAnyFishing: hasAnyFishing
      hasCustomary: hasCustomary
      
    @$el.html @template.render(context, partials)
    @enableLayerTogglers()

    

module.exports = FishingTab