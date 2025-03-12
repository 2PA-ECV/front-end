document.addEventListener('DOMContentLoaded', async function () {
    const profilePhotos = document.querySelector('.profile-photos');
    const profileImage = document.querySelector('.profile-image');
    let currentIndex = 0;
    let images = [];

    function createAddPhotoButton() {
        const addPhotoButton = document.createElement('div');
        addPhotoButton.classList.add('add-photo');
        addPhotoButton.innerHTML = '<i class="fas fa-plus plus-btn"></i>';
        
        addPhotoButton.addEventListener('click', function () {
            document.getElementById('fileInput').click();
        });

        return addPhotoButton;
    }

    function initializePhotoSlots() {
        profilePhotos.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            profilePhotos.appendChild(createAddPhotoButton());
        }
    }

    async function loadUserPhotos() {
        try {
            const response = await fetch(`http://20.117.185.81:3000/photos/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) throw new Error('Error al obtener las fotos');

            const photos = await response.json();
            console.log('Fotos obtenidas:', photos);

            images = await Promise.all(
                photos.length > 0
                    ? photos.map(async (photo) => {
                          if (photo.photo_url.startsWith('http')) {
                              return { url: photo.photo_url, id: photo.id };
                          }
                          const fetchResponse = await fetch(`http://20.117.185.81:3000${photo.photo_url}`, {
                              headers: {
                                  'Authorization': `Bearer ${localStorage.getItem("token")}`
                              }
                          });
                          if (!fetchResponse.ok) throw new Error('Error al descargar la imagen');
                          return { url: URL.createObjectURL(await fetchResponse.blob()), id: photo.photo_id };
                      })
                    : []
            );

            renderPhotos();
        } catch (error) {
            console.error('Error al obtener las fotos:', error);
        }
    }

    function renderPhotos() {
        profilePhotos.innerHTML = '';
        images.forEach((photo) => addPhotoToUI(photo.url, photo.id));
        while (profilePhotos.children.length < 6) {
            profilePhotos.appendChild(createAddPhotoButton());
        }
        updateProfileImage();
        generateProgressBars();
        updateProgress();
    }

    function addPhotoToUI(photoUrl, id) {
        const newPhotoContainer = document.createElement('div');
        newPhotoContainer.classList.add('photo-container');
        newPhotoContainer.dataset.id = id;
        newPhotoContainer.innerHTML = `
            <img src="${photoUrl}" alt="Foto de perfil">
            <div class="delete-icon"><i class="fas fa-times"></i></div>
        `;
        addDeleteEvent(newPhotoContainer);
        profilePhotos.appendChild(newPhotoContainer);
    }

    function addDeleteEvent(photoContainer) {
        photoContainer.querySelector('.delete-icon').addEventListener('click', async function () {
            const photoId = photoContainer.dataset.id;
            console.log("Photo id:", photoId);
            if (!photoId) return;
            try {
                const response = await fetch(`http://20.117.185.81:3000/photos/${photoId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
                });
                if (!response.ok) throw new Error('Error al eliminar la imagen');
                await loadUserPhotos(); // Recargar las fotos después de eliminar
            } catch (error) {
                console.error('Error al eliminar la imagen:', error);
            }
        });
    }

    function generateProgressBars() {
        const imageProgressContainer = document.querySelector('.image-progress');
        imageProgressContainer.innerHTML = '';

        if (images.length > 0) {
            images.forEach(() => {
                const progressBar = document.createElement('div');
                progressBar.classList.add('progress-bar');
                const fill = document.createElement('div');
                fill.classList.add('fill');
                progressBar.appendChild(fill);
                imageProgressContainer.appendChild(progressBar);
            });
        }
    }

    function updateProgress() {
        const progressBars = document.querySelectorAll('.progress-bar .fill');
        progressBars.forEach((bar, index) => {
            bar.style.width = index === currentIndex ? '100%' : '0%';
        });
    }

    function updateProfileImage() {
        if (images.length > 0) {
            profileImage.src = images[currentIndex].url;
        } else {
            profileImage.src = 'images/default.png';
        }
    }

    document.getElementById('fileInput').addEventListener('change', async function (event) {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('photo', file);

            try {
                const response = await fetch('http://20.117.185.81:3000/photos', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                    },
                    body: formData
                });

                const data = await response.json();
                if (data.photo_url) {
                    await new Promise(resolve => setTimeout(resolve, 500)); // Esperar 500ms
                    await loadUserPhotos(); // Recargar las fotos después de añadir una nueva
                }
            } catch (error) {
                console.error('Error al subir la imagen:', error);
            }
        }
    });

    document.querySelector('.profile-container').addEventListener('click', async (event) => {
        if (images.length > 0) {
            const containerWidth = event.currentTarget.clientWidth;
            const clickX = event.clientX;
    
            if (clickX > containerWidth / 2) {
                currentIndex = (currentIndex + 1) % images.length;
            } else {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
            }
    
            updateProfileImage();
            updateProgress();
        }
    
        try {
            const response = await fetch('http://20.117.185.81:3000/user/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });
    
            if (!response.ok) throw new Error('Error al obtener el usuario');
    
            const user = await response.json();
            console.log("Usuario obtenido:", user);
    
            const profileDetails = document.querySelector('.profile-details');
            profileDetails.querySelector('h1').innerHTML = `${user.name} <span class="age">${user.age}</span>`;
            profileDetails.querySelectorAll('.bio')[1].innerHTML = `<i class="fas fa-search"></i> ${user.bio}`;
        } catch (error) {
            console.error("Error al obtener datos del usuario:", error);
        }
    });
    
    const editTab = document.getElementById('edit-tab');
    const previewTab = document.getElementById('preview-tab');
    const editSection = document.getElementById('edit-section');
    const previewSection = document.getElementById('preview-section');

    editTab.addEventListener('click', function () {
        editTab.classList.add('active');
        previewTab.classList.remove('active');
        editSection.style.display = 'grid';
        previewSection.style.display = 'none';
    });

    previewTab.addEventListener('click', function () {
        previewTab.classList.add('active');
        editTab.classList.remove('active');
        editSection.style.display = 'none';
        previewSection.style.display = 'block';
    });

    await loadUserPhotos();
});