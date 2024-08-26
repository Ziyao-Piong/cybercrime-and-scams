var scrollVis = function () {
    // Define constants
    var width = 1000;
    var left_right_margin = 100;
    var top_bottom_margin = 250;
    var height = 720;

    // Define scroll index tracking vars
    var lastIndex = -1;
    var activeIndex = 0;

    // Define scales
    var x0_scale = d3.scaleBand().padding(0.1).range([0, width - (left_right_margin * 2)]);
    var x1_scale = d3.scaleLinear();
    var y_scale = d3.scaleLinear().range([height - (top_bottom_margin * 2), 0]);

    // Define colors
    var year_colours = {
        "2020": '#1f78b4',
        "2021": '#a6cee3',
        "2022": '#33a02c',
        "2023": '#fb9a99',
        "2024": '#e31a1c'
    };

    var scam_type_colours = {
        "False billing": '#1f78b4',
        "Investment scams": '#a6cee3',
        "Phishing": '#33a02c'
    };

    var contact_mode_colours = {
        "Email": '#1f78b4',
        "Fax": '#a6cee3',
        "In person": '#33a02c',
        "Internet": '#fb9a99',
        "Mail": '#e31a1c',
        "Mobile apps": '#ff7f00',
        "Phone call": '#6a3d9a',
        "Social media/Online forums": '#b15928',
        "Text message": '#b2df8a',
        "unspecified": '#cab2d6'
    };

    var total_scam_count_colour = '#1f78b4';
    var state_color_scale = d3.scaleOrdinal(d3.schemeCategory10); // Color scale for states
    var gender_color_scale = d3.scaleOrdinal().domain(["Male", "Female"]).range(["#1f78b4", "#e31a1c"]); // Color scale for Male and Female
    var lost_amount_color_scale = d3.scaleOrdinal().domain([
        '0 - 10,000',
        '10,001 - 50,000',
        '50,001 - 200,000',
        '200,001 - 1,000,000',
        '1,000,001 - 7,000,000'
    ]).range(d3.schemeCategory10); // Color scale for LostAmountRange

    // Define functions for the current scroll setting
    var activateFunctions = [];

    // Define data object and svg
    var vis_data = {};
    var svg = "";

    // Initialize chart
    var chart = function (selection) {
        selection.each(function (rawData) {
            // Define svg
            svg = d3.select(this).append("svg")
                .attr('width', width)
                .attr('height', height);

            // Perform preprocessing on raw data
            vis_data = convert_data(rawData);
            single_elements();
            set_up_sections();
        });
    };

    var single_elements = function () {
        svg.append("g").attr("class", "x_axis");
    };

    var set_up_sections = function () {
        activateFunctions[0] = ["total_count", "total_count", 2000]; // Total Count
        activateFunctions[1] = ["year", "year", 2000]; // Year
        activateFunctions[2] = ["scam_type", "scam_type", 2000]; // Scam Type
        activateFunctions[3] = ["contact_mode", "contact_mode", 2000]; // Contact Mode
        activateFunctions[4] = ["state", "state", 2000]; // State
        activateFunctions[5] = ["gender", "gender", 2000]; // Gender (Male and Female only)
        activateFunctions[6] = ["lost_amount_range", "lost_amount_range", 2000]; // LostAmountRange
    };

    chart.update = function (index, progress) {
        activeIndex = index;
        draw_dots(activateFunctions[index][0], activateFunctions[index][1], activateFunctions[index][2]);
        lastIndex = activeIndex;
    };

    var draw_dots = function (data_class, fill_type, transition) {
        var my_data = data_class === "none" ? [] : vis_data[data_class];

        x0_scale.domain(Array.from(new Set(my_data.map(d => d[data_class]))));
        x1_scale.domain([0, d3.max(my_data, d => d.column) + 1]).range([0, x0_scale.bandwidth()]);
        y_scale.domain([0, d3.max(my_data, d => d.row) + 1]);

        var my_radius = 4.5;

        var my_group = svg.selectAll(".labels_group")
            .data(x0_scale.domain(), function (d) { return d; });

        my_group.exit().remove();

        var enter = my_group.enter()
            .append("g")
            .attr("class", "labels_group");

        enter.append("text").attr("class", "bar_text");

        my_group = my_group.merge(enter);

        my_group.select(".bar_text")
            .attr("visibility", "hidden")
            .attr("x", function (d) { return x0_scale(d) + (x0_scale.bandwidth() * 0.45); })
            .attr("y", function (d) { return y_scale(d3.max(my_data.filter(m => m[data_class] === d), m => m.row)) - 15; })
            .attr("fill", function (d) {
                if (fill_type === "year") {
                    return year_colours[d];
                } else if (fill_type === "scam_type") {
                    return scam_type_colours[d];
                } else if (fill_type === "contact_mode") {
                    return contact_mode_colours[d];
                } else if (fill_type === "state") {
                    return state_color_scale(d); // Use state color scale
                } else if (fill_type === "gender") {
                    return gender_color_scale(d); // Use gender color scale (Male and Female only)
                } else if (fill_type === "lost_amount_range") {
                    return lost_amount_color_scale(d); // Use LostAmountRange color scale
                } else {
                    return total_scam_count_colour;
                }
            })
            .text(function (d) {
                if (data_class === "total_count") {
                    return "120001"; // Display the full count above the dots
                } else {
                    return my_data.filter(m => m[data_class] === d).reduce((acc, cur) => acc + cur.NumberOfReports, 0);
                }
            })
            .attr("transform", "translate(" + left_right_margin + "," + top_bottom_margin + ")")
            .transition()
            .delay(transition * 1.2)
            .attr("visibility", "visible");

        var dot_group = svg.selectAll(".dots_group")
            .data(my_data);

        dot_group.exit().remove();

        var enter_dots = dot_group.enter()
            .append("g")
            .attr("class", "dots_group");

        enter_dots.append("circle").attr("class", "circle_dot");

        dot_group = dot_group.merge(enter_dots);

        dot_group.select(".circle_dot")
            .transition()
            .duration(transition)
            .attr("cx", function (d) { return x0_scale(d[data_class]) + x1_scale(d.column); })
            .attr("cy", function (d) { return y_scale(d.row); })
            .attr("fill", function (d) {
                if (fill_type === "year") {
                    return year_colours[d[data_class]];
                } else if (fill_type === "scam_type") {
                    return scam_type_colours[d[data_class]];
                } else if (fill_type === "contact_mode") {
                    return contact_mode_colours[d[data_class]];
                } else if (fill_type === "state") {
                    return state_color_scale(d[data_class]); // Use state color scale
                } else if (fill_type === "gender") {
                    return gender_color_scale(d[data_class]); // Use gender color scale (Male and Female only)
                } else if (fill_type === "lost_amount_range") {
                    return lost_amount_color_scale(d[data_class]); // Use LostAmountRange color scale
                } else {
                    return total_scam_count_colour;
                }
            })
            .attr("r", my_radius)
            .attr("transform", "translate(" + left_right_margin + "," + top_bottom_margin + ")");

        var x_axis_selection = d3.select(".x_axis")
            .attr("transform", "translate(" + left_right_margin + "," + ((top_bottom_margin * 1.2) + y_scale.range()[0]) + ")")
            .call(d3.axisBottom(x0_scale));

        // Rotate x-axis labels for Section 3, Section 4, and Section 6
        if (data_class === "contact_mode" || data_class === "state" || data_class === "lost_amount_range") {
            x_axis_selection.selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-0.8em")
                .attr("dy", "0.15em")
                .attr("transform", "rotate(-45)");
        }
    };

    return chart;
};

