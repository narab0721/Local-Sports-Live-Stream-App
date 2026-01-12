function renderPlayerRoster(teamId) {
  const team = state.teams.find(t => t.id === teamId);
  const players = state.players.filter(p => p.teamId === teamId);

  return `
    
      
        
          ${team.name} - Player Roster
          ${players.length} players
        
        
          
            + Add Player
          
          
            Close
          
        
      

      <!-- Starting XI / Main Squad -->
      
        Starting Lineup
        
          ${players.filter(p => p.isStarting).map(player => `
            
              ${player.isCaptain ? `
                
                  C
                
              ` : ''}
              
                
                  ${player.photoPath ? 
                    `` :
                    `${player.jerseyNumber}`
                  }
                
                
                  
                    ${player.jerseyNumber}
                    
                      ${player.name}
                      ${player.position}
                    
                  
                
              

              
              
                
                  Goals
                  ${player.stats?.goals || 0}
                
                
                  Assists
                  ${player.stats?.assists || 0}
                
                
                  Cards
                  
                    ${player.stats?.yellowCards || 0} ▮
                    ${player.stats?.redCards || 0} ▮
                  
                
              

              
              
                
                  ⚽
                
                
                  🅰️
                
                
                  🟨
                
                
                  🟥
                
              

              
                
                  Edit
                
                
                  ⇄
                
              
            
          `).join('')}
        
      

      
      ${players.filter(p => !p.isStarting).length > 0 ? `
        
          Substitutes
          
            ${players.filter(p => !p.isStarting).map(player => `
              
                
                  ${player.jerseyNumber}
                  
                    ${player.name}
                    ${player.position}
                  
                
                
                  Bring On
                
              
            `).join('')}
          
        
      ` : ''}
    

    
    
      
        Add New Player
        
          
            Player Name
            
          
          
            
              Jersey Number
              
            
            
              Position
              
                Forward
                Midfielder
                Defender
                Goalkeeper
              
            
          
          
            
              
              Captain
            
            
              
              Starting XI
            
          
          
            
              📷 Upload Photo
            
            
          
          
            
              Cancel
            
            
              Add Player
            
          
        
      
    
  `;
}
