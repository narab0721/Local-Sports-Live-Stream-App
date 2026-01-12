```javascript
// Add these sections to the dashboard render function

function renderTeamManagement() {
  return `
    
      
        
          
            
          
          Team Management
        
        
          + Add Team
        
      

      
        ${state.teams.map(team => `
          
            
              
                ${team.logoPath ? 
                  `` :
                  `${team.shortName}`
                }
              
              
                ${team.name}
                ${team.shortName}
              
              
                
                  Manage Roster
                
                
                  
                    
                  
                
                
                  
                    
                  
                
              
            
            
            
            
              ${team.playerCount || 0} players in roster
            
          
        `).join('')}
      
    

    
    
      
        Add New Team
        
          
            Team Name
            
          
          
            Short Name
            
          
          
            Team Color
            
          
          
            
              Cancel
            
            
              Add Team
            
          
        
      
    
  `;
}
```

## 8. Player Roster Management UI

```javascript
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
```

---

## 9. Sponsor Management UI

```javascript
function renderSponsorManagement() {
  return `
    
      
        
          
            
          
          Sponsors
        
        
          + Add Sponsor
        
      

      
        ${state.sponsors.map(sponsor => `
          
            
              
                ${sponsor.logoPath ? 
                  `` :
                  `No Logo`
                }
              
              
                ${sponsor.name}
                
                  Position: ${sponsor.position}
                  Duration: ${sponsor.displayDuration}ms
                  Priority: ${sponsor.priority}
                
              
              
                
                  ${sponsor.active ? 'Active' : 'Inactive'}
                
                
                  
                    
                  
                
              
            
          
        `).join('')}

        ${state.sponsors.length === 0 ? `
          
            No sponsors added yet
            Add sponsors to display during streams
          
        ` : ''}
      
    

    
    
      
        Add New Sponsor
        
          
            Sponsor Name
            
          
          
            Display Position
            
              Top Banner
              Bottom Banner
              Side Panel
              Corner Logo
            
          
          
            
              Duration (seconds)
              
            
            
              Priority
              
            
          
          
            
              📤 Upload Logo (Required)
            
            
          
          
            
              Cancel
            
            
              Add Sponsor
            
          
        
      
    
  `;
}
```

---
