/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

export class Sound {
    constructor() {
        this.sounds = {
            game_start: new BufferSource("/v3/assets/sounds/game_start.mp3"), // ok
            game_over: new BufferSource("/v3/assets/sounds/game_end.mp3"), // ok
            move: new BufferSource("/v3/assets/sounds/move.mp3", 0.6), // ok
            take_piece: new BufferSource("/v3/assets/sounds/take_piece.mp3", 0.7), // ok
            castle: new BufferSource("/v3/assets/sounds/guitar_theoldcastle.mp3", 0.2),
            wrong_move: new BufferSource("/v3/assets/sounds/player_stomp_enemy.mp3", 0.3),
            promote: new BufferSource("/v3/assets/sounds/1up_001.mp3", 0.2),
            check: new BufferSource("/v3/assets/sounds/coin_001.mp3", 0.3),
            undo: new BufferSource("/v3/assets/sounds/swim_fly_001.mp3", 0.5),
            send: new BufferSource("/v3/assets/sounds/click3.mp3", 1.8)
        };
    }
}