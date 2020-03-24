// Функция, генерирующая разметку строки таблицы из задания 2.
// Принимает объект страны, возвращает строку
const createTableRow = (item) => `
  <tr class="table__row">
    <td class="table__data">${item.countryRegion}</td>
    <td class="table__data">${item.confirmed.toLocaleString('ru-RU')}</td>
    <td class="table__data">${item.deaths.toLocaleString('ru-RU')}</td>
    <td class="table__data">${item.recovered.toLocaleString('ru-RU')}</td>
  </tr>
`;

// Функция, генерирующая разметку с диаграммами из задания 3.
// Принимает объект страны, возвращает строку
const createDiagramRow = (item) => {
  const deathPercentage = (item.deaths / item.confirmed * 100).toFixed(1);
  const healedPercentage = (item.recovered / item.confirmed * 100).toFixed(1);

  return `
    <div class="diagram">
      <div class="diagram__row">
      <div class="diagram__caption">
        <p class="diagram__country">${item.countryRegion}</p>
        <p class="diagram__analytics">
          Смертность
          <span class="diagram__data diagram__data_type_dead">${deathPercentage}%</span> |
            Вылечилось
          <span class="diagram__data diagram__data_type_healed">${healedPercentage}%</span>
        </p>
      </div>
      <div class="diagram__line">
        <div class="diagram__visualisation diagram__visualisation_type_healed" style="width: ${healedPercentage}%;"></div>
        <div class="diagram__visualisation diagram__visualisation_type_dead" style="width: ${deathPercentage}%;"></div>
      </div>
    </div>
  `;
};

// Некоторые из вас заметили, что Китай присутствует в массиве
// несколько раз (в виде разных провинций). Такие данные следовало
// агрегировать. Функция process как раз для этого.

const process = (arr) => {
  // Cделаем из масива объект вида:

  // {
  //   China: { ... },
  //   US: { ... },
  //   Russia: { ... },
  //   ...
  // }

  // сохраним его в переменной grouped
  const grouped = arr.reduce((res, current) => {
    // Такой способ достать свойства из объекта называется деструктуризация
    // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
    const { countryRegion, confirmed, deaths, recovered } = current;

    // Если в результирующем объекте ещё нет такой страны,
    // запишем необходимые данные по ключу
    if (!res[countryRegion]) {
      res[countryRegion] = { countryRegion, confirmed, deaths, recovered };
      return res;
    }

    // Иначе прибавим данные свойствам уже имеющегося объекта
    res[countryRegion].confirmed += confirmed;
    res[countryRegion].deaths += deaths;
    res[countryRegion].recovered += recovered;

    return res;
  }, {});

  // Сделаем из значений получившегося объекта res массив,
  // так как в дальнейшем нам нужен именно массив
  return Object.values(grouped);
};

// Все манипуляции с DOM добавим внутрь обработчика DOMContentLoaded.
// Это гарантирует корректную работу вне зависимости от того в каком
// месте index.html мы подключили script.js
document.addEventListener('DOMContentLoaded', function () {
  const ratingTable = document.querySelector('.rating__table');
  const totatalNumberContainer = document.querySelector('.total__number');
  const diagramContainer = document.querySelector('.diagram');
  const header = document.querySelector('.page__header');
  const headerTotal = document.querySelector('.header__total');

  const processedData = process(data);
  const sum = processedData.reduce((res, current) => res + current.confirmed, 0);

  // Вставляем сумму в DOM, предварительно отформатировав её
  totatalNumberContainer.textContent = headerTotal.textContent= sum.toLocaleString('ru-RU');

  // Вставляем элементы таблицы в DOM
  processedData
    .sort((a, b) => b.confirmed - a.confirmed)
    .slice(0, 10)
    .forEach((item) => {
      ratingTable.insertAdjacentHTML('beforeend', createTableRow(item));
    });

  // Вставляем графики в DOM
  processedData
    .filter(item => item.confirmed > 100)
    .sort((a, b) => (b.deaths / b.confirmed) - (a.deaths / a.confirmed))
    .slice(0, 3)
    .forEach((item) => {
      diagramContainer.insertAdjacentHTML('beforeend', createDiagramRow(item));
    });

  // Cледим за скроллом. В данном случае переданная функция
  // будет вызываться при каждом срабатывании события 'scroll'.
  // Это не очень хорошо, так как событие срабатывает часто — каждые 4мс.
  // Чтобы функция вызывалась реже, чем срабатывает scroll event
  // применяют специальный метод — throttling.

  // Это не самая простая тема, поэтому я не привожу код здесь.
  // Если хотите разобраться, вот несколько ссылок, которые помогут:

  // https://medium.com/nuances-of-programming/что-такое-throttling-и-debouncing-4f0a839769ef
  // https://www.sitepoint.com/throttle-scroll-events/
  // https://learn.javascript.ru/task/throttle

  // Код без применения throttle
  window.addEventListener('scroll', function () {
    if (window.pageYOffset > 300) {
      header.style.top = 0;
      return;
    }

    header.style.top = '-60px';
  });
});
