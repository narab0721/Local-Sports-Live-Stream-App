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
