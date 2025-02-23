document.addEventListener('DOMContentLoaded', function() {
    const profilePhotos = document.querySelector('.profile-photos');
    const profileImage = document.querySelector('.profile-image');
    let currentIndex = 0;
    const images = []; 

    function createAddPhotoButton() {
      const addPhotoButton = document.createElement('div');
      addPhotoButton.classList.add('add-photo');
      addPhotoButton.innerHTML = '<i class="fas fa-plus plus-btn"></i>';
      
      addPhotoButton.addEventListener('click', function() {
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

    document.getElementById('fileInput').addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('photo', file);

        fetch('http://20.90.161.106:3000/photos', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
          },
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.photo_url) {
            addPhotoToUI(data.photo_url, data.id);
          }
        })
        .catch(error => console.error('Error al subir la imagen:', error));
      }
    });

    function addPhotoToUI(photoUrl, id) {
      const photoContainers = document.querySelectorAll('.photo-container, .add-photo');
      for (let container of photoContainers) {
        if (container.classList.contains('add-photo')) {
          const newPhotoContainer = document.createElement('div');
          newPhotoContainer.classList.add('photo-container');
          newPhotoContainer.dataset.id = id;
          newPhotoContainer.innerHTML = `
            <img src="${photoUrl}" alt="Foto de perfil">
            <div class="delete-icon"><i class="fas fa-times"></i></div>
          `;
          addDeleteEvent(newPhotoContainer);
          container.replaceWith(newPhotoContainer);
          
          profileImage.src = photoUrl;
          images.push(photoUrl);
          generateProgressBars(); 
          updateProgress(); 
          break;
        }
      }
    }

    function addDeleteEvent(photoContainer) {
      photoContainer.querySelector('.delete-icon').addEventListener('click', function() {
        fetch(`http://20.90.161.106:3000/photos/${photoContainer.dataset.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
          }
        })
        .then(response => response.json())
        .then(data => {
          console.log(data.message);
          photoContainer.replaceWith(createAddPhotoButton());
        })
        .catch(error => console.error('Error al eliminar la imagen:', error));
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
        bar.style.width = index === currentIndex ? "100%" : "0%";
      });
    }

    function updateProfileImage() {
      if (images.length > 0) {
        profileImage.src = images[currentIndex];  
      } else {
        profileImage.src = "";  
      }
    }

    document.querySelector('.profile-container').addEventListener('click', (event) => {
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
    });

    const editTab = document.getElementById('edit-tab');
    const previewTab = document.getElementById('preview-tab');
    const editSection = document.getElementById('edit-section');
    const previewSection = document.getElementById('preview-section');

    editTab.addEventListener('click', function() {
      editTab.classList.add('active');
      previewTab.classList.remove('active');
      editSection.style.display = 'grid';
      previewSection.style.display = 'none';
    });

    previewTab.addEventListener('click', function() {
      previewTab.classList.add('active');
      editTab.classList.remove('active');
      editSection.style.display = 'none';
      previewSection.style.display = 'block';
    });

    fetch('http://20.90.161.106:3000/photos', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(response => response.json())
    .then(photos => {
      photos.forEach(photo => addPhotoToUI(photo.photo_url, photo.id));
    })
    .catch(error => console.error('Error al obtener las fotos:', error));

    initializePhotoSlots();
    generateProgressBars();
    updateProgress();
});