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

import './../style/visual.less';

import * as d3 from 'd3';
import * as _  from 'lodash';
import * as $  from 'jquery';

import powerbiVisualsApi from 'powerbi-visuals-api';

// d3
type Selection<T1, T2 = T1> = d3.Selection<any, T1, any, T2>;
import ScaleLinear = d3.ScaleLinear;

// powerbi
import Fill = powerbiVisualsApi.Fill;
import DataView = powerbiVisualsApi.DataView;
import IViewport = powerbiVisualsApi.IViewport;
import ValueRange = powerbiVisualsApi.ValueRange;
import NumberRange = powerbiVisualsApi.NumberRange;
import DataViewObject = powerbiVisualsApi.DataViewObject;
import DataViewObjects = powerbiVisualsApi.DataViewObjects;
import DataViewCategorical = powerbiVisualsApi.DataViewCategorical;
import DataViewValueColumn = powerbiVisualsApi.DataViewValueColumn;
import DataViewValueColumns = powerbiVisualsApi.DataViewValueColumns;
import DataViewMetadataColumn = powerbiVisualsApi.DataViewMetadataColumn;
import DataViewValueColumnGroup = powerbiVisualsApi.DataViewValueColumnGroup;
import PrimitiveValue = powerbiVisualsApi.PrimitiveValue;
import ValueTypeDescriptor = powerbiVisualsApi.ValueTypeDescriptor;
import VisualObjectInstance = powerbiVisualsApi.VisualObjectInstance;
import DataViewCategoryColumn = powerbiVisualsApi.DataViewCategoryColumn;
import VisualObjectInstanceEnumeration = powerbiVisualsApi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbiVisualsApi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumerationObject = powerbiVisualsApi.VisualObjectInstanceEnumerationObject;

import IColorPalette = powerbiVisualsApi.extensibility.IColorPalette;
import VisualTooltipDataItem = powerbiVisualsApi.extensibility.VisualTooltipDataItem;
import ISandboxExtendedColorPalette = powerbiVisualsApi.extensibility.ISandboxExtendedColorPalette;
import IVisualEventService = powerbiVisualsApi.extensibility.IVisualEventService;
import ISelectionManager = powerbiVisualsApi.extensibility.ISelectionManager;

// powerbi.visuals
import ISelectionId = powerbiVisualsApi.visuals.ISelectionId;
import ISelectionIdBuilder = powerbiVisualsApi.visuals.ISelectionIdBuilder;

import IVisual = powerbiVisualsApi.extensibility.IVisual;
import IVisualHost = powerbiVisualsApi.extensibility.visual.IVisualHost;
import VisualUpdateOptions = powerbiVisualsApi.extensibility.visual.VisualUpdateOptions;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;

// powerbi.extensibility.utils.dataview
import {dataRoleHelper as DataRoleHelper} from 'powerbi-visuals-utils-dataviewutils';
import getMeasureIndexOfRole = DataRoleHelper.getMeasureIndexOfRole;
import getCategoryIndexOfRole = DataRoleHelper.getCategoryIndexOfRole;

// powerbi.extensibility.utils.svg
import * as SVGUtil from 'powerbi-visuals-utils-svgutils';
import IMargin = SVGUtil.IMargin;
import ISize = SVGUtil.shapesInterfaces.ISize;
import ClassAndSelector = SVGUtil.CssConstants.ClassAndSelector;
import createClassAndSelector = SVGUtil.CssConstants.createClassAndSelector;
import manipulation = SVGUtil.manipulation;

// powerbi.extensibility.utils.chart
import {
    legend as legendModule,
    legendInterfaces,
    OpacityLegendBehavior,
    legendBehavior,
    axisInterfaces,
    axis,
    dataLabelInterfaces,
    dataLabelUtils,
    legendData
} from 'powerbi-visuals-utils-chartutils';
import ILegend = legendInterfaces.ILegend;
import LegendPosition = legendInterfaces.LegendPosition;
import LegendData = legendInterfaces.LegendData;
import LegendDataPoint = legendInterfaces.LegendDataPoint;
import IAxisProperties = axisInterfaces.IAxisProperties;
import TickLabelMargins = axisInterfaces.TickLabelMargins;
import ILabelLayout = dataLabelInterfaces.ILabelLayout;
import LabelTextProperties = dataLabelUtils.LabelTextProperties;
import getLabelFormattedText = dataLabelUtils.getLabelFormattedText;
import LegendBehavior = legendBehavior.LegendBehavior;
import createLegend = legendModule.createLegend;

// powerbi.extensibility.utils.type
import {pixelConverter as PixelConverter, double} from 'powerbi-visuals-utils-typeutils';
import equalWithPrecision = double.equalWithPrecision;

// powerbi.extensibility.utils.interactivity
import {
    interactivityBaseService as interactivityService,
    interactivitySelectionService
} from 'powerbi-visuals-utils-interactivityutils';
import appendClearCatcher = interactivityService.appendClearCatcher;
import IInteractiveBehavior = interactivityService.IInteractiveBehavior;
import IInteractivityService = interactivityService.IInteractivityService;
import createInteractivitySelectionService = interactivitySelectionService.createInteractivitySelectionService;

// powerbi.extensibility.utils.formatting
import {textMeasurementService as tms, valueFormatter} from 'powerbi-visuals-utils-formattingutils';
import TextProperties = tms.TextProperties;
import IValueFormatter = valueFormatter.IValueFormatter;
import textMeasurementService = tms.textMeasurementService;
import svgEllipsis = textMeasurementService.svgEllipsis;
import measureSvgTextWidth = textMeasurementService.measureSvgTextWidth;
import measureSvgTextHeight = textMeasurementService.measureSvgTextHeight;
import estimateSvgTextHeight = textMeasurementService.estimateSvgTextHeight;
import getTailoredTextOrDefault = textMeasurementService.getTailoredTextOrDefault;

// powerbi.extensibility.utils.color
import {ColorHelper} from 'powerbi-visuals-utils-colorutils';

