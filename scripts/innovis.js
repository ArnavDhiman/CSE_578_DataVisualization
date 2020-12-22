/**
 * Author: Sahil Badyal
 * 
 */
var innovisPlotSvg;

var gd;
var hoverTooltip;
var sorted;
var selectedAttrib;
var selectedDays = ['overall']
var selectedDay = 'overall';
var innovis_region_selection;
const innovis_regions = {
    wetLand:"WetLand",
    tunda: "Tundra Land",
    entryCorridor: "Entry Corridor",
    kiddleLand: "Kiddie Land",
    CoasterAlley: "Coaster Alley"
}

var global_daysMap = { 'fri': false, 'sat': false, 'sun': false };

const atttibutes = [
    'unique_checkins',
    'checkins',
    'foot_fall'
]
const attributeMap = {
    'unique_checkins': 'Unique Checkins',
    'checkins': 'Total checkins',
    'foot_fall': 'Total Foot Fall'
}

var rawData = {
    sorted: {

    },
    unsorted: {

    }
};

var innovis_margin = { top: 40, right: 60, bottom: 40, left: 100 };

var rScale = d3.scaleLinear();
const yScale = d3.scaleLinear();

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function () {
    innovisPlotSvg = d3.select('#innovis');
    // width = +innovisPlotSvg.style('width').replace('px', '');
    // height = +innovisPlotSvg.style('height').replace('px', '');;
    // innerWidth = width - innovis_margin.left - innovis_margin.right;
    // innerHeight = height - innovis_margin.top - innovis_margin.bottom;

    sorted = false;
    innovis_region_selection = 'all';

    //Container for the gradients
    var defs = innovisPlotSvg.append("defs");

    //Filter for the outside glow
    var filter = defs.append("filter")
        .attr("id","glow");
    filter.append("feGaussianBlur")
        .attr("stdDeviation","2.5")
        .attr("result","coloredBlur");
    var feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
        .attr("in","coloredBlur");
    feMerge.append("feMergeNode")
        .attr("in","SourceGraphic");

     //Filter for the outside blur
    filter = defs.append("filter")
     .attr("id","blur");
    filter.append("feGaussianBlur")
     .attr("stdDeviation","2.5")
     .attr("result","coloredBlur");

    addInnovisLegend();
    // Load the processed data before doing anything else
    Promise.all([
            d3.csv('../data/sorted_data/unique_checkin_per_region_overall.csv'), //0
            d3.csv('../data/sorted_data/unique_checkin_per_region_fri.csv'), //1
            d3.csv('../data/sorted_data/unique_checkin_per_region_sat.csv'), //2
            d3.csv('../data/sorted_data/unique_checkin_per_region_sun.csv'), //3
            d3.csv('../data/sorted_data/checkin_per_region_overall.csv'), //4
            d3.csv('../data/sorted_data/checkin_per_region_fri.csv'), //5
            d3.csv('../data/sorted_data/checkin_per_region_sat.csv'), //6
            d3.csv('../data/sorted_data/checkin_per_region_sun.csv'), //7
            d3.csv('../data/sorted_data/footfall_per_region_overall.csv'), //8
            d3.csv('../data/sorted_data/footfall_per_region_fri.csv'), //9
            d3.csv('../data/sorted_data/footfall_per_region_sat.csv'), //10
            d3.csv('../data/sorted_data/footfall_per_region_sun.csv'), //11
                ])
      .then(function (data) {

        addListeners();
        
        for (let i=0; i<data.length/4; i++){
            let k=i*4;
            rawData['unsorted'][atttibutes[i]] = {
                overall: data[k],
                fri: data[k+1],
                sat: data[k+2],
                sun: data[k+3]
            }
            let sorted_data_arr = new Array();
            for (let j= 0; j<4; j++){
                let sorted_data = [...data[k+j]];
                sorted_data.sort((a,b)=> parseInt(a[atttibutes[i]]) > parseInt(b[atttibutes[i]]));
                sorted_data_arr.push(sorted_data);
            }
            rawData['sorted'][atttibutes[i]] = {
                overall: [
                    sorted_data_arr[0], 
                    [
                        sorted_data_arr[0][0][atttibutes[i]], sorted_data_arr[0][sorted_data_arr[0].length-1][atttibutes[i]]
                    ]
                ],
                fri: [
                    sorted_data_arr[1], 
                    [
                        sorted_data_arr[1][0][atttibutes[i]], sorted_data_arr[1][sorted_data_arr[1].length-1][atttibutes[i]]
                    ]
                ],
                sat: [
                    sorted_data_arr[2], 
                    [
                        sorted_data_arr[2][0][atttibutes[i]], sorted_data_arr[2][sorted_data_arr[2].length-1][atttibutes[i]]
                    ]
                ],
                sun: [
                    sorted_data_arr[3], 
                    [
                        sorted_data_arr[3][0][atttibutes[i]], sorted_data_arr[3][sorted_data_arr[3].length-1][atttibutes[i]]
                    ]
                ],
            }
        }
  
        console.log(rawData);

        let init_data = rawData['unsorted'][selectedAttrib][selectedDay];
        let init_s_data = rawData['sorted'][selectedAttrib][selectedDay];
  
        rScale.domain(init_s_data[1]).range([5,40]).clamp(true);
        
        gd = gridData(init_data);

        drawGrid();
      })
  
  });

  function addInnovisLegend(){
    let legend_margin = {
        left:20,
        right:10,
        top: 10,
        bottom: 10
    }
    let colorScheme = d3.schemeSet2;
    let i=0, w=0;
    for (const [key, value] of Object.entries(innovis_regions)) {

        innovisPlotSvg.append("rect")
        .attr("x", legend_margin.left + w )
        .attr("y", legend_margin.top)
        .attr("width",15)
        .attr("height",15)
        .style("fill", colorScheme[i++])
        .style('stroke', 'black');
    
        innovisPlotSvg.append("text")
            .attr("x", legend_margin.left + w - 20)
            .attr("y", legend_margin.top + 30)
            .text(value)
            .style("font-size", "10px")
            .attr("alignment-baseline","middle")
            .attr("font-weight",25)
            .style('fill', 'black');
        
        w += 100;

      }

}

  function addListeners() {
    const regionTag = document.getElementById("innovis-region");
    const attributeTag = document.getElementById("innovis-attribute");
    const sortedTag = document.getElementById("innovis-sorted");
    const fridayTag = document.getElementById("input-friday");
    const satTag = document.getElementById("input-saturday");
    const sundayTag = document.getElementById("input-sunday");

    attributeTag.selectedIndex = 2;
    regionTag.selectedIndex = 0;
    sortedTag.checked = false;

    selectedAttrib = attributeTag.value;
    

    hoverTooltip = d3.select("body").append("div")
    .attr("class", "innovis-tooltip-box")
    .style("opacity", 0);


    fridayTag.addEventListener('change', (event) => {
        global_daysMap['fri'] = !global_daysMap['fri'];
        innovisPlotSvg.selectAll(".innovis-circle-elem").remove();
        mergeDayWiseData();
        drawGrid();
        console.log(fridayTag.checked);
      });

    satTag.addEventListener('change', (event) => {
        global_daysMap['sat'] = !global_daysMap['sat'];
        innovisPlotSvg.selectAll(".innovis-circle-elem").remove();
        mergeDayWiseData();
        drawGrid();
        console.log(satTag.checked);
    });

    sundayTag.addEventListener('change', (event) => {
        global_daysMap['sun'] = !global_daysMap['sun'];
        innovisPlotSvg.selectAll(".innovis-circle-elem").remove();
        mergeDayWiseData();
        drawGrid();
        console.log(sundayTag.checked);
    });


    regionTag.addEventListener('change', (event) => {
        innovis_region_selection = regionTag.value;
        innovisPlotSvg.selectAll(".innovis-circle-elem").remove();
        drawGrid();
        console.log("region_changed");
      });
    
    attributeTag.addEventListener("change", (event) => {
        selectedAttrib = attributeTag.value;

        innovisPlotSvg.selectAll(".innovis-circle-elem").remove();
        mergeDayWiseData();
        drawGrid();
        console.log("attribute_changed to "+`${selectedAttrib}`);
      });

    sortedTag.addEventListener("change", (event) => {
        sorted = !sorted;
        updateGD();
        drawGrid();
      });

    // Load daysMap from existing page settings
    global_daysMap = { 'fri': fridayTag.checked, 'sat': satTag.checked, 'sun': sundayTag.checked };
  }
  
