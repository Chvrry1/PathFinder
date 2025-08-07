import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showGame, setShowGame] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('initial');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationPhase('showLetters');
    }, 1000);

    const timer2 = setTimeout(() => {
      setAnimationPhase('slideUp');
    }, 3000);

    const timer3 = setTimeout(() => {
      setShowSplash(false);
    }, 4000);

    const timer4 = setTimeout(() => {
      setShowGame(true);
    }, 4100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const letters = 'PATHFINDER'.split('');
  const treasureLines = [
    { x: '20px', y: '135px', rotation: 40, delay: 0.3 },
    { x: '110px', y: '155px', rotation: 0, delay: 0.4 },
    { x: '200px', y: '135px', rotation: -40, delay: 0.5 },
    { x: '315px', y: '-10px', rotation: -40, delay: 0.6 },
    { x: '405px', y: '-30px', rotation: 0, delay: 0.7 },
    { x: '495px', y: '-10px', rotation: 40, delay: 0.8 },
  ];

  return (
    <div>
      {showSplash && (
        <div className={`splash ${animationPhase === 'slideUp' ? 'slide-up' : ''}`}>
          <div className="treasure-container">
            {treasureLines.map((line, index) => (
              <div
                key={`line-${index}`}
                className="treasure-line"
                style={{
                  left: line.x,
                  top: line.y,
                  transform: `rotate(${line.rotation}deg)`,
                  opacity: animationPhase === 'showLetters' || animationPhase === 'slideUp' ? 1 : 0,
                  transition: `opacity 0.5s ease-out ${line.delay}s`,
                }}
              />
            ))}
            <div
              className="treasure-x"
              style={{
                opacity: animationPhase === 'showLetters' || animationPhase === 'slideUp' ? 1 : 0,
                transition: 'all 0.8s ease-out 1.0s',
                transform: animationPhase === 'showLetters' || animationPhase === 'slideUp'
                  ? 'scale(1) rotate(0deg)'
                  : 'scale(0) rotate(180deg)',
              }}
            >
              
            </div>
            <div className="letters">
              {letters.map((letter, index) => (
                <span
                  className={`letter ${animationPhase === 'showLetters' || animationPhase === 'slideUp' ? 'visible' : ''}`}
                  style={{
                    transitionDelay: `${index * 0.08}s`
                  }}
                >
                  {letter}
                </span>

              ))}
            </div>
          </div>
        </div>
      )}
      <Game show={showGame} />
    </div>
  );
}

