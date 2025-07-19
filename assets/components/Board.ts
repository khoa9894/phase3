import { TilePool } from './TilePool';
import { _decorator, Component, instantiate, Prefab, tween, Vec3, type Node } from 'cc'
const { ccclass, property } = _decorator
import GameConfig from '../constants/GameConfig'
import { Tile } from './Tile'

interface MatchResult {
    tiles: Tile[];
    type: 'match3' | 'match4' | 'match5' | 'matchL' | 'matchT';
    direction: 'horizontal' | 'vertical' | 'cross';
    centerTile?: Tile; 
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
@ccclass('Board')
export class Board extends Component {
    private tileGrid: (Tile | undefined)[][] = []
    
    @property(TilePool)
    private TilePool: TilePool | null = null
    
    __preload(): void {
        if (this.TilePool === null) throw new Error('TilePool is not set')
        console.log('Board __preload: All components are properly set')
    }

    createBoard(): void {
        this.TilePool!.createPool()
        this.tileGrid = []
        for (let y = 0; y < GameConfig.GridHeight; y++) {
            this.tileGrid[y] = []
            for (let x = 0; x < GameConfig.GridWidth; x++) {
                this.tileGrid[y][x] = this.TilePool!.addTile(x, y)
            }
        }
    }

    private getTilePosition(coords: { x: number; y: number }): { x: number; y: number } {
        return {
            x:
                (-GameConfig.GridWidth * GameConfig.TileWidth) / 2 +
                GameConfig.TileWidth / 2 +
                coords.x * GameConfig.TileWidth,
            y:
                -(
                    (-GameConfig.GridHeight * GameConfig.TileHeight) / 2 +
                    GameConfig.TileHeight / 2 +
                    coords.y * GameConfig.TileHeight
                ),
        }
    }

    getTileCoords(tile: Tile): { x: number; y: number } {
        for (let y = 0; y < this.tileGrid.length; y++) {
            for (let x = 0; x < this.tileGrid[y].length; x++) {
                if (this.tileGrid[y][x] === tile) {
                    return { x, y }
                }
            }
        }
        return { x: -1, y: -1 }
    }
    private setSpecialTile(tile:Tile,director:string){
        if(director=='horizontal'){
        switch(tile.getTileType()){
            case'orange':
            tile.setTileType('orange-x');
            break;
            case'red':
            tile.setTileType('red-x');
            break;
            case'purple':
            tile.setTileType('purple-x');
            break;
            case'blue':
            tile.setTileType('blue-x');
            break;
            case'green':
            tile.setTileType('green-x');
            break;
             case'yellow':
            tile.setTileType('yellow-x');
            break;
        }}
        if(director=='vertical'){
        switch(tile.getTileType()){
            case'orange':
            tile.setTileType('orange-y');
            break;
            case'red':
            tile.setTileType('red-y');
            break;
            case'purple':
            tile.setTileType('purple-y');
            break;
            case'blue':
            tile.setTileType('blue-y');
            break;
            case'green':
            tile.setTileType('green-y');
            break;
             case'yellow':
            tile.setTileType('yellow-y');
            break;
        }}
    }
    async removeTiles(matchResults: MatchResult[]): Promise<void> {
        const allAnimationPromises: Promise<void>[] = [];
        const tilesToRemove: Tile[] = [];
        
        for (const matchResult of matchResults) {
            switch (matchResult.type) {
            case 'match4':
                tilesToRemove.push(...matchResult.tiles.slice(1));
                break;
            case 'match5':
                tilesToRemove.push(...matchResult.tiles.slice(1));
                break;
            case 'matchL':
            case 'matchT':
                if (matchResult.centerTile) {
                    const remainingTiles = matchResult.tiles.filter(tile => tile !== matchResult.centerTile);
                    tilesToRemove.push(...remainingTiles);
                } else {
                    tilesToRemove.push(...matchResult.tiles.slice(1));
                }
                break;
            default:
                tilesToRemove.push(...matchResult.tiles);
                break;
        }
        }
        
        for (const matchResult of matchResults) {
            switch (matchResult.type) {
                case 'match4':
                    allAnimationPromises.push(this.handleMatch4(matchResult));
                    break;
                case 'match5':
                    allAnimationPromises.push(this.handleMatch5(matchResult));
                    break;
                case 'matchL':
                    allAnimationPromises.push(this.handleMatchL(matchResult));
                    break;
                case 'matchT':
                    allAnimationPromises.push(this.handleMatchT(matchResult));
                    break;
                default:
                    allAnimationPromises.push(this.handleMatch3(matchResult));
                    break;
            }
        }
        
        await Promise.all(allAnimationPromises);
        
        for (const tile of tilesToRemove) {
            const coords = this.getTileCoords(tile);
            if (coords.x !== -1 && coords.y !== -1) {
                this.tileGrid[coords.y][coords.x] = undefined;
            }
            this.TilePool!.Deactivate(tile);
        }
    }

