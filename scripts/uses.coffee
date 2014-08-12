ReportTab = require 'reportTab'
templates = require '../templates/templates.js'

_partials = require '../node_modules/seasketch-reporting-api/templates/templates.js'

partials = []
for key, val of _partials
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val

ids = require './ids.coffee'
for key, value of ids
  window[key] = value


class UsesTab extends ReportTab
  # this is the name that will be displayed in the Tab
  name: 'Activities Uses'
  className: 'uses'
  timeout: 120000
  template: templates.uses
  dependencies: [
    'OverlapWithRecreationalUses'
  ]


  render: () ->

    #show tables instead of graph for IE
    if window.d3
      d3IsPresent = true
    else
      d3IsPresent = false

    rec_uses = @recordSet('OverlapWithRecreationalUses', 'RecreationalUse').toArray()
    hasRecUses = rec_uses?.length > 0
    heritage = @recordSet('OverlapWithRecreationalUses', 'Heritage').toArray()
    hasHeritage = heritage?.length > 0
    coastal_consents = @recordSet('OverlapWithRecreationalUses', 'CoastalConsents').toArray()
    hasCoastal = coastal_consents?.length > 0
    infrastructure =  @recordSet('OverlapWithRecreationalUses', 'Infrastructure').toArray()
    hasInfrastructure = infrastructure?.length > 0
    attributes = @model.getAttributes()
    hasUses = hasRecUses or hasHeritage or hasInfrastructure or hasCoastal
    context =
      sketch: @model.forTemplate()
      sketchClass: @sketchClass.forTemplate()
      attributes: @model.getAttributes()
      anyAttributes: @model.getAttributes().length > 0
      admin: @project.isAdmin window.user
      d3IsPresent: d3IsPresent
      rec_uses: rec_uses
      hasRecUses: hasRecUses
      heritage: heritage
      hasHeritage: hasHeritage
      coastal_consents: coastal_consents
      hasCoastal: hasCoastal
      infrastructure: infrastructure
      hasInfrastructure: hasInfrastructure
      hasUses: hasUses

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()

    

module.exports = UsesTab