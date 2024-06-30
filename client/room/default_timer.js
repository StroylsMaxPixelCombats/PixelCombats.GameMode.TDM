// Библиотека для работы, командных матчей ТДМ

import { GameMode } from 'pixel_combats/room';

// Константы, времении
const PARAMETER_GAME_LENGTH = 'default_game_mode_length';

// Длительность матча, выборного для игрока 
export function game_mode_length_seconds() {
    const length = GameMode.Parameters.GetString(PARAMETER_GAME_LENGTH);
    switch (length) {
        case 'Length_КОРОТКАЯ': return 140; // 1 min
        case 'Length_СРЕДНЯЯ': return 450; // 4 min
        case 'Length_ДЛИННАя': return 360; // 6 min
        case 'Length_ДЛИТЕЛЬНАЯ': return 420; // 7 min
    }
    return 300;
}
