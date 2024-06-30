import { GameMode } from 'pixel_combats/room';

// Константы, времении
var PARAMETER_GAME_LENGTH = 'default_game_mode_length';

// Длинна матча, каждого раунда
export function game_mode_length_seconds() {
var length = GameMode.Parameters.GetString(PARAMETER_GAME_LENGTH);
switch (length) {
  case 'length_КОРОТКАЯ': return 230; // 4 min 
  case 'length_СРЕДНЯЯ': return 520; // 5 min
  case 'length_ДЛИННАЯ': return 720; // 6 min
  case 'length_ДЛИТЕЛЬНАЯ': return 850; // 7 min
}
return 300;
}


