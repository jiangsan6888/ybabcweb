// 音频管理器
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.bgMusicSource = null;
        this.isPlaying = false;
        this.volume = 0.3;
        
        this.initAudioContext();
    }
    
    async initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API 不支持');
        }
    }
    
    // 创建背景音乐
    createBackgroundMusic() {
        if (!this.audioContext) return null;
        
        const duration = 8; // 8秒循环
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < data.length; i++) {
                const time = i / sampleRate;
                
                // 创建马里奥风格的音乐
                const melody = this.createMelody(time);
                const bass = this.createBass(time);
                const percussion = this.createPercussion(time);
                
                data[i] = (melody + bass + percussion) * this.volume;
            }
        }
        
        return buffer;
    }
    
    createMelody(time) {
        // 经典的马里奥主题旋律片段
        const notes = [
            { freq: 659.25, start: 0, duration: 0.5 },    // E5
            { freq: 659.25, start: 0.6, duration: 0.5 },  // E5
            { freq: 659.25, start: 1.2, duration: 0.5 },  // E5
            { freq: 523.25, start: 1.8, duration: 0.3 },  // C5
            { freq: 659.25, start: 2.1, duration: 0.5 },  // E5
            { freq: 783.99, start: 2.7, duration: 0.8 },  // G5
            { freq: 392.00, start: 3.8, duration: 0.8 },  // G4
        ];
        
        let amplitude = 0;
        const cycleTime = time % 8; // 8秒循环
        
        notes.forEach(note => {
            if (cycleTime >= note.start && cycleTime < note.start + note.duration) {
                const noteTime = cycleTime - note.start;
                const envelope = Math.max(0, 1 - noteTime / note.duration); // 衰减包络
                amplitude += Math.sin(2 * Math.PI * note.freq * time) * envelope * 0.3;
            }
        });
        
        return amplitude;
    }
    
    createBass(time) {
        // 简单的低音线
        const bassFreq = 130.81; // C3
        const cycleTime = time % 2; // 2秒循环
        
        if (cycleTime < 0.5) {
            return Math.sin(2 * Math.PI * bassFreq * time) * 0.2;
        } else if (cycleTime < 1.0) {
            return Math.sin(2 * Math.PI * (bassFreq * 1.5) * time) * 0.2; // G3
        } else if (cycleTime < 1.5) {
            return Math.sin(2 * Math.PI * (bassFreq * 1.25) * time) * 0.2; // E3
        } else {
            return Math.sin(2 * Math.PI * (bassFreq * 1.125) * time) * 0.2; // D3
        }
    }
    
    createPercussion(time) {
        // 简单的鼓点
        const beatTime = time % 1; // 1秒循环
        
        if (beatTime < 0.1) {
            // 踢鼓
            return (Math.random() - 0.5) * 0.5 * Math.exp(-beatTime * 20);
        } else if (beatTime > 0.5 && beatTime < 0.6) {
            // 小鼓
            return (Math.random() - 0.5) * 0.3 * Math.exp(-(beatTime - 0.5) * 30);
        }
        
        return 0;
    }
    
    // 创建音效
    createCoinSound() {
        if (!this.audioContext) return null;
        
        const duration = 0.3;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            const envelope = Math.exp(-time * 8);
            
            // 上升的音调效果
            const freq = 800 + time * 400;
            data[i] = Math.sin(2 * Math.PI * freq * time) * envelope * 0.5;
        }
        
        return buffer;
    }
    
    createCrashSound() {
        if (!this.audioContext) return null;
        
        const duration = 1.0;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            const envelope = Math.exp(-time * 3);
            
            // 噪音效果
            const noise = (Math.random() - 0.5) * 2;
            const lowFreq = Math.sin(2 * Math.PI * 60 * time);
            
            data[i] = (noise * 0.7 + lowFreq * 0.3) * envelope * 0.6;
        }
        
        return buffer;
    }
    
    // 播放背景音乐
    playBackgroundMusic() {
        if (!this.audioContext || this.isPlaying) return;
        
        try {
            const buffer = this.createBackgroundMusic();
            if (!buffer) return;
            
            this.bgMusicSource = this.audioContext.createBufferSource();
            this.bgMusicSource.buffer = buffer;
            this.bgMusicSource.loop = true;
            this.bgMusicSource.connect(this.audioContext.destination);
            this.bgMusicSource.start();
            this.isPlaying = true;
        } catch (e) {
            console.log('背景音乐播放失败:', e);
        }
    }
    
    // 停止背景音乐
    stopBackgroundMusic() {
        if (this.bgMusicSource && this.isPlaying) {
            this.bgMusicSource.stop();
            this.bgMusicSource = null;
            this.isPlaying = false;
        }
    }
    
    // 播放音效
    playSound(type) {
        if (!this.audioContext) return;
        
        try {
            let buffer;
            switch (type) {
                case 'coin':
                    buffer = this.createCoinSound();
                    break;
                case 'crash':
                    buffer = this.createCrashSound();
                    break;
                default:
                    return;
            }
            
            if (buffer) {
                const source = this.audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(this.audioContext.destination);
                source.start();
            }
        } catch (e) {
            console.log('音效播放失败:', e);
        }
    }
    
    // 设置音量
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
}

// 导出音频管理器
window.AudioManager = AudioManager;