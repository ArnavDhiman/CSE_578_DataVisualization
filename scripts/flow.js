var flow_svg;
var flow_svg_g;
var flow_width;
var flow_height;
var flow_data = {};
var flow_xScale;
var flow_yScale;
var flow_margins = { top: 40, right: 60, bottom: 100, left: 100 };
var flow_innerWidth;
var flow_innerHeight;
var flow_rangeValues = [];
var flow_timer;
var flow_mapLegend = { width: 200, height: 20 };
var flow_dateRange = [new Date('2014-06-06 08:15:00'), new Date('2014-06-06 23:30:00')]
var flow_color;
var flow_colorScale;
var flow_countRange = {
    'Friday': [-100, 500],
    'Saturday': [-100, 800],
    'Sunday': [-100, 1100]
}
var flow_xTime;
var flow_currentValue = 0;


const flow_viz = () => {
    flow_svg = d3.select('#flow_div');
    console.log(flow_svg.style('width'));
    flow_width = +flow_svg.style('width').replace('px', '');
    console.log(flow_width);
    flow_height = flow_width;
    flow_svg.attr('height', flow_height);
    flow_innerHeight = flow_height - flow_margins.top - flow_margins.bottom;
    flow_innerWidth = flow_width - flow_margins.left - flow_margins.right;
    Promise.all([
        d3.csv('data/traffic_per_day/park-movement-Fri-Traffic.csv'),
        d3.csv('data/traffic_per_day/park-movement-Sat-Traffic.csv'),
        d3.csv('data/traffic_per_day/park-movement-Sun-Traffic.csv')
    ]).then((values) => {
        flow_data['Friday'] = values[0];
        flow_data['Saturday'] = values[1];
        flow_data['Sunday'] = values[2];

        flowDrawAxis();
        flowDrawChart();
    });
}
const flowDrawAxis = () => {
    let flow_range = [0, 100];
    flow_xScale = d3.scaleLinear()
        .range([0, flow_width - 2])
        .domain(flow_range);
    flow_yScale = d3.scaleLinear()
        .range([flow_height - 7, 0])
        .domain(flow_range);
    flow_svg.append("g")
        .attr("transform", `translate(0,${flow_height - 10})`)
        .attr('class', 'flow_axis')
        .call(d3.axisBottom(flow_xScale).ticks(10))
        .call(g => g.select(".domain")
            .remove())
        .call(g => g.selectAll(".tick:not(:first-of-type) line")
            .attr("stroke-opacity", 1));
    flow_svg.append("g")
        .attr("transform", `translate( 5,0 )`)
        .attr('class', 'flow_axis')
        .call(d3.axisLeft(flow_yScale)
            .ticks(10))
        .call(g => g.select(".domain")
            .remove())
        .call(g => g.selectAll(".tick:not(:first-of-type) line")
            .attr("stroke-opacity", 1));
}
const flowDrawChart = () => {
    var play = document.getElementById('flow_play');
    if (play.innerHTML === "Pause") {
        play.click();
    }
    flow_svg.selectAll().remove();
    flow_svg.selectAll('.flow_handle').remove();
    flow_svg.selectAll('.flow_label').remove();
    flow_svg.selectAll('.flow_ticks').remove();
    colorScheme();
    addTimeSlider();
}
const getTimeRange = () => {
    let date = new Date(flow_dateRange[0]).getTime();
    while (date <= new Date(flow_dateRange[1])) {
        flow_rangeValues.push(new Date(date))
        date = new Date(date).getTime() + 15 * 60 * 1000;
    }
}
const dataAt = (time) => {
    var selectedDay = document.getElementById('flow_days');
    var plotdata = [...flow_data[selectedDay.options[selectedDay.selectedIndex].value]];
    var filterTime =
        new Date(
            new Date(plotdata[0].Timestamp).getTime() +
            (
                new Date(time).getHours() - new Date(plotdata[0].Timestamp).getHours()
            ) * 60 * 60 * 1000 +
            (
                -new Date(plotdata[0].Timestamp).getMinutes() + new Date(time).getMinutes()
            ) * 60 * 1000
        )
            .getTime();
    var data = plotdata.filter((d) => {
        return new Date(d.Timestamp).getTime() == filterTime ? d : null
    });
    return data
}
const addTimeSlider = () => {
    getTimeRange()
    var targetValue = flow_innerWidth + 50;
    var playButton = d3.select("#flow_play");
    flow_xTime = d3.scaleTime()
        .domain(flow_dateRange)
        .range([0, targetValue]);
    var slider = flow_svg.append("g")
        .attr("class", "flow_slider")
        .attr("transform", "translate(" + (flow_margins.left - 10) + "," + (flow_height + flow_margins.top - 12) + ")");
    slider.append("line")
        .attr("class", "flow_track")
        .attr("x1", flow_xTime.range()[0])
        .attr("x2", flow_xTime.range()[1])
        .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "flow_track-inset")
        .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "flow_track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function () { slider.interrupt(); })
            .on("start drag", function () {
                flow_currentValue = Math.max(d3.event.x, 0);
                if (flow_currentValue > targetValue) {
                    flow_currentValue = targetValue
                }
                // console.log('flow_currentValue', flow_currentValue, d3.event.x)
                var index, midPoint;
                var value = new Date(flow_xTime.invert(flow_currentValue)).getTime()
                for (var i = 0; i < flow_rangeValues.length - 1; i++) {
                    if (value >= new Date(flow_rangeValues[i]).getTime() && value <= new Date(flow_rangeValues[i + 1]).getTime()) {
                        index = i;
                        break;
                    }
                }
                midPoint = new Date((new Date(flow_rangeValues[index]).getTime() + new Date(flow_rangeValues[index + 1]).getTime()) / 2).getTime();
                if (value < midPoint) {
                    flow_currentValue = flow_xTime(flow_rangeValues[index]);
                } else {
                    flow_currentValue = flow_xTime(flow_rangeValues[index + 1]);
                }
                clearInterval(flow_timer);
                if (playButton.text() == "Pause") {
                    playButton.text("Play");
                }
                update((flow_xTime.invert(flow_currentValue)));
            })
        );
    slider.insert("g", ".track-overlay")
        .attr("class", "flow_ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(flow_xTime.ticks(10))
        .enter()
        .append("text")
        .attr("x", flow_xTime)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(function (d) { return `${new Date(d).getHours()}:${new Date(d).getMinutes()}` });
    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "flow_handle")
        .attr("r", 9);
    var label = slider.append("text")
        .attr("class", "flow_label")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(0," + (-15) + ")");
    playButton.on("click", function () {
        var button = d3.select(this);
        if (button.text() == "Pause") {
            clearInterval(flow_timer);
            button.text("Play");
        } else {
            flow_timer = setInterval(step, 500);
            button.text("Pause");
        }
    })
    const step = () => {
        update(flow_xTime.invert(flow_currentValue));
        var time = new Date(flow_xTime.invert(flow_currentValue)).getTime() + 15 * 60 * 1000;
        flow_currentValue = flow_xTime(new Date(time));
        if (flow_currentValue > targetValue) {
            flow_currentValue = 0;
            clearInterval(flow_timer);
            playButton.text("Play");
        }
    }
    const update = (h) => {
        handle.attr("cx", flow_xTime(h));
        label
            .attr("x", flow_xTime(h))
            .text(`${new Date(h).getHours()}:${new Date(h).getMinutes()}`)
        addSqaures(dataAt(h))
    }
    update(flow_xTime.invert(flow_currentValue));
}
const getExtentsForDay = (plotday) => {
    var max = Number.MIN_VALUE;
    var min = Number.MAX_VALUE;

    if (plotday) {
        return flow_countRange[plotday]
    }
    return [min, max];
}
const colorScheme = () => {
    var selected = document.getElementById('flow_days');
    var selectedDay = selected.options[selected.selectedIndex].value;
    flow_colorScale = d3.scaleSequential(d3.interpolateReds);
    flow_colorScale.domain(getExtentsForDay(selectedDay))
    createGradientLegend(flow_colorScale)
}
const addSqaures = (plotdata) => {
    flow_svg.selectAll('.flow_elem').remove();
    flow_svg.selectAll('.flow_symbolSquare').remove();
    var flowElem = flow_svg
        .selectAll(".flow_elem")
        .data(plotdata, d => { return `${d.X},${d.Y}` });
    flowElem.join(
        enter => {
            const sq = enter.append('g')
                .attr('transform', function (d) {
                    return `translate(${flow_xScale(d.X)},${flow_yScale(d.Y)})`;
                })
                .attr('class', 'flow_elem');
            sq.append('rect')
                .attr('width', 7)
                .attr('height', 7)
                .attr("class", "flow_symbolSquare")
                .style("fill", d => {
                    let val = +d.Count;
                    if (isNaN(val))
                        return 'white';
                    return flow_colorScale(val);
                });
        },
        update => {
            update.call(elem => {
                elem.selectAll('.flow_symbolSquare')
                    .style("fill", d => {
                        let val = +d.Count;
                        return flow_colorScale(val);
                    })
            });
        },
        exit => {
            exit
                .selectAll('.flow_symbolSquare')
                .style("opacity", d => { return 0 })
            exit.call(e => e
                .remove());
        }
    );

}
const createGradientLegend = (colorScale) => {
    flow_svg.selectAll("defs").remove();
    flow_svg.selectAll("#flow_linear-gradient").remove();
    flow_svg.selectAll(".flow_gradientG").remove();
    flow_svg.selectAll(".flow_gradientRect").remove();
    flow_svg.selectAll(".flow_xAxisLegend").remove();
    let axisScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([flow_mapLegend.height, flow_mapLegend.height + flow_mapLegend.width]);
    let axisBottom = g => g
        .attr("class", `flow_xAxisLegend`)
        .attr("transform", `translate(0,${flow_innerHeight + flow_margins.bottom})`)
        .call(d3.axisBottom(axisScale)
            .ticks(flow_mapLegend.width / 50)
            .tickSize(-flow_mapLegend.height))
    const defs = flow_svg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "flow_linear-gradient");
    linearGradient.selectAll("stop")
        .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100 * i / n.length}%`, color: colorScale(t) })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);
    flow_svg.append('g')
        .attr('class', 'flow_gradientG')
        .attr("transform", `translate(0,${flow_innerHeight + flow_margins.bottom - flow_mapLegend.height})`)
        .append("rect")
        .attr('class', 'flow_gradientRect')
        .attr('transform', `translate(${flow_mapLegend.height}, 0)`)
        .attr("width", flow_mapLegend.width)
        .attr("height", flow_mapLegend.height)
        .style("fill", "url(#flow_linear-gradient)");
    flow_svg.append('g')
        .call(axisBottom);
}
const trafficFlowinfo = () =>{
    var data = {
        header: "Dynamic Traffic Flow",
        body: {
            info:`This Visualization shows the density of the movement of people in the park. 
            The data has been aggregated over 15 minutes time interval. Each visualiation square 
            is in the scale of 5m X 5m and the density of the people in a square is shown by the 
            intensity of the color i.e. color intensity is used as a channel.`,
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
