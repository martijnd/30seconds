<script setup lang="ts">
import { ref } from 'vue';

const subjects = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const chosenSubjects = ref<number[]>([]);
const gameStarted = ref(false);
const playerReady = ref(false);
const gameOver = ref(false);
const player = ref('');
const name = ref('a');
const input1 = ref('b');
const input2 = ref('c');
const teams = ref<{ name: string, player1: string, player2: string, score: number }[]>([]);
const teamTurnIndex = ref(0);
const score = ref(0);

function shuffle<T>(array: T[]) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

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
  teams.value = [...teams.value, { name: name.value, player1: input1.value, player2: input2.value, score: 0 }];
  name.value = '';
  input1.value = '';
  input2.value = '';
}

function onClickPlay() {
  playerReady.value = false;
  gameStarted.value = true;
  player.value = teams.value[teamTurnIndex.value % teams.value.length].player1;
}

function onClickReady() {
  chosenSubjects.value = shuffle(subjects).slice(0, 5);
  playerReady.value = true;
  setTimeout(() => {
    gameOver.value = true;
    gameStarted.value = false;
    playerReady.value = false;
  }, 1 * 1000)
}

function onConfirmScore(e: Event) {
  console.log(score.value);
  teams.value = teams.value.map(team => {
    return team.player1 === player.value || team.player2 === player.value ? {
      ...team,
      score: team.score + 1
    } : team;
  })
}

function onChange(e: any) {
  console.log(e.target.value)
  if (e.target.value === 'on') {
    score.value++;
  } else {
    score.value--;
  }
}
</script>

<template>
  <div class="text-white max-w-screen-md mx-auto">
    <h1 class="text-white text-center mb-4">30 Seconds</h1>
    <template v-if="(!gameStarted && !gameOver)">
      <form @submit.prevent="onSubmit" class="flex flex-col space-y-2 text-gray-900">
        <input type="text" placeholder="Team name" v-model="name">
        <input type="text" placeholder="Player 1" v-model="input1">
        <input type="text" placeholder="Player 2" v-model="input2">
        <button class="bg-blue-400 rounded p-2 my-2">Save</button>
      </form>

      <h2 class="font-semibold">Teams</h2>
      <div v-for="team of teams">
        {{ team.name }}
      </div>
      <button @click="() => onClickPlay()" class="bg-blue-400 rounded py-2 px-4 my-2">Play</button>

    </template>

    <template v-if="(gameStarted && !playerReady)">
      <h2>{{ player }} ready?</h2>

      <h2>Scores</h2>

      <ul>
        <li v-for="team of teams">{{ team.name }}: {{ team.score }}</li>
      </ul>

      <button @click="() => onClickReady()" class="bg-blue-400 rounded py-2 px-4 my-2">Ready</button>
    </template>

    <template v-if="(gameStarted && playerReady)">
      <ul>
        <li v-for="chosenSubject of chosenSubjects">{{ chosenSubject }}</li>
      </ul>
    </template>

    <template v-if="gameOver">
      Game over!
      <div class="flex flex-col">
        <form @submit.prevent="onConfirmScore" class="space-x-2">

          <template v-for="chosenSubject of chosenSubjects">

            <input true-value="true" false-value="false" @change="onChange" type="checkbox"
              :name="chosenSubject.toString()" :id="chosenSubject.toString()">
            <label :for="chosenSubject.toString()"> {{ chosenSubject }}

            </label>
          </template>
          <button type="submit" class="bg-blue-400 rounded py-2 px-4 my-2">Submit</button>
        </form>
      </div>
    </template>
  </div>
</template>

<style scoped>

</style>
