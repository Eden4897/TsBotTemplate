@echo off
call echo !package-lock.json >> .\.gitignore
call echo !package.json >> .\.gitignore
call git add .
call git rm --cache template-cleanup.bat readme.md
call git commit -am "Template Cleanup"
call git push
del readme.md
del template-cleanup.bat
