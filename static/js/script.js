document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM
    const initialCountdown = document.getElementById('initial-countdown');
    const initialSecondsElement = document.getElementById('initial-seconds');
    const mainContent = document.getElementById('main-content');
    const countdownContainer = document.getElementById('countdown-container');
    const birthdayMessage = document.getElementById('birthday-message');
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const fireworksCanvas = document.getElementById('fireworks-canvas');
    const toggleFireworksBtn = document.getElementById('toggle-fireworks');
    const toggleConfettiBtn = document.getElementById('toggle-confetti');
    const playMusicBtn = document.getElementById('play-music');
    const restartInitialCountdownBtn = document.getElementById('restart-initial-countdown');
    const downloadCardBtn = document.getElementById('download-card-btn');
    const birthdayMusic = document.getElementById('birthday-music');
    const happyBirthdaySound = document.getElementById('happy-birthday-sound');

    // Variables
    let fireworksActive = false;
    let confettiActive = false;
    let musicPlaying = false;
    let countdownInterval;
    let initialCountdownInterval;
    let ctx;
    let particles = [];
    let confettiParticles = [];

    // Initialisation
    function init() {
        // Initialiser le canvas pour les feux d'artifice
        if (fireworksCanvas.getContext) {
            ctx = fireworksCanvas.getContext('2d');
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
        }

        // Démarrer le compte à rebours initial de 5 secondes
        startInitialCountdown();

        // Événements
        toggleFireworksBtn.addEventListener('click', toggleFireworks);
        toggleConfettiBtn.addEventListener('click', toggleConfetti);
        playMusicBtn.addEventListener('click', toggleMusic);
        restartInitialCountdownBtn.addEventListener('click', restartInitialCountdown);

        // Ajouter des confettis initiaux
        createConfetti();
    }

    // Redimensionner le canvas
    function resizeCanvas() {
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
    }

    // Démarrer le compte à rebours initial de 5 secondes
    function startInitialCountdown() {
        let seconds = 5;

        initialCountdownInterval = setInterval(() => {
            initialSecondsElement.textContent = seconds;
            seconds--;

            // Quand le compte à rebours atteint 0
            if (seconds < 0) {
                clearInterval(initialCountdownInterval);

                // Jouer le son de joyeux anniversaire
                playHappyBirthdaySound();

                // Masquer l'écran de compte à rebours initial
                initialCountdown.classList.add('fade-out');

                // Afficher le contenu principal après un court délai
                setTimeout(() => {
                    initialCountdown.style.display = 'none';
                    mainContent.style.display = 'block';

                    // Vérifier si c'est l'anniversaire aujourd'hui
                    checkIfAnniversaryToday();

                    // Démarrer le compte à rebours principal
                    startMainCountdown();

                    // Démarrer les effets visuels
                    startFireworks();
                    startConfetti();
                }, 500);
            }
        }, 1000);
    }

    // Redémarrer l'animation initiale
    function restartInitialCountdown() {
        // Cacher le contenu principal
        mainContent.style.display = 'none';

        // Réinitialiser et afficher le compte à rebours initial
        initialCountdown.style.display = 'flex';
        initialCountdown.classList.remove('fade-out');

        // Arrêter les effets en cours
        stopFireworks();
        stopConfetti();
        stopBirthdayMusic();

        // Redémarrer le compte à rebours initial
        startInitialCountdown();
    }

    // Jouer le son de joyeux anniversaire
    function playHappyBirthdaySound() {
        happyBirthdaySound.play().catch(error => {
            console.log("Lecture automatique bloquée, l'utilisateur doit interagir d'abord");
        });
    }

    // Vérifier si c'est l'anniversaire aujourd'hui
    async function checkIfAnniversaryToday() {
        try {
            const response = await fetch('/api/is-anniversaire-today');
            const data = await response.json();

            if (data.is_anniversaire_today) {
                showBirthdayMessage();
                playBirthdayMusic();
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de la date:', error);
        }
    }

    // Démarrer le compte à rebours principal
    function startMainCountdown() {
        clearInterval(countdownInterval);

        countdownInterval = setInterval(async () => {
            try {
                const response = await fetch('/api/time-remaining');
                const data = await response.json();

                updateCountdownDisplay(data.days, data.hours, data.minutes, data.seconds);

                // Si le compte à rebours est terminé
                if (data.total_seconds <= 0) {
                    clearInterval(countdownInterval);
                    showBirthdayMessage();
                    playBirthdayMusic();
                }
            } catch (error) {
                console.error('Erreur lors de la récupération du temps restant:', error);
            }
        }, 1000);
    }

    // Mettre à jour l'affichage du compte à rebours
    function updateCountdownDisplay(days, hours, minutes, seconds) {
        daysElement.textContent = String(days).padStart(2, '0');
        hoursElement.textContent = String(hours).padStart(2, '0');
        minutesElement.textContent = String(minutes).padStart(2, '0');
        secondsElement.textContent = String(seconds).padStart(2, '0');
    }

    // Afficher le message d'anniversaire
    function showBirthdayMessage() {
        birthdayMessage.classList.add('show');
        countdownContainer.style.display = 'none';

        // Animation du gâteau
        const flame = document.querySelector('.flame');
        flame.style.animation = 'flicker 0.5s infinite alternate';
    }

    // Démarrer les feux d'artifice
    function startFireworks() {
        fireworksActive = true;
        toggleFireworksBtn.innerHTML = '<i class="fas fa-fire"></i> Arrêter les feux d\'artifice';
        createFireworks();
        animateFireworks();
    }

    // Arrêter les feux d'artifice
    function stopFireworks() {
        fireworksActive = false;
        toggleFireworksBtn.innerHTML = '<i class="fas fa-fire"></i> Feux d\'artifice';
        particles = [];
    }

    // Basculer l'état des feux d'artifice
    function toggleFireworks() {
        if (fireworksActive) {
            stopFireworks();
        } else {
            startFireworks();
        }
    }

    // Créer des feux d'artifice
    function createFireworks() {
        if (!fireworksActive) return;

        // Créer un nouveau feu d'artifice
        const firework = {
            x: Math.random() * fireworksCanvas.width,
            y: fireworksCanvas.height,
            targetX: Math.random() * fireworksCanvas.width,
            targetY: Math.random() * (fireworksCanvas.height / 2),
            speed: 2 + Math.random() * 2,
            color: getRandomColor(),
            radius: 2,
            exploded: false,
            particles: []
        };

        particles.push(firework);

        // Planifier le prochain feu d'artifice
        setTimeout(createFireworks, 500 + Math.random() * 1000);
    }

    // Animer les feux d'artifice
    function animateFireworks() {
        if (!ctx) return;

        // Effacer le canvas avec un fond semi-transparent pour créer un effet de traînée
        ctx.fillStyle = 'rgba(12, 36, 97, 0.1)';
        ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

        // Mettre à jour et dessiner chaque feu d'artifice
        for (let i = particles.length - 1; i >= 0; i--) {
            const firework = particles[i];

            if (!firework.exploded) {
                // Déplacer le feu d'artifice vers sa cible
                const dx = firework.targetX - firework.x;
                const dy = firework.targetY - firework.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                firework.x += (dx / distance) * firework.speed;
                firework.y += (dy / distance) * firework.speed;

                // Dessiner le feu d'artifice
                ctx.beginPath();
                ctx.arc(firework.x, firework.y, firework.radius, 0, Math.PI * 2);
                ctx.fillStyle = firework.color;
                ctx.fill();

                // Vérifier si le feu d'artifice a atteint sa cible
                if (distance < 5) {
                    explodeFirework(firework);
                }
            } else {
                // Mettre à jour et dessiner les particules de l'explosion
                for (let j = firework.particles.length - 1; j >= 0; j--) {
                    const particle = firework.particles[j];

                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.vy += 0.05; // Gravité
                    particle.alpha -= 0.01;

                    // Dessiner la particule
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${particle.color}, ${particle.alpha})`;
                    ctx.fill();

                    // Supprimer la particule si elle est invisible
                    if (particle.alpha <= 0) {
                        firework.particles.splice(j, 1);
                    }
                }

                // Supprimer le feu d'artifice si toutes ses particules ont disparu
                if (firework.particles.length === 0) {
                    particles.splice(i, 1);
                }
            }
        }

        // Animer les confettis
        if (confettiActive) {
            animateConfetti();
        }

        // Continuer l'animation si des feux d'artifice sont actifs
        if (fireworksActive || particles.length > 0 || confettiActive) {
            requestAnimationFrame(animateFireworks);
        }
    }

    // Faire exploser un feu d'artifice
    function explodeFirework(firework) {
        firework.exploded = true;

        // Créer des particules pour l'explosion
        const particleCount = 50 + Math.random() * 50;

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;

            firework.particles.push({
                x: firework.x,
                y: firework.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 1 + Math.random() * 2,
                color: firework.color.replace('rgb(', '').replace(')', ''),
                alpha: 1
            });
        }
    }

    // Obtenir une couleur aléatoire
    function getRandomColor() {
        const colors = [
            'rgb(255, 221, 89)',  // Jaune
            'rgb(255, 159, 26)',  // Orange
            'rgb(255, 107, 107)', // Rouge
            'rgb(116, 185, 255)', // Bleu clair
            'rgb(85, 239, 196)',  // Vert clair
            'rgb(162, 155, 254)', // Violet
            'rgb(253, 121, 168)'  // Rose
        ];

        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Créer des confettis
    function createConfetti() {
        confettiParticles = [];

        for (let i = 0; i < 150; i++) {
            confettiParticles.push({
                x: Math.random() * fireworksCanvas.width,
                y: Math.random() * fireworksCanvas.height - fireworksCanvas.height,
                size: Math.random() * 10 + 5,
                color: getRandomColor(),
                speed: Math.random() * 3 + 1,
                sway: Math.random() * 2 - 1,
                swaySpeed: Math.random() * 0.05 + 0.01
            });
        }
    }

    // Démarrer les confettis
    function startConfetti() {
        confettiActive = true;
        toggleConfettiBtn.innerHTML = '<i class="fas fa-star"></i> Arrêter les confettis';

        if (!fireworksActive) {
            animateFireworks();
        }
    }

    // Arrêter les confettis
    function stopConfetti() {
        confettiActive = false;
        toggleConfettiBtn.innerHTML = '<i class="fas fa-star"></i> Confettis';
    }

    // Basculer l'état des confettis
    function toggleConfetti() {
        if (confettiActive) {
            stopConfetti();
        } else {
            startConfetti();
        }
    }

    // Animer les confettis
    function animateConfetti() {
        for (let i = 0; i < confettiParticles.length; i++) {
            const confetti = confettiParticles[i];

            // Faire tomber le confetti
            confetti.y += confetti.speed;

            // Ajouter un mouvement de balancement
            confetti.x += Math.sin(Date.now() * confetti.swaySpeed) * confetti.sway;

            // Réinitialiser le confetti s'il sort de l'écran
            if (confetti.y > fireworksCanvas.height) {
                confetti.y = -10;
                confetti.x = Math.random() * fireworksCanvas.width;
            }

            // Dessiner le confetti
            ctx.beginPath();
            ctx.rect(confetti.x, confetti.y, confetti.size, confetti.size);
            ctx.fillStyle = confetti.color;
            ctx.fill();

            // Ajouter une rotation visuelle
            ctx.save();
            ctx.translate(confetti.x + confetti.size / 2, confetti.y + confetti.size / 2);
            ctx.rotate(Date.now() * 0.001);
            ctx.fillRect(-confetti.size / 2, -confetti.size / 2, confetti.size, confetti.size);
            ctx.restore();
        }
    }

    // Jouer la musique d'anniversaire
    function playBirthdayMusic() {
        birthdayMusic.play().then(() => {
            musicPlaying = true;
            playMusicBtn.innerHTML = '<i class="fas fa-volume-mute"></i> Couper la musique';
        }).catch(error => {
            console.log('La lecture automatique a été bloquée:', error);
            playMusicBtn.innerHTML = '<i class="fas fa-music"></i> Musique (cliquez pour activer)';
        });
    }

    // Arrêter la musique d'anniversaire
    function stopBirthdayMusic() {
        birthdayMusic.pause();
        birthdayMusic.currentTime = 0;
        musicPlaying = false;
        playMusicBtn.innerHTML = '<i class="fas fa-music"></i> Musique';
    }

    // Basculer l'état de la musique
    function toggleMusic() {
        if (musicPlaying) {
            stopBirthdayMusic();
        } else {
            playBirthdayMusic();
        }
    }

    // Initialiser l'application
    init();
});