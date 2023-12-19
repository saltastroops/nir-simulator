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

## Deployment

### Setting up the server

#### Setting up Docker

We assume the deployment server meets the following requirements:

1. It is running under the latest version of Ubuntu.
2. There is a user `nirwals`, and that user has sudo rights.
3. The server has the ip address simulator.salt.ac.za.

First, install an ssh key on the server, so that you can connect without having to provide a password. This can be done with the `ssh-copy-id` command, which must be run on your own machine:

```shell
ssh-copy-id nirwals@simulator.salt.ac.za
```

Log in to the server and [install Docker](https://docs.docker.com/engine/install/ubuntu/). Once it is installed, check that the inmstallation was successful.

```shell
sudo docker run hello-world
```

Add the nirwals user to the docker group, so that it can execute Docker without sudo.

```shell
sudo usermod -aG docker $USER
```

Check that this had the desired effect:

```shell
docker run hello-world
```

#### Cloning the repository

If the nirwals user has no ssh key yet, create one with the following command (substituting `nirwals@example.com` with the correct email address):

```shell
ssh-keygen -t ed25519 -C "nirwals@example.com"
```

[Add the key to the relevant GitHub account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account) for the simulator's repository.

Go to the home directory and clone the repository's main branch.

```shell
cd ~
git clone --branch main --single-branch --recurse-submodules git@github.com:saltastroops/nir-simulator.git
```
