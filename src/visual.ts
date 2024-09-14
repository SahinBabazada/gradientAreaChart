"use strict";

import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "./settings";

export class Visual implements IVisual {
    private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    private tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    constructor(options: VisualConstructorOptions) {
        const element = options.element;

        // Initialize formatting settings service
        this.formattingSettingsService = new FormattingSettingsService();

        // Create SVG container
        this.svg = d3.select(element)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%");

        // Create tooltip div
        this.tooltip = d3.select(element)
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("border", "1px solid #ccc")
            .style("padding", "5px")
            .style("border-radius", "5px");
    }

    public update(options: VisualUpdateOptions) {
        const width = options.viewport.width;
        const height = options.viewport.height;

        // Clear previous content
        this.svg.selectAll("*").remove();

        // Get formatting settings
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews[0]);

        // Fetch data
        const dataView = options.dataViews[0];
        const categories = dataView.categorical.categories[0].values as string[];
        const values = (dataView.categorical.values[0].values as number[]).map(Number); // Ensure values are numbers

        if (categories.length === 0 || values.length === 0) return;

        // Compute minRange and maxRange
        const minRange = this.formattingSettings.yAxisSettings.minRange.value ?? d3.min(values);
        const maxRange = this.formattingSettings.yAxisSettings.maxRange.value ?? d3.max(values);

        const defaultColor = this.formattingSettings.generalSettings.defaultColor.value?.value || "#0078d7";
        const gradientStartColor = this.formattingSettings.generalSettings.gradientStartColor.value?.value || "#0078d7";
        const gradientEndColor = this.formattingSettings.generalSettings.gradientEndColor.value?.value || "#ffffff";


        const markerSize = this.formattingSettings.generalSettings.markerSize.value;

        const showXAxis = this.formattingSettings.xAxisSettings.showXAxis.value;
        const xAxisFontSize = this.formattingSettings.xAxisSettings.xAxisFontSize.value;
        const showYAxis = this.formattingSettings.yAxisSettings.showYAxis.value;
        const yAxisFontSize = this.formattingSettings.yAxisSettings.yAxisFontSize.value;

        const yAxisDisplayUnits = this.formattingSettings.yAxisSettings.yAxisDisplayUnits.value;
        const yAxisDecimalPlaces = this.formattingSettings.yAxisSettings.yAxisDecimalPlaces.value ?? 2;
        const smoothLine = this.formattingSettings.generalSettings.smoothLine.value;

        // Reduce padding to bring the content closer to the edges
        const padding = 40;

        // Scales
        const xScale = d3.scalePoint().domain(categories).range([padding, width - padding]);
        const yScale = d3.scaleLinear().domain([minRange, maxRange]).range([height - padding, padding]);

        // Format Y-Axis labels with display units and decimal places
        const yAxisFormatter = (d: number) => {
            if (yAxisDisplayUnits.displayName === "Thousands") {
                return `${(d / 1000).toFixed(2)}K`;  // Rounds to 2 decimal places
            }
            if (yAxisDisplayUnits.displayName === "Millions") {
                return `${(d / 1000000).toFixed(2)}M`;
            }
            if (yAxisDisplayUnits.displayName === "Billions") {
                return `${(d / 1000000000).toFixed(2)}B`;
            }
            if (yAxisDisplayUnits.displayName === "Trillions") {
                return `${(d / 1000000000000).toFixed(2)}T`;
            }

            // Auto: Dynamically determine the display units based on value size
            if (yAxisDisplayUnits.displayName === "Auto") {
                if (d >= 1000000000000) {
                    return `${(d / 1000000000000).toFixed(2)}T`;
                }
                if (d >= 1000000000) {
                    return `${(d / 1000000000).toFixed(2)}B`;
                }
                if (d >= 1000000) {
                    return `${(d / 1000000).toFixed(2)}M`;
                }
                if (d >= 1000) {
                    return `${(d / 1000).toFixed(2)}K`;
                }
            }

            // Default: Return the raw value with specified decimal places
            return d.toFixed(yAxisDecimalPlaces);  // Set to the configured number of decimal places
        };

        const numberOfTicks = Math.max(1, Math.floor(height / 80));

        // Define Y-axis with dynamic number of ticks and grid lines
        const yAxis = d3.axisLeft(yScale)
            .tickFormat((d: any) => yAxisFormatter(d))
            .ticks(numberOfTicks)  // Manually set the number of ticks
            .tickSize(-width)  // Extend grid lines across the width of the chart, no overflow
            .tickSizeOuter(0);

