/* =========================================
   1. SYSTÈME DE PARTICULES (FOND CONNECTÉ - RAYON RÉDUIT)
   ========================================= */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particlesArray;

// Dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Gestion de la souris
let mouse = {
    x: null,
    y: null,
    // MODIFICATION ICI : On divise le calcul par 3 pour réduire le rayon
    radius: ((canvas.height / 80) * (canvas.width / 80)) / 3 
}

window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // MODIFICATION ICI AUSSI (pour que ça reste petit si on redimensionne la fenêtre)
    mouse.radius = ((canvas.height / 80) * (canvas.width / 80)) / 3;
    initParticles();
});

// Création des particules
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() * 1) - 0.5;
        this.speedY = (Math.random() * 1) - 0.5;
        this.color = '#4a90e2';
    }
    update() {
        // Mouvement
        this.x += this.speedX;
        this.y += this.speedY;

        // Rebond sur les bords
        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;

        // INTERACTION SOURIS
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius + this.size) {
            if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                this.x += 3;
            }
            if (mouse.x > this.x && this.x > this.size * 10) {
                this.x -= 3;
            }
            if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                this.y += 3;
            }
            if (mouse.y > this.y && this.y > this.size * 10) {
                this.y -= 3;
            }
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }
}

// Fonction pour dessiner les lignes (Le Réseau)
function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) 
                         + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            
            if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                opacityValue = 1 - (distance / 20000);
                ctx.strokeStyle = 'rgba(74, 144, 226,' + opacityValue + ')';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function initParticles() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 9000;
    for (let i = 0; i < numberOfParticles * 0.5; i++) { 
        particlesArray.push(new Particle());
    }
}

function animateParticles() {
    requestAnimationFrame(animateParticles);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    connect(); 
}

initParticles();
animateParticles();

/* =========================================
   2. TEXTE DE BIO (Séquence de Boot)
   ========================================= */
const bioParagraphs = document.querySelectorAll('.bio-text p');
bioParagraphs.forEach((p, index) => {
    p.style.animationDelay = `${index * 0.2}s`;
});

/* =========================================
   3. SYSTÈME DE TIR (FIX : Retour du flottement)
   ========================================= */
const hitSound = new Audio('assets/hit.mp3'); 
hitSound.volume = 0.2; 

const targets = document.querySelectorAll('.shootable');

targets.forEach(target => {
    target.addEventListener('click', function() {
        try {
            hitSound.currentTime = 0;
            hitSound.play().catch(() => {}); 
        } catch (e) {}

        const targetClass = this.getAttribute('data-target');
        const imageToShake = document.querySelector('.' + targetClass);

        if (imageToShake) {
            imageToShake.classList.remove('shake-active');
            void imageToShake.offsetWidth; 
            imageToShake.classList.add('shake-active');
            
            imageToShake.addEventListener('animationend', () => {
                imageToShake.classList.remove('shake-active');
            }, { once: true });
        }

        this.classList.add('word-clicked');
        setTimeout(() => {
            this.classList.remove('word-clicked');
        }, 200);
    });
});

/* =========================================
   4. APPARITION DES CARTOUCHES (Skills)
   ========================================= */
const cardsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            cardsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.skill-card').forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(50px)";
    card.style.transition = "opacity 0.6s ease, transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    card.style.transitionDelay = `${index * 0.05}s`; 
    cardsObserver.observe(card);
});

/* =========================================
   5. EFFET HACKER SUR LE NOM (Décryptage)
   ========================================= */
const nameElement = document.querySelector('.logo-area h1');
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
let interval = null;

if(nameElement) {
    nameElement.dataset.value = nameElement.innerText;

    nameElement.onmouseover = event => {  
        let iteration = 0;
        clearInterval(interval);
        
        interval = setInterval(() => {
            event.target.innerText = event.target.innerText
                .split("")
                .map((letter, index) => {
                    if(index < iteration) {
                        return event.target.dataset.value[index];
                    }
                    if (event.target.dataset.value[index] === '\n') return '\n';
                    if (event.target.dataset.value[index] === ' ') return ' ';
                    
                    return letters[Math.floor(Math.random() * 26)];
                })
                .join(""); 
            
            if(iteration >= event.target.dataset.value.length){ 
                clearInterval(interval);
            }
            iteration += 1 / 3; 
        }, 30); 
    }
}

/* =========================================
   6. GESTION DES VIDÉOS AU SURVOL
   ========================================= */
const videoCards = document.querySelectorAll('.project-card:has(video)');

videoCards.forEach(card => {
    const video = card.querySelector('video');
    card.addEventListener('mouseenter', () => {
        let playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Lecture automatique bloquée par le navigateur");
            });
        }
    });
    card.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0; 
    });
});

