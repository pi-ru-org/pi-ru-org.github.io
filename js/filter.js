document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchIcon = document.getElementById('search-icon');
  const clearIcon = document.getElementById('clear-icon');
  const searchIconBtn = document.getElementById('search-icon-btn');
  const tagFilters = document.querySelectorAll('.tag-filter');
  const tagItems = document.querySelectorAll('.tag-item');
  const posts = document.querySelectorAll('.post-item');
  const filterStatus = document.getElementById('filter-status');
  const filterStatusText = document.getElementById('filter-status-text');
  const filterReset = document.getElementById('filter-reset');
  const emptyState = document.getElementById('empty-state');
  const emptyReset = document.getElementById('empty-reset');
  const siteLogo = document.getElementById('site-logo');
  const paginationNav = document.getElementById('pagination-nav');

  if (!searchInput) return;

  let activeFilter = { type: null, value: null };
  let selectedResultIndex = -1;

  // Collect all tags
  const allTags = new Set();
  posts.forEach(post => {
    const tags = post.dataset.tags ? post.dataset.tags.split(',') : [];
    tags.forEach(tag => { if (tag) allTags.add(tag); });
  });

  // Update search icon
  function updateSearchIcon() {
    const hasValue = searchInput.value.length > 0;
    if (searchIcon && clearIcon) {
      searchIcon.classList.toggle('hidden', hasValue);
      clearIcon.classList.toggle('hidden', !hasValue);
    }
  }

  // Count visible posts
  function countVisiblePosts() {
    return Array.from(posts).filter(p => p.style.display !== 'none').length;
  }

  // Format count text
  function formatCount(count) {
    if (count === 1) return '1 публикация';
    if (count >= 2 && count <= 4) return `${count} публикации`;
    return `${count} публикаций`;
  }

  // Show filter status
  function showFilterStatus(type, value, displayValue) {
    activeFilter = { type, value };

    const count = countVisiblePosts();
    let text = '';

    if (type === 'tag') {
      text = `${formatCount(count)} по тегу <strong>${displayValue}</strong>`;
    } else if (type === 'text') {
      text = `${formatCount(count)} по запросу <strong>${displayValue}</strong>`;
    } else if (type === 'date') {
      text = `${formatCount(count)} <strong>${displayValue}</strong>`;
    }

    if (filterStatus && filterStatusText) {
      filterStatusText.innerHTML = text;
      filterStatus.classList.remove('hidden');
    }

    if (paginationNav) paginationNav.classList.add('hidden');
  }

  // Hide filter status
  function hideFilterStatus() {
    activeFilter = { type: null, value: null };

    if (filterStatus) filterStatus.classList.add('hidden');
    if (paginationNav) paginationNav.classList.remove('hidden');
  }

  // Check empty state
  function checkEmptyState() {
    const visiblePosts = countVisiblePosts();

    if (emptyState) {
      if (visiblePosts === 0 && activeFilter.type) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }
  }

  // Reset all filters
  function resetFilters() {
    activeFilter = { type: null, value: null };
    selectedResultIndex = -1;

    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.classList.add('hidden');

    posts.forEach(post => post.style.display = 'block');

    hideFilterStatus();
    updateTagButtons('');
    updateSearchIcon();
    checkEmptyState();

    const calendarLabel = document.getElementById('calendar-label');
    if (calendarLabel) calendarLabel.textContent = 'Все даты';
  }

  // Filter by tag
  function filterByTag(tag) {
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.classList.add('hidden');
    updateSearchIcon();

    const lowerTag = tag ? tag.toLowerCase() : '';
    posts.forEach(post => {
      const postTags = post.dataset.tags ? post.dataset.tags.toLowerCase().split(',') : [];
      post.style.display = (!tag || postTags.includes(lowerTag)) ? 'block' : 'none';
    });

    updateTagButtons(tag);

    if (tag) {
      showFilterStatus('tag', tag, tag);
    } else {
      hideFilterStatus();
    }

    checkEmptyState();
  }

  // Filter by text
  function filterByText(query) {
    updateTagButtons('');
    if (searchResults) searchResults.classList.add('hidden');

    const lowerQuery = query.toLowerCase();
    posts.forEach(post => {
      const text = post.textContent.toLowerCase();
      post.style.display = text.includes(lowerQuery) ? 'block' : 'none';
    });

    showFilterStatus('text', query, query);
    checkEmptyState();
  }

  // Filter by date (called from calendar.js)
  window.filterByDateWithStatus = function(dateKey, displayDate) {
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.classList.add('hidden');
    updateTagButtons('');
    updateSearchIcon();

    posts.forEach(post => {
      if (!dateKey) {
        post.style.display = 'block';
        return;
      }
      post.style.display = post.dataset.date === dateKey ? 'block' : 'none';
    });

    if (dateKey) {
      showFilterStatus('date', dateKey, displayDate);
    } else {
      hideFilterStatus();
    }

    checkEmptyState();
  };

  // Global reset
  window.resetAllFilters = resetFilters;

  // Update tag buttons
  function updateTagButtons(tag) {
    const lowerTag = tag ? tag.toLowerCase() : '';
    tagFilters.forEach(btn => {
      const isActive = btn.dataset.tag.toLowerCase() === lowerTag;

      if (!btn.classList.contains('rounded-full')) {
        btn.classList.toggle('font-medium', isActive);
        btn.classList.toggle('text-stone-900', isActive);
        btn.classList.toggle('dark:text-stone-100', isActive);
        btn.classList.toggle('text-stone-600', !isActive);
        btn.classList.toggle('dark:text-stone-400', !isActive);
      } else {
        if (isActive) {
          btn.classList.add('bg-stone-900', 'text-white', 'dark:bg-stone-100', 'dark:text-stone-900');
          btn.classList.remove('bg-stone-200', 'text-stone-700', 'dark:bg-stone-700', 'dark:text-stone-300');
        } else {
          btn.classList.remove('bg-stone-900', 'text-white', 'dark:bg-stone-100', 'dark:text-stone-900');
          btn.classList.add('bg-stone-200', 'text-stone-700', 'dark:bg-stone-700', 'dark:text-stone-300');
        }
      }
    });
  }

  // Highlight search result
  function highlightResult(index) {
    const items = searchResults.querySelectorAll('.search-result-item');
    items.forEach((item, i) => {
      item.classList.toggle('bg-stone-100', i === index);
      item.classList.toggle('dark:bg-stone-700', i === index);
    });
    selectedResultIndex = index;
  }

  // Search input
  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.trim();
    updateSearchIcon();
    selectedResultIndex = -1;

    if (query.length < 2) {
      searchResults.classList.add('hidden');
      if (query.length === 0) resetFilters();
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = [];

    allTags.forEach(tag => {
      if (tag.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'tag', value: tag });
      }
    });

    results.push({ type: 'text', value: query });

    searchResults.innerHTML = results.map((r, i) => {
      const baseClass = 'search-result-item block w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer';
      if (r.type === 'tag') {
        return `<div class="${baseClass}" data-type="tag" data-value="${r.value}" data-index="${i}">
          <span class="text-stone-400 dark:text-stone-500">Тег:</span> ${r.value}
        </div>`;
      } else {
        return `<div class="${baseClass}" data-type="text" data-value="${r.value}" data-index="${i}">
          <span class="text-stone-400 dark:text-stone-500">Искать:</span> "${r.value}"
        </div>`;
      }
    }).join('');

    searchResults.classList.remove('hidden');

    // Click handlers
    searchResults.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        selectResult(item);
      });
      item.addEventListener('mouseenter', () => {
        highlightResult(parseInt(item.dataset.index));
      });
    });
  });

  // Select result
  function selectResult(item) {
    const type = item.dataset.type;
    const value = item.dataset.value;

    if (type === 'tag') {
      filterByTag(value);
      searchInput.value = '';
    } else {
      filterByText(value);
      searchInput.value = value;
    }
    searchResults.classList.add('hidden');
    updateSearchIcon();
  }

  // Keyboard navigation
  searchInput.addEventListener('keydown', function(e) {
    const items = searchResults.querySelectorAll('.search-result-item');
    if (items.length === 0 || searchResults.classList.contains('hidden')) {
      if (e.key === 'Enter' && searchInput.value.trim().length >= 2) {
        filterByText(searchInput.value.trim());
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = selectedResultIndex < items.length - 1 ? selectedResultIndex + 1 : 0;
      highlightResult(newIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = selectedResultIndex > 0 ? selectedResultIndex - 1 : items.length - 1;
      highlightResult(newIndex);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedResultIndex >= 0 && items[selectedResultIndex]) {
        selectResult(items[selectedResultIndex]);
      } else {
        // Default to text search
        filterByText(searchInput.value.trim());
        searchResults.classList.add('hidden');
      }
    } else if (e.key === 'Escape') {
      searchResults.classList.add('hidden');
      selectedResultIndex = -1;
    }
  });

  // Clear button click
  if (searchIconBtn) {
    searchIconBtn.addEventListener('click', () => {
      if (searchInput.value.length > 0) {
        resetFilters();
      }
    });
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.add('hidden');
      selectedResultIndex = -1;
    }
  });

  // Tag filter clicks
  tagFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      filterByTag(btn.dataset.tag);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Tag item clicks
  tagItems.forEach(item => {
    item.addEventListener('click', () => {
      filterByTag(item.dataset.tag);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Reset buttons
  if (filterReset) filterReset.addEventListener('click', resetFilters);
  if (emptyReset) emptyReset.addEventListener('click', resetFilters);

  // Logo click
  if (siteLogo) {
    siteLogo.addEventListener('click', (e) => {
      if (window.location.pathname === '/') {
        e.preventDefault();
        resetFilters();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
});