        // Define custom gradient with multiple stops
        const gradient = this.svg.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("x2", "0%")
            .attr("y1", "0%")
            .attr("y2", "100%");

        // Example of multi-stop gradient with different color transitions
        gradient.append("stop").attr("offset", "0%").attr("stop-color", gradientStartColor).attr("stop-opacity", 0.7);
        gradient.append("stop").attr("offset", "100%").attr("stop-color", gradientEndColor).attr("stop-opacity", 0.3);


        // Toggle smooth vs. straight line
        const lineType = smoothLine ? d3.curveMonotoneX : d3.curveLinear;

        // X Axis
        if (showXAxis) {
            const xAxis = d3.axisBottom(xScale)
                .tickSize(0)  // Remove tick lines from the X-axis
                .tickPadding(10); // Add some padding to the X-axis labels

            this.svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0, ${height - padding})`)
                .call(xAxis)
                .select(".domain").remove();  // Remove the X-axis line
        }

        // Render the Y-axis
        if (showYAxis) {
            const yAxisGroup = this.svg.append("g")
                .attr("class", "y-axis")
                .attr("transform", `translate(${padding}, 0)`)
                .call(yAxis)
                .select(".domain").remove();  // Remove Y-axis line

            // Apply lighter and subtler styling to the grid lines
            this.svg.selectAll(".y-axis .tick line")
                .attr("stroke-dasharray", "3, 3")  // Subtle dashed grid lines
                .attr("stroke", "#cccccc")  // Use very light gray for less prominent lines
                .attr("stroke-width", 0.8);  // Thinner grid lines
        }

        // Area path for the chart
        const area = d3.area<number>()
            .x((d, i) => xScale(categories[i])!)
            .y0(() => yScale(minRange))  // Set y0 to the minimum Y-axis value
            .y1(d => yScale(d))
            .curve(lineType);

        this.svg.append("path")
            .datum(values)
            .attr("fill", "url(#gradient)")
            .attr("stroke", defaultColor)
            .attr("stroke-width", 2)
            .attr("d", area);

        // Vertical line for hover effect
        const verticalLine = this.svg.append("line")
            .attr("class", "hover-line")
            .attr("y1", padding)  // Set to the top of the chart area
            .attr("y2", height - padding)  // Set to the bottom of the chart area
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .style("opacity", 0);  // Hidden by default

        // Tooltip handling and hover interaction
        const self = this;

        // Check if we should show markers or hover interaction
        if (this.formattingSettings.generalSettings.showMarkers.value || true) {
            // Create an invisible overlay to capture mouse movement
            this.svg.append("rect")
                .attr("class", "overlay")
                .attr("width", width)
                .attr("height", height)
                .style("fill", "none")
                .style("pointer-events", "all")
                .on("mousemove", function (event: MouseEvent) {
                    const mouseX = d3.pointer(event)[0];  // Get the X coordinate of the mouse

                    // Manually find the closest category by checking each category's X position
                    let closestIndex = 0;
                    let minDistance = Infinity;
                    categories.forEach((category, i) => {
                        const categoryX = xScale(category)!;
                        const distance = Math.abs(categoryX - mouseX);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestIndex = i;
                        }
                    });

                    const closestCategory = categories[closestIndex];  // Get the corresponding category
                    const closestValue = values[closestIndex];  // Get the corresponding value

                    // Move the vertical line to the hovered X position
                    verticalLine
                        .attr("x1", xScale(closestCategory)!)
                        .attr("x2", xScale(closestCategory)!)
                        .style("opacity", 1);  // Show the vertical line

                    // Update the tooltip
                    self.tooltip.style("visibility", "visible")
                        .html(`
                            <strong>${closestCategory}</strong><br/>
                            <span style="color:${defaultColor}">●</span> Sum Gross Salary: ${closestValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        `);

                    // Position the tooltip relative to the mouse
                    self.tooltip.style("top", `${event.pageY - 30}px`)
                        .style("left", `${event.pageX + 10}px`);
                })
                .on("mouseout", function () {
                    // Hide the vertical line and tooltip when the mouse leaves the chart area
                    verticalLine.style("opacity", 0);
                    self.tooltip.style("visibility", "hidden");
                });
        }
    }

    // Formatting model for Power BI
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}
