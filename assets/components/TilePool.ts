import { _decorator, Component, instantiate, Prefab, tween, Vec3, type Node } from 'cc'
const { ccclass, property } = _decorator
import GameConfig from '../constants/GameConfig'
import { Tile } from './Tile'

@ccclass('TilePool')
export class TilePool extends Component {
     @property(Prefab)
    private tilePrefab: Prefab | null = null
    private listPool: Tile[] = []
    public createPool(){
       

        for(let i=0;i<64*2;i++){
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
            
            this.node.addChild(node)
            tile.setTileType(randomTileType)
            tile.node.active=false;
            this.listPool.push(tile)
            

        }
        
    }
public addTile(x: number, y: number): Tile | undefined {
    
   
    
    for (let i = 0; i < this.listPool.length; i++) {
        if (this.listPool[i] && this.listPool[i].node && !this.listPool[i].node.active) {
            const { x: xPos, y: yPos } = this.getTilePosition({ x, y })
            this.listPool[i].node.setPosition(xPos, yPos)
            
            this.listPool[i].node.active = true 
            
            return this.listPool[i]
        }
    }
    
    return undefined
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
    public Deactivate(tile: Tile){
        for(let i = 0; i < this.listPool.length; i++){   
            if(this.listPool[i] && this.listPool[i] === tile && this.listPool[i].node){
                const randomTileType: string =
                GameConfig.CandyTypes[Math.floor(Math.random() * GameConfig.CandyTypes.length)]
                this.listPool[i].node.scale = new Vec3(1, 1, 1);
                this.listPool[i].stopVanish()
                this.listPool[i].setTileType(randomTileType)
                this.listPool[i].node.active = false;
                break; 
            }
        }     
    }

}