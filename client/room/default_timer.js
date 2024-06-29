import { GameMode } from 'pixel_combats/room';

// Константы, времении
var PARAMETER_GAME_LENGTH = 'default_game_mode_length';

// Длинна матча, каждого раунда
export function game_mode_length_seconds() {
var length = GameMode.Parameters.GetString(PARAMETER_GAME_LENGTH);
switch (length) {
  case 'length_Короткая(2 минуты)': return 240; // 4 min 
  case 'length_Средняя(4 минут)': return 420; // 5 min 
  case 'length_Длинная(7 минут)': return 


