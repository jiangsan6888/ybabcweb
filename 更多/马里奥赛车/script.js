class MarioKartGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameRunning = false;
        this.gamePaused = false;
        
        // 游戏状态
        this.score = 0;
        this.speed = 0;
        this.distance = 0;
        this.maxSpeed = 200;
        this.acceleration = 2;
        this.deceleration = 1;
        
        // 玩家车辆
        this.player = {
            x: this.canvas.width / 2 - 25,
            y: this.canvas.height - 100,
            width: 50,
            height: 80,
            color: '#ff0000',
            speed: 5
        };
        
        // 敌方车辆
        this.enemies = [];
        this.enemySpawnRate = 0.02;
        
        // 道路
        this.roadLines = [];
        this.roadLineSpeed = 3;
        
        // 金币
        this.coins = [];
        this.coinSpawnRate = 0.01;
        
        // 音频管理器
        this.audioManager = new AudioManager();
        this.musicEnabled = true;
        
        // 键盘输入
        this.keys = {};
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initRoadLines();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('musicBtn').addEventListener('click', () => this.toggleMusic());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restartGame());
    }
    
    initRoadLines() {
        for (let i = 0; i < 10; i++) {
            this.roadLines.push({
                x: this.canvas.width / 2 - 5,
                y: i * 80,
                width: 10,
                height: 40
            });
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        document.getElementById('gameOver').style.display = 'none';
        
        if (this.musicEnabled) {
            this.audioManager.playBackgroundMusic();
        }
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        document.getElementById('pauseBtn').textContent = this.gamePaused ? '继续' : '暂停';
        
        if (this.gamePaused) {
            this.audioManager.stopBackgroundMusic();
        } else if (this.musicEnabled) {
            this.audioManager.playBackgroundMusic();
        }
    }
    
    restartGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.speed = 0;
        this.distance = 0;
        this.enemies = [];
        this.coins = [];
        this.player.x = this.canvas.width / 2 - 25;
        this.player.y = this.canvas.height - 100;
        
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('pauseBtn').textContent = '暂停';
        
        this.audioManager.stopBackgroundMusic();
        
        this.updateUI();
    }
    
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        document.getElementById('musicBtn').textContent = this.musicEnabled ? '🎵 音乐' : '🔇 静音';
        
        if (this.musicEnabled && this.gameRunning && !this.gamePaused) {
            this.audioManager.playBackgroundMusic();
        } else {
            this.audioManager.stopBackgroundMusic();
        }
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.handleInput();
        this.updatePlayer();
        this.updateEnemies();
        this.updateCoins();
        this.updateRoadLines();
        this.checkCollisions();
        this.spawnEnemies();
        this.spawnCoins();
        this.updateGameStats();
        this.updateUI();
    }
    
    handleInput() {
        // 左右移动
        if (this.keys['ArrowLeft'] && this.player.x > 100) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.canvas.width - 150) {
            this.player.x += this.player.speed;
        }
        
        // 加速
        if (this.keys['Space']) {
            this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
        } else {
            this.speed = Math.max(this.speed - this.deceleration, 0);
        }
    }
    
    updatePlayer() {
        // 玩家车辆保持在屏幕底部
    }
    
    updateEnemies() {
        this.enemies.forEach((enemy, index) => {
            enemy.y += this.roadLineSpeed + this.speed * 0.1;
            
            if (enemy.y > this.canvas.height) {
                this.enemies.splice(index, 1);
                this.score += 10;
            }
        });
    }
    
    updateCoins() {
        this.coins.forEach((coin, index) => {
            coin.y += this.roadLineSpeed + this.speed * 0.1;
            
            if (coin.y > this.canvas.height) {
                this.coins.splice(index, 1);
            }
        });
    }
    
    updateRoadLines() {
        this.roadLines.forEach(line => {
            line.y += this.roadLineSpeed + this.speed * 0.1;
            
            if (line.y > this.canvas.height) {
                line.y = -40;
            }
        });
    }
    
    spawnEnemies() {
        if (Math.random() < this.enemySpawnRate + this.speed * 0.0001) {
            const lanes = [150, 250, 350, 450, 550];
            this.enemies.push({
                x: lanes[Math.floor(Math.random() * lanes.length)] - 25,
                y: -80,
                width: 50,
                height: 80,
                color: ['#0000ff', '#00ff00', '#ffff00', '#ff00ff'][Math.floor(Math.random() * 4)]
            });
        }
    }
    
    spawnCoins() {
        if (Math.random() < this.coinSpawnRate) {
            const lanes = [150, 250, 350, 450, 550];
            this.coins.push({
                x: lanes[Math.floor(Math.random() * lanes.length)] - 10,
                y: -20,
                width: 20,
                height: 20,
                rotation: 0
            });
        }
    }
    
    checkCollisions() {
        // 检查与敌方车辆的碰撞
        this.enemies.forEach((enemy, index) => {
            if (this.isColliding(this.player, enemy)) {
                this.gameOver();
            }
        });
        
        // 检查与金币的碰撞
        this.coins.forEach((coin, index) => {
            if (this.isColliding(this.player, coin)) {
                this.coins.splice(index, 1);
                this.score += 50;
                this.audioManager.playSound('coin');
            }
        });
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    updateGameStats() {
        this.distance += this.speed * 0.1;
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('speed').textContent = Math.round(this.speed);
        document.getElementById('distance').textContent = Math.round(this.distance);
    }
    
    gameOver() {
        this.gameRunning = false;
        this.audioManager.stopBackgroundMusic();
        this.audioManager.playSound('crash');
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
    }
    
    render() {
        // 绘制背景
        this.drawBackground();
        
        // 绘制道路
        this.drawRoad();
        
        // 绘制道路线
        this.drawRoadLines();
        
        // 绘制玩家车辆
        this.drawPlayer();
        
        // 绘制敌方车辆
        this.drawEnemies();
        
        // 绘制金币
        this.drawCoins();
        
        // 绘制暂停提示
        if (this.gamePaused) {
            this.drawPauseScreen();
        }
    }
    
    drawBackground() {
        // 绘制天空渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');  // 天蓝色
        gradient.addColorStop(0.3, '#98D8E8'); // 浅蓝色
        gradient.addColorStop(0.7, '#90EE90'); // 浅绿色
        gradient.addColorStop(1, '#228B22');   // 森林绿
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制远山
        this.drawMountains();
        
        // 绘制云朵
        this.drawClouds();
        
        // 绘制树木
        this.drawTrees();
    }
    
    drawMountains() {
        this.ctx.fillStyle = '#4682B4';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height * 0.4);
        this.ctx.lineTo(200, this.canvas.height * 0.2);
        this.ctx.lineTo(400, this.canvas.height * 0.3);
        this.ctx.lineTo(600, this.canvas.height * 0.15);
        this.ctx.lineTo(800, this.canvas.height * 0.25);
        this.ctx.lineTo(this.canvas.width, this.canvas.height * 0.4);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 山峰阴影
        this.ctx.fillStyle = '#2F4F4F';
        this.ctx.beginPath();
        this.ctx.moveTo(150, this.canvas.height * 0.25);
        this.ctx.lineTo(200, this.canvas.height * 0.2);
        this.ctx.lineTo(250, this.canvas.height * 0.3);
        this.ctx.lineTo(150, this.canvas.height * 0.35);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // 云朵1
        this.drawCloud(150, 80, 60);
        this.drawCloud(450, 60, 80);
        this.drawCloud(650, 100, 50);
    }
    
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.3, y, size * 0.4, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.6, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.2, y - size * 0.3, size * 0.3, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.4, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawTrees() {
        // 左侧树木
        for (let i = 0; i < 5; i++) {
            this.drawTree(20 + i * 15, this.canvas.height * 0.6 + i * 20, 0.8 - i * 0.1);
        }
        
        // 右侧树木
        for (let i = 0; i < 5; i++) {
            this.drawTree(this.canvas.width - 50 - i * 15, this.canvas.height * 0.6 + i * 20, 0.8 - i * 0.1);
        }
    }
    
    drawTree(x, y, scale) {
        // 树干
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x - 3 * scale, y, 6 * scale, 30 * scale);
        
        // 树叶
        this.ctx.fillStyle = '#228B22';
        this.ctx.beginPath();
        this.ctx.arc(x, y - 10 * scale, 15 * scale, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#32CD32';
        this.ctx.beginPath();
        this.ctx.arc(x, y - 15 * scale, 12 * scale, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawRoad() {
        // 绘制道路基础
        const roadGradient = this.ctx.createLinearGradient(100, 0, 700, 0);
        roadGradient.addColorStop(0, '#2F2F2F');
        roadGradient.addColorStop(0.1, '#404040');
        roadGradient.addColorStop(0.5, '#505050');
        roadGradient.addColorStop(0.9, '#404040');
        roadGradient.addColorStop(1, '#2F2F2F');
        
        this.ctx.fillStyle = roadGradient;
        this.ctx.fillRect(100, 0, 600, this.canvas.height);
        
        // 绘制道路纹理
        this.drawRoadTexture();
        
        // 绘制道路边界
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.fillRect(95, 0, 10, this.canvas.height);
        this.ctx.fillRect(695, 0, 10, this.canvas.height);
        
        // 绘制路肩
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(85, 0, 10, this.canvas.height);
        this.ctx.fillRect(705, 0, 10, this.canvas.height);
    }
    
    drawRoadTexture() {
        // 添加道路纹理效果
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < 20; i++) {
            const x = 100 + Math.random() * 600;
            const y = Math.random() * this.canvas.height;
            this.ctx.fillRect(x, y, 2, 1);
        }
        
        // 添加道路裂缝效果
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(200, 0);
        this.ctx.quadraticCurveTo(250, this.canvas.height / 2, 300, this.canvas.height);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(500, 0);
        this.ctx.quadraticCurveTo(450, this.canvas.height / 2, 400, this.canvas.height);
        this.ctx.stroke();
    }
    
    drawRoadLines() {
        this.roadLines.forEach(line => {
            // 道路中心线 - 白色虚线
            const lineGradient = this.ctx.createLinearGradient(line.x, line.y, line.x, line.y + line.height);
            lineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            lineGradient.addColorStop(0.5, '#ffffff');
            lineGradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
            
            this.ctx.fillStyle = lineGradient;
            this.ctx.fillRect(line.x, line.y, line.width, line.height);
            
            // 道路线条边缘阴影
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.fillRect(line.x - 1, line.y, 1, line.height);
            this.ctx.fillRect(line.x + line.width, line.y, 1, line.height);
        });
        
        // 绘制车道分隔线
        this.drawLaneLines();
    }
    
    drawLaneLines() {
        // 左车道线
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([20, 20]);
        this.ctx.beginPath();
        this.ctx.moveTo(250, 0);
        this.ctx.lineTo(250, this.canvas.height);
        this.ctx.stroke();
        
        // 右车道线
        this.ctx.beginPath();
        this.ctx.moveTo(550, 0);
        this.ctx.lineTo(550, this.canvas.height);
        this.ctx.stroke();
        
        // 重置线条样式
        this.ctx.setLineDash([]);
    }
    
    drawPlayer() {
        this.drawCar(this.player.x, this.player.y, this.player.width, this.player.height, this.player.color, true);
    }
    
    drawEnemies() {
        this.enemies.forEach(enemy => {
            this.drawCar(enemy.x, enemy.y, enemy.width, enemy.height, enemy.color, false);
        });
    }
    
    drawCar(x, y, width, height, color, isPlayer = false) {
        // 绘制车辆阴影
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(x + 2, y + height + 2, width, 8);
        
        // 车身主体 - 使用渐变效果
        const carGradient = this.ctx.createLinearGradient(x, y, x + width, y);
        carGradient.addColorStop(0, this.lightenColor(color, 20));
        carGradient.addColorStop(0.5, color);
        carGradient.addColorStop(1, this.darkenColor(color, 20));
        
        this.ctx.fillStyle = carGradient;
        this.ctx.fillRect(x, y, width, height);
        
        // 车身高光
        this.ctx.fillStyle = this.lightenColor(color, 40);
        this.ctx.fillRect(x + 2, y + 2, width - 4, 8);
        
        // 前挡风玻璃
        const windshieldGradient = this.ctx.createLinearGradient(x, y, x, y + height * 0.3);
        windshieldGradient.addColorStop(0, 'rgba(135, 206, 235, 0.9)');
        windshieldGradient.addColorStop(1, 'rgba(135, 206, 235, 0.6)');
        
        this.ctx.fillStyle = windshieldGradient;
        this.ctx.fillRect(x + 5, y + 5, width - 10, height * 0.25);
        
        // 后挡风玻璃
        this.ctx.fillStyle = 'rgba(135, 206, 235, 0.7)';
        this.ctx.fillRect(x + 5, y + height * 0.7, width - 10, height * 0.25);
        
        // 车轮 - 更立体的效果
        this.drawWheel(x - 5, y + 10);
        this.drawWheel(x + width - 3, y + 10);
        this.drawWheel(x - 5, y + height - 25);
        this.drawWheel(x + width - 3, y + height - 25);
        
        // 车灯
        this.ctx.fillStyle = '#FFFF99';
        this.ctx.fillRect(x + 8, y + 2, 6, 4);
        this.ctx.fillRect(x + width - 14, y + 2, 6, 4);
        
        // 尾灯
        this.ctx.fillStyle = '#FF4444';
        this.ctx.fillRect(x + 8, y + height - 6, 6, 4);
        this.ctx.fillRect(x + width - 14, y + height - 6, 6, 4);
        
        // 如果是玩家车辆，添加特殊标识和装饰
        if (isPlayer) {
            // 马里奥标识背景
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x + width/2, y + height/2, 12, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 马里奥"M"标识
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('M', x + width/2, y + height/2 + 5);
            
            // 玩家车辆装饰条纹
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(x + width/2 - 1, y + 15, 2, height - 30);
        }
    }
    
    drawWheel(x, y) {
        // 轮胎外圈
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(x, y, 8, 15);
        
        // 轮毂
        this.ctx.fillStyle = '#C0C0C0';
        this.ctx.fillRect(x + 1, y + 2, 6, 11);
        
        // 轮毂中心
        this.ctx.fillStyle = '#808080';
        this.ctx.fillRect(x + 2, y + 4, 4, 7);
        
        // 轮毂高光
        this.ctx.fillStyle = '#E0E0E0';
        this.ctx.fillRect(x + 1, y + 2, 2, 3);
    }
    
    // 颜色处理辅助函数
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }
    
    drawCoins() {
        this.coins.forEach(coin => {
            coin.rotation += 0.1;
            
            this.ctx.save();
            this.ctx.translate(coin.x + coin.width/2, coin.y + coin.height/2);
            this.ctx.rotate(coin.rotation);
            
            // 金币阴影
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(2, 2, coin.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 金币外圈 - 渐变效果
            const coinGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, coin.width/2);
            coinGradient.addColorStop(0, '#ffed4e');
            coinGradient.addColorStop(0.7, '#ffd700');
            coinGradient.addColorStop(1, '#b8860b');
            
            this.ctx.fillStyle = coinGradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, coin.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 金币边缘
            this.ctx.strokeStyle = '#b8860b';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, coin.width/2, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // 金币内部图案
            this.ctx.fillStyle = '#ffed4e';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, coin.width/3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 金币高光
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.beginPath();
            this.ctx.arc(-coin.width/6, -coin.width/6, coin.width/4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 金币中心标记
            this.ctx.fillStyle = '#b8860b';
            this.ctx.font = 'bold 8px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('$', 0, 3);
            
            this.ctx.restore();
        });
    }
    
    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏暂停', this.canvas.width/2, this.canvas.height/2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('点击继续按钮恢复游戏', this.canvas.width/2, this.canvas.height/2 + 50);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 创建音频文件（使用Web Audio API生成简单的音效）
function createAudioFiles() {
    // 创建背景音乐（简单的循环旋律）
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // 生成简单的背景音乐
    function createBackgroundMusic() {
        const duration = 4; // 4秒循环
        const sampleRate = audioContext.sampleRate;
        const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            // 创建简单的旋律
            const note1 = Math.sin(2 * Math.PI * 440 * time) * 0.1; // A4
            const note2 = Math.sin(2 * Math.PI * 523 * time) * 0.1; // C5
            const note3 = Math.sin(2 * Math.PI * 659 * time) * 0.1; // E5
            
            // 简单的节拍模式
            const beat = Math.floor(time * 2) % 4;
            let volume = 0;
            
            switch(beat) {
                case 0: volume = note1; break;
                case 1: volume = note2; break;
                case 2: volume = note3; break;
                case 3: volume = note2; break;
            }
            
            data[i] = volume * Math.sin(time * 10); // 添加一些变化
        }
        
        return buffer;
    }
    
    // 由于浏览器安全限制，我们不能直接创建音频文件
    // 但可以在用户交互后播放生成的音频
    window.generateAudio = function() {
        const bgMusicBuffer = createBackgroundMusic();
        const source = audioContext.createBufferSource();
        source.buffer = bgMusicBuffer;
        source.loop = true;
        source.connect(audioContext.destination);
        return source;
    };
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new MarioKartGame();
    
    // 尝试创建音频
    try {
        createAudioFiles();
    } catch (e) {
        console.log('音频创建失败，将使用静音模式');
    }
    
    // 添加触摸控制支持（移动设备）
    let touchStartX = 0;
    
    game.canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        e.preventDefault();
    });
    
    game.canvas.addEventListener('touchmove', (e) => {
        const touchX = e.touches[0].clientX;
        const deltaX = touchX - touchStartX;
        
        if (deltaX > 10) {
            game.keys['ArrowRight'] = true;
            game.keys['ArrowLeft'] = false;
        } else if (deltaX < -10) {
            game.keys['ArrowLeft'] = true;
            game.keys['ArrowRight'] = false;
        }
        
        e.preventDefault();
    });
    
    game.canvas.addEventListener('touchend', (e) => {
        game.keys['ArrowLeft'] = false;
        game.keys['ArrowRight'] = false;
        e.preventDefault();
    });
    
    // 双击加速
    game.canvas.addEventListener('dblclick', () => {
        game.keys['Space'] = true;
        setTimeout(() => {
            game.keys['Space'] = false;
        }, 100);
    });
});