var stateIds = [
  { name: 'AL', id: 1 },{ name: 'AK', id: 2 },{ name: 'AZ', id: 4 },
  { name: 'AR', id: 5 },{ name: 'CA', id: 6 },{ name: 'CO', id: 8 },
  { name: 'CT', id: 9 },{ name: 'DE', id: 10 },{ name: 'FL', id: 12 },
  { name: 'GA', id: 13 },{ name: 'HI', id: 15 },{ name: 'ID', id: 16 },
  { name: 'IL', id: 17 },{ name: 'IN', id: 18 },{ name: 'IA', id: 19 },
  { name: 'KS', id: 20 },{ name: 'KY', id: 21 },{ name: 'LA', id: 22 },
  { name: 'ME', id: 23 },{ name: 'MD', id: 24 },{ name: 'MA', id: 25 },
  { name: 'MI', id: 26 },{ name: 'MN', id: 27 },{ name: 'MS', id: 28 },
  { name: 'MO', id: 29 },{ name: 'MT', id: 30 },{ name: 'NE', id: 31 },
  { name: 'NV', id: 32 },{ name: 'NH', id: 33 },{ name: 'NJ', id: 34 },
  { name: 'NM', id: 35 },{ name: 'NY', id: 36 },{ name: 'NC', id: 37 },
  { name: 'ND', id: 38 },{ name: 'OH', id: 39 },{ name: 'OK', id: 40 },
  { name: 'OR', id: 41 },{ name: 'PA', id: 42 },{ name: 'RI', id: 44 },
  { name: 'SC', id: 45 },{ name: 'SD', id: 46 },{ name: 'TN', id: 47 },
  { name: 'TX', id: 48 },{ name: 'UT', id: 49 },{ name: 'VT', id: 50 },
  { name: 'VA', id: 51 },{ name: 'WA', id: 53 }, { name: 'WV', id: 54 },
  { name: 'WI', id: 55 }, { name: 'WY', id: 56 }
]


////////////////////////////////////////////////////////

//maps width and height
var mapMargin = {top: 0, right: 0, bottom: 0, left: 0};
var width = document.body.clientWidth * 2 / 3 - mapMargin.left - mapMargin.right,
height = window.innerHeight / 2 - mapMargin.top - mapMargin.bottom;

//creates map of usa
var projection = d3.geo.albersUsa()
.scale(width * 0.8)
.translate([width / 2, height * 4 / 9]);

//creates path generator for map
var path = d3.geo.path()
.projection(projection);


var counties = new Map();

var color = d3.scale.ordinal().domain(d3.range(1)).range(["#d53e4f"]),
selectedColor = 0,
dragColor;

var components = color.domain().map(function() { return []; });

var svg = d3.select("#us-map").append("svg")
.attr("width", width)
.attr("height", height);

//////////////////////////////////////////////////////////

