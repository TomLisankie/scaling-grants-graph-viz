import * as Papa from "papaparse";

window.onload = (event) => {
    var filePicker = document.getElementById("csvPicker");
    filePicker.addEventListener("change", loadCSVs, false);
    setUpGraph();
};

var allRows = [];

function loadCSVs() {
    let csvFiles = this.files;
    for (const csvFile of csvFiles) {
        Papa.parse(csvFile, {
            header: true,
            complete : function(results) {
                allRows.push(results.data);
                console.log("Another CSV file added");
                allRows = allRows.flat();
                console.log(allRows.length);
            }
        });
    }
}

function setUpGraph () {
    var dotIndex = 0;
    var graphviz = d3.select("#graph").graphviz()
        .logEvents(true)
        .on("initEnd", render);

    function render() {
        var dotLines = dots[dotIndex];
        var dot = dotLines.join('');
        graphviz
            .renderDot(dot)
            .on("end", function () {
                dotIndex = (dotIndex + 1) % dots.length;
                render();
            });
    }

    var dots = [
        /* [
         *     'digraph  {',
         *     '    node [style="filled"]',
         *     '    a [fillcolor="#d62728"]',
         *     '    b [fillcolor="#1f77b4"]',
         *     '    a -> b',
         *     '}'
         * ], */
        [
            'digraph  {',
            '    node [style="filled"]',
            '    a [fillcolor="#d62728", shape="circle"]',
            '    c [fillcolor="#2ca02c"]',
            '    b [fillcolor="#1f77b4"]',
            '    a -> b',
            '    a -> c',
            '}'
        ],
        /* [
         *     'digraph  {',
         *     '    node [style="filled"]',
         *     '    a [fillcolor="#d62728"]',
         *     '    b [fillcolor="#1f77b4"]',
         *     '    c [fillcolor="#2ca02c"]',
         *     '    a -> b',
         *     '    a -> c',
         *     '}'
         * ],
         * [
         *     'digraph  {',
         *     '    node [style="filled"]',
         *     '    a [fillcolor="#d62728", shape="box"]',
         *     '    b [fillcolor="#1f77b4", shape="parallelogram"]',
         *     '    c [fillcolor="#2ca02c", shape="pentagon"]',
         *     '    a -> b',
         *     '    a -> c',
         *     '    b -> c',
         *     '}'
         * ],
         * [
         *     'digraph  {',
         *     '    node [style="filled"]',
         *     '    a [fillcolor="yellow", shape="star"]',
         *     '    b [fillcolor="yellow", shape="star"]',
         *     '    c [fillcolor="yellow", shape="star"]',
         *     '    a -> b',
         *     '    a -> c',
         *     '    b -> c',
         *     '}'
         * ],
         * [
         *     'digraph  {',
         *     '    node [style="filled"]',
         *     '    a [fillcolor="#d62728", shape="triangle"]',
         *     '    b [fillcolor="#1f77b4", shape="diamond"]',
         *     '    c [fillcolor="#2ca02c", shape="trapezium"]',
         *     '    a -> b',
         *     '    a -> c',
         *     '    b -> c',
         *     '}'
         * ],
         * [
         *     'digraph  {',
         *     '    node [style="filled"]',
         *     '    a [fillcolor="#d62728", shape="box"]',
         *     '    b [fillcolor="#1f77b4", shape="parallelogram"]',
         *     '    c [fillcolor="#2ca02c", shape="pentagon"]',
         *     '    a -> b',
         *     '    a -> c',
         *     '    b -> c',
         *     '}'
         * ],
         * [
         *     'digraph  {',
         *     '    node [style="filled"]',
         *     '    a [fillcolor="#d62728"]',
         *     '    b [fillcolor="#1f77b4"]',
         *     '    c [fillcolor="#2ca02c"]',
         *     '    a -> b',
         *     '    a -> c',
         *     '    c -> b',
         *     '}'
         * ],
         * [
         *     'digraph  {',
         *     '    node [style="filled"]',
         *     '    b [fillcolor="#1f77b4"]',
         *     '    c [fillcolor="#2ca02c"]',
         *     '    c -> b',
         *     '}'
         * ],
         * [
         *     'digraph  {',
         *     '    node [style="filled"]',
         *     '    b [fillcolor="#1f77b4"]',
         *     '}'
         * ], */
    ];
}

export default allRows;