function regionChangeEventFromHeatMap(region){
    const regionTag = document.getElementById("innovis-region");
    regionTag.value = region;
    innovis_region_selection = region;
    innovisPlotSvg.selectAll(".innovis-circle-elem").remove();
    drawGrid();
    console.log("region_changed by heatmap");
}

function mergeDayWiseData(){
    let zero = true;
    let ones = true;
    for (const prop in global_daysMap) {
        zero &= !global_daysMap[prop];
        ones &= global_daysMap[prop];
        if(global_daysMap[prop]){
            if(!selectedDays.includes(prop)){
                selectedDays.push(prop);
            }
        }else{
            selectedDays = arrayRemove(selectedDays, prop);
        }
    }
    if(zero || ones){
        selectedDay = "overall";
        let init_data = rawData['unsorted'][selectedAttrib][selectedDay];
        let init_s_data = rawData['sorted'][selectedAttrib][selectedDay];
  
        rScale.domain([init_s_data[1][0], init_s_data[1][1]]).range([5,40]).clamp(true);
        
        if (sorted){
            gd = gridData(init_s_data[0]);
        }else{
            gd = gridData(init_data);
        }
        return;
    }

    let new_key = "";
    selectedDays.forEach((element) => {
        if(element == 'overall'){// skip this one
        }else{
            new_key += element;
        }
    });
    if(new_key in rawData['unsorted'][selectedAttrib]){
        selectedDay = new_key;
        let init_data = rawData['unsorted'][selectedAttrib][selectedDay];
        let init_s_data = rawData['sorted'][selectedAttrib][selectedDay];
  
        rScale.domain(init_s_data[1]).range([5,40]).clamp(true);
        
        if (sorted){
            gd = gridData(init_s_data[0]);
        }else{
            gd = gridData(init_data);
        }
        return;
    }
    let index = 0;
    let ds = [];
    selectedDays.forEach((element) => {
        if(index==0){// skip this one
        }else if (index == 1){
            let data = rawData['unsorted'][selectedAttrib][element];
            for (let i=0; i<data.length; i++){
                    ds.push({...data[i]});
            }
        }else{
            let data = rawData['unsorted'][selectedAttrib][element];
            for (let i=0; i < data.length; i++){
                let val = parseInt(ds[i][selectedAttrib]) + parseInt(data[i][selectedAttrib]);
                ds[i][selectedAttrib] = val.toString();
            }
        }
        index++;
    });
    let sorted_data = [...ds];
    sorted_data.sort((a,b)=> parseInt(a[selectedAttrib]) > parseInt(b[selectedAttrib]));
    rawData['unsorted'][selectedAttrib][new_key] = ds;
    rawData['sorted'][selectedAttrib][new_key] = [
        sorted_data,
        [
            sorted_data[0][selectedAttrib], 
            sorted_data[sorted_data.length-1][selectedAttrib]
        ]
    ]
    selectedDay = new_key;
    rScale.domain(rawData['sorted'][selectedAttrib][selectedDay][1]).range([5,40]).clamp(true);
    if (sorted){
        gd = gridData(sorted_data);
    }else{
        gd = gridData(ds);
    }
}


