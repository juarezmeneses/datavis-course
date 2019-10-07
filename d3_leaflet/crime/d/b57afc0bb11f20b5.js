// https://observablehq.com/@juarezmeneses/crimes-in-chicago-in-september-of-2019@571
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Crimes in Chicago in September of 2019`
)});
  main.variable(observer()).define(["html"], function(html){return(
html`<code>css</code> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.0/css/bootstrap.min.css" integrity="sha384-PDle/QlgIONtM1aqA2Qemk5gPOE7wFq8+Em+G/hmo5Iq0CCmYZLv3fVRDJ4MMwEA" crossorigin="anonymous"> <link rel="stylesheet" href="https://unpkg.com/leaflet@1.5.1/dist/leaflet.css" integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
crossorigin=""/>`
)});
  main.variable(observer("dataset")).define("dataset", ["d3"], function(d3){return(
d3.csv("https://gist.githubusercontent.com/emanueles/13dfe2c1d43e11b5207bb4e6125d71bf/raw/41d14f8fbd9d6cd9e8ad074f8417cff1329ab339/chicago_crimes_sept_2019.csv").then(function(data){
  // formatando nossos dados    
  let parseDate3 = d3.timeParse("%m/%d/%Y")    
  data.forEach(function(d,i){
       d.primaryType = d["Primary Type"]
       d.dtg = d.Date.substr(0,10)
       d.dtg = parseDate3(d.dtg)        
      // d.magnitude = d3.format(".1f")(d.magnitude)
      // d.depth = d3.format("d")(d.depth)       
   })
  return data
})
)});
  main.variable(observer("colorScale")).define("colorScale", ["d3"], function(d3){return(
d3.scaleOrdinal()
               .domain(["HOMICIDE", "ROBBERY", "BURGLARY"])
               .range(["#ca0020", "#0571b0", "#fdae61"])
)});
  main.variable(observer("facts")).define("facts", ["crossfilter","dataset"], function(crossfilter,dataset){return(
crossfilter(dataset)
)});
  main.variable(observer("dateDimension")).define("dateDimension", ["facts"], function(facts){return(
facts.dimension(d => d.dtg)
)});
  main.variable(observer("crimesDimension")).define("crimesDimension", ["facts"], function(facts){return(
facts.dimension(d => d.primaryType)
)});
  main.variable(observer("crimesGroup")).define("crimesGroup", ["crimesDimension"], function(crimesDimension){return(
crimesDimension.group()
)});
  main.variable(observer("timeDimension")).define("timeDimension", ["facts","d3"], function(facts,d3){return(
facts.dimension((d) => [d.primaryType, d3.timeDay(d.dtg)])
)});
  main.variable(observer("timeGroup")).define("timeGroup", ["timeDimension"], function(timeDimension){return(
timeDimension.group()
)});
  main.variable(observer("buildvis")).define("buildvis", ["md","container","dc","crimesDimension","d3","crimesGroup","colorScale","dataset","width","timeDimension","timeGroup"], function(md,container,dc,crimesDimension,d3,crimesGroup,colorScale,dataset,width,timeDimension,timeGroup)
{
  let view = md`${container()}`   
  let barChart = dc.barChart(view.querySelector("#crimes-chart"))
  barChart.width(480)
          .height(190)
          .dimension(crimesDimension)
          .x(d3.scaleBand())
          .xUnits(dc.units.ordinal)                   
          .gap(53)
          .elasticY(true)
          .group(crimesGroup)
          .colors(colorScale)
          .colorAccessor(d => d.key)
  
  var x = d3.scaleTime()
            .domain(d3.extent(dataset, function(d) { 
              return new Date(d.dtg); 
            }))
            .range([0, width]);  
    
  let lineChart = dc.seriesChart(view.querySelector("#byday-chart"))
  lineChart.width(480)
          .height(190)
          .dimension(timeDimension)
          .x(x)
          //.x(d3.scaleTime()
                  //.domain(d3.extent(crimes, d => d3.timeDay(d.dtg))))
          .elasticX(true)
          .elasticY(true)          
          .group(timeGroup)
          .seriesAccessor((d) => d.key[0])
          .keyAccessor((d) => d.key[1])
          .valueAccessor((d) => d.value)
          .colors(colorScale)
          .colorAccessor(d => d.key[0])
          .xAxisLabel('Time')
          .yAxisLabel('Number of Crimes')
          .xAxis().ticks(d3.timeDay, 2)
                  .tickFormat(d3.timeFormat('%a %d'))                    
          //.tickSizeOuter(0)         
                 
  dc.renderAll()  
  return view
}
);
  main.variable(observer("map")).define("map", ["buildvis","L"], function(buildvis,L)
{
buildvis;
let mapInstance = L.map('mapid').setView([41.8732706,-87.656668], 10.4)
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
attribution: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.', maxZoom: 17 }).addTo(mapInstance)
return mapInstance
}
);
  main.variable(observer("circlesLayer")).define("circlesLayer", ["L","map"], function(L,map){return(
L.layerGroup().addTo(map)
)});
  main.variable(observer("circles")).define("circles", ["circlesLayer","dataset","L","colorScale"], function(circlesLayer,dataset,L,colorScale)
{
  circlesLayer.clearLayers()
  dataset.forEach( function(d) {
  let circle = L.circle([d.Latitude, d.Longitude], 200, {
  color: colorScale(d.primaryType),
  weight: 1.8,
  opacity: 0.9,
  fillColor: colorScale(d.primaryType),
  fillOpacity: 0.5
})
circle.bindPopup("Primary Type: "+ d.primaryType +"<br> Date: " + d.Date+"<br> Block: " + d.Block+"<br> Description: " + d.Description)
circlesLayer.addLayer(circle) })
}
);
  main.variable(observer("container")).define("container", function(){return(
function container() { 
  return `
