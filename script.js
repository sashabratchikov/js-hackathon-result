// функции, генерирующие элементы
const createTableRow = (item) => {
  const content = document.querySelector('#table-row').content.cloneNode(true);

  content.querySelector('.table__data-country').textContent = item.countryRegion;
  content.querySelector('.table__data-confirmed').textContent = item.confirmed;
  content.querySelector('.table__data-deaths').textContent = item.deaths;
  content.querySelector('.table__data-recovered').textContent = item.recovered;

  return content;
};

const createDiagramRow = (item) => {
  const content = document.querySelector('#diagram-row').content.cloneNode(true);

  const deathPercentage = `${(item.deaths / item.confirmed * 100).toFixed(1)}%`;
  const recoverPercentage = `${(item.recovered / item.confirmed * 100).toFixed(1)}%`;

  content.querySelector('.diagram__country').textContent = item.countryRegion;
  content.querySelector('.diagram__data_type_dead').textContent = deathPercentage;
  content.querySelector('.diagram__data_type_healed').textContent = recoverPercentage;
  content.querySelector('.diagram__visualisation_type_dead').style.width = deathPercentage;
  content.querySelector('.diagram__visualisation_type_healed').style.width = recoverPercentage;

  return content;
};

// вспомогательные функции
const process = (arr) => {
  const grouped = arr.reduce((res, current) => {
    const { countryRegion, confirmed, deaths, recovered } = current;

    if (!res[countryRegion]) {
      res[countryRegion] = { countryRegion, confirmed, deaths, recovered };
      return res;
    }

    res[countryRegion].confirmed += confirmed;
    res[countryRegion].deaths += deaths;
    res[countryRegion].recovered += recovered;

    return res;
  }, {});

  return Object.values(grouped);
};

const debounce = (f, ms, executing = false) => (...args) => {
  if (executing) {
    return;
  }

  f.call(null, ...args);
  executing = true;
  setTimeout(() => { executing = false }, ms);
};

// рачёты и работа с DOM
document.addEventListener('DOMContentLoaded', function () {
  const ratingTable = document.querySelector('.rating__table');
  const totatalNumberContainer = document.querySelector('.total__number');
  const diagramContainer = document.querySelector('.diagram');
  const header = document.querySelector('.page__header');
  const headerTotal = document.querySelector('.header__total');

  fetch('https://covid19.mathdro.id/api/confirmed')
    .then(res => res.json())
    .then((data) => {
      const processedData = process(data);
      const sum = processedData.reduce((res, current) => res + current.confirmed, 0);

      // вставляем сумму в DOM
      totatalNumberContainer.textContent = headerTotal.textContent= sum.toLocaleString('ru-RU');

      // вставляем элементы таблицы в DOM
      ratingTable.append(
        ...processedData
          .sort((a, b) => b.confirmed - a.confirmed)
          .slice(0, 10)
          .map(createTableRow)
      );

      // вставляем графики в DOM
      diagramContainer.append(
        ...processedData
          .filter(item => item.confirmed > 100)
          .sort((a, b) => (b.deaths / b.confirmed) - (a.deaths / a.confirmed))
          .slice(0, 20)
          .map(createDiagramRow)
      );
    });

  // следим за скроллом
  // разъяснение про debounce:
  window.addEventListener('scroll', debounce(function () {
    if (window.pageYOffset > 300) {
      header.style.top = 0;
      return;
    }

    header.style.top = '-60px';
  }, 20));
});
