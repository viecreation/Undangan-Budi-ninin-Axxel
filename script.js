// Initialize GSAP & ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Initialize AOS
AOS.init({
    duration: 1200,
    once: true,
    easing: 'ease-in-out'
});

// Vanilla Tilt Initialization
const initTilt = () => {
    if (window.VanillaTilt) {
        VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
            max: 10,
            speed: 400,
            glare: true,
            "max-glare": 0.2,
        });
    }
};

// Preloader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        gsap.to(preloader, {
            opacity: 0,
            duration: 0.8,
            onComplete: () => {
                preloader.style.display = 'none';
            }
        });
    }
});

// Cover Logic (Buka Undangan)
const btnOpen = document.getElementById('btn-open');
const cover = document.getElementById('cover');
const mainInvitation = document.getElementById('main-invitation');
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
let isMusicPlaying = false;

if (btnOpen) {
    btnOpen.addEventListener('click', () => {
        // Unlock body scroll
        document.body.classList.remove('is-locked');
        
        // Hide cover
        cover.classList.add('is-opened');
        
        // Show main content with delay
        setTimeout(() => {
            mainInvitation.classList.add('show');
            initTilt();
            
            // Auto play music
            if (bgMusic) {
                bgMusic.play().then(() => {
                    isMusicPlaying = true;
                    musicToggle.classList.add('rotating');
                }).catch(e => console.log("Auto-play blocked by browser."));
            }
            
            // GSAP Animations for Hero
            gsap.from(".hero-name", { y: 50, opacity: 0, duration: 1.5, delay: 0.5, ease: "power4.out" });
            gsap.from(".hero-frame", { scale: 0.8, opacity: 0, duration: 1.5, delay: 0.8, ease: "back.out(1.7)" });

            // GSAP for Gallery Stagger
            gsap.from(".masonry-item", {
                scrollTrigger: {
                    trigger: "#gallery-grid",
                    start: "top 80%",
                },
                y: 100,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power3.out"
            });
        }, 300);
    });
}

// Music Control
if (musicToggle && bgMusic) {
    musicToggle.addEventListener('click', () => {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicToggle.classList.remove('rotating');
        } else {
            bgMusic.play();
            musicToggle.classList.add('rotating');
        }
        isMusicPlaying = !isMusicPlaying;
    });
}

// Navbar Scroll Effect
const mainNav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        mainNav.classList.add('scrolled');
    } else {
        mainNav.classList.remove('scrolled');
    }
});

// Smooth Scroll & Auto-Close Drawer
const navLinks = document.querySelectorAll('.nav-link');
const offcanvasElement = document.getElementById('offcanvasNavbar');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Find Bootstrap Offcanvas Instance
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
        if (bsOffcanvas) {
            bsOffcanvas.hide();
        }
        
        // Smooth Scroll handling
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
            e.preventDefault();
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                const offset = 80;
                const elementPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Countdown Timer
const targetDate = new Date('May 30, 2026 00:00:00').getTime();

const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const dEl = document.getElementById('days');
    const hEl = document.getElementById('hours');
    const mEl = document.getElementById('minutes');
    const sEl = document.getElementById('seconds');

    if (dEl) dEl.innerText = days < 10 ? '0' + days : days;
    if (hEl) hEl.innerText = hours < 10 ? '0' + hours : hours;
    if (mEl) mEl.innerText = minutes < 10 ? '0' + minutes : minutes;
    if (sEl) sEl.innerText = seconds < 10 ? '0' + seconds : seconds;

    if (distance < 0) {
        clearInterval(timerInterval);
        const countdownGrid = document.querySelector('.row.justify-content-center.mb-5.g-3');
        if (countdownGrid) countdownGrid.innerHTML = "<h3 class='text-primary w-100 font-serif'>Acara Telah Berlangsung</h3>";
    }
};

const timerInterval = setInterval(updateCountdown, 1000);
updateCountdown();

// Guestbook Functionality
const guestbookForm = document.getElementById('guestbook-form');
const ucapanList = document.getElementById('ucapan-list');

let messages = JSON.parse(localStorage.getItem('khitan_premium_messages')) || [];

const renderMessages = () => {
    if (!ucapanList) return;
    ucapanList.innerHTML = '';
    
    const sortedMessages = [...messages].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedMessages.forEach((msg) => {
        const item = document.createElement('div');
        item.className = 'msg-bubble mb-3';
        item.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-bold text-primary font-serif h5 mb-0">${msg.nama}</span>
                <span class="badge rounded-pill ${msg.status === 'Hadir' ? 'bg-success' : 'bg-secondary'} opacity-75">${msg.status === 'Hadir' ? 'Hadir' : 'Absen'}</span>
            </div>
            <p class="mb-0 text-dark opacity-75 small">"${msg.ucapan}"</p>
        `;
        ucapanList.appendChild(item);
    });
    AOS.refresh();
};

if (guestbookForm) {
    guestbookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nama = document.getElementById('nama').value;
        const ucapan = document.getElementById('ucapan').value;
        const status = document.querySelector('input[name="kehadiran"]:checked').value;

        const newMessage = {
            nama,
            ucapan,
            status,
            date: new Date().toISOString()
        };

        messages.push(newMessage);
        localStorage.setItem('khitan_premium_messages', JSON.stringify(messages));
        
        renderMessages();
        guestbookForm.reset();
        
        // Premium SweetAlert2 feedback
        if (window.Swal) {
            Swal.fire({
                title: 'Terima Kasih!',
                text: 'Ucapan & doa Anda telah terkirim.',
                icon: 'success',
                confirmButtonColor: '#5B8FB9',
                background: '#F0F5F9',
                borderRadius: '25px'
            });
        }
    });
}

// Initial render
renderMessages();

// Fancybox Initialization
if (window.Fancybox) {
    Fancybox.bind("[data-fancybox]", {
        // Custom options
        dragToClose: false,
        Toolbar: {
            display: {
                left: ["infobar"],
                middle: [],
                right: ["iterateZoom", "slideshow", "fullScreen", "download", "thumbs", "close"],
            },
        },
    });
}

// Set Guest Name from URL if exists (e.g. ?to=Budi)
const urlParams = new URLSearchParams(window.location.search);
const toGuest = urlParams.get('to');
if (toGuest) {
    const guestEl = document.getElementById('guest-name');
    if (guestEl) guestEl.innerText = toGuest;
}