function display(data) {
    var plot = scrollVis();
    d3.select('#vis')
        .datum(data)
        .call(plot);

    var scroll = scroller().container(d3.select('#graphic'));

    scroll(d3.selectAll('.step'));

    scroll.on('active', function (index) {
        d3.selectAll('.step')
            .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });
    });

    scroll.on('progress', function (index, progress) {
        plot.update(index, progress);
    });
}

function convert_data(my_data) {
    var dots_per_row = 10;

    var total_count_data = [];
    var year_data = [];
    var scam_type_data = [];
    var contact_mode_data = [];
    var state_scam_data = [];
    var gender_data = [];
    var lost_amount_range_data = [];

    // Aggregate the number of reports by state
    var state_aggregated_data = d3.rollups(
        my_data,
        v => d3.sum(v, d => d.NumberOfReports),
        d => d.State
    ).map(([state, NumberOfReports]) => ({ state, NumberOfReports }));

    // Sort by number of reports in descending order
    state_aggregated_data.sort((a, b) => b.NumberOfReports - a.NumberOfReports);

    state_aggregated_data.forEach(function (d, index) {
        var numDots = Math.ceil(d.NumberOfReports / 250); // Divide by 250 for better rendering
        for (var i = 0; i < numDots; i++) {
            state_scam_data.push({
                state: d.state,
                row: Math.floor(i / dots_per_row),
                column: i % dots_per_row,
                NumberOfReports: i === 0 ? d.NumberOfReports : 0 // Full number of reports in the label
            });
        }
    });

    // Aggregate the number of reports by gender (only Male and Female)
    var gender_aggregated_data = d3.rollups(
        my_data.filter(d => d.Gender === "Male" || d.Gender === "Female"), // Filter to include only Male and Female
        v => d3.sum(v, d => d.NumberOfReports),
        d => d.Gender
    ).map(([gender, NumberOfReports]) => ({ gender, NumberOfReports }));

    gender_aggregated_data.forEach(function (d, index) {
        var numDots = Math.ceil(d.NumberOfReports / 250); // Divide by 250 for better rendering
        for (var i = 0; i < numDots; i++) {
            gender_data.push({
                gender: d.gender,
                row: Math.floor(i / 50),
                column: i % dots_per_row,
                NumberOfReports: i === 0 ? d.NumberOfReports : 0 // Full number of reports in the label
            });
        }
    });

    // Aggregate the number of reports by LostAmountRange
    var lost_amount_range_aggregated_data = d3.rollups(
        my_data,
        v => d3.sum(v, d => d.NumberOfReports),
        d => d.AmountLostRange
    ).map(([AmountLostRange, NumberOfReports]) => ({ AmountLostRange, NumberOfReports }));

    lost_amount_range_aggregated_data.forEach(function (d, index) {
        var numDots = Math.ceil(d.NumberOfReports / 250); // Divide by 250 for better rendering
        for (var i = 0; i < numDots; i++) {
            lost_amount_range_data.push({
                lost_amount_range: d.AmountLostRange,
                row: Math.floor(i / dots_per_row),
                column: i % dots_per_row,
                NumberOfReports: i === 0 ? d.NumberOfReports : 0 // Full number of reports in the label
            });
        }
    });

    // Reducing the number of dots for better rendering performance
    var reduced_scam_count = Math.ceil(120001 / 100); // Display 120001/1200 dots
    for (var i = 0; i < reduced_scam_count; i++) {
        total_count_data.push({
            total_count: "Scam Reports",
            row: Math.floor(i / dots_per_row),
            column: i % 60,
            NumberOfReports: i === 0 ? "Total Scam Reports: 120001" : 0 // Display custom text above the dots
        });
    }

    my_data.forEach(function (d) {
        var numDots = Math.ceil(d.NumberOfReports / 20);
        for (var i = 0; i < numDots; i++) {
            year_data.push({
                year: d.Year,
                row: Math.floor(i / dots_per_row),
                column: i % dots_per_row,
                NumberOfReports: i === 0 ? d.NumberOfReports : 0
            });

            scam_type_data.push({
                scam_type: d.ScamType,
                row: Math.floor(i / dots_per_row),
                column: i % dots_per_row,
                NumberOfReports: i === 0 ? d.NumberOfReports : 0
            });

            contact_mode_data.push({
                contact_mode: d.ScamContactMode,
                row: Math.floor(i / dots_per_row),
                column: i % dots_per_row,
                NumberOfReports: i === 0 ? d.NumberOfReports : 0
            });
        }
    });

    return {
        total_count: total_count_data,
        year: year_data,
        scam_type: scam_type_data,
        contact_mode: contact_mode_data,
        state: state_scam_data, // Add state data
        gender: gender_data, // Add gender data (Male and Female only)
        lost_amount_range: lost_amount_range_data // Add lost amount range data
    };
}

// Load data and display
d3.json('http://127.0.0.1:8000/scam-by-year').then(display).catch(function(error) {
    console.error("Error loading data: ", error);
});
