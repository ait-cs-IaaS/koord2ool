export interface SettingsModel {
  useLogicalTime: boolean;
  step: number;
  onlyActive: boolean;
  responseRange: number[];
}

export type SettingsKey = keyof SettingsModel;

export interface Option {
  text: string;
  value: boolean | number;
  icon: string;
  description?: string;
}
