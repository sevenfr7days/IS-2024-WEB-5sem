(function() {
    window.addEventListener('load', () => {
        const loadTime = window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart;
        const footer = document.querySelector('footer');
        if (footer) {
            const stats = document.createElement('div');
            stats.textContent = `Load time: ${loadTime} ms`;
            stats.style.fontSize = 'small';
            stats.style.position = 'absolute'
            stats.style.bottom = '10px';
            footer.appendChild(stats);
        }
    });
})();

document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll('.navigation a').forEach(link => {
        const href = link.getAttribute('href').split("/").pop();
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
});


