import { jsPDF } from 'jspdf';
import { RoomState, BitSettings, PlacedFurniture } from '../types';
import { getTemplate } from '../data/furniture';

/**
 * 図面の描画設定とロジックを管理するクラス
 */
class BlueprintDrawer {
  private doc: jsPDF;
  private room: RoomState;
  private settings: BitSettings;
  private scale: number = 10; // 1bit = 10mm
  private startX: number = 20;
  private startY: number = 30;

  constructor(room: RoomState, settings: BitSettings) {
    this.doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    this.room = room;
    this.settings = settings;
  }

  public draw() {
    this.drawHeader();
    this.drawRoomOutline();
    this.drawWalls();
  }

  public drawFurnitureList() {
    this.doc.addPage();
    this.doc.setFontSize(16);
    this.doc.setTextColor(0);
    this.doc.text('Furniture List', 10, 15);

    let y = 30;
    this.room.furniture.forEach((f: PlacedFurniture, index: number) => {
      const tmpl = getTemplate(f.templateId);
      this.doc.setFontSize(10);
      this.doc.text(`${index + 1}. ${tmpl?.nameJa || 'Unknown'}`, 10, y);
      this.doc.setFontSize(8);
      this.doc.text(
        `Dimensions: ${(f.x * this.settings.size).toFixed(2)} x ${(f.y * this.settings.size).toFixed(2)} ${this.settings.unit}`,
        10, y + 5
      );
      y += 15;
    });
  }

  public save(filename: string) {
    this.doc.save(filename);
  }

  private drawHeader() {
    this.doc.setFontSize(16);
    this.doc.setTextColor(0);
    this.doc.text('Room Blueprint', 10, 15);
    this.doc.setFontSize(10);
    this.doc.text(
      `Dimensions: ${(this.room.width * this.settings.size).toFixed(2)} x ${(this.room.height * this.settings.size).toFixed(2)} ${this.settings.unit}`,
      10, 22
    );
  }

  private drawRoomOutline() {
    this.doc.setDrawColor(0);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.startX, this.startY, this.room.width * this.scale, this.room.height * this.scale);
  }

  private drawWalls() {
    this.doc.setLineWidth(1.0);
    for (let r = 0; r < this.room.height; r++) {
      for (let c = 0; c < this.room.width; c++) {
        const cell = this.room.cells[r][c];
        if (this.isWall(cell)) {
          const x = this.startX + c * this.scale;
          const y = this.startY + r * this.scale;
          this.doc.rect(x, y, this.scale, this.scale);
        }
      }
    }
  }

  private isWall(cell: string): boolean {
    return !['empty', 'floor', 'autoFloor'].includes(cell);
  }
}

/**
 * PDF生成エントリーポイント
 */
export function generateRoomPDF(room: RoomState, bitSettings: BitSettings, includeFurniture: boolean) {
  const drawer = new BlueprintDrawer(room, bitSettings);
  drawer.draw();
  if (includeFurniture) {
    drawer.drawFurnitureList();
  }
  drawer.save('blueprint.pdf');
}
