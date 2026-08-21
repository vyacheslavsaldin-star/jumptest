const tg = window.Telegram.WebApp;
tg.expand();

document.body.style.backgroundColor = '#ffffff';
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 650,
    parent: document.body,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            // Оставьте true, пока не добьемся идеального совпадения рамок, потом поменяете на false
            debug: true 
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let platforms;
let cursors;
let score = 0;
let scoreText;

function preload() {
    this.load.image('hero', 'assets/hero.png');
    this.load.image('platform', 'assets/platform.jpg');
}

function create() {
    this.cameras.main.setBackgroundColor('#ffffff');

    platforms = this.physics.add.group({
        allowGravity: false,
        immovable: true
    });

    function createPlatform(scene, x, y) {
        let plat = platforms.create(x, y, 'platform');
        plat.setScale(0.35);
        plat.setBlendMode(Phaser.BlendModes.MULTIPLY);
        
        // Смещаем хитбокс влево, чтобы он точно накрывал нарисованный островок
        plat.body.setSize(plat.width * 0.4, plat.height * 0.25);
        plat.body.setOffset(plat.width * 0.05, plat.height * 0.15); 
        return plat;
    }

    createPlatform(this, 200, 580);

    for (let i = 1; i < 7; i++) {
        let x = Phaser.Math.Between(50, 350);
        let y = 580 - (i * 90);
        createPlatform(this, x, y);
    }

    // Игрок
    player = this.physics.add.sprite(200, 400, 'hero');
    player.setScale(0.4); 
    player.setBlendMode(Phaser.BlendModes.MULTIPLY);
    player.setBounce(0);
    player.setVelocityY(-600);
    
    // Хитбокс ниндзи под размер его тела
    player.body.setSize(player.width * 0.6, player.height * 0.7);
    player.body.setOffset(player.width * 0.2, player.height * 0.15);

    this.cameras.main.startFollow(player, true, 0.05, 0.05);
    this.cameras.main.setFollowOffset(0, 150);

    cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointermove', (pointer) => {
        player.x = pointer.x;
    });

    scoreText = this.add.text(20, 20, 'Очки: 0', {
        fontSize: '24px',
        fill: '#000000',
        fontStyle: 'bold'
    }).setScrollFactor(0);
}

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-350);
    } else if (cursors.right.isDown) {
        player.setVelocityX(350);
    }

    if (player.x < 0) {
        player.x = 400;
    } else if (player.x > 400) {
        player.x = 0;
    }

    this.physics.add.overlap(player, platforms, (p, plat) => {
        // Проверяем, что ниндзя падает вниз и наступает на верхнюю грань платформы
        if (p.body.velocity.y > 0 && p.body.bottom <= plat.body.y + 20) {
            p.setVelocityY(-650);
            if (tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }
        }
    });

    platforms.children.iterate((plat) => {
        if (plat) {
            if (plat.y > player.y + 400) {
                plat.y = player.y - Phaser.Math.Between(600, 700);
                plat.x = Phaser.Math.Between(50, 350);
                score += 10;
                scoreText.setText('Очки: ' + score);
            }
        }
    });

    if (player.y > this.cameras.main.scrollY + 700) {
        score = 0;
        player.setPosition(200, 300);
        player.setVelocityY(-600);
    }
}
