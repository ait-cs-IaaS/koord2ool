<template>
  <div class="word-cloud-container">
    <div v-if="processedWords.length > 0" class="word-cloud">
      <div ref="wordCloudDiv" class="word-cloud-content"></div>
      <div class="word-cloud-instructions">Click on a word to see related responses</div>
    </div>
    <div v-else class="no-data">
      <p>No text data available</p>
    </div>

    <div v-if="selectedWord" class="word-tooltip">
      <div class="tooltip-header">
        <strong>{{ selectedWord.text }}</strong>
        <span class="count-badge">{{ selectedWord.count }}</span>
      </div>
      <div v-if="selectedWord.fullResponses.length" class="tooltip-responses">
        <div v-for="(response, index) in selectedWord.fullResponses.slice(0, 3)" :key="index" class="response-item">
          <div class="response-text">{{ response }}</div>
          <div v-if="index < Math.min(selectedWord.fullResponses.length - 1, 2)" class="response-divider"></div>
        </div>
        <div v-if="selectedWord.fullResponses.length > 3" class="more-responses">
          And {{ selectedWord.fullResponses.length - 3 }} more responses...
        </div>
      </div>
      <button class="close-button" @click="selectedWord = null">×</button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref } from "vue";
import { deu, eng } from "stopword";

export interface WordData {
  text: string;
  count: number;
  fullResponses: string[];
}

type RawAnswer = string | Record<string, string>;

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

const STOPWORD_MAP: Record<string, string[]> = {
  en: eng,
  de: deu,
};

const COLORS = ["#1a75ff", "#0073e6", "#0052cc", "#2952a3", "#304d99", "#4a6bbd", "#5c85d6", "#0099cc"];
const TOP_FONT_SIZES = [40, 36, 32];
const FONT_RANGE = { min: 14, max: 32 };
const MARGIN = 35;
const INSTRUCTION_HEIGHT = 20;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));
const toText = (answer: RawAnswer | undefined) => {
  if (!answer) return "";
  if (typeof answer === "string") return answer;
  return Object.values(answer).join(" ");
};
const sanitize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim();

