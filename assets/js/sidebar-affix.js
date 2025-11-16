(() => {
  const sidebar = document.getElementById('essaySidebar');
  const grid    = document.getElementById('essayGrid');
  if (!sidebar || !grid) return;

  const MQ = 900;
  const isDetail = document.body.classList.contains('essay-detail');
  const GAP = isDetail ? 8 : 16;  // tighter on detail pages

  let startPin = 0, endPin = 0, colLeft = 0, colWidth = 0;

  function getNavHeight() {
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--nav-h').trim();
    return cssVar.endsWith('px') ? parseFloat(cssVar) : 60;
  }

  function measure() {
    sidebar.classList.remove('affix', 'affix-end');
    Object.assign(sidebar.style, { position: '', top: '', left: '', width: '' });
    if (window.innerWidth <= MQ) return;

    const gridRect = grid.getBoundingClientRect();
    const sbRect = sidebar.getBoundingClientRect();
    const pageY = window.scrollY || window.pageYOffset;
    const navH = getNavHeight();

    colLeft = sbRect.left;
    colWidth = sbRect.width;
    const gridTopAbs = gridRect.top + pageY;
    const sbHeight = sidebar.offsetHeight;

    startPin = sbRect.top + pageY - navH - GAP;
    const gridBottomAbs = gridTopAbs + grid.offsetHeight;
    endPin = gridBottomAbs - sbHeight - GAP;
    if (endPin < startPin) endPin = startPin + 1;
  }

  function apply() {
    if (window.innerWidth <= MQ) {
      sidebar.classList.remove('affix', 'affix-end');
      Object.assign(sidebar.style, { position: '', top: '', left: '', width: '' });
      return;
    }

    const y = window.scrollY || window.pageYOffset;
    const navH = getNavHeight();

    if (y < startPin) {
      sidebar.classList.remove('affix', 'affix-end');
      Object.assign(sidebar.style, { position: '', top: '', left: '', width: '' });
    } else if (y < endPin) {
      sidebar.classList.add('affix');
      sidebar.classList.remove('affix-end');
      Object.assign(sidebar.style, {
        position: 'fixed',
        top: `${navH + GAP}px`,
        left: `${colLeft}px`,
        width: `${colWidth}px`,
      });
    } else {
      sidebar.classList.remove('affix');
      sidebar.classList.add('affix-end');

      const gridRect = grid.getBoundingClientRect();
      const pageY = window.scrollY || window.pageYOffset;
      const gridTopAbs = gridRect.top + pageY;
      const sbTopAbs = endPin + navH + GAP;
      const topWithinGrid = sbTopAbs - gridTopAbs;

      Object.assign(sidebar.style, {
        position: 'absolute',
        top: `${topWithinGrid}px`,
        left: '',
        width: '',
      });
    }
  }

  measure();
  apply();
  window.addEventListener('scroll', apply, { passive: true });
  window.addEventListener('resize', () => { measure(); apply(); });
  window.addEventListener('load', () => { measure(); apply(); });
})();
