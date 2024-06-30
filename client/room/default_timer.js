import { GameMode } from 'pixel_combats/room';

// Константы, времении
var PARAMETER_GAME_LENGTH = 'default_game_mode_length';

// Длинна матча, каждого раунда
export function game_mode_length_seconds() {
var length = GameMode.Parameters.GetString(PARAMETER_GAME_LENGTH);
switch (length) {
  case 'length_КОРОТКАЯ': return 240; // 2 min 
  case 'length_СРЕДНЯЯ': return 450; // 5 min
  case 'length_ДЛИННАЯ': return 750; // 7 min
}
return 300;
}


