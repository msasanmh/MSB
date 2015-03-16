mode con cols=21 lines=2
@echo OFF & color 1F
title CLI WebFreer Loader Portable - MSasanMH
rem MSasanMH - 04 September 2014
:ChromeLoader
CLS
echo  WebFreer Loading...
start WebFreer-bin\webfreer.exe --user-data-dir=../WebFreer-UserData --easy-off-store-extension-install --enable-easy-off-store-extension-install --allow-outdated-plugins --disable-breakpad --disable-logging --no-events --no-default-browser-check --allow-legacy-extension-manifests https://www.google.com/webhp?hl=en --user-agent="Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/24.0.2062.68 Safari/537.36"
REM https://www.google.com/webhp?hl=en
exit /B
exit