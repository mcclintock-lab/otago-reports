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
  name: 'Other'
  className: 'uses'
  timeout: 120000
  template: templates.uses
  dependencies: [
    'OverlapWithRecreationalUses'
    'SpeciesInformation'
  ]


  render: () ->

    #show tables instead of graph for IE
    if window.d3
      d3IsPresent = true
    else
      d3IsPresent = false

    #species info
    seabirds = @recordSet('SpeciesInformation', 'Seabirds').toArray()
    hasSeabirds = seabirds?.length> 0
    mammals = @recordSet('SpeciesInformation', 'Mammals').toArray()
    hasMammals = mammals?.length > 0
    reef_fish = @recordSet('SpeciesInformation', 'ReefFish').toArray()
    inHighDiversityReefFishArea = reef_fish?.length > 0

    smaro = "SMARO"
    rec_uses = @recordSet('OverlapWithRecreationalUses', 'RecreationalUse').toArray()
    hasSmaro = false
    for rec in rec_uses
      console.log(rec.FEAT_TYPE)
      if rec.FEAT_TYPE == smaro
        hasSmaro = true
        break

    console.log("has smaro? ", hasSmaro)
    non_smaro_rec_uses = rec_uses.filter (rec) -> rec.FEAT_TYPE != smaro
    hasRecUses = non_smaro_rec_uses?.length > 0
    
    heritage = @recordSet('OverlapWithRecreationalUses', 'Heritage').toArray()
    hasHeritage = heritage?.length > 0
    coastal_consents = @recordSet('OverlapWithRecreationalUses', 'CoastalConsents').toArray()
    hasCoastal = coastal_consents?.length > 0
    infrastructure =  @recordSet('OverlapWithRecreationalUses', 'Infrastructure').toArray()
    hasInfrastructure = infrastructure?.length > 0
    attributes = @model.getAttributes()
    
    hasUses = hasRecUses or hasHeritage or hasInfrastructure or hasCoastal
    hasSpecies = hasMammals or hasSeabirds or inHighDiversityReefFishArea
    isCollection = @model.isCollection()
    context =
      sketch: @model.forTemplate()
      sketchClass: @sketchClass.forTemplate()
      attributes: @model.getAttributes()
      anyAttributes: @model.getAttributes().length > 0
      admin: @project.isAdmin window.user
      d3IsPresent: d3IsPresent
      rec_uses: non_smaro_rec_uses
      hasSmaro: hasSmaro
      hasRecUses: hasRecUses
      heritage: heritage
      hasHeritage: hasHeritage
      coastal_consents: coastal_consents
      hasCoastal: hasCoastal
      infrastructure: infrastructure
      hasInfrastructure: hasInfrastructure
      hasUses: hasUses
      isCollection: isCollection

      #species info
      seabirds: seabirds
      hasSeabirds: hasSeabirds
      mammals: mammals
      hasMammals: hasMammals
      reef_fish: reef_fish
      inHighDiversityReefFishArea: inHighDiversityReefFishArea
      hasSpecies: hasSpecies

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()

    

module.exports = UsesTab