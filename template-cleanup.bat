@echo off
call echo template-cleanup.bat > .\.git\info\exclude
call echo readme.md >> .\.git\info\exclude
call echo !package-lock.json >> .\.gitignore
call echo !package.json >> .\.gitignore
call git add .
call git commit -am "Template Cleanup"
call git push
del readme.md
del template-cleanup.bat