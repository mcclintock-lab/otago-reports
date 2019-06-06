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
    'AdjacentTerrestrial'
  ]


  render: () ->


    #show tables instead of graph for IE
    if window.d3
      d3IsPresent = true
    else
      d3IsPresent = false
    
    scid = @sketchClass.id
    if scid == GENERIC_ID or scid == GENERIC_COLLECTION_ID
      isGeneric = true
    else
      isGeneric = false
    isMPA = (scid == MPA_ID or scid == MPA_COLLECTION_ID or scid == MPA_CONFID_COLLECTION_ID)
    #species info
    try
      seabirds = @recordSet('SpeciesInformation', 'Seabirds').toArray()
      hasSeabirdAreas = seabirds?.length > 0
    catch Error
      hasSeabirdAreas = false

    try
      seabird_colonies = @recordSet('SpeciesInformation', 'SeabirdColonies').toArray()
      hasSeabirdColonies = seabird_colonies?.length > 0
    catch Error
      hasSeabirdColonies = false

    
    hasSeabirds = (seabirds?.length> 0 or seabird_colonies?.length > 0)
    mammals = @recordSet('SpeciesInformation', 'Mammals').toArray()
    hasMammals = mammals?.length > 0
    try
      seals = @recordSet('SpeciesInformation', 'Seals').toArray()
      hasSeals = seals?.length > 0
    catch Error
      hasSeals = false

    
    reef_fish = @recordSet('SpeciesInformation', 'ReefFish').toArray()
    inHighDiversityReefFishArea = reef_fish?.length > 0

    smaro = "SMARO"
    rec_uses = @recordSet('OverlapWithRecreationalUses', 'RecreationalUse').toArray()
    hasSmaro = false


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
    hasMarineSpecies = hasMammals or hasSeals

    #adjacent terrestrial
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
      seabird_colonies: seabird_colonies
      hasSeabirds: hasSeabirds
      hasSeabirdAreas: hasSeabirdAreas
      hasSeabirdColonies: hasSeabirdColonies
      
      mammals: mammals
      hasMammals: hasMammals
      reef_fish: reef_fish
      seals: seals
      hasSeals: hasSeals

      inHighDiversityReefFishArea: inHighDiversityReefFishArea
      hasMarineSpecies: hasMarineSpecies
      
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

    

module.exports = UsesTab