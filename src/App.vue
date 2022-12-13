<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { shuffle } from './utils';
import { GameState, Team, Turn } from './types';
import { useI18n } from 'vue-i18n';
import { nl } from './subjects/nl';
import { en } from './subjects/en';

const { t, locale } = useI18n();

watch(() => locale.value, (value) => {
  localStorage.locale = value;
})

const SECONDS = 30;
const subjects = computed(() => new Set(locale.value === 'nl' ? nl : en));
const chosenSubjects = ref<string[]>([]);
const alreadyPickedSubjects = ref<string[]>([]);
const teamSize = ref(2);

const maxScore = ref(15);

// Single team data
const name = ref(
  // 'Team 3'
  ''
);
const playerData = ref(Array.from({ length: teamSize.value }, () => ''));

watch(() => teamSize.value, (newVal, oldVal) => {
  if (newVal > oldVal) {
    playerData.value = [...playerData.value, ...Array.from({ length: newVal - oldVal }, () => '')];
  } else {
    playerData.value = playerData.value.slice(0, newVal);
  }
});

const turn = ref<Turn>({ teamIndex: 0, playerIndex: 0 });
const currentPlayer = computed(() => teams.value[turn.value.teamIndex].players[turn.value.playerIndex])
const guessedSubjects = ref([]);

function nextPlayer({ teamIndex, playerIndex }: Turn, numTeams: number, numPlayers: number) {
  // Increase the team index.
  teamIndex = (teamIndex + 1) % numTeams;
  // If the team index is 0, it means that every team has had its turn, so we need to increment the player index.
  if (teamIndex === 0) {
    playerIndex = (playerIndex + 1) % numPlayers;
  }

  return { teamIndex, playerIndex };
}

const gameState = ref(GameState.Setup);

// State
const teams = ref<Team[]>([
  // { name: 'Team 1', players: ['Player 1 team 1', 'Player 2 team 1', 'Player 3 team 1'], score: 0 },
  // { name: 'Team 2', players: ['Player 1 team 2', 'Player 2 team 2', 'Player 3 team 2'], score: 0 },
  // { name: 'Team 3', players: ['Player 1 team 3', 'Player 2 team 3', 'Player 3 team 3'], score: 0 }
]);
const winningTeam = computed(() => teams.value.find(team => team.score >= maxScore.value));
const sortedTeams = computed(() => teams.value.sort((teamA, teamB) => teamB.score - teamA.score));
const teamInputRef = ref<HTMLInputElement | null>(null);
function onAddTeam() {
  teams.value = [...teams.value, { name: name.value, players: playerData.value, score: 0 }];
  name.value = '';
  playerData.value = Array.from({ length: teamSize.value }, () => '');
  teamInputRef.value?.focus();
}

function onClickPlay() {
  gameState.value = GameState.PlayerReady;
}

function onClickReady() {
  chosenSubjects.value = shuffle([...subjects.value.values()]
    .filter(
      word => !alreadyPickedSubjects.value.includes(word)
    )).slice(0, 5);
  alreadyPickedSubjects.value = [...alreadyPickedSubjects.value, ...chosenSubjects.value];
  gameState.value = GameState.TurnActive;
  remainingSeconds.value = SECONDS - 1;
  const interval = setInterval(() => {
    remainingSeconds.value--;
  }, 1000);
  setTimeout(() => {
    gameState.value = GameState.GameOver;
    clearInterval(interval);
  }, SECONDS * 1000)
}

function onConfirmScore() {
  teams.value = teams.value.map(team => {
    return team.players.includes(currentPlayer.value) ? {
      ...team,
      score: team.score + guessedSubjects.value.length
    } : team;
  })

  guessedSubjects.value = [];
  if (winningTeam.value) {
    gameState.value = GameState.Victory;

    return;
  }

  turn.value = nextPlayer(turn.value, teams.value.length, teamSize.value);
  gameState.value = GameState.PlayerReady;
}

function onPlayAgain() {
  // Reset teams' scores
  teams.value = teams.value.map(team => ({ ...team, score: 0 }));
  turn.value = { teamIndex: 0, playerIndex: 0 };
  gameState.value = GameState.Setup;
}
const remainingSeconds = ref(0);
const countDownWidth = computed(() => `${(remainingSeconds.value / SECONDS) * 100}%`)
</script>

