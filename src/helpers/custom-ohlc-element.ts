import * as FinancialElements from "chartjs-chart-financial";

const CandlestickElementPrototype = (FinancialElements.CandlestickElement as any).prototype;
const originalCandleDraw = CandlestickElementPrototype.draw;

CandlestickElementPrototype.draw = function (ctx: CanvasRenderingContext2D) {
  const { open, high, low, close, x, width, y } = this;
  const isFlat = open === high && high === low && low === close;

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
    originalCandleDraw.call(this, ctx);
  }
};

const OhlcElementPrototype = (FinancialElements.OhlcElement as any).prototype;
const originalOhlcDraw = OhlcElementPrototype.draw;

OhlcElementPrototype.draw = function (ctx: CanvasRenderingContext2D) {
  originalOhlcDraw.call(this, ctx);

  const { x, open, high, low, close } = this;

  if ((this as any).count !== undefined) {
    const count = (this as any).count;
    ctx.save();
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillText(`n=${count}`, x, this._yScale.getPixelForValue(high) - 10);
    ctx.restore();
  }
};
