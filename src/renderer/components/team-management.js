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
