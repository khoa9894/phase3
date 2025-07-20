import { TilePool } from './TilePool';
import { _decorator, Component, instantiate, Prefab, tween, Vec3, type Node } from 'cc'
const { ccclass, property } = _decorator
import GameConfig from '../constants/GameConfig'
import { Tile } from './Tile'
import { MatchResult, HintMove, Match,Movement } from '../constants/global'
import { Milestone } from './Milestone'



@ccclass('Board')
export class Board extends Component {
    private tileGrid: (Tile | undefined)[][] = []
      @property(Milestone)
    private milestone: Milestone | null = null;
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

    private getBaseColor(tileType: string): string {
        return tileType.split('-')[0];
    }

    private isSpecialTile(tileType: string): boolean {
        return tileType.includes('-x') || tileType.includes('-y') || tileType.includes('-candy');
    }

    private getSpecialTileEffect(tileType: string): 'row' | 'column' | 'candy' | null {
        if (tileType.includes('-x')) return 'row';
        if (tileType.includes('-y')) return 'column'; 
        if (tileType.includes('-candy')) return 'candy';
        return null;
    }
    private setCandy(tile:Tile){
        switch(tile.getTileType()){
                case'orange':
                    tile.setTileType('orange-candy');
                    break;
                case'red':

                    tile.setTileType('red-candy');
                    break;
                case'purple':

                    tile.setTileType('purple-candy');
                    break;
                case'blue':

                    tile.setTileType('blue-candy');
                    break;
                case'green':

                    tile.setTileType('green-candy');
                    break;
                case'yellow':

                    tile.setTileType('yellow-candy');
                    break;
        }
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
            }
        }
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
            }
        }
    }
    async removeTiles(matchResults: MatchResult[]): Promise<void> {
        const allAnimationPromises: Promise<void>[] = [];
        const tilesToRemove: Tile[] = [];
        
        for (const matchResult of matchResults) {
            switch (matchResult.type) {
                case 'special-row':
                case 'special-column':
                    tilesToRemove.push(...matchResult.tiles);
                    break;
                case 'match4':
                    tilesToRemove.push(...matchResult.tiles.slice(1));
                    break;
                case 'match5':
                     if (matchResult.centerTile) {
                    const remainingTiles = matchResult.tiles.filter(tile => tile !== matchResult.centerTile);
                    tilesToRemove.push(...remainingTiles);
                } else {
                    tilesToRemove.push(...matchResult.tiles.slice(1));
                }
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
                case 'special-candy':
                    if (this.milestone) {
        this.milestone.fillBar(10);
    }
                allAnimationPromises.push(this.handleSpecialCandy(matchResult));
                    break;  
                case 'special-row':
                    if (this.milestone) {
        this.milestone.fillBar(20);
    }
                    allAnimationPromises.push(this.handleSpecialRow(matchResult));
                    break;
                case 'special-column':
                    if (this.milestone) {
        this.milestone.fillBar(30);
    }
                    allAnimationPromises.push(this.handleSpecialColumn(matchResult));
                    break;
                case 'matchT':
                    if (this.milestone) {
        this.milestone.fillBar(40);
    }
                    allAnimationPromises.push(this.handleMatchT(matchResult));
                    break;
                case 'matchL':

                    allAnimationPromises.push(this.handleMatchL(matchResult));
                    break;
                case 'match4':
                    if (this.milestone) {
        this.milestone.fillBar(30);
    }
                    allAnimationPromises.push(this.handleMatch4(matchResult));
                    break;
                case 'match5':
                    if (this.milestone) {
        this.milestone.fillBar(30);
    }
                    allAnimationPromises.push(this.handleMatch5(matchResult));
                    break;
                
                
                default:
                    if (this.milestone) {
        this.milestone.fillBar(10);
    }
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
    private async handleSpecialCandy(matchResult: MatchResult): Promise<void> {
    console.log('Special candy Effect activated!');
    
    const promises: Promise<void>[] = [];
    
    for (let i = 0; i < matchResult.tiles.length; i++) {
        const tile = matchResult.tiles[i];
        
        promises.push(new Promise<void>((resolve) => {
            const coords = this.getTileCoords(tile);
            const centerCoords = matchResult.specialActivation?.centerPosition || coords;
            const distance = Math.abs(coords.x - centerCoords.x) + Math.abs(coords.y - centerCoords.y);
            
            setTimeout(() => {
                tile.vanish();
                setTimeout(() => {
                    resolve();
                }, 300);
            }, distance * 100); 
        }));
    }
    
    await Promise.all(promises);
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
    public async shuffle(): Promise<void> {
    
    const allTiles: Tile[] = [];
    for (let y = 0; y < GameConfig.GridHeight; y++) {
        for (let x = 0; x < GameConfig.GridWidth; x++) {
            const tile = this.tileGrid[y][x];
            if (tile) {
                allTiles.push(tile);
            }
        }
    }
    
    if (allTiles.length === 0) return;
    
    const centerX = 0;
    const centerY = 0;
    const radius = Math.max(GameConfig.GridWidth, GameConfig.GridHeight) * GameConfig.TileWidth * 0.6;
    
    const circlePromises: Promise<void>[] = [];
    
    allTiles.forEach((tile, index) => {
        const angle = (index / allTiles.length) * Math.PI * 2;
        const circleX = centerX + Math.cos(angle) * radius;
        const circleY = centerY + Math.sin(angle) * radius;
        
        circlePromises.push(new Promise<void>((resolve) => {
            tween(tile.node)
                .to(0.8, {
                    position: new Vec3(circleX, circleY, tile.node.position.z)
                }, {
                    easing: 'cubicOut'
                })
                .call(() => resolve())
                .start();
        }));
    });
    
    await Promise.all(circlePromises);
    
    const rotationPromises: Promise<void>[] = [];
    
    allTiles.forEach((tile, index) => {
        rotationPromises.push(new Promise<void>((resolve) => {
            const startAngle = (index / allTiles.length) * Math.PI * 2;
            let currentAngle = startAngle;
            
            tween({ angle: currentAngle })
                .to(1.0, { angle: currentAngle + Math.PI * 4 }, { 
                    easing: 'linear',
                    onUpdate: (target: any) => {
                        const x = centerX + Math.cos(target.angle) * radius;
                        const y = centerY + Math.sin(target.angle) * radius;
                        tile.node.setPosition(x, y, tile.node.position.z);
                    }
                })
                .call(() => resolve())
                .start();
        }));
    });
    
    await Promise.all(rotationPromises);
    
    const tileTypes = allTiles.map(tile => tile.getTileType());
    
    for (let i = tileTypes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tileTypes[i], tileTypes[j]] = [tileTypes[j], tileTypes[i]];
    }
    
    const availablePositions: {x: number, y: number}[] = [];
    for (let y = 0; y < GameConfig.GridHeight; y++) {
        for (let x = 0; x < GameConfig.GridWidth; x++) {
            availablePositions.push({x, y});
        }
    }
    
    for (let i = availablePositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
    }
    
    for (let y = 0; y < GameConfig.GridHeight; y++) {
        for (let x = 0; x < GameConfig.GridWidth; x++) {
            this.tileGrid[y][x] = undefined;
        }
    }
    
    const finalPromises: Promise<void>[] = [];
    
    allTiles.forEach((tile, index) => {
        if (index < availablePositions.length && index < tileTypes.length) {
            const newPos = availablePositions[index];
            const newType = tileTypes[index];
            
            tile.setTileType(newType);
            
            this.tileGrid[newPos.y][newPos.x] = tile;
            
            const targetPosition = this.getTilePosition(newPos);
            
            finalPromises.push(new Promise<void>((resolve) => {
                const distance = Math.sqrt(
                    Math.pow(newPos.x - GameConfig.GridWidth/2, 2) + 
                    Math.pow(newPos.y - GameConfig.GridHeight/2, 2)
                );
                const delay = distance * 50;
                
                setTimeout(() => {
                    tween(tile.node)
                        .to(0.6, {
                            position: new Vec3(
                                targetPosition.x,
                                targetPosition.y,
                                tile.node.position.z
                            )
                        }, {
                            easing: 'backOut'
                        })
                        .call(() => resolve())
                        .start();
                }, delay);
            }));
        }
    });
    
    await Promise.all(finalPromises);
    
    console.log('Shuffle animation completed!');
}

    private async handleMatch4(matchResult: MatchResult): Promise<void> {
        console.log('Match 4 detected!', matchResult.direction);
        
        const coords0 = this.getTileCoords(matchResult.tiles[0]);
        const director=matchResult.direction
        this.setSpecialTile(matchResult.tiles[0],director)
        const targetPosition = this.getTilePosition(coords0);
        
        const animationPromises: Promise<void>[] = [];
        
        animationPromises.push(new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, 10);
        }));
        
        for (let i = 1; i < matchResult.tiles.length; i++) {
            const tile = matchResult.tiles[i];
            
            animationPromises.push(new Promise<void>((resolve) => {
                tween(tile.node)
                    .to(0.3, {
                        position: new Vec3(
                            targetPosition.x,
                            targetPosition.y,
                            tile.node.position.z
                        )
                    }, {
                        easing: 'linear'
                    })
                    .call(() => {
                        resolve();
                    })
                    .start();
            }));
        }
        
        await Promise.all(animationPromises);
    }

    private async handleMatch5(matchResult: MatchResult): Promise<void> {
        console.log('Match 5 detected!', matchResult.direction);
            if(matchResult.centerTile){
                    const tile=matchResult.centerTile
                    const coords0 = this.getTileCoords(tile);
                    tile.setTileType('chocolate')
                    const targetPosition = this.getTilePosition(coords0);
                const animationPromises: Promise<void>[] = [];
        
        animationPromises.push(new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, 10);
        }));
        
        for (let i = 1; i < matchResult.tiles.length; i++) {
            const tile = matchResult.tiles[i];
            
            animationPromises.push(new Promise<void>((resolve) => {
                tween(tile.node)
                    .to(0.1, {
                        position: new Vec3(
                            targetPosition.x,
                            targetPosition.y,
                            tile.node.position.z
                        )
                    }, {
                        easing: 'linear'
                    })
                    .call(() => {
                        resolve();
                    })
                    .start();
            }));
        }
        
        await Promise.all(animationPromises);

                }

        // const promises: Promise<void>[] = [];
        
        // for (const tile of matchResult.tiles) {
        //     promises.push(new Promise<void>((resolve) => {
        //         tile.vanish();
        //         setTimeout(() => {
        //             resolve();
        //         }, 500);
        //     }));
        // }
        
        // await Promise.all(promises);
    }
