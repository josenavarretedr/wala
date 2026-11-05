<script setup>
import { ref, computed } from 'vue';
import AppButton from '@/components/common/AppButton.vue';

const props = defineProps({
  questions: {
    type: Array,
    required: true,
    default: () => []
  },
  assessment: {
    type: Object,
    default: () => ({ passed: false, bestScore: 0, totalAttempts: 0 })
  }
});

const emit = defineEmits(['attempt', 'continue-to-form']);

// Estado de la pregunta actual
const currentIndex = ref(0);
const selectedAnswers = ref({}); // { [qId]: 'V' | 'F' }
const questionFeedback = ref({}); // { [qId]: { isCorrect, explanation, selected } }
const quizFinished = ref(props.assessment?.passed || false);
const scoreResult = ref(props.assessment?.bestScore || 0);

const currentQuestion = computed(() => {
  return props.questions[currentIndex.value] || props.questions[0];
});

const isLastQuestion = computed(() => {
  return currentIndex.value >= props.questions.length - 1;
});

const currentFeedback = computed(() => {
  if (!currentQuestion.value) return null;
  return questionFeedback.value[currentQuestion.value.id] || null;
});

function handleSelectOption(option) {
  if (!currentQuestion.value) return;
  const q = currentQuestion.value;
  const isCorrect = option === q.correctOption;

  selectedAnswers.value[q.id] = option;
  questionFeedback.value[q.id] = {
    selected: option,
    isCorrect,
    explanation: q.explanation
  };
}

function handleRetryQuestion() {
  if (!currentQuestion.value) return;
  const qId = currentQuestion.value.id;
  delete selectedAnswers.value[qId];
  delete questionFeedback.value[qId];
}

function nextQuestion() {
  if (!isLastQuestion.value) {
    currentIndex.value++;
  } else {
    // Calcular puntaje final
    calculateAndEmitResult();
  }
}

function calculateAndEmitResult() {
  let correctCount = 0;
  const total = props.questions.length;
  const recordedAnswers = [];

  for (const q of props.questions) {
    const feedback = questionFeedback.value[q.id];
    const isCorrect = feedback?.isCorrect || false;
    if (isCorrect) correctCount++;

    recordedAnswers.push({
      questionId: q.id,
      selectedOption: feedback?.selected || null,
      isCorrect,
      feedbackGiven: q.explanation
    });
  }

  const score = Math.round((correctCount / total) * 100);
  const passed = score === 100;

  scoreResult.value = score;
  quizFinished.value = true;

  emit('attempt', {
    answers: recordedAnswers,
    score,
    passed
  });
}

function resetQuiz() {
  selectedAnswers.value = {};
  questionFeedback.value = {};
  currentIndex.value = 0;
  quizFinished.value = false;
  scoreResult.value = 0;
}
</script>

