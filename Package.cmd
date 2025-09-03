@ECHO OFF
SETLOCAL

IF "%~1"=="" (
   ECHO Existing versions:
   DIR dist /a:d /o:n /b
   SET /P Version=New Version ^(x.y.z^): 
) ELSE (
   SET Version=%~1
)

:: Copy to version-specific and latest DIST folder:
MKDIR "%~dp0dist\sircl-%Version%"
COPY "%~dp0src\SampleWebApplication\wwwroot\lib\sircl-src-new\*.*" "%~dp0dist\sircl-%version%\"
DEL "%~dp0dist\sircl-latest\*.*" /q
COPY "%~dp0src\SampleWebApplication\wwwroot\lib\sircl-src-new\*.*" "%~dp0dist\sircl-latest\"

:: Create "package.json" file in version-specific folder, and copy to latest folder:
ECHO {^
 "name": "sircl",^
 "version": "%version%",^
 "description": "Serverside Rendering Coding Library",^
 "author": "Codetuner",^
 "main": "sircl-bundled.min.js",^
 "repository": {^
 "type": "git",^
 "url": "https://github.com/codetuner/Sircl2"^
 },^
 "license": "MIT"^
}>"%~dp0dist\sircl-%version%\package.json"
COPY "%~dp0dist\sircl-%version%\package.json" "%~dp0dist\sircl-latest\package.json"

:: Create a ZIP file of version-specific folder:
PUSHD "%~dp0dist\sircl-%version%"
7za a ..\sircl-%version%.zip *
POPD

:: Ready to publish on NPM ?
PAUSE
ECHO.
ECHO Publish on NPM ?
PAUSE

PUSHD "%~dp0dist\sircl-%Version%"

CALL NPM login
CALL NPM publish

POPD

PAUSE