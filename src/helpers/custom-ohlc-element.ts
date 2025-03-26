import * as FinancialElements from "chartjs-chart-financial";

interface CustomCandlestickElement {
  open: number;
  close: number;
  high: number;
  low: number;
  x: number;
  y: number;
  width: number;
  options?: {
    color?: {
      up?: string;
      down?: string;
      unchanged?: string;
    };
  };
  draw: (ctx: CanvasRenderingContext2D) => void;
}

interface CustomOhlcElement {
  open: number;
  close: number;
  high: number;
  low: number;
  x: number;
  _yScale: {
    getPixelForValue: (val: number) => number;
  };
  count?: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

const CandlestickElementPrototype = (
  FinancialElements.CandlestickElement as unknown as {
    prototype: CustomCandlestickElement;
  }
).prototype;

const originalCandleDraw = CandlestickElementPrototype.draw;

CandlestickElementPrototype.draw = function (this: CustomCandlestickElement, ctx: CanvasRenderingContext2D) {
  const { open, high, low, close, x, width, y } = this;
  const isFlat = open === high && high === low && low === close;

  const options = this.options || {};
  const isPositive = close - open >= 0;
  const customColors = options.color || {};

  if (isFlat) {
    ctx.save();
    ctx.strokeStyle = "rgba(75, 192, 192, 1)";
    ctx.fillStyle = "rgba(75, 192, 192, 0.2)";
    ctx.lineWidth = 1.5;
    const minHeight = 5;
    const yTop = y - minHeight / 2;
    ctx.beginPath();
    ctx.rect(x - width / 2, yTop, width, minHeight);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else {
    if (customColors.up && customColors.down) {
      this.options!.color = isPositive ? { up: customColors.up } : { down: customColors.down };
    }
    originalCandleDraw.call(this, ctx);
  }
};

const OhlcElementPrototype = (
  FinancialElements.OhlcElement as unknown as {
    prototype: CustomOhlcElement;
  }
).prototype;

const originalOhlcDraw = OhlcElementPrototype.draw;

OhlcElementPrototype.draw = function (this: CustomOhlcElement, ctx: CanvasRenderingContext2D) {
  originalOhlcDraw.call(this, ctx);

  if (this.count !== undefined) {
    ctx.save();
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillText(`n=${this.count}`, this.x, this._yScale.getPixelForValue(this.high) - 10);
    ctx.restore();
  }
};
