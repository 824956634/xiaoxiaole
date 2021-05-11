export enum STATE {
    NORMAL,
    PRECHECK,
    PRECANCEL,
    PRECLEAR,
    MOVE,
    CLEARED
}

export class Game {
    static getRandonInt(min, max) {
        return Math.floor(Math.random() * (max - min) + min)
    }
}