<main role="main" class="container">
    <div class="row">
      <h4> Crimes in Chicago in September of 2019</h4>
    </div>
    <div class='row'>

        <div id="mapid" class="col-6">

        </div>

        <div class="col-6">
          <div id='crimes-chart'>
            <h5> Number of Crimes by Type </h5>
          </div>            
          <div id='byday-chart'>
            <h5> Number of Crimes by Day </h5>
          </div>
        </div>
    </div> 
    <div class='row'>
      <p>Crime data via <a href="https://data.cityofchicago.org/Public-Safety/Crimes-2001-to-present/ijzp-q8t2">Chicago Data Portal</a>.</p>
    </div>
   
  </main>
 `
}
)});
  main.variable(observer()).define(["html"], function(html){return(
html`Esta célula inclui o css do dc.
<style>

#mapid{
  width: 650px;
  height:480px;
}

.dc-chart path.dc-symbol, .dc-legend g.dc-legend-item.fadeout {
  fill-opacity: 0.5;
  stroke-opacity: 0.5; }

.dc-chart rect.bar {
  stroke: none;
  cursor: pointer; }
  .dc-chart rect.bar:hover {
    fill-opacity: .5; }

.dc-chart rect.deselected {
  stroke: none;
  fill: #ccc; }

.dc-chart .pie-slice {
  fill: #fff;
  font-size: 12px;
  cursor: pointer; }
  .dc-chart .pie-slice.external {
    fill: #000; }
  .dc-chart .pie-slice :hover, .dc-chart .pie-slice.highlight {
    fill-opacity: .8; }

.dc-chart .pie-path {
  fill: none;
  stroke-width: 2px;
  stroke: #000;
  opacity: 0.4; }

.dc-chart .selected path, .dc-chart .selected circle {
  stroke-width: 3;
  stroke: #ccc;
  fill-opacity: 1; }

.dc-chart .deselected path, .dc-chart .deselected circle {
  stroke: none;
  fill-opacity: .5;
  fill: #ccc; }

.dc-chart .axis path, .dc-chart .axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges; }

.dc-chart .axis text {
  font: 10px sans-serif; }

.dc-chart .grid-line, .dc-chart .axis .grid-line, .dc-chart .grid-line line, .dc-chart .axis .grid-line line {
  fill: none;
  stroke: #ccc;
  shape-rendering: crispEdges; }

.dc-chart .brush rect.selection {
  fill: #4682b4;
  fill-opacity: .125; }

.dc-chart .brush .custom-brush-handle {
  fill: #eee;
  stroke: #666;
  cursor: ew-resize; }

.dc-chart path.line {
  fill: none;
  stroke-width: 1.5px; }

.dc-chart path.area {
  fill-opacity: .3;
  stroke: none; }

.dc-chart path.highlight {
  stroke-width: 3;
  fill-opacity: 1;
  stroke-opacity: 1; }

.dc-chart g.state {
  cursor: pointer; }
  .dc-chart g.state :hover {
    fill-opacity: .8; }
  .dc-chart g.state path {
    stroke: #fff; }

.dc-chart g.deselected path {
  fill: #808080; }

.dc-chart g.deselected text {
  display: none; }

.dc-chart g.row rect {
  fill-opacity: 0.8;
  cursor: pointer; }
  .dc-chart g.row rect:hover {
    fill-opacity: 0.6; }

.dc-chart g.row text {
  fill: #fff;
  font-size: 12px;
  cursor: pointer; }

.dc-chart g.dc-tooltip path {
  fill: none;
  stroke: #808080;
  stroke-opacity: .8; }

.dc-chart g.county path {
  stroke: #fff;
  fill: none; }

.dc-chart g.debug rect {
  fill: #00f;
  fill-opacity: .2; }

.dc-chart g.axis text {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none; }

.dc-chart .node {
  font-size: 0.7em;
  cursor: pointer; }
  .dc-chart .node :hover {
    fill-opacity: .8; }

.dc-chart .bubble {
  stroke: none;
  fill-opacity: 0.6; }

.dc-chart .highlight {
  fill-opacity: 1;
  stroke-opacity: 1; }

.dc-chart .fadeout {
  fill-opacity: 0.2;
  stroke-opacity: 0.2; }

.dc-chart .box text {
  font: 10px sans-serif;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none; }

.dc-chart .box line {
  fill: #fff; }

.dc-chart .box rect, .dc-chart .box line, .dc-chart .box circle {
  stroke: #000;
  stroke-width: 1.5px; }

.dc-chart .box .center {
  stroke-dasharray: 3, 3; }

.dc-chart .box .data {
  stroke: none;
  stroke-width: 0px; }

.dc-chart .box .outlier {
  fill: none;
  stroke: #ccc; }

.dc-chart .box .outlierBold {
  fill: red;
  stroke: none; }

.dc-chart .box.deselected {
  opacity: 0.5; }
  .dc-chart .box.deselected .box {
    fill: #ccc; }

.dc-chart .symbol {
  stroke: none; }

.dc-chart .heatmap .box-group.deselected rect {
  stroke: none;
  fill-opacity: 0.5;
  fill: #ccc; }

.dc-chart .heatmap g.axis text {
  pointer-events: all;
  cursor: pointer; }

.dc-chart .empty-chart .pie-slice {
  cursor: default; }
  .dc-chart .empty-chart .pie-slice path {
    fill: #fee;
    cursor: default; }

.dc-data-count {
  float: right;
  margin-top: 15px;
  margin-right: 15px; }
  .dc-data-count .filter-count, .dc-data-count .total-count {
    color: #3182bd;
    font-weight: bold; }

.dc-legend {
  font-size: 11px; }
  .dc-legend .dc-legend-item {
    cursor: pointer; }

.dc-hard .number-display {
  float: none; }

div.dc-html-legend {
  overflow-y: auto;
  overflow-x: hidden;
  height: inherit;
  float: right;
  padding-right: 2px; }
  div.dc-html-legend .dc-legend-item-horizontal {
    display: inline-block;
    margin-left: 5px;
    margin-right: 5px;
    cursor: pointer; }
    div.dc-html-legend .dc-legend-item-horizontal.selected {
      background-color: #3182bd;
      color: white; }
  div.dc-html-legend .dc-legend-item-vertical {
    display: block;
    margin-top: 5px;
    padding-top: 1px;
    padding-bottom: 1px;
    cursor: pointer; }
    div.dc-html-legend .dc-legend-item-vertical.selected {
      background-color: #3182bd;
      color: white; }
  div.dc-html-legend .dc-legend-item-color {
    display: table-cell;
    width: 12px;
    height: 12px; }
  div.dc-html-legend .dc-legend-item-label {
    line-height: 12px;
    display: table-cell;
    vertical-align: middle;
    padding-left: 3px;
    padding-right: 3px;
    font-size: 0.75em; }

.dc-html-legend-container {
  height: inherit; }


</style>`
)});
  main.variable(observer("dc")).define("dc", ["require"], function(require){return(
require('dc')
)});
  main.variable(observer("crossfilter")).define("crossfilter", ["require"], function(require){return(
require('crossfilter2')
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3')
)});
  main.variable(observer("$")).define("$", ["require"], function(require){return(
require('jquery').then(jquery => {
  window.jquery = jquery;
  return require('popper@1.0.1/index.js').catch(() => jquery);
})
)});
  main.variable(observer("bootstrap")).define("bootstrap", ["require"], function(require){return(
require('bootstrap')
)});
  main.variable(observer("L")).define("L", ["require"], function(require){return(
require('leaflet@1.5.1')
)});
  return main;
}