// powerbi.extensibility.utils.tooltip
import {
    createTooltipServiceWrapper,
    TooltipEventArgs,
    ITooltipServiceWrapper,
    TooltipEnabledDataPoint
} from 'powerbi-visuals-utils-tooltiputils';

import {AxisSettings, DataPointSettings, LegendSettings, CategoryLabelsSettings, Settings} from './settings';
import {
    EnhancedScatterChartData,
    EnhancedScatterChartDataPoint,
    EnhancedScatterChartMeasureMetadata,
    EnhancedScatterChartMeasureMetadataIndexes,
    EnhancedScatterDataRange,
    EnhancedScatterChartRadiusData,
    CalculateScaleAndDomainOptions,
    ChartAxesLabels,
    ElementProperties
}                                                                                          from './dataInterfaces';
import * as gradientUtils                                                                  from './gradientUtils';
import {tooltipBuilder}                                                                    from './tooltipBuilder';
import {BaseDataPoint}                                                                     from 'powerbi-visuals-utils-interactivityutils/lib/interactivityBaseService';

interface ShapeFunction {
    (value: any): string;
}

interface ShapeEntry {
    key: string;
    value: ShapeFunction;
}

export class EnhancedScatterChart implements IVisual {

    private static AxisGraphicsContextClassName: string = 'axisGraphicsContext';
    private static ClassName: string = 'enhancedScatterChart';
    private static MainGraphicsContextClassName: string = 'mainGraphicsContext';

    private static MinAmountOfTicks: number = 0;
    private static MinAmountOfCategories: number = 0;
    private static MinAmountOfValues: number = 0;

    private static MinIndex: number = 0;

    private static EmptyString: string = '';

    private static DefaultSelectionStateOfTheDataPoint: boolean = false;
    private static DefaultContentPosition: number = 8;

    private static DefaultColumnId: number = 0;

    private static MinAmountOfDataPointsInTheLegend: number = 1;

    private static DefaultMarginValue: number = 1;

    public static SvgScrollableSelector: ClassAndSelector = createClassAndSelector('svgScrollable');

    public static XAxisSelector: ClassAndSelector = createClassAndSelector('x axis');

    private static NumberSignZero: number = 0;
    private static NumberSignPositive: number = 1;

    public static MaxTranslateValue: number = 1e+25;
    public static MinTranslateValue: number = 1e-25;

    public static ColumnCategory: string = 'Category';
    public static ColumnX: string = 'X';
    public static ColumnY: string = 'Y';
    public static ColumnSize: string = 'Size';

    public static ColumnColorFill: string = 'ColorFill';
    public static ColumnShape: string = 'Shape';
    public static ColumnImage: string = 'Image';
    public static ColumnRotation: string = 'Rotation';
    public static ColumnBackdrop: string = 'Backdrop';
    public static ColumnXStart: string = 'XStart';
    public static ColumnXEnd: string = 'XEnd';
    public static ColumnYStart: string = 'YStart';
    public static ColumnYEnd: string = 'YEnd';

    public static R2: number = 2;
    public static R3: number = 3;
    public static R5: number = 5;
    public static R6: number = 6;
    public static R10: number = 10;
    public static R12: number = 12;

    public static RMask: number = 1;
    public static RMaskResult: number = 0;

    private legend: ILegend;

    private element: HTMLElement;
    private svgScrollable: Selection<any>;
    private axisGraphicsContext: Selection<any>;
    private axisGraphicsContextScrollable: Selection<any>;

    private svg: Selection<any>;

    private clearCatcher: Selection<any>;

    private data: EnhancedScatterChartData;

    private colorPalette: ISandboxExtendedColorPalette;

    private interactivityService: IInteractivityService<BaseDataPoint>;
    private eventService: IVisualEventService;
    private selectionManager: ISelectionManager;

    private visualHost: IVisualHost;

    private margin: IMargin;

    private viewport: IViewport = {
        width: 0,
        height: 0
    };

