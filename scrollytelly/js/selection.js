var scrollVis = function () {
    // Define constants
    var width = 1100;
    var left_right_margin = 100;
    var top_bottom_margin = 200;
    var height = 650;

    // Define scroll index tracking vars
    var lastIndex = -1;
    var activeIndex = 0;

    // Define scales
    var x0_scale = d3.scaleBand().padding(0.5).range([0, width - (left_right_margin * 2)]);
    var x1_scale = d3.scaleLinear();
    var y_scale = d3.scaleLinear().range([height - (top_bottom_margin * 2), 0]);

    var formatThousands = d3.format(",");  // Adds thousands separator

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
        "Social media": '#b15928',
        "Text message": '#b2df8a',
        "unspecified": '#cab2d6'
    };

    var total_scam_count_colour = '#1f78b4'; // Blue color for section 0 dots
    var final_dot_colour = '#e31a1c';  // Red color for the final section dot
    var state_color_scale = d3.scaleOrdinal(d3.schemeCategory10); // Color scale for states
    var gender_color_scale = d3.scaleOrdinal().domain(["Male", "Female"]).range(["#1f78b4", "#e31a1c"]); // Color scale for Male and Female
    var lost_amount_color_scale = d3.scaleOrdinal().domain([
        '$0',
        '$1 - $10,000',
        '$10,001 - $50,000',
        '$50,001 - $200,000',
        '$200,001 - $1,000,000',
        '$1,000,001+'
    ]).range(d3.schemeCategory10); // Color scale for LostAmountRange

    var month_color_scale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);

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

        // Add title placeholders
        svg.append("text")
            .attr("class", "chart-title")
            .attr("x", width / 2)
            .attr("y", top_bottom_margin - 60)  // Adjusted position for section 0 title
            .attr("text-anchor", "middle")
            .style("font-size", "16px")  // Set to match x-axis labels size
            .style("font-family", "sans-serif")  // Set to match x-axis labels font
            .style("font-weight", "bold")  // Make the title bold
            .attr("visibility", "hidden");
    };

    var set_up_sections = function () {
        activateFunctions[0] = ["total_count", "total_count", 2000, "Total Number of Reported Scams"]; // Total Count
        activateFunctions[1] = ["year", "year", 2000, "Number of Reported Scams by Year"]; // Year
        activateFunctions[2] = ["scam_type", "scam_type", 2000, "Number of Scams by Reported Scam Type"]; // Scam Type
        activateFunctions[3] = ["contact_mode", "contact_mode", 2000, "Number of Reported Scams by Contact Mode"]; // Contact Mode
        activateFunctions[4] = ["state", "state", 2000, "Number of Reported Scams by State"]; // State
        activateFunctions[5] = ["gender", "gender", 2000, "Percentage of Reported Scams by Gender"]; // Gender (Male and Female only)
        activateFunctions[6] = ["lost_amount_range", "lost_amount_range", 2000, "Number of Reported Scams by Lost Amount Range"]; // LostAmountRange
        activateFunctions[7] = ["month", "month", 2000, "Percentage of Reported Scams by Month"]; // Month
        activateFunctions[8] = ["final", "final", 2000, "Don't be the one to fall victim to a scam"]; // Final section for the single dot
    };

    chart.update = function (index, progress) {
        activeIndex = index;
        draw_dots(activateFunctions[index][0], activateFunctions[index][1], activateFunctions[index][2], activateFunctions[index][3]);
        lastIndex = activeIndex;
    };

    var draw_dots = function (data_class, fill_type, transition, chartTitle) {
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
            .attr("x", function (d) {
                return data_class === "final" ? width / 2 : x0_scale(d) + (x0_scale.bandwidth() * 0.45);
            })
            .attr("y", function (d) {
                return data_class === "final" ? height / 2 - 15 : y_scale(d3.max(my_data.filter(m => m[data_class] === d), m => m.row)) - 15;
            })
            .attr("fill", function (d) {
                // Use appropriate color scale based on the data type
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
                } else if (fill_type === "month") {
                    return month_color_scale(d); // Use month color scale
                } else if (fill_type === "final") {
                    return final_dot_colour; // Red color for the final dot
                } else {
                    return total_scam_count_colour;
                }
            })
            .text(function (d) {
                // Display appropriate text based on the data class
                if (data_class === "gender") {
                    var totalGenderReports = d3.sum(my_data, m => m.NumberOfReports);
                    var genderReports = my_data.filter(m => m[data_class] === d).reduce((acc, cur) => acc + cur.NumberOfReports, 0);
                    var percentage = ((genderReports / totalGenderReports) * 100).toFixed(1);
                    return `${percentage}%`; // Display the percentage for gender
                } else if (data_class === "month") {
                    // Calculate the total number of reports
                    var totalReports = d3.sum(my_data, m => m.NumberOfReports);
                    // Calculate the reports for the specific month
                    var monthReports = my_data.filter(m => m[data_class] === d).reduce((acc, cur) => acc + cur.NumberOfReports, 0);
                    // Calculate the percentage of reports for the month
                    var monthPercentage = ((monthReports / totalReports) * 100).toFixed(1);
                    return `${monthPercentage}%`; // Display the percentage for the month
                } else {
                    var totalReports = my_data.filter(m => m[data_class] === d).reduce((acc, cur) => acc + cur.NumberOfReports, 0);
                    return formatThousands(totalReports); // Use the thousands separator for other cases
                }
            })            
            .attr("transform", "translate(" + left_right_margin + "," + top_bottom_margin + ")")
            .transition()
            .delay(transition * 1.2)
            .attr("visibility", function (d) {
                return data_class === "final" ? "hidden" : "visible";
            });
    
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
            .attr("cx", function (d) {
                return data_class === "final" ? width / 2.4 : x0_scale(d[data_class]) + x1_scale(d.column);
            })
            .attr("cy", function (d) {
                return data_class === "final" ? top_bottom_margin - 100 : y_scale(d.row); // Adjusted to better center under title
            })
            .attr("fill", function (d) {
                if (data_class === "total_count") {
                    return total_scam_count_colour; // Section 0 circles in blue
                }
                if (fill_type === "year") {
                    return year_colours[d[data_class]];
                } else if (fill_type === "scam_type") {
                    return scam_type_colours[d[data_class]];
                } else if (fill_type === "contact_mode") {
                    return contact_mode_colours[d[data_class]];
                } else if (fill_type === "state") {
                    return state_color_scale(d[data_class]); // Use state color scale
                } else if (fill_type === "gender") {
                    return gender_color_scale(d[data_class]);
                } else if (fill_type === "lost_amount_range") {
                    return lost_amount_color_scale(d[data_class]);
                } else if (fill_type === "month") {
                    return month_color_scale(d[data_class]);
                } else if (fill_type === "final") {
                    return final_dot_colour;
                }
            })
            .attr("r", function (d) {
                return data_class === "final" ? my_radius * 5 : my_radius;  // Make the dot grow to 5x size in the final section
            })
            .attr("transform", "translate(" + left_right_margin + "," + top_bottom_margin + ")");
    
        // X-axis rendering
        var x_axis_selection = d3.select(".x_axis")
            .attr("transform", "translate(" + left_right_margin + "," + (height - top_bottom_margin) + ")");
    
        // Show x-axis for every section
        x_axis_selection.call(d3.axisBottom(x0_scale));
    
        // Conditional logic for label rotation
        x_axis_selection.selectAll("text")
            .style("text-anchor", function () {
                // Sections 0, 1, 2, 5, 6 have horizontal labels
                if ([0, 1, 2, 5, 6].includes(activeIndex)) {
                    return "middle";
                } else {
                    return "end";
                }
            })
            .attr("dx", function () {
                // Horizontal alignment for sections 0, 1, 2, 5, 6
                if ([0, 1, 2, 5].includes(activeIndex)) {
                    return "0";
                }
                if ([8].includes(activeIndex)) {
                    return "3.5em";
                } else {
                    return "-0.8em";
                }
            })
            .attr("dy", function () {
                // Adjust vertical alignment for horizontal labels
                if ([0, 1, 2, 5, 8].includes(activeIndex)) {
                    return "0.85em";
                } else {
                    return "0.15em";
                }
            })
            .attr("transform", function () {
                // Horizontal for sections 0, 1, 2, 5, 8, and rotated otherwise
                if ([0, 1, 2, 5, 8].includes(activeIndex)) {
                    return "rotate(0)"; // No rotation
                } else {
                    return "rotate(-45)"; // 45-degree rotation for all other sections
                }
            });
    
        // Display the title
        svg.select(".chart-title")
            .text(chartTitle)
            .transition()
            .delay(transition * 1.2)
            .attr("visibility", "visible");
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
    var month_data = [];
    var final_data = [{ final: "Scam Reports", row: 0, column: 0 }];

    // Aggregate the number of reports by state
    var state_aggregated_data = d3.rollups(
        my_data,
        v => d3.sum(v, d => d.NumberOfReports),
        d => d.State
    ).map(([state, NumberOfReports]) => ({ state, NumberOfReports }));

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

    // Aggregate the number of reports by year
    var year_aggregated_data = d3.rollups(
        my_data,
        v => d3.sum(v, d => d.NumberOfReports),
        d => d.Year
    ).map(([year, NumberOfReports]) => ({ year, NumberOfReports }));

    year_aggregated_data.forEach(function (d, index) {
        var numDots = Math.ceil(d.NumberOfReports / 250); // Same scaling factor as state
        for (var i = 0; i < numDots; i++) {
            year_data.push({
                year: d.year,
                row: Math.floor(i / dots_per_row),
                column: i % dots_per_row,
                NumberOfReports: i === 0 ? d.NumberOfReports : 0 // Full number of reports in the label
            });
        }
    });

    // Aggregate the number of reports by scam type
    var scam_type_aggregated_data = d3.rollups(
        my_data,
        v => d3.sum(v, d => d.NumberOfReports),
        d => d.ScamType
    ).map(([scam_type, NumberOfReports]) => ({ scam_type, NumberOfReports }));

    scam_type_aggregated_data.forEach(function (d, index) {
        var numDots = Math.ceil(d.NumberOfReports / 500); // Use the same scaling factor
        for (var i = 0; i < numDots; i++) {
            scam_type_data.push({
                scam_type: d.scam_type,
                row: Math.floor(i / dots_per_row),
                column: i % dots_per_row,
                NumberOfReports: i === 0 ? d.NumberOfReports : 0 // Full number of reports in the label
            });
        }
    });

    // Aggregate the number of reports by contact mode
    var contact_mode_aggregated_data = d3.rollups(
        my_data,
        v => d3.sum(v, d => d.NumberOfReports),
        d => d.ScamContactMode
    ).map(([contact_mode, NumberOfReports]) => ({ contact_mode, NumberOfReports }));

    contact_mode_aggregated_data.forEach(function (d, index) {
        var numDots = Math.ceil(d.NumberOfReports / 500); // Use the same scaling factor
        for (var i = 0; i < numDots; i++) {
            contact_mode_data.push({
                contact_mode: d.contact_mode,
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

    // Specify the order for lost amount ranges
    const lostAmountOrder = ['$0', '$1 - $10,000', '$10,001 - $50,000', '$50,001 - $200,000', '$200,001 - $1,000,000', '$1,000,001+'];
    lost_amount_range_aggregated_data.sort((a, b) => lostAmountOrder.indexOf(a.AmountLostRange) - lostAmountOrder.indexOf(b.AmountLostRange));

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

    // Aggregate the number of reports by month
    var month_aggregated_data = d3.rollups(
        my_data,
        v => d3.sum(v, d => d.NumberOfReports),
        d => d.Month
    ).map(([month, NumberOfReports]) => ({ month, NumberOfReports }));

    const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    month_aggregated_data.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

    month_aggregated_data.forEach(function (d, index) {
        var numDots = Math.ceil(d.NumberOfReports / 100); // Divide by 250 for better rendering
        for (var i = 0; i < numDots; i++) {
            month_data.push({
                month: d.month,
                row: Math.floor(i / dots_per_row),
                column: i % dots_per_row,
                NumberOfReports: i === 0 ? d.NumberOfReports : 0 // Full number of reports in the label
            });
        }
    });

    // Reducing the number of dots for better rendering performance
    // First, calculate the total sum of reports dynamically from your dataset
    var total_scam_count = d3.sum(my_data, d => d.NumberOfReports); // Dynamically calculate the sum

    // Divide by 1000 to determine how many dots are needed
    var reduced_scam_count = Math.ceil(total_scam_count / 1000); 

    for (var i = 0; i < reduced_scam_count; i++) {
        total_count_data.push({
            total_count: "Scam Reports",
            row: Math.floor(i / dots_per_row),
            column: i % dots_per_row,
            NumberOfReports: i === 0 ? total_scam_count : 0 // Display the total only for the first dot
        });
    }

    return {
        total_count: total_count_data,
        year: year_data,
        scam_type: scam_type_data,
        contact_mode: contact_mode_data,
        state: state_scam_data, // Add state data
        gender: gender_data, // Add gender data (Male and Female only)
        lost_amount_range: lost_amount_range_data, // Add lost amount range data
        month: month_data, // Add month data
        final: final_data // Add final data for the single dot
    };
}

// Load data and display
d3.json('http://127.0.0.1:8000/data/scam-by-year').then(display).catch(function(error) {
    console.error("Error loading data: ", error);
});