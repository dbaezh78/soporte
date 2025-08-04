document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('results');
    const noResultsMessage = document.getElementById('noResults');
    const fileListContainer = document.getElementById('fileListContainer');
    const toggleFileListButton = document.getElementById('toggleFileListButton');
    let fileList = []; 

    // Evento para mostrar/ocultar la lista de archivos
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
                              .filter(fileName => fileName.length > 0 && fileName !== 'file.txt');
            
            renderFileList();
        } catch (error) {
            console.error(error);
            fileListContainer.innerHTML = '<p class="error-message">No se pudo cargar la lista de archivos.</p>';
        }
    }

    function renderFileList() {
        fileListContainer.innerHTML = '<h3>Archivos disponibles:</h3>';
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
            fileListContainer.appendChild(fileItem);
        });
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
        
        if (searchTerm === '') {
            displaySelectedFilesContent(filesToSearch, searchTerm);
            return;
        }

        let foundFilesCount = 0;
        for (const fileName of filesToSearch) {
            try {
                const response = await fetch(`./data/${fileName}`);
                if (!response.ok) {
                    throw new Error(`Error al cargar el archivo ${fileName}: ${response.statusText}`);
                }
                const content = await response.text();
                
                if (content.toLowerCase().includes(searchTerm)) {
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
    
    function displayFileResult(fileName, content, searchTerm) {
        const fileCard = document.createElement('div');
        fileCard.classList.add('file-card');

        const title = document.createElement('h3');
        title.textContent = fileName;

        const contentPreview = document.createElement('p');

        // Lógica de resaltado
        if (searchTerm && content.toLowerCase().includes(searchTerm)) {
            // Creamos una expresión regular con la palabra a buscar, ignorando mayúsculas y minúsculas
            const regex = new RegExp(searchTerm, 'gi');
            // Reemplazamos la coincidencia con la misma palabra envuelta en un span para resaltarla
            const highlightedText = content.replace(regex, `<span class="highlight">$&</span>`);
            contentPreview.innerHTML = highlightedText.substring(0, 300) + (content.length > 300 ? '...' : '');
        } else {
            contentPreview.textContent = content.substring(0, 300) + (content.length > 300 ? '...' : '');
        }

        fileCard.appendChild(title);
        fileCard.appendChild(contentPreview);
        resultsContainer.appendChild(fileCard);
    }
    
    loadFileList();
});