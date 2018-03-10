#-*- coding: utf-8 -*-
from genvisu import app
from genvisu.tools import json_response
from genvisu.config_private import google_id, google_secret

from requests_oauthlib import OAuth2Session
import requests
from flask import Flask, request, redirect, session, url_for
from urlparse import parse_qs


authorization_base_url = "https://accounts.google.com/o/oauth2/v2/auth"
token_url = "https://www.googleapis.com/oauth2/v4/token"
scope = [
 "https://www.googleapis.com/auth/userinfo.profile",
 "https://www.googleapis.com/auth/userinfo.email"
]



@app.route("/auth/google")
def google_auth():
    redirect_uri = url_for('google_callback',_external=True)
    google = OAuth2Session(google_id, scope=scope, redirect_uri=redirect_uri)
    # Redirect user to Google for authorization
    authorization_url, state = google.authorization_url(authorization_base_url, access_type="offline", prompt="select_account")
    return redirect(authorization_url)

@app.route("/google/callback")
def google_callback():
    # Get the authorization verifier code from the callback url
    redirect_uri = url_for('google_callback',_external=True)
    google = OAuth2Session(google_id, scope=scope, redirect_uri=redirect_uri)

    google.fetch_token(token_url, client_secret=google_secret,
                    authorization_response=request.url)

    # Fetch a protected resource, i.e. user profile
    infos = google.get('https://www.googleapis.com/oauth2/v1/userinfo').json()

    session['userid'] = 'google:{id}'.format(id=infos['id'])
    session['username'] = '{name}'.format(name=infos['name'])
    return redirect(session['next'])
