// SVG wrapper dimensions are determined by the current width and
// height of the browser window.
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("assets/data/data.csv")
    .then(function(JournalismData) {
      
      // Parse Data/Cast as numbers
      console.log(JournalismData);
        JournalismData.forEach(function(data) {
        data.id = +data.id;
        data.state = +data.state;
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
      });

      // create scales
      var xPovertyScale = d3.scaleLinear()
        .domain(d3.extent(JournalismData, d => d.poverty))
        .range([0, width]);

      var yHealthcareScale = d3.scaleLinear()
        .domain([0, d3.max(JournalismData, d => d.healthcare)])
        .range([height, 0]);

      // create axes
      var xAxis = d3.axisBottom(xPovertyScale).ticks(7);
      var yAxis = d3.axisLeft(yHealthcareScale).ticks(11);

      // append axes
      chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

      chartGroup.append("g")
        .call(yAxis);

      // append and create circles
      var circlesGroup = chartGroup.selectAll("circle")
        .data(JournalismData)
        .enter()
        .append("circle")
        .attr("cx", d => xPovertyScale(d['poverty']))
        .attr("cy", d => yHealthcareScale(d['healthcare']))
        .attr("r", "10")
        .attr("fill", "lightblue")
        .attr("opacity", ".5");

      // Date formatter to display dates nicely
    //   var dateFormatter = d3.timeFormat("%d-%b");

      // Step 1: Initialize Tooltip
      var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
          return (`${d.state}<br>Poverty MOE: ${d.poverty_MOE}<br>Income MOE: ${d.income_MOE}`);
        });

    // Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })

      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

    // Create axes labels
    // Y Label Text
    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "axisText")
    .text("Lacks Healthcare (%)");

    // X Label Text
    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("In Poverty (%)");
    }
  })
});
  
  // updateToolTip function above csv import
  var stateCircles = circlesGroup(chosenXAxis, stateCircles);

  // x axis labels event listener
    chartGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // updates x scale for new data
        xPovertyScale = xPovertyScale(JournalismData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xPovertyScale, xAxis);

        // updates circles with new x values
        stateCircles = renderCircles(stateCircles, xPovertyScale, chosenXAxis);

        // updates tooltips with new info
        stateCircles = circlesGroup(chosenXAxis, stateCircles);
