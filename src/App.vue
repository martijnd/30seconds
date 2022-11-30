<script setup lang="ts">
import { computed, ref } from 'vue';

const subjects = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => n.toString());
const chosenSubjects = ref<string[]>([]);

const maxScore = ref(15);

// Single team data
const name = ref('Team 3');
const input1 = ref('Player 5');
const input2 = ref('Player 6');

const turn = ref<Turn>({ teamIndex: 0, playerIndex: 0 });

interface Turn {
  teamIndex: number;
  playerIndex: 0 | 1;
}

function getNewIndices({ teamIndex, playerIndex }: Turn, amountOfTeams: number): Turn {
  if (teamIndex === amountOfTeams && playerIndex === 1) {
    return { teamIndex: 0, playerIndex: 0 }
  }
  if (teamIndex === amountOfTeams - 1) {
    return { teamIndex: 0, playerIndex: playerIndex === 1 ? 0 : 1 }
  }
  return { teamIndex: teamIndex + 1, playerIndex }
}

enum GameState {
  Setup,
  PlayerReady,
  TurnActive,
  GameOver,
  Victory,
}

const gameState = ref(GameState.Setup);

interface Team {
  name: string;
  player0: string;
  player1: string;
  score: number;
}

// State
const teams = ref<Team[]>([
  { name: 'Team 1', player0: 'Player 1', player1: 'Player 2', score: 0 },
  { name: 'Team 2', player0: 'Player 3', player1: 'Player 4', score: 0 }
]);
const winningTeam = computed(() => teams.value.find(team => team.score >= maxScore.value));

function shuffle<T>(array: T[]) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function onSubmit() {
  teams.value = [...teams.value, { name: name.value, player0: input1.value, player1: input2.value, score: 0 }];
  name.value = '';
  input1.value = '';
  input2.value = '';
}

function onClickPlay() {
  gameState.value = GameState.PlayerReady;
}

const currentPlayer = computed(() => teams.value[turn.value.teamIndex][`player${turn.value.playerIndex}`])

function onClickReady() {
  chosenSubjects.value = shuffle(subjects).slice(0, 5);
  gameState.value = GameState.TurnActive;
  setTimeout(() => {
    gameState.value = GameState.GameOver
  }, 1 * 1000)
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

const guessedSubjects = ref([]);

function onPlayAgain() {
  // Reset teams' scores
  teams.value = teams.value.map(team => ({ ...team, score: 0 }));
  turn.value = { teamIndex: 0, playerIndex: 0 };
  gameState.value = GameState.Setup;
}

</script>

<template>
  <div class="text-white max-w-screen-md mx-auto p-4">
    <h1 class="text-white text-center mb-4">30 Seconds</h1>

    <template v-if="gameState === GameState.Setup">
      <form @submit.prevent="onSubmit" class="flex flex-col space-y-2 text-gray-900">
        <input class="px-4 py-2 rounded" type="text" placeholder="Team name" v-model="name">
        <input class="px-4 py-2 rounded" type="text" placeholder="Player 1" v-model="input1">
        <input class="px-4 py-2 rounded" type="text" placeholder="Player 2" v-model="input2">
        <button class="bg-blue-400 rounded p-2 my-2 text-white">Add team</button>
      </form>
      <h2 class="font-semibold text-xl my-2">Teams</h2>
      <div v-for="team of teams">
        {{ team.name }}
      </div>

      <h2 class="font-semibold text-xl my-2">Max. score</h2>
      <form @submit.prevent="onClickPlay" class="text-gray-900 flex flex-col">
        <input class="px-4 py-2 rounded" type="number" placeholder="Max. score" v-model="maxScore">
        <button type="submit" class="bg-blue-400 rounded py-2 px-4 my-2 text-white">Play</button>
      </form>

    </template>

    <template v-if="gameState === GameState.PlayerReady">
      <h2>Give the phone to {{ currentPlayer }}</h2>

      <h2>Scores</h2>

      <ul>
        <li v-for="team of teams">{{ team.name }}: {{ team.score }}</li>
      </ul>

      <button @click="onClickReady" class="bg-blue-400 rounded py-2 px-4 my-2 text-white">Ready</button>
    </template>

    <template v-if="(gameState === GameState.TurnActive)">
      <ul>
        <li v-for="chosenSubject of chosenSubjects">{{ chosenSubject }}</li>
      </ul>
    </template>

    <template v-if="gameState === GameState.GameOver">
      Game over!
      <form @submit.prevent="onConfirmScore" class="space-x-2">

        <template v-for="chosenSubject of chosenSubjects">
          <input v-model="guessedSubjects" type="checkbox" :value="chosenSubject" :name="chosenSubject"
            :id="chosenSubject">
          <label :for="chosenSubject"> {{ chosenSubject }}

          </label>
        </template>
        <button type="submit" class="bg-blue-400 rounded py-2 px-4 my-2 text-white">Submit</button>
      </form>
    </template>
    <template v-if="gameState === GameState.Victory">
      {{ winningTeam?.name }} won!
      <button @click="onPlayAgain" class="bg-blue-400 rounded py-2 px-4 my-2 text-white">Play again</button>
    </template>
  </div>
</template>


<style scoped>

</style>
