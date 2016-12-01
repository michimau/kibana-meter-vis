import _ from 'lodash';
import d3 from 'd3';
import AggResponseTabifyTabifyProvider from 'ui/agg_response/tabify/tabify';
import uiModules from 'ui/modules';

const module = uiModules.get('kibana/meter_vis', ['kibana']);

module.controller('KbnMeterVisController', function ($scope, $element, $rootScope, Private) {
  const tabifyAggResponse = Private(AggResponseTabifyTabifyProvider);

  const metrics = $scope.metrics = [];

  var svgRoot = $element[0];

  function isInvalid(val) {
    return _.isUndefined(val) || _.isNull(val) || _.isNaN(val);
  }

  function renderChart(visParams) {
    d3.select(svgRoot).selectAll('svg').remove();

    if (metrics.length === 0) {
      return null;
    }

    const height = 240;
    const margin = 30;
    const barWidth = 30;

    const ranges = visParams.ranges.filter(function (range) {
      return _.has(range, 'from') && _.has(range, 'to') && _.has(range, 'color');
    });

    const minDomain = Math.min.apply(null, ranges.map(function (range) {
      return range.from;
    }));

    const maxDomain = Math.max.apply(null, ranges.map(function (range) {
      return range.to;
    }));

    var yScale = d3.scale.linear()
                   .domain([minDomain, maxDomain])
                   .range([height, 0]);

    var svg = d3.select(svgRoot).append('svg')
        .attr('width', barWidth + margin * 2)
        .attr('height', height + margin * 2)
        .append('g')
        .attr('transform',
              'translate(' + margin + ',' + margin + ')');

    var yAxis = d3.svg.axis()
        .orient('left')
        .scale(yScale)
        .ticks(10);

    svg.append('g')
       .attr('class', 'y axis')
       .call(yAxis);

    svg.append('g')
       .selectAll('rect')
       .data(ranges)
       .enter()
       .append('rect')
       .attr('x', 5)
       .attr('y', function (d) { return yScale(d.to); })
       .attr('height', function (d) { return height - yScale(d.to - d.from); })
       .attr('width', barWidth)
       .style('fill', function (d) { return d.color; });

    var cursorHeight = height - yScale(10) - 4;
    var cursorWidth = barWidth + 5 * 2;

    var cursor = svg.append('g')
          .attr('transform',
                'translate(0,' + (yScale(metrics[0].value) - cursorHeight / 2)  + ')');

    cursor.append('rect')
       .attr('x', 0)
       .attr('y', 0)
       .attr('width', cursorWidth)
       .attr('height', cursorHeight)
       .style('fill', 'rgba(255, 255, 255, .7)')
       .style('stroke', '#fff')
       .style('stroke-width', 2);

    cursor.append('path')
      .attr('d', 'M 0 ' + cursorHeight / 2 + ' L ' + cursorWidth + ' ' + cursorHeight / 2)
      .attr('stroke', 'red')
      .attr('stroke-width', 1);
  }

  $scope.processTableGroups = function (tableGroups) {
    tableGroups.tables.forEach(function (table) {
      table.columns.forEach(function (column, i) {
        const fieldFormatter = table.aggConfig(column).fieldFormatter();
        let value = table.rows[0][i];

        value = isInvalid(value) ? '?' : fieldFormatter(value);

        metrics.push({
          label: column.title,
          value: value
        });
      });
    });
  };

  $scope.$watch('vis.params.ranges', function () {
    renderChart($scope.vis.params);
  });

  $scope.$watch('esResponse', function (resp) {
    if (resp) {
      metrics.length = 0;
      $scope.processTableGroups(tabifyAggResponse($scope.vis, resp));
      renderChart($scope.vis.params);
    }
  });
});
