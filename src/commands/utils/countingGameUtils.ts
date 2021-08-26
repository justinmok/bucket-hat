import type { GuildChannel } from 'discord.js';

enum Gamemodes {
    NORMAL = 'Normal',
    MULTIPLES = 'Multiples',
    ODDS = 'Odds',
    EVENS = 'Evens',
    PRIMES = 'Primes',
    PI = 'Pi'
}

enum GamemodeModifiers {
    SECOND_CHANCE = 'Second Chance'
}

interface countingGameConfig {
    gamemode: Gamemodes,
    modifiers: GamemodeModifiers,
    channel: GuildChannel
}

export class countingGame { 
    public gamemode: Gamemodes;
    public modifiers: GamemodeModifiers;
    public channel: GuildChannel;
    public count: number;

    public constructor(config: countingGameConfig) {
        Object.assign(this, config)
    }

    get channelId() {
        return this.channel.id;
    }

    public setGamemode(gamemode: Gamemodes): Promise<countingGame>  {
        return new Promise<countingGame>((resolve, reject) => {
            this.gamemode = gamemode;
        });
    }

    public setModifiers(modifiers: GamemodeModifiers): Promise<countingGame>  {
        return new Promise<countingGame>((resolve, reject) => {
            this.modifiers = modifiers;
        });
    }

    public setCount(count: number): Promise<countingGame> {
        return new Promise<countingGame>((resolve, reject) => {
            count = count
        });
    }

    public resetCount(): Promise<countingGame> {
        return new Promise<countingGame>((resolve) => {
            this.count = 0;
            resolve(this);
        });
    }
}