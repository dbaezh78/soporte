document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('results');
    const noResultsMessage = document.getElementById('noResults');
    const fileListContainer = document.getElementById('fileListContainer');
    const toggleFileListButton = document.getElementById('toggleFileListButton');
    let fileList = []; 
    const MAX_LINES = 15;

    toggleFileListButton.addEventListener('click', () => {
        fileListContainer.classList.toggle('hidden');
    });

    async function loadFileList() {
        try {
            const response = await fetch('./data/file.txt'); 
            if (!response.ok) {
                throw new Error(`Error al cargar file.txt: ${response.statusText}`);
            }
            const content = await response.text();
            
            fileList = content.split('\n')
                              .map(fileName => fileName.trim())
                              .filter(fileName => fileName.length > 0 && fileName.endsWith('.txt'));
            
            renderFileList();
        } catch (error) {
            console.error(error);
            fileListContainer.innerHTML = '<p class="error-message">No se pudo cargar la lista de archivos.</p>';
        }
    }

    function renderFileList() {
        fileListContainer.innerHTML = '<h3>Archivos disponibles:</h3>';
        const fileListGrid = document.createElement('div');
        fileListGrid.classList.add('file-list-grid');

        fileList.forEach(fileName => {
            const fileItem = document.createElement('label');
            fileItem.classList.add('file-item');
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'file';
            checkbox.value = fileName;
            
            const textSpan = document.createElement('span');
            textSpan.textContent = fileName;
            
            fileItem.appendChild(checkbox);
            fileItem.appendChild(textSpan);
            fileListGrid.appendChild(fileItem);
        });

        fileListContainer.appendChild(fileListGrid);
    }

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    async function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        resultsContainer.innerHTML = '';
        noResultsMessage.classList.add('hidden');
        let filesToSearch = [];

        const selectedCheckboxes = document.querySelectorAll('#fileListContainer input[type="checkbox"]:checked');

        if (selectedCheckboxes.length > 0) {
            filesToSearch = Array.from(selectedCheckboxes).map(cb => cb.value);
        } else {
            filesToSearch = fileList;
        }
        
        let foundFilesCount = 0;
        for (const fileName of filesToSearch) {
            try {
                const response = await fetch(`./data/${fileName}`);
                if (!response.ok) {
                    throw new Error(`Error al cargar el archivo ${fileName}: ${response.statusText}`);
                }
                const content = await response.text();
                
                if (content.toLowerCase().includes(searchTerm) || searchTerm === '') {
                    displayFileResult(fileName, content, searchTerm);
                    foundFilesCount++;
                }
            } catch (error) {
                console.error(error);
            }
        }

        if (foundFilesCount === 0) {
            noResultsMessage.classList.remove('hidden');
        }
    }
    
    async function displaySelectedFilesContent(filesToDisplay) {
        for (const fileName of filesToDisplay) {
             try {
                const response = await fetch(`./data/${fileName}`);
                if (!response.ok) {
                    throw new Error(`Error al cargar el archivo ${fileName}: ${response.statusText}`);
                }
                const content = await response.text();
                displayFileResult(fileName, content, '');
            } catch (error) {
                console.error(error);
            }
        }
    }
    
    async function openFileInNewWindow(fileName) {
        try {
            const response = await fetch(`./data/${fileName}`);
            const content = await response.text();
            
            const newWindow = window.open('', '_blank');
            newWindow.document.write(`
                <html>
                <head>
                    <title>${fileName}</title>
                    <style>body { font-family: monospace; white-space: pre; }</style>
                </head>
                <body>${content}</body>
                </html>
            `);
            newWindow.document.close();
        } catch (error) {
            console.error('Error al abrir el archivo:', error);
            alert('No se pudo abrir el archivo en una nueva ventana.');
        }
    }
    
    function displayFileResult(fileName, content, searchTerm) {
        const fileCard = document.createElement('div');
        fileCard.classList.add('file-card');

        const title = document.createElement('h3');
        const fileNameLink = document.createElement('span');
        fileNameLink.textContent = fileName;
        fileNameLink.classList.add('file-title-link');
        fileNameLink.addEventListener('click', () => openFileInNewWindow(fileName));
        title.appendChild(fileNameLink);

        const contentElement = document.createElement('p');
        const lines = content.split('\n');

        const previewContent = lines.slice(0, MAX_LINES).join('\n');
        
        if (searchTerm && previewContent.toLowerCase().includes(searchTerm)) {
            const regex = new RegExp(searchTerm, 'gi');
            const highlightedText = previewContent.replace(regex, `<span class="highlight">$&</span>`);
            contentElement.innerHTML = highlightedText;
        } else {
            contentElement.textContent = previewContent;
        }

        if (lines.length > MAX_LINES) {
            contentElement.innerHTML += '<br>...';
        }

        fileCard.appendChild(title);
        fileCard.appendChild(contentElement);
        resultsContainer.appendChild(fileCard);
    }
    
    loadFileList();
});