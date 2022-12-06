export enum GameState {
  Setup,
  PlayerReady,
  TurnActive,
  GameOver,
  Victory,
}

export interface Team {
  name: string;
  players: string[];
  score: number;
}

export interface Turn {
  teamIndex: number;
  playerIndex: number;
}
