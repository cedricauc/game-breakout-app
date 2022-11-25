const PORT = process.env.PORT || 5000;
const ONE_DAY = 1000 * 60 * 60 * 24;
const RESPONSES_FILE_PATH = './datas/response_dataset.csv';
const RESPONSES_INPUT_KEY = 'input';
const RESPONSES_OUTPUT_KEY = 'output';
const RESPONSES_ORBITS_KEY = 'orbit';
// Bot server events
const USER_MESSAGE_EVENT = 'user-message';
// Bot client events
const BOT_MESSAGE_EVENT = 'bot-message';
const BOT_TYPING_EVENT = 'bot-typing';

// Canvas server events
const PLAYER_DATA_EVENT = 'player-data';
const COLLISION_DETECTION_EVENT = 'collision-detection';
const GAME_WIN_EVENT = 'game-win';
const GAME_OVER_EVENT = 'game-over';
const PLAY_AGAIN_EVENT = 'play-again';
const DISCONNECT_EVENT = 'disconnect';
// Canvas client events
const JOIN_ROOM_EVENT = 'join-room'
const PLAY_EVENT = 'play'
const PLAY_AGAIN_WAITING_AREA_EVENT = 'play-again-waiting-area'

// Bot Natural Defaults
const DEFAULT_RESPONSE = 'Désolé, je n\'ai pas bien compris.';
const RESPONSE_MATCH_THRESHOLD = 0.4;

module.exports = {
    PORT,
    ONE_DAY,
    RESPONSES_FILE_PATH,
    RESPONSES_INPUT_KEY,
    RESPONSES_OUTPUT_KEY,
    RESPONSES_ORBITS_KEY,
    PLAYER_DATA_EVENT,
    COLLISION_DETECTION_EVENT,
    GAME_WIN_EVENT,
    GAME_OVER_EVENT,
    PLAY_AGAIN_EVENT,
    DISCONNECT_EVENT,
    JOIN_ROOM_EVENT,
    PLAY_EVENT,
    PLAY_AGAIN_WAITING_AREA_EVENT,
    USER_MESSAGE_EVENT,
    BOT_MESSAGE_EVENT,
    BOT_TYPING_EVENT,
    DEFAULT_RESPONSE,
    RESPONSE_MATCH_THRESHOLD
};
