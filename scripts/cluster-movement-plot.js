var cluster_margin = { top: 40, right: 60, bottom: 100, left: 100 };
var cluster_plot_svg, g;
var cluster_width;
var hour_data;
var cluster_height;
var cluster_innerWidth;
var cluster_mapLegend = { width: 200, height: 20 };
var cluster_friday;
var cluster_sat;
var cluster_sun;
var cluster_xRange;
var cluster_yRange;
var button;
var cluster_timer;
var cluster_color;
var cluster_mapLegend = { width: 200, height: 20 };
var cluster_xTime;
var cluster_currentValue = 0;
var cluster_rangeValues = [8.00, 9.00, 10.00, 11.00, 12.00, 13.00, 14.00, 15.00, 16.00, 17.00, 18.00, 19.00, 20.00, 21.00, 22.00];

document.addEventListener("DOMContentLoaded", function () {
  button = document.getElementById("cluster_play");
  var day = d3.select("#cluster_days").property("value");
  button.addEventListener("click", updateButton);
  function updateButton() {
    if (button.value == "Play") {
    button.click()
    button.value = "Pause";
   }
 }
  Promise.all([
    d3.csv("../data/cluster-movement-days/fri-hour-data.csv"),
    d3.csv("../data/cluster-movement-days/sat-hour-data.csv"),
d3.csv('../data/cluster-movement-days/sun-hour-data.csv')]).then(function (values) {
    cluster_friday = values[0];
    cluster_sat = values[1];
    cluster_sun = values[2];
    cluster_plot_svg = d3.select("#cluster_div");
    cluster_width = 700;
    cluster_height = cluster_width;
    cluster_innerWidth = cluster_width - cluster_margin.left - cluster_margin.right;
    cluster_innerHeight = cluster_height - cluster_margin.top - cluster_margin.bottom;
    g = cluster_plot_svg.append("g"); 
    drawClusterPlot(); 
    //startPlay();   
  });
});
document.ready;

