// Charge un fragment HTML dans un élément cible
function loadHTML(file, targetSelector) {
    return fetch(file)
        .then(res => res.text())
        .then(html => {
            document.querySelector(targetSelector).innerHTML = html;
        });
}

// Charge une section (accueil, projets, etc.)
function loadPage(page) {
    return fetch(`sections/${page}.html`)
        .then(res => res.text())
        .then(html => {
            const content = document.querySelector('#content');
            content.innerHTML = html;

            // Coloration Prism pour le contenu chargé dynamiquement
            if (window.Prism) {
                Prism.highlightAll();
            }

            // Initialiser les animations
            initAnimations();

            // Initialiser le menu des commandes si présent
            initCommandesMenu();

            // Initialiser le formulaire de contact si présent
            initContactForm();
        });
}

// Gestion des animations au scroll
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.commande-categorie, .python-module, .scraping-example, .categorie')
        .forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s, transform 0.6s';
            observer.observe(el);
        });
}

// Gestion du menu des commandes
function initCommandesMenu() {
    const categories = document.querySelectorAll('.commande-categorie');
    const links = document.querySelectorAll('.menu-link');

    if (!categories.length || !links.length) return;

    // IntersectionObserver pour mise à jour du menu actif
    const observerCommandes = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                links.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '-100px 0px -100px 0px'
    });

    categories.forEach(categorie => observerCommandes.observe(categorie));
}

// Fonction globale pour clic sur catégories de commandes
function setActiveCategory(categoryId) {
    const links = document.querySelectorAll('.menu-link');
    links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${categoryId}`) {
            link.classList.add('active');
        }
    });

    const targetElement = document.getElementById(categoryId);
    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Gestion du formulaire de contact
function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Merci pour votre message ! Je vous répondrai rapidement.');
        form.reset();
    }, { once: true });
}

// Fonction globale pour copier le code
function copyCode(elementId) {
    const codeElement = document.getElementById(elementId);
    if (!codeElement) return;

    const textArea = document.createElement('textarea');
    textArea.value = codeElement.textContent;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // Animation de confirmation
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copié !';
    btn.style.backgroundColor = '#28a745';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = '';
    }, 2000);
}

// Fonction globale pour ouvrir/fermer les sections pliables
function toggleSection(contentId, header) {
    const content = document.getElementById(contentId);
    if (!content) return;

    const isActive = content.classList.contains('active');
    
    if (isActive) {
        content.classList.remove('active');
        header.classList.remove('active');
    } else {
        content.classList.add('active');
        header.classList.add('active');
    }
}

// Gestion du menu hamburger
function initHamburger() {
    const nav = document.querySelector('nav');
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');

    if (!nav || !navLinks || !hamburger) return;

    function toggleMenu() {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    }

    function closeMenu() {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }

    hamburger.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleMenu();
    });

    document.addEventListener('click', function (event) {
        if (!nav.contains(event.target) && navLinks.classList.contains('active')) {
            closeMenu();
        }
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });

    // Gestion des clics sur les liens du menu (navigation SPA)
    navLinks.querySelectorAll('a[data-page]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) {
                loadPage(page);
                closeMenu();
            }
        });
    });

    // Bouton dans le hero (data-page)
    document.addEventListener('click', function (e) {
        const target = e.target;
        if (target.matches('a[data-page]')) {
            e.preventDefault();
            const page = target.dataset.page;
            if (page) {
                loadPage(page);
            }
        }
    });
}

// Au chargement initial
window.addEventListener('DOMContentLoaded', () => {
    // Charger header et footer, puis initialiser
    Promise.all([
        loadHTML('includes/header.html', '#header'),
        loadHTML('includes/footer.html', '#footer')
    ]).then(() => {
        initHamburger();
        // Charger la page d'accueil par défaut
        return loadPage('accueil');
    });
});