    private async handleMatch3(matchResult: MatchResult): Promise<void> {
        console.log('Match 3 detected!', matchResult.direction);
        
        const promises: Promise<void>[] = [];
        
        for (const tile of matchResult.tiles) {
            promises.push(new Promise<void>((resolve) => {
                tile.vanish();
                setTimeout(() => {
                    resolve();
                }, 300);
            }));
        }
        
        await Promise.all(promises);
    }

    private async handleMatch4(matchResult: MatchResult): Promise<void> {
        console.log('Match 4 detected!', matchResult.direction);
        
        const coords0 = this.getTileCoords(matchResult.tiles[0]);
        const director=matchResult.direction
        this.setSpecialTile(matchResult.tiles[0],director)
        const targetPosition = this.getTilePosition(coords0);
        
        const animationPromises: Promise<void>[] = [];
        
        animationPromises.push(new Promise<void>((resolve) => {
            matchResult.tiles[1].vanish();
            setTimeout(() => {
                resolve();
            }, 10);
        }));
        
        for (let i = 1; i < matchResult.tiles.length; i++) {
            const tile = matchResult.tiles[i];
            
            animationPromises.push(new Promise<void>((resolve) => {
                tween(tile.node)
                    .to(0.4, {
                        position: new Vec3(
                            targetPosition.x,
                            targetPosition.y,
                            tile.node.position.z
                        )
                    }, {
                        easing: 'linear'
                    })
                    .call(() => {
                        tile.vanish();
                        resolve();
                    })
                    .start();
            }));
        }
        
        await Promise.all(animationPromises);
    }

    private async handleMatch5(matchResult: MatchResult): Promise<void> {
        console.log('Match 5 detected!', matchResult.direction);
        
        const promises: Promise<void>[] = [];
        
        for (const tile of matchResult.tiles) {
            promises.push(new Promise<void>((resolve) => {
                tile.vanish();
                setTimeout(() => {
                    resolve();
                }, 500);
            }));
        }
        
        await Promise.all(promises);
    }

    private async handleMatchL(matchResult: MatchResult): Promise<void> {
        console.log('L-shape match detected!');
        
        const promises: Promise<void>[] = [];
        
        for (const tile of matchResult.tiles) {
            promises.push(new Promise<void>((resolve) => {
                tile.vanish();
                setTimeout(() => {
                    resolve();
                }, 400);
            }));
        }
        
        await Promise.all(promises);
    }

    private async handleMatchT(matchResult: MatchResult): Promise<void> {
        console.log('T-shape match detected!');
        
        const promises: Promise<void>[] = [];
        
        for (const tile of matchResult.tiles) {
            promises.push(new Promise<void>((resolve) => {
                tile.vanish();
                setTimeout(() => {
                    resolve();
                }, 400);
            }));
        }
        
        await Promise.all(promises);
    }

    areAdjacent(tile1: Tile, tile2: Tile): boolean {
        const coords1 = this.getTileCoords(tile1)
        const coords2 = this.getTileCoords(tile2)

        const dx = Math.abs(coords1.x - coords2.x)
        const dy = Math.abs(coords1.y - coords2.y)

        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1)
    }

    swapTiles(tile1: Tile, tile2: Tile, onComplete?: () => void): void {
        const coords1 = this.getTileCoords(tile1)
        const coords2 = this.getTileCoords(tile2)

        this.tileGrid[coords1.y][coords1.x] = tile2
        this.tileGrid[coords2.y][coords2.x] = tile1

        tween(tile1.node)
            .to(
                0.4,
                {
                    position: new Vec3(
                        tile2.node.x,
                        tile2.node.y,
                        tile1.node.position.z
                    ),
                },
                {
                    easing: 'linear',
                }
            )
            .start()

        tween(tile2.node)
            .to(
                0.4,
                {
                    position: new Vec3(
                        tile1.node.x,
                        tile1.node.y,
                        tile2.node.position.z
                    ),
                },
                {
                    easing: 'linear',
                }
            )
            .call(() => {
                onComplete?.()
            })
            .start()
    }

