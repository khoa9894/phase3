const GameConfig = {
    GridWidth: 8,
    GridHeight: 8,
    TileWidth: 94,
    TileHeight: 103,
    CandyTypes: [
        'blue',
        'green',
        'yellow',
        'purple',
        // 'orange',
        // 'red',  
    ],
    SpecialType:[
        'blue-x',
        'blue-y',
        'red-x',
        'red-y',
        'green-x',
        'green-y',
        'yellow-x',
        'yellow-y',
        'purple-x',
        'purple-y',
        'orangle-x',
        'orangle-y',
        'candy-blue',
        'candy-red',
        'candy-green',
        'candy-yellow',
        'candy-purple',
        'candy-orange',
        'chocolate'
    ]
} as const

export default GameConfig