d3.json("USA_map/us.json", function(us, error) {
  if (error) throw error;
  
  var bisectId = d3.bisector(function(d) { return d.id; }).left;
  
  var features = topojson.feature(us, us.objects.counties).features;
  
  svg.append("path")
  .datum(topojson.mesh(us, us.objects.counties))
  .attr("class", "background")
  .attr("d", path);
  
  var highlight = svg.append("g")
  .attr("class", "highlight")
  .selectAll("path")
  .data(components)
  .enter().append("path")
  .style("fill", function(d, i) { return color(i); })
  .style("stroke", function(d, i) { return d3.lab(color(i)).darker(); });
  
  svg.append("g")
  .attr("class", "foreground")
  .style("cursor", "pointer")
  .style("stroke-opacity", .5)
  .selectAll("path")
  .data(features)
  .enter().append("path")
  .attr("d", function(d) { d.color = null; return path(d); })
  .on("mouseover", function() { this.style.stroke = "black"; })
  .on("mouseout", function() { this.style.stroke = "none"; })
  .call(d3.behavior.drag()
  .on("dragstart", dragstart));
  
  ////////////////////////////////////////////////////////
  // Create select/clear buttons for each state
  
  d3.select("#all-button-box").append("input")
  .attr("type", "button")
  .attr("value", "Select All")
  .on("click", select_all);
  
  d3.select("#all-button-box").append("input")
  .attr("type", "button")
  .attr("value", "Clear All")
  .on("click", clear_all);
  
  stateIds.forEach(function(d){
    d3.select("#select-state-button-box").append("input")
    .attr("type", "button")
    .attr("value", d.name)
    .attr('class', 'state-button')
    .on("click", function(){select_state(d.id);});
  })
  
  stateIds.forEach(function(d){
    d3.select("#clear-state-button-box").append("input")
    .attr("type", "button")
    .attr("value", d.name)
    .attr('class', 'state-button')
    .on("click", function(){clear_state(d.id);});
  })
  
  ///////////////////////////////////////////////////////////
  
  d3.select("#demo-button-box").append("label")
  .text("Black")
  .append("input")
  .attr("type", "number")
  .attr("id", "black_min")
  .attr("class", "demo-button")
  .attr("value", 0)
  .attr("min", 0)
  .attr("max", 100);
  
  d3.select("#demo-button-box").append("label")
  .text("White")
  .append("input")
  .attr("type", "number")
  .attr("id", "white_min")
  .attr("class", "demo-button")
  .attr("value", 0)
  .attr("min", 0)
  .attr("max", 100);
  
  d3.select("#demo-button-box").append("label")
  .text("Asian")
  .append("input")
  .attr("type", "number")
  .attr("id", "asian-min")
  .attr("class", "demo-button")
  .attr("value", 0)
  .attr("min", 0)
  .attr("max", 100);
  
  d3.select("#demo-button-box").append("label")
  .text("Native American")
  .append("input")
  .attr("type", "number")
  .attr("id", "native-min")
  .attr("class", "demo-button")
  .attr("value", 0)
  .attr("min", 0)
  .attr("max", 100);
  
  d3.select("#demo-button-box").append("label")
  .text("Urban")
  .append("input")
  .attr("type", "number")
  .attr("id", "urban_min")
  .attr("class", "demo-button")
  .attr("value", 0)
  .attr("min", 0)
  .attr("max", 100);
  
  d3.select("#demo-button-box").append("label")
  .text("High School")
  .append("input")
  .attr("type", "number")
  .attr("id", "highschool_min")
  .attr("class", "demo-button")
  .attr("value", 0)
  .attr("min", 0)
  .attr("max", 100);
  
  d3.select("#demo-button-box").append("label")
  .text("College")
  .append("input")
  .attr("type", "number")
  .attr("id", "college_min")
  .attr("class", "demo-button")
  .attr("value", 0)
  .attr("min", 0)
  .attr("max", 100);
  
  d3.select("#demo-button-box").append("label")
  .text("Income")
  .append("input")
  .attr("type", "number")
  .attr("id", "income_min")
  .attr("class", "demo-button")
  .attr("value", 5000)
  .attr("min", 5000)
  .attr("max", 70);
  
  d3.select("#demo-button-box").append("label")
  .text("Age")
  .append("input")
  .attr("type", "number")
  .attr("id", "age_min")
  .attr("class", "demo-button")
  .attr("value", 20)
  .attr("min", 20)
  .attr("max", 50000);
  
  //////////////////////////////////////////////////////
  
  d3.select("#demo-button-box2").append("label")
  .text("Black")
  .append("input")
  .attr("type", "number")
  .attr("id", "black_max")
  .attr("class", "demo-button")
  .attr("value", 100)
  .attr("min", 0)
  .attr("max", 100);
  
  d3.select("#demo-button-box2").append("label")
  .text("White")
  .append("input")
  .attr("type", "number")
  .attr("id", "white_max")
  .attr("class", "demo-button")
  .attr("value", 100)
  .attr("min", 0)
  .attr("max", 100);
  
  d3.select("#demo-button-box2").append("label")
  .text("Asian")
  .append("input")
  .attr("type", "number")
  .attr("id", "asian_max")
  .attr("class", "demo-button")
  .attr("value", 100)
  .attr("min", 0)
  .attr("max", 100);
  
  d3.select("#demo-button-box2").append("label")
  .text("Native American")
  .append("input")
  .attr("type", "number")
  .attr("id", "native_max")
  .attr("class", "demo-button")
  .attr("value", 100)
  .attr("min", 0)
  .attr("max", 100);
  
  d3.select("#demo-button-box2").append("label")
  .text("Urban")
  .append("input")
  .attr("type", "number")
  .attr("id", "urban_max")
  .attr("class", "demo-button")
  .attr("value", 100)
  .attr("min", 0)
  .attr("max", 100);
  
  d3.select("#demo-button-box2").append("label")
  .text("High School")
  .append("input")
  .attr("type", "number")
  .attr("id", "highschool_max")
  .attr("class", "demo-button")
  .attr("value", 100)
  .attr("min", 0)
  .attr("max", 100);
  
  d3.select("#demo-button-box2").append("label")
  .text("College")
  .append("input")
  .attr("type", "number")
  .attr("id", "college_max")
  .attr("class", "demo-button")
  .attr("value", 100)
  .attr("min", 0)
  .attr("max", 100);
  
  d3.select("#demo-button-box2").append("label")
  .text("Income")
  .append("input")
  .attr("type", "number")
  .attr("id", "income_max")
  .attr("class", "demo-button")
  .attr("value", 70000)
  .attr("min", 5000)
  .attr("max", 70000);
  
  d3.select("#demo-button-box2").append("label")
  .text("Age")
  .append("input")
  .attr("type", "number")
  .attr("id", "age_max")
  .attr("class", "demo-button")
  .attr("value", 70)
  .attr("min", 20)
  .attr("max", 70);
  
  
  d3.select("#demo-button-box3").append("input")
  .attr("type", "button")
  .attr("value", "Apply Demographic Ranges")
  .on("click", function(){demo();});
  
  
  ///////////////////////////////////////////////////////////
  
  redraw();
  
  function dragstart() {
    var feature = d3.event.sourceEvent.target.__data__;
    
    if (assign(feature, dragColor = feature.color === selectedColor ? null : selectedColor)) redraw();
  }
  
  function assign(feature, color) {
    if (feature.color === color) return false;
    if (feature.color !== null) {
      var component = components[feature.color];
      component.splice(bisectId(component, feature.id), 1);
      feature.color = null;
      counties.delete(parseInt(feature.id));
    }
    if (color !== null) {
      var component = components[color];
      component.splice(bisectId(component, feature.id), 0, feature);
      feature.color = color;
      info.forEach(function(e){
        if(feature.id == e.id){
          counties.set(parseInt(feature.id), parseInt(e.pop));
        }
      });
    }
    
    return true;
  }
  
  function redraw() {
    highlight.data(components).attr("d", function(d) { return path({type: "FeatureCollection", features: d}) || "M0,0"; });
    
  }
  
  function select_all(){
    features.forEach(function(d){
      assign(d,selectedColor);
    });
    redraw();
  }
  
  function clear_all(){
    features.forEach(function(d){
      assign(d,null);
    });
    redraw();
  }
  
  function select_state(num) {  
    
    features.forEach(function(d){
      if(d.id >= num*1000 && d.id <(num+1)*1000){
        assign(d, selectedColor);
      }
    });
    redraw();
  }
  
  function clear_state(num) {  
    
    features.forEach(function(d){
      if(d.id >= num*1000 && d.id <(num+1)*1000){
        assign(d, null);
      }
    });
    redraw();
  }
  
  function demo(){
    
    var values = [];
    
    d3.selectAll(".demo-button").each(function(d){
      cb = d3.select(this);
      values.push(cb.property("value"));
    });
    features.forEach(function(d){
      info.forEach(function(e){
        if(e.id == d.id){
          if(parseFloat(e.black) >= parseFloat(values[0]) && parseFloat(e.white) >= parseFloat(values[1]) && parseFloat(e.asian) >= parseFloat(values[2]) && parseFloat(e.native) >= parseFloat(values[3]) && parseFloat(e.urban) >= parseFloat(values[4]) && parseFloat(e.highschool) >= parseFloat(values[5]) && parseFloat(e.college) >= parseFloat(values[6]) && parseFloat(e.income) >= parseFloat(values[7]) && parseFloat(e.age) >= parseFloat(values[8])){
            
            if(parseFloat(e.black) <= parseFloat(values[9]) && parseFloat(e.white) <= parseFloat(values[10]) && parseFloat(e.asian) <= parseFloat(values[11]) && parseFloat(e.native) <= parseFloat(values[12]) && parseFloat(e.urban) <= parseFloat(values[13]) && parseFloat(e.highschool) <= parseFloat(values[14]) && parseFloat(e.college) <= parseFloat(values[15]) && parseFloat(e.income) <= parseFloat(values[16]) && parseFloat(e.age) <= parseFloat(values[17])){
              
              assign(d,selectedColor);
            }
            else{
              assign(d,null);
            }
            
          }
          else{
            assign(d,null);
          }
        }
      });
    });
    redraw();
  }
  
});
