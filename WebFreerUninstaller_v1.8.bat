@echo OFF & color 1F
mode con cols=105 lines=65
:: Created By MSasanMH@gmail.com :: 2015 Jan 31
title Web Freer Uninstaller (Will Delete LeftOver Files, Potential Threat Service and Everything of WebFreer.) - MSasanMH
call :IsAdmin

:IsAdmin
Reg.exe query "HKU\S-1-5-19\Environment"
If Not %ERRORLEVEL% EQU 0 (
 Cls & Echo You Must Have Administrator Rights To Continue ... 
 Pause
)

set _WinDir=%WinDir%
set _SysDir=%WinDir%\System32
if exist %WinDir%\SysWOW64\cmd.exe set _SysDir=%WinDir%\SysWOW64
if exist %WinDir%\SysWOW64\cmd.exe set _SysDirX64=%WinDir%\System32
set _ProgramFiles=%ProgramFiles%
if exist %WinDir%\SysWOW64\cmd.exe set _ProgramFiles=%ProgramFiles(x86)%
set _ServiceName=WebClientService

:: Removing WebFreer Registry Uninstall Values
echo Removing WebFreer Registry Uninstall Values...
Reg.exe delete "HKLM\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\WebFreer" /f
Reg.exe delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WebFreer" /f

sc query %_ServiceName% | find "does not exist" >nul
if %ERRORLEVEL% EQU 0 goto :SkipRemoveService
if %ERRORLEVEL% EQU 1 echo ADs Service Exist.

ping -n 2 localhost >nul

:RemoveService
:: Removing Web Freer Windows Threat Service
echo Removing Web Freer Windows ADs Service...
sc.exe stop "%_ServiceName%"
sc.exe config "%_ServiceName%" start= disabled
sc.exe delete "%_ServiceName%"
Reg.exe delete "HKLM\SYSTEM\CurrentControlSet\services\%_ServiceName%" /f

:SkipRemoveService
:: Unregistering .dll Files
echo Unregistering .dll Files...
echo In Windows Dir:
if exist %_WinDir%\curllib.dll RegSvr32.exe /u /s %_WinDir%\curllib.dll
if exist %_WinDir%\libcurl-4.dll RegSvr32.exe /u /s %_WinDir%\libcurl-4.dll
if exist %_WinDir%\libgcc_s_dw2-1.dll RegSvr32.exe /u /s %_WinDir%\libgcc_s_dw2-1.dll
if exist %_WinDir%\libsasl.dll RegSvr32.exe /u /s %_WinDir%\libsasl.dll
if exist %_WinDir%\openldap.dll RegSvr32.exe /u /s %_WinDir%\openldap.dll
echo In System Dir:
if exist %_SysDir%\curllib.dll RegSvr32.exe /u /s %_SysDir%\curllib.dll
if exist %_SysDir%\libcurl-4.dll RegSvr32.exe /u /s %_SysDir%\libcurl-4.dll
if exist %_SysDir%\libgcc_s_dw2-1.dll RegSvr32.exe /u /s %_SysDir%\libgcc_s_dw2-1.dll
if exist %_SysDir%\libsasl.dll RegSvr32.exe /u /s %_SysDir%\libsasl.dll
if exist %_SysDir%\openldap.dll RegSvr32.exe /u /s %_SysDir%\openldap.dll
echo In System Dir, Only on 64bit OS:
if exist %WinDir%\SysWOW64\cmd.exe (
if exist %_SysDirX64%\curllib.dll RegSvr32.exe /u /s %_SysDirX64%\curllib.dll
if exist %_SysDirX64%\libcurl-4.dll RegSvr32.exe /u /s %_SysDirX64%\libcurl-4.dll
if exist %_SysDirX64%\libgcc_s_dw2-1.dll RegSvr32.exe /u /s %_SysDirX64%\libgcc_s_dw2-1.dll
if exist %_SysDirX64%\libsasl.dll RegSvr32.exe /u /s %_SysDirX64%\libsasl.dll
if exist %_SysDirX64%\openldap.dll RegSvr32.exe /u /s %_SysDirX64%\openldap.dll
)

