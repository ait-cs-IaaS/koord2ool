import * as FinancialElements from "chartjs-chart-financial";

const CandlestickElementPrototype = (FinancialElements.CandlestickElement as any).prototype;
const originalDraw = CandlestickElementPrototype.draw;

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
        originalDraw.call(this, ctx);
    }
};