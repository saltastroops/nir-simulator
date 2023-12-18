# NIRWALS Simulator

## Developer notes

### Running the simulator in development

Before running the simulator the first time, install the required packages.

```shell
cd backend
python -m pip install -r requirements.txt
```

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

### Environment variables

The frontend requires the following environment variables.

| Environment variable    | Description                                                                                                               |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------|
| `VITE_BACKEND_BASE_URL` | Base URL for the backend. Example values might be http://localhost:800 for development or an empty string for production. |

See [https://vitejs.dev/guide/env-and-mode.html#modes](https://vitejs.dev/guide/env-and-mode.html#modes) for how to set environment variables.

### Development tools

* Python: black, ruff
* React: ESLint, Prettier

### Adding a new predefined spectrum

First, define a component for setting the spectrum parameters.

* Add the component in `src/components/spectrum`. The component has to accept two properties, namely `spectrum`, an object with the spectrum parameters (see below), and `update`, a function which must be called with the new parameters object whenever a parameter value is changed.
* The `spectrum` property must be a `Spectrum`, i.e. it must have the properties `type` and `parameters`, as well as the methods `errors` and `typedParameters`.
* The component should not keep state; the state is handled elsewhere in the Simulator. It should only communicate changes via the `update` function.
* Labels should have proper ids, and a counter should be used for ensuring uniqueness. 

Then in `src/components/spectrum/SourceForm.tsx` add the new component to `makeSpectrumForm` and the corresponding (initial) spectrum parameters to `makeSpectrum`.

Add the new spectrum type to the `SpectrumType` definition in `src/types.ts`.

Finally, add the new spectrum type to the `spectrumTypes` array in the `SpectrumSelector` component (in `src/components/spectrum/SpectrumSelector.tsx`).
