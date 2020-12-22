var HMlineWidth;
var HMlineHeight;
var HMlineInnerHeight;
var HMlineInnerWidth;
var HMlineMargin = { top: 20, right: 60, bottom: 60, left: 90 };
var HMxScale;
var HMyScale;
var HMprojection;
var HMfriday;
var HMsaturday;
var HMsunday;
var HMpath;
var HMmyData1;
var HMheatMap;
var HMtoolTip;
var HMregMapping;
var HMmyColor;
var HMTundra;
var HMtooltipdiv;
var heat_rangeValues = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
var heat_timer;
var targetValue;
var heat_currentValue = 0;
var playButton;
var heatMapData;
var HMhandle;
var label;
var heat_xTime;
var HMcheckin;
var HMSlider;

document.addEventListener('DOMContentLoaded', function () {
    heatMap = d3.select('#heatmap');
    HMlineWidth = +heatMap.style('width').replace('px', '');
    HMlineHeight = +heatMap.style('height').replace('px', '');
    HMlineInnerWidth = HMlineWidth - HMlineMargin.left - HMlineMargin.right;
    HMlineInnerHeight = HMlineHeight - HMlineMargin.top - HMlineMargin.bottom;


    HMmyColor = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, 4710]);


    // Load both files before doing anything else
    Promise.all([d3.json('data/heatmap/friday.json'),
    d3.json('data/heatmap/saturday.json'),
    d3.json('data/heatmap/sunday.json'),
    d3.json('data/heatmap/regMapping.json'),
    d3.csv('data/heatmap/checkinHM.csv')


    ])
        .then(function (values) {


            HMfriday = values[0];
            HMsaturday = values[1];
            HMsunday = values[2];
            HMregMapping = values[3];
            HMcheckin = values[4];

            HMtooltipdiv = d3.select("body").append("div")
                .attr('class', 'HMtoolTip')
                .style('opacity', 0)
            heatMapData = { 'HMfriday': HMfriday, 'HMsaturday': HMsaturday, 'HMsunday': HMsunday };

            console.log(HMcheckin);



            createHeatMap();



        })

});


function getHour() {
    return heat_xTime.invert(heat_currentValue);
}
function getData() {

    return heatMapData[document.getElementById('heat_days').value];



}

function getAxis() {

    HMxScale = d3.scaleLinear()
        .range([HMlineMargin.left, HMlineMargin.left + HMlineInnerWidth]);
    HMyScale = d3.scaleLinear()
        .range([HMlineInnerHeight, HMlineMargin.top]);

    heatMap.append("g")
        .attr("transform",
            "translate(" + HMlineMargin.left + "," + HMlineMargin.top + ")");

    HMxScale.domain([0, 99]);
    HMyScale.domain([0, 99]);

    const yAxis = d3.axisLeft(HMyScale)
        .tickSize(-HMlineInnerWidth);

    heatMap.append("g")
        .attr(`transform`, `translate(${HMlineMargin.left}, 0)`)
        .attr("class", "axis")
        .call(yAxis)
        .call(g => g.select(".domain"))
        .call(g => g.selectAll(".tick:not(:first-of-type) line")
            .attr("stroke-opacity", 0.5)
            .attr("stroke-dasharray", "5,10"))
        .call(g => g.selectAll(".tick text")
            .attr("x", -4)
            .attr("dy", 4));

    heatMap.append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", HMlineMargin.right - 12)
        .attr("x", -HMlineHeight / 2 + HMlineMargin.top)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Y Coordinates")

    const xAxis = d3.axisBottom(HMxScale)
        .tickFormat(function (d) {

            if (d % 10 == 0) {
                return d;
            }
            else {
                return null;
            }


        });

    heatMap.append("g")
        .attr("transform", "translate(0," + HMlineInnerHeight + ")")
        .attr("class", "axis")
        .call(xAxis)
        .call(g => g.select(".domain")

        );

    heatMap.append("text")
        .attr("class", "label")
        .attr("x", HMlineWidth / 2)
        .attr("y", HMlineInnerHeight + HMlineMargin.top + 15)
        .style("text-anchor", "middle")
        .text("X Coordinates");

}