function drawClusterPlot(){  
    cluster_xRange = d3.scaleLinear().domain([0, 100]).range([0,cluster_width-2]);
    cluster_yRange = d3.scaleLinear().domain([0, 100]).range([cluster_height-7, 0]);
    
    //clusterdrawAxis(); 
    clusteraddTimeSlider();
    addLegend();
}
function addClusterCentroids(){
    const colorScheme = d3.schemePaired;
    var radiusSize = d3.scaleLinear()
    .domain([3, 1172])
    .range(["10", "60"]);
    var data_dots = g.selectAll('.movement_elem').data(hour_data, d => d.kmeans)
    data_dots.join(
        (enter) => {
        enter.append("g")
             .attr('class','movement_elem')
             .attr("transform", (d) => {
              color = colorScheme[d.kmeans];
              return `translate(${cluster_xRange(d.X)},${cluster_yRange(d.Y)})`;})
             .style("opacity", 0.9)
             .call((g) =>
                    g.append('circle')
                     .attr("r", 0)
                     .style('fill', (d) => {return colorScheme[d.kmeans];}))
             .call((g) =>
                     enter.selectAll('g').selectAll('circle').transition().duration(3000)
                     .attr("r", function(d){
                        //console.log(radiusSize(d.kmeans))
                        return radiusSize(d.count)})
                     )
                     .style('opacity', 0.9)
                     .attr("stroke", "black")
                     .attr("stroke-width", "2px")
                     .on('click', function(d){

                        onClickDist2Plot(parseInt(d.kmeans));
                     })
                     .on('mousemove', function (d, i) { 
                        d3.select(this).classed('currentCluster', true);
                        d3.select(this).select('circle');
                        hoverTooltip.transition()
                            .duration(50)
                            .style("opacity", 1);
                        var grp = parseInt(d.kmeans) + 1;
                        let toolTipData = " Group: " + grp + "<br />  Count: " + d.count ;
                        hoverTooltip.html(toolTipData)
                            .style("left", (d3.event.pageX + 10) + "px")
                            .style("top", (d3.event.pageY - 15) + "px");
                    })
                    .on("mouseout", function (d) {

                        d3.select(this).classed('currentCluster', false);
                        d3.select(this).select('circle'); 
                        hoverTooltip.transition()
                            .duration(100)
                            .style("opacity", 0);
                    });
      },
      (update) => {
        update.call(
          (g) => {
            g.transition()
                .duration(950)
                .attr("r", function(d){
                    //console.log(radiusSize(d.kmeans))
                    return radiusSize(d.count)})
                .style("opacity", 0.75)
                .attr("stroke", "black")
                .attr("stroke-width", "2px")
                .attr("transform", (d) => {
            return `translate(${cluster_xRange(d.X)},${cluster_yRange(d.Y)})`;
                });
          }
        )
       },
       (exit) => {
        exit.call((g) =>
        g.transition()
         .duration(300)
         .style("opacity", 0)
         .attr("r", 0)
         .remove()
        );
       }
    )

}
function addLegend(){
    const colorScheme = d3.schemePaired;
    cluster_plot_svg.append("rect")
        .attr("x", cluster_margin.right + 10 )
        .attr("y", cluster_margin.top + 600)
        .attr("width",15)
        .attr("height",15)
        .style("fill", colorScheme[0])
        .style('stroke', 'black')
    
    cluster_plot_svg.append("text")
        .attr("x", cluster_margin.right + 30)
        .attr("y", cluster_margin.top + 608)
        .text("Group 1")
        .style("font-size", "13px")
        .attr("alignment-baseline","middle")
        .attr("font-weight",25)
        .style('fill', 'black')    

    cluster_plot_svg.append("rect")
       .attr("x", cluster_margin.right + 100)
       .attr("y", cluster_margin.top + 600 )
       .attr("width", 15)
       .attr("height", 15)
       .style("fill",colorScheme[1]) 
       .style("stroke",'black');

    cluster_plot_svg.append("text")
       .attr("x", cluster_margin.right + 120)
       .attr("y", cluster_margin.top + 608)
       .text("Group 2")
       .style("font-size", "13px")
       .attr("alignment-baseline","middle")
       .attr("font-weight",25)
       .style('fill', 'black')  

    cluster_plot_svg.append("rect")
       .attr("x", cluster_margin.right + 190)
       .attr("y", cluster_margin.top + 600 )
       .attr("width", 15)
       .attr("height", 15)
       .style("fill",colorScheme[2]) 
       .style("stroke",'black');

    cluster_plot_svg.append("text")
       .attr("x", cluster_margin.right + 210)
       .attr("y", cluster_margin.top + 608)
       .text("Group 3")
       .style("font-size", "13px")
       .attr("alignment-baseline","middle")
       .attr("font-weight",25)
       .style('fill', 'black')    

    cluster_plot_svg.append("rect")
       .attr("x", cluster_margin.right + 280)
       .attr("y", cluster_margin.top + 600 )
       .attr("width", 15)
       .attr("height", 15)
       .style("fill",colorScheme[3]) 
       .style("stroke",'black');

    cluster_plot_svg.append("text")
       .attr("x", cluster_margin.right + 300)
       .attr("y", cluster_margin.top + 608)
       .text("Group 4")
       .style("font-size", "13px")
       .attr("alignment-baseline","middle")
       .attr("font-weight",25)
       .style('fill', 'black')    

    cluster_plot_svg.append("rect")
       .attr("x", cluster_margin.right + 370)
       .attr("y", cluster_margin.top + 600 )
       .attr("width", 15)
       .attr("height", 15)
       .style("fill",colorScheme[4]) 
       .style("stroke",'black');

    cluster_plot_svg.append("text")
       .attr("x", cluster_margin.right + 390)
       .attr("y", cluster_margin.top + 608)
       .text("Group 5")
       .style("font-size", "13px")
       .attr("alignment-baseline","middle")
       .attr("font-weight",25)
       .style('fill', 'black')   
    
    cluster_plot_svg.append("rect")
       .attr("x", cluster_margin.right + 460)
       .attr("y", cluster_margin.top + 600 )
       .attr("width", 15)
       .attr("height", 15)
       .style("fill",colorScheme[5]) 
       .style("stroke",'black');

    cluster_plot_svg.append("text")
       .attr("x", cluster_margin.right + 480)
       .attr("y", cluster_margin.top + 608)
       .text("Group 6")
       .style("font-size", "13px")
       .attr("alignment-baseline","middle")
       .attr("font-weight",25)
       .style('fill', 'black')   
    
    cluster_plot_svg.append("rect")
       .attr("x", cluster_margin.right + 10 )
       .attr("y", cluster_margin.top + 625)
       .attr("width",15)
       .attr("height",15)
       .style("fill", colorScheme[6])
       .style('stroke', 'black')
   
   cluster_plot_svg.append("text")
       .attr("x", cluster_margin.right + 30)
       .attr("y", cluster_margin.top + 633)
       .text("Group 7")
       .style("font-size", "13px")
       .attr("alignment-baseline","middle")
       .attr("font-weight",25)
       .style('fill', 'black')    

   cluster_plot_svg.append("rect")
      .attr("x", cluster_margin.right + 100)
      .attr("y", cluster_margin.top + 625 )
      .attr("width", 15)
      .attr("height", 15)
      .style("fill",colorScheme[7]) 
      .style("stroke",'black');

   cluster_plot_svg.append("text")
      .attr("x", cluster_margin.right + 120)
      .attr("y", cluster_margin.top + 633)
      .text("Group 8")
      .style("font-size", "13px")
      .attr("alignment-baseline","middle")
      .attr("font-weight",25)
      .style('fill', 'black')  

   cluster_plot_svg.append("rect")
      .attr("x", cluster_margin.right + 190)
      .attr("y", cluster_margin.top + 625 )
      .attr("width", 15)
      .attr("height", 15)
      .style("fill",colorScheme[8]) 
      .style("stroke",'black');

   cluster_plot_svg.append("text")
      .attr("x", cluster_margin.right + 210)
      .attr("y", cluster_margin.top + 633)
      .text("Group 9")
      .style("font-size", "13px")
      .attr("alignment-baseline","middle")
      .attr("font-weight",25)
      .style('fill', 'black')    

   cluster_plot_svg.append("rect")
      .attr("x", cluster_margin.right + 280)
      .attr("y", cluster_margin.top + 625 )
      .attr("width", 15)
      .attr("height", 15)
      .style("fill",colorScheme[9]) 
      .style("stroke",'black');

   cluster_plot_svg.append("text")
      .attr("x", cluster_margin.right + 300)
      .attr("y", cluster_margin.top + 633)
      .text("Group 10")
      .style("font-size", "13px")
      .attr("alignment-baseline","middle")
      .attr("font-weight",25)
      .style('fill', 'black')    

   cluster_plot_svg.append("rect")
      .attr("x", cluster_margin.right + 370)
      .attr("y", cluster_margin.top + 625 )
      .attr("width", 15)
      .attr("height", 15)
      .style("fill",colorScheme[10]) 
      .style("stroke",'black');

   cluster_plot_svg.append("text")
      .attr("x", cluster_margin.right + 390)
      .attr("y", cluster_margin.top + 633)
      .text("Group 11")
      .style("font-size", "13px")
      .attr("alignment-baseline","middle")
      .attr("font-weight",25)
      .style('fill', 'black')   
   
   cluster_plot_svg.append("rect")
      .attr("x", cluster_margin.right + 460)
      .attr("y", cluster_margin.top + 625 )
      .attr("width", 15)
      .attr("height", 15)
      .style("fill",colorScheme[11]) 
      .style("stroke",'black');

   cluster_plot_svg.append("text")
      .attr("x", cluster_margin.right + 480)
      .attr("y", cluster_margin.top + 633)
      .text("Group 12")
      .style("font-size", "13px")
      .attr("alignment-baseline","middle")
      .attr("font-weight",25)
      .style('fill', 'black')   
    
}
const cluster_dataAt = (time) => {
  var day = d3.select("#cluster_days").property("value");
  
  var day_data;
    if(day == 'Friday'){
        day_data = cluster_friday;
    }
    if(day == 'Saturday'){
        day_data = cluster_sat;
    }
    if(day == 'Sunday'){
        day_data = cluster_sun
    }

  
  hour_data = day_data.filter(item => item.Hour.indexOf(time) == 0)  
  return hour_data
}

