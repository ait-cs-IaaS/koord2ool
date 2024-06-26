export interface SettingsModel {
  timeFormat: string;
  step: number;
  expirationTime: number;
  onlyActive: boolean;
  displayNA: boolean;
}

export type SettingsKey = keyof SettingsModel;

export interface Option {
  text: string;
  value: boolean | number | string;
  icon: string;
  description?: string;
}

export interface SettingsOption {
  title: string;
  options: Option[];
}
