const { electronAPI } = window;

let state = {
  activeStream: false,
  selectedSport: 'football',
  cameras: [],
  scoreData: {
    teamA: { name: 'Team Alpha', score: 0, color: '#3b82f6' },
    teamB: { name: 'Team Beta', score: 0, color: '#ef4444' },
    timer: '00:00',
    period: 'Q1'
  },
  overlaySettings: {
    showScore: true,
    showTimer: true,
    showTeamLogos: false,
    tickerPosition: 'bottom',
    sport: 'football'
  },
  obsConnected: false
};

const sports = [
  { id: 'football', name: 'Football', icon: '⚽', scoreLabel: 'Goals', periods: ['1st Half', '2nd Half', 'ET', 'Penalties'] },
  { id: 'basketball', name: 'Basketball', icon: '🏀', scoreLabel: 'Points', periods: ['Q1', 'Q2', 'Q3', 'Q4', 'OT'] },
  { id: 'cricket', name: 'Cricket', icon: '🏏', scoreLabel: 'Runs', periods: ['1st Innings', '2nd Innings', 'Super Over'] },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐', scoreLabel: 'Sets', periods: ['Set 1', 'Set 2', 'Set 3', 'Set 4', 'Set 5'] },
  { id: 'tennis', name: 'Tennis', icon: '🎾', scoreLabel: 'Games', periods: ['Set 1', 'Set 2', 'Set 3', 'Set 4', 'Set 5'] },
  { id: 'badminton', name: 'Badminton', icon: '🏸', scoreLabel: 'Points', periods: ['Game 1', 'Game 2', 'Game 3'] }
];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadCameras();
  await loadSavedConfig();
  render();
  setupEventListeners();
});

function render() {
  const root = document.getElementById('root');
  const currentSport = sports.find(s => s.id === state.selectedSport);
  
  root.innerHTML = `
    
      
      
        
          
            
              
                
              
            
            
              Live Sports Streaming
              Professional broadcasting made simple
            
          
          
            ${state.activeStream ? 
              ' Stop Stream' :
              ' Start Stream'
            }
          
        
        ${state.activeStream ? `
          
            
            LIVE
          
        ` : ''}
      

      
        
        
          
          
            
              
                
              
              Select Sport
            
            
              ${sports.map(sport => `
                
                  ${sport.icon}
                  ${sport.name}
                
              `).join('')}
            
          

          
          
            
              
                
              
              Score Ticker Control - ${currentSport.name}
            
            
            
              
              
                
                
                  
                    -
                  
                  ${state.scoreData.teamA.score}
                  
                    +
                  
                
              

              
              
                
                
                  
                    -
                  
                  ${state.scoreData.teamB.score}
                  
                    +
                  
                
              
            

            
            
              
                Timer
                
              
              
                Period
                
                  ${currentSport.periods.map(period => `
                    <option value="${period}" ${state.scoreData.period === period ? 'selected' : ''}>
                      ${period}
                    
                  `).join('')}
                
              
            

            
              Update Overlay
            
          

          
          
            
              Camera Feed Preview
              
                + Add Camera
              
            
            
              ${state.cameras.length === 0 ? `
                
                  
                    
                  
                  No cameras connected
                  Click "Add Camera" to get started
                
              ` : state.cameras.map(camera => `
                
                  
                    ${camera.name}
                    
                      
                      ${camera.status}
                    
                  
                  
                    
                      
                    
                  
                  
                    
                      ${camera.active ? 'Active' : 'Switch to This'}
                    
                    
                      
                        
                      
                    
                  
                
              `).join('')}
            
          

          
          
            Live Preview with Overlay
            
              
                
                  
                
              
              
              
              ${state.overlaySettings.showScore ? `
                
                  
                    
                      ${state.scoreData.teamA.name}
                      ${state.scoreData.teamA.score}
                    
                    
                      ${state.scoreData.period}
                      ${state.scoreData.timer}
                    
                    
                      ${state.scoreData.teamB.name}
                      ${state.scoreData.teamB.score}
                    
                  
                
              ` : ''}
            
          
        

        
        
          
          
            
              
                
              
              OBS Studio
            
            
              ${state.obsConnected ? `
                
                  Status
                  
                    
                    Connected
                  
                
                
                  Disconnect
                
              ` : `
                
                
                
                  Connect to OBS
                
              `}
              
                WebSocket: ws://localhost:4455
              
            
          

          
          
            
              
                
              
              Overlay Settings
            
            
              
                Show Score
                
              
              
                Show Timer
                
              
              
                Position
                
                  <option value="top" ${state.overlaySettings.tickerPosition === 'top' ? 'selected' : ''}>Top
                  <option value="bottom" ${state.overlaySettings.tickerPosition === 'bottom' ? 'selected' : ''}>Bottom
                
              
            
          

          
          
            Session Info
            
              
                Sport:
                ${currentSport.name}
              
              
                Cameras:
                ${state.cameras.length} connected
              
              
                Stream Status:
                
                  ${state.activeStream ? 'LIVE' : 'Offline'}
                
              
            
          
        
      
    

    
    
      
        Add New Camera
        
          
            Camera Name
            
          
          
            Camera Type
            
              IP Camera (RTSP)
              Mobile Phone
              USB Camera
            
          
          
            URL/IP Address
            
          
          
            
              Cancel
            
            
              Add Camera
            
          
        
      
    
  `;

  setupEventListeners();
}