function Game({ show }) {
  const [pathParts, setPathParts] = useState([]);
  const [challenge, setChallenge] = useState(null);
  const [gameStatus, setGameStatus] = useState('playing');
  const [introStep, setIntroStep] = useState(0);
  const [hideInstructions, setHideInstructions] = useState(false);

  // Generar desafío aleatorio al cargar
  useEffect(() => {
    if (show) {
      const timers = [
        setTimeout(() => setIntroStep(1), 500),     // Árbol
        setTimeout(() => setIntroStep(2), 1500),    // Mensaje de introducción
        setTimeout(() => setIntroStep(3), 5500),    // Contenedor draggable
        setTimeout(() => setIntroStep(4), 9500),    // Drop area
        setTimeout(() => setIntroStep(5), 14500),   // Challenge header
        setTimeout(() => setHideInstructions(true), 20000), // Ocultar instrucciones después de 15s
      ];

      return () => timers.forEach(clearTimeout);
    }
  }, [show]);

  useEffect(() => {
    if (introStep >= 5) {
      generateNewChallenge();
    }
  }, [introStep]);

  function generateNewChallenge() {
    const allFiles = getAllFiles(sampleTree);
    const htmlFiles = allFiles.filter(file => file.name.endsWith('.html'));
    const otherFiles = allFiles.filter(file => !file.name.endsWith('.html'));
    
    if (htmlFiles.length === 0 || otherFiles.length === 0) return;
    
    const startFile = htmlFiles[Math.floor(Math.random() * htmlFiles.length)];
    const endFile = otherFiles[Math.floor(Math.random() * otherFiles.length)];
    
    setChallenge({ startFile, endFile });
    setPathParts([]);
    setGameStatus('playing');
  }

  // Verificar si la ruta construida es correcta
  useEffect(() => {
    if (challenge && pathParts.length > 0) {
      const currentPath = pathParts.join('');
      const correctPath = calculateCorrectPath(challenge.startFile, challenge.endFile);

      const absolutePath = challenge.endFile.path.replace(/^.*?(\/)/, '/');
      
      if ([correctPath, absolutePath].includes(currentPath)) {
        setGameStatus('success');
      }
    }
  }, [pathParts, challenge]);

  return (
    <div className={`mainContent ${show ? 'visible' : ''}`}>
      {/* Challenge Header - Aparece al final */}
      {introStep >= 5 && challenge && (
        <div className={`intro-element challenge-header ${introStep >= 5 ? 'show' : ''}`}>
          <div className="challenge-info">
            <h2>🎯 Desafío PathFinder</h2>
            <div className="challenge-details">
              <div className="file-info">
                <span
                  className="label"
                  style={{
                    backgroundColor: '#d1ecf1',
                    color: '#0c5460',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    display: 'inline-block',
                  }}
                >
                  Desde:
                </span>
                <span className="file-name" style={{ marginLeft: '8px' }}>
                  📄 {challenge.startFile.name}
                </span>
              </div>
              <div className="arrow">→</div>
              <div className="file-info">
                <span
                  className="label"
                  style={{
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    display: 'inline-block',
                  }}
                >
                  Hacia:
                </span>
                <span className="file-name" style={{ marginLeft: '8px' }}>
                  📄 {challenge.endFile.name}
                </span>
              </div>
            </div>

          </div>
          <div className={`floating-instruction ${hideInstructions ? 'fade-out' : ''}`}>
            <p>🎯 ¡Ahora tienes tu desafío! Construye la ruta correcta desde el archivo de origen hasta el destino.</p>
          </div>
        </div>
      )}

      <div className="game-layout">
        {/* Árbol de archivos - Aparece primero */}
        <div className={`intro-element tree-section ${introStep >= 1 ? 'show' : ''}`}>
          <FileTreeView 
            selectedStart={challenge?.startFile.name} 
            selectedEnd={challenge?.endFile.name} 
          />
          {/* Mensaje de bienvenida flotante */}
          {introStep >= 2 && (
            <div className={`floating-instruction ${hideInstructions ? 'fade-out' : ''}`}>
              <h3>🌳 ¡Bienvenido a PathFinder!</h3>
              <p>Este es tu sistema de archivos. Aquí puedes ver la estructura completa de carpetas y archivos. Tu misión será construir rutas entre diferentes archivos.</p>
            </div>
          )}
        </div>

        <div className="sidebar-container">
          {/* Contenedor draggable - Aparece tercero */}
          {introStep >= 3 && (
            <div className={`intro-element draggable-section ${introStep >= 3 ? 'show' : ''}`}>
              <div className="draggable-area">
                <DraggableContainer
                  tree={sampleTree}
                  pathParts={pathParts}
                  setPathParts={setPathParts}
                  gameStatus={gameStatus}
                />
              </div>
              <div className={`floating-instruction ${hideInstructions ? 'fade-out' : ''}`}>
                <p>🧩 Desde aquí puedes arrastrar elementos para construir tu ruta. ¡Empieza siempre con un prefijo!</p>
                <p>🎮 Usa estos botones para limpiar tu ruta o generar un nuevo desafío cuando quieras</p>
              </div>
            </div>
          )}

          {/* Botones - Aparecen quinto */}
          {introStep >= 3 && (
            <div className={`intro-element actions-section ${introStep >= 3 ? 'show' : ''}`}>
              <div className="actions-area">
                <button
                  className="clean-btn"
                  onClick={() => setPathParts([])}
                  disabled={gameStatus === 'success'}
                >
                  🧹 Limpiar
                </button>
                <button
                  className="new-btn"
                  onClick={generateNewChallenge}
                >
                  🎲 Nuevo Desafío
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drop Area - Aparece cuarto */}
      {introStep >= 4 && (
        <div className={`intro-element drop-section ${introStep >= 4 ? 'show' : ''}`}>
          <PathBuilder 
            pathParts={pathParts} 
            setPathParts={setPathParts}
            challenge={challenge}
            gameStatus={gameStatus}
          />
          <div className={`floating-instruction ${hideInstructions ? 'fade-out' : ''}`}>
            <p>🪄 Aquí es donde construyes tu ruta arrastrando elementos. ¡Suelta los elementos en esta área!</p>
          </div>
        </div>
      )}

      <style jsx>{`

        .floating-instruction.fade-out {
          opacity: 0;
          transition: opacity 1s ease-in-out;
          pointer-events: none;
        }
          
        .mainContent {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s ease-out;
          min-height: 100vh;
        }

        .mainContent.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .intro-element {
          opacity: 0;
          transform: translateY(30px);
          transition: all 1s ease-out;
          position: relative;
        }

        .intro-element.show {
          opacity: 1;
          transform: translateY(0);
        }

        .tree-section {
          position: relative;
        }

        .intro-message {
          margin-top: 20px;
        }

        .message-box {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-left: 5px solid #28a745;
          max-width: 400px;
        }

        .message-box h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 20px;
        }

        .message-box p {
          margin: 0 0 10px 0;
          color: #555;
          line-height: 1.5;
        }

        .message-box p:last-child {
          margin-bottom: 0;
        }

        .floating-instruction {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: bold;
          color: #856404;
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          z-index: 10;
          max-width: 250px;
          animation: float 2s ease-in-out infinite;
        }

        .floating-instruction::before {
          content: '';
          position: absolute;
          left: -10px;
          top: 50%;
          transform: translateY(-50%);
          border: 10px solid transparent;
          border-right-color: #ffc107;
        }

        .floating-instruction::after {
          content: '';
          position: absolute;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          border: 9px solid transparent;
          border-right-color: #fff3cd;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(-50%, -50%);
          }
          50% {
            transform: translate(-50%, -60%);
          }
        }

        .challenge-header {
          background: white;
          margin: 20px;
          margin-top: 0px;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-left: 5px solid #667eea;
        }

        .challenge-info h2 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 24px;
        }

        .challenge-details {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .file-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .label {
          font-size: 12px;
          color: #666;
          font-weight: bold;
        }

        .file-name {
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }

        .arrow {
          font-size: 24px;
          color: #667eea;
          font-weight: bold;
        }

        .success-message {
          margin-top: 15px;
          padding: 12px;
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
          border-radius: 8px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .new-challenge-btn {
          padding: 8px 16px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }

        .new-challenge-btn:hover {
          background: #218838;
        }

        .game-layout {
          display: flex;
          gap: 24px;
          padding: 20px;
          justify-content: center;
        }

        .sidebar-container {
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .draggable-area {
          padding: 12px;
          display: flex;
          flex-direction: column;
        }

        .actions-area {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .actions-area button {
          flex: 1;
          padding: 10px;
          font-family: "DynaPuff", system-ui;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .clean-btn {
          background: #ffc107;
          color: #212529;
        }

        .clean-btn:hover {
          background: #e0a800;
        }

        .clean-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .new-btn {
          background: #007bff;
          color: white;
        }

        .new-btn:hover {
          background: #0069d9;
        }

        .draggable-section,
        .actions-section,
        .drop-section {
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
}

function PathBuilder({ pathParts, setPathParts, gameStatus }) {
  function handleDrop(e) {
    e.preventDefault();

    if (gameStatus === 'success') return;

    const name = e.dataTransfer.getData('text/plain');
    const itemDataJson = e.dataTransfer.getData('application/json');
    const source = e.dataTransfer.getData('source');

    if (source !== 'draggable-container') {
      // Ignora drops que no vienen del contenedor válido
      return;
    }

    if (!name || !itemDataJson) return;

    let itemData;
    try {
      itemData = JSON.parse(itemDataJson);
    } catch {
      itemData = { type: 'file' }; // por defecto
    }

    setPathParts(prev => {
      const hasFile = prev.some(part => {
        return part !== './' && part !== '/' && part !== '../' && !part.endsWith('/');
      });

      const hasPrefix = prev.includes('./') || prev.includes('/') || prev.includes('../');

      // Si ya hay archivo, no agregar nada más
      if (hasFile) return prev;

      if (itemData.type === 'prefix') {
        if (name === '../') {
          return [...prev, '../'];
        }

        if (name === './' && !prev.includes('./')) {
          return ['./', ...prev];
        }

        if (name === '/' && !prev.includes('/')) {
          return ['/', ...prev];
        }

        return prev;
      }

      // Si es archivo o carpeta, y no hay prefijo, no hacer nada
      if ((itemData.type === 'file' || itemData.type === 'folder') && !hasPrefix) {
        return prev;
      }

      const finalName = itemData.type === 'folder' ? `${name}/` : name;
      return [...prev, finalName];
    });
  }
  
  // Verificar si hay un archivo en el path (cualquier elemento que no sea prefijo y no termine en /)
  const hasFile = pathParts.some(part => {
    return part !== './' && part !== '/' && part !== '../' && !part.endsWith('/');
  });
  
  return (
    <div className="path-builder-wrapper">

      <div
        className={`drop-area ${gameStatus === 'success' ? 'success' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {pathParts.length === 0 ? (
          <p>🪄 Arrastra aquí para construir tu ruta</p>
        ) : hasFile ? (
          <p className="path-preview">📄 <strong>{pathParts.join('')}</strong> <span className="file-indicator">(archivo final)</span></p>
        ) : (
          <p className="path-preview">📂 <strong>{pathParts.join('')}</strong></p>
        )}
      </div>

      <style jsx>{`
        .path-builder-wrapper {
          margin-top: 30px;
          width: 80%;
          margin-left: auto;
          margin-right: auto;
        }

        .prefix-buttons {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .prefix-buttons button {
          padding: 6px 12px;
          font-size: 14px;
          border: 1px solid #ccc;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .prefix-buttons button:hover:not(.disabled) {
          background: #f8f9fa;
          border-color: #999;
        }

        .prefix-buttons button.disabled {
          background: #e9ecef;
          color: #6c757d;
          border-color: #dee2e6;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .drop-area {
          padding: 30px;
          border: 3px dashed #999;
          border-radius: 16px;
          background: #f1f3f5;
          text-align: center;
          font-family: "DynaPuff", system-ui;
          font-size: 18px;
          transition: all 0.3s ease;
        }

        .drop-area:hover {
          background: #e9ecef;
        }

        .drop-area.success {
          border-color: #28a745;
          background: #d4edda;
        }

        .path-preview {
          margin: 0;
          font-size: 20px;
          color: #333;
          word-break: break-all;
        }

        .clear-btn {
          margin-top: 15px;
          padding: 6px 14px;
          border: none;
          background: #ff6b6b;
          color: white;
          font-weight: bold;
          border-radius: 6px;
          cursor: pointer;
        }

        .clear-btn:hover {
          background: #fa5252;
        }

        .file-indicator {
          font-size: 14px;
          color: #6c757d;
          font-weight: normal;
        }

        .hint-section {
          margin-top: 20px;
          text-align: center;
        }

        .hint {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          color: #856404;
        }

        .hint code {
          background: rgba(0,0,0,0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: "DynaPuff", system-ui;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}

function DraggableContainer({ tree, pathParts, setPathParts, gameStatus }) {
  const items = flattenTree(tree);

  const hasRelative = pathParts.includes('./');
  const hasAbsolute = pathParts.includes('/');
  const hasParent = pathParts.some(part => part === '../');
  const hasFile = pathParts.some(part => {
    return part !== './' && part !== '/' && part !== '../' && !part.endsWith('/');
  });

  const isBlocked = gameStatus === 'success';
  const canAddRelative = !hasRelative && !hasAbsolute && !hasParent && !hasFile && !isBlocked;
  const canAddAbsolute = !hasAbsolute && !hasRelative && !hasParent && !hasFile && !isBlocked;
  const canAddParent = !hasRelative && !hasAbsolute && !hasFile && !isBlocked;

  return (
    <div className="draggable-container">
      <h3>🧩 Arrastra elementos</h3>
      <div className="draggable-items">
        {items
          .filter(item => item.name !== 'root')
          .map((item, i) => (
            <div
              key={i}
              className="draggable-item"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', item.name);
                e.dataTransfer.setData('application/json', JSON.stringify({ type: item.type }));
                e.dataTransfer.setData('source', 'draggable-container');
              }}
            >
              <span className="item-icon">{getFileIcon(item.name, item.type)}</span>
              <span className="item-name">{item.name}</span>
            </div>
        ))}

      </div>
      <div className="draggable-prefixes">
        {[
          { label: './', type: 'prefix', key: './', disabled: !canAddRelative },
          { label: '../', type: 'prefix', key: '../', disabled: !canAddParent },
          { label: '/', type: 'prefix', key: '/', disabled: !canAddAbsolute }
        ].map((item) => {
          const isAttention = pathParts.length === 0;
          return (
          <div
            key={item.key}
            className={`draggable-prefix-item ${item.disabled ? 'disabled' : ''} ${isAttention ? 'attention' : ''}`}
            draggable={!item.disabled}
            onDragStart={(e) => {
              if (item.disabled) {
                e.preventDefault();
                return;
              }
              e.dataTransfer.setData('text/plain', item.label);
              e.dataTransfer.setData('application/json', JSON.stringify({ type: 'prefix' }));
              e.dataTransfer.setData('source', 'draggable-container');
            }}
          >
            {item.label}
          </div>
        )})}
      </div>


      <style jsx>{`

        .draggable-prefixes {
          margin-top: 16px;
          display: flex;
          justify-content: space-around;
          gap: 6px;
        }

        .draggable-prefix-item {
          background: white;
          padding: 6px 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 14px;
          cursor: grab;
          user-select: none;
          text-align: center;
          transition: all 0.2s ease;
          min-width: 48px;
        }

        .draggable-prefix-item:hover {
          background: #f8f9fa;
        }

        .draggable-prefix-item:active {
          cursor: grabbing;
          transform: scale(0.97);
        }

        .draggable-prefix-item.disabled {
          background: #e9ecef;
          color: #6c757d;
          border-color: #dee2e6;
          cursor: not-allowed;
          opacity: 0.6;
        }
          
        .draggable-container {
          width: 280px;
          background: #fff3cd;
          border: 1px solid #ffeeba;
          padding: 12px;
          border-radius: 8px;
          font-family: "DynaPuff", system-ui;
          box-shadow: 0 0 4px rgba(0,0,0,0.1);
        }

        .draggable-container h3 {
          margin-top: 0;
          font-size: 14px;
          text-align: center;
          margin-bottom: 12px;
        }

        .draggable-items {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .draggable-item {
          background: white;
          padding: 6px 8px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          cursor: grab;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          min-height: 32px;
        }

        .draggable-item:hover {
          background: #f8f9fa;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .draggable-item:active {
          cursor: grabbing;
          transform: scale(0.98);
        }

        .item-icon {
          font-size: 14px;
          flex-shrink: 0;
        }

        .item-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 500;
        }
          @keyframes bounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }

        .draggable-prefix-item.attention:not(.disabled) {
          animation: bounce 1s infinite ease-in-out;
          background: #fff9e6;
          border-color: #ffc107;
        }
      `}</style>
    </div>
  );
}

function getAllFiles(node, currentPath = '') {
  let files = [];
  const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
  
  if (node.type === 'file') {
    files.push({ name: node.name, type: node.type, path: fullPath });
  }
  
  if (node.children) {
    for (let child of node.children) {
      files = files.concat(getAllFiles(child, fullPath));
    }
  }
  
  return files;
}

function calculateCorrectPath(startFile, endFile) {
  const startParts = startFile.path.split('/');
  const endParts = endFile.path.split('/');
  
  // Encontrar el ancestro común
  let commonIndex = 0;
  while (commonIndex < startParts.length - 1 && commonIndex < endParts.length - 1 && 
         startParts[commonIndex] === endParts[commonIndex]) {
    commonIndex++;
  }
  
  // Calcular cuántos niveles subir desde el archivo de inicio
  const levelsUp = startParts.length - 1 - commonIndex;
  
  // Construir la ruta
  let path = '';
  
  // Agregar ../ para cada nivel que necesitamos subir
  if (levelsUp === 0) {
    path = './'; // mismo nivel => empieza con ./
  } else {
    for (let i = 0; i < levelsUp; i++) {
      path += '../';
    }
  }
  
  // Agregar la ruta hacia el archivo destino
  for (let i = commonIndex; i < endParts.length; i++) {
    if (i < endParts.length - 1) {
      path += endParts[i] + '/';
    } else {
      path += endParts[i]; // El archivo final sin /
    }
  }
  
  return path;
}

function flattenTree(node, path = '') {
  let currentPath = path ? `${path}/${node.name}` : node.name;
  let items = [{ name: node.name, type: node.type, path: currentPath }];
  if (node.children) {
    for (let child of node.children) {
      items = items.concat(flattenTree(child, currentPath));
    }
  }
  return items;
}

const sampleTree = {
  name: 'root',
  type: 'folder',
  children: [
    {
      name: 'src',
      type: 'folder',
      children: [
        { name: 'main.html', type: 'file' },
        { name: 'style.css', type: 'file' },
        {
          name: 'components',
          type: 'folder',
          children: [
            { name: 'Navbar.html', type: 'file' },
            { name: 'Footer.html', type: 'file' },
          ],
        },
      ],
    },
    {
      name: 'public',
      type: 'folder',
      children: [
        { name: 'index.html', type: 'file' },
        { name: 'logo.png', type: 'file' },
      ],
    },
    { name: 'about.html', type: 'file' },
    { name: 'README.md', type: 'file' },
  ],
};

function getFileIcon(fileName, type) {
  if (type === 'folder') return '📁';
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  const iconMap = {
    'js': '📄',
    'jsx': '⚛️',
    'ts': '📘',
    'tsx': '📘',
    'css': '🎨',
    'scss': '🎨',
    'html': '🌐',
    'json': '📋',
    'md': '📝',
    'ico': '🖼️',
  };
  
  return iconMap[extension] || '📄';
}

function FileTreeNode({ node, selectedNodes = [] }) {
  const icon = getFileIcon(node.name, node.type);
  const hasChildren = node.children && node.children.length > 0;

  let backgroundColor = 'transparent';
  if (selectedNodes.length >= 1 && node.name === selectedNodes[0]) {
    backgroundColor = '#cce5ff'; // azul claro
  } else if (selectedNodes.length >= 2 && node.name === selectedNodes[1]) {
    backgroundColor = '#f8d7da'; // rojo claro
  }

  return (
    <div className="tree-node">
      <div className="node-content" style={{ backgroundColor, borderRadius: '6px', padding: '2px 6px' }}>
        <div className="node-icon">{icon}</div>
        <div className="node-name">{node.name}</div>
      </div>

      {hasChildren && (
        <div className="children-container">
          <div className="vertical-line-parent" />
          <div className={`children-level ${node.children.length === 1 ? 'single-child' : ''}`}>
            {node.children.map((child, index) => (
              <div key={index} className="child-wrapper">
                <div className="vertical-line-child" />
                <FileTreeNode node={child} selectedNodes={selectedNodes} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FileTreeView({ selectedStart = '', selectedEnd = '' }) {
  const nodes = [selectedStart, selectedEnd]
  return (
    <div className="file-tree-view">
      <FileTreeNode node={sampleTree} selectedNodes = {nodes}/>
      
      <style jsx>{`.file-tree-view {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        font-family: "DynaPuff", system-ui;
        overflow-x: auto;
        padding: 10px;
      }

      .file-tree-view h3 {
        margin: 0 0 20px 0;
        color: #495057;
        font-size: 18px;
        text-align: center;
      }

      .tree-node {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
      }

      .node-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px;
        border-radius: 8px;
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 20px;
        min-width: 80px;
        border: 2px solid #e9ecef;
        transition: all 0.3s ease;
      }

      .node-content:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        transform: translateY(-2px);
      }

      .node-icon {
        font-size: 32px;
        margin-bottom: 8px;
      }

      .node-name {
        font-size: 12px;
        font-weight: 500;
        color: #495057;
        text-align: center;
        word-break: break-word;
        max-width: 100px;
      }

      .children-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        position: relative;
      }

      .vertical-line-parent {
        width: 2px;
        height: 20px;
        background: #6c757d;
      }

      .children-level {
        display: flex;
        justify-content: center;
        gap: 40px;
        position: relative;
        width: 100%;
        margin-top: -1px;
      }

      .children-level:not(.single-child)::before {
        content: '';
        position: absolute;
        top: 0;
        height: 2px;
        background: #6c757d;
        left: 20px;
        right: 20px;
      }

      .child-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
      }

      .vertical-line-child {
        width: 2px;
        height: 20px;
        background: #6c757d;
      }


      `}</style>
    </div>
  );
}

export default App;
