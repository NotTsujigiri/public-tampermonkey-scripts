# YouTube Rotate Video 90°

A small userscript that adds two rotation buttons to the desktop YouTube player, just before the fullscreen button.

- Rotate left or right in 90-degree steps.
- Keep the rotated video inside the player.
- Restore the original orientation when navigating to another video.
- Recreate the buttons when YouTube rebuilds its controls.
- No external dependencies, analytics, network requests or persistent storage in the script.

## Install

[Install version 1.3.1](https://raw.githubusercontent.com/NotTsujigiri/public-tampermonkey-scripts/v1.3.1/youtube-rotate/youtube-rotate.user.js) with your userscript manager enabled, then confirm installation in the manager. If the source code opens instead, use the manual method below.

Use a userscript manager in your browser. Create a new script, replace its contents with [youtube-rotate.user.js](youtube-rotate.user.js), save, and reload YouTube. Keep only one copy enabled.

This is a userscript, not a standalone Firefox extension. Four clicks in the same direction restore the initial orientation.

## Compatibility and limitations

Real-world use has been tested on Firefox only. The two-button version was confirmed working by the user. Chrome, Edge and Safari have not been validated. Local browser checks cover rotation geometry, resizing, navigation events and rebuilt controls. YouTube changes its player markup frequently; individual layouts may need adjustments.

Mobile YouTube, Shorts, embedded players, actual fullscreen transitions, cinema mode and advertisement transitions have not been comprehensively tested. Picture-in-picture is not supported by this script. Local tests use a video element without media and do not replace end-to-end playback tests.

## Tests

With Node.js installed, run from the youtube-rotate directory:

```sh
node --check youtube-rotate.user.js
node serve.cjs
```

Open <http://127.0.0.1:8766/> to run the browser fixture. Stop the server with Ctrl+C. It listens only on the local machine. The fixture reproduces nested fullscreen controls and a zero-height video wrapper, and enables Trusted Types enforcement where supported.

For bug reports, include the browser and userscript-manager versions, the player mode, and what happened. Remove personal information from screenshots and logs.

## License

[MIT](../LICENSE). Independent project, not affiliated with YouTube or Google. Developed with ChatGPT (OpenAI) assistance and manual user feedback.
