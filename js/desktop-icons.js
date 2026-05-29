import { dom } from './dom.js';
import { state } from './state.js';
import { openApp } from './window-manager.js';

const GRID_SIZE = 104; // Snap to icon size (harsh grid)
const ICON_SIZE = 104; // Icon + gap spacing
const ICON_WIDTH = 96; // Approximate icon width used for viewport bounds

export function initDesktopIcons() {
  const iconsContainer = dom.desktopShell.querySelector('.desktop-icons');
  if (!iconsContainer) return;
  
  const icons = iconsContainer.querySelectorAll('.desktop-icon');
  if (icons.length === 0) return;
  
  // Initialize positions for each icon
  icons.forEach((icon, index) => {
    const app = icon.dataset.open;

    // Set up absolute positioning
    icon.style.position = 'absolute';

    // Restore saved position if exists
    if (state.desktopIconPositions[app]) {
      icon.style.left = state.desktopIconPositions[app].left + 'px';
      icon.style.top = state.desktopIconPositions[app].top + 'px';
    } else {
      const left = 0;
      const top = index * ICON_SIZE;
      icon.style.left = left + 'px';
      icon.style.top = top + 'px';
      state.desktopIconPositions[app] = { left, top };
    }
  });

  icons.forEach((icon) => {
    const app = icon.dataset.open;
    normalizeIconPosition(icon, app);
  });
  
  // Setup drag and select for each icon
  icons.forEach((icon) => {
    let dragData = null;
    const app = icon.dataset.open;
    
    // Prevent button's default behavior while preserving click detection
    icon.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handleIconMouseDown(e, icon, icons, app);
    }, { passive: false });
  });
  
  function snapToGrid(value) {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }

  function getOccupiedPositions(excludeApp = null) {
    const occupied = new Set();

    icons.forEach((icon) => {
      const app = icon.dataset.open;
      if (excludeApp && app === excludeApp) return;

      const left = snapToGrid(parseFloat(icon.style.left) || 0);
      const top = snapToGrid(parseFloat(icon.style.top) || 0);
      occupied.add(`${left},${top}`);
    });

    return occupied;
  }

  function findFreePosition(targetLeft, targetTop, excludeApp = null) {
    let left = snapToGrid(targetLeft);
    let top = snapToGrid(targetTop);
    const occupied = getOccupiedPositions(excludeApp);
    let attempts = 0;

    while (occupied.has(`${left},${top}`) && attempts < 200) {
      left += GRID_SIZE;
      if (left + ICON_WIDTH > window.innerWidth - 24) {
        left = 0;
        top += GRID_SIZE;
      }
      attempts += 1;
    }

    return {
      left: Math.max(0, left),
      top: Math.max(0, top)
    };
  }

  function normalizeIconPosition(icon, app, force = false) {
    const currentLeft = parseFloat(icon.style.left) || 0;
    const currentTop = parseFloat(icon.style.top) || 0;
    const freePosition = findFreePosition(currentLeft, currentTop, force ? null : app);

    icon.style.left = freePosition.left + 'px';
    icon.style.top = freePosition.top + 'px';
    state.desktopIconPositions[app] = {
      left: freePosition.left,
      top: freePosition.top
    };
  }
  
  function handleIconMouseDown(e, icon, allIcons, app) {
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = parseFloat(icon.style.left);
    const startTop = parseFloat(icon.style.top);
    let hasMoved = false;
    
    // Handle selection on mousedown
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
      // Single select - deselect others
      allIcons.forEach(i => {
        i.classList.remove('selected');
        state.selectedDesktopIcons.delete(i.dataset.open);
      });
    }
    
    // Toggle or add selection
    if (state.selectedDesktopIcons.has(app) && (e.ctrlKey || e.metaKey)) {
      // Ctrl+click to deselect
      state.selectedDesktopIcons.delete(app);
      icon.classList.remove('selected');
    } else {
      // Add to selection
      state.selectedDesktopIcons.add(app);
      icon.classList.add('selected');
    }
    
    // Handle dragging
    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        hasMoved = true;
      }
      
      if (hasMoved) {
        // Move all selected icons
        state.selectedDesktopIcons.forEach(selectedApp => {
          const selectedIcon = iconsContainer.querySelector(`[data-open="${selectedApp}"]`);
          const selStartLeft = parseFloat(selectedIcon.dataset.startLeft || selectedIcon.style.left);
          const selStartTop = parseFloat(selectedIcon.dataset.startTop || selectedIcon.style.top);
          
          if (!selectedIcon.dataset.startLeft) {
            selectedIcon.dataset.startLeft = selStartLeft;
            selectedIcon.dataset.startTop = selStartTop;
          }
          
          selectedIcon.style.left = (selStartLeft + deltaX) + 'px';
          selectedIcon.style.top = (selStartTop + deltaY) + 'px';
        });
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (hasMoved) {
        // Snap all selected icons to grid and save positions
        const selectedApps = Array.from(state.selectedDesktopIcons);

        selectedApps.forEach((selectedApp) => {
          const selectedIcon = iconsContainer.querySelector(`[data-open="${selectedApp}"]`);
          const snappedLeft = snapToGrid(parseFloat(selectedIcon.style.left));
          const snappedTop = snapToGrid(parseFloat(selectedIcon.style.top));
          const freePosition = findFreePosition(snappedLeft, snappedTop, selectedApp);

          selectedIcon.style.left = freePosition.left + 'px';
          selectedIcon.style.top = freePosition.top + 'px';

          state.desktopIconPositions[selectedApp] = {
            left: freePosition.left,
            top: freePosition.top
          };
          delete selectedIcon.dataset.startLeft;
          delete selectedIcon.dataset.startTop;
        });

        persistUserSettings();
      }
      
      // Handle double-click to open
      if (e.detail === 2) {
        openApp(app);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
  
  // Deselect all on empty desktop click
  dom.desktopShell.addEventListener('click', (e) => {
    if (e.target === dom.desktopShell || e.target.closest('.selection-layer')) {
      icons.forEach(icon => {
        icon.classList.remove('selected');
        state.selectedDesktopIcons.delete(icon.dataset.open);
      });
      state.selectedDesktopIcons.clear();
    }
  });
}

