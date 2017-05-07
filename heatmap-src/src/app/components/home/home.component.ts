import { Component, OnInit } from '@angular/core';
import { D3Service, D3, Selection } from 'd3-ng2-service';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../services/data.service';
import { legendColor } from 'd3-svg-legend';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  private d3: D3;
  dataset: any;

  constructor(
    d3Service: D3Service,
    private titleService: Title,
    private data: DataService
  ) {
    this.d3 = d3Service.getD3();
    // this.d3.legendColor = legendColor;
  }

  ngOnInit() {
    // title the page
    this.titleService.setTitle('Heat Map - FCC');

    this.data.getJson().subscribe(
      data => {
        if (data) {
          this.dataset = data;
          console.log(data);
          this.drawHeatMap();
        }
      }
    );

  }

  drawHeatMap() {
    // alias d3
    const d3 = this.d3;
    const baseTemp = this.dataset["baseTemperature"];
    const data = this.dataset["monthlyVariance"];

    // month names
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    // setup svg component
    const width = 1250,
          height = 650,
          padding = 50;

    // append svg component
    const svg = d3.select("#svg")
      .append("svg")
      .attr("class", "svg")
      .attr("width", width)
      .attr("height", height);

    // x scale
    const firstYear = new Date("January 1, " + d3.min(data, (d) => d["year"]));
    const lastYear = new Date("December 31, " + d3.max(data, (d) => d["year"]));
    const numYears = Number(d3.max(data, (d) => d['year'])) - Number(d3.min(data, (d) => d['year'])) + 1;
    console.log("numYears:", numYears);

    const xScale = d3.scaleTime()
      .domain([firstYear, lastYear])
      .range([padding, width - padding]);

    // x axis
    const xAxis = d3.axisBottom(xScale);
    svg.append("g")
      .attr("transform", "translate(0, " + (height - padding) + ")")
      .call(xAxis);

    // axis label based on d3noob's block
    // https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e
    // add label to x axis
    svg.append("text")
      .attr("transform", "translate(" + (width / 2) + ", " + (height - 10) + ")")
      .style("text-anchor", "middle")
      .text("Years");

    // y scale
    const ySpacer = 50;
    const yScale = d3.scaleLinear()
      .domain([12.5, 0.5])
      .range([height - padding, ySpacer]);
    const rectHeight = (height - padding - ySpacer) / 12;
    const rectWidth = (width - padding) / numYears;

    // y axis
    const yAxis = d3.axisLeft(yScale).tickFormat((d, i) => {
      return monthNames[Number(d) - 1];
    });
    svg.append("g")
      .attr("transform", "translate(" + padding + ", 0)")
      .call(yAxis);

    // tooltip
    const div = d3.select("#svg")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // add rects
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(new Date('January 1, ' + d['year'])))
      .attr('y', (d, i) => (i % 12) * rectHeight + ySpacer)
      .attr('height', rectHeight)
      .attr('width', rectWidth)
      .attr('fill', (d) => {
        if (d['variance'] <= -2.25) {
          return '#550000';
        } else if (d['variance'] <= -1.75) {
          return '#0500FF';
        } else if (d['variance'] <= -1.25) {
          return '#00B4FF';
        } else if (d['variance'] <= -.75) {
          return '#00FFF4';
        } else if (d['variance'] <= -0.25) {
          return '#00FF83';
        } else if (d['variance'] <= 0.25) {
          return '#17FF00';
        } else if (d['variance'] <= 0.75) {
          return '#D7FF00';
        } else if (d['variance'] <= 1.25) {
          return '#FFFA00';
        } else if (d['variance'] <= 1.75) {
          return '#FFBE00';
        } else if (d['variance'] <= 2.25) {
          return '#FF0000';
        } else {
          return '#FF00D0';
        }
      })
      .on('mouseover', (d) => {
        div.transition()
          .duration(100)
          .style('opacity', 0.9);
        div.html('<h2>'
          + d['year'] + ' - ' + monthNames[d['month'] - 1]
          + '</h2>'
          + '<h3>Temperature: ' + String(Math.round((baseTemp + d['variance']) * 1000) / 1000) + '&#8451;</h3>'
          + '<h3>Variance: ' + String(d['variance']) + '&#8451;</h3>')
          .style('left', (d3.event.pageX - 190) + 'px')
          .style('top', (d3.event.pageY + (padding / 2)) + 'px');
      })
      .on('mouseout', (d) => {
        div.transition()
          .duration(750)
          .style("opacity", 0);
      });

      // legend
      const ordinal = d3.scaleOrdinal()
        .domain(['< 6.41', '6.41 to 6.91', '6.92 to 7.41', '7.42 to 7.91', '7.92 to 8.41', '8.42 to 8.91', '8.92 to 9.41', '9.42 to 9.91', '9.92 to 10.41', '10.42 to 10.91', '> 10.91'])
        .range(['#550000', '#0500FF', '#00B4FF', '#00FFF4', '#00FF83', '#17FF00', '#D7FF00', '#FFFA00', '#FFBE00', '#FF0000', '#FF00D0']);

      svg.append('g')
        .attr('class', 'legendQuant')
        .attr('transform', 'translate(' + String(padding + 15) + ', 0)');

      const colorLegend = legendColor()
        .shapeWidth(100)
        .orient('horizontal')
        .scale(ordinal);

      svg.select('.legendQuant')
        .call(colorLegend);

  }

}
