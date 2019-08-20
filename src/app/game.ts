import axios from 'axios'
import { BehaviorSubject } from 'rxjs';

export class Game {

    private pitches = [];
    private players: {[key: string]: string;} = {};
    private intializedSubject = new BehaviorSubject<boolean>(false);
    
    public initialized$ = this.intializedSubject.asObservable(); 
    public number: number;
    public date: string;

    constructor(id: number) {
        axios.all([
            axios.get(`https://raw.githubusercontent.com/rd-astros/hiring-resources/master/players.json`),
            axios.get(`https://raw.githubusercontent.com/rd-astros/hiring-resources/master/game_${id}.json`)
        ]).then(axios.spread((playersResponse, gameResponse) => {
            this.players = playersResponse.data.queryResults.row.reduce((accumulator, player) => {
                return {...accumulator, [player._player_id]: player._player};
            });
            this.pitches = gameResponse.data.queryResults.row;
            if (this.pitches.length > 0) {
                this.number = this.pitches[0]._game_nbr;
                this.date = new Date(this.pitches[0]._game_date).toLocaleDateString("en-US");
            }
            this.intializedSubject.next(true);
        })).catch(function (error) {
            console.log(error);
        });;
    }

    public getStatsByPersonnelPairing(inning: number) {
        const pairings: Map<string, any> = new Map();
        const inningPithes = this.pitches.filter(item => Number(item._inning) === inning);

        inningPithes.forEach(item => {
            const stats = {
                pairing_id: `${item._batter_id}.${item._pitcher_id}`,
                outs: item._outs,
                event: item._event_type,
                strikes: item._strikes};

            const pairing = pairings.get(stats.pairing_id);
            if (!pairing) {
                pairings.set(stats.pairing_id, {
                    hitter: this.players[item._batter_id],
                    pitcher: this.players[item._pitcher_id], 
                    statistics: [stats]
                })
            } else {
                pairing.statistics.push(stats);
            }
        });

        return pairings;
    }
}