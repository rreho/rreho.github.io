fetch('publications.html')
  .then(res => res.text())
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const refItems = Array.from(doc.querySelectorAll('ol > li'));

    const refMap = {};
    refItems.forEach((li, i) => {
      if (li.id) refMap[li.id] = i + 1;
    });

    document.querySelectorAll('.citation').forEach(el => {
      const refId = el.dataset.ref;
      if (refMap[refId]) {
        el.innerHTML = `<a href="publications.html#${refId}" target="_blank">[${refMap[refId]}]</a>`;
      } else {
        el.textContent = `[?]`;
      }
    });
  });
