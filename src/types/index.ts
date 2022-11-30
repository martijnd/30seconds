export enum GameState {
  Setup,
  PlayerReady,
  TurnActive,
  GameOver,
  Victory,
}

export interface Team {
  name: string;
  player0: string;
  player1: string;
  score: number;
}

export interface Turn {
  teamIndex: number;
  playerIndex: 0 | 1;
}
