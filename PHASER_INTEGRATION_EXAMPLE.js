// EJEMPLO DE INTEGRACIÓN CON PHASER 3
// CarFactoryScene.js - Escena para seleccionar skins de autos

export default class CarFactoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CarFactoryScene' });
    this.skinCatalog = null;
    this.selectedSkin = null;
  }

  preload() {
    // 1. Cargar el catálogo de skins generado por SkinPress
    this.load.json('skinCatalog', 'assets/skins/index.json');
    
    // 2. Loading screen (opcional)
    this.createLoadingScreen();
    
    // 3. El catálogo se cargará y luego cargaremos las imágenes
    this.load.on('complete', () => {
      this.loadSkinImages();
    });
  }

  loadSkinImages() {
    // Obtener catálogo
    this.skinCatalog = this.cache.json.get('skinCatalog');
    
    if (!this.skinCatalog || !this.skinCatalog.items) {
      console.error('No se pudo cargar el catálogo de skins');
      return;
    }
    
    // Cargar cada skin del catálogo
    this.skinCatalog.items.forEach(item => {
      const key = item.file.replace('.webp', ''); // Clave sin extensión
      const path = `assets/skins/${item.file}`;
      
      // Si aún no está cargada, cargarla
      if (!this.textures.exists(key)) {
        this.load.image(key, path);
      }
    });
    
    // Iniciar la carga
    this.load.start();
  }

  create() {
    // Verificar que tenemos skins
    if (!this.skinCatalog || this.skinCatalog.items.length === 0) {
      this.add.text(400, 300, 'No hay skins disponibles', {
        fontSize: '24px',
        color: '#ff0000'
      }).setOrigin(0.5);
      return;
    }

    // Título
    this.add.text(400, 50, '🎨 Selecciona tu Skin', {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Crear grid de skins
    this.createSkinsGrid();
    
    // Botón para continuar
    this.createContinueButton();
  }

  createSkinsGrid() {
    const startX = 150;
    const startY = 150;
    const spacingX = 150;
    const spacingY = 180;
    const perRow = 4;
    
    this.skinCatalog.items.forEach((item, index) => {
      const row = Math.floor(index / perRow);
      const col = index % perRow;
      const x = startX + (col * spacingX);
      const y = startY + (row * spacingY);
      
      // Crear contenedor para cada skin
      this.createSkinButton(item, x, y);
    });
  }

  createSkinButton(item, x, y) {
    const key = item.file.replace('.webp', '');
    
    // Fondo del botón
    const bg = this.add.rectangle(x, y, 120, 140, 0x2d3561, 0.8)
      .setInteractive({ useHandCursor: true });
    
    // Imagen del skin (escalada para que quepa)
    const skin = this.add.image(x, y - 10, key)
      .setDisplaySize(100, 100); // Ajusta según tus skins
    
    // Label
    const label = this.add.text(x, y + 60, item.label, {
      fontSize: '14px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    // Indicador de selección
    const selectedBorder = this.add.rectangle(x, y, 120, 140)
      .setStrokeStyle(3, 0x6c5ce7)
      .setVisible(false);
    
    // Interacción
    bg.on('pointerover', () => {
      bg.setFillStyle(0x0f3460);
      this.tweens.add({
        targets: [skin, label],
        scale: 1.1,
        duration: 100
      });
    });
    
    bg.on('pointerout', () => {
      bg.setFillStyle(0x2d3561);
      if (this.selectedSkin !== item.file) {
        this.tweens.add({
          targets: [skin, label],
          scale: 1,
          duration: 100
        });
      }
    });
    
    bg.on('pointerdown', () => {
      // Deseleccionar anterior
      this.children.list.forEach(child => {
        if (child.getData && child.getData('selectedBorder')) {
          child.setVisible(false);
        }
      });
      
      // Seleccionar nuevo
      this.selectedSkin = item.file;
      selectedBorder.setVisible(true);
      selectedBorder.setData('selectedBorder', true);
      
      // Feedback
      this.sound.play('select'); // Añade un sonido si tienes
      
      // Guardar en registro global del juego
      this.registry.set('selectedSkin', item.file);
      
      console.log('Skin seleccionada:', item.label, item.file);
    });
  }

  createContinueButton() {
    const btn = this.add.rectangle(400, 550, 200, 50, 0x6c5ce7)
      .setInteractive({ useHandCursor: true });
    
    const btnText = this.add.text(400, 550, 'Continuar ▶', {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    btn.on('pointerover', () => {
      btn.setFillStyle(0x5f3dc4);
      this.tweens.add({
        targets: btn,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100
      });
    });
    
    btn.on('pointerout', () => {
      btn.setFillStyle(0x6c5ce7);
      this.tweens.add({
        targets: btn,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
    });
    
    btn.on('pointerdown', () => {
      if (!this.selectedSkin) {
        // Mostrar mensaje de error
        this.add.text(400, 520, 'Selecciona un skin primero', {
          fontSize: '16px',
          color: '#ff6b6b'
        }).setOrigin(0.5);
        return;
      }
      
      // Ir a la escena del juego
      this.scene.start('GameScene', {
        skinFile: this.selectedSkin
      });
    });
  }

  createLoadingScreen() {
    const loadingText = this.add.text(400, 300, 'Cargando skins...', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    this.load.on('progress', (value) => {
      loadingText.setText(`Cargando... ${Math.floor(value * 100)}%`);
    });
    
    this.load.on('complete', () => {
      loadingText.destroy();
    });
  }
}

// =============================================================================
// EJEMPLO DE USO EN GameScene
// =============================================================================

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    // Recibir skin seleccionada desde CarFactoryScene
    this.selectedSkinFile = data.skinFile || 'skin_default.webp';
  }

  create() {
    // Cargar el auto con el skin seleccionado
    const skinKey = this.selectedSkinFile.replace('.webp', '');
    
    this.player = this.physics.add.sprite(400, 300, skinKey);
    this.player.setScale(0.5); // Ajusta según necesites
    
    // ... resto de la lógica del juego
  }
}

// =============================================================================
// ALTERNATIVA: CARGAR SKINS DINÁMICAMENTE
// =============================================================================

// Si quieres permitir que el usuario cargue skins custom durante el juego:

class SkinLoader {
  static async loadCustomSkin(scene, file) {
    try {
      // Leer el archivo WebP
      const blob = file; // File object from input
      const url = URL.createObjectURL(blob);
      
      // Crear textura temporal
      const img = new Image();
      img.src = url;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Crear texture en Phaser
      const texture = scene.textures.addImage('customSkin', img);
      
      // Limpiar URL temporal
      URL.revokeObjectURL(url);
      
      return texture;
    } catch (error) {
      console.error('Error loading custom skin:', error);
      return null;
    }
  }
}

// Uso:
// const customTexture = await SkinLoader.loadCustomSkin(this, fileFromInput);
// this.player.setTexture('customSkin');
