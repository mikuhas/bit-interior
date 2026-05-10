import { jsPDF } from 'jspdf';
import { RoomState, BitSettings, PlacedFurniture } from '../types';
import { getTemplate } from '../data/furniture';

class BlueprintDrawer {
  private doc: jsPDF;
  private room: RoomState;
  private settings: BitSettings;
  private scale: number = 10;
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

  private findEnclosedRegions(): Set<string>[] {
    const visited = new Set<string>();
    const regions: Set<string>[] = [];

    for (let r = 0; r < this.room.height; r++) {
      for (let c = 0; c < this.room.width; c++) {
        if ((this.room.cells[r][c] === 'floor' || this.room.cells[r][c] === 'autoFloor') && !visited.has(`${r},${c}`)) {
          const region = new Set<string>();
          const stack: [number, number][] = [[r, c]];
          while (stack.length > 0) {
            const [currR, currC] = stack.pop()!;
            const key = `${currR},${currC}`;
            if (visited.has(key)) continue;
            visited.add(key);
            region.add(key);

            [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
              const nr = currR + dr, nc = currC + dc;
              if (nr >= 0 && nr < this.room.height && nc >= 0 && nc < this.room.width) {
                const cell = this.room.cells[nr][nc];
                if (cell === 'floor' || cell === 'autoFloor') stack.push([nr, nc]);
              }
            });
          }
          regions.push(region);
        }
      }
    }
    return regions;
  }

  private drawWalls() {
    this.doc.setLineWidth(0.3);
    const regions = this.findEnclosedRegions();
    const floorCells = new Set<string>();
    regions.forEach(r => r.forEach(c => floorCells.add(c)));

    for (let r = 0; r < this.room.height; r++) {
      for (let c = 0; c < this.room.width; c++) {
        const cell = this.room.cells[r][c];
        if (!cell.startsWith('wall') && !cell.startsWith('door') && !cell.startsWith('window')) continue;

        if (this.isWallAdjacentToFloors(r, c, floorCells)) {
            const x = this.startX + c * this.scale;
            const y = this.startY + r * this.scale;
            if (cell.startsWith('wall')) this.drawEdgeWall(x, y, cell);
            else if (cell.startsWith('door')) this.drawDoor(x, y, cell);
            else if (cell.startsWith('window')) this.drawWindow(x, y, cell);
        }
      }
    }
    this.drawDimensions(regions);
  }

  private isWallAdjacentToFloors(r: number, c: number, floorSet: Set<string>): boolean {
    return [[0,1],[0,-1],[1,0],[-1,0]].some(([dr, dc]) => floorSet.has(`${r+dr},${c+dc}`));
  }

  private drawDimensions(regions: Set<string>[]) {
    this.doc.setFontSize(5);
    this.doc.setTextColor(50);

    regions.forEach(region => {
      let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
      region.forEach(key => {
        const [r, c] = key.split(',').map(Number);
        minR = Math.min(minR, r); maxR = Math.max(maxR, r);
        minC = Math.min(minC, c); maxC = Math.max(maxC, c);
      });

      const width = (maxC - minC + 1) * this.settings.size;
      const height = (maxR - minR + 1) * this.settings.size;
      const text = `${width.toFixed(0)} x ${height.toFixed(0)} ${this.settings.unit}`;
      
      const centerX = this.startX + (minC + (maxC - minC) / 2 + 0.5) * this.scale;
      const centerY = this.startY + (minR + (maxR - minR) / 2 + 0.5) * this.scale;
      this.doc.text(text, centerX, centerY, { align: 'center' });
    });
  }

  private drawEdgeWall(x: number, y: number, type: string) {
    const th = this.scale * 0.15;
    const hasTop = type.includes('Top') || type.includes('Full') || type === 'wall';
    const hasRight = type.includes('Right') || type.includes('Full') || type === 'wall';
    const hasBottom = type.includes('Bottom') || type.includes('Full') || type === 'wall';
    const hasLeft = type.includes('Left') || type.includes('Full') || type === 'wall';

    this.doc.setLineWidth(th);
    if (hasTop) this.doc.line(x, y, x + this.scale, y);
    if (hasRight) this.doc.line(x + this.scale, y, x + this.scale, y + this.scale);
    if (hasBottom) this.doc.line(x, y + this.scale, x + this.scale, y + this.scale);
    if (hasLeft) this.doc.line(x, y, x, y + this.scale);
  }

  private drawDoor(x: number, y: number, type: string) {
    this.doc.setLineWidth(0.2);
    this.doc.rect(x, y, this.scale, this.scale);
  }

  private drawWindow(x: number, y: number, type: string) {
    this.doc.setLineWidth(0.3);
    if (type.includes('Top')) {
       this.doc.line(x, y, x + this.scale, y);
       this.doc.line(x + this.scale * 0.2, y - 1, x + this.scale * 0.8, y - 1);
    } else if (type.includes('Bottom')) {
       this.doc.line(x, y + this.scale, x + this.scale, y + this.scale);
       this.doc.line(x + this.scale * 0.2, y + this.scale + 1, x + this.scale * 0.8, y + this.scale + 1);
    } else if (type.includes('Left')) {
       this.doc.line(x, y, x, y + this.scale);
       this.doc.line(x - 1, y + this.scale * 0.2, x - 1, y + this.scale * 0.8);
    } else if (type.includes('Right')) {
       this.doc.line(x + this.scale, y, x + this.scale, y + this.scale);
       this.doc.line(x + this.scale + 1, y + this.scale * 0.2, x + this.scale + 1, y + this.scale * 0.8);
    }
  }
}

export function generateRoomPDF(room: RoomState, bitSettings: BitSettings, includeFurniture: boolean) {
  const drawer = new BlueprintDrawer(room, bitSettings);
  drawer.draw();
  if (includeFurniture) {
    drawer.drawFurnitureList();
  }
  drawer.save('blueprint.pdf');
}
