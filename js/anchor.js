document.addEventListener('DOMContentLoaded', function() {
  const copyButtons = document.querySelectorAll('.copy-link');

  // Copy link functionality
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const postId = btn.dataset.postId;
      const url = `${window.location.origin}${window.location.pathname}#${postId}`;

      try {
        await navigator.clipboard.writeText(url);

        // Show feedback
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `
          <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        `;

        setTimeout(() => {
          btn.innerHTML = originalHTML;
        }, 1500);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });
  });

  // Scroll to post if hash in URL
  if (window.location.hash) {
    const targetId = window.location.hash.slice(1);
    const targetPost = document.getElementById(targetId);
    if (targetPost) {
      setTimeout(() => {
        targetPost.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  // Update internal post links to work with anchors
  document.querySelectorAll('.prose a[href^="#post-"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const targetPost = document.getElementById(targetId);
      if (targetPost) {
        targetPost.scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, '', `#${targetId}`);
      }
    });
  });
});
