/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
import powerbiVisualsApi from 'powerbi-visuals-api';

import IViewport = powerbiVisualsApi.IViewport;
import DataViewMetadataColumn = powerbiVisualsApi.DataViewMetadataColumn;
import DataViewValueColumn = powerbiVisualsApi.DataViewValueColumn;
import NumberRange = powerbiVisualsApi.NumberRange;

// powerbi.visuals
import ISelectionId = powerbiVisualsApi.visuals.ISelectionId;

// powerbi.extensibility.utils.interactivity
import {interactivitySelectionService as interactivityService} from 'powerbi-visuals-utils-interactivityutils';
import SelectableDataPoint = interactivityService.SelectableDataPoint;

// powerbi.extensibility.utils.tooltip
import {TooltipEnabledDataPoint} from 'powerbi-visuals-utils-tooltiputils';

// powerbi.extensibility.utils.chart
import {legendInterfaces} from 'powerbi-visuals-utils-chartutils';
import LegendDataPoint = legendInterfaces.LegendDataPoint;

import {Settings} from './settings';

export interface EnhancedScatterChartMeasureMetadataIndexes {
    category?: number;
    x?: number;

}

export interface EnhancedScatterChartMeasureMetadataColumns {
    x?: DataViewMetadataColumn;
    y?: DataViewMetadataColumn;
    size?: DataViewMetadataColumn;
}

export interface EnhancedScatterChartMeasureMetadata {
    idx: EnhancedScatterChartMeasureMetadataIndexes;
    cols: EnhancedScatterChartMeasureMetadataColumns;
    axesLabels: ChartAxesLabels;
}

export interface ChartAxesLabels {
    x: string;
    y: string;
    y2?: string;
}

export interface EnhancedScatterChartDataPoint extends SelectableDataPoint,
    TooltipEnabledDataPoint {
    fill: string;
    formattedCategory: () => string;
}

export interface EnhancedScatterChartAxesLabels {
    x: string;
    y: string;
    y2?: string;
}

export interface EnhancedScatterChartData {
    useShape: boolean;
    useCustomColor: boolean;
    xCol: DataViewMetadataColumn;
    yCol: DataViewMetadataColumn;
    dataPoints: EnhancedScatterChartDataPoint[];
    legendDataPoints: LegendDataPoint[];
    axesLabels: EnhancedScatterChartAxesLabels;
    size?: DataViewMetadataColumn;
    sizeRange: NumberRange;
    hasDynamicSeries?: boolean;
    hasGradientRole?: boolean;
    colorBorder?: boolean;
    colorByCategory?: boolean;
    selectedIds: ISelectionId[];
    settings: Settings;
}

