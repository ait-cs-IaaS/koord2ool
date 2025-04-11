<template>
  <div class="word-cloud-container">
    <div v-if="processedWords.length > 0" ref="cloudContainer" class="word-cloud">
      <div ref="wordCloudDiv" class="word-cloud-content"></div>
    </div>
    <div v-else class="no-data">
      <p>No text data available</p>
    </div>

    <div v-if="selectedWord" class="word-tooltip">
      <div class="tooltip-header">
        <strong>{{ selectedWord.text }}</strong>
        <span class="count-badge">{{ selectedWord.count }}</span>
      </div>
      <div v-if="selectedWord.fullResponses && selectedWord.fullResponses.length > 0" class="tooltip-responses">
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
import { defineComponent, ref, computed, PropType, onMounted, watch, nextTick, onBeforeUnmount } from "vue";
import { eng, deu } from "stopword";

export interface WordData {
  text: string;
  count: number;
  fullResponses: string[];
}

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default defineComponent({
  name: "WordCloudChart",
  props: {
    rawResponses: {
      type: Array as PropType<Array<{ answer: string | Record<string, string>; token: string }>>,
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
    const selectedWord = ref<WordData | null>(null);
    const cloudContainer = ref<HTMLElement | null>(null);
    const wordCloudDiv = ref<HTMLElement | null>(null);

    const getStopwords = computed(() => {
      const stopwordMap: Record<string, string[]> = {
        en: eng,
        de: deu,
      };

      let stopwordsList: string[] = [];
      props.languages.forEach((lang) => {
        if (stopwordMap[lang]) {
          stopwordsList = [...stopwordsList, ...stopwordMap[lang]];
        }
      });

      return new Set(stopwordsList.map((word) => word.toLowerCase()));
    });

    const processedWords = computed(() => {
      const wordMap = new Map<string, WordData>();
      const fullResponseMap = new Map<string, string[]>();

      props.rawResponses.forEach((response) => {
        let text = "";

        if (typeof response.answer === "string") {
          text = response.answer;
        } else if (typeof response.answer === "object") {
          text = Object.values(response.answer).join(" ");
        }

        if (!text || text === "N/A") return;

        const tokens = text
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\s]/gu, "")
          .split(/\s+/)
          .filter((word) => word.length >= props.minWordLength && !getStopwords.value.has(word.toLowerCase()));

        tokens.forEach((word) => {
          if (!wordMap.has(word)) {
            wordMap.set(word, {
              text: word,
              count: 0,
              fullResponses: [],
            });
          }

          const wordData = wordMap.get(word)!;
          wordData.count++;

          if (!fullResponseMap.has(word)) {
            fullResponseMap.set(word, []);
          }
          if (!fullResponseMap.get(word)!.includes(text)) {
            fullResponseMap.get(word)!.push(text);
          }
        });
      });

      for (const [word, responses] of fullResponseMap.entries()) {
        if (wordMap.has(word)) {
          wordMap.get(word)!.fullResponses = responses;
        }
      }

      return Array.from(wordMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, props.maxWords);
    });

    function createWordCloud() {
      if (!wordCloudDiv.value) return;

      const container = wordCloudDiv.value;
      container.innerHTML = "";

      const words = processedWords.value;
      if (words.length === 0) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const margin = 35;

      const minCount = Math.min(...words.map((w) => w.count));
      const maxCount = Math.max(...words.map((w) => w.count));

      const measure = document.createElement("div");
      measure.style.position = "absolute";
      measure.style.visibility = "hidden";
      measure.style.whiteSpace = "nowrap";
      document.body.appendChild(measure);

      function getFontSize(count: number, index: number): number {
        if (index === 0) return 40;
        if (index === 1) return 36;
        if (index === 2) return 32;

        if (maxCount === minCount) return 22;

        const normalizedValue = (count - minCount) / (maxCount - minCount);
        return 14 + Math.round(normalizedValue * 18);
      }

      const colors = ["#1a75ff", "#0073e6", "#0052cc", "#2952a3", "#304d99", "#4a6bbd", "#5c85d6", "#0099cc"];

      function checkOverlap(pos1: Position, pos2: Position, buffer = 5): boolean {
        return !(
          pos1.x + pos1.width + buffer < pos2.x ||
          pos1.x > pos2.x + pos2.width + buffer ||
          pos1.y + pos1.height + buffer < pos2.y ||
          pos1.y > pos2.y + pos2.height + buffer
        );
      }

      function isInBounds(pos: Position): boolean {
        return (
          pos.x >= margin && pos.y >= margin && pos.x + pos.width <= containerWidth - margin && pos.y + pos.height <= containerHeight - margin
        );
      }

      function getWordDimensions(
        text: string,
        fontSize: number,
        fontWeight: string,
        rotation: number = 0,
      ): { width: number; height: number } {
        measure.textContent = text;
        measure.style.fontSize = `${fontSize}px`;
        measure.style.fontWeight = fontWeight;
        measure.style.padding = "0";
        measure.style.margin = "0";
        measure.style.transform = rotation ? `rotate(${rotation}deg)` : "";

        const rect = measure.getBoundingClientRect();

        if (Math.abs(rotation) > 0) {
          return {
            width: rect.width + Math.abs(rotation) * 1.2,
            height: rect.height + Math.abs(rotation) * 1.2,
          };
        }

        return {
          width: rect.width + 5,
          height: rect.height + 5,
        };
      }

      const placedPositions: Position[] = [];
      const placementStrategies = [
        (word: WordData, index: number, rotation: number): Position[] => {
          const positions: Position[] = [];
          const fontSize = getFontSize(word.count, index);
          const fontWeight = index < 3 ? "bold" : "normal";
          const { width, height } = getWordDimensions(word.text, fontSize, fontWeight, rotation);

          const centerX = containerWidth / 2;
          const centerY = containerHeight / 2;

          for (let angle = 0; angle < 50 * Math.PI; angle += 0.25) {
            const radius = 5 * angle;
            const x = centerX + radius * Math.cos(angle) - width / 2;
            const y = centerY + radius * Math.sin(angle) - height / 2;

            positions.push({ x, y, width, height });

            if (positions.length > 200) break;
          }

          return positions;
        },

        (word: WordData, index: number, rotation: number): Position[] => {
          const positions: Position[] = [];
          const fontSize = getFontSize(word.count, index);
          const fontWeight = index < 3 ? "bold" : "normal";
          const { width, height } = getWordDimensions(word.text, fontSize, fontWeight, rotation);

          const innerMargin = margin + 10;

          for (let i = 0; i < 100; i++) {
            const x = innerMargin + Math.random() * (containerWidth - width - innerMargin * 2);
            const y = innerMargin + Math.random() * (containerHeight - height - innerMargin * 2);

            positions.push({ x, y, width, height });
          }

          return positions;
        },

        (word: WordData, index: number, rotation: number): Position[] => {
          const positions: Position[] = [];
          const fontSize = getFontSize(word.count, index);
          const fontWeight = index < 3 ? "bold" : "normal";
          const { width, height } = getWordDimensions(word.text, fontSize, fontWeight, rotation);

          const edgeMargin = margin + 5;

          positions.push({ x: edgeMargin, y: edgeMargin, width, height });
          positions.push({ x: containerWidth - width - edgeMargin, y: edgeMargin, width, height });
          positions.push({ x: edgeMargin, y: containerHeight - height - edgeMargin, width, height });
          positions.push({ x: containerWidth - width - edgeMargin, y: containerHeight - height - edgeMargin, width, height });

          positions.push({ x: (containerWidth - width) / 2, y: edgeMargin, width, height });
          positions.push({ x: (containerWidth - width) / 2, y: containerHeight - height - edgeMargin, width, height });
          positions.push({ x: edgeMargin, y: (containerHeight - height) / 2, width, height });
          positions.push({ x: containerWidth - width - edgeMargin, y: (containerHeight - height) / 2, width, height });

          for (let i = 0; i < 20; i++) {
            const x = edgeMargin + Math.random() * (containerWidth - width - edgeMargin * 2);
            const y = edgeMargin + Math.random() * (containerHeight - height - edgeMargin * 2);
            positions.push({ x, y, width, height });
          }

          return positions;
        },
      ];

      const instructionHeight = 20;

      words.forEach((word, index) => {
        const rotation = index > 2 && Math.random() > 0.7 ? Math.random() * 16 - 8 : 0;

        const fontSize = getFontSize(word.count, index);
        const fontWeight = index < 3 ? "bold" : "normal";
        const { width, height } = getWordDimensions(word.text, fontSize, fontWeight, rotation);

        let colorIndex: number;
        if (maxCount === minCount) {
          colorIndex = 0;
        } else {
          const normalizedValue = (word.count - minCount) / (maxCount - minCount);
          colorIndex = Math.min(Math.floor(normalizedValue * colors.length), colors.length - 1);
        }
        const color = colors[colorIndex];

        let position: Position | null = null;
        let foundPosition = false;

        if (index < 3) {
          const strategy = placementStrategies[0];
          const positions = strategy(word, index, rotation);

          for (const pos of positions) {
            if (!isInBounds(pos)) continue;

            let overlaps = false;
            for (const placed of placedPositions) {
              if (checkOverlap(pos, placed)) {
                overlaps = true;
                break;
              }
            }

            if (!overlaps) {
              position = pos;
              foundPosition = true;
              break;
            }
          }

          if (!foundPosition) {
            const centerX = containerWidth / 2;
            const centerY = containerHeight / 2;

            const x = Math.max(margin, Math.min(containerWidth - width - margin, centerX - width / 2 + (index - 1) * 20));
            const y = Math.max(
              margin,
              Math.min(containerHeight - height - margin - instructionHeight, centerY - height / 2 - 10 + index * 15),
            );

            position = { x, y, width, height };
            foundPosition = true;
          }
        } else {
          for (const strategy of placementStrategies) {
            const positions = strategy(word, index, rotation);

            for (const pos of positions) {
              if (!isInBounds(pos)) continue;

              if (pos.y + pos.height > containerHeight - margin - instructionHeight) continue;

              let overlaps = false;
              for (const placed of placedPositions) {
                if (checkOverlap(pos, placed)) {
                  overlaps = true;
                  break;
                }
              }

              if (!overlaps) {
                position = pos;
                foundPosition = true;
                break;
              }
            }

            if (foundPosition) break;
          }

          if (!foundPosition) {
            for (const strategy of placementStrategies) {
              const positions = strategy(word, index, rotation);

              for (const pos of positions) {
                if (!isInBounds(pos)) continue;

                if (pos.y + pos.height > containerHeight - margin - instructionHeight) continue;

                let overlaps = false;
                for (const placed of placedPositions) {
                  if (checkOverlap(pos, placed, 2)) {
                    overlaps = true;
                    break;
                  }
                }

                if (!overlaps) {
                  position = pos;
                  foundPosition = true;
                  break;
                }
              }

              if (foundPosition) break;
            }
          }
        }

        if (position) {
          const x = Math.max(margin, Math.min(containerWidth - width - margin, position.x));
          const y = Math.max(margin, Math.min(containerHeight - height - margin - instructionHeight, position.y));

          const wordEl = document.createElement("div");
          wordEl.className = "word-cloud-item";
          wordEl.textContent = word.text;
          wordEl.style.position = "absolute";
          wordEl.style.left = `${x}px`;
          wordEl.style.top = `${y}px`;
          wordEl.style.fontSize = `${fontSize}px`;
          wordEl.style.fontWeight = fontWeight;
          wordEl.style.color = color;
          wordEl.style.cursor = "pointer";
          wordEl.style.whiteSpace = "nowrap";
          wordEl.style.transform = rotation !== 0 ? `rotate(${rotation}deg)` : "";
          wordEl.style.transformOrigin = "center center";
          wordEl.style.transition = "transform 0.2s ease, opacity 0.2s ease";

          wordEl.addEventListener("mouseover", () => {
            wordEl.style.opacity = "0.8";
            wordEl.style.zIndex = "10";
            wordEl.style.transform = `${wordEl.style.transform || ""} scale(1.1)`.trim();
          });

          wordEl.addEventListener("mouseout", () => {
            wordEl.style.opacity = "1";
            wordEl.style.zIndex = "";
            wordEl.style.transform = rotation !== 0 ? `rotate(${rotation}deg)` : "";
          });

          wordEl.addEventListener("click", () => {
            toggleWordSelection(word);
          });

          container.appendChild(wordEl);

          placedPositions.push({
            x,
            y,
            width,
            height,
          });
        }
      });

      document.body.removeChild(measure);

      const instructions = document.createElement("div");
      instructions.className = "word-cloud-instructions";
      instructions.textContent = "Click on a word to see related responses";
      instructions.style.position = "absolute";
      instructions.style.bottom = "5px";
      instructions.style.right = "10px";
      instructions.style.fontSize = "12px";
      instructions.style.color = "#777";
      container.appendChild(instructions);
    }

    function toggleWordSelection(word: WordData): void {
      if (selectedWord.value === word) {
        selectedWord.value = null;
      } else {
        selectedWord.value = word;
      }
    }

    onMounted(async () => {
      await nextTick();
      if (processedWords.value.length > 0) {
        createWordCloud();
      }

      let resizeTimer: number | null = null;
      const handleResize = () => {
        if (resizeTimer) {
          window.clearTimeout(resizeTimer);
        }
        resizeTimer = window.setTimeout(() => {
          if (processedWords.value.length > 0) {
            createWordCloud();
          }
          resizeTimer = null;
        }, 300);
      };

      window.addEventListener("resize", handleResize);

      onBeforeUnmount(() => {
        window.removeEventListener("resize", handleResize);
      });
    });

    watch(
      () => processedWords.value.length,
      async (newCount) => {
        if (newCount > 0) {
          await nextTick();
          createWordCloud();
        }
      },
    );

    watch(
      () => props.rawResponses,
      async () => {
        if (processedWords.value.length > 0) {
          await nextTick();
          createWordCloud();
        }
      },
      { deep: true },
    );

    return {
      processedWords,
      selectedWord,
      cloudContainer,
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

.word-cloud {
  width: 100%;
  height: 100%;
  min-height: 400px;
  position: relative;
  overflow: hidden;
}

.word-cloud-content {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
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