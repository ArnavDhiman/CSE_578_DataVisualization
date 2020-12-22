// Written by Quinn Fischer 
// Last Updated: 11-28-2020
// Code based on prior project work, innovis.js, and:
// https://www.d3-graph-gallery.com/graph/violin_basicHist.html

var all_svg;
var all_svgSize;
var all_svgMargin = { top: 20, right: 60, bottom: 60, left: 100 };

var all_dataFri;
var all_dataSat;
var all_dataSun;
var all_dataActive;
var all_dataFiltered;

var all_xScaleTime;
var all_yScaleClusters;
var all_histogram;
var all_tooltip;

var all_rideDictionary = {};
var inverse_all_rideDictionary = {};
var all_dataLocation = 0;

var global_clusterColorScale = d3.schemePaired;

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Define all_svg canvas and its size parameters for convenience
    all_svg = d3.select('#alluvis');
    let svgWidth = +all_svg.style('width').replace('px','');
    let svgHeight = +all_svg.style('height').replace('px','');
    let svgInnerWidth = svgWidth - all_svgMargin.left - all_svgMargin.right;
    let svgInnerHeight = svgHeight - all_svgMargin.top - all_svgMargin.bottom;
    all_svgSize = { width: svgWidth, height: svgHeight, innerWidth: svgInnerWidth, innerHeight: svgInnerHeight };
    // Finish static scales
    // Define scale, range, domain of X axis
    all_xScaleTime = d3.scaleLinear().domain([8, 23]).range([ 0, all_svgSize.innerWidth ]);
    // Define scale, range, domain of Y axis
    all_yScaleClusters = d3.scaleBand().domain(["0", "1", "2", "3","4", "5", "6","7", "8", "9","10", "11"]).range([ all_svgSize.innerHeight, 0 ])
    .padding(0.1); // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.

    // Features of the histogram
    all_histogram = d3.histogram()
    .domain(all_xScaleTime.domain())
    .thresholds(all_xScaleTime.ticks(32)) // Num of bins
    .value(d => d)

    // Build tooltip
    all_tooltip = d3.select("body").append("div").attr("id", "tooltip-violin")
    .attr("class", "innovis-tooltip-box").style("visibility", "hidden")
    .html("Value");

    // Load the data files before doing anything else
    Promise.all([d3.csv('data/alluvis/fridayViolin.csv'), 
                 d3.csv('data/alluvis/saturdayViolin.csv'),
                 d3.csv('data/alluvis/sundayViolin.csv'),
                 d3.csv('data/checkin_locations.csv')]) // !To be changed to actual sunday data!
    .then(function(values){
        // Load datasets to variables
        all_dataFri = values[0];
        all_dataSat = values[1];
        all_dataSun = values[2];

        // Construct dictionary for ride names
        values[3].forEach(entry => {
            all_rideDictionary[+entry[""]] = entry.Name;
            inverse_all_rideDictionary[entry.Name] = +entry[""];
        });

        // Populate Ride Selector
        let selector = d3.select('#alluvis-ride-select');
        for (const [key, value] of Object.entries(all_rideDictionary)) {
            selector.append('option')
            .attr('value', key).html(value);
        }

        // Event Element Handles
        const all_fridayTag = document.getElementById("input-friday");
        const all_satTag = document.getElementById("input-saturday");
        const all_sundayTag = document.getElementById("input-sunday");
        const all_rideSelectTag = document.getElementById("alluvis-ride-select");

        // Event listeners
        all_fridayTag.addEventListener('change', (event) => {       dayEvent();    });
        all_satTag.addEventListener('change', (event) => {          dayEvent();    });
        all_sundayTag.addEventListener('change', (event) => {       dayEvent();    });
        all_rideSelectTag.addEventListener('input', (event) => {    regionEvent(); });

        // Initialize Canvas
        drawCanvas();
    });
  
  });
document.ready

// Helper functions called by events
function dayEvent() {
    populateDataset();
    updateCanvas();
}
function regionEvent() {
    // Gets data location selected
    
    let local_selector = d3.select('#alluvis-ride-select');
    all_dataLocation = local_selector.node().value;
    console.log(all_dataLocation);
    updateCanvas();
}

function regionEventFromInnoVis(inno_reg) {
    // Gets data location selected
    let local_selector = d3.select('#alluvis-ride-select');
    if (!inno_reg in inverse_all_rideDictionary){
        return;
    }
    let v = inverse_all_rideDictionary[inno_reg];
    local_selector.node().value = v;
    all_dataLocation = v;
    updateCanvas();
}

