document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    const authToken = `Bearer ${token}`;
    fetchUserData(authToken);
    fetchProfilePicture(authToken);
});

function fetchUserData(token) {
    fetch('http://20.90.161.106:3000/user/', {
        method: 'GET',
        headers: {
            'Authorization': token
        }
    })
    .then(response => {
        if (response.ok) return response.json();
        if (response.status === 401) redirectToLogin();
        throw new Error('Failed to fetch user data');
    })
    .then(data => updateProfileInfo(data))
    .catch(error => console.error('Error:', error));
}

function updateProfileInfo(data) {
    const profileName = document.querySelector('.profile-name');
    try {
        const birthDate = new Date(data.birth_date);
        const age = calculateAge(birthDate);
        profileName.textContent = `${data.name}, ${age}`;
    } catch (e) {
        console.error('Invalid birth date:', e);
        profileName.textContent = data.name;
    }
}

function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

async function fetchProfilePicture(token) {
    try {
        const response = await fetch("http://20.90.161.106:3000/profile", {
            method: "GET",
            headers: { "Authorization": token }
        });

        if (response.status === 401) redirectToLogin();
        if (response.status === 404) {
            updateProfilePicture('images/avatar-default.svg', token);
            return;
        }
        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();
        updateProfilePicture(data.profile_picture, token);
    } catch (error) {
        console.error("Error fetching profile picture:", error);
        updateProfilePicture('images/avatar-default.svg', token);
    }
}

async function updateProfilePicture(profilePicturePath, token) {
    const profileImage = document.querySelector('.profile-picture img');
    
    // Revoke previous Blob URL to prevent memory leaks
    if (profileImage.src.startsWith('blob:')) {
        URL.revokeObjectURL(profileImage.src);
    }

    if (!profilePicturePath) {
        profileImage.src = 'images/avatar-default.svg';
        return;
    }

    if (profilePicturePath.startsWith('http')) {
        profileImage.src = profilePicturePath;
    } else if (profilePicturePath.startsWith('/')) {
        try {
            const response = await fetch(`http://20.90.161.106:3000${profilePicturePath}`, {
                headers: { 'Authorization': token }
            });
            if (!response.ok) throw new Error('Image fetch failed');
            const blob = await response.blob();
            profileImage.src = URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error loading image:', error);
            profileImage.src = 'images/avatar-default.svg';
        }
    } else {
        profileImage.src = profilePicturePath;
    }
}

function redirectToLogin() {
    localStorage.removeItem("token");
    window.location.href = '/login.html';
}