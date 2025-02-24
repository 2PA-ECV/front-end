document.addEventListener('DOMContentLoaded', () => {
const token = `Bearer ${localStorage.getItem("token")}`;

fetch('http://20.90.161.106:3000/user/', {
    method: 'GET',
    headers: {
    'Authorization': token
    }
})
.then(response => response.json())
.then(async (data) => {
    // Actualizar el nombre y la edad
    const profileName = document.querySelector('.profile-name');
    const birthDate = new Date(data.birth_date);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    profileName.textContent = `${data.name}, ${age}`;

    // Actualizar la foto de perfil
    const profilePicture = document.querySelector('.profile-picture img');
    if (data.profile_picture) {
    if (data.profile_picture.startsWith('http')) {
        profilePicture.src = data.profile_picture;
    } else {
        try {
        const fetchResponse = await fetch(`http://20.90.161.106:3000${data.profile_picture}`, {
            headers: {
            'Authorization': token
            }
        });
        if (!fetchResponse.ok) throw new Error('Error al descargar la imagen');
        const imageBlob = await fetchResponse.blob();
        profilePicture.src = URL.createObjectURL(imageBlob);
        } catch (error) {
        console.error('Error al cargar la imagen:', error);
        profilePicture.src = 'images/avatar-default.svg'; // Imagen por defecto en caso de error
        }
    }
    } else {
    profilePicture.src = 'images/avatar-default.svg';
    }
})
.catch(error => console.error('Error:', error));
});
