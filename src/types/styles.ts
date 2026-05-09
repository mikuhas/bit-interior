export type WindowStyle = 'basic' | 'modern' | 'classic';
export type DoorStyle = 'basic' | 'panel' | 'glass';

export interface WindowSettings {
  style: WindowStyle;
}

export interface DoorSettings {
  style: DoorStyle;
}
