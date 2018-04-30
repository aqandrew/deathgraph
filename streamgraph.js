// <!-- http://bl.ocks.org/WillTurman/4631136 -->


// Define global variables
var datearray = [];
var deathCauses = [];
var inputFilename = 'data/death_data_small.csv';
var margin = {top: 20, right: 40, bottom: 30, left: 40};
var width = document.body.clientWidth * 2 / 3 - margin.left - margin.right;
var height = window.innerHeight / 2 - margin.top - margin.bottom - document.getElementById('title').clientHeight;
var colorrange = {}; // mapping of causes of death to fill-colors
const NUM_CAUSES = 21;
const NUM_YEARS = 35;

var svgStreamgraph = d3.select('#deathgraph').append('svg')
.attr('width', width + margin.left + margin.right)
.attr('height', height + margin.top + margin.bottom)
.append('g')
.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var x = d3.time.scale()
.range([0, width]);

var y = d3.scale.linear()
.range([height-10, 0]);

var area = d3.svg.area()
.interpolate('cardinal')
.x(function(d) { return x(d.year); })
.y0(function(d) { return y(d.y0); })
.y1(function(d) { return y(d.y0 + d.y); });

function clearSvg() {
  svgStreamgraph.selectAll('*').remove();
  d3.select('.remove').remove();
}

// Add event listeners
document.getElementById('deathgraph-controls').addEventListener('click', (event) => {
  if (event.target.tagName == 'INPUT' || event.target.innerText == 'Select all') {
    document.getElementById('update-streamgraph-button').disabled = false;
  }
});

// Initialize streamgraph
findAllCauses(inputFilename)
.then((data) => {
  selectAllCauses();
  chart(data);
});