// Helper function to round time according to 30 minutes around the time 
// i.e. time + f( [0, 0.25) -> 0, [0.25, 0.75) -> 0.5, [0.75, 1) -> 1 )
function timeRound(time) {
    let timeFloor = Math.floor(time)
    let decimal = time - timeFloor
    let newTime = timeFloor
    if (decimal < 0.25) {
        newTime = newTime
    }   else if (decimal < 0.75) {
        newTime = newTime + 0.5
    }   else {
        newTime = newTime + 1.0
    }
    return newTime
}

// Gets the defined dataset according to the global_daysMap filter
function populateDataset() {
    let local_data = [];
    if (global_daysMap['fri']) {
        local_data = all_dataFri;
    }
    if (global_daysMap['sat']) {
        local_data = violin_dataset_join(all_dataSat, local_data)
    }
    if (global_daysMap['sun']) {
        local_data = violin_dataset_join(all_dataSun, local_data)
    }
    all_dataActive = local_data;
    if (undefined == all_dataActive) {    all_dataActive = []; }
}

// Updates the canvas [Title, Violin plot, Tracking rectangle]
function updateCanvas() {
    // Draw Title
    all_svg.select("#title-label").remove();  // Remove old title, if it exists
    all_svg.append("text").attr("id", "title-label").attr("class", "all_axislabel")
    .attr("x", all_svgSize.width / 2)
    .attr("y", all_svgMargin.top)
    .text("Ride: " + all_rideDictionary[all_dataLocation]);

    // Filter data to location
    let all_dataFiltered = all_dataActive.filter(function(d) { return d.ride == all_dataLocation });
    // What is the biggest count in a bin? We need it cause this value will have a width of 100% of the bandwidth.
    let local_maxNum = d3.max(all_dataFiltered, function(d) { return +d.count; })
    let local_countScale = d3.scaleSqrt().domain([0, local_maxNum]).range([10,100]); // Sqrt looks best, and range starting at 10 means low values are still easy to see.

    let local_violinSet = d3.nest()  // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.cluster;})
    .rollup(function(d) {   // For each key..
        tempDict = {}
        input = d.map(function(g) { tempDict[+g.time] = g.count; }) // Count up counts at times
        bins = all_histogram([])   // Compute basic binning, then fill in relevant values
        bins.forEach(element => {
            temp = tempDict[element.x0];
            if (temp != undefined) {    element[0] = local_countScale(+temp);
            } else {                    element[0] = 0; }
        })
        return(bins)
    })
    .entries(all_dataFiltered);

    // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
    let local_yNumber = d3.scaleLinear()
    .range([0, all_yScaleClusters.bandwidth()])
    .domain([-100,100])

    // Draw Graph 
    all_svg.selectAll("#violin").remove();  // Remove old violins, if they exists
    all_svg.selectAll("#violin")
    .data(local_violinSet)
    .enter() // Working group per group
    .append("g").attr("id", "violin")
        .attr("transform", function(d){ return("translate(" + all_svgMargin.left + ", " + (all_svgMargin.top + all_yScaleClusters(d.key)) +")") } ) // Translation to be at the group position
    .append("path")
        .style("fill", function(d){ return(global_clusterColorScale[d.key])   }) // Color Scale
        .datum(function(d){ return(d.value);    })     // So now we are working bin per bin
        .style("stroke", "none")
        .attr("d", d3.area()
            .y0(function(d){ return(local_yNumber(-d[0])) } )
            .y1(function(d){ return(local_yNumber(d[0])) } )
            .x(function(d){ return(all_xScaleTime(d.x0)) } )
        )
    
    // Tracking Rectangle with mouse functions.
    all_svg.selectAll("#all-tracking-rectangle").remove();  // Remove old tracking rectangle, if it exists
    all_svg.append('rect').attr('id', 'all-tracking-rectangle')
    .style("fill", "none").style("pointer-events", "all")
    .attr('x', 0).attr('y', 0)
    .attr('width', all_svgSize.width).attr('height', all_svgSize.height)
    .on('mouseover', function() {
        all_tooltip.style("visibility", "visible")
    })
    .on('mousemove', function() {
        // Gets Data Entries from selected time
        let xMouse = all_xScaleTime.invert(d3.mouse(this)[0] - all_svgMargin.left);
        let xRound = timeRound(xMouse)
        let timeEntries = all_dataFiltered.filter(function(d, index, array) {
        if (xRound == d.time) 
        { return d; }
        });

        // Gets Data Entries from selected group
        let yMouse = all_svgSize.innerHeight - d3.mouse(this)[1];
        let eachBand = all_yScaleClusters.step();
        let index = Math.round((yMouse / eachBand));
        let yVal = all_yScaleClusters.domain()[index];
        let selectedEntry = timeEntries.filter(function(d, index, array) {
            if (yVal == d.cluster) 
            { return d; }
        })[0];

        // Update Tooltip Text
        if (yVal) {
            let newHtmlString = "Count: ";
            if (selectedEntry) { // Update text only upon mousing over an entry.
                newHtmlString += selectedEntry.count;
            } else {
                newHtmlString += "0";
            }
            newHtmlString += "<br>Group: " + yVal + "<br>Time: " + xRound;
            all_tooltip.html(newHtmlString).style("visibility", "visible")
            .style("top",  (d3.event.pageY-45) + "px").style("left", (d3.event.pageX+15) + "px");
        } else {    all_tooltip.style("visibility", "hidden");   }
    })
    .on('mouseout', function() {
        all_tooltip.style("visibility", "hidden");
    });
}

