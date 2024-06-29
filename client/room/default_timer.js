import { GameMode } from 'pixel_combats/room';

// Константы, времении
var PARAMETER_GAME_LENGTH = 'default_game_mode_length';

// Длинна матча, каждого раунда
export function game_mode_length_seconds() {
var length = GameMode.Parameters.GetString(PARAMETER_GAME_LENGTH);
switch (length) {
  case 'length_КОРОТКАЯ(2 МИНУТЫ)': return 240; // 2 min 
  case 'length_СРЕДНЯЯ(4 МИНУТЫ)': return 420; // 4 min
  case 'length_ДЛИННАЯ(7 МИНУТ)': return 520; // 5 min
}
return 300;
}


