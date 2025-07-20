import { _decorator, Component, input, Input, EventTouch, Camera, geometry } from 'cc'
const { ccclass, property } = _decorator
import { Tile } from './Tile'
import { Board } from './Board'
@ccclass('GameManager')
export default class GameManager extends Component {
    private canMove = false
    private firstSelectedTile: Tile | undefined = undefined
    private secondSelectedTile: Tile | undefined = undefined
    private isProcessingMatches = false;
    private hintTimer: number | null = null;
  

private currentHintTiles: Tile[] = [];
    @property(Board)
    private board: Board | null = null

    __preload(): void {
        if (this.board === null) throw new Error('Board component is not set')
    }

    start(): void {
        this.initializeGame()
        
    }

    private async initializeGame(): Promise<void> {
        this.canMove = true
        this.firstSelectedTile = undefined
        this.secondSelectedTile = undefined

        this.board!.createBoard()
        this.board!.setTileClickCallback((tile) => this.onTileClick(tile))
        
        await this.processMatches()
    }

    private onTileClick(tile: Tile): void {
    if (!this.canMove) return;

    this.clearHint();
    this.resetHintTimer();

    if (!this.firstSelectedTile) {
        this.firstSelectedTile = tile;
        this.firstSelectedTile.startPulseEffect();
    } else if (this.firstSelectedTile === tile) {
        // Deselect
    } else {
        this.secondSelectedTile = tile;
        this.processMove();
    }
}
    private resetHintTimer(): void {
    if (this.hintTimer !== null) {
        clearTimeout(this.hintTimer);
    }
    
    this.clearHint();
    
    this.hintTimer = setTimeout(() => {
        this.showHint();
    }, 1000); 
}

private async showHint(): Promise<void> {
    if (!this.canMove || this.isProcessingMatches) return;
    
    const hint = this.board!.getHint();
    if (hint) {
        this.currentHintTiles = [hint.tile1, hint.tile2];
        
        hint.tile1.startPulseEffect();
        hint.tile2.startPulseEffect();
        
        console.log('Hint: Swap these tiles for a match!');
    } else {
        await this.board!.shuffle()
        this.processMatches()

    }
}

private clearHint(): void {
    for (const tile of this.currentHintTiles) {
        if (tile) {
            tile.stopPulseEffect();
        }
    }
    this.currentHintTiles = [];
}

    private processMove(): void {
        if (!this.firstSelectedTile || !this.secondSelectedTile) return

        if (this.board!.areAdjacent(this.firstSelectedTile, this.secondSelectedTile)) {
            this.canMove = false
            this.swapTiles()
        } else {
            this.firstSelectedTile.stopPulseEffect()
            this.firstSelectedTile = this.secondSelectedTile
            this.firstSelectedTile.startPulseEffect()
            this.secondSelectedTile = undefined
        }
    }

    private swapTiles(): void {
        if (!this.firstSelectedTile || !this.secondSelectedTile) return

        const tile1 = this.firstSelectedTile
        const tile2 = this.secondSelectedTile

        tile1.stopPulseEffect()

        this.board!.swapTiles(tile1, tile2, () => {
            this.processMatches()
        })
    }

    private async processMatches(): Promise<void> {
    if (this.isProcessingMatches) return;

    const matches = this.board!.getMatches();

    if (matches.length > 0) {
        this.isProcessingMatches = true;
        
        this.clearHint();
        if (this.hintTimer !== null) {
            clearTimeout(this.hintTimer);
            this.hintTimer = null;
        }
        
        this.clearSelection();
        
        await this.board!.removeTiles(matches);
        
        try {
            await this.board!.dropAndFillTile();
            this.board!.setTileClickCallback((tile) => this.onTileClick(tile));
            this.isProcessingMatches = false;
            
            await this.processMatches();
            
        } catch (error) {
            console.error('Error in dropAndFillTiles:', error);
            this.isProcessingMatches = false;
            this.canMove = true;
            this.resetHintTimer(); 
        }

    } else {
        this.isProcessingMatches = false;
        
        if (this.firstSelectedTile && this.secondSelectedTile) {
            const coords1 = this.board!.getTileCoords(this.firstSelectedTile);
            const coords2 = this.board!.getTileCoords(this.secondSelectedTile);
            
            const isChocolateSwap = this.isChocolateTile(this.firstSelectedTile.getTileType()) || 
                                   this.isChocolateTile(this.secondSelectedTile.getTileType());
            
            if (isChocolateSwap || coords1.x === -1 || coords1.y === -1 || 
                coords2.x === -1 || coords2.y === -1) {
                this.clearSelection();
                this.canMove = true;
                await this.board!.dropAndFillTile();
                this.processMatches();

            } else {
                this.board!.swapTiles(this.secondSelectedTile, this.firstSelectedTile, () => {
                    this.clearSelection();
                    this.canMove = true;
                });
            }
        } else {
            this.clearSelection();
            this.canMove = true;
        }
    }
}

    private isChocolateTile(tileType: string): boolean {
        return tileType === 'chocolate';
    }

    private clearSelection(): void {
    if (this.firstSelectedTile) {
        this.firstSelectedTile.stopPulseEffect();
    }
    if (this.secondSelectedTile) {
        this.secondSelectedTile.stopPulseEffect();
    }

    this.firstSelectedTile = undefined;
    this.secondSelectedTile = undefined;
    
    this.resetHintTimer();
}

    public getBoard(): Board | null {
        return this.board
    }

    public isMoving(): boolean {
        return !this.canMove
    }

    public getSelectedTile(): Tile | undefined {
        return this.firstSelectedTile
    }
}