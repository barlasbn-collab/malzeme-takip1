const STORAGE_KEYS = {
  MACHINES: 'malzeme_takip_machines',
  ITEMS: 'malzeme_takip_items'
};

let machines = JSON.parse(localStorage.getItem(STORAGE_KEYS.MACHINES) || '[]');
let items = JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS) || '[]');
let currentView = 'machines';
let currentMachineId = null;
let editingItem = null;
let photoData = null;

function saveData() {
  localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(machines));
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
}

function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function render() {
  const app = document.getElementById('app');
  
  if (currentView === 'machines') {
    app.innerHTML = renderMachinesView();
  } else {
    app.innerHTML = renderItemsView();
  }
}

function renderMachinesView() {
  return `
    <header style="background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 16px 20px;">
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 700; margin: 0;">
        🏭 Makine Malzeme Takip
      </h1>
    </header>

    <main class="flex-1 overflow-auto" style="padding: 20px; background: #f0f9ff;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <p style="color: #1e293b; font-size: 14px; opacity: 0.7;">
              Toplam ${machines.length} makine
            </p>
          </div>
          <button onclick="openAddMachineModal()" 
            style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; 
                   border: none; font-weight: 600; font-size: 16px; cursor: pointer;">
            + Yeni Makine Ekle
          </button>
        </div>

        ${machines.length === 0 ? `
          <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 64px; margin-bottom: 16px;">📦</div>
            <p style="color: #1e293b; font-size: 18px; opacity: 0.6;">
              Henüz makine eklenmemiş
            </p>
            <p style="color: #1e293b; font-size: 14px; opacity: 0.5; margin-top: 8px;">
              Başlamak için yukarıdaki butona tıklayın
            </p>
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
            ${machines.map(machine => {
              const machineItems = items.filter(i => i.machineId === machine.id);
              const criticalCount = machineItems.filter(i => i.status === 'critical').length;
              
              return `
                <div class="machine-card" onclick="viewMachineItems('${machine.id}')" 
                  style="background: #ffffff; border-radius: 12px; padding: 20px; 
                         cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <h3 style="color: #1e293b; font-size: 19px; font-weight: 600; margin: 0;">
                      ${machine.name}
                    </h3>
                    <button onclick="event.stopPropagation(); deleteMachine('${machine.id}')" 
                      style="background: transparent; border: none; color: #64748b; 
                             font-size: 19px; cursor: pointer; padding: 4px;">
                      🗑️
                    </button>
                  </div>
                  <div style="display: flex; gap: 16px; margin-top: 16px;">
                    <div style="flex: 1; background: #3b82f615; padding: 12px; border-radius: 8px;">
                      <div style="color: #1e293b; font-size: 13px; opacity: 0.7;">
                        Malzeme
                      </div>
                      <div style="color: #3b82f6; font-size: 24px; font-weight: 700; margin-top: 4px;">
                        ${machineItems.length}
                      </div>
                    </div>
                    ${criticalCount > 0 ? `
                      <div style="flex: 1; background: #fee2e2; padding: 12px; border-radius: 8px;">
                        <div style="color: #1e293b; font-size: 13px; opacity: 0.7;">
                          Kritik
                        </div>
                        <div style="color: #ef4444; font-size: 24px; font-weight: 700; margin-top: 4px;">
                          ${criticalCount}
                        </div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </main>
  `;
}

function renderItemsView() {
  const machine = machines.find(m => m.id === currentMachineId);
  if (!machine) {
    currentView = 'machines';
    render();
    return '';
  }
  
  const machineItems = items.filter(i => i.machineId === currentMachineId);
  
  return `
    <header style="background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 16px 20px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <button onclick="backToMachines()" 
          style="background: transparent; border: none; color: #64748b; 
                 font-size: 19px; cursor: pointer; padding: 4px;">
          ←
        </button>
        <h1 style="color: #1e293b; font-size: 21px; font-weight: 700; margin: 0;">
          ${machine.name}
        </h1>
      </div>
    </header>

    <main class="flex-1 overflow-auto" style="padding: 20px; background: #f0f9ff;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <p style="color: #1e293b; font-size: 14px; opacity: 0.7;">
            ${machineItems.length} malzeme
          </p>
          <button onclick="openAddItemModal()" 
            style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; 
                   border: none; font-weight: 600; font-size: 16px; cursor: pointer;">
            + Malzeme Ekle
          </button>
        </div>

        ${machineItems.length === 0 ? `
          <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 64px; margin-bottom: 16px;">📦</div>
            <p style="color: #1e293b; font-size: 18px; opacity: 0.6;">
              Bu makinede henüz malzeme yok
            </p>
            <p style="color: #1e293b; font-size: 14px; opacity: 0.5; margin-top: 8px;">
              İlk malzemeyi eklemek için yukarıdaki butona tıklayın
            </p>
          </div>
        ` : `
          <div style="display: grid; gap: 12px;">
            ${machineItems.map(item => {
              const statusColors = {
                critical: '#ef4444',
                low: '#f59e0b',
                normal: '#10b981'
              };
              const statusLabels = {
                critical: 'Kritik',
                low: 'Düşük',
                normal: 'Normal'
              };
              const statusColor = statusColors[item.status];
              
              return `
                <div style="background: #ffffff; border-radius: 12px; padding: 16px; 
                           box-shadow: 0 2px 8px rgba(0,0,0,0.08); display: flex; 
                           justify-content: space-between; align-items: center;">
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                      ${item.photo ? `
                        <img src="${item.photo}" alt="${item.name}" 
                          style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px;">
                      ` : ''}
                      <div>
                        <h3 style="color: #1e293b; font-size: 18px; 
                                   font-weight: 600; margin: 0;">
                          ${item.name}
                        </h3>
                        <p style="color: #1e293b; font-size: 14px; 
                                 opacity: 0.6; margin: 4px 0 0 0;">
                          Miktar: ${item.quantity}
                        </p>
                      </div>
                    </div>
                    <span style="background: ${statusColor}20; color: ${statusColor}; 
                                padding: 4px 12px; border-radius: 12px; font-size: 13px; 
                                font-weight: 600;">
                      ${statusLabels[item.status]}
                    </span>
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <button onclick="editItem('${item.id}')" 
                      style="background: #3b82f620; color: #3b82f6; border: none; 
                             padding: 8px 16px; border-radius: 8px; cursor: pointer; 
                             font-size: 14px; font-weight: 600;">
                      Düzenle
                    </button>
                    <button onclick="deleteItem('${item.id}')" 
                      style="background: #fee2e2; color: #ef4444; border: none; 
                             padding: 8px 16px; border-radius: 8px; cursor: pointer; 
                             font-size: 14px; font-weight: 600;">
                      Sil
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </main>
  `;
}

function openAddMachineModal() {
  showModal('Yeni Makine Ekle', `
    <form id="machineForm" onsubmit="saveMachine(event)">
      <label style="display: block; margin-bottom: 16px;">
        <span style="display: block; margin-bottom: 8px; font-weight: 600;">Makine Adı *</span>
        <input type="text" id="machineName" required 
          style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; 
                 font-size: 16px;" placeholder="Örn: CNC Torna">
      </label>
      <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
        <button type="button" onclick="closeModal()" 
          style="padding: 12px 24px; border: 1px solid #e2e8f0; background: white; 
                 border-radius: 8px; cursor: pointer; font-weight: 600;">
          İptal
        </button>
        <button type="submit" 
          style="padding: 12px 24px; background: #3b82f6; color: white; border: none; 
                 border-radius: 8px; cursor: pointer; font-weight: 600;">
          Kaydet
        </button>
      </div>
    </form>
  `);
}

function saveMachine(event) {
  event.preventDefault();
  
  const name = document.getElementById('machineName').value.trim();
  if (!name) return;
  
  machines.push({
    id: generateId(),
    name: name,
    createdAt: new Date().toISOString()
  });
  
  saveData();
  closeModal();
  showToast('Makine eklendi', 'success');
  render();
}

function deleteMachine(machineId) {
  const machineItems = items.filter(i => i.machineId === machineId);
  
  if (machineItems.length > 0) {
    const confirmed = confirm(`Bu makinede ${machineItems.length} malzeme var. Silmek istediğinizden emin misiniz?`);
    if (!confirmed) return;
    
    items = items.filter(i => i.machineId !== machineId);
  }
  
  machines = machines.filter(m => m.id !== machineId);
  saveData();
  showToast('Makine silindi', 'success');
  render();
}

function viewMachineItems(machineId) {
  currentMachineId = machineId;
  currentView = 'items';
  render();
}

function backToMachines() {
  currentView = 'machines';
  currentMachineId = null;
  render();
}

function openAddItemModal() {
  photoData = null;
  showModal('Yeni Malzeme Ekle', `
    <form id="itemForm" onsubmit="saveItem(event)">
      <label style="display: block; margin-bottom: 16px;">
        <span style="display: block; margin-bottom: 8px; font-weight: 600;">Malzeme Adı *</span>
        <input type="text" id="itemName" required 
          style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; 
                 font-size: 16px;" placeholder="Örn: Vida">
      </label>
      
      <label style="display: block; margin-bottom: 16px;">
        <span style="display: block; margin-bottom: 8px; font-weight: 600;">Miktar *</span>
        <input type="number" id="itemQuantity" required min="0" 
          style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; 
                 font-size: 16px;" placeholder="100">
      </label>

      <label style="display: block; margin-bottom: 16px;">
        <span style="display: block; margin-bottom: 8px; font-weight: 600;">Durum *</span>
        <select id="itemStatus" required 
          style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; 
                 font-size: 16px;">
          <option value="normal">Normal</option>
          <option value="low">Düşük</option>
          <option value="critical">Kritik</option>
        </select>
      </label>

      <label style="display: block; margin-bottom: 16px;">
        <span style="display: block; margin-bottom: 8px; font-weight: 600;">Fotoğraf</span>
        <input type="file" id="itemPhoto" accept="image/*" onchange="handlePhotoSelect(event)">
        <button type="button" onclick="document.getElementById('itemPhoto').click()" 
          style="width: 100%; padding: 12px; border: 1px dashed #e2e8f0; background: #f8fafc; 
                 border-radius: 8px; cursor: pointer; font-size: 16px;">
          📷 Fotoğraf Seç
        </button>
        <div id="photoPreview" style="margin-top: 12px;"></div>
      </label>

      <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
        <button type="button" onclick="closeModal()" 
          style="padding: 12px 24px; border: 1px solid #e2e8f0; background: white; 
                 border-radius: 8px; cursor: pointer; font-weight: 600;">
          İptal
        </button>
        <button type="submit" id="saveItemBtn"
          style="padding: 12px 24px; background: #3b82f6; color: white; border: none; 
                 border-radius: 8px; cursor: pointer; font-weight: 600;">
          Kaydet
        </button>
      </div>
    </form>
  `);
}

function handlePhotoSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    photoData = e.target.result;
    const preview = document.getElementById('photoPreview');
    if (preview) {
      preview.innerHTML = `<img src="${photoData}" class="photo-preview">`;
    }
  };
  reader.readAsDataURL(file);
}

function saveItem(event) {
  event.preventDefault();
  
  const name = document.getElementById('itemName').value.trim();
  const quantity = parseInt(document.getElementById('itemQuantity').value);
  const status = document.getElementById('itemStatus').value;
  
  if (!name) return;
  
  const btn = document.getElementById('saveItemBtn');
  btn.disabled = true;
  btn.textContent = 'Kaydediliyor...';
  
  items.push({
    id: generateId(),
    machineId: currentMachineId,
    name: name,
    quantity: quantity,
    status: status,
    photo: photoData || '',
    createdAt: new Date().toISOString()
  });
  
  saveData();
  closeModal();
  showToast('Malzeme eklendi', 'success');
  render();
}

function editItem(itemId) {
  const item = items.find(i => i.id === itemId);
  if (!item) return;
  
  editingItem = item;
  photoData = item.photo || null;
  
  showModal('Malzeme Düzenle', `
    <form id="itemForm" onsubmit="updateItem(event)">
      <label style="display: block; margin-bottom: 16px;">
        <span style="display: block; margin-bottom: 8px; font-weight: 600;">Malzeme Adı *</span>
        <input type="text" id="itemName" required value="${item.name}"
          style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; 
                 font-size: 16px;">
      </label>
      
      <label style="display: block; margin-bottom: 16px;">
        <span style="display: block; margin-bottom: 8px; font-weight: 600;">Miktar *</span>
        <input type="number" id="itemQuantity" required min="0" value="${item.quantity}"
          style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; 
                 font-size: 16px;">
      </label>

      <label style="display: block; margin-bottom: 16px;">
        <span style="display: block; margin-bottom: 8px; font-weight: 600;">Durum *</span>
        <select id="itemStatus" required 
          style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; 
                 font-size: 16px;">
          <option value="normal" ${item.status === 'normal' ? 'selected' : ''}>Normal</option>
          <option value="low" ${item.status === 'low' ? 'selected' : ''}>Düşük</option>
          <option value="critical" ${item.status === 'critical' ? 'selected' : ''}>Kritik</option>
        </select>
      </label>

      <label style="display: block; margin-bottom: 16px;">
        <span style="display: block; margin-bottom: 8px; font-weight: 600;">Fotoğraf</span>
        <input type="file" id="itemPhoto" accept="image/*" onchange="handlePhotoSelect(event)">
        <button type="button" onclick="document.getElementById('itemPhoto').click()" 
          style="width: 100%; padding: 12px; border: 1px dashed #e2e8f0; background: #f8fafc; 
                 border-radius: 8px; cursor: pointer; font-size: 16px;">
          📷 Fotoğraf Değiştir
        </button>
        <div id="photoPreview" style="margin-top: 12px;">
          ${item.photo ? `<img src="${item.photo}" class="photo-preview">` : ''}
        </div>
      </label>

      <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
        <button type="button" onclick="closeModal()" 
          style="padding: 12px 24px; border: 1px solid #e2e8f0; background: white; 
                 border-radius: 8px; cursor: pointer; font-weight: 600;">
          İptal
        </button>
        <button type="submit" id="updateItemBtn"
          style="padding: 12px 24px; background: #3b82f6; color: white; border: none; 
                 border-radius: 8px; cursor: pointer; font-weight: 600;">
          Güncelle
        </button>
      </div>
    </form>
  `);
}

function updateItem(event) {
  event.preventDefault();
  
  if (!editingItem) return;
  
  const name = document.getElementById('itemName').value.trim();
  const quantity = parseInt(document.getElementById('itemQuantity').value);
  const status = document.getElementById('itemStatus').value;
  
  const btn = document.getElementById('updateItemBtn');
  btn.disabled = true;
  btn.textContent = 'Güncelleniyor...';
  
  const index = items.findIndex(i => i.id === editingItem.id);
  if (index !== -1) {
    items[index] = {
      ...items[index],
      name: name,
      quantity: quantity,
      status: status,
      photo: photoData || '',
      updatedAt: new Date().toISOString()
    };
    
    saveData();
    closeModal();
    editingItem = null;
    showToast('Malzeme güncellendi', 'success');
    render();
  }
}

function deleteItem(itemId) {
  const item = items.find(i => i.id === itemId);
  if (!item) return;
  
  const confirmed = confirm(`"${item.name}" malzemesini silmek istediğinizden emin misiniz?`);
  if (!confirmed) return;
  
  items = items.filter(i => i.id !== itemId);
  saveData();
  showToast('Malzeme silindi', 'success');
  render();
}

function showModal(title, content) {
  const modal = document.createElement('div');
  modal.id = 'modal';
  modal.className = 'modal-backdrop';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); display: flex; align-items: center;
    justify-content: center; z-index: 1000; padding: 20px;
  `;
  
  modal.innerHTML = `
    <div class="fade-in" style="background: #ffffff; border-radius: 16px; 
         max-width: 500px; width: 100%; max-height: 90%; overflow-y: auto; padding: 24px;
         box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <h2 style="color: #1e293b; font-size: 21px; 
                 font-weight: 700; margin: 0 0 20px 0;">
        ${title}
      </h2>
      ${content}
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.remove();
  editingItem = null;
  photoData = null;
}

function showToast(message, type = 'success') {
  const colors = {
    success: '#10b981',
    error: '#ef4444'
  };

  const toast = document.createElement('div');
  toast.className = 'fade-in';
  toast.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; 
    background: ${colors[type]}; color: white;
    padding: 16px 24px; border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    z-index: 2000; font-weight: 600;
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

document.addEventListener('DOMContentLoaded', render);