:: Removing Profile Data Directory
echo Removing Profile Data Directory...
if exist "%LocalAppData%\Web Freer" rd /s /q "%LocalAppData%\Web Freer"
if exist %LocalAppData%\WebFreer rd /s /q %LocalAppData%\WebFreer

:: Removing LeftOver Files
echo Removing LeftOver Files...
echo In Windows Dir:
if exist %_WinDir%\1060 del %_WinDir%\1060
if exist %_WinDir%\curllib.dll del %_WinDir%\curllib.dll
if exist %_WinDir%\libcurl-4.dll del %_WinDir%\libcurl-4.dll
if exist %_WinDir%\libgcc_s_dw2-1.dll del %_WinDir%\libgcc_s_dw2-1.dll
if exist %_WinDir%\libsasl.dll del %_WinDir%\libsasl.dll
if exist %_WinDir%\openldap.dll del %_WinDir%\openldap.dll
if exist %_WinDir%\WebClientService.exe del %_WinDir%\WebClientService.exe
if exist %_WinDir%\webproxy.exe del %_WinDir%\webproxy.exe
echo In System Dir:
if exist %_SysDir%\1060 del %_SysDir%\1060
if exist %_SysDir%\curllib.dll del %_SysDir%\curllib.dll
if exist %_SysDir%\libcurl-4.dll del %_SysDir%\libcurl-4.dll
if exist %_SysDir%\libgcc_s_dw2-1.dll del %_SysDir%\libgcc_s_dw2-1.dll
if exist %_SysDir%\libsasl.dll del %_SysDir%\libsasl.dll
if exist %_SysDir%\openldap.dll del %_SysDir%\openldap.dll
if exist %_SysDir%\WebClientService.exe del %_SysDir%\WebClientService.exe
if exist %_SysDir%\webproxy.exe del %_SysDir%\webproxy.exe
echo In System Dir, Only on 64bit OS:
if exist %WinDir%\SysWOW64\cmd.exe (
if exist %_SysDirX64%\1060 del %_SysDirX64%\1060
if exist %_SysDirX64%\curllib.dll del %_SysDirX64%\curllib.dll
if exist %_SysDirX64%\libcurl-4.dll del %_SysDirX64%\libcurl-4.dll
if exist %_SysDirX64%\libgcc_s_dw2-1.dll del %_SysDirX64%\libgcc_s_dw2-1.dll
if exist %_SysDirX64%\libsasl.dll del %_SysDirX64%\libsasl.dll
if exist %_SysDirX64%\openldap.dll del %_SysDirX64%\openldap.dll
if exist %_SysDirX64%\WebClientService.exe del %_SysDirX64%\WebClientService.exe
if exist %_SysDirX64%\webproxy.exe del %_SysDirX64%\webproxy.exe
)

:: Removing Shortcuts and Other things
echo Removing Shortcuts and Other things...
if exist "%AppData%\Microsoft\Internet Explorer\Quick Launch\Web Freer.lnk" del "%AppData%\Microsoft\Internet Explorer\Quick Launch\Web Freer.lnk"
if exist "%AppData%\Microsoft\Windows\Recent\CustomDestinations\f3ed58dfde1354f8.customDestinations-ms" rd /s /q "%AppData%\Microsoft\Windows\Recent\CustomDestinations\f3ed58dfde1354f8.customDestinations-ms"
if exist "%HomeDrive%\Users\Public\Desktop\Web Freer.lnk" del "%HomeDrive%\Users\Public\Desktop\Web Freer.lnk"
if exist "%ProgramData%\Microsoft\Windows\Start Menu\Programs\Web Freer" rd /s /q "%ProgramData%\Microsoft\Windows\Start Menu\Programs\Web Freer"
if exist "%ProgramData%\_iocache_.dat" del "%ProgramData%\_iocache_.dat"
if exist "%ProgramData%\DeviceGroupingRules.dat" del "%ProgramData%\DeviceGroupingRules.dat"

:: Removing "WebFreer" Folder in Program Files
echo Removing "Web Freer" Folder in Program Files...
if exist "%_ProgramFiles%\WebFreer" rd /s /q "%_ProgramFiles%\WebFreer"

:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:: Checking
CLS
echo ±±±±±±±±±±±±±±±±±±±±±±±±± Start of Result *** WebFreer Virus/Trojan Remover (v1.8) ±±±±±±±±±±±
echo.
echo :::::::::::::::::::: Checking Web Freer Windows ADs/Threat Service :::::::::::::::::
sc query %_ServiceName% | find "does not exist" >nul
if %ERRORLEVEL% EQU 0 goto :Step1
if %ERRORLEVEL% EQU 1 goto :Step2
:Step1
echo SUCCESSFULL: ADs/Threat Service (%_ServiceName%) Removed.
goto :SkipStep2
:Step2
sc.exe delete "%_ServiceName%" | find "The specified service has been marked for deletion" >nul
if %ERRORLEVEL% EQU 0 echo SUCCESSFULL: ADs/Threat Service Will Remove After System Restart.
if %ERRORLEVEL% EQU 1 echo ERROR: (IMPORTANT) ADs/Threat Service Does Not Remove. Run This Script Again as Administrator.
:SkipStep2
echo.
echo.
echo :::::::::::::::::::: Checking Profile Data Directory :::::::::::::::::::::::::::::::
if exist "%LocalAppData%\Web Freer" echo ERROR: Oops, Profile Data Directory Still Exist. Remove It Manually ("%LocalAppData%\Web Freer").
if not exist "%LocalAppData%\Web Freer" echo SUCCESSFULL: Profile Data Directory Removed.
if exist %LocalAppData%\WebFreer echo ERROR: Oops, Profile Data Directory Still Exist. Remove It Manually ("%LocalAppData%\WebFreer").
if not exist %LocalAppData%\WebFreer echo SUCCESSFULL: Profile Data Directory Removed.
echo.
echo.
echo :::::::::::::::::::: Checking LeftOver Files :::::::::::::::::::::::::::::::::::::::
echo  In Windows Dir:
if not exist %_WinDir%\1060 echo SUCCESSFULL: "1060" Deleted.
if exist %_WinDir%\1060 echo ERROR: "1060" Still Exist, Delete It Manually from "%_WinDir%"
if not exist %_WinDir%\curllib.dll echo SUCCESSFULL: "curllib.dll" Unregistered and Deleted.
if exist %_WinDir%\curllib.dll echo ERROR: "curllib.dll" Still Exist, Delete It Manually from "%_WinDir%"
if not exist %_WinDir%\libcurl-4.dll echo SUCCESSFULL: "libcurl-4.dll" Unregistered and Deleted.
if exist %_WinDir%\libcurl-4.dll echo ERROR: "libcurl-4.dll" Still Exist, Delete It Manually from "%_WinDir%"
if not exist %_WinDir%\libgcc_s_dw2-1.dll echo SUCCESSFULL: "libgcc_s_dw2-1.dll" Unregistered and Deleted.
if exist %_WinDir%\libgcc_s_dw2-1.dll echo ERROR: "libgcc_s_dw2-1.dll" Still Exist, Delete It Manually from "%_WinDir%"
if not exist %_WinDir%\libsasl.dll echo SUCCESSFULL: "libsasl.dll" Unregistered and Deleted.
if exist %_WinDir%\libsasl.dll echo ERROR: "libsasl.dll" Still Exist, Delete It Manually from "%_WinDir%"
if not exist %_WinDir%\openldap.dll echo SUCCESSFULL: "openldap.dll" Unregistered and Deleted.
if exist %_WinDir%\openldap.dll echo ERROR: "openldap.dll" Still Exist, Delete It Manually from "%_WinDir%"
if not exist %_WinDir%\WebClientService.exe echo SUCCESSFULL: "WebClientService.exe" Deleted.
if exist %_WinDir%\WebClientService.exe echo ERROR: "WebClientService.exe" Still Exist, Delete It Manually from "%_WinDir%"
if not exist %_WinDir%\webproxy.exe echo SUCCESSFULL: "webproxy.exe" Deleted.
if exist %_WinDir%\webproxy.exe echo ERROR: "webproxy.exe" Still Exist, Delete It Manually from "%_WinDir%"
echo.
echo  In System Dir:
if not exist %_SysDir%\1060 echo SUCCESSFULL: "1060" Deleted.
if exist %_SysDir%\1060 echo ERROR: "1060" Still Exist, Delete It Manually from "%_SysDir%"
if not exist %_SysDir%\curllib.dll echo SUCCESSFULL: "curllib.dll" Unregistered and Deleted.
if exist %_SysDir%\curllib.dll echo ERROR: "curllib.dll" Still Exist, Delete It Manually from "%_SysDir%"
if not exist %_SysDir%\libcurl-4.dll echo SUCCESSFULL: "libcurl-4.dll" Unregistered and Deleted.
if exist %_SysDir%\libcurl-4.dll echo ERROR: "libcurl-4.dll" Still Exist, Delete It Manually from "%_SysDir%"
if not exist %_SysDir%\libgcc_s_dw2-1.dll echo SUCCESSFULL: "libgcc_s_dw2-1.dll" Unregistered and Deleted.
if exist %_SysDir%\libgcc_s_dw2-1.dll echo ERROR: "libgcc_s_dw2-1.dll" Still Exist, Delete It Manually from "%_SysDir%"
if not exist %_SysDir%\libsasl.dll echo SUCCESSFULL: "libsasl.dll" Unregistered and Deleted.
if exist %_SysDir%\libsasl.dll echo ERROR: "libsasl.dll" Still Exist, Delete It Manually from "%_SysDir%"
if not exist %_SysDir%\openldap.dll echo SUCCESSFULL: "openldap.dll" Unregistered and Deleted.
if exist %_SysDir%\openldap.dll echo ERROR: "openldap.dll" Still Exist, Delete It Manually from "%_SysDir%"
if not exist %_SysDir%\WebClientService.exe echo SUCCESSFULL: "WebClientService.exe" Deleted.
if exist %_SysDir%\WebClientService.exe echo ERROR: "WebClientService.exe" Still Exist, Delete It Manually from "%_SysDir%"
if not exist %_SysDir%\webproxy.exe echo SUCCESSFULL: "webproxy.exe" Deleted.
if exist %_SysDir%\webproxy.exe echo ERROR: "webproxy.exe" Still Exist, Delete It Manually from "%_SysDir%"
echo.
echo  In System Dir, Only on 64bit OS:
if exist %WinDir%\SysWOW64\cmd.exe (
if not exist %_SysDirX64%\1060 echo SUCCESSFULL: "1060" Deleted.
if exist %_SysDirX64%\1060 echo ERROR: "1060" Still Exist, Delete It Manually from "%_SysDirX64%"
if not exist %_SysDirX64%\curllib.dll echo SUCCESSFULL: "curllib.dll" Unregistered and Deleted.
if exist %_SysDirX64%\curllib.dll echo ERROR: "curllib.dll" Still Exist, Delete It Manually from "%_SysDirX64%"
if not exist %_SysDirX64%\libcurl-4.dll echo SUCCESSFULL: "libcurl-4.dll" Unregistered and Deleted.
if exist %_SysDirX64%\libcurl-4.dll echo ERROR: "libcurl-4.dll" Still Exist, Delete It Manually from "%_SysDirX64%"
if not exist %_SysDirX64%\libgcc_s_dw2-1.dll echo SUCCESSFULL: "libgcc_s_dw2-1.dll" Unregistered and Deleted.
if exist %_SysDirX64%\libgcc_s_dw2-1.dll echo ERROR: "libgcc_s_dw2-1.dll" Still Exist, Delete It Manually from "%_SysDirX64%"
if not exist %_SysDirX64%\libsasl.dll echo SUCCESSFULL: "libsasl.dll" Unregistered and Deleted.
if exist %_SysDirX64%\libsasl.dll echo ERROR: "libsasl.dll" Still Exist, Delete It Manually from "%_SysDirX64%"
if not exist %_SysDirX64%\openldap.dll echo SUCCESSFULL: "openldap.dll" Unregistered and Deleted.
if exist %_SysDirX64%\openldap.dll echo ERROR: "openldap.dll" Still Exist, Delete It Manually from "%_SysDirX64%"
if not exist %_SysDirX64%\WebClientService.exe echo SUCCESSFULL: "WebClientService.exe" Deleted.
if exist %_SysDirX64%\WebClientService.exe echo ERROR: "WebClientService.exe" Still Exist, Delete It Manually from "%_SysDirX64%"
if not exist %_SysDirX64%\webproxy.exe echo SUCCESSFULL: "webproxy.exe" Deleted.
if exist %_SysDirX64%\webproxy.exe echo ERROR: "webproxy.exe" Still Exist, Delete It Manually from "%_SysDirX64%"
)
echo.
echo.
echo :::::::::::::::::::: Checking Shortcuts and Other things :::::::::::::::::::::::::::
if not exist "%AppData%\Microsoft\Internet Explorer\Quick Launch\Web Freer.lnk" echo SUCCESSFULL: "Web Freer.lnk" Deleted From Quick Launch.
if exist "%AppData%\Microsoft\Internet Explorer\Quick Launch\Web Freer.lnk" echo ERROR: "Web Freer.lnk" Still Exist in Quick Launch, Delete It Manually from "%AppData%\Microsoft\Internet Explorer\Quick Launch"
if not exist "%AppData%\Microsoft\Windows\Recent\CustomDestinations\f3ed58dfde1354f8.customDestinations-ms" echo SUCCESSFULL: "f3ed58dfde1354f8.customDestinations-ms" Deleted.
if exist "%AppData%\Microsoft\Windows\Recent\CustomDestinations\f3ed58dfde1354f8.customDestinations-ms" echo ERROR: "f3ed58dfde1354f8.customDestinations-ms" Still Exist, Delete It Manually from "%AppData%\Microsoft\Windows\Recent\CustomDestinations"
if not exist "%HomeDrive%\Users\Public\Desktop\Web Freer.lnk" echo SUCCESSFULL: "Web Freer.lnk" Deleted From Desktop.
if exist "%HomeDrive%\Users\Public\Desktop\Web Freer.lnk" echo ERROR: "Web Freer.lnk" Still Exist, Delete It Manually from "%HomeDrive%\Users\Public\Desktop"
if not exist "%ProgramData%\Microsoft\Windows\Start Menu\Programs\Web Freer" echo SUCCESSFULL: "Web Freer" Folder Deleted From Start Menu.
if exist "%ProgramData%\Microsoft\Windows\Start Menu\Programs\Web Freer" echo ERROR: "Web Freer" Folder Still Exist, Delete It Manually from "%ProgramData%\Microsoft\Windows\Start Menu\Programs"
if not exist "%ProgramData%\_iocache_.dat" echo SUCCESSFULL: "_iocache_.dat" Deleted.
if exist "%ProgramData%\_iocache_.dat" echo ERROR: "_iocache_.dat" Still Exist, Delete It Manually from "%ProgramData%"
if not exist "%ProgramData%\DeviceGroupingRules.dat" echo SUCCESSFULL: "DeviceGroupingRules.dat" Deleted.
if exist "%ProgramData%\DeviceGroupingRules.dat" echo ERROR: "DeviceGroupingRules.dat" Still Exist, Delete It Manually from "%ProgramData%"
echo.
echo.
echo :::::::::::::::::::: Checking "Web Freer" Folder in Program Files ::::::::::::::::::
if not exist "%_ProgramFiles%\WebFreer" echo SUCCESSFULL: "WebFreer" Folder Deleted.
if exist "%_ProgramFiles%\WebFreer" echo "WebFreer" Folder Still Exist, Delete It Manually from "%_ProgramFiles%"
echo.
echo.
echo :::::::::::::::::::: Checking WebFreer Registry Uninstall Values :::::::::::::::::::
echo  Checking 64bit Value:
Reg.exe query "HKLM\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\WebFreer" >nul 2>&1
if %ERRORLEVEL% EQU 1 echo SUCCESSFULL: Registry Uninstall Value Removed.
if %ERRORLEVEL% NEQ 1 echo ERROR: Registry Uninstall Value Not Removed. Run This Script Again as Administrator.
echo.
echo  Checking 32bit Value:
Reg.exe query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WebFreer" >nul 2>&1
if %ERRORLEVEL% EQU 1 echo SUCCESSFULL: Registry Uninstall Value Removed.
if %ERRORLEVEL% NEQ 1 echo ERROR: Registry Uninstall Value Not Removed. Run This Script Again as Administrator.

::ping -n 2 localhost >nul

echo.

echo ±±±±±±±±±±±±±±±±±±±±±±±±± End of Result *** Press Any Key To Exit ±±±±±±±±±±±±±±±±±±±±±±±±±±±± & pause >nul
exit
