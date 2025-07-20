import { _decorator, Component, Input, resources, Sprite, SpriteFrame, EventTouch, Tween, tween, Vec3, Color, Node } from 'cc'
import GameConfig from '../constants/GameConfig'

const { ccclass, property } = _decorator

@ccclass('Tile')
export class Tile extends Component {
    @property(Sprite)
    private sprite: Sprite | null = null
    private pulseTween: Tween<any> | null = null
    private vanishTween: Tween<any> | null = null
    private lastType:string=''
    private isSelected: boolean = false

    private tileType: string = GameConfig.CandyTypes[0]
    private callbacks: Array<(tile: Tile) => void> = []

    protected __preload(): void {
        if (!this.sprite) throw new Error('Sprite is required')
    }

    public start(): void {
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this)
    }
    
    startPulseEffect(): void {
        this.stopPulseEffect()
        
        this.isSelected = true
        
        this.pulseTween = tween(this.node)
            .to(0.4, { scale: new Vec3(1.2, 1.2, 1) }, { easing: 'sineInOut' })
            .to(0.4, { scale: new Vec3(1.0, 1.0, 1) }, { easing: 'sineInOut' })
            .union()
            .repeatForever()
            .start()
    }

    stopPulseEffect(): void {
        if (this.pulseTween) {
            this.pulseTween.stop()
            this.pulseTween = null
        }
        
        this.node.setScale(1, 1, 1)
        this.isSelected = false
    }

    public isSelectedTile(): boolean {
        return this.isSelected
    }

  

    private onTouchStart(event: EventTouch): void {
        this.emitOnClick()
    }

    public addOnClickCallback(callback: (tile: Tile) => void): void {
        this.callbacks.push(callback)
    }

    public vanish(): void {
        this.stopPulseEffect()
        
        this.createSimpleParticles()
        
        this.vanishTween=tween(this.node)
            .to(0.3, { scale: new Vec3(0, 0, 1) }, { easing: 'sineIn' })
            .start()
    }
    public stopVanish():void{
        this.vanishTween?.stop()
    }

    private createSimpleParticles(): void {
        const particleCount = 4
        const tileColor = this.getTileColor()
        
        for (let i = 0; i < particleCount; i++) {
            this.createParticle(i, particleCount, tileColor)
        }
    }

    private createParticle(index: number, total: number, color: Color): void {
        const particleNode = new Node(`Particle_${index}`)
        particleNode.setPosition(this.node.position)
        this.node.parent!.addChild(particleNode)

        const sprite = particleNode.addComponent(Sprite)
        sprite.spriteFrame = this.sprite!.spriteFrame
        sprite.color = color
        
        particleNode.setScale(0.2, 0.2, 1)
        
        const angle = (index / total) * Math.PI * 2
        const force = 10 + Math.random() * 100
        const targetX = Math.cos(angle) * force
        const targetY = Math.sin(angle) * force
        
        tween(particleNode)
            .parallel(
                tween(particleNode).to(0.8, { 
                    position: new Vec3(
                        this.node.position.x + targetX,
                        this.node.position.y + targetY,
                        0
                    ) 
                }, { easing: 'sineOut' }),
                tween(particleNode).to(0.8, { scale: new Vec3(0, 0, 1) }, { easing: 'sineIn' }),
                tween(sprite).to(0.8, { 
                    color: new Color(color.r, color.g, color.b, 0) 
                }, { easing: 'sineIn' })
            )
            .call(() => {
                particleNode.destroy()
            })
            .start()
    }
    private downTile(){
        
    }
    private getTileColor(): Color {
        switch (this.tileType) {
            case 'red': return new Color(255, 100, 100, 255)
            case 'blue': return new Color(100, 100, 255, 255)
            case 'green': return new Color(100, 255, 100, 255)
            case 'yellow': return new Color(255, 255, 100, 255)
            case 'purple': return new Color(200, 100, 255, 255)
            case 'orange': return new Color(255, 165, 0, 255)
            default: return new Color(255, 255, 255, 255)
        }
    }

    public removeOnClickCallback(callback?: (tile: Tile) => void): void {
        if (callback) {
            this.callbacks = this.callbacks.filter((c) => c !== callback)
        } else {
            this.callbacks = []
        }
    }

    public emitOnClick(): void {
        for (const callback of this.callbacks) {
            callback(this)
        }
    }

    public getTileType(): string {
        return this.tileType
    }

    public setTileType(tileType: string): void {
        this.tileType = tileType
    
            const spriteFrame = resources.get(`images/${tileType}/spriteFrame`, SpriteFrame)
            
            
            this.sprite!.spriteFrame = spriteFrame
        
        }
    protected onDestroy(): void {
        this.stopPulseEffect()
        this.callbacks = []
    }
    public getType():string{
        return this.tileType;
    }
}