function insertRect() {


    heatMap.append("rect")
        .attr('class', 'Tundra')
        .attr("x", HMxScale(0))
        .attr("y", HMyScale(99))
        .attr("width", HMxScale(39))
        .attr("height", HMyScale(56))
        .style('fill', HMmyColor(1679))
        .style('stroke', 'black')
        .on('click', function () {
            plotRides('Tundra', 'purple')
            regionChangeEventFromHeatMap('tunda');
        })
        .on('mousemove', function (d, i) {
            HMtooltipdiv.transition()
                .duration(50)
                .style("opacity", 1);
            let toolTipData = "Tundra Region Footfall" + ":" + getData()['data'][3]['Tundra'][getHour()];
            HMtooltipdiv.html(toolTipData)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on("mouseout", function (d) {
            HMtooltipdiv.transition()
                .duration(100)
                .style("opacity", 0);
        });


    heatMap.append("rect")
        .attr('class', 'entryCorridor')
        .attr("x", HMxScale(51))
        .attr("y", HMyScale(99))
        .attr("width", HMxScale(7))
        .attr("height", HMyScale(56))
        .style('fill', HMmyColor(1668))
        .style('stroke', 'black')
        .on('click', function () {
            plotRides('entryCorridor', 'green');
            regionChangeEventFromHeatMap('entryCorridor');
        })
        .on('mousemove', function (d, i) {
            HMtooltipdiv.transition()
                .duration(50)
                .style("opacity", 1);
            let toolTipData = "Entry Corridor Footfall" + ":" + getData()['data'][4]['entryCorridor'][getHour()];
            HMtooltipdiv.html(toolTipData)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on("mouseout", function (d) {
            HMtooltipdiv.transition()
                .duration(100)
                .style("opacity", 0);
        });
    //     .call(d3.zoom().on("zoom", function () {
    //       heatMap.attr("transform", d3.event.transform)
    //    }));

    heatMap.append("rect")
        .attr('class', 'kiddieLand')
        .attr("x", HMxScale(70))
        .attr("y", HMyScale(99))
        .attr("width", HMxScale(17))
        .attr("height", HMyScale(56))
        .style('fill', HMmyColor(1495))
        .style('stroke', 'black')
        .on('click', function () {
            plotRides('kiddieLand', 'brown');
            regionChangeEventFromHeatMap('kiddleLand');
        })
        .on('mousemove', function (d, i) {
            HMtooltipdiv.transition()
                .duration(50)
                .style("opacity", 1);
            let toolTipData = "Kiddie Land Footfall" + ":" + getData()['data'][1]['kiddieLand'][getHour()];
            HMtooltipdiv.html(toolTipData)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on("mouseout", function (d) {
            HMtooltipdiv.transition()
                .duration(100)
                .style("opacity", 0);
        });
    //     .call(d3.zoom().on("zoom", function () {
    //       heatMap.attr("transform", d3.event.transform)
    //    }));

    heatMap.append("rect")
        .attr('class', 'wetLand')
        .attr("x", HMxScale(0))
        .attr("y", HMyScale(53.3))
        .attr("width", HMxScale(63))
        .attr("height", HMyScale(83))
        .style('fill', HMmyColor(1075))
        .style('stroke', 'black')
        .on('click', function () {
            plotRides('wetLand', 'turquoise');
            regionChangeEventFromHeatMap('wetLand');
        })
        .on('mousemove', function (d, i) {
            HMtooltipdiv.transition()
                .duration(50)
                .style("opacity", 1);
            let toolTipData = "Wet Land Footfall" + ":" + getData()['data'][0]['wetLand'][getHour()];
            HMtooltipdiv.html(toolTipData)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on("mouseout", function (d) {
            HMtooltipdiv.transition()
                .duration(100)
                .style("opacity", 0);
        });
    //     .call(d3.zoom().on("zoom", function () {
    //       heatMap.attr("transform", d3.event.transform)
    //    }));

    heatMap.append("rect")
        .attr('class', 'coasterAlley')
        .attr("x", HMxScale(0))
        .attr("y", HMyScale(33.6))
        .attr("width", HMxScale(87.5))
        .attr("height", HMyScale(68))
        .style('fill', HMmyColor(1268))
        .style('stroke', 'black')
        .on('click', function () {
            plotRides('coasterAlley', 'orange');
            regionChangeEventFromHeatMap('CoasterAlley');
        })
        .on('mousemove', function (d, i) {
            HMtooltipdiv.transition()
                .duration(50)
                .style("opacity", 1);
            let toolTipData = "Coaster Alley Footfall" + ":" + getData()['data'][2]['coasterAlley'][getHour()];
            HMtooltipdiv.html(toolTipData)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on("mouseout", function (d) {
            HMtooltipdiv.transition()
                .duration(100)
                .style("opacity", 0);
        });
    //     .call(d3.zoom().on("zoom", function () {
    //       heatMap.attr("transform", d3.event.transform)
    //    }));

    heatMap.append("rect")
        .attr('class', 'coasterAlley')
        .attr("x", HMxScale(82.9))
        .attr("y", HMyScale(53.4))
        .attr("width", HMxScale(4.4))
        .attr("height", HMyScale(83))
        .style('fill', HMmyColor(1268))
        .style('stroke', 'black')
        .on('click', function () {
            plotRides('coasterAlley', 'orange');
            regionChangeEventFromHeatMap('CoasterAlley');
        })
        .on('mousemove', function (d, i) {
            HMtooltipdiv.transition()
                .duration(50)
                .style("opacity", 1);
            let toolTipData = "Coaster Alley Footfall" + ":" + getData()['data'][2]['coasterAlley'][getHour()];
            HMtooltipdiv.html(toolTipData)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on("mouseout", function (d) {
            HMtooltipdiv.transition()
                .duration(100)
                .style("opacity", 0);
        });
    //     .call(d3.zoom().on("zoom", function () {
    //       heatMap.attr("transform", d3.event.transform)
    //    }));
    // .style('stroke','black');

}

function onClickRadio() {
    updateHour(getHour());
}
function updateHour(hour) {

    console.log(hour);
    var day = document.getElementById('heat_days').value;
    console.log(day);
    var data = heatMapData[day];

    var tundra = heatMap.selectAll(".Tundra");
    var kid = heatMap.selectAll(".kiddieLand");
    var entry = heatMap.selectAll(".entryCorridor");
    var coaster = heatMap.selectAll(".coasterAlley");
    var wet = heatMap.selectAll(".wetLand");


    tundra.style("fill", HMmyColor(data['data'][3]['Tundra'][hour]))
        .on('mousemove', function (d, i) {
            HMtooltipdiv.transition()
                .duration(50)
                .style("opacity", 1);
            let toolTipData = "Tundra Region Footfall" + ":" + getData()['data'][3]['Tundra'][getHour()];
            HMtooltipdiv.html(toolTipData)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on("mouseout", function (d) {
            HMtooltipdiv.transition()
                .duration(100)
                .style("opacity", 0);
        });
    kid.style("fill", HMmyColor(data['data'][1]['kiddieLand'][hour]))
        .on('mousemove', function (d, i) {
            HMtooltipdiv.transition()
                .duration(50)
                .style("opacity", 1);
            let toolTipData = "Kiddie Land Footfall" + ":" + getData()['data'][1]['kiddieLand'][getHour()];
            HMtooltipdiv.html(toolTipData)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on("mouseout", function (d) {
            HMtooltipdiv.transition()
                .duration(100)
                .style("opacity", 0);
        });

    entry.style("fill", HMmyColor(data['data'][4]['entryCorridor'][hour]))
        .on('mousemove', function (d, i) {
            HMtooltipdiv.transition()
                .duration(50)
                .style("opacity", 1);
            let toolTipData = "Entry Corridor Footfall" + ":" + getData()['data'][4]['entryCorridor'][getHour()];
            HMtooltipdiv.html(toolTipData)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on("mouseout", function (d) {
            HMtooltipdiv.transition()
                .duration(100)
                .style("opacity", 0);
        });

    coaster.style("fill", HMmyColor(data['data'][2]['coasterAlley'][hour]))
        .on('mousemove', function (d, i) {
            HMtooltipdiv.transition()
                .duration(50)
                .style("opacity", 1);
            let toolTipData = "Coaster Alley Footfall" + ":" + getData()['data'][2]['coasterAlley'][getHour()];
            HMtooltipdiv.html(toolTipData)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on("mouseout", function (d) {
            HMtooltipdiv.transition()
                .duration(100)
                .style("opacity", 0);
        });

    wet.style("fill", HMmyColor(data['data'][0]['wetLand'][hour]))
        .on('mousemove', function (d, i) {
            HMtooltipdiv.transition()
                .duration(50)
                .style("opacity", 1);
            let toolTipData = "Wet Land Footfall" + ":" + getData()['data'][0]['wetLand'][getHour()];
            HMtooltipdiv.html(toolTipData)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on("mouseout", function (d) {
            HMtooltipdiv.transition()
                .duration(100)
                .style("opacity", 0);
        });








}

function update(hour) {
    HMhandle.attr("x", heat_xTime(hour) - 4);
    updateHour(hour);

}
function createSlider() {
    targetValue = HMlineInnerWidth + 50;

    playButton = d3.select("#heat_play");

    heat_xTime = d3.scaleLinear()
        .domain([8, 22])
        .range([0, targetValue]);
    // .clamp(true);


    HMslider = heatMap.append("g")
        .attr("class", "heat_slider")
        .attr("transform", "translate(" + 90 + "," + 581 + ")");

    HMslider.append("line")
        .attr("class", "heat_track")
        .attr("x1", heat_xTime.range()[0])
        .attr("x2", heat_xTime.range()[1])
        .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "heat_track-inset")
        .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "heat_track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function () { HMslider.interrupt(); })
            .on("start drag", function () {

                heat_currentValue = Math.max(d3.event.x, 0);
                if (heat_currentValue > targetValue) {
                    heat_currentValue = targetValue
                }
                // console.log('heat_current_value', heat_currentValue, heat_xTime.invert(heat_currentValue))
                var index, midPoint;
                var value = heat_xTime.invert(heat_currentValue)
                for (var i = 0; i < heat_rangeValues.length - 1; i++) {
                    if (value >= heat_rangeValues[i] && value <= heat_rangeValues[i + 1]) {
                        index = i;
                        break;
                    }
                }

                midPoint = (heat_rangeValues[index] + heat_rangeValues[index + 1]) / 2;
                if (value < midPoint) {
                    heat_currentValue = heat_xTime(heat_rangeValues[index]);
                } else {
                    heat_currentValue = heat_xTime(heat_rangeValues[index + 1]);
                }

                clearInterval(heat_timer);
                if (playButton.text() == "Pause") {
                    playButton.text("Play");
                }

                update((heat_xTime.invert(heat_currentValue)));
            })
        );

    HMslider.insert("g", ".heat_track-overlay")
        .attr("class", "heat_ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(heat_xTime.ticks(10))
        .enter()
        .append("text")
        .attr("x", heat_xTime)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(function (d) { return `${d}` });

    HMhandle = HMslider.insert("rect", ".heat_track-overlay")
        .attr("class", "heat_handle")
        .attr("width", 10)
        .attr("height", 10)
        .style('stroke', 'black')
        .style('fill', 'white')
        .attr('y', -4);

    // label = slider.append("text")
    //     .attr("class", "heat_label")
    //     .attr("text-anchor", "middle")
    //     // .text(`${flow_dateRange[0].getHours()}:${flow_dateRange[0].getMinutes()}`)
    //     .attr("transform", "translate(0," + (-15) + ")");

    playButton.on("click", function () {
        var button = d3.select(this);
        if (button.text() == "Pause") {
            clearInterval(heat_timer);
            button.text("Play");
        } else {
            heat_timer = setInterval(step, 500);
            button.text("Pause");
        }
    })


}

function step() {
    update(heat_xTime.invert(heat_currentValue));
    var time = heat_xTime.invert(heat_currentValue) + 1;
    heat_currentValue = heat_xTime(time);
    if (heat_currentValue > targetValue) {
        heat_currentValue = 0;
        clearInterval(heat_timer);
        playButton.text("Play");
        // update(x.invert(0))
    }
}


function createHeatMap() {
    getAxis();
    insertRect();
    createSlider();
    createLegend(HMmyColor);
    //plotRides();

}
function createLegend(colorScale) {

    axisScale = d3.scaleLinear()
        .domain([0, 4710])
        .range([HMlineMargin.left - 80, 200 + HMlineMargin.left - 80]);

    axisBottom = g => g
        .attr("class", `HMx-axis`)
        .attr("transform", `translate(107,${HMlineInnerHeight - HMlineMargin.bottom + 40})`)
        .call(d3.axisBottom(axisScale)
            .ticks(200 / 50)
            .tickSize(-20));

    const defs = heatMap.append("defs");

    const linearGradient = defs.append("linearGradient")
        .attr("id", "HMlinear-gradient");

    linearGradient.selectAll("stop")
        .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100 * i / n.length}%`, color: colorScale(t) })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    heatMap.append('g')
        .attr("transform", `translate(0,${HMlineInnerHeight - HMlineMargin.bottom + 60})`)
        .append("rect")
        .attr('transform', `translate(${HMlineMargin.left + 28}, -40)`)
        .attr("width", 200)
        .attr("height", 20)
        .style("fill", "url(#HMlinear-gradient)");

    heatMap.append('g')
        .call(axisBottom);
}

function plotRides(Area, color) {

    heatMap.selectAll('circle').remove();
    //  heatMap.selectAll('.heat_slider').remove();

    // createSlider();
    //  update(getHour());


    var dataArea = HMcheckin.filter(function (d) {
        if (d['Regions'] == Area) {
            return d;
        }

    });

    console.log(dataArea);
    var circles = heatMap.selectAll("circle")
        .data(dataArea)
        .enter()
        .append("circle");
    var circleAttributes = circles
        // .attr("cx", function (d) { return HMxScale(d.X)+10; })
        // .attr("cy", function (d) { return HMxScale(d.Y)+10; })
        .attr("transform", function (d) { return "translate(" + HMxScale(d.X) + "," + HMyScale(99 - (99 - d.Y)) + ")"; })
        .attr("r", function (d) { return 0; })
        .style("fill", function (d) { return color; })
        .call(d3.zoom().on("zoom", function () {
            heatMap.attr("transform", d3.event.transform)
        }))
        .on('mousemove', function (d, i) {
            HMtooltipdiv.transition()
                .duration(50)
                .style("opacity", 1);
            let toolTipData = "Checkin" + ":" + d.Name;
            HMtooltipdiv.html(toolTipData)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on("mouseout", function (d) {
            HMtooltipdiv.transition()
                .duration(100)
                .style("opacity", 0);
        });

    heatMap.selectAll("circle")
        .transition()
        .duration(800)
        .attr("r", 10)
        // .attr("height", function(d) { return lineInnerHeight - yScale(d.Value); })
        .delay(function (d, i) { return (i * 100) })


}


const checkinHeatMapInfo = () => {
    var data = {
        header: "Heat-Map Information",
        body: {
            info: 'This visualization shows total number of checkins for different areas during a particular day. One can easily compare popularity of different areas during a particular hour and get an idea about the count with a help of color luminance. ',
            usage: {
                head: 'Usage',
                items: [
                    'Select the day for which you want to visualize the data.',
                    'Select the hour from the given slider to get a data at parituclar hour.',
                    'You can easily observe a change in color density for different areas based on total number of checkins',
                    'You can also click on a particular area to get an exact count of checkins and visualize spatial location of all checkins',
                    'You can also hover over a circle to get a name of that particular checkin',
                ]
            }
        }
    }
    modalShow(data)
}