(function () {
  'use strict';

  var GITHUB_USER = 'yusuforcun';

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav-toggle');
  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
      });
    });
  }

  // Header background on scroll
  var header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.style.background = window.scrollY > 50
        ? 'rgba(10, 12, 16, 0.95)'
        : 'rgba(10, 12, 16, 0.85)';
    });
  }

  // GitHub activity: son paylaşımlar
  var activityList = document.getElementById('github-activity-list');
  if (activityList) {
    fetch('https://api.github.com/users/' + GITHUB_USER + '/events/public?per_page=12')
      .then(function (res) { return res.json(); })
      .then(function (events) {
        activityList.innerHTML = '';
        if (!events.length) {
          activityList.innerHTML = '<li class="github-activity-empty">No public activity yet.</li>';
          return;
        }
        var seen = {};
        var count = 0;
        for (var i = 0; i < events.length && count < 8; i++) {
          var e = events[i];
          var repo = e.repo && e.repo.name ? e.repo.name : '';
          var text = '';
          var url = 'https://github.com/' + repo;
          if (e.type === 'PushEvent' && e.payload && e.payload.commits) {
            var msg = e.payload.commits[0] && e.payload.commits[0].message ? e.payload.commits[0].message : 'push';
            text = msg.length > 55 ? msg.slice(0, 52) + '…' : msg;
          } else if (e.type === 'CreateEvent') {
            text = (e.payload.ref_type || 'create') + (e.payload.ref ? ': ' + e.payload.ref : '');
          } else if (e.type === 'WatchEvent') {
            text = 'starred ' + repo;
          } else if (e.type === 'ForkEvent' && e.payload && e.payload.forkee) {
            text = 'forked ' + repo;
          } else {
            text = e.type.replace('Event', '') + ' — ' + repo;
          }
          var key = e.id || repo + text;
          if (seen[key]) continue;
          seen[key] = true;
          count++;
          var time = e.created_at ? timeAgo(e.created_at) : '';
          var li = document.createElement('li');
          li.innerHTML = '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(repo) + '</a> — ' + escapeHtml(text) + (time ? ' <span class="github-activity-time">' + time + '</span>' : '');
          activityList.appendChild(li);
        }
      })
      .catch(function () {
        activityList.innerHTML = '<li class="github-activity-empty">Could not load activity (API limit or network).</li>';
      });
  }

  function timeAgo(iso) {
    var d = new Date(iso);
    var now = new Date();
    var s = Math.floor((now - d) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' hr ago';
    if (s < 2592000) return Math.floor(s / 86400) + ' days ago';
    if (s < 31536000) return Math.floor(s / 2592000) + ' mo ago';
    return Math.floor(s / 31536000) + ' yr ago';
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
