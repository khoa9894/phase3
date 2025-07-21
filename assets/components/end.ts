import { _decorator, Component, Node, tween, Vec3, Label } from 'cc';
import GameManager from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('end')
export class end extends Component {
    
    @property(Label)
    private finalScoreLabel: Label | null = null;
    
    @property(GameManager)
    private gameManager: GameManager | null = null;
    
    showWindow(finalScore?: number) {
        console.log('Showing end window with score:', finalScore);
        
        this.node.active = true;
        this.node.scale = new Vec3(0, 0, 1);
        
        if (finalScore !== undefined) {
            this.updateScoreUI(finalScore);
        } else {
            const currentScore = this.gameManager?.getCurrentScore() || 0;
            this.updateScoreUI(currentScore);
        }
        
        tween(this.node) 
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();
    }
    
    private updateScoreUI(score: number): void {
        if (this.finalScoreLabel) {
            this.finalScoreLabel.string = `Score: ${score}`;
            
            this.finalScoreLabel.node.scale = new Vec3(0, 0, 1);
            tween(this.finalScoreLabel.node)
                .delay(0.2) 
                .to(0.4, { scale: new Vec3(1.2, 1.2, 1) }, { easing: 'backOut' })
                .to(0.2, { scale: new Vec3(1, 1, 1) }, { easing: 'quadOut' })
                .start();
        }
        
        console.log(`End UI updated with final score: ${score}`);
    }
    
    hideWindow() {
        tween(this.node) 
            .to(0.2, { scale: new Vec3(0, 0, 1) }, { easing: 'backIn' })
            .call(() => {
                this.node.active = false; 
            })
            .start();
    }
    
    public setFinalScore(score: number): void {
        this.updateScoreUI(score);
    }
    
    async newGameClick() {
        console.log('New Game clicked from end screen');
        this.hideWindow();
        
        if (this.gameManager) {
          await  this.gameManager.newGame();
        }
    }
    
    restartClick() {
        console.log('Restart clicked from end screen');
        this.hideWindow();
        
        if (this.gameManager) {
            this.gameManager.newGame();
        }
    }
}