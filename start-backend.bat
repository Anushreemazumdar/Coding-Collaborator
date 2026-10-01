@echo off
echo Starting Spring Boot Backend on http://localhost:8080...
cd /d "%~dp0backend"
if exist "..\tools\apache-maven-3.9.6\bin\mvn.cmd" (
    "..\tools\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run
) else (
    mvn spring-boot:run
)
pause
