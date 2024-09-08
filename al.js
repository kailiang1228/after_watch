document.addEventListener('DOMContentLoaded', function() {
    const categorySelect = document.getElementById('category-select');
    const newItemTitle = document.getElementById('new-item-title');
    const addItemButton = document.getElementById('addItem');
    const resetButton = document.getElementById('resetItems');
    const exportButton = document.getElementById('exportList');
    const importButton = document.getElementById('importList');
    const importFile = document.getElementById('importFile');

    // 初始數據
    const initialData = {
        movie: ['上海灘', '夏日重現', '花木蘭', '新福音戰士:序', '新福音戰士:終', '街區男孩', '哈利波特', '少年耶安啦'],
        drama: ['紙房子', '絕命毒師', '痞子英雄', '越獄風雲', '城市的主宰', '東京罪惡', '黑道家族', '火線', '巔峰對決2023、24', 'PROUDCE 48', '大谷翔平:超越夢想', '切爾諾貝利', '勇者義彥'],
        animation: ['銀魂', '烏龍派出所', '探險活寶', '鋼彈SEED', '賽馬娘OVA', 'U149', '少女與戰車', '五等分', '未聞花名', '四月妹妹', '涼宮', '魯路修', '法蘭秀秀', '入間同學', '我內心的糟糕念頭', '農夫戰紀', '天國大魔境', '躍動青春', '我家英雄', '無頭騎士', '鍊鋸人', '清音社', '新石記', '四月謊言', 'Z鋼', '鋼鍊', '夢幻島']
    };

    // 載入保存的項目或初始數據
    loadItems();

    // 新增項目功能
    addItemButton.addEventListener('click', function() {
        const category = categorySelect.value;
        const title = newItemTitle.value.trim();
        
        if (category && title) {
            addItem(title, category);
            newItemTitle.value = ''; // 清空輸入框
            categorySelect.value = ''; // 重置選擇
            saveItems(); // 保存更改
        } else {
            alert('請選擇類別並輸入標題');
        }
    });

    // 為所有項目添加點擊事件（包括已有的和新增的）
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('item')) {
            event.target.classList.toggle('highlight');
            saveItems(); // 保存高亮狀態
        }
        if (event.target.classList.contains('delete-btn')) {
            event.target.parentElement.remove();
            saveItems(); // 保存刪除後的狀態
        }
    });

    // 添加重置按鈕的事件監聽器
    resetButton.addEventListener('click', function() {
        if (confirm('確定要重置清單嗎？這將刪除所有更改並恢復到初始狀態。')) {
            localStorage.removeItem('watchList');
            location.reload();
        }
    });

    // 輸出片單功能
    exportButton.addEventListener('click', function() {
        const items = JSON.parse(localStorage.getItem('watchList'));
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "watchlist.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    // 讀取片單功能
    importButton.addEventListener('click', function() {
        importFile.click();
    });

    importFile.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    let items = JSON.parse(e.target.result);
                    
                    // 檢查並轉換格式
                    if (!items.movie && !items.drama && !items.animation) {
                        // 假設是簡單的標題列表
                        items = {
                            movie: items.movie || [],
                            drama: items.drama || [],
                            animation: items.animation || []
                        };
                    }
                    
                    // 確保每個項目都有正確的格式
                    ['movie', 'drama', 'animation'].forEach(category => {
                        items[category] = items[category].map(item => {
                            if (typeof item === 'string') {
                                return { title: item, highlighted: false };
                            } else if (typeof item === 'object') {
                                return { 
                                    title: item.title || item.name || '',
                                    highlighted: !!item.highlighted
                                };
                            }
                            return null;
                        }).filter(item => item !== null);
                    });
    
                    localStorage.setItem('watchList', JSON.stringify(items));
                    loadItems();
                    alert('片單已成功讀取');
                } catch (error) {
                    alert('讀取失敗，請確保文件格式正確');
                    console.error('Import error:', error);
                }
            };
            reader.readAsText(file);
        }
    });

    // 添加項目到列表
    function addItem(title, category) {
        const listElement = document.getElementById(`${category}-list`);
        const newItem = document.createElement('div');
        newItem.className = 'item';
        newItem.innerHTML = `
            ${title}
            <button class="delete-btn">刪除</button>
        `;
        listElement.appendChild(newItem);
    }

    // 保存項目到本地存儲
    function saveItems() {
        const items = {};
        ['movie', 'drama', 'animation'].forEach(category => {
            items[category] = Array.from(document.getElementById(`${category}-list`).children).map(item => ({
                title: item.textContent.replace('刪除', '').trim(),
                highlighted: item.classList.contains('highlight')
            }));
        });
        localStorage.setItem('watchList', JSON.stringify(items));
    }

    // 從本地存儲載入項目或使用初始數據
    function loadItems() {
        const savedItems = JSON.parse(localStorage.getItem('watchList'));
        const itemsToLoad = savedItems || initialData;

        ['movie', 'drama', 'animation'].forEach(category => {
            const listElement = document.getElementById(`${category}-list`);
            listElement.innerHTML = ''; // 清空現有項目
            if (itemsToLoad[category]) {
                itemsToLoad[category].forEach(item => {
                    const newItem = document.createElement('div');
                    newItem.className = 'item';
                    if (savedItems && item.highlighted) {
                        newItem.classList.add('highlight');
                    }
                    newItem.innerHTML = `
                        ${savedItems ? item.title : item}
                        <button class="delete-btn">刪除</button>
                    `;
                    listElement.appendChild(newItem);
                });
            }
        });

        // 如果是首次加載（沒有保存的數據），則保存初始數據
        if (!savedItems) {
            saveItems();
        }
    }
});