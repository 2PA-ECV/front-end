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
        //loadNextUser();
        
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

const profileImage = document.querySelector('.profile-image');
const imageProgressContainer = document.querySelector('.image-progress');
let currentIndex = 0;
const images = [];
let currentUserId = null

function generateProgressBars() {
  imageProgressContainer.innerHTML = '';
  images.forEach(() => {
    const progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar');
    const fill = document.createElement('div');
    fill.classList.add('fill');
    progressBar.appendChild(fill);
    imageProgressContainer.appendChild(progressBar);
  });
}

function updateProgress() {
  const progressBars = document.querySelectorAll('.progress-bar .fill');
  progressBars.forEach((bar, index) => {
    bar.style.width = index === currentIndex ? "100%" : "0%";
  });
  if (images.length > 0) {
    profileImage.src = images[currentIndex];
  }
}

async function loadUserPhotos(userId) {
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
      
      images.length = 0;
      photos.forEach(photo => {
          images.push(photo.photo_url); 
      });

      generateProgressBars(); 
      updateProgress(); 
  } catch (error) {
      console.error(error);
  }
}


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

      if (!user || !user.id) {
          console.warn("No hay más usuarios disponibles");
          return;
      }

      currentUserId = user.id; 
      loadUserPhotos(currentUserId); 
  } catch (error) {
      console.error(error);
  }
}


document.querySelector('.profile-container').addEventListener('click', (event) => {
  const containerWidth = event.currentTarget.clientWidth;
  const clickX = event.clientX;

  if (clickX > containerWidth / 2) {
      currentIndex = (currentIndex + 1) % images.length;
  } else {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
  }

  profileImage.src = images[currentIndex];
  updateProgress();
});
