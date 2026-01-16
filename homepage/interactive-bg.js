/**
 * Interactive Background Script (Optimized)
 * Uses requestAnimationFrame and Linear Interpolation (Lerp) for smooth, lag-free performance.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Check if bg already exists to prevent duplicates
    if (document.getElementById('interactive-bg')) return;

    // Create background container
    const bg = document.createElement('div');
    bg.id = 'interactive-bg';

    // Create blobs
    const blobsConfig = ['blob-1', 'blob-2', 'blob-3'];
    const blobElements = []; // Cache elements for performance

    blobsConfig.forEach(cls => {
        const blob = document.createElement('div');
        blob.classList.add('blob', cls);
        bg.appendChild(blob);
        blobElements.push(blob);
    });

    // Prepend to body
    document.body.prepend(bg);

    // --- Performance Optimization ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Only update coordinates on mouse move (cheap)
    document.addEventListener('mousemove', (e) => {
        // Normalized coordinates (-0.5 to 0.5)
        targetX = (e.clientX / window.innerWidth) - 0.5;
        targetY = (e.clientY / window.innerHeight) - 0.5;
    });

    // Animation Loop (60fps)
    function animate() {
        // Smooth Lerp: Move current towards target by 5% each frame
        // This acts as a dampener, removing jitter and lag
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        blobElements.forEach((blob, index) => {
            // Parallax intensity based on index
            const depth = (index + 1) * 40;
            const x = mouseX * depth;
            const y = mouseY * depth;

            // Use translate3d to force hardware acceleration
            blob.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });

        requestAnimationFrame(animate);
    }

    // Start Loop
    animate();
});
