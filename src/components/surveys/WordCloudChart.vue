<template>
  <div class="word-cloud-container">
    <div v-if="words.length > 0" ref="cloudContainer" class="word-cloud">
      <span
        v-for="(word, index) in words"
        :key="word.text"
        class="word"
        :style="{
          fontSize: `${getWordSize(word.count)}px`,
          color: getWordColor(word.count),
          opacity: wordPositions[index]?.x === -9999 ? 0 : getWordOpacity(word.count),
          transform: wordPositions[index] ? `translate(${wordPositions[index].x}px, ${wordPositions[index].y}px)` : 'none',
          padding: '4px',
          cursor: 'pointer',
          position: 'absolute',
          zIndex: word.count === selectedWord?.count ? 10 : 1,
          display: wordPositions[index]?.x === -9999 ? 'none' : 'inline-block',
          '--x': `${wordPositions[index]?.x || 0}px`,
          '--y': `${wordPositions[index]?.y || 0}px`,
        }"
        @click="toggleWordSelection(word)"
      >
        {{ word.text }}
      </span>
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
import { defineComponent, ref, computed, PropType, onMounted, reactive, watch } from "vue";

export interface WordData {
  text: string;
  count: number;
  occurrences: string[];
  fullResponses: string[];
}

export default defineComponent({
  name: "WordCloudChart",
  props: {
    rawResponses: {
      type: Array as PropType<Array<{ answer: string | Record<string, string>; token: string }>>,
      required: true,
    },
    language: {
      type: String,
      default: "en",
    },
    maxWords: {
      type: Number,
      default: 50,
    },
    minWordLength: {
      type: Number,
      default: 3,
    },
  },
  setup(props) {
    const selectedWord = ref<WordData | null>(null);
    const cloudContainer = ref<HTMLElement | null>(null);
    const wordPositions = reactive<Array<{ x: number; y: number }>>([]);

    // Common stopwords to filter out from word cloud
    const stopWords = new Set([
      // English
      "a",
      "an",
      "the",
      "and",
      "or",
      "but",
      "if",
      "then",
      "else",
      "when",
      "at",
      "from",
      "by",
      "on",
      "off",
      "for",
      "in",
      "out",
      "to",
      "with",
      "is",
      "am",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "shall",
      "should",
      "may",
      "might",
      "can",
      "could",
      "of",
      "that",
      "this",
      "these",
      "those",
      "it",
      "its",
      "it's",
      "i",
      "my",
      "me",
      "mine",
      "myself",
      "you",
      "your",
      "yours",
      "yourself",
      "he",
      "him",
      "his",
      "himself",
      "she",
      "her",
      "hers",
      "herself",
      "we",
      "us",
      "our",
      "ours",
      "ourselves",
      "they",
      "them",
      "their",
      "theirs",
      "themselves",
      "what",
      "which",
      "who",
      "whom",
      "whose",
      "where",
      "when",
      "why",
      "how",
      "all",
      "any",
      "both",
      "each",
      "few",
      "more",
      "most",
      "some",
      "such",
      "no",
      "nor",
      "not",
      "only",
      "own",
      "same",
      "so",
      "than",
      "too",
      "very",
      "just",
      "as",

      // German
      "der",
      "die",
      "das",
      "den",
      "dem",
      "des",
      "ein",
      "eine",
      "einer",
      "eines",
      "einem",
      "einen",
      "und",
      "oder",
      "aber",
      "wenn",
      "dann",
      "als",
      "als",
      "zu",
      "zur",
      "zum",
      "mit",
      "für",
      "bei",
      "von",
      "aus",
      "durch",
      "über",
      "unter",
      "um",
      "an",
      "auf",
      "in",
      "nach",
      "vor",
      "ist",
      "sind",
      "war",
      "waren",
      "wird",
      "werden",
      "wurde",
      "wurden",
      "sein",
      "gewesen",
      "haben",
      "hat",
      "hatte",
      "hatten",
      "können",
      "kann",
      "konnte",
      "konnten",
      "darf",
      "dürfen",
      "durfte",
      "durften",
      "muss",
      "müssen",
      "musste",
      "mussten",
      "soll",
      "sollen",
      "sollte",
      "sollten",
      "will",
      "wollen",
      "wollte",
      "wollten",
      "ich",
      "mich",
      "mir",
      "mein",
      "meine",
      "du",
      "dich",
      "dir",
      "dein",
      "deine",
      "er",
      "ihn",
      "ihm",
      "sein",
      "seine",
      "sie",
      "ihr",
      "ihre",
      "wir",
      "uns",
      "unser",
      "unsere",
      "ihr",
      "euch",
      "euer",
      "eure",
      "sie",
      "ihnen",
      "ihr",
      "ihre",
      "was",
      "wer",
      "wen",
      "wem",
      "welche",
      "welcher",
      "welches",
      "wo",
      "wie",
      "warum",
      "weshalb",
      "wieso",
      "dass",
      "daß",
      "ob",
      "ja",
      "nein",
      "nicht",
      "auch",
      "schon",
      "noch",
      "nur",
      "immer",
      "alle",
      "alles",
      "alle",
      "jeder",
      "jede",
      "jedes",
      "man",
    ]);

    const words = computed(() => {
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
          .filter((word) => word.length >= props.minWordLength && !stopWords.has(word.toLowerCase()));

        tokens.forEach((word) => {
          if (!wordMap.has(word)) {
            wordMap.set(word, {
              text: word,
              count: 0,
              occurrences: [],
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

      // Associate full responses with each word
      for (const [word, responses] of fullResponseMap.entries()) {
        if (wordMap.has(word)) {
          wordMap.get(word)!.fullResponses = responses;
          wordMap.get(word)!.occurrences = responses.map((r) => r.substring(0, 100));
        }
      }

      // Sort by frequency and take top N words
      return Array.from(wordMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, props.maxWords);
    });

    const maxCount = computed(() => {
      if (words.value.length === 0) return 1;
      return Math.max(...words.value.map((w) => w.count));
    });

    const minCount = computed(() => {
      if (words.value.length === 0) return 1;
      return Math.min(...words.value.map((w) => w.count));
    });

    /**
     * Calculate font size based on word frequency
     * Uses logarithmic scaling to create better visual balance
     */
    function getWordSize(count: number) {
      const minSize = 14;
      const maxSize = 32;

      if (maxCount.value === minCount.value) return 20;

      // Logarithmic scaling formula for more balanced visual distribution
      // log10(1 + 9*normalizedCount) gives smoother progression
      const normalizedCount = (count - minCount.value) / (maxCount.value - minCount.value);
      const logScale = Math.log(1 + 9 * normalizedCount) / Math.log(10);

      // Ensure the most frequent word is always maximum size
      if (count === maxCount.value) return maxSize;

      return minSize + logScale * (maxSize - minSize);
    }

    function getWordColor(count: number) {
      const colors = [
        // Blues
        "#80c1ff",
        "#4da6ff",
        "#1a75ff",
        "#0052cc",
        "#0039a6",
        // Teals
        "#80dfff",
        "#00b8e6",
        "#0099cc",
        "#006699",
        // Purples
        "#8cb3ff",
        "#5c85d6",
        "#3366cc",
        "#2952a3",
        // Sky blues
        "#66c2ff",
        "#0073e6",
        "#0057b3",
        // Slate blues
        "#7094db",
        "#4a6bbd",
        "#304d99",
        // Aqua
        "#66d9ff",
        "#33ccff",
        "#00ace6",
      ];

      if (maxCount.value === minCount.value) return colors[3];

      if (count === maxCount.value) return "#0052cc";

      if (words.value.length > 1 && count === words.value.sort((a, b) => b.count - a.count)[1].count) {
        return "#0073e6";
      }

      if (words.value.length > 2 && count === words.value.sort((a, b) => b.count - a.count)[2].count) {
        return "#2952a3";
      }

      const sortedWords = [...words.value].sort((a, b) => b.count - a.count);
      const wordRank = sortedWords.findIndex((w) => w.count === count);
      const colorIndex = (wordRank * 3) % colors.length;

      return colors[colorIndex];
    }

    function getWordOpacity(count: number) {
      if (maxCount.value === minCount.value) return 1;

      return 0.7 + 0.3 * ((count - minCount.value) / (maxCount.value - minCount.value));
    }

    /**
     * Main algorithm to calculate word positions without overlap
     * Uses a combination of spiral and radial placement strategies
     */
    function calculateWordPositions() {
      if (!cloudContainer.value) return;

      const containerWidth = cloudContainer.value.clientWidth;
      const containerHeight = cloudContainer.value.clientHeight;

      wordPositions.length = 0;

      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;

      const maxDistanceX = containerWidth * 0.42;
      const maxDistanceY = containerHeight * 0.38;
      const placedWordRects: Array<{ x: number; y: number; width: number; height: number }> = [];

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      const computedStyle = getComputedStyle(document.body);
      const fontFamily = computedStyle.fontFamily || "'Segoe UI', sans-serif";

      function measureText(text: string, fontSize: number): { width: number; height: number } {
        ctx.font = `500 ${fontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(text);

        return {
          width: metrics.width + 16,
          height: fontSize * 1.3,
        };
      }

      function checkOverlap(rect: { x: number; y: number; width: number; height: number }, padding: number = 7): boolean {
        for (const placedRect of placedWordRects) {
          if (
            rect.x - padding < placedRect.x + placedRect.width + padding &&
            rect.x + rect.width + padding > placedRect.x - padding &&
            rect.y - padding < placedRect.y + placedRect.height + padding &&
            rect.y + rect.height + padding > placedRect.y - padding
          ) {
            return true;
          }
        }
        return false;
      }

      /**
       * Archimedean spiral placement algorithm
       * Formula: r = a + b*θ where θ is the angle and r is distance from center
       */
      function archimedeanSpiral(t: number, spread: number = 1): [number, number] {
        // Balance spiral growth rate based on container size
        const growthFactor = Math.min(containerWidth, containerHeight) / 700;
        const a = 16 * growthFactor; // Controls initial spacing
        const b = 2.9 * growthFactor; // Controls spiral growth rate

        // Calculate spiral coordinates with customized spread
        const angle = spread * t;
        const x = (a + b * angle) * Math.cos(angle);
        const y = (a + b * angle) * Math.sin(angle) * 0.68;

        return [x, y];
      }

      const sortedWords = [...words.value].sort((a, b) => b.count - a.count);

      const maxWordsToShow = Math.min(Math.max(12, Math.floor((containerWidth * containerHeight) / 12000)), 45, sortedWords.length);

      if (sortedWords.length > 0) {
        const firstWord = sortedWords[0];
        const fontSize = getWordSize(firstWord.count);
        const { width, height } = measureText(firstWord.text, fontSize);

        const centerRect = {
          x: centerX - width / 2,
          y: centerY - height / 2,
          width,
          height,
        };

        placedWordRects.push(centerRect);

        wordPositions.push({
          x: 0,
          y: 0,
        });
      }

      let placedCount = 1;
      let skippedCount = 0;

      const tryPlacement = (word: (typeof sortedWords)[0], fontSize: number): boolean => {
        const { width, height } = measureText(word.text, fontSize);

        for (let t = 1; t < 800; t += 0.1) {
          for (const spread of [1.0, 0.97, 1.03, 0.94, 1.06, 0.91, 1.09]) {
            const [spiralX, spiralY] = archimedeanSpiral(t, spread);

            const x = centerX + spiralX;
            const y = centerY + spiralY;

            if (Math.abs(x - centerX) <= maxDistanceX && Math.abs(y - centerY) <= maxDistanceY) {
              const rect = {
                x: x - width / 2,
                y: y - height / 2,
                width,
                height,
              };

              if (!checkOverlap(rect)) {
                placedWordRects.push(rect);
                wordPositions.push({
                  x: x - centerX,
                  y: y - centerY,
                });
                return true;
              }
            }
          }
        }

        for (let radius = 40; radius < Math.min(maxDistanceX, maxDistanceY); radius += 12) {
          for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 18) {
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle) * 0.7;

            const rect = {
              x: x - width / 2,
              y: y - height / 2,
              width,
              height,
            };

            if (!checkOverlap(rect)) {
              placedWordRects.push(rect);
              wordPositions.push({
                x: x - centerX,
                y: y - centerY,
              });
              return true;
            }
          }
        }

        return false;
      };

      for (let i = 1; i < sortedWords.length; i++) {
        if (placedCount >= maxWordsToShow && i > sortedWords.length * 0.5) {
          wordPositions.push({
            x: -9999,
            y: -9999,
          });
          continue;
        }

        const word = sortedWords[i];
        const fontSize = getWordSize(word.count);

        if (tryPlacement(word, fontSize)) {
          placedCount++;
        } else {
          skippedCount++;
          wordPositions.push({
            x: -9999,
            y: -9999,
          });
        }

        // Early exit condition when placement becomes difficult
        if (placedCount >= maxWordsToShow * 0.85 && skippedCount > 3) {
          // We're close to target and having trouble placing more words
          break;
        }
      }

      for (let i = wordPositions.length; i < sortedWords.length; i++) {
        wordPositions.push({
          x: -9999,
          y: -9999,
        });
      }
    }

    function toggleWordSelection(word: WordData) {
      if (selectedWord.value === word) {
        selectedWord.value = null;
      } else {
        selectedWord.value = word;
      }
    }

    onMounted(() => {
      const recalculate = () => {
        if (cloudContainer.value) {
          calculateWordPositions();
        } else {
          setTimeout(recalculate, 100);
        }
      };

      setTimeout(recalculate, 200);

      let resizeTimer: number | null = null;
      window.addEventListener("resize", () => {
        if (resizeTimer) {
          clearTimeout(resizeTimer);
        }
        resizeTimer = window.setTimeout(() => {
          calculateWordPositions();
          resizeTimer = null;
        }, 150);
      });
    });

    const wordsCount = computed(() => words.value.length);

    watch(wordsCount, (newCount) => {
      if (newCount > 0 && cloudContainer.value) {
        setTimeout(calculateWordPositions, 200);
      }
    });

    return {
      words,
      selectedWord,
      cloudContainer,
      wordPositions,
      getWordSize,
      getWordColor,
      getWordOpacity,
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
  padding: 10px;
  overflow: hidden;
}

.word-cloud {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 15px;
  line-height: 1.1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.word {
  transition:
    transform 0.3s ease-out,
    opacity 0.2s,
    color 0.2s,
    filter 0.2s;
  font-weight: 500;
  display: inline-block;
  border-radius: 2px;
  transform-origin: center center;
  white-space: nowrap;
  will-change: transform;
  top: 50%;
  left: 50%;
}

.word:hover {
  transform: translate(var(--x), var(--y)) scale(1.15) !important;
  z-index: 10 !important;
  filter: brightness(1.1);
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.15);
  font-weight: 600;
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
</style>
