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

import powerbiVisualsApi from 'powerbi-visuals-api';

// d3
type Selection<T1, T2 = T1> = d3.Selection<any, T1, any, T2>;

// powerbi
import DataView = powerbiVisualsApi.DataView;
import IViewport = powerbiVisualsApi.IViewport;
import DataViewObjects = powerbiVisualsApi.DataViewObjects;
import DataViewCategorical = powerbiVisualsApi.DataViewCategorical;
import DataViewValueColumns = powerbiVisualsApi.DataViewValueColumns;
import DataViewMetadataColumn = powerbiVisualsApi.DataViewMetadataColumn;
import DataViewValueColumnGroup = powerbiVisualsApi.DataViewValueColumnGroup;
import VisualObjectInstance = powerbiVisualsApi.VisualObjectInstance;
import DataViewCategoryColumn = powerbiVisualsApi.DataViewCategoryColumn;
import VisualObjectInstanceEnumeration = powerbiVisualsApi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbiVisualsApi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumerationObject = powerbiVisualsApi.VisualObjectInstanceEnumerationObject;

import IColorPalette = powerbiVisualsApi.extensibility.IColorPalette;
import ISandboxExtendedColorPalette = powerbiVisualsApi.extensibility.ISandboxExtendedColorPalette;
import IVisualEventService = powerbiVisualsApi.extensibility.IVisualEventService;
import ISelectionManager = powerbiVisualsApi.extensibility.ISelectionManager;

// powerbi.visuals
import ISelectionId = powerbiVisualsApi.visuals.ISelectionId;

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
import ClassAndSelector = SVGUtil.CssConstants.ClassAndSelector;
import createClassAndSelector = SVGUtil.CssConstants.createClassAndSelector;

// powerbi.extensibility.utils.chart
import {
    legend as legendModule,
    legendInterfaces,
    OpacityLegendBehavior,
    legendBehavior
} from 'powerbi-visuals-utils-chartutils';
import ILegend = legendInterfaces.ILegend;
import LegendPosition = legendInterfaces.LegendPosition;
import LegendData = legendInterfaces.LegendData;
import LegendDataPoint = legendInterfaces.LegendDataPoint;
import LegendBehavior = legendBehavior.LegendBehavior;
import createLegend = legendModule.createLegend;

// powerbi.extensibility.utils.interactivity
import {
    interactivityBaseService as interactivityService,
    interactivitySelectionService
} from 'powerbi-visuals-utils-interactivityutils';
import IInteractivityService = interactivityService.IInteractivityService;

// powerbi.extensibility.utils.formatting
import {textMeasurementService as tms, valueFormatter} from 'powerbi-visuals-utils-formattingutils';
import IValueFormatter = valueFormatter.IValueFormatter;
import textMeasurementService = tms.textMeasurementService;

// powerbi.extensibility.utils.color
import {ColorHelper} from 'powerbi-visuals-utils-colorutils';

import {DataPointSettings, LegendSettings, Settings} from './settings';
import {
    EnhancedScatterChartData,
    EnhancedScatterChartDataPoint,
    EnhancedScatterChartMeasureMetadata,
    EnhancedScatterChartMeasureMetadataIndexes
}                                                    from './dataInterfaces';
import * as gradientUtils                            from './gradientUtils';
import {BaseDataPoint}                               from 'powerbi-visuals-utils-interactivityutils/lib/interactivityBaseService';

export class EnhancedScatterChart implements IVisual {

    private static AxisGraphicsContextClassName: string = 'axisGraphicsContext';
    private static ClassName: string = 'enhancedScatterChart';

    private static MinAmountOfCategories: number = 0;

    private static EmptyString: string = '';

    private static DefaultSelectionStateOfTheDataPoint: boolean = false;

    private static MinAmountOfDataPointsInTheLegend: number = 1;

    private static DefaultMarginValue: number = 1;

