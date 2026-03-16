@ECHO OFF
SETLOCAL

ECHO Doesn't package but only published to NPM an already packaged (but unpublished) version.

IF "%~1"=="" (
   SET /P Version=New Version ^(x.y.z^): 
) ELSE (
   SET Version=%~1
)

PUSHD "%~dp0dist\sircl-%Version%"

ECHO Make sure to have an up-to-date access token in %HOMEDRIVE%%HOMEPATH%\.npmrc
ECHO Make or update the token on: https://www.npmjs.com/settings/codetuner/tokens/
::CALL NPM login
CALL NPM publish

POPD

PAUSE