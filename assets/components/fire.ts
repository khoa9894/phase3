import { _decorator, Component, Prefab, instantiate, Vec3, Node, RigidBody2D, v2, Color, SpriteRenderer, Sprite, PhysicsSystem2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FireConfetti')
export class FireConfetti extends Component {
    @property(Prefab)
    confettiPrefab: Prefab | null = null;

    @property(Number)
    confettiCount = 25;

    @property(Number)
    gravity = -2000; 

    @property(Number)
    airResistance = 0.4; 

    private colors: Color[] = [
        new Color(255, 100, 100), 
        new Color(100, 255, 100), 
        new Color(100, 100, 255), 
        new Color(255, 255, 100), 
        new Color(255, 100, 255),
    ];

    private confettiNodes: Node[] = [];

    protected start(): void {
        PhysicsSystem2D.instance.gravity = v2(0, this.gravity);
    }

    fireConfetti() {
        for (let i = 0; i < this.confettiCount; i++) {
            if (!this.confettiPrefab) {
                continue;
            }
            
            const confetti = instantiate(this.confettiPrefab);
            this.node.addChild(confetti);
            this.confettiNodes.push(confetti);
            
            const sprite = confetti.getComponent(Sprite);
            if (sprite) {
                const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
                sprite.color = randomColor;
            }

            const rb = confetti.getComponent(RigidBody2D)!;
            
            rb.gravityScale = 2.7 + Math.random() * 1.5; 
            const angle = 90 + Math.random() * 90;
            const rad = angle * (Math.PI / 180); 
            const initialSpeed = 40 + Math.random() * 40;
                 const velocity = v2(
                Math.cos(rad) * initialSpeed * (Math.random() < 0.5 ? 1 : -1), 
                Math.sin(rad) * initialSpeed
            );

            rb.linearVelocity = velocity;
            
            rb.angularVelocity = (Math.random() - 0.5) * 12;

            const randomOffset = v2(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 20
            );
            confetti.setPosition(randomOffset.x, randomOffset.y, 0);
        }

        this.scheduleOnce(() => {
            this.cleanup();
        }, 5);
    }

    protected update(deltaTime: number): void {
        this.confettiNodes.forEach(confetti => {
            if (!confetti || !confetti.isValid) return;
            
            const rb = confetti.getComponent(RigidBody2D);
            if (rb) {
                rb.linearVelocity = v2(
                    rb.linearVelocity.x * this.airResistance,
                    rb.linearVelocity.y * this.airResistance
                );
                
                rb.angularVelocity *= this.airResistance;
            }
        });
    }

    private cleanup(): void {
        this.confettiNodes.forEach(confetti => {
            if (confetti && confetti.isValid) {
                confetti.destroy();
            }
        });
        this.confettiNodes = [];
    }

    protected onDestroy(): void {
        this.cleanup();
    }
}