<template>
  <div class="space-y-4">
    <!-- Pantalla de Éxito cuando se alcanza el 100% -->
    <div
      v-if="quizFinished && scoreResult === 100"
      class="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 text-center space-y-4 shadow-sm"
    >
      <div class="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-3xl font-bold shadow-inner">
        🎉
      </div>
      <div>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900 mb-2">
          ¡Puntaje Perfecto: 100%!
        </span>
        <h3 class="text-xl font-black text-emerald-950">
          ¡Felicitaciones! Has aprobado el Quiz
        </h3>
        <p class="text-sm text-emerald-800 mt-2">
          Has demostrado dominar los conceptos clave de este módulo. El formulario de tu plan de negocio ha sido desbloqueado.
        </p>
      </div>

      <div class="pt-3 space-y-2">
        <AppButton
          variant="primary"
          @click="$emit('continue-to-form')"
        >
          Llenar Formulario del Plan →
        </AppButton>
        <button
          type="button"
          @click="resetQuiz"
          class="text-xs text-emerald-700 font-semibold underline hover:text-emerald-900 py-2"
        >
          Repasar preguntas nuevamente
        </button>
      </div>
    </div>

    <!-- Pantalla de Resultado cuando no se alcanzó el 100% -->
    <div
      v-else-if="quizFinished && scoreResult < 100"
      class="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 text-center space-y-4 shadow-sm"
    >
      <div class="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
        📝
      </div>
      <div>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900 mb-2">
          Resultado: {{ scoreResult }}% de aciertos
        </span>
        <h3 class="text-xl font-black text-amber-950">
          Casi lo logras. ¡Reintentemos!
        </h3>
        <p class="text-sm text-amber-800 mt-2">
          Para desbloquear el formulario debes alcanzar el 100% de aciertos. Tienes intentos ilimitados.
        </p>
      </div>

      <div class="pt-3">
        <AppButton
          variant="secondary"
          @click="resetQuiz"
        >
          Reintentar Quiz Ahora 🔄
        </AppButton>
      </div>
    </div>

    <!-- Preguntas en Curso (Una a una) -->
    <div v-else class="space-y-4">
      <!-- Indicador superior de progreso del quiz -->
      <div class="flex items-center justify-between px-1">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Pregunta {{ currentIndex + 1 }} de {{ questions.length }}
        </span>
        <span class="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          Requisito: 100%
        </span>
      </div>

      <!-- Tarjeta de la Pregunta -->
      <article class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <p class="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {{ currentQuestion.question }}
        </p>

        <!-- Botones táctiles amplios Verdadero / Falso (min 48px) -->
        <div class="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            :disabled="!!currentFeedback"
            @click="handleSelectOption('V')"
            class="min-h-[52px] px-4 py-3.5 rounded-xl font-bold text-base sm:text-lg transition-all border-2 flex items-center justify-center gap-2 active:scale-[0.98]"
            :class="[
              currentFeedback?.selected === 'V'
                ? currentFeedback.isCorrect
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                  : 'bg-red-600 border-red-600 text-white shadow-md'
                : 'bg-white border-slate-300 text-slate-800 hover:border-blue-500 hover:bg-blue-50/30',
              currentFeedback ? 'cursor-default' : 'hover:shadow'
            ]"
          >
            <span>Verdadero (V)</span>
          </button>

          <button
            type="button"
            :disabled="!!currentFeedback"
            @click="handleSelectOption('F')"
            class="min-h-[52px] px-4 py-3.5 rounded-xl font-bold text-base sm:text-lg transition-all border-2 flex items-center justify-center gap-2 active:scale-[0.98]"
            :class="[
              currentFeedback?.selected === 'F'
                ? currentFeedback.isCorrect
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                  : 'bg-red-600 border-red-600 text-white shadow-md'
                : 'bg-white border-slate-300 text-slate-800 hover:border-blue-500 hover:bg-blue-50/30',
              currentFeedback ? 'cursor-default' : 'hover:shadow'
            ]"
          >
            <span>Falso (F)</span>
          </button>
        </div>

        <!-- Contenedor con Retroalimentación Pedagógica Inmediata -->
        <div
          v-if="currentFeedback"
          class="rounded-xl p-4 border transition-all animate-fadeIn"
          :class="[
            currentFeedback.isCorrect
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-red-50 border-red-300 text-red-950'
          ]"
        >
          <div class="flex items-start gap-2.5">
            <span class="text-xl select-none leading-none mt-0.5">
              {{ currentFeedback.isCorrect ? '✅' : '❌' }}
            </span>
            <div class="text-sm space-y-1">
              <strong class="font-bold block">
                {{ currentFeedback.isCorrect ? '¡Respuesta Correcta!' : 'Respuesta Incorrecta' }}
              </strong>
              <p class="text-xs sm:text-sm leading-relaxed opacity-95">
                {{ currentFeedback.explanation }}
              </p>
            </div>
          </div>

          <!-- Botón de reintento inmediato si se equivocó -->
          <div v-if="!currentFeedback.isCorrect" class="mt-3 text-right">
            <button
              type="button"
              @click="handleRetryQuestion"
              class="px-3.5 py-2 min-h-[40px] text-xs font-bold rounded-lg bg-red-100 text-red-900 hover:bg-red-200 border border-red-300 transition-colors"
            >
              Probar de nuevo ↩
            </button>
          </div>
        </div>
      </article>

      <!-- Botón para avanzar a la siguiente pregunta -->
      <div v-if="currentFeedback?.isCorrect" class="pt-2">
        <AppButton
          variant="primary"
          @click="nextQuestion"
        >
          {{ isLastQuestion ? 'Finalizar y Calificar Quiz →' : 'Siguiente Pregunta →' }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