    private static getCustomSymbolType(shape: any): ShapeFunction {
        const customSymbolTypes = d3.map<ShapeFunction>({
            'circle': (size: number) => {
                const r: number = Math.sqrt(size / Math.PI);

                return `M0,${r}A${r},${r} 0 1,1 0,${-r}A${r},${r} 0 1,1 0,${r}Z`;
            },

            'cross': (size: number) => {
                const r: number = Math.sqrt(size / EnhancedScatterChart.R5) / EnhancedScatterChart.R2;

                return `M${-EnhancedScatterChart.R3 * r},${-r}H${-r}V${-EnhancedScatterChart.R3 * r}H${r}V${-r}H${EnhancedScatterChart.R3 * r}V${r}H${r}V${EnhancedScatterChart.R3 * r}H${-r}V${r}H${-EnhancedScatterChart.R3 * r}Z`;
            },

            'diamond': (size: number) => {
                const ry: number = Math.sqrt(size / (EnhancedScatterChart.R2 * Math.tan(Math.PI / EnhancedScatterChart.R6))),
                    rx: number = ry * Math.tan(Math.PI / EnhancedScatterChart.R6);

                return `M0,${-ry}L${rx},0 0,${ry} ${-rx},0Z`;
            },

            'square': (size: number) => {
                const r: number = Math.sqrt(size) / EnhancedScatterChart.R2;

                return `M${-r},${-r}L${r},${-r} ${r},${r} ${-r},${r}Z`;
            },

            'triangle-up': (size: number) => {
                const rx: number = Math.sqrt(size / Math.sqrt(EnhancedScatterChart.R3)),
                    ry: number = rx * Math.sqrt(EnhancedScatterChart.R3) / EnhancedScatterChart.R2;

                return `M0,${-ry}L${rx},${ry} ${-rx},${ry}Z`;
            },

            'triangle-down': (size: number) => {
                const rx: number = Math.sqrt(size / Math.sqrt(EnhancedScatterChart.R3)),
                    ry: number = rx * Math.sqrt(EnhancedScatterChart.R3) / EnhancedScatterChart.R2;

                return `M0,${ry}L${rx},${-ry} ${-rx},${-ry}Z`;
            },

            'star': (size: number) => {
                const outerRadius: number = Math.sqrt(size / EnhancedScatterChart.R2),
                    innerRadius: number = Math.sqrt(size / EnhancedScatterChart.R10),
                    angle: number = Math.PI / EnhancedScatterChart.R5;

                let results: string = '';
                for (let i: number = 0; i < EnhancedScatterChart.R10; i++) {
                    // Use outer or inner radius depending on what iteration we are in.
                    const r: number = (i & EnhancedScatterChart.RMask) === EnhancedScatterChart.RMaskResult ? outerRadius : innerRadius;
                    const currX: number = Math.cos(i * angle) * r,
                        currY: number = Math.sin(i * angle) * r;
                    // Our first time we simply append the coordinates, subsequet times we append a ", " to distinguish each coordinate pair.
                    if (i === 0) {
                        results = `M${currX},${currY}L`;
                    } else {
                        results += ` ${currX},${currY}`;
                    }
                }

                return `${results}Z`;
            },

            'hexagon': (size: number) => {
                const r: number = Math.sqrt(size / (EnhancedScatterChart.R6 * Math.sqrt(EnhancedScatterChart.R3))),
                    r2: number = Math.sqrt(size / (EnhancedScatterChart.R2 * Math.sqrt(EnhancedScatterChart.R3)));

                return `M0,${EnhancedScatterChart.R2 * r}L${-r2},${r} ${-r2},${-r} 0,${-EnhancedScatterChart.R2 * r} ${r2},${-r} ${r2},${r}Z`;
            },

            'x': (size: number) => {
                const r: number = Math.sqrt(size / EnhancedScatterChart.R10);

                return `M0,${r}L${-r},${EnhancedScatterChart.R2 * r} ${-EnhancedScatterChart.R2 * r},${r} ${-r},0 ${-EnhancedScatterChart.R2 * r},${-r} ${-r},${-EnhancedScatterChart.R2 * r} 0,${-r} ${r},${-EnhancedScatterChart.R2 * r} ${EnhancedScatterChart.R2 * r},${-r} ${r},0 ${EnhancedScatterChart.R2 * r},${r} ${r},${EnhancedScatterChart.R2 * r}Z`;
            },

            'uparrow': (size: number) => {
                const r: number = Math.sqrt(size / EnhancedScatterChart.R12);

                return `M${r},${EnhancedScatterChart.R3 * r}L${-r},${EnhancedScatterChart.R3 * r} ${-r},${-r} ${-EnhancedScatterChart.R2 * r},${-r} 0,${-EnhancedScatterChart.R3 * r} ${EnhancedScatterChart.R2 * r},${-r} ${r},${-r}Z`;
            },

            'downarrow': (size: number) => {
                const r: number = Math.sqrt(size / EnhancedScatterChart.R12);

                return `M0,${EnhancedScatterChart.R3 * r}L${(-EnhancedScatterChart.R2 * r)},${r} ${-r},${r} ${-r},${-EnhancedScatterChart.R3 * r} ${r},${-EnhancedScatterChart.R3 * r} ${r},${r} ${EnhancedScatterChart.R2 * r},${r}Z`;
            }
        });

        const defaultValue: ShapeFunction = customSymbolTypes.entries()[0].value;
        if (!shape) {
            return defaultValue;
        } else if (isNaN(shape)) {
            return customSymbolTypes[shape && shape.toString().toLowerCase()] || defaultValue;
        }
        const result: ShapeEntry = customSymbolTypes.entries()[Math.floor(shape)];

        return result ? result.value : defaultValue;
    }

    private static getDefinedNumberByCategoryId(column: DataViewValueColumn, index: number, valueTypeDescriptor: ValueTypeDescriptor): number {
        const columnValue = column.values[index];
        const isDate = valueTypeDescriptor && valueTypeDescriptor.dateTime;
        const value = isDate ? new Date(<any>columnValue) : columnValue;

        return column
        && column.values
        && !(columnValue === null)
        && !isNaN(<number>value)
            ? Number(value)
            : null;
    }

    constructor(options: VisualConstructorOptions) {
        if (window.location !== window.parent.location) {
            require('core-js/stable');
        }

        this.init(options);

    }

    public init(options: VisualConstructorOptions): void {
        this.element = options.element;
        this.visualHost = options.host;
        this.colorPalette = options.host.colorPalette;

        this.selectionManager = this.visualHost.createSelectionManager();
        this.eventService = options.host.eventService;

        this.margin = {
            top: EnhancedScatterChart.DefaultMarginValue,
            right: EnhancedScatterChart.DefaultMarginValue,
            bottom: EnhancedScatterChart.DefaultMarginValue,
            left: EnhancedScatterChart.DefaultMarginValue
        };

        this.svg = d3.select(this.element)
                     .append('svg')
                     .classed(EnhancedScatterChart.ClassName, true);

        this.axisGraphicsContext = this.svg
                                       .append('g')
                                       .classed(EnhancedScatterChart.AxisGraphicsContextClassName, true);

        this.svgScrollable = this.svg
                                 .append('svg')
                                 .classed(EnhancedScatterChart.SvgScrollableSelector.className, true);

        this.axisGraphicsContextScrollable = this.svgScrollable
                                                 .append('g')
                                                 .classed(EnhancedScatterChart.AxisGraphicsContextClassName, true);

        this.clearCatcher = appendClearCatcher(this.axisGraphicsContextScrollable);

        this.legend = createLegend(
            this.element,
            false,
            this.interactivityService,
            true,
            undefined,
            this.colorPalette.isHighContrast
                ? new OpacityLegendBehavior()
                : new LegendBehavior()
        );

    }