private isChocolateTile(tileType: string): boolean {
    return tileType === 'chocolate';
}

private getAllTilesOfType(targetType: string): Tile[] {
    const tiles: Tile[] = [];
    for (let y = 0; y < GameConfig.GridHeight; y++) {
        for (let x = 0; x < GameConfig.GridWidth; x++) {
            const tile = this.tileGrid[y][x];
            if (tile && this.getBaseColor(tile.getTileType()) === targetType) {
                tiles.push(tile);
            }
        }
    }
    return tiles;
}


    private async handleMatchL(matchResult: MatchResult): Promise<void> {
        console.log('L-shape match detected!');
        
        // const promises: Promise<void>[] = [];
        
        // for (const tile of matchResult.tiles) {
        //     promises.push(new Promise<void>((resolve) => {
        //         tile.vanish();
        //         setTimeout(() => {
        //             resolve();
        //         }, 400);
        //     }));
        // }
        
        // await Promise.all(promises);
    }

    private async handleMatchT(matchResult: MatchResult): Promise<void> {
        if(matchResult.centerTile) {
            const targetPosition = this.getTilePosition(this.getTileCoords(matchResult.centerTile));
        
        const animationPromises: Promise<void>[] = [];
        
        animationPromises.push(new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, 10);
        }));
        
        for (let i = 0; i < matchResult.tiles.length; i++) {
            const tile = matchResult.tiles[i];
            
            animationPromises.push(new Promise<void>((resolve) => {
                tween(tile.node)
                    .to(0.2, {
                        position: new Vec3(
                            targetPosition.x,
                            targetPosition.y,
                            tile.node.position.z
                        )
                    }, {
                        easing: 'linear'
                    })
                    .call(() => {
                        resolve();
                    })
                    .start();
            }));
        }
        
        await Promise.all(animationPromises);
            this.setCandy(matchResult.centerTile)
        }     
    }
    
    private async handleSpecialRow(matchResult: MatchResult): Promise<void> {
        console.log('Special Row Effect activated!');
        
        const promises: Promise<void>[] = [];
        
        for (let i = 0; i < matchResult.tiles.length; i++) {
            const tile = matchResult.tiles[i];
            
            promises.push(new Promise<void>((resolve) => {
                setTimeout(() => {
                    tile.vanish();
                    setTimeout(() => {
                        resolve();
                    }, 300);
                }, i * 50);
            }));
        }
        
        await Promise.all(promises);
    }

    private async handleSpecialColumn(matchResult: MatchResult): Promise<void> {
        console.log('Special Column Effect activated!');
        
        const promises: Promise<void>[] = [];
        
        for (let i = 0; i < matchResult.tiles.length; i++) {
            const tile = matchResult.tiles[i];
            
            promises.push(new Promise<void>((resolve) => {
                setTimeout(() => {
                    tile.vanish();
                    setTimeout(() => {
                        resolve();
                    }, 300);
                }, i * 50);
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
    const coords1 = this.getTileCoords(tile1);
    const coords2 = this.getTileCoords(tile2);

    // Validate coordinates
    if (coords1.x === -1 || coords1.y === -1 || coords2.x === -1 || coords2.y === -1) {
        console.error('Invalid tile coordinates');
        onComplete?.();
        return;
    }

    const isChocolateSwap = this.isChocolateTile(tile1.getTileType()) || this.isChocolateTile(tile2.getTileType());
    
    if (isChocolateSwap) {
        this.handleChocolateSwapLogic(tile1, tile2, onComplete);
        return;
    }

    this.tileGrid[coords1.y][coords1.x] = tile2;
    this.tileGrid[coords2.y][coords2.x] = tile1;

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
        .start();

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
            onComplete?.();
        })
        .start();
}

private async handleChocolateSwapLogic(tile1: Tile, tile2: Tile, onComplete?: () => void): Promise<void> {
    try {
        const coords1 = this.getTileCoords(tile1);
        const coords2 = this.getTileCoords(tile2);
        
        if (coords1.x === -1 || coords1.y === -1 || coords2.x === -1 || coords2.y === -1) {
            console.error('Invalid coordinates in chocolate swap');
            onComplete?.();
            return;
        }

        const chocolateTile = this.isChocolateTile(tile1.getTileType()) ? tile1 : tile2;
        const targetTile = chocolateTile === tile1 ? tile2 : tile1;
        
        this.tileGrid[coords1.y][coords1.x] = tile2;
        this.tileGrid[coords2.y][coords2.x] = tile1;
        
        const swapPromises = [
            new Promise<void>((resolve) => {
                tween(tile1.node)
                    .to(0.4, {
                        position: new Vec3(
                            tile2.node.x,
                            tile2.node.y,
                            tile1.node.position.z
                        ),
                    }, { easing: 'linear' })
                    .call(() => resolve())
                    .start();
            }),
            new Promise<void>((resolve) => {
                tween(tile2.node)
                    .to(0.4, {
                        position: new Vec3(
                            tile1.node.x,
                            tile1.node.y,
                            tile2.node.position.z
                        ),
                    }, { easing: 'linear' })
                    .call(() => resolve())
                    .start();
            })
        ];
        
        await Promise.all(swapPromises);
        
        const matchResult = await this.handleChocolateSwap(chocolateTile, targetTile);
        
        await this.removeTiles([matchResult]);
        
        onComplete?.();
        
    } catch (error) {
        console.error('Error in chocolate swap logic:', error);
        onComplete?.();
    }
}

private async handleChocolateSwap(chocolateTile: Tile, targetTile: Tile): Promise<MatchResult> {
    const targetType = this.getBaseColor(targetTile.getTileType());
    const allMatchingTiles = this.getAllTilesOfType(targetType);
    
    const validTiles = allMatchingTiles.filter(tile => {
        const coords = this.getTileCoords(tile);
        return coords.x !== -1 && coords.y !== -1;
    });
    
    const chocolateCoords = this.getTileCoords(chocolateTile);
    if (chocolateCoords.x !== -1 && chocolateCoords.y !== -1) {
        validTiles.push(chocolateTile);
    }
    
    return {
        tiles: validTiles,
        type: 'special-candy',
        direction: 'cross',
        centerTile: chocolateTile,
        specialActivation: {
            activatorTiles: [chocolateTile, targetTile],
            effectType: 'candy',
            centerPosition: chocolateCoords
        }
    };
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

            // PRIORITY 1: Match 5 
            if (horizontal.length >= 3 && vertical.length >= 3) {
                const allTiles = [...horizontal];
                vertical.forEach(tile => {
                    if (allTiles.indexOf(tile) === -1) {
                        allTiles.push(tile);
                    }
                });
                
                // Check if this is a Match 5
                if (horizontal.length >= 5 || vertical.length >= 5) {
                    allTiles.forEach((tile: Tile) => {
                        const coords = this.getTileCoords(tile);
                        if (coords.x !== -1 && coords.y !== -1) {
                            visited[coords.y][coords.x] = true;
                        }
                    });

                    const intersectionTile = this.findIntersectionTile(horizontal, vertical);
                    
                    matchResults.push({
                        tiles: allTiles,
                        type: 'match5',
                        direction: horizontal.length >= 5 ? 'horizontal' : 'vertical',
                        centerTile: intersectionTile
                    });
                    processedMatch = true;
                } else {
                    // Regular cross match 
                    allTiles.forEach((tile: Tile) => {
                        const coords = this.getTileCoords(tile);
                        if (coords.x !== -1 && coords.y !== -1) {
                            visited[coords.y][coords.x] = true;
                        }
                    });

                    const intersectionTile = this.findIntersectionTile(horizontal, vertical);
                    const crossMatchType = this.determineCrossMatchType(horizontal.length, vertical.length);
                    
                    matchResults.push({
                        tiles: allTiles,
                        type: crossMatchType,
                        direction: 'cross',
                        centerTile: intersectionTile
                    });
                    processedMatch = true;
                }
            }
            // PRIORITY 2: Single line Match 5
            else if (horizontal.length >= 5) {
                const centerTile = this.getCenterTile(horizontal);
                
                matchResults.push({
                    tiles: horizontal,
                    type: 'match5',
                    direction: 'horizontal',
                    centerTile: centerTile
                });

                horizontal.forEach((tile: Tile) => {
                    const coords = this.getTileCoords(tile);
                    if (coords.x !== -1 && coords.y !== -1) {
                        visited[coords.y][coords.x] = true;
                    }
                });
                processedMatch = true;
            }
            else if (vertical.length >= 5) {
                const centerTile = this.getCenterTile(vertical);
                
                matchResults.push({
                    tiles: vertical,
                    type: 'match5',
                    direction: 'vertical',
                    centerTile: centerTile
                });

                vertical.forEach((tile: Tile) => {
                    const coords = this.getTileCoords(tile);
                    if (coords.x !== -1 && coords.y !== -1) {
                        visited[coords.y][coords.x] = true;
                    }
                });
                processedMatch = true;
            }
            // PRIORITY 3: Candy interactions
            else if (horizontal.length >= 3) {
                const specialCandy = this.checkCandyInteraction(horizontal);
                if (specialCandy) {
                    horizontal.forEach((tile: Tile) => {
                        const coords = this.getTileCoords(tile);
                        if (coords.x !== -1 && coords.y !== -1) {
                            visited[coords.y][coords.x] = true;
                        }
                    });
                    matchResults.push(specialCandy);
                    processedMatch = true;
                }
            }
            else if (vertical.length >= 3) {
                const specialCandy = this.checkCandyInteraction(vertical);
                if (specialCandy) {
                    vertical.forEach((tile: Tile) => {
                        const coords = this.getTileCoords(tile);
                        if (coords.x !== -1 && coords.y !== -1) {
                            visited[coords.y][coords.x] = true;
                        }
                    });
                    matchResults.push(specialCandy);
                    processedMatch = true;
                }
            }

            // PRIORITY 4: Match 4
            if (!processedMatch && horizontal.length === 4) {
                const specialTiles = horizontal.filter(tile => this.isSpecialTile(tile.getTileType()));
                
                if (specialTiles.length >= 1) {
                    const specialInteraction = this.checkSpecialTileInteraction(horizontal);
                    if (specialInteraction) {
                        horizontal.forEach((tile: Tile) => {
                            const coords = this.getTileCoords(tile);
                            if (coords.x !== -1 && coords.y !== -1) {
                                visited[coords.y][coords.x] = true;
                            }
                        });
                        matchResults.push(specialInteraction);
                        processedMatch = true;
                    }
                }
                
                if (!processedMatch) {
                    const centerTile = this.getCenterTile(horizontal);
                    
                    matchResults.push({
                        tiles: horizontal,
                        type: 'match4',
                        direction: 'horizontal',
                        centerTile: centerTile
                    });

                    horizontal.forEach((tile: Tile) => {
                        const coords = this.getTileCoords(tile);
                        if (coords.x !== -1 && coords.y !== -1) {
                            visited[coords.y][coords.x] = true;
                        }
                    });
                    processedMatch = true;
                }
            }
            else if (!processedMatch && vertical.length === 4) {
                const specialTiles = vertical.filter(tile => this.isSpecialTile(tile.getTileType()));
                
                if (specialTiles.length >= 1) {
                    const specialInteraction = this.checkSpecialTileInteraction(vertical);
                    if (specialInteraction) {
                        vertical.forEach((tile: Tile) => {
                            const coords = this.getTileCoords(tile);
                            if (coords.x !== -1 && coords.y !== -1) {
                                visited[coords.y][coords.x] = true;
                            }
                        });
                        matchResults.push(specialInteraction);
                        processedMatch = true;
                    }
                }
                
                if (!processedMatch) {
                    const centerTile = this.getCenterTile(vertical);
                    
                    matchResults.push({
                        tiles: vertical,
                        type: 'match4',
                        direction: 'vertical',
                        centerTile: centerTile
                    });

                    vertical.forEach((tile: Tile) => {
                        const coords = this.getTileCoords(tile);
                        if (coords.x !== -1 && coords.y !== -1) {
                            visited[coords.y][coords.x] = true;
                        }
                    });
                    processedMatch = true;
                }
            }

            // PRIORITY 5: Match 3 (lowest priority)
            if (!processedMatch && horizontal.length >= 3) {
                const specialTiles = horizontal.filter(tile => this.isSpecialTile(tile.getTileType()));
                
                if (specialTiles.length >= 1) {
                    const specialInteraction = this.checkSpecialTileInteraction(horizontal);
                    if (specialInteraction) {
                        horizontal.forEach((tile: Tile) => {
                            const coords = this.getTileCoords(tile);
                            if (coords.x !== -1 && coords.y !== -1) {
                                visited[coords.y][coords.x] = true;
                            }
                        });
                        matchResults.push(specialInteraction);
                        processedMatch = true;
                    }
                }
                
                if (!processedMatch) {
                    const matchType = this.determineMatchType(horizontal.length);
                    const centerTile = this.getCenterTile(horizontal);
                    
                    matchResults.push({
                        tiles: horizontal,
                        type: matchType,
                        direction: 'horizontal',
                        centerTile: centerTile
                    });

                    horizontal.forEach((tile: Tile) => {
                        const coords = this.getTileCoords(tile);
                        if (coords.x !== -1 && coords.y !== -1) {
                            visited[coords.y][coords.x] = true;
                        }
                    });
                }
            }
            else if (!processedMatch && vertical.length >= 3) {
                const specialTiles = vertical.filter(tile => this.isSpecialTile(tile.getTileType()));
                
                if (specialTiles.length >= 1) {
                    const specialInteraction = this.checkSpecialTileInteraction(vertical);
                    if (specialInteraction) {
                        vertical.forEach((tile: Tile) => {
                            const coords = this.getTileCoords(tile);
                            if (coords.x !== -1 && coords.y !== -1) {
                                visited[coords.y][coords.x] = true;
                            }
                        });
                        matchResults.push(specialInteraction);
                    }
                }
                else {
                    const matchType = this.determineMatchType(vertical.length);
                    const centerTile = this.getCenterTile(vertical);
                    
                    matchResults.push({
                        tiles: vertical,
                        type: matchType,
                        direction: 'vertical',
                        centerTile: centerTile
                    });

                    vertical.forEach((tile: Tile) => {
                        const coords = this.getTileCoords(tile);
                        if (coords.x !== -1 && coords.y !== -1) {
                            visited[coords.y][coords.x] = true;
                        }
                    });
                }
            }
        }
    }

    return matchResults;
}
    private checkCandyInteraction(matchedTiles: Tile[]): MatchResult | null {
    const specialTiles = matchedTiles.filter(tile => this.isSpecialTile(tile.getTileType()));
    const normalTiles = matchedTiles.filter(tile => !this.isSpecialTile(tile.getTileType()));
    
    if (specialTiles.length === 0) return null;
    
    for (const specialTile of specialTiles) {
        const baseColor = this.getBaseColor(specialTile.getTileType());
        const matchingNormalTiles = normalTiles.filter(tile => 
            this.getBaseColor(tile.getTileType()) === baseColor
        );
        
        if (matchingNormalTiles.length >= 2) {
            const effect = this.getSpecialTileEffect(specialTile.getTileType());
            const coords = this.getTileCoords(specialTile);
            
            if (effect === 'candy') {
                const surroundingTiles: Tile[] = [];
                
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const newX = coords.x + dx;
                        const newY = coords.y + dy;
                        
                        if (newX >= 0 && newX < GameConfig.GridWidth && 
                            newY >= 0 && newY < GameConfig.GridHeight) {
                            const tile = this.tileGrid[newY][newX];
                            if (tile) {
                                surroundingTiles.push(tile);
                            }
                        }
                    }
                }
                
                return {
                    tiles: surroundingTiles,
                    type: 'special-candy',
                    direction: 'cross',
                    centerTile: specialTile,
                    specialActivation: {
                        activatorTiles: [...matchingNormalTiles, specialTile],
                        effectType: 'candy',
                        centerPosition: coords
                    }
                };
            }
        }
    }
    
    return null;
}
    private checkSpecialTileInteraction(matchedTiles: Tile[]): MatchResult | null {
        const specialTiles = matchedTiles.filter(tile => this.isSpecialTile(tile.getTileType()));
        const normalTiles = matchedTiles.filter(tile => !this.isSpecialTile(tile.getTileType()));
        
        if (specialTiles.length === 0) return null;
        
        for (const specialTile of specialTiles) {
            const baseColor = this.getBaseColor(specialTile.getTileType());
            const matchingNormalTiles = normalTiles.filter(tile => 
                this.getBaseColor(tile.getTileType()) === baseColor
            );
            
            if (matchingNormalTiles.length >= 2) {
                const effect = this.getSpecialTileEffect(specialTile.getTileType());
                const coords = this.getTileCoords(specialTile);
                
                if (effect === 'row') {
                    const rowTiles: Tile[] = [];
                    for (let x = 0; x < GameConfig.GridWidth; x++) {
                        const tile = this.tileGrid[coords.y][x];
                        if (tile) rowTiles.push(tile);
                    }
                    
                    return {
                        tiles: rowTiles,
                        type: 'special-row',
                        direction: 'horizontal',
                        centerTile: specialTile,
                        specialActivation: {
                            activatorTiles: [...matchingNormalTiles, specialTile],
                            effectType: 'row',
                            centerPosition: coords
                        }
                    };
                }
                
                if (effect === 'column') {
                    const columnTiles: Tile[] = [];
                    for (let y = 0; y < GameConfig.GridHeight; y++) {
                        const tile = this.tileGrid[y][coords.x];
                        if (tile) columnTiles.push(tile);
                    }
                    
                    return {
                        tiles: columnTiles,
                        type: 'special-column',
                        direction: 'vertical',
                        centerTile: specialTile,
                        specialActivation: {
                            activatorTiles: [...matchingNormalTiles, specialTile],
                            effectType: 'column',
                            centerPosition: coords
                        }
                    };
                }
            }
        }
        
        return null;
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
        const baseColor = this.getBaseColor(tile.getTileType());
        
        let i = x - 1;
        while (i >= 0 && this.tileGrid[y][i] && 
               this.getBaseColor(this.tileGrid[y][i]!.getTileType()) === baseColor) {
            match.unshift(this.tileGrid[y][i]!);
            i--;
        }
        
        i = x + 1;
        while (i < GameConfig.GridWidth && this.tileGrid[y][i] && 
               this.getBaseColor(this.tileGrid[y][i]!.getTileType()) === baseColor) {
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
        const baseColor = this.getBaseColor(tile.getTileType());
        
        let i = y - 1;
        while (i >= 0 && this.tileGrid[i][x] && 
               this.getBaseColor(this.tileGrid[i][x]!.getTileType()) === baseColor) {
            match.unshift(this.tileGrid[i][x]!);
            i--;
        }
        
        i = y + 1;
        while (i < GameConfig.GridHeight && this.tileGrid[i][x] && 
               this.getBaseColor(this.tileGrid[i][x]!.getTileType()) === baseColor) {
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
        return horizontal[0];
    }

    async dropAndFillTile(): Promise<void> {
        const movements: Movement[] = [];
        
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
    

getHint(): HintMove | null {
    for (let y = 0; y < GameConfig.GridHeight; y++) {
        for (let x = 0; x < GameConfig.GridWidth; x++) {
            const tile1 = this.tileGrid[y][x];
            if (!tile1) continue;

            const directions = [
                { dx: 0, dy: -1 }, // Up
                { dx: 0, dy: 1 },  // Down
                { dx: -1, dy: 0 }, // Left
                { dx: 1, dy: 0 }   // Right
            ];

            for (const dir of directions) {
                const newX = x + dir.dx;
                const newY = y + dir.dy;

                if (newX < 0 || newX >= GameConfig.GridWidth || 
                    newY < 0 || newY >= GameConfig.GridHeight) continue;

                const tile2 = this.tileGrid[newY][newX];
                if (!tile2) continue;

                // Simulate swap
                const originalGrid = this.cloneGrid();
                this.simulateSwap(tile1, tile2);
                
                // Check matches after swap
                const matches = this.getMatches();
                
                // Restore grid
                this.restoreGrid(originalGrid);
                
                if (matches.length > 0) {
                    return {
                        tile1: tile1,
                        tile2: tile2,
                        matchResult: matches
                    };
                }
            }
        }
    }

    return null; 
}

private cloneGrid(): (Tile | undefined)[][] {
    const clonedGrid: (Tile | undefined)[][] = [];
    for (let y = 0; y < GameConfig.GridHeight; y++) {
        clonedGrid[y] = [];
        for (let x = 0; x < GameConfig.GridWidth; x++) {
            clonedGrid[y][x] = this.tileGrid[y][x];
        }
    }
    return clonedGrid;
}

private simulateSwap(tile1: Tile, tile2: Tile): void {
    const coords1 = this.getTileCoords(tile1);
    const coords2 = this.getTileCoords(tile2);
    
    if (coords1.x === -1 || coords1.y === -1 || coords2.x === -1 || coords2.y === -1) return;
    
    this.tileGrid[coords1.y][coords1.x] = tile2;
    this.tileGrid[coords2.y][coords2.x] = tile1;
}

private restoreGrid(originalGrid: (Tile | undefined)[][]): void {
    for (let y = 0; y < GameConfig.GridHeight; y++) {
        for (let x = 0; x < GameConfig.GridWidth; x++) {
            this.tileGrid[y][x] = originalGrid[y][x];
        }
    }
}
}