# ZF Grants Backend

This is the backend component of [grants.zfnd.org](http://grants.zfnd.org).

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

## Generate Admin Authentication

To generate a new admin password, run

    flask flask gen-admin-auth

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

In your production environment, make sure the `FLASK_DEBUG` environment
variable is unset or is set to `0`.

## Shell

To open the interactive shell, run

    flask shell

By default, you will have access to the flask `app`.

## Running Tests

To run all tests, run

    flask test

To run only select test, Flask allows you to match against the test filename with ``-t` like so:

    flask test -t proposal

## Migrations

Whenever a database migration needs to be made. Run the following commands

    flask db migrate

This will generate a new migration script. Then run

    flask db upgrade

To apply the migration.

For a full migration command reference, run `flask db --help`.

## Commands

To create a proposal

    flask create-proposal "FUNDING_REQUIRED" 1 123 "My Awesome Proposal" "### Hi! I have a great proposal"

To seed many proposal

    flask create-proposals <number_of_proposals:int>

To set a user to admin

    flask set-admin <email|id>


## S3 Storage Setup

1. create bucket, keep the `bucket name` and `region` handy
1. unblock public access `Amazon S3 > BUCKET_NAME > Permissions > Public access settings`
1. set the CORS configuration, replace HOST_NAME with desired domain, or `*` to allow all  
   Amazon S3 > BUCKET_NAME > Permissions > CORS configuration

   ```
   <?xml version="1.0" encoding="UTF-8"?>
   <CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
        <CORSRule>
            <AllowedOrigin>HOST_NAME</AllowedOrigin>
            <AllowedMethod>GET</AllowedMethod>
            <AllowedMethod>POST</AllowedMethod>
            <AllowedMethod>PUT</AllowedMethod>
            <AllowedHeader>*</AllowedHeader>
        </CORSRule>
   </CORSConfiguration>
   ```

1. create IAM Policy, replace `BUCKET_NAME` with correct name.

   ```
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "s3:PutObject",
                    "s3:PutObjectAcl",
                    "s3:GetObject",
                    "s3:DeleteObject"
                ],
                "Resource": [
                    "arn:aws:s3:::BUCKET_NAME/*"
                ]
            }
        ]
    }
   ```

1. create IAM user with programatic access (Access key) and assign that user the policy created above
1. copy the user's `Access key ID`, `Secret access key`, `bucket name` & `bucket region` to private `.env`, see `.env.example`

## Social Verification (oauth)

These instructions are for `development`, for `production` simply replace all hostnames/ips/ports with the proper production hostname.

1. Create GitHub oauth app https://github.com/settings/developers

   1. select tab **OAuth Apps** > click **New OAuth App** button
   1. set **Homepage URL** to `http://localhost:3000`
   1. set **Authorization callback URL** to `http://localhost:3000/callback/github`
   1. save **Client ID** and **Client Secret** to `.env` `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` respectively.

1. Create Twitter oauth app https://developer.twitter.com/en/apply/user

   1. click **Create an App**
   1. set **Website URL** to a valid URL, such as `http://grants.zfnd.org`
   1. check the **Enable Sign in with Twitter** option
   1. set **Callback URLs** to `http://127.0.0.1:3000/callback/twitter`
   1. fill out other required fields
   1. after create, select **Keys and tokens** tab
   1. save **Consumer API key** and **Consumer API secret key** to `.env` `TWITTER_CLIENT_ID` & `TWITTER_CLIENT_SECRET` respectively.