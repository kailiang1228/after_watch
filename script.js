document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const categorySelect = document.getElementById('category-select');
    const newItemTitle = document.getElementById('new-item-title');
    const addItemButton = document.getElementById('addItem');
    const resetButton = document.getElementById('resetItems');
    const exportButton = document.getElementById('exportList');
    const importButton = document.getElementById('importList');
    const importFile = document.getElementById('importFile');
    const searchInput = document.getElementById('search-input');
    
    // Stats Elements
    const totalCountEl = document.getElementById('total-count');
    const watchedCountEl = document.getElementById('watched-count');
    const remainingCountEl = document.getElementById('remaining-count');

    // Initial Data
    const initialData = {
        movie: ['哈利波特'],
        drama: ['紙房子', '怪奇物語', '絕命律師'],
        animation: ['銀魂', '烏龍派出所', '探險活寶', '鋼之鍊金術師']
    };

    // Load Data
    loadItems();
    updateStats();

    // --- Event Listeners ---

    // Add Item
    addItemButton.addEventListener('click', handleAddItem);
    newItemTitle.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddItem();
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.item').forEach(item => {
            const text = item.querySelector('span').textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
        });
    });

    // Global Click (Highlight & Delete)
    document.body.addEventListener('click', function(event) {
        const item = event.target.closest('.item');
        const deleteBtn = event.target.closest('.delete-btn');

        if (deleteBtn) {
            if(confirm('確定要刪除嗎？')) {
                deleteBtn.closest('.item').remove();
                saveItems();
                updateStats();
            }
            return;
        }

        if (item) {
            item.classList.toggle('highlight');
            saveItems();
            updateStats();
        }
    });

    // Reset
    resetButton.addEventListener('click', function() {
        if (confirm('確定要重置清單嗎？這將刪除所有更改並恢復到初始狀態。')) {
            localStorage.removeItem('watchList');
            location.reload();
        }
    });

    // Export
    exportButton.addEventListener('click', function() {
        const items = JSON.parse(localStorage.getItem('watchList'));
        const formattedJson = JSON.stringify(items, null, 2);
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(formattedJson);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `watchlist_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    // Import
    importButton.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', handleImport);

    // --- Functions ---

    function handleAddItem() {
        const category = categorySelect.value;
        const title = newItemTitle.value.trim();
        
        if (category && title) {
            addItemToDOM(title, category, false);
            newItemTitle.value = '';
            saveItems();
            updateStats();
        } else {
            alert('請選擇類別並輸入標題');
        }
    }

    function addItemToDOM(title, category, isHighlighted) {
        const listElement = document.getElementById(`${category}-list`);
        const newItem = document.createElement('div');
        newItem.className = `item ${isHighlighted ? 'highlight' : ''}`;
        newItem.innerHTML = `
            <span>${title}</span>
            <button class="delete-btn"><i class="fas fa-times"></i></button>
        `;
        // Insert at top
        listElement.insertBefore(newItem, listElement.firstChild);
    }

    function saveItems() {
        const items = {};
        ['movie', 'drama', 'animation'].forEach(category => {
            const list = document.getElementById(`${category}-list`);
            // Reverse to save in correct order (since we prepend)
            items[category] = Array.from(list.children).reverse().map(item => ({
                title: item.querySelector('span').textContent,
                highlighted: item.classList.contains('highlight')
            }));
        });
        localStorage.setItem('watchList', JSON.stringify(items));
    }

    function loadItems() {
        const savedItems = JSON.parse(localStorage.getItem('watchList'));
        const itemsToLoad = savedItems || initialData;

        ['movie', 'drama', 'animation'].forEach(category => {
            const listElement = document.getElementById(`${category}-list`);
            listElement.innerHTML = '';
            
            if (itemsToLoad[category]) {
                // If it's initial data (array of strings)
                if (Array.isArray(itemsToLoad[category]) && typeof itemsToLoad[category][0] === 'string') {
                    itemsToLoad[category].forEach(title => addItemToDOM(title, category, false));
                } 
                // If it's saved data (array of objects)
                else {
                    itemsToLoad[category].forEach(item => {
                        addItemToDOM(item.title, category, item.highlighted);
                    });
                }
            }
        });

        if (!savedItems) saveItems();
    }

    function updateStats() {
        let total = 0;
        let watched = 0;

        document.querySelectorAll('.item').forEach(item => {
            total++;
            if (item.classList.contains('highlight')) watched++;
        });

        totalCountEl.textContent = total;
        watchedCountEl.textContent = watched;
        remainingCountEl.textContent = total - watched;
    }

    function handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const items = JSON.parse(e.target.result);
                // Basic validation
                if (!items.movie && !items.drama && !items.animation) throw new Error('Invalid format');
                
                localStorage.setItem('watchList', JSON.stringify(items));
                loadItems();
                updateStats();
                alert('片單已成功讀取');
            } catch (error) {
                alert('讀取失敗，請確保文件格式正確');
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    }
});
