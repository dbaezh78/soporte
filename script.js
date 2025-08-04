document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('results');
    const noResultsMessage = document.getElementById('noResults');
    const fileListContainer = document.getElementById('fileListContainer');
    let fileList = []; 

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
        fileListContainer.innerHTML = '';
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

        // Obtener los archivos seleccionados
        const selectedCheckboxes = document.querySelectorAll('#fileListContainer input[type="checkbox"]:checked');

        // Lógica de búsqueda mejorada
        if (selectedCheckboxes.length > 0) {
            // Si hay archivos marcados, buscar solo en ellos
            filesToSearch = Array.from(selectedCheckboxes).map(cb => cb.value);
        } else {
            // Si no hay archivos marcados, buscar en todos los archivos disponibles
            filesToSearch = fileList;
        }
        
        if (searchTerm === '') {
            displaySelectedFilesContent(filesToSearch);
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
                    displayFileResult(fileName, content);
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
                displayFileResult(fileName, content);
            } catch (error) {
                console.error(error);
            }
        }
    }
    
    function displayFileResult(fileName, content) {
        const fileCard = document.createElement('div');
        fileCard.classList.add('file-card');

        const title = document.createElement('h3');
        title.textContent = fileName;

        const contentPreview = document.createElement('p');
        const previewText = content.substring(0, 300) + (content.length > 300 ? '...' : '');
        contentPreview.textContent = previewText;

        fileCard.appendChild(title);
        fileCard.appendChild(contentPreview);
        resultsContainer.appendChild(fileCard);
    }
    
    loadFileList();
});