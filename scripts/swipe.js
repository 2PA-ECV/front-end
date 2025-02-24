const DECISION_THRESHOLD = 300

let isAnimating = false
let pullDeltaX = 0 

function startDrag(event) {
  if (isAnimating) return

  const actualCard = event.target.closest('article')
  if (!actualCard) return

  const startX = event.pageX ?? event.touches[0].pageX

  const nextCard = actualCard.nextElementSibling;
  if (nextCard) {
    nextCard.style.visibility = 'visible';
    nextCard.style.zIndex = 1;
  }

  actualCard.style.cursor = 'grabbing';
  actualCard.style.zIndex = 100;

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onEnd)

  document.addEventListener('touchmove', onMove, { passive: true })
  document.addEventListener('touchend', onEnd, { passive: true })

  function onMove(event) {
    event.preventDefault();

    const currentX = event.pageX ?? event.touches[0].pageX

    pullDeltaX = currentX - startX

    if (pullDeltaX === 0) return

    isAnimating = true

    const deg = pullDeltaX / 20

    actualCard.style.transform = `translateX(${pullDeltaX}px) rotate(${deg}deg)`

    actualCard.style.cursor = 'grabbing'

    const opacity = Math.abs(pullDeltaX) / 300
    const isRight = pullDeltaX > 0

    const choiceEl = isRight
      ? actualCard.querySelector('.choice.like')
      : actualCard.querySelector('.choice.nope')

    if (choiceEl) {
        choiceEl.style.opacity = opacity;
    }
    console.log('pullDeltaX:', pullDeltaX);
  }

  function onEnd(event) {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onEnd)

    document.removeEventListener('touchmove', onMove)
    document.removeEventListener('touchend', onEnd)

    const decisionMade = Math.abs(pullDeltaX) >= DECISION_THRESHOLD

    if (decisionMade) {
      const goRight = pullDeltaX >= 0

      actualCard.classList.add(goRight ? 'go-right' : 'go-left');
      actualCard.addEventListener('transitionend', () => {
        actualCard.remove();
        loadNextUser();
        
        if (nextCard) {
          nextCard.style.visibility = 'visible';
        }
      });

    } else {
      actualCard.classList.add('reset');
      actualCard.style.cursor = 'grab';

      actualCard.classList.remove('go-right', 'go-left');

      actualCard.querySelectorAll('.choice').forEach(choice => {
        choice.style.opacity = 0
      });
    }

    actualCard.addEventListener('transitionend', () => {
      actualCard.removeAttribute('style')
      actualCard.classList.remove('reset')

      pullDeltaX = 0
      isAnimating = false
    })

    actualCard
      .querySelectorAll(".choice")
      .forEach((el) => (el.style.opacity = 0));
  }
}

document.addEventListener('mousedown', startDrag)
document.addEventListener('touchstart', startDrag, { passive: true })



async function loadNextUser() {
  try {
      const response = await fetch('http://20.90.161.106:3000/user/next-user', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem("token")}`
          }
      });
      if (!response.ok) throw new Error('Error al obtener el próximo usuario');

      const user = await response.json();
      console.log("Usuario obtenido:", user);

      if (!user || !user.user_id) {
          console.warn("No hay más usuarios disponibles");
          return;
      }
      renderUser(user); 
  } catch (error) {
      console.error(error);
  }
}

function renderUser(user) {
  const profileContainer = document.querySelector('.profile-container');

  const article = document.createElement('article');
  article.innerHTML = `
      <div class="image-progress"></div>
      <img src="" class="profile-image">
      <div class="profile-details">
          <h1>${user.name} <span class="age">${user.age}</span></h1>
          <p class="bio"><i class="fas fa-search"></i> ${user.bio}</p>
      </div>
      <div class="choice nope">NOPE</div>
      <div class="choice like">LIKE</div>
  `;

  const previousCard = profileContainer.querySelector('article');
    if (previousCard) {
        previousCard.style.visibility = 'hidden'; 
    }

    article.style.visibility = 'hidden';  
    profileContainer.appendChild(article);
    loadUserPhotos(user.id, article);

    setTimeout(() => {
        article.style.visibility = 'visible';
        article.style.transition = 'transform 0.3s ease-in';
        article.style.transform = 'translateX(0)';
    }, 100);
}

async function loadUserPhotos(userId, article) {
  try {
      const response = await fetch(`http://20.90.161.106:3000/photos/${userId}`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem("token")}`
          }
      });

      if (!response.ok) throw new Error('Error al obtener las fotos');

      const photos = await response.json();
      console.log('Fotos obtenidas:', photos);

      const images = photos.length > 0 ? photos.map(photo => photo.photo_url) : ['images/default.png'];
      let currentIndex = 0;

      const profileImage = article.querySelector('.profile-image');
      profileImage.src = images[currentIndex];

      generateProgressBars(article, images.length);
      updateProgress(article, currentIndex, images);
      
      article.style.visibility = 'visible';

      article.addEventListener('click', (event) => {
        const containerWidth = article.clientWidth;
        const clickX = event.clientX;
  
        if (clickX > containerWidth / 2) {
          currentIndex = (currentIndex + 1) % images.length;
        } else {
          currentIndex = (currentIndex - 1 + images.length) % images.length;
        }
  
        profileImage.src = images[currentIndex];
        updateProgress(article, currentIndex, images);
      });
  } catch (error) {
      console.error(error);
  }
}

function generateProgressBars(article, imageCount) {
  const progressContainer = article.querySelector('.image-progress');
  progressContainer.innerHTML = '';

  for (let i = 0; i < imageCount; i++) {
      const progressBar = document.createElement('div');
      progressBar.classList.add('progress-bar');
      const fill = document.createElement('div');
      fill.classList.add('fill');
      progressBar.appendChild(fill);
      progressContainer.appendChild(progressBar);
  }
}

function updateProgress(article, currentIndex, images) {
  const progressBars = article.querySelectorAll('.progress-bar .fill');
  progressBars.forEach((bar, index) => {
      bar.style.width = index === currentIndex ? "100%" : "0%";
  });

  const profileImage = article.querySelector('.profile-image');
  profileImage.src = images[currentIndex];
}

document.querySelector('.action.dislike').addEventListener('click', () => handleSwipe(false));
document.querySelector('.action.likes').addEventListener('click', () => handleSwipe(true));

function handleSwipe(isLike) {
    if (isAnimating) return; 

    const actualCard = document.querySelector('.profile-container article');
    if (!actualCard) return;

    isAnimating = true;
    const direction = isLike ? 'go-right' : 'go-left';
    const choiceEl = actualCard.querySelector(isLike ? '.choice.like' : '.choice.nope');

    if (choiceEl) {
        choiceEl.style.opacity = 1;
    }

    actualCard.style.transition = 'transform 0.4s ease-out';
    actualCard.style.transform = `translateX(${isLike ? 900 : -900}px) rotate(${isLike ? 30 : -30}deg)`;

    setTimeout(() => {
        actualCard.remove();
        loadNextUser();
        isAnimating = false;
    }, 600);
}