// Draws the canvas for the first time [axes & labels] (then calls populateDataset and updateCanvas)
function drawCanvas() {
    // Draw X axis
    all_svg.append("g").attr("id", "x-axis").attr("class", "all_axis")
    .attr("transform", "translate("+ all_svgMargin.left +"," + (all_svgSize.height - all_svgMargin.bottom) + ")")
    .call(d3.axisBottom(all_xScaleTime).tickValues(all_xScaleTime.ticks(32)).tickFormat(d3.format("1.1f")));
    
    // Draw Y axis
    all_svg.append("g").attr("id", "y-axis").attr("class", "all_axis")
    .attr("transform", "translate("+ all_svgMargin.left +"," + all_svgMargin.top + ")")
    .call(d3.axisRight(all_yScaleClusters).tickSize(all_svgSize.innerWidth))
    .call(  g => g.select(".domain").remove() )
    .call(  g => g.selectAll(".tick")
            .attr("stroke-opacity", 0.5)
            .attr("stroke-dasharray", "16,8")  )
    .call(  g => g.selectAll(".tick text")
            .style("text-anchor", "end")
            .attr("x", -24));
    // Draw X Axis Label
    all_svg.append("text").attr("id", "x-label").attr("class", "all_axislabel")
    .attr("x", all_svgSize.width / 2)
    .attr("y", all_svgSize.height - all_svgMargin.bottom / 4)
    .text("Hours");

    // Draw Y Axis Label
    all_svg.append("text").attr("id", "y-label").attr("class", "all_axislabel")
    .attr("transform", "rotate(-90)")
    .attr("x", -all_svgSize.height / 2)
    .attr("y", all_svgMargin.left / 3)
    .text("Groups");

    populateDataset();
    updateCanvas();
}

//Helper function to define which entries to select, and the format to return / merge them
function violin_select(a, b) {
    let tempCount = a.count;
    if (b !== undefined) {  tempCount = parseInt(a.count) + parseInt(b.count);  }
    return {
        time: a.time,
        cluster: a.cluster,
        ride: a.ride,
        count: tempCount,
    };
}

// Helper joins datasets according to which is larger
function violin_dataset_join(datasetA, datasetB) {
    if (datasetA.length > datasetB.length) {
        return join(datasetA, datasetB);
    }
    return join(datasetB, datasetA);
}

// Derived from http://learnjsdata.com/combine_data.html with heavy editing to facilitate this use case (multi-column keys, unique entries)
function join(lookupTable, mainTable) {
    let l = lookupTable.length,
        m = mainTable.length,
        lookupIndex = [],
        output = [];
    for (let i = 0; i < l; i++) { // loop through l items
        let row = lookupTable[i];
        let key = [row["time"], row["cluster"], row["ride"]].join('-');
        lookupIndex[key] = row; // create an index for lookup table
    }
    for (var j = 0; j < m; j++) { // loop through m items
        let y = mainTable[j];
        let key = [y["time"], y["cluster"], y["ride"]].join('-');
        let x = lookupIndex[key]; // get corresponding row from lookupTable
        output.push(violin_select(y, x)); // select only the columns you need
        lookupIndex[key] = 0;
    }
    for (const [key, value] of Object.entries(lookupIndex)) { // handle unvisited entries
        if (0 != value) {
            output.push(value);
        }
      }
    return output;
};

// Function called to display information about group Violin Chart
const groupViolinInfo = () =>{
    var data = {
        header: "Group Violin Plot",
        body: {
            info:'This visualization is a violin plot displaying the number of check-ins our groups makes over time \
            at the selected ride or entry way in the park. The number of check-ins encompasses a time window of the 30 minutes around the stated time. \
            So, the displayed time of 9.5 represents 09:30 and covers check-ins from [9:15, 9:45).\
            The thickness of the plot represents the number of check-ins, with small values being inflated to be easily visible. \
            ',
            usage:{
                head: 'Usage',
                items:[
                    'Select the ride/entry way you want to see (defaults to Entry / the main entrance).',
                    'Select the day (or a combination of days) from the filter to view appropriate day\'s data',
                    'You can also hover on the graph to see more information for the selected section. Namely the count, group, and time'
                ]
            }
        }
    }
    modalShow(data)
}