function arrayRemove(arr, value) { 
    
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}

function gridData(inp_data) {
    let data = new Array();
    let fakeids = -1;
    let xpos = 50; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
    let ypos = 100;
    let width =  80;
    let height = 80;

    // iterate for rows 
    for (var row = 0; row < 7; row++) {
        //data.push( new Array() );

        // iterate for cells/columns inside rows
        for (var column = 0; column < 6; column++) {
            let index = (row*6)+column;
            data.push({
                x: xpos,
                y: ypos,
                width: width,
                height: height,
                click:0,
                value:  inp_data.length > index ? inp_data[index][selectedAttrib] : 0,
                ID : inp_data.length > index ? inp_data[index]['ID'] : fakeids,
                name: inp_data.length > index ? inp_data[index]['Name'] : "",
                region: inp_data.length > index ? inp_data[index]['region'] : ""
            })
            // increment the x position. I.e. move it over by 50 (width variable)
            xpos += width;
            fakeids--;
        }
        // reset the x position after a row is complete
        xpos = 50;
        // increment the y position for the next row. Move it down 50 (height variable)
        ypos += height; 
    }
    return data;
}

function valueMap(inp_data) {
    let valueMap = {};
    let fakeids = -1;
    let xpos = 50; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
    let ypos = 100;
    let width =  80;
    let height = 80;

    // iterate for rows 
    for (var row = 0; row < 7; row++) {
        //data.push( new Array() );

        // iterate for cells/columns inside rows
        for (var column = 0; column < 6; column++) {
            let index = (row*6)+column;

            valueMap[inp_data.length > index ? inp_data[index]['ID'] : fakeids] = {
                x: xpos,
                y:ypos
            } 
            // increment the x position. I.e. move it over by 50 (width variable)
            xpos += width;
            fakeids--;
        }
        // reset the x position after a row is complete
        xpos = 50;
        // increment the y position for the next row. Move it down 50 (height variable)
        ypos += height; 
    }
    return valueMap;
}