function setupEventListeners() {
  // Sport selection
  document.querySelectorAll('.sport-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedSport = btn.dataset.sport;
      const sport = sports.find(s => s.id === state.selectedSport);
      state.scoreData.period = sport.periods[0];
      state.overlaySettings.sport = state.selectedSport;
      render();
    });
  });

  // Score controls
  document.querySelectorAll('.score-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const team = btn.dataset.team;
      const change = parseInt(btn.dataset.change);
      state.scoreData[team].score = Math.max(0, state.scoreData[team].score + change);
      render();
    });
  });

  // Team name inputs
  const teamAInput = document.getElementById('team-a-name');
  const teamBInput = document.getElementById('team-b-name');
  if (teamAInput) teamAInput.addEventListener('input', (e) => {
    state.scoreData.teamA.name = e.target.value;
  });
  if (teamBInput) teamBInput.addEventListener('input', (e) => {
    state.scoreData.teamB.name = e.target.value;
  });

  // Timer and period
  const timerInput = document.getElementById('timer-input');
  const periodSelect = document.getElementById('period-select');
  if (timerInput) timerInput.addEventListener('input', (e) => {
    state.scoreData.timer = e.target.value;
  });
  if (periodSelect) periodSelect.addEventListener('change', (e) => {
    state.scoreData.period = e.target.value;
  });

  // Update overlay
  const updateOverlayBtn = document.getElementById('update-overlay-btn');
  if (updateOverlayBtn) {
    updateOverlayBtn.addEventListener('click', async () => {
      await updateOverlay();
    });
  }

  // Stream toggle
  const toggleStreamBtn = document.getElementById('toggle-stream-btn');
  if (toggleStreamBtn) {
    toggleStreamBtn.addEventListener('click', async () => {
      await toggleStream();
    });
  }

  // OBS connection
  const obsConnectBtn = document.getElementById('obs-connect-btn');
  const obsDisconnectBtn = document.getElementById('obs-disconnect-btn');
  if (obsConnectBtn) {
    obsConnectBtn.addEventListener('click', async () => {
      await connectToOBS();
    });
  }
  if (obsDisconnectBtn) {
    obsDisconnectBtn.addEventListener('click', async () => {
      await disconnectFromOBS();
    });
  }

  // Camera controls
  document.querySelectorAll('.switch-camera-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await switchCamera(btn.dataset.cameraId);
    });
  });

  document.querySelectorAll('.remove-camera-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await removeCamera(btn.dataset.cameraId);
    });
  });

  // Add camera modal
  const addCameraModalBtn = document.getElementById('add-camera-modal-btn');
  const addCameraModal = document.getElementById('add-camera-modal');
  const cancelAddCamera = document.getElementById('cancel-add-camera');
  const confirmAddCamera = document.getElementById('confirm-add-camera');

  if (addCameraModalBtn) {
    addCameraModalBtn.addEventListener('click', () => {
      addCameraModal.classList.remove('hidden');
      addCameraModal.classList.add('flex');
    });
  }

  if (cancelAddCamera) {
    cancelAddCamera.addEventListener('click', () => {
      addCameraModal.classList.add('hidden');
      addCameraModal.classList.remove('flex');
    });
  }

  if (confirmAddCamera) {
    confirmAddCamera.addEventListener('click', async () => {
      await addCamera();
      addCameraModal.classList.add('hidden');
      addCameraModal.classList.remove('flex');
    });
  }

  // Overlay settings
  const showScoreToggle = document.getElementById('show-score-toggle');
  const showTimerToggle = document.getElementById('show-timer-toggle');
  const tickerPositionSelect = document.getElementById('ticker-position-select');

  if (showScoreToggle) {
    showScoreToggle.addEventListener('change', (e) => {
      state.overlaySettings.showScore = e.target.checked;
      render();
    });
  }

  if (showTimerToggle) {
    showTimerToggle.addEventListener('change', (e) => {
      state.overlaySettings.showTimer = e.target.checked;
      render();
    });
  }

  if (tickerPositionSelect) {
    tickerPositionSelect.addEventListener('change', (e) => {
      state.overlaySettings.tickerPosition = e.target.value;
      render();
    });
  }
}

