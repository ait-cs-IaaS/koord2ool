<template>
  <div class="word-cloud-container">
    <div v-if="words.length > 0" class="word-cloud">
      <span
        v-for="word in words"
        :key="word.text"
        class="word"
        :style="{
          fontSize: `${getWordSize(word.count)}px`,
          color: getWordColor(word.count),
          opacity: getWordOpacity(word.count),
          margin: '4px',
          display: 'inline-block',
          cursor: 'pointer'
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
          <div class="response-divider" v-if="index < Math.min(selectedWord.fullResponses.length - 1, 2)"></div>
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
import { defineComponent, ref, computed, PropType } from 'vue';
import { useSurveyStore } from '../../store/surveyStore';

export interface WordData {
  text: string;
  count: number;
  occurrences: string[]; 
  fullResponses: string[]; 
}

export default defineComponent({
  name: 'WordCloudChart',
  props: {
    rawResponses: {
      type: Array as PropType<Array<{ answer: string | Record<string, string>, token: string }>>,
      required: true
    },
    language: {
      type: String,
      default: 'en'
    },
    maxWords: {
      type: Number,
      default: 50
    },
    minWordLength: {
      type: Number,
      default: 3
    }
  },
  setup(props) {
    const store = useSurveyStore();
    const selectedWord = ref<WordData | null>(null);
    
    const stopWords = new Set([
      // English
      'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when',
      'at', 'from', 'by', 'on', 'off', 'for', 'in', 'out', 'to', 'with',
      'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
      'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may',
      'might', 'can', 'could', 'of', 'that', 'this', 'these', 'those', 'it',
      'its', 'it\'s', 'i', 'my', 'me', 'mine', 'myself', 'you', 'your', 'yours',
      'yourself', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
      'we', 'us', 'our', 'ours', 'ourselves', 'they', 'them', 'their', 'theirs',
      'themselves', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when',
      'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'some',
      'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 
      'very', 'just', 'as',
      
      // German
      'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einer', 'eines',
      'einem', 'einen', 'und', 'oder', 'aber', 'wenn', 'dann', 'als', 'als',
      'zu', 'zur', 'zum', 'mit', 'für', 'bei', 'von', 'aus', 'durch', 'über',
      'unter', 'um', 'an', 'auf', 'in', 'nach', 'vor', 'ist', 'sind', 'war',
      'waren', 'wird', 'werden', 'wurde', 'wurden', 'sein', 'gewesen', 'haben',
      'hat', 'hatte', 'hatten', 'können', 'kann', 'konnte', 'konnten', 'darf',
      'dürfen', 'durfte', 'durften', 'muss', 'müssen', 'musste', 'mussten',
      'soll', 'sollen', 'sollte', 'sollten', 'will', 'wollen', 'wollte',
      'wollten', 'ich', 'mich', 'mir', 'mein', 'meine', 'du', 'dich', 'dir',
      'dein', 'deine', 'er', 'ihn', 'ihm', 'sein', 'seine', 'sie', 'ihr', 'ihre',
      'wir', 'uns', 'unser', 'unsere', 'ihr', 'euch', 'euer', 'eure', 'sie',
      'ihnen', 'ihr', 'ihre', 'was', 'wer', 'wen', 'wem', 'welche', 'welcher',
      'welches', 'wo', 'wie', 'warum', 'weshalb', 'wieso', 'dass', 'daß', 'ob',
      'ja', 'nein', 'nicht', 'auch', 'schon', 'noch', 'nur', 'immer', 'alle',
      'alles', 'alle', 'jeder', 'jede', 'jedes', 'man'
    ]);

    const words = computed(() => {
      const wordMap = new Map<string, WordData>();
      const fullResponseMap = new Map<string, string[]>();
      
      props.rawResponses.forEach(response => {
        let text = '';
        
        if (typeof response.answer === 'string') {
          text = response.answer;
        } else if (typeof response.answer === 'object') {
          text = Object.values(response.answer).join(' ');
        }
        
        if (!text || text === 'N/A') return;
        
        const tokens = text.toLowerCase()
          .replace(/[^\p{L}\p{N}\s]/gu, '') // Remove punctuation, keep Unicode letters & numbers
          .split(/\s+/)
          .filter(word => 
            word.length >= props.minWordLength && 
            !stopWords.has(word.toLowerCase())
          );
        
        // Count words and track their original responses
        tokens.forEach(word => {
          if (!wordMap.has(word)) {
            wordMap.set(word, { 
              text: word, 
              count: 0, 
              occurrences: [],
              fullResponses: []
            });
          }
          
          const wordData = wordMap.get(word)!;
          wordData.count++;
          
          // Track the full response for this word
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
          wordMap.get(word)!.occurrences = responses.map(r => r.substring(0, 100)); 
        }
      }
      
      // Sort by frequency and take top N words
      return Array.from(wordMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, props.maxWords);
    });
    
    const maxCount = computed(() => {
      if (words.value.length === 0) return 1;
      return Math.max(...words.value.map(w => w.count));
    });
    
    const minCount = computed(() => {
      if (words.value.length === 0) return 1;
      return Math.min(...words.value.map(w => w.count));
    });
    
    function getWordSize(count: number) {
      // Scale from 14px to 38px based on word frequency
      const minSize = 14;
      const maxSize = 38;
      
      if (maxCount.value === minCount.value) return 20; 
      
      const scale = (count - minCount.value) / (maxCount.value - minCount.value);
      return minSize + scale * (maxSize - minSize);
    }
    
    function getWordColor(count: number) {
      const colors = [
        '#0066cc',
        '#0080ff', 
        '#3399ff',
        '#4da6ff',
        '#66b3ff',
        '#80c1ff'
      ];
      
      if (maxCount.value === minCount.value) return colors[0];
      
      const index = Math.min(
        Math.floor(((count - minCount.value) / (maxCount.value - minCount.value)) * (colors.length - 1)),
        colors.length - 1
      );
      
      return colors[index];
    }
    
    function getWordOpacity(count: number) {
      if (maxCount.value === minCount.value) return 1;
      
      // Scale from 0.7 to 1 based on frequency for more intense colors
      return 0.7 + 0.3 * ((count - minCount.value) / (maxCount.value - minCount.value));
    }
    
    function toggleWordSelection(word: WordData) {
      if (selectedWord.value === word) {
        selectedWord.value = null;
      } else {
        selectedWord.value = word;
      }
    }

    return {
      words,
      selectedWord,
      getWordSize,
      getWordColor,
      getWordOpacity,
      toggleWordSelection
    };
  }
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
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.word {
  transition: transform 0.2s, opacity 0.2s;
  font-weight: 500;
  padding: 3px;
}

.word:hover {
  transform: scale(1.1);
  z-index: 5;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
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