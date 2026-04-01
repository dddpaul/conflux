Задача: написать shell-функцию экспорта из Confluence в markdown-формат.

Предполагается, что установлены инструменты:
- curl
- html2markdown из https://github.com/JohannesKaufmann/html-to-markdown
- pass для хранения секретов доступа к Confluence

Что должно быть сделано:
- на вход функции подается полная ссылка в confluence, скопированная из браузера в формате https://host/pages/viewpage.action?pageId=123
- функция должна использовать REST API Confluence, передать туда pageId=123 и получить body
- логин и пароль для доступа к API нужно взять из утилиты pass, путь задается как константа в функции, например PASS_PATH=ORG/username, где логин = username, а пароль значение, взятое по пути ORG/username
- для конвертации в markdown используется html2markdown с параметрами "--plugin-table --exclude-selector=br"
- markdown должен быть сохранен в файл с именем "pageId - title.md", где title - заголовок статьи в confluence

Технические требования:
- только bash shell