<template>
  <div class="text-white max-w-screen-sm mx-auto p-4 font-base text-2xl">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-center font-semibold text-2xl">30 Seconds</h1>
      <select v-model="locale" class="bg-yellow-600">
        <option value="en">EN</option>
        <option value="nl">NL</option>
      </select>
    </div>

    <template v-if="gameState === GameState.Setup">
      <form @submit.prevent="onAddTeam" class="flex flex-col">
        <h2 class="font-semibold text-2xl my-2">{{ t('team-size') }}</h2>
        <input class="px-4 py-2 rounded text-black mb-2" type="number" min="2" max="6" step="1" v-model="teamSize"
          required>
        <h2 class="font-semibold text-2xl my-2">{{ t('create-teams') }}</h2>
        <input ref="teamInputRef" class="px-4 py-2 rounded text-black mb-4" type="text" :placeholder="t('team-name')"
          v-model="name" required>
        <input v-for="(_, i) of playerData" class="px-4 py-2 rounded text-black mb-2" type="text"
          :placeholder="`${t('player')} ${i + 1}`" v-model="playerData[i]" />
        <button type="submit" class="bg-yellow-800 rounded p-2 text-white font-semibold">{{ t('create') }}</button>
      </form>
      <h2 class="font-semibold text-2xl mt-2">Teams</h2>
      <div v-for="team of teams" class="ml-2">
        <h3 class="italic">{{ team.name }}</h3>
        <div class="text-sm ml-4">
          <ul>
            <li v-for="player of team.players">{{ player }}</li>
          </ul>
        </div>
      </div>

      <h2 class="font-semibold text-2xl my-2">Max. score</h2>
      <form @submit.prevent="onClickPlay" class="text-gray-900 flex flex-col">
        <input class="px-4 py-2 rounded text-black mb-2" type="number" placeholder="Max. score" v-model="maxScore">
        <button :disabled="teams.length === 0" type="submit"
          class="bg-yellow-800 disabled:bg-gray-700 rounded py-2 px-4 my-2 text-white font-semibold">
          {{ t('play') }}
        </button>
      </form>

    </template>

    <template v-if="gameState === GameState.PlayerReady">
      <div class="text-center flex flex-col">
        <h2 class="font-semibold text-5xl my-8">{{ currentPlayer }} <br> {{ t('are-you-ready') }}</h2>
        <h2 class="font-semibold text-2xl my-2">Scores</h2>
        <div class="grid grid-cols-2 mb-6">
          <template v-for="team of teams">
            <div class="font-semibold">{{ team.name }}</div>
            <div>{{ team.score }}</div>
          </template>
        </div>
        <button @click="onClickReady" class="bg-yellow-800 rounded py-2 px-4 my-2 text-white font-semibold">
          Start
        </button>
      </div>
    </template>

    <template v-if="(gameState === GameState.TurnActive)">
      <h2 class="font-semibold text-5xl mt-12 mb-4 text-center">{{ currentPlayer }}</h2>
      <div class="mt-10 flex flex-col bg-white px-6 py-8 rounded-lg shadow-lg text-black">
        <ul class="space-y-8">
          <li v-for="chosenSubject of chosenSubjects">{{ chosenSubject }}</li>
        </ul>
      </div>
      <!-- countdown -->
      <div class="relative py-8">
        <div class="absolute w-full h-4 bg-yellow-500 rounded-lg"></div>
        <div class="absolute h-4 bg-yellow-700 transition-all duration-1000 ease-linear rounded-lg"
          :style="{ width: countDownWidth }"></div>
      </div>
    </template>

    <template v-if="gameState === GameState.GameOver">
      <h2 class="font-semibold text-4xl my-8 text-center">Game over!</h2>
      <form @submit.prevent="onConfirmScore"
        class="flex flex-col bg-white px-6 py-8 rounded-lg shadow-lg text-black space-y-4">
        <div v-for="chosenSubject of chosenSubjects">
          <input class="ml-2 mr-4" v-model="guessedSubjects" type="checkbox" :value="chosenSubject"
            :name="chosenSubject" :id="chosenSubject">
          <label :for="chosenSubject" class="tracking-wide"> {{ chosenSubject }}

          </label>
        </div>
        <button type="submit" class="bg-yellow-800 rounded py-2 px-4 my-2 text-white font-semibold">{{ t('confirm')
        }}</button>
      </form>
    </template>
    <template v-if="gameState === GameState.Victory">
      <div class="flex flex-col space-y-6 mt-12">
        <h2 class="text-4xl text-center font-semibold">{{ winningTeam?.name }} {{ t('won') }}!</h2>
        <h2 class="text-2xl text-center font-semibold">{{ t('result') }}</h2>
        <div class="grid grid-cols-2 text-center">
          <template v-for="team of sortedTeams">
            <div>{{ team.name }}</div>
            <div>{{ team.score }}</div>
          </template>
        </div>
        <button @click="onPlayAgain" class="bg-yellow-800 rounded py-2 px-4 my-2 text-white">{{ t('play-again')
        }}</button>
      </div>
    </template>
  </div>
</template>


<style scoped>

</style>
