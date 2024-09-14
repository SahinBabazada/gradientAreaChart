"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
import NumUpDown = formattingSettings.NumUpDown;

const DisplayUnits = [
    {
        displayName: "Auto",
        value: 0
    },
    {
        displayName: "Thousands",
        value: 1000
    },
    {
        displayName: "Millions",
        value: 1000000
    },
    {
        displayName: "Billions",
        value: 1000000000
    },
    {
        displayName: "Trillions",
        value: 1000000000000
    }
];

// Y Axis Settings
class yAxisSettings extends FormattingSettingsCard {

    minRange = new NumUpDown({
        name: "minRange",
        displayName: "Minimum Range",
        value: null  // Null for auto
    });

    maxRange = new NumUpDown({
        name: "maxRange",
        displayName: "Maximum Range",
        value: null  // Null for auto
    });

    yAxisDisplayUnits = new formattingSettings.ItemDropdown({
        name: "yAxisDisplayUnits",
        displayName: "Display Units",
        items: DisplayUnits,
        value: DisplayUnits[0]
    });

    yAxisDecimalPlaces = new NumUpDown({
        name: "yAxisDecimalPlaces",
        displayName: "Decimal Places",
        value: 2  // Default decimal places
    });

    showYAxis = new formattingSettings.ToggleSwitch({
        name: "showYAxis",
        displayName: "Show Y Axis",
        value: true
    });

    yAxisFontSize = new NumUpDown({
        name: "yAxisFontSize",
        displayName: "Font Size",
        value: 12
    });

    name: string = "yAxisSettings";
    displayName: string = "Y Axis";
    slices: Array<FormattingSettingsSlice> = [
        this.minRange,
        this.maxRange,
        this.yAxisDisplayUnits,
        this.yAxisDecimalPlaces,
        this.showYAxis,
        this.yAxisFontSize
    ];
}

// Data Point and Gradient Settings
class generalSettings extends FormattingSettingsCard {
    defaultColor = new formattingSettings.ColorPicker({
        name: "defaultColor",
        displayName: "Default Color",
        value: { value: "" }
    });

    showAllDataPoints = new formattingSettings.ToggleSwitch({
        name: "showAllDataPoints",
        displayName: "Show All Data Points",
        value: true
    });

    // Font size for labels
    fontSize = new NumUpDown({
        name: "fontSize",
        displayName: "Text Size",
        value: 12
    });

    // Smooth line toggle
    smoothLine = new formattingSettings.ToggleSwitch({
        name: "smoothLine",
        displayName: "Smooth Line",
        value: false
    });

    // Marker settings
    showMarkers = new formattingSettings.ToggleSwitch({
        name: "showMarkers",
        displayName: "Show Markers",
        value: true
    });

    markerSize = new NumUpDown({
        name: "markerSize",
        displayName: "Marker Size",
        value: 4
    });

    // Gradient Settings
    gradientStartColor = new formattingSettings.ColorPicker({
        name: "gradientStartColor",
        displayName: "Gradient Start Color",
        value: { value: "#0078d7" } // Default start color
    });

    gradientEndColor = new formattingSettings.ColorPicker({
        name: "gradientEndColor",
        displayName: "Gradient End Color",
        value: { value: "#ffffff" } // Default end color
    });

    name: string = "generalSettings";
    displayName: string = "Data Point and Gradient Settings";
    slices: Array<FormattingSettingsSlice> = [
        this.defaultColor,
        this.showAllDataPoints,
        this.fontSize,
        this.smoothLine,
        this.showMarkers,
        this.markerSize,
        this.gradientStartColor,
        this.gradientEndColor
    ];
}

class xAxisSettings extends FormattingSettingsCard {
    showXAxis = new formattingSettings.ToggleSwitch({
        name: "showXAxis",
        displayName: "Show X Axis",
        value: true
    });

    xAxisFontSize = new NumUpDown({
        name: "xAxisFontSize",
        displayName: "X Axis Font Size",
        value: 12
    });
    name: string = "xAxisSettings";
    displayName: string = "X Axis";
    slices: Array<FormattingSettingsSlice> = [
        this.showXAxis,
        this.xAxisFontSize
    ];
}

// Visual formatting settings model class
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    public generalSettings: generalSettings;
    public yAxisSettings: yAxisSettings;
    public xAxisSettings: xAxisSettings;

    // Unified cards array containing all the settings
    declare public cards: Array<FormattingSettingsCard>;

    constructor() {
        super();
        this.generalSettings = new generalSettings();
        this.yAxisSettings = new yAxisSettings();
        this.xAxisSettings = new xAxisSettings();

        // Combine all cards into the cards array
        this.cards = [this.generalSettings, this.yAxisSettings, this.xAxisSettings];
    }
}
