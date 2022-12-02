<script setup lang="ts">
import { computed, ref } from 'vue';
import { shuffle } from './utils';
import { GameState, Team, Turn } from './types';

const subjects = [
  'Twilight saga',
  'Finding Nemo',
  'Robert ten Brink',
  'Marco van Basten',
  'Radio 538',
  'Venco',
  'JK Rowling',
  'Sloffen',
  'Cameron Diaz',
  'De Fabeltjeskrant',
  'The Joker'];
const chosenSubjects = ref<string[]>([]);

const maxScore = ref(15);

// Single team data
const name = ref('Team 3');
const input1 = ref('Player 5');
const input2 = ref('Player 6');

const turn = ref<Turn>({ teamIndex: 0, playerIndex: 0 });
const currentPlayer = computed(() => teams.value[turn.value.teamIndex][`player${turn.value.playerIndex}`])
const guessedSubjects = ref([]);

function getNewIndices({ teamIndex, playerIndex }: Turn, amountOfTeams: number): Turn {
  if (teamIndex === amountOfTeams && playerIndex === 1) {
    return { teamIndex: 0, playerIndex: 0 }
  }
  if (teamIndex === amountOfTeams - 1) {
    return { teamIndex: 0, playerIndex: playerIndex === 1 ? 0 : 1 }
  }
  return { teamIndex: teamIndex + 1, playerIndex }
}

const gameState = ref(GameState.Setup);

// State
const teams = ref<Team[]>([
  { name: 'Team 1', player0: 'Player 1', player1: 'Player 2', score: 0 },
  { name: 'Team 2', player0: 'Player 3', player1: 'Player 4', score: 0 }
]);
const winningTeam = computed(() => teams.value.find(team => team.score >= maxScore.value));
const sortedTeams = computed(() => teams.value.sort((teamA, teamB) => teamB.score - teamA.score));
const teamInputRef = ref<HTMLInputElement | null>(null);
function onAddTeam() {
  teams.value = [...teams.value, { name: name.value, player0: input1.value, player1: input2.value, score: 0 }];
  name.value = '';
  input1.value = '';
  input2.value = '';
  teamInputRef.value?.focus();
}

function onClickPlay() {
  gameState.value = GameState.PlayerReady;
}

const SECONDS = 30;

function onClickReady() {
  chosenSubjects.value = shuffle(subjects).slice(0, 5);
  gameState.value = GameState.TurnActive;
  remainingSeconds.value = SECONDS;
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
    return team.player0 === currentPlayer.value || team.player1 === currentPlayer.value ? {
      ...team,
      score: team.score + guessedSubjects.value.length
    } : team;
  })

  guessedSubjects.value = [];
  if (winningTeam.value) {
    gameState.value = GameState.Victory;

    return;
  }

  turn.value = getNewIndices(turn.value, teams.value.length);
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
    <h1 class="text-center mb-4 font-semibold text-2xl">30 Seconds</h1>

    <template v-if="gameState === GameState.Setup">
      <h2 class="font-semibold text-xl my-2">Create teams</h2>
      <form @submit.prevent="onAddTeam" class="flex flex-col space-y-2 text-gray-900">
        <input ref="teamInputRef" class="px-4 py-2 rounded" type="text" placeholder="Team name" v-model="name" required>
        <input class="px-4 py-2 rounded" type="text" placeholder="Player 1" v-model="input1" required>
        <input class="px-4 py-2 rounded" type="text" placeholder="Player 2" v-model="input2" required>
        <button type="submit" class="bg-yellow-800 rounded p-2 my-2 text-white font-semibold">Add team</button>
      </form>
      <h2 class="font-semibold text-xl my-2">Teams</h2>
      <div v-for="team of teams">
        {{ team.name }}
      </div>

      <h2 class="font-semibold text-xl my-2">Max. score</h2>
      <form @submit.prevent="onClickPlay" class="text-gray-900 flex flex-col">
        <input class="px-4 py-2 rounded mb-2" type="number" placeholder="Max. score" v-model="maxScore">
        <button type="submit" class="bg-yellow-800 rounded py-2 px-4 my-2 text-white font-semibold">Play game</button>
      </form>

    </template>

    <template v-if="gameState === GameState.PlayerReady">
      <div class="text-center flex flex-col">
        <h2 class="font-semibold text-5xl my-8">{{ currentPlayer }} <br> are you ready?</h2>
        <h2 class="font-semibold text-2xl my-2">Scores</h2>
        <div class="grid grid-cols-2 mb-6">
          <template v-for="team of teams">
            <div class="font-semibold">{{ team.name }}</div>
            <div>{{ team.score }}</div>
          </template>
        </div>
        <button @click="onClickReady"
          class="bg-yellow-800 rounded py-2 px-4 my-2 text-white font-semibold">Ready</button>
      </div>
    </template>

    <template v-if="(gameState === GameState.TurnActive)">
      <div class="mt-10 flex flex-col bg-white px-6 py-8 rounded-lg shadow-lg text-black">
        <ul class="space-y-8">
          <li v-for="chosenSubject of chosenSubjects">{{ chosenSubject }}</li>
        </ul>
      </div>
      <!-- countdown -->
      <div class="relative mt-8">
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
        <button type="submit" class="bg-yellow-800 rounded py-2 px-4 my-2 text-white font-semibold">Submit</button>
      </form>
    </template>
    <template v-if="gameState === GameState.Victory">
      <div class="flex flex-col space-y-6 mt-12">
        <h2 class="text-4xl text-center font-semibold">{{ winningTeam?.name }} won!</h2>
        <h2 class="text-2xl text-center font-semibold">Final score</h2>
        <div class="grid grid-cols-2 text-center">
          <template v-for="team of sortedTeams">
            <div>{{ team.name }}</div>
            <div>{{ team.score }}</div>
          </template>
        </div>
        <button @click="onPlayAgain" class="bg-yellow-800 rounded py-2 px-4 my-2 text-white">Play again</button>
      </div>
    </template>
  </div>
</template>


<style scoped>

</style>
