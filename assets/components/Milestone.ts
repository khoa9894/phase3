import { _decorator, Component, instantiate, Node, Prefab, ProgressBar, tween, Vec3, randomRange } from 'cc';
const { ccclass, property } = _decorator;
import GameConfig from '../constants/GameConfig'
import { Tile } from './Tile'

@ccclass('Milestone')
export class Milestone extends Component {
    private currentScore: number = 0;
    private targetScore: number = 1000;
    private listPool: Tile[] = []
    
    @property(Prefab)
    private tilePrefab: Prefab | null = null 
    
    @property
    private confettiCount: number = 15; 
    
    @property
    private confettiDuration: number = 2.0;
    
    protected start(): void {
        this.createPool()
    }
    
    fillBar(addScore: number): void {
        const progressBar = this.getComponent(ProgressBar);
        if (!progressBar) return;
        
        this.currentScore += addScore;
        
        const progress = Math.min(this.currentScore / this.targetScore, 1.0);
        progressBar.progress = progress;
        
        if (this.currentScore >= this.targetScore) {
            this.onMilestoneCompleted();
        }
    }
    
    private onMilestoneCompleted(): void {
        console.log('Milestone completed!');
        this.playConfettiEffect();
    }
    public getHi():boolean{
        return this.currentScore >= this.targetScore
    }
    private createPool() {
        for(let i = 0; i < 20; i++) {
            const randomTileType: string =
            GameConfig.CandyTypes[Math.floor(Math.random() * GameConfig.CandyTypes.length)]
            
            const node = instantiate(this.tilePrefab) as Node | null
            if (node === null) {
                console.error('TilePool createPool: Failed to instantiate tile prefab at index', i)
                throw new Error('Failed to instantiate tile prefab')
            }
            
            const tile = node.getComponent(Tile) as Tile | null
            if (tile === null) {
                console.error('TilePool createPool: Failed to get tile component at index', i)
                throw new Error('Failed to get tile component')
            }
            tile.node.setScale(0.1,0.1,0.1)
            this.node.addChild(node)
            tile.setTileType(randomTileType)
            tile.node.active = false;
            this.listPool.push(tile)
        }
    }
    
    private playConfettiEffect(): void {
        const actualConfettiCount = Math.min(this.confettiCount, this.listPool.length);
        
        for(let i = 0; i < actualConfettiCount; i++) {
            const tile = this.listPool[i];
            if (!tile || !tile.node) continue;
            tile.node.active = true;
            tile.node.setScale(0.4,0.4,0.4);
            tile.node.setPosition(30,-100);
            tile.node.angle = 0;
            
            const startPos = Vec3.ZERO;
            
            const endX = randomRange(-300, 300);
            const endY = randomRange(600, 700);
            const endPos = new Vec3(endX, endY, 0);
            
            tween(tile.node)
                .to(this.confettiDuration * 0.5, { 
                    position: endPos,
                    scale: new Vec3(0.1, 0.1, 0.1) 
                }, { 
                    easing: 'quadOut' 
                })
                .to(this.confettiDuration * 0.8, { 
                    position: new Vec3(endPos.x, endPos.y - 200, 0),
                    scale: new Vec3(0.1, 0.1, 0.1) 
                }, { 
                    easing: 'quadIn' 
                })
                .call(() => {
                    tile.node.active = false;
                })
                .start();
            
            tween(tile.node)
                .to(this.confettiDuration, { angle: randomRange(360, 720) })
                .start();
            
            const delay = i * 0.05; 
            if (delay > 0) {
                tile.node.active = false;
                this.scheduleOnce(() => {
                    tile.node.active = true;
                }, delay);
            }
        }
        
        this.scheduleOnce(() => {
            this.resetConfetti();
        }, this.confettiDuration + 0.5);
    }
    
    private resetConfetti(): void {
        this.listPool.forEach(tile => {
            if (tile && tile.node) {
                tile.node.active = false;
                tile.node.setPosition(Vec3.ZERO);
                tile.node.setScale(0.1,0.1,0.1);
                tile.node.angle = 0;
            }
        });
    }
    
    public resetMilestone(newTarget?: number): void {
        this.currentScore = 0;
        if (newTarget) {
            this.targetScore = newTarget;
        }
        
        const progressBar = this.getComponent(ProgressBar);
        if (progressBar) {
            progressBar.progress = 0;
        }
        
        this.resetConfetti();
    }
    
  
}