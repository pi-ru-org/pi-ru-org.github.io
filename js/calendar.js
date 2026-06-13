document.addEventListener('DOMContentLoaded', function() {
  const posts = document.querySelectorAll('.post-item');
  const calendarLabel = document.getElementById('calendar-label'); // может быть null

  // Экземпляры календаря (десктоп + мобильный). Берём только те, что есть в DOM.
  const instances = [
    { toggle: 'calendar-toggle',        dropdown: 'calendar-dropdown',        grid: 'calendar-grid' },
    { toggle: 'mobile-calendar-toggle', dropdown: 'mobile-calendar-dropdown', grid: 'mobile-calendar-grid' },
  ]
    .map(d => ({
      toggle: document.getElementById(d.toggle),
      dropdown: document.getElementById(d.dropdown),
      grid: document.getElementById(d.grid),
    }))
    .filter(i => i.toggle && i.dropdown && i.grid);

  if (instances.length === 0) return;

  // Даты постов: берём из window.POST_DATES (доступно на всех страницах),
  // иначе — собираем из ленты .post-item (фолбэк).
  let postDates = {};
  if (window.POST_DATES) {
    postDates = window.POST_DATES;
  } else {
    posts.forEach(post => {
      const date = post.dataset.date;
      if (date) postDates[date] = (postDates[date] || 0) + 1;
    });
  }

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  let currentMonth = new Date();
  let selectedDate = new URLSearchParams(location.search).get('date') || null;
  // Если дата выбрана через URL — открыть календарь сразу на нужном месяце
  if (selectedDate) {
    const parts = selectedDate.split('-');
    currentMonth = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
  }

  function formatDate(dateKey) {
    const [year, month, day] = dateKey.split('-');
    const short = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${parseInt(day)} ${short[parseInt(month) - 1]} ${year}`;
  }

  function buildHtml() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    const startDay = (new Date(year, month, 1).getDay() + 6) % 7; // Пн = 0

    let html = `
      <div class="flex items-center justify-between mb-4">
        <button data-nav="prev" class="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded">&larr;</button>
        <span class="font-medium text-sm text-stone-900 dark:text-stone-100">${monthNames[month]} ${year}</span>
        <button data-nav="next" class="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded">&rarr;</button>
      </div>
      <div class="grid grid-cols-7 gap-x-1 gap-y-0 text-center text-xs mb-2">
        <div class="text-stone-400 py-1">Пн</div>
        <div class="text-stone-400 py-1">Вт</div>
        <div class="text-stone-400 py-1">Ср</div>
        <div class="text-stone-400 py-1">Чт</div>
        <div class="text-stone-400 py-1">Пт</div>
        <div class="text-stone-400 py-1">Сб</div>
        <div class="text-stone-400 py-1">Вс</div>
      </div>
      <div class="grid grid-cols-7 gap-x-1 gap-y-1 text-center text-sm">
    `;

    for (let i = 0; i < startDay; i++) html += '<div class="h-10"></div>';

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasPost = postDates[dateKey];
      const isSelected = selectedDate === dateKey;
      let bgClass = isSelected
        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
        : 'hover:bg-stone-100 dark:hover:bg-stone-700';
      html += `
        <div class="h-10 flex flex-col items-center justify-center rounded cursor-pointer ${bgClass}" data-date="${dateKey}">
          <span>${day}</span>
          ${hasPost ? '<span class="w-1.5 h-1.5 bg-blue-500 rounded-full mt-0.5"></span>' : '<span class="w-1.5 h-1.5 mt-0.5"></span>'}
        </div>
      `;
    }

    html += '</div>';
    html += `
      <button data-clear class="mt-4 w-full text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 py-1">
        Сбросить
      </button>
    `;
    return html;
  }

  function renderGrid(grid) {
    grid.innerHTML = buildHtml();

    grid.querySelector('[data-nav="prev"]').addEventListener('click', (e) => {
      e.stopPropagation();
      currentMonth.setMonth(currentMonth.getMonth() - 1);
      renderGrid(grid);
    });
    grid.querySelector('[data-nav="next"]').addEventListener('click', (e) => {
      e.stopPropagation();
      currentMonth.setMonth(currentMonth.getMonth() + 1);
      renderGrid(grid);
    });
    grid.querySelector('[data-clear]').addEventListener('click', (e) => {
      e.stopPropagation();
      selectDate(null);
    });
    grid.querySelectorAll('[data-date]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectDate(el.dataset.date);
      });
    });
  }

  function renderAll() { instances.forEach(i => renderGrid(i.grid)); }
  function closeAll() { instances.forEach(i => i.dropdown.classList.add('hidden')); }

  function filterByDate(dateKey) {
    const displayDate = dateKey ? formatDate(dateKey) : null;
    if (window.filterByDateWithStatus) {
      window.filterByDateWithStatus(dateKey, displayDate);
    } else {
      posts.forEach(post => {
        post.style.display = (!dateKey || post.dataset.date === dateKey) ? 'block' : 'none';
      });
    }
  }

  function selectDate(dateKey) {
    // На страницах без ленты постов (внутренние) — уходим на главную с фильтром
    if (posts.length === 0) {
      window.location.href = dateKey ? ('/?date=' + dateKey) : '/';
      return;
    }
    selectedDate = dateKey;
    if (calendarLabel) calendarLabel.textContent = dateKey ? formatDate(dateKey) : 'Все даты';
    if (!dateKey && window.resetAllFilters) {
      window.resetAllFilters();
    } else {
      filterByDate(dateKey);
    }
    renderAll();
    closeAll();
    // На мобильном — закрыть панель поиска, чтобы показать отфильтрованную ленту
    const msp = document.getElementById('mobile-search-panel');
    if (msp) msp.classList.add('hidden');
  }

  // Переключатели
  instances.forEach(inst => {
    inst.toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = inst.dropdown.classList.contains('hidden');
      closeAll();
      // Закрыть выпадашки результатов поиска, чтобы не накладывались
      ['search-results', 'mobile-search-results'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
      });
      if (willOpen) {
        inst.dropdown.classList.remove('hidden');
        renderGrid(inst.grid);
      }
    });
  });

  // Закрытие по клику вне
  document.addEventListener('click', (e) => {
    const inside = instances.some(i => i.toggle.contains(e.target) || i.dropdown.contains(e.target));
    if (!inside) closeAll();
  });
});
