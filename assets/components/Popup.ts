import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import GameManager from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('Popup')
export class Popup extends Component {
    @property(GameManager)
    private gameManager: GameManager | null = null;
    
    showWindow() {
         if (this.gameManager) {
            this.gameManager.pauseGame();
        }
        this.node.active = true;
        
        this.node.scale = new Vec3(0, 0, 1);
        
        tween(this.node) 
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();
    }
    
    hideWindow() {
        tween(this.node) 
            .to(0.2, { scale: new Vec3(0, 0, 1) }, { easing: 'backIn' })
            .call(() => {
                this.node.active = false; 
                if (this.gameManager) {
                    this.gameManager.resumeGame();
                }
            })
            .start();
    }
    async newGame(){
        this.hideWindow()
      if(this.gameManager){
await this.gameManager?.newGame()
      }  
        

    }
    resumeClick() {
        console.log('Resume clicked');
        this.hideWindow();
    }
}