function chart(data) {
  var format = d3.time.format('%Y');
  
  var tooltip = d3.select('body')
  .append('div')
  .attr('class', 'remove')
  .style('position', 'absolute')
  .style('z-index', '20')
  .style('visibility', 'hidden')
  .style('top', '30px')
  .style('left', '55px');
  
  var xAxis = d3.svg.axis()
  .scale(x)
  .orient('bottom')
  .ticks(d3.time.years);
  
  var yAxis = d3.svg.axis()
  .scale(y);
  
  var yAxisr = d3.svg.axis()
  .scale(y);
  
  var stack = d3.layout.stack()
  .offset('zero')
  .values(function(d) { return d.values; })
  .x(function(d) { return d.year; })
  .y(function(d) { return d.mortality_rate; });
  
  var nest = d3.nest()
  .key(function(d) { return d.cause_of_death; });
  
  // Draw the graph
  // TODO take into account which counties' checkboxes are checked
  data = averageMortalityData(data);
  
  // Filter drawn layers based on checked boxes
  // TODO do this without making a pass through the entire dataset
  let deathCheckboxes = document.getElementsByClassName('death-checkbox');
  let selectedDeathCauses = [];
  
  for (let i = 0; i < deathCheckboxes.length; i++) {
    let someCheckbox = deathCheckboxes[i];
    
    if (someCheckbox.checked) {
      selectedDeathCauses.push(someCheckbox.value);
    }
  }
  
  let dataIndex = data.length;
  
  while (dataIndex--) {
    let kebabCause = toKebabCase(data[dataIndex].cause_of_death);
    
    if (!selectedDeathCauses.includes(kebabCause)) {
      data.splice(dataIndex, 1);
    }
  }
  
  data.forEach(function(d) {
    // Format the data
    d.year = format.parse(d.year);
    d.mortality_rate = +d.mortality_rate;
  });
  
  var layers = stack(nest.entries(data));
  
  // Associate each stream with a specific color
  // (We don't want colors to change as we add/remove streams)
  layers.forEach((layer) => {
    layer['color'] = colorrange[layer.key];
  });
  
  x.domain(d3.extent(data, function(d) { return d.year; }));
  y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);
  
  svgStreamgraph.selectAll('.layer')
  .data(layers)
  .enter().append('path')
  .attr('class', 'layer')
  .attr('d', function(d) { return area(d.values); })
  .style('fill', function(d) { return colorrange[toKebabCase(d.key)]; });
  
  svgStreamgraph.append('g')
  .attr('class', 'x axis')
  .attr('transform', 'translate(0,' + (height - 10) + ')')
  .call(xAxis)
  // Rotate axis labels
  .selectAll("text")	
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", ".15em")
  .attr("transform", function(d) {
    return "rotate(-55)";
  });
  
  svgStreamgraph.append('g')
  .attr('class', 'y axis')
  .attr('transform', 'translate(' + width + ', 0)')
  .call(yAxis.orient('right'));
  
  svgStreamgraph.append('g')
  .attr('class', 'y axis')
  .call(yAxis.orient('left'));

  // Write axis labels
  svgStreamgraph.append('text')
  .attr('class', 'axis-label')
  .attr('text-anchor', 'middle')  // this makes it easy to center the text as the transform is applied to the anchor
  .attr('transform', 'translate(' + (- 3 * margin.left / 4) + ',' + (height / 2) + ') rotate(-90)')  // text is drawn off the screen top left, move down and out and rotate
  .text('Deaths per 100,000 people');

  svgStreamgraph.append('text')
  .attr('class', 'axis-label')
  .attr('text-anchor', 'middle')  // this makes it easy to centre the text as the transform is applied to the anchor
  .attr('transform', 'translate(' + (width / 2) + ',' + (height + margin.bottom) + ')')  // center below axis
  .text('Year');
  
  svgStreamgraph.selectAll('.layer')
  .attr('opacity', 1)
  .on('mouseover', function(d, i) {
    svgStreamgraph.selectAll('.layer').transition()
    .duration(250)
    .attr('opacity', function(d, j) {
      return j != i ? 0.6 : 1;
    })})
    
    .on('mousemove', function(d, i) {
      mousex = d3.mouse(this);
      mousex = mousex[0];
      var invertedx = x.invert(mousex);
      invertedx = invertedx.getFullYear();
      var selected = (d.values);
      for (var k = 0; k < selected.length; k++) {
        datearray[k] = selected[k].year;
        datearray[k] = datearray[k].getFullYear();
      }
      
      mousedate = datearray.indexOf(invertedx);
      pro = d.values[mousedate].mortality_rate;
      
      d3.select(this)
      .classed('hover', true)
      .attr('stroke', 'black')
      .attr('stroke-width', '0.5px'), 
      tooltip.html( '<p>' + d.key + '<br>' + pro + '</p>' ).style('visibility', 'visible');
      
    })
    .on('mouseout', function(d, i) {
      svgStreamgraph.selectAll('.layer')
      .transition()
      .duration(250)
      .attr('opacity', '1');
      d3.select(this)
      .classed('hover', false)
      .attr('stroke-width', '0px'), tooltip.html( '<p>' + d.cause_of_death + '<br>' + pro + '</p>' ).style('visibility', 'hidden');
    });
    
    var vertical = d3.select('#deathgraph')
    .append('div')
    .attr('class', 'remove')
    .style('position', 'absolute')
    .style('z-index', '19')
    .style('width', '1px')
    .style('height', '380px')
    .style('top', '40px')
    .style('bottom', '30px')
    .style('left', '0px')
    .style('background', '#fff');
    
    d3.select('#deathgraph')
    .on('mousemove', function(){  
      mousex = d3.mouse(this);
      mousex = mousex[0] + 5;
      vertical.style('left', mousex + 'px' )})
      .on('mouseover', function(){  
        mousex = d3.mouse(this);
        mousex = mousex[0] + 5;
        vertical.style('left', mousex + 'px')});
      }
      
      function averageMortalityData(data) {
        // Average together all counties' mortality rates for each cause of death
        let newData = [];
        let annualData = {}; // Mapping of causes of death to yearly mortality rate averages
        let lastSeenRow = {};
        let deathCause = '';
        let yearString = '';
        let numCounties = 0;
        var element;
        var total_pop = 0;
        var total_deaths = [];
        var current_cause = NUM_CAUSES-1;
        var current_year = 0;

        for(let i=0; i<NUM_CAUSES; ++i){
          total_deaths.push([]);
        }

        for(let i = 0; i<NUM_CAUSES; ++i){
          for(let j = 0; j<NUM_YEARS; j++){
            total_deaths[i][j]=0;
          }
        }
        
        // Build up annualData with averaged mortality rates
        for (let i = 0; i < data.length; i++) {
          element = data[i];
          
          // Keep track of trimmed column values...
          if (element.FIPS) {
            if (element.FIPS != lastSeenRow.FIPS) {
              if(counties.has(element.FIPS)){
                numCounties++;
                total_pop += counties.get(elements.FIPS);
              }
              else{
                i+=735;
                continue;
              }
            }
            if(current_cause==NUM_CAUSES-1){
              current_cause=0;
            }
            else{
              current_cause++;
            }
            lastSeenRow = element;
          }
          // To assign them to trimmed rows
          // else {
          //   Object.defineProperties(data[i], {
          //     location_name: { value: lastSeenRow.location_name },
          //     FIPS: { value: lastSeenRow.FIPS },
          //     cause_id: { value: lastSeenRow.cause_id },
          //     cause_of_death: { value: lastSeenRow.cause_of_death }
          //   });
          // }
          
          deathCause = lastSeenRow.cause_of_death;
          yearString = lastSeenRow.year.toString();
          
          // Store the averages in annualData
          if (!annualData.hasOwnProperty(deathCause)) {
            annualData[deathCause] = {};
          }
          
          total_deaths[current_cause][current_year] += parseFloat(data[i].mortality_rate)*counties.get(lastSeenRow.FIPS);

          
          // If this is the last county in the dataset, divide each sum by the number of counties
          if (numCounties == counties.size) {
            annualData[deathCause][yearString] = total_deaths[current_cause][current_year] / total_pop;
          }

          if(current_year==NUM_YEARS-1){
            current_year=0;
          }
          else{
            current_year++;
          }
        }
        
        // Assign annualData to newData, in the form of death_data_annual.csv
        // I.e. one mortality rate entry-row for each year-COD pair
        for (const cause in annualData) {
          if (annualData.hasOwnProperty(cause)) {
            element = annualData[cause];
            
            for (const year in element) {
              if (element.hasOwnProperty(year)) {
                const mortality_rate = element[year];
                newData.push({
                  'year': year,
                  'cause_of_death': cause,
                  'mortality_rate': mortality_rate
                });
              }
            }
          }
        }
        
        return newData;
      }
      
      function toKebabCase(someString) {
        return someString.toLowerCase()
        .replace(/,/g, '')
        .replace(/\//g, '-')
        .replace(/ /g, '-');
      }
      
      function findAllCauses(csvpath) {
        return new Promise((resolve, reject) => {
          var deathCheckboxContainer = d3.select('#death-checkbox-container');
          
          d3.csv(csvpath, function(data) {
            // TODO do this without making a pass through the entire dataset
            data.forEach(function(d) {
              // Parsing a a new cause
              if (d.cause_of_death && !deathCauses.includes(d.cause_of_death)) {
                deathCauses.push(d.cause_of_death);
              }
            });
            
            // Add cause-of-death checkboxes in alphabetical order
            deathCauses.sort();
            
            // Assign each of the 21 causes of death to a unique color
            for (let causeIndex = 0; causeIndex < deathCauses.length; causeIndex++) {
              let newColor = d3.interpolateRainbow(1.0 * causeIndex / NUM_CAUSES);
              colorrange[toKebabCase(deathCauses[causeIndex])] = newColor;
            }
            
            deathCauses.forEach((d) => {
              let inputGroup = deathCheckboxContainer.append('div')
              .attr('class', 'death-cause-control');
              let causeOfDeath = toKebabCase(d);
              
              inputGroup.append('input')
              .attr('type', 'checkbox')
              .attr('value', causeOfDeath)
              .attr('id', 'select-' + causeOfDeath)
              .attr('class', 'death-checkbox');
              
              let label = inputGroup.append('label')
              .attr('for', 'select-' +  causeOfDeath)
              
              label.insert('div')
              .attr('class', 'legend-box')
              .style('background', colorrange[causeOfDeath]);
              
              label.append('p').text(d);
            });
            
            resolve(data);
          });
        });
      }
      
      function selectAllCauses() {
        deathCauses.forEach((cause) => {
          document.getElementById('select-' + toKebabCase(cause)).checked = true;
        });
      }
      
      function clearAllCauses() {
        deathCauses.forEach((cause) => {
          document.getElementById('select-' + toKebabCase(cause)).checked = false;
        });
      }