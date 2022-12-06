import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { createI18n } from "vue-i18n";

const messages = {
  nl: {
    "create-teams": "Team aanmaken",
    "team-size": "Spelers per team",
    "team-name": "Teamnaam",
    create: "Toevoegen",
    player: "Speler",
    play: "Spelen",
    "are-you-ready": "ben je er klaar voor?",
    won: "heeft gewonnen",
    confirm: "Bevestigen",
    "play-again": "Opnieuw",
  },
  en: {
    "create-teams": "Create team",
    "team-size": "Players per team",
    "team-name": "Team name",
    create: "Add team",
    player: "Player",
    play: "Play",
    "are-you-ready": "are you ready?",
    won: "won",
    confirm: "Confirm",
    "play-again": "Play again",
  },
};

const i18n = createI18n({
  legacy: false,
  locale: localStorage.locale ?? "nl",
  fallbackLocale: "en",
  messages,
});

const app = createApp(App);

app.use(i18n);

app.mount("#app");
