import { FireConfetti } from './fire';
import { end } from './end';
import { _decorator, Component, input, Input, EventTouch, Camera, geometry, Prefab, instantiate, Node,Label, AudioClip, AudioSource } from 'cc'
const { ccclass, property } = _decorator
import { Tile } from './Tile'
import { Board } from './Board'
import { Milestone } from './Milestone'
@ccclass('GameManager')
export default class GameManager extends Component {
    private canMove = false
private moveRemaining = 30;
    private firstSelectedTile: Tile | undefined = undefined
    private secondSelectedTile: Tile | undefined = undefined
    private isProcessingMatches = false;
    private hintTimer: number | null = null;
    private isPaused = false;
    @property(Label)
    private scoreLabel: Label | null = null;
    @property(AudioClip)
    private backgroundMusic: AudioClip | null = null;
    private isplay:boolean=true
    @property(AudioSource)
    private audioSource: AudioSource | null = null;
    @property(FireConfetti)
    private FireConfetti:FireConfetti|null=null
     @property(FireConfetti)
    private FireConfetti1:FireConfetti|null=null
    @property(Label)
    private movesLabel: Label | null = null;
    @property(end)
    private end:end|null=null
        private playBackgroundMusic(): void {
        if (this.audioSource && this.backgroundMusic ) {
            this.audioSource.clip = this.backgroundMusic;
            this.audioSource.loop = true;
            this.audioSource.volume = 0.5;
            this.audioSource.play();
            console.log('Background music started');
        } else {
            console.warn('AudioSource or AudioClip not set');
        }
    }
    
    private stopBackgroundMusic(): void {
        if (this.audioSource && this.audioSource.playing) {
            this.audioSource.stop();
            console.log('Background music stopped');
        }
    }
public pauseGame(): void {
        this.isPaused = true;
        this.canMove = false;
        
        if (this.hintTimer !== null) {
            clearTimeout(this.hintTimer);
            this.hintTimer = null;
        }
        
        this.clearHint();
        
  
        
        console.log('Game paused');
    }
      public resumeGame(): void {
        this.isPaused = false;
        this.canMove = !this.isProcessingMatches; 
        
        this.resetHintTimer();
        
   
        
        console.log('Game resumed');
    }
    
    public getIsPaused(): boolean {
        return this.isPaused;
    }
private currentHintTiles: Tile[] = [];
    @property(Prefab)
 private coffPrelab: Prefab | null = null
    @property(Board)
    private board: Board | null = null
    
    __preload(): void {
        if (this.board === null) throw new Error('Board component is not set')
    }

    start(): void {
        this.initializeGame()
        
    }
    public async newGame(): Promise<void> {
     console.log('Starting new game...');
    
    // this.pauseGame();
    
    // this.clearSelection();
    // this.clearHint();
    
    // this.isProcessingMatches = false;
    // this.canMove = false;
    
    // if (this.hintTimer !== null) {
    //     clearTimeout(this.hintTimer);
    //     this.hintTimer = null;
    // }
    this.moveRemaining = 30;
    if (this.board) {
        this.board.clearBoard(); 
        
        this.board.getMile()?.resetMilestone();
    }
    this.moveRemaining=30
         this.canMove = true
        this.firstSelectedTile = undefined
        this.secondSelectedTile = undefined
        this.isPaused=false
        this.board!.createBoard()
        this.board!.getMile()?.resetMilestone()
        this.board!.setTileClickCallback((tile) => this.onTileClick(tile))
        this.updateUI()
        await this.processMatches()
    
 
}
    private createCoff(): Node | null {
    if (!this.coffPrelab) {
        console.error('Confetti prefab is not set');
        return null;
    }
    const confettiNode = instantiate(this.coffPrelab) as Node;
    if (confettiNode === null) {
        console.error('Failed to instantiate confetti prefab'); 
        throw new Error('Failed to instantiate confetti prefab'); 
    }
    
    this.node.addChild(confettiNode);
    confettiNode.active = true;
    
    return confettiNode;
}
private updateUI(): void {
    if (this.scoreLabel && this.board) {
        const currentScore = this.board.getMile()?.getCurrentScore() || 0;
        this.scoreLabel.string = `Score: ${currentScore}`;
    }
    
    if (this.movesLabel) {
        this.movesLabel.string = `Moves: ${this.moveRemaining}`;
    }
    
    console.log(`UI Updated - Score: ${this.board?.getMile()?.getCurrentScore()}, Moves: ${this.moveRemaining}`);
}
hihi(){
    this.end?.hideWindow()
    this.newGame()
}
    private async initializeGame(): Promise<void> {
        this.moveRemaining = 30;
        this.canMove = true
        this.firstSelectedTile = undefined
        this.secondSelectedTile = undefined
        this.playBackgroundMusic()
        this.board!.createBoard()
        this.board!.setTileClickCallback((tile) => this.onTileClick(tile))
        
        await this.processMatches()
    }

    private onTileClick(tile: Tile): void {
    if (!this.canMove||this.isPaused) return;

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
        if (this.isPaused) return; 
    if (this.hintTimer !== null) {
        clearTimeout(this.hintTimer);
    }
    
    this.clearHint();
    
    this.hintTimer = setTimeout(() => {
        this.showHint();
    }, 1000); 
}

private async showHint(): Promise<void> {
    if (!this.canMove || this.isProcessingMatches||this.isPaused) return;
    
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
        this.moveRemaining--;
         this.updateUI();
        if (this.moveRemaining <= 0) {
            this.handleGameOver();
            return;
        }
            this.processMatches([tile1, tile2])
                   

        })
    }

    private async processMatches(swappedTiles?: Tile[]): Promise<void> {
    if (this.isProcessingMatches || this.isPaused) return;
    if(this.board?.getMile()?.getHi()){
        this.FireConfetti!.fireConfetti()
        this.FireConfetti1!.fireConfetti()
         await this.board!.shuffle()
         
         this.board.getMile()?.resetMilestone()

    }
    const matches = this.board!.getMatches(swappedTiles);

    if (matches.length > 0) {
        this.isProcessingMatches = true;
        
        this.clearHint();
        if (this.hintTimer !== null) {
            clearTimeout(this.hintTimer);
            this.hintTimer = null;
        }
        
        this.clearSelection();
        
        await this.board!.removeTiles(matches);
            this.updateUI();

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
private handleGameOver(): void {
    console.log('Game Over - No moves remaining!');
    
    this.canMove = false;
    this.isPaused = true;
    
    this.clearHint();
    if (this.hintTimer !== null) {
        clearTimeout(this.hintTimer);
        this.hintTimer = null;
    }
    
    this.board!.clearBoard();
    
    const finalScore = this.getCurrentScore();
    console.log(`Game ended with final score: ${finalScore}`);
    
    if (this.end) {
        this.end.showWindow(finalScore);
    } else {
        console.error('End component is null!');
    }
    
    this.updateUI();
}

public getMoveRemaining(): number {
    return this.moveRemaining;
}

public getCurrentScore(): number {
    return this.board?.getMile()?.getCurrentScore() || 0;
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