    public static SvgScrollableSelector: ClassAndSelector = createClassAndSelector('svgScrollable');

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

    private legend: ILegend;

    private element: HTMLElement;
    private svgScrollable: Selection<any>;
    private axisGraphicsContext: Selection<any>;
    private axisGraphicsContextScrollable: Selection<any>;

    private svg: Selection<any>;

    private data: EnhancedScatterChartData;

    private colorPalette: ISandboxExtendedColorPalette;

    private eventService: IVisualEventService;
    private selectionManager: ISelectionManager;

    private visualHost: IVisualHost;

    private margin: IMargin;

    private viewport: IViewport = {
        width: 0,
        height: 0
    };

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

        this.legend = createLegend(
            this.element,
            false,
            undefined,
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
        visualHost: IVisualHost
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
            categoryIndex: number = scatterMetadata.idx.category;

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

        const legendParseResult = this.parseLegend(visualHost, dataValues, dvSource, categories, categoryIndex, colorHelper, hasDynamicSeries);
        let legendDataPoints: LegendDataPoint[] = legendParseResult.legendDataPoints;
        let legendTitle: string = legendParseResult.legendTitle;

        this.changeSettingsAndMetadata(settings, legendTitle);
        const hasGradientRole: boolean = gradientUtils.hasGradientRole(dataViewCategorical);

        return {
            settings,
            dataPoints,
            legendDataPoints,
            sizeRange: undefined,
            hasGradientRole,
            hasDynamicSeries,
            useShape: undefined,
            useCustomColor: undefined,
            xCol: scatterMetadata.cols.x,
            yCol: scatterMetadata.cols.y,
            axesLabels: scatterMetadata.axesLabels,
            selectedIds: [],
            size: scatterMetadata.cols.size
        };
    }

    private changeSettingsAndMetadata(
        settings: Settings,
        legendTitle: string): void {

        settings.legend.titleText = settings.legend.titleText || legendTitle;

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

        settings.legend.labelColor = colorHelper.getHighContrastColor(
            'foreground',
            settings.legend.labelColor
        );

        return settings;
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
                x: xIndex
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
        const grouped: DataViewValueColumnGroup[] = dataValues.grouped();

        for (let categoryIdx: number = 0, ilen: number = categoryValues.length; categoryIdx < ilen; categoryIdx++) {
            const categoryValue: any = categoryValues[categoryIdx];

            for (let seriesIdx: number = 0, len: number = grouped.length; seriesIdx < len; seriesIdx++) {
                const grouping: DataViewValueColumnGroup = grouped[seriesIdx];

                const colorFill = null;
                const parsedColorFill: string = colorFill
                    ? colorHelper.getHighContrastColor('foreground', d3.rgb(colorFill).toString())
                    : undefined;

                let color: string;
                if (hasDynamicSeries) {
                    color = colorHelper.getColorForSeriesValue(grouping.objects, grouping.name, 'foreground');
                } else {
                    throw new Error('to be handle later');
                }

                let category: DataViewCategoryColumn = categories && categories.length > EnhancedScatterChart.MinAmountOfCategories
                    ? categories[indicies.category]
                    : null;
                const identity: ISelectionId = visualHost.createSelectionIdBuilder()
                                                         .withCategory(category, categoryIdx)
                                                         .withSeries(dataValues, grouping)
                                                         .createSelectionId();
                debugger;
                const currentFill: string = parsedColorFill || color;
                const fill: string = settings.fillPoint.show || settings.fillPoint.isHidden ? currentFill : null;

                dataPoints.push({
                    fill,
                    identity,
                    formattedCategory: EnhancedScatterChart.CREATE_LAZY_FORMATTED_CATEGORY(categoryFormatter, categoryValue),
                    selected: EnhancedScatterChart.DefaultSelectionStateOfTheDataPoint
                });
            }
        }

        return dataPoints;
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
            this.visualHost
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
