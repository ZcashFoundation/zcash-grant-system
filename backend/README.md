# Grant.io Backend

This is the backend component of [Grant.io](http://grant.io).

## Environment Setup

Run the following commands to bootstrap your environment.
Note: db setup is configured in .env when running locally. SQLLite is used by default in /tmp/

    # Get python in a virtual environment
    virtualenv -p python3 venv
    source venv/bin/activate

    # Install python requirements
    pip install -r requirements/dev.txt

    # Create environment variables file, edit as needed
    cp .env.example .env

If you want emails to work properly, you'll both need a SendGrid secret api key in `.env`,
and if you’re running Python 3.6+ on macOS, you'll need to
[fix your certificates](https://stackoverflow.com/a/42334357).

## Database Setup

Once you have installed your DBMS, run the following to create your app's
database tables and perform the initial migration

    flask db migrate
    flask db upgrade


## Running the App
Depending on what you need to run, there are several services that need to be started

If you just need the API, you can run

    flask run

## Deployment

To deploy

    export FLASK_ENV=production
    export FLASK_DEBUG=0
    export DATABASE_URL="<YOUR DATABASE URL>"
    flask run       # start the flask server

In your production environment, make sure the ``FLASK_DEBUG`` environment
variable is unset or is set to ``0``.


## Shell

To open the interactive shell, run

    flask shell

By default, you will have access to the flask ``app``.


## Running Tests

To run all tests, run

    flask test


## Migrations

Whenever a database migration needs to be made. Run the following commands

    flask db migrate

This will generate a new migration script. Then run

    flask db upgrade

To apply the migration.

For a full migration command reference, run ``flask db --help``.

## Commands
To create a proposal, run

    flask create_proposal "FUNDING_REQUIRED" 1 123 "My Awesome Proposal" "### Hi! I have a great proposal"

## External Services
To decode EIP-712 signed messages, a Grant.io deployed service was created `https://eip-712.herokuapp.com`.

To adjust this endpoint, simply export `AUTH_URL` with a new endpoint value:

    export AUTH_URL=http://new-endpoint.com

To learn more about this auth service, you can visit the repo [here](https://github.com/grant-project/eip-712-server).