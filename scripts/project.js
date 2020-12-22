var svg;
var svgSize;
var svgMargin = { top: 20, right: 60, bottom: 60, left: 100 };

var userInputs;
var isPlaying = false;
var priorValidNum = 747;

var xScale = d3.scaleLinear();
var yScale = d3.scaleLinear();

var timer;

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    svg = d3.select('#canvas');
    let svgWidth = +svg.style('width').replace('px','');
    let svgHeight = +svg.style('height').replace('px','');
    let svgInnerWidth = svgWidth - svgMargin.left - svgMargin.right;
    let svgInnerHeight = svgHeight - svgMargin.top - svgMargin.bottom;
    svgSize = { width: svgWidth, height: svgHeight, innerWidth: svgInnerWidth, innerHeight: svgInnerHeight };
  
    // Load the data files before doing anything else
    Promise.all([d3.csv('data/sample.csv')])
            .then(function(values){
      
        // Initialize Region Color Function
        let exampleColorScale = d3.scaleOrdinal(d3.schemeTableau10);

        // Sample tooltip
        let exampleTooltip = d3.select('#wrapper').append("div").attr("id", "sample-tooltip")
        .attr("class", "tooltip").style("visibility", "hidden")
        .html("Sample Tooltip Text");

        // User inputs
        let wrapper = d3.select('#wrapper');
        userInputs = {sampleSelect: wrapper.select('#sample-select'), sampleNumInput: wrapper.select('#sample-num-input'), 
                      sampleButton: wrapper.select('#sample-button')};
        
        // Event handling
        // Play/Stop Button (On Click - Text update & PLAY FUNCTION CALL)
        userInputs.sampleButton.on("click", function() {
            if (isPlaying) {
                userInputs.sampleButton.attr('value', "Play")
                clearInterval(timer);
            } else {
                userInputs.sampleButton.attr('value', "Stop")
                timer = setInterval(function() 
                {
                    var value = Number(userInputs.sampleNumInput.property("value")) + 1;

                    if (value > 9999)
                    {   clearInterval(timer);  }
                    else {
                        document.getElementById('sample-num-input').value = value;
                        drawCanvas("update_num")
                    }
                }, 600);
            }
            isPlaying = !isPlaying;
        });
        // Sample Number Input
        userInputs.sampleNumInput.on("input", function() {
            clearInterval(timer);
            userInputs.sampleButton.attr('value', "Play");
            isPlaying = false;

            drawCanvas("update_num");
        });
        // Sample Selection
        userInputs.sampleSelect.on("input", function() {
            clearInterval(timer);
            userInputs.sampleButton.attr('value', "Play");
            isPlaying = false;

            drawCanvas("update_selection");
        });

        // Initial Drawing
        drawCanvas("initial");
    });
  
  });
document.ready

function drawCanvas(trigger) {
    const TIME_EXIT = d3.transition().duration(750);

    // Retrieves Num Information and Ensures Validity
    var num = userInputs.sampleNumInput.property("value");
    if (1800 > num || num > 2020) {
        num = priorValidYear;
        if ("update_num" == trigger) { return; }  // No need to update invalid year
    } else  {
        priorValidNum = num;
    }
}