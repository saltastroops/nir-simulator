# NIRWALS Simulator

## Developer notes

### Running the simulator in development

Start the Django server.

```shell
cd backend
python manage.py runserver
```

Update the React files served by Django. The browser should automatically reload the page (if applicable), thanks to [django-browser-reload](https://github.com/adamchainz/django-browser-reload).

```shell
cd frontend
npm run build
```

Note: Currently files in the `public` folder won't be served by Django.

