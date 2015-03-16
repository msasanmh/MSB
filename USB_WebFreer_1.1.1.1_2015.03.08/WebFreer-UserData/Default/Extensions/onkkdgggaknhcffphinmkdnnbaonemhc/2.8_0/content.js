// MSasanMH
window.addEventListener('load', function (e) {
    // create a button and add it to the page
    var btn = document.createElement('button');
    btn.innerHTML = 'Restart child extension';
    btn.addEventListener('click', function (e) {
        // on button click send message to the background script
        chrome.extension.sendMessage({restart: true}, function (res) {
            console.log(res);
        });
    }, false);

    var body = document.querySelector('body');
    body.appendChild(btn);
}, false);