    public parseData(
        dataView: DataView,
        colorPalette: IColorPalette,
        visualHost: IVisualHost,
        interactivityService: IInteractivityService<BaseDataPoint>
    ): EnhancedScatterChartData {
        const settings: Settings = this.parseSettings(dataView, new ColorHelper(colorPalette));

        if (!this.isDataViewValid(dataView)) {
            return this.getDefaultData(settings);
        }

        let categoryValues: any[],
            categoryFormatter: IValueFormatter,
            categoryObjects: DataViewObjects[],
            dataViewCategorical: DataViewCategorical = dataView.categorical,
            categories: DataViewCategoryColumn[] = dataViewCategorical.categories || [],
            dataValues: DataViewValueColumns = dataViewCategorical.values,
            hasDynamicSeries: boolean = !!dataValues.source,
            grouped: DataViewValueColumnGroup[] = dataValues.grouped(),
            dvSource: DataViewMetadataColumn = dataValues.source,
            scatterMetadata: EnhancedScatterChartMeasureMetadata = EnhancedScatterChart.getMetadata(categories, grouped),
            categoryIndex: number = scatterMetadata.idx.category,
            useShape: boolean = scatterMetadata.idx.image >= EnhancedScatterChart.MinIndex,
            useCustomColor: boolean = scatterMetadata.idx.colorFill >= EnhancedScatterChart.MinIndex;

        if (dataViewCategorical.categories
            && dataViewCategorical.categories.length > 0
            && dataViewCategorical.categories[categoryIndex]
        ) {
            const mainCategory: DataViewCategoryColumn = dataViewCategorical.categories[categoryIndex];
            categoryValues = mainCategory.values;
            categoryFormatter = valueFormatter.create({
                format: valueFormatter.getFormatStringByColumn(mainCategory.source),
                value: categoryValues[0],
                value2: categoryValues[categoryValues.length - 1]
            });

            categoryObjects = mainCategory.objects;
        } else {
            categoryValues = [null];
            // creating default formatter for null value (to get the right string of empty value from the locale)
            categoryFormatter = valueFormatter.createDefaultFormatter(null);
        }

        const sizeRange: ValueRange<number> = EnhancedScatterChart.getSizeRangeForGroups(
            grouped,
            scatterMetadata.idx.size
        );

        settings.fillPoint.isHidden = !!(sizeRange && sizeRange.min);

        const colorHelper: ColorHelper = new ColorHelper(
            colorPalette,
            {
                objectName: 'dataPoint',
                propertyName: 'fill'
            },
            hasDynamicSeries
                ? undefined
                : settings.dataPoint.defaultColor
        );

        const dataPoints: EnhancedScatterChartDataPoint[] = this.createDataPoints(
            visualHost,
            dataValues,
            scatterMetadata,
            categories,
            categoryValues,
            categoryFormatter,
            categoryObjects,
            hasDynamicSeries,
            colorHelper,
            settings
        );

        if (interactivityService) {
            interactivityService.applySelectionStateToData(dataPoints);
        }

        const legendParseResult = this.parseLegend(visualHost, dataValues, dvSource, categories, categoryIndex, colorHelper, hasDynamicSeries);
        let legendDataPoints: LegendDataPoint[] = legendParseResult.legendDataPoints;
        let legendTitle: string = legendParseResult.legendTitle;

        this.changeSettingsAndMetadata(dataPoints, scatterMetadata, settings, legendTitle);
        const hasGradientRole: boolean = gradientUtils.hasGradientRole(dataViewCategorical);

        return {
            settings,
            dataPoints,
            legendDataPoints,
            sizeRange,
            hasGradientRole,
            hasDynamicSeries,
            useShape,
            useCustomColor,
            xCol: scatterMetadata.cols.x,
            yCol: scatterMetadata.cols.y,
            axesLabels: scatterMetadata.axesLabels,
            selectedIds: [],
            size: scatterMetadata.cols.size
        };
    }

    private changeSettingsAndMetadata(
        dataPoints: EnhancedScatterChartDataPoint[],
        scatterMetadata: EnhancedScatterChartMeasureMetadata,
        settings: Settings,
        legendTitle: string): void {

        settings.legend.titleText = settings.legend.titleText || legendTitle;
        if (!settings.categoryAxis.showAxisTitle) {
            scatterMetadata.axesLabels.x = null;
        }

        if (!settings.valueAxis.showAxisTitle) {
            scatterMetadata.axesLabels.y = null;
        }

        if (dataPoints && dataPoints[0]) {
            const dataPoint: EnhancedScatterChartDataPoint = dataPoints[0];

            if (dataPoint.backdrop != null) {
                settings.backdrop.show = true;
                settings.backdrop.url = dataPoint.backdrop;
            }

            if (dataPoint.xStart != null) {
                settings.categoryAxis.start = dataPoint.xStart;
            }

            if (dataPoint.xEnd != null) {
                settings.categoryAxis.end = dataPoint.xEnd;
            }

            if (dataPoint.yStart != null) {
                settings.valueAxis.start = dataPoint.yStart;
            }

            if (dataPoint.yEnd != null) {
                settings.valueAxis.end = dataPoint.yEnd;
            }
        }
    }

    private parseLegend(
        visualHost: IVisualHost,
        dataValues: DataViewValueColumns,
        dvSource: DataViewMetadataColumn,
        categories: DataViewCategoryColumn[],
        categoryIndex: number,
        colorHelper: ColorHelper,
        hasDynamicSeries: boolean): { legendDataPoints: LegendDataPoint[], legendTitle: string } {
        let legendDataPoints: LegendDataPoint[] = [];

        if (hasDynamicSeries) {
            const formatString: string = valueFormatter.getFormatStringByColumn(dvSource);

            legendDataPoints = EnhancedScatterChart.createSeriesLegend(
                visualHost,
                dataValues,
                formatString,
                colorHelper
            );
        }

        let legendTitle: string = dataValues && dvSource
            ? dvSource.displayName
            : EnhancedScatterChart.EmptyString;

        if (!legendTitle) {
            legendTitle = categories
            && categories[categoryIndex]
            && categories[categoryIndex].source
            && categories[categoryIndex].source.displayName
                ? categories[categoryIndex].source.displayName
                : EnhancedScatterChart.EmptyString;
        }

        return {
            legendDataPoints,
            legendTitle
        };
    }

    private isDataViewValid(dataView: DataView): boolean {
        return !!(dataView && dataView.metadata);
    }

