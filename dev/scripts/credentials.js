// ============================================
// CREDENTIALS FUNCTIONS - Table interactions
// ============================================

window.addCredentialRow = function() {
  const table = document.querySelector('.credentials-table tbody');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td class="actions-cell">
      <button onclick="editRow(this)" class="btn-action">💾</button>
      <button onclick="deleteRow(this)" class="btn-action">🗑️</button>
    </td>
    <td contenteditable="true" class="editing"></td>
    <td contenteditable="true" class="editing"></td>
    <td contenteditable="true" class="editing"></td>
    <td contenteditable="true" class="editing"></td>
  `;
  table.appendChild(row);
  
  // Attach keydown handlers to all editable cells
  const cells = row.querySelectorAll('td[contenteditable]');
  cells.forEach(cell => {
    cell.addEventListener('keydown', handleCellKeydown);
  });
  
  // Focus first cell
  const firstCell = row.querySelector('td[contenteditable]');
  firstCell.focus();
  
  // Add blur handlers for auto-save
  addBlurHandlers(row);
}

window.editRow = function(btn) {
  const row = btn.closest('tr');
  const cells = row.querySelectorAll('td:not(.actions-cell)');
  const isEditing = cells[0].getAttribute('contenteditable') === 'true';
  
  if (isEditing) {
    // Save and stop editing
    cells.forEach(cell => {
      cell.setAttribute('contenteditable', 'false');
      cell.classList.remove('editing');
      cell.removeEventListener('keydown', handleCellKeydown);
    });
    btn.textContent = '✏️';
    removeBlurHandlers(row);
  } else {
    // Start editing
    cells.forEach(cell => {
      cell.setAttribute('contenteditable', 'true');
      cell.classList.add('editing');
      cell.addEventListener('keydown', handleCellKeydown);
    });
    cells[0].focus();
    btn.textContent = '💾';
    addBlurHandlers(row);
  }
}

// Handle Enter key in editable cells
function handleCellKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    // Enter without Shift: save the row
    e.preventDefault();
    const row = e.target.closest('tr');
    const editBtn = row.querySelector('.btn-action');
    window.editRow(editBtn);
  }
  // Shift+Enter: default behavior (new line)
}

window.filterCredentials = function() {
  const filterValue = document.getElementById('credentialFilter').value.toLowerCase();
  const table = document.querySelector('.credentials-table tbody');
  const rows = table.querySelectorAll('tr');
  
  rows.forEach(row => {
    const cells = row.querySelectorAll('td:not(.actions-cell)');
    let found = false;
    
    // Check if any cell contains the filter text
    cells.forEach(cell => {
      if (cell.textContent.toLowerCase().includes(filterValue)) {
        found = true;
      }
    });
    
    // Show or hide the row
    if (found || filterValue === '') {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

window.deleteRow = function(btn) {
  const row = btn.closest('tr');
  if (confirm('Delete this row?')) {
    row.remove();
  }
}

// Copy to clipboard on cell click (with delay to detect double-click)
let clickTimer = null;
let clickedCell = null;

document.addEventListener('click', function(e) {
  const cell = e.target.closest('td:not(.actions-cell)');
  if (cell && cell.closest('.credentials-table')) {
    // Only copy if not in edit mode
    if (cell.getAttribute('contenteditable') !== 'true') {
      // Clear existing timer if clicking same cell
      if (clickTimer && clickedCell === cell) {
        clearTimeout(clickTimer);
        clickTimer = null;
        return;
      }
      
      clickedCell = cell;
      const text = cell.textContent.trim();
      
      if (text) {
        // Wait 250ms to see if double-click is coming
        clickTimer = setTimeout(() => {
          // Single click confirmed - copy to clipboard
          navigator.clipboard.writeText(text).then(() => {
            // Add copied class for animation
            cell.classList.add('copied');
            
            // Remove class after animation
            setTimeout(() => {
              cell.classList.remove('copied');
            }, 50);
          }).catch(err => {
            console.error('Failed to copy:', err);
          });
          
          clickTimer = null;
          clickedCell = null;
        }, 250);
      }
    }
  }
});

// Double-click to edit cell
document.addEventListener('dblclick', function(e) {
  const cell = e.target.closest('td:not(.actions-cell)');
  if (cell && cell.closest('.credentials-table')) {
    // Only allow if not already in edit mode
    if (cell.getAttribute('contenteditable') !== 'true') {
      const row = cell.closest('tr');
      const editBtn = row.querySelector('.btn-action');
      
      // Enter edit mode
      window.editRow(editBtn);
      
      // Focus the clicked cell and move cursor to end
      setTimeout(() => {
        cell.focus();
        
        // Move cursor to end of content
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(cell);
        range.collapse(false); // false = collapse to end
        selection.removeAllRanges();
        selection.addRange(range);
      }, 10);
    }
  }
});

// Auto-save when clicking outside of editable cells
function addBlurHandlers(row) {
  const cells = row.querySelectorAll('td[contenteditable="true"]');
  const editBtn = row.querySelector('.btn-action');
  
  cells.forEach(cell => {
    cell.addEventListener('blur', function blurHandler(e) {
      // Check if focus moved outside the row
      setTimeout(() => {
        const activeElement = document.activeElement;
        const isInRow = row.contains(activeElement);
        
        if (!isInRow && cell.getAttribute('contenteditable') === 'true') {
          // Save the row
          window.editRow(editBtn);
        }
      }, 100);
    });
  });
}

function removeBlurHandlers(row) {
  // Blur handlers are automatically removed when contenteditable is disabled
}
