import { Tile } from '../components/Tile'

interface MatchResult {
    tiles: Tile[];
    type: 'match3' | 'match4' | 'match5' | 'matchL' | 'matchT' | 'special-row' | 'special-column'|'special-candy';
    direction: 'horizontal' | 'vertical' | 'cross';
    centerTile?: Tile; 
    specialActivation?: {
        activatorTiles: Tile[];
        effectType: 'row' | 'column' | 'match5' | 'cross'|'candy';
        centerPosition?: { x: number; y: number };
    };
}
interface HintMove {
    tile1: Tile;
    tile2: Tile;
    matchResult: MatchResult[];
}
interface Match {
    horizontal: Tile[];
    vertical: Tile[];
}
export type Movement = {
    tile: Tile,
    from: {
        x : number,
        y : number
    },
    to: {
        x : number,
        y : number
    },
}