/* =========================================
   7. MODAL PLEIN ÉCRAN AU CLIC (AVEC BOUTON MORE DETAILS)
   ========================================= */
const modal = document.getElementById('video-modal');
const fullScreenVideo = document.getElementById('full-screen-video');
const closeModalBtn = document.querySelector('.close-modal');
const triggers = document.querySelectorAll('.video-trigger'); 
const modalMoreDetailsBtn = document.getElementById('modal-more-details-btn');
let currentTargetModalId = null; // Stocke l'ID du projet en cours

// FONCTION : OUVRIR LE MODAL
triggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {
        // Empêche le clic si on a cliqué sur un bouton à l'intérieur de la carte
        if (e.target.closest('button')) return;

        // 1. Récupérer l'URL de la vidéo
        const videoSource = this.getAttribute('data-video');
        fullScreenVideo.src = videoSource;
        
        // 2. Trouver la modale de détails associée à cette vidéo
        const detailsBtn = this.querySelector('.btn-details-trigger');
        if (detailsBtn) {
            currentTargetModalId = detailsBtn.getAttribute('data-modal');
            if (modalMoreDetailsBtn) modalMoreDetailsBtn.style.display = 'flex';
        } else {
            currentTargetModalId = null;
            if (modalMoreDetailsBtn) modalMoreDetailsBtn.style.display = 'none';
        }
        
        // 3. Afficher et lire
        modal.classList.add('active');
        fullScreenVideo.play();
        fullScreenVideo.volume = 0.8; 
    });
});

// ACTION DU NOUVEAU BOUTON MORE DETAILS DANS LA VIDÉO
if (modalMoreDetailsBtn) {
    modalMoreDetailsBtn.addEventListener('click', () => {
        closeVideoModal(); // Coupe la vidéo
        if (currentTargetModalId) {
            const targetModal = document.getElementById(currentTargetModalId);
            if (targetModal) {
                targetModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
    });
}

// FONCTION : FERMER LE MODAL VIDÉO
function closeVideoModal() {
    modal.classList.remove('active');
    fullScreenVideo.pause();
    fullScreenVideo.src = ""; 
}

closeModalBtn.addEventListener('click', closeVideoModal);

modal.addEventListener('click', (e) => {
    // Ne ferme pas si on clique sur la vidéo ou le bouton details
    if (e.target === modal) {
        closeVideoModal();
    }
});

/* =========================================
   8. GESTION DES DOSSIERS PROJETS (DETAILS)
   ========================================= */
const detailButtons = document.querySelectorAll('.btn-details-trigger');
const closeDetailButtons = document.querySelectorAll('.close-details');
const allModals = document.querySelectorAll('.project-modal');

// 1. OUVRIR LE BON MODAL
detailButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        const modalId = btn.getAttribute('data-modal');
        const modalToOpen = document.getElementById(modalId);
        
        if(modalToOpen) {
            modalToOpen.classList.add('active');
            document.body.style.overflow = 'hidden'; 
        }
    });
});

// 2. FERMER LES MODALS
closeDetailButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        allModals.forEach(m => m.classList.remove('active'));
        document.body.style.overflow = 'auto'; 
    });
});

allModals.forEach(projectModal => {
    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            projectModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});

/* =========================================
   9. SLIDER AVANT / APRÈS (CHROMESTHESIA)
   ========================================= */
const sliderInput = document.getElementById('sliderInput');
const overlayImage = document.querySelector('.overlay-image');
const sliderLine = document.querySelector('.c-slider-line');

if (sliderInput && overlayImage && sliderLine) {
    sliderInput.addEventListener('input', (e) => {
        const sliderValue = e.target.value + "%";
        overlayImage.style.width = sliderValue;
        sliderLine.style.left = sliderValue;
    });
}

/* =========================================
   10. CODE SNIPPET TOGGLE (UNGOR BOK)
   ========================================= */
const btnToggleCode = document.getElementById('btn-toggle-code');
const codeWrapper = document.getElementById('ungor-code-wrapper');
const codeOverlay = document.getElementById('code-overlay');

