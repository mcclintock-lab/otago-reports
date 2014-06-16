OverviewTab = require './overview.coffee'
ValuesTab = require './values.coffee'
EnvironmentTab = require './environment.coffee'
FishingTab = require './fishing.coffee'

window.app.registerReport (report) ->
  report.tabs [OverviewTab, EnvironmentTab, FishingTab,ValuesTab]
  # path must be relative to dist/
  report.stylesheets ['./report.css']