function updateGD() {
    let vm;

    if(sorted){
        let init_s_data = rawData['sorted'][selectedAttrib][selectedDay];
        vm = valueMap(init_s_data[0]);
        //console.log(gd);
    }else{
        let init_data = rawData['unsorted'][selectedAttrib][selectedDay];
        vm = valueMap(init_data);
        //console.log(gd);
    }
    for (let i=0; i<gd.length; i++){
        gd[i].x = vm[gd[i].ID].x
        gd[i].y = vm[gd[i].ID].y
        //gd[i].value = vm[gd[i].ID].value
    }
}

function drawGrid(){

    //console.log(selectedDay, gd);

    var grid = innovisPlotSvg.selectAll(".innovis-circle-elem")
        .data(gd);

    
    var colorScale = d3.scaleOrdinal(d3.schemeSet2).domain(Object.keys(innovis_regions));
       

    grid.join(
    enter => {
      // add a row with class row
      const dotVar = enter.append('g')
            .attr('transform', d => { return `translate(${d.x},${d.y})` })
            .attr("class", "innovis-circle-elem");
      // append a circle in the g
      dotVar.append("circle")
      .transition()
      .duration(500)
      .attr('class','innovis-circle')
      .attr("r", d => rScale(d.value))
       .attr("opacity", d => {
            if (d.ID < 0) return 0; else return 1;
          })
      .style("fill", d=>{
          if(innovis_region_selection == 'all' || d.region == innovis_region_selection){
            return colorScale(d.region)
          }else{
              return '#808080'
          }
        })
      .style("stroke", "#fff")
      .style("filter", d=>{
        if(innovis_region_selection == 'all'){
          }else{
             if(d.region == innovis_region_selection){
                return 'url(#glow)';
             }else{
                return 'url(#blur)';
             }
          }
      });

      dotVar.on('click', function(d, i) {
            console.log(d.name);
            regionEventFromInnoVis(d.name);
      });

      // append text in g
    //   dotVar.append('text')
    //     .style('alignment-baseline', 'middle')
    //     .style('text-anchor', 'middle')
    //     .attr('class', 'dotText')
    //     .text(d => d.ID);

      // add event listeners for mouse movements to display the tooltip
      dotVar.on('mouseover', function (d, i) {
        d3.select(this).classed("hover", true);
        d3.select(this).select('circle').classed("innovis-circle", false);
        hoverTooltip.transition()
          .duration(50)
          .style("opacity", 1);
          let toolTipData ="Ride: " + d.name + "<br />"+attributeMap[selectedAttrib]+": " + d.value;
          hoverTooltip.html(toolTipData)
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 15) + "px");
      })
        .on('mousemove', function (d, i) {
          hoverTooltip.transition()
            .duration(50)
            .style("opacity", 1);
          let toolTipData ="Ride: " + d.name + "<br />"+attributeMap[selectedAttrib]+": " + d.value;
          hoverTooltip.html(toolTipData)
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 15) + "px");
        })
        .on('mouseout', function (d, i) {
          d3.select(this).classed("hover", false);
          d3.select(this).select('circle').classed("innovis-circle", true);
          hoverTooltip.transition()
            .duration(50)
            .style("opacity", 0);
        });
    },
    update => {
      // add the transition for update
      update.call(update => {
        update.transition()
          .duration(500)
          .attr("r", d => rScale(d.value))
          .attr("opacity", d => {
            if (d.ID < 0) return 0; else return 1;
          })
          .attr('transform', d => `translate(${d.x},${d.y})`);
      });
    },
    exit => {
      // add the transition for exit
      exit
        .selectAll('text')
        .attr('opacity', 0)
      exit
        .selectAll('innovis-circle')
        .transition()
        .duration(500)
        .attr('r', 0);
      exit.call(exit => exit.transition()
        .duration(500)
        .remove());
    }
  );

}

const sortedCirclesInfo = () =>{
    var data = {
        header: "Sorted Circles",
        body: {
            info:'This Visualization shows various attributes like foot fall, unique checkins, total checkins \
            in the various regions and rides of the park. The rides are presented as cirles with the radius determining \
            the (relative) magnitude of attribute shown. The region is represented as color hue.',
            usage:{
                head: 'Usage',
                items:[
                    'Select the attribute you want to see (defaults to foot fall).',
                    'Select the region to see only the rides of that region.',
                    'Selecting the day (or a combination of days) from the filter to view appropriate data',
                    'You can click on the sorted toggle to sort the data.',
                    'You can also hover on the circles to see more information',
                ]
            }
        }
    }
    modalShow(data)
}
  