JavaScript
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: { default: 'arcade', arcade: { gravity: { y: 500 } } },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);

function preload() {
    // Тут грузим картинки: персонажа, платформу, фон
}

function create() {
    // Создаем игрока, группы платформ
}

function update() {
    // Логика движения игрока и генерация новых платформ выше
    // Если player.y > camera.scrollY + height, то Game Over!
}