const clusteraddTimeSlider = () => {

  var targetValue = cluster_innerWidth + 50;
  var playButton = d3.select("#cluster_play");    
  cluster_xTime = d3.scaleLinear()
      .domain([8,22])
      .range([0, targetValue]);
      
  var slider = cluster_plot_svg.append("g")
      .attr("class", "cluster_slider")
      .attr("transform", "translate(" + (cluster_margin.left - 10) + "," + (cluster_height + cluster_margin.top + 15) + ")");

  slider.append("line")
      .attr("class", "cluster_track")
      .attr("x1", cluster_xTime.range()[0])
      .attr("x2", cluster_xTime.range()[1])
      .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "cluster_track-inset")
      .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "cluster_track-overlay")
      .call(d3.drag()
          .on("start.interrupt", function () { slider.interrupt(); })
          .on("start drag", function () {
              cluster_currentValue = Math.max(d3.event.x, 0);
              if(cluster_currentValue > targetValue){
                  cluster_currentValue = targetValue
              }
              var index, midPoint;
              var value = cluster_xTime.invert(cluster_currentValue)
              for (var i = 0; i < cluster_rangeValues.length - 1; i++) {
                  if (value >= cluster_rangeValues[i] && value <= cluster_rangeValues[i + 1]) {
                      index = i;
                      break;
                  }
              }
              midPoint = (cluster_rangeValues[index] + cluster_rangeValues[index + 1]) / 2;
              if (value < midPoint) {
                  cluster_currentValue = cluster_xTime(cluster_rangeValues[index]);
              } else {
                  cluster_currentValue = cluster_xTime(cluster_rangeValues[index + 1]);
              }

              clearInterval(cluster_timer);
              if (playButton.text() == "Pause") {
                  playButton.text("Play");
              }

              update((cluster_xTime.invert(cluster_currentValue)));
          })
      );

  slider.insert("g", ".cluster-track-overlay")
      .attr("class", "cluster_ticks")
      .attr("transform", "translate(0," + 18 + ")")
      .selectAll("text")
      .data(cluster_xTime.ticks(10))
      .enter()
      .append("text")
      .attr("x", cluster_xTime)
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .text(function (d) { return `${d}:00` });

  var cluster_handle = slider.insert("circle", ".cluster-track-overlay")
      .attr("class", "cluster_handle")
      .attr("r", 9);

  var label = slider.append("text")
      .attr("class", "cluster_label")
      .attr("text-anchor", "middle")
      // .text(`${flow_dateRange[0].getHours()}:${flow_dateRange[0].getMinutes()}`)
      .attr("transform", "translate(0," + (-15) + ")");

  playButton.on("click", function () {
      var button = d3.select(this);
      if (button.text() == "Pause") {
          clearInterval(cluster_timer);
          button.text("Play");
      } else {
          cluster_timer = setInterval(step, 1000);
          button.text("Pause");
      }
  })
  const step = () => {

    update(cluster_xTime.invert(cluster_currentValue));
    var time = cluster_xTime.invert(cluster_currentValue) + 1;
    cluster_currentValue = cluster_xTime(time);
    if (cluster_currentValue > targetValue) {
        cluster_currentValue = 0;
        clearInterval(cluster_timer);
        playButton.text("Play");
        // update(x.invert(0))
    }
  }
  const update = (h) => {
    
    cluster_handle.attr("cx", cluster_xTime(h));
    label
        .attr("x", cluster_xTime(h))
        .text(`${h}:00`)
    // if(h != 0){
    addClusterCentroids(cluster_dataAt(h))
    // }
}
  update(cluster_xTime.invert(cluster_currentValue));
}
function clusterdrawAxis(){

  cluster_plot_svg.append("g")
        .attr("transform", `translate(0,${cluster_height - 10})`)
        .attr('class', 'cluster_axis')
        .call(d3.axisBottom(cluster_xRange).ticks(10))
        .call(g => g.select(".domain")
            .remove())
        .call(g => g.selectAll(".tick:not(:first-of-type) line")
            .attr("stroke-opacity", 1));

  cluster_plot_svg.append("g")
        .attr("transform", `translate( 5,0 )`)
        .attr('class', 'cluster_axis')
        .call(d3.axisLeft(cluster_yRange)
            .ticks(10))
        .call(g => g.select(".domain")
            .remove())
        .call(g => g.selectAll(".tick:not(:first-of-type) line")
            .attr("stroke-opacity", 1));

}
const grpFlowInfo = () =>{
    var data = {
        header: "Group Flow",
        body: {
            info:`This Visualization shows the movement of identified groups of people 
            who entered the park during 3 days. 
            The data has been aggregated over an hour of time interval. Each of the circles in the visualization
            represents the centriod of the identified cluster of people while the radius depends on the number of points present on that circle. 
            the movseover tool-tip shows the group number and the number of points within a circle`,
            usage:{
                head: 'Usage',
                items:[
                    `Select the day you want to view from the dropdown on the top right corner.`,
                    'You can click on the play button to change the time and the visualiation updates its data w.r.t that time.',
                    `You can also drag the slider to a particular time stamp and can also compare across 3 days.`
                ],
                note: 'The day filters on the sidebar does not work on this viz.'
            }
        }
    }
    modalShow(data)
}
