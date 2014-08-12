OverviewTab = require './overview.coffee'
UsesTab = require './uses.coffee'
EnvironmentTab = require './environment.coffee'
FishingTab = require './fishing.coffee'

window.app.registerReport (report) ->
  report.tabs [OverviewTab, EnvironmentTab, FishingTab,UsesTab]
  # path must be relative to dist/
  report.stylesheets ['./report.css']
