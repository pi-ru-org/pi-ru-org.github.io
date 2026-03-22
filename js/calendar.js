document.addEventListener('DOMContentLoaded', function() {
  const calendarToggle = document.getElementById('calendar-toggle');
  const calendarDropdown = document.getElementById('calendar-dropdown');
  const calendarGrid = document.getElementById('calendar-grid');
  const calendarLabel = document.getElementById('calendar-label'); // может быть null
  const posts = document.querySelectorAll('.post-item');

  if (!calendarToggle) return;

  // Collect post dates
  const postDates = {};
  posts.forEach(post => {
    const date = post.dataset.date;
    if (date) {
      postDates[date] = (postDates[date] || 0) + 1;
    }
  });

  let currentMonth = new Date();
  let selectedDate = null;

  function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = (firstDay.getDay() + 6) % 7; // Monday = 0

    let html = `
      <div class="flex items-center justify-between mb-4">
        <button id="prev-month" class="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded">&larr;</button>
        <span class="font-medium text-sm text-stone-900 dark:text-stone-100">${monthNames[month]} ${year}</span>
        <button id="next-month" class="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded">&rarr;</button>
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

    // Empty cells before first day
    for (let i = 0; i < startDay; i++) {
      html += '<div class="h-10"></div>';
    }

    // Days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasPost = postDates[dateKey];
      const isSelected = selectedDate === dateKey;

      let bgClass = 'hover:bg-stone-100 dark:hover:bg-stone-700';
      if (isSelected) {
        bgClass = 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900';
      }

      html += `
        <div class="h-10 flex flex-col items-center justify-center rounded cursor-pointer ${bgClass}" data-date="${dateKey}">
          <span>${day}</span>
          ${hasPost ? '<span class="w-1.5 h-1.5 bg-blue-500 rounded-full mt-0.5"></span>' : '<span class="w-1.5 h-1.5 mt-0.5"></span>'}
        </div>
      `;
    }

    html += '</div>';

    // Clear button
    html += `
      <button id="clear-date" class="mt-4 w-full text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 py-1">
        Сбросить
      </button>
    `;

    calendarGrid.innerHTML = html;

    // Event listeners
    document.getElementById('prev-month').addEventListener('click', (e) => {
      e.stopPropagation();
      currentMonth.setMonth(currentMonth.getMonth() - 1);
      renderCalendar();
    });

    document.getElementById('next-month').addEventListener('click', (e) => {
      e.stopPropagation();
      currentMonth.setMonth(currentMonth.getMonth() + 1);
      renderCalendar();
    });

    document.getElementById('clear-date').addEventListener('click', (e) => {
      e.stopPropagation();
      selectedDate = null;
      if (calendarLabel) calendarLabel.textContent = 'Все даты';
      if (window.resetAllFilters) {
        window.resetAllFilters();
      } else {
        filterByDate(null);
      }
      renderCalendar();
      calendarDropdown.classList.add('hidden');
    });

    calendarGrid.querySelectorAll('[data-date]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedDate = el.dataset.date;
        if (calendarLabel) calendarLabel.textContent = formatDate(selectedDate);
        filterByDate(selectedDate);
        renderCalendar();
        // Закрыть календарь
        calendarDropdown.classList.add('hidden');
      });
    });
  }

  function formatDate(dateKey) {
    const [year, month, day] = dateKey.split('-');
    const monthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
  }

  function filterByDate(dateKey) {
    const displayDate = dateKey ? formatDate(dateKey) : null;

    if (window.filterByDateWithStatus) {
      window.filterByDateWithStatus(dateKey, displayDate);
    } else {
      posts.forEach(post => {
        if (!dateKey) {
          post.style.display = 'block';
          return;
        }
        post.style.display = post.dataset.date === dateKey ? 'block' : 'none';
      });
    }
  }

  // Toggle calendar
  calendarToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    calendarDropdown.classList.toggle('hidden');
    if (!calendarDropdown.classList.contains('hidden')) {
      renderCalendar();
    }
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!calendarToggle.contains(e.target) && !calendarDropdown.contains(e.target)) {
      calendarDropdown.classList.add('hidden');
    }
  });
});
