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
        if (!this.canMove) return

        if (!this.firstSelectedTile) {
            this.firstSelectedTile = tile
            this.firstSelectedTile.startPulseEffect()

        } else if (this.firstSelectedTile === tile) {

        } else {
            this.secondSelectedTile = tile
            this.processMove()
        }
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
        
        // Remove matched tiles
        await this.board!.removeTiles(matches);
        
        // Clear selection
        this.clearSelection();
        
        try {
            await this.board!.dropAndFillTile();
            
            this.board!.setTileClickCallback((tile) => this.onTileClick(tile));
            
            this.isProcessingMatches = false;
            
            await this.processMatches();
            
        } catch (error) {
            console.error('Error in dropAndFillTiles:', error);
            this.isProcessingMatches = false;
            this.canMove = true;
        }

    } else {
        this.isProcessingMatches = false;
        
        if (this.firstSelectedTile && this.secondSelectedTile) {
            this.board!.swapTiles(this.secondSelectedTile, this.firstSelectedTile, () => {
                this.clearSelection();
                this.canMove = true;
            });
        } else {
            this.clearSelection();
            this.canMove = true;
        }
    }
}
    private clearSelection(): void {
        if (this.firstSelectedTile) {
            this.firstSelectedTile.stopPulseEffect()
        }
        if (this.secondSelectedTile) {
            this.secondSelectedTile.stopPulseEffect()
        }

        this.firstSelectedTile = undefined
        this.secondSelectedTile = undefined
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