if (btnToggleCode && codeWrapper) {
    btnToggleCode.addEventListener('click', () => {
        codeWrapper.classList.toggle('expanded');
        const isFrench = document.documentElement.lang === 'fr';
        
        if (codeWrapper.classList.contains('expanded')) {
            btnToggleCode.innerHTML = isFrench ? 'CACHER LE CODE <i class="fa-solid fa-chevron-up"></i>' : 'COLLAPSE CODE <i class="fa-solid fa-chevron-up"></i>';
            codeOverlay.style.opacity = '0';
        } else {
            btnToggleCode.innerHTML = isFrench ? 'VOIR TOUT LE CODE <i class="fa-solid fa-chevron-down"></i>' : 'SEE ALL CODE <i class="fa-solid fa-chevron-down"></i>';
            codeOverlay.style.opacity = '1';
            codeWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
}

/* =========================================
   11. TIMELINE XP BAR (SCROLL PROGRESS)
   ========================================= */
const xpBar = document.getElementById('xp-bar');
const timelineSection = document.querySelector('.timeline');

if (xpBar && timelineSection) {
    window.addEventListener('scroll', () => {
        const sectionTop = timelineSection.offsetTop;
        const sectionHeight = timelineSection.offsetHeight;
        const scrollPosition = window.scrollY + (window.innerHeight / 2);

        if (scrollPosition < sectionTop) {
            xpBar.style.height = '0px';
        } else if (scrollPosition > sectionTop + sectionHeight) {
            xpBar.style.height = '100%';
        } else {
            const distance = scrollPosition - sectionTop;
            const height = Math.min(distance, sectionHeight - 50); 
            xpBar.style.height = `${height}px`;
        }
    });
}

/* =========================================
   12. COPY EMAIL TO CLIPBOARD
   ========================================= */
function copyEmail() {
    const email = "melvyngellee@gmail.com";
    const feedback = document.getElementById('copy-msg');
    
    navigator.clipboard.writeText(email).then(() => {
        feedback.classList.add('active');
        setTimeout(() => {
            feedback.classList.remove('active');
        }, 2000);
    }).catch(err => {
        alert("Email: " + email);
    });
}

/* =========================================
   13. SCROLL SPY (Navigation Active)
   ========================================= */
const sections = document.querySelectorAll("section, footer");
const navLinks = document.querySelectorAll(".hud-link");

const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.3 
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            navLinks.forEach((link) => {
                link.classList.remove("active");
                if (link.getAttribute("href").substring(1) === entry.target.id) {
                    link.classList.add("active");
                }
            });
        }
    });
}, observerOptions);

sections.forEach((section) => {
    observer.observe(section);
});

/* =========================================
   14. MOBILE BIO READ MORE
   ========================================= */
const bioBtn = document.getElementById('bio-toggle-btn');
const bioText = document.querySelector('.bio-text');

if (bioBtn && bioText) {
    bioBtn.addEventListener('click', () => {
        bioText.classList.toggle('expanded');
        const isFrench = document.documentElement.lang === 'fr';

        if (bioText.classList.contains('expanded')) {
            bioBtn.innerHTML = isFrench ? 'VOIR MOINS <i class="fa-solid fa-chevron-up"></i>' : 'SHOW LESS <i class="fa-solid fa-chevron-up"></i>';
        } else {
            bioBtn.innerHTML = isFrench ? 'LIRE LA SUITE <i class="fa-solid fa-chevron-down"></i>' : 'READ MORE <i class="fa-solid fa-chevron-down"></i>';
            document.querySelector('.section-bio').scrollIntoView({ behavior: 'smooth' });
        }
    });
}

/* =========================================
   15. MOBILE CAROUSEL AUTO-SCROLL
   ========================================= */
const carousel = document.querySelector('.bio-images');

if (carousel) {
    let scrollAmount = 0;
    let scrollSpeed = 0.5; 
    let isPaused = false;

    function autoScroll() {
        if (!isPaused && window.innerWidth <= 768) {
            carousel.scrollLeft += scrollSpeed;
            scrollAmount += scrollSpeed;

            if (carousel.scrollLeft >= (carousel.scrollWidth - carousel.clientWidth - 1)) {
                carousel.scrollLeft = 0;
            }
        }
        requestAnimationFrame(autoScroll);
    }

    autoScroll();
    carousel.addEventListener('touchstart', () => { isPaused = true; });
    carousel.addEventListener('touchend', () => { 
        setTimeout(() => { isPaused = false; }, 2000); 
    });
}

/* =========================================
   16. CV SELECTION MODAL
   ========================================= */
const cvTriggers = document.querySelectorAll('.hud-cv-btn, .cv-trigger-link'); 
const cvModal = document.getElementById('cv-choice-modal');
const closeCvBtn = document.querySelector('.close-cv-modal');

if (cvModal) {
    cvTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            cvModal.classList.add('active');
        });
    });

    if (closeCvBtn) {
        closeCvBtn.addEventListener('click', () => {
            cvModal.classList.remove('active');
        });
    }

    cvModal.addEventListener('click', (e) => {
        if (e.target === cvModal) {
            cvModal.classList.remove('active');
        }
    });
}