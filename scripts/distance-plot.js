var scatterSVGDistPlot;

//variables for storing data
var fridayData;
var saturdayData;
var sundayData;

//Area variables
var lineWidthDistPlot;
var lineHeightDistPlot;
var lineInnerHeightDistPlot;
var lineInnerWidthDistPlot;
var lineMarginDistPlot = { top: 20, right: 120, bottom: 60, left: 100 };
const width = 800 - lineMarginDistPlot.left - lineMarginDistPlot.right;

var xScaleDistPlot;
var yScaleDistPlot;

document.addEventListener('DOMContentLoaded', function() {
    scatterSVGDistPlot = d3.select('#distance_plot');

    lineWidthDistPlot = +scatterSVGDistPlot.style('width').replace('px','');
    lineHeightDistPlot = +scatterSVGDistPlot.style('height').replace('px','');;
    lineInnerWidthDistPlot = lineWidthDistPlot - lineMarginDistPlot.left - lineMarginDistPlot.right;
    lineInnerHeightDistPlot = lineHeightDistPlot - lineMarginDistPlot.top - lineMarginDistPlot.bottom;
  
    Promise.all([d3.csv('../data/distance-plot/friday.csv'),
				 d3.csv('../data/distance-plot/saturday.csv'),
				 d3.csv('../data/distance-plot/sunday.csv')
				])
                  .then(function(data){
                  fridayData = data[0];
				  saturdayData = data[1];
				  sundayData = data[2];
                  drawDistPlot();
                })  
  }
);

function onClickDist2Plot(clusterId) {
    scatterSVGDistPlot.selectAll(".distanceLine").remove();
    document.getElementById('clusterId').value = clusterId;
	
    plotDistData(fridayData, clusterId, "red");
    plotDistData(saturdayData, clusterId, "blue");
    plotDistData(sundayData, clusterId, "green");
}


function onClickDistPlot() {
	scatterSVGDistPlot.selectAll(".distanceLine").remove();
	var clusterId = document.getElementById('clusterId').value;
    plotDistData(fridayData, clusterId, "red");
    plotDistData(saturdayData, clusterId, "blue");
    plotDistData(sundayData, clusterId, "green");
}


function plotDistData(dayData, id, colour) {
	var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.cluster;})
    .entries(dayData);

	scatterSVGDistPlot.selectAll(".line")
      .data(sumstat)
      .enter()
      .append("path")
        .attr("class", "distanceLine")
        .attr("fill", "none")
        .attr("stroke", colour)
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
		  if (d.key == id) {
          return d3.line()
            .x(function(d) { return xScaleDistPlot(d.hour); })
            .y(function(d) { return yScaleDistPlot(d.distance); })
            (d.values)
		  }
		  else {return null;}
        });

}


function drawDistPlot() {
    scatterSVGDistPlot.selectAll('.distLabel').remove();
    scatterSVGDistPlot.selectAll('.distAxis').remove();
    scatterSVGDistPlot.selectAll('g').remove();
    scatterSVGDistPlot.selectAll('text').remove();
    
    
    //Let's start plotting again
    scatterSVGDistPlot.append("g")             
               .attr("transform","translate(" + lineMarginDistPlot.left + "," + lineMarginDistPlot.top + ")");

    xScaleDistPlot = d3.scaleLinear()
                .range([lineMarginDistPlot.left, lineMarginDistPlot.left + lineInnerWidthDistPlot]);
    yScaleDistPlot = d3.scaleLinear()
                .range([lineInnerHeightDistPlot, lineMarginDistPlot.top]);
    
    xScaleDistPlot.domain([8, 23]);
    yScaleDistPlot.domain([d3.min([d3.min(fridayData, function(d){ return d.distance;})
                                  ,d3.min(saturdayData, function(d){ return d.distance;})
                                  ,d3.min(sundayData, function(d){ return d.distance;})
                                  ])
                          ,d3.max([d3.max(fridayData, function(d){ return d.distance;})
                                  ,d3.max(saturdayData, function(d){ return d.distance;})
                                  ,d3.max(sundayData, function(d){ return d.distance;})
                                  ])
                         ]);

    console.log(xScaleDistPlot.domain());
    const xAxis = d3.axisBottom(xScaleDistPlot)
					 .ticks(16);
                     //.tickFormat(function(d) {return d;});
    
    scatterSVGDistPlot.append("g")
               .attr("transform", "translate(0," + lineInnerHeightDistPlot + ")")
               .attr("class", "distAxis")
               .call(xAxis)
               .call(g => g.select(".domain"));
    
    scatterSVGDistPlot.append("text")
        .attr("class", "distLabel")
        .attr("x", lineWidthDistPlot/2 )
        .attr("y", lineInnerHeightDistPlot + lineMarginDistPlot.top + 25)
        .style("text-anchor", "middle")
        .text("Hour");


    const yAxis = d3.axisLeft(yScaleDistPlot)
    .tickSize(-lineInnerWidthDistPlot );
  
    scatterSVGDistPlot.append("g")
        .attr(`transform`, `translate(${lineMarginDistPlot.left}, 0)`)
        .attr("class", "distAxis")
        .call(yAxis)
        .call(g => g.select(".domain"))
        .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-dasharray", "5,10"))
        .call(g => g.selectAll(".tick text")
        .attr("x", -4)
        .attr("dy", 4));
    
    scatterSVGDistPlot.append("text")
        .attr("class", "distLabel")
        .attr("transform", "rotate(-90)")
        .attr("y",lineMarginDistPlot.right - 80)
        .attr("x",-lineHeightDistPlot/2 + lineMarginDistPlot.top)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Distance From Grinosaurus Stage");

    scatterSVGDistPlot.append("text")
        .attr("class", "xLegendDistLabel")
        .attr("x", width + 140)
        .attr("y", 20)
        .style("font-size", "15px")
        //.attr("font-family", "sans-serif")
        .text("Friday");

    scatterSVGDistPlot.append("text")
        .attr("class", "yLegendDistLabel")
        .attr("x", width + 140)
        .attr("y", 35)
        .style("font-size", "15px")
        //.attr("font-family", "sans-serif")
        .text("Saturday");

    scatterSVGDistPlot.append("text")
        .attr("class", "yLegendDistLabel")
        .attr("x", width + 140)
        .attr("y", 50)
        .style("font-size", "15px")
        //.attr("font-family", "sans-serif")
        .text("Sunday");

    scatterSVGDistPlot.append('rect')
        .attr('x', width + 125)
        .attr('y', 11)
        .attr('width', 9)
        .attr('height', 9)
        .attr('fill', "red");

    scatterSVGDistPlot.append('rect')
        .attr('x', width + 125)
        .attr('y', 26)
        .attr('width', 9)
        .attr('height', 9)
        .attr('fill', "blue");

    scatterSVGDistPlot.append('rect')
        .attr('x', width + 125)
        .attr('y', 41)
        .attr('width', 9)
        .attr('height', 9)
        .attr('fill', "green");

	onClickDistPlot();
}

const distPlotInfo = () =>{
    var data = {
        header: "Cluster distance from Grinosaurus Stage Plot",
        body: {
            info:`This Visualization shows hourly distance of identified groups of people from Grinosaurus Stage for the 3 days.
                  The location of a cluster is aggregated over an hour of time interval. Euclidean distance is calculated between the location of
                  the cluster and Grinosaurus Stage location i.e. (76, 22).`,
            usage:{
                head: 'Usage',
                items:[
                    'Select a cluster to see the distance variation per hour for each day.',
                ],
			    note: 'The day filters on the sidebar does not work on this viz.'
            }
        }
    }
    modalShow(data)
}