export default defineComponent({
  name: "WordCloudChart",
  props: {
    rawResponses: {
      type: Array as PropType<Array<{ answer: RawAnswer; token: string }>>,
      required: true,
    },
    languages: {
      type: Array as PropType<string[]>,
      default: () => ["en", "de"],
    },
    maxWords: {
      type: Number,
      default: 35,
    },
    minWordLength: {
      type: Number,
      default: 3,
    },
  },
  setup(props) {
    const wordCloudDiv = ref<HTMLElement | null>(null);
    const selectedWord = ref<WordData | null>(null);

    const stopwords = computed(() => new Set(props.languages.flatMap((lang) => STOPWORD_MAP[lang] ?? []).map((word) => word.toLowerCase())));

    const processedWords = computed<WordData[]>(() => {
      const entries = new Map<string, WordData>();

      props.rawResponses.forEach(({ answer }) => {
        const text = toText(answer).trim();
        if (!text || text === "N/A") return;

        sanitize(text)
          .split(/\s+/)
          .filter((word) => word.length >= props.minWordLength && !stopwords.value.has(word))
          .forEach((word) => {
            const entry = entries.get(word) ?? { text: word, count: 0, fullResponses: [] };
            entry.count += 1;
            if (!entry.fullResponses.includes(text)) {
              entry.fullResponses = [...entry.fullResponses, text];
            }
            entries.set(word, entry);
          });
      });

      return Array.from(entries.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, props.maxWords);
    });

    const overlaps = (a: Position, b: Position, buffer = 5) =>
      !(a.x + a.width + buffer < b.x || a.x > b.x + b.width + buffer || a.y + a.height + buffer < b.y || a.y > b.y + b.height + buffer);

    const inBounds = (pos: Position, containerWidth: number, containerHeight: number) =>
      pos.x >= MARGIN &&
      pos.y >= MARGIN &&
      pos.x + pos.width <= containerWidth - MARGIN &&
      pos.y + pos.height <= containerHeight - MARGIN - INSTRUCTION_HEIGHT;

    const toggleWordSelection = (word: WordData) => {
      selectedWord.value = selectedWord.value?.text === word.text ? null : word;
    };

    const createWordCloud = () => {
      const container = wordCloudDiv.value;
      const words = processedWords.value;
      if (!container || !words.length) return;

      container.innerHTML = "";

      const containerWidth = container.clientWidth || container.offsetWidth;
      const containerHeight = container.clientHeight || container.offsetHeight;
      if (!containerWidth || !containerHeight) return;

      const counts = words.map((w) => w.count);
      const minCount = Math.min(...counts);
      const maxCount = Math.max(...counts);

      const getFontSize = (count: number, index: number) => {
        if (index < TOP_FONT_SIZES.length) return TOP_FONT_SIZES[index];
        if (minCount === maxCount) return FONT_RANGE.max;
        const ratio = (count - minCount) / (maxCount - minCount);
        return Math.round(FONT_RANGE.min + ratio * (FONT_RANGE.max - FONT_RANGE.min));
      };

      const getColor = (count: number) => {
        if (minCount === maxCount) return COLORS[0];
        const ratio = (count - minCount) / (maxCount - minCount);
        return COLORS[Math.min(Math.floor(ratio * COLORS.length), COLORS.length - 1)];
      };

      const measure = document.createElement("div");
      Object.assign(measure.style, {
        position: "absolute",
        visibility: "hidden",
        whiteSpace: "nowrap",
        padding: "0",
        margin: "0",
      });
      document.body.appendChild(measure);

      const measureWord = (text: string, fontSize: number, fontWeight: string, rotation: number) => {
        measure.textContent = text;
        Object.assign(measure.style, {
          fontSize: `${fontSize}px`,
          fontWeight,
          transform: rotation ? `rotate(${rotation}deg)` : "none",
        });
        const rect = measure.getBoundingClientRect();
        const extra = rotation ? Math.abs(rotation) * 0.6 : 0;
        return {
          width: rect.width + 5 + extra,
          height: rect.height + 5 + extra,
        };
      };

      const placed: Position[] = [];

      const tryPositions = (positions: Position[], buffer = 5) =>
        positions.find((pos) => inBounds(pos, containerWidth, containerHeight) && placed.every((p) => !overlaps(pos, p, buffer)));

      const createSpiral = (width: number, height: number) => {
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        const positions: Position[] = [];
        for (let angle = 0; angle < 60 * Math.PI; angle += 0.35) {
          const radius = 4 * angle;
          positions.push({
            x: centerX + radius * Math.cos(angle) - width / 2,
            y: centerY + radius * Math.sin(angle) - height / 2,
            width,
            height,
          });
        }
        return positions;
      };

      const createRandom = (width: number, height: number, attempts = 80) => {
        const positions: Position[] = [];
        for (let i = 0; i < attempts; i += 1) {
          const x = MARGIN + Math.random() * (containerWidth - width - MARGIN * 2);
          const y = MARGIN + Math.random() * (containerHeight - height - MARGIN * 2 - INSTRUCTION_HEIGHT);
          positions.push({ x, y, width, height });
        }
        return positions;
      };

      const createCornerSweep = (width: number, height: number) => [
        { x: MARGIN, y: MARGIN, width, height },
        { x: containerWidth - width - MARGIN, y: MARGIN, width, height },
        { x: MARGIN, y: containerHeight - height - MARGIN - INSTRUCTION_HEIGHT, width, height },
        {
          x: containerWidth - width - MARGIN,
          y: containerHeight - height - MARGIN - INSTRUCTION_HEIGHT,
          width,
          height,
        },
      ];

      const centerPositions = (width: number, height: number) => {
        const baseX = containerWidth / 2 - width / 2;
        const baseY = containerHeight / 2 - height / 2;
        return [
          { x: baseX, y: baseY, width, height },
          { x: baseX - 30, y: baseY, width, height },
          { x: baseX + 30, y: baseY, width, height },
          { x: baseX, y: baseY + 25, width, height },
        ];
      };

      words.forEach((word, index) => {
        const rotation = index > 2 && Math.random() > 0.7 ? Math.random() * 16 - 8 : 0;
        const fontSize = getFontSize(word.count, index);
        const fontWeight = index < 3 ? "bold" : "normal";
        const { width, height } = measureWord(word.text, fontSize, fontWeight, rotation);

        const candidates: Position[][] = [];
        if (index < 3) candidates.push(centerPositions(width, height));
        candidates.push(createSpiral(width, height));
        candidates.push(createRandom(width, height));
        candidates.push(createCornerSweep(width, height));

        let position: Position | undefined;
        for (const list of candidates) {
          position = tryPositions(list);
          if (position) break;
        }
        if (!position) {
          for (const list of candidates) {
            position = tryPositions(list, 2);
            if (position) break;
          }
        }

        const fallback = position ?? { x: MARGIN, y: MARGIN, width, height };
        const x = clamp(fallback.x, MARGIN, containerWidth - width - MARGIN);
        const y = clamp(fallback.y, MARGIN, containerHeight - height - MARGIN - INSTRUCTION_HEIGHT);

        const wordEl = document.createElement("div");
        wordEl.className = "word-cloud-item";
        wordEl.textContent = word.text;

        const baseTransform = rotation ? `rotate(${rotation}deg)` : "";

        Object.assign(wordEl.style, {
          position: "absolute",
          left: `${x}px`,
          top: `${y}px`,
          fontSize: `${fontSize}px`,
          fontWeight,
          color: getColor(word.count),
          cursor: "pointer",
          whiteSpace: "nowrap",
          transform: baseTransform,
          transformOrigin: "center center",
          transition: "transform 0.2s ease, opacity 0.2s ease",
        });

        wordEl.addEventListener("mouseenter", () => {
          wordEl.style.opacity = "0.8";
          wordEl.style.zIndex = "10";
          wordEl.style.transform = `${baseTransform} scale(1.1)`.trim();
        });

        wordEl.addEventListener("mouseleave", () => {
          wordEl.style.opacity = "1";
          wordEl.style.zIndex = "";
          wordEl.style.transform = baseTransform;
        });

        wordEl.addEventListener("click", () => toggleWordSelection(word));

        container.appendChild(wordEl);
        placed.push({ x, y, width, height });
      });

      document.body.removeChild(measure);
    };

    let resizeFrame = 0;
    const scheduleDraw = () => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(createWordCloud);
    };

    let resizeObserver: ResizeObserver | null = null;

    onMounted(() => {
      if (!wordCloudDiv.value) return;
      resizeObserver = new ResizeObserver(scheduleDraw);
      resizeObserver.observe(wordCloudDiv.value);
      scheduleDraw();
    });

    return {
      processedWords,
      selectedWord,
      wordCloudDiv,
      toggleWordSelection,
    };
  },
});
</script>

<style scoped>
.word-cloud-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  overflow: hidden;
}
.word-cloud,
.word-cloud-content {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
.word-cloud {
  min-height: 400px;
}
.word-tooltip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border: 1px solid #bbb;
  border-radius: 4px;
  padding: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
  z-index: 1000;
  width: 320px;
  max-height: 300px;
  overflow-y: auto;
}
.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
}
.count-badge {
  background-color: #0066cc;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: bold;
}
.tooltip-responses {
  font-size: 14px;
}
.response-item {
  margin: 8px 0;
}
.response-text {
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.5;
}
.response-divider {
  height: 1px;
  background-color: #eee;
  margin: 10px 0;
}
.more-responses {
  font-style: italic;
  color: #666;
  margin-top: 8px;
  text-align: center;
}
.no-data {
  color: #888;
  font-style: italic;
  text-align: center;
}
.close-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}
.close-button:hover {
  color: #333;
}
.word-cloud-instructions {
  position: absolute;
  bottom: 5px;
  right: 10px;
  font-size: 12px;
  color: #777;
  pointer-events: none;
}
.word-cloud-item {
  position: absolute;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
.word-cloud-item:hover {
  z-index: 10;
}
</style>
