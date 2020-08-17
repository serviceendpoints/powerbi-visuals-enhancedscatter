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

// powerbi
import DataView = powerbiVisualsApi.DataView;
import IViewport = powerbiVisualsApi.IViewport;
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

// powerbi.visuals
import ISelectionId = powerbiVisualsApi.visuals.ISelectionId;

import IVisual = powerbiVisualsApi.extensibility.IVisual;
import IVisualHost = powerbiVisualsApi.extensibility.visual.IVisualHost;
import VisualUpdateOptions = powerbiVisualsApi.extensibility.visual.VisualUpdateOptions;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;

// powerbi.extensibility.utils.dataview
import {dataRoleHelper as DataRoleHelper} from 'powerbi-visuals-utils-dataviewutils';
import getCategoryIndexOfRole = DataRoleHelper.getCategoryIndexOfRole;

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

// powerbi.extensibility.utils.formatting
import {valueFormatter} from 'powerbi-visuals-utils-formattingutils';
import IValueFormatter = valueFormatter.IValueFormatter;

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

export class EnhancedScatterChart implements IVisual {

    private static MinAmountOfCategories: number = 0;

    private static EmptyString: string = '';

    private static DefaultSelectionStateOfTheDataPoint: boolean = false;

    private static MinAmountOfDataPointsInTheLegend: number = 1;

    private static NumberSignZero: number = 0;
    private static NumberSignPositive: number = 1;

    public static MaxTranslateValue: number = 1e+25;
    public static MinTranslateValue: number = 1e-25;

    public static ColumnCategory: string = 'Category';

    private legend: ILegend;

    private element: HTMLElement;

    private data: EnhancedScatterChartData;

    private colorPalette: ISandboxExtendedColorPalette;

    private eventService: IVisualEventService;

    private visualHost: IVisualHost;

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

        this.eventService = options.host.eventService;

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
            dataViewCategorical: DataViewCategorical = dataView.categorical,
            categories: DataViewCategoryColumn[] = dataViewCategorical.categories || [],
            dataValues: DataViewValueColumns = dataViewCategorical.values,
            hasDynamicSeries: boolean = !!dataValues.source,
            dvSource: DataViewMetadataColumn = dataValues.source,
            scatterMetadata: EnhancedScatterChartMeasureMetadata = EnhancedScatterChart.getMetadata(categories),
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
            hasGradientRole,
            hasDynamicSeries
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
        categories: DataViewCategoryColumn[]
    ): EnhancedScatterChartMeasureMetadata {
        let categoryIndex: number = getCategoryIndexOfRole(categories, EnhancedScatterChart.ColumnCategory);

        return {
            idx: {
                category: categoryIndex
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
            dataPoints: [],
            legendDataPoints: [],
            hasDynamicSeries: false
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

        legendModule.positionChartArea(null, legend);
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
