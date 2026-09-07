'use strict';
(async () => {
    const results = document.querySelector('#results');
    const wait = () => new Promise(resolve => setTimeout(resolve, 100));
    let failures = 0, total = 0;
    function check(name, ok) {
        total++; if (!ok) failures++;
        const li = document.createElement('li');
        li.textContent = `${ok ? 'OK' : 'FAIL'} — ${name}`;
        results.append(li);
    }
    const player = document.querySelector('#movie_player');
    let video = player.querySelector('video');
    const initial = video.getAttribute('style');
    const button = () => document.querySelector('#yt-rotate-video-button');
    const fits = () => {
        const a = video.getBoundingClientRect(), b = player.getBoundingClientRect();
        return a.left >= b.left - 1 && a.right <= b.right + 1 && a.top >= b.top - 1 && a.bottom <= b.bottom + 1;
    };
    await wait();
    check('Button inserted before nested fullscreen control', button()?.nextElementSibling?.matches('.ytp-fullscreen-button'));
    check('YouTube dimensions preserved at 0°', video.getAttribute('style') === initial);
    check('Zero-height video wrapper reproduced', video.parentElement.clientHeight === 0);
    for (const angle of [90,180,270]) {
        button().click(); await wait();
        check(`Rotation ${angle}° keeps the video inside the player`, video.style.rotate === `${angle}deg` && fits());
    }
    button().click(); await wait();
    check('Returning to 0° restores native styles', !video.style.rotate && !video.style.scale && video.style.width === '800px' && video.style.height === '450px');
    button().click(); await wait();
    player.style.width = '640px'; player.style.height = '360px';
    video.style.width = '640px'; video.style.height = '360px';
    await wait();
    check('Resizing during rotation', fits() && video.style.rotate === '90deg');
    const oldButton = button(); oldButton.remove(); await wait();
    check('Rebuilt controls restore a single clockwise button', button() !== oldButton && document.querySelectorAll('#yt-rotate-video-button').length === 1);
    video.style.rotate = '0deg'; await wait();
    check('Rotation reapplied after video style changes', video.style.rotate === '90deg');
    document.dispatchEvent(new Event('yt-navigate-start')); await wait();
    check('Navigation resets rotation and preserves recent dimensions', !video.style.rotate && video.style.width === '640px');
    const replacement = video.cloneNode(); video.replaceWith(replacement); video = replacement;
    document.dispatchEvent(new Event('yt-navigate-finish')); await wait();
    button().click(); await wait();
    check('Replacement video detected and rotated', video.style.rotate === '90deg' && fits());
    let changes = 0;
    const observer = new MutationObserver(records => {changes += records.length;});
    observer.observe(video, {attributes:true}); await wait(); observer.disconnect();
    check('No mutation loop while idle', changes === 0);
    button().click(); button().click(); button().click(); await wait();
    document.querySelector('#summary').textContent = `${total - failures}/${total} tests passed — ${failures} failure(s).`;
})();
