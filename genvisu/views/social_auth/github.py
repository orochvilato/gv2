#-*- coding: utf-8 -*-
from genvisu import app
from genvisu.tools import json_response
from genvisu.config_private import github_id, github_secret

from requests_oauthlib import OAuth2Session
import requests
from flask import Flask, request, redirect, session, url_for
from urlparse import parse_qs
from flask.json import jsonify

client_id = github_id
client_secret = github_secret
authorization_base_url = 'https://github.com/login/oauth/authorize'
token_url = 'https://github.com/login/oauth/access_token'

@app.route("/auth/github")
def github_auth():
    """Step 1: User Authorization.

    Redirect the user/resource owner to the OAuth provider (i.e. Github)
    using an URL with a few key OAuth parameters.
    """
    github = OAuth2Session(client_id)
    authorization_url, state = github.authorization_url(authorization_base_url)

    # State is used to prevent CSRF, keep this for later.
    session['oauth_state'] = state
    return redirect(authorization_url)


# Step 2: User authorization, this happens on the provider.

@app.route("/github/callback", methods=["GET"])
def github_callback():
    """ Step 3: Retrieving an access token.

    The user has been redirected back from the provider to your registered
    callback URL. With this redirection comes an authorization code included
    in the redirect URL. We will use that to obtain an access token.
    """

    github = OAuth2Session(client_id, state=session['oauth_state'])
    token = github.fetch_token(token_url, client_secret=client_secret,
                               authorization_response=request.url)

    # At this point you can fetch protected resources but lets save
    # the token and show how this is done from a persisted token
    # in /profile.
    session['oauth_token'] = token
    github = OAuth2Session(client_id, token=session['oauth_token'])
    infos = github.get('https://api.github.com/user').json()
    
    session['userid'] = '{id}'.format(id=infos['id'])
    session['username'] = '{username}'.format(username=infos['name'] or infos['login'])
    return redirect(session['next'])