    getMatches(): MatchResult[] {
        let visited: boolean[][] = [];
        
        for (let y = 0; y < GameConfig.GridHeight; y++) {
            let row = [];
            for (let x = 0; x < GameConfig.GridWidth; x++) {
                row.push(false);
            }
            visited.push(row);
        }

        let matchResults: MatchResult[] = [];

        for (let y = 0; y < GameConfig.GridHeight; y++) {
            for (let x = 0; x < GameConfig.GridWidth; x++) {
                if (visited[y][x]) continue;
                
                const curTile = this.tileGrid[y][x];
                if (!curTile) continue;

                const match = this.getMatch(curTile);
                const horizontal = match.horizontal;
                const vertical = match.vertical;

                let processedMatch = false;

                if (horizontal.length >= 3) {
                    horizontal.forEach((tile: Tile) => {
                        const coords = this.getTileCoords(tile);
                        if (coords.x !== -1 && coords.y !== -1) {
                            visited[coords.y][coords.x] = true;
                        }
                    });

                    const matchType = this.determineMatchType(horizontal.length);
                    const centerTile = this.getCenterTile(horizontal);
                    
                    matchResults.push({
                        tiles: horizontal,
                        type: matchType,
                        direction: 'horizontal',
                        centerTile: centerTile
                    });

                    processedMatch = true;
                }

                if (vertical.length >= 3) {
                    vertical.forEach((tile: Tile) => {
                        const coords = this.getTileCoords(tile);
                        if (coords.x !== -1 && coords.y !== -1) {
                            visited[coords.y][coords.x] = true;
                        }
                    });
                    
                    if (processedMatch) {
                        const combinedMatch = [...horizontal];
                        vertical.forEach(tile => {
                            if (combinedMatch.indexOf(tile) === -1) {
                                combinedMatch.push(tile);
                            }
                        });
                        
                        const intersectionTile = this.findIntersectionTile(horizontal, vertical);
                        const crossMatchType = this.determineCrossMatchType(horizontal.length, vertical.length);
                        
                        matchResults[matchResults.length - 1] = {
                            tiles: combinedMatch,
                            type: crossMatchType,
                            direction: 'cross',
                            centerTile: intersectionTile
                        };
                    } else {
                        const matchType = this.determineMatchType(vertical.length);
                        const centerTile = this.getCenterTile(vertical);
                        
                        matchResults.push({
                            tiles: vertical,
                            type: matchType,
                            direction: 'vertical',
                            centerTile: centerTile
                        });
                    }
                }
            }
        }

        return matchResults;
    }

    private getMatch(tile: Tile): Match {
        let hoz = this.checkHorizontalMatch(tile);
        let ver = this.checkVerticalMatch(tile);
        
        for (let i = 1; i < hoz.length; i++) {
            const nextHoz = this.checkHorizontalMatch(hoz[i]);
            const nextVer = this.checkVerticalMatch(hoz[i]);
            if (nextHoz.length + nextVer.length - 1 > hoz.length + ver.length - 1) {
                hoz = nextHoz;
                ver = nextVer;
            }
        }
        
        for (let i = 1; i < ver.length; i++) {
            const nextHoz = this.checkHorizontalMatch(ver[i]);
            const nextVer = this.checkVerticalMatch(ver[i]);
            if (nextHoz.length + nextVer.length - 1 > hoz.length + ver.length - 1) {
                hoz = nextHoz;
                ver = nextVer;
            }
        }

        return { horizontal: hoz, vertical: ver };
    }

    private checkHorizontalMatch(tile: Tile): Tile[] {
        const coords = this.getTileCoords(tile);
        if (coords.x === -1 || coords.y === -1) return [];
        
        const { x, y } = coords;
        const match: Tile[] = [tile];
        
        // Check left
        let i = x - 1;
        while (i >= 0 && this.tileGrid[y][i] && 
               this.tileGrid[y][i]!.getTileType() === tile.getTileType()) {
            match.unshift(this.tileGrid[y][i]!);
            i--;
        }
        
        // Check right
        i = x + 1;
        while (i < GameConfig.GridWidth && this.tileGrid[y][i] && 
               this.tileGrid[y][i]!.getTileType() === tile.getTileType()) {
            match.push(this.tileGrid[y][i]!);
            i++;
        }
        
        return match.length >= 3 ? match : [];
    }