// API Functions
async function connectToOBS() {
  const address = document.getElementById('obs-address').value;
  const password = document.getElementById('obs-password').value;

  const result = await electronAPI.obs.connect({ address, password });

  if (result.success) {
    state.obsConnected = true;
    await electronAPI.db.saveConfig({ address, password });
    render();
  } else {
    alert('Failed to connect to OBS: ' + result.error);
  }
}

async function disconnectFromOBS() {
  await electronAPI.obs.disconnect();
  state.obsConnected = false;
  render();
}

async function toggleStream() {
  if (state.activeStream) {
    await electronAPI.obs.stopStreaming();
    await electronAPI.overlay.hide();
    state.activeStream = false;
  } else {
    if (!state.obsConnected) {
      alert('Please connect to OBS first');
      return;
    }
    await electronAPI.overlay.show();
    await electronAPI.obs.startStreaming();
    state.activeStream = true;
  }
  render();
}

async function addCamera() {
  const name = document.getElementById('new-camera-name').value;
  const type = document.getElementById('new-camera-type').value;
  const url = document.getElementById('new-camera-url').value;

  if (!name || !url) {
    alert('Please fill in all fields');
    return;
  }

  const result = await electronAPI.camera.add({ name, type, url });

  if (result.success) {
    await loadCameras();
    document.getElementById('new-camera-name').value = '';
    document.getElementById('new-camera-url').value = '';
    render();
  } else {
    alert('Failed to add camera: ' + result.error);
  }
}

async function removeCamera(cameraId) {
  if (confirm('Remove this camera?')) {
    await electronAPI.camera.remove(cameraId);
    await loadCameras();
    render();
  }
}

async function switchCamera(cameraId) {
  const result = await electronAPI.camera.switch(cameraId);
  if (result.success) {
    state.cameras = state.cameras.map(c => ({
      ...c,
      active: c.id === cameraId
    }));
    render();
  }
}

async function updateOverlay() {
  const result = await electronAPI.overlay.updateScore({
    ...state.scoreData,
    sport: state.selectedSport
  });

  await electronAPI.overlay.updateSettings(state.overlaySettings);

  if (result.success) {
    // Visual feedback
    const btn = document.getElementById('update-overlay-btn');
    const originalText = btn.textContent;
    btn.textContent = '✓ Updated!';
    btn.classList.add('bg-green-500');
    btn.classList.remove('bg-blue-500');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('bg-green-500');
      btn.classList.add('bg-blue-500');
    }, 2000);
  }
}

async function loadCameras() {
  const result = await electronAPI.camera.list();
  if (result.success) {
    state.cameras = result.cameras.map((c, i) => ({
      ...c,
      active: i === 0
    }));
  }
}

async function loadSavedConfig() {
  const config = await electronAPI.db.getConfig();
  if (config) {
    document.getElementById('obs-address').value = config.address;
  }
}
            
