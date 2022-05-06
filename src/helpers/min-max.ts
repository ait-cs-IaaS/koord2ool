export class MinMax<T = number> {
  min?: T;

  max?: T;

  constructor();
  constructor(min: T, max: T);
  constructor(min?: T, max?: T) {
    if (typeof min !== "undefined" && typeof max !== "undefined") {
      this.min = min;
      this.max = max;
    }
  }

  observe(value: T): void {
    if (typeof this.min === "undefined" || value < this.min) {
      this.min = value;
    }
    if (typeof this.max === "undefined" || value > this.max) {
      this.max = value;
    }
  }
}