    private checkVerticalMatch(tile: Tile): Tile[] {
        const coords = this.getTileCoords(tile);
        if (coords.x === -1 || coords.y === -1) return [];
        
        const { x, y } = coords;
        const match: Tile[] = [tile];
        
        // Check up
        let i = y - 1;
        while (i >= 0 && this.tileGrid[i][x] && 
               this.tileGrid[i][x]!.getTileType() === tile.getTileType()) {
            match.unshift(this.tileGrid[i][x]!);
            i--;
        }
        
        // Check down
        i = y + 1;
        while (i < GameConfig.GridHeight && this.tileGrid[i][x] && 
               this.tileGrid[i][x]!.getTileType() === tile.getTileType()) {
            match.push(this.tileGrid[i][x]!);
            i++;
        }
        
        return match.length >= 3 ? match : [];
    }

    private determineMatchType(length: number): 'match3' | 'match4' | 'match5' {
        if (length >= 5) return 'match5';
        if (length === 4) return 'match4';
        return 'match3';
    }

    private determineCrossMatchType(horizontalLength: number, verticalLength: number): 'matchL' | 'matchT' {
        if (horizontalLength >= 3 && verticalLength >= 3) {
            return 'matchT';
        }
        return 'matchL';
    }

    private getCenterTile(tiles: Tile[]): Tile {
        const centerIndex = Math.floor(tiles.length / 2);
        return tiles[centerIndex];
    }

    private findIntersectionTile(horizontal: Tile[], vertical: Tile[]): Tile | undefined {
        for (const hTile of horizontal) {
            for (const vTile of vertical) {
                if (hTile === vTile) {
                    return hTile;
                }
            }
        }
        return horizontal[0]; // Fallback
    }

    async dropAndFillTile(): Promise<void> {
    const movements: Movement[] = [];
    
    // Phase 1: Drop existing tiles
    for (let x = 0; x < GameConfig.GridWidth; x++) {
        for (let y = GameConfig.GridHeight - 1; y >= 0; y--) {
            const tile = this.tileGrid[y][x];
            if (tile) {
                let destY = y;
                while (destY < GameConfig.GridHeight - 1 && !this.tileGrid[destY + 1][x]) {
                    destY++;
                }
                if (destY !== y) {
                    this.tileGrid[destY][x] = tile;
                    this.tileGrid[y][x] = undefined;
                    movements.push({ tile, from: { x, y }, to: { x, y: destY } });
                }
            }
        }
    }
    
    const newTiles: Tile[] = []; 
    
    for (let x = 0; x < GameConfig.GridWidth; x++) {
        let emptyCount = 0;
        for (let y = 0; y < GameConfig.GridHeight; y++) {
            if (!this.tileGrid[y][x]) emptyCount++;
        }
        
        for (let i = 0; i < emptyCount; i++) {
            const destY = i; 
            const spawnY = -(emptyCount - i); 
            
            const newTile = this.TilePool?.addTile(x, spawnY);
            if (newTile) {
                const spawnPosition = this.getTilePosition({ x, y: spawnY });
                newTile.node.setPosition(spawnPosition.x, spawnPosition.y, newTile.node.position.z);
                
                this.tileGrid[destY][x] = newTile;
                newTiles.push(newTile);
                
                movements.push({ 
                    tile: newTile, 
                    from: { x, y: spawnY }, 
                    to: { x, y: destY } 
                });
            }
        }
    }
    
    if (movements.length > 0) {
        const animationPromises: Promise<void>[] = [];
        
        for (const movement of movements) {
            const targetPosition = this.getTilePosition(movement.to);
            
            animationPromises.push(new Promise<void>((resolve) => {
                tween(movement.tile.node)
                    .to(0.5, { 
                        position: new Vec3(
                            targetPosition.x,
                            targetPosition.y,
                            movement.tile.node.position.z
                        )
                    }, {
                        easing: 'bounceOut'
                    })
                    .call(() => {
                        resolve();
                    })
                    .start();
            }));
        }
        
        await Promise.all(animationPromises);
    }

}

    setTileClickCallback(callback: (tile: Tile) => void): void {
        for (let y = 0; y < this.tileGrid.length; y++) {
            for (let x = 0; x < this.tileGrid[y].length; x++) {
                const tile = this.tileGrid[y][x]
                if (tile) {
                    tile.addOnClickCallback(callback)
                }
            }
        }
    }

    getGrid(): (Tile | undefined)[][] {
        return this.tileGrid
    }

    
}