    private parseSettings(dataView: DataView, colorHelper: ColorHelper): Settings {
        const settings: Settings = <Settings>Settings.parse(dataView);

        settings.dataPoint.defaultColor = colorHelper.getHighContrastColor(
            'foreground',
            settings.dataPoint.defaultColor
        );

        settings.dataPoint.strokeWidth = colorHelper.isHighContrast
            ? 2
            : settings.dataPoint.strokeWidth;

        settings.legend.labelColor = colorHelper.getHighContrastColor(
            'foreground',
            settings.legend.labelColor
        );

        settings.categoryLabels.show = settings.categoryLabels.show || colorHelper.isHighContrast;

        settings.categoryLabels.color = colorHelper.getHighContrastColor(
            'foreground',
            settings.categoryLabels.color
        );

        settings.fillPoint.show = colorHelper.isHighContrast
            ? true
            : settings.fillPoint.show;

        settings.outline.show = colorHelper.isHighContrast
            ? false
            : settings.outline.show;

        settings.crosshair.color = colorHelper.getHighContrastColor(
            'foreground',
            settings.crosshair.color
        );

        this.parseAxisSettings(settings.categoryAxis, colorHelper);
        this.parseAxisSettings(settings.valueAxis, colorHelper);

        settings.backdrop.show = settings.backdrop.show && !colorHelper.isHighContrast;

        return settings;
    }

    private parseAxisSettings(axisSettings: AxisSettings, colorHelper: ColorHelper): void {
        axisSettings.axisColor = colorHelper.getHighContrastColor(
            'foreground',
            axisSettings.axisColor
        );

        axisSettings.zeroLineColor = colorHelper.getHighContrastColor(
            'foreground',
            axisSettings.zeroLineColor
        );

        axisSettings.lineColor = colorHelper.getHighContrastColor(
            'foreground',
            axisSettings.lineColor
        );
    }

    private static createSeriesLegend(
        visualHost: IVisualHost,
        dataValues: DataViewValueColumns,
        formatString: string,
        colorHelper: ColorHelper
    ): LegendDataPoint[] {
        const legendItems: LegendDataPoint[] = [];

        const grouped: DataViewValueColumnGroup[] = dataValues.grouped();

        for (let i: number = 0, len: number = grouped.length; i < len; i++) {
            const grouping: DataViewValueColumnGroup = grouped[i];

            const color: string = colorHelper.getColorForSeriesValue(
                grouping.objects,
                grouping.name,
                'foreground'
            );

            const selectionId: ISelectionId = visualHost.createSelectionIdBuilder()
                                                        .withSeries(dataValues, grouping)
                                                        .createSelectionId();

            legendItems.push({
                color,
                label: valueFormatter.format(grouping.name, formatString),
                identity: selectionId,
                selected: EnhancedScatterChart.DefaultSelectionStateOfTheDataPoint
            });
        }

        return legendItems;
    }

    private static getSizeRangeForGroups(
        dataViewValueGroups: DataViewValueColumnGroup[],
        sizeColumnIndex: number
    ): NumberRange {

        const result: NumberRange = {};

        if (dataViewValueGroups) {
            dataViewValueGroups.forEach((group) => {
                const sizeColumn: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
                    sizeColumnIndex,
                    group.values);

                const currentRange: NumberRange = axis.getRangeForColumn(sizeColumn);

                if (result.min == null || result.min > currentRange.min) {
                    result.min = currentRange.min;
                }

                if (result.max == null || result.max < currentRange.max) {
                    result.max = currentRange.max;
                }
            });
        }

        return result;
    }

    private static getMetadata(
        categories: DataViewCategoryColumn[],
        grouped: DataViewValueColumnGroup[]
    ): EnhancedScatterChartMeasureMetadata {
        let categoryIndex: number = getCategoryIndexOfRole(categories, EnhancedScatterChart.ColumnCategory),
            colorFillIndex: number = getCategoryIndexOfRole(categories, EnhancedScatterChart.ColumnColorFill),
            imageIndex: number = getCategoryIndexOfRole(categories, EnhancedScatterChart.ColumnImage),
            backdropIndex: number = getCategoryIndexOfRole(categories, EnhancedScatterChart.ColumnBackdrop),
            xIndex: number = getMeasureIndexOfRole(grouped, EnhancedScatterChart.ColumnX),
            yIndex: number = getMeasureIndexOfRole(grouped, EnhancedScatterChart.ColumnY),
            sizeIndex: number = getMeasureIndexOfRole(grouped, EnhancedScatterChart.ColumnSize),
            shapeIndex: number = getMeasureIndexOfRole(grouped, EnhancedScatterChart.ColumnShape),
            rotationIndex: number = getMeasureIndexOfRole(grouped, EnhancedScatterChart.ColumnRotation),
            xStartIndex: number = getMeasureIndexOfRole(grouped, EnhancedScatterChart.ColumnXStart),
            xEndIndex: number = getMeasureIndexOfRole(grouped, EnhancedScatterChart.ColumnXEnd),
            yStartIndex: number = getMeasureIndexOfRole(grouped, EnhancedScatterChart.ColumnYStart),
            yEndIndex: number = getMeasureIndexOfRole(grouped, EnhancedScatterChart.ColumnYEnd),
            xCol: DataViewMetadataColumn,
            yCol: DataViewMetadataColumn,
            sizeCol: DataViewMetadataColumn,
            xAxisLabel: string = EnhancedScatterChart.EmptyString,
            yAxisLabel: string = EnhancedScatterChart.EmptyString;

        if (grouped && grouped.length) {
            const firstGroup: DataViewValueColumnGroup = grouped[0];

            if (xIndex >= 0) {
                xCol = firstGroup.values[xIndex].source;
                xAxisLabel = firstGroup.values[xIndex].source.displayName;
            }

            if (yIndex >= 0) {
                yCol = firstGroup.values[yIndex].source;
                yAxisLabel = firstGroup.values[yIndex].source.displayName;
            }

            if (sizeIndex >= 0) {
                sizeCol = firstGroup.values[sizeIndex].source;
            }
        }

        return {
            idx: {
                category: categoryIndex,
                x: xIndex,
                y: yIndex,
                size: sizeIndex,
                colorFill: colorFillIndex,
                shape: shapeIndex,
                image: imageIndex,
                rotation: rotationIndex,
                backdrop: backdropIndex,
                xStart: xStartIndex,
                xEnd: xEndIndex,
                yStart: yStartIndex,
                yEnd: yEndIndex
            },
            cols: {
                x: xCol,
                y: yCol,
                size: sizeCol
            },
            axesLabels: {
                x: xAxisLabel,
                y: yAxisLabel
            }
        };
    }

    public static CREATE_LAZY_FORMATTED_CATEGORY(formatter: IValueFormatter, value: string): () => string {
        return () => formatter.format(value);
    }

    public static displayTimestamp = (
        timestamp: number
    ): string => {
        const value = new Date(timestamp);
        return valueFormatter.format(value, 'dd MMM yyyy');
    };

    public static IS_DATE_TYPE_COLUMN(
        source: DataViewMetadataColumn
    ): boolean {
        return (source && source.type && source.type.dateTime);
    }

    private calculateMeasures(
        seriesValues: DataViewValueColumn[],
        indicies: EnhancedScatterChartMeasureMetadataIndexes,
        categories: DataViewCategoryColumn[]): { [propertyName: string]: DataViewValueColumn } {
        const measureX: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
            indicies.x,
            seriesValues
        );

        const measureY: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
            indicies.y,
            seriesValues
        );

        const measureSize: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
            indicies.size,
            seriesValues
        );

        const measureShape: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
            indicies.shape,
            seriesValues
        );

        const measureRotation: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
            indicies.rotation,
            seriesValues
        );

        const measureXStart: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
            indicies.xStart,
            seriesValues
        );

        const measureXEnd: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
            indicies.xEnd,
            seriesValues
        );

        const measureYStart: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
            indicies.yStart,
            seriesValues
        );

        const measureYEnd: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
            indicies.yEnd,
            seriesValues
        );

        return {
            measureX,
            measureY,
            measureSize,
            measureShape,
            measureRotation,
            measureXStart,
            measureXEnd,
            measureYStart,
            measureYEnd,
            measureColorFill: categories[indicies.colorFill],
            measureImage: categories[indicies.image],
            measureBackdrop: categories[indicies.backdrop]
        };
    }

    private changeSeriesData(
        measures: { [propertyName: string]: DataViewValueColumn },
        seriesData: tooltipBuilder.TooltipSeriesDataItem[],
        xVal: PrimitiveValue,
        yVal: PrimitiveValue,
        categoryIdx: number) {
        if (measures.measureX) {
            seriesData.push({
                value: EnhancedScatterChart.IS_DATE_TYPE_COLUMN(measures.measureX.source)
                    ? EnhancedScatterChart.displayTimestamp(<number>xVal)
                    : xVal,
                metadata: measures.measureX
            });
        }

        if (measures.measureY) {
            seriesData.push({
                value: EnhancedScatterChart.IS_DATE_TYPE_COLUMN(measures.measureY.source)
                    ? EnhancedScatterChart.displayTimestamp(<number>yVal)
                    : yVal,
                metadata: measures.measureY
            });
        }

        if (measures.measureSize && measures.measureSize.values
            && measures.measureSize.values.length > EnhancedScatterChart.MinAmountOfValues) {
            seriesData.push({
                value: measures.measureSize.values[categoryIdx],
                metadata: measures.measureSize
            });
        }

        if (measures.measureColorFill && measures.measureColorFill.values
            && measures.measureColorFill.values.length > EnhancedScatterChart.MinAmountOfValues) {
            seriesData.push({
                value: measures.measureColorFill.values[categoryIdx],
                metadata: measures.measureColorFill
            });
        }

        if (measures.measureShape && measures.measureShape.values
            && measures.measureShape.values.length > EnhancedScatterChart.MinAmountOfValues) {

            seriesData.push({
                value: measures.measureShape.values[categoryIdx],
                metadata: measures.measureShape
            });
        }

        if (measures.measureImage && measures.measureImage.values
            && measures.measureImage.values.length > EnhancedScatterChart.MinAmountOfValues) {
            seriesData.push({
                value: measures.measureImage.values[categoryIdx],
                metadata: measures.measureImage
            });
        }

        if (measures.measureRotation && measures.measureRotation.values
            && measures.measureRotation.values.length > EnhancedScatterChart.MinAmountOfValues) {
            seriesData.push({
                value: measures.measureRotation.values[categoryIdx],
                metadata: measures.measureRotation
            });
        }

        if (measures.measureBackdrop && measures.measureBackdrop.values
            && measures.measureBackdrop.values.length > EnhancedScatterChart.MinAmountOfValues) {
            seriesData.push({
                value: measures.measureBackdrop.values[categoryIdx],
                metadata: measures.measureBackdrop
            });
        }

        if (measures.measureXStart && measures.measureXStart.values
            && measures.measureXStart.values.length > EnhancedScatterChart.MinAmountOfValues) {
            seriesData.push({
                value: measures.measureXStart.values[categoryIdx],
                metadata: measures.measureXStart
            });
        }

        if (measures.measureXEnd && measures.measureXEnd.values
            && measures.measureXEnd.values.length > EnhancedScatterChart.MinAmountOfValues) {
            seriesData.push({
                value: measures.measureXEnd.values[categoryIdx],
                metadata: measures.measureXEnd
            });
        }

        if (measures.measureYStart && measures.measureYStart.values
            && measures.measureYStart.values.length > EnhancedScatterChart.MinAmountOfValues) {
            seriesData.push({
                value: measures.measureYStart.values[categoryIdx],
                metadata: measures.measureYStart
            });
        }

        if (measures.measureYEnd && measures.measureYEnd.values
            && measures.measureYEnd.values.length > EnhancedScatterChart.MinAmountOfValues) {
            seriesData.push({
                value: measures.measureYEnd.values[categoryIdx],
                metadata: measures.measureYEnd
            });
        }
    }

    private getValuesFromDataViewValueColumnById(measures, categoryIdx: number): { [property: string]: any } {
        const size: number = EnhancedScatterChart.getValueFromDataViewValueColumnById(measures.measureSize, categoryIdx);
        const colorFill: string = EnhancedScatterChart.getValueFromDataViewValueColumnById(measures.measureColorFill, categoryIdx);

        const shapeSymbolType: ShapeFunction = EnhancedScatterChart.getCustomSymbolType(
            EnhancedScatterChart.getValueFromDataViewValueColumnById(measures.measureShape, categoryIdx));

        const image: string = EnhancedScatterChart.getValueFromDataViewValueColumnById(measures.measureImage, categoryIdx);
        const rotation: number = EnhancedScatterChart.getNumberFromDataViewValueColumnById(measures.measureRotation, categoryIdx);
        const backdrop: string = EnhancedScatterChart.getValueFromDataViewValueColumnById(measures.measureBackdrop, categoryIdx);
        const xStart: number = EnhancedScatterChart.getValueFromDataViewValueColumnById(measures.measureXStart, categoryIdx);
        const xEnd: number = EnhancedScatterChart.getValueFromDataViewValueColumnById(measures.measureXEnd, categoryIdx);
        const yStart: number = EnhancedScatterChart.getValueFromDataViewValueColumnById(measures.measureYStart, categoryIdx);
        const yEnd: number = EnhancedScatterChart.getValueFromDataViewValueColumnById(measures.measureYEnd, categoryIdx);

        return {
            size,
            colorFill,
            shapeSymbolType,
            image,
            rotation,
            backdrop,
            xStart,
            xEnd,
            yStart,
            yEnd
        };
    }

    private createDataPoints(
        visualHost: IVisualHost,
        dataValues: DataViewValueColumns,
        metadata: EnhancedScatterChartMeasureMetadata,
        categories: DataViewCategoryColumn[],
        categoryValues: any[],
        categoryFormatter: IValueFormatter,
        categoryObjects: DataViewObjects[],
        hasDynamicSeries: boolean,
        colorHelper: ColorHelper,
        settings: Settings
    ): EnhancedScatterChartDataPoint[] {
        const dataPoints: EnhancedScatterChartDataPoint[] = [];
        const indicies: EnhancedScatterChartMeasureMetadataIndexes = metadata.idx;
        const dataValueSource: DataViewMetadataColumn = dataValues.source;
        const grouped: DataViewValueColumnGroup[] = dataValues.grouped();

        for (let categoryIdx: number = 0, ilen: number = categoryValues.length; categoryIdx < ilen; categoryIdx++) {
            const categoryValue: any = categoryValues[categoryIdx];

            for (let seriesIdx: number = 0, len: number = grouped.length; seriesIdx < len; seriesIdx++) {
                const grouping: DataViewValueColumnGroup = grouped[seriesIdx];
                const seriesValues: DataViewValueColumn[] = grouping.values;
                let measures: { [propertyName: string]: DataViewValueColumn } = this.calculateMeasures(seriesValues, indicies, categories);

                // TO BE CHANGED: need to update (refactor) these lines below.
                const xVal: PrimitiveValue = EnhancedScatterChart.getDefinedNumberByCategoryId(measures.measureX, categoryIdx, metadata.cols.x.type);
                const yVal: PrimitiveValue = EnhancedScatterChart.getDefinedNumberByCategoryId(measures.measureY, categoryIdx, metadata.cols.y.type);
                const hasNullValue: boolean = (xVal == null) || (yVal == null);

                if (hasNullValue) {
                    continue;
                }

                const {size, colorFill, shapeSymbolType, image, rotation, backdrop, xStart, xEnd, yStart, yEnd} =
                    this.getValuesFromDataViewValueColumnById(measures, categoryIdx);
                const parsedColorFill: string = colorFill
                    ? colorHelper.getHighContrastColor('foreground', d3.rgb(colorFill).toString())
                    : undefined;

                let color: string;
                if (hasDynamicSeries) {
                    color = colorHelper.getColorForSeriesValue(grouping.objects, grouping.name, 'foreground');
                } else {
                    // If we have no Size measure then use a blank query name
                    const measureSource: string = measures.measureSize != null
                        ? measures.measureSize.source.queryName
                        : EnhancedScatterChart.EmptyString;

                    color = colorHelper.getColorForMeasure(categoryObjects && categoryObjects[categoryIdx], measureSource, 'foreground');
                }

                let category: DataViewCategoryColumn = categories && categories.length > EnhancedScatterChart.MinAmountOfCategories
                    ? categories[indicies.category]
                    : null;
                const identity: ISelectionId = visualHost.createSelectionIdBuilder()
                                                         .withCategory(category, categoryIdx)
                                                         .withSeries(dataValues, grouping)
                                                         .createSelectionId();

                // TO BE CHANGED: need to refactor these lines below.
                const seriesData: tooltipBuilder.TooltipSeriesDataItem[] = [];
                if (dataValueSource) {
                    // Dynamic series
                    seriesData.push({
                        value: grouping.name,
                        metadata: {
                            source: dataValueSource,
                            values: []
                        }
                    });
                }

                this.changeSeriesData(measures, seriesData, xVal, yVal, categoryIdx);

                const tooltipInfo: VisualTooltipDataItem[] = tooltipBuilder.createTooltipInfo(
                    categoryValue,
                    category ? [category] : undefined,
                    seriesData
                );
                const currentFill: string = parsedColorFill || color;
                const stroke: string = settings.outline.show ? d3.rgb(currentFill).darker().toString() : currentFill;
                const fill: string = settings.fillPoint.show || settings.fillPoint.isHidden ? currentFill : null;

                dataPoints.push({
                    size,
                    rotation,
                    backdrop,
                    xStart,
                    xEnd,
                    fill,
                    stroke,
                    yStart,
                    yEnd,
                    identity,
                    shapeSymbolType,
                    tooltipInfo,
                    x: xVal,
                    y: yVal,
                    radius: {
                        sizeMeasure: measures.measureSize,
                        index: categoryIdx
                    },
                    strokeWidth: settings.dataPoint.strokeWidth,
                    formattedCategory: EnhancedScatterChart.CREATE_LAZY_FORMATTED_CATEGORY(categoryFormatter, categoryValue),
                    selected: EnhancedScatterChart.DefaultSelectionStateOfTheDataPoint,
                    contentPosition: EnhancedScatterChart.DefaultContentPosition,
                    svgurl: image
                });
            }
        }

        return dataPoints;
    }

    private static getMeasureValue(
        measureIndex: number,
        seriesValues: DataViewValueColumn[]
    ): DataViewValueColumn {
        if (seriesValues && measureIndex >= EnhancedScatterChart.MinIndex) {
            return seriesValues[measureIndex];
        }

        return null;
    }

    private static getNumberFromDataViewValueColumnById(
        dataViewValueColumn: DataViewCategoryColumn | DataViewValueColumn,
        index: number
    ): number {
        const value: number = EnhancedScatterChart.getValueFromDataViewValueColumnById(
            dataViewValueColumn,
            index
        );

        return value && !isNaN(value)
            ? value
            : EnhancedScatterChart.DefaultColumnId;
    }

    private static getValueFromDataViewValueColumnById(
        dataViewValueColumn: DataViewCategoryColumn | DataViewValueColumn,
        index: number
    ): any {

        return dataViewValueColumn && dataViewValueColumn.values
            ? dataViewValueColumn.values[index]
            : null;
    }

    private getDefaultData(settings?: Settings): EnhancedScatterChartData {
        return {
            settings,
            xCol: undefined,
            yCol: undefined,
            dataPoints: [],
            legendDataPoints: [],
            axesLabels: {
                x: EnhancedScatterChart.EmptyString,
                y: EnhancedScatterChart.EmptyString
            },
            selectedIds: [],
            sizeRange: undefined,
            hasDynamicSeries: false,
            useShape: false,
            useCustomColor: false
        };
    }

    public update(options: VisualUpdateOptions) {
        const dataView: DataView = options
            && options.dataViews
            && options.dataViews[0];

        this.viewport = options && options.viewport
            ? {...options.viewport}
            : {
                width: 0,
                height: 0
            };

        this.data = this.parseData(
            dataView,
            this.colorPalette,
            this.visualHost,
            this.interactivityService
        );

        this.eventService.renderingStarted(options);
        this.renderLegend();

        // this.render();

        this.eventService.renderingFinished(options);
    }

    private renderLegend(): void {
        const legendSettings: LegendSettings = this.data.settings.legend;

        const legendDataPoints = this.data.legendDataPoints;

        const isLegendShown: boolean = legendSettings.show
            && legendDataPoints.length > EnhancedScatterChart.MinAmountOfDataPointsInTheLegend;

        const legendData: LegendData = {
            title: legendSettings.showTitle
                ? legendSettings.titleText
                : undefined,
            dataPoints: isLegendShown
                ? legendDataPoints
                : [],
            fontSize: legendSettings.fontSize,
            labelColor: legendSettings.labelColor
        };

        const legend: ILegend = this.legend;

        legend.changeOrientation(LegendPosition[legendSettings.position]);

        legend.drawLegend(legendData, {
            height: this.viewport.height,
            width: this.viewport.width
        });

        legendModule.positionChartArea(this.svg, legend);
    }

    /**
     * Public for testability.
     */
    public optimizeTranslateValues(values: number[]): number[] {
        if (values && values.map) {
            return values.map((value: number) => {
                return this.optimizeTranslateValue(value);
            });
        }

        return values;
    }

    /**
     * Public for testability.
     */
    public optimizeTranslateValue(value: number): number {
        if (value) {
            const numberSign: number = value >= EnhancedScatterChart.NumberSignZero
                ? EnhancedScatterChart.NumberSignPositive
                : -EnhancedScatterChart.NumberSignPositive;

            const absoluteValue: number = Math.abs(value);

            if (absoluteValue > EnhancedScatterChart.MaxTranslateValue) {
                return EnhancedScatterChart.MaxTranslateValue * numberSign;
            } else if (absoluteValue < EnhancedScatterChart.MinTranslateValue) {
                return EnhancedScatterChart.MinTranslateValue * numberSign;
            }
        }

        return value;
    }

    private enumerateDataPoints(
        instances: VisualObjectInstance[],
        dataPointSettings: DataPointSettings
    ): VisualObjectInstance[] {
        if (!this.data) {
            return instances;
        }

        if (this.data.hasDynamicSeries) {
            return this.data.legendDataPoints.map((legendDataPoint: LegendDataPoint) => {
                return {
                    objectName: 'dataPoint',
                    displayName: legendDataPoint.label,
                    selector: ColorHelper.normalizeSelector((<ISelectionId>legendDataPoint.identity).getSelector()),
                    properties: {
                        fill: {solid: {color: legendDataPoint.color}}
                    }
                };
            });
        }

        if (!dataPointSettings.showAllDataPoints) {
            return instances;
        }

        const dataPointInstances: VisualObjectInstance[] = this.data.dataPoints
                                                               .map((seriesDataPoints: EnhancedScatterChartDataPoint) => {
                                                                   return {
                                                                       objectName: 'dataPoint',
                                                                       displayName: seriesDataPoints.formattedCategory(),
                                                                       selector: ColorHelper.normalizeSelector(
                                                                           (<ISelectionId>seriesDataPoints.identity).getSelector(),
                                                                           true
                                                                       ),
                                                                       properties: {
                                                                           fill: {solid: {color: seriesDataPoints.fill}}
                                                                       }
                                                                   };
                                                               });

        return instances.concat(dataPointInstances);
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        const settings: Settings = this.data && this.data.settings || new Settings();

        const instances: VisualObjectInstance[] = (<VisualObjectInstanceEnumerationObject>Settings.enumerateObjectInstances(
            settings,
            options
        )).instances || [];

        switch (options.objectName) {
            case 'dataPoint': {

                if (this.data && this.data.hasGradientRole) {
                    return [];

                }

                return this.enumerateDataPoints(instances, settings.dataPoint);
            }
            case 'fillPoint': {
                if (settings.fillPoint.isHidden) {
                    return [];
                }

                break;
            }
            case 'legend': {
                if (!this.data || !this.data.hasDynamicSeries) {
                    return [];
                }

                break;
            }
        }

        return instances;
    }
}
