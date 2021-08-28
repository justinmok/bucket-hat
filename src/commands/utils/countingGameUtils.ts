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

const piArray = '3141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067'.split('').forEach((o, i, a: any) => a[i] = parseInt(a[i]));
const primeArray = '2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 53 59 61 67 71 73 79 83 89 97 101 103 107 109 113 127 131 137 139 149 151 157 163 167 173 179 181 191 193 197 199 211 223 227 229 233 239 241 251 257 263 269 271 277 281 283 293 307 311 313 317 331 337 347 349 353 359 367 373 379 383 389 397 401 409 419 421 431 433 439 443 449 457 461 463 467 479 487 491 499 503 509 521 523 541 547 557 563 569 571 577 587 593 599 601 607 613 617 619 631 641 643 647 653 659 661 673 677 683 691 701 709 719 727 733 739 743 751 757 761 769 773 787 797 809 811 821 823 827 829 839 853 857 859 863 877 881 883 887 907 911 919 929 937 941 947 953 967 971 977 983 991 997'.split(' ').forEach((o, i, a: any) => a[i] = parseInt(a[i]));

interface countingGameConfig {
    gamemode: Gamemodes,
    modifiers: GamemodeModifiers,
    channel: GuildChannel,
    multiple: number,
}

export class countingGame { 
    public gamemode: Gamemodes;
    public modifiers: GamemodeModifiers;
    public channel: GuildChannel;
    public multiple: number;
    public count: number;

    public constructor(config: countingGameConfig) {
        Object.assign(this, config)
        switch (config.gamemode) {
            case Gamemodes.ODDS:
                this.count = 1;
            case Gamemodes.PI:
            case Gamemodes.PRIMES:
                this.count = 3;
        }
    }

    get channelId() {
        return this.channel.id;
    }

    public setGamemode(gamemode: Gamemodes): Promise<countingGame>  {
        return new Promise<countingGame>((resolve) => {
            this.gamemode = gamemode;
            resolve(this);
        });
    }

    public setModifiers(modifiers: GamemodeModifiers): Promise<countingGame>  {
        return new Promise<countingGame>((resolve) => {
            this.modifiers = modifiers;
            resolve(this);
        });
    }

    public setCount(count: number): Promise<countingGame> {
        return new Promise<countingGame>((resolve) => {
            this.count = count;
            resolve(this);
        });
    }

    public resetCount(): Promise<countingGame> {
        return new Promise<countingGame>((resolve) => {
            this.count = 0;
            resolve(this);
        });
    }

    public computeNextNumber(): number {
        switch (this.gamemode) {
            case Gamemodes.NORMAL:
                return(this.count + 1)
            case Gamemodes.MULTIPLES:
                return (this.multiple  * (this.count + 1));
            case Gamemodes.ODDS:
            case Gamemodes.EVENS:
                return (this.count + 2);
            case Gamemodes.PRIMES:
                return (primeArray[this.count + 1]); // actually thought about computing primes but why work hard when you can work smart
            case Gamemodes.PI:
                return (piArray[this.count + 1]);
        }
    }
}