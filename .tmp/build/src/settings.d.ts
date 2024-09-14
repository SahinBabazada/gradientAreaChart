import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
declare class yAxisSettings extends FormattingSettingsCard {
    minRange: formattingSettings.NumUpDown;
    maxRange: formattingSettings.NumUpDown;
    yAxisDisplayUnits: formattingSettings.ItemDropdown;
    yAxisDecimalPlaces: formattingSettings.NumUpDown;
    showYAxis: formattingSettings.ToggleSwitch;
    yAxisFontSize: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class generalSettings extends FormattingSettingsCard {
    defaultColor: formattingSettings.ColorPicker;
    showAllDataPoints: formattingSettings.ToggleSwitch;
    fontSize: formattingSettings.NumUpDown;
    smoothLine: formattingSettings.ToggleSwitch;
    showMarkers: formattingSettings.ToggleSwitch;
    markerSize: formattingSettings.NumUpDown;
    gradientStartColor: formattingSettings.ColorPicker;
    gradientEndColor: formattingSettings.ColorPicker;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class xAxisSettings extends FormattingSettingsCard {
    showXAxis: formattingSettings.ToggleSwitch;
    xAxisFontSize: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
export declare class VisualFormattingSettingsModel extends FormattingSettingsModel {
    generalSettings: generalSettings;
    yAxisSettings: yAxisSettings;
    xAxisSettings: xAxisSettings;
    cards: Array<FormattingSettingsCard>;
